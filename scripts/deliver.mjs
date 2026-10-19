#!/usr/bin/env node
// deliver: cadena de entrega completa de una versión aprobada (G12-G14). Un solo comando, sin pasos manuales en el medio.
//   node scripts/deliver.mjs <proyecto> --platform youtube,reels[,linkedin=square,...]
//                            [--lufs -16] [--allow-silent] [--rebrand] [--docker] [--allow-check-warnings] [--version 4]
//
// Orden (no se puede alterar):
//   1. build --strict + lint + check --strict + render del intermedio ProRes 4444 por formato (render.mjs --master)
//   2. mezcla de audio PCM 48 kHz / 24 bit armada desde la timeline de HyperFrames (`hyperframes timeline --json`):
//      mismas pistas, inicios, recortes y volúmenes que el render, sin pasar por AAC
//   3. master.sh: loudness en dos pasadas sobre la mezcla PCM → ARCHIVE (ProRes 422 HQ + PCM 24) y DELIVERY
//      (H.264 BT.709 faststart + AAC) — una sola codificación con pérdida — y re-medición de las salidas
//   4. qa.mjs --delivery por cada plataforma pedida (+ el ARCHIVE): cualquier FAIL → exit 1
//   5. reporte delivery/<slug>_v###_ENTREGA.md + línea en review/CHANGELOG.md
//
// Plataformas y formatos: delivery/specs.json. Cada plataforma usa el primer formato de su lista que exista en
// scenes.json → formats; `plataforma=formato` lo fuerza (ej. linkedin=square). Las que comparten formato y objetivo
// de loudness comparten archivo DELIVERY; si el objetivo difiere (ej. evento a −16) se genera otro con sufijo _L16.
// Captions: no se queman acá. Ver /entregar (G11).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, isAbsolute, basename } from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, readJson, resolveProject, runHf, ffmpegVersion, browserInfo } from "./lib/common.mjs";

const args = process.argv.slice(2);
const VALUE_FLAGS = ["--platform", "--lufs", "--version"];
const val = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : null);
const projectArg = args.find((a, i) => !a.startsWith("--") && !VALUE_FLAGS.includes(args[i - 1]));
const specs = readJson(join(ROOT, "delivery", "specs.json"));
if (!projectArg || !val("--platform")) {
  console.error(`Uso: npm run deliver -- <proyecto> --platform <lista> [--lufs n] [--allow-silent] [--rebrand] [--docker]\nPlataformas: ${Object.keys(specs.platforms).filter((p) => !specs.platforms[p].isMaster).join(", ")}`);
  process.exit(1);
}
const projectDir = resolveProject(projectArg);
const plan0 = readJson(join(projectDir, "scenes.json"));
const planFormats = plan0.formats || [plan0.master || "landscape"];
const lufsOverride = val("--lufs") !== null ? Number(val("--lufs")) : null;
const allowSilent = args.includes("--allow-silent");
const fail = (msg) => {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
};

// 0) matriz plataforma → formato → objetivo de loudness
const wanted = val("--platform").split(",").map((s) => s.trim()).filter(Boolean);
const matrix = [];
for (const w of wanted) {
  const [pid, forced] = w.split("=");
  const P = specs.platforms[pid];
  if (!P || P.isMaster) fail(`Plataforma "${pid}" no existe en delivery/specs.json (o no es un entregable).`);
  const fmt = forced || (P.formats || []).find((f) => planFormats.includes(f));
  if (!fmt) fail(`${P.label} necesita uno de estos formatos: ${(P.formats || []).join(", ")}; el plan tiene ${planFormats.join(", ")}. Agregalo en scenes.json → formats.`);
  if (!planFormats.includes(fmt)) fail(`El formato "${fmt}" no está en scenes.json → formats (${planFormats.join(", ")}).`);
  const L = { ...specs.loudness, ...(P.loudness || {}) };
  if (lufsOverride !== null && isFinite(lufsOverride)) L.integrated = lufsOverride;
  matrix.push({ pid, P, fmt, L });
}
const formats = [...new Set(matrix.map((m) => m.fmt))];
console.log("Matriz de entrega:");
for (const m of matrix) console.log(`  · ${m.P.label.padEnd(30)} → ${m.fmt} · ${m.L.integrated} LUFS / ${m.L.truePeak} dBTP`);

// 1) render del intermedio (build estricto + gates incluidos)
const rArgs = [join(ROOT, "scripts", "render.mjs"), projectDir, "--master", "--formats", formats.join(",")];
for (const f of ["--rebrand", "--docker", "--allow-check-warnings"]) if (args.includes(f)) rArgs.push(f);
if (val("--version")) rArgs.push("--version", val("--version"));
const r = spawnSync(process.execPath, rArgs, { stdio: "inherit" });
if (r.status !== 0) fail("El render del intermedio falló o los gates lo frenaron. No hay entrega.");
const manifest = readJson(join(projectDir, "renders", ".last-render.json"));
const plan = readJson(join(projectDir, "scenes.json"));
const tag = manifest.tag;
const slug = plan.slug || "video";
const ddir = join(projectDir, "delivery");
mkdirSync(ddir, { recursive: true });

const ff = (a) => spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...a], { encoding: "utf8", maxBuffer: 1 << 28 });
const hasAudioStream = (file) => (spawnSync("ffprobe", ["-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", file], { encoding: "utf8" }).stdout || "").trim().length > 0;
const integrated = (file) => {
  const t = ff(["-i", file, "-map", "0:a:0", "-af", "ebur128", "-f", "null", "-"]).stderr || "";
  return parseFloat((t.slice(t.lastIndexOf("Summary:")).match(/I:\s+(-?[\d.]+) LUFS/) || [])[1]);
};

// 2) mezcla PCM desde la timeline (lo que HyperFrames va a sonar, sin su AAC intermedio)
function buildMix(fmt, compDir, out) {
  const t = runHf(["timeline", compDir, "--json"], { capture: true });
  let T;
  try {
    T = JSON.parse((t.stdout || "").slice((t.stdout || "").indexOf("{"))).timeline;
  } catch {
    return { ok: false, reason: `hyperframes timeline no devolvió JSON (exit ${t.status})` };
  }
  const rows = [];
  const walk = (list) => {
    for (const row of list || []) {
      rows.push(row);
      walk(row.children);
    }
  };
  for (const tr of T.tracks || []) walk(tr.rows);
  const unsupported = [];
  const clips = [];
  for (const row of rows) {
    const audible = row.kind === "audio" || row.trackKind === "audio" || row.kind === "video";
    if (!audible || !row.src) continue;
    if (/^https?:/i.test(row.src)) {
      unsupported.push(`${row.id}: src remoto`);
      continue;
    }
    const file = isAbsolute(row.src) ? row.src : resolve(compDir, dirname(row.file || "index.html"), row.src);
    if (!existsSync(file)) {
      unsupported.push(`${row.id}: no existe ${file.replace(ROOT + "/", "")}`);
      continue;
    }
    if (row.kind === "video" && (row.volume === 0 || !hasAudioStream(file))) continue;
    if ((row.lanes || []).length) unsupported.push(`${row.id}: automatización de volumen (lanes)`);
    if (row.playbackRate && row.playbackRate !== 1) unsupported.push(`${row.id}: playbackRate ${row.playbackRate}`);
    if (row.audioGroup) unsupported.push(`${row.id}: audioGroup ${row.audioGroup}`);
    clips.push({ id: row.id, file, start: Number(row.absStart ?? row.start ?? 0), dur: Number(row.duration), mediaStart: Number(row.mediaStart || 0), volume: row.volume ?? 1 });
  }
  if (unsupported.length) return { ok: false, reason: `no reproducible en PCM: ${unsupported.join("; ")}` };
  if (!clips.length) return { ok: true, silent: true, clips: [] };
  const total = Number(T.duration);
  const inputs = ["-f", "lavfi", "-t", String(total), "-i", "anullsrc=r=48000:cl=stereo"];
  const chains = [];
  clips.forEach((c, i) => {
    inputs.push("-ss", String(c.mediaStart), "-t", String(c.dur), "-i", c.file);
    chains.push(`[${i + 1}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,volume=${c.volume},adelay=${Math.round(c.start * 1000)}:all=1[a${i}]`);
  });
  const fc = `${chains.join(";")};[0:a]${clips.map((_, i) => `[a${i}]`).join("")}amix=inputs=${clips.length + 1}:normalize=0:duration=first[m]`;
  const m = ff(["-y", ...inputs, "-filter_complex", fc, "-map", "[m]", "-t", String(total), "-ar", "48000", "-c:a", "pcm_s24le", out]);
  if (m.status !== 0 || !existsSync(out)) return { ok: false, reason: `ffmpeg no pudo mezclar: ${(m.stderr || "").split("\n").slice(-3).join(" ")}` };
  return { ok: true, silent: false, clips };
}

const results = [];
const notes = [];
let anyFail = false;
for (const fmt of formats) {
  const out = manifest.outputs.find((o) => o.format === fmt);
  if (!out || !existsSync(out.file)) fail(`No encuentro el intermedio de ${fmt} (renders/.last-render.json).`);
  const compDir = fmt === (plan.master || "landscape") ? join(projectDir, "comp") : join(projectDir, "formats", fmt);
  const base = `${slug}_${fmt}_${tag}`;
  const mixFile = join(projectDir, "renders", `${base}_mix.wav`);
  console.log(`\n▶ Mezcla PCM ${fmt}`);
  const mix = buildMix(fmt, compDir, mixFile);
  let audioArgs = [];
  if (mix.ok && !mix.silent) {
    audioArgs = ["--audio", mixFile];
    console.log(`  ✓ ${mix.clips.length} pista(s): ${mix.clips.map((c) => c.id).join(", ")} → ${mixFile.replace(projectDir + "/", "")}`);
    // red de seguridad: la mezcla propia tiene que sonar como la de HyperFrames (≤ 1,5 LU de diferencia)
    if (hasAudioStream(out.file)) {
      const a = integrated(mixFile);
      const b = integrated(out.file);
      if (isFinite(a) && isFinite(b) && Math.abs(a - b) > 1.5) {
        notes.push(`${fmt}: la mezcla PCM (${a.toFixed(1)} LUFS) difiere de la de HyperFrames (${b.toFixed(1)} LUFS): revisar pistas`);
        anyFail = true;
      }
    }
  } else if (mix.ok && mix.silent) {
    console.log("  · sin pistas de audio en la timeline");
    notes.push(`${fmt}: pieza sin audio`);
  } else {
    console.warn(`  ⚠ ${mix.reason}. Se usa el audio del intermedio (AAC de HyperFrames): doble codificación con pérdida.`);
    notes.push(`${fmt}: audio desde el AAC del intermedio (${mix.reason})`);
  }

  // un ARCHIVE por formato (al objetivo de la primera plataforma) y un DELIVERY por objetivo de loudness distinto
  const targets = [];
  for (const m of matrix.filter((x) => x.fmt === fmt)) {
    let t = targets.find((x) => x.L.integrated === m.L.integrated && x.L.truePeak === m.L.truePeak && x.L.tolerance === m.L.tolerance);
    if (!t) targets.push((t = { L: m.L, platforms: [] }));
    t.platforms.push(m);
  }
  targets.forEach((t, i) => {
    t.suffix = i === 0 ? "" : `_L${Math.abs(t.L.integrated)}`;
    const mArgs = [join(ROOT, "scripts", "master.sh"), out.file, ddir, ...audioArgs, "--name", base, "--lufs", String(t.L.integrated), "--tp", String(t.L.truePeak), "--tolerance", String(t.L.tolerance)];
    if (i > 0) mArgs.push("--delivery-only", "--suffix", t.suffix);
    console.log(`\n▶ Master ${fmt}${t.suffix} (${t.L.integrated} LUFS)`);
    const ms = spawnSync("bash", mArgs, { stdio: "inherit" });
    if (ms.status !== 0) {
      anyFail = true;
      notes.push(`${fmt}${t.suffix}: master.sh falló (exit ${ms.status})`);
    }
    t.file = join(ddir, `${base}_DELIVERY${t.suffix}.mp4`);
  });
  const archive = join(ddir, `${base}_ARCHIVE.mov`);

  // 4) QA por plataforma + ARCHIVE
  const qa = (file, pid, L) => {
    if (!existsSync(file)) return "FALTA";
    const q = [join(ROOT, "scripts", "qa.mjs"), file, "--platform", pid, "--delivery", "--out", join(projectDir, "qa")];
    if (L) q.push("--lufs", String(L.integrated));
    if (allowSilent) q.push("--allow-silent");
    const s = spawnSync(process.execPath, q, { stdio: "inherit" });
    const rep = join(projectDir, "qa", basename(file).replace(/\.\w+$/, "") + `_${pid}_qa.json`);
    const v = existsSync(rep) ? JSON.parse(readFileSync(rep, "utf8")).verdict : s.status === 0 ? "PASS" : "FAIL";
    if (s.status !== 0) anyFail = true;
    return v;
  };
  results.push({ fmt, platform: "archive", label: specs.platforms.archive.label, file: archive, verdict: qa(archive, "archive", targets[0]?.L), L: targets[0]?.L });
  for (const t of targets) for (const m of t.platforms) results.push({ fmt, platform: m.pid, label: m.P.label, file: t.file, verdict: qa(t.file, m.pid, lufsOverride !== null ? m.L : null), L: m.L });
}

// 5) reporte de entrega + changelog
const rel = (p) => p.replace(projectDir + "/", "");
const br = args.includes("--docker") ? "docker" : browserInfo().source === "override" ? "override (MHK_BROWSER_PATH)" : "chrome fijado por hyperframes";
const lock = plan.brandLock ? `${plan.brandLock.name} v${plan.brandLock.version} #${plan.brandLock.hash}` : "sin brandLock";
const md = `# Entrega ${slug} ${tag}

Generada: ${new Date().toISOString()} · Marca: ${lock} · Render: ${br} · ffmpeg ${ffmpegVersion()}
Veredicto: **${anyFail ? "FAIL — no entregar" : "PASS técnico"}** (falta la parte humana: visionado en teléfono, captions, checklists de QA y legal firmados)

| Plataforma | Formato | Archivo | Loudness objetivo | QA |
|---|---|---|---|---|
${results.map((x) => `| ${x.label} | ${x.fmt} | \`${rel(x.file)}\` | ${x.L ? `${x.L.integrated} LUFS ±${x.L.tolerance} / ${x.L.truePeak} dBTP` : "—"} | ${x.verdict} |`).join("\n")}

${notes.length ? `## Notas\n\n${notes.map((n) => `- ${n}`).join("\n")}\n\n` : ""}Reportes de QA: \`qa/*_qa.md\` · specs medidas: \`delivery/*_specs.txt\` · intermedios: \`renders/${slug}_*_${tag}_master.mov\` y \`_mix.wav\` (mezcla sin normalizar, sirve para re-apuntar loudness sin re-renderizar).
`;
const reportFile = join(ddir, `${slug}_${tag}_ENTREGA.md`);
writeFileSync(reportFile, md);
const log = join(projectDir, "review", "CHANGELOG.md");
writeFileSync(log, `- ${new Date().toISOString().slice(0, 16).replace("T", " ")} · ${tag} · ENTREGA ${results.filter((x) => x.platform !== "archive").map((x) => `${x.platform}:${x.verdict}`).join(", ")} · ${anyFail ? "FAIL" : "PASS técnico"}\n`, { flag: "a" });

console.log(`\nReporte: ${rel(reportFile)}`);
for (const x of results) console.log(`  ${x.verdict.startsWith("PASS") ? "✓" : "✗"} ${x.label.padEnd(42)} ${rel(x.file)} → ${x.verdict}`);
for (const n of notes) console.log(`  · ${n}`);
if (anyFail) fail(`Entrega ${tag} con FAIL: corregí y volvé a correr (no se entrega).`);
console.log(`\n✓ Entrega técnica ${tag} lista. Siguen los gates humanos: captions (G11), QA final y legal (G14).`);
