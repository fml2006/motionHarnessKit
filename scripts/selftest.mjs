#!/usr/bin/env node
// selftest: prueba de punta a punta de la cadena de entrega con material sintético (no creativo).
//   node scripts/selftest.mjs [--keep] [--docker]
// Arma projects/_selftest-<ts>/ con 3 escenas sin cifras y una pista de ruido rosa a ≈ −20 LUFS,
// corre `deliver --platform youtube` y verifica de forma independiente:
//   · DELIVERY: H.264 + AAC 48 kHz, −14 ±1 LUFS, true peak ≤ −1 dBTP, faststart
//   · ARCHIVE: ProRes 422 HQ 10 bit + PCM 24 bit
//   · QA en modo entrega: PASS para youtube y archive; deliver sale con código 0
//   · gate negativo: qa --delivery sobre un video mudo para youtube tiene que dar FAIL (exit 1)
// Borra el proyecto al final salvo --keep. Correlo después de cambiar versiones (HyperFrames, ffmpeg, Chrome).
import { existsSync, mkdirSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT } from "./lib/common.mjs";

const keep = process.argv.includes("--keep");
const ts = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12);
const slug = `selftest-${ts}`;
const dir = join(ROOT, "projects", `_${slug}`);
const checks = [];
const check = (ok, name, detail) => {
  checks.push({ ok, name, detail });
  console.log(`  ${ok ? "✓" : "✗"} ${name}: ${detail}`);
};
const ff = (a) => spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...a], { encoding: "utf8", maxBuffer: 1 << 28 });
const probe = (file, sel) => (spawnSync("ffprobe", ["-v", "error", "-select_streams", sel, "-show_entries", "stream=codec_name,profile,pix_fmt,sample_fmt,sample_rate,bits_per_raw_sample", "-of", "json", file], { encoding: "utf8" }).stdout || "{}");
const loud = (file) => {
  const t = ff(["-i", file, "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr || "";
  const s = t.slice(t.lastIndexOf("Summary:"));
  return { I: parseFloat((s.match(/I:\s+(-?[\d.]+) LUFS/) || [])[1]), TP: parseFloat((s.match(/Peak:\s+(-?[\d.]+) dBFS/) || [])[1]) };
};

console.log(`\nselftest · ${dir.replace(ROOT + "/", "")}\n`);
mkdirSync(join(dir, "comp", "assets", "audio"), { recursive: true });
for (const d of ["research", "review", "renders", "qa", "delivery"]) mkdirSync(join(dir, d), { recursive: true });

// pista sintética: ruido rosa con semilla fija, llevado a ≈ −20 LUFS (lejos del objetivo, para que la normalización trabaje)
const wav = join(dir, "comp", "assets", "audio", "selftest-pink.wav");
const raw = join(dir, "renders", "pink-raw.wav");
ff(["-y", "-f", "lavfi", "-i", "anoisesrc=color=pink:amplitude=0.2:duration=14:seed=42", "-ar", "48000", "-ac", "2", "-c:a", "pcm_s24le", raw]);
const g = -20 - loud(raw).I;
ff(["-y", "-i", raw, "-af", `volume=${g.toFixed(2)}dB`, "-c:a", "pcm_s24le", wav]);
rmSync(raw);
const inL = loud(wav);
check(Math.abs(inL.I + 20) <= 0.5, "Pista de entrada", `${inL.I.toFixed(1)} LUFS (buscado ≈ −20)`);

writeFileSync(
  join(dir, "scenes.json"),
  JSON.stringify(
    {
      $comment: "Proyecto sintético de selftest: lo crea y borra scripts/selftest.mjs.",
      title: "Selftest de entrega",
      slug,
      type: "explainer",
      purpose: "selftest",
      date: new Date().toISOString().slice(0, 10),
      master: "landscape",
      formats: ["landscape"],
      defaultTransition: "cut",
      audio: { music: { src: "assets/audio/selftest-pink.wav", volume: 1 } },
      scenes: [
        { id: "s01-titulo", block: "title-card", duration: 6, vars: { kicker: "Selftest", headline: "Prueba de la *cadena* de entrega", subtitle: "Material sintético, no creativo." } },
        { id: "s02-idea", block: "kinetic-statement", duration: 4, vars: { text: "El audio se *normaliza* una sola vez." } },
        { id: "s03-cierre", block: "end-card", duration: 4, vars: { cta: "Fin de la|*prueba*", link: "selftest.local", note: "" } },
      ],
    },
    null,
    2
  ) + "\n"
);

const dArgs = [join(ROOT, "scripts", "deliver.mjs"), dir, "--platform", "youtube"];
if (process.argv.includes("--docker")) dArgs.push("--docker");
const d = spawnSync(process.execPath, dArgs, { stdio: "inherit" });
console.log("\nVerificación independiente:");
check(d.status === 0, "deliver", `exit ${d.status}`);

const base = join(dir, "delivery", `${slug}_landscape_v001`);
const dlv = `${base}_DELIVERY.mp4`;
const arc = `${base}_ARCHIVE.mov`;
if (existsSync(dlv)) {
  const L = loud(dlv);
  check(Math.abs(L.I + 14) <= 1, "DELIVERY loudness", `${L.I.toFixed(1)} LUFS (−14 ±1)`);
  check(L.TP <= -1, "DELIVERY true peak", `${L.TP.toFixed(1)} dBTP (≤ −1)`);
  const v = JSON.parse(probe(dlv, "v:0")).streams?.[0] || {};
  const a = JSON.parse(probe(dlv, "a:0")).streams?.[0] || {};
  check(v.codec_name === "h264" && v.pix_fmt === "yuv420p", "DELIVERY video", `${v.codec_name} ${v.profile} ${v.pix_fmt}`);
  check(a.codec_name === "aac" && a.sample_rate === "48000", "DELIVERY audio", `${a.codec_name} ${a.sample_rate} Hz`);
} else check(false, "DELIVERY", "no existe");
if (existsSync(arc)) {
  const v = JSON.parse(probe(arc, "v:0")).streams?.[0] || {};
  const a = JSON.parse(probe(arc, "a:0")).streams?.[0] || {};
  check(v.codec_name === "prores" && v.profile === "HQ" && v.pix_fmt === "yuv422p10le", "ARCHIVE video", `${v.codec_name} ${v.profile} ${v.pix_fmt}`);
  check(a.codec_name === "pcm_s24le" && a.sample_rate === "48000", "ARCHIVE audio", `${a.codec_name} ${a.sample_rate} Hz`);
  const L = loud(arc);
  check(Math.abs(L.I + 14) <= 1 && L.TP <= -1, "ARCHIVE loudness", `${L.I.toFixed(1)} LUFS · ${L.TP.toFixed(1)} dBTP`);
} else check(false, "ARCHIVE", "no existe");
for (const [f, p] of [[dlv, "youtube"], [arc, "archive"]]) {
  const rep = join(dir, "qa", `${f.split("/").pop().replace(/\.\w+$/, "")}_${p}_qa.json`);
  const v = existsSync(rep) ? JSON.parse(readFileSync(rep, "utf8")).verdict : "sin reporte";
  check(String(v).startsWith("PASS"), `QA ${p}`, v);
}

// gate negativo: un entregable mudo para una plataforma que requiere audio tiene que fallar
const mute = join(dir, "renders", "mute.mp4");
ff(["-y", "-i", dlv, "-an", "-c:v", "copy", "-movflags", "+faststart", mute]);
const q = spawnSync(process.execPath, [join(ROOT, "scripts", "qa.mjs"), mute, "--platform", "youtube", "--delivery", "--out", join(dir, "qa")], { encoding: "utf8" });
check(q.status === 1, "Gate negativo (mudo en youtube)", `qa exit ${q.status} (esperado 1)`);

const failed = checks.filter((c) => !c.ok).length;
if (!keep) rmSync(dir, { recursive: true, force: true });
else console.log(`\nProyecto conservado: ${dir.replace(ROOT + "/", "")}`);
console.log(failed ? `\n✗ selftest: ${failed} chequeo(s) fallaron.` : `\n✓ selftest: ${checks.length} chequeos OK. La cadena render → mezcla PCM → loudness → master → QA funciona en esta máquina.`);
process.exit(failed ? 1 : 0);
