#!/usr/bin/env node
// pipeline: estado de una pieza para el orquestador /pieza. Checkpoints humanos (templates/pipeline.json),
// chequeos automáticos de artefactos y registro de aprobaciones en projects/<p>/pipeline.json.
//   npm run pipeline -- init <dir> [--mode completo|express]
//   npm run pipeline -- status <proyecto> [--json]
//   npm run pipeline -- check <proyecto> [<checkpoint>] [--no-build] [--json]
//   npm run pipeline -- approve <proyecto> <checkpoint> --by "Nombre" [--note "…"] [--force --note "motivo"]
//   npm run pipeline -- reject <proyecto> <checkpoint> --by "Nombre" --note "feedback"
//   npm run pipeline -- reopen <proyecto> <checkpoint> --by "Nombre" --note "motivo"
//   npm run pipeline -- pause <proyecto> --note "próximo paso concreto"
// El script nunca aprueba solo: approve/reject/reopen exigen el nombre de una persona (--by).
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync, appendFileSync, mkdirSync } from "node:fs";
import { join, basename, resolve, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT, readJson, resolveProject } from "./lib/common.mjs";
import { loadClaims, claimProblem } from "./lib/plan.mjs";

const DEFS = readJson(join(ROOT, "templates", "pipeline.json"));
const VALUE_FLAGS = ["--mode", "--by", "--note"];
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const val = (n) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : undefined);
const pos = argv.filter((a, i) => !a.startsWith("--") && !VALUE_FLAGS.includes(argv[i - 1]));
const [cmd, projArg, cpArg] = pos;
const asJson = flag("--json");

const now = () => new Date().toISOString().slice(0, 16).replace("T", " ");
const rel = (p) => relative(ROOT, p) || ".";
const read = (p) => (existsSync(p) ? readFileSync(p, "utf8") : null);
const mtime = (p) => (existsSync(p) ? statSync(p).mtimeMs : 0);
const die = (msg, code = 2) => {
  console.error(`✗ ${msg}`);
  process.exit(code);
};

// ---------- proyecto, plan y marca ----------
function projectDir(arg) {
  if (!arg) die("Indicá el proyecto: ruta o nombre dentro de projects/");
  return resolveProject(arg);
}
const loadPlan = (dir) => {
  try {
    return JSON.parse(readFileSync(join(dir, "scenes.json"), "utf8"));
  } catch (e) {
    return null;
  }
};
const slugOf = (dir, plan) => plan?.slug || basename(dir).replace(/^\d{4}-\d{2}-\d{2}_/, "");

// La marca de la pieza sale de scenes.json → brand (multimarca: brands/<slug>/). Sin campo: "default" (repo de una sola marca).
function brandInfo(plan) {
  const slug = (typeof plan?.brand === "string" ? plan.brand : plan?.brand?.slug) || "default";
  const first = (...ps) => ps.find((p) => existsSync(join(ROOT, p))) || null;
  return {
    slug,
    motion: first(join("brands", slug, "dist", "MOTION.md"), "MOTION.md"),
    look: first(join("brands", slug, "LOOK.md")),
    rules: first(join("brands", slug, "dist", "brand-rules.md"), join("brand", "dist", "brand-rules.md")),
    config: first(join("brands", slug, "brand.config.json"), join("brand", "brand.config.json")),
  };
}
function brandConfig(plan) {
  const b = brandInfo(plan);
  try {
    return b.config ? JSON.parse(readFileSync(join(ROOT, b.config), "utf8")) : {};
  } catch (e) {
    return {};
  }
}

// ---------- estado ----------
const statePath = (dir) => join(dir, "pipeline.json");
function freshState(dir, mode) {
  const m = DEFS.modes[mode];
  if (!m) die(`modo "${mode}" no existe (${Object.keys(DEFS.modes).join(" | ")})`);
  return {
    $comment: "Estado del orquestador /pieza. Lo escribe scripts/pipeline.mjs: no lo edites a mano.",
    version: 1,
    project: basename(dir),
    mode,
    createdAt: now(),
    checkpoints: Object.fromEntries(m.checkpoints.map((id) => [id, { status: "pending", approvals: [], rejections: [], lastCheck: null }])),
    rounds: [],
    lockedVersion: null,
    next: null,
    history: [{ at: now(), event: "init", mode }],
  };
}
function loadState(dir, { required = true } = {}) {
  const p = statePath(dir);
  if (existsSync(p)) return JSON.parse(readFileSync(p, "utf8"));
  if (required) die(`${rel(dir)} no tiene pipeline.json: corré npm run pipeline -- init ${rel(dir)}`);
  return null;
}
const saveState = (dir, s) => writeFileSync(statePath(dir), JSON.stringify(s, null, 2) + "\n");
const order = (s) => DEFS.modes[s.mode].checkpoints;
const def = (id) => DEFS.checkpoints[id];
const current = (s) => order(s).find((id) => s.checkpoints[id]?.status !== "approved") || null;

// ---------- utilidades de markdown ----------
// Texto de una sección (desde su encabezado hasta el siguiente del mismo nivel o superior). Ignora encabezados dentro de bloques ```.
function section(md, re) {
  const lines = md.split("\n");
  let fence = false;
  const heads = lines.map((l) => {
    if (/^\s*```/.test(l)) fence = !fence;
    return !fence && /^#{1,6}\s/.test(l) ? l.match(/^#+/)[0].length : 0;
  });
  const i = lines.findIndex((l, k) => heads[k] && re.test(l));
  if (i < 0) return null;
  const out = [];
  for (let j = i + 1; j < lines.length; j++) {
    if (heads[j] && heads[j] <= heads[i]) break;
    out.push(lines[j]);
  }
  return out.join("\n");
}
const PLACEHOLDER_RE = /COMPLETAR|⟦|AAAA-MM-DD|\[CLIENTE\]|\[PROYECTO\]|\[PIEZA\]/;
const words = (t) => t.replace(/\[[^\]]*\]/g, " ").split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

// ---------- chequeos ----------
// Cada chequeo devuelve { name, problems[], warnings[], info[] }; ok = sin problems.
function mk(name) {
  return { name, problems: [], warnings: [], info: [] };
}

function checkBrief(dir) {
  const r = mk("brief");
  const md = read(join(dir, "00_brief.md"));
  if (!md) return r.problems.push("falta 00_brief.md (lo crea npm run new; lo completa /brief con el subagente productor)"), r;
  if (/ACME_LAUNCH26|acme\.dev\/deploy/.test(md)) r.problems.push("todavía tiene los ejemplos de la plantilla (ACME…): reemplazalos por los datos de la pieza");
  const msg = section(md, /mensaje único/i);
  if (msg == null) r.problems.push("falta la sección «Mensaje único»");
  else {
    const body = msg.split(/\*\*Pruebas|\*\*Lo que NO/)[0];
    const cand = body
      .split("\n")
      .filter((l) => l.trim() && !/Una sola oración|p\. ej\./i.test(l))
      .map((l) => l.replace(/^>\s*/, "").replace(/[*"“”]/g, "").trim())
      .join(" ");
    if (words(cand) < 5) r.problems.push("«Mensaje único» vacío o con el texto de la plantilla: una oración que la audiencia pueda repetir");
  }
  const aud = section(md, /audiencia/i);
  if (aud == null || aud.trim().length < 20 || /\(rol, industria, seniority\)/.test(aud)) r.problems.push("«Audiencia» sin completar");
  const cta = section(md, /\bCTA\b/);
  if (cta == null || cta.trim().length < 8 || /\(visitar URL \/ probar gratis/.test(cta)) r.problems.push("«CTA» sin completar (acción y URL/handle exactos)");
  const aprLines = md.split("\n").filter((l) => /aprobador final/i.test(l) && !/^\s*>/.test(l));
  const apr = aprLines.find((l) => /^\s*\|/.test(l)) || aprLines.find((l) => /aprobador final[^|]*:/i.test(l));
  const aprVal = apr ? (apr.includes("|") ? apr.split("|").map((c) => c.trim()).filter(Boolean)[1] || "" : apr.split(/:\*\*|:/).slice(1).join(":")) : "";
  if (!apr || !aprVal.trim() || /Nombre · cargo|\(nombre del|_{3,}/i.test(aprVal)) r.problems.push("falta el aprobador final con nombre (una sola persona)");
  const conf = section(md, /confidencialidad/i);
  if (conf == null) r.problems.push("falta §11b «Confidencialidad y procesamiento por IA y proveedores» (plantilla templates/brief.md): se firma antes de cargar material del cliente");
  else if (/_{4,}/.test(conf)) r.problems.push("§11b tiene campos sin completar (______): plan/DPA, consentimiento, proveedores, búsqueda web");
  const ph = md.split("\n").filter((l) => PLACEHOLDER_RE.test(l));
  if (ph.length) r.problems.push(`${ph.length} línea(s) con placeholders (COMPLETAR / AAAA-MM-DD / [CLIENTE]…), p. ej.: «${ph[0].trim().slice(0, 90)}»`);
  const exit = section(md, /criterio de salida de G0/i);
  if (exit != null) {
    const open = exit.split("\n").filter((l) => /^\s*- \[ \]/.test(l)).map((l) => l.replace(/^\s*- \[ \]\s*/, "").trim());
    if (open.length) r.problems.push(`criterio de salida G0: faltan ${open.length} ítem(s) — ${open.slice(0, 3).join("; ")}${open.length > 3 ? "…" : ""}`);
  }
  return r;
}

function checkClaims(dir) {
  const r = mk("claims");
  const claims = loadClaims(dir);
  if (!claims) return r.problems.push("falta research/claims.csv (aunque no haya cifras, tiene que existir con el encabezado)"), r;
  const list = Object.values(claims);
  if (!list.length) r.info.push("sin claims registradas: ninguna escena puede mostrar cifras ni afirmaciones verificables");
  for (const c of list) {
    const p = claimProblem(c);
    if (p) r.problems.push(`${c.id}: ${p}`);
  }
  if (list.length && !r.problems.length) r.info.push(`${list.length} claim(s) en estado ok y firmadas`);
  if (!existsSync(join(dir, "research", "digest.md"))) r.warnings.push("sin research/digest.md (resumen de fuentes del investigador)");
  return r;
}

function voText(md) {
  const sec = section(md, /VO limpia/i);
  if (sec != null) {
    return sec
      .split("\n")
      .filter((l) => l.trim() && !/^\s*#/.test(l) && !/^\s*```/.test(l) && !/^\s*>/.test(l) && !/^\s*---/.test(l) && !/^\s*\*\*[^*]+:\*\*/.test(l))
      .join(" ");
  }
  return [...md.matchAll(/VO:\s*["“]([^"”]+)["”]/g)].map((m) => m[1]).join(" ");
}

function checkGuion(dir, plan) {
  const r = mk("guion");
  const md = read(join(dir, "01_guion.md"));
  if (!md) return r.problems.push("falta 01_guion.md (lo escribe /guion con el subagente guionista)"), r;
  if (/ACME_LAUNCH26|Este deploy tarda \*\*cuatro segundos\*\*/.test(md)) r.problems.push("es la plantilla de ejemplo (ACME): falta escribir el guion de la pieza");
  const tr = section(md, /treatment/i);
  if (tr == null) r.warnings.push("sin sección «Treatment» (G2): si el treatment está en otro archivo, anotalo en el guion");
  else {
    const m = tr.match(/\*\*Mensaje único\*\*[^:\n]*:\s*(.*)/);
    if (m && !m[1].replace(/[_*]/g, "").trim()) r.problems.push("Treatment: falta el mensaje único");
    const hooks = tr.split("\n").filter((l) => /^\s*\d\.\s*\S/.test(l));
    if (/Hooks candidatos/i.test(tr) && !hooks.length) r.problems.push("Treatment: faltan los hooks candidatos (2–3)");
  }
  const cfg = brandConfig(plan);
  const wps = Number(cfg.audio?.voice?.wordsPerSecond) || 2.2;
  const durM = md.match(/Duraci[oó]n objetivo[^0-9\n]*?~?\s*(\d+(?:[.,]\d+)?)\s*s\b/i);
  const total = (plan?.scenes || []).reduce((a, s) => a + (Number(s.duration) || 0), 0);
  const dur = durM ? Number(durM[1].replace(",", ".")) : total;
  const n = words(voText(md));
  if (!n) r.info.push("sin VO (pieza muda): no aplica presupuesto de palabras; el texto en pantalla se controla con el hold de lectura");
  else if (!dur) r.warnings.push(`VO de ${n} palabras sin duración objetivo («Duración objetivo: NN s» en el guion)`);
  else {
    const budget = dur * wps;
    const max = Math.round(budget * 1.1);
    if (n > max) r.problems.push(`VO: ${n} palabras netas para ${dur} s → presupuesto ${Math.round(budget)} (${dur} s × ${wps} palabras/s; tope con +10 %: ${max}). Recortá ${n - max} o alargá la pieza (change order si ya hay G0 firmado)`);
    else r.info.push(`VO: ${n} palabras netas para ${dur} s (presupuesto ${Math.round(budget)}, tope ${max})`);
    if (n < budget * 0.5) r.warnings.push(`VO corta (${n} de ~${Math.round(budget)} palabras): ¿la pieza tiene aire de más o la duración objetivo está vieja?`);
  }
  const claims = loadClaims(dir) || {};
  const ids = [...new Set(md.match(/\bC-\d{3,}\b/g) || [])];
  const missing = ids.filter((id) => !claims[id]);
  if (missing.length) r.problems.push(`el guion cita claims que no están en research/claims.csv: ${missing.join(", ")}`);
  return r;
}

function runBuild(dir, extra = []) {
  const res = spawnSync(process.execPath, [join(ROOT, "scripts", "build-roots.mjs"), dir, ...extra], { encoding: "utf8" });
  const out = `${res.stdout || ""}${res.stderr || ""}`;
  return { ok: res.status === 0, out, fails: out.split("\n").filter((l) => /^\s*✗/.test(l)).map((l) => l.trim()) };
}

function checkStoryboard(dir, plan, { build }) {
  const r = mk("storyboard");
  const sb = read(join(dir, "02_storyboard.md"));
  const tpl = read(join(ROOT, "templates", "storyboard.md"));
  if (!sb) r.problems.push("falta 02_storyboard.md (lo escribe /storyboard con el subagente storyboarder)");
  else if (tpl && sb.trim() === tpl.trim()) r.problems.push("02_storyboard.md es la plantilla sin completar");
  if (!plan) return r.problems.push("scenes.json no existe o no es JSON válido"), r;
  const scenes = plan.scenes || [];
  if (!scenes.length) r.problems.push("scenes.json no tiene escenas");
  for (const s of scenes) if (!s.id || !s.block || !(Number(s.duration) > 0)) r.problems.push(`escena inválida en scenes.json: ${JSON.stringify({ id: s.id, block: s.block, duration: s.duration })}`);
  const claims = loadClaims(dir) || {};
  const refd = [...new Set(scenes.flatMap((s) => s.claims || []))];
  const missing = refd.filter((id) => !claims[id]);
  if (missing.length) r.problems.push(`scenes.json cita claims que no están en research/claims.csv: ${missing.join(", ")}`);
  if (build) {
    const b = runBuild(dir);
    if (!b.ok) r.problems.push(`build:roots falló: ${(b.fails[0] || b.out.trim().split("\n").pop() || "").slice(0, 160)}`);
    else r.info.push("build:roots OK");
  } else if (mtime(join(dir, "comp", "index.html")) < mtime(join(dir, "scenes.json"))) r.warnings.push("comp/ es anterior al último cambio de scenes.json: corré npm run build:roots");
  for (const fmt of plan.formats || []) {
    const fdir = join(dir, "review", `frames-${fmt}`);
    if (!existsSync(fdir)) {
      r.problems.push(`faltan los styleframes de ${fmt}: npm run frames -- ${basename(dir)} --format ${fmt}`);
      continue;
    }
    const files = readdirSync(fdir);
    const want = scenes.filter((s) => !(s.skipIn || []).includes(fmt));
    const miss = want.filter((s) => !files.some((f) => new RegExp(`^\\d+_${s.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.png$`).test(f)));
    if (miss.length) r.problems.push(`frames de ${fmt}: faltan ${miss.map((s) => s.id).join(", ")} (npm run frames -- ${basename(dir)} --format ${fmt})`);
    const newest = Math.max(0, ...files.filter((f) => f.endsWith(".png")).map((f) => mtime(join(fdir, f))));
    if (newest && newest < mtime(join(dir, "scenes.json"))) r.warnings.push(`los frames de ${fmt} son anteriores al último cambio de scenes.json: regeneralos antes de mostrarlos`);
  }
  return r;
}

function lastRender(dir) {
  const lr = read(join(dir, "renders", ".last-render.json"));
  try {
    return lr ? JSON.parse(lr) : null;
  } catch (e) {
    return null;
  }
}

function checkAnimatic(dir, plan) {
  const r = mk("animatic");
  const lr = lastRender(dir);
  if (!lr) return r.problems.push(`no hay render: npm run render -- ${basename(dir)} --quality draft`), r;
  if (lr.qa === "FAIL") r.problems.push(`el QA de ${lr.tag} dio FAIL: corregí y volvé a renderizar`);
  if (lr.qa === "omitido") r.problems.push(`${lr.tag} se renderizó sin QA (--no-qa): renderizá de nuevo con QA`);
  const outs = (lr.outputs || []).filter((o) => o.file);
  for (const o of outs) {
    if (!existsSync(o.file)) r.problems.push(`no existe ${rel(o.file)}`);
    const q = join(dir, "qa", basename(o.file).replace(/\.[^.]+$/, "") + "_qa.json");
    if (existsSync(q)) {
      try {
        const v = JSON.parse(readFileSync(q, "utf8")).verdict || "";
        if (/^FAIL/.test(v)) r.problems.push(`QA ${basename(q)}: ${v}`);
      } catch (e) {}
    }
  }
  const got = outs.map((o) => o.format);
  const missingFmt = (plan?.formats || []).filter((f) => !got.includes(f));
  if (missingFmt.length) r.warnings.push(`${lr.tag} no incluye ${missingFmt.join(", ")} (formatos del plan)`);
  const rendered = Math.min(...outs.map((o) => mtime(o.file)).filter(Boolean), Infinity);
  const cdir = join(dir, "comp", "compositions");
  const edits = [mtime(join(dir, "scenes.json")), ...(existsSync(cdir) ? readdirSync(cdir).map((f) => mtime(join(cdir, f))) : [])];
  if (rendered !== Infinity && Math.max(...edits) > rendered + 1000) r.warnings.push(`hay cambios en scenes.json o en las escenas posteriores a ${lr.tag}: renderizá de nuevo antes de mostrar`);
  r.info.push(`último render: ${lr.tag} (${lr.quality}${lr.master ? ", master" : ""}) · QA ${lr.qa}`);
  r.version = lr.version;
  return r;
}

function checkRevision(dir, plan, state) {
  const r = checkAnimatic(dir, plan);
  r.name = "revision";
  const rf = existsSync(join(dir, "review")) ? readdirSync(join(dir, "review")).filter((f) => /^R\d+\.md$/.test(f)) : [];
  if (!rf.length) r.warnings.push("sin review/R<n>.md: consolidá el feedback de la ronda con /revisar");
  const lr = lastRender(dir);
  const cl = read(join(dir, "review", "CHANGELOG.md")) || "";
  if (lr && !cl.includes(lr.tag)) r.warnings.push(`review/CHANGELOG.md no menciona ${lr.tag}`);
  return r;
}

function checkLock(dir, plan, { build }) {
  const r = checkAnimatic(dir, plan);
  r.name = "lock";
  if (build) {
    const b = runBuild(dir, ["--strict"]);
    if (!b.ok) {
      for (const f of b.fails.slice(0, 8)) r.problems.push(`build estricto: ${f.replace(/^✗\s*/, "")}`);
      if (!b.fails.length) r.problems.push("build:roots --strict falló");
    } else r.info.push("build:roots --strict OK (sin placeholders, cifras con claim firmado, tokens de marca)");
  } else r.warnings.push("el gate de contenido (build:roots --strict) se evalúa con `npm run pipeline -- check` (sin --no-build)");
  return r;
}

function checkDelivery(dir, plan, state) {
  const r = mk("delivery");
  const ddir = join(dir, "delivery");
  const reps = existsSync(ddir) ? readdirSync(ddir).filter((f) => /_v\d+_ENTREGA\.md$/.test(f)) : [];
  if (!reps.length) return r.problems.push(`falta la entrega: npm run deliver -- ${basename(dir)} --platform <plataformas del brief>`), r;
  const ver = (f) => Number(f.match(/_v(\d+)_ENTREGA/)[1]);
  const latest = reps.sort((a, b) => ver(a) - ver(b)).slice(-1)[0];
  const md = read(join(ddir, latest));
  const verdict = (md.match(/Veredicto:\s*(.*)/) || [])[1] || "";
  const failRows = md.split("\n").filter((l) => /^\|/.test(l) && /\|\s*FAIL[^|]*\|\s*$/.test(l));
  if (/FAIL/.test(verdict) || failRows.length) r.problems.push(`${latest}: ${verdict || "hay entregables con FAIL"}${failRows.length ? ` (${failRows.length} fila(s) con FAIL)` : ""}`);
  else r.info.push(`${latest}: ${verdict.replace(/\*/g, "")}`);
  const lockAt = state?.checkpoints?.lock?.approvals?.slice(-1)[0]?.at;
  if (lockAt && mtime(join(ddir, latest)) < Date.parse(lockAt.replace(" ", "T") + ":00Z")) r.warnings.push("la entrega es anterior al picture lock registrado: corré deliver sobre la versión bloqueada");
  return r;
}

function checkCaptions(dir, plan) {
  const r = mk("captions");
  const hasVO = !!plan?.audio?.voiceover?.src;
  if (!hasVO) return r.info.push("sin VO en scenes.json → audio: captions no requeridos (pieza muda: el texto en pantalla es autosuficiente)"), r;
  const file = plan.captions?.file || ["captions.srt", "captions.vtt"].find((f) => existsSync(join(dir, f)));
  if (!file || !existsSync(join(dir, file))) r.problems.push("hay VO y faltan los captions (G11): captions.srt revisado a mano contra el glosario");
  else r.info.push(`captions: ${file}`);
  return r;
}

function checkLegal(dir) {
  const r = mk("legal");
  const md = read(join(dir, "qa", "legal-checklist.md"));
  if (!md) r.problems.push("falta qa/legal-checklist.md");
  else {
    const sig = section(md, /Firmas/i) || "";
    const signed = (role) => new RegExp(`\\[[xX]\\]\\s*${role}:\\s*(?!_)[^\\s_-][^-\\n]*`).test(sig);
    const need = ["Creativo", "SME"];
    const level = (md.match(/Nivel:\s*(N[123])\b(?!\s*\/)/) || [])[1];
    if (level === "N2" || level === "N3") need.push("Legal");
    const miss = need.filter((n) => !signed(n));
    if (miss.length) r.problems.push(`checklist legal sin firmar: ${miss.join(", ")} (sección M. Firmas${level ? `, nivel ${level}` : ", y marcá el nivel N1/N2/N3"})`);
  }
  const prov = read(join(dir, "PROVENANCE.md"));
  const tpl = read(join(ROOT, "templates", "provenance.yaml.md"));
  if (!prov) r.problems.push("falta PROVENANCE.md");
  else if (tpl && prov.trim() === tpl.trim()) r.problems.push("PROVENANCE.md es la plantilla sin completar (cada asset con origen y licencia)");
  return r;
}

function runChecks(dir, id, state, { build = true } = {}) {
  const plan = loadPlan(dir);
  const d = def(id);
  if (!d) die(`checkpoint "${id}" no existe. En este modo: ${order(state).join(", ")}`);
  const res = [];
  for (const c of d.checks) {
    if (c === "brief") res.push(checkBrief(dir));
    else if (c === "claims") res.push(checkClaims(dir));
    else if (c === "guion") res.push(checkGuion(dir, plan));
    else if (c === "storyboard") res.push(checkStoryboard(dir, plan, { build }));
    else if (c === "animatic") res.push(checkAnimatic(dir, plan));
    else if (c === "revision") res.push(checkRevision(dir, plan, state));
    else if (c === "lock") res.push(checkLock(dir, plan, { build }));
    else if (c === "delivery") res.push(checkDelivery(dir, plan, state));
    else if (c === "captions") res.push(checkCaptions(dir, plan));
    else if (c === "legal") res.push(checkLegal(dir));
  }
  const version = res.find((x) => x.version != null)?.version ?? lastRender(dir)?.version ?? null;
  // Si una persona pidió cambios sobre un render, el checkpoint necesita una versión nueva.
  const rej = state?.checkpoints?.[id]?.status === "rejected" ? state.checkpoints[id].rejections.slice(-1)[0] : null;
  if (rej && rej.version != null && version != null && !(version > rej.version)) {
    const target = res.find((x) => ["animatic", "revision", "lock"].includes(x.name)) || res[0];
    target.problems.push(`${rej.by} pidió cambios sobre v${String(rej.version).padStart(3, "0")} («${rej.note}»): falta la versión nueva con ese feedback aplicado`);
  }
  return { checkpoint: id, ok: res.every((x) => !x.problems.length), version, results: res };
}

function printCheck(c) {
  const d = def(c.checkpoint);
  console.log(`${c.ok ? "✓" : "✗"} ${c.checkpoint} (${fmtGates(d.gates)} · ${d.label}): ${c.ok ? "listo para aprobar" : "no está listo"}`);
  for (const x of c.results) {
    for (const p of x.problems) console.log(`  ✗ [${x.name}] ${p}`);
    for (const w of x.warnings) console.log(`  ⚠ [${x.name}] ${w}`);
    for (const i of x.info) console.log(`  · [${x.name}] ${i}`);
  }
}

// G0,G1 → "G0–G1"; G10…G15 → "G10–G15"; G6…G9 + G7b → "G6–G9·G7b"
function fmtGates(gs) {
  const nums = gs.filter((g) => /^G\d+$/.test(g)).map((g) => Number(g.slice(1)));
  const rest = gs.filter((g) => !/^G\d+$/.test(g));
  const consecutive = nums.length > 1 && nums.every((x, i) => i === 0 || x === nums[i - 1] + 1);
  const head = consecutive ? [`G${nums[0]}–G${nums[nums.length - 1]}`] : nums.map((n) => `G${n}`);
  return [...head, ...rest].join("·");
}

// ---------- README y CHANGELOG ----------
function gatesOfLine(tok) {
  const m = tok.match(/^G(\d+)([a-z]?)(?:-G?(\d+))?$/);
  if (!m) return [];
  if (m[2]) return [`G${m[1]}${m[2]}`];
  const a = Number(m[1]);
  const b = m[3] ? Number(m[3]) : a;
  return Array.from({ length: b - a + 1 }, (_, i) => `G${a + i}`);
}
function tickReadme(dir, gates, on, by) {
  const p = join(dir, "README.md");
  const md = read(p);
  if (!md) return 0;
  let n = 0;
  const out = md
    .split("\n")
    .map((l) => {
      const m = l.match(/^(\s*)- \[( |x|X)\] (G\d+[a-z]?(?:-G?\d+)?)\b(.*)$/);
      if (!m || !gatesOfLine(m[3]).some((g) => gates.includes(g))) return l;
      const rest = m[4].replace(/ · ✓ .*? \(\d{4}-\d{2}-\d{2}\)$/, "");
      n++;
      return on ? `${m[1]}- [x] ${m[3]}${rest} · ✓ ${by} (${now().slice(0, 10)})` : `${m[1]}- [ ] ${m[3]}${rest}`;
    })
    .join("\n");
  if (out !== md) writeFileSync(p, out);
  return n;
}
function changelog(dir, line) {
  const p = join(dir, "review", "CHANGELOG.md");
  mkdirSync(join(dir, "review"), { recursive: true });
  if (!existsSync(p)) writeFileSync(p, "# Changelog de renders\n\n");
  const cur = readFileSync(p, "utf8");
  appendFileSync(p, `${cur.endsWith("\n") ? "" : "\n"}- ${now()} · ${line}\n`);
}

// ---------- status ----------
const ESTADO = { pending: "pendiente", approved: "aprobado", rejected: "rechazado" };
function nextStep(dir, s, id, ready) {
  if (!id) return "Pieza cerrada: archivá (tag de versión del proyecto) y publicá fuera del agente.";
  const d = def(id);
  const p = basename(dir);
  const cp = s.checkpoints[id];
  if (ready) return `Listo para aprobar: mostrale al humano los artefactos (${d.artifacts.join(", ")}) y pedí OK. Registrar: npm run pipeline -- approve ${p} ${id} --by "<nombre>"`;
  const fb = cp.status === "rejected" ? cp.rejections.slice(-1)[0] : null;
  return `${fb ? `Aplicar el feedback de ${fb.by} («${fb.note}») y rehacer` : "Ejecutar"} la fase ${d.skill} (subagentes: ${d.subagents.join(", ")}). Después: npm run pipeline -- check ${p} ${id}`;
}
function statusData(dir, s, persisted) {
  const plan = loadPlan(dir);
  const id = current(s);
  const light = id ? runChecks(dir, id, s, { build: false }) : null;
  const b = brandInfo(plan);
  return {
    project: basename(dir),
    persisted,
    mode: s.mode,
    brand: b,
    current: id,
    ready: !!light?.ok,
    lockedVersion: s.lockedVersion,
    rounds: s.rounds,
    checkpoints: order(s).map((cid) => {
      const c = s.checkpoints[cid];
      const st = cid === id && c.status === "pending" && light?.ok ? "ready" : c.status;
      return { id: cid, label: def(cid).label, gates: def(cid).gates, status: st, approver: def(cid).approver, last: c.status === "approved" ? c.approvals.slice(-1)[0] : c.status === "rejected" ? c.rejections.slice(-1)[0] : null };
    }),
    blockers: light ? light.results.flatMap((x) => x.problems.map((p) => `[${x.name}] ${p}`)) : [],
    warnings: light ? light.results.flatMap((x) => x.warnings.map((w) => `[${x.name}] ${w}`)) : [],
    next: nextStep(dir, s, id, !!light?.ok),
    pausedNote: s.next,
  };
}
function printStatus(d) {
  const sym = { approved: "✓", ready: "●", pending: "○", rejected: "✗" };
  const lbl = { ...ESTADO, ready: "listo para aprobar" };
  console.log(`Pieza ${d.project} · modo ${d.mode} · marca ${d.brand.slug}${d.brand.motion ? ` (${d.brand.motion}${d.brand.look ? ` + ${d.brand.look}` : ""})` : ""}`);
  if (!d.persisted) console.log(`  (sin pipeline.json todavía: vista calculada. Para empezar a registrar gates: npm run pipeline -- init ${d.project})`);
  if (d.lockedVersion) console.log(`  picture lock: v${String(d.lockedVersion).padStart(3, "0")}`);
  for (const c of d.checkpoints) {
    const who = c.last ? ` · ${c.last.by}, ${c.last.at}${c.last.forced ? " (FORZADO)" : ""}${c.last.note ? `: ${c.last.note}` : ""}` : "";
    console.log(`  ${sym[c.status]} ${c.id.padEnd(16)} ${fmtGates(c.gates).padEnd(9)} ${c.label.padEnd(44)} ${lbl[c.status]}${who}`);
  }
  if (d.rounds.length) console.log(`  rondas de revisión: ${d.rounds.length}`);
  if (d.current) {
    console.log(`\nFase actual: ${d.current} · aprueba: ${def(d.current).approver}`);
    if (d.blockers.length) {
      console.log("Bloqueantes:");
      for (const b of d.blockers) console.log(`  ✗ ${b}`);
    }
    for (const w of d.warnings) console.log(`  ⚠ ${w}`);
  }
  if (d.pausedNote) console.log(`\nNota de pausa (${d.pausedNote.at}): ${d.pausedNote.note}`);
  console.log(`\nPróximo paso: ${d.next}`);
}

// ---------- comandos ----------
function requireBy() {
  const by = val("--by");
  if (!by || by.startsWith("--") || !by.trim()) die("falta --by \"Nombre\": las decisiones de gate las registra una persona, nunca el agente");
  return by.trim();
}
function requireCp(s) {
  if (!cpArg) die(`indicá el checkpoint: ${order(s).join(" | ")}`);
  if (!s.checkpoints[cpArg]) die(`"${cpArg}" no es un checkpoint del modo ${s.mode}: ${order(s).join(" | ")}`);
  return cpArg;
}

if (!cmd || cmd === "help" || flag("--help")) {
  console.log(readFileSync(new URL(import.meta.url), "utf8").split("\n").slice(1, 11).map((l) => l.replace(/^\/\/ ?/, "")).join("\n"));
  process.exit(cmd ? 0 : 2);
}

if (cmd === "init") {
  if (!projArg) die("uso: npm run pipeline -- init <dir> [--mode completo|express]");
  const dir = existsSync(resolve(projArg)) ? resolve(projArg) : join(ROOT, "projects", projArg);
  if (!existsSync(dir)) die(`no existe ${projArg}`);
  const mode = val("--mode");
  const old = loadState(dir, { required: false });
  if (old) {
    const anyDecision = Object.values(old.checkpoints).some((c) => c.approvals.length || c.rejections.length);
    if (mode && mode !== old.mode) {
      if (anyDecision) die(`la pieza ya tiene decisiones registradas en modo ${old.mode}: no se cambia de modo a mitad de camino`);
      const s = freshState(dir, mode);
      s.history = [...old.history, { at: now(), event: "mode", from: old.mode, to: mode }];
      saveState(dir, s);
      console.log(`✓ ${rel(statePath(dir))}: modo ${old.mode} → ${mode}`);
    } else console.log(`· ${rel(statePath(dir))} ya existe (modo ${old.mode}); no se modifica`);
    process.exit(0);
  }
  const s = freshState(dir, mode || DEFS.defaultMode);
  saveState(dir, s);
  console.log(`✓ ${rel(statePath(dir))} · modo ${s.mode}: ${order(s).join(" → ")}`);
  process.exit(0);
}

const dir = projectDir(projArg);

if (cmd === "status") {
  const persisted = existsSync(statePath(dir));
  const s = loadState(dir, { required: false }) || freshState(dir, val("--mode") || DEFS.defaultMode);
  const d = statusData(dir, s, persisted);
  if (asJson) console.log(JSON.stringify(d, null, 2));
  else printStatus(d);
  process.exit(0);
}

if (cmd === "check") {
  const persisted = existsSync(statePath(dir));
  const s = loadState(dir, { required: false }) || freshState(dir, DEFS.defaultMode);
  const id = cpArg || current(s);
  if (!id) {
    console.log("✓ todos los checkpoints aprobados");
    process.exit(0);
  }
  if (!s.checkpoints[id]) die(`"${id}" no es un checkpoint del modo ${s.mode}: ${order(s).join(" | ")}`);
  const c = runChecks(dir, id, s, { build: !flag("--no-build") });
  if (persisted) {
    s.checkpoints[id].lastCheck = { at: now(), ok: c.ok, problems: c.results.flatMap((x) => x.problems) };
    saveState(dir, s);
  }
  if (asJson) console.log(JSON.stringify(c, null, 2));
  else printCheck(c);
  process.exit(c.ok ? 0 : 1);
}

if (cmd === "approve") {
  const s = loadState(dir);
  const id = requireCp(s);
  const by = requireBy();
  const note = val("--note");
  const force = flag("--force");
  const idx = order(s).indexOf(id);
  const pendingBefore = order(s).slice(0, idx).filter((x) => s.checkpoints[x].status !== "approved");
  if (pendingBefore.length && !force) die(`antes hay checkpoints sin aprobar: ${pendingBefore.join(", ")} (o --force --note "motivo")`, 1);
  const c = runChecks(dir, id, s);
  const problems = c.results.flatMap((x) => x.problems);
  if (!c.ok && !force) {
    printCheck(c);
    die(`no se puede aprobar ${id}: el chequeo automático falla. Corregí lo de arriba, o --force --note "motivo" si una persona asume el riesgo`, 1);
  }
  if (force && !(note && note.trim())) die("--force exige --note \"motivo\" (queda registrado en pipeline.json y en el CHANGELOG)");
  const cp = s.checkpoints[id];
  const rec = { by, at: now(), note: note || null, version: c.version, forced: force && (!c.ok || pendingBefore.length > 0), ...(force && problems.length ? { problems } : {}), ...(pendingBefore.length ? { skipped: pendingBefore } : {}) };
  cp.approvals.push(rec);
  cp.status = "approved";
  cp.lastCheck = { at: now(), ok: c.ok, problems };
  if (def(id).checks.includes("lock") && c.version != null) s.lockedVersion = c.version;
  s.next = null;
  s.history.push({ at: now(), event: "approve", checkpoint: id, by, forced: rec.forced });
  saveState(dir, s);
  const ticked = tickReadme(dir, def(id).gates, true, by);
  const tag = c.version != null ? ` · v${String(c.version).padStart(3, "0")}` : "";
  changelog(dir, `✓ Gate ${fmtGates(def(id).gates)} «${def(id).label}» aprobado por ${by}${tag}${note ? ` · ${note}` : ""}${rec.forced ? ` · ⚠ FORZADO con ${problems.length} problema(s) abierto(s)` : ""}`);
  console.log(`✓ ${id} aprobado por ${by}${rec.forced ? " (FORZADO: queda registrado)" : ""} · README: ${ticked} gate(s) tildado(s)`);
  const nxt = current(s);
  console.log(`  Próximo: ${nxt ? `${nxt} → ${def(nxt).skill}` : "pieza cerrada"}`);
  process.exit(0);
}

if (cmd === "reject") {
  const s = loadState(dir);
  const id = requireCp(s);
  const by = requireBy();
  const note = val("--note");
  if (!note || !note.trim()) die("reject exige --note \"feedback\" (timecode + qué + por qué)");
  const cp = s.checkpoints[id];
  const version = lastRender(dir)?.version ?? null;
  cp.rejections.push({ by, at: now(), note, version });
  cp.status = "rejected";
  if (def(id).repeatable) s.rounds.push({ n: s.rounds.length + 1, checkpoint: id, by, at: now(), note, version });
  s.history.push({ at: now(), event: "reject", checkpoint: id, by });
  saveState(dir, s);
  changelog(dir, `✗ Gate ${fmtGates(def(id).gates)} «${def(id).label}» con cambios pedidos por ${by}${version != null ? ` sobre v${String(version).padStart(3, "0")}` : ""}: ${note}`);
  console.log(`✓ feedback registrado en ${id} (${by})${s.rounds.length && def(id).repeatable ? ` · ronda ${s.rounds.length}` : ""}`);
  console.log(`  Próximo: ${nextStep(dir, s, id, false)}`);
  process.exit(0);
}

if (cmd === "reopen") {
  const s = loadState(dir);
  const id = requireCp(s);
  const by = requireBy();
  const note = val("--note");
  if (!note || !note.trim()) die("reopen exige --note \"motivo\"");
  const later = order(s).slice(order(s).indexOf(id));
  const reopened = later.filter((x) => s.checkpoints[x].status !== "pending");
  for (const x of later) {
    if (s.checkpoints[x].status === "approved") tickReadme(dir, def(x).gates, false, by);
    s.checkpoints[x].status = "pending";
  }
  if (later.some((x) => def(x).checks.includes("lock"))) s.lockedVersion = null;
  s.next = null;
  s.history.push({ at: now(), event: "reopen", checkpoint: id, by, note, reopened });
  saveState(dir, s);
  changelog(dir, `↺ Reabierto desde «${def(id).label}» por ${by}: ${note}${reopened.length ? ` (vuelven a pendiente: ${reopened.join(", ")})` : ""}`);
  console.log(`✓ reabierto ${id}${reopened.length ? `; vuelven a pendiente: ${reopened.join(", ")}` : ""}`);
  process.exit(0);
}

if (cmd === "pause") {
  const s = loadState(dir);
  const note = val("--note");
  if (!note || !note.trim()) die("pause exige --note \"próximo paso concreto\" (para retomar con /pieza continuar)");
  s.next = { at: now(), note, checkpoint: current(s) };
  s.history.push({ at: now(), event: "pause", note });
  saveState(dir, s);
  console.log(`✓ pausa registrada: ${note}`);
  process.exit(0);
}

die(`subcomando desconocido "${cmd}" (init | status | check | approve | reject | reopen | pause)`);
