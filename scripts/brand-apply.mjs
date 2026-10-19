#!/usr/bin/env node
// brand-apply: brands/<marca>/brand.config.json (fuente única de verdad de esa marca) → brands/<marca>/dist/
//   tokens.css · tokens.js · frame.md · brand-rules.md · MOTION.md · brand.md · remotion-theme.ts · brand-board.html
//   fonts/ · logo/ · vendor/ (gsap + CustomEase) · contrast-report.md · brand.json
// y al final regenera los índices del estudio: brands/INDEX.md, MOTION.md y brand.md de la raíz.
// Uso:
//   node scripts/brand-apply.mjs                 todas las marcas de brands/ (= --all)
//   node scripts/brand-apply.mjs <marca> [...]   solo esas marcas
//   node scripts/brand-apply.mjs [<marca>|--all] --check   validar sin escribir
//   node scripts/brand-apply.mjs --config <json> --out <dir>   prueba ad hoc (no toca brands/ ni los índices)
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, rmSync, readdirSync } from "node:fs";
import { dirname, join, resolve, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { listBrands, brandDir, configPath, distDir, writeIndex, lookSummary } from "./lib/brands.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const CHECK_ONLY = flag("--check");
const VALUE_FLAGS = ["--config", "--out", "--brand"];
const positional = args.filter((a, i) => !a.startsWith("--") && !VALUE_FLAGS.includes(args[i - 1]));

// varias marcas (o ninguna = todas): un proceso por marca y después los índices
if (!flag("--config") && !flag("--brand")) {
  const all = listBrands();
  const wanted = flag("--all") || !positional.length ? all : positional;
  const unknown = wanted.filter((b) => !all.includes(b));
  if (unknown.length) {
    console.error(`✗ Marca(s) desconocida(s): ${unknown.join(", ")}. Marcas en brands/: ${all.join(", ") || "ninguna"} (crear una: npm run brand:new -- <slug>)`);
    process.exit(1);
  }
  let failed = 0;
  for (const b of wanted) {
    const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), "--brand", b, ...(CHECK_ONLY ? ["--check"] : [])], { stdio: "inherit" });
    if (r.status !== 0) failed++;
  }
  if (!CHECK_ONLY) {
    const ix = writeIndex();
    console.log(`✓ Índices del estudio: brands/INDEX.md, MOTION.md, brand.md (${ix.brands.length} marca(s), default ${ix.default})`);
  }
  process.exit(failed ? 1 : 0);
}

const SLUG = opt("--brand", null);
const CONFIG_PATH = SLUG ? configPath(SLUG) : resolve(ROOT, opt("--config"));
const OUT = SLUG ? distDir(SLUG) : resolve(ROOT, opt("--out", join(dirname(CONFIG_PATH), "dist")));
// carpeta de la marca: logos, fuentes locales y bloques firma se resuelven contra ella
const BRAND_DIR = SLUG ? brandDir(SLUG) : dirname(CONFIG_PATH);
const rel = (p) => p.replace(ROOT + "/", "");
// ruta de un asset declarado en la config: relativa a la carpeta de la marca (o a la raíz del repo si empieza con brands/)
const assetPath = (p) => (!p ? null : p.startsWith("brands/") || p.startsWith("/") ? resolve(ROOT, p) : join(BRAND_DIR, p));

const errors = [];
const warnings = [];
const cfg = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));

// ---------- validación ----------
const HEX = /^#([0-9a-fA-F]{6})$/;
function req(path) {
  const v = path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), cfg);
  if (v === undefined || v === null || v === "") errors.push(`Falta el campo obligatorio: ${path}`);
  return v;
}
["meta.name", "meta.slug", "colors.background", "colors.text", "colors.primary", "colors.accent",
 "typography.display.family", "typography.body.family", "typography.mono.family", "typography.scale",
 "motion.durations", "motion.easings", "formats"].forEach(req);

const colorEntries = [];
(function walk(obj, prefix) {
  for (const [k, v] of Object.entries(obj || {})) {
    if (k === "rules") continue;
    const p = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") {
      if (!HEX.test(v)) errors.push(`Color inválido en colors.${p}: "${v}" (usá #RRGGBB)`);
      else colorEntries.push([p, v]);
    } else if (Array.isArray(v)) {
      v.forEach((c, i) => (HEX.test(c) ? colorEntries.push([`${p}.${i}`, c]) : errors.push(`Color inválido en colors.${p}[${i}]: "${c}"`)));
    } else if (typeof v === "object") walk(v, p);
  }
})(cfg.colors, "");

for (const [name, e] of Object.entries(cfg.motion?.easings || {})) {
  if (!Array.isArray(e) || e.length !== 4 || e.some((n) => typeof n !== "number"))
    errors.push(`Easing inválido motion.easings.${name}: usá [x1, y1, x2, y2] (cubic-bezier)`);
  else if (e[0] < 0 || e[0] > 1 || e[2] < 0 || e[2] > 1) errors.push(`Easing motion.easings.${name}: x1 y x2 deben estar entre 0 y 1`);
}
for (const f of cfg.formats || []) {
  if (!f.id || !f.width || !f.height) errors.push(`Formato incompleto: ${JSON.stringify(f)}`);
  if (f.width % 2 || f.height % 2) errors.push(`Formato ${f.id}: ancho/alto deben ser pares (H.264)`);
  if (f.root) warnings.push(`Formato ${f.id}: "root" ya no se usa (build:roots genera comp/index.html y formats/<id>/index.html); podés borrarlo.`);
}
// transiciones: solo las implementadas en build:roots (las demás van a motion.transitions.manualInNLE)
const IMPLEMENTED_TRANSITIONS = ["cut", "crossfade", "push", "mask-wipe"];
const TR = cfg.motion?.transitions || {};
for (const t of TR.allowed || []) {
  if (!IMPLEMENTED_TRANSITIONS.includes(t)) errors.push(`motion.transitions.allowed incluye "${t}", que el kit no implementa (${IMPLEMENTED_TRANSITIONS.join(", ")}). Movela a motion.transitions.manualInNLE.`);
}
if (TR.default && !(TR.allowed || IMPLEMENTED_TRANSITIONS).includes(TR.default)) errors.push(`motion.transitions.default "${TR.default}" no está en allowed.`);
if (SLUG && cfg.meta?.slug && cfg.meta.slug !== SLUG) errors.push(`meta.slug "${cfg.meta.slug}" no coincide con la carpeta brands/${SLUG}/`);

// ---------- look: lo que hace que la MISMA escena se vea distinta en cada marca ----------
// Lo consumen todos los bloques (tokens.css + BRAND.look en tokens.js + bm-motion.js).
const LOOK_ENUM = {
  background: ["grid", "glow", "grid+glow", "flat", "paper", "gradient"],
  align: ["start", "center"],
  statementAlign: ["start", "center"],
  statementSize: ["h1", "hero"],
  headlineCase: ["none", "uppercase"],
  accentStyle: ["color", "underline", "highlight", "italic"],
  textReveal: ["mask", "fade", "rise", "blur"],
  kicker: ["line", "dot", "none"],
  cards: ["outline", "filled", "none"],
  density: ["airy", "regular", "compact"],
};
const LEGACY_BG = { "subtle-grid": "grid", "gradient-glow": "grid+glow", solid: "flat" };
if (!cfg.look) warnings.push(`Sin bloque "look": uso los defaults (${cfg.layout?.background?.style ? "fondo derivado de layout.background.style" : "grilla, alineado a la izquierda, reveal por máscara"}). Definilo con /marca para que la marca tenga estilo propio.`);
const look = {
  background: LEGACY_BG[cfg.layout?.background?.style] || "grid",
  align: "start",
  statementAlign: "center",
  statementSize: "h1",
  headlineCase: "none",
  accentStyle: "color",
  textReveal: "mask",
  kicker: "line",
  cards: "filled",
  density: "regular",
  ...(cfg.look || {}),
};
for (const [k, opts] of Object.entries(LOOK_ENUM)) {
  if (!opts.includes(look[k])) errors.push(`look.${k} = "${look[k]}" no es válido (opciones: ${opts.join(" | ")})`);
}
if (look.accentStyle === "italic" && !cfg.typography?.display?.italic)
  warnings.push(`look.accentStyle "italic" sin typography.display.italic: true → el navegador sintetiza una itálica falsa. Activá la itálica real de la fuente.`);
look.summary = look.summary || lookSummary(look);
cfg.look = look;

// ---------- contraste WCAG ----------
function lum(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(a, b) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
const C = cfg.colors;
// "#RRGGBB" literal o ruta dentro de colors (p. ej. "code.text")
const colorAt = (path) => (path.startsWith("#") ? path : path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), C));
// color sobre el que se apoya el texto del acento resaltado: el que más contraste tenga contra accent
if (!C.onAccent && HEX.test(C.accent || "") && HEX.test(C.background || "") && HEX.test(C.text || ""))
  C.onAccent = ratio(C.background, C.accent) >= ratio(C.text, C.accent) ? C.background : C.text;
if (C.onAccent && !colorEntries.some(([k]) => k === "onAccent")) colorEntries.push(["onAccent", C.onAccent]);
const mix = (fg, bg, a) => "#" + [1, 3, 5].map((i) => Math.round(a * parseInt(fg.slice(i, i + 2), 16) + (1 - a) * parseInt(bg.slice(i, i + 2), 16)).toString(16).padStart(2, "0")).join("");
// intensidad de los fondos con color (glow / gradient): se usa en tokens.css y para chequear el peor caso de contraste
const BG_ALPHA = { glow: [0.18, 0.12], gradient: [0.5, 0.38], gradientHero: [0.68, 0.52] };
const [hg1, hg2] = C.gradients?.hero || [C.primary, C.secondary || C.primary];
const lookPairs = [];
if (look.accentStyle === "highlight") lookPairs.push(["onAccent", "accent", 4.5, "Texto sobre el resaltado de acento (look.accentStyle highlight)"]);
if (look.background === "gradient" && HEX.test(hg1 || "") && HEX.test(hg2 || "")) {
  const hot1 = mix(hg1, C.background, BG_ALPHA.gradientHero[0]);
  const hot2 = mix(hg2, C.background, BG_ALPHA.gradientHero[1]);
  lookPairs.push([C.text, hot1, 4.5, "Texto sobre el punto más intenso del gradiente (gradients.hero[0])"]);
  lookPairs.push([C.text, hot2, 4.5, "Texto sobre el punto más intenso del gradiente (gradients.hero[1])"]);
  lookPairs.push([C.textMuted || C.text, mix(hg1, C.background, BG_ALPHA.gradient[0]), 4.5, "Texto secundario sobre el gradiente de escena"]);
}
// [frente, fondo, mínimo, uso]. Texto ≥ 4,5:1 (WCAG 1.4.3); texto grande, íconos y marcas de datos ≥ 3:1 (1.4.11).
const pairs = [
  ["text", "background", 7, "Texto principal sobre fondo (objetivo AAA 7:1 para video)"],
  ["text", "surface", 4.5, "Texto sobre tarjetas"],
  ["text", "surfaceAlt", 4.5, "Texto sobre chips / superficie alternativa"],
  ["textMuted", "background", 4.5, "Texto secundario sobre fondo"],
  ["textMuted", "surface", 4.5, "Texto secundario sobre tarjetas"],
  ["primary", "background", 3, "Primario como texto grande/ícono"],
  ["primary", "surface", 3, "Primario sobre tarjetas"],
  ["accent", "background", 3, "Acento como texto grande/dato"],
  ["accent", "surface", 3, "Acento sobre tarjetas"],
  ["secondary", "background", 3, "Secundario como texto grande/ícono"],
  ["danger", "background", 3, "Estado de error (ícono/texto grande)"],
  ["success", "background", 3, "Estado OK (ícono/texto grande)"],
  ["onPrimary", "primary", 4.5, "Texto sobre botón/banda primaria"],
  ["code.text", "code.background", 4.5, "Código: texto"],
  ["code.comment", "code.background", 4.5, "Código: comentarios"],
  ["code.keyword", "code.background", 4.5, "Código: keywords"],
  ["code.string", "code.background", 4.5, "Código: strings"],
  ["code.number", "code.background", 4.5, "Código: números"],
  ["code.function", "code.background", 4.5, "Código: funciones"],
  ["code.text", "code.background", 4.5, "Código atenuado al 80 % (líneas no resaltadas)", 0.8],
  ["code.comment", "code.background", 4.5, "Comentario atenuado al 80 % (líneas no resaltadas)", 0.8],
  ...(C.dataViz || []).map((_, i) => [`dataViz.${i}`, "background", 3, `Data viz serie ${i} sobre fondo (marca gráfica)`]),
  ...lookPairs,
];
const contrastRows = [];
let contrastChecked = 0;
let contrastFailed = 0;
// alpha < 1: el frente se mezcla con el fondo (opacidad aplicada en un bloque)
const blend = (fg, bg, alpha) => "#" + [1, 3, 5].map((i) => Math.round(alpha * parseInt(fg.slice(i, i + 2), 16) + (1 - alpha) * parseInt(bg.slice(i, i + 2), 16)).toString(16).padStart(2, "0")).join("");
for (const [fg, bg, min, label, alpha = 1] of pairs) {
  const b = colorAt(bg);
  const a = colorAt(fg) && b ? blend(colorAt(fg), b, alpha) : undefined;
  if (!a || !b) continue;
  contrastChecked++;
  const r = ratio(a, b);
  const ok = r >= min;
  if (!ok) contrastFailed++;
  contrastRows.push(`| ${label} | \`${fg}\` ${a} / \`${bg}\` ${b} | ${r.toFixed(2)}:1 | ≥ ${min}:1 | ${ok ? "OK" : "FALLA"} |`);
  if (!ok) warnings.push(`Contraste bajo: ${fg} sobre ${bg} = ${r.toFixed(2)}:1 (mínimo ${min}:1) — ${label}`);
}

// ---------- reglas de motion (sanity) ----------
const D = cfg.motion.durations;
if (D.exit && D.enter && D.exit > D.enter) warnings.push("motion.durations.exit > enter: las salidas deberían ser más cortas que las entradas (~60%).");
if (D.enter && (D.enter < 250 || D.enter > 1200)) warnings.push(`motion.durations.enter=${D.enter}ms fuera del rango típico para video (300-900ms).`);
const RD = cfg.motion.reading || {};
const spw = RD.secondsPerWord ?? (RD.wordsPerSecond ? 1 / RD.wordsPerSecond : 0.35);
const wps = Math.round((1 / spw) * 100) / 100;
const cps = RD.charsPerSecond ?? 15;
const holdRule = `max(${(RD.minHoldMs ?? 1500) / 1000} s; ${(RD.baseMs ?? RD.extraHoldMs ?? 800) / 1000} s + ${spw} s × palabras; caracteres / ${cps})`;
const staggerMax = cfg.motion.staggerGroupMaxMs ?? 500;
const wordsPerSecond = cfg.audio?.voice?.wordsPerSecond ?? 2.2;
const voRule = `palabras netas de VO = duración (s) × ${String(wordsPerSecond).replace(".", ",")} (≈${Math.round((wordsPerSecond * 60) / 10) * 10} para 60 s)`;
if (spw < 0.25) warnings.push(`motion.reading.secondsPerWord=${spw} es demasiado rápido para lectura en pantalla (0.3-0.4 recomendado).`);

function report() {
  for (const w of warnings) console.warn(`  ⚠  ${w}`);
  for (const e of errors) console.error(`  ✗  ${e}`);
}
if (errors.length) {
  console.error(`\n✗ brand.config.json tiene ${errors.length} error(es):`);
  report();
  process.exit(1);
}
if (CHECK_ONLY) {
  console.log(`✓ Config válida (${warnings.length} advertencia(s)) · contraste: ${contrastChecked - contrastFailed}/${contrastChecked} pares OK`);
  report();
  process.exit(0);
}

// ---------- salida ----------
rmSync(OUT, { recursive: true, force: true });
for (const d of ["fonts", "logo", "vendor"]) mkdirSync(join(OUT, d), { recursive: true });

// fuentes
const fontFaces = [];
const fontFiles = [];
for (const role of ["display", "body", "mono"]) {
  const t = cfg.typography[role];
  const weights = t.weights || [400];
  for (const w of weights) {
    let src;
    if (t.source === "fontsource") {
      const pkgDir = join(ROOT, "node_modules", t.package);
      const slug = t.package.split("/").pop();
      src = join(pkgDir, "files", `${slug}-latin-${w}-normal.woff2`);
      if (!existsSync(src)) { errors.push(`No encuentro ${src}. ¿Corriste npm install? ¿El peso ${w} existe?`); continue; }
      const extSrc = join(pkgDir, "files", `${slug}-latin-ext-${w}-normal.woff2`);
      const outName = `${slug}-${w}.woff2`;
      copyFileSync(src, join(OUT, "fonts", outName));
      fontFiles.push(outName);
      fontFaces.push({ family: t.family, weight: w, file: outName });
      if (existsSync(extSrc)) {
        const extName = `${slug}-ext-${w}.woff2`;
        copyFileSync(extSrc, join(OUT, "fonts", extName));
        fontFaces.push({ family: t.family, weight: w, file: extName, ext: true });
      }
      // itálica real (p. ej. para look.accentStyle "italic"): typography.<rol>.italic = true
      if (t.italic) {
        const itSrc = join(pkgDir, "files", `${slug}-latin-${w}-italic.woff2`);
        if (!existsSync(itSrc)) { errors.push(`typography.${role}.italic: ${t.package} no trae itálica para el peso ${w}`); continue; }
        copyFileSync(itSrc, join(OUT, "fonts", `${slug}-${w}-italic.woff2`));
        fontFaces.push({ family: t.family, weight: w, file: `${slug}-${w}-italic.woff2`, italic: true });
        const itExt = join(pkgDir, "files", `${slug}-latin-ext-${w}-italic.woff2`);
        if (existsSync(itExt)) {
          copyFileSync(itExt, join(OUT, "fonts", `${slug}-ext-${w}-italic.woff2`));
          fontFaces.push({ family: t.family, weight: w, file: `${slug}-ext-${w}-italic.woff2`, italic: true, ext: true });
        }
      }
    } else {
      // source: "local" → archivos en brands/<marca>/fonts/, mapeados por peso en t.files { "400": "MiFuente-Regular.woff2" }
      const file = t.files?.[String(w)];
      src = file && join(BRAND_DIR, "fonts", file);
      if (!src || !existsSync(src)) { errors.push(`Fuente local faltante para ${role} ${w}: definí typography.${role}.files["${w}"] y copiá el archivo a ${rel(join(BRAND_DIR, "fonts"))}/`); continue; }
      copyFileSync(src, join(OUT, "fonts", basename(src)));
      fontFiles.push(basename(src));
      fontFaces.push({ family: t.family, weight: w, file: basename(src) });
    }
  }
}
if (errors.length) { report(); process.exit(1); }

// logos
const logoMap = {};
for (const key of ["primary", "mark", "onDark", "onLight"]) {
  const p = cfg.logo?.[key];
  if (!p) continue;
  const abs = assetPath(p);
  if (!existsSync(abs)) { warnings.push(`Logo ${key} no encontrado: ${p} (rutas relativas a ${rel(BRAND_DIR)}/)`); continue; }
  const name = `${key}${extname(abs)}`;
  copyFileSync(abs, join(OUT, "logo", name));
  logoMap[key] = `logo/${name}`;
}
const inlineMark = cfg.logo?.mark && existsSync(assetPath(cfg.logo.mark)) ? readFileSync(assetPath(cfg.logo.mark), "utf8") : "";
const inlineLogo = cfg.logo?.primary && existsSync(assetPath(cfg.logo.primary)) ? readFileSync(assetPath(cfg.logo.primary), "utf8") : "";

// vendor GSAP (local: renders deterministas y offline, sin CDN)
for (const f of ["gsap.min.js", "CustomEase.min.js"]) {
  const src = join(ROOT, "node_modules", "gsap", "dist", f);
  if (!existsSync(src)) { console.error(`✗ Falta ${src}. Corré npm install.`); process.exit(1); }
  copyFileSync(src, join(OUT, "vendor", f));
}

// ---------- tokens.css ----------
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase().replace(/\./g, "-");
const S = cfg.typography.scale;
const T = cfg.typography;
const L = cfg.layout || {};
const ms = (v) => `${v}ms`;
const bez = (e) => `cubic-bezier(${e.join(", ")})`;
const colorVars = colorEntries.map(([k, v]) => `  --c-${kebab(k)}: ${v};`).join("\n");
const sizeVars = Object.entries(S).filter(([k, v]) => typeof v === "number" && !k.endsWith("Multiplier")).map(([k, v]) => `  --fs-${k}: ${v}${S.unit || "cqmin"};`).join("\n");
const durVars = Object.entries(cfg.motion.durations).map(([k, v]) => `  --dur-${k}: ${ms(v)};`).join("\n");
const easeVars = Object.entries(cfg.motion.easings).map(([k, v]) => `  --ease-${k}: ${bez(v)};`).join("\n");
const radiusU = L.radius?.unit || "cqmin";
const radiusVars = Object.entries(L.radius || {}).filter(([k]) => k !== "unit").map(([k, v]) => `  --radius-${k}: ${v}${radiusU};`).join("\n");
const sm = L.safeMarginPct || { landscape: 6, portrait: 8, square: 7 };
const zoneKey = (cfg.formats.find((f) => f.id === "portrait") || {}).safeZone;
const zone = (L.platformSafeZones || {})[zoneKey] || { topPct: sm.portrait, bottomPct: sm.portrait, rightPct: sm.portrait };
const gridOpacity = L.background?.gridOpacity ?? 0.06;
const [g1, g2] = cfg.colors.gradients?.hero || [C.primary, C.secondary || C.primary];
const isLightBg = lum(C.background) > 0.4;
const glowK = isLightBg ? 0.4 : 1; // en fondos claros el glow se reduce: si no, ensucia
const hexA = (hex, a) => `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}, ${a})`;

// ---------- CSS del look (fondo, alineación, caja, acento, kicker, tarjetas, densidad, reveal) ----------
const centered = look.align === "center";
const space = { airy: 1.3, regular: 1, compact: 0.8 }[look.density] || 1;
const grain = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='7' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.25 0 0 0 0 0.2 0 0 0 0 0.15 0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`;
const gridLines = `background-image: linear-gradient(${hexA(C.text, gridOpacity)} 1px, transparent 1px), linear-gradient(90deg, ${hexA(C.text, gridOpacity)} 1px, transparent 1px); background-size: 6cqmin 6cqmin; background-position: center;`;
const glowFill = (k = 1) => `background: radial-gradient(40% 35% at 70% 30%, ${hexA(g1, BG_ALPHA.glow[0] * glowK * k)}, transparent 70%), radial-gradient(35% 30% at 25% 80%, ${hexA(g2, BG_ALPHA.glow[1] * glowK * k)}, transparent 70%);`;
const gradFill = (a1, a2) => `background: radial-gradient(85% 70% at 88% 8%, ${hexA(g1, a1)}, transparent 70%), radial-gradient(75% 60% at 8% 96%, ${hexA(g2, a2)}, transparent 70%);`;
const BG_CSS = {
  grid: `.bm-bg::before { inset: 0; ${gridLines} }`,
  glow: `.bm-bg::after { inset: -20%; ${glowFill()} }\n.bm-bg.is-hero::after, .bm-bg.glow::after { ${glowFill(1.4)} }`,
  "grid+glow": `.bm-bg::before { inset: 0; ${gridLines} }\n.bm-bg.is-hero::after, .bm-bg.glow::after { inset: -20%; ${glowFill()} }`,
  flat: ``,
  // papel: grano determinista (feTurbulence con seed fija) + filete de página
  paper: `.bm-bg::before { inset: 0; background-image: url("data:image/svg+xml,${encodeURIComponent(grain)}"); background-size: 34cqmin 34cqmin; opacity: ${isLightBg ? 0.03 : 0.05}; mix-blend-mode: ${isLightBg ? "multiply" : "screen"}; }
.bm-bg::after { inset: 3cqmin; border: var(--stroke) solid ${hexA(C.border || C.textMuted, 0.9)}; }
.bm-bg.is-hero::after, .bm-bg.glow::after { inset: 3cqmin; border-width: calc(var(--stroke) * 2); box-shadow: inset 0 0 0 1.2cqmin ${hexA(C.background, 1)}, inset 0 0 0 calc(1.2cqmin + var(--stroke)) ${hexA(C.border || C.textMuted, 0.9)}; }`,
  gradient: `.bm-bg::after { inset: 0; ${gradFill(BG_ALPHA.gradient[0], BG_ALPHA.gradient[1])} }
.bm-bg.is-hero::after, .bm-bg.glow::after { ${gradFill(BG_ALPHA.gradientHero[0], BG_ALPHA.gradientHero[1])} }`,
}[look.background];
const ACCENT_CSS = {
  color: `.bm-accent { color: var(--c-accent); font-style: normal; }`,
  underline: `.bm-accent { color: inherit; font-style: normal; background-image: linear-gradient(var(--c-accent), var(--c-accent)); background-repeat: no-repeat; background-position: 0 94%; background-size: 100% 0.1em; padding-bottom: 0.03em; }`,
  highlight: `.bm-accent { color: var(--c-on-accent); font-style: normal; background-color: var(--c-accent); background-image: linear-gradient(var(--c-accent), var(--c-accent)); background-repeat: no-repeat; background-position: 0 50%; background-size: 100% 100%; padding: 0 0.1em; -webkit-box-decoration-break: clone; box-decoration-break: clone; }`,
  italic: `.bm-accent { color: var(--c-accent); font-style: italic; }`,
}[look.accentStyle];
const KICKER_CSS = {
  line: `.bm-kicker-deco { flex: 0 0 auto; width: 9cqmin; height: 0.35cqmin; background: var(--c-primary); transform-origin: left center; }`,
  dot: `.bm-kicker-deco { flex: 0 0 auto; width: 1.5cqmin; height: 1.5cqmin; border-radius: 50%; background: var(--c-primary); }`,
  none: `.bm-kicker-deco { display: none; }`,
}[look.kicker];
const CARD_CSS = {
  filled: `.bm-card { background: var(--c-surface); border: var(--stroke) solid var(--c-border); border-radius: var(--radius-lg); }`,
  outline: `.bm-card { background: transparent; border: calc(var(--stroke) * 1.6) solid var(--c-border); border-radius: var(--radius-lg); }`,
  none: `.bm-card { background: transparent; border: 0; border-radius: 0; }`,
}[look.cards];
const upper = look.headlineCase === "uppercase";
const lookCss = `/* ===== look: ${look.summary} ===== */
:root {
  --look-items: ${centered ? "center" : "flex-start"};
  --look-text-align: ${centered ? "center" : "left"};
  --look-origin: ${centered ? "center center" : "left center"};
  --look-statement-items: ${look.statementAlign === "center" ? "center" : "flex-start"};
  --look-statement-text-align: ${look.statementAlign === "center" ? "center" : "left"};
  --look-space: ${space};
}
.bm-frame { --look: "${look.background} ${look.align} ${look.accentStyle} ${look.textReveal}"; }
/* fondo de marca: .bm-bg = textura del look · .is-hero = apertura/cierre (más intensa) · .is-plain = solo color */
.bm-bg { position: absolute; inset: 0; background: var(--c-background); overflow: hidden; }
.bm-bg::before, .bm-bg::after { content: ""; position: absolute; pointer-events: none; }
${BG_CSS}
.bm-bg.is-plain::before, .bm-bg.is-plain::after, .bm-bg.solid::before, .bm-bg.solid::after { display: none; }
/* caja de titulares */
${upper ? `/* las citas quedan en caja normal: una cita en mayúsculas grita y se lee peor */
.bm-hero, .bm-h1, .bm-h2:not(blockquote) { text-transform: uppercase; letter-spacing: ${T.display.trackingUpper || "-0.01em"}; line-height: ${T.display.lineHeightUpper || 1}; }` : ""}
/* acento (*palabra*): ${look.accentStyle} */
${ACCENT_CSS}
/* decoración del kicker: ${look.kicker} */
${KICKER_CSS}
/* tarjetas: ${look.cards} */
${CARD_CSS}
`;

const tokensCss = `/* ${cfg.meta.name} — tokens de marca para motion (GENERADO por scripts/brand-apply.mjs — no editar a mano) */
/* Fuente: brands/${cfg.meta.slug}/brand.config.json v${cfg.meta.version} · look: ${look.summary} */
${fontFaces.map((f) => `@font-face { font-family: "${f.family}"; src: url("fonts/${f.file}") format("woff2"); font-weight: ${f.weight}; font-style: ${f.italic ? "italic" : "normal"}; font-display: block;${f.ext ? " unicode-range: U+0100-024F, U+1E00-1EFF, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;" : ""} }`).join("\n")}

:root {
  /* color */
${colorVars}
  /* tipografía */
  --font-display: "${T.display.family}", ${T.display.fallback || "sans-serif"};
  --font-body: "${T.body.family}", ${T.body.fallback || "sans-serif"};
  --font-mono: "${T.mono.family}", ${T.mono.fallback || "monospace"};
  --track-display: ${T.display.tracking || "0"};
  --track-body: ${T.body.tracking || "0"};
  --lh-display: ${T.display.lineHeight || 1.05};
  --lh-body: ${T.body.lineHeight || 1.3};
  --lh-mono: ${T.mono.lineHeight || 1.5};
  --w-display: ${Math.max(...T.display.weights)};
  --w-display-light: ${Math.min(...T.display.weights)};
  /* escala (en ${S.unit || "cqmin"}: % del lado corto del frame) */
${sizeVars}
  /* motion */
${durVars}
${easeVars}
  /* layout */
${radiusVars}
  --stroke: ${L.stroke ?? 0.25}cqmin;
  /* chrome de ventanas de código/terminal: deriva de la paleta de código, no de la UI (funciona en marcas claras y oscuras) */
  --c-code-line: color-mix(in srgb, var(--c-code-text) 14%, transparent);
  --c-code-chrome: color-mix(in srgb, var(--c-code-text) 55%, var(--c-code-background));
  --safe-x: ${sm.landscape}cqw;
  --safe-top: ${sm.landscape}cqh;
  --safe-bottom: ${sm.landscape}cqh;
  --safe-right: ${sm.landscape}cqw;
}

/* Contrato de theme de HyperFrames (themes/CONTRACT.md, 18 tokens): los bloques y componentes del catálogo
   oficial (npx hyperframes add …) consumen estas variables, así que heredan la marca sin tocarlos. */
:root {
  --bg: ${C.background};
  --fg: ${C.text};
  --muted: ${C.textMuted || C.text};
  --surface: ${C.surface || C.background};
  --border: ${C.border || C.textMuted || C.text};
  --brand: ${C.primary};
  --accent: ${C.accent};
  --accent-2: ${C.secondary || C.primary};
  --radius: var(--radius-md, 1.5cqmin);
  --space-1: 1.2cqmin;
  --space-2: 2.4cqmin;
  --space-3: 4cqmin;
  --dur-beat: ${(cfg.motion.durations.enter || 400) / 1000}s;
  --ease-emphasis: ${bez(cfg.motion.easings.emphasized || cfg.motion.easings.standard)};
}

/* Cada escena es un contenedor "frame": las unidades cq* y las container queries se resuelven contra él. */
.bm-frame { position: absolute; inset: 0; overflow: hidden; container: frame / size; background: var(--c-background); color: var(--c-text); font-family: var(--font-body); }
.bm-frame.is-transparent { background: transparent; }
/* 9:16 (aspect < 0,7): zonas de UI de Reels/Shorts/TikTok + tipografía ×portraitMultiplier */
@container frame (aspect-ratio < 0.7) {
  .bm-safe { --safe-x: ${Math.max(zone.leftPct || sm.portrait, sm.portrait)}cqw; --safe-top: ${zone.topPct}cqh; --safe-bottom: ${zone.bottomPct}cqh; --safe-right: ${Math.max(zone.rightPct || sm.portrait, sm.portrait)}cqw;
${Object.entries(S).filter(([k, v]) => typeof v === "number" && !k.endsWith("Multiplier")).map(([k, v]) => `    --fs-${k}: ${Math.round(v * (S.portraitMultiplier || 1) * 100) / 100}${S.unit || "cqmin"};`).join("\n")}
  }
}
/* 4:5 feed (0,7 ≤ aspect ≤ 0,85): sin UI encima, márgenes de feed + tipografía ×feedMultiplier */
@container frame (aspect-ratio >= 0.7) and (aspect-ratio <= 0.85) {
  .bm-safe { --safe-x: ${sm.feed ?? sm.square}cqw; --safe-top: ${sm.feed ?? sm.square}cqh; --safe-bottom: ${sm.feed ?? sm.square}cqh; --safe-right: ${sm.feed ?? sm.square}cqw;
${Object.entries(S).filter(([k, v]) => typeof v === "number" && !k.endsWith("Multiplier")).map(([k, v]) => `    --fs-${k}: ${Math.round(v * (S.feedMultiplier || 1) * 100) / 100}${S.unit || "cqmin"};`).join("\n")}
  }
}
@container frame (aspect-ratio > 0.85) and (aspect-ratio < 1.2) {
  .bm-safe { --safe-x: ${sm.square}cqw; --safe-top: ${sm.square}cqh; --safe-bottom: ${sm.square}cqh; --safe-right: ${sm.square}cqw; }
}
.bm-safe { position: absolute; top: var(--safe-top); bottom: var(--safe-bottom); left: var(--safe-x); right: var(--safe-right); }


/* tipografía */
.bm-hero, .bm-h1, .bm-h2, .bm-h3 { font-family: var(--font-display); font-weight: var(--w-display); letter-spacing: var(--track-display); line-height: var(--lh-display); }
.bm-hero { font-size: var(--fs-hero); }
.bm-h1 { font-size: var(--fs-h1); }
.bm-h2 { font-size: var(--fs-h2); }
.bm-h3 { font-size: var(--fs-h3); }
.bm-body { font-size: var(--fs-body); line-height: var(--lh-body); letter-spacing: var(--track-body); }
.bm-caption { font-size: var(--fs-caption); line-height: 1.25; }
.bm-label { font-family: var(--font-mono); font-size: var(--fs-label); letter-spacing: 0.08em; ${T.rules?.kickerUppercase ? "text-transform: uppercase;" : ""} color: var(--c-text-muted); }
.bm-kicker { font-family: var(--font-mono); font-size: var(--fs-label); letter-spacing: 0.14em; ${T.rules?.kickerUppercase ? "text-transform: uppercase;" : ""} color: var(--c-primary); }
.bm-code { font-family: var(--font-mono); font-size: var(--fs-code); line-height: var(--lh-mono); font-variant-ligatures: none; }
.bm-muted { color: var(--c-text-muted); }
.bm-primary { color: var(--c-primary); }
.bm-num { font-variant-numeric: tabular-nums; }

/* máscaras para reveals por línea/palabra: animar el hijo con yPercent */
.bm-line { display: block; overflow: ${look.textReveal === "mask" ? "hidden" : "visible"}; padding-bottom: 0.08em; margin-bottom: -0.08em; }
.bm-line > span { display: inline-block; }
.bm-word { display: inline-block; white-space: pre; }

/* componentes */
.bm-chip { display: inline-flex; align-items: center; gap: 1cqmin; padding: 0.8cqmin 1.8cqmin; border-radius: 999px; background: var(--c-surface-alt); font-family: var(--font-mono); font-size: var(--fs-label); color: var(--c-text); }
.bm-rule { height: var(--stroke); background: var(--c-border); }
.bm-logo svg, .bm-logo img { display: block; height: 100%; width: auto; }

${lookCss}`;

// ---------- tokens.js ----------
const brandJs = {
  name: cfg.meta.name,
  slug: cfg.meta.slug,
  version: cfg.meta.version,
  colors: cfg.colors,
  fonts: { display: T.display.family, body: T.body.family, mono: T.mono.family },
  motion: cfg.motion,
  captions: cfg.captions,
  look: look,
  logo: { ...logoMap, svgMark: inlineMark, svgPrimary: inlineLogo },
};
const tokensJs = `/* ${cfg.meta.name} — tokens JS para GSAP (GENERADO por scripts/brand-apply.mjs — no editar a mano)
   Requiere cargar antes: vendor/gsap.min.js y vendor/CustomEase.min.js
   API:
     BRAND.ease("enter")      → nombre de ease registrado ("brand.enter")
     BRAND.dur("enter")       → segundos (0.6)
     BRAND.stagger("words")   → segundos entre elementos
     BRAND.stagger("items", n)→ idem, acotado para que el grupo de n elementos dure ≤ staggerGroupMaxMs
     BRAND.hold("texto...")   → segundos mínimos de lectura para ese texto
     BRAND.color("accent")    → hex
     BRAND.u(el)              → px por 1cqmin del frame que contiene a el
     BRAND.logo.svgMark       → SVG inline del isotipo
*/
(function () {
  var B = ${JSON.stringify(brandJs, null, 2)};
  var ok = typeof window !== "undefined" && window.gsap && window.CustomEase;
  if (ok) {
    window.gsap.registerPlugin(window.CustomEase);
    Object.keys(B.motion.easings).forEach(function (k) {
      window.CustomEase.create("brand." + k, B.motion.easings[k].join(","));
    });
  }
  B.ease = function (name) {
    if (!B.motion.easings[name]) throw new Error("BRAND.ease: easing desconocido '" + name + "'");
    return ok ? "brand." + name : "power2.out";
  };
  B.dur = function (name) {
    var v = B.motion.durations[name];
    if (v == null) throw new Error("BRAND.dur: duración desconocida '" + name + "'");
    return v / 1000;
  };
  B.stagger = function (name, n) {
    var v = B.motion.stagger[name];
    if (v == null) throw new Error("BRAND.stagger: stagger desconocido '" + name + "'");
    var max = B.motion.staggerGroupMaxMs || 500;
    if (n > 1) v = Math.min(v, max / n);
    return v / 1000;
  };
  B.hold = function (text) {
    var r = B.motion.reading || {};
    var spw = r.secondsPerWord || (r.wordsPerSecond ? 1 / r.wordsPerSecond : 0.35);
    var base = (r.baseMs != null ? r.baseMs : r.extraHoldMs != null ? r.extraHoldMs : 800) / 1000;
    var t = String(text || "").replace(/[|*]/g, " ").replace(/\\s+/g, " ").trim();
    var words = t ? t.split(" ").length : 0;
    return Math.max((r.minHoldMs || 1500) / 1000, base + words * spw, t.length / (r.charsPerSecond || 15));
  };
  B.color = function (path) {
    return path.split(".").reduce(function (o, k) { return o == null ? undefined : o[k]; }, B.colors);
  };
  B.u = function (el) {
    var frame = el && el.closest ? el.closest(".bm-frame") : null;
    var r = (frame || document.documentElement).getBoundingClientRect();
    return Math.min(r.width, r.height) / 100;
  };
  window.BRAND = B;
})();
`;

// ---------- descripción del look (va a brand-rules, MOTION.md, frame.md y el board) ----------
const LOOK_DOC = [
  ["background", `Fondo: **${look.background}** — los bloques usan \`.bm-bg\` (textura del look), \`.bm-bg.is-hero\` en aperturas y cierres, \`.bm-bg.is-plain\` cuando la escena necesita silencio visual.`],
  ["align", `Composición: **${look.align === "center" ? "centrada" : "alineada al inicio (izquierda)"}** (\`var(--look-items)\` / \`var(--look-text-align)\`); afirmaciones (kinetic-statement): **${look.statementAlign}**, tamaño ${look.statementSize}.`],
  ["headlineCase", `Titulares: **${look.headlineCase === "uppercase" ? "MAYÚSCULAS" : "caja normal"}**.`],
  ["accentStyle", `Acento (\`*palabra*\`): **${look.accentStyle}** (\`.bm-accent\`; se anima con \`BM.accentIn\`).`],
  ["textReveal", `Entrada de texto: **${look.textReveal}** (\`BM.revealLines\` / \`BM.revealWords\` la aplican solos).`],
  ["kicker", `Kicker: decoración **${look.kicker}** (\`.bm-kicker-deco\`, \`BM.decoIn\`).`],
  ["cards", `Tarjetas (\`.bm-card\`: pasos, comparaciones): **${look.cards}**.`],
  ["density", `Densidad: **${look.density}** (\`var(--look-space)\` = ${space} multiplica los espacios de los bloques).`],
];
const lookRules = LOOK_DOC.map(([, d]) => `- ${d}`).join("\n");

// ---------- frame.md (spec de diseño que leen las skills de HyperFrames) ----------
const yamlColors = colorEntries.map(([k, v]) => `  ${kebab(k)}: "${v}"`).join("\n");
const typoLine = (name, role, size, weight, extra = "") =>
  `  ${name}: { fontFamily: "${T[role].family}", cqmin: ${size}, weight: ${weight}, lineHeight: ${T[role].lineHeight}, tracking: "${T[role].tracking}"${extra} }`;
const frameMd = `---
version: 1
name: ${cfg.meta.name} — Frame (capa de video)
description: >
  Sistema de diseño a escala de frame para ${cfg.meta.name}. Generado desde brands/${cfg.meta.slug}/brand.config.json
  (v${cfg.meta.version}). Los átomos (hex, familias, pesos, motion tokens) son sagrados; la composición es libre.
unit: el frame — ${cfg.formats.map((f) => `${f.width}×${f.height} (${f.id})`).join(", ")}
principle: átomos sagrados · composición libre · los números salen del guion verificado

colors:
${yamlColors}

typography:
${typoLine("hero", "display", S.hero, Math.max(...T.display.weights))}
${typoLine("h1", "display", S.h1, Math.max(...T.display.weights))}
${typoLine("h2", "display", S.h2, Math.max(...T.display.weights))}
${typoLine("h3", "display", S.h3, Math.min(...T.display.weights))}
${typoLine("body", "body", S.body, 400)}
${typoLine("caption", "body", S.caption, 500)}
${typoLine("kicker", "mono", S.label, 500, ", upper: true")}
${typoLine("code", "mono", S.code, 400)}

spacing:
  safe-landscape: "${sm.landscape}%"
  safe-portrait: "${sm.portrait}% + zonas UI de plataforma (top ${zone.topPct}%, bottom ${zone.bottomPct}%)"
  safe-square: "${sm.square}%"
  safe-feed: "${sm.feed ?? sm.square}%"
${Object.entries(L.radius || {}).filter(([k]) => k !== "unit").map(([k, v]) => `  radius-${k}: "${v}cqmin"`).join("\n")}

look:
${Object.entries(look).filter(([k]) => k !== "summary").map(([k, v]) => `  ${k}: ${v}`).join("\n")}

motion:
  personality: ${cfg.motion.personality}
  durations-ms: { ${Object.entries(cfg.motion.durations).map(([k, v]) => `${k}: ${v}`).join(", ")} }
  easings: { ${Object.entries(cfg.motion.easings).map(([k, v]) => `${k}: "cubic-bezier(${v.join(",")})"`).join(", ")} }
  stagger-ms: { ${Object.entries(cfg.motion.stagger).map(([k, v]) => `${k}: ${v}`).join(", ")}, group-max: ${staggerMax} }
  reading: "${holdRule}"
  transitions-allowed: [${(cfg.motion.transitions?.allowed || []).join(", ")}]
  transitions-manual-nle: [${(cfg.motion.transitions?.manualInNLE || []).join(", ")}]

components:
  card:
    backgroundColor: "{colors.surface}"
    border: "stroke solid {colors.border}"
    rounded: "{spacing.radius-lg}"
    description: "Contenedor de contenido. Sin sombras pesadas ni glow."
  kicker:
    typography: "{typography.kicker}"
    textColor: "{colors.primary}"
    description: "Etiqueta de 1-4 palabras sobre el titular. Mono, mayúsculas, tracking amplio."
  accent-moment:
    textColor: "{colors.accent}"
    description: "El ÚNICO momento de acento por frame: el dato, la palabra clave o el CTA."
  code-surface:
    backgroundColor: "{colors.code-background}"
    textColor: "{colors.code-text}"
    description: "Ventana de código/terminal. Sintaxis: keyword {colors.code-keyword}, string {colors.code-string}, number {colors.code-number}."
---

# ${cfg.meta.name} — Frame

## Overview

${cfg.identity?.mission || ""}

Personalidad: ${(cfg.identity?.personality || []).join(" · ")}. Audiencia: ${cfg.identity?.audience || "—"}.

## Colors

Fondo \`${C.background}\`, texto \`${C.text}\`, primario \`${C.primary}\`, acento \`${C.accent}\` (racionado: ${cfg.colors.rules?.maxAccentMomentsPerFrame ?? 1} momento por frame). ${cfg.colors.rules?.notes || ""}

## Typography

- Display: **${T.display.family}** (${T.display.weights.join("/")}) — titulares, números grandes. Caja: ${T.display.case}.
- Body: **${T.body.family}** — texto, subtítulos, captions.
- Mono: **${T.mono.family}** — kickers, labels, código, terminal.
- Máximo ${T.rules?.maxWordsPerLine ?? 7} palabras por línea y ${T.rules?.maxLinesPerFrame ?? 3} líneas por frame. Nada por debajo de ${T.rules?.minSizePx1080 ?? 28}px a 1080p.

## Motion

${(cfg.motion.principles || []).map((p) => `- ${p}`).join("\n")}

Prohibido: ${(cfg.motion.forbidden || []).join("; ")}.

## Do's and Don'ts

${(cfg.identity?.voice?.do || []).map((d) => `- ✓ ${d}`).join("\n")}
${(cfg.identity?.voice?.dont || []).map((d) => `- ✗ ${d}`).join("\n")}
${(cfg.logo?.dont || []).map((d) => `- ✗ Logo: ${d}`).join("\n")}
`;

// ---------- brand-rules.md (lo que lee Claude vía CLAUDE.md) ----------
const brandRules = `# Reglas de marca — ${cfg.meta.name} (\`brands/${cfg.meta.slug}\`, GENERADO desde brand.config.json v${cfg.meta.version})

> No edites este archivo: editá \`brands/${cfg.meta.slug}/brand.config.json\` (o usá /marca) y corré \`npm run brand -- ${cfg.meta.slug}\`. Dirección de arte en prosa: \`brands/${cfg.meta.slug}/LOOK.md\`.

## Identidad y voz
- Misión: ${cfg.identity?.mission || "—"}
- Audiencia: ${cfg.identity?.audience || "—"}
- Personalidad: ${(cfg.identity?.personality || []).join(", ")}
- Idioma: ${cfg.identity?.voice?.language || "es"} (tratamiento: ${cfg.identity?.voice?.register || "—"}). Tono: ${cfg.identity?.voice?.tone || "—"}
- Sí: ${(cfg.identity?.voice?.do || []).join("; ")}
- No: ${(cfg.identity?.voice?.dont || []).join("; ")}

## Átomos (usar SIEMPRE los tokens, nunca valores sueltos)
- Colores: usar \`var(--c-*)\` en CSS y \`BRAND.color("...")\` en JS. Paleta: ${colorEntries.filter(([k]) => !k.includes(".")).map(([k, v]) => `${k} ${v}`).join(", ")}.
- Acento \`--c-accent\`: máximo ${cfg.colors.rules?.maxAccentMomentsPerFrame ?? 1} momento por frame.
- Data viz: usar \`--c-data-viz-0..${(cfg.colors.dataViz || []).length - 1}\` en ese orden.
- Tipografía: clases \`.bm-hero .bm-h1 .bm-h2 .bm-h3 .bm-body .bm-caption .bm-kicker .bm-label .bm-code\`. Prohibido declarar otras font-family.
- Tamaños en \`cqmin\` (vía variables \`--fs-*\`), nunca px fijos: así la escena funciona en 16:9, 9:16, 4:5 y 1:1.
- Máximo ${T.rules?.maxWordsPerLine ?? 7} palabras por línea, ${T.rules?.maxLinesPerFrame ?? 3} líneas por frame, nada menor a ${T.rules?.minSizePx1080 ?? 28}px en 1080p.
- Contenido dentro de \`.bm-safe\` (márgenes seguros por formato, incluye zonas de UI de Reels/Shorts/TikTok en vertical).

## Look (lo que hace distinta a esta marca)
${look.summary}. No lo pises escena por escena: si una pieza necesita otro look, es otra marca o un cambio de marca aprobado.
${lookRules}

## Motion
- Personalidad: **${cfg.motion.personality}**.
${(cfg.motion.principles || []).map((p) => `- ${p}`).join("\n")}
- Duraciones: usar \`BRAND.dur("enter"|"exit"|"micro"|"short"|"emphasis"|"scene"|"long")\` (${Object.entries(cfg.motion.durations).map(([k, v]) => `${k}=${v}ms`).join(", ")}).
- Easings: usar \`BRAND.ease(nombre)\`:
${Object.keys(cfg.motion.easings).map((k) => `  - \`${k}\` (${cfg.motion.easings[k].join(", ")}) — ${(cfg.motion.easingNotes || {})[k] || ""}`).join("\n")}
- Stagger: \`BRAND.stagger("letters"|"words"|"lines"|"items", n)\` (${Object.entries(cfg.motion.stagger).map(([k, v]) => `${k}=${v}ms`).join(", ")}); con \`n\` el grupo completo dura ≤ ${staggerMax} ms.
- Tiempo en pantalla de un texto: \`BRAND.hold(texto)\` como mínimo = ${holdRule}.
- Transiciones en \`scenes.json\` (implementadas): ${(cfg.motion.transitions?.allowed || []).join(", ")}. Default: ${cfg.motion.transitions?.default}. Se hacen en el editor (NLE): ${(cfg.motion.transitions?.manualInNLE || []).join(", ") || "—"}. Prohibidas: ${(cfg.motion.transitions?.forbidden || []).join(", ")}.
- Prohibido: ${(cfg.motion.forbidden || []).join("; ")}.

## Logo
- Usar \`BRAND.logo.svgMark\` / \`svgPrimary\` (inline) o \`brands/${cfg.meta.slug}/logo/*\`. Alto mínimo ${cfg.logo?.minHeightPx1080 ?? 40}px en 1080p, aire libre = ${cfg.logo?.clearSpaceRatio ?? 0.5}× la altura.
- No: ${(cfg.logo?.dont || []).join(", ")}.

## Audio y captions
- Voz en off: ${voRule}. Voz por defecto de la marca: ${cfg.audio?.voice?.synthetic ? "sintética → toda pieza lleva disclosure" : "no definida como sintética (si una pieza usa TTS o clon, lleva disclosure)"}.
- Loudness final: ${cfg.audio?.loudness?.integratedLUFS} LUFS integrados, true peak ≤ ${cfg.audio?.loudness?.truePeakDBTP} dBTP.
- Música: ${cfg.audio?.music?.policy || "—"}
- SFX: ${cfg.audio?.sfx?.style || "—"} (máx. ${cfg.audio?.sfx?.maxPerScene ?? 3} por escena).
- Captions: ${cfg.captions?.maxCharsPerLine} caracteres/línea, ${cfg.captions?.maxLines} líneas, ≤ ${cfg.captions?.maxCharsPerSecond} caracteres/s, mínimo ${cfg.captions?.minDurationMs}ms. Si el proyecto tiene \`captions.srt\` (o .vtt), build:roots los quema en: ${(cfg.captions?.burnIn || []).join(", ") || "—"}.

## Legal
- Disclosure IA: "${cfg.legal?.aiDisclosure}" cuando haya: ${(cfg.legal?.requireDisclosureFor || []).join(", ")}.
${cfg.legal?.disclosurePolicy ? `- Política: ${cfg.legal.disclosurePolicy}` : ""}
- Logos de terceros: ${cfg.legal?.thirdPartyLogos}
`;

// ---------- remotion-theme.ts (para equipos que usen Remotion) ----------
const remotionTheme = `// ${cfg.meta.name} — theme para Remotion (GENERADO por scripts/brand-apply.mjs)
import { Easing } from "remotion";

export const brand = ${JSON.stringify({ colors: cfg.colors, fonts: brandJs.fonts, motion: cfg.motion, typeScale: S }, null, 2)} as const;

/** Easing de marca como función de Remotion: interpolate(frame, [0, 20], [0, 1], { easing: ease("enter") }) */
export const ease = (name: keyof typeof brand.motion.easings) => {
  const [a, b, c, d] = brand.motion.easings[name];
  return Easing.bezier(a, b, c, d);
};
/** Duración de marca en frames */
export const durFrames = (name: keyof typeof brand.motion.durations, fps = 30) =>
  Math.round((brand.motion.durations[name] / 1000) * fps);
/** Tamaño tipográfico en px para un frame dado (escala en cqmin) */
export const fontPx = (name: keyof typeof brand.typeScale, width: number, height: number) =>
  ((brand.typeScale[name] as number) * Math.min(width, height)) / 100;
`;

// ---------- brand-board.html (board visual para revisión humana) ----------
const curve = (e, w = 160, h = 120) => {
  const [x1, y1, x2, y2] = e;
  const px = (x) => 10 + x * (w - 20), py = (y) => h - 10 - y * (h - 20);
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><rect x="10" y="10" width="${w - 20}" height="${h - 20}" fill="none" stroke="${C.border || "#333"}"/><path d="M${px(0)},${py(0)} C${px(x1)},${py(y1)} ${px(x2)},${py(y2)} ${px(1)},${py(1)}" fill="none" stroke="${C.primary}" stroke-width="3"/></svg>`;
};
const board = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${cfg.meta.name} — Brand board de motion</title>
<link rel="stylesheet" href="tokens.css"><style>
body{margin:0;background:${C.background};color:${C.text};font-family:var(--font-body);padding:48px;}
h1{font-family:var(--font-display);font-size:56px;letter-spacing:var(--track-display);margin:0 0 4px}
h2{font-family:var(--font-mono);font-size:14px;letter-spacing:.14em;text-transform:uppercase;color:${C.primary};margin:48px 0 16px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px}
.sw{border-radius:12px;overflow:hidden;border:1px solid ${C.border || "#333"};font:13px/1.4 var(--font-mono)}
.sw div:first-child{height:80px}.sw div:last-child{padding:8px;background:${C.surface || "#111"}}
.type div{margin:10px 0}.curves{display:flex;flex-wrap:wrap;gap:16px}.curves figure{margin:0;font:13px var(--font-mono);text-align:center}
table{border-collapse:collapse;font-size:14px}td,th{border:1px solid ${C.border || "#333"};padding:6px 10px;text-align:left}
.logo{height:64px;display:flex;gap:32px;align-items:center}.logo svg{height:64px;width:auto}
</style></head><body>
<h1>${cfg.meta.name}</h1><div style="color:${C.textMuted}">${cfg.identity?.tagline || ""} · v${cfg.meta.version}</div>
<h2>Look</h2><div style="font-size:20px;margin-bottom:10px">${look.summary}</div><div style="display:flex;flex-wrap:wrap;gap:8px;font:13px var(--font-mono)">${Object.entries(look).filter(([k]) => k !== "summary").map(([k, v]) => `<span style="border:1px solid ${C.border || "#333"};border-radius:999px;padding:4px 10px">${k}: ${v}</span>`).join("")}</div>
<h2>Logo</h2><div class="logo">${inlineMark}${inlineLogo}</div>
<h2>Color</h2><div class="grid">${colorEntries.map(([k, v]) => `<div class="sw"><div style="background:${v}"></div><div>${k}<br>${v}</div></div>`).join("")}</div>
<h2>Contraste</h2><table><tr><th>Par</th><th>Colores</th><th>Ratio</th><th>Mínimo</th><th>Estado</th></tr>${contrastRows.map((r) => "<tr>" + r.split("|").slice(1, -1).map((c) => `<td>${c.replace(/`/g, "")}</td>`).join("") + "</tr>").join("")}</table>
<h2>Tipografía</h2><div class="type">
<div style="font-family:var(--font-display);font-weight:${Math.max(...T.display.weights)};font-size:72px;letter-spacing:${T.display.tracking}">Display · ${T.display.family}</div>
<div style="font-family:var(--font-body);font-size:32px">Body · ${T.body.family} — Una idea por pantalla, con números verificados.</div>
<div style="font-family:var(--font-mono);font-size:24px;color:${C.code?.keyword || C.primary}">const mono = "${T.mono.family}"; // código y labels</div></div>
<h2>Easings</h2><div class="curves">${Object.entries(cfg.motion.easings).map(([k, v]) => `<figure>${curve(v)}<figcaption>${k}<br>(${v.join(", ")})</figcaption></figure>`).join("")}</div>
<h2>Duraciones (ms)</h2><table><tr>${Object.keys(cfg.motion.durations).map((k) => `<th>${k}</th>`).join("")}</tr><tr>${Object.values(cfg.motion.durations).map((v) => `<td>${v}</td>`).join("")}</tr></table>
<h2>Principios de motion</h2><ul>${(cfg.motion.principles || []).map((p) => `<li>${p}</li>`).join("")}</ul>
</body></html>`;

const contrastMd = `# Reporte de contraste — ${cfg.meta.name}\n\n${contrastChecked - contrastFailed} de ${contrastChecked} pares cumplen el mínimo (texto ≥ 4,5:1; texto grande, íconos y series de datos ≥ 3:1; texto principal con objetivo 7:1).\n\n| Uso | Colores | Ratio | Mínimo | Estado |\n|---|---|---|---|---|\n${contrastRows.join("\n")}\n\n${warnings.length ? "## Advertencias\n\n" + warnings.map((w) => `- ${w}`).join("\n") : "Sin advertencias."}\n`;

// ---------- MOTION.md + brand.md en la raíz (convención del pack charlie947/motion-graphics-skills) ----------
const motionMd = `# MOTION.md — ${cfg.meta.name}

> GENERADO desde \`brands/${cfg.meta.slug}/brand.config.json\` v${cfg.meta.version} por \`npm run brand -- ${cfg.meta.slug}\`. No editar a mano. Leé también \`brands/${cfg.meta.slug}/LOOK.md\` (qué hace distinta a esta marca).
> Lo leen: este kit, las skills de HyperFrames (vía frame.md) y packs como charlie947/motion-graphics-skills.

## 0. Look
${look.summary}.
${lookRules}

## 1. Colores y para qué sirve cada uno
${colorEntries.filter(([k]) => !k.includes(".")).map(([k, v]) => `- \`${v}\` **${k}**`).join("\n")}
- Código: ${Object.entries(C.code || {}).map(([k, v]) => `${k} \`${v}\``).join(", ")}
- Data viz (en orden): ${(C.dataViz || []).map((v) => `\`${v}\``).join(" → ")}
- Regla: ${cfg.colors.rules?.notes || "un acento por frame"}

## 2. Tipografía y tamaños
- Display: ${T.display.family} ${T.display.weights.join("/")} · tracking ${T.display.tracking} · ${T.display.case}
- Body: ${T.body.family} · Mono: ${T.mono.family}
- Escala (${S.unit}, % del lado corto): ${Object.entries(S).filter(([k, v]) => typeof v === "number" && !k.endsWith("Multiplier")).map(([k, v]) => `${k} ${v}`).join(" · ")} · 9:16 ×${S.portraitMultiplier || 1} · 4:5 ×${S.feedMultiplier || 1}
- Máx ${T.rules?.maxWordsPerLine} palabras/línea, ${T.rules?.maxLinesPerFrame} líneas/frame, mínimo ${T.rules?.minSizePx1080}px a 1080p.

## 3. Timing: cómo entra, cuánto se queda, cómo sale
- Entrada ${cfg.motion.durations.enter} ms (\`enter\`), énfasis ${cfg.motion.durations.emphasis} ms (\`emphasized\`), salida ${cfg.motion.durations.exit} ms (\`exit\`).
- Hold de lectura: ${holdRule}. Primer movimiento a 150-300 ms, nunca en t=0.
- Stagger: ${Object.entries(cfg.motion.stagger).map(([k, v]) => `${k} ${v} ms`).join(", ")}; un grupo escalonado dura ≤ ${staggerMax} ms (\`BRAND.stagger(nombre, n)\`).
- Voz en off: ${voRule}.

## 4. Cómo se mueve
- Personalidad: **${cfg.motion.personality}**. 30 fps. Transición por defecto: ${cfg.motion.transitions?.default}. Implementadas: ${(cfg.motion.transitions?.allowed || []).join(", ")}; en el editor: ${(cfg.motion.transitions?.manualInNLE || []).join(", ") || "—"}.
${Object.entries(cfg.motion.easings).map(([k, v]) => `- \`${k}\` cubic-bezier(${v.join(", ")}) — ${(cfg.motion.easingNotes || {})[k] || ""}`).join("\n")}

## 5. Textura y acabado
- Fondo: ${look.background} (grilla al ${Math.round((L.background?.gridOpacity ?? 0.06) * 100)}% de opacidad cuando aplica). Esquinas: radios ${Object.entries(L.radius || {}).filter(([k]) => k !== "unit").map(([k, v]) => `${k} ${v}cqmin`).join(", ")}.
- Sin sombras pesadas, sin glow decorativo, sin gradientes que no sean de marca.

## 6. Lo que nuestro motion nunca hace
${(cfg.motion.forbidden || []).map((f) => `- ${f}`).join("\n")}
${(cfg.motion.transitions?.forbidden || []).map((f) => `- Transición: ${f}`).join("\n")}

## 7. Un ejemplo bien hecho (plano por plano)
1. 0.0 s — fondo con grilla quieta. 0.2 s: kicker en mono entra con opacidad; una línea primaria se dibuja (scaleX 0→1, \`standard\`).
2. 0.35 s — el titular sube por máscara línea por línea (\`emphasized\`, stagger ${cfg.motion.stagger.lines} ms). La palabra clave ya está en acento.
3. 1.3 s — la bajada entra con opacidad y 20% de desplazamiento (\`enter\`). Todo queda QUIETO durante el hold de lectura.
4. Última escena: salida con fade (\`exit\`, ${cfg.motion.durations.exit} ms). Entre escenas, la transición ES la salida (corte).
`;
const brandMd = `# Brand — ${cfg.meta.name}

> GENERADO desde \`brands/${cfg.meta.slug}/brand.config.json\`. No editar a mano.

## Nombre y qué hacemos
${cfg.meta.name}: ${cfg.identity?.tagline || ""}. ${cfg.identity?.mission || ""}

## Audiencia
${cfg.identity?.audience || "ASK ME"}

## La sensación
${(cfg.identity?.personality || []).join(", ")}

## Voz
${cfg.identity?.voice?.tone || ""} (${cfg.identity?.voice?.language || "es"}, ${cfg.identity?.voice?.register || ""})

## Assets
- Colores: ${colorEntries.filter(([k]) => !k.includes(".")).map(([k, v]) => `${k} ${v}`).join(", ")}
- Fuentes: ${T.display.family}, ${T.body.family}, ${T.mono.family}
- Logos: ${Object.values(logoMap).join(", ") || "ASK ME"}

## Nunca
${[...(cfg.identity?.voice?.dont || []), ...(cfg.logo?.dont || []).map((d) => `logo: ${d}`)].map((d) => `- ${d}`).join("\n")}
`;
// MOTION.md / brand.md en la raíz solo para la marca activa; una prueba con --out los deja dentro de --out
// MOTION.md / brand.md de la marca viven en su dist/; los de la raíz son un índice (writeIndex)
writeFileSync(join(OUT, "MOTION.md"), motionMd);
writeFileSync(join(OUT, "brand.md"), brandMd);

writeFileSync(join(OUT, "tokens.css"), tokensCss);
writeFileSync(join(OUT, "tokens.js"), tokensJs);
writeFileSync(join(OUT, "frame.md"), frameMd);
writeFileSync(join(OUT, "brand-rules.md"), brandRules);
writeFileSync(join(OUT, "remotion-theme.ts"), remotionTheme);
writeFileSync(join(OUT, "brand-board.html"), board);
writeFileSync(join(OUT, "contrast-report.md"), contrastMd);
writeFileSync(join(OUT, "brand.json"), JSON.stringify(cfg, null, 2));

console.log(`✓ Marca "${cfg.meta.name}" v${cfg.meta.version} aplicada → ${OUT.replace(ROOT + "/", "")}/`);
console.log(`  fuentes: ${fontFiles.length} · logos: ${Object.keys(logoMap).length} · colores: ${colorEntries.length} · contraste: ${contrastChecked - contrastFailed}/${contrastChecked} pares OK`);
report();
if (SLUG) writeIndex();
console.log(`  Siguiente: npm run new -- <slug-del-video> --brand ${cfg.meta.slug}   (proyectos existentes de esta marca: npm run build:roots -- <proyecto> --rebrand)`);
