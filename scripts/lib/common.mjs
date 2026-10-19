// Utilidades compartidas por los scripts del kit.
import { existsSync, mkdirSync, readdirSync, statSync, copyFileSync, readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { defaultBrand, brandExists, listBrands } from "./brands.mjs";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

// Entorno para la CLI de HyperFrames: sin telemetría, sin auto-updates (versiones fijadas = renders reproducibles).
// Navegador: por defecto el chrome-headless-shell que HyperFrames fija y descarga (`npx hyperframes browser ensure`),
// que es el mismo en todas las máquinas con esta versión. Solo se usa otro si se pide explícitamente con
// MHK_BROWSER_PATH (o HYPERFRAMES_BROWSER_PATH ya seteado): eso cambia el render entre máquinas y queda registrado.
// Para reproducibilidad exacta entre máquinas: render/deliver con --docker.
export function hfEnv() {
  const env = { ...process.env, HYPERFRAMES_NO_TELEMETRY: "1", HYPERFRAMES_NO_UPDATE_CHECK: "1", HYPERFRAMES_SKIP_SKILLS: "1", DO_NOT_TRACK: "1" };
  if (env.MHK_BROWSER_PATH && !env.HYPERFRAMES_BROWSER_PATH) env.HYPERFRAMES_BROWSER_PATH = env.MHK_BROWSER_PATH;
  return env;
}

// Qué navegador va a usar el render (para doctor, CHANGELOG y PROVENANCE).
export function browserInfo() {
  const env = hfEnv();
  if (env.HYPERFRAMES_BROWSER_PATH) return { source: "override", path: env.HYPERFRAMES_BROWSER_PATH };
  const r = runHf(["browser", "path"], { capture: true });
  const path = (r.stdout || "").trim().split("\n").pop();
  return r.status === 0 && path ? { source: "hyperframes", path } : { source: "missing", path: null };
}

// Versión de ffmpeg (encodea los entregables: va al registro de cada entrega).
export function ffmpegVersion() {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-version"], { encoding: "utf8" });
  return r.status === 0 ? (r.stdout.split("\n")[0].match(/ffmpeg version (\S+)/) || [])[1] || "desconocida" : null;
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

// Marca aplicada (brands/<slug>/dist/brand.json). Sin slug: la default de brands/brands.json.
// Para un proyecto: loadBrand(projectBrand(plan)) (ver scripts/lib/brands.mjs).
export function loadBrand(slug) {
  const s = slug || defaultBrand();
  if (!s) {
    console.error("✗ No hay marcas en brands/. Creá una: npm run brand:new -- <slug>");
    process.exit(1);
  }
  if (!brandExists(s)) {
    console.error(`✗ La marca "${s}" no existe (brands/${s}/brand.config.json). Marcas: ${listBrands().join(", ")}`);
    process.exit(1);
  }
  const p = join(ROOT, "brands", s, "dist", "brand.json");
  if (!existsSync(p)) {
    console.error(`✗ La marca "${s}" no está aplicada (falta brands/${s}/dist/). Corré: npm run brand -- ${s}`);
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
