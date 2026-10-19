#!/usr/bin/env node
// Hook PostToolUse: valida automáticamente lo que Claude acaba de editar.
//  - brand.config.json      → validación de marca (contraste, easings, campos)
//  - scenes.json            → rebuild de raíces del proyecto
//  - comp/compositions/*.html → lint de HyperFrames del proyecto
//  - archivos generados     → aviso de que se pisan en el próximo build
// Exit 2 + stderr = feedback que Claude ve y debe corregir. Exit 0 = OK.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

let input = {};
try {
  input = JSON.parse(readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}
const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const file = input?.tool_input?.file_path || "";
if (!file) process.exit(0);
const rel = relative(root, file).split(sep).join("/");
const env = { ...process.env, HYPERFRAMES_NO_TELEMETRY: "1", HYPERFRAMES_NO_UPDATE_CHECK: "1", HYPERFRAMES_SKIP_SKILLS: "1" };
const run = (cmd, args) => spawnSync(cmd, args, { cwd: root, env, encoding: "utf8", timeout: 110000 });
const fail = (msg) => {
  process.stderr.write(msg.trim() + "\n");
  process.exit(2);
};
const note = (msg) => {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: msg.trim() } }));
  process.exit(0);
};

if (rel === "brand/brand.config.json") {
  const r = run(process.execPath, ["scripts/brand-apply.mjs", "--check"]);
  if (r.status !== 0) fail(`brand.config.json inválido:\n${r.stderr || r.stdout}`);
  const g = run(process.execPath, ["scripts/brand-apply.mjs"]);
  if (g.status !== 0) fail(`npm run brand falló:\n${g.stderr || g.stdout}`);
  note(`Marca regenerada automáticamente (brand/dist, MOTION.md, brand.md).\n${g.stdout}${g.stderr || ""}\nPara aplicarla a un proyecto existente: npm run build:roots -- <proyecto>`);
}

const gen = rel.match(/^projects\/[^/]+\/(formats\/|comp\/index\.html$)/) || rel.startsWith("brand/dist/") || rel === "MOTION.md" || rel === "brand.md";
if (gen) fail(`${rel} es un archivo GENERADO: tu cambio se pierde en el próximo build. Editá la fuente (scenes.json, comp/compositions/*.html o brand/brand.config.json) y regenerá.`);

const proj = rel.match(/^projects\/([^/]+)\//);
if (!proj) process.exit(0);
const projectDir = join(root, "projects", proj[1]);

if (rel.endsWith("/scenes.json")) {
  const r = run(process.execPath, ["scripts/build-roots.mjs", projectDir]);
  if (r.status !== 0) fail(`scenes.json no compila:\n${r.stderr || r.stdout}`);
  note(`build:roots ejecutado automáticamente:\n${r.stdout}`);
}

if (/\/comp\/compositions\/.+\.html$/.test(rel)) {
  const hf = join(root, "node_modules", ".bin", "hyperframes");
  const r = run(hf, ["lint", join(projectDir, "comp")]);
  const out = (r.stdout || "") + (r.stderr || "");
  // Gate por exit code (no solo por el texto): si el lint no corre o falla, se frena igual.
  if (r.error || r.status === null) fail(`hyperframes lint no pudo correr en ${proj[1]}/comp: ${r.error?.message || "timeout"}`);
  const m = out.match(/(\d+) error\(s\), (\d+) warning\(s\)/);
  if (r.status !== 0 || (m && (Number(m[1]) > 0 || Number(m[2]) > 0))) fail(`hyperframes lint en ${proj[1]}/comp (exit ${r.status}):\n${out.slice(-4000)}`);
}
process.exit(0);
