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
1. `npx hyperframes lint projects/<p>/comp` y `npx hyperframes check projects/<p>/comp` → 0 errores.
2. `npm run frames -- <p>` (+ `--format portrait`) → mirar los PNG.
3. Subagente `qa-director` → corregir bloqueantes.
4. Recién ahí: `npm run render -- <p> --quality draft` (versiona `_v###` y corre QA técnico).

## 4. Salida
Render(s) versionados, reporte de QA, contact sheet, y lista honesta de lo verificado vs pendiente (p. ej. "no escuché la mezcla en teléfono"). Próximo gate: `/revisar`.
