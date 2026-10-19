#!/usr/bin/env node
// brandkit-check: revisa que brandkit/<slug>/ esté listo para /marca (campos obligatorios, hex, fuentes, logos, referencias).
//   node scripts/brandkit-check.mjs <slug|ruta> [--json]
// ✗ = bloquea la importación · ⚠ = se puede importar, pero queda PENDIENTE o lo decide el director de arte.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { ROOT } from "./lib/common.mjs";

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const target = args.find((a) => !a.startsWith("--"));
if (!target) {
  console.error("Uso: npm run brandkit:check -- <slug>   (revisa brandkit/<slug>/BRANDKIT.md y sus archivos)");
  process.exit(1);
}
const dir = existsSync(resolve(target)) && statSync(resolve(target)).isDirectory() ? resolve(target) : join(ROOT, "brandkit", target);
const file = join(dir, "BRANDKIT.md");
if (!existsSync(file)) {
  console.error(`✗ No existe ${file}. Creá el brandkit con: npm run brandkit:new -- <slug>`);
  process.exit(1);
}

const md = readFileSync(file, "utf8");
const lines = md.split(/\r?\n/);
const out = { dir, errors: [], warnings: [], ok: [], fields: {}, colors: {}, fonts: {}, references: [], logo: {} };
const err = (m) => out.errors.push(m);
const warn = (m) => out.warnings.push(m);
const ok = (m) => out.ok.push(m);
const EMPTY = (v) => !v || /^_+$/.test(v) || /^\[.*\]$/.test(v);
const UNKNOWN = (v) => /^(no s[eé]|que decida el da|pendiente)$/i.test((v || "").trim());

// ---------- campos "- Etiqueta[ *]: valor" (+ línea "_Opciones: …_" opcional debajo) ----------
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^- (?!\[[ xX]\])(.+?)(\s\*)?:(?:\s+|$)(.*)$/);
  if (!m) continue;
  const label = m[1].trim();
  const required = !!m[2];
  const value = m[3].trim();
  const optLine = (lines[i + 1] || "").match(/^\s+_Opciones(?:, una o varias)?:\s*(.+?)_\s*$/);
  const options = optLine ? optLine[1].split("·").map((o) => o.trim().split(/[\s(]/)[0].toLowerCase()).filter(Boolean) : null;
  out.fields[label] = value;
  if (required && EMPTY(value)) err(`Falta «${label}»`);
  else if (required && UNKNOWN(value)) warn(`«${label}»: "${value}" → Claude lo pregunta o queda PENDIENTE`);
  if (options && value && !EMPTY(value) && !UNKNOWN(value)) {
    const v = value.toLowerCase();
    const multi = /una o varias/.test(lines[i + 1]);
    const parts = multi ? v.split(/[,·;]| y /).map((s) => s.trim()).filter(Boolean) : [v];
    const bad = parts.filter((p) => !options.some((o) => p.startsWith(o) || p.includes(o)) && !/^otro/.test(p));
    if (bad.length) warn(`«${label}»: "${value}" no es una de las opciones (${options.join(", ")}) → lo interpreta Claude y lo confirma el DA`);
  }
}

const slugField = out.fields["Slug"];
if (slugField && !/^[a-z0-9][a-z0-9-]{1,40}$/.test(slugField)) err(`Slug "${slugField}" inválido: minúsculas, números y guiones`);
if (slugField && basename(dir) !== slugField && !basename(dir).startsWith("_")) warn(`El slug "${slugField}" no coincide con la carpeta brandkit/${basename(dir)}/`);

// ---------- tablas ----------
function table(headerStart) {
  const i = lines.findIndex((l) => l.trim().toLowerCase().startsWith(headerStart.toLowerCase()));
  if (i < 0) return [];
  const rows = [];
  for (let j = i + 2; j < lines.length && lines[j].trim().startsWith("|"); j++)
    rows.push(lines[j].split("|").slice(1, -1).map((c) => c.trim()));
  return rows;
}
const HEX = /^#[0-9a-fA-F]{6}$/;
for (const [role, hex, use] of table("| Rol | HEX")) {
  const required = /\*\s*$/.test(role);
  const name = role.replace(/\s*\*\s*$/, "");
  if (!hex) { if (required) err(`Color «${name}» sin HEX`); continue; }
  if (!HEX.test(hex)) { err(`Color «${name}»: "${hex}" no es un HEX de 6 dígitos (#RRGGBB)`); continue; }
  out.colors[name] = hex.toUpperCase();
  void use;
}
// contraste temprano (el contraste completo, con todos los pares del look, lo valida npm run brand)
const lum = (h) => {
  const c = [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const C = out.colors;
const pairs = [["Texto principal", "Fondo", 4.5], ["Texto secundario", "Fondo", 4.5], ["Texto principal", "Superficie (tarjetas, paneles)", 4.5], ["Acento", "Fondo", 3], ["Primario", "Fondo", 3], ["Texto sobre primario", "Primario", 4.5]];
for (const [a, b, min] of pairs) {
  if (!C[a] || !C[b]) continue;
  const r = ratio(C[a], C[b]);
  if (r < min) warn(`Contraste ${a} / ${b.split(" (")[0]}: ${r.toFixed(2)}:1 (mínimo ${min}:1) → /marca propone un ajuste para aprobar`);
  else ok(`Contraste ${a} / ${b.split(" (")[0]}: ${r.toFixed(2)}:1`);
}
const extraHex = (label) => (out.fields[label] || "").match(/#[0-9a-fA-F]{6}\b/g) || [];
const badHex = (out.fields["Colores para gráficos de datos, en orden (hasta 6 hex)"] || "").match(/#[0-9a-fA-F]{3,8}\b/g)?.filter((h) => !HEX.test(h)) || [];
if (badHex.length) err(`Colores de datos con HEX inválido: ${badHex.join(", ")}`);
if (extraHex("Gradiente de marca, si existe (2 hex)").length === 1) warn("El gradiente de marca necesita 2 HEX");

// ---------- tipografía ----------
const fontFiles = existsSync(join(dir, "fonts")) ? readdirSync(join(dir, "fonts")).filter((f) => /\.(woff2?|ttf|otf)$/i.test(f)) : [];
const licenseFiles = existsSync(join(dir, "fonts")) ? readdirSync(join(dir, "fonts")).filter((f) => /licen|eula|ofl/i.test(f)) : [];
for (const [role, family, origin, weights, italic, license] of table("| Rol | Familia")) {
  const required = /\*\s*$/.test(role);
  const name = role.replace(/\s*\*\s*$/, "");
  if (!family) { if (required) err(`Tipografía «${name}» sin familia`); continue; }
  out.fonts[name] = { family, origin, weights, italic, license };
  if (/propio|propia|archivo/i.test(origin || "")) {
    const slugFam = family.toLowerCase().replace(/\s+/g, "");
    if (!fontFiles.some((f) => f.toLowerCase().replace(/[\s_-]+/g, "").includes(slugFam))) err(`«${family}» es archivo propio pero no hay .woff2/.ttf/.otf con ese nombre en fonts/`);
    if (!licenseFiles.length) warn(`«${family}»: falta el archivo de licencia en fonts/`);
  } else if (!origin) warn(`«${family}»: falta el origen (Google Fonts / archivo propio)`);
  if (/^no$/i.test(license || "")) err(`«${family}»: la licencia NO cubre video → elegí otra fuente o comprá la licencia`);
  else if (!license || UNKNOWN(license)) warn(`«${family}»: licencia para video sin confirmar → la confirma Legal antes de producir`);
}

// ---------- logos ----------
for (const f of ["logo.svg", "logo-dark.svg", "mark.svg"]) {
  const p = join(dir, "logo", f);
  if (!existsSync(p)) { warn(`Falta logo/${f} → se usa un logo provisorio marcado PENDIENTE`); out.logo[f] = "falta"; continue; }
  const svg = readFileSync(p, "utf8");
  const before = out.errors.length;
  if (!/<svg[\s>]/i.test(svg)) { err(`logo/${f} no es un SVG`); continue; }
  if (/<image[\s>]/i.test(svg)) err(`logo/${f} trae una imagen raster adentro (<image>): hace falta el vector`);
  if (/<text[\s>]/i.test(svg)) warn(`logo/${f} tiene texto vivo (<text>): convertilo a contornos`);
  if (!/viewBox=/i.test(svg)) warn(`logo/${f} no tiene viewBox`);
  const parts = /data-part="mark"/.test(svg) && /data-part="wordmark"/.test(svg);
  if (out.errors.length > before) { out.logo[f] = "con errores"; continue; }
  out.logo[f] = parts ? "ok (animable por partes)" : "ok";
  ok(`logo/${f}${parts ? " · animable por partes" : ""}`);
}

// ---------- referencias ----------
const refRows = table("| # | Archivo").filter((r) => r[1]);
const refFiles = existsSync(join(dir, "references")) ? readdirSync(join(dir, "references")).filter((f) => !/^readme\.md$/i.test(f) && !f.startsWith(".")) : [];
out.references = refRows.map((r) => ({ ref: r[1], take: r[2] || "", avoid: r[3] || "" }));
for (const r of refRows) {
  const isLink = /^https?:\/\//.test(r[1]);
  if (!isLink && !refFiles.includes(r[1].replace(/^references\//, ""))) warn(`Referencia "${r[1]}" no está en references/`);
  if (!r[2]) warn(`Referencia "${r[1]}" sin «qué tomar»`);
}
const nRefs = Math.max(refRows.length, refFiles.filter((f) => f !== "links.txt").length);
if (nRefs === 0) err("Sin referencias: poné al menos 3 en references/ y en la sección 9");
else if (nRefs < 3) warn(`Solo ${nRefs} referencia(s): con 3 a 5 el look sale mucho mejor`);
else ok(`${nRefs} referencias`);

// ---------- reporte ----------
if (asJson) {
  console.log(JSON.stringify(out, null, 2));
} else {
  console.log(`\nBrandkit ${out.fields["Nombre de la marca"] || basename(dir)} · ${dir.replace(ROOT + "/", "")}\n`);
  for (const m of out.errors) console.log(`  ✗ ${m}`);
  for (const m of out.warnings) console.log(`  ⚠ ${m}`);
  for (const m of out.ok) console.log(`  ✓ ${m}`);
  console.log(
    out.errors.length
      ? `\n✗ ${out.errors.length} problema(s) bloqueante(s): corregilos y volvé a correr npm run brandkit:check -- ${basename(dir)}`
      : `\n✓ Listo para importar${out.warnings.length ? ` (${out.warnings.length} aviso(s) quedan PENDIENTE o los decide el DA)` : ""}. En Claude Code: /marca desde brandkit/${basename(dir)}`
  );
}
process.exit(out.errors.length ? 1 : 0);
