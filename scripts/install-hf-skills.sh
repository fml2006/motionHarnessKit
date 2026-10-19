#!/usr/bin/env bash
# Instala las skills oficiales de HyperFrames en .claude/skills/ FIJADAS a un commit (no "latest").
# Política: fork/pin a SHA + lockfile. Actualizar = cambiar HF_SHA en una ventana planificada y re-probar la galería.
#   bash scripts/install-hf-skills.sh                # core + workflows usados por el kit
#   HF_SHA=<sha> bash scripts/install-hf-skills.sh   # otro commit (debe coincidir con la versión de la CLI fijada)
#   HF_REPO=/ruta/clon-local bash scripts/install-hf-skills.sh   # sin red, desde un clon local revisado
# Después de copiar aplica los parches locales de scripts/patch-hf-skills.mjs (los workflows end-to-end quedan
# con disable-model-invocation: true y se neutraliza el envío de `hyperframes feedback`).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HF_SHA="${HF_SHA:-cea0bad7931122bd93680006978c0d9007daa3d4}"   # main al 2026-10-19 = CLI hyperframes 0.8.174
HF_REPO="${HF_REPO:-https://github.com/heygen-com/hyperframes}"
SKILLS=(hyperframes hyperframes-core hyperframes-animation hyperframes-keyframes hyperframes-creative hyperframes-cli hyperframes-registry hyperframes-audio media-use motion-graphics general-video faceless-explainer)

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
echo "▶ Obteniendo skills de ${HF_REPO} @ ${HF_SHA:0:12}"
if [ -d "$HF_REPO/.git" ]; then
  git -C "$HF_REPO" cat-file -e "${HF_SHA}^{commit}" || { echo "✗ El clon local no tiene el commit ${HF_SHA}"; exit 1; }
  git -C "$HF_REPO" archive "$HF_SHA" skills skills-manifest.json | tar -x -C "$TMP"
else
  git -c advice.detachedHead=false clone --quiet --filter=blob:none --no-checkout "$HF_REPO" "$TMP/repo"
  git -C "$TMP/repo" sparse-checkout set --no-cone /skills /skills-manifest.json >/dev/null
  git -C "$TMP/repo" -c advice.detachedHead=false checkout --quiet "$HF_SHA"
  mv "$TMP/repo/skills" "$TMP/repo/skills-manifest.json" "$TMP/"
fi

mkdir -p "$ROOT/.claude/skills"
LOCK="$ROOT/.claude/skills/HYPERFRAMES_SKILLS.lock.json"
{
  echo "{"
  echo "  \"source\": \"heygen-com/hyperframes\","
  echo "  \"commit\": \"${HF_SHA}\","
  echo "  \"installed\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
  echo "  \"skills\": {"
} > "$LOCK"
n=0
for s in "${SKILLS[@]}"; do
  [ -d "$TMP/skills/$s" ] || { echo "  ⚠ $s no existe en ese commit"; continue; }
  rm -rf "$ROOT/.claude/skills/$s"
  cp -R "$TMP/skills/$s" "$ROOT/.claude/skills/$s"
  h=$(sed -n "/\"$s\": {/,/}/s/.*\"hash\": \"\([^\"]*\)\".*/\1/p" "$TMP/skills-manifest.json" | head -1)
  [ $n -gt 0 ] && echo "," >> "$LOCK"
  printf '    "%s": "%s"' "$s" "${h:-?}" >> "$LOCK"
  n=$((n+1))
  echo "  ✓ $s (${h:-sin hash})"
done
printf '\n  },\n' >> "$LOCK"
# Parches locales (MHK patch): workflows solo por invocación explícita, aviso de gobernanza y feedback neutralizado.
echo "▶ Aplicando parches locales (scripts/patch-hf-skills.mjs)"
node "$ROOT/scripts/patch-hf-skills.mjs"
cat >> "$LOCK" <<'JSON'
  "localPatches": {
    "script": "scripts/patch-hf-skills.mjs",
    "disableModelInvocation": ["hyperframes", "faceless-explainer", "general-video", "motion-graphics", "media-use"],
    "governanceNotice": "todas las skills vendorizadas (bloque '> **MHK patch (motion-harness-kit)**' al inicio del SKILL.md)",
    "feedbackNeutralized": ["hyperframes-cli/SKILL.md", "hyperframes-cli/references/preview-render.md", "hyperframes-registry/SKILL.md", "motion-graphics/agents/builder.md", "motion-graphics/catalog-map.md"],
    "nota": "Los hashes de 'skills' son los de upstream (skills-manifest.json) ANTES del parche. Al subir HF_SHA, revisar los avisos de anclas no encontradas."
  }
}
JSON
echo "✓ ${n} skills de HyperFrames fijadas en .claude/skills/ (lock: .claude/skills/HYPERFRAMES_SKILLS.lock.json)"
echo "  Revisá los scripts que traen (supply chain) antes de usarlas en proyectos de clientes."
