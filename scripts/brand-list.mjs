#!/usr/bin/env node
// brand-list: las marcas del estudio, su look, sus bloques firma y qué piezas usan cada una.
//   node scripts/brand-list.mjs
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./lib/common.mjs";
import { listBrands, defaultBrand, loadBrandDist, brandBlocks, lookSummary } from "./lib/brands.mjs";

const pdir = join(ROOT, "projects");
const uses = {};
if (existsSync(pdir))
  for (const p of readdirSync(pdir)) {
    const f = join(pdir, p, "scenes.json");
    if (!existsSync(f)) continue;
    const b = JSON.parse(readFileSync(f, "utf8")).brand || `${defaultBrand()} (implícita)`;
    (uses[b.split(" ")[0]] ||= []).push(p);
  }
const def = defaultBrand();
console.log(`\nMarcas del estudio (brands/) · default: ${def}\n`);
for (const s of listBrands()) {
  const b = loadBrandDist(s);
  console.log(`● ${s}${s === def ? " (default)" : ""}${b ? ` — ${b.meta.name} v${b.meta.version}` : " — SIN APLICAR (npm run brand -- " + s + ")"}`);
  if (b) console.log(`    look:   ${b.look?.summary || lookSummary(b.look)}`);
  if (b) console.log(`    tokens: fondo ${b.look?.background} · ${b.look?.align} · acento ${b.look?.accentStyle} · texto ${b.look?.textReveal} · ${b.typography?.display?.family} / ${b.typography?.body?.family}`);
  const sig = brandBlocks(s);
  console.log(`    firma:  ${sig.length ? sig.join(", ") : "—"}`);
  console.log(`    piezas: ${(uses[s] || []).join(", ") || "—"}`);
}
console.log(`\nNueva: npm run brand:new -- <slug> [--from ${def}] · Editar: /marca <slug> · Comparar: npm run brand:compare -- <proyecto> --brands ${listBrands().join(",")}`);
