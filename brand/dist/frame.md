---
version: 1
name: TuMarca — Frame (capa de video)
description: >
  Sistema de diseño a escala de frame para TuMarca. Generado desde brand/brand.config.json
  (v1.1.0). Los átomos (hex, familias, pesos, motion tokens) son sagrados; la composición es libre.
unit: el frame — 1920×1080 (landscape), 1080×1920 (portrait), 1080×1350 (feed), 1080×1080 (square)
principle: átomos sagrados · composición libre · los números salen del guion verificado

colors:
  background: "#0B0F19"
  surface: "#131A2A"
  surface-alt: "#1B2438"
  border: "#2A3550"
  text: "#F4F6FB"
  text-muted: "#A6B0C5"
  primary: "#4C8DFF"
  secondary: "#2ED3A7"
  accent: "#FFB547"
  danger: "#FF6B6B"
  success: "#3DDC84"
  on-primary: "#06101F"
  code-background: "#0E1422"
  code-text: "#E6EDF7"
  code-comment: "#94A0B8"
  code-keyword: "#7FB0FF"
  code-string: "#5FE0B8"
  code-number: "#FFC46B"
  code-function: "#C9A7FF"
  data-viz-0: "#4C8DFF"
  data-viz-1: "#2ED3A7"
  data-viz-2: "#FFB547"
  data-viz-3: "#C9A7FF"
  data-viz-4: "#FF6B6B"
  data-viz-5: "#8A96B0"
  gradients-hero-0: "#4C8DFF"
  gradients-hero-1: "#2ED3A7"

typography:
  hero: { fontFamily: "Space Grotesk", cqmin: 13, weight: 700, lineHeight: 1.02, tracking: "-0.025em" }
  h1: { fontFamily: "Space Grotesk", cqmin: 9, weight: 700, lineHeight: 1.02, tracking: "-0.025em" }
  h2: { fontFamily: "Space Grotesk", cqmin: 6.4, weight: 700, lineHeight: 1.02, tracking: "-0.025em" }
  h3: { fontFamily: "Space Grotesk", cqmin: 4.8, weight: 500, lineHeight: 1.02, tracking: "-0.025em" }
  body: { fontFamily: "Inter", cqmin: 3.7, weight: 400, lineHeight: 1.3, tracking: "-0.01em" }
  caption: { fontFamily: "Inter", cqmin: 3.3, weight: 500, lineHeight: 1.3, tracking: "-0.01em" }
  kicker: { fontFamily: "JetBrains Mono", cqmin: 2.6, weight: 500, lineHeight: 1.5, tracking: "0", upper: true }
  code: { fontFamily: "JetBrains Mono", cqmin: 3, weight: 400, lineHeight: 1.5, tracking: "0" }

spacing:
  safe-landscape: "6%"
  safe-portrait: "8% + zonas UI de plataforma (top 14%, bottom 35%)"
  safe-square: "7%"
  safe-feed: "7%"
  radius-sm: "0.8cqmin"
  radius-md: "1.5cqmin"
  radius-lg: "2.5cqmin"

motion:
  personality: productive
  durations-ms: { instant: 100, micro: 150, short: 250, enter: 500, exit: 325, emphasis: 800, scene: 400, long: 1200 }
  easings: { standard: "cubic-bezier(0.2,0,0,1)", enter: "cubic-bezier(0.165,0.84,0.44,1)", exit: "cubic-bezier(0.55,0.055,0.675,0.19)", emphasized: "cubic-bezier(0.19,1,0.22,1)", move: "cubic-bezier(0.645,0.045,0.355,1)", camera: "cubic-bezier(0.77,0,0.175,1)", linear: "cubic-bezier(0,0,1,1)", expressive: "cubic-bezier(0.34,1.56,0.64,1)" }
  stagger-ms: { letters: 25, words: 70, lines: 120, items: 60, group-max: 500 }
  reading: "max(1.5 s; 0.8 s + 0.35 s × palabras; caracteres / 15)"
  transitions-allowed: [cut, crossfade, push, mask-wipe]
  transitions-manual-nle: [zoom-through, match-cut]

components:
  card:
    backgroundColor: "{colors.surface}"
    border: "stroke solid {colors.border}"
    rounded: "{spacing.radius-lg}"
    description: "Contenedor de contenido. Sin sombras pesadas ni glow."
  kicker:
    typography: "{typography.kicker}"
    textColor: "{colors.primary}"
    description: "Etiqueta de 1-4 palabras sobre el titular. Mono, mayúsculas, tracking amplio."
  accent-moment:
    textColor: "{colors.accent}"
    description: "El ÚNICO momento de acento por frame: el dato, la palabra clave o el CTA."
  code-surface:
    backgroundColor: "{colors.code-background}"
    textColor: "{colors.code-text}"
    description: "Ventana de código/terminal. Sintaxis: keyword {colors.code-keyword}, string {colors.code-string}, number {colors.code-number}."
---

# TuMarca — Frame

## Overview

Hacer que conceptos técnicos complejos se entiendan en minutos, sin perder rigor.

Personalidad: preciso · optimista · técnico pero humano · sin exageraciones. Audiencia: Profesionales de tecnología y tomadores de decisión (25-45 años), consumo mobile-first en LinkedIn, YouTube y Reels..

## Colors

Fondo `#0B0F19`, texto `#F4F6FB`, primario `#4C8DFF`, acento `#FFB547` (racionado: 1 momento por frame). El acento (accent) se raciona: una sola vez por frame, para el dato o la palabra clave. Nunca para texto corrido.

## Typography

- Display: **Space Grotesk** (500/700) — titulares, números grandes. Caja: sentence.
- Body: **Inter** — texto, subtítulos, captions.
- Mono: **JetBrains Mono** — kickers, labels, código, terminal.
- Máximo 7 palabras por línea y 3 líneas por frame. Nada por debajo de 28px a 1080p.

## Motion

- El movimiento explica: cada animación responde a una pregunta (qué apareció, qué cambió, qué importa).
- Una cosa a la vez: el ojo sigue un solo foco por beat; el resto queda quieto.
- Nunca arrancar en t=0: primer movimiento a los 150-300 ms de iniciada la escena.
- Entradas decididas, salidas discretas: las salidas duran ~65% de las entradas y aceleran.
- Holds generosos: el texto queda en pantalla al menos max(1,5 s; 0,8 s + 0,35 s por palabra; caracteres / 15).
- Dirección consistente: lo nuevo entra de derecha/abajo, lo que se va sale a izquierda/arriba.
- Máximo 2 tweens con el mismo easing por escena; la escena más lenta dura ~3x la más rápida.

Prohibido: Bounce/elastic en texto; Todo entrando a la vez con el mismo fade+slide-up; Rotaciones decorativas sin significado; Glow, partículas o lens flares de relleno; Movimiento continuo detrás de texto que se está leyendo.

## Do's and Don'ts

- ✓ Una idea por pantalla
- ✓ Verbos concretos y números verificados
- ✓ Analogías simples antes del detalle técnico
- ✗ Hype vacío ("revolucionario", "increíble", "game changer")
- ✗ Jerga sin explicar
- ✗ Claims de rendimiento sin fuente
- ✗ Logo: deformar
- ✗ Logo: rotar
- ✗ Logo: cambiar colores fuera de la paleta
- ✗ Logo: efectos glow o bevel
