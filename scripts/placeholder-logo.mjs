#!/usr/bin/env node
// Genera un logo placeholder (isotipo geométrico + wordmark contorneado con la fuente display de la marca).
// Útil hasta tener los SVG oficiales: el sting y el cierre animan <g data-part="mark"> y <g data-part="wordmark">.
//   node scripts/placeholder-logo.mjs --brand <marca> [--mark bracket|pulse|ring] [--upper] [--keep-mark]
//   node scripts/placeholder-logo.mjs --config <json> --out <dir> [...]   (ad hoc)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as fontkit from "fontkit";
import { defaultBrand, configPath, brandDir } from "./lib/brands.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const argOf = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d);
const slug = argOf("--brand", argv.includes("--config") ? null : defaultBrand());
const cfg = JSON.parse(readFileSync(slug ? configPath(slug) : join(ROOT, argOf("--config")), "utf8"));
const OUTDIR = slug ? join(brandDir(slug), "logo") : join(ROOT, argOf("--out"));
const KEEP_MARK = argv.includes("--keep-mark");
const STYLE = argOf("--mark", cfg.logo?.placeholderMark || "bracket");
const UPPER = argv.includes("--upper") || cfg.look?.headlineCase === "uppercase";
const C = cfg.colors;
const fslug = cfg.typography.display.package.split("/").pop();
const w = Math.max(...cfg.typography.display.weights);
const font = fontkit.openSync(join(ROOT, "node_modules", cfg.typography.display.package, "files", `${fslug}-latin-${w}-normal.woff2`));

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

const on = C.onPrimary || C.background;
// isotipos: cambian la silueta de la marca (no solo el color)
const MARKS = {
  // cuadrado redondeado + corchete de código + punto de acento (técnico)
  bracket: (s) => `<rect x="0" y="0" width="${s}" height="${s}" rx="${s * 0.24}" fill="${C.primary}"/>
  <path d="M${s * 0.42} ${s * 0.3} L${s * 0.26} ${s * 0.5} L${s * 0.42} ${s * 0.7}" fill="none" stroke="${on}" stroke-width="${s * 0.09}" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="${s * 0.66}" cy="${s * 0.62}" r="${s * 0.09}" fill="${C.accent}"/>`,
  // círculo + línea de pulso (energético)
  pulse: (s) => `<circle cx="${s / 2}" cy="${s / 2}" r="${s / 2}" fill="${C.primary}"/>
  <path d="M${s * 0.14} ${s * 0.54} H${s * 0.34} L${s * 0.43} ${s * 0.3} L${s * 0.56} ${s * 0.74} L${s * 0.65} ${s * 0.46} H${s * 0.86}" fill="none" stroke="${on}" stroke-width="${s * 0.085}" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="${s * 0.86}" cy="${s * 0.46}" r="${s * 0.075}" fill="${C.accent}"/>`,
  // anillo con punto (sobrio)
  ring: (s) => `<circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.42}" fill="none" stroke="${C.primary}" stroke-width="${s * 0.12}"/>
  <circle cx="${s / 2}" cy="${s / 2}" r="${s * 0.13}" fill="${C.accent}"/>`,
};
if (!MARKS[STYLE]) {
  console.error(`✗ --mark "${STYLE}" no existe (${Object.keys(MARKS).join(" | ")})`);
  process.exit(1);
}
const mark = (s = 120) => `<g data-part="mark">
  ${MARKS[STYLE](s)}
</g>`;

const size = 96;
const word = outline(UPPER ? cfg.meta.name.toUpperCase() : cfg.meta.name, size);
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
console.log(`✓ Logo placeholder (${STYLE}${UPPER ? ", mayúsculas" : ""}) en ${OUTDIR.replace(ROOT + "/", "")}/ (${W}×${H}). Reemplazalo por el SVG oficial.`);
