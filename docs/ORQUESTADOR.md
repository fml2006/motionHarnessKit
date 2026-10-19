# Orquestador `/pieza`

`/pieza` encadena todo el pipeline en una sola conversación de Claude Code. Crea la pieza, ejecuta cada fase delegando en el subagente del rol, corre los chequeos automáticos y frena en cada checkpoint para que una persona apruebe. Las skills de fase (`/brief`, `/guion`, `/storyboard`, `/producir`, `/revisar`, `/entregar`) siguen funcionando sueltas: `/pieza` las usa como recetas.

## Quién llama a quién

```
 Personas (productor, director creativo, SME, cliente, legal)
   │  pedido · respuesta en cada checkpoint: Aprobar / Pedir cambios / Pausar
   ▼
 Sesión principal de Claude Code ── skill /pieza (el orquestador)
   │
   │  estado ──► npm run pipeline ──► projects/<p>/pipeline.json
   │                                 + tilde de gates en README.md + línea en review/CHANGELOG.md
   │
   │  lanza subagentes (varios a la vez cuando no se pisan):
   ├──► productor ─────────────► 00_brief.md (con §11b)
   ├──► investigador ──────────► research/digest.md, research/claims.csv
   ├──► guionista ─────────────► 01_guion.md (treatment + guion a dos columnas)
   ├──► storyboarder ──────────► 02_storyboard.md + scenes.json
   ├──► director-de-arte ──────► crítica de styleframes
   ├──► motion-designer × N ───► comp/compositions/<id>.html (cada uno, sus escenas)
   ├──► qa-director ───────────► veredicto (solo lectura)
   └──► editor-sonido ─────────► audio final + captions
   │
   └─ corre una sola vez los scripts compartidos: build:roots · frames · render · deliver
```

Los subagentes **no se llaman entre sí**: en Claude Code un subagente no puede lanzar otro. Todo pasa por la sesión principal, que es la única que habla con la persona (AskUserQuestion) y la única que escribe el estado de la pieza.

## El loop de un checkpoint

```
 status ─► receta de la fase (SKILL.md) ─► delegar ─► pipeline check ──falla──► corregir (máx. 2 veces)
                                                          │ ok                         │
                                                          ▼                            │
                                     autocrítica: qa-director / director-de-arte ◄─────┘
                                                          ▼
                                 resumen + rutas a mirar + AskUserQuestion a la persona
            Aprobar ──────► npm run pipeline -- approve … --by "<nombre>" ──► siguiente checkpoint
            Pedir cambios ► npm run pipeline -- reject … --note "<feedback>" ─► volver a delegar con ese feedback
            Pausar ───────► npm run pipeline -- pause … --note "<próximo paso>" ─► fin del turno
```

## Modos

| Modo | Para qué | Checkpoints humanos |
|---|---|---|
| `completo` (default) | Piezas de cliente, públicas o con cifras | `brief` G0–G1 → `guion` G2–G3 → `storyboard` G4–G5 → `animatic` G6–G7 → `revision` G8 (una ronda por rechazo) → `lock` G7b·G9 → `entrega` G10–G15 |
| `express` | Piezas internas o sociales de bajo riesgo | `brief-guion` G0–G3 → `styleframes` G4–G5 → `animatic-express` G6–G9 (aprobar = picture lock) → `entrega-express` G10–G15 |

La definición completa de cada checkpoint (skill, subagentes, artefactos, chequeos y quién aprueba) está en `templates/pipeline.json`. Cada pieza guarda su estado en `projects/<p>/pipeline.json`; no se edita a mano.

## Qué chequea `npm run pipeline -- check`

| Chequeo | Falla si… |
|---|---|
| brief | faltan el mensaje único, la audiencia, el CTA, el aprobador final con nombre o §11b; quedan ejemplos de la plantilla, placeholders o ítems sin tildar del criterio de salida G0 |
| claims | falta `research/claims.csv`, o una claim no está `ok` o no tiene la firma del SME |
| guion | falta el guion o es la plantilla; el treatment no tiene hooks; la VO supera duración × `wordsPerSecond` de la marca (+10 %); cita claims que no existen |
| storyboard | falta el storyboard; `scenes.json` es inválido; `build:roots` falla; faltan styleframes de algún formato del plan |
| animatic | no hay render, el QA dio FAIL o se salteó; una persona pidió cambios y no hay versión nueva |
| revision | lo mismo que animatic, y avisa si falta `review/R<n>.md` o la línea del CHANGELOG |
| lock | todo lo anterior, más `build:roots --strict`: sin placeholders, cifras con claim firmado y tokens de marca |
| delivery | no hay `delivery/*_ENTREGA.md` o tiene FAIL |
| captions | la pieza tiene VO y no hay `captions.srt`/`.vtt` |
| legal | `qa/legal-checklist.md` sin las firmas Creativo y SME (y Legal en N2/N3); `PROVENANCE.md` sin completar |

Los chequeos son heurísticos: comprueban que los artefactos existan, estén completos y al día. **No juzgan calidad**: eso lo hacen `qa-director` y, sobre todo, la persona que aprueba.

## Una sesión típica

```
Vos:    /pieza nueva "Explainer de 60 s: qué es un servidor MCP, para devs" --marca tumarca
Claude: ¿Quién aprueba los gates en esta sesión?  →  "Ana Pérez"
        crea projects/2026-10-20_que-es-un-servidor-mcp/  (modo completo)

[brief]      productor + investigador en paralelo → check: C-002 "dudoso"
             muestra mensaje único, audiencia, CTA y claims → Ana: "Pedir cambios: sacá C-002"
             reject → el investigador ajusta → check OK → el SME dice "firmo, Juan Gómez"
             → Ana: Aprobar → approve brief --by "Ana Pérez"
[guion]      treatment con 3 hooks → "¿cuál?" → guion → check: 128 palabras de 132 → Aprobar
[storyboard] storyboarder → build:roots + frames 16:9 y 9:16 → director-de-arte → contact sheets → Aprobar
[animatic]   6 escenas → 3 motion-designer en paralelo (2 escenas cada uno) → build, lint, check, frames
             → qa-director → render draft v001 → "00:12: el gráfico entra muy rápido" → reject
             → el motion-designer de esa escena ajusta → v002 → Aprobar
[revision]   feedback del cliente (R1) → v003 → Aprobar
[lock]       check con build estricto → Aprobar (picture lock v003)
[entrega]    editor-sonido + npm run deliver -- … --platform youtube,reels → qa-director
             → checklist legal firmado por las personas → Aprobar → pieza cerrada
```

Se puede cortar en cualquier momento: con **Pausar** queda la nota del próximo paso, y `/pieza continuar que-es-un-servidor-mcp` retoma desde el estado guardado, en esta o en otra sesión.

## Qué decide la persona y qué hace el agente

| Decide una persona | Hace el agente |
|---|---|
| Mensaje, hook, look, timing, versión final | Redactar, construir, verificar y proponer |
| Firma de claims (SME) y del checklist legal | Dejar todo listo para firmar y marcar lo pendiente |
| Aprobar o pedir cambios en cada checkpoint (con su nombre) | Registrar la decisión tal cual (`approve` / `reject`) |
| Aprobar igual con un chequeo en rojo (`--force`, con motivo) | Nunca por su cuenta |
| Publicar | Nunca |

## Comandos de `npm run pipeline`

```bash
npm run pipeline -- init <dir> [--mode completo|express]        # lo corre npm run new
npm run pipeline -- status <proyecto> [--json]                  # checkpoint actual, bloqueantes, próximo paso
npm run pipeline -- check <proyecto> [<checkpoint>] [--no-build] # chequeo automático (exit 1 si no está listo)
npm run pipeline -- approve <proyecto> <checkpoint> --by "Nombre" [--note "…"]
npm run pipeline -- approve <proyecto> <checkpoint> --by "Nombre" --force --note "motivo"   # queda registrado como FORZADO
npm run pipeline -- reject <proyecto> <checkpoint> --by "Nombre" --note "feedback"
npm run pipeline -- reopen <proyecto> <checkpoint> --by "Nombre" --note "motivo"   # ese y los siguientes vuelven a pendiente
npm run pipeline -- pause <proyecto> --note "próximo paso concreto"
```

## Límites

- **No es una firma digital.** `--by` registra el nombre que la persona dio en la conversación; el script no verifica identidad. Para aprobaciones contractuales, el registro del gate complementa (no reemplaza) el OK por escrito del cliente.
- **Paralelismo acotado por archivos compartidos.** Los subagentes trabajan en paralelo solo sobre archivos exclusivos. `scenes.json`, `build:roots`, `frames`, `render` y `deliver` los maneja el orquestador, de a uno.
- **Contexto.** Una pieza larga puede ocupar varias sesiones: la memoria es `pipeline.json`, no el chat.
- **Una marca por pieza.** Sale de `scenes.json → brand`. Para producir lo mismo en otra marca, se arma otra pieza.
