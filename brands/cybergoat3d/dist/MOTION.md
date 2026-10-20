# MOTION.md — CyberGoat3D

> GENERADO desde `brands/cybergoat3d/brand.config.json` v0.1.0 por `npm run brand -- cybergoat3d`. No editar a mano. Leé también `brands/cybergoat3d/LOOK.md` (qué hace distinta a esta marca).
> Lo leen: este kit, las skills de HyperFrames (vía frame.md) y packs como charlie947/motion-graphics-skills.

## 0. Look
Producto al frente sobre blanco: badge rojo y negro, titulares cortos en MAYÚSCULAS gruesas y redondeadas (la letra del logotipo), el dato clave en rojo, todo centrado y con aire..
- Fondo: **flat** — los bloques usan `.bm-bg` (textura del look), `.bm-bg.is-hero` en aperturas y cierres, `.bm-bg.is-plain` cuando la escena necesita silencio visual.
- Composición: **centrada** (`var(--look-items)` / `var(--look-text-align)`); afirmaciones (kinetic-statement): **center**, tamaño h1.
- Titulares: **MAYÚSCULAS**.
- Acento (`*palabra*`): **color** (`.bm-accent`; se anima con `BM.accentIn`).
- Entrada de texto: **rise** (`BM.revealLines` / `BM.revealWords` la aplican solos).
- Kicker: decoración **dot** (`.bm-kicker-deco`, `BM.decoIn`).
- Tarjetas (`.bm-card`: pasos, comparaciones): **filled**.
- Densidad: **airy** (`var(--look-space)` = 1.3 multiplica los espacios de los bloques).

## 1. Colores y para qué sirve cada uno
- `#FFFFFF` **background**
- `#F2F2F2` **surface**
- `#E8E8E8` **surfaceAlt**
- `#E0E0E0` **border**
- `#1A1A1A` **text**
- `#5C5C5C` **textMuted**
- `#1A1A1A` **primary**
- `#8E0505` **secondary**
- `#BE0707` **accent**
- `#9E0000` **danger**
- `#2E7D32` **success**
- `#FFFFFF` **onPrimary**
- `#FFFFFF` **onAccent**
- Código: background `#1A1A1A`, text `#F2F2F2`, comment `#A6A6A6`, keyword `#FF7A7A`, string `#F5C2C2`, number `#FFB3B3`, function `#FFFFFF`
- Data viz (en orden): `#BE0707` → `#1A1A1A` → `#6B6B6B` → `#D9534F` → `#8E0505` → `#7A7A7A`
- Regla: Rojo solo para la palabra o el dato clave (como CYBER y 3D en el logo). Negro para estructura. Fondo blanco: el producto es el protagonista.

## 2. Tipografía y tamaños
- Display: Luckiest Guy 400 · tracking 0.01em · uppercase
- Body: Nunito · Mono: JetBrains Mono
- Escala (cqmin, % del lado corto): hero 12 · h1 8.4 · h2 6 · h3 4.6 · body 3.7 · caption 3.3 · label 2.6 · code 3 · 9:16 ×1.1 · 4:5 ×1.1
- Máx 7 palabras/línea, 3 líneas/frame, mínimo 28px a 1080p.

## 3. Timing: cómo entra, cuánto se queda, cómo sale
- Entrada 650 ms (`enter`), énfasis 1000 ms (`emphasized`), salida 420 ms (`exit`).
- Hold de lectura: max(1.5 s; 0.8 s + 0.35 s × palabras; caracteres / 15). Primer movimiento a 150-300 ms, nunca en t=0.
- Stagger: letters 25 ms, words 90 ms, lines 160 ms, items 80 ms; un grupo escalonado dura ≤ 600 ms (`BRAND.stagger(nombre, n)`).
- Voz en off: palabras netas de VO = duración (s) × 2,2 (≈130 para 60 s).

## 4. Cómo se mueve
- Personalidad: **balanced**. 30 fps. Transición por defecto: crossfade. Implementadas: cut, crossfade, push, mask-wipe; en el editor: zoom-through, match-cut.
- `standard` cubic-bezier(0.2, 0, 0, 1) — Reposicionar algo visible (Material 3 standard)
- `enter` cubic-bezier(0.165, 0.84, 0.44, 1) — Entrada por defecto, desacelera sin rebote (= GSAP power3.out)
- `exit` cubic-bezier(0.55, 0.055, 0.675, 0.19) — Salida por defecto, acelera (= power2.in)
- `emphasized` cubic-bezier(0.19, 1, 0.22, 1) — Hero, reveals con máscara, el dato clave (= expo.out)
- `move` cubic-bezier(0.645, 0.045, 0.355, 1) — Movimientos simétricos y push entre escenas (= power2.inOut)
- `camera` cubic-bezier(0.77, 0, 0.175, 1) — Zoom/paneo de cámara virtual (= power3.inOut), 1-2 s
- `linear` cubic-bezier(0, 0, 1, 1) — Tipeo, progreso, scroll constante
- `expressive` cubic-bezier(0.34, 1.56, 0.64, 1) — RESTRINGIDO: overshoot ~10%. Solo registro lúdico aprobado; nunca datos, logos ni texto

## 5. Textura y acabado
- Fondo: flat (grilla al 5% de opacidad cuando aplica). Esquinas: radios sm 0.8cqmin, md 1.5cqmin, lg 2.5cqmin.
- Sin sombras pesadas, sin glow decorativo, sin gradientes que no sean de marca.

## 6. Lo que nuestro motion nunca hace
- Bounce/elastic en texto
- Todo entrando a la vez con el mismo fade+slide-up
- Rotaciones decorativas sin significado
- Glow, partículas o lens flares de relleno
- Movimiento continuo detrás de texto que se está leyendo
- Glitch o distorsiones digitales
- Partículas, neón o lens flares
- Girar el logo
- Transición: spin
- Transición: star-wipe
- Transición: glitch aleatorio
- Transición: page-curl
- Transición: flash blanco > 3 por segundo

## 7. Un ejemplo bien hecho (plano por plano)
1. 0.0 s — fondo con grilla quieta. 0.2 s: kicker en mono entra con opacidad; una línea primaria se dibuja (scaleX 0→1, `standard`).
2. 0.35 s — el titular sube por máscara línea por línea (`emphasized`, stagger 160 ms). La palabra clave ya está en acento.
3. 1.3 s — la bajada entra con opacidad y 20% de desplazamiento (`enter`). Todo queda QUIETO durante el hold de lectura.
4. Última escena: salida con fade (`exit`, 420 ms). Entre escenas, la transición ES la salida (corte).
