#!/usr/bin/env node
// render: build + lint + render por formato + QA, con versionado de archivos.
//   node scripts/render.mjs <proyecto> [--formats landscape,portrait] [--quality draft|standard|high]
//                           [--alpha] [--version 3] [--no-qa] [--strict]
// Salida: <proyecto>/renders/<slug>_<formato>_v###.mp4 (o .mov con --alpha: ProRes 4444 con transparencia)
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, readJson, resolveProject, runHf } from "./lib/common.mjs";

const args = process.argv.slice(2);
const val = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : null);
const projectDir = resolveProject(args.find((a, i) => !a.startsWith("--") && !["--formats", "--quality", "--version"].includes(args[i - 1])));
const plan = readJson(join(projectDir, "scenes.json"));
const quality = val("--quality") || "standard";
const alpha = args.includes("--alpha");
const formats = (val("--formats") || (plan.formats || [plan.master || "landscape"]).join(",")).split(",").map((s) => s.trim());

// 1) build (siempre: garantiza que marca y raíces están al día)
const b = spawnSync(process.execPath, [join(ROOT, "scripts", "build-roots.mjs"), projectDir], { stdio: "inherit" });
if (b.status !== 0) process.exit(b.status || 1);

// 2) versión
const rdir = join(projectDir, "renders");
mkdirSync(rdir, { recursive: true });
const slug = plan.slug || "video";
const existing = readdirSync(rdir).map((f) => Number((f.match(/_v(\d+)\./) || [])[1] || 0));
const version = Number(val("--version")) || Math.max(0, ...existing) + 1;
const tag = `v${String(version).padStart(3, "0")}`;

const outputs = [];
const master = plan.master || "landscape";
for (const fmt of formats) {
  const dir = fmt === master ? join(projectDir, "comp") : join(projectDir, "formats", fmt);
  if (!existsSync(join(dir, "index.html"))) {
    console.error(`✗ Formato "${fmt}" no está en scenes.json → formats. Agregalo y volvé a correr.`);
    process.exit(1);
  }
  // 3) gate: lint sin errores
  const lint = runHf(["lint", dir], { capture: true });
  const lintOut = (lint.stdout || "") + (lint.stderr || "");
  if (/(\d+) error\(s\)/.test(lintOut) && !/\b0 error\(s\)/.test(lintOut)) {
    console.error(lintOut);
    console.error(`✗ Lint con errores en ${fmt}: corregí antes de renderizar.`);
    process.exit(1);
  }
  const ext = alpha ? "mov" : "mp4";
  const out = join(rdir, `${slug}_${fmt}_${tag}.${ext}`);
  console.log(`\n▶ Render ${fmt} (${quality}${alpha ? ", alpha ProRes 4444" : ""}) → ${out.replace(ROOT + "/", "")}`);
  const rArgs = ["render", dir, "-o", out, "--quality", quality === "standard" ? "looks" : quality];
  if (alpha) rArgs.push("--format", "mov");
  if (args.includes("--strict")) rArgs.push("--strict");
  const r = runHf(rArgs);
  if (r.status !== 0) {
    console.error(`✗ Falló el render de ${fmt}`);
    process.exit(r.status || 1);
  }
  outputs.push(out);
}

// 4) changelog de versión (trazabilidad para revisión)
const log = join(projectDir, "review", "CHANGELOG.md");
mkdirSync(join(projectDir, "review"), { recursive: true });
const line = `- ${new Date().toISOString().slice(0, 16).replace("T", " ")} · ${tag} · ${formats.join(", ")} · calidad ${quality}${alpha ? " · alpha" : ""} · ${plan.scenes.length} escenas\n`;
writeFileSync(log, (existsSync(log) ? "" : "# Changelog de renders\n\nAnotá debajo de cada versión qué cambió y por qué (feedback de qué ronda).\n\n") + line, { flag: "a" });

// 5) QA automático
if (!args.includes("--no-qa") && !alpha) {
  let failed = false;
  for (const o of outputs) {
    const q = spawnSync(process.execPath, [join(ROOT, "scripts", "qa.mjs"), o], { stdio: "inherit" });
    failed ||= q.status !== 0;
  }
  if (failed) console.warn("\n⚠ El QA marcó FAIL: revisá el reporte antes de mandar a revisión.");
}
console.log(`\n✓ ${tag} listo: ${outputs.map((o) => o.replace(projectDir + "/", "")).join(", ")}`);
