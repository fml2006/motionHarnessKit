#!/usr/bin/env node
// doctor: verifica que el entorno pueda producir (versiones, binarios, navegador, marca, skills, privacidad).
//   node scripts/doctor.mjs          diagnóstico (no cambia nada)
//   node scripts/doctor.mjs --fix    = npm run setup: apaga la telemetría de HyperFrames en la config del usuario
//                                    y descarga el Chrome fijado si falta. Correrlo una vez por máquina.
import { listBrands, defaultBrand } from "./lib/brands.mjs";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, hfBin, runHf, browserInfo, ffmpegVersion } from "./lib/common.mjs";

const fix = process.argv.includes("--fix");
const rows = [];
const ok = (c, d) => rows.push(["✓", c, d]);
const warn = (c, d) => rows.push(["⚠", c, d]);
const bad = (c, d) => rows.push(["✗", c, d]);
const ver = (cmd, a) => {
  const r = spawnSync(cmd, a, { encoding: "utf8" });
  return r.status === 0 ? (r.stdout || r.stderr).split("\n")[0] : null;
};

const major = Number(process.versions.node.split(".")[0]);
major >= 22 ? ok("Node", process.version) : bad("Node", `${process.version} (HyperFrames requiere ≥ 22)`);
const ffv = ffmpegVersion();
ffv ? ok("ffmpeg", `${ffv} (encodea los entregables: queda registrado en cada entrega)`) : bad("ffmpeg", "no encontrado (brew install ffmpeg / apt install ffmpeg)");
ver("ffprobe", ["-version"]) ? ok("ffprobe", "ok") : bad("ffprobe", "no encontrado");
if (ffv) {
  const enc = spawnSync("ffmpeg", ["-hide_banner", "-encoders"], { encoding: "utf8" }).stdout || "";
  const missing = ["libx264", "prores_ks", "aac", "pcm_s24le"].filter((e) => !enc.includes(` ${e} `));
  missing.length ? bad("Encoders ffmpeg", `faltan ${missing.join(", ")} (los usa deliver)`) : ok("Encoders ffmpeg", "libx264, prores_ks, aac, pcm_s24le");
}

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const pin = pkg.devDependencies?.hyperframes;
existsSync(join(ROOT, "node_modules", "hyperframes")) ? ok("HyperFrames", `fijado en ${pin}`) : bad("HyperFrames", "falta: npm ci");
/^\d+\.\d+\.\d+$/.test(pin || "") ? ok("Versión fijada", "sin rangos ^ ~ (renders reproducibles)") : warn("Versión fijada", `usá versión exacta, no "${pin}"`);
existsSync(join(ROOT, "package-lock.json")) ? ok("Lockfile", "package-lock.json presente (commitealo)") : warn("Lockfile", "falta package-lock.json");
const d = runHf(["--version"], { capture: true });
d.status === 0 ? ok("CLI hyperframes", (d.stdout || "").trim()) : bad("CLI hyperframes", "no ejecuta");

// navegador de render: el fijado por HyperFrames salvo override explícito
let br = browserInfo();
if (br.source === "missing" && fix) {
  runHf(["browser", "ensure"]);
  br = browserInfo();
}
if (br.source === "hyperframes") ok("Navegador de render", `Chrome fijado por HyperFrames ${pin}: ${br.path}`);
else if (br.source === "override") warn("Navegador de render", `override ${br.path} (MHK_BROWSER_PATH/HYPERFRAMES_BROWSER_PATH): los renders pueden diferir de otras máquinas; registralo en PROVENANCE`);
else bad("Navegador de render", "no hay Chrome: npm run setup (npx hyperframes browser ensure)");
const dk = spawnSync("docker", ["info", "--format", "{{.ServerVersion}}"], { encoding: "utf8" });
if (dk.status === 0) ok("Docker", `${(dk.stdout || "").trim()} corriendo: render/deliver --docker disponible (reproducibilidad exacta entre máquinas)`);
else if (ver("docker", ["--version"])) warn("Docker", "instalado pero no corre: --docker no disponible (el render local usa el Chrome fijado)");
else warn("Docker", "no instalado: --docker no disponible (opcional; recomendado para el render de entrega en equipos grandes)");

// telemetría: lo que importa es la config del usuario (un `npx hyperframes preview` manual no pasa por los scripts)
const telemetry = () => {
  const env = { ...process.env, NO_COLOR: "1", HYPERFRAMES_NO_UPDATE_CHECK: "1" };
  delete env.HYPERFRAMES_NO_TELEMETRY;
  delete env.DO_NOT_TRACK;
  const r = spawnSync(hfBin(), ["telemetry", "status"], { encoding: "utf8", env, cwd: ROOT });
  return { status: ((r.stdout || "").match(/Status:\s+(\w+)/) || [])[1] || "desconocido", source: ((r.stdout || "").match(/Source:\s+(\S+)/) || [])[1] || "?", env };
};
let t = telemetry();
if (t.status === "enabled" && fix) {
  spawnSync(hfBin(), ["telemetry", "disable"], { encoding: "utf8", env: t.env, cwd: ROOT });
  t = telemetry();
}
if (t.status === "disabled") ok("Telemetría HyperFrames", `apagada en la config del usuario (${t.source}); los scripts además fijan HYPERFRAMES_NO_TELEMETRY=1`);
else if (t.status === "enabled") bad("Telemetría HyperFrames", "ENCENDIDA en ~/.hyperframes/config.json: los scripts del kit la apagan, pero un `npx hyperframes` manual (preview, lint) la manda. Corré: npm run setup");
else warn("Telemetría HyperFrames", `no pude leer el estado (${t.status}): verificá con npx hyperframes telemetry status`);
process.env.HYPERFRAMES_NO_TELEMETRY || process.env.DO_NOT_TRACK
  ? ok("Variables de entorno", "HYPERFRAMES_NO_TELEMETRY/DO_NOT_TRACK presentes en esta shell")
  : warn("Variables de entorno", "esta shell no tiene HYPERFRAMES_NO_TELEMETRY=1 (recomendado en el perfil de cada máquina: export HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1)");

// marcas del estudio (brands/<slug>/): cada una aplicada, válida, con contraste OK y licencias de fuentes declaradas
const brands = listBrands();
const def = defaultBrand();
brands.length ? ok("Marcas", `${brands.length} en brands/ (${brands.join(", ")}) · default ${def}`) : bad("Marcas", "no hay marcas en brands/: npm run brand:new -- <slug>");
for (const b of brands) {
  if (!existsSync(join(ROOT, "brands", b, "dist", "tokens.css"))) { bad(`Marca ${b}`, `sin aplicar: npm run brand -- ${b}`); continue; }
  const chk = spawnSync(process.execPath, [join(ROOT, "scripts", "brand-apply.mjs"), "--brand", b, "--check"], { encoding: "utf8" });
  if (chk.status !== 0) { bad(`Marca ${b}`, (chk.stderr || chk.stdout).trim().split("\n").slice(-3).join(" · ")); continue; }
  const cfg = JSON.parse(readFileSync(join(ROOT, "brands", b, "brand.config.json"), "utf8"));
  const line = (chk.stdout || "").trim().split("\n")[0].replace(/^✓ /, "");
  existsSync(join(ROOT, "brands", b, "LOOK.md")) ? ok(`Marca ${b}`, line) : warn(`Marca ${b}`, `${line} · falta brands/${b}/LOOK.md (dirección de arte): /marca ${b}`);
  if (cfg.meta?.name === "TuMarca") warn(`Identidad ${b}`, "sigue la marca placeholder 'TuMarca': corré /marca en Claude Code");
  for (const r of ["display", "body", "mono"]) {
    const ty = cfg.typography?.[r];
    if (ty && !ty.license) warn(`Fuente ${r} (${b})`, `${ty.family}: declará la licencia (typography.${r}.license) y confirmá que cubre video`);
  }
}

const skillsDir = join(ROOT, ".claude", "skills");
const skills = existsSync(skillsDir) ? readdirSync(skillsDir).filter((s) => existsSync(join(skillsDir, s, "SKILL.md"))) : [];
skills.length ? ok("Skills", `${skills.length} en .claude/skills`) : bad("Skills", "faltan .claude/skills/*");
const lockFile = join(skillsDir, "HYPERFRAMES_SKILLS.lock.json");
if (existsSync(lockFile)) {
  const lock = JSON.parse(readFileSync(lockFile, "utf8"));
  ok("Skills HyperFrames", `fijadas a ${lock.source}@${String(lock.commit).slice(0, 12)} (${Object.keys(lock.skills || {}).length} skills). Actualizar = scripts/install-hf-skills.sh con HF_SHA nuevo, en una ventana planificada (nunca "skills update")`);
} else warn("Skills HyperFrames", "sin lockfile: instalalas fijadas con scripts/install-hf-skills.sh (HF_SHA=<commit>)");

console.log("\nmotion-harness-kit · doctor\n");
for (const [i, c, dsc] of rows) console.log(`  ${i} ${c.padEnd(24)} ${dsc}`);
const fails = rows.filter((r) => r[0] === "✗").length;
console.log(fails ? `\n✗ ${fails} problema(s) bloqueante(s).${fix ? "" : " Probá: npm run setup"}` : "\n✓ Listo para producir. Después de cambiar versiones (HyperFrames, ffmpeg, Chrome) corré npm run selftest.");
process.exit(fails ? 1 : 0);
