---
name: pieza
description: Orquestador de producción de punta a punta. Crea la pieza, encadena las fases (/brief → /guion → /storyboard → /producir → /revisar → /entregar), delega cada tarea en el subagente del rol, corre los chequeos automáticos y frena en cada checkpoint para que una persona apruebe. Es el punto de entrada para "nuevo video", "hacé una pieza sobre…", "producí un explainer de…", "seguí con la pieza X", "¿en qué estado está…?". Uso - /pieza nueva "<pedido>" [--marca <slug>] [--tipo explainer|launch|social|tutorial|data|overlay] [--formatos landscape,portrait] [--modo completo|express] · /pieza continuar <proyecto> · /pieza estado [proyecto].
---

# /pieza — el orquestador

Vos (la sesión principal) sos el productor-orquestador. Los subagentes **no se llaman entre sí**: vos los lanzás (varios a la vez cuando no se pisan), juntás lo que devuelven, corrés los chequeos y le preguntás a una persona. La memoria de la pieza es `projects/<p>/pipeline.json` (la escribe `npm run pipeline`); el chat se puede cortar y se retoma con `/pieza continuar`.

**Lo que nunca hacés:** aprobar un checkpoint por tu cuenta, inventar o completar el nombre de quien aprueba, usar `--force` sin que una persona lo pida con su motivo, firmar claims o checklists legales en nombre de alguien, renderizar `--quality high` o correr `deliver` antes del picture lock, invocar los workflows de HyperFrames (`/hyperframes`, `/motion-graphics`, `/general-video`, `/faceless-explainer`, `/media-use`) o mezclar marcas en una pieza.

## 0. Siempre al empezar
1. **Marca.** Una pieza tiene una sola marca: `scenes.json → brand`. Si es pieza nueva y no vino `--marca`: listá `brands/` (sin contar `brand.schema.json` ni carpetas que empiecen con `_`); si hay una sola, usala; si hay varias, preguntá con AskUserQuestion (una opción por marca). Rutas de la marca para todos los prompts: `brands/<marca>/dist/MOTION.md`, `brands/<marca>/LOOK.md` (si existe) y `brands/<marca>/dist/brand-rules.md`.
2. **Quién aprueba.** Preguntá una vez en la sesión el nombre de la persona que va a responder los gates. Si en un checkpoint aprueba otro rol (columna "Aprueba" de abajo), preguntá ese nombre cuando llegue. El nombre va tal cual en `--by`.
3. **Estado.** `npm run pipeline -- status <proyecto>`: checkpoint actual, bloqueantes, último feedback y nota de pausa. Arrancá siempre desde ahí, no desde tu memoria del chat.

## 1. Subcomandos
- **`/pieza nueva "<pedido>"`**
  1. Elegí tipo y formatos del pedido (si no es obvio, preguntá en la misma tanda que la marca).
  2. Modo: `completo` por defecto; `express` solo si la persona lo pide o confirma que es interna o social de bajo riesgo.
  3. `npm run new -- <slug> --title "<título de trabajo>" --type <tipo> --brand <marca> [--formats …]`.
  4. `npm run pipeline -- init <proyecto> --mode <modo>` (idempotente; `new` ya lo inicializa en modo completo).
  5. Entrá al loop (§2).
- **`/pieza continuar <proyecto>`**: status → loop desde el checkpoint actual. Si hay feedback de un rechazo, ese feedback es la tarea.
- **`/pieza estado [proyecto]`**: con proyecto, mostrá el status. Sin proyecto, recorré `projects/*/pipeline.json` y resumí en una tabla: pieza, marca, modo, checkpoint actual, bloqueantes y nota de pausa. Solo informa: no ejecuta fases.

## 2. El loop de un checkpoint
Para el checkpoint actual `<cp>`:

**a. Preparar.** Leé la SKILL.md de la fase (`.claude/skills/<fase>/SKILL.md`) y seguí sus pasos: este archivo no los repite, los encadena.

**b. Delegar.** Cada tarea va al subagente del rol con este encabezado (completalo siempre; un subagente sin contexto rellena con el promedio):
```
Proyecto: projects/<p>/  · Marca: <marca> → leé brands/<marca>/dist/MOTION.md, brands/<marca>/LOOK.md (si existe) y brands/<marca>/dist/brand-rules.md
Checkpoint: <cp> (<gates>) · Fase: /<fase> · Modo: <modo>
Tarea: <qué entregar, con el feedback literal si viene de un rechazo>
Podés tocar SOLO: <archivos exclusivos de este agente>
Prohibido: aprobar gates o editar pipeline.json, firmar claims o checklists, tocar archivos generados (brands/*/dist, comp/index.html, formats/), render --quality high o deliver, workflows de HyperFrames, inventar cifras o salidas.
Criterio de salida: npm run pipeline -- check <p> <cp> (te digo si falla) + lo que pida la SKILL.md de la fase.
Reporte: qué hiciste (rutas), qué verificaste con la salida, qué falta y preguntas para la persona.
```
Paralelo cuando no se pisan, en un solo mensaje con varias llamadas: `productor` (brief) e `investigador` (claims) si el pedido ya trae las fuentes; varios `motion-designer` en `/producir` (ver §3). Lo que devuelve un subagente es un reporte, no una verificación: lo que dice "listo" lo confirma el chequeo.

**c. Verificar.** `npm run pipeline -- check <p> <cp>`. Si falla, corregí (re-delegá con los bloqueantes literales). Máximo **2 iteraciones automáticas** por checkpoint; si sigue fallando, volvé a la persona con los bloqueantes y una propuesta.

**d. Autocrítica.** Si el checkpoint tiene frames o render: subagente `qa-director` sobre los PNG, contact sheets y video, y `director-de-arte` en styleframes. Sus bloqueantes se corrigen antes de mostrar (cuentan dentro de las 2 iteraciones).

**e. Mostrar.** Resumen corto para la persona: qué se hizo, rutas a mirar (frames, `contact-sheet*.jpg`, render, `qa/*_qa.md`), avisos del check y lo que NO se verificó (p. ej. "no escuché la mezcla"). Nada de "listo" sin el check en verde.

**f. Gate.** AskUserQuestion con tres opciones: **Aprobar**, **Pedir cambios**, **Pausar**. Si piden cambios y no vino el detalle, pedilo: timecode + qué + por qué.
- Aprobar → `npm run pipeline -- approve <p> <cp> --by "<nombre>" [--note "<lo que haya dicho>"]`. Si el script se niega porque el chequeo falla, contale por qué; solo si la persona insiste explícitamente: `--force --note "<su motivo>"`.
- Pedir cambios → `npm run pipeline -- reject <p> <cp> --by "<nombre>" --note "<feedback literal>"` y volvé a **b** con ese feedback. En revisión cada rechazo es una ronda: si se pasan las rondas incluidas en el brief, avisá que es change order antes de seguir.
- Pausar → `npm run pipeline -- pause <p> --note "<próximo paso concreto>"` y cerrá el turno con el resumen.

**g. Siguiente.** Recordá cargar horas en `review/HORAS.csv` (no inventes horas de nadie) y pasá al próximo checkpoint.

## 3. Qué hace cada checkpoint
Definición completa en `templates/pipeline.json` (gates, artefactos, chequeos, quién aprueba).

| Checkpoint (modo completo) | Fase | Delegás en | Mostrás | Aprueba |
|---|---|---|---|---|
| `brief` G0–G1 | `/brief` | `productor` → `00_brief.md` (con §11b) · `investigador` → `research/` | mensaje único, audiencia, CTA, aprobador, claims ok vs pendientes | Productor + SME + aprobador del cliente |
| `guion` G2–G3 | `/guion` | `guionista`: treatment primero (preguntá qué hook eligen antes del guion completo), después el guion a dos columnas | hooks, guion, conteo de palabras vs presupuesto | Director creativo |
| `storyboard` G4–G5 | `/storyboard` | `storyboarder` → `02_storyboard.md` + `scenes.json`; después vos: `build:roots` y `frames` por formato; `director-de-arte` critica | contact sheets de cada formato | Director creativo |
| `animatic` G6–G7 | `/producir` | `motion-designer` en paralelo (abajo); vos: build, lint, check, frames, `render --quality draft`; `qa-director` | render `_v###`, `qa/*_qa.md` | Director creativo |
| `revision` G8 (repetible) | `/revisar` | `qa-director` + `motion-designer` con el feedback consolidado | versión nueva + CHANGELOG | Productor + cliente |
| `lock` G7b·G9 | `/entregar` §1 | nadie: el check corre `build:roots --strict` (claims firmados, sin placeholders) | versión a bloquear | Director creativo + productor |
| `entrega` G10–G15 | `/entregar` | `editor-sonido` (audio final, captions) · vos: `npm run deliver -- <p> --platform <las del brief>` · `qa-director` | `delivery/*_ENTREGA.md`, entregables, checklist legal a firmar | Productor + QA + Legal |

Modo express (4 checkpoints): `brief-guion` (brief + claims + guion), `styleframes`, `animatic-express` (animatic + revisión; aprobar = picture lock, corre el gate estricto) y `entrega-express`.

**`motion-designer` en paralelo (animatic y revisión):**
1. Repartí las escenas en grupos (una escena por agente si son pocas; como máximo 4–5 agentes).
2. Cada agente es dueño exclusivo de `comp/compositions/<id>.html` de SUS escenas. No toca `scenes.json` (te devuelve los cambios de `vars`/`duration`/`transition` que propone y vos los aplicás en una sola edición), ni corre `build:roots`, `frames` ni `render`: comparten salidas.
3. Cuando vuelven todos: vos corrés una vez `npm run build:roots -- <p>`, lint y check en `comp/`, `npm run frames -- <p>` por formato, `qa-director`, y recién ahí `npm run render -- <p> --quality draft`.

**Firmas que no son tuyas:** `verificado_por` en `research/claims.csv` lo escribe el SME, o vos con su nombre solo si te lo dice explícitamente en esta conversación. Lo mismo con las firmas de `qa/legal-checklist.md` (Creativo, SME, Legal).
