# Reglas de marca — CyberGoat3D (`brands/cybergoat3d`, GENERADO desde brand.config.json v0.1.0)

> No edites este archivo: editá `brands/cybergoat3d/brand.config.json` (o usá /marca) y corré `npm run brand -- cybergoat3d`. Dirección de arte en prosa: `brands/cybergoat3d/LOOK.md`.

## Identidad y voz
- Misión: Vende productos de impresión 3D.
- Audiencia: PENDIENTE: quién compra (lo define el dueño). Plataformas: Instagram Reels, TikTok y Mercado Libre.
- Personalidad: audaz, cercana, artesanal, precisa
- Idioma: es-AR (tratamiento: vos). Tono: Sutil y con poco texto: el producto habla. Cada texto en pantalla se consulta con la marca antes de ponerlo.
- Sí: El producto como protagonista; Poco texto: nombre del producto y, como mucho, un dato; Consultar con la marca qué texto va antes de ponerlo
- No: Muros de texto o frases largas en pantalla; Promesas o datos del producto sin confirmar (medidas, material, precio); Look "tech" genérico oscuro con neón y partículas

## Átomos (usar SIEMPRE los tokens, nunca valores sueltos)
- Colores: usar `var(--c-*)` en CSS y `BRAND.color("...")` en JS. Paleta: background #FFFFFF, surface #F2F2F2, surfaceAlt #E8E8E8, border #E0E0E0, text #1A1A1A, textMuted #5C5C5C, primary #1A1A1A, secondary #8E0505, accent #BE0707, danger #9E0000, success #2E7D32, onPrimary #FFFFFF, onAccent #FFFFFF.
- Acento `--c-accent`: máximo 1 momento por frame.
- Data viz: usar `--c-data-viz-0..5` en ese orden.
- Tipografía: clases `.bm-hero .bm-h1 .bm-h2 .bm-h3 .bm-body .bm-caption .bm-kicker .bm-label .bm-code`. Prohibido declarar otras font-family.
- Tamaños en `cqmin` (vía variables `--fs-*`), nunca px fijos: así la escena funciona en 16:9, 9:16, 4:5 y 1:1.
- Máximo 7 palabras por línea, 3 líneas por frame, nada menor a 28px en 1080p.
- Contenido dentro de `.bm-safe` (márgenes seguros por formato, incluye zonas de UI de Reels/Shorts/TikTok en vertical).

## Look (lo que hace distinta a esta marca)
Producto al frente sobre blanco: badge rojo y negro, titulares cortos en MAYÚSCULAS gruesas y redondeadas (la letra del logotipo), el dato clave en rojo, todo centrado y con aire.. No lo pises escena por escena: si una pieza necesita otro look, es otra marca o un cambio de marca aprobado.
- Fondo: **flat** — los bloques usan `.bm-bg` (textura del look), `.bm-bg.is-hero` en aperturas y cierres, `.bm-bg.is-plain` cuando la escena necesita silencio visual.
- Composición: **centrada** (`var(--look-items)` / `var(--look-text-align)`); afirmaciones (kinetic-statement): **center**, tamaño h1.
- Titulares: **MAYÚSCULAS**.
- Acento (`*palabra*`): **color** (`.bm-accent`; se anima con `BM.accentIn`).
- Entrada de texto: **rise** (`BM.revealLines` / `BM.revealWords` la aplican solos).
- Kicker: decoración **dot** (`.bm-kicker-deco`, `BM.decoIn`).
- Tarjetas (`.bm-card`: pasos, comparaciones): **filled**.
- Densidad: **airy** (`var(--look-space)` = 1.3 multiplica los espacios de los bloques).

## Motion
- Personalidad: **balanced**.
- El movimiento explica: cada animación responde a una pregunta (qué apareció, qué cambió, qué importa).
- Una cosa a la vez: el ojo sigue un solo foco por beat; el resto queda quieto.
- Nunca arrancar en t=0: primer movimiento a los 150-300 ms de iniciada la escena.
- Entradas decididas, salidas discretas: las salidas duran ~65% de las entradas y aceleran.
- Holds generosos: el texto queda en pantalla al menos max(1,5 s; 0,8 s + 0,35 s por palabra; caracteres / 15).
- Dirección consistente: lo nuevo entra de derecha/abajo, lo que se va sale a izquierda/arriba.
- Máximo 2 tweens con el mismo easing por escena; la escena más lenta dura ~3x la más rápida.
- Duraciones: usar `BRAND.dur("enter"|"exit"|"micro"|"short"|"emphasis"|"scene"|"long")` (instant=100ms, micro=150ms, short=250ms, enter=650ms, exit=420ms, emphasis=1000ms, scene=400ms, long=1500ms).
- Easings: usar `BRAND.ease(nombre)`:
  - `standard` (0.2, 0, 0, 1) — Reposicionar algo visible (Material 3 standard)
  - `enter` (0.165, 0.84, 0.44, 1) — Entrada por defecto, desacelera sin rebote (= GSAP power3.out)
  - `exit` (0.55, 0.055, 0.675, 0.19) — Salida por defecto, acelera (= power2.in)
  - `emphasized` (0.19, 1, 0.22, 1) — Hero, reveals con máscara, el dato clave (= expo.out)
  - `move` (0.645, 0.045, 0.355, 1) — Movimientos simétricos y push entre escenas (= power2.inOut)
  - `camera` (0.77, 0, 0.175, 1) — Zoom/paneo de cámara virtual (= power3.inOut), 1-2 s
  - `linear` (0, 0, 1, 1) — Tipeo, progreso, scroll constante
  - `expressive` (0.34, 1.56, 0.64, 1) — RESTRINGIDO: overshoot ~10%. Solo registro lúdico aprobado; nunca datos, logos ni texto
- Stagger: `BRAND.stagger("letters"|"words"|"lines"|"items", n)` (letters=25ms, words=90ms, lines=160ms, items=80ms); con `n` el grupo completo dura ≤ 600 ms.
- Tiempo en pantalla de un texto: `BRAND.hold(texto)` como mínimo = max(1.5 s; 0.8 s + 0.35 s × palabras; caracteres / 15).
- Transiciones en `scenes.json` (implementadas): cut, crossfade, push, mask-wipe. Default: crossfade. Se hacen en el editor (NLE): zoom-through, match-cut. Prohibidas: spin, star-wipe, glitch aleatorio, page-curl, flash blanco > 3 por segundo.
- Prohibido: Bounce/elastic en texto; Todo entrando a la vez con el mismo fade+slide-up; Rotaciones decorativas sin significado; Glow, partículas o lens flares de relleno; Movimiento continuo detrás de texto que se está leyendo; Glitch o distorsiones digitales; Partículas, neón o lens flares; Girar el logo.

## Logo
- Usar `BRAND.logo.svgMark` / `svgPrimary` (inline) o `brands/cybergoat3d/logo/*`. Alto mínimo 40px en 1080p, aire libre = 0.5× la altura.
- No: deformar, rotar, cambiar sus colores, separar la cabra del anillo, sombras, glow o bevel.

## Audio y captions
- Voz en off: palabras netas de VO = duración (s) × 2,2 (≈130 para 60 s). Voz por defecto de la marca: no definida como sintética (si una pieza usa TTS o clon, lleva disclosure).
- Loudness final: -14 LUFS integrados, true peak ≤ -1 dBTP.
- Música: Solo librerías con licencia comercial registrada (ID de licencia en el ledger del proyecto). Nada de música generada por IA en piezas de cliente sin aprobación legal.
- SFX: Efectos que llaman la atención en los momentos clave (aparece el producto, cambio de escena), sobre una música sutil. (máx. 3 por escena).
- Captions: 38 caracteres/línea, 2 líneas, ≤ 17 caracteres/s, mínimo 1000ms. Si el proyecto tiene `captions.srt` (o .vtt), build:roots los quema en: portrait, feed.

## Legal
- Disclosure IA: "Este video incluye elementos generados o asistidos por IA." cuando haya: voz sintética (TTS genérica o clon), personas o lugares realistas generados, imágenes de producto simuladas.
- Política: Más estricta que el mínimo de las plataformas: se divulga SIEMPRE que haya voz sintética (TTS genérica o clon), además de personas o lugares realistas generados e imágenes de producto simuladas.
- Logos de terceros: Solo con permiso o en uso nominativo (referencia factual); nunca sugerir patrocinio.
