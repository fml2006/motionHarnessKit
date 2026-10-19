#!/usr/bin/env node
// brand-new: crea una marca nueva en el estudio (brands/<slug>/) a partir de otra.
//   node scripts/brand-new.mjs <slug> [--from <marca>] [--name "Nombre"] [--mark bracket|pulse|ring] [--default]
// Copia la config de --from (default: la marca default), le pone nombre/slug/versión 0.1.0, genera un logo
// placeholder, LOOK.md (plantilla de dirección de arte), references/ y blocks/, y la aplica (npm run brand -- <slug>).
// Después: /marca <slug> en Claude Code completa colores, fuentes, logo real, look y bloques firma.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, slugify } from "./lib/common.mjs";
import { BRANDS, listBrands, defaultBrand, configPath, brandDir } from "./lib/brands.mjs";

const args = process.argv.slice(2);
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const raw = args.find((a, i) => !a.startsWith("--") && !["--from", "--name", "--mark"].includes(args[i - 1]));
if (!raw) {
  console.error('Uso: npm run brand:new -- <slug> [--from <marca>] [--name "Nombre"] [--mark bracket|pulse|ring] [--default]');
  process.exit(1);
}
const slug = slugify(raw);
const from = opt("--from", defaultBrand());
if (existsSync(brandDir(slug))) {
  console.error(`✗ Ya existe brands/${slug}/. Para editarla: /marca ${slug} (o brands/${slug}/brand.config.json + npm run brand -- ${slug})`);
  process.exit(1);
}
if (!listBrands().includes(from)) {
  console.error(`✗ --from "${from}" no existe. Marcas: ${listBrands().join(", ")}`);
  process.exit(1);
}
const name = opt("--name", raw.replace(/(^|[-_ ])(\w)/g, (_, s, c) => (s ? " " : "") + c.toUpperCase()).trim());
const cfg = JSON.parse(readFileSync(configPath(from), "utf8"));
const today = new Date().toISOString().slice(0, 10);
cfg.meta = { ...cfg.meta, name, slug, version: "0.1.0", updated: today, notes: `Creada con brand:new desde "${from}". Completala con /marca ${slug}: nada de esta config es de la marca real todavía.` };
cfg.$schema = "../brand.schema.json";
cfg.logo = { ...cfg.logo, primary: "logo/logo.svg", mark: "logo/mark.svg", onDark: "logo/logo.svg", onLight: "logo/logo-dark.svg" };
if (cfg.look) cfg.look.summary = `PENDIENTE: definir con /marca ${slug} (hoy copia el look de ${from}).`;

const dir = brandDir(slug);
for (const d of ["logo", "references", "blocks", "fonts"]) mkdirSync(join(dir, d), { recursive: true });
writeFileSync(configPath(slug), JSON.stringify(cfg, null, 2) + "\n");
writeFileSync(
  join(dir, "LOOK.md"),
  `# ${name} — LOOK (dirección de arte)

> Lo escribe /marca y lo leen todos los agentes antes de diseñar una pieza de esta marca. Es la parte del estilo que
> no entra en un token: por qué la marca se ve así, qué la hace distinta de las otras marcas del estudio y qué nunca hace.
> Los valores van en \`brand.config.json → look\` (y \`npm run brand -- ${slug}\`); acá va el criterio.

## En una frase
PENDIENTE (p. ej. "editorial clara: papel, serif, composición centrada, todo entra por fundido lento").

## Qué la hace distinta de las otras marcas del estudio
- PENDIENTE (comparala con \`npm run brand:compare -- _galeria-bloques --brands ${[...listBrands(), slug].join(",")}\`).

## Movimientos firma
- PENDIENTE: cómo abre (logo-sting), cómo cierra (end-card), cómo entra el texto, cómo se marca el dato clave.

## Referencias (\`references/\`)
- PENDIENTE: 3–5 frames o links, cada uno con "qué tomamos" y "qué no".

## Sí
- PENDIENTE

## Nunca
- PENDIENTE

## Bloques firma (\`blocks/\`)
- Ninguno todavía. Un \`blocks/logo-sting.html\` (mismo nombre que un bloque del engine) reemplaza al del engine solo para esta marca;
  un bloque con nombre propio (p. ej. \`${slug}-apertura\`) existe solo para esta marca.
`
);
writeFileSync(join(dir, "references", "README.md"), `# Referencias de ${name}\n\n3–5 frames (PNG/JPG) o links de motion que definan el look de la marca. Para cada una: qué tomamos y qué NO. Las usa /marca para decidir \`look\` y LOOK.md, y el director de arte para criticar frames.\n`);
writeFileSync(join(dir, "blocks", "README.md"), `# Bloques firma de ${name}\n\nSub-composiciones HyperFrames con el mismo contrato que \`engine/blocks/\` (copiá uno como base; \`__ID__\` se reemplaza por el id de la escena).\n\n- Mismo nombre que un bloque del engine (\`logo-sting.html\`, \`end-card.html\`…) → lo reemplaza SOLO para esta marca.\n- Nombre propio (\`${slug}-<algo>.html\`) → bloque exclusivo: otra marca que lo pida falla en el build con un error claro.\n\nDespués de agregar uno: \`node scripts/blocks-catalog.mjs\` (catálogo) y \`npm run brand:compare -- _galeria-bloques\`.\n`);
const logo = spawnSync(process.execPath, [join(ROOT, "scripts", "placeholder-logo.mjs"), "--brand", slug, ...(args.includes("--mark") ? ["--mark", opt("--mark")] : [])], { stdio: "inherit" });
if (logo.status !== 0) process.exit(logo.status || 1);
if (args.includes("--default")) writeFileSync(join(BRANDS, "brands.json"), JSON.stringify({ $comment: "Registro del estudio multimarca. default = marca de las piezas nuevas sin --brand.", default: slug }, null, 2) + "\n");
const ap = spawnSync(process.execPath, [join(ROOT, "scripts", "brand-apply.mjs"), slug], { stdio: "inherit" });
if (ap.status !== 0) process.exit(ap.status || 1);
console.log(`\n✓ Marca "${name}" creada en brands/${slug}/ (desde ${from}).`);
console.log(`  Siguiente en Claude Code: /marca ${slug}  → colores, fuentes, logo real, look, LOOK.md y bloques firma.`);
