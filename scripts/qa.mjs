#!/usr/bin/env node
// qa: control técnico automático de un render (o de los renders más nuevos de un proyecto).
//   node scripts/qa.mjs <video | proyecto> [--platform <id>] [--delivery | --draft] [--lufs -16] [--allow-silent] [--out dir]
// Plataformas: las de delivery/specs.json (youtube, shorts, reels, tiktok, linkedin, linkedin-feed, instagram-feed, x,
// evento, broadcast-ebu, archive, overlay).
// Modos:
//   --delivery  entregable: --platform obligatorio; loudness fuera de objetivo y audio faltante (si la plataforma
//               lo requiere) son FAIL. Es el modo que usa `npm run deliver`.
//   --draft     render de trabajo (lo usa `npm run render`): loudness y audio son WARN (se resuelven en deliver).
//   (sin flag)  igual que --delivery si pasás --platform; si no, infiere la plataforma por aspecto con WARN.
// Chequea: specs de plataforma (resolución, fps, códecs, perfil, duración, peso, faststart), loudness (BS.1770),
// negros, congelados, heurística de fotosensibilidad (WCAG 2.3.1) y arma un contact sheet.
// Sale con código 1 si hay algún FAIL. No reemplaza la revisión humana ni un análisis formal (EA IRIS / PEAT).
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync, openSync, readSync, closeSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { ROOT, readJson } from "./lib/common.mjs";

const args = process.argv.slice(2);
const VALUE_FLAGS = ["--platform", "--out", "--lufs"];
const target = args.find((a, i) => !a.startsWith("--") && !VALUE_FLAGS.includes(args[i - 1]));
const val = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : null);
const platformArg = val("--platform");
const lufsArg = val("--lufs") !== null ? Number(val("--lufs")) : null;
const draft = args.includes("--draft");
const delivery = args.includes("--delivery") || (!draft && !!platformArg);
const allowSilent = args.includes("--allow-silent");
const specs = readJson(join(ROOT, "delivery", "specs.json"));
if (!target) {
  console.error(`Uso: node scripts/qa.mjs <video | proyecto> [--platform ${Object.keys(specs.platforms).join("|")}] [--delivery|--draft] [--lufs n]`);
  process.exit(1);
}
if (platformArg && !specs.platforms[platformArg]) {
  console.error(`✗ Plataforma desconocida "${platformArg}". Opciones: ${Object.keys(specs.platforms).join(", ")}`);
  process.exit(1);
}

function videosFor(t) {
  const abs = resolve(t);
  if (existsSync(abs) && statSync(abs).isFile()) return [abs];
  const proj = existsSync(join(abs, "scenes.json")) ? abs : join(ROOT, "projects", t);
  const dir = join(proj, "renders");
  if (!existsSync(dir)) return [];
  // los intermedios de deliver (_master.mov) no son renders de revisión: se controlan sus salidas en delivery/
  const files = readdirSync(dir).filter((f) => /\.(mp4|mov|webm)$/i.test(f) && !/_master\.mov$/i.test(f)).map((f) => join(dir, f));
  // el render más nuevo por formato
  const latest = {};
  for (const f of files) {
    const key = basename(f).replace(/_v\d+\.\w+$/, "");
    if (!latest[key] || statSync(f).mtimeMs > statSync(latest[key]).mtimeMs) latest[key] = f;
  }
  return Object.values(latest);
}

const ff = (a) => spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...a], { encoding: "utf8", maxBuffer: 1 << 28 });
const fp = (a) => spawnSync("ffprobe", ["-v", "error", ...a], { encoding: "utf8", maxBuffer: 1 << 26 });

function probe(file) {
  const r = fp(["-show_entries", "format=duration,size,bit_rate:stream=codec_type,codec_name,profile,width,height,r_frame_rate,pix_fmt,sample_rate,channels,color_primaries,color_space", "-of", "json", file]);
  return JSON.parse(r.stdout || "{}");
}

// moov antes de mdat = "fast start" (reproducción progresiva)
function faststart(file) {
  if (!/\.(mp4|mov)$/i.test(file)) return null;
  const fd = openSync(file, "r");
  const size = statSync(file).size;
  let pos = 0;
  const buf = Buffer.alloc(16);
  try {
    while (pos < size) {
      readSync(fd, buf, 0, 16, pos);
      let len = buf.readUInt32BE(0);
      const type = buf.toString("latin1", 4, 8);
      if (type === "moov") return true;
      if (type === "mdat") return false;
      if (len === 1) len = Number(buf.readBigUInt64BE(8));
      if (len < 8) return null;
      pos += len;
    }
  } finally {
    closeSync(fd);
  }
  return null;
}

function loudness(file) {
  const r = ff(["-i", file, "-af", "ebur128=peak=true", "-f", "null", "-"]);
  const txt = r.stderr || "";
  const sum = txt.slice(txt.lastIndexOf("Summary:"));
  const I = parseFloat((sum.match(/I:\s+(-?[\d.]+) LUFS/) || [])[1]);
  const TP = parseFloat((sum.match(/Peak:\s+(-?[\d.]+|-inf) dBFS/) || [])[1]);
  return { I, TP };
}

function detect(file, filter, re) {
  const r = ff(["-i", file, "-vf", filter, "-an", "-f", "null", "-"]);
  return [...(r.stderr || "").matchAll(re)].map((m) => m.slice(1).map(Number));
}

// Heurística WCAG 2.3.1 (destello general): pares de cambios opuestos de luminancia relativa ≥ 10%
// donde el estado más oscuro está por debajo de 0.80, contando más de 3 por segundo.
// Usa luminancia media del frame completo: subestima destellos localizados (≥ 25% del área).
function flashes(file, fps) {
  const r = ff(["-i", file, "-vf", "scale=160:-2,signalstats,metadata=print:key=lavfi.signalstats.YAVG", "-an", "-f", "null", "-"]);
  const ys = [...(r.stderr || "").matchAll(/YAVG=([\d.]+)/g)].map((m) => Number(m[1]));
  const lum = ys.map((y) => Math.pow(Math.min(1, Math.max(0, (y - 16) / 219)), 2.2));
  const transitions = [];
  let ref = lum[0];
  let dir = 0;
  for (let i = 1; i < lum.length; i++) {
    const d = lum[i] - ref;
    if (Math.abs(d) >= 0.1 && Math.min(lum[i], ref) < 0.8) {
      const nd = Math.sign(d);
      if (nd !== dir) transitions.push(i);
      dir = nd;
      ref = lum[i];
    } else if (Math.sign(d) === dir) ref = dir > 0 ? Math.max(ref, lum[i]) : Math.min(ref, lum[i]);
  }
  // un "flash" = par de transiciones opuestas
  let worst = 0;
  let at = 0;
  for (let i = 0; i < transitions.length; i++) {
    let j = i;
    while (j < transitions.length && transitions[j] - transitions[i] < fps) j++;
    const n = Math.floor((j - i) / 2);
    if (n > worst) { worst = n; at = transitions[i] / fps; }
  }
  return { maxFlashesPerSecond: worst, at: Math.round(at * 100) / 100, frames: lum.length };
}

function contactSheet(file, outDir, dur) {
  const n = Math.min(20, Math.max(6, Math.round(dur / 3)));
  const every = Math.max(0.5, dur / n);
  const out = join(outDir, basename(file).replace(/\.\w+$/, "") + "_contact.jpg");
  ff(["-y", "-i", file, "-vf", `fps=1/${every.toFixed(3)},scale=384:-2,tile=5x${Math.ceil(n / 5)}:padding=6:color=0x222222`, "-frames:v", "1", "-q:v", "3", out]);
  return existsSync(out) ? out : null;
}

// Fallback cuando no se pasa --platform (solo renders de trabajo): por códec y aspecto.
// Reels/TikTok/Shorts comparten 9:16 pero no specs: la inferencia elige Shorts y avisa.
function inferPlatform(v) {
  if (v.codec_name === "prores") return /^yuva/.test(v.pix_fmt || "") ? "overlay" : "archive";
  const r = v.width / v.height;
  if (r > 1.5) return "youtube";
  if (r < 0.7) return "shorts";
  if (r < 0.9) return "linkedin-feed";
  return "linkedin";
}

const files = videosFor(target);
if (!files.length) {
  console.error(`✗ No encontré videos en "${target}" (archivo o proyecto con renders/).`);
  process.exit(1);
}
let anyFail = false;
for (const file of files) {
  const rows = [];
  const add = (status, check, detail) => rows.push({ status, check, detail });
  const info = probe(file);
  const v = (info.streams || []).find((s) => s.codec_type === "video") || {};
  const a = (info.streams || []).find((s) => s.codec_type === "audio");
  const dur = Number(info.format?.duration || 0);
  const sizeMB = Number(info.format?.size || 0) / 1048576;
  const [fn, fd] = String(v.r_frame_rate || "30/1").split("/").map(Number);
  const fps = fd ? fn / fd : fn;
  const isMov = /\.(mov|webm)$/i.test(file);
  const pid = platformArg || inferPlatform(v);
  const P = specs.platforms[pid];
  // en modo entrega los problemas de audio/loudness frenan; en un draft se resuelven después en deliver
  const hard = (cond) => (cond ? "PASS" : delivery ? "FAIL" : "WARN");
  add("INFO", "Archivo", `${basename(file)} · ${v.width}×${v.height} · ${fps.toFixed(2)} fps · ${dur.toFixed(2)} s · ${sizeMB.toFixed(1)} MB · ${v.codec_name}${v.profile ? " " + v.profile : ""}/${v.pix_fmt}${a ? ` · audio ${a.codec_name} ${a.sample_rate} Hz ${a.channels}ch` : " · sin audio"}`);
  add("INFO", "Modo", delivery ? "ENTREGA (audio y loudness bloquean)" : "DRAFT (audio y loudness solo avisan: se normaliza en npm run deliver)");
  if (delivery && !platformArg) add("FAIL", "Plataforma", "en modo entrega --platform es obligatorio (la matriz de entregables sale del brief)");
  if (P) {
    const confirmed = P.specsVerified ?? P.verified;
    add(platformArg ? "INFO" : "WARN", "Plataforma", `${P.label}${confirmed ? "" : " (specs sin confirmar oficialmente: verificá antes de la campaña)"} — ${platformArg ? "elegida" : "INFERIDA por aspecto/códec: pasá --platform (Reels, TikTok y Shorts tienen specs distintas)"}`);
    if (P.width && P.height) add(v.width === P.width && v.height === P.height ? "PASS" : "WARN", "Resolución", `${v.width}×${v.height} (esperado ${P.width}×${P.height})`);
    if (P.maxWidth) add(v.width <= P.maxWidth ? "PASS" : "FAIL", "Ancho máximo", `${v.width} ≤ ${P.maxWidth}`);
    if (P.maxHeight) add(v.height <= P.maxHeight ? "PASS" : "FAIL", "Alto máximo", `${v.height} ≤ ${P.maxHeight}`);
    if (P.fps) add(fps >= P.fps[0] - 0.01 && fps <= P.fps[1] + 0.01 ? "PASS" : "FAIL", "fps", `${fps.toFixed(2)} (rango ${P.fps.join("–")})`);
    if (P.videoCodec) {
      const okCodec = P.videoCodec.includes(v.codec_name);
      add(okCodec ? "PASS" : delivery || P.isMaster ? "FAIL" : isMov ? "INFO" : "FAIL", "Códec de video", `${v.codec_name} (esperado ${P.videoCodec.join("/")})`);
    }
    if (P.videoProfile) add(P.videoProfile.includes(v.profile) ? "PASS" : "FAIL", "Perfil de video", `${v.profile} (esperado ${P.videoProfile.join("/")})`);
    if (P.pixFmt && v.pix_fmt) add(P.pixFmt.includes(v.pix_fmt) ? "PASS" : P.isMaster ? "FAIL" : "WARN", "Pixel format", `${v.pix_fmt} (esperado ${P.pixFmt.join("/")})`);
    if (!P.isMaster && v.codec_name === "h264") add(v.color_space === "bt709" || v.color_primaries === "bt709" ? "PASS" : "WARN", "Color", `${v.color_primaries || "sin tag"} / ${v.color_space || "sin tag"} (esperado BT.709)`);
    if (P.maxDurationS) {
      const limit = P.maxDurationVerifiedAccountS || P.maxDurationS;
      const st = dur > limit ? "FAIL" : dur > P.maxDurationS ? "WARN" : "PASS";
      add(st, "Duración", `${dur.toFixed(1)} s ≤ ${P.maxDurationS} s${P.maxDurationVerifiedAccountS ? ` (hasta ${P.maxDurationVerifiedAccountS} s solo con cuenta verificada)` : ""}`);
    }
    if (P.maxSizeMB) add(sizeMB <= P.maxSizeMB ? "PASS" : "FAIL", "Peso", `${sizeMB.toFixed(1)} MB ≤ ${P.maxSizeMB} MB`);
    if (P.faststart && !P.isMaster) {
      const fs = faststart(file);
      add(fs === true ? "PASS" : fs === false ? (delivery ? "FAIL" : "WARN") : "INFO", "Fast start (moov al inicio)", fs === true ? "sí" : fs === false ? "no — re-muxear: ffmpeg -i in.mp4 -c copy -movflags +faststart out.mp4" : "no aplica");
    }
  }
  const tgt = { ...specs.loudness, ...(P?.loudness || {}) };
  if (lufsArg !== null && isFinite(lufsArg)) tgt.integrated = lufsArg;
  if (a) {
    if (P?.audioCodec) add(P.audioCodec.includes(a.codec_name) ? "PASS" : delivery || P.isMaster ? "FAIL" : "WARN", "Códec de audio", `${a.codec_name} (esperado ${P.audioCodec.join("/")})`);
    if (Number(a.sample_rate) !== 48000) add(delivery ? "FAIL" : "WARN", "Sample rate", `${a.sample_rate} Hz (esperado 48000)`);
    if (P?.loudness || !P?.isMaster) {
      const L = loudness(file);
      const fix = delivery ? "" : " — se normaliza en npm run deliver";
      if (isFinite(L.I)) add(hard(Math.abs(L.I - tgt.integrated) <= tgt.tolerance), "Loudness integrado", `${L.I.toFixed(1)} LUFS (objetivo ${tgt.integrated} ±${tgt.tolerance}${lufsArg !== null ? ", --lufs" : ""})${fix}`);
      else add(hard(false), "Loudness integrado", "silencio total en la pista de audio");
      if (isFinite(L.TP)) add(hard(L.TP <= tgt.truePeak), "True peak", `${L.TP.toFixed(1)} dBTP (máx ${tgt.truePeak})${fix}`);
    }
  } else {
    const need = P?.requiresAudio && !allowSilent;
    add(need ? (delivery ? "FAIL" : "WARN") : "INFO", "Audio", need ? `sin pista de audio y ${P.label} la requiere (pieza muda a propósito: --allow-silent y registrarlo en el brief)` : "sin pista de audio (OK para esta plataforma/overlay o con --allow-silent)");
  }

  const blacks = detect(file, "blackdetect=d=0.4:pix_th=0.06", /black_start:([\d.]+) black_end:([\d.]+)/g).filter(([s, e]) => s > 0.3 && e < dur - 0.3);
  add(blacks.length ? "WARN" : "PASS", "Negros a mitad de pieza", blacks.length ? blacks.map(([s, e]) => `${s.toFixed(2)}–${e.toFixed(2)} s`).join(", ") : "ninguno");
  const freezes = detect(file, "freezedetect=n=0.002:d=4", /freeze_start: ([\d.]+)[\s\S]*?freeze_duration: ([\d.]+)/g);
  add(freezes.length ? "WARN" : "PASS", "Congelados ≥ 4 s", freezes.length ? freezes.map(([s, d]) => `${s.toFixed(1)} s (${d.toFixed(1)} s) — ¿hold intencional o escena muerta?`).join("; ") : "ninguno");
  const F = flashes(file, fps);
  add(F.maxFlashesPerSecond > 3 ? "FAIL" : F.maxFlashesPerSecond === 3 ? "WARN" : "PASS", "Fotosensibilidad (heurística WCAG 2.3.1)", `máx ${F.maxFlashesPerSecond} destellos/s${F.maxFlashesPerSecond ? ` (cerca de ${F.at} s)` : ""} — heurística de frame completo; para entregas sensibles correr EA IRIS o PEAT`);

  const outDir = args.includes("--out") ? resolve(args[args.indexOf("--out") + 1]) : join(dirname(dirname(file)), "qa");
  mkdirSync(outDir, { recursive: true });
  const sheet = contactSheet(file, outDir, dur);
  add("INFO", "Contact sheet", sheet ? sheet : "no se pudo generar");

  const fails = rows.filter((r) => r.status === "FAIL").length;
  const warns = rows.filter((r) => r.status === "WARN").length;
  anyFail ||= fails > 0;
  const verdict = fails ? "FAIL" : warns ? "PASS con advertencias" : "PASS";
  const md = `# QA técnico — ${basename(file)}\n\nGenerado: ${new Date().toISOString()} · Veredicto: **${verdict}** (${fails} fail, ${warns} warn)\n\n| Estado | Chequeo | Detalle |\n|---|---|---|\n${rows.map((r) => `| ${r.status} | ${r.check} | ${String(r.detail).replace(/\|/g, "\\|")} |`).join("\n")}\n\n> El QA automático no reemplaza: visionado completo en teléfono real, escucha en parlante de teléfono, verificación de claims y del checklist legal (templates/qa-checklist.md).\n`;
  const report = join(outDir, basename(file).replace(/\.\w+$/, "") + (platformArg && delivery ? `_${platformArg}` : "") + "_qa.md");
  writeFileSync(report, md);
  writeFileSync(report.replace(/\.md$/, ".json"), JSON.stringify({ file, platform: pid, mode: delivery ? "delivery" : "draft", verdict, rows }, null, 2));
  const icon = { PASS: "✓", WARN: "⚠", FAIL: "✗", INFO: "·" };
  console.log(`\n${fails ? "✗" : "✓"} ${basename(file)} → ${verdict}`);
  for (const r of rows) console.log(`  ${icon[r.status]} ${r.check}: ${r.detail}`);
  console.log(`  reporte: ${report}`);
}
process.exit(anyFail ? 1 : 0);
