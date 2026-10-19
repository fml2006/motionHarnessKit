#!/usr/bin/env node
// build-roots: scenes.json → comp/ (proyecto HyperFrames maestro) + formats/<id>/ (variantes derivadas)
//
//   node scripts/build-roots.mjs <proyecto> [--reset <sceneId>] [--only-brand]
//
// Reglas:
//   - comp/index.html y formats/** se REGENERAN siempre: no se editan a mano.
//   - comp/compositions/<sceneId>.html se crea UNA vez desde engine/blocks/<block>.html y después es tuyo
//     (el agente lo puede personalizar). --reset <sceneId> lo vuelve a copiar desde el bloque.
//   - comp/brand/ se sincroniza desde brand/dist/ en cada build (cambiar la marca = npm run brand + build).
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, copyDir, readJson, loadBrand, resolveProject, esc, escAttrSingle } from "./lib/common.mjs";

const args = process.argv.slice(2);
const projectDir = resolveProject(args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--reset"));
const resetId = args.includes("--reset") ? args[args.indexOf("--reset") + 1] : null;
const onlyBrand = args.includes("--only-brand");

const brand = loadBrand();
const plan = readJson(join(projectDir, "scenes.json"));
const comp = join(projectDir, "comp");
mkdirSync(join(comp, "compositions"), { recursive: true });
mkdirSync(join(comp, "assets"), { recursive: true });

// 1) marca → comp/brand (+ runtime de motion) y frame.md para las skills de HyperFrames
rmSync(join(comp, "brand"), { recursive: true, force: true });
copyDir(join(ROOT, "brand", "dist"), join(comp, "brand"), (s, n) => !["brand-board.html", "remotion-theme.ts", "contrast-report.md", "brand-rules.md", "frame.md"].includes(n));
copyFileSync(join(ROOT, "engine", "runtime", "bm-motion.js"), join(comp, "brand", "bm-motion.js"));
copyFileSync(join(ROOT, "brand", "dist", "frame.md"), join(comp, "frame.md"));
if (onlyBrand) {
  console.log(`✓ Marca sincronizada en ${comp.replace(ROOT + "/", "")}/brand`);
  process.exit(0);
}

// 2) validar plan
const errors = [];
const formats = brand.formats;
const fmtById = Object.fromEntries(formats.map((f) => [f.id, f]));
const master = fmtById[plan.master || "landscape"] || formats[0];
const wanted = (plan.formats || [master.id]).filter((id) => {
  if (!fmtById[id]) errors.push(`Formato desconocido "${id}" (definidos en brand.config.json: ${Object.keys(fmtById).join(", ")})`);
  return fmtById[id];
});
const ids = new Set();
for (const s of plan.scenes || []) {
  if (!s.id || !/^[a-z0-9][a-z0-9-]*$/.test(s.id)) errors.push(`Escena con id inválido: "${s.id}" (usá minúsculas, números y guiones)`);
  if (ids.has(s.id)) errors.push(`Id de escena duplicado: ${s.id}`);
  ids.add(s.id);
  if (!(s.duration > 0)) errors.push(`Escena ${s.id}: "duration" debe ser > 0`);
  const blockFile = join(ROOT, "engine", "blocks", `${s.block}.html`);
  const sceneFile = join(comp, "compositions", `${s.id}.html`);
  if (s.block !== "custom" && !existsSync(blockFile) && !existsSync(sceneFile)) errors.push(`Escena ${s.id}: no existe el bloque "${s.block}" (ver engine/blocks/)`);
  if (s.block === "custom" && !existsSync(sceneFile)) errors.push(`Escena ${s.id}: block "custom" requiere comp/compositions/${s.id}.html`);
}
if (errors.length) {
  errors.forEach((e) => console.error("  ✗ " + e));
  process.exit(1);
}

// presupuesto de lectura: la escena tiene que durar al menos entrada + hold del texto visible + salida
const RD = brand.motion?.reading || {};
const spw = RD.secondsPerWord ?? 0.35;
const base = (RD.baseMs ?? 800) / 1000;
const minHold = (RD.minHoldMs ?? 1500) / 1000;
const TEXT_VARS = ["text", "headline", "subtitle", "caption", "cta", "title", "quote", "label", "context", "steps", "items", "leftItems", "rightItems", "leftTitle", "rightTitle", "name", "role", "tagline", "kicker"];
const warnings = [];
for (const s of plan.scenes) {
  const v = s.vars || {};
  const words = TEXT_VARS.reduce((n, k) => n + (typeof v[k] === "string" ? v[k].replace(/[|*]/g, " ").split(/\s+/).filter(Boolean).length : 0), 0);
  if (!words) continue;
  // listas, pasos y gráficos se revelan de a poco y se escanean: 0.25 s/palabra en vez de lectura corrida
  const scan = ["steps-flow", "split-compare", "bar-chart", "terminal", "code-reveal"].includes(s.block);
  const need = Math.max(minHold, base + words * (scan ? 0.25 : spw)) + 0.6;
  if (s.duration + 0.05 < need) warnings.push(`${s.id}: ${s.duration}s para ~${words} palabras en pantalla; el hold de lectura pide ≥ ${need.toFixed(1)}s (o menos texto)`);
  if (typeof v.code === "string") {
    const longest = Math.max(...v.code.replace(/\\n/g, "\n").split("\n").map((l) => l.length));
    if (longest > 56) warnings.push(`${s.id}: línea de código de ${longest} caracteres; partila (≤ 56 en 16:9, ≤ 40 si va a 9:16)`);
  }
}

// 3) escenas: crear desde bloque si no existen (o --reset)
const created = [];
for (const s of plan.scenes) {
  const sceneFile = join(comp, "compositions", `${s.id}.html`);
  if (s.block === "custom") continue;
  if (!existsSync(sceneFile) || resetId === s.id) {
    const src = readFileSync(join(ROOT, "engine", "blocks", `${s.block}.html`), "utf8");
    writeFileSync(sceneFile, src.replaceAll("__ID__", s.id));
    created.push(s.id);
  }
}

// 4) raíces
function sceneList(fmtId) {
  // per-format: "skipIn": ["square"], "formats": { "portrait": { "duration": 5, "vars": {...} } }
  return plan.scenes.filter((s) => !(s.skipIn || []).includes(fmtId)).map((s) => {
    const o = (s.formats || {})[fmtId] || {};
    return { ...s, duration: o.duration ?? s.duration, vars: { ...(s.vars || {}), ...(o.vars || {}) } };
  });
}

function rootHtml(fmt) {
  const scenes = sceneList(fmt.id);
  const overlap = plan.crossfade ?? 0.4;
  let t = 0;
  const hosts = [];
  const fades = [];
  scenes.forEach((s, i) => {
    const xf = i > 0 && (s.transition || plan.defaultTransition) === "crossfade";
    if (xf) t = Math.max(0, t - overlap);
    const start = Math.round(t * 1000) / 1000;
    // entre escenas la transición ES la salida: sin salida animada salvo que la escena la pida explícitamente
    const vars = { exit: "none", ...s.vars, dur: s.duration };
    hosts.push(`      <!-- ${esc(s.id)} · ${esc(s.block)}${s.notes ? " · " + esc(s.notes).slice(0, 120) : ""} -->
      <div
        id="scene-${s.id}"
        class="clip"
        data-composition-id="${s.id}"
        data-composition-src="compositions/${s.id}.html"
        data-variable-values='${escAttrSingle(JSON.stringify(vars))}'
        data-start="${start}"
        data-duration="${s.duration}"
        data-track-index="${xf ? 2 : 1}"
        data-width="${fmt.width}"
        data-height="${fmt.height}"
      ></div>`);
    if (xf) fades.push(`      tl.fromTo("#scene-${s.id}", { opacity: 0 }, { opacity: 1, duration: ${overlap}, ease: "none" }, ${start});`);
    t = start + s.duration;
  });
  const total = Math.round(t * 1000) / 1000;
  const audio = [];
  const A = plan.audio || {};
  for (const [id, a] of Object.entries(A)) {
    if (!a || !a.src) continue;
    audio.push(`      <audio id="${id}" src="${esc(a.src)}" data-start="${a.start ?? 0}" data-duration="${a.duration ?? total}" data-track-index="${id === "voiceover" ? 8 : 9}" data-volume="${a.volume ?? (id === "voiceover" ? 1 : 0.3)}"></audio>`);
  }
  const wm = brand.logo?.watermark;
  const watermark = wm?.enabled
    ? `      <div id="brand-watermark" class="clip" data-start="0" data-duration="${total}" data-track-index="5" style="position:absolute;${wm.position?.includes("top") ? "top" : "bottom"}:5cqmin;${wm.position?.includes("left") ? "left" : "right"}:5cqmin;height:5cqmin;opacity:${wm.opacity ?? 0.6}"><img src="brand/logo/mark.svg" alt="" style="height:100%;width:auto;display:block" /></div>`
    : "";
  return {
    total,
    html: `<!doctype html>
<html lang="${esc(brand.identity?.voice?.language || "es")}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${fmt.width}, height=${fmt.height}" />
    <title>${esc(plan.title || "video")} · ${fmt.id}</title>
    <!-- GENERADO por scripts/build-roots.mjs desde scenes.json. No editar: cambiá scenes.json o compositions/*.html -->
    <link rel="stylesheet" href="brand/tokens.css" />
    <script src="brand/vendor/gsap.min.js"></script>
    <script src="brand/vendor/CustomEase.min.js"></script>
    <script src="brand/tokens.js"></script>
    <script src="brand/bm-motion.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { background: var(--c-background); overflow: hidden; }
      #root { width: 100%; height: 100%; position: relative; overflow: hidden; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="${fmt.width}" data-height="${fmt.height}" data-fps="${fmt.fps || 30}">
${hosts.join("\n")}
${watermark}
${audio.join("\n")}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
${fades.join("\n")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`,
  };
}

const masterRoot = rootHtml(master);
writeFileSync(join(comp, "index.html"), masterRoot.html);
writeFileSync(join(comp, "meta.json"), JSON.stringify({ id: plan.slug || "video", name: plan.title || "video", format: master.id }, null, 2));
if (!existsSync(join(comp, "hyperframes.json")))
  writeFileSync(join(comp, "hyperframes.json"), JSON.stringify({ $schema: "https://hyperframes.heygen.com/schema/hyperframes.json", paths: { blocks: "compositions", components: "compositions/components", assets: "assets" }, media: { autoProxy: true } }, null, 2));

// 5) variantes por formato: copia del maestro con la raíz re-dimensionada
const summary = [`${master.id} ${master.width}×${master.height} · ${masterRoot.total}s → comp/`];
rmSync(join(projectDir, "formats"), { recursive: true, force: true });
for (const id of wanted) {
  if (id === master.id) continue;
  const fmt = fmtById[id];
  const dir = join(projectDir, "formats", id);
  copyDir(comp, dir, (s, n) => ![".hyperframes", "renders", "node_modules"].includes(n));
  const r = rootHtml(fmt);
  writeFileSync(join(dir, "index.html"), r.html);
  summary.push(`${id} ${fmt.width}×${fmt.height} · ${r.total}s → formats/${id}/`);
}

console.log(`✓ Build de "${plan.title || plan.slug}" (${plan.scenes.length} escenas)`);
summary.forEach((l) => console.log("  · " + l));
if (created.length) console.log(`  · escenas nuevas desde bloques: ${created.join(", ")}`);
for (const w of warnings) console.log(`  ⚠ ${w}`);
console.log("  Siguiente: npm run render -- " + projectDir.replace(ROOT + "/", "") + "   (o preview: cd comp && npx hyperframes preview)");
