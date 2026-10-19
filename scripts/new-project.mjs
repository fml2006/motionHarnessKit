#!/usr/bin/env node
// new-project: crea la carpeta de una pieza con preproducción, plan de escenas y composición con la marca aplicada.
//   node scripts/new-project.mjs <slug> [--title "Título"] [--type explainer|launch|social|tutorial|data|overlay]
//                                [--formats landscape,portrait,square] [--date 2026-10-19]
import { existsSync, mkdirSync, writeFileSync, copyFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, slugify, loadBrand } from "./lib/common.mjs";

const args = process.argv.slice(2);
const val = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const raw = args.find((a, i) => !a.startsWith("--") && !["--title", "--type", "--formats", "--date"].includes(args[i - 1]));
if (!raw) {
  console.error('Uso: npm run new -- <slug> [--title "Título"] [--type explainer|launch|social|tutorial|data|overlay] [--formats landscape,portrait]');
  process.exit(1);
}
const brand = loadBrand();
const slug = slugify(raw);
const title = val("--title", raw);
const type = val("--type", "explainer");
const date = val("--date", new Date().toISOString().slice(0, 10));
const formats = val("--formats", type === "social" ? "portrait,square,landscape" : type === "overlay" ? "landscape" : "landscape,portrait").split(",");
const dir = join(ROOT, "projects", `${date}_${slug}`);
if (existsSync(dir)) {
  console.error(`✗ Ya existe ${dir}`);
  process.exit(1);
}

// Plan de escenas inicial por tipo de pieza (es un punto de partida: /storyboard lo reemplaza)
const STARTERS = {
  explainer: [
    ["s01-hook", "kinetic-statement", 4, { text: "Una afirmación que genere *tensión* en 3 segundos." }, "HOOK: resultado o tensión primero. Nada de 'Bienvenidos'."],
    ["s02-titulo", "title-card", 4.5, { kicker: "Explainer", headline: title, subtitle: "" }, "Promesa: qué va a entender la audiencia."],
    ["s03-como", "steps-flow", 8, {}, "Mecanismo en 3-4 pasos, uno por vez."],
    ["s04-prueba", "stat-hit", 5, { source: "Fuente: COMPLETAR (claim C-001)" }, "Prueba: un dato con fuente verificable."],
    ["s05-cta", "end-card", 5, { cta: "Un *único* llamado|a la acción", link: "tumarca.com" }, "CTA único."],
  ],
  launch: [
    ["s01-logo", "logo-sting", 2.4, {}, "Firma breve."],
    ["s02-problema", "kinetic-statement", 4.5, { text: "El problema, en una *frase*." }, ""],
    ["s03-feature", "code-reveal", 7, {}, "La novedad en acción (código o UI real)."],
    ["s04-antes-despues", "split-compare", 8, {}, "Antes vs ahora."],
    ["s05-cta", "end-card", 5, {}, "Disponible hoy + link."],
  ],
  social: [
    ["s01-hook", "kinetic-statement", 3.5, { text: "El *dato* que nadie te contó.", size: "hero" }, "Hook visual mudo: se entiende sin sonido."],
    ["s02-dato", "stat-hit", 4.5, { source: "Fuente: COMPLETAR" }, ""],
    ["s03-cierre", "end-card", 4, { cta: "Seguinos para|más *datos*" }, ""],
  ],
  tutorial: [
    ["s01-titulo", "title-card", 4, { kicker: "Tutorial", headline: title }, ""],
    ["s02-cap1", "chapter", 2.6, { number: "01", title: "Instalación" }, ""],
    ["s03-terminal", "terminal", 6, {}, "Comando real copiado de una corrida."],
    ["s04-cap2", "chapter", 2.6, { number: "02", title: "Primer uso" }, ""],
    ["s05-codigo", "code-reveal", 7, {}, ""],
    ["s06-cierre", "end-card", 5, {}, ""],
  ],
  data: [
    ["s01-pregunta", "kinetic-statement", 4, { text: "¿Cuánto *tarda* de verdad?" }, ""],
    ["s02-grafico", "bar-chart", 7.5, {}, "Un mensaje por gráfico. Eje desde cero."],
    ["s03-dato", "stat-hit", 5, {}, "La conclusión en un número."],
    ["s04-cierre", "end-card", 4.5, {}, ""],
  ],
  overlay: [["s01-lower", "lower-third", 5, { transparent: true }, "Renderizar con --alpha (ProRes 4444) para el editor."]],
};
const starter = STARTERS[type];
if (!starter) {
  console.error(`✗ Tipo desconocido "${type}". Opciones: ${Object.keys(STARTERS).join(", ")}`);
  process.exit(1);
}

for (const d of ["research", "review", "renders", "qa", "delivery", "sources", "comp/assets/audio", "comp/assets/images", "comp/assets/video", "licenses"]) mkdirSync(join(dir, d), { recursive: true });

// preproducción desde plantillas (numeradas en el orden del pipeline)
const T = join(ROOT, "templates");
const copies = [
  ["brief.md", "00_brief.md"],
  ["guion-dos-columnas.md", "01_guion.md"],
  ["storyboard.md", "02_storyboard.md"],
  ["shot-list.csv", "03_shot-list.csv"],
  ["review-feedback.md", "review/R1.md"],
  ["anti-slop-review.md", "review/direccion-checklist.md"],
  ["qa-checklist.md", "qa/qa-checklist.md"],
  ["legal-checklist.md", "qa/legal-checklist.md"],
  ["delivery-checklist.md", "delivery/delivery-checklist.md"],
  ["provenance.yaml.md", "PROVENANCE.md"],
];
for (const [src, dst] of copies) if (existsSync(join(T, src))) copyFileSync(join(T, src), join(dir, dst));

const plan = {
  $comment: "Plan de escenas ejecutable. Lo escribe /storyboard desde 02_storyboard.md. Después: npm run build:roots -- <proyecto>",
  title,
  slug,
  type,
  date,
  // social se piensa vertical-first: el maestro es 9:16 y el resto se deriva
  master: type === "social" && formats.includes("portrait") ? "portrait" : formats.includes("landscape") ? "landscape" : formats[0],
  formats,
  defaultTransition: brand.motion?.transitions?.default === "crossfade" ? "crossfade" : "cut",
  crossfade: 0.4,
  audio: {
    voiceover: { src: "", volume: 1 },
    music: { src: "", volume: 0.25 },
  },
  scenes: starter.map(([id, block, duration, vars, notes]) => ({ id, block, duration, vars, notes })),
};
writeFileSync(join(dir, "scenes.json"), JSON.stringify(plan, null, 2) + "\n");

writeFileSync(
  join(dir, "README.md"),
  `# ${title}

Tipo: **${type}** · Formatos: ${formats.join(", ")} · Creado: ${date} · Marca: ${brand.meta.name} v${brand.meta.version}

## Estado del pipeline (marcar al aprobar cada gate)

- [ ] G0 Brief firmado → \`00_brief.md\`
- [ ] G1 Investigación y claims → \`research/\` (claims.csv con fuente por cada número)
- [ ] G3 Guion a dos columnas aprobado → \`01_guion.md\`
- [ ] G4 Styleframes aprobados → \`review/frames-*/\` (npm run frames)
- [ ] G5 Storyboard = spec ejecutable → \`02_storyboard.md\` + \`scenes.json\`
- [ ] G6 Animatic aprobado (render draft + VO scratch)
- [ ] G7 Build v01 (npm run render) + QA automático sin FAIL
- [ ] G8 Revisión R1 / R2 → \`review/R*.md\` + \`review/CHANGELOG.md\`
- [ ] G9 Picture lock
- [ ] G10 Mezcla a −14 LUFS / −1 dBTP (npm run loudnorm)
- [ ] G11 Captions revisados por humano
- [ ] G12-G13 Master + versiones (scripts/master.sh)
- [ ] G14 QA final + checklist legal → \`qa/\`
- [ ] G15 Entrega + archivo (tag de versión del proyecto)

## Comandos

\`\`\`bash
npm run build:roots -- ${date}_${slug}     # scenes.json → comp/ + formats/
npm run frames -- ${date}_${slug}          # un frame clave por escena (styleframes / review)
npm run render -- ${date}_${slug} --quality draft   # animatic / revisión
npm run render -- ${date}_${slug} --quality high    # final
npm run qa -- ${date}_${slug}
cd projects/${date}_${slug}/comp && npx hyperframes preview   # Studio para ajustes finos
\`\`\`
`
);

const b = spawnSync(process.execPath, [join(ROOT, "scripts", "build-roots.mjs"), dir], { stdio: "inherit" });
if (b.status !== 0) process.exit(b.status || 1);
console.log(`\n✓ Proyecto creado: projects/${date}_${slug}/`);
console.log("  Próximo paso en Claude Code: /brief (o completá 00_brief.md a mano)");
