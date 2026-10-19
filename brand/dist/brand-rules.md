# Reglas de marca — TuMarca (GENERADO desde brand/brand.config.json v1.1.0)

> No edites este archivo: editá `brand/brand.config.json` y corré `npm run brand`.

## Identidad y voz
- Misión: Hacer que conceptos técnicos complejos se entiendan en minutos, sin perder rigor.
- Audiencia: Profesionales de tecnología y tomadores de decisión (25-45 años), consumo mobile-first en LinkedIn, YouTube y Reels.
- Personalidad: preciso, optimista, técnico pero humano, sin exageraciones
- Idioma: es-AR (tratamiento: vos). Tono: Directo, didáctico y concreto. Cada afirmación técnica tiene que poder verificarse.
- Sí: Una idea por pantalla; Verbos concretos y números verificados; Analogías simples antes del detalle técnico
- No: Hype vacío ("revolucionario", "increíble", "game changer"); Jerga sin explicar; Claims de rendimiento sin fuente

## Átomos (usar SIEMPRE los tokens, nunca valores sueltos)
- Colores: usar `var(--c-*)` en CSS y `BRAND.color("...")` en JS. Paleta: background #0B0F19, surface #131A2A, surfaceAlt #1B2438, border #2A3550, text #F4F6FB, textMuted #A6B0C5, primary #4C8DFF, secondary #2ED3A7, accent #FFB547, danger #FF6B6B, success #3DDC84, onPrimary #06101F.
- Acento `--c-accent`: máximo 1 momento por frame.
- Data viz: usar `--c-data-viz-0..5` en ese orden.
- Tipografía: clases `.bm-hero .bm-h1 .bm-h2 .bm-h3 .bm-body .bm-caption .bm-kicker .bm-label .bm-code`. Prohibido declarar otras font-family.
- Tamaños en `cqmin` (vía variables `--fs-*`), nunca px fijos: así la escena funciona en 16:9, 9:16, 4:5 y 1:1.
- Máximo 7 palabras por línea, 3 líneas por frame, nada menor a 28px en 1080p.
- Contenido dentro de `.bm-safe` (márgenes seguros por formato, incluye zonas de UI de Reels/Shorts/TikTok en vertical).

## Motion
- Personalidad: **productive**.
- El movimiento explica: cada animación responde a una pregunta (qué apareció, qué cambió, qué importa).
- Una cosa a la vez: el ojo sigue un solo foco por beat; el resto queda quieto.
- Nunca arrancar en t=0: primer movimiento a los 150-300 ms de iniciada la escena.
- Entradas decididas, salidas discretas: las salidas duran ~65% de las entradas y aceleran.
- Holds generosos: el texto queda en pantalla al menos max(1,5 s; 0,8 s + 0,35 s por palabra; caracteres / 15).
- Dirección consistente: lo nuevo entra de derecha/abajo, lo que se va sale a izquierda/arriba.
- Máximo 2 tweens con el mismo easing por escena; la escena más lenta dura ~3x la más rápida.
- Duraciones: usar `BRAND.dur("enter"|"exit"|"micro"|"short"|"emphasis"|"scene"|"long")` (instant=100ms, micro=150ms, short=250ms, enter=500ms, exit=325ms, emphasis=800ms, scene=400ms, long=1200ms).
- Easings: usar `BRAND.ease(nombre)`:
  - `standard` (0.2, 0, 0, 1) — Reposicionar algo visible (Material 3 standard)
  - `enter` (0.165, 0.84, 0.44, 1) — Entrada por defecto, desacelera sin rebote (= GSAP power3.out)
  - `exit` (0.55, 0.055, 0.675, 0.19) — Salida por defecto, acelera (= power2.in)
  - `emphasized` (0.19, 1, 0.22, 1) — Hero, reveals con máscara, el dato clave (= expo.out)
  - `move` (0.645, 0.045, 0.355, 1) — Movimientos simétricos y push entre escenas (= power2.inOut)
  - `camera` (0.77, 0, 0.175, 1) — Zoom/paneo de cámara virtual (= power3.inOut), 1-2 s
  - `linear` (0, 0, 1, 1) — Tipeo, progreso, scroll constante
  - `expressive` (0.34, 1.56, 0.64, 1) — RESTRINGIDO: overshoot ~10%. Solo registro lúdico aprobado; nunca datos, logos ni texto
- Stagger: `BRAND.stagger("letters"|"words"|"lines"|"items", n)` (letters=25ms, words=70ms, lines=120ms, items=60ms); con `n` el grupo completo dura ≤ 500 ms.
- Tiempo en pantalla de un texto: `BRAND.hold(texto)` como mínimo = max(1.5 s; 0.8 s + 0.35 s × palabras; caracteres / 15).
- Transiciones en `scenes.json` (implementadas): cut, crossfade, push, mask-wipe. Default: cut. Se hacen en el editor (NLE): zoom-through, match-cut. Prohibidas: spin, star-wipe, glitch aleatorio, page-curl, flash blanco > 3 por segundo.
- Prohibido: Bounce/elastic en texto; Todo entrando a la vez con el mismo fade+slide-up; Rotaciones decorativas sin significado; Glow, partículas o lens flares de relleno; Movimiento continuo detrás de texto que se está leyendo.

## Logo
- Usar `BRAND.logo.svgMark` / `svgPrimary` (inline) o `brand/logo/*`. Alto mínimo 40px en 1080p, aire libre = 0.5× la altura.
- No: deformar, rotar, cambiar colores fuera de la paleta, efectos glow o bevel.

## Audio y captions
- Voz en off: palabras netas de VO = duración (s) × 2,2 (≈130 para 60 s). Voz por defecto de la marca: no definida como sintética (si una pieza usa TTS o clon, lleva disclosure).
- Loudness final: -14 LUFS integrados, true peak ≤ -1 dBTP.
- Música: Solo librerías con licencia comercial registrada (ID de licencia en el ledger del proyecto). Nada de música generada por IA en piezas de cliente sin aprobación legal.
- SFX: Sutiles y funcionales: clicks de UI, whooshes cortos, hits graves solo en el dato clave. (máx. 3 por escena).
- Captions: 38 caracteres/línea, 2 líneas, ≤ 17 caracteres/s, mínimo 1000ms. Si el proyecto tiene `captions.srt` (o .vtt), build:roots los quema en: portrait, feed.

## Legal
- Disclosure IA: "Este video incluye elementos generados o asistidos por IA." cuando haya: voz sintética (TTS genérica o clon), personas o lugares realistas generados, imágenes de producto simuladas.
- Política: Más estricta que el mínimo de las plataformas: se divulga SIEMPRE que haya voz sintética (TTS genérica o clon), además de personas o lugares realistas generados e imágenes de producto simuladas.
- Logos de terceros: Solo con permiso o en uso nominativo (referencia factual); nunca sugerir patrocinio.
