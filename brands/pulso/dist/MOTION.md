# MOTION.md — Pulso

> GENERADO desde `brands/pulso/brand.config.json` v1.0.0 por `npm run brand -- pulso`. No editar a mano. Leé también `brands/pulso/LOOK.md` (qué hace distinta a esta marca).
> Lo leen: este kit, las skills de HyperFrames (vía frame.md) y packs como charlie947/motion-graphics-skills.

## 0. Look
Energética para social: gradiente rosa-violeta, titulares enormes en MAYÚSCULAS, el dato resaltado en lima y texto que sube con fuerza..
- Fondo: **gradient** — los bloques usan `.bm-bg` (textura del look), `.bm-bg.is-hero` en aperturas y cierres, `.bm-bg.is-plain` cuando la escena necesita silencio visual.
- Composición: **alineada al inicio (izquierda)** (`var(--look-items)` / `var(--look-text-align)`); afirmaciones (kinetic-statement): **start**, tamaño hero.
- Titulares: **MAYÚSCULAS**.
- Acento (`*palabra*`): **highlight** (`.bm-accent`; se anima con `BM.accentIn`).
- Entrada de texto: **rise** (`BM.revealLines` / `BM.revealWords` la aplican solos).
- Kicker: decoración **dot** (`.bm-kicker-deco`, `BM.decoIn`).
- Tarjetas (`.bm-card`: pasos, comparaciones): **none**.
- Densidad: **compact** (`var(--look-space)` = 0.8 multiplica los espacios de los bloques).

## 1. Colores y para qué sirve cada uno
- `#120A1C` **background**
- `#1E1230` **surface**
- `#2A1A42` **surfaceAlt**
- `#3D2A5C` **border**
- `#FFF6FA` **text**
- `#CDBFDB` **textMuted**
- `#FF4F8B` **primary**
- `#8B6CFF` **secondary**
- `#E8FF59` **accent**
- `#FF6B6B` **danger**
- `#3DDC97` **success**
- `#160A12` **onPrimary**
- `#120A1C` **onAccent**
- Código: background `#170D24`, text `#F2EAF7`, comment `#A797BD`, keyword `#FF8DB5`, string `#C9F27A`, number `#FFD36B`, function `#B9A4FF`
- Data viz (en orden): `#FF4F8B` → `#8B6CFF` → `#E8FF59` → `#4FD1FF` → `#FF9F43` → `#A797BD`
- Regla: El lima (accent) es el resaltado del dato o la palabra clave: una vez por frame. Rosa y violeta son estructura y fondo.

## 2. Tipografía y tamaños
- Display: Bricolage Grotesque 600/800 · tracking -0.035em · uppercase
- Body: Inter · Mono: JetBrains Mono
- Escala (cqmin, % del lado corto): hero 15 · h1 10.5 · h2 7.2 · h3 5 · body 3.9 · caption 3.4 · label 2.6 · code 3 · 9:16 ×1 · 4:5 ×1
- Máx 7 palabras/línea, 3 líneas/frame, mínimo 28px a 1080p.

## 3. Timing: cómo entra, cuánto se queda, cómo sale
- Entrada 420 ms (`enter`), énfasis 650 ms (`emphasized`), salida 260 ms (`exit`).
- Hold de lectura: max(1.5 s; 0.8 s + 0.35 s × palabras; caracteres / 15). Primer movimiento a 150-300 ms, nunca en t=0.
- Stagger: letters 20 ms, words 55 ms, lines 90 ms, items 50 ms; un grupo escalonado dura ≤ 450 ms (`BRAND.stagger(nombre, n)`).
- Voz en off: palabras netas de VO = duración (s) × 2,2 (≈130 para 60 s).

## 4. Cómo se mueve
- Personalidad: **expressive**. 30 fps. Transición por defecto: push. Implementadas: cut, crossfade, push, mask-wipe; en el editor: zoom-through, match-cut.
- `standard` cubic-bezier(0.2, 0, 0, 1) — Reposicionar algo visible (Material 3 standard)
- `enter` cubic-bezier(0.22, 1, 0.36, 1) — Entrada por defecto, rápida y decidida (= expo-ish out), sin rebote
- `exit` cubic-bezier(0.55, 0.055, 0.675, 0.19) — Salida por defecto, acelera (= power2.in)
- `emphasized` cubic-bezier(0.16, 1, 0.3, 1) — Golpe de entrada para titulares y el dato (más corto y seco que productive)
- `move` cubic-bezier(0.645, 0.045, 0.355, 1) — Movimientos simétricos y push entre escenas (= power2.inOut)
- `camera` cubic-bezier(0.77, 0, 0.175, 1) — Zoom/paneo de cámara virtual (= power3.inOut), 1-2 s
- `linear` cubic-bezier(0, 0, 1, 1) — Tipeo, progreso, scroll constante
- `expressive` cubic-bezier(0.34, 1.56, 0.64, 1) — RESTRINGIDO: overshoot ~10%. Solo registro lúdico aprobado; nunca datos, logos ni texto

## 5. Textura y acabado
- Fondo: gradient (grilla al 5% de opacidad cuando aplica). Esquinas: radios sm 1.6cqmin, md 3cqmin, lg 5cqmin.
- Sin sombras pesadas, sin glow decorativo, sin gradientes que no sean de marca.

## 6. Lo que nuestro motion nunca hace
- Bounce/elastic en texto (la energía sale del ritmo, no del rebote)
- Emojis o stickers animados
- Más de un resaltado por frame
- Glow, partículas o lens flares de relleno
- Movimiento continuo detrás de texto que se está leyendo
- Transición: spin
- Transición: star-wipe
- Transición: glitch aleatorio
- Transición: page-curl
- Transición: flash blanco > 3 por segundo

## 7. Un ejemplo bien hecho (plano por plano)
1. 0.0 s — fondo con grilla quieta. 0.2 s: kicker en mono entra con opacidad; una línea primaria se dibuja (scaleX 0→1, `standard`).
2. 0.35 s — el titular sube por máscara línea por línea (`emphasized`, stagger 90 ms). La palabra clave ya está en acento.
3. 1.3 s — la bajada entra con opacidad y 20% de desplazamiento (`enter`). Todo queda QUIETO durante el hold de lectura.
4. Última escena: salida con fade (`exit`, 260 ms). Entre escenas, la transición ES la salida (corte).
