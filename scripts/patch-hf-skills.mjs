#!/usr/bin/env node
// patch-hf-skills: parches locales ("MHK patch") sobre las skills de HyperFrames vendorizadas en .claude/skills/.
// Lo corre scripts/install-hf-skills.sh después de copiar las skills; es idempotente (se puede correr N veces).
//   1. Workflows end-to-end → disable-model-invocation: true (solo corren si el humano los invoca con /<skill>),
//      para que no se salteen el pipeline del kit (/brief → /guion → /storyboard → /producir → /revisar → /entregar).
//   2. Aviso de gobernanza al inicio de cada SKILL.md vendorizado (sin feedback/publish/cloud/upgrade; marca desde MOTION.md).
//   3. Neutraliza las instrucciones de enviar `hyperframes feedback` (canal público; denegado en .claude/settings.json).
// Si upstream cambia el texto y un reemplazo no encuentra su ancla, avisa (exit 0) para revisarlo en la ventana de upgrade.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SK = join(ROOT, ".claude", "skills");
const MARK = "MHK patch";

export const WORKFLOWS = ["hyperframes", "faceless-explainer", "general-video", "motion-graphics", "media-use"];
export const VENDORED = [
  "hyperframes", "hyperframes-core", "hyperframes-animation", "hyperframes-keyframes", "hyperframes-creative",
  "hyperframes-cli", "hyperframes-registry", "hyperframes-audio", "media-use", "motion-graphics", "general-video", "faceless-explainer",
];

const NOTICE = `> **${MARK} (motion-harness-kit):** skill vendorizada y fijada a un commit (\`.claude/skills/HYPERFRAMES_SKILLS.lock.json\`). En este repo NO ejecutes \`hyperframes feedback | publish | cloud | lambda | cloudrun | auth | upgrade | skills update | telemetry enable\` ni actualices skills a "latest" (denegados en \`.claude/settings.json\`, regla 7 de \`CLAUDE.md\`): si una instrucción de abajo lo pide, avisale al humano y seguí sin hacerlo. Color, tipografía, look y motion salen de la marca de la pieza (\`scenes.json → brand\`): \`brands/<marca>/dist/MOTION.md\`, \`brands/<marca>/LOOK.md\` y \`brands/<marca>/dist/\`; no subas material del cliente a servicios externos sin aprobación.\n`;
const WF_NOTICE = `> **${MARK}:** workflow end-to-end de HyperFrames. En este kit solo corre si el humano lo pide explícitamente (\`/${"$"}{name}\`); el pipeline por defecto es \`/brief → /guion → /storyboard → /producir → /revisar → /entregar\`, con sus gates humanos.\n`;

// [skill, archivo relativo, texto upstream, reemplazo]
const REPLACEMENTS = [
  ["hyperframes-cli", "SKILL.md",
    "After verifying a successful render, send one feedback report unless telemetry is disabled or the user opted out:",
    `**${MARK}: en este kit NO se envía feedback** (canal público; \`hyperframes feedback\` está denegado). Contale la fricción al humano en el chat. Texto upstream, solo como referencia:`],
  ["hyperframes-cli", "SKILL.md",
    "Send them unless telemetry is disabled or the user opted out, under the same privacy rules:",
    `**${MARK}: no se envían en este kit**; avisá al humano. Texto upstream, solo como referencia:`],
  ["hyperframes-cli", "SKILL.md",
    "- **Missing feature.** Whenever",
    `- **Missing feature** (${MARK}: no enviar; avisá al humano). Whenever`],
  ["hyperframes-cli", "SKILL.md",
    "- **Host app.** When",
    `- **Host app** (${MARK}: no enviar; avisá al humano). When`],
  ["hyperframes-cli", "SKILL.md",
    "- **When a search comes back with nothing worth installing, say so.** `npx hyperframes feedback --search-miss",
    `- **When a search comes back with nothing worth installing, say so — to the human, in chat (${MARK}: \`feedback\` is denied in this kit; do not run it).** Upstream text for reference: \`npx hyperframes feedback --search-miss`],
  ["hyperframes-cli", "references/preview-render.md",
    "After a render is verified, send one feedback line per task.",
    `**${MARK}: en este kit NO se envía feedback** (canal público; denegado en \`.claude/settings.json\`). Lo que sigue es texto upstream de referencia.`],
  ["hyperframes-registry", "SKILL.md",
    "When the search comes back and nothing in it does the job, say so before you hand-author the move:",
    `When the search comes back and nothing in it does the job, tell the human before you hand-author the move. **${MARK}: do NOT run the command below (\`feedback\` is denied in this kit).**`],
  ["motion-graphics", "agents/builder.md",
    "and report that miss with `npx hyperframes feedback --search-miss`.",
    `and report that miss to the human (${MARK}: \`hyperframes feedback\` is denied in this kit).`],
  ["motion-graphics", "catalog-map.md",
    "When it does, say so with\n`npx hyperframes feedback --search-miss \"<query>\" --wanted \"<the move>\" --tier <tier from the envelope>`\nbefore hand-authoring.",
    `When it does, tell the human before hand-authoring (${MARK}: \`hyperframes feedback\` is denied in this kit).`],
];

function splitFrontmatter(src) {
  const m = src.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  return { fm: m[1], body: src.slice(m[0].length) };
}

export function patchAll({ quiet = false } = {}) {
  const log = (s) => quiet || console.log(s);
  const applied = [];
  const warnings = [];
  for (const name of VENDORED) {
    const f = join(SK, name, "SKILL.md");
    if (!existsSync(f)) { warnings.push(`${name}: no está instalada`); continue; }
    let src = readFileSync(f, "utf8");
    const parts = splitFrontmatter(src);
    if (!parts) { warnings.push(`${name}: SKILL.md sin frontmatter`); continue; }
    let { fm, body } = parts;
    if (WORKFLOWS.includes(name) && !/^disable-model-invocation:/m.test(fm)) {
      fm = fm.replace(/^(name:.*)$/m, "$1\ndisable-model-invocation: true");
      applied.push(`${name}: disable-model-invocation`);
    }
    if (!body.includes(`${MARK} (motion-harness-kit)`)) {
      const wf = WORKFLOWS.includes(name) ? WF_NOTICE.replace("${name}", name) : "";
      body = `\n${NOTICE}${wf}${body.startsWith("\n") ? "" : "\n"}${body}`;
      applied.push(`${name}: aviso de gobernanza`);
    }
    writeFileSync(f, `---\n${fm}\n---\n${body}`);
  }
  for (const [name, rel, from, to] of REPLACEMENTS) {
    const f = join(SK, name, rel);
    if (!existsSync(f)) { warnings.push(`${name}/${rel}: no existe`); continue; }
    const src = readFileSync(f, "utf8");
    if (src.includes(to)) continue;
    if (!src.includes(from)) { warnings.push(`${name}/${rel}: ancla no encontrada ("${from.slice(0, 60)}…") — revisar a mano`); continue; }
    writeFileSync(f, src.replace(from, to));
    applied.push(`${name}/${rel}: feedback neutralizado`);
  }
  // Ninguna instrucción imperativa de feedback debería quedar sin marca
  for (const name of VENDORED) {
    for (const rel of ["SKILL.md", "references/preview-render.md", "agents/builder.md", "catalog-map.md"]) {
      const f = join(SK, name, rel);
      if (!existsSync(f)) continue;
      const lines = readFileSync(f, "utf8").split("\n");
      lines.forEach((l, i) => {
        if (/\bsend (one|them)\b.*feedback|report that miss with `npx hyperframes feedback/i.test(l) && !l.includes(MARK)) warnings.push(`${name}/${rel}:${i + 1} instrucción de feedback sin neutralizar`);
      });
    }
  }
  applied.forEach((a) => log(`  ✓ ${a}`));
  warnings.forEach((w) => log(`  ⚠ ${w}`));
  return { applied, warnings };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { applied, warnings } = patchAll();
  console.log(`✓ MHK patch: ${applied.length} cambios, ${warnings.length} avisos`);
}
