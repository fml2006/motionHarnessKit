# STORYBOARD — [CLIENTE] · [PIEZA]

> **Estado en este ejemplo (2026-10-19):** plantilla **sin completar** (el ejemplo de abajo es el de la plantilla, no de esta pieza). En este proyecto la spec ejecutable se escribió directo en `scenes.json`; la ficha humana por escena queda pendiente.

> Gate **G5** (storyboard) → **G6** (animatic). Dueño: Motion director · Aprueba: Director creativo · Cliente: opcional en G5, obligatorio en G6.
> Este archivo tiene dos partes:
> **A.** Ficha humana por escena (para revisión con cliente / equipo).
> **B.** `STORYBOARD.md` **ejecutable** por el agente (compatible con el parser de HyperFrames: frontmatter + `## Frame N — Título` + bullets `- clave: valor`; las claves no estándar se preservan en `extra`).
> Regla: la parte B es la **fuente de verdad**; la A se genera / actualiza desde la B.

---

## A. Ficha por escena (vista humana)

| Campo | S03 — "Antes / Ahora" |
|---|---|
| Frame / ID | S03 (IDs estables: si se inserta, `S03b`; nunca renumerar) |
| TC in–out · duración | 00:12:00 – 00:17:00 · 5,0 s |
| Key frame (still aprobado) | `boards/stills/S03.png` |
| VO (literal) | "**Antes**, construir la imagen se llevaba casi todo el tiempo. **Ahora**, se reutiliza." |
| Texto en pantalla (literal) | "v1 — 11 min" · "v2 — 4 s" · "−99 %" |
| Layout | Grid 12 col; barras col 2–11; labels alineados a la izquierda; label "−99 %" a la derecha de la barra B |
| Movimiento | Barra A 0→100 % · 1,2 s · power2.out · dispara en "Antes" / Barra B 0→0,6 % del largo de A (4 s / 660 s = proporción honesta; ancho mínimo visible 8 px, sin "agrandarla" para que se vea) · 0,3 s · power3.out · dispara en "Ahora" / Label "−99 %" scale 0,9→1 + opacity 0→1 · 0,25 s · +0,2 s tras B |
| Transición in / out | In: corte (desde S02 zoom) · Out: corte |
| SFX / música | Whoosh pre-lap 6 frames antes del corte de salida; MX continúa |
| Assets / datos | `data/deploy-times.json` (claim C-001/C-002) |
| Claims | C-001, C-002 |
| Criterio de aceptación | Snapshot @00:16: "−99 %" es el elemento de mayor contraste; cifras = JSON; `check` sin overflow ni contraste < AA |
| No tocar / restricciones | Sin partículas, glow, ejes, 3D. No modificar S02/S04 |
| Notas / intención | La diferencia tiene que **sentirse** en el tiempo de crecimiento de las barras, no solo leerse |

### Board (contact sheet)
| S01 | S02 | S03 | S04 |
|---|---|---|---|
| ![](boards/stills/S01.png) | ![](boards/stills/S02.png) | ![](boards/stills/S03.png) | ![](boards/stills/S04.png) |
| 0:00–0:04 · Hook | 0:04–0:12 · Problema | 0:12–0:17 · Antes/Ahora | … |

---

## B. `STORYBOARD.md` ejecutable (copiar al repo del proyecto)

> Validado el 2026-10-19 con `parseStoryboard` de `@hyperframes/core/storyboard`: 3 frames y 0 warnings. Las claves de la casa (`tc_in`, `on_screen_text`, `motion`, `acceptance`, `do_not`, `lock`…) quedan en `frame.extra` y las del frontmatter en `globals.extra`.

```markdown
---
format: 1920x1080
duration: 90s
message: "Con Acme Deploy, un deploy a producción pasa de minutos a segundos sin cambiar tu pipeline."
arc: Hook → Problema → Solución → Prueba → CTA
audience: equipos DevOps / platform engineers (nivel técnico 4/5)
mode: collaborative
design_spec: frame.md
fps: 30
locale: es-419
vo_source: audio/vo/EXPL01_VO_final.wav
vo_timestamps: audio/vo/EXPL01_VO_words.json
safe_zone_vertical: "x 65-900, y 270-1248 (1080x1920)"
house_rules: "No inventar datos ni texto. Solo tokens de frame.md. No modificar frames con lock: true. Reusar bloques del registry antes de construir looks desde cero."
---

## Frame 1 — Hook

- status: outline
- src: compositions/frames/S01-hook.html
- duration: 4s
- poster: 3.5s
- transition_in: cut
- scene: Terminal ejecuta deploy; "4 s" vs "11 min" tachado
- voiceover: "Este deploy tarda cuatro segundos. El mes pasado tardaba once minutos."
- tc_in: 00:00:00:00
- tc_out: 00:00:04:00
- on_screen_text: "acme deploy --prod" | "4 s" | "11 min"
- layout: terminal centrada 60% ancho sobre --bg-900; "4 s" type.display --accent debajo; "11 min" type.h2 --neutral-500 a la derecha
- motion: cursor ejecuta en frame 0; progreso 0→100% 0.8s power2.out termina en palabra "cuatro"; "11 min" entra en palabra "once" + strike-through 0.3s
- sfx: tick seco en "cuatro"
- music: entra pulso grave en 0.0s
- assets: assets/fonts/JetBrainsMono.woff2
- data: data/deploy-times.json
- claims: C-001
- acceptance: snapshot @3.5s muestra "4 s" legible y "11 min" tachado; check sin errores
- do_not: logo, partículas, intro de marca
- reference: boards/stills/S01.png
- lock: false

Hook "resultado primero". Movimiento visible desde el frame 0 porque el primer frame funciona como miniatura en autoplay mudo.

## Frame 2 — Problema

- status: outline
- src: compositions/frames/S02-problema.html
- duration: 8s
- poster: 7s
- transition_in: cut
- scene: Pipeline de 4 nodos que se iluminan uno por uno
- voiceover: "En la mayoría de los equipos, cada deploy es una espera: build, tests, imagen, rollout. Y mientras tanto, nadie mergea."
- tc_in: 00:00:04:00
- tc_out: 00:00:12:00
- on_screen_text: "build" | "tests" | "imagen" | "rollout"
- layout: 4 nodos horizontales equiespaciados en col 2-11; reloj pequeño arriba derecha
- motion: cada nodo --accent 0.25s en su palabra ancla; reloj rota 360° en 8s linear
- transition_out: zoom-in al nodo "imagen" 0.6s power3.inOut
- registry_block: buscar "pipeline steps" con `npx hyperframes catalog --query "pipeline steps" --json` antes de construir
- acceptance: un solo nodo activo a la vez; snapshot @10s muestra 4 nodos con "imagen" activo
- do_not: flechas animadas con partículas
- reference: boards/stills/S02.png
- lock: false

Problema. Un elemento nuevo por vez; densidad máxima 4.

## Frame 3 — Antes / Ahora

- status: outline
- src: compositions/frames/S03-antes-ahora.html
- duration: 5s
- poster: 4.5s
- transition_in: cut
- scene: Dos barras comparan 11 min vs 4 s; label −99 %
- voiceover: "Antes, construir la imagen se llevaba casi todo el tiempo. Ahora, se reutiliza."
- tc_in: 00:00:12:00
- tc_out: 00:00:17:00
- on_screen_text: "v1 — 11 min" | "v2 — 4 s" | "−99 %"
- layout: grid 12 col; barras col 2-11; label −99 % a la derecha de barra B
- motion: barra A 0→100% 1.2s power2.out en palabra "Antes"; barra B 0.3s power3.out en "Ahora"; label scale 0.9→1 + opacity 0.25s, +0.2s
- sfx: whoosh pre-lap 6 frames antes del corte de salida
- data: data/deploy-times.json
- claims: C-001, C-002
- acceptance: snapshot @4s (00:16) "−99 %" es el elemento de mayor contraste; cifras idénticas al JSON; check sin overflow ni contraste < AA
- do_not: partículas, glow, ejes, 3D; no tocar Frame 2 ni Frame 4
- reference: boards/stills/S03.png
- lock: false

La diferencia se tiene que sentir en el tiempo de crecimiento, no solo leerse.
```

### Ciclo de estados
| status (parser) | Significado | Gate |
|---|---|---|
| `outline` | Spec escrita, sin HTML | G5 |
| `built` | Layout confirmado (sketch con fuentes, colores y copy reales; bloques para lo no producido) — es el animatic | G6 |
| `animated` | Movimiento + assets reales | G7 |
| `lock: true` (clave de la casa en `extra`) | Aprobado por cliente; el agente no lo modifica | G8 / G9 |

### Reglas de escritura de la spec (para que el agente la ejecute bien)
1. Anclar cada evento a TC o a una **palabra de la VO** (que exista literal en `voiceover`).
2. Colores / tipos / easing **solo por token** de `frame.md`.
3. `on_screen_text` literal; separador ` | `. El agente no agrega textos.
4. Números **solo** desde `data:` y con `claims:`.
5. Un verbo de movimiento por elemento con duración y easing.
6. Estado inicial y final claros (qué hereda de la escena anterior, qué entrega a la siguiente).
7. Buscar bloque/blueprint existente antes de describir un look nuevo.
8. `do_not` explícito y `reference` a un still aprobado.
9. `acceptance` verificable con `snapshot --at` / `check`.
10. Valores en **una línea** (el parser colapsa multilínea).

### Animatic (G6) — checklist
- [ ] Todos los frames en `built`, temporizados a la VO scratch
- [ ] Leyenda "ANIMATIC — NO FINAL" y música temp con marca de agua
- [ ] Duración total ±5 % del objetivo
- [ ] Cada texto en pantalla ≥ 1 s + 0,3 s × palabras
- [ ] Hook se entiende sin sonido (texto en pantalla) y en ≤5 s
- [ ] Cliente informado de qué NO se evalúa aún (movimiento final, color fino)
- [ ] Sign-off: **después de G6, cambios de guion / orden = change order**

---

## C. Del storyboard a `scenes.json` (motion-harness-kit)

En este kit, cada `## Frame N` se traduce a **una escena** de `scenes.json`. La skill `/storyboard` escribe los dos archivos; `npm run build:roots` arma la composición.

| Campo del storyboard | Campo en `scenes.json` | Nota |
|---|---|---|
| `## Frame 3 — Antes / Ahora` | `"id": "s03-antes-ahora"` | IDs estables: si se inserta, `s03b-...`; nunca renumerar |
| `duration: 5s` | `"duration": 5` | Mínimo: `BRAND.hold(texto)` de cada texto en pantalla |
| bloque elegido | `"block": "bar-chart"` | Ver catálogo en `engine/blocks/README.md`. `"custom"` = escena a medida en `comp/compositions/<id>.html` |
| `on_screen_text`, datos | `"vars": { ... }` | Literal. Números solo desde `data:` con `claims:` |
| `transition_in` | `"transition": "cut" \| "crossfade"` | Default de marca: `cut` |
| `voiceover`, `notes`, `acceptance`, `do_not` | `"notes": "..."` | Se copia como comentario en el HTML y lo lee el agente |
| formato vertical distinto | `"formats": { "portrait": { "duration": 6, "vars": { ... } } }` | Densidad: la mitad en 9:16 |
| no va en un formato | `"skipIn": ["square"]` | |

```json
{
  "id": "s03-antes-ahora",
  "block": "bar-chart",
  "duration": 5,
  "transition": "cut",
  "vars": {
    "title": "Tiempo de build de imagen",
    "items": "v1: 660\nv2: 4",
    "unit": " s",
    "highlight": "v2",
    "source": "Fuente: data/deploy-times.json (C-001, C-002)"
  },
  "notes": "VO: 'Antes, construir la imagen…' · acceptance: −99 % es el elemento de mayor contraste · do_not: partículas, glow"
}
```
