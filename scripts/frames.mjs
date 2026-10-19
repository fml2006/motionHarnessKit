#!/usr/bin/env node
// frames: captura un frame clave por escena (el "styleframe" real, antes de la salida) para revisión.
//   node scripts/frames.mjs <proyecto> [--format landscape|portrait|square|feed] [--at mid|end]
// Salida: <proyecto>/review/frames-<formato>/ (PNG por escena + contact-sheet.jpg)
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";
import { readJson, resolveProject, runHf, loadBrand } from "./lib/common.mjs";
import { timeline } from "./lib/plan.mjs";

const args = process.argv.slice(2);
const projectDir = resolveProject(args.find((a, i) => !a.startsWith("--") && !["--format", "--at"].includes(args[i - 1])));
const fmtId = args.includes("--format") ? args[args.indexOf("--format") + 1] : null;
const mode = args.includes("--at") ? args[args.indexOf("--at") + 1] : "end";
const brand = loadBrand();
const plan = readJson(join(projectDir, "scenes.json"));
const master = plan.master || "landscape";
const fid = fmtId || master;
const dir = fid === master ? join(projectDir, "comp") : join(projectDir, "formats", fid);
if (!existsSync(join(dir, "index.html"))) {
  console.error(`✗ No existe ${dir}/index.html. Corré: npm run build:roots -- ${projectDir}`);
  process.exit(1);
}
const exitMs = brand.motion?.durations?.exit ?? 360;
// mismos tiempos que la raíz generada (transiciones con solapamiento incluidas)
const times = [];
const names = [];
for (const { scene: s, start, duration: d } of timeline(plan, fid, brand).items) {
  const at = mode === "mid" ? start + d / 2 : start + Math.max(d * 0.5, d - exitMs / 1000 - 0.25);
  times.push(Math.round(at * 100) / 100);
  names.push(s.id);
}
const out = join(projectDir, "review", `frames-${fid}`);
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const r = runHf(["snapshot", dir, "--at", times.join(","), "--no-end", "-o", out], { capture: true });
if (r.status !== 0) {
  console.error(r.stdout, r.stderr);
  process.exit(r.status || 1);
}
// renombrar frame-NN-at-X.png → NN_<sceneId>.png
const files = readdirSync(out).filter((f) => f.startsWith("frame-")).sort();
files.forEach((f, i) => {
  if (names[i]) renameSync(join(out, f), join(out, `${String(i + 1).padStart(2, "0")}_${names[i]}.png`));
});
console.log(`✓ ${files.length} frames clave (${fid}) → ${out}`);
console.log(`  contact sheet: ${join(out, "contact-sheet.jpg")}`);
