---
version: 1
name: Northline — Frame (capa de video)
description: >
  Sistema de diseño a escala de frame para Northline. Generado desde brands/northline/brand.config.json
  (v1.1.0). Los átomos (hex, familias, pesos, motion tokens) son sagrados; la composición es libre.
unit: el frame — 1920×1080 (landscape), 1080×1920 (portrait), 1080×1350 (feed), 1080×1080 (square)
principle: átomos sagrados · composición libre · los números salen del guion verificado

colors:
  background: "#F6F1E8"
  surface: "#ECE4D6"
  surface-alt: "#E2D7C5"
  border: "#CDBFA9"
  text: "#1B1A17"
  text-muted: "#5B554B"
  primary: "#1F3A5F"
  secondary: "#2F6B4F"
  accent: "#B4532A"
  danger: "#A33A2C"
  success: "#2F6B4F"
  on-primary: "#F6F1E8"
  code-background: "#1E2328"
  code-text: "#EDE6D9"
  code-comment: "#ABA59A"
  code-keyword: "#E39A72"
  code-string: "#9CC9A8"
  code-number: "#E8C07A"
  code-function: "#A9C1E8"
  data-viz-0: "#1F3A5F"
  data-viz-1: "#B4532A"
  data-viz-2: "#2F6B4F"
  data-viz-3: "#8A6D3B"
  data-viz-4: "#6B4E71"
  data-viz-5: "#7A7568"
  gradients-hero-0: "#1F3A5F"
  gradients-hero-1: "#2F6B4F"
  on-accent: "#F6F1E8"

typography:
  hero: { fontFamily: "Newsreader", cqmin: 13, weight: 600, lineHeight: 1.05, tracking: "-0.015em" }
  h1: { fontFamily: "Newsreader", cqmin: 9, weight: 600, lineHeight: 1.05, tracking: "-0.015em" }
  h2: { fontFamily: "Newsreader", cqmin: 6.4, weight: 600, lineHeight: 1.05, tracking: "-0.015em" }
  h3: { fontFamily: "Newsreader", cqmin: 4.8, weight: 500, lineHeight: 1.05, tracking: "-0.015em" }
  body: { fontFamily: "IBM Plex Sans", cqmin: 3.7, weight: 400, lineHeight: 1.3, tracking: "0" }
  caption: { fontFamily: "IBM Plex Sans", cqmin: 3.3, weight: 500, lineHeight: 1.3, tracking: "0" }
  kicker: { fontFamily: "IBM Plex Mono", cqmin: 2.6, weight: 500, lineHeight: 1.5, tracking: "0", upper: true }
  code: { fontFamily: "IBM Plex Mono", cqmin: 3, weight: 400, lineHeight: 1.5, tracking: "0" }

spacing:
  safe-landscape: "6%"
  safe-portrait: "8% + zonas UI de plataforma (top 14%, bottom 35%)"
  safe-square: "7%"
  safe-feed: "7%"
  radius-sm: "0.8cqmin"
  radius-md: "1.5cqmin"
  radius-lg: "2.5cqmin"

look:
  background: paper
  align: center
  statementAlign: center
  statementSize: h1
  headlineCase: none
  accentStyle: italic
  textReveal: fade
  kicker: none
  cards: outline
  density: airy

motion:
  personality: balanced
  durations-ms: { instant: 100, micro: 150, short: 250, enter: 650, exit: 420, emphasis: 1000, scene: 400, long: 1500 }
  easings: { standard: "cubic-bezier(0.2,0,0,1)", enter: "cubic-bezier(0.165,0.84,0.44,1)", exit: "cubic-bezier(0.55,0.055,0.675,0.19)", emphasized: "cubic-bezier(0.19,1,0.22,1)", move: "cubic-bezier(0.645,0.045,0.355,1)", camera: "cubic-bezier(0.77,0,0.175,1)", linear: "cubic-bezier(0,0,1,1)", expressive: "cubic-bezier(0.34,1.56,0.64,1)" }
  stagger-ms: { letters: 25, words: 90, lines: 160, items: 80, group-max: 600 }
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

# Northline — Frame

## Overview

Hacer que conceptos técnicos complejos se entiendan en minutos, sin perder rigor.

Personalidad: editorial · sereno · riguroso · cálido. Audiencia: Profesionales de tecnología y tomadores de decisión (25-45 años), consumo mobile-first en LinkedIn, YouTube y Reels..

## Colors

Fondo `#F6F1E8`, texto `#1B1A17`, primario `#1F3A5F`, acento `#B4532A` (racionado: 1 momento por frame). Terracota solo para el dato o la palabra clave. Tinta azul para estructura.

## Typography

- Display: **Newsreader** (500/600) — titulares, números grandes. Caja: sentence.
- Body: **IBM Plex Sans** — texto, subtítulos, captions.
- Mono: **IBM Plex Mono** — kickers, labels, código, terminal.
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
