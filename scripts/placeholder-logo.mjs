#!/usr/bin/env node
// Genera un logo placeholder (isotipo geométrico + wordmark contorneado) desde brand.config.json.
// Útil hasta tener los SVG oficiales. Uso: node scripts/placeholder-logo.mjs [--config <json>] [--out <dir>] [--keep-mark]
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as fontkit from "fontkit";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const argOf = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d);
const cfg = JSON.parse(readFileSync(join(ROOT, argOf("--config", "brand/brand.config.json")), "utf8"));
const OUTDIR = join(ROOT, argOf("--out", "brand/logo"));
const KEEP_MARK = argv.includes("--keep-mark");
const C = cfg.colors;
const slug = cfg.typography.display.package.split("/").pop();
const w = Math.max(...cfg.typography.display.weights);
const font = fontkit.openSync(join(ROOT, "node_modules", cfg.typography.display.package, "files", `${slug}-latin-${w}-normal.woff2`));

function outline(text, size) {
  const run = font.layout(text);
  const scale = size / font.unitsPerEm;
  let x = 0;
  const paths = [];
  for (let i = 0; i < run.glyphs.length; i++) {
    const g = run.glyphs[i];
    const p = g.path.scale(scale, -scale).translate(x, 0);
    paths.push(p.toSVG());
    x += run.positions[i].xAdvance * scale;
  }
  return { d: paths.join(" "), width: x, ascent: font.ascent * scale, capHeight: (font.capHeight || font.ascent * 0.7) * scale };
}

// isotipo: cuadrado redondeado + "corchete" de código + punto de acento (ajustá a tu marca)
const mark = (s = 120) => `<g data-part="mark">
  <rect x="0" y="0" width="${s}" height="${s}" rx="${s * 0.24}" fill="${C.primary}"/>
  <path d="M${s * 0.42} ${s * 0.3} L${s * 0.26} ${s * 0.5} L${s * 0.42} ${s * 0.7}" fill="none" stroke="${C.onPrimary || C.background}" stroke-width="${s * 0.09}" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="${s * 0.66}" cy="${s * 0.62}" r="${s * 0.09}" fill="${C.accent}"/>
</g>`;

const size = 96;
const word = outline(cfg.meta.name, size);
const markSize = 120;
const gap = 36;
const W = Math.ceil(markSize + gap + word.width + 4);
const H = markSize;
const baseline = (H + word.capHeight) / 2;
const logo = (fill) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${cfg.meta.name}">
${mark(markSize)}
<g data-part="wordmark" transform="translate(${markSize + gap} ${baseline})"><path d="${word.d}" fill="${fill}"/></g>
</svg>
`;
mkdirSync(OUTDIR, { recursive: true });
if (KEEP_MARK) {
  // reutiliza el isotipo existente (mark.svg) y le agrega el wordmark contorneado
  const existing = readFileSync(join(OUTDIR, "mark.svg"), "utf8");
  const inner = existing.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  const vb = (existing.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/) || [0, markSize, markSize]).slice(1).map(Number);
  const sc = markSize / vb[1];
  const lg = (fill) => logo(fill).replace(mark(markSize), `<g transform="scale(${sc})">${inner}</g>`);
  writeFileSync(join(OUTDIR, "logo.svg"), lg(C.text));
  writeFileSync(join(OUTDIR, "logo-dark.svg"), lg(C.background));
} else {
  writeFileSync(join(OUTDIR, "mark.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${markSize} ${markSize}" width="${markSize}" height="${markSize}" role="img" aria-label="${cfg.meta.name}">\n${mark(markSize)}\n</svg>\n`);
  writeFileSync(join(OUTDIR, "logo.svg"), logo(C.text));
  writeFileSync(join(OUTDIR, "logo-dark.svg"), logo(C.background));
}
console.log(`✓ Logo placeholder generado en ${OUTDIR.replace(ROOT + "/", "")}/ (${W}×${H}). Reemplazalo por el SVG oficial.`);
