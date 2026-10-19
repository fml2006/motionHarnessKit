#!/usr/bin/env node
// render: build + gates (lint y check) + render por formato + QA, con versionado de archivos.
//   node scripts/render.mjs <proyecto> [--formats landscape,portrait] [--quality draft|standard|high]
//                           [--alpha] [--master] [--rebrand] [--docker] [--allow-check-warnings]
//                           [--version 3] [--no-qa]
//
// Calidad:
//   draft     animatic / revisión rápida. Gate de contenido en modo aviso (placeholders y claims = WARN).
//   standard  revisión (CRF 16). Igual que draft en gates.
//   high      versión aprobada. Build --strict (placeholders, cifras sin claim verificada → FAIL) y
//             `hyperframes check --strict` (warnings también frenan, salvo --allow-check-warnings, que queda registrado).
// Salidas:
//   (default) <proyecto>/renders/<slug>_<formato>_v###.mp4 → QA en modo draft.
//   --alpha   <slug>_<formato>_v###.mov ProRes 4444 con transparencia (overlays para el editor) → QA "overlay".
//   --master  <slug>_<formato>_v###_master.mov ProRes 4444 (intermedio sin compresión con pérdida para
//             `npm run deliver`; implica high). Su QA se hace sobre las salidas de deliver.
// Gates (fallan cerrados): build con exit ≠ 0, lint con exit ≠ 0 o JSON ilegible o errores, check con exit ≠ 0,
// QA con FAIL → el script sale con código 1 y NO declara la versión lista.
// --docker: render determinista en Docker (misma imagen en todas las máquinas; requiere Docker corriendo).
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, readJson, resolveProject, runHf, browserInfo, ffmpegVersion } from "./lib/common.mjs";

const args = process.argv.slice(2);
const VALUE_FLAGS = ["--formats", "--quality", "--version"];
const val = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : null);
const projectDir = resolveProject(args.find((a, i) => !a.startsWith("--") && !VALUE_FLAGS.includes(args[i - 1])));
const alpha = args.includes("--alpha");
const master = args.includes("--master");
const quality = master ? "high" : val("--quality") || "standard";
if (!["draft", "standard", "high"].includes(quality)) {
  console.error(`✗ --quality "${quality}" no existe (draft | standard | high)`);
  process.exit(1);
}
if (alpha && master) {
  console.error("✗ --alpha y --master son excluyentes (overlay transparente vs intermedio de entrega).");
  process.exit(1);
}
const strict = quality === "high";
const allowCheckWarnings = args.includes("--allow-check-warnings");
const docker = args.includes("--docker");
const fail = (msg) => {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
};

// 1) build (siempre: marca y raíces al día). En high/master, gate de contenido estricto.
const buildArgs = [join(ROOT, "scripts", "build-roots.mjs"), projectDir];
if (strict) buildArgs.push("--strict");
if (args.includes("--rebrand")) buildArgs.push("--rebrand");
const b = spawnSync(process.execPath, buildArgs, { stdio: "inherit" });
if (b.status !== 0) fail(`El build${strict ? " estricto" : ""} frenó el render (ver arriba). Nada se renderizó.`);

// el plan se lee DESPUÉS del build (puede haber escrito brandLock)
const plan = readJson(join(projectDir, "scenes.json"));
const formats = (val("--formats") || (plan.formats || [plan.master || "landscape"]).join(",")).split(",").map((s) => s.trim()).filter(Boolean);

// 2) versión
const rdir = join(projectDir, "renders");
mkdirSync(rdir, { recursive: true });
const slug = plan.slug || "video";
const existing = readdirSync(rdir).map((f) => Number((f.match(/_v(\d+)[._]/) || [])[1] || 0));
const version = Number(val("--version")) || Math.max(0, ...existing) + 1;
const tag = `v${String(version).padStart(3, "0")}`;

function summarize(findings, max = 12) {
  return (findings || []).slice(0, max).map((f) => `    - [${f.severity || f.level || "?"}] ${f.code || f.rule || f.id || ""} ${f.message || f.text || JSON.stringify(f).slice(0, 160)}${f.file ? ` (${f.file}${f.line ? ":" + f.line : ""})` : ""}`).join("\n");
}
function parseJson(out) {
  const txt = String(out || "");
  const i = txt.indexOf("{");
  if (i < 0) return null;
  try {
    return JSON.parse(txt.slice(i));
  } catch {
    return null;
  }
}

// 3) gates por formato: lint (estático, rápido) y check (runtime + layout + contraste en el navegador)
const gateNotes = [];
const mainDir = (fmt) => (fmt === (plan.master || "landscape") ? join(projectDir, "comp") : join(projectDir, "formats", fmt));
for (const fmt of formats) {
  const dir = mainDir(fmt);
  if (!existsSync(join(dir, "index.html"))) fail(`Formato "${fmt}" no está en scenes.json → formats. Agregalo y volvé a correr.`);

  const lint = runHf(["lint", dir, "--json"], { capture: true });
  const L = parseJson(lint.stdout);
  if (lint.status !== 0 || !L || L.ok !== true || (L.errorCount ?? 1) > 0) {
    console.error(L ? summarize(L.findings) : (lint.stdout || "") + (lint.stderr || ""));
    fail(`Lint de ${fmt}: ${L ? `${L.errorCount} error(es)` : `salida ilegible o exit ${lint.status}`}. Corregí antes de renderizar.`);
  }
  if (L.warningCount > 0) {
    console.warn(`  ⚠ Lint ${fmt}: ${L.warningCount} warning(s)\n${summarize(L.findings)}`);
    if (strict && !allowCheckWarnings) fail(`Lint de ${fmt} con warnings en calidad high. Corregilos o usá --allow-check-warnings (queda registrado).`);
    gateNotes.push(`lint ${fmt}: ${L.warningCount} warning(s)`);
  }

  console.log(`▶ check ${fmt}${strict ? " --strict" : ""} (runtime, layout, contraste WCAG)`);
  const checkArgs = ["check", dir, "--json"];
  if (strict && !allowCheckWarnings) checkArgs.push("--strict");
  const chk = runHf(checkArgs, { capture: true });
  const C = parseJson(chk.stdout);
  const sections = C ? ["lint", "runtime", "layout", "motion", "contrast"].map((k) => [k, C[k]]).filter(([, v]) => v) : [];
  const errors = sections.reduce((n, [, v]) => n + (v.errorCount || 0), 0);
  const warnings = sections.reduce((n, [, v]) => n + (v.warningCount || 0), 0);
  const findings = sections.flatMap(([k, v]) => (v.findings || []).map((f) => ({ ...f, code: `${k}:${f.code || f.rule || ""}` })));
  if (chk.status !== 0 || !C || C.ok !== true || errors > 0) {
    console.error(C ? summarize(findings, 20) : (chk.stdout || "").slice(-2000) + (chk.stderr || "").slice(-2000));
    fail(`check de ${fmt}: ${C ? `${errors} error(es), ${warnings} warning(s)` : `salida ilegible o exit ${chk.status}`}${strict ? " (modo estricto)" : ""}.`);
  }
  if (warnings > 0) {
    console.warn(`  ⚠ check ${fmt}: ${warnings} warning(s)\n${summarize(findings)}`);
    gateNotes.push(`check ${fmt}: ${warnings} warning(s)${allowCheckWarnings ? " (aceptadas con --allow-check-warnings)" : ""}`);
  }
  const contrast = C.contrast?.enabled ? ` · contraste ${C.contrast.passed}/${C.contrast.checked}` : "";
  console.log(`  ✓ check ${fmt}: 0 errores${warnings ? `, ${warnings} warning(s)` : ""}${contrast}`);
}

// 4) render
const outputs = [];
for (const fmt of formats) {
  const dir = mainDir(fmt);
  const ext = alpha || master ? "mov" : "mp4";
  const out = join(rdir, `${slug}_${fmt}_${tag}${master ? "_master" : ""}.${ext}`);
  const kind = alpha ? ", alpha ProRes 4444" : master ? ", intermedio ProRes 4444 para deliver" : "";
  console.log(`\n▶ Render ${fmt} (${quality}${kind}${docker ? ", docker" : ""}) → ${out.replace(ROOT + "/", "")}`);
  const rArgs = ["render", dir, "-o", out, "--strict"];
  if (alpha || master) rArgs.push("--format", "mov");
  else rArgs.push("--quality", quality === "standard" ? "looks" : quality);
  if (docker) rArgs.push("--docker");
  const r = runHf(rArgs);
  if (r.status !== 0 || !existsSync(out)) fail(`Falló el render de ${fmt} (exit ${r.status}).`);
  outputs.push({ fmt, file: out });
}

// 5) QA automático (los intermedios --master se controlan en deliver, sobre ARCHIVE y DELIVERY)
let qaVerdict = "omitido";
if (!args.includes("--no-qa") && !master) {
  let failed = false;
  for (const o of outputs) {
    const qArgs = [join(ROOT, "scripts", "qa.mjs"), o.file, "--draft"];
    if (alpha) qArgs.push("--platform", "overlay");
    const q = spawnSync(process.execPath, qArgs, { stdio: "inherit" });
    failed ||= q.status !== 0;
  }
  qaVerdict = failed ? "FAIL" : "ok";
}

// 6) changelog de versión (trazabilidad: también se registran los renders que fallaron QA)
const log = join(projectDir, "review", "CHANGELOG.md");
mkdirSync(join(projectDir, "review"), { recursive: true });
const br = docker ? "docker" : browserInfo().source === "override" ? "navegador override (MHK_BROWSER_PATH)" : "chrome fijado por hyperframes";
const lock = plan.brandLock ? ` · marca ${plan.brandLock.name} v${plan.brandLock.version} #${plan.brandLock.hash}` : "";
const line = `- ${new Date().toISOString().slice(0, 16).replace("T", " ")} · ${tag} · ${formats.join(", ")} · calidad ${quality}${alpha ? " · alpha" : ""}${master ? " · master" : ""}${strict ? " · strict" : ""} · ${plan.scenes.length} escenas${lock} · ${br} · ffmpeg ${ffmpegVersion()} · QA ${qaVerdict}${gateNotes.length ? ` · ${gateNotes.join("; ")}` : ""}\n`;
writeFileSync(log, (existsSync(log) ? "" : "# Changelog de renders\n\nAnotá debajo de cada versión qué cambió y por qué (feedback de qué ronda).\n\n") + line, { flag: "a" });

// manifiesto para deliver y para herramientas
writeFileSync(join(rdir, ".last-render.json"), JSON.stringify({ tag, version, quality, alpha, master, strict, docker, outputs: outputs.map((o) => ({ format: o.fmt, file: o.file })), qa: qaVerdict }, null, 2) + "\n");

if (qaVerdict === "FAIL") fail(`${tag} renderizado pero el QA marcó FAIL: no se puede mandar a revisión. Reportes en ${join(projectDir, "qa").replace(ROOT + "/", "")}/`);
console.log(`\n✓ ${tag} listo: ${outputs.map((o) => o.file.replace(projectDir + "/", "")).join(", ")}${qaVerdict === "omitido" && !master ? " (QA omitido con --no-qa)" : ""}`);
