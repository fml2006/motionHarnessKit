---
version: 1
name: Pulso — Frame (capa de video)
description: >
  Sistema de diseño a escala de frame para Pulso. Generado desde brands/pulso/brand.config.json
  (v1.0.0). Los átomos (hex, familias, pesos, motion tokens) son sagrados; la composición es libre.
unit: el frame — 1920×1080 (landscape), 1080×1920 (portrait), 1080×1350 (feed), 1080×1080 (square)
principle: átomos sagrados · composición libre · los números salen del guion verificado

colors:
  background: "#120A1C"
  surface: "#1E1230"
  surface-alt: "#2A1A42"
  border: "#3D2A5C"
  text: "#FFF6FA"
  text-muted: "#CDBFDB"
  primary: "#FF4F8B"
  secondary: "#8B6CFF"
  accent: "#E8FF59"
  danger: "#FF6B6B"
  success: "#3DDC97"
  on-primary: "#160A12"
  on-accent: "#120A1C"
  code-background: "#170D24"
  code-text: "#F2EAF7"
  code-comment: "#A797BD"
  code-keyword: "#FF8DB5"
  code-string: "#C9F27A"
  code-number: "#FFD36B"
  code-function: "#B9A4FF"
  data-viz-0: "#FF4F8B"
  data-viz-1: "#8B6CFF"
  data-viz-2: "#E8FF59"
  data-viz-3: "#4FD1FF"
  data-viz-4: "#FF9F43"
  data-viz-5: "#A797BD"
  gradients-hero-0: "#FF4F8B"
  gradients-hero-1: "#8B6CFF"

typography:
  hero: { fontFamily: "Bricolage Grotesque", cqmin: 15, weight: 800, lineHeight: 1.02, tracking: "-0.035em" }
  h1: { fontFamily: "Bricolage Grotesque", cqmin: 10.5, weight: 800, lineHeight: 1.02, tracking: "-0.035em" }
  h2: { fontFamily: "Bricolage Grotesque", cqmin: 7.2, weight: 800, lineHeight: 1.02, tracking: "-0.035em" }
  h3: { fontFamily: "Bricolage Grotesque", cqmin: 5, weight: 600, lineHeight: 1.02, tracking: "-0.035em" }
  body: { fontFamily: "Inter", cqmin: 3.9, weight: 400, lineHeight: 1.3, tracking: "-0.01em" }
  caption: { fontFamily: "Inter", cqmin: 3.4, weight: 500, lineHeight: 1.3, tracking: "-0.01em" }
  kicker: { fontFamily: "JetBrains Mono", cqmin: 2.6, weight: 500, lineHeight: 1.5, tracking: "0", upper: true }
  code: { fontFamily: "JetBrains Mono", cqmin: 3, weight: 400, lineHeight: 1.5, tracking: "0" }

spacing:
  safe-landscape: "6%"
  safe-portrait: "8% + zonas UI de plataforma (top 14%, bottom 35%)"
  safe-square: "7%"
  safe-feed: "7%"
  radius-sm: "1.6cqmin"
  radius-md: "3cqmin"
  radius-lg: "5cqmin"

look:
  background: gradient
  align: start
  statementAlign: start
  statementSize: hero
  headlineCase: uppercase
  accentStyle: highlight
  textReveal: rise
  kicker: dot
  cards: none
  density: compact

motion:
  personality: expressive
  durations-ms: { instant: 80, micro: 120, short: 200, enter: 420, exit: 260, emphasis: 650, scene: 350, long: 1000 }
  easings: { standard: "cubic-bezier(0.2,0,0,1)", enter: "cubic-bezier(0.22,1,0.36,1)", exit: "cubic-bezier(0.55,0.055,0.675,0.19)", emphasized: "cubic-bezier(0.16,1,0.3,1)", move: "cubic-bezier(0.645,0.045,0.355,1)", camera: "cubic-bezier(0.77,0,0.175,1)", linear: "cubic-bezier(0,0,1,1)", expressive: "cubic-bezier(0.34,1.56,0.64,1)" }
  stagger-ms: { letters: 20, words: 55, lines: 90, items: 50, group-max: 450 }
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

# Pulso — Frame

## Overview

Convertir novedades de tecnología en piezas cortas que se entienden en 3 segundos y se comparten.

Personalidad: enérgico · directo · optimista · sin solemnidad. Audiencia: Desarrolladores y early adopters de 18-34, consumo vertical en Reels, TikTok y Shorts..

## Colors

Fondo `#120A1C`, texto `#FFF6FA`, primario `#FF4F8B`, acento `#E8FF59` (racionado: 1 momento por frame). El lima (accent) es el resaltado del dato o la palabra clave: una vez por frame. Rosa y violeta son estructura y fondo.

## Typography

- Display: **Bricolage Grotesque** (600/800) — titulares, números grandes. Caja: uppercase.
- Body: **Inter** — texto, subtítulos, captions.
- Mono: **JetBrains Mono** — kickers, labels, código, terminal.
- Máximo 7 palabras por línea y 3 líneas por frame. Nada por debajo de 28px a 1080p.

## Motion

- El movimiento empuja: cada beat entra con decisión y deja el dato quieto para leerlo.
- Una cosa a la vez: el ojo sigue un solo foco por beat; el resto queda quieto.
- Nunca arrancar en t=0: primer movimiento a los 150-300 ms de iniciada la escena.
- Entradas decididas, salidas discretas: las salidas duran ~65% de las entradas y aceleran.
- Holds generosos: el texto queda en pantalla al menos max(1,5 s; 0,8 s + 0,35 s por palabra; caracteres / 15).
- Dirección consistente: lo nuevo entra de derecha/abajo, lo que se va sale a izquierda/arriba.
- Máximo 2 tweens con el mismo easing por escena; la escena más lenta dura ~3x la más rápida.

Prohibido: Bounce/elastic en texto (la energía sale del ritmo, no del rebote); Emojis o stickers animados; Más de un resaltado por frame; Glow, partículas o lens flares de relleno; Movimiento continuo detrás de texto que se está leyendo.

## Do's and Don'ts

- ✓ Frases de 3-6 palabras
- ✓ Un dato fuerte por pieza
- ✓ Verbos en presente
- ✗ Emojis en pantalla
- ✗ Hype sin dato ("lo cambia todo")
- ✗ Texto corrido de más de 2 líneas
- ✗ Logo: deformar
- ✗ Logo: rotar
- ✗ Logo: cambiar colores fuera de la paleta
- ✗ Logo: efectos glow o bevel
