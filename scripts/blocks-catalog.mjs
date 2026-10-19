#!/usr/bin/env node
// Genera engine/blocks/README.md desde el comentario de cabecera y las variables declaradas de cada bloque.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./lib/common.mjs";

const dir = join(ROOT, "engine", "blocks");
const rows = [];
let detail = "";
for (const f of readdirSync(dir).filter((n) => n.endsWith(".html")).sort()) {
  const src = readFileSync(join(dir, f), "utf8");
  const head = (src.match(/<!--([\s\S]*?)-->/) || [])[1] || "";
  const lines = head.split("\n").map((l) => l.trim()).filter(Boolean);
  const name = (lines.find((l) => l.startsWith("bm-block:")) || "").replace("bm-block:", "").trim() || f.replace(".html", "");
  const uso = (lines.find((l) => l.startsWith("Uso:")) || "").replace("Uso:", "").trim();
  const dur = (lines.find((l) => l.startsWith("Duración sugerida:")) || "").replace("Duración sugerida:", "").trim();
  const rules = lines.filter((l) => !/^(bm-block:|Uso:|Duración sugerida:)/.test(l));
  const vars = JSON.parse((src.match(/data-composition-variables='([\s\S]*?)'/) || [])[1] || "[]");
  rows.push(`| [\`${name}\`](#${name}) | ${uso} | ${dur} |`);
  detail += `\n### ${name}\n\n${uso}\n\n${rules.map((r) => `- ${r}`).join("\n")}\n\n| Variable | Tipo | Default | Descripción |\n|---|---|---|---|\n${vars.map((v) => `| \`${v.id}\` | ${v.type}${v.options ? ` (${v.options.map((o) => o.value).join(" / ")})` : ""} | ${JSON.stringify(v.default).replace(/\|/g, "\\|").slice(0, 80)} | ${v.label} |`).join("\n")}\n`;
}
const md = `# Catálogo de bloques de marca

> GENERADO por \`node scripts/blocks-catalog.mjs\`. Cada bloque es una sub-composición HyperFrames parametrizable que lee los tokens de marca (\`brand/dist\`) y se adapta sola a 16:9, 9:16 y 1:1.
> Uso: en \`scenes.json\` → \`{ "id": "s03-dato", "block": "stat-hit", "duration": 5, "vars": { ... } }\`. La primera vez se copia a \`comp/compositions/<id>.html\` y desde ahí se puede personalizar.
> Convenciones de texto: separá líneas con \`|\`, marcá UNA palabra de acento con \`*asteriscos*\`, listas con \`\\n\`. Todos aceptan \`exit\` (none/fade/up) y reciben \`dur\` automáticamente.

| Bloque | Para qué | Duración sugerida |
|---|---|---|
${rows.join("\n")}

Para ver todos con la marca actual: \`npm run frames -- _galeria-bloques\` (y \`--format portrait\`).

## Detalle
${detail}`;
writeFileSync(join(dir, "README.md"), md);
console.log(`✓ engine/blocks/README.md (${rows.length} bloques)`);
