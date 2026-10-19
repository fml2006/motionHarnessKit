#!/usr/bin/env node
// brand-apply: brand/brand.config.json (fuente única de verdad) → brand/dist/
//   tokens.css · tokens.js · frame.md · brand-rules.md · remotion-theme.ts · brand-board.html
//   fonts/ · logo/ · vendor/ (gsap + CustomEase) · contrast-report.md
// Uso: node scripts/brand-apply.mjs [--config brand/brand.config.json] [--check]
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, rmSync, readdirSync } from "node:fs";
import { dirname, join, resolve, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);

const CONFIG_PATH = resolve(ROOT, opt("--config", "brand/brand.config.json"));
const OUT = resolve(ROOT, opt("--out", "brand/dist"));
const CHECK_ONLY = flag("--check");

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
}

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
const pairs = [
  ["text", "background", 7, "Texto principal sobre fondo (objetivo AAA 7:1 para video)"],
  ["text", "surface", 4.5, "Texto sobre tarjetas"],
  ["textMuted", "background", 4.5, "Texto secundario sobre fondo"],
  ["primary", "background", 3, "Primario como texto grande/ícono"],
  ["accent", "background", 3, "Acento como texto grande/dato"],
  ["secondary", "background", 3, "Secundario como texto grande/ícono"],
  ["onPrimary", "primary", 4.5, "Texto sobre botón/banda primaria"],
];
const contrastRows = [];
for (const [fg, bg, min, label] of pairs) {
  if (!C[fg] || !C[bg]) continue;
  const r = ratio(C[fg], C[bg]);
  const ok = r >= min;
  contrastRows.push(`| ${label} | \`${fg}\` ${C[fg]} / \`${bg}\` ${C[bg]} | ${r.toFixed(2)}:1 | ≥ ${min}:1 | ${ok ? "OK" : "FALLA"} |`);
  if (!ok) warnings.push(`Contraste bajo: ${fg} sobre ${bg} = ${r.toFixed(2)}:1 (mínimo ${min}:1) — ${label}`);
}

// ---------- reglas de motion (sanity) ----------
const D = cfg.motion.durations;
if (D.exit && D.enter && D.exit > D.enter) warnings.push("motion.durations.exit > enter: las salidas deberían ser más cortas que las entradas (~60%).");
if (D.enter && (D.enter < 250 || D.enter > 1200)) warnings.push(`motion.durations.enter=${D.enter}ms fuera del rango típico para video (300-900ms).`);
const RD = cfg.motion.reading || {};
const spw = RD.secondsPerWord ?? (RD.wordsPerSecond ? 1 / RD.wordsPerSecond : 0.35);
const wps = Math.round((1 / spw) * 100) / 100;
const holdRule = `max(${(RD.minHoldMs ?? 1500) / 1000} s; ${(RD.baseMs ?? RD.extraHoldMs ?? 800) / 1000} s + ${spw} s × palabras)`;
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
  console.log(`✓ Config válida (${warnings.length} advertencia(s))`);
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
    } else {
      // source: "local" → archivos en brand/fonts/, mapeados por peso en t.files { "400": "MiFuente-Regular.woff2" }
      const file = t.files?.[String(w)];
      src = file && join(ROOT, "brand", "fonts", file);
      if (!src || !existsSync(src)) { errors.push(`Fuente local faltante para ${role} ${w}: definí typography.${role}.files["${w}"] y copiá el archivo a brand/fonts/`); continue; }
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
  const abs = join(ROOT, p);
  if (!existsSync(abs)) { warnings.push(`Logo ${key} no encontrado: ${p}`); continue; }
  const name = `${key}${extname(abs)}`;
  copyFileSync(abs, join(OUT, "logo", name));
  logoMap[key] = `logo/${name}`;
}
const inlineMark = cfg.logo?.mark && existsSync(join(ROOT, cfg.logo.mark)) ? readFileSync(join(ROOT, cfg.logo.mark), "utf8") : "";
const inlineLogo = cfg.logo?.primary && existsSync(join(ROOT, cfg.logo.primary)) ? readFileSync(join(ROOT, cfg.logo.primary), "utf8") : "";

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
const sizeVars = Object.entries(S).filter(([k, v]) => typeof v === "number" && k !== "portraitMultiplier").map(([k, v]) => `  --fs-${k}: ${v}${S.unit || "cqmin"};`).join("\n");
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

const tokensCss = `/* ${cfg.meta.name} — tokens de marca para motion (GENERADO por scripts/brand-apply.mjs — no editar a mano) */
/* Fuente: brand/brand.config.json v${cfg.meta.version} */
${fontFaces.map((f) => `@font-face { font-family: "${f.family}"; src: url("fonts/${f.file}") format("woff2"); font-weight: ${f.weight}; font-style: normal; font-display: block;${f.ext ? " unicode-range: U+0100-024F, U+1E00-1EFF, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;" : ""} }`).join("\n")}

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
@container frame (orientation: portrait) {
  .bm-safe { --safe-x: ${Math.max(zone.leftPct || sm.portrait, sm.portrait)}cqw; --safe-top: ${zone.topPct}cqh; --safe-bottom: ${zone.bottomPct}cqh; --safe-right: ${Math.max(zone.rightPct || sm.portrait, sm.portrait)}cqw;
${Object.entries(S).filter(([k, v]) => typeof v === "number" && k !== "portraitMultiplier").map(([k, v]) => `    --fs-${k}: ${Math.round(v * (S.portraitMultiplier || 1) * 100) / 100}${S.unit || "cqmin"};`).join("\n")}
  }
}
@container frame (aspect-ratio < 1.2) and (aspect-ratio > 0.85) {
  .bm-safe { --safe-x: ${sm.square}cqw; --safe-top: ${sm.square}cqh; --safe-bottom: ${sm.square}cqh; --safe-right: ${sm.square}cqw; }
}
.bm-safe { position: absolute; top: var(--safe-top); bottom: var(--safe-bottom); left: var(--safe-x); right: var(--safe-right); }

/* fondos */
.bm-bg { position: absolute; inset: 0; background: var(--c-background); }
.bm-bg.grid { background-image: linear-gradient(${hexA(C.text, gridOpacity)} 1px, transparent 1px), linear-gradient(90deg, ${hexA(C.text, gridOpacity)} 1px, transparent 1px); background-size: 6cqmin 6cqmin; background-position: center; }
.bm-bg.glow::after { content: ""; position: absolute; inset: -20%; background: radial-gradient(40% 35% at 70% 30%, ${hexA(g1, 0.18 * glowK)}, transparent 70%), radial-gradient(35% 30% at 25% 80%, ${hexA(g2, 0.12 * glowK)}, transparent 70%); }

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
.bm-accent { color: var(--c-accent); }
.bm-primary { color: var(--c-primary); }
.bm-num { font-variant-numeric: tabular-nums; }

/* máscaras para reveals por línea/palabra: animar el hijo con yPercent */
.bm-line { display: block; overflow: hidden; padding-bottom: 0.08em; margin-bottom: -0.08em; }
.bm-line > span { display: inline-block; }
.bm-word { display: inline-block; white-space: pre; }

/* componentes */
.bm-card { background: var(--c-surface); border: var(--stroke) solid var(--c-border); border-radius: var(--radius-lg); }
.bm-chip { display: inline-flex; align-items: center; gap: 1cqmin; padding: 0.8cqmin 1.8cqmin; border-radius: 999px; background: var(--c-surface-alt); font-family: var(--font-mono); font-size: var(--fs-label); color: var(--c-text); }
.bm-rule { height: var(--stroke); background: var(--c-border); }
.bm-logo svg, .bm-logo img { display: block; height: 100%; width: auto; }
`;

// ---------- tokens.js ----------
const brandJs = {
  name: cfg.meta.name,
  slug: cfg.meta.slug,
  version: cfg.meta.version,
  colors: cfg.colors,
  fonts: { display: T.display.family, body: T.body.family, mono: T.mono.family },
  motion: cfg.motion,
  captions: cfg.captions,
  logo: { ...logoMap, svgMark: inlineMark, svgPrimary: inlineLogo },
};
const tokensJs = `/* ${cfg.meta.name} — tokens JS para GSAP (GENERADO por scripts/brand-apply.mjs — no editar a mano)
   Requiere cargar antes: vendor/gsap.min.js y vendor/CustomEase.min.js
   API:
     BRAND.ease("enter")      → nombre de ease registrado ("brand.enter")
     BRAND.dur("enter")       → segundos (0.6)
     BRAND.stagger("words")   → segundos entre elementos
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
  B.stagger = function (name) {
    var v = B.motion.stagger[name];
    if (v == null) throw new Error("BRAND.stagger: stagger desconocido '" + name + "'");
    return v / 1000;
  };
  B.hold = function (text) {
    var r = B.motion.reading || {};
    var spw = r.secondsPerWord || (r.wordsPerSecond ? 1 / r.wordsPerSecond : 0.35);
    var base = (r.baseMs != null ? r.baseMs : r.extraHoldMs != null ? r.extraHoldMs : 800) / 1000;
    var words = String(text || "").trim().split(/\\s+/).filter(Boolean).length;
    return Math.max((r.minHoldMs || 1500) / 1000, base + words * spw);
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

// ---------- frame.md (spec de diseño que leen las skills de HyperFrames) ----------
const yamlColors = colorEntries.map(([k, v]) => `  ${kebab(k)}: "${v}"`).join("\n");
const typoLine = (name, role, size, weight, extra = "") =>
  `  ${name}: { fontFamily: "${T[role].family}", cqmin: ${size}, weight: ${weight}, lineHeight: ${T[role].lineHeight}, tracking: "${T[role].tracking}"${extra} }`;
const frameMd = `---
version: 1
name: ${cfg.meta.name} — Frame (capa de video)
description: >
  Sistema de diseño a escala de frame para ${cfg.meta.name}. Generado desde brand/brand.config.json
  (v${cfg.meta.version}). Los átomos (hex, familias, pesos, motion tokens) son sagrados; la composición es libre.
unit: el frame — 1920×1080 principal; 1080×1920 (9:16) y 1080×1080 (1:1) derivados
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
${Object.entries(L.radius || {}).filter(([k]) => k !== "unit").map(([k, v]) => `  radius-${k}: "${v}cqmin"`).join("\n")}

motion:
  personality: ${cfg.motion.personality}
  durations-ms: { ${Object.entries(cfg.motion.durations).map(([k, v]) => `${k}: ${v}`).join(", ")} }
  easings: { ${Object.entries(cfg.motion.easings).map(([k, v]) => `${k}: "cubic-bezier(${v.join(",")})"`).join(", ")} }
  stagger-ms: { ${Object.entries(cfg.motion.stagger).map(([k, v]) => `${k}: ${v}`).join(", ")} }
  reading: "${holdRule}"
  transitions-allowed: [${(cfg.motion.transitions?.allowed || []).join(", ")}]

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
const brandRules = `# Reglas de marca — ${cfg.meta.name} (GENERADO desde brand/brand.config.json v${cfg.meta.version})

> No edites este archivo: editá \`brand/brand.config.json\` y corré \`npm run brand\`.

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
- Tamaños en \`cqmin\` (vía variables \`--fs-*\`), nunca px fijos: así la escena funciona en 16:9, 9:16 y 1:1.
- Máximo ${T.rules?.maxWordsPerLine ?? 7} palabras por línea, ${T.rules?.maxLinesPerFrame ?? 3} líneas por frame, nada menor a ${T.rules?.minSizePx1080 ?? 28}px en 1080p.
- Contenido dentro de \`.bm-safe\` (márgenes seguros por formato, incluye zonas de UI de Reels/Shorts/TikTok en vertical).

## Motion
- Personalidad: **${cfg.motion.personality}**.
${(cfg.motion.principles || []).map((p) => `- ${p}`).join("\n")}
- Duraciones: usar \`BRAND.dur("enter"|"exit"|"micro"|"short"|"emphasis"|"scene"|"long")\` (${Object.entries(cfg.motion.durations).map(([k, v]) => `${k}=${v}ms`).join(", ")}).
- Easings: usar \`BRAND.ease(nombre)\`:
${Object.keys(cfg.motion.easings).map((k) => `  - \`${k}\` (${cfg.motion.easings[k].join(", ")}) — ${(cfg.motion.easingNotes || {})[k] || ""}`).join("\n")}
- Stagger: \`BRAND.stagger("letters"|"words"|"lines"|"items")\` (${Object.entries(cfg.motion.stagger).map(([k, v]) => `${k}=${v}ms`).join(", ")}).
- Tiempo en pantalla de un texto: \`BRAND.hold(texto)\` como mínimo = ${holdRule}.
- Transiciones permitidas: ${(cfg.motion.transitions?.allowed || []).join(", ")}. Default: ${cfg.motion.transitions?.default}. Prohibidas: ${(cfg.motion.transitions?.forbidden || []).join(", ")}.
- Prohibido: ${(cfg.motion.forbidden || []).join("; ")}.

## Logo
- Usar \`BRAND.logo.svgMark\` / \`svgPrimary\` (inline) o \`brand/logo/*\`. Alto mínimo ${cfg.logo?.minHeightPx1080 ?? 40}px en 1080p, aire libre = ${cfg.logo?.clearSpaceRatio ?? 0.5}× la altura.
- No: ${(cfg.logo?.dont || []).join(", ")}.

## Audio y captions
- Loudness final: ${cfg.audio?.loudness?.integratedLUFS} LUFS integrados, true peak ≤ ${cfg.audio?.loudness?.truePeakDBTP} dBTP.
- Música: ${cfg.audio?.music?.policy || "—"}
- SFX: ${cfg.audio?.sfx?.style || "—"} (máx. ${cfg.audio?.sfx?.maxPerScene ?? 3} por escena).
- Captions: ${cfg.captions?.maxCharsPerLine} caracteres/línea, ${cfg.captions?.maxLines} líneas, ≤ ${cfg.captions?.maxCharsPerSecond} caracteres/s, mínimo ${cfg.captions?.minDurationMs}ms.

## Legal
- Disclosure IA: "${cfg.legal?.aiDisclosure}" cuando haya: ${(cfg.legal?.requireDisclosureFor || []).join(", ")}.
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

const contrastMd = `# Reporte de contraste — ${cfg.meta.name}\n\n| Uso | Colores | Ratio | Mínimo | Estado |\n|---|---|---|---|---|\n${contrastRows.join("\n")}\n\n${warnings.length ? "## Advertencias\n\n" + warnings.map((w) => `- ${w}`).join("\n") : "Sin advertencias."}\n`;

// ---------- MOTION.md + brand.md en la raíz (convención del pack charlie947/motion-graphics-skills) ----------
const motionMd = `# MOTION.md — ${cfg.meta.name}

> GENERADO desde brand/brand.config.json v${cfg.meta.version} por \`npm run brand\`. No editar a mano.
> Lo leen: este kit, las skills de HyperFrames (vía frame.md) y packs como charlie947/motion-graphics-skills.

## 1. Colores y para qué sirve cada uno
${colorEntries.filter(([k]) => !k.includes(".")).map(([k, v]) => `- \`${v}\` **${k}**`).join("\n")}
- Código: ${Object.entries(C.code || {}).map(([k, v]) => `${k} \`${v}\``).join(", ")}
- Data viz (en orden): ${(C.dataViz || []).map((v) => `\`${v}\``).join(" → ")}
- Regla: ${cfg.colors.rules?.notes || "un acento por frame"}

## 2. Tipografía y tamaños
- Display: ${T.display.family} ${T.display.weights.join("/")} · tracking ${T.display.tracking} · ${T.display.case}
- Body: ${T.body.family} · Mono: ${T.mono.family}
- Escala (${S.unit}, % del lado corto): ${Object.entries(S).filter(([k, v]) => typeof v === "number" && k !== "portraitMultiplier").map(([k, v]) => `${k} ${v}`).join(" · ")} · vertical ×${S.portraitMultiplier || 1}
- Máx ${T.rules?.maxWordsPerLine} palabras/línea, ${T.rules?.maxLinesPerFrame} líneas/frame, mínimo ${T.rules?.minSizePx1080}px a 1080p.

## 3. Timing: cómo entra, cuánto se queda, cómo sale
- Entrada ${cfg.motion.durations.enter} ms (\`enter\`), énfasis ${cfg.motion.durations.emphasis} ms (\`emphasized\`), salida ${cfg.motion.durations.exit} ms (\`exit\`).
- Hold de lectura: ${holdRule}. Primer movimiento a 150-300 ms, nunca en t=0.
- Stagger: ${Object.entries(cfg.motion.stagger).map(([k, v]) => `${k} ${v} ms`).join(", ")}.

## 4. Cómo se mueve
- Personalidad: **${cfg.motion.personality}**. 30 fps. Transición por defecto: ${cfg.motion.transitions?.default}.
${Object.entries(cfg.motion.easings).map(([k, v]) => `- \`${k}\` cubic-bezier(${v.join(", ")}) — ${(cfg.motion.easingNotes || {})[k] || ""}`).join("\n")}

## 5. Textura y acabado
- Fondo: ${L.background?.style || "solid"} (grilla al ${Math.round((L.background?.gridOpacity ?? 0.06) * 100)}% de opacidad). Esquinas: radios ${Object.entries(L.radius || {}).filter(([k]) => k !== "unit").map(([k, v]) => `${k} ${v}cqmin`).join(", ")}.
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

> GENERADO desde brand/brand.config.json. No editar a mano.

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
writeFileSync(join(ROOT, "MOTION.md"), motionMd);
writeFileSync(join(ROOT, "brand.md"), brandMd);

writeFileSync(join(OUT, "tokens.css"), tokensCss);
writeFileSync(join(OUT, "tokens.js"), tokensJs);
writeFileSync(join(OUT, "frame.md"), frameMd);
writeFileSync(join(OUT, "brand-rules.md"), brandRules);
writeFileSync(join(OUT, "remotion-theme.ts"), remotionTheme);
writeFileSync(join(OUT, "brand-board.html"), board);
writeFileSync(join(OUT, "contrast-report.md"), contrastMd);
writeFileSync(join(OUT, "brand.json"), JSON.stringify(cfg, null, 2));

console.log(`✓ Marca "${cfg.meta.name}" v${cfg.meta.version} aplicada → ${OUT.replace(ROOT + "/", "")}/`);
console.log(`  fuentes: ${fontFiles.length} · logos: ${Object.keys(logoMap).length} · colores: ${colorEntries.length} · contraste: ${contrastRows.length - warnings.filter((w) => w.startsWith("Contraste")).length}/${contrastRows.length} OK`);
report();
console.log(`  Siguiente: npm run new -- <slug-del-video>   (o re-aplicar a un proyecto existente: npm run build:roots -- <proyecto>)`);
