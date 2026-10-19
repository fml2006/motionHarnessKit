# Verificación del kit (19-oct-2026)

Qué se probó antes de entregar el kit, con qué resultado y qué quedó sin probar. Entorno: Linux, Node 22.22, ffmpeg 6.1.1, HyperFrames 0.8.174 con su Chrome fijado (GPU por software), sin Docker corriendo.

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
| Lint y check de HyperFrames | 0 errores. Contraste 42/42 por formato en la galería (16:9 y 9:16 en los renders v004; 4 formatos revisados) y 64/64 en el ejemplo | `npx hyperframes lint` / `check` (evidencia en `projects/*/qa/`) |
| Autotest de la cadena | 12/12. DELIVERY −14,1 LUFS / −3,7 dBTP; ARCHIVE ProRes 422 HQ 10 bit + PCM 24 | `npm run selftest` |
| Gate de contenido, negativo | Un proyecto recién creado da 7 problemas (placeholders, stat-hit sin valor ni claims) y exit 1 | `npm run new` + `build:roots --strict` |
| Gate de contenido, positivo | Con el contenido completo y un claim `ok` firmado, exit 0 | ídem |
| Entrega de punta a punta | YouTube + Reels, todo PASS con advertencias (holds largos). DELIVERY 16:9 y 9:16 a −14,1 LUFS; ARCHIVE a −13,9 LUFS, ProRes HQ + pcm_s24le; faststart, BT.709 | `npm run deliver -- <p> --platform youtube,reels` sobre un proyecto de prueba con una pista sintética |
| Gates negativos del render | exit 1 en los cuatro casos: `Math.random()` en una escena (lint), placeholder con `--quality high` (build estricto), video con destellos (QA), entregable mudo para YouTube (QA de entrega) | pruebas dirigidas |
| brandLock | Con la marca cambiada el build aborta; `--rebrand` actualiza el lock y lo anota en el CHANGELOG | lock alterado a mano |
| Transiciones | `push` y `mask-wipe` revisadas a mitad de transición; `zoom-through` y `spin` cortan el build | snapshots + build |
| Skills de HyperFrames | Una reinstalación limpia más el parche local queda idéntica a lo vendorizado (diff vacío); frontmatter YAML válido en las 19 skills | `scripts/install-hf-skills.sh` |
| Permisos | `.claude/settings.json` es JSON válido. Deny en 12 formas de invocación de los subcomandos riesgosos; las ediciones de scripts, `package.json` y `.claude/` piden permiso | parser JSON |

## Renders de referencia

- **Galería** (`projects/_galeria-bloques`): 13 bloques, 78,5 s, 16:9 y 9:16, con datos rotulados "ficticio · demo".
- **Ejemplo** (`projects/2026-10-19_ejemplo-servidor-mcp`): 46 s, 16:9 y 9:16. No publicable a propósito: el build estricto lo frena porque sus claims no tienen la firma del SME.

Los resultados de QA de cada render están en `qa/` de cada proyecto y en su `review/CHANGELOG.md`.

## Sin probar

- `--docker`: el flag existe en HyperFrames 0.8.174, pero Docker no corría en el entorno.
- Que Claude Code acepte los comodines en medio de un patrón (`*hyperframes* publish*`). Las reglas con prefijo `:*` cubren igual las formas conocidas.
- Una pieza con voz y música reales, y la escucha humana de una mezcla.
- Las skills (`/marca`, `/brief`, …) usadas por un equipo en una pieza real. El piloto de la guía es esa prueba.
- La heurística de fotosensibilidad contra EA IRIS o PEAT.
