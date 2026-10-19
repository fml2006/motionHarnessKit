---
name: producir
description: Gates G6-G7. Animatic y build con IA - construye/ajusta escenas (bloques y custom), integra VO/música, itera con autocrítica y entrega un render draft versionado con QA automático. Usar cuando el storyboard está aprobado y piden "animalo", "armá el animatic", "renderizá una versión", "hacé la escena X a medida".
---

# /producir — build dirigido, no generado

Prerrequisito: storyboard aprobado (G5). Leé `MOTION.md`, `scenes.json` y las notas de cada escena.

## 1. Animatic (G6)
- Si hay VO scratch/final: ponela en `comp/assets/audio/` y en `scenes.json → audio.voiceover.src` (`assets/audio/vo.wav`). Ajustá duraciones de escena a la VO (palabra ancla + 0,3-0,5 s de aire).
- `npm run render -- <p> --quality draft` → revisión de timing con el director creativo. Leyenda "ANIMATIC — NO FINAL" en la entrega.

## 2. Build (G7)
Delegá al subagente `motion-designer` escena por escena:
- Bloque estándar: ajustar `vars`/`duration` en `scenes.json`.
- Escena a medida: `"block": "custom"` + `comp/compositions/<id>.html` siguiendo el contrato de CLAUDE.md (copiá la estructura de un bloque). Si el look se va a reutilizar, proponé convertirlo en bloque de `engine/blocks/`.
- Bloques del catálogo oficial de HyperFrames (`npx hyperframes catalog --query "<idea>"`) heredan la marca por el contrato de theme; instalar con `npx hyperframes add` requiere aprobación (está en `ask`).

## 3. Loop de calidad (obligatorio en cada iteración)
1. `npm run build:roots -- <p>` → leé los avisos del gate de contenido (placeholders, cifras sin claim, valores fuera de tokens): en draft avisan, en high frenan.
2. `npm run frames -- <p>` (+ `--format portrait`) → mirar los PNG.
3. Subagente `qa-director` → corregir bloqueantes.
4. Recién ahí: `npm run render -- <p> --quality draft`. El script gatea solo, por código de salida: lint (`--json`) y `hyperframes check` con 0 errores, después render versionado `_v###` y QA técnico en modo draft. Si cualquier gate o el QA da FAIL, sale con código 1 y no declara la versión lista: no la mandes a revisión.

## 4. Salida
Render(s) versionados, reporte de QA, contact sheet, y lista honesta de lo verificado vs pendiente (p. ej. "no escuché la mezcla en teléfono"). Próximo gate: `/revisar`.

Notas:
- `--quality high` NO es para revisiones: activa el build `--strict` y `check --strict` (warnings también frenan). Se usa recién con la versión aprobada, y en la práctica lo dispara `npm run deliver` (ver `/entregar`).
- Los drafts no se normalizan: el QA de draft avisa (WARN) si el loudness está fuera de objetivo. La normalización se hace una sola vez, en la entrega.
- Si la marca cambió desde que se aprobó el proyecto, el build se frena (brandLock). Solo con aprobación explícita: `--rebrand`.
