// Utilidades compartidas por los scripts del kit.
import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync, readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

// Entorno para la CLI de HyperFrames: sin telemetría, sin auto-updates (versiones fijadas = renders reproducibles).
export function hfEnv() {
  const env = { ...process.env, HYPERFRAMES_NO_TELEMETRY: "1", HYPERFRAMES_NO_UPDATE_CHECK: "1", HYPERFRAMES_SKIP_SKILLS: "1", DO_NOT_TRACK: "1" };
  if (!env.HYPERFRAMES_BROWSER_PATH) {
    for (const p of ["/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell"]) if (existsSync(p)) env.HYPERFRAMES_BROWSER_PATH = p;
  }
  return env;
}

export function hfBin() {
  const local = join(ROOT, "node_modules", ".bin", "hyperframes");
  return existsSync(local) ? local : "hyperframes";
}

export function runHf(args, opts = {}) {
  const r = spawnSync(hfBin(), args, { stdio: opts.capture ? "pipe" : "inherit", env: hfEnv(), cwd: opts.cwd || ROOT, encoding: "utf8" });
  return r;
}

export function copyDir(src, dst, filter = () => true) {
  mkdirSync(dst, { recursive: true });
  for (const name of readdirSync(src)) {
    const s = join(src, name);
    const d = join(dst, name);
    if (!filter(s, name)) continue;
    if (statSync(s).isDirectory()) copyDir(s, d, filter);
    else copyFileSync(s, d);
  }
}

export function readJson(p) {
  return JSON.parse(readFileSync(p, "utf8"));
}

export function loadBrand() {
  const p = join(ROOT, "brand", "dist", "brand.json");
  if (!existsSync(p)) {
    console.error("✗ No existe brand/dist/. Corré primero: npm run brand");
    process.exit(1);
  }
  return readJson(p);
}

export function resolveProject(arg) {
  if (!arg) {
    console.error("✗ Indicá el proyecto: ruta o nombre dentro de projects/");
    process.exit(1);
  }
  const candidates = [resolve(arg), join(ROOT, "projects", arg)];
  for (const c of candidates) if (existsSync(join(c, "scenes.json"))) return c;
  // permitir prefijo de fecha omitido
  const dir = join(ROOT, "projects");
  if (existsSync(dir)) {
    const hit = readdirSync(dir).find((n) => n.endsWith("_" + arg) || n === arg);
    if (hit && existsSync(join(dir, hit, "scenes.json"))) return join(dir, hit);
  }
  console.error(`✗ No encuentro el proyecto "${arg}" (busco una carpeta con scenes.json).`);
  process.exit(1);
}

export function slugify(s) {
  return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 48);
}

export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const escAttrSingle = (s) => String(s).replace(/&/g, "&amp;").replace(/'/g, "&#39;");
