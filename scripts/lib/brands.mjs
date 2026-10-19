// Registro de marcas del estudio: brands/<slug>/ (config, logo, references, LOOK.md, blocks/, dist/ generado).
// Lo usan brand-apply, build-roots, new-project, frames, doctor y los comandos brand:*.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const BRANDS = join(ROOT, "brands");
const REGISTRY = join(BRANDS, "brands.json");

export const brandDir = (slug) => join(BRANDS, slug);
export const distDir = (slug) => join(BRANDS, slug, "dist");
export const configPath = (slug) => join(BRANDS, slug, "brand.config.json");

// Marcas = carpetas de brands/ con brand.config.json (las que empiezan con "_" o "." se ignoran)
export function listBrands() {
  if (!existsSync(BRANDS)) return [];
  return readdirSync(BRANDS, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !/^[_.]/.test(d.name) && existsSync(configPath(d.name)))
    .map((d) => d.name)
    .sort();
}

export function registry() {
  return existsSync(REGISTRY) ? JSON.parse(readFileSync(REGISTRY, "utf8")) : {};
}

export function defaultBrand() {
  const r = registry();
  const all = listBrands();
  if (r.default && all.includes(r.default)) return r.default;
  return all[0] || null;
}

export function brandExists(slug) {
  return !!slug && existsSync(configPath(slug));
}

// brand.json generado (lo que consumen los scripts); null si la marca no está aplicada
export function loadBrandDist(slug) {
  const p = join(distDir(slug), "brand.json");
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
}

// Bloques firma: brands/<slug>/blocks/*.html (override de un bloque del engine o bloque exclusivo de la marca)
export function brandBlocks(slug) {
  const d = join(brandDir(slug), "blocks");
  return existsSync(d) ? readdirSync(d).filter((n) => n.endsWith(".html")).map((n) => n.replace(/\.html$/, "")).sort() : [];
}

export function engineBlocks() {
  const d = join(ROOT, "engine", "blocks");
  return readdirSync(d).filter((n) => n.endsWith(".html")).map((n) => n.replace(/\.html$/, "")).sort();
}

// Resolución de un bloque para una marca: brands/<slug>/blocks/<b>.html > engine/blocks/<b>.html.
// Devuelve { path, source: "brand"|"engine" } o { error } con un mensaje claro (p. ej. bloque firma de otra marca).
export function resolveBlock(slug, block) {
  const own = join(brandDir(slug), "blocks", `${block}.html`);
  if (existsSync(own)) return { path: own, source: "brand" };
  const eng = join(ROOT, "engine", "blocks", `${block}.html`);
  if (existsSync(eng)) return { path: eng, source: "engine" };
  const owners = listBrands().filter((b) => b !== slug && brandBlocks(b).includes(block));
  if (owners.length)
    return { error: `"${block}" es un bloque firma de la marca ${owners.join(", ")}: no existe para "${slug}". Usá un bloque del engine (engine/blocks/README.md) o creá la firma propia en brands/${slug}/blocks/${block}.html.` };
  return { error: `no existe el bloque "${block}" (ni en brands/${slug}/blocks/ ni en engine/blocks/)` };
}

// Marca del proyecto: scenes.json → brand (o la default)
export function projectBrand(plan) {
  return plan.brand || defaultBrand();
}

const LOOK_LABEL = {
  background: { grid: "grilla", glow: "glow", "grid+glow": "grilla + glow en héroes", flat: "plano", paper: "papel con filete", gradient: "gradiente de marca" },
  align: { start: "alineado a la izquierda", center: "centrado" },
  headlineCase: { none: "titulares en caja normal", uppercase: "titulares en MAYÚSCULAS" },
  accentStyle: { color: "acento por color", underline: "acento subrayado", highlight: "acento resaltado", italic: "acento en itálica" },
  textReveal: { mask: "reveal por máscara", fade: "reveal por fundido", rise: "reveal que sube", blur: "reveal desde desenfoque" },
};
export function lookSummary(look = {}) {
  return ["background", "align", "headlineCase", "accentStyle", "textReveal"].map((k) => LOOK_LABEL[k]?.[look[k]]).filter(Boolean).join(" · ");
}

// brands/INDEX.md + MOTION.md / brand.md de la raíz (índices: la verdad de cada marca vive en brands/<slug>/)
export function writeIndex() {
  const all = listBrands();
  const def = defaultBrand();
  const rows = all.map((s) => {
    const b = loadBrandDist(s);
    if (!b) return `| \`${s}\` | (sin aplicar: \`npm run brand -- ${s}\`) | — | — | — |`;
    const sig = brandBlocks(s);
    return `| \`${s}\`${s === def ? " (default)" : ""} | ${b.meta?.name} | ${b.meta?.version} | ${b.look?.summary || lookSummary(b.look)} | ${sig.length ? sig.map((x) => `\`${x}\``).join(", ") : "—"} |`;
  });
  const index = `# Marcas del estudio (GENERADO por \`npm run brand\` — no editar)

Cada pieza usa UNA marca: \`scenes.json → "brand"\`. Antes de diseñar o animar, leé de ESA marca:
\`brands/<marca>/LOOK.md\` (dirección de arte: qué la hace distinta), \`brands/<marca>/dist/MOTION.md\` (tokens y timing) y
\`brands/<marca>/dist/brand-rules.md\` (reglas). Nunca mezcles tokens, bloques firma ni referencias de dos marcas en una pieza.

| Marca | Nombre | Versión | Look | Bloques firma (\`brands/<marca>/blocks/\`) |
|---|---|---|---|---|
${rows.join("\n")}

- Default para piezas nuevas: \`${def}\` (\`brands/brands.json\`). Pieza con otra marca: \`npm run new -- <slug> --brand <marca>\`.
- Un bloque firma con el nombre de un bloque del engine (p. ej. \`logo-sting\`) lo reemplaza SOLO para esa marca; un bloque firma con nombre propio existe solo para su marca (otra marca que lo pida → error de build).
- Comparar marcas sobre la misma pieza: \`npm run brand:compare -- <proyecto> --brands ${all.join(",")}\`.
`;
  writeFileSync(join(BRANDS, "INDEX.md"), index);
  const motion = `# MOTION.md — índice del estudio multimarca

> GENERADO por \`npm run brand\`. No editar a mano. Este repo tiene ${all.length} marca(s); cada pieza usa la de \`scenes.json → "brand"\`.
> **Read-first:** antes de diseñar, generar o animar, leé completo \`brands/<marca de la pieza>/dist/MOTION.md\` y \`brands/<marca>/LOOK.md\`.
> (Para los packs de skills que buscan \`MOTION.md\` en la raíz: la marca por defecto es \`${def}\` → \`brands/${def}/dist/MOTION.md\`.)

${all.map((s) => `- \`${s}\`${s === def ? " (default)" : ""}: [\`brands/${s}/dist/MOTION.md\`](brands/${s}/dist/MOTION.md) · [\`brands/${s}/LOOK.md\`](brands/${s}/LOOK.md)`).join("\n")}
`;
  writeFileSync(join(ROOT, "MOTION.md"), motion);
  const brandMd = `# brand.md — índice del estudio multimarca

> GENERADO por \`npm run brand\`. No editar a mano. La identidad de cada marca está en \`brands/<marca>/dist/brand.md\`; la pieza usa la de \`scenes.json → "brand"\` (default: \`${def}\`).

${all.map((s) => `- \`${s}\`: [\`brands/${s}/dist/brand.md\`](brands/${s}/dist/brand.md)`).join("\n")}
`;
  writeFileSync(join(ROOT, "brand.md"), brandMd);
  return { brands: all, default: def };
}
