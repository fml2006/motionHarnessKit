#!/usr/bin/env node
// build-roots: scenes.json → comp/ (proyecto HyperFrames maestro) + formats/<id>/ (variantes derivadas)
//
//   node scripts/build-roots.mjs <proyecto> [--reset <sceneId>|all] [--only-brand] [--strict] [--rebrand] [--brand <marca>]
//
// Reglas:
//   - La pieza usa UNA marca del estudio: scenes.json → "brand" (brands/<marca>/). Sin "brand": la default, con aviso.
//   - comp/index.html y formats/** se REGENERAN siempre: no se editan a mano.
//   - comp/compositions/<sceneId>.html se crea UNA vez desde el bloque y después es tuyo. El bloque se resuelve
//     brands/<marca>/blocks/<block>.html (firma de la marca) > engine/blocks/<block>.html. --reset <id>|all lo re-copia.
//   - comp/brand/ se sincroniza desde brands/<marca>/dist/ en cada build, PERO solo si coincide con el brandLock del
//     proyecto (scenes.json → brandLock: marca + versión + hash). Si la marca cambió, el build se frena: --rebrand lo
//     acepta a conciencia. Cambiar la pieza a otra marca: --brand <otra> --rebrand (queda en review/CHANGELOG.md).
//   - Gates de contenido (placeholders, cifras sin claim verificada, valores sueltos fuera de tokens, captions):
//     WARN en un build normal; FAIL con --strict (render final / entrega).
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, copyFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, copyDir, readJson, loadBrand, resolveProject, esc, escAttrSingle } from "./lib/common.mjs";
import { TRANSITIONS, transitionOf, timeline, compositionDefaults, compositionBodyText, findPlaceholder, loadClaims, claimProblem, NUMERIC_BLOCKS, brandFingerprint, parseCaptions, captionWarnings, tokenLint } from "./lib/plan.mjs";
import { defaultBrand, brandExists, listBrands, distDir, resolveBlock } from "./lib/brands.mjs";

const args = process.argv.slice(2);
const VALUE_FLAGS = ["--reset", "--brand"];
const projectDir = resolveProject(args.find((a, i) => !a.startsWith("--") && !VALUE_FLAGS.includes(args[i - 1])));
const resetId = args.includes("--reset") ? args[args.indexOf("--reset") + 1] : null;
const onlyBrand = args.includes("--only-brand");
const strict = args.includes("--strict");
const rebrand = args.includes("--rebrand");
const brandArg = args.includes("--brand") ? args[args.indexOf("--brand") + 1] : null;
const rel = (p) => p.replace(ROOT + "/", "");

const planPath = join(projectDir, "scenes.json");
const plan = readJson(planPath);
const comp = join(projectDir, "comp");
const isDemo = plan.purpose === "demo";
const savePlan = () => writeFileSync(planPath, JSON.stringify(plan, null, 2) + "\n");
const changelog = (line) => {
  mkdirSync(join(projectDir, "review"), { recursive: true });
  appendFileSync(join(projectDir, "review", "CHANGELOG.md"), `- ${new Date().toISOString().slice(0, 16).replace("T", " ")} · ${line}\n`);
};

// 0) marca de la pieza
if (brandArg && brandArg !== plan.brand) {
  if (!brandExists(brandArg)) {
    console.error(`✗ La marca "${brandArg}" no existe. Marcas del estudio: ${listBrands().join(", ")}`);
    process.exit(1);
  }
  if (plan.brand && !rebrand) {
    console.error(`✗ Esta pieza es de la marca "${plan.brand}". Cambiarla a "${brandArg}" es un rebrand: agregá --rebrand (queda en review/CHANGELOG.md).`);
    process.exit(1);
  }
  if (plan.brand) changelog(`CAMBIO DE MARCA · ${plan.brand} → ${brandArg} (build:roots --brand ${brandArg} --rebrand)`);
  plan.brand = brandArg;
  savePlan();
}
if (!plan.brand) {
  plan.brand = defaultBrand();
  savePlan();
  console.log(`  ⚠ scenes.json no declaraba "brand": la pieza queda con la marca default "${plan.brand}" (cambiala con --brand <marca> --rebrand).`);
}
const slug = plan.brand;
if (!brandExists(slug)) {
  console.error(`✗ scenes.json → brand = "${slug}", que no existe en brands/. Marcas: ${listBrands().join(", ")}`);
  process.exit(1);
}
const brand = loadBrand(slug);
const DIST = distDir(slug);

// brandLock: la pieza queda atada a la marca y versión con la que se aprobó
const current = brandFingerprint(DIST, brand);
const lock = plan.brandLock;
const lockStr = (l) => `${l.slug ? l.slug + " · " : ""}${l.name} v${l.version} #${l.hash}`;
if (!lock) {
  plan.brandLock = current;
  savePlan();
  console.log(`  ⚠ El proyecto no tenía brandLock: queda atado a ${lockStr(current)} (scenes.json → brandLock).`);
} else if (lock.hash !== current.hash || (lock.slug && lock.slug !== current.slug)) {
  if (!rebrand) {
    console.error(`✗ La marca cambió desde que se bloqueó este proyecto.`);
    console.error(`    proyecto: ${lockStr(lock)}`);
    console.error(`    actual:   ${lockStr(current)}  (brands/${slug}/dist)`);
    console.error(`  Si el cambio de marca es intencional para ESTA pieza: npm run build:roots -- ${rel(projectDir)} --rebrand`);
    console.error(`  Si no: restaurá la marca (git checkout brands/${slug}/ && npm run brand -- ${slug}) o trabajá en otro clon.`);
    process.exit(1);
  }
  plan.brandLock = current;
  savePlan();
  changelog(`REBRAND · ${lockStr(lock)} → ${lockStr(current)} (build:roots --rebrand)`);
  console.log(`  ⚠ Rebrand aceptado: ${lockStr(lock)} → ${lockStr(current)} (anotado en review/CHANGELOG.md)`);
}

mkdirSync(join(comp, "compositions"), { recursive: true });
mkdirSync(join(comp, "assets"), { recursive: true });

// 1) marca → comp/brand (+ runtime de motion) y frame.md para las skills de HyperFrames
rmSync(join(comp, "brand"), { recursive: true, force: true });
copyDir(DIST, join(comp, "brand"), (s, n) => !["brand-board.html", "remotion-theme.ts", "contrast-report.md", "brand-rules.md", "frame.md", "MOTION.md", "brand.md"].includes(n));
copyFileSync(join(ROOT, "engine", "runtime", "bm-motion.js"), join(comp, "brand", "bm-motion.js"));
copyFileSync(join(DIST, "frame.md"), join(comp, "frame.md"));
if (onlyBrand) {
  console.log(`✓ Marca sincronizada en ${rel(comp)}/brand`);
  process.exit(0);
}

// 2) validar plan
const errors = [];
const formats = brand.formats;
const fmtById = Object.fromEntries(formats.map((f) => [f.id, f]));
const master = fmtById[plan.master || "landscape"] || formats[0];
const wanted = (plan.formats || [master.id]).filter((id) => {
  if (!fmtById[id]) errors.push(`Formato desconocido "${id}" (definidos en brands/${slug}/brand.config.json: ${Object.keys(fmtById).join(", ")})`);
  return fmtById[id];
});
const allowedTr = brand.motion?.transitions?.allowed || Object.keys(TRANSITIONS);
const ids = new Set();
for (const s of plan.scenes || []) {
  if (!s.id || !/^[a-z0-9][a-z0-9-]*$/.test(s.id)) errors.push(`Escena con id inválido: "${s.id}" (usá minúsculas, números y guiones)`);
  if (ids.has(s.id)) errors.push(`Id de escena duplicado: ${s.id}`);
  ids.add(s.id);
  if (!(s.duration > 0)) errors.push(`Escena ${s.id}: "duration" debe ser > 0`);
  const sceneFile = join(comp, "compositions", `${s.id}.html`);
  if (s.block !== "custom") {
    const rb = resolveBlock(slug, s.block);
    // un bloque firma de otra marca es error aunque la escena ya exista: la pieza no puede mezclar marcas
    if (rb.error && (!existsSync(sceneFile) || /firma de la marca/.test(rb.error))) errors.push(`Escena ${s.id}: ${rb.error}`);
  }
  if (s.block === "custom" && !existsSync(sceneFile)) errors.push(`Escena ${s.id}: block "custom" requiere comp/compositions/${s.id}.html`);
  const tr = transitionOf(s, plan);
  if (!TRANSITIONS[tr]) errors.push(`Escena ${s.id}: transición "${tr}" no implementada en el kit (implementadas: ${Object.keys(TRANSITIONS).join(", ")}). Las demás se hacen en el NLE.`);
  else if (!allowedTr.includes(tr)) errors.push(`Escena ${s.id}: transición "${tr}" no está permitida por la marca (motion.transitions.allowed: ${allowedTr.join(", ")})`);
  if (s.claims && !Array.isArray(s.claims)) errors.push(`Escena ${s.id}: "claims" tiene que ser una lista de IDs, p. ej. ["C-001"]`);
}
if (errors.length) {
  console.error(`✗ El plan de "${plan.title || plan.slug}" (marca ${slug}) tiene ${errors.length} error(es):`);
  errors.forEach((e) => console.error("  ✗ " + e));
  process.exit(1);
}

// 3) escenas: crear desde bloque si no existen (o --reset)
const created = [];
for (const s of plan.scenes) {
  const sceneFile = join(comp, "compositions", `${s.id}.html`);
  if (s.block === "custom") continue;
  if (!existsSync(sceneFile) || resetId === s.id || resetId === "all") {
    const src = readFileSync(resolveBlock(slug, s.block).path, "utf8");
    writeFileSync(sceneFile, src.replaceAll("__ID__", s.id));
    created.push(s.id);
  }
}

// 4) gates de contenido: lectura, placeholders, claims, tokens
const warnings = [];
const gate = []; // WARN normal / FAIL con --strict
const RD = brand.motion?.reading || {};
const spw = RD.secondsPerWord ?? 0.35;
const base = (RD.baseMs ?? 800) / 1000;
const minHold = (RD.minHoldMs ?? 1500) / 1000;
const cps = RD.charsPerSecond ?? 15;
const TEXT_VARS = ["text", "headline", "subtitle", "caption", "cta", "title", "quote", "label", "context", "steps", "items", "leftItems", "rightItems", "leftTitle", "rightTitle", "name", "role", "tagline", "kicker"];
const claims = loadClaims(projectDir);
const exempt = (s) => isDemo && s.demo === true;

for (const s of plan.scenes) {
  const html = readFileSync(join(comp, "compositions", `${s.id}.html`), "utf8");
  const defaults = compositionDefaults(html);
  // variables efectivas por formato: defaults del bloque + vars de la escena + override del formato
  const perFormat = wanted.map((f) => ({ f, v: { ...defaults, ...(s.vars || {}), ...(((s.formats || {})[f] || {}).vars || {}) } }));
  const v = perFormat.find((p) => p.f === master.id)?.v || { ...defaults, ...(s.vars || {}) };

  // presupuesto de lectura: entrada + hold del texto visible + salida
  const text = TEXT_VARS.map((k) => (typeof v[k] === "string" ? v[k].replace(/[|*]/g, " ").replace(/\\n|\n/g, " ") : "")).join(" ").trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words) {
    // listas, pasos y gráficos se revelan de a poco y se escanean: 0.25 s/palabra; el resto se lee corrido
    const scan = ["steps-flow", "split-compare", "bar-chart", "terminal", "code-reveal"].includes(s.block);
    const hold = scan ? Math.max(minHold, base + words * 0.25) : Math.max(minHold, base + words * spw, text.replace(/\s+/g, " ").length / cps);
    const need = hold + 0.6;
    if (s.duration + 0.05 < need) warnings.push(`${s.id}: ${s.duration}s para ~${words} palabras en pantalla; el hold de lectura pide ≥ ${need.toFixed(1)}s (o menos texto)`);
  }
  // código y terminal: el tamaño se ajusta a la línea más larga; pasado el límite queda chico o se parte
  const narrow = wanted.some((f) => fmtById[f].width < fmtById[f].height);
  const maxChars = narrow ? 40 : 56;
  const monoLines = [v.code, s.block === "terminal" ? `${v.prompt || "$"} ${v.command || ""}` : null, s.block === "terminal" ? v.output : null]
    .filter((x) => typeof x === "string")
    .flatMap((x) => x.replace(/\\n/g, "\n").split("\n"));
  const longest = Math.max(0, ...monoLines.map((l) => l.length));
  if (longest > maxChars) warnings.push(`${s.id}: línea de ${s.block === "terminal" ? "terminal" : "código"} de ${longest} caracteres; partila (≤ 56 en 16:9, ≤ 40 si la pieza va a 9:16 o 4:5)`);
  if (exempt(s)) continue;

  // placeholders en variables (defaults incluidos: si no pisaste el default, se ve el placeholder)
  const byIssue = new Map(); // un mensaje por problema, con los formatos afectados
  const note = (msg, f) => byIssue.set(msg, [...(byIssue.get(msg) || []), f]);
  for (const { f, v: vf } of perFormat) {
    for (const [k, val] of Object.entries(vf)) {
      const ph = findPlaceholder(val);
      if (ph) note(`la variable "${k}" tiene un placeholder ("${ph}") → completala con contenido real`, f);
    }
    if (s.block === "stat-hit" && (vf.value === null || vf.value === undefined || vf.value === "" || !isFinite(Number(vf.value))))
      note(`stat-hit sin "value" numérico`, f);
  }
  for (const [msg, fs] of byIssue) gate.push(`${s.id}${fs.length < wanted.length ? ` [${fs.join(", ")}]` : ""}: ${msg}`);
  // placeholders escritos a mano en la composición (escenas custom o personalizadas)
  const ph = findPlaceholder(compositionBodyText(html));
  if (ph) gate.push(`${s.id}: compositions/${s.id}.html contiene un placeholder ("${ph}")`);

  // cifras ↔ claims verificadas
  const needsClaims = NUMERIC_BLOCKS.includes(s.block) || (s.claims || []).length > 0;
  if (needsClaims) {
    if (!(s.claims || []).length) gate.push(`${s.id}: el bloque ${s.block} muestra cifras y no declara "claims": ["C-…"] (research/claims.csv)`);
    else if (!claims) gate.push(`${s.id}: declara claims ${s.claims.join(", ")} pero no existe research/claims.csv`);
    else for (const id of s.claims) {
      const p = claimProblem(claims[id]);
      if (p) gate.push(`${s.id}: claim ${id} ${p}`);
    }
  }

  // valores sueltos fuera de los tokens de marca
  for (const issue of tokenLint(html)) gate.push(`${s.id} (tokens): ${issue}`);
}

// 5) captions quemados (opcional): captions.srt|.vtt en la raíz del proyecto
const capCfg = { ...(brand.captions || {}), ...(plan.captions || {}) };
const capFile = [capCfg.file, "captions.srt", "captions.vtt"].filter(Boolean).map((f) => join(projectDir, f)).find((p) => existsSync(p));
const capBurn = capCfg.burnIn || ["portrait", "feed"];
let cues = [];
if (capFile) {
  cues = parseCaptions(readFileSync(capFile, "utf8"));
  if (!cues.length) warnings.push(`${rel(capFile)}: no encontré cues válidos (formato SRT o WebVTT)`);
  for (const w of captionWarnings(cues, capCfg)) warnings.push(`captions ${w}`);
}

function captionsHtml() {
  const items = cues
    .map((c, i) => `            <div class="cap-cue" data-i="${i}">${c.lines.map((l) => `<span class="cap-line">${esc(l)}</span>`).join("")}</div>`)
    .join("\n");
  const sets = cues.map((c, i) => `          tl.set(q[${i}], { autoAlpha: 1 }, ${c.start.toFixed(3)}); tl.set(q[${i}], { autoAlpha: 0 }, ${c.end.toFixed(3)});`).join("\n");
  return `<!doctype html>
<!-- GENERADO por scripts/build-roots.mjs desde ${esc(capFile ? capFile.split("/").pop() : "captions")}. No editar: editá el archivo de captions. -->
<html lang="${esc(brand.identity?.voice?.language || "es")}">
  <head><meta charset="UTF-8" /><title>captions</title></head>
  <body>
    <template>
      <style>
        #root { position: absolute; inset: 0; container-type: size; pointer-events: none; }
        #root .cap-wrap { display: flex; align-items: flex-end; justify-content: center; }
        #root .cap-cue { position: absolute; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; gap: 0.6cqmin; visibility: hidden; opacity: 0; }
        #root .cap-line { display: inline-block; max-width: 100%; padding: 0.5cqmin 1.6cqmin; border-radius: var(--radius-sm); background: color-mix(in srgb, var(--c-background) 82%, transparent); color: var(--c-text); font-weight: 600; text-align: center; }
      </style>
      <div id="root" data-composition-id="captions">
        <div class="bm-frame is-transparent">
          <div class="bm-safe cap-wrap bm-body">
${items}
          </div>
        </div>
      </div>
      <script>
        (function () {
          var root = document.getElementById("root");
          var q = root.querySelectorAll(".cap-cue");
          var tl = gsap.timeline({ paused: true });
${sets}
          window.__timelines["captions"] = tl;
        })();
      </script>
    </template>
  </body>
</html>
`;
}
const capComp = join(comp, "compositions", "_captions.html");
if (cues.length) writeFileSync(capComp, captionsHtml());
else rmSync(capComp, { force: true });

// 6) raíces
function rootHtml(fmt) {
  const { items, total } = timeline(plan, fmt.id, brand);
  const hosts = [];
  const fx = [];
  const move = `BRAND.ease("move")`;
  items.forEach(({ scene: s, start, duration, transition, overlap }, i) => {
    // entre escenas la transición ES la salida: sin salida animada salvo que la escena la pida explícitamente
    const vars = { exit: "none", ...s.vars, dur: duration };
    hosts.push(`      <!-- ${esc(s.id)} · ${esc(s.block)}${i > 0 && transition !== "cut" ? " · entra con " + transition : ""}${s.notes ? " · " + esc(s.notes).slice(0, 120) : ""} -->
      <div
        id="scene-${s.id}"
        class="clip"
        data-composition-id="${s.id}"
        data-composition-src="compositions/${s.id}.html"
        data-variable-values='${escAttrSingle(JSON.stringify(vars))}'
        data-start="${start}"
        data-duration="${duration}"
        data-track-index="${1 + (i % 2)}"
        data-width="${fmt.width}"
        data-height="${fmt.height}"
      ></div>`);
    if (!overlap) return;
    const prev = items[i - 1].scene.id;
    const d = overlap;
    // la escena entrante va después en el DOM: se pinta encima de la saliente
    if (transition === "crossfade") fx.push(`      tl.fromTo("#scene-${s.id}", { opacity: 0 }, { opacity: 1, duration: ${d}, ease: "none" }, ${start});`);
    if (transition === "push") {
      // lo nuevo entra desde la derecha, lo viejo sale a la izquierda (dirección consistente de la marca)
      fx.push(`      tl.fromTo("#scene-${prev}", { xPercent: 0 }, { xPercent: -100, duration: ${d}, ease: ${move} }, ${start});`);
      fx.push(`      tl.fromTo("#scene-${s.id}", { xPercent: 100 }, { xPercent: 0, duration: ${d}, ease: ${move} }, ${start});`);
    }
    if (transition === "mask-wipe") fx.push(`      tl.fromTo("#scene-${s.id}", { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: ${d}, ease: ${move} }, ${start});`);
  });
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
  const captions = cues.length && capBurn.includes(fmt.id)
    ? `      <!-- captions quemados (${esc(capFile.split("/").pop())}) -->
      <div id="captions" class="clip" data-track-kind="captions" data-composition-id="captions" data-composition-src="compositions/_captions.html" data-start="0" data-duration="${total}" data-track-index="6" data-width="${fmt.width}" data-height="${fmt.height}"></div>`
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
${captions}
${audio.join("\n")}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
${fx.join("\n")}
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

// 7) variantes por formato: copia del maestro con la raíz re-dimensionada
const summary = [`${master.id} ${master.width}×${master.height} · ${masterRoot.total}s → comp/${cues.length && capBurn.includes(master.id) ? " · captions" : ""}`];
rmSync(join(projectDir, "formats"), { recursive: true, force: true });
for (const id of wanted) {
  if (id === master.id) continue;
  const fmt = fmtById[id];
  const dir = join(projectDir, "formats", id);
  copyDir(comp, dir, (s, n) => ![".hyperframes", "renders", "node_modules"].includes(n));
  const r = rootHtml(fmt);
  writeFileSync(join(dir, "index.html"), r.html);
  summary.push(`${id} ${fmt.width}×${fmt.height} · ${r.total}s → formats/${id}/${cues.length && capBurn.includes(id) ? " · captions" : ""}`);
}

console.log(`✓ Build de "${plan.title || plan.slug}" (${plan.scenes.length} escenas · marca ${lockStr(plan.brandLock)}${isDemo ? " · DEMO" : ""})`);
summary.forEach((l) => console.log("  · " + l));
if (created.length) console.log(`  · escenas nuevas desde bloques: ${created.join(", ")}`);
for (const w of warnings) console.log(`  ⚠ ${w}`);
const uniqueGate = [...new Set(gate)];
if (uniqueGate.length) {
  const tag = strict ? "✗" : "⚠";
  console.log(`  ${strict ? "Gate de contenido (--strict): FALLA" : "Gate de contenido (en --strict esto frena el render final)"}:`);
  for (const g of uniqueGate) console.log(`  ${tag} ${g}`);
}
if (strict && uniqueGate.length) {
  console.error(`✗ ${uniqueGate.length} problema(s) de contenido. Un render final no sale con placeholders, cifras sin claim verificada ni valores fuera de marca.`);
  process.exit(1);
}
console.log("  Siguiente: npm run render -- " + rel(projectDir) + "   (o preview: cd comp && npx hyperframes preview)");
