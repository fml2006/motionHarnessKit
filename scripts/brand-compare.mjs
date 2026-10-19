#!/usr/bin/env node
// brand-compare: la MISMA pieza con varias marcas, lado a lado, para que el director de arte vea si cada marca
// tiene estilo propio (o si quedaron "hermanas").
//   node scripts/brand-compare.mjs <proyecto> [--brands a,b,c] [--format landscape|portrait|feed|square] [--keep]
// Arma copias temporales del proyecto (una por marca) en <proyecto>/review/compare/_work/, las construye con los
// bloques de cada marca (incluye sus bloques firma: un logo-sting propio reemplaza al del engine), saca un frame
// clave por escena y compone una hoja por formato: <proyecto>/review/compare/compare-<formato>.png (+ .jpg).
// No toca el proyecto original. Escenas "custom" se copian tal cual; una escena con un bloque firma exclusivo de
// otra marca queda como "no disponible" en las marcas que no lo tienen.
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, readdirSync, copyFileSync, renameSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, readJson, resolveProject, runHf, esc } from "./lib/common.mjs";
import { listBrands, loadBrandDist, resolveBlock, distDir, brandBlocks } from "./lib/brands.mjs";

const args = process.argv.slice(2);
const VALUE_FLAGS = ["--brands", "--format"];
const projectDir = resolveProject(args.find((a, i) => !a.startsWith("--") && !VALUE_FLAGS.includes(args[i - 1])));
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const plan = readJson(join(projectDir, "scenes.json"));
const all = listBrands();
const brands = opt("--brands", all.join(",")).split(",").map((s) => s.trim()).filter(Boolean);
const unknown = brands.filter((b) => !all.includes(b));
if (unknown.length) {
  console.error(`✗ Marca(s) desconocida(s): ${unknown.join(", ")}. Marcas: ${all.join(", ")}`);
  process.exit(1);
}
const notApplied = brands.filter((b) => !loadBrandDist(b));
if (notApplied.length) {
  console.error(`✗ Sin aplicar: ${notApplied.join(", ")}. Corré: npm run brand -- ${notApplied.join(" ")}`);
  process.exit(1);
}
const fmt = opt("--format", plan.master || "landscape");
const keep = args.includes("--keep");
const out = join(projectDir, "review", "compare");
const work = join(out, "_work");
rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });
const node = (script, a) => spawnSync(process.execPath, [join(ROOT, "scripts", script), ...a], { encoding: "utf8" });

const rows = [];
for (const b of brands) {
  const brand = loadBrandDist(b);
  if (!brand.formats.some((f) => f.id === fmt)) {
    console.error(`✗ La marca ${b} no define el formato "${fmt}"`);
    process.exit(1);
  }
  const dir = join(work, b);
  mkdirSync(join(dir, "comp", "compositions"), { recursive: true });
  const missing = [];
  const scenes = [];
  for (const s of plan.scenes || []) {
    if (s.block === "custom") {
      const src = join(projectDir, "comp", "compositions", `${s.id}.html`);
      if (existsSync(src)) copyFileSync(src, join(dir, "comp", "compositions", `${s.id}.html`));
      scenes.push(s);
    } else if (resolveBlock(b, s.block).error) missing.push(s.id);
    else scenes.push(s);
  }
  const p = { ...plan, brand: b, formats: [fmt], master: fmt, audio: {}, scenes };
  delete p.brandLock;
  delete p.captions;
  writeFileSync(join(dir, "scenes.json"), JSON.stringify(p, null, 2));
  const br = node("build-roots.mjs", [dir]);
  if (br.status !== 0) {
    console.error(`✗ build de ${b} falló:\n${br.stdout}${br.stderr}`);
    process.exit(1);
  }
  const fr = node("frames.mjs", [dir, "--format", fmt]);
  if (fr.status !== 0) {
    console.error(`✗ frames de ${b} fallaron:\n${fr.stdout}${fr.stderr}`);
    process.exit(1);
  }
  const fdir = join(dir, "review", `frames-${fmt}`);
  const files = readdirSync(fdir).filter((f) => /^\d\d_.+\.png$/.test(f)).sort();
  const byId = Object.fromEntries(files.map((f) => [f.slice(3, -4), join(fdir, f)]));
  const own = brandBlocks(b);
  rows.push({ b, brand, missing, cells: (plan.scenes || []).map((s) => ({ id: s.id, block: s.block, file: byId[s.id] || null, signature: own.includes(s.block) })) });
  console.log(`  · ${b}: ${files.length} frames${missing.length ? ` · sin bloque para ${missing.join(", ")}` : ""}`);
}

// hoja de comparación: una franja por marca (nombre + look a la izquierda, frames a la derecha)
const dims = { landscape: [320, 180, 7], portrait: [150, 267, 13], feed: [210, 263, 9], square: [220, 220, 9] }[fmt] || [320, 180, 7];
const [tw, th, maxCols] = dims;
const n = (plan.scenes || []).length;
const cols = Math.min(n, maxCols);
const gap = 10;
const labelW = 300;
const pad = 24;
const bandRows = Math.ceil(n / cols);
const bandH = bandRows * (th + 22 + gap) + 30;
const W = pad * 2 + labelW + cols * (tw + gap);
const H = pad * 2 + 56 + rows.length * (bandH + gap);
const sheet = join(work, "_sheet");
mkdirSync(join(sheet, "img"), { recursive: true });
mkdirSync(join(sheet, "vendor"), { recursive: true });
copyFileSync(join(distDir(brands[0]), "vendor", "gsap.min.js"), join(sheet, "vendor", "gsap.min.js"));
const bands = rows
  .map((r, ri) => {
    const cells = r.cells
      .map((c, ci) => {
        let img = "";
        if (c.file) {
          const name = `${r.b}_${String(ci + 1).padStart(2, "0")}.png`;
          copyFileSync(c.file, join(sheet, "img", name));
          img = `<img src="img/${name}" alt="">`;
        } else img = `<div class="na">no disponible<br>(bloque firma de otra marca)</div>`;
        return `<figure${c.signature ? ' class="sig"' : ""}>${img}<figcaption>${esc(c.id)}${c.signature ? " · firma" : ""}</figcaption></figure>`;
      })
      .join("");
    return `<section class="band"><div class="label"><div class="name">${esc(r.brand.meta.name)}</div><div class="slug">${esc(r.b)} · v${esc(r.brand.meta.version)}</div><div class="look">${esc(r.brand.look?.summary || "")}</div></div><div class="cells">${cells}</div></section>`;
  })
  .join("");
writeFileSync(
  join(sheet, "index.html"),
  `<!doctype html><html lang="es"><head><meta charset="UTF-8"><title>compare</title>
<script src="vendor/gsap.min.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{background:#101114;overflow:hidden}
#root{position:relative;width:${W}px;height:${H}px;padding:${pad}px;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#e9eaee}
h1{font-size:22px;font-weight:600;height:56px}
h1 span{color:#9aa0ab;font-weight:400;font-size:16px;margin-left:12px}
.band{display:flex;gap:0;height:${bandH}px;margin-bottom:${gap}px;border-top:1px solid #2a2d33;padding-top:14px}
.label{flex:0 0 ${labelW}px;padding-right:20px}
.name{font-size:22px;font-weight:700}
.slug{font:13px ui-monospace,monospace;color:#9aa0ab;margin:4px 0 10px}
.look{font-size:14px;line-height:1.35;color:#c8ccd4}
.cells{display:grid;grid-template-columns:repeat(${cols},${tw}px);gap:${gap}px;align-content:start}
figure img,.na{display:block;width:${tw}px;height:${th}px;border-radius:4px;object-fit:cover;background:#1b1d22}
.na{display:flex;align-items:center;justify-content:center;text-align:center;font-size:12px;color:#777}
figure.sig img{outline:3px solid #f5c542;outline-offset:-3px}
figcaption{font:12px ui-monospace,monospace;color:#9aa0ab;height:22px;line-height:22px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
figure.sig figcaption{color:#f5c542}
</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="1" data-width="${W}" data-height="${H}">
<h1>${esc(plan.title || plan.slug)} · misma pieza, ${rows.length} marcas<span>${esc(fmt)} · frames clave por escena · borde amarillo = bloque firma de la marca</span></h1>
${bands}
</div>
<script>window.__timelines = window.__timelines || {}; window.__timelines["main"] = gsap.timeline({ paused: true });</script>
</body></html>
`
);
const snapOut = join(work, "_snap");
const r = runHf(["snapshot", sheet, "--at", "0.5", "--no-end", "--describe", "false", "-o", snapOut], { capture: true });
const shot = existsSync(snapOut) ? readdirSync(snapOut).find((f) => f.endsWith(".png") && f.startsWith("frame-")) : null;
if (r.status !== 0 || !shot) {
  console.error(`✗ No pude componer la hoja:\n${r.stdout || ""}${r.stderr || ""}`);
  process.exit(1);
}
mkdirSync(out, { recursive: true });
const png = join(out, `compare-${fmt}.png`);
renameSync(join(snapOut, shot), png);
const jpg = png.replace(/\.png$/, ".jpg");
spawnSync("ffmpeg", ["-v", "error", "-y", "-i", png, "-q:v", "3", jpg]);
if (!keep) rmSync(work, { recursive: true, force: true });
console.log(`✓ Comparación (${fmt}, ${rows.length} marcas): ${png.replace(ROOT + "/", "")}${existsSync(jpg) ? " (+ .jpg)" : ""}`);
