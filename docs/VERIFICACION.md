# Verificación del kit (19-oct-2026)

Qué se probó antes de entregar el kit, con qué resultado y qué quedó sin probar. Entorno: Linux, Node 22.22, ffmpeg 6.1.1, HyperFrames 0.8.174 con su Chrome fijado (GPU por software), sin Docker corriendo. Versión del kit: v1.2 (multimarca + orquestador `/pieza`).

## Revisión adversarial

Un revisor independiente auditó la primera versión de la guía y del kit y encontró **25 problemas** (8 de severidad alta). Los más graves:

- la cadena de audio y master estaba rota (master desde un H.264, loudness sin aplicar);
- los gates no frenaban (lint por regex, QA con FAIL que terminaba en "listo");
- los bloques traían cifras de ejemplo creíbles sin control contra `claims.csv`;
- la marca era global y un re-render podía cambiarla en silencio;
- la guía afirmaba más de lo que el kit hacía.

Se corrigieron los 25. Los cambios están en los commits posteriores a `v1.0` y se describen en `README.md`, `CLAUDE.md` y la guía.

## Chequeos automáticos

| Chequeo | Resultado | Cómo |
|---|---|---|
| Entorno | Sin bloqueantes; telemetría apagada en la config del usuario | `npm run doctor` |
| Contraste de marca | 27/27 pares en TuMarca y en `editorial-claro` | `npm run brand -- --check` |
| Lint y check de HyperFrames | 0 errores. Contraste 43/43 por formato en la galería y 66/66 (16:9) y 67/67 (9:16) en el ejemplo, con la marca v1.2 (renders v005) | `npx hyperframes lint` / `check` (evidencia en `projects/*/qa/`) |
| Autotest de la cadena | 12/12. DELIVERY −14,1 LUFS / −3,7 dBTP; ARCHIVE ProRes 422 HQ 10 bit + PCM 24 | `npm run selftest` |
| Gate de contenido, negativo | Un proyecto recién creado da 7 problemas (placeholders, stat-hit sin valor ni claims) y exit 1 | `npm run new` + `build:roots --strict` |
| Gate de contenido, positivo | Con el contenido completo y un claim `ok` firmado, exit 0 | ídem |
| Entrega de punta a punta | YouTube + Reels, todo PASS con advertencias (holds largos). DELIVERY 16:9 y 9:16 a −14,1 LUFS; ARCHIVE a −13,9 LUFS, ProRes HQ + pcm_s24le; faststart, BT.709 | `npm run deliver -- <p> --platform youtube,reels` sobre un proyecto de prueba con una pista sintética |
| Gates negativos del render | exit 1 en los cuatro casos: `Math.random()` en una escena (lint), placeholder con `--quality high` (build estricto), video con destellos (QA), entregable mudo para YouTube (QA de entrega) | pruebas dirigidas |
| brandLock | Con la marca cambiada el build aborta; `--rebrand` actualiza el lock y lo anota en el CHANGELOG | lock alterado a mano |
| Transiciones | `push` y `mask-wipe` revisadas a mitad de transición; `zoom-through` y `spin` cortan el build | snapshots + build |
| Skills de HyperFrames | Una reinstalación limpia más el parche local queda idéntica a lo vendorizado (diff vacío); frontmatter YAML válido en las 19 skills | `scripts/install-hf-skills.sh` |
| Permisos | `.claude/settings.json` es JSON válido. Deny en 12 formas de invocación de los subcomandos riesgosos; las ediciones de scripts, `package.json` y `.claude/` piden permiso | parser JSON |

## Multimarca y orquestador (v1.2)

| Chequeo | Resultado | Cómo |
|---|---|---|
| Contraste por marca | `tumarca` 27/27, `northline` 27/27, `pulso` 31/31 pares (los looks con gradiente o resaltado suman pares) | `npm run brand:check` |
| Las marcas se distinguen | Revisión visual de la galería de 13 bloques con las 3 marcas, en 16:9 y 9:16 (fondo, alineación, tipografía, acento, entrada del texto y bloques firma distintos) | `npm run brand:compare -- _galeria-bloques` → `review/compare/` |
| Bloques firma | Un bloque firma de `pulso` pedido desde una pieza `tumarca` da exit 1 con mensaje claro; cambiar de marca sin `--rebrand` también | pruebas dirigidas |
| Piezas con otras marcas | Proyectos de prueba con `--brand pulso` y `--brand northline`: build `--strict`, lint y check sin errores | `npm run new -- … --brand …` |
| Misma pieza en 3 marcas | Demo de 5 escenas renderizada con cada marca en 16:9 y 9:16, QA sin FAIL | `npm run render` (videos en la página del kit) |
| Orquestador: estado | `init` en modo completo y express (idempotente); `status` legible y en JSON; sobre el ejemplo marca como bloqueantes los claims sin firma | `npm run pipeline` |
| Orquestador: chequeos | `check brief` sobre la plantilla da 7 bloqueantes y exit 1; con un brief mínimo válido pasa; `check storyboard` del ejemplo pasa con build OK | ídem |
| Orquestador: aprobaciones | `approve` sin `--by` → exit 2; con el chequeo en falla → exit 1; fuera de orden → se niega; `--force` exige motivo y queda marcado; `reject` bloquea hasta una versión nueva; `reopen` y `pause` registran | ídem |

## Renders de referencia

- **Galería** (`projects/_galeria-bloques`): 13 bloques, 78,5 s, 16:9 y 9:16, con datos rotulados "ficticio · demo" (v005, marca tumarca v1.2).
- **Ejemplo** (`projects/2026-10-19_ejemplo-servidor-mcp`): 46 s, 16:9 y 9:16. No publicable a propósito: el build estricto lo frena porque sus claims no tienen la firma del SME.

Los resultados de QA de cada render están en `qa/` de cada proyecto y en su `review/CHANGELOG.md`.

## Sin probar

- Una sesión completa de `/pieza` conducida por personas reales de punta a punta (se probaron el script de estado, los chequeos y las aprobaciones; la skill se ejecuta en Claude Code con AskUserQuestion).
- `render` y `deliver` con `northline` y `pulso` más allá de la pieza demo (el selftest usa la marca default).

- `--docker`: el flag existe en HyperFrames 0.8.174, pero Docker no corría en el entorno.
- Que Claude Code acepte los comodines en medio de un patrón (`*hyperframes* publish*`). Las reglas con prefijo `:*` cubren igual las formas conocidas.
- Una pieza con voz y música reales, y la escucha humana de una mezcla.
- Las skills (`/marca`, `/brief`, …) usadas por un equipo en una pieza real. El piloto de la guía es esa prueba.
- La heurística de fotosensibilidad contra EA IRIS o PEAT.
