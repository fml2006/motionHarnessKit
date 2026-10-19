# Qué es un servidor MCP — ejemplo resuelto

Tipo: **explainer** · Formatos: landscape, portrait · Creado: 2026-10-19 · Marca: TuMarca (bloqueada en `scenes.json → brandLock`)

> **NO PUBLICABLE.** C-002 y C-004 están en estado `dudoso` y las cuatro claims siguen `PENDIENTE SME`.
> `npm run build:roots -- 2026-10-19_ejemplo-servidor-mcp --strict` **falla a propósito** hasta que un SME las verifique y firme.
> El ejemplo muestra el pipeline técnico (brief → claims → guion → scenes.json → build → frames → render → QA automático),
> no una pieza aprobada: ningún gate humano se firmó.

## Estado real del pipeline (2026-10-19)

Solo está tildado lo que efectivamente se hizo. "Hecho, sin aprobar" = el artefacto existe pero nadie con autoridad lo firmó.

- [ ] G0 Brief firmado → `00_brief.md` · *hecho, sin aprobar* (el campo "Aprobador final" sigue vacío)
- [ ] G1 Investigación y claims → `research/claims.csv` · *hecho, sin aprobar*: 4 claims con fuente; C-002 y C-004 `dudoso`; todas `PENDIENTE SME`
- [ ] G2 Treatment aprobado → `01_guion.md` (hook elegido entre 3 opciones) · *parcial, sin aprobar*
- [ ] G3 Guion a dos columnas aprobado → `01_guion.md` · *hecho, sin aprobar*
- [ ] G4 Styleframes aprobados → `review/frames-*/` · *capturados, sin aprobar*
- [ ] G5 Storyboard = spec ejecutable → `scenes.json` · *hecho*; `02_storyboard.md` es la plantilla **sin completar** (en este ejemplo la spec se escribió directo en `scenes.json`)
- [ ] G6 Animatic aprobado (render draft + VO scratch) · **no hecho**: no hay VO scratch
- [x] G7 Build (npm run render) + QA automático sin FAIL · v001–v003 en calidad standard; QA v003: **PASS con advertencias** (sin pista de audio; 3 tramos quietos de 4,7–5,6 s)
- [ ] G7b Gate de contenido (`build:roots --strict`) · **falla** por las claims pendientes (es lo esperado)
- [ ] G8 Revisión R1 / R2 · *solo notas internas de dirección* en `review/CHANGELOG.md`; no hubo ronda con cliente y `review/R1.md` es la plantilla
- [ ] G9 Picture lock · no hecho
- [ ] G10 Mezcla a −14 LUFS / −1 dBTP · no hecho: la pieza no tiene audio
- [ ] G11 Captions revisados por humano · no hecho: no hay captions
- [ ] G12-G13 Master + versiones · no hecho
- [ ] G14 QA final + checklist legal → `qa/` · no hecho (checklists sin marcar)
- [ ] G15 Entrega + archivo · no hecho

Horas: `review/HORAS.csv` (las horas de esta sesión no se midieron; quedan vacías, no estimadas).

## Lo que este ejemplo NO prueba

- Audio: no hay VO, música ni SFX → loudnorm, mezcla y el chequeo de loudness del QA nunca se ejercitaron sobre esta pieza.
- Captions, master ProRes, entrega por plataforma y render con alpha: no se ejercitaron sobre esta pieza.
- Duración: el render dura 46 s contra ~42 s de objetivo del guion (+9,5 %, fuera del ±5 % que pide `/storyboard`). Queda para R3: recortar holds o re-aprobar la duración.
- Los 3 tramos quietos que marca el QA se aceptaron como nota de dirección porque la versión final llevaría VO; en una pieza muda habría que acortarlos.
- `s05-config` tiene una línea de 50 caracteres (`@modelcontextprotocol/server-filesystem`): en 9:16 queda chica; build:roots lo avisa.

## Comandos

```bash
npm run build:roots -- 2026-10-19_ejemplo-servidor-mcp            # scenes.json → comp/ + formats/ (gates en modo aviso)
npm run build:roots -- 2026-10-19_ejemplo-servidor-mcp --strict   # gate de contenido del render final (hoy falla: claims)
npm run frames -- 2026-10-19_ejemplo-servidor-mcp                 # un frame clave por escena (styleframes / review)
npm run render -- 2026-10-19_ejemplo-servidor-mcp --quality draft # animatic / revisión
npm run qa -- 2026-10-19_ejemplo-servidor-mcp
cd projects/2026-10-19_ejemplo-servidor-mcp/comp && npx hyperframes preview   # Studio para ajustes finos
```
