# Reglas de marca — Pulso (`brands/pulso`, GENERADO desde brand.config.json v1.0.0)

> No edites este archivo: editá `brands/pulso/brand.config.json` (o usá /marca) y corré `npm run brand -- pulso`. Dirección de arte en prosa: `brands/pulso/LOOK.md`.

## Identidad y voz
- Misión: Convertir novedades de tecnología en piezas cortas que se entienden en 3 segundos y se comparten.
- Audiencia: Desarrolladores y early adopters de 18-34, consumo vertical en Reels, TikTok y Shorts.
- Personalidad: enérgico, directo, optimista, sin solemnidad
- Idioma: es-AR (tratamiento: vos). Tono: Corto, con ritmo y una sola idea por pantalla. Cero relleno; el dato manda.
- Sí: Frases de 3-6 palabras; Un dato fuerte por pieza; Verbos en presente
- No: Emojis en pantalla; Hype sin dato ("lo cambia todo"); Texto corrido de más de 2 líneas

## Átomos (usar SIEMPRE los tokens, nunca valores sueltos)
- Colores: usar `var(--c-*)` en CSS y `BRAND.color("...")` en JS. Paleta: background #120A1C, surface #1E1230, surfaceAlt #2A1A42, border #3D2A5C, text #FFF6FA, textMuted #CDBFDB, primary #FF4F8B, secondary #8B6CFF, accent #E8FF59, danger #FF6B6B, success #3DDC97, onPrimary #160A12, onAccent #120A1C.
- Acento `--c-accent`: máximo 1 momento por frame.
- Data viz: usar `--c-data-viz-0..5` en ese orden.
- Tipografía: clases `.bm-hero .bm-h1 .bm-h2 .bm-h3 .bm-body .bm-caption .bm-kicker .bm-label .bm-code`. Prohibido declarar otras font-family.
- Tamaños en `cqmin` (vía variables `--fs-*`), nunca px fijos: así la escena funciona en 16:9, 9:16, 4:5 y 1:1.
- Máximo 7 palabras por línea, 3 líneas por frame, nada menor a 28px en 1080p.
- Contenido dentro de `.bm-safe` (márgenes seguros por formato, incluye zonas de UI de Reels/Shorts/TikTok en vertical).

## Look (lo que hace distinta a esta marca)
Energética para social: gradiente rosa-violeta, titulares enormes en MAYÚSCULAS, el dato resaltado en lima y texto que sube con fuerza.. No lo pises escena por escena: si una pieza necesita otro look, es otra marca o un cambio de marca aprobado.
- Fondo: **gradient** — los bloques usan `.bm-bg` (textura del look), `.bm-bg.is-hero` en aperturas y cierres, `.bm-bg.is-plain` cuando la escena necesita silencio visual.
- Composición: **alineada al inicio (izquierda)** (`var(--look-items)` / `var(--look-text-align)`); afirmaciones (kinetic-statement): **start**, tamaño hero.
- Titulares: **MAYÚSCULAS**.
- Acento (`*palabra*`): **highlight** (`.bm-accent`; se anima con `BM.accentIn`).
- Entrada de texto: **rise** (`BM.revealLines` / `BM.revealWords` la aplican solos).
- Kicker: decoración **dot** (`.bm-kicker-deco`, `BM.decoIn`).
- Tarjetas (`.bm-card`: pasos, comparaciones): **none**.
- Densidad: **compact** (`var(--look-space)` = 0.8 multiplica los espacios de los bloques).

## Motion
- Personalidad: **expressive**.
- El movimiento empuja: cada beat entra con decisión y deja el dato quieto para leerlo.
- Una cosa a la vez: el ojo sigue un solo foco por beat; el resto queda quieto.
- Nunca arrancar en t=0: primer movimiento a los 150-300 ms de iniciada la escena.
- Entradas decididas, salidas discretas: las salidas duran ~65% de las entradas y aceleran.
- Holds generosos: el texto queda en pantalla al menos max(1,5 s; 0,8 s + 0,35 s por palabra; caracteres / 15).
- Dirección consistente: lo nuevo entra de derecha/abajo, lo que se va sale a izquierda/arriba.
- Máximo 2 tweens con el mismo easing por escena; la escena más lenta dura ~3x la más rápida.
- Duraciones: usar `BRAND.dur("enter"|"exit"|"micro"|"short"|"emphasis"|"scene"|"long")` (instant=80ms, micro=120ms, short=200ms, enter=420ms, exit=260ms, emphasis=650ms, scene=350ms, long=1000ms).
- Easings: usar `BRAND.ease(nombre)`:
  - `standard` (0.2, 0, 0, 1) — Reposicionar algo visible (Material 3 standard)
  - `enter` (0.22, 1, 0.36, 1) — Entrada por defecto, rápida y decidida (= expo-ish out), sin rebote
  - `exit` (0.55, 0.055, 0.675, 0.19) — Salida por defecto, acelera (= power2.in)
  - `emphasized` (0.16, 1, 0.3, 1) — Golpe de entrada para titulares y el dato (más corto y seco que productive)
  - `move` (0.645, 0.045, 0.355, 1) — Movimientos simétricos y push entre escenas (= power2.inOut)
  - `camera` (0.77, 0, 0.175, 1) — Zoom/paneo de cámara virtual (= power3.inOut), 1-2 s
  - `linear` (0, 0, 1, 1) — Tipeo, progreso, scroll constante
  - `expressive` (0.34, 1.56, 0.64, 1) — RESTRINGIDO: overshoot ~10%. Solo registro lúdico aprobado; nunca datos, logos ni texto
- Stagger: `BRAND.stagger("letters"|"words"|"lines"|"items", n)` (letters=20ms, words=55ms, lines=90ms, items=50ms); con `n` el grupo completo dura ≤ 450 ms.
- Tiempo en pantalla de un texto: `BRAND.hold(texto)` como mínimo = max(1.5 s; 0.8 s + 0.35 s × palabras; caracteres / 15).
- Transiciones en `scenes.json` (implementadas): cut, crossfade, push, mask-wipe. Default: push. Se hacen en el editor (NLE): zoom-through, match-cut. Prohibidas: spin, star-wipe, glitch aleatorio, page-curl, flash blanco > 3 por segundo.
- Prohibido: Bounce/elastic en texto (la energía sale del ritmo, no del rebote); Emojis o stickers animados; Más de un resaltado por frame; Glow, partículas o lens flares de relleno; Movimiento continuo detrás de texto que se está leyendo.

## Logo
- Usar `BRAND.logo.svgMark` / `svgPrimary` (inline) o `brands/pulso/logo/*`. Alto mínimo 40px en 1080p, aire libre = 0.5× la altura.
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
