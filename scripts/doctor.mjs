#!/usr/bin/env node
// doctor: verifica que el entorno pueda producir (versiones, binarios, marca, skills, privacidad).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, hfEnv, runHf } from "./lib/common.mjs";

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
const ffm = ver("ffmpeg", ["-version"]);
ffm ? ok("ffmpeg", ffm.slice(0, 40)) : bad("ffmpeg", "no encontrado (brew install ffmpeg / apt install ffmpeg)");
ver("ffprobe", ["-version"]) ? ok("ffprobe", "ok") : bad("ffprobe", "no encontrado");

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const pin = pkg.devDependencies?.hyperframes;
existsSync(join(ROOT, "node_modules", "hyperframes")) ? ok("HyperFrames", `fijado en ${pin}`) : bad("HyperFrames", "falta: npm install");
/^\d+\.\d+\.\d+$/.test(pin || "") ? ok("Versión fijada", "sin rangos ^ ~ (renders reproducibles)") : warn("Versión fijada", `usá versión exacta, no "${pin}"`);
existsSync(join(ROOT, "package-lock.json")) ? ok("Lockfile", "package-lock.json presente (commitealo)") : warn("Lockfile", "falta package-lock.json");

const env = hfEnv();
env.HYPERFRAMES_BROWSER_PATH ? ok("Chromium", env.HYPERFRAMES_BROWSER_PATH) : ok("Chromium", "HyperFrames usa su chrome-headless-shell fijado (se descarga la primera vez)");
ok("Telemetría HyperFrames", "desactivada por los scripts del kit (HYPERFRAMES_NO_TELEMETRY=1, DO_NOT_TRACK=1)");

existsSync(join(ROOT, "brand", "dist", "tokens.css")) ? ok("Marca", "brand/dist/ generado") : bad("Marca", "corré npm run brand");
const chk = spawnSync(process.execPath, [join(ROOT, "scripts", "brand-apply.mjs"), "--check"], { encoding: "utf8" });
chk.status === 0 ? ok("brand.config.json", (chk.stdout || "").trim().split("\n")[0]) : bad("brand.config.json", (chk.stderr || chk.stdout).trim());
const cfg = JSON.parse(readFileSync(join(ROOT, "brand", "brand.config.json"), "utf8"));
cfg.meta?.name === "TuMarca" ? warn("Identidad", "sigue la marca placeholder 'TuMarca': corré /marca en Claude Code") : ok("Identidad", cfg.meta?.name);
for (const r of ["display", "body", "mono"]) {
  const t = cfg.typography?.[r];
  if (t && !t.license) warn(`Fuente ${r}`, `${t.family}: declará la licencia (typography.${r}.license) y confirmá que cubre video`);
}
const skillsDir = join(ROOT, ".claude", "skills");
const skills = existsSync(skillsDir) ? readdirSync(skillsDir).filter((d) => existsSync(join(skillsDir, d, "SKILL.md"))) : [];
skills.length ? ok("Skills del kit", skills.join(", ")) : bad("Skills del kit", "faltan .claude/skills/*");
const hfSkills = [join(ROOT, ".claude", "skills", "hyperframes"), join(process.env.HOME || "", ".claude", "skills", "hyperframes"), join(ROOT, ".agents", "skills", "hyperframes")];
hfSkills.some(existsSync) ? ok("Skills HyperFrames", "instaladas") : warn("Skills HyperFrames", "opcional pero recomendado: npx hyperframes skills update (versionar el hash en PROVENANCE)");

const d = runHf(["--version"], { capture: true });
d.status === 0 ? ok("CLI hyperframes", (d.stdout || "").trim()) : bad("CLI hyperframes", "no ejecuta");

console.log("\nmotion-harness-kit · doctor\n");
for (const [i, c, dsc] of rows) console.log(`  ${i} ${c.padEnd(24)} ${dsc}`);
const fails = rows.filter((r) => r[0] === "✗").length;
console.log(fails ? `\n✗ ${fails} problema(s) bloqueante(s).` : "\n✓ Listo para producir.");
process.exit(fails ? 1 : 0);
