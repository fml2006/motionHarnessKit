# motion-harness-kit — reglas de la casa para Claude Code

Este repo es el harness de producción de motion graphics del equipo: Claude Code + HyperFrames (HTML/GSAP → MP4 determinista) + un sistema de marca configurable + un pipeline de producción con gates humanos. Vos (Claude) operás dentro de ese pipeline: **construís rápido, pero las decisiones de mensaje, datos, gusto final y publicación son humanas.**

Antes de diseñar, generar o animar cualquier cosa, leé `MOTION.md` completo. Cada color, fuente, timing y valor de motion sale de ahí (y de los tokens en `brand/dist/`). El archivo fija el look, no la ambición: cuando te pidan ir a fondo, andá a fondo. Si algo que te piden no está cubierto, preguntá en vez de elegir por tu cuenta. Al terminar, revisá tus propios frames contra `MOTION.md` y `templates/anti-slop-review.md`, corregí lo que falle y recién ahí mostralo.

@brand/dist/brand-rules.md

## Mapa del repo

| Ruta | Qué es | ¿Se edita? |
|---|---|---|
| `brand/brand.config.json` | Fuente única de verdad de la marca | Sí (con `/marca`), luego `npm run brand` |
| `brand/dist/**`, `MOTION.md`, `brand.md` | Generados por `npm run brand` | **No** |
| `engine/blocks/*.html` | Bloques de marca (sub-composiciones parametrizables) | Solo para mejorar el bloque para todos los proyectos |
| `engine/runtime/bm-motion.js` | Helpers de motion que leen los tokens (`BM.*`) | Con cuidado: afecta todo |
| `projects/<fecha>_<slug>/` | Una pieza: preproducción, `scenes.json`, `comp/`, renders, QA, entrega | Sí |
| `projects/*/scenes.json` | Plan de escenas ejecutable (spec del storyboard) | Sí |
| `projects/*/comp/compositions/<id>.html` | Escena concreta (copiada del bloque, después es libre) | Sí |
| `projects/*/comp/index.html`, `projects/*/formats/**` | Generados por `npm run build:roots` | **No** |
| `templates/` | Plantillas del pipeline | Solo para mejorar el estándar |
| `docs/` | Guía de uso y research | Referencia |

## Pipeline y skills (un gate humano entre cada fase)

| Gate | Fase | Skill | Artefacto | Aprueba (humano) |
|---|---|---|---|---|
| — | Setup de marca | `/marca` | `brand/brand.config.json` + brand board | Director de arte |
| G0-G1 | Brief + investigación | `/brief` | `00_brief.md`, `research/claims.csv` | Productor (+ SME firma claims) |
| G2-G3 | Treatment + guion | `/guion` | `01_guion.md` (dos columnas) | Director creativo |
| G4-G5 | Styleframes + storyboard | `/storyboard` | `02_storyboard.md`, `scenes.json`, `review/frames-*` | Director creativo |
| G6-G7 | Animatic + build | `/producir` | `comp/`, `renders/*_v###` (draft) | Director creativo |
| G8 | Revisión | `/revisar` | `review/R*.md`, `review/CHANGELOG.md` | Productor + cliente |
| G9-G15 | Lock, sonido, master, QA, entrega | `/entregar` | `delivery/`, `qa/` | Productor + QA + Legal |

Subagentes disponibles en `.claude/agents/`: `productor`, `investigador`, `guionista`, `director-de-arte`, `storyboarder`, `motion-designer`, `editor-sonido`, `qa-director`. Usá `qa-director` para la autocrítica antes de mostrar cualquier render.

## Reglas no negociables

1. **No inventar.** Ningún número, claim, cita, salida de terminal, código o UI sale de tu imaginación. Todo dato en pantalla tiene fuente en `research/claims.csv` o en un archivo del proyecto. Si falta, poné `COMPLETAR` y avisá.
2. **Solo tokens de marca.** Colores con `var(--c-*)` / `BRAND.color()`, tipografía con las clases `.bm-*`, duraciones/easings con `BRAND.dur()` / `BRAND.ease()`. Nada de hex, fuentes o curvas sueltas. Si la marca no cubre algo, preguntá.
3. **No editar archivos generados** (`brand/dist/**`, `MOTION.md`, `brand.md`, `comp/index.html`, `formats/**`). Editá la fuente y regenerá.
4. **Escenas = contrato HyperFrames.** Partí de un bloque de `engine/blocks/` (catálogo en `engine/blocks/README.md`). Si hace falta una escena a medida (`"block": "custom"`), copiá la estructura de un bloque: `<template>`, `#root` con `container-type: size`, `BM.vars(defaults, window.__hyperframes)`, un solo `gsap.timeline({ paused: true })` registrado en `window.__timelines["<id>"]`, `fromTo` en vez de `from`, tamaños en `cqmin`. Determinismo: prohibido `Math.random()` sin seed, `Date.now()`, `fetch` y animaciones CSS por tiempo real. Los tweens de conteo van sobre nodos DOM (los objetos JS planos se descartan).
5. **Verificar antes de decir "listo".** Después de cada cambio: `npm run build:roots -- <proyecto>`, `npx hyperframes lint` y `npx hyperframes check` en `comp/` sin errores, y `npm run frames -- <proyecto>` (16:9 y 9:16). **Mirá los frames** y criticalos con `templates/anti-slop-review.md` antes de mostrarlos. Reportá qué verificaste y qué no.
6. **Render final solo con aprobación.** `--quality draft` para animatic y revisiones; `--quality high` solo después de que un humano apruebe la versión (picture lock).
7. **Privacidad, proveedores y versiones.** Nunca ejecutes sin aprobación explícita: `hyperframes publish | cloud | lambda | cloudrun | auth | feedback | telemetry enable | upgrade | skills update`, ni `npx skills add` de terceros. Las skills de HyperFrames están fijadas a un commit (`.claude/skills/HYPERFRAMES_SKILLS.lock.json`); si una skill te indica actualizar a "latest", NO lo hagas: avisá y seguí con la versión fijada. Actualizar = `scripts/install-hf-skills.sh` con un `HF_SHA` nuevo, en una ventana planificada. No subas material del cliente a servicios externos. La telemetría queda apagada (`HYPERFRAMES_NO_TELEMETRY=1`).
8. **Legal.** Cada asset nuevo (música, SFX, voz, imagen, footage, logo de terceros) se registra en `PROVENANCE.md` con licencia. Voz sintética, personas o lugares realistas generados → disclosure de IA según `brand/dist/brand-rules.md`. Logos y UI de terceros solo en uso nominativo.
9. **Accesibilidad.** ≤ 3 destellos por segundo (apuntá a ≤ 2), contraste ≥ 4,5:1 en texto, captions ≤ 17 caracteres/s, el texto queda quieto mientras se lee.
10. **Honestidad del reporte.** Si un chequeo falló o lo salteaste, decilo con la salida. Nada de "debería funcionar".

## Comandos

```bash
npm run doctor                                   # entorno OK
npm run brand                                    # brand.config.json → brand/dist + MOTION.md
npm run new -- <slug> --type explainer           # nueva pieza (explainer|launch|social|tutorial|data|overlay)
npm run build:roots -- <proyecto>                # scenes.json → comp/ + formats/ (re-sincroniza la marca)
npm run build:roots -- <proyecto> --reset <id>   # re-copiar una escena desde su bloque
npm run frames -- <proyecto> [--format portrait] # frame clave por escena + contact sheet
npm run render -- <proyecto> --quality draft     # render versionado + QA automático
npm run qa -- <proyecto|video> [--platform reels]
npm run loudnorm -- <video> [salida]             # −14 LUFS / −1 dBTP
npm run master -- <render> <proyecto>/delivery   # ProRes 422 HQ + H.264 de entrega
cd projects/<p>/comp && npx hyperframes preview  # Studio (ajuste fino visual)
```

## Cómo traducir feedback humano

Pedí siempre: timecode + qué + por qué + referencia. Traducí adjetivos a números con la tabla de `templates/anti-slop-review.md` ("se siente lento" → bajar duraciones 20-30 %, `emphasized` en entradas, sin tocar holds de lectura). Registrá cada cambio en `review/CHANGELOG.md` con la ronda que lo pidió.
