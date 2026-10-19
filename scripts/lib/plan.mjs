// Helpers del plan de escenas: timing por formato, transiciones, placeholders, claims, brandLock, captions y token lint.
// Los usan build-roots.mjs, frames.mjs y new-project.mjs. (common.mjs queda para entorno/CLI.)
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// ---------- transiciones ----------
// Implementadas en la raíz generada. Cualquier otra → error de build (nunca un corte silencioso).
export const TRANSITIONS = {
  cut: { overlap: () => 0 },
  crossfade: { overlap: (plan) => plan.crossfade ?? 0.4 },
  push: { overlap: (plan, brand) => (brand.motion?.durations?.scene ?? 400) / 1000 },
  "mask-wipe": { overlap: (plan, brand) => (brand.motion?.durations?.scene ?? 400) / 1000 },
};

export function transitionOf(scene, plan) {
  return scene.transition || plan.defaultTransition || "cut";
}

// Escenas efectivas para un formato (skipIn + overrides por formato).
export function sceneList(plan, fmtId) {
  return (plan.scenes || [])
    .filter((s) => !(s.skipIn || []).includes(fmtId))
    .map((s) => {
      const o = (s.formats || {})[fmtId] || {};
      return { ...s, duration: o.duration ?? s.duration, vars: { ...(s.vars || {}), ...(o.vars || {}) } };
    });
}

// Línea de tiempo de un formato: [{ scene, start, duration, transition, overlap }] + total.
// La escena entrante arranca `overlap` segundos antes de que termine la anterior.
export function timeline(plan, fmtId, brand) {
  let t = 0;
  const out = [];
  sceneList(plan, fmtId).forEach((s, i) => {
    const tr = i > 0 ? transitionOf(s, plan) : "cut";
    const overlap = i > 0 && TRANSITIONS[tr] ? Math.min(TRANSITIONS[tr].overlap(plan, brand), out[i - 1].duration / 2, s.duration / 2) : 0;
    t = Math.max(0, t - overlap);
    const start = Math.round(t * 1000) / 1000;
    out.push({ scene: s, start, duration: s.duration, transition: tr, overlap });
    t = start + s.duration;
  });
  return { items: out, total: Math.round(t * 1000) / 1000 };
}

// ---------- variables de composición ----------
// Lee los defaults declarados en data-composition-variables de una composición/bloque.
export function compositionDefaults(html) {
  const m = html.match(/data-composition-variables='([\s\S]*?)'\s*>/);
  if (!m) return {};
  try {
    const decl = JSON.parse(m[1]);
    return Object.fromEntries(decl.map((d) => [d.id, d.default]));
  } catch {
    return {};
  }
}

// Texto "visible" de una composición: sin comentarios HTML, sin la declaración de variables, sin <style>.
export function compositionBodyText(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/data-composition-variables='[\s\S]*?'\s*>/, ">")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/\/\/[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

// ---------- placeholders ----------
// Marcadores de "esto no está terminado". TODO/COMPLETAR en mayúsculas (en español "todo" es una palabra normal).
const PH_CASE = /⟦|\bCOMPLETAR\b|\bTODO\b|\bFIXME\b|\bLOREM\b/;
const PH_ANY = /\breemplazar\s+(por|antes|con)\b|[—(-]\s*reemplazar\b|\bdato ficticio\b|\bficticio\b|\bno publicar\b/i;
export function findPlaceholder(value) {
  const s = typeof value === "string" ? value : value == null ? "" : JSON.stringify(value);
  const m = s.match(PH_CASE) || s.match(PH_ANY);
  return m ? m[0] : null;
}

// ---------- claims ----------
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') q = false;
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((x) => x !== "")) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x !== "")) rows.push(row);
  const [head, ...body] = rows;
  return (body || []).map((r) => Object.fromEntries((head || []).map((h, i) => [h.trim(), (r[i] ?? "").trim()])));
}

export function loadClaims(projectDir) {
  const p = join(projectDir, "research", "claims.csv");
  if (!existsSync(p)) return null;
  return Object.fromEntries(parseCsv(readFileSync(p, "utf8")).filter((c) => c.id).map((c) => [c.id, c]));
}

// Una claim está lista para publicar si estado=ok y la verificó alguien (verificado_por no vacío ni PENDIENTE…).
export function claimProblem(c) {
  if (!c) return "no existe en research/claims.csv";
  const estado = (c.estado || "").toLowerCase();
  const by = (c.verificado_por || "").trim();
  if (estado !== "ok") return `estado="${c.estado || "vacío"}" (tiene que ser ok)`;
  if (!by || /^pendiente/i.test(by)) return `verificado_por="${by || "vacío"}" (falta la firma del SME)`;
  return null;
}

export const NUMERIC_BLOCKS = ["stat-hit", "bar-chart"];

// ---------- brandLock ----------
export function brandFingerprint(distDir, brand) {
  const h = createHash("sha256");
  for (const f of ["tokens.css", "tokens.js", "brand.json"]) {
    const p = join(distDir, f);
    if (existsSync(p)) h.update(readFileSync(p));
  }
  return { slug: brand.meta?.slug, name: brand.meta?.name, version: brand.meta?.version, hash: h.digest("hex").slice(0, 16) };
}

// ---------- captions (SRT / VTT) ----------
const tc = (s) => {
  const m = s.trim().replace(",", ".").match(/(?:(\d+):)?(\d+):(\d+(?:\.\d+)?)/);
  return m ? Number(m[1] || 0) * 3600 + Number(m[2]) * 60 + Number(m[3]) : NaN;
};
export function parseCaptions(text) {
  const blocks = text.replace(/\r/g, "").replace(/^WEBVTT[^\n]*\n/, "").split(/\n{2,}/);
  const cues = [];
  for (const b of blocks) {
    const lines = b.split("\n").filter((l) => l.trim() !== "");
    const i = lines.findIndex((l) => l.includes("-->"));
    if (i < 0) continue;
    const [a, z] = lines[i].split("-->");
    const start = tc(a);
    const end = tc(z.split(/\s/).filter(Boolean)[0] || "");
    const textLines = lines.slice(i + 1).map((l) => l.replace(/<[^>]+>/g, "").trim()).filter(Boolean);
    if (isFinite(start) && isFinite(end) && end > start && textLines.length) cues.push({ start, end, lines: textLines });
  }
  return cues;
}

export function captionWarnings(cues, rules = {}) {
  const maxLine = rules.maxCharsPerLine ?? 38;
  const maxLines = rules.maxLines ?? 2;
  const maxCps = rules.maxCharsPerSecond ?? 17;
  const minDur = (rules.minDurationMs ?? 1000) / 1000;
  const w = [];
  cues.forEach((c, i) => {
    const at = `cue ${i + 1} (${c.start.toFixed(2)}s)`;
    const chars = c.lines.join(" ").length;
    const d = c.end - c.start;
    if (c.lines.length > maxLines) w.push(`${at}: ${c.lines.length} líneas (máx. ${maxLines})`);
    const long = Math.max(...c.lines.map((l) => l.length));
    if (long > maxLine) w.push(`${at}: línea de ${long} caracteres (máx. ${maxLine})`);
    if (chars / d > maxCps) w.push(`${at}: ${(chars / d).toFixed(1)} car/s (máx. ${maxCps})`);
    if (d < minDur) w.push(`${at}: dura ${d.toFixed(2)}s (mín. ${minDur}s)`);
    if (i > 0 && c.start < cues[i - 1].end - 0.001) w.push(`${at}: se superpone con el cue anterior`);
  });
  return w;
}

// ---------- token lint ----------
// Valores sueltos en escenas: todo color, fuente y curva tiene que salir de los tokens de marca.
export function tokenLint(html) {
  const issues = [];
  // comentarios y declaración de variables se vacían conservando los saltos de línea (los números de línea son reales)
  const blank = (m) => m.replace(/[^\n]/g, " ");
  const body = html.replace(/<!--[\s\S]*?-->/g, blank).replace(/data-composition-variables='[\s\S]*?'/, blank);
  const lines = body.split("\n");
  lines.forEach((l, i) => {
    const code = l.replace(/\/\/.*$/, "");
    if (/#[0-9a-fA-F]{3,8}\b/.test(code) && !/data-composition-id|href=|url\(#/.test(code) && /(color|background|fill|stroke|border|shadow|:)\s*[^;]*#[0-9a-fA-F]{3,8}\b/.test(code))
      issues.push(`línea ${i + 1}: color hex suelto → usá var(--c-*) o BRAND.color()`);
    if (/\brgba?\(\s*\d/.test(code)) issues.push(`línea ${i + 1}: rgb()/rgba() suelto → usá var(--c-*) (con color-mix si necesitás transparencia)`);
    if (/font-family\s*:/.test(code) && !/font-family\s*:\s*var\(--font-/.test(code)) issues.push(`línea ${i + 1}: font-family no tokenizada → usá var(--font-display|body|mono) o las clases .bm-*`);
    if (/cubic-bezier\(/.test(code) && !/var\(--ease-/.test(code)) issues.push(`línea ${i + 1}: cubic-bezier suelto → usá var(--ease-*) o BRAND.ease()`);
    if (/ease\s*:\s*["'](power|expo|back|elastic|bounce|sine|circ|quad|cubic|quart|quint)/.test(code)) issues.push(`línea ${i + 1}: ease de GSAP suelto → usá BRAND.ease(nombre)`);
  });
  return issues;
}
