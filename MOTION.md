# MOTION.md — TuMarca

> GENERADO desde brand/brand.config.json v1.0.0 por `npm run brand`. No editar a mano.
> Lo leen: este kit, las skills de HyperFrames (vía frame.md) y packs como charlie947/motion-graphics-skills.

## 1. Colores y para qué sirve cada uno
- `#0B0F19` **background**
- `#131A2A` **surface**
- `#1B2438` **surfaceAlt**
- `#2A3550` **border**
- `#F4F6FB` **text**
- `#A6B0C5` **textMuted**
- `#4C8DFF` **primary**
- `#2ED3A7` **secondary**
- `#FFB547` **accent**
- `#FF6B6B` **danger**
- `#3DDC84` **success**
- `#06101F` **onPrimary**
- Código: background `#0E1422`, text `#E6EDF7`, comment `#7D8AA5`, keyword `#7FB0FF`, string `#5FE0B8`, number `#FFC46B`, function `#C9A7FF`
- Data viz (en orden): `#4C8DFF` → `#2ED3A7` → `#FFB547` → `#C9A7FF` → `#FF6B6B` → `#8A96B0`
- Regla: El acento (accent) se raciona: una sola vez por frame, para el dato o la palabra clave. Nunca para texto corrido.

## 2. Tipografía y tamaños
- Display: Space Grotesk 500/700 · tracking -0.025em · sentence
- Body: Inter · Mono: JetBrains Mono
- Escala (cqmin, % del lado corto): hero 13 · h1 9 · h2 6.4 · h3 4.8 · body 3.7 · caption 3.3 · label 2.6 · code 3 · vertical ×1.22
- Máx 7 palabras/línea, 3 líneas/frame, mínimo 28px a 1080p.

## 3. Timing: cómo entra, cuánto se queda, cómo sale
- Entrada 500 ms (`enter`), énfasis 800 ms (`emphasized`), salida 325 ms (`exit`).
- Hold de lectura: max(1.5 s; 0.8 s + 0.35 s × palabras). Primer movimiento a 150-300 ms, nunca en t=0.
- Stagger: letters 25 ms, words 70 ms, lines 120 ms, items 100 ms.

## 4. Cómo se mueve
- Personalidad: **productive**. 30 fps. Transición por defecto: cut.
- `standard` cubic-bezier(0.2, 0, 0, 1) — Reposicionar algo visible (Material 3 standard)
- `enter` cubic-bezier(0.165, 0.84, 0.44, 1) — Entrada por defecto, desacelera sin rebote (= GSAP power3.out)
- `exit` cubic-bezier(0.55, 0.055, 0.675, 0.19) — Salida por defecto, acelera (= power2.in)
- `emphasized` cubic-bezier(0.19, 1, 0.22, 1) — Hero, reveals con máscara, el dato clave (= expo.out)
- `move` cubic-bezier(0.645, 0.045, 0.355, 1) — Movimientos simétricos y push entre escenas (= power2.inOut)
- `camera` cubic-bezier(0.77, 0, 0.175, 1) — Zoom/paneo de cámara virtual (= power3.inOut), 1-2 s
- `linear` cubic-bezier(0, 0, 1, 1) — Tipeo, progreso, scroll constante
- `expressive` cubic-bezier(0.34, 1.56, 0.64, 1) — RESTRINGIDO: overshoot ~10%. Solo registro lúdico aprobado; nunca datos, logos ni texto

## 5. Textura y acabado
- Fondo: subtle-grid (grilla al 6% de opacidad). Esquinas: radios sm 0.8cqmin, md 1.5cqmin, lg 2.5cqmin.
- Sin sombras pesadas, sin glow decorativo, sin gradientes que no sean de marca.

## 6. Lo que nuestro motion nunca hace
- Bounce/elastic en texto
- Todo entrando a la vez con el mismo fade+slide-up
- Rotaciones decorativas sin significado
- Glow, partículas o lens flares de relleno
- Movimiento continuo detrás de texto que se está leyendo
- Transición: spin
- Transición: star-wipe
- Transición: glitch aleatorio
- Transición: page-curl
- Transición: flash blanco > 3 por segundo

## 7. Un ejemplo bien hecho (plano por plano)
1. 0.0 s — fondo con grilla quieta. 0.2 s: kicker en mono entra con opacidad; una línea primaria se dibuja (scaleX 0→1, `standard`).
2. 0.35 s — el titular sube por máscara línea por línea (`emphasized`, stagger 120 ms). La palabra clave ya está en acento.
3. 1.3 s — la bajada entra con opacidad y 20% de desplazamiento (`enter`). Todo queda QUIETO durante el hold de lectura.
4. Última escena: salida con fade (`exit`, 325 ms). Entre escenas, la transición ES la salida (corte).
