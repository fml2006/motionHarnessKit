---
version: 1
name: CyberGoat3D — Frame (capa de video)
description: >
  Sistema de diseño a escala de frame para CyberGoat3D. Generado desde brands/cybergoat3d/brand.config.json
  (v0.1.0). Los átomos (hex, familias, pesos, motion tokens) son sagrados; la composición es libre.
unit: el frame — 1920×1080 (landscape), 1080×1920 (portrait), 1080×1350 (feed), 1080×1080 (square)
principle: átomos sagrados · composición libre · los números salen del guion verificado

colors:
  background: "#FFFFFF"
  surface: "#F2F2F2"
  surface-alt: "#E8E8E8"
  border: "#E0E0E0"
  text: "#1A1A1A"
  text-muted: "#5C5C5C"
  primary: "#1A1A1A"
  secondary: "#8E0505"
  accent: "#BE0707"
  danger: "#9E0000"
  success: "#2E7D32"
  on-primary: "#FFFFFF"
  code-background: "#1A1A1A"
  code-text: "#F2F2F2"
  code-comment: "#A6A6A6"
  code-keyword: "#FF7A7A"
  code-string: "#F5C2C2"
  code-number: "#FFB3B3"
  code-function: "#FFFFFF"
  data-viz-0: "#BE0707"
  data-viz-1: "#1A1A1A"
  data-viz-2: "#6B6B6B"
  data-viz-3: "#D9534F"
  data-viz-4: "#8E0505"
  data-viz-5: "#7A7A7A"
  gradients-hero-0: "#BE0707"
  gradients-hero-1: "#8E0505"
  on-accent: "#FFFFFF"

typography:
  hero: { fontFamily: "Luckiest Guy", cqmin: 12, weight: 400, lineHeight: 1, tracking: "0.01em" }
  h1: { fontFamily: "Luckiest Guy", cqmin: 8.4, weight: 400, lineHeight: 1, tracking: "0.01em" }
  h2: { fontFamily: "Luckiest Guy", cqmin: 6, weight: 400, lineHeight: 1, tracking: "0.01em" }
  h3: { fontFamily: "Luckiest Guy", cqmin: 4.6, weight: 400, lineHeight: 1, tracking: "0.01em" }
  body: { fontFamily: "Nunito", cqmin: 3.7, weight: 400, lineHeight: 1.3, tracking: "0" }
  caption: { fontFamily: "Nunito", cqmin: 3.3, weight: 500, lineHeight: 1.3, tracking: "0" }
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

look:
  background: flat
  align: center
  statementAlign: center
  statementSize: h1
  headlineCase: uppercase
  accentStyle: color
  textReveal: rise
  kicker: dot
  cards: filled
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

# CyberGoat3D — Frame

## Overview

Vende productos de impresión 3D.

Personalidad: audaz · cercana · artesanal · precisa. Audiencia: PENDIENTE: quién compra (lo define el dueño). Plataformas: Instagram Reels, TikTok y Mercado Libre..

## Colors

Fondo `#FFFFFF`, texto `#1A1A1A`, primario `#1A1A1A`, acento `#BE0707` (racionado: 1 momento por frame). Rojo solo para la palabra o el dato clave (como CYBER y 3D en el logo). Negro para estructura. Fondo blanco: el producto es el protagonista.

## Typography

- Display: **Luckiest Guy** (400) — titulares, números grandes. Caja: uppercase.
- Body: **Nunito** — texto, subtítulos, captions.
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

Prohibido: Bounce/elastic en texto; Todo entrando a la vez con el mismo fade+slide-up; Rotaciones decorativas sin significado; Glow, partículas o lens flares de relleno; Movimiento continuo detrás de texto que se está leyendo; Glitch o distorsiones digitales; Partículas, neón o lens flares; Girar el logo.

## Do's and Don'ts

- ✓ El producto como protagonista
- ✓ Poco texto: nombre del producto y, como mucho, un dato
- ✓ Consultar con la marca qué texto va antes de ponerlo
- ✗ Muros de texto o frases largas en pantalla
- ✗ Promesas o datos del producto sin confirmar (medidas, material, precio)
- ✗ Look "tech" genérico oscuro con neón y partículas
- ✗ Logo: deformar
- ✗ Logo: rotar
- ✗ Logo: cambiar sus colores
- ✗ Logo: separar la cabra del anillo
- ✗ Logo: sombras, glow o bevel
