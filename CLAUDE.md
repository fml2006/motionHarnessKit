# motion-harness-kit — reglas de la casa para Claude Code

Este repo es el harness de producción de motion graphics del equipo: Claude Code + HyperFrames (HTML/GSAP → MP4 determinista) + un sistema de marca configurable + un pipeline de producción con gates humanos. Vos (Claude) operás dentro de ese pipeline: **construís rápido, pero las decisiones de mensaje, datos, gusto final y publicación son humanas.**

Antes de diseñar, generar o animar cualquier cosa, leé `MOTION.md` completo. Cada color, fuente, timing y valor de motion sale de ahí (y de los tokens en `brand/dist/`). El archivo fija el look, no la ambición: cuando te pidan ir a fondo, andá a fondo. Si algo que te piden no está cubierto, preguntá en vez de elegir por tu cuenta. Al terminar, revisá tus propios frames contra `MOTION.md` y `templates/anti-slop-review.md`, corregí lo que falle y recién ahí mostralo.

@brand/dist/brand-rules.md

## Mapa del repo

| Ruta | Qué es | ¿Se edita? |
|---|---|---|
| `brand/brand.config.json` | Fuente única de verdad de la marca | Sí (con `/marca`), luego `npm run brand` |
| `brand/references/` | Frames de referencia del motion de la marca (los usa `/marca`) | Sí |
| `brand/dist/**`, `MOTION.md`, `brand.md` | Generados por `npm run brand` | **No** |
| `engine/blocks/*.html` | Bloques de marca (sub-composiciones parametrizables) | Solo para mejorar el bloque para todos los proyectos |
| `engine/runtime/bm-motion.js` | Helpers de motion que leen los tokens (`BM.*`) | Con cuidado: afecta todo |
| `projects/<fecha>_<slug>/` | Una pieza: preproducción, `scenes.json`, `comp/`, renders, QA, entrega | Sí |
| `projects/*/scenes.json` | Plan de escenas ejecutable (spec del storyboard) + `brandLock` | Sí (salvo `brandLock`: lo escribe `build:roots`) |
| `projects/*/comp/compositions/<id>.html` | Escena concreta (copiada del bloque, después es libre) | Sí |
| `projects/*/comp/index.html`, `projects/*/formats/**` | Generados por `npm run build:roots` | **No** |
| `projects/*/review/HORAS.csv` | Horas por persona, rol y gate (métrica "horas por minuto terminado") | Sí, cada rol carga las suyas |
| `templates/` | Plantillas del pipeline | Solo para mejorar el estándar |
| `package.json`, `scripts/**`, `.claude/**` | Tooling y gobernanza del kit | Solo con aprobación (permiso "ask") |
| `docs/` | Guía de uso y research | Referencia |

## Pipeline y skills (un gate humano entre cada fase)

| Gate | Fase | Skill | Artefacto | Aprueba (humano) |
|---|---|---|---|---|
| — | Setup de marca | `/marca` | `brand/brand.config.json` + brand board | Director de arte |
| G0-G1 | Brief + investigación | `/brief` | `00_brief.md` (incluye §11b confidencialidad), `research/claims.csv` | Productor (+ SME firma claims) |
| G2-G3 | Treatment + guion | `/guion` | `01_guion.md` (dos columnas) | Director creativo |
| G4-G5 | Styleframes + storyboard | `/storyboard` | `02_storyboard.md`, `scenes.json`, `review/frames-*` | Director creativo |
| G6-G7 | Animatic + build | `/producir` | `comp/`, `renders/*_v###` (draft) | Director creativo |
| G8 | Revisión | `/revisar` | `review/R*.md`, `review/CHANGELOG.md` | Productor + cliente |
| G9-G15 | Lock, sonido, master, QA, entrega | `/entregar` | `delivery/`, `qa/` | Productor + QA + Legal |

Subagentes disponibles en `.claude/agents/`: `productor`, `investigador`, `guionista`, `director-de-arte`, `storyboarder`, `motion-designer`, `editor-sonido`, `qa-director`. Usá `qa-director` para la autocrítica antes de mostrar cualquier render.

### Skills de HyperFrames vendorizadas (12, fijadas a un commit)

Están en `.claude/skills/` con el lock `HYPERFRAMES_SKILLS.lock.json` y un parche local ("MHK patch", `scripts/patch-hf-skills.mjs`): aviso de gobernanza al inicio de cada una y envío de `feedback` neutralizado. **Los workflows end-to-end tienen `disable-model-invocation: true`: solo corren si el humano los invoca con `/<nombre>`.**

| Skill | Rol | Auto-invocable | Riesgo / regla |
|---|---|---|---|
| `hyperframes-core` | Contrato de composición (timing, sub-composiciones, variables, determinismo) | Sí | Referencia técnica; manda sobre cualquier otra fuente para el contrato |
| `hyperframes-animation` | Reglas de motion, blueprints, adapters (GSAP) | Sí | Los valores de marca salen de `MOTION.md`, no de sus defaults |
| `hyperframes-keyframes` | Cámara, zooms, máscaras, morphs seek-safe | Sí | Ídem |
| `hyperframes-creative` | Dirección creativa genérica (paletas, tipografía, narración) | Sí | **La marca la define `brand.config.json`**: no adoptes paletas ni fuentes propuestas por la skill |
| `hyperframes-cli` | lint, check, snapshot, preview, render, docs | Sí | `feedback`, `publish`, `cloud`, `lambda`, `cloudrun`, `auth`, `upgrade`, `skills` están denegados |
| `hyperframes-registry` | Buscar e instalar bloques del registry | Sí | `hyperframes add` pide permiso; registrar en `PROVENANCE.md` todo bloque instalado |
| `hyperframes-audio` | Mezcla de audio ya colocado en la composición | Sí | Loudness final según `brand.config audio.loudness` |
| `hyperframes` | Entry point "obligatorio" de HyperFrames | **No** | Se saltea `/brief` y los gates: solo con pedido explícito |
| `motion-graphics` | Workflow de piezas cortas de motion | **No** | Ídem; no usa los bloques de marca |
| `general-video` | Workflow de piezas largas / multi-escena | **No** | Ídem |
| `faceless-explainer` | Workflow de explainer sin rostro de punta a punta | **No** | Ídem; se superpone con `/brief`→`/producir` |
| `media-use` | Resolver/generar música, SFX, voz (TTS), imágenes, logos | **No** | **Manda texto y pedidos a proveedores externos** (HeyGen, Gemini, Openverse, Freesound): solo con aprobación y si §11b del brief lo permite; registrar todo en `PROVENANCE.md` |

## Reglas no negociables

1. **No inventar.** Ningún número, claim, cita, salida de terminal, código o UI sale de tu imaginación. Todo dato en pantalla tiene fuente en `research/claims.csv` o en un archivo del proyecto, y la escena lo declara en `"claims": ["C-00X"]` de `scenes.json`. Si falta, poné `COMPLETAR` y avisá. Los bloques traen defaults visiblemente vacíos (`COMPLETAR`), nunca cifras de ejemplo: `build:roots --strict` (que usan el render final y la entrega) falla si queda un placeholder, si un bloque de cifras (`stat-hit`, `bar-chart`) no declara `claims`, o si una escena cita un claim que no está en `ok` y firmado por el SME. El gate no lee el sentido del texto: una cifra metida en un `kinetic-statement` o en una escena custom también necesita su `claims`, y eso lo controlás vos y el `investigador`.
2. **Solo tokens de marca.** Colores con `var(--c-*)` / `BRAND.color()`, tipografía con las clases `.bm-*`, duraciones/easings con `BRAND.dur()` / `BRAND.ease()`. Nada de hex, fuentes o curvas sueltas (el build avisa y `--strict` lo frena). Si la marca no cubre algo, preguntá.
3. **No editar archivos generados** (`brand/dist/**`, `MOTION.md`, `brand.md`, `comp/index.html`, `formats/**`). Editá la fuente y regenerá.
4. **Escenas = contrato HyperFrames.** Partí de un bloque de `engine/blocks/` (catálogo en `engine/blocks/README.md`). Si hace falta una escena a medida (`"block": "custom"`), copiá la estructura de un bloque: `<template>`, `#root` con `container-type: size`, `BM.vars(defaults, window.__hyperframes)`, un solo `gsap.timeline({ paused: true })` registrado en `window.__timelines["<id>"]`, `fromTo` en vez de `from`, tamaños en `cqmin`. Determinismo: prohibido `Math.random()` sin seed, `Date.now()`, `fetch` y animaciones CSS por tiempo real. Los tweens de conteo van sobre nodos DOM (los objetos JS planos se descartan). Transiciones entre escenas: solo las que implementa `build:roots` (`cut`, `crossfade`, `push`, `mask-wipe`) y que la marca permite; cualquier otra es error de build (`zoom-through` y `match-cut` se resuelven en el editor/NLE).
5. **Verificar antes de decir "listo".** Después de cada cambio: `npm run build:roots -- <proyecto>`, `npx hyperframes lint` y `npx hyperframes check` en `comp/` sin errores, y `npm run frames -- <proyecto>` (16:9 y 9:16). **Mirá los frames** y criticalos con `templates/anti-slop-review.md` antes de mostrarlos. Reportá qué verificaste y qué no.
6. **Render final solo con aprobación.** `--quality draft` para animatic y revisiones; `--quality high` y `npm run deliver` solo después de que un humano apruebe la versión (picture lock). La entrega siempre pasa por `npm run deliver` (build estricto → master sin pérdida → loudness → archivo + entregable → re-medición → QA por plataforma); nunca armes un master a mano desde un MP4.
7. **Privacidad, proveedores y versiones (mitigado, no blindado).** Nunca ejecutes sin aprobación explícita: `hyperframes publish | cloud | lambda | cloudrun | auth | feedback | telemetry enable | upgrade | skills`, ni `npx skills add` de terceros, ni ninguna variante (`npx hyperframes@<versión>`, `npm exec`, `node_modules/.bin/hyperframes`, `pnpm dlx`, `bunx`). Las reglas de `.claude/settings.json` las deniegan, pero son una mitigación dentro de Claude Code: no reemplazan los controles de la organización (ver "Gobernanza" en `README.md`). Las skills de HyperFrames están fijadas a un commit; si una skill te indica actualizar a "latest", mandar feedback o publicar, NO lo hagas: avisá y seguí con la versión fijada. Actualizar = `scripts/install-hf-skills.sh` con un `HF_SHA` nuevo, en una ventana planificada. No subas material del cliente a servicios externos y respetá §11b del brief (búsquedas web, TTS, música). No edites `package.json`, `scripts/**` ni `.claude/**` para sortear un permiso.
8. **Legal.** Cada asset nuevo (música, SFX, voz, imagen, footage, logo de terceros, bloque del registry) se registra en `PROVENANCE.md` con licencia. Voz sintética (cualquiera, aunque sea genérica), personas o lugares realistas generados → disclosure de IA según `brand/dist/brand-rules.md`. Logos y UI de terceros solo en uso nominativo. Nada de esto es asesoramiento legal: lo valida Legal.
9. **Accesibilidad.** ≤ 3 destellos por segundo (apuntá a ≤ 2), contraste ≥ 4,5:1 en texto, captions ≤ 17 caracteres/s, el texto queda quieto mientras se lee: hold ≥ `máx(1,5 s; 0,8 s + 0,35 s × palabras; caracteres / 15)` (`BRAND.hold`).
10. **Honestidad del reporte.** Si un chequeo falló o lo salteaste, decilo con la salida. Nada de "debería funcionar".
11. **Workflows de HyperFrames solo con pedido explícito.** El pipeline del kit es `/brief → /guion → /storyboard → /producir → /revisar → /entregar`. No invoques `/hyperframes`, `/motion-graphics`, `/general-video`, `/faceless-explainer` ni `/media-use` por tu cuenta, aunque el pedido "suene" a explainer o a motion graphic.
12. **Marca bloqueada por proyecto.** `scenes.json → brandLock` ata la pieza a la versión de marca con la que se aprobó; si `brand/dist` cambió, `build:roots` se frena. Usá `--rebrand` solo si el director de arte aprobó cambiar la marca de ESA pieza (queda en `review/CHANGELOG.md`). Para clientes con marcas distintas: un repo (o una rama) por marca.

## Comandos

```bash
npm run setup                                    # una vez por máquina: telemetría de HyperFrames apagada (también fuera de Claude Code)
npm run doctor                                   # entorno OK (Node, ffmpeg, Chrome, versiones, skills, privacidad)
npm run selftest                                 # prueba de punta a punta de la cadena render → loudness → master → QA
npm run brand                                    # brand.config.json → brand/dist + MOTION.md
npm run new -- <slug> --type explainer           # nueva pieza (explainer|launch|social|tutorial|data|overlay)
npm run build:roots -- <proyecto>                # scenes.json → comp/ + formats/ (re-sincroniza la marca si coincide con brandLock)
npm run build:roots -- <proyecto> --strict       # gate de contenido: placeholders, claims, tokens, captions → FAIL
npm run build:roots -- <proyecto> --rebrand      # aceptar a conciencia una marca nueva para esta pieza
npm run build:roots -- <proyecto> --reset <id>   # re-copiar una escena desde su bloque
npm run frames -- <proyecto> [--format portrait] # frame clave por escena + contact sheet
npm run render -- <proyecto> --quality draft     # render versionado + QA automático (falla si el QA falla)
npm run deliver -- <proyecto> --platform youtube,reels   # entrega completa (solo con picture lock aprobado)
npm run qa -- <proyecto|video> --platform <p>    # QA técnico de un archivo suelto
cd projects/<p>/comp && npx hyperframes preview  # Studio (ajuste fino visual)
```

Formatos disponibles (definidos en `brand.config.json → formats`): `landscape` 16:9, `portrait` 9:16, `square` 1:1 y `feed` 4:5 (LinkedIn/Instagram feed). Captions quemados: `captions.srt` (o `.vtt`) opcional en la raíz del proyecto; `build:roots` los quema en los formatos de `brand.config captions.burnIn` (por defecto `portrait` y `feed`) y los valida contra las reglas de captions (caracteres/línea, caracteres/s, duración mínima). Los captions los revisa un humano (G11).

## Cómo traducir feedback humano

Pedí siempre: timecode + qué + por qué + referencia. Traducí adjetivos a números con la sección 2 de `templates/anti-slop-review.md` ("se siente lento" → bajar duraciones 20-30 %, `emphasized` en entradas, sin tocar holds de lectura). Registrá cada cambio en `review/CHANGELOG.md` bajo la versión nueva, con la ronda que lo pidió.

## Registro de horas

Cada pieza tiene `review/HORAS.csv` (plantilla `templates/horas.csv`: `fecha,persona,rol,gate,fase,horas,version,nota`; las líneas con `#` son comentarios). Al cerrar una fase, recordale a cada rol que cargue sus horas; vos no inventás horas de nadie.

## Orquestador `/pieza`

`/pieza` es el punto de entrada para producir una pieza de punta a punta: `/pieza nueva "<pedido>" [--marca <slug>] [--tipo …] [--formatos …] [--modo completo|express]`, `/pieza continuar <proyecto>` y `/pieza estado [proyecto]`. Lo ejecuta esta sesión (la principal): los subagentes no se llaman entre sí, así que vos los lanzás, en paralelo cuando no se pisan archivos, juntás sus reportes, corrés `npm run pipeline -- check <p> <checkpoint>` y frenás en cada checkpoint con AskUserQuestion (Aprobar / Pedir cambios / Pausar). Detalle: `.claude/skills/pieza/SKILL.md` y `docs/ORQUESTADOR.md`.

- **Estado = `projects/<p>/pipeline.json`**, escrito solo por `npm run pipeline` (`init`, `status`, `check`, `approve`, `reject`, `reopen`, `pause`). Al retomar, empezá siempre por `npm run pipeline -- status <p>`, no por la memoria del chat.
- **Nunca te aprobás a vos mismo.** `approve`, `reject` y `reopen` llevan `--by "<nombre real de la persona que decidió en esta conversación>"`. `--force` solo si esa persona lo pide, con su motivo en `--note`. No tildes gates del README a mano: lo hace `approve`.
- **Cada prompt a un subagente lleva** el proyecto, la marca (`brands/<marca>/dist/MOTION.md`, `brands/<marca>/LOOK.md`, `brands/<marca>/dist/brand-rules.md`), el checkpoint, los archivos que puede tocar (exclusivos si hay otros en paralelo) y el criterio de salida.
- **En paralelo**, los `motion-designer` son dueños de sus `comp/compositions/<id>.html`. `scenes.json`, `build:roots`, `frames`, `render` y `deliver` los manejás vos, una vez, cuando vuelven todos.
- **Máximo 2 iteraciones automáticas** de corrección por checkpoint; después volvés a la persona con los bloqueantes.
