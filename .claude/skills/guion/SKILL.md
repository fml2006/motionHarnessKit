---
name: guion
description: Gates G2-G3. Treatment + opciones de hook + guion a dos columnas (AUDIO | VIDEO) con presupuesto de palabras, instrucciones visuales ejecutables por bloque y claims referenciados. Usar cuando el brief está aprobado y piden "escribí el guion", "propuestas de hook", "treatment".
---

# /guion — el guion es el plano de construcción

Prerrequisito: `00_brief.md` aprobado y `research/claims.csv` con los claims del mensaje en estado `ok` **y firmados por el SME** (`verificado_por` ≠ `PENDIENTE`). Si no, frená y decilo: podés escribir un borrador marcado "BORRADOR — claims pendientes", pero no pedir aprobación de G3.

## 1. Treatment (en `01_guion.md`, sección inicial)
Idea central en una frase, estructura por beats con % de duración, tono, y **3 hooks alternativos** (resultado primero / pregunta concreta / contraste), cada uno con por qué funciona para ESTA audiencia. El director creativo elige.

## 2. Guion a dos columnas (`templates/guion-dos-columnas.md`)
Delegá al subagente `guionista` y verificá:
- Presupuesto: **palabras netas de VO = duración objetivo (s) × 2,2** (≈ 132 ppm; 60 s ≈ 130 palabras). La fuente única es `brand/brand.config.json` → `audio.voice.wordsPerSecond`; si la marca define otro valor, usá ese. Apuntá a 5–10 % menos para pausas.
- Columna VIDEO por bloque de `engine/blocks/README.md` (o "custom" justificado), con texto en pantalla LITERAL (≤ 7 palabras/línea) y el anclaje a la palabra de VO que lo dispara.
- Cada cifra con `[C-00X]` existente; sin claim → `[COMPLETAR CLAIM]`.
- Hook entendible sin sonido en ≤ 3-5 s. Un CTA.
- Versión "VO limpia" al final con conteo de palabras y duración estimada (palabras ÷ 2,2).
- Registrá las horas de la fase en `review/HORAS.csv` (rol, gate, horas).

## 3. Autochequeo antes de mostrar
- Leé el guion en voz alta (estimá): ¿entra en la duración? ¿cada pantalla tiene una idea?
- ¿El texto en pantalla refuerza (palabra clave/dato) en vez de duplicar la VO?
- ¿Respeta la voz de `brand.md` (sin hype, sin jerga sin explicar)?

## 4. Salida
Mostrá treatment + hooks + guion. Próximo gate: aprobación del guion (G3) → `/storyboard`. Cambios de guion después del animatic = change order (avisalo).
