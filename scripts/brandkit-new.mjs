#!/usr/bin/env node
// brandkit-new: copia la plantilla del brandkit a brandkit/<slug>/ para completarla.
//   node scripts/brandkit-new.mjs <slug> [--name "Nombre de la marca"]
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, copyDir } from "./lib/common.mjs";

const args = process.argv.slice(2);
const val = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
const slug = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--name");
if (!slug || !/^[a-z0-9][a-z0-9-]{1,40}$/.test(slug)) {
  console.error('Uso: npm run brandkit:new -- <slug> [--name "Nombre"]   (slug: minúsculas, números y guiones, p. ej. acme-latam)');
  process.exit(1);
}
const src = join(ROOT, "brandkit", "_plantilla");
const dst = join(ROOT, "brandkit", slug);
if (existsSync(dst)) {
  console.error(`✗ Ya existe brandkit/${slug}/: completalo o revisalo con npm run brandkit:check -- ${slug}`);
  process.exit(1);
}
copyDir(src, dst);
const f = join(dst, "BRANDKIT.md");
const name = val("--name") || "";
let md = readFileSync(f, "utf8")
  .replace(/^- Slug \*:.*$/m, `- Slug *: ${slug}`)
  .replace(/^- Nombre de la marca \*:.*$/m, `- Nombre de la marca *: ${name}`);
if (name) md = md.replace("[NOMBRE DE LA MARCA]", name);
writeFileSync(f, md);
console.log(`✓ brandkit/${slug}/ creado desde la plantilla.
  1. Completá brandkit/${slug}/BRANDKIT.md y poné los archivos en logo/, fonts/ y references/.
  2. Revisalo:            npm run brandkit:check -- ${slug}
  3. En Claude Code:      /marca desde brandkit/${slug}`);
