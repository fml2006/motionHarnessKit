# Fundamentos de Motion Graphics para video tech dirigido con IA

> **Para qué sirve este documento.** Es el cuerpo de conocimiento base para un equipo que produce videos de tecnología con motion graphics generados por IA (Claude Code escribiendo HTML+GSAP o React+Remotion). No enseña a escribir el código, enseña a **dirigir y criticar** lo que el código produce: qué está bien, qué está mal, y cómo pedir el cambio con números.
>
> **Versión:** 1.0 · 2026-10-19 · Autor: dirección de motion (15 años en estudio y equipos de marca).
> **Archivo compañero:** `04-motion-tokens-default.json` (los mismos valores por defecto en formato máquina, para pegar en prompts o en el código).

## Convenciones

- **Unidades:** duraciones en **ms**; distancias en **px** sobre un lienzo de **1920×1080** salvo que se indique otro formato; `f` = frame. A 30 fps, 1 f = 33,3 ms; a 60 fps, 1 f = 16,7 ms; a 24 fps, 1 f = 41,7 ms.
- **Notación de curvas:** `cubic-bezier(x1, y1, x2, y2)` en CSS. Entre paréntesis va el equivalente aproximado en GSAP (`power3.out`, etc.).
- **Confiabilidad de cada dato.** Cada valor numérico lleva una etiqueta:
  - **[Oficial]**: tomado de la documentación del sistema o estándar (Material, Carbon, WCAG, SMPTE/EBU, Netflix, NN/g).
  - **[Secundaria]**: citado por fuentes de terceros que coinciden entre sí, pero no se verificó contra el original.
  - **[Repo]**: regla de los skills de HyperFrames (`hyperframes-animation`, `hyperframes-creative` y skills hermanos). Son reglas probadas en producción con IA.
  - **[Práctica]**: criterio de estudio o conocimiento del oficio que no se pudo verificar en esta investigación (el presupuesto de búsquedas web se agotó). Hay que tratarlo como punto de partida y calibrarlo con renders reales.

---

## 0. Resumen ejecutivo: las 12 reglas que más errores evitan

1. **Una idea por pantalla.** Si la pantalla dice dos cosas, son dos escenas.
2. **El texto se queda quieto mientras se lee.** Se mueve al entrar y al salir, no durante la lectura. Tiempo mínimo en pantalla: `máx(1,5 s; 0,8 s + 0,35 s × palabras)` [Práctica, ver §3.7].
3. **Las entradas desaceleran (`ease-out`) y las salidas aceleran (`ease-in`).** La salida dura entre el 60 y el 75 % de la entrada [Oficial NN/g, Material; Repo].
4. **La curva por defecto es suave y sin rebote:** `power3.out` ≈ `cubic-bezier(0.165, 0.84, 0.44, 1)`. El rebote (`back`, `elastic`, `bounce`) es un registro "explícitamente juguetón" y no una forma de dar énfasis [Repo].
5. **Lo que se mueve primero es lo más importante.** El stagger va por orden de importancia, no por orden del DOM, y el grupo completo entra en ≤ 500 ms [Repo].
6. **Variá.** Como máximo 2 tweens independientes con la misma curva por escena, y la escena más lenta tiene que ser unas 3 veces más lenta que la más rápida [Repo].
7. **Los holds son contenido.** Después de un zoom, de un conteo o de un logo, dejá ≥ 1–2 s de quietud [Repo].
8. **La transición significa algo:** corte = energía o disrupción; crossfade = "esto continúa"; push = "lo siguiente"; zoom-through = "entramos más profundo"; morph = "es lo mismo, cambiado" [Repo].
9. **Una transición principal (60–70 % de los cambios) más 1–2 de acento.** Nunca una transición distinta en cada escena [Repo].
10. **Respetá las safe areas por plataforma.** En 9:16, la UI tapa arriba y, sobre todo, abajo y a la derecha (ver §4.2).
11. **No más de 3 destellos por segundo, y nunca rojo saturado** (WCAG 2.3.1) [Oficial].
12. **Mejor sin movimiento que con movimiento malo.** Nada de "respiración" perezosa en loop ni paneos lentos de relleno [Repo].

---

## 1. Glosario esencial

Ordenado por familia. Entre corchetes, el término en inglés tal como aparece en After Effects, GSAP o Remotion.

### 1.1 Tiempo y animación

| Término | Definición práctica | Dato útil |
|---|---|---|
| **Keyframe** (fotograma clave) | Valor fijado de una propiedad (posición, escala, opacidad) en un instante. El software interpola entre keyframes. | En GSAP, un `fromTo` es un par de keyframes. En Remotion, `interpolate(frame, [0, 20], [0, 1])`. |
| **Interpolación** | Cómo se rellenan los valores entre keyframes: lineal, bezier o hold (escalón). | *Hold* = el valor salta sin transición (`steps(1)` en CSS/GSAP). |
| **Tween** | Animación de A a B en una duración dada (término de GSAP/Flash). | `tl.to(el, {x: 0, duration: 0.5})`. |
| **Timeline** | Línea de tiempo que ordena tweens. En video determinista hay **una sola** timeline pausada que el renderer recorre frame a frame [Repo]. | — |
| **Easing** (aceleración) | Variación de la velocidad a lo largo del movimiento. Es la "emoción" del movimiento: la transición es el verbo y el easing es el adverbio [Repo]. | Ver §3.3. |
| **Curva bezier** [cubic-bezier] | Curva definida por 2 puntos de control `(x1,y1,x2,y2)` que describe progreso en función del tiempo. Si `y` > 1, hay overshoot. | `cubic-bezier(0.2, 0, 0, 1)` = Material 3 *standard*. |
| **Gráfico de velocidad / de valor** [speed graph / value graph] | En el Graph Editor de After Effects: el de valor muestra la propiedad en el tiempo (pendiente = velocidad); el de velocidad muestra la velocidad (altura = rapidez; un ease es una "colina") [Secundaria]. | *Influence* 75–85 % en el ease de llegada da una sensación más "snappy" [Secundaria]. El *Easy Ease* por defecto de AE es 33,33 % [Práctica]. |
| **Ease in / ease out / ease in-out** | *In* = arranca lento y acelera (salidas). *Out* = arranca rápido y frena (entradas). *In-out* = ambos extremos suaves (movimientos dentro del cuadro). | GSAP: `.in`, `.out`, `.inOut`. |
| **Spring** (resorte) | Movimiento gobernado por física (rigidez, amortiguación, masa) en vez de duración + curva. Se asienta de forma natural y puede rebotar. | Ver §3.4. Con ζ = 1 no hay rebote. |
| **Damping ratio (ζ)** | Amortiguación relativa del resorte. ζ = 1 es crítico (sin overshoot); ζ = 0,8 da un overshoot de ~1,5 %; ζ = 0,5 da ~16 %. | El spring por defecto de Remotion (`damping 10, stiffness 100, mass 1`) tiene ζ = 0,5, es decir **~16 % de rebote**. Es demasiado para una marca tech seria (cálculo propio). |
| **Stagger** (escalonado) | Retraso sistemático entre elementos de un grupo que hacen la misma animación. | 40–80 ms por defecto; total del grupo ≤ 500 ms [Repo]. |
| **Offset / delay** | Desfase de un elemento respecto de otro. Es la base del *overlapping action*. | — |
| **Overshoot** (sobrepaso) | El elemento pasa de su destino y vuelve. | Serio: 0–1,5 %. Juguetón: 5–10 %. Más de 12 % se lee como dibujo animado [Repo]. |
| **Anticipation** (anticipación) | Pequeño movimiento contrario antes del principal, que prepara al ojo. | 5–10 % de la distancia, 80–150 ms [Práctica]. |
| **Follow-through / overlapping action** | Las partes secundarias siguen moviéndose o se asientan después de la principal. | Hijos 40–120 ms después del padre [Práctica]. |
| **Hold** (pausa) | Tramo donde un elemento queda quieto en pantalla para que se lea o se sienta. También: keyframe "hold" que salta sin interpolar. | Hold tras un zoom ≥ 1 s (1,5–2 s ideal) [Repo]. |
| **Dwell** | Tiempo de permanencia mínimo para leer algo. | 13 caracteres/s como mínimo para texto en video [Secundaria, legibility.info]. |
| **Beat** | (1) Golpe rítmico de la música. (2) Unidad narrativa: una escena o momento con una sola intención. | En los skills, "beat" = escena con su propia dirección [Repo]. |
| **Frame rate / fps** | Cuadros por segundo. | 24 = cine; 25 = PAL; 30 (29,97) = web, social y NTSC; 60 = grabaciones de pantalla y scroll fluido [Práctica]. |
| **Timecode** | Dirección temporal `HH:MM:SS:FF`. | En 29,97 drop-frame se escribe con `;` antes de los frames (`00:01:00;02`) [Práctica]. |
| **Motion blur** | Desenfoque de movimiento que simula el obturador abierto mientras el objeto se desplaza. | Obturador estándar de cine: 180° (medio frame) [Práctica]. Solo en movimientos rápidos; nunca en texto que se está leyendo [Repo]. |
| **Shutter angle** | Fracción del frame en que el obturador está abierto. 180° = ½ frame; 360° = 1 frame. | El componente de HyperFrames usa 720° (2 frames), medido contra un export de AE [Repo]. |

### 1.2 Espacio, capas y composición

| Término | Definición | Dato útil |
|---|---|---|
| **Comp** (composición) | Contenedor con tamaño, fps y duración donde se apilan capas (After Effects). En código, la composición raíz (`data-composition-id` o `<Composition>` en Remotion). | — |
| **Pre-comp** | Composición anidada dentro de otra, que se anima como una sola capa. En HyperFrames, *sub-composition*; en Remotion, un componente con `<Sequence>`. | Útil para reutilizar un lower third o un logo. |
| **Capa / layer** | Elemento independiente en la pila de la comp. | Mínimo 3 roles de profundidad por escena: fondo, contenido, acentos [Repo]. |
| **Alpha** (canal alfa) | Canal de transparencia. Un video con alfa (ProRes 4444, WebM VP9 o MOV) se puede superponer sobre otro. | Lower thirds y stings se exportan con alfa [Repo]. |
| **Mask** (máscara) | Forma que recorta qué parte de una capa se ve. En web: `clip-path` u `overflow: hidden`. | El *mask reveal* de texto es la técnica tipográfica más usada (§5). |
| **Matte / Track matte** | Una capa usa la luminancia o el alfa de otra capa como máscara (alpha matte, luma matte). | En web: `mask-image`, `background-clip: text` o SVG `<mask>`. |
| **Parallax** | Capas a distinta profundidad que se mueven a distinta velocidad. | Fondo al 20–50 % de la velocidad del frente [Práctica]. Es un disparador vestibular, así que usalo con moderación (§11). |
| **Safe area** (zona segura) | Margen interno donde el contenido no corre riesgo de recorte (TV) o de quedar tapado por la UI (social). | Broadcast HD: action safe 93 %, title safe 90 % [Oficial SMPTE ST 2046-1 / EBU R95]. |
| **Grilla / grid** | Estructura de columnas, márgenes y gutters. | 1920 px: 12 columnas, márgenes de 96 px y gutter de 24 px dan columnas de 122 px [Práctica]. |
| **Virtual camera** | En 2D, simular cámara transformando un contenedor "world" (escala + traslación). | Zoom 1,5–3×, 1,0–2,0 s [Repo]. |
| **Depth of field (DoF) / rack focus** | Desenfocar lo que no es foco para guiar la mirada. | Blur de 4–12 px en planos no focales [Práctica]. |

### 1.3 Piezas y formatos

| Término | Definición | Duración típica |
|---|---|---|
| **Lower third** (zócalo / graph) | Barra con nombre y cargo, o con un dato, en el tercio inferior. | 3–6 s en total [Repo]: entrada 400–600 ms, hold de 4–5 s, salida 300–400 ms [Práctica]. |
| **Bumper** | Pieza corta de marca que separa bloques o abre/cierra un programa. | 3–5 s [Práctica]. |
| **Sting** (logo sting) | Golpe de marca muy corto, normalmente con sonido, que firma o puntúa. | 1–3 s; un logo reveal completo, 3–5 s [Repo/Práctica]. |
| **Title card** | Pantalla de título de sección. | 2–4 s [Práctica]. |
| **Kinetic typography** | Tipografía animada donde el movimiento del texto es el mensaje. | — |
| **Explainer** | Video que explica un concepto o producto, habitualmente con voz en off. | 60–120 s; 2,5 palabras/s de narración [Repo]. |
| **Supers / overlays** | Gráficos superpuestos a footage (callouts, flechas, highlights). | — |
| **End card / end screen** | Pantalla final con CTA. | En YouTube, los elementos de pantalla final ocupan los últimos 5–20 s [Práctica]. |

### 1.4 Proceso de producción

| Término | Definición | Para qué sirve con IA |
|---|---|---|
| **Brief** | Objetivo, audiencia, mensaje, duración, formato, restricciones. | Sin brief, la IA rellena con clichés. |
| **Script / guion** | Texto de la voz en off o de la secuencia de textos. | Medí palabras: 150 palabras ≈ 60 s [Repo]. |
| **Boards / storyboard** | Viñetas con la composición clave de cada beat, más notas de movimiento, transición y sonido. | Es el documento que se le da a la IA: por cada beat, concepto, verbos de movimiento, transición, capas y SFX [Repo]. |
| **Styleframe** | Frame final de alta calidad que fija el look (color, tipografía, textura) antes de animar. | Pedile a la IA el *hero frame* estático antes de animar (§14) [Repo: "construí primero el hero frame en CSS estático"]. |
| **Animatic** | Boards cronometrados con audio, a veces con movimiento básico. Valida el ritmo antes del detalle. | En código: render con cajas grises y timings reales. Barato y rápido. |
| **Design frame / hero frame** | El momento de la escena donde más elementos son visibles. | Se diseña primero; la animación es el viaje hacia ese frame [Repo]. |
| **Blocking** | Primera pasada de animación: posiciones y tiempos sin pulir curvas. | — |
| **Polish** | Ajuste fino de curvas, overlaps, motion blur y sonido. | — |
| **Contact sheet** | Grilla de capturas en tiempos clave del render. | Es el modo más rápido de revisar el trabajo de la IA sin ver el video entero [Repo]. |

### 1.5 Edición y transiciones

| Término | Definición |
|---|---|
| **Corte (cut / hard cut)** | Cambio instantáneo de plano. Es la transición más común y la más invisible. |
| **Smash cut** | Corte abrupto entre dos estados muy contrastantes (silencio y ruido, calma y caos). |
| **Jump cut** | Corte dentro del mismo plano que produce un salto temporal visible. |
| **Match cut** | Corte entre dos planos que comparten forma, posición, color o movimiento (el círculo del logo pasa a ser el planeta). |
| **Cross dissolve / crossfade** | Fundido encadenado: las dos imágenes se superponen. |
| **Dip to black / white** | Fundido a color sólido entre planos. |
| **Push / slide** | La escena nueva empuja a la anterior fuera del cuadro. |
| **Wipe** | Una forma o línea barre el cuadro y revela la escena nueva. |
| **Whip pan** | Paneo muy rápido con motion blur que conecta dos planos. |
| **Zoom-through** | La cámara "atraviesa" un elemento hacia la escena siguiente. |
| **Morph / container transform** | Un elemento cambia de forma o tamaño hasta convertirse en el siguiente. |
| **Velocity-matched cut / cut the curve** | Corte en el punto de máxima velocidad, con la misma dirección y velocidad a ambos lados del corte [Repo]. |
| **J-cut / L-cut** | El audio del plano siguiente entra antes del corte (J) o el del anterior se extiende después (L). |
| **Eye trace** | El recorrido de la mirada. Un buen corte pone el foco nuevo donde estaba el ojo [Práctica, Walter Murch]. |

---

## 2. Los 12 principios de animación aplicados a motion graphics y UI

Los 12 principios vienen de Ollie Johnston y Frank Thomas, *The Illusion of Life* (Disney, 1981), y se escribieron para animar personajes [Secundaria]. En motion graphics y UI se aplican a texto, íconos, datos e interfaces. La tabla traduce cada uno a decisiones concretas.

| # | Principio | Qué significa en motion graphics | Tipografía | Íconos | Gráficos de datos | UI / producto | Error típico de la IA |
|---|---|---|---|---|---|---|---|
| 1 | **Squash & stretch** (aplastar y estirar) | Deformación que comunica masa y elasticidad. Conservá el volumen: `scaleX × scaleY ≈ 1`. | En un *slam*, aplastado vertical de 3–5 % al aterrizar y nada más. **Nunca** deformes un logo ni una tipografía de marca. | Un "like" o un check: escala 1 → 1,15 → 1 en 250–350 ms. | **Evitalo**: deformar una barra altera el dato. | Botón presionado a `scale 0.95–0.97` durante 80–120 ms, recuperación en 200–300 ms [Repo: press-release]. | Deformar todo, incluso logos y números. |
| 2 | **Anticipation** (anticipación) | Contramovimiento breve que avisa que algo va a pasar. | La palabra baja 4–8 px antes de salir disparada hacia arriba. Un *riser* de audio antes del reveal. | Un cohete se "agacha" antes de despegar. | Un dim del resto del gráfico 200–300 ms antes del highlight. | El cursor llega al botón 200–400 ms antes del clic; hover antes del press. | Clics sin aproximación: el cursor teletransportado. |
| 3 | **Staging** (puesta en escena) | Presentar **una** idea con total claridad. Una sola cosa reclama atención a la vez [Secundaria]. | La palabra clave ocupa el 60–80 % del ancho [Repo] y el resto baja de peso. | El ícono protagonista es el más grande y el único con color. | Una serie resaltada; el resto en gris al 30–40 % de opacidad. | Zoom o spotlight a la región; el resto, atenuado o desenfocado. | Todo entra a la vez con el mismo peso. |
| 4 | **Straight ahead vs pose to pose** | *Pose to pose* = keyframes en poses clave más interpolación (tweens). *Straight ahead* = simulación frame a frame (partículas, física, ruido). | Diseñá el *hero frame* y animá hacia él. | Íconos animados por poses (estado A → estado B). | Pose to pose; los datos no se simulan. | Estados de UI = poses. | Animar sin haber diseñado el frame final: layouts que "se arman" en un lugar raro. |
| 5 | **Follow-through & overlapping action** | Las partes no se detienen todas a la vez. | Las letras o palabras de una línea se asientan escalonadas: la última llega 60–120 ms después de la primera. | El ícono entra y su sombra o glow se asienta 50–100 ms después. | Primero las barras, después los labels con los valores (100–200 ms de diferencia). | La tarjeta entra y su texto interior llega 60–120 ms más tarde. | Todo frena en el mismo frame: se ve mecánico. |
| 6 | **Slow in & slow out** (easing) | Aceleración y desaceleración naturales. | Entradas `power3.out`; salidas `power2.in`. | Igual. | Conteos con desaceleración (`power2/3.out`) para que el número final se lea [Repo]. | Ver §3.3. | Movimientos lineales en todo, o la misma curva en todo. |
| 7 | **Arcs** (arcos) | Los movimientos naturales siguen arcos, no rectas. | Una palabra que vuela en arco se lee como lúdica; en registro serio, recta. | Un ícono que viaja entre dos puntos, en arco (motion path). | **Rectas**: el arco sugiere una trayectoria que no está en los datos (salvo diagramas de flujo). | El cursor se mueve en arcos suaves, no en línea recta perfecta. | El cursor robótico en línea recta y a velocidad constante. |
| 8 | **Secondary action** (acción secundaria) | Una acción que acompaña y refuerza a la principal **sin competir con ella**. | Un subrayado que se dibuja después de la palabra. | Partes internas de un SVG que se mueven (engranaje que gira, puntos que pulsan) [Repo: svg-icon-enrichment]. | Un pulso suave en el punto actual de una línea. | Un *ripple* de 300–500 ms en el clic. | Partículas y glows sin relación con el mensaje. Regla: la acción secundaria tiene ≤ 30 % de la amplitud o el contraste de la principal [Práctica]. |
| 9 | **Timing** | La cantidad de frames define peso y emoción. | 6 f = golpe; 12 f = estándar; 24 f = peso o solemnidad (a 24 fps) [Práctica]. | 150–300 ms para microanimaciones. | Conteo de 1,2–2,5 s [Repo]. | 100–500 ms para UI [Oficial NN/g]. | Todo a 400–500 ms [Repo]. |
| 10 | **Exaggeration** (exageración) | Empujar los valores para que se lean, sobre todo en pantallas chicas. | En pantallas chicas, las distancias y escalas tienen que ser mayores que en web. | Ícono con pop a 1,15–1,2× en lugar de 1,05×. | Exagerá **el énfasis** (color, escala del highlight), **nunca el dato**. | Zoom de 1,5–2× para que el detalle se lea en el celular. | Exagerar el dato: ejes recortados, barras que "crecen de más". |
| 11 | **Solid drawing** (dibujo sólido) | En motion graphics: **consistencia espacial**. La misma perspectiva, la misma dirección de luz y el mismo grosor de trazo. | Un mismo `perspective` (p. ej., 1000–1500 px) en toda la escena [Práctica]. | Íconos de una sola familia, con el mismo stroke. | Mismas escalas y ejes entre escenas que comparan. | Sombras coherentes con una fuente de luz. | Mezclar flat con 3D, o sombras en direcciones distintas. |
| 12 | **Appeal** (atractivo) | Claridad, personalidad y pulido, coherentes con la marca. | Una tipografía expresiva por escena [Repo]. | Familia coherente. | Limpio, con un único acento. | El movimiento de la marca es reconocible (§7). | Estética genérica de IA (§12). |

### 2.1 Los 12 principios de UX in Motion (Issara Willenskomer)

Para interfaces y screen recordings, Willenskomer los reformuló en 12 principios de usabilidad [Secundaria]: **Easing**, **Offset & Delay**, **Parenting**, **Transformation**, **Value Change**, **Masking**, **Overlay**, **Cloning**, **Obscuration**, **Parallax**, **Dimensionality** y **Dolly & Zoom**. Se agrupan según lo que apoyan: expectativa, continuidad, narrativa y relación entre objetos.

| Principio UX | Aplicación en video tech |
|---|---|
| Easing | Igual que slow in/out (§3.3). |
| Offset & Delay | El stagger comunica qué elementos están relacionados y en qué orden leerlos. |
| Parenting | Un elemento hijo hereda el movimiento del padre (el label viaja con la barra; el cursor arrastra la tarjeta). |
| Transformation | Un objeto se convierte en otro (botón → modal; ícono → panel). Es la base del morph. |
| Value Change | Los números cambian con continuidad (conteo, ticker) en lugar de saltar. |
| Masking | Revelar u ocultar recortando: texto que sale de una máscara, imagen que se abre. |
| Overlay | Capas que se superponen sin perder el contexto (tooltips, callouts sobre UI). |
| Cloning | Un elemento se duplica en varios (un ícono genera una lista). |
| Obscuration | Desenfocar o atenuar el fondo para destacar el primer plano (modales, spotlight). |
| Parallax | Profundidad por velocidades diferentes. |
| Dimensionality | Objetos con profundidad (flip 3D de tarjetas, pliegues). |
| Dolly & Zoom | Cámara que se acerca o se aleja sin cortar (zoom a una región de la UI). |

---

## 3. Timing y easing con números

### 3.1 Tabla de conversión frames ↔ ms

| fps | 1 f | 3 f | 6 f | 12 f | 15 f | 24 f | 30 f |
|---|---|---|---|---|---|---|---|
| 24 | 41,7 ms | 125 | 250 | 500 | 625 | 1000 | 1250 |
| 30 | 33,3 ms | 100 | 200 | 400 | 500 | 800 | 1000 |
| 60 | 16,7 ms | 50 | 100 | 200 | 250 | 400 | 500 |

**Regla:** pensá en frames cuando revisás y en ms cuando le pedís cambios a la IA. Una diferencia de 2 frames a 30 fps (67 ms) **se nota** en un overlap o en una sincronía con audio.

### 3.2 Duraciones recomendadas por tipo de movimiento

Referencias oficiales de UI: la mayoría de las animaciones caben entre 100 y 500 ms; ~100 ms basta para un feedback simple, y a partir de 500 ms se empiezan a sentir lentas [Oficial NN/g]. Atlassian usa 50–150 ms para hover y press y 150–400 ms para entrar, salir o mover (dropdown 150 ms, modal 250 ms) [Oficial]. Material 1 fijaba ~300 ms en mobile, 225 ms para lo que entra, 195 ms para lo que sale y hasta 375 ms para transiciones de pantalla completa [Oficial].

**El video es distinto de la UI.** En UI, el usuario espera y la animación es una demora. En video, el espectador está mirando y el movimiento **es** el contenido. Por eso las entradas de video son algo más largas que las de UI, sobre todo en elementos hero, y los holds son mucho más largos. Esta es la tabla por defecto del equipo:

| Tipo | Rango | Default | Curva | Fuente |
|---|---|---|---|---|
| **Micro** (clic, toggle, check, hover, cambio de estado de ícono) | 100–200 ms | 150 ms | enter / standard | NN/g, Atlassian, Carbon `fast-01/02` |
| **Press de botón** | 80–120 ms abajo + 200–300 ms recuperación | 100 + 250 | `power1.in` → spring ζ 0,8–1 | Repo |
| **Entrada pequeña** (chip, label, ícono) | 250–400 ms | 350 ms | enter | Repo / Práctica |
| **Entrada media** (tarjeta, línea de titular) | 400–600 ms | 500 ms | enter | Repo (`POP_DUR 0.4–0.7`) |
| **Entrada hero** (palabra hero, número grande, logo) | 600–1000 ms | 800 ms | enter-punch o spring ζ 1 | Repo. El hero tiene que estar visible a ≤ 0,5 s del inicio de la escena |
| **Primera animación de la escena** | Arranca a 100–300 ms del inicio | 200 ms | — | Repo (empezar en t = 0 se siente como un jump cut) |
| **Salida** | 60–75 % de la entrada | 250–300 ms | exit | Material, NN/g, Repo (0,4 s de entrada → 0,25 s de salida) |
| **Movimiento dentro del cuadro** (reposicionar, reordenar) | 400–700 ms | 500 ms | move (in-out) | Práctica |
| **Transición de escena, energía alta** | 150–300 ms | 250 ms | `power4` / `expo` | Repo |
| **Transición de escena, energía media** (corporativo, SaaS, explainer) | 300–500 ms | 400 ms | `power2` / `power3` | Repo |
| **Transición de escena, calma** (marca, premium) | 500–800 ms | 650 ms | `sine.inOut` / `power1` | Repo |
| **Outro / cierre** | 600–1000 ms | 800 ms | crossfade o dip a negro | Repo |
| **Zoom de cámara a un objetivo** | 1000–2000 ms | 1400 ms | camera (in-out) | Repo (< 0,8 s se ve como teletransporte; > 2,5 s se arrastra) |
| **Conteo de número** | 1200–2500 ms | 1500 ms | `power2/3.out` | Repo (< 0,8 s se lee como un flash) |
| **Transición de datos** (morph de gráfico) | 700–1200 ms, por etapas | 1000 ms | move | Heer & Robertson: ~1 s [Oficial/paper] |
| **Dibujo de trazo SVG** (por segmento) | 300–800 ms | 500 ms | `power2.out` o lineal | Repo |
| **Lower third** | Entrada 400–600, hold 4–5 s, salida 300–400 | 500 / 4500 / 350 | enter / exit | Repo / Práctica |
| **Logo sting** | 2–4 s total; lockup final ≥ 1,0–1,5 s | 3 s | — | Repo / Práctica |
| **Loop ambiental** (respiración, deriva) | Período de 1,5–3 s | 2,5 s | `sine.inOut` | Repo. Amplitud: escala 0,8–1,5 %, y 2–3 px |

**Regla de distancia y tamaño:** cuanto más grande es el elemento o más recorre, más tiempo necesita [Oficial Carbon, Fluent]. Como orientación [Práctica], sumá ~100 ms por cada 25 % del ancho de cuadro recorrido por encima de un recorrido corto, o usá springs, que escalan solos.

**Regla de contraste de velocidades:** la escena más lenta tiene que ser ~3 veces más lenta que la más rápida [Repo]. Las categorías de "peso" del repo son:

- 150–300 ms: energía, urgencia, confianza.
- 300–500 ms: profesional; la mayoría del contenido.
- 500–800 ms: gravedad, lujo, contemplación.
- 800–2000 ms: cinematográfico, emocional, atmosférico.

### 3.3 Curvas estándar (cubic-bezier exactos)

#### Material Design 3 (Google)

| Token | cubic-bezier | Uso | Duración sugerida | Fuente |
|---|---|---|---|---|
| `emphasized` | Path de dos tramos (no expresable con un solo bezier). La aproximación habitual en CSS es `(0.2, 0, 0, 1)`. | Transiciones principales, mantiene la atención al final | 500 ms | Oficial (la aproximación CSS es Práctica) |
| `emphasized-decelerate` | `(0.05, 0.7, 0.1, 1)` | **Entradas** enfáticas | 400 ms | Oficial |
| `emphasized-accelerate` | `(0.3, 0, 0.8, 0.15)` | **Salidas** enfáticas | 200 ms | Oficial |
| `standard` | `(0.2, 0, 0, 1)` | Movimientos utilitarios dentro de la pantalla | 300 ms | Secundaria (coinciden varias fuentes) |
| `standard-decelerate` | `(0, 0, 0, 1)` | Entradas utilitarias | 250 ms | Secundaria |
| `standard-accelerate` | `(0.3, 0, 1, 1)` | Salidas utilitarias | 200 ms | Práctica |
| `legacy` (M2 *standard*) | `(0.4, 0, 0.2, 1)` | Compatibilidad | — | Práctica |

**Duraciones M3:** short1–4 = 50/100/150/200 ms; medium1–4 = 250/300/350/400 ms; long1–4 = 450/500/550/600 ms; extra-long1–4 = 700/800/900/1000 ms [Secundaria, consistente entre fuentes].

**M3 Expressive (2025)** reemplaza la duración por **springs** con tres parámetros: rigidez, amortiguación y velocidad inicial. Hay tokens *spatial* (posición, tamaño, forma; pueden rebotar) y *effects* (color, opacidad; amortiguación crítica, nunca rebotan), en velocidades fast, default y slow [Oficial]. Sobre los valores exactos, las fuentes no coinciden: por ejemplo, *expressive default spatial* ≈ stiffness 380 [Secundaria] y *standard fast spatial* = damping 0,9 / stiffness 1400 [Secundaria]. Usá los tokens por nombre, no números sueltos.

#### IBM Carbon (productivo vs expresivo)

| Curva | Productive | Expressive | Fuente |
|---|---|---|---|
| standard | `(0.2, 0, 0.38, 0.9)` | `(0.4, 0.14, 0.3, 1)` | Oficial |
| entrance | `(0, 0, 0.38, 0.9)` | `(0, 0, 0.3, 1)` | Oficial |
| exit | `(0.2, 0, 1, 0.9)` | `(0.4, 0.14, 1, 1)` | Oficial |

**Duraciones Carbon:** `fast-01` 70 ms (microinteracciones: botones, toggles), `fast-02` 110 ms, `moderate-01` 150 ms, `moderate-02` 240 ms, `slow-01` 400 ms y `slow-02` 700 ms [Oficial para 70/150/400; 110/240/700 según @carbon/motion y Pluma, Secundaria]. El movimiento *productivo* es mucho más rápido que el *expresivo*. Cuanto mayor es la distancia o el cambio de tamaño, mayor es la duración [Oficial].

#### Microsoft Fluent 2

| Token | Valor | Fuente |
|---|---|---|
| `durationUltraFast` / `Faster` / `Fast` / `Normal` / `Gentle` / `Slow` / `Slower` / `UltraSlow` | 50 / 100 / 150 / 200 / 250 / 300 / 400 / 500 ms | 50 y 500: Secundaria; resto: Práctica |
| `curveDecelerateMax` | `(0.1, 0.9, 0.2, 1)` | Secundaria (issue del repo oficial) |
| `curveDecelerateMid` | `(0, 0, 0, 1)` | Secundaria |
| `curveDecelerateMin` | `(0.33, 0, 0.1, 1)` | Práctica |
| `curveAccelerateMax` | `(0.9, 0.1, 1, 0.2)` | Secundaria |
| `curveAccelerateMid` | `(1, 0, 1, 1)` | Práctica |
| `curveAccelerateMin` | `(0.8, 0, 0.78, 1)` | Práctica |
| `curveEasyEaseMax` | `(0.8, 0, 0.2, 1)` | Secundaria |
| `curveEasyEase` | `(0.33, 0, 0.67, 1)` | Práctica |
| `curveLinear` | `(0, 0, 1, 1)` | — |

Fluent pide dar más tiempo a los elementos más grandes y reservar el easing lineal para cambios a ritmo constante [Oficial].

#### Apple (HIG + SwiftUI)

- Principios: el movimiento tiene que **comunicar**, agregarse **con propósito**, ser **realista** (lo que desafía la física desorienta), **nunca ser el único canal** de información importante, y con **Reduce Motion** activado hay que minimizarlo o eliminarlo [Oficial HIG].
- Springs de SwiftUI (iOS 17+): se definen por `duration` y `bounce` (de -1 a 1). Los presets `.smooth` (sin rebote), `.snappy` (rebote leve) y `.bouncy` (rebote alto) tienen una duración por defecto de 0,5 s. En la sesión de WWDC23 los ejemplos usan `bounce: 0.15` y `0.3` [Oficial].

#### Equivalencias GSAP ↔ CSS (aproximaciones de Penner / easings.net) [Práctica]

| GSAP | Nombre clásico | cubic-bezier aprox. | Carácter |
|---|---|---|---|
| `power1.out` | easeOutQuad | `(0.25, 0.46, 0.45, 0.94)` | suave, secundario |
| `power2.out` | easeOutCubic | `(0.215, 0.61, 0.355, 1)` | gentil |
| `power3.out` | easeOutQuart | `(0.165, 0.84, 0.44, 1)` | **default de entrada** |
| `power4.out` | easeOutQuint | `(0.23, 1, 0.32, 1)` | slam, golpe |
| `expo.out` | easeOutExpo | `(0.19, 1, 0.22, 1)` | snap premium |
| `power2.in` | easeInCubic | `(0.55, 0.055, 0.675, 0.19)` | **default de salida** |
| `power3.in` | easeInQuart | `(0.895, 0.03, 0.685, 0.22)` | salida fuerte, antes de un corte |
| `power2.inOut` | easeInOutCubic | `(0.645, 0.045, 0.355, 1)` | movimiento simétrico |
| `power3.inOut` | easeInOutQuart | `(0.77, 0, 0.175, 1)` | cámara |
| `sine.inOut` | easeInOutSine | `(0.445, 0.05, 0.55, 0.95)` | ambiente, loops, Ken Burns |
| `back.out(1.7)` | easeOutBack | `(0.34, 1.56, 0.64, 1)` | **restringido**: overshoot de ~10 % |
| `none` | linear | `linear` | tipeo, scroll constante, progreso atado al tiempo |
| `steps(1)` | step | `steps(1)` | parpadeo de cursor, saltos discretos |

**Cuándo usar cada familia** [Repo]:

- `power1` / `power2`: movimiento secundario suave.
- `power3`: el caballo de batalla.
- `power4` / `expo`: golpes y reveals premium.
- `sine`: lo orgánico y los loops.
- `circ`: movimientos de cámara y orbitales.
- `steps(N)`: tipeo, ticks de contador, estética digital o retro.
- `back` / `elastic` / `bounce`: solo en registro explícitamente juguetón, con `back ≤ 2`.

Cada composición usa **≥ 3 caracteres de easing** distintos (variando por energía dentro de las familias suaves, no agregando rebote).

### 3.4 Cuándo usar spring (y con qué valores)

**Usá spring cuando:**

- El movimiento tiene que sentirse físico: la llegada de un objeto, la respuesta a un clic, un drag que se suelta.
- No sabés la distancia de antemano: el spring escala solo.
- Querés el "asentamiento premium" de iOS, con un arranque rápido y una cola larga.

**No uses spring con overshoot en:**

- Opacidad o color: pasarían de 1 o de su valor final. Si el spring tiene overshoot, separá la opacidad en un tween propio con `power2.out` [Repo].
- Números y datos: un número que rebota parece inestable [Repo].
- Logos o tipografía de marca seria.
- Elementos alineados a una grilla, donde el rebote rompe la alineación durante el asentamiento.

| Preset | ζ | Overshoot | Remotion `{mass, stiffness, damping}` | GSAP `springEase` (repo) | SwiftUI | Uso |
|---|---|---|---|---|---|---|
| **settle** (default) | 1,0 | 0 % | `{1, 100, 20}`: llega al 99 % en ~0,66 s | `{response: 0.4, dampingFraction: 1}` → ~0,59 s | `.smooth` | Producto, enterprise, tono serio |
| **alive** | ~0,8 | ~1,5 % | `{1, 170, 21}` | `{response: 0.4, dampingFraction: 0.82}` | `.snappy` (bounce ~0,15) | "Vivo, no saltarín": se siente, no se ve |
| **playful** (restringido) | 0,6–0,7 | 5–10 % | `{1, 120, 14}` | `{response: 0.45, dampingFraction: 0.65}` | `.bouncy` (bounce ~0,3) | Solo para marcas o beats explícitamente lúdicos |
| ⚠️ Default de Remotion | 0,5 | ~16 % | `{1, 100, 10}` | — | — | **No lo uses sin cambiar `damping`** |

Cálculo: `ζ = damping / (2·√(stiffness·mass))`, `overshoot = e^(−πζ/√(1−ζ²))`. Los valores de Remotion por defecto (damping 10, stiffness 100, mass 1) son oficiales; el resto se calculó con esas fórmulas. El helper `springEase` del repo es una ecuación cerrada (función pura del progreso) y, por lo tanto, segura para el seek del render. Los springs con estado de las librerías interactivas no lo son [Repo].

**Equivalencia útil:** a ζ = 1, el spring verdadero recorre ~67 % en el primer cuarto del tiempo, contra ~58 % de `power3.out`, y tiene una cola más larga. Esa cola es la lectura "premium". Usala cuando el asentamiento **es** el plano (un wordmark que aterriza, el lockup final) [Repo].

### 3.5 Entrada vs salida

| Regla | Valor | Fuente |
|---|---|---|
| Las entradas desaceleran | `.out` (enter) | Repo, Material, Carbon |
| Las salidas aceleran | `.in` (exit) | Repo, Material, Carbon |
| Movimientos entre dos posiciones visibles | `.inOut` (move) | Repo |
| Duración de la salida | 60–75 % de la entrada (Material 1: 195/225 ms ≈ 87 %; repo: 250/400 ms ≈ 63 %) | Oficial / Repo |
| Distancia de salida | Igual o menor que la de entrada; salida parcial más fade (no hace falta salir del cuadro) | Repo (*cut the curve*) |
| Entre escenas | **La transición es la salida.** No animes salidas antes de una transición; solo la última escena tiene salida propia | Repo |

El error más común de la IA es **invertirlas**: un ease-in en una entrada se siente perezoso y un ease-out en una salida se siente reticente [Repo].

### 3.6 Stagger típico

| Contexto | Stagger por elemento | Notas |
|---|---|---|
| Letras (per-letter) | 20–40 ms | Solo en palabras cortas o títulos (≤ 12–15 caracteres); total ≤ 500 ms |
| Palabras, ritmo "metralleta" (hook de TikTok) | 40 ms | Repo |
| Palabras, conversacional (default) | 80 ms | Repo |
| Palabras, documental o deliberado | 150 ms | Repo |
| Palabras, poético o ceremonial | 250+ ms | Repo |
| Líneas de un párrafo o lista (mask reveal) | 80–150 ms | Práctica |
| Ítems de lista o tarjetas en grilla | 40–80 ms; fórmula `min(60 ms, 500 ms / N)` | Repo |
| Segmentos de un trazo SVG | El siguiente arranca al 70–80 % del anterior | Repo |
| Hijos respecto del padre (follow-through) | 60–120 ms | Práctica |

**Reglas del stagger:**

- El grupo entra en ≤ 500 ms, sin importar cuántos elementos tenga [Repo].
- Con más de 9 ítems, el stagger desaparece visualmente: pasá a un *wipe* o *sweep* [Repo].
- Ordená por importancia o por orden de lectura, no por el orden del código [Repo].
- Superponé: el siguiente elemento arranca antes de que el anterior termine. En un *waterfall*, 1–2 frames de solape, con huecos que se achican a lo largo de la cascada [Repo].
- Cada escena tiene su propio stagger: no repitas el mismo en toda la pieza [Repo].
- Si varias cifras se muestran juntas, cuentan **en acorde**: misma curva, misma duración, mismo inicio [Repo].

### 3.7 Velocidad de lectura y tiempo mínimo en pantalla

**Datos base:**

| Medida | Valor | Fuente |
|---|---|---|
| Narración natural | 2,5 palabras/s (150 ppm); 60 s ≈ 150 palabras | Repo |
| TTS | 145–155 ppm, con aire | Repo |
| Subtítulos BBC | 160–180 ppm, ~0,3–0,33 s por palabra | Secundaria / Repo |
| Subtítulos Netflix en español | ≤ 17 caracteres/s en adultos; ≤ 13 en infantil | Secundaria (plantillas Netflix) |
| Subtítulos Netflix en inglés | ≤ 20 caracteres/s en adultos | Práctica |
| Texto en video con movimiento | Dwell mínimo de 13 caracteres/s; el texto animado tiene que estar **quieto** todo ese tiempo, y cuanto más rápido es el montaje, más dwell necesita | Secundaria (legibility.info) |
| Regla empírica de producción | 1 s por cada 2–3 palabras | Secundaria (Biteable) |
| Regla de diseño | "3 s en pantalla = tiene que poder leerse en 2" | Repo |
| Caption por palabra | ≥ 0,4 s visible; stagger de 200–220 ms por palabra; frase completa en hold de 0,4–0,6 s antes de salir; entradas de menos de 150 ms se leen frenéticas | Repo |

**Fórmula del equipo para texto sin voz (on-screen text)** [Práctica, calibrada con las fuentes anteriores]:

```
hold_texto = máx( 1,5 s ; 0,8 s + 0,35 s × palabras ; caracteres / 15 )
```

| Palabras | Hold mínimo |
|---|---|
| 1–2 | 1,5 s |
| 5 | 2,6 s |
| 8 | 3,6 s |
| 12 | 5,0 s |

El español tiene palabras ~10 % más largas que el inglés, y el término de caracteres (`/15`) ya lo cubre. Sumá **+20 %** si el texto es técnico (código, cifras, nombres propios) o si el montaje previo fue muy rápido. **Prueba del director:** leé el texto en voz alta **dos veces** a ritmo normal mientras corre el render. Si no llegás, el hold es corto [Práctica].

**Con voz en off:** el texto aparece cuando la voz lo dice (±100 ms) y se queda hasta el final de la frase más 0,4–0,6 s. No muestres en pantalla más palabras de las que la voz está diciendo, salvo que sean keywords (ver §5).

**Límites por pantalla:** máximo ~7 palabras por línea (≈ 35–42 caracteres), 1–3 líneas, **1 idea** [Práctica, coherente con Netflix: 42 caracteres por línea].

### 3.8 Holds y estructura de escena

**Estructura build / breathe / resolve** [Repo]:

- **Build (0–30 %):** los elementos entran escalonados. No vuelques todo junto.
- **Breathe (30–70 %):** el contenido está visible, vivo con **un solo** movimiento ambiental o con quietud total.
- **Resolve (70–100 %):** salida o final decisivo. Las salidas son más rápidas que las entradas.

**Variante para explainers con voz** [Repo, pr-to-video]: no vuelques todo en el primer 25 % de la escena. Revelá cada pieza **cuando la voz la menciona**, repartiendo los reveals en la **segunda mitad**. Así se evita el efecto "slideshow" o PowerPoint.

| Hold | Valor | Fuente |
|---|---|---|
| Después de un zoom de cámara | ≥ 1,0 s (1,5–2 s ideal) | Repo |
| Después de un conteo | ≥ 1,0 s; el sufijo (%, ×) entra **después** de que el número aterriza | Repo |
| Lectura de un gráfico | ≥ 0,8 s el valor final; 1,5–3 s si el gráfico tiene un mensaje | Repo / Práctica |
| Lockup final, logo o cierre | 1,0–2,0 s y claramente mayor que los holds intermedios | Repo |
| Entrada intermedia en una secuencia de textos | 0,5–1,0 s (< hold final) | Repo |
| Escena con una idea y texto | ≥ 2–3 s | Práctica |
| Golpes rápidos (listas al beat, sin lectura) | 0,5–1,0 s, solo con ≤ 2 palabras | Práctica |

---

## 4. Composición y jerarquía visual en movimiento

### 4.1 Grilla

- **16:9 (1920×1080):** 12 columnas, márgenes de 96 px (5 % = title safe de SMPTE/EBU), gutter de 24 px, columnas de 122 px y baseline de 8 px. Los tercios caen en x = 640 / 1280 e y = 360 / 720 [Práctica].
- **9:16 (1080×1920):** 4–6 columnas, márgenes laterales de 65 px (6 %, el valor de Meta) y el contenido vertical entre y = 270 e y = 1250 (ver §4.2) [Práctica derivada de Meta].
- **1:1 y 4:5 (1080×1080 y 1080×1350):** 6 columnas, márgenes de 54–65 px [Práctica].
- **El layout se diseña estático primero** (*hero frame*) y se anima hacia él. Nunca uses `position:absolute; top:Npx` en contenedores de contenido; dejá padding de ≥ 80 px [Repo].
- **Video no es web** [Repo]:
  - Anclá el contenido a bordes (izquierda/arriba, derecha/abajo) en vez de centrar todo flotando.
  - Usá layouts por zonas (panel de datos a la izquierda y contenido a la derecha; barra de metadatos arriba).
  - Usá elementos estructurales (reglas, divisores, paneles) que guían la mirada y se animan bien con `scaleX` de 0 a 1.

### 4.2 Safe areas por plataforma

**Broadcast / YouTube 16:9.** El estándar actual es SMPTE ST 2046-1 y EBU R95: **action safe = 93 %** (3,5 % por borde) y **title/graphics safe = 90 %** (5 % por borde) [Oficial]. Las plantillas heredadas de 4:3, que siguen siendo el default de Premiere y del preview de HyperFrames Studio, usan **90 % / 80 %** [Repo: `hyperframes-studio`]. Para web no hay overscan, pero el title safe sigue sirviendo como margen de diseño y como reserva para controles y subtítulos.

| Formato | Zona | Inset por borde | Caja útil (px) | Fuente |
|---|---|---|---|---|
| 1920×1080 | Action safe 93 % | 67 × 38 px | x 67–1853 · y 38–1042 | Oficial |
| 1920×1080 | Title safe 90 % | 96 × 54 px | x 96–1824 · y 54–1026 | Oficial |
| 1920×1080 | Title safe heredado 80 % | 192 × 108 px | x 192–1728 · y 108–972 | Repo (Premiere / Studio) |
| 3840×2160 | Title safe 90 % | 192 × 108 px | Duplicá los valores de 1080p | Oficial |
| YouTube 16:9 | Además, evitá texto clave en el 10–12 % inferior (barra de progreso y subtítulos), y en los últimos 5–20 s, que es donde van los elementos de pantalla final | ~110–130 px abajo | — | Práctica |

**Vertical 9:16 (1080×1920): Reels, TikTok, Shorts.** La UI de cada app tapa la parte de arriba (perfil, pestañas), la de abajo (caption, nombre de usuario, música, CTA) y la columna derecha (like, comentar, compartir). **Ningún valor en píxeles es oficial y estable**: las apps cambian la UI varias veces por año [Secundaria].

| Plataforma | Arriba | Abajo | Derecha | Izquierda | Fuente |
|---|---|---|---|---|---|
| **Meta (Reels/Stories, anuncios)** | 14 % = **269 px** | 35 % = **672 px** (40 % con disclaimer) | 6 % = **65 px** | 6 % = **65 px** | Secundaria (varias guías citan la misma regla de Meta) |
| TikTok (guías de terceros) | ~108–160 px | ~320–480 px | ~120–140 px | ~60 px | Secundaria (las fuentes no coinciden) |
| YouTube Shorts (guías de terceros) | ~120–250 px | ~300–390 px | ~120 px | ~60 px | Secundaria |
| **Universal conservadora (recomendada)** | **270 px** | **672 px** | **150 px** | **65 px** | Práctica (el peor caso de cada borde) |
| Universal orgánica (menos estricta) | 250 px | 500 px | 150 px | 60 px | Secundaria (síntesis) |

Con la zona universal conservadora, el **área de contenido seguro en 9:16 es x 65–930 · y 270–1248 (865 × 978 px)**. Ahí van el titular, las cifras, las caras y el logo. El fondo y la decoración pueden ocupar todo el cuadro. Los subtítulos en 9:16 van **por encima** de la zona inferior: y ≈ 1050–1250, centrados en el área segura [Práctica].

**LinkedIn y feeds (1:1 y 4:5).** El video se ve chico dentro del feed y suele arrancar en silencio, así que los subtítulos quemados son obligatorios [Práctica]. Márgenes de 5–6 % (54–65 px) por lado y reserva de ~10–12 % inferior para controles y captions [Práctica]. Los tamaños de texto suben (§4.3).

### 4.3 Tamaños mínimos de texto por resolución

Valores para 1080p a pantalla completa (YouTube, web embebida) [Repo `video-composition.md` + `typography.md`]:

| Elemento | Web (referencia) | Video 1920×1080 | Mínimo absoluto |
|---|---|---|---|
| Hero / display | — | 120–240 px; 60–80 % del ancho del cuadro | — |
| Titular | 32–48 px | **64–120 px** | 60 px |
| Subtítulo o bajada | — | 40–56 px | 36 px |
| Cuerpo | 14–16 px | **28–42 px** | 24 px (si usás menos, justificalo) |
| Labels y datos | 12 px | 18–24 px | 18 px |
| Código (monoespaciado) | — | 28–40 px; ≤ 12–15 líneas visibles | 24 px |
| Captions (subtítulos) | — | 40–55 px (altura de mayúsculas ≈ 3,5–5 % del alto de cuadro) | 36 px |
| Bordes | 1 px | 2–4 px | 2 px |
| Padding | 16–32 px | 60–140 px | — |
| Opacidad decorativa | 3–8 % | 12–25 %; < 10 % es invisible tras la compresión | 10 % |

**In-feed (LinkedIn, Instagram o X a 1080 px de ancho):** cuerpo ≥ 32 px, titulares ≥ 90 px, labels ≥ 24 px. Son valores de primera pasada que hay que calibrar con renders reales [Repo].
**Vertical 1080×1920:** titulares de 90–140 px, cuerpo de 44–60 px y captions de 65–95 px [Repo `embedded-captions` para captions; resto Práctica].
**Escalado:** en 4K, multiplicá por 2; en 720p, por 0,667.

**Otras reglas de tipografía para video:**

- **Tracking** de −0,02 a −0,05 em en tamaños display. La compresión come el detalle [Repo].
- **Contraste de peso extremo:** 300 contra 900, no 400 contra 700 [Repo].
- **Texto claro sobre fondo oscuro:** se ve más pesado. Usá 350 en vez de 400 y sumá 0,05–0,1 al interlineado [Repo].
- **Números:** `font-variant-numeric: tabular-nums` es obligatorio en cifras que cambian o se apilan [Repo].

### 4.4 Contraste

- **Mínimo WCAG:** 4,5:1 para texto normal y 3:1 para texto grande (≥ 24 px regular o ≥ 18,66 px bold) y para gráficos de UI [Oficial WCAG 1.4.3 y 1.4.11]. **En video apuntá a ≥ 7:1 en texto chico**, porque la compresión y las pantallas de celular al sol bajan el contraste efectivo [Práctica].
- **El color pierde, la luminancia gana.** El submuestreo de croma 4:2:0 del H.264 y del H.265 emborrona los bordes de texto fino de color saturado (rojo sobre azul, por ejemplo). El contraste tiene que venir de la **luminancia**, no del tono [Práctica].
- **Degradados:** nada de degradados lineales a pantalla completa sobre fondos oscuros, porque hacen *banding* con H.264. Usá radiales o sólido con glow local [Repo], y agregá 1–2 % de grano para *dithering* [Práctica].
- **Ni negro ni blanco puros:** evitá `#000` y `#fff`. Teñí los neutros hacia el color de acento [Repo]. Un único color de acento por pieza [Repo].
- **Prueba:** sacá todos los decorativos y comprobá que el texto sigue siendo legible [Repo].

### 4.5 Profundidad

- **Tres roles por escena** [Repo]: fondo (glow radial, tipografía fantasma gigante al 3–8 % de opacidad, grilla, grano), contenido (el mensaje) y acentos (divisores, labels, metadatos en monoespaciada).
- **Recursos de profundidad, de más sutil a más fuerte:**
  1. Superposición y sombra.
  2. Escala (lo cercano es más grande).
  3. Atenuación atmosférica (lo lejano tiene menos contraste).
  4. DoF: blur de 4–12 px en planos no focales.
  5. Parallax: fondo al 20–50 % de la velocidad del frente.
  6. 3D real con `perspective` de 1000–1500 px, el mismo en toda la escena [Práctica].
- **Imágenes:** nunca una imagen plana sin tratamiento. Usá una inclinación en perspectiva (`rotationY −8°` con sombra), un Ken Burns de escala 1 → 1,04 a lo largo del beat, un marco de dispositivo o UI flotante con parallax [Repo].

### 4.6 Foco de atención: una idea por pantalla

- **Una idea por pantalla.** Si el guion dice "y además", es otra escena.
- **El ojo va primero a:** caras > texto > movimiento > contraste alto > color saturado [Práctica]. En el momento clave de una escena, **solo una cosa se mueve**.
- **El tiempo es jerarquía.** Lo primero que aparece es lo más importante; en video, la secuencia reemplaza a la posición [Repo].
- **Puntos focales:** mínimo dos por escena, para que el ojo tenga a dónde viajar [Repo]. Máximo tres compitiendo [Práctica].
- **Herramientas de jerarquía:** tamaño (el hero mide 2–3 veces lo secundario), peso, el único acento de color, la posición, el orden temporal y el movimiento.

### 4.7 Dirección de lectura y continuidad direccional

- **Lectura en español (izquierda a derecha):**
  - Moverse hacia la **derecha** = avanzar, el futuro, lo siguiente.
  - Moverse hacia la **izquierda** = volver, el pasado.
  - **Arriba** = crecimiento, éxito. **Abajo** = caída, detalle, profundidad [Práctica].
- **Mapa espacial fijo.** Decidí al inicio de la pieza dónde está "lo siguiente" (por ejemplo, a la derecha) y respetalo siempre: todos los *push* hacia "siguiente" van en la misma dirección [Práctica].
- **Continuidad entre escenas.** Si algo sale por la derecha, en la escena siguiente entra desde la izquierda moviéndose en **la misma dirección**. Es el equivalente gráfico de la regla de 180° del cine. El repo lo formaliza como *cut the curve*: misma dirección, curvas espejo (`power4.in` → `power4.out`), misma distancia y misma duración, con lo que la velocidad coincide en el corte (p. ej., 230 px en 0,3 s ≈ 3070 px/s a ambos lados) [Repo].
- **Eye trace.** El punto focal de la escena nueva tiene que estar cerca de donde estaba el foco de la anterior. Si no, el ojo "salta" y el corte se siente brusco. La "regla de seis" de Walter Murch pone el *eye trace* como criterio de corte, por debajo de la emoción, la historia y el ritmo [Práctica].
- **Una sola cámara.** La misma ventana o canvas continúa entre beats. Revisá cada corte cuadro a cuadro: lo que persiste no puede saltar de lugar [Repo `hyperframes-studio`].

---

## 5. Tipografía cinética

### 5.1 Técnicas y valores

| Técnica | Cómo | Valores por defecto | Cuándo |
|---|---|---|---|
| **Por línea** | Cada línea entra con un leve desplazamiento | y 24–48 px, 400–600 ms `power3.out`, stagger 100–150 ms | Párrafos cortos, listas, titulares de 2–3 líneas |
| **Por palabra** | Cada palabra aparece cuando la voz la dice, o con stagger | 300–400 ms por palabra; stagger 80 ms (conversacional) a 150 ms (documental). El desplazamiento puede **decaer** palabra a palabra (80 → 12 px), como una cámara que se asienta [Repo] | Frases con voz; hooks |
| **Por letra** | Cada letra con stagger | 20–40 ms por letra; total ≤ 500 ms | Títulos cortos, logos, momentos hero. **Nunca** en frases largas |
| **Mask reveal** | El texto sube desde dentro de una máscara (`overflow:hidden` del alto de la línea) | yPercent 100 → 0, 500–700 ms `power4.out` o `expo.out`, stagger por línea de 80–120 ms | El reveal tipográfico más limpio y "caro" |
| **Waterfall** | Las palabras entran desde abajo en cascada; cada una arranca antes de que la anterior se asiente | Palabra ancla: y 60–80 px, 160–200 ms. Normal: 40–50 px, 130–160 ms. Liviana: 30–48 px, 100–130 ms. Solape de 1–2 f, opacidad **binaria** (sin fade) [Repo] | Títulos, aperturas de segmento |
| **Slam** | El texto aterriza desde una escala grande | scale 1,4–2 → 1 con blur de 8–14 px → 0, 150–350 ms `power4.out`. El golpe va sobre el beat [Repo] | Taglines, hooks, momentos de impacto |
| **Escala sutil (settle)** | Entra levemente agrandado y se asienta | scale 1,06–1,1 → 1, opacidad 0 → 1, 500–800 ms | Registro premium o calmo |
| **Blur-in** | De desenfocado a nítido | blur 8–14 px → 0, 300–500 ms | Registro cinematográfico o etéreo |
| **Tracking** | El espaciado se abre o se cierra | letter-spacing 0,3 em → −0,02 em en 1–2 s | Títulos de marca. ⚠️ Animar letter-spacing produce reflow; en captions está prohibido. Preferí transformar letras individuales [Repo] |
| **Peso variable** | Eje `wght` de una fuente variable | 400 → 800 en 300–450 ms | Énfasis de una palabra sin cambiar de fuente |
| **Tipeo (typewriter)** | Carácter a carácter con caret | 8–12 cps natural; 15–20 cps para demos tech y código; 30+ para llenar bloques. Caret: parpadeo `steps(1)` de 0,5–0,8 s por ciclo, sólido mientras tipea [Repo] | Prompts, terminales, código |
| **Swap / token cycle** | Una palabra se reemplaza por otra en el mismo lugar, en corte instantáneo | Hold de 0,6–1,0 s por token | "Para [devs / diseñadores / equipos]" |
| **Marker o highlight** | Subrayado, círculo o barrido de resaltador sobre la palabra clave | Barrido de 300–500 ms `power2.out` desde la izquierda, **después** de que la palabra se lee | Énfasis en explainers |
| **Zoom-through de texto** | El texto saliente escala hacia el espectador y el entrante continúa ese movimiento | Salida: 1 → 1,2, blur 0 → 10 px, 200 ms `power3.in`. Corte. Entrada: 0,75 → 1, blur 10 → 0, 500 ms `expo.out` [Repo] | Cambio de estado o capítulo |

### 5.2 Legibilidad (reglas duras)

1. **El texto se queda quieto mientras se lee.** El movimiento ocurre en la entrada y en la salida. Durante el dwell, como mucho un *jitter* imperceptible (escala ≤ 1,5 %, ≤ 2–3 px) [Repo / Secundaria].
2. **Orden de aparición = orden de lectura.** Nunca hagas aparecer primero la palabra 3. La única excepción es el énfasis deliberado, y nunca dentro de una frase que se está leyendo.
3. **El énfasis escala dentro de la frase** [Repo]: ~70 % del texto plano, ~20 % con un leve realce (color **o** peso, no ambos), ~8 % con énfasis pleno (más grande, más brillante, más tiempo), ~2 % de clímax (el más grande, sostenido 1,5 s, con aire antes y después). Si todo está en negrita, nada está enfatizado.
4. **Nada de cursiva para enfatizar en video**: en movimiento se lee como "torcido". Enfatizá con peso, con un único color de acento o con tamaño (1,3–1,6×) [Repo].
5. **Saltos de línea por sentido**, no por ancho. Nada de viudas (una palabra sola en la última línea).
6. **Una fuente expresiva por escena; la otra acompaña.** No combines dos sans parecidas; cruzá familias (serif + sans o sans + mono) [Repo].
7. **Corte por respiración.** En captions, segmentá en pausas de ≥ 250 ms; una frase no cruza una pausa [Repo].
8. **Romper el ritmo una vez cada ~30 s:** una frase entra desde el lado contrario, una palabra al doble de tamaño, un silencio sin texto [Repo]. Si no, el ojo se acostumbra y deja de registrar.

### 5.3 Errores comunes

- **Todo por letra.** Frases enteras letra por letra: ilegible y lento.
- **Texto que sigue moviéndose** (deriva, rotación, flotación) mientras hay que leerlo.
- **Texto que aparece más rápido o más tarde que la voz**, o que muestra toda la frase antes de que la voz llegue.
- **El mismo efecto en todas las palabras y escenas** (el clásico fade + slide-up de 30 px).
- **Rebote (`back.out`) en cada palabra.** Se ve barato.
- **Blur alto en texto:** más de 10 px en un corte borra las letras y se lee como glitch [Repo].
- **Romper ligaduras o kerning** al partir por letras. Partí con una herramienta que respete los pares (SplitText) o animá por palabra.
- **Tamaños de web** (14–16 px) y pesos finos (< 300) sobre fondo oscuro con compresión.
- **Animar `letter-spacing`, `font-size` o `width`**: causa reflow y saltos de línea durante la animación. Animá transformaciones [Repo].

---

## 6. Transiciones

### 6.1 Regla madre: la transición tiene que significar algo

Una transición le dice al espectador **cómo se relacionan dos escenas** [Repo]. Antes de elegirla, completá la frase: *"La escena B ___ a la escena A"* (continúa, contradice, profundiza, es lo siguiente, transforma, conecta con…). Si no podés completarla, **cortá**.

Reglas de sistema [Repo]:

- **Una transición principal** (60–70 % de los cambios) más **1–2 de acento**. Nunca una distinta en cada escena.
- **La transición más distintiva va en la apertura** (marca el lenguaje); la más audaz, en el clímax; la más simple y lenta, en el cierre.
- **Entre puntos relacionados, la principal:** consistente y de ~300 ms.
- **Para cambiar de tema**, una diferente de la principal, para que el cerebro "resetee".
- **En un brand reel de 5–7 beats**, 1–2 transiciones de shader o espectaculares como mucho (el reveal hero y el CTA). Más que eso aplana su impacto.

### 6.2 Catálogo

| Transición | Qué significa | Duración | Cuándo sí | Cuándo no |
|---|---|---|---|---|
| **Corte (hard cut)** | Continuidad de energía, o "despertá". Es invisible si hay continuidad | 0 f | Listas al beat, secuencias rápidas (3+ cambios), comedia, cuando 0,3–0,8 s de transición sería lento [Repo] | Entre dos layouts muy distintos sin relación (se siente como un salto) |
| **Smash cut** | Contraste brutal | 0 f | Problema → solución; calma → caos | Contenidos sin contraste real |
| **Cross dissolve** | "Esto continúa", paso del tiempo, suavidad | 300–800 ms (calmo, 500–800) | Cierres, momentos emocionales, conectar dos imágenes | Como default para todo: es el sello del slideshow [Repo] |
| **Blur crossfade / focus pull** | "Dejate llevar", sueño, premium | 500–800 ms; blur 20–30 px (calmo) o 8–15 px (medio) | Marca, lujo, bienestar | Contenido técnico denso |
| **Dip to black / white** | Fin de capítulo (negro); flash de energía (blanco) | 500–1000 ms | Separar actos; el cierre | Repetido: el flash blanco además cuenta como destello para WCAG |
| **Push / slide** | "Lo siguiente", avanzar en una secuencia | 300–500 ms `power3.inOut`, o salida `power3.in` + entrada `power3.out` | Pasos de un proceso, features en serie, carrusel | Si la dirección no es consistente con el mapa espacial |
| **Wipe** (lineal, radial, reloj, persianas) | Cambio de tema; mecánico, editorial o retro | 300–600 ms | Cambiar de sección; estética editorial | Abusado se ve PowerPoint 2003 |
| **Match cut** | "Esto se conecta con aquello" (forma, color o movimiento compartidos) | 0 f (corte) o morph corto | Unir dos ideas: el círculo del logo se convierte en el planeta | Si no se planificó en boards: improvisado no funciona |
| **Morph / container transform** | "Es lo mismo, transformado": la identidad del objeto persiste | 400–800 ms `move` | Un botón que se convierte en pantalla, una tarjeta que se expande, un dato que cambia de forma | Entre objetos sin relación |
| **Zoom-through** | "Entramos más profundo" o "avanzamos a través" | Total 500–700 ms: salida 200 ms `power3.in` (scale 1 → 1,2, blur 10 px en texto o 20 px a pantalla completa) + entrada 500 ms `expo.out` (0,75 → 1) [Repo] | Cambio de estado: hook → contexto, de capítulo a capítulo | Muchas veces seguidas (mareo, ver §11) |
| **Inverse zoom-through** | "Llegamos": un payoff o un cierre | Igual, invertido: 1 → 0,8 y entrada desde 1,25 [Repo] | La línea de remate, el resultado | — |
| **Mask / shape transition** (iris, forma de marca, texto como máscara) | Revelación; firma de marca | 400–800 ms | Un reveal hero; transiciones con la forma del logo | Formas con geometría repetitiva (grillas de tiles): se ven baratas [Repo] |
| **Whip pan** | Energía; "mientras tanto"; desplazamiento lateral en un espacio continuo | 200–400 ms: salida x −400 px, blur 24 px, 300 ms `power3.in` → entrada x 400 → 0, 300 ms `power3.out` [Repo] | Montajes enérgicos, cambiar de "estación" en un espacio | Contenido calmo; más de 2 por minuto |
| **Velocity-matched cut / cut the curve** | Una sola cámara continua | Salida 200–400 ms, entrada ≥ salida, recorrido parcial (~230 px) más fade [Repo] | **Default del repo entre escenas** de explainers tech | — |
| **Glitch / RGB split / VHS** | Inestabilidad, error, hackeo | 150–500 ms | Para hablar de un bug, de seguridad o de un fallo | Como decoración tech genérica |
| **Light leak / film burn** | Calidez, analógico, nostalgia | 500–800 ms | Marca cálida o retro | Explainers de producto |

### 6.3 Reglas técnicas de buena transición

- **La transición es la salida.** Las escenas salientes están **completas y visibles** cuando arranca la transición; no hay fade-out previo, porque eso es un corte con un bache en el medio [Repo].
- **Ajustá la velocidad.** La salida acelera (`.in`) y la entrada desacelera (`.out`). La velocidad máxima de ambas coincide en el corte, con ±5 % de tolerancia [Repo].
- **Blur proporcional al sujeto:** ≤ 10 px en texto y 18–20 px en superficies de pantalla completa. Mismo valor a ambos lados del corte, aplicado al contenedor y no a cada hijo [Repo].
- **Nada de "aire muerto":** el último elemento que se desvanece muere justo en el corte, a ~0,02 s [Repo].

---

## 7. Sistemas de motion de marca (motion branding)

### 7.1 Definir la "personalidad de movimiento"

Un sistema de motion traduce adjetivos de marca a **números**. El proceso de estudio [Práctica]:

1. **Elegí 3 adjetivos de marca** y su **contrario prohibido**. Por ejemplo: "preciso, no rígido"; "rápido, no nervioso"; "cálido, no infantil".
2. **Ubicá la marca en cuatro ejes** (de 1 a 5):
   - Velocidad: pausada ↔ veloz.
   - Física: mecánica ↔ orgánica.
   - Elasticidad: firme (sin overshoot) ↔ elástica.
   - Densidad: minimal ↔ coreográfica.
3. **Traducí cada eje a tokens:** multiplicador de duración, familias de curva, ζ mínimo de los springs, distancias, stagger y transiciones permitidas.
4. **Definí 1–2 movimientos firma** (*signature moves*), que son el equivalente motion del logo. Por ejemplo, "las cosas entran desde una máscara vertical" o "todo nace de un punto que se expande".
5. **Escribí do / don't con ejemplos en video**, no solo texto.
6. **Validá con tres piezas de prueba** (un lower third, una transición y un reveal de dato) antes de liberar el sistema.

**El modelo productivo vs expresivo (IBM Carbon)** es el más útil para marcas tech [Oficial]:

- **Productivo:** eficiente, rápido, sin distraer. Es la mayoría del movimiento: UI, tutoriales, pasos.
- **Expresivo:** enfático y memorable. Se reserva para **momentos significativos**: aperturas, reveals, hitos.

Material 3 Expressive hace algo análogo con sus esquemas *standard* (más amortiguado, mínimo rebote) y *expressive* (el recomendado por defecto en M3E) [Secundaria].

| Token del sistema | Productivo (tutorial, demo, B2B, devtools) | Expresivo (lanzamiento, marca, hook) |
|---|---|---|
| Multiplicador de duración | ×0,8 | ×1,25 |
| Curva de entrada | `power3.out` / Carbon productive entrance `(0, 0, 0.38, 0.9)` | `expo.out` / M3 emphasized decelerate `(0.05, 0.7, 0.1, 1)` / Carbon expressive `(0, 0, 0.3, 1)` |
| Curva de salida | `power2.in` / Carbon productive exit `(0.2, 0, 1, 0.9)` | `power3.in` / M3 emphasized accelerate `(0.3, 0, 0.8, 0.15)` |
| Spring | ζ = 1 (sin overshoot) | ζ ≥ 0,8 (≤ 1,5 %) en elementos no-dato |
| Distancias | 16–40 px | 60–200 px, parciales con fade |
| Stagger | 40–60 ms | 80–150 ms |
| Transiciones | Corte, cut the curve, push, crossfade | Zoom-through, mask de marca, match cut, morph |
| Ambiente en holds | Quietud o jitter mínimo | Un glow o una deriva acotados |
| Proporción en una pieza tech | 70–80 % del tiempo | 20–30 % (los momentos que se recuerdan) |

### 7.2 Motion tokens

Los tokens son las variables con nombre que el equipo y la IA usan en lugar de números sueltos:

- **Duración:** `duration.micro`, `duration.base`, `duration.hero`…
- **Curva:** `ease.enter`, `ease.exit`, `ease.move`, `ease.ambient`…
- **Spring:** `spring.settle`, `spring.alive`…
- **Distancia:** `distance.sm`, `distance.md`…
- **Stagger:** `stagger.tight`, `stagger.default`…
- **Hold:** `hold.text.min`, `hold.final`…
- **Lectura:** `reading.wps`, `captions.cps`…

Los valores por defecto del equipo están en `04-motion-tokens-default.json`.

**Reglas de uso de tokens:**

- **Nombres semánticos, no literales:** `ease.enter`, no `ease.power3`. Así, cambiar la marca cambia un solo archivo.
- **La IA recibe el JSON en el prompt** y tiene prohibido inventar números fuera de él sin justificarlo.
- **Duraciones en una escala modular** (100, 150, 250, 400, 600, 800, 1200, 2000) para que las relaciones sean perceptibles.
- **Reduced motion como "modo"** del sistema: el mismo token resuelve a un crossfade de 200 ms cuando el modo está activo [Secundaria, propuesta habitual en sistemas de diseño].

### 7.3 Principios de marca en movimiento (plantilla)

Escribí 4–5 principios con este formato: **nombre, una frase, un do, un don't y su token asociado**. Ejemplo para una marca devtools:

1. **Preciso.** Todo aterriza en la grilla sin rebote. *Do:* `spring.settle` en la llegada de una tarjeta. *Don't:* `back.out` en un número.
2. **Causal.** Nada se mueve sin una causa visible (un clic, la voz, un dato). *Do:* el panel se abre desde el botón que lo origina (`transform-origin` en el botón). *Don't:* elementos que flotan solos.
3. **Continuo.** Una sola cámara: lo que persiste no salta. *Do:* morph y cut the curve. *Don't:* un crossfade entre layouts sin relación.
4. **Legible antes que espectacular.** El hold es sagrado. *Do:* `hold.text.min` con la fórmula de lectura. *Don't:* texto que se va antes de leerse dos veces.

### 7.4 Guía de animación de logo

- **Versiones:**
  - Sting corto de 1–1,5 s (redes y bumpers).
  - Estándar de 3 s.
  - Extendida de 5–6 s (aperturas).
  - **Estática** (para *reduced motion* y miniaturas).
  - Con **alfa** para superponer [Práctica / Repo].
- **Construcción:** la animación revela la lógica del logo (trazo, forma, retícula), no le aplica un efecto genérico. Para SVG, conviene el *draw-on*: segmentos de 0,3–0,8 s, cada uno arrancando al 70–80 % del anterior, `power2.out` o lineal, nunca rebote ("las lapiceras no rebotan") [Repo]. Para logos raster, máscara o escala más glow [Repo].
- **Final:** el lockup termina **exacto** (posición, color y tamaño del manual) y queda quieto ≥ 1–1,5 s. El wordmark entra después del símbolo (≥ fin del trazo + 0,2 s) [Repo].
- **Integridad:**
  - No se deforma, no se rota fuera del manual y no cambia de color fuera de la paleta.
  - Respetá el área de protección y el tamaño mínimo.
  - El glow, si existe, no supera una opacidad pico de 0,45 [Repo].
- **Sonido:** el *sound logo* está sincronizado al frame con el momento de cierre (§8).

### 7.5 Referencias reales de sistemas tech

| Marca o sistema | Qué tomar | Fuente |
|---|---|---|
| **IBM Carbon** | Productivo vs expresivo; curvas de entrada y salida separadas; duraciones de 70 a 700 ms; la duración depende de la distancia y del tamaño | Oficial |
| **Google Material 3 / M3 Expressive** | Curvas *emphasized* (entrada desacelerada larga, 400 ms; salida acelerada corta, 200 ms); tokens de duración; springs *spatial* vs *effects* (los efectos nunca rebotan) | Oficial / Secundaria |
| **Microsoft Fluent 2** | Escala de duraciones de 50–500 ms; familias de curva *decelerate*, *accelerate* y *easy-ease* con niveles max/mid/min; más tiempo para elementos grandes | Oficial / Secundaria |
| **Apple HIG / SwiftUI** | Movimiento con propósito, breve y realista; springs definidos por duración y rebote; respetar Reduce Motion; "Designing Fluid Interfaces" (WWDC18) | Oficial |
| **Atlassian** | Duraciones por tipo de interacción: 50–150 ms para hover y press; 150–400 ms para entrar, salir y mover (dropdown 150, modal 250) | Oficial |

---

## 8. Ritmo y sonido

### 8.1 Edición al beat

| fps | 90 BPM | 100 BPM | 120 BPM | 128 BPM | 150 BPM |
|---|---|---|---|---|---|
| 30 | 20 f | 18 f | **15 f** | 14,06 f | 12 f |
| 60 | 40 f | 36 f | 30 f | 28,1 f | 24 f |
| 24 | 16 f | 14,4 f | 12 f | 11,25 f | 9,6 f |

**Fórmula:** `frames_por_beat = fps × 60 / BPM`. Elegí un BPM que dé un número entero de frames en tu fps (a 30 fps: 90, 100, 120 o 150), o redondeá cada corte al frame más cercano **sin acumular deriva**. Calculá cada corte desde el tiempo absoluto del beat, nunca sumando duraciones redondeadas [Práctica].

**Jerarquía rítmica** [Práctica]:

- **Compás (4 beats):** cambios de escena.
- **Beat:** ítems de una lista y golpes de texto.
- **Medio beat:** secuencias de impacto de 3–6 cortes como máximo.
- **El drop o los acentos fuertes:** el reveal hero.

No cortes en cada beat durante toda la pieza: alterná densidad y aire (el repo lo llama planificar el ritmo, "fast-fast-SLOW-fast-SHADER-hold").

**Rangos de tempo** [Práctica]: explainer o corporativo tech, 90–115 BPM; lanzamiento o hype, 120–140 BPM; marca premium o calma, 70–90 BPM.

**Sincronía de corte.** Cortá **en el beat o 1–2 frames antes**, nunca después. Detectamos antes el audio adelantado que el atrasado: según ITU-R BT.1359, el umbral de detección es de ~45 ms con audio adelantado y de ~125 ms con audio atrasado [Práctica]. Un corte visual 1–2 frames antes del golpe (audio ~33–66 ms "tarde") se percibe en sincronía.

**Patrón de beats compartido.** Todos los golpes de una pieza leen sus tiempos de **un solo arreglo de beats** (`BEATS = [t0, t1, …]`), nunca de offsets afinados a mano que derivan [Repo].

### 8.2 Sound design

| Sonido | Duración | Sincronía | Uso |
|---|---|---|---|
| **Whoosh / swish** | 300–800 ms | El pico del whoosh coincide con la **velocidad máxima** del movimiento (el corte en un velocity-matched cut); suele arrancar 6–10 f antes | Transiciones, whip pans, entradas grandes |
| **Hit / impact** | 100–500 ms con cola | **En el frame del aterrizaje** (el frame en que el elemento llega a su posición final) | Slams, el número final, lockups |
| **UI click / tap** | 20–80 ms | En el frame de **contacto**: cuando el botón llega a su escala mínima | Demos de UI, cursores |
| **Tick / blip** | 20–60 ms | Por paso (ítem que aparece, dígito que cambia en conteos lentos) | Listas, contadores, tipeo (sonido de tecla, 1 por carácter, con variación) |
| **Riser** | 1–4 compases | Termina **exacto** en el reveal | Antes del momento hero |
| **Sub drop / boom** | 0,5–2 s | En el reveal o el logo | Lockups, momentos de peso |
| **Sound logo** | 1–3 s | Cierre del logo al frame | Final de marca |

[Práctica para toda la tabla.]

**Reglas de sonido:**

- **No todo movimiento lleva sonido.** Como orientación, ≤ 1 acento de SFX cada 1–2 s en un explainer. Los micro-movimientos (ambiente, jitter) **nunca** suenan [Práctica].
- **El sonido sigue al peso:** un elemento grande y lento suena grave y largo; uno chico y rápido, agudo y corto [Práctica].
- **Capas:** voz (prioridad) > SFX > música. Durante la voz, la música va 12–20 dB por debajo de la voz, o con un *ducking/carve* que la baje solo en la banda de frecuencias de la voz [Práctica; `hyperframes-audio` implementa el carve].
- **Loudness de entrega:** web y YouTube ~−14 LUFS integrados; broadcast EBU R128 −23 LUFS (ATSC A/85 −24 LKFS en EE. UU.); true peak ≤ −1 dBTP [Práctica].
- **Audio reactivo:** el audio aporta timing e intensidad; el vocabulario visual sale del contenido. **Nunca** uses ecualizadores de barras, espectros, notas musicales, partículas genéricas ni estrobos blancos en cada beat. Sobre texto, la variación es de 3–6 % de escala como mucho; en fondos y formas, 10–30 % [Repo].

### 8.3 Relación audio-movimiento

- **El movimiento "dice" lo que el sonido "dice".** Un ataque rápido de audio pide un ataque visual rápido (`power4.out` o `expo.out`); un pad lento pide `sine.inOut`.
- **Silencio = quietud.** Un silencio de la voz de 1,5 s o más no se rellena con texto ni con movimiento: dejalo respirar [Repo].
- **Los picos de energía del sonido y de la imagen coinciden** en el clímax. No pongas el pico visual en un valle del audio.

---

## 9. Visualización de datos en movimiento (sin mentir)

### 9.1 Principios

1. **Un gráfico, un mensaje.** El titular del gráfico **es** la conclusión ("Latencia −62 %"), no la descripción ("Latencia por versión") [Repo `charts`].
2. **La animación revela, no inventa.** La animación no puede sugerir una tendencia que no existe: nada de rebotes, overshoot en barras ni arcos en trayectorias de datos [Repo / Práctica].
3. **Transiciones por etapas.** Primero cambian los ejes y la escala; después se mueven las marcas; después aparecen los labels. Una cosa a la vez, ~1 s por transición. Las transiciones animadas bien diseñadas **mejoran** la percepción; las que violan la semántica de los datos inducen a error [Oficial, Heer & Robertson 2007].
4. **Continuidad visual.** Cifras sucesivas del mismo concepto (Q1 → Q4) viven en el mismo espacio y con la misma estética; solo cambia el valor. Un cambio de estética tiene que significar un concepto nuevo [Repo].
5. **Cada número va acompañado de una forma** (barra, anillo, relleno) que le dé peso visual [Repo].

### 9.2 Reglas de honestidad

| Regla | Detalle |
|---|---|
| **Barras desde cero** | La línea base está en 0. Las barras crecen desde la base (`transform-origin: bottom`), nunca desde el centro [Repo]. Si truncás un eje (en líneas, no en barras), marcalo explícitamente con un corte visible [Práctica]. |
| **Escala constante entre escenas comparables** | Si la escena 2 compara con la escena 1, misma escala. No re-escales en silencio para que un cambio "parezca más grande". Si la escala cambia, animá el eje **primero** y a la vista [Oficial, Heer & Robertson / Práctica]. |
| **Áreas y círculos** | Si el valor está codificado en un área, escalá el **radio por √valor**. Escalar el radio linealmente exagera de forma cuadrática [Práctica]. |
| **Conteos honestos** | El conteo termina en el valor exacto, con `Math.round` (no `floor`), sin overshoot y con desaceleración (`power2/3.out`), en 1,2–2,5 s. El sufijo (%, ×, +) entra **después**; el label, **antes** del pico del conteo [Repo]. |
| **Tabular nums** | `tabular-nums` y un contenedor de ancho fijo: sin eso, los dígitos "bailan" al pasar de 9 a 10 a 100 [Repo]. |
| **Orden temporal** | Las líneas se dibujan de izquierda a derecha en el sentido del tiempo, a velocidad constante (lineal o `power1.inOut`), para no falsear la pendiente. Usá un dibujo constante si la velocidad del trazo podría leerse como un dato [Práctica]. |
| **Resaltá sin distorsionar** | Para destacar una barra: color de acento en ella y gris al 30–40 % en el resto. **No** la agrandes ni la muevas fuera del eje [Práctica / Repo]. |
| **Unidades y fuente en pantalla** | La unidad visible junto a la cifra, y la fuente de los datos en un label pequeño, legible y quieto [Práctica]. |
| **Sin 3D, sin tortas, sin doble eje** | Las tortas son difíciles de comparar y parecen PowerPoint. El doble eje no se puede estudiar en 3 s. Los dashboards de 6 paneles son un patrón web: 2–3 métricas como máximo [Repo]. |
| **Sin ruido** | En motion, sin grillas, ticks ni leyendas, salvo cuando la magnitud **es** el mensaje (en ese caso, ejes tenues) [Repo]. |
| **Hold de lectura** | Valor final quieto ≥ 0,8 s (1,5–3 s si hay conclusión) [Repo]. |

### 9.3 Coreografía de un dato (receta por defecto)

Para una escena de 6 s [Práctica, sobre las reglas del repo]:

1. **Contexto (0–0,6 s):** entra el titular-conclusión.
2. **Estructura (0,6–1,2 s):** se dibuja la línea base o los ejes tenues.
3. **Datos (1,2–2,7 s):** las barras crecen con stagger de 60–80 ms, o la línea se dibuja.
4. **Énfasis (2,7–3,5 s):** se apaga el resto y la barra clave queda en acento; el conteo del valor clave termina en sincronía con su barra.
5. **Lectura (3,5–6 s):** hold quieto.

Para recorrer un gráfico ya dibujado con un cursor o un *playhead*: 10–40 puntos de datos, 1,5–3 s, `power1.inOut`, y nunca `back` [Repo `chart-scrub-readout`].

---

## 10. Contenido tech específico

### 10.1 Código

| Decisión | Recomendación |
|---|---|
| **Tamaño** | Monoespaciada de 28–40 px a 1080p; ≤ 12–15 líneas visibles y ≤ ~60 caracteres por línea. Si el bloque es más largo, recortalo o usá scroll con cámara [Práctica / Repo]. |
| **Fuente** | Mono con ligaduras desactivadas (`font-variant-ligatures: none`) [Repo]. Candidatas: JetBrains Mono, IBM Plex Mono, Source Code Pro, Space Mono [Repo]. |
| **Reveal por línea** | Cada línea entra en 250–350 ms con stagger de 80–150 ms, en orden de lectura. Para bloques nuevos ("lo que agregamos"), tipeo a 15–20 cps [Repo]. |
| **Que entre en la duración** | caracteres × tiempo por carácter + asentamiento ≤ duración del plano. Si no entra, **acortá el snippet**, no aceleres a velocidades ilegibles [Repo]. |
| **Highlight** | Una banda barre la línea clave en 300–500 ms; el resto baja al 30–40 % de opacidad. Una línea a la vez [Repo `code-highlight`]. |
| **Diff** | Las líneas eliminadas colapsan en rojo y las agregadas se expanden en verde, con stagger [Repo `code-diff`]. Para refactors, *morph*: los tokens compartidos se deslizan (FLIP), los que se van hacen fade-out y los nuevos, fade-in [Repo `code-morph`]. |
| **Zoom a una línea** | Cámara de 1,5–2× en 1,0–2,0 s, hold ≥ 1,5 s [Repo]. |
| **Mostrar el comportamiento, no solo el código** | Un video que es todo código se siente plano. **Alterná** el código con beats de **mecanismo**: un diagrama animado de lo que el código hace (reintentos con backoff, caché frío vs caliente, serie → paralelo, carrera de rendimiento) [Repo `pr-to-video`]. |
| **Sintaxis** | Un tema consistente; la paleta del tema no compite con el acento de marca. Reservá el acento para lo que cambió. |

### 10.2 Terminales

- **Tipeo del comando:** 15–20 cps con un caret sólido mientras se tipea; parpadeo `steps(1)` de 0,5–0,8 s por ciclo en las pausas. Pausas de "pensar" de 0,3–0,6 s [Repo].
- **La salida aparece como en una terminal real:** por bloques o líneas instantáneas (30–80 ms por línea), **no** tipeada letra por letra [Práctica]. Los spinners y las barras de progreso, a ritmo creíble.
- **Typos y backspace solo si cuentan algo.** Usá estados discretos, saltos instantáneos y un `min-width` para que el borde no tiemble [Repo].
- **Si la línea es larga,** la cámara sigue al cursor: encuadre fijo hasta que el cursor pasa ~50–75 % del ancho, después tracking de 0,8–2,0 s `power2/3.inOut` [Repo].
- **El prompt** (`$`, `❯`) y los colores de la terminal son coherentes con la marca, o claramente "de sistema" si se quiere realismo.

### 10.3 Diagramas de arquitectura y flujos de datos

- **Orden de construcción:**
  1. Nodos: pop con `spring.settle` y stagger de 60–100 ms, en orden de flujo.
  2. Conexiones: trazos que se dibujan en 300–600 ms del origen al destino.
  3. Flujo: paquetes o puntos que viajan por las conexiones, o un `stroke-dashoffset` en movimiento.
  4. Estado final con **un** acento en el camino activo [Práctica / Repo].
- **Cada línea conecta algo real.** Todo conector tiene un nodo de origen y uno de destino, y cumple una función: revelar, enrutar, validar o enfatizar. Una línea que decora espacio vacío se corta [Repo].
- **Densidad:** 5–7 nodos por pantalla como máximo. Si hay más, agrupá y hacé zoom por región.
- **Dirección del flujo** de izquierda a derecha o de arriba hacia abajo, consistente con el mapa espacial de la pieza.
- **Velocidad del flujo:** paquetes a velocidad constante (lineal); el tiempo de recorrido de un paquete, 0,6–1,5 s por tramo. En comparaciones (rápido vs lento), la **diferencia de velocidad es el dato**: tiene que ser proporcional a la realidad [Práctica].
- **Camino activo vs inactivo:** el activo en acento y al 100 %; el inactivo, neutro al 30–50 %.

### 10.4 UI y grabaciones de pantalla (estilo Screen Studio)

Screen Studio y similares hacen automáticamente lo que antes era manual: zooms al punto de interacción a partir de los clics registrados, cursor suavizado, motion blur en movimientos rápidos y ripple en los clics [Secundaria]. Valores para replicarlo o dirigirlo [Práctica / Repo]:

| Parámetro | Valor |
|---|---|
| Grabación | 60 fps, a 2× la resolución de salida (retina) si vas a hacer zoom de hasta 2×. El zoom sobre raster exige una resolución de origen ≥ tamaño renderizado × factor de zoom [Repo] |
| Factor de zoom | 1,3–1,6× de contexto; 1,6–2,0× típico; ≥ 2,5× solo para un detalle puntual [Repo] |
| Duración del zoom | 1,0–2,0 s con curva de cámara (in-out); el objetivo ocupa ≤ ~88 % del cuadro en el pico [Repo] |
| Cuándo hacer zoom | Después de que el layout se ve y se escaneó (+0,5–1,5 s) [Repo] |
| Mínimo entre cambios de zoom | 2–3 s. Más seguido, marea |
| Cursor | Agrandado 1,5–2×, trayectorias suavizadas en arco, velocidad con ease-in-out; llega al objetivo 200–400 ms antes del clic |
| Clic | Cursor y botón se comprimen juntos (escala 0,9–0,95) y un ripple de 300–500 ms con envolvente ataque-decaimiento [Repo] |
| Tipeo en formularios | 15–20 cps, o pegado instantáneo si el texto es largo |
| Scroll | Velocidad constante o `power2.inOut`; nunca scroll mientras hay texto que leer |
| Fondo | La ventana sobre fondo de marca, con sombra y radio; padding de 5–8 % del cuadro |
| Recortes | Cortá tiempos muertos (cargas, esperas) o acelerá a 2–4× con indicación visual |
| Producto real | Nunca aproximes la UI del producto que se lanza: usá la grabación real y, mientras llega, un placeholder etiquetado [Repo `hyperframes-studio`] |

### 10.5 Comparaciones (antes/después, A vs B)

- **Pantalla dividida** con el **mismo layout, la misma escala y el mismo timing** a ambos lados; la única diferencia es la variable comparada [Práctica].
- **Wipe antes/después** con un divisor vertical que barre en 1,0–1,5 s y se detiene en el punto de interés.
- **Tarjetas enfrentadas** con inclinación opuesta (±rotationY) que entran desde sus lados [Repo `split-tilt-cards`].
- **Carreras de rendimiento:** las dos barras o líneas arrancan juntas; la ganadora termina primero, y su ventaja de tiempo en pantalla es **proporcional** a la real.
- **Orden:** primero A (el problema) y después B (la solución). En el hold final, B en acento y A en neutro.

---

## 11. Accesibilidad

### 11.1 Destellos: WCAG 2.3.1 (nivel A, obligatorio)

- **Regla:** nada destella **más de 3 veces en cualquier segundo**, salvo que los destellos estén por debajo de los umbrales de *destello general* y de *destello rojo* [Oficial].
- **Destello general:** un par de cambios opuestos de luminancia relativa de **≥ 10 %** de la luminancia máxima, cuando la imagen más oscura tiene una luminancia relativa **< 0,80** [Oficial / Secundaria: algunas fuentes citan 25 %; usá el criterio más estricto].
- **Destello rojo:** cualquier par de transiciones opuestas que involucre **rojo saturado**. Evitá rojo saturado parpadeante en cualquier tamaño [Oficial].
- **Área:** los destellos simultáneos no pueden ocupar más del **25 % de cualquier campo visual de 10°** (0,006 estereorradianes). En la pantalla de referencia de 1024×768, ese campo es un bloque de ~341×256 px [Oficial / Secundaria].
- **Traducción práctica** [cálculo propio]: el campo de 10° equivale a ~1/3 × 1/3 del cuadro, así que el 25 % es ~2,8 % del área del cuadro. En 1080p, **cualquier destello mayor que ~240×240 px cuenta** para el límite de 3 por segundo.
- **WCAG 2.3.2 (AAA):** ningún destello más de 3 veces por segundo, sin excepción por tamaño [Oficial].
- **Política del equipo** [Práctica]:
  - ≤ 2 destellos por segundo (margen de seguridad).
  - Nunca flashes a blanco de pantalla completa en serie.
  - Glitch y estrobo solo en áreas chicas y en ráfagas de < 0,5 s.
  - Para broadcast, pasá el **Harding test (FPA)** o una herramienta equivalente antes de entregar.
- **Sobre el beat:** un flash blanco en cada beat a 120 BPM son 2 destellos por segundo, al límite. A 150 BPM o más, **incumple**.

### 11.2 Reduced motion y trastornos vestibulares

- **WCAG 2.3.3 (AAA):** el movimiento disparado por interacción tiene que poder desactivarse, salvo que sea esencial. En web se implementa con `prefers-reduced-motion` o con un toggle [Oficial]. **WCAG 2.2.2 (A):** el contenido que se mueve solo durante más de 5 s, en paralelo con otro contenido, tiene que poder pausarse, detenerse u ocultarse [Oficial].
- **Apple:** con Reduce Motion activado, minimizá o eliminá animaciones y reemplazá los deslizamientos y rebotes por crossfades. El movimiento nunca es el único canal de información. Las oscilaciones grandes cerca de 0,2 Hz son problemáticas [Oficial / Secundaria].
- **Disparadores vestibulares que se limitan en video** [Práctica]:
  - Zoom o escala de áreas grandes.
  - Rotaciones y espirales (vortex).
  - Movimiento en varios ejes a la vez.
  - Parallax fuerte.
  - Movimiento en la periferia mientras se lee en el centro.
  - Zoom-throughs encadenados.
  - Cámara "flotante" constante.
- **Para piezas embebidas en web o producto** (HTML/GSAP en vivo): implementá `prefers-reduced-motion`. Las traslaciones, escalas y zooms pasan a ser crossfades de 150–250 ms; sin parallax ni cámara ni loops; los holds se mantienen.
- **Para videos renderizados** (MP4), que no se pueden adaptar: diseñá **dentro de límites seguros** (tabla siguiente) y, en piezas largas o institucionales, entregá una **versión "calma"** alternativa.

| Elemento | Límite recomendado en video [Práctica] |
|---|---|
| Zoom-through / zoom de cámara | ≤ 1 cada 5 s; ≤ 2× |
| Rotación de cuadro completo | Evitar; ≤ 15° si es imprescindible |
| Parallax | Capas a ≤ 2 velocidades distintas; desplazamiento del fondo ≤ 5 % del ancho |
| Shake de pantalla | ≤ 3 oscilaciones de ≤ 10 px |
| Loops ambientales | Amplitud de escala ≤ 1,5 %, ≤ 3 px [Repo] |

### 11.3 Subtítulos y captions

| Parámetro | Valor | Fuente |
|---|---|---|
| Captions en video pregrabado | Obligatorios (WCAG 1.2.2, nivel A). En social, el video arranca en silencio: subtítulos quemados siempre | Oficial / Práctica |
| Caracteres por línea | ≤ 42 (Netflix, alfabeto latino); 37 en broadcast BBC / 68 % del ancho online; ~32 en estilo DCMP; en 9:16, líneas más cortas (~25–32) | Secundaria / Práctica |
| Líneas | Máximo 2 (en vertical se aceptan 3 cortas) | Secundaria |
| Velocidad (CPS) | Español adultos ≤ 17 cps; infantil ≤ 13 cps (Netflix). BBC: 160–180 ppm | Secundaria |
| Duración por subtítulo | Mínimo 5/6 s (~0,83 s) y máximo 7 s | Secundaria |
| Separación entre subtítulos | ≥ 2 frames | Práctica |
| Tamaño | Altura de mayúsculas ≈ 3,5–5 % del alto de cuadro: 40–55 px en 1080p horizontal; 65–95 px en 1920 vertical. El tamaño de *hook* (7–9 %) solo para remates | Repo |
| Contraste | ≥ 4,5:1 contra el **peor** fondo de la zona. Orden de recursos: trazo oscuro de 2–3 px con sombra suave → barra semiopaca angosta → atenuar el fondo 10–15 % local → caja sólida (último recurso) | Oficial (umbral) / Repo (recursos) |
| Posición | Dentro del title safe; en 9:16, por encima de la UI inferior (y ≈ 1050–1250). Nunca sobre caras ni sobre el dato protagonista | Repo / Práctica |
| Animación de captions | Solo transformaciones y opacidad (`translateY`, `scale`, `opacity`, `clip-path`); nunca `letter-spacing`, `blur` ni `font-weight`, que producen reflow [Repo]. Palabra resaltada con **un** color de acento | Repo |
| Edición | Segmentá en pausas de ≥ 250 ms; sacá muletillas y autocorrecciones (en captions estéticos; en captions de accesibilidad, transcribí con fidelidad e incluí sonidos relevantes) | Repo / Práctica |

---

## 12. Anti-slop: cómo se ve el motion genérico de IA y cómo corregirlo

### 12.1 El "look IA" (diagnóstico)

| Síntoma | Por qué pasa | Dirección concreta para corregir |
|---|---|---|
| **Todo entra con fade + slide-up de 30 px** | Es el default estadístico (`y: 30, opacity: 0`) | Variá el eje y el tipo por jerarquía: el hero por máscara (yPercent 100 → 0, 600 ms `expo.out`), los datos por escala desde la base, los labels solo con opacidad, los acentos con `scaleX` 0 → 1. Al menos 3 direcciones y curvas distintas por escena [Repo] |
| **Todo dura 400–500 ms con `power2.out`** | Default de librería | Aplicá la escala de tokens: micro 150, entrada 350–500, hero 800, cámara 1400. Como máximo 2 tweens con la misma curva por escena; escena más lenta = 3 veces la más rápida [Repo] |
| **Todo se mueve a la vez** | No hay jerarquía temporal | Stagger por importancia (60–80 ms) y overlap; en el momento clave, solo se mueve una cosa |
| **Todo aparece en el primer 25 % y después se congela** | La IA construye el layout "de una" | Revelá cada pieza cuando la voz la nombra, en la segunda mitad de la escena [Repo] |
| **Sin holds; el texto se va antes de leerse** | La IA optimiza "dinamismo" | Aplicá la fórmula de hold (§3.7) y la prueba de leer dos veces |
| **Rebote (`back.out`, `elastic`) en todo** | La IA lo confunde con énfasis | `power3.out` o `spring.settle`; el overshoot queda prohibido salvo en una marca explícitamente lúdica. Es el "turn-off" número 1 en videos hechos por agentes [Repo] |
| **"Respiración" en loop de tarjetas y textos; paneos o pushes lentos en la segunda mitad** | Aliveness barato | "Mejor nada que movimiento malo": quietud, con jitter mínimo (≤ 1,5 %, 2–3 px) como única vida [Repo] |
| **Glow excesivo, neón, bloom en todo** | Asociación "tech = neón" | Un glow como máximo por escena, detrás del hero, con opacidad pico ≤ 0,45 (por defecto 0,15–0,30). Un glow que notás conscientemente es demasiado fuerte [Repo] |
| **Gradientes violeta → azul, cian sobre oscuro, texto con gradiente** | Cliché de entrenamiento | Paleta declarada (fondo, primer plano y **un** acento) teñida hacia el acento; el gradiente solo si es de marca. Nada de `#000`/`#fff` puros [Repo] |
| **Partículas, orbes y rayos sin sentido** | Relleno decorativo | Todo decorativo tiene que nombrar su función. Cada línea conecta dos elementos reales. Partículas solo como puntuación (≤ 40, en un solo evento) [Repo] |
| **Grillas de tarjetas idénticas y todo centrado** | Patrón web | Layout por zonas y anclado a bordes; un elemento claramente dominante [Repo] |
| **Tipografía web** (Inter, Roboto, Poppins…) **a tamaño web** | Monocultura | Tipografía con intención (§5) a tamaños de video (§4.3) [Repo: lista de fuentes "baneadas" por sobreuso] |
| **Una transición distinta en cada escena**, o crossfade en todas | Sin sistema | Una principal más 1–2 de acento con significado (§6) |
| **Salidas animadas antes de cada transición** | Mala comprensión del corte | La transición es la salida [Repo] |
| **Ambient zoom en todas las escenas** | Fórmula | Movimiento ambiental distinto por escena, o ninguno. La quietud después del movimiento es poderosa [Repo] |
| **Arranque en t = 0** | Default | Primera animación a 100–300 ms [Repo] |
| **Equalizadores, espectros, estrobos en el beat** | Audio reactivo literal | El audio modula algo del contenido; nunca visualizadores genéricos [Repo] |
| **Fondo negro vacío o decoración al 3–5 %** | Diseño web | 3 capas; opacidad decorativa del 12–25 %; nada de negro "sin cargar" [Repo] |
| **Gráficos de librería** (Chart.js) con grillas y leyendas | Atajo | SVG o CSS animado a medida, sin ruido, con un mensaje [Repo] |

### 12.2 Traducción de feedback vago a dirección concreta

| Lo que dice el cliente o el director | Lo que se le pide a la IA |
|---|---|
| "Se siente lento" | Bajá las duraciones un 20–30 %, cambiá a `expo.out` en las entradas, solapá el stagger (arrancá el siguiente al 50 % del anterior) y acortá las transiciones a 250 ms. **No** acortes los holds de lectura |
| "Se siente apurado / no llego a leer" | Aplicá la fórmula de hold y sumá +20 %; quitá palabras (máximo 7 por línea); separá en dos escenas |
| "Se ve barato" | Sacá el rebote, bajá el glow a ≤ 0,3, eliminá las partículas y los decorativos sin función, unificá a un acento, subí los tamaños, curvas `power3/expo` |
| "Se ve genérico / de IA" | Aplicá §12.1: variá entradas y curvas, sumá un movimiento firma de marca, layout por zonas, tipografía con intención |
| "Es aburrido" | Más contraste de ritmo (fast-fast-SLOW), un momento expresivo por cada 20–30 s, un corte al beat, sincronía real con la voz, una ruptura de ritmo cada 30 s |
| "Marea / es mucho" | Menos movimientos de cámara (≤ 1 cada 5 s), sin parallax, sin rotaciones; solo una cosa se mueve a la vez |
| "No se entiende qué mirar" | Staging: un foco por momento, el resto atenuado al 30–40 %, el hero a 60–80 % del ancho, el orden de aparición igual al orden de importancia |
| "No pega con la música" | Recalculá todos los tiempos desde `BEATS[]`; cortes en el beat o 1–2 f antes; acentos visuales en los acentos del audio |

### 12.3 Checklist de crítica del director (28 puntos)

Revisá el render completo una vez **sin pausa** (la sensación) y después con **contact sheet y scrub cuadro a cuadro** (la técnica). Cada punto es pasa/no pasa.

**A. Mensaje y estructura**

1. ☐ **Una idea por pantalla.** Puedo resumir cada escena en una frase de ≤ 8 palabras.
2. ☐ **Hook en ≤ 3 s.** Los primeros 3 s generan tensión o curiosidad; nada de "Bienvenidos a…" [Repo].
3. ☐ **Ritmo con contraste.** Hay momentos rápidos y lentos (la escena más lenta es ~3 veces la más rápida) y el clímax está donde la voz pone el énfasis.
4. ☐ **Build / breathe / resolve.** Cada escena tiene entrada escalonada, respiración y cierre; nada se vuelca en el primer 25 % para congelarse después.

**B. Timing y lectura**

5. ☐ **Holds suficientes.** Cada texto supera la fórmula `máx(1,5 s; 0,8 s + 0,35 s × palabras; caracteres/15)` y pasa la prueba de leerlo dos veces en voz alta.
6. ☐ **El texto está quieto mientras se lee** (sin deriva, rotación ni respiración).
7. ☐ **Duraciones dentro de rango:** micro 100–200 ms; entradas 300–600 ms; hero 600–1000 ms; zoom 1–2 s; conteo 1,2–2,5 s.
8. ☐ **La primera animación arranca a 100–300 ms**, no en t = 0, y el hero es visible a ≤ 0,5 s.
9. ☐ **Holds después de los momentos clave:** zoom ≥ 1 s, conteo ≥ 1 s y lockup final ≥ 1–2 s.

**C. Easing y física**

10. ☐ **Entradas con `.out`, salidas con `.in` y movimientos internos con `.inOut`.** Ninguna invertida.
11. ☐ **Salidas al 60–75 % de la entrada** y solo donde corresponde (la última escena o dentro de una escena).
12. ☐ **Sin rebote**, salvo registro lúdico aprobado; nunca en datos, opacidad ni logos.
13. ☐ **Variedad de curvas:** ≥ 3 caracteres de easing en la pieza y ≤ 2 tweens con la misma curva por escena.

**D. Coreografía y composición**

14. ☐ **Jerarquía temporal:** el elemento más importante se mueve primero, el stagger va por importancia y el grupo entra en ≤ 500 ms.
15. ☐ **Una sola cosa se mueve en el momento clave;** lo secundario no compite (≤ 30 % de amplitud o contraste).
16. ☐ **Composición de video:** el hero ocupa el 60–80 % del ancho, hay layout por zonas y anclaje a bordes, no es una pila centrada de web, y hay ≥ 2 puntos focales.
17. ☐ **Safe areas respetadas** según la plataforma (title safe 90 % en 16:9; en 9:16, zona 65–930 × 270–1248).
18. ☐ **Tamaños de video:** titulares ≥ 64 px y cuerpo ≥ 28 px en 1080p (feed: ≥ 90 / ≥ 32); nada por debajo de 18 px.
19. ☐ **Continuidad direccional:** el mapa espacial es consistente, el *eye trace* se mantiene entre cortes y lo que persiste no salta.

**E. Look**

20. ☐ **Paleta disciplinada:** un acento, neutros teñidos, sin `#000`/`#fff` puros, sin gradiente violeta-azul por default y sin banding.
21. ☐ **Efectos con función:** glow ≤ 0,45, cada partícula o línea tiene un propósito y no hay decoración "porque sí".
22. ☐ **Tipografía con intención:** contraste de peso extremo, ≤ 1 fuente expresiva por escena, tracking ajustado en display y `tabular-nums` en cifras.

**F. Transiciones y sonido**

23. ☐ **Sistema de transiciones:** una principal más 1–2 de acento; cada transición significa algo y la velocidad coincide en los cortes.
24. ☐ **Sincronía audio-imagen:** cortes en el beat o 1–2 f antes; hits en el frame de aterrizaje; whoosh con pico en la velocidad máxima; texto sincronizado con la voz (±100 ms).
25. ☐ **Mezcla:** la voz es inteligible sobre la música (música 12–20 dB debajo), los SFX no saturan (≤ 1 acento cada 1–2 s) y el loudness es el de entrega.

**G. Datos, accesibilidad y técnica**

26. ☐ **Datos honestos:** barras desde 0, escala constante, conteos exactos sin overshoot, unidades y fuente visibles, y una conclusión por gráfico.
27. ☐ **Accesibilidad:** ≤ 3 destellos por segundo (el equipo apunta a ≤ 2), sin rojo saturado parpadeante, subtítulos ≤ 17 cps y ≤ 42 caracteres por línea, contraste ≥ 4,5:1 y movimiento vestibular acotado.
28. ☐ **Integridad técnica del render:**
    - Sin flicker ni saltos al hacer scrub.
    - Sin elementos que nunca aparecen.
    - Sin texto cortado ni desbordado.
    - Fuentes correctas, sin fallback.
    - Duración y fps correctos.
    - Motion blur solo en movimientos rápidos y nunca sobre texto que se está leyendo.

**Criterio de aprobación** [Práctica]: los puntos 5, 6, 12, 17, 26 y 27 son **bloqueantes**. Del resto, un máximo de 3 fallas menores, documentadas como notas para la iteración siguiente.

### 12.4 Plantilla de dirección para la IA (por beat)

Un buen pedido a la IA describe **la experiencia** y después **los números**. El repo lo resume así: "un beat es un mundo, no un layout" [Repo].

```
BEAT 3 · 0:12.0–0:17.5 · "Latencia −62 %"
Concepto: la espera desaparece; lo viejo se siente pesado y lo nuevo, instantáneo.
Foco: el número −62 % (hero, 70 % del ancho, acento).
Capas: BG = grilla tenue con glow radial al 20 %. MG = dos barras comparativas. FG = label de fuente (mono, 20 px).
Coreografía (tokens del JSON):
  0.2 s  titular entra por máscara · duration.moderate · ease.enter-punch
  0.8 s  barras crecen desde la base · stagger.default · ease.enter
  1.6 s  barra "antes" se atenúa al 35 % · duration.base · ease.move
  1.6 s  conteo 0 → −62 % · 1500 ms · ease.enter (sin overshoot), tabular-nums; el "%" entra al terminar
  3.1 s  hold quieto hasta el final del beat (≥ 2.0 s)
Transición de entrada: cut the curve hacia la izquierda (principal del video).
Sonido: tick por cada barra; hit grave en el frame en que termina el conteo.
Prohibido: rebote, glow > 0.3, loops de respiración, salida antes de la transición.
```

---

## 13. Niveles de madurez del equipo

### Junior (meses 0–3): "ver y nombrar"

**Objetivo:** reconocer y nombrar problemas; pedir cambios con vocabulario y números.

- **Glosario completo (§1)** y los 12 principios (§2), con capacidad de señalar ejemplos en un render.
- **Easing básico:** distinguir ease-in, ease-out y lineal a simple vista; saber que se entra con `.out` y se sale con `.in`.
- **Conversión frames ↔ ms** y escala de duraciones (§3.1–3.2).
- **Lectura y holds:** aplicar la fórmula y la prueba de leer dos veces (§3.7).
- **Safe areas y tamaños mínimos** por formato (§4.2–4.3).
- **Una idea por pantalla** y jerarquía básica.
- **Usar el checklist (§12.3)** en cada revisión, aunque no sepa todavía arreglar cada punto.
- **Con la IA:** pedir cambios con tokens del JSON ("hold.text.min", "ease.exit") en lugar de "más lindo".
- **Ejercicios:**
  - Animar el mismo título con 5 curvas distintas y describir la emoción de cada una.
  - Medir los holds de 3 videos de referencia de marcas tech.

### Intermedio (meses 3–12): "coreografiar y sistematizar"

**Objetivo:** diseñar escenas completas y dirigir a la IA beat a beat.

- **Coreografía:** stagger por jerarquía, overlap y follow-through; build / breathe / resolve; reveal sincronizado con la voz.
- **Tipografía cinética (§5):** elegir la técnica según el mensaje; escalar el énfasis dentro de la frase.
- **Transiciones con significado (§6)** y velocity matching; sistema de una principal más acentos.
- **Springs:** cuándo usarlos y cómo leer ζ y overshoot (§3.4).
- **Datos honestos (§9)** y contenido tech (§10): código, terminales, diagramas, screen recordings.
- **Ritmo y sonido (§8):** cortar al beat con `BEATS[]` y sincronizar SFX.
- **Accesibilidad (§11)** aplicada sin que nadie la pida.
- **Con la IA:** escribir boards por beat con la plantilla (§12.4); revisar con contact sheets; detectar los errores técnicos del código generado (`from` vs `fromTo`, animaciones de `width`/`top`, transiciones CSS, aleatoriedad) (§14).
- **Ejercicios:**
  - Rehacer un video "slop" aplicando §12.1 y documentar el antes y el después con números.
  - Recrear el timing de un spot de referencia frame a frame.

### Avanzado (año 1+): "diseñar el sistema y el criterio"

**Objetivo:** definir el lenguaje de motion de la marca y convertirlo en reglas que la IA ejecute de forma consistente.

- **Motion branding (§7):** personalidad, tokens, movimientos firma, guía de logo, productivo vs expresivo.
- **Lenguaje de cámara y continuidad:** una sola cámara virtual por pieza, *eye trace*, mapa espacial, match cuts planificados en boards.
- **Ritmo macro:** curva de energía de la pieza entera, rupturas de ritmo, uso de silencio y quietud.
- **Escribir reglas y blueprints** para la IA (como los de `hyperframes-animation`): recetas atómicas con rangos de valores, restricciones y anti-patrones; mantener el JSON de tokens.
- **Diagnóstico fino:** por qué un movimiento "se siente mal" leyendo la curva de velocidad (aceleración en el lugar equivocado, velocidades que no coinciden en un corte, colas demasiado cortas).
- **Calibración con datos:** probar holds y tamaños con usuarios reales en el celular; medir la retención por segundo y correlacionarla con los cortes.
- **Mentoría:** dar feedback en el formato de §12.2 y entrenar el ojo del equipo con revisiones ciegas.
- **Ejercicios:**
  - Escribir el sistema de motion de una marca nueva (principios, tokens y 3 piezas de validación).
  - Escribir una regla nueva para la IA y validarla en 5 renders.

---

## 14. Apéndice: de los fundamentos al código (lo que hay que revisar en lo que genera la IA)

**GSAP / HTML (HyperFrames)** [Repo]:

- **Una sola timeline pausada** registrada; nada de `gsap.to()` suelto (no se renderiza con el seek). Los loops ambientales también van en la timeline.
- **`fromTo()` en lugar de `from()`** dentro de escenas: `from()` con `immediateRender` provoca flashes y estados incorrectos al hacer seek.
- **Solo transformaciones** (`x`, `y`, `scale`, `rotation`) y propiedades de pintura (`opacity`, `color`). **Nunca** `width`, `height`, `top` ni `left`.
- **Nunca dos tweens de transformación concurrentes sobre el mismo elemento:** uno anula al otro y el elemento puede quedar invisible sin ningún aviso. La entrada va en el padre y el Ken Burns en el hijo.
- **Sin `transition` ni `@keyframes` CSS** para movimiento (corren en el reloj del navegador y desincronizan); sin `Math.random()` ni `Date.now()`; sin `repeat: -1` sin una duración finita.
- **Conteos con un objeto proxy y `onUpdate`**, más `Math.round` y `tabular-nums`.
- **Posiciones precalculadas:** no midas el DOM durante el tween.

**Remotion (React)** [Práctica / Oficial Remotion]:

- **Todo se deriva de `useCurrentFrame()`** con `interpolate()` (con `extrapolateLeft/Right: 'clamp'`) y `Easing.bezier(...)` o `spring()`. Las animaciones y transiciones CSS no son deterministas en el render.
- **`spring()` por defecto** (damping 10, stiffness 100, mass 1) rebota ~16 %. Para el preset *settle*, usá `damping: 20` (con stiffness 100); el valor `damping: 200` también elimina el rebote, pero el asentamiento es más lento y "pesado" [cálculo propio].
- **Si un parámetro del config es `undefined`, `spring()` devuelve NaN** (issue conocido) [Secundaria].
- **Expresá los tokens en frames:** `ms × fps / 1000`. Por ejemplo, 400 ms a 30 fps = 12 frames.

**CSS moderno:** la función `linear()` permite aproximar springs y curvas de varios tramos (como el *emphasized* de M3) con múltiples puntos, cuando un cubic-bezier no alcanza [Práctica].

**Revisión con contact sheet:** pedí snapshots en el estado inicial, en el movimiento firma y en el hold final de cada escena [Repo]. Revisá con la herramienta `animation-map` (zonas muertas, consistencia de stagger, advertencias de ciclo de vida) cuando esté disponible [Repo].

---

## Fuentes

> **Nota de método.** WebFetch no estaba disponible (DNS), así que las fuentes web se consultaron mediante resúmenes de búsqueda. El presupuesto compartido de WebSearch se agotó antes de cubrir algunos temas: los principios de Fluent 2 y de Dropbox, la guía de motion de la marca IBM, sincronía audio-video, loudness, Murch, Motion Design School y School of Motion en detalle. Esos datos llevan la etiqueta **[Práctica]** y conviene verificarlos antes de publicar externamente.

### Sistemas de diseño y guías oficiales

- Material Design 3: Easing and duration (tokens y specs): https://m3.material.io/styles/motion/easing-and-duration/tokens-specs
- Material Design 3: Easing and duration (guía): https://m3.material.io/styles/motion/easing-and-duration
- Material Design 3: Motion overview / how it works (springs de M3 Expressive): https://m3.material.io/styles/motion/overview/how-it-works
- Material Design 1: Duration & easing (225 / 195 / 300 / 375 ms): https://m1.material.io/motion/duration-easing.html
- Material Design 2: The motion system (container transform, shared axis, fade through): https://m2.material.io/design/motion/the-motion-system.html
- Material Components Android: Motion.md: https://github.com/material-components/material-components-android/blob/master/docs/theming/Motion.md
- IBM Carbon: Motion overview: https://carbondesignsystem.com/elements/motion/overview/
- IBM Carbon v10: Motion: https://v10.carbondesignsystem.com/guidelines/motion/overview/
- IBM Carbon: paquete @carbon/motion: https://github.com/carbon-design-system/carbon/tree/main/packages/motion
- Pluma (Customer.io, basado en Carbon), tokens de motion: https://pluma.customer.io/foundations/tokens/motion
- Microsoft Fluent 2: Motion: https://fluent2.microsoft.design/motion
- Microsoft Fluent UI, issue #31191 (valores de tokens de curvas): https://github.com/microsoft/fluentui/issues/31191
- @fluentui/tokens (tipos): https://app.unpkg.com/@fluentui/tokens@1.0.0-alpha.14/files/dist/index.d.ts
- Microsoft Learn: Timing and easing (Windows apps): https://learn.microsoft.com/en-us/windows/apps/design/motion/timing-and-easing
- Apple HIG: Motion: https://developer.apple.com/design/human-interface-guidelines/motion
- Apple WWDC23: Animate with springs: https://developer.apple.com/videos/play/wwdc2023/10158/
- Apple WWDC18: Designing Fluid Interfaces: https://developer.apple.com/videos/play/wwdc2018/803/
- Atlassian Design: Motion: https://atlassian.design/foundations/motion
- Nielsen Norman Group: Executing UX Animations, Duration and Motion Characteristics: https://www.nngroup.com/articles/animation-duration/
- Nielsen Norman Group: The 3 Response Time Limits: https://www.nngroup.com/videos/3-response-time-limits-interaction-design/
- Remotion: spring(): https://www.remotion.dev/docs/spring
- Remotion: Easing: https://www.remotion.dev/docs/easing
- Remotion, issue #11359 (NaN con config undefined): https://github.com/remotion-dev/remotion/issues/11359

### Principios de animación y oficio

- IxDF: How to Apply Disney's 12 Principles of Animation to UI Design: https://ixdf.org/literature/article/ui-animation-how-to-apply-disney-s-12-principles-of-animation-to-ui-design
- UX Collective: Disney's 12 principles exemplified in UX design: https://uxdesign.cc/disneys-12-principles-of-animation-exemplified-in-ux-design-5cc7e3dc3f75
- Adobe Blog: Redesigning the 12 Principles of Animation for Motion Design: https://blog.adobe.com/en/publish/2016/11/08/redesigning-the-12-principles-of-animation-for-motion-design
- Issara Willenskomer: Creating Usability with Motion, The UX in Motion Manifesto: https://medium.com/ux-in-motion/creating-usability-with-motion-the-ux-in-motion-manifesto-a87a4584ddc
- Ben Marriott: Motion Foundation: https://www.benmarriott.com/motion-foundation
- Envato: How to Master Motion Design with Ben Marriott: https://elements.envato.com/learn/ben-marriott
- Jake Bartlett: The Ultimate Guide to Kinetic Type in After Effects (Skillshare): https://www.skillshare.com/en/classes/the-ultimate-guide-to-kinetic-type-in-adobe-after-effects/282677337
- School of Motion: Teaching Motion Design with Jake Bartlett: https://schoolofmotion.com/blog/teaching-motion-design-with-jake-bartlett
- Speed graph vs value graph en After Effects: https://olafmotion.com/motion-knowledge/speed-graph-vs-value-graph-after-effects/
- Screen Studio: https://screen.studio/

### Datos en movimiento

- Heer & Robertson (2007), *Animated Transitions in Statistical Data Graphics*: https://idl.cs.washington.edu/files/2007-AnimatedTransitions-InfoVis.pdf

### Accesibilidad, subtítulos y lectura

- W3C: Understanding SC 2.3.1, Three Flashes or Below Threshold: https://w3c.github.io/wcag21/understanding/three-flashes-or-below-threshold.html
- NYU: Testing SC 2.3.1: https://digitalaccessibility.nyu.edu/testing/sc231.html
- Section 508 ICT Baseline: Flashing: https://ictbaseline.access-board.gov/web-baselines/09Flashing/
- Deque: 2.3.3 Animation from Interactions: https://dequeuniversity.com/resources/wcag2.1/2.3.3-animations-from-interactions
- W3C Technique SCR40 (prefers-reduced-motion): https://www.w3.org/WAI/WCAG21/Techniques/client-side-script/SCR40
- W3C Technique C39: https://www.w3.org/WAI/WCAG22/Techniques/css/C39.html
- Netflix: Spanish (Latin America & Spain) Timed Text Style Guide: https://partnerhelp.netflixstudios.com/hc/en-us/articles/217349997-Spanish-Latin-America-Spain-Timed-Text-Style-Guide
- Netflix: Timed Text Style Guide, Subtitle Templates: https://partnerhelp.netflixstudios.com/hc/en-us/articles/219375728-Timed-Text-Style-Guide-Subtitle-Templates
- BBC Subtitle Style Guide 2024 (resumen): https://broadcastwriter.com/2024/12/12/bbc-subtitle-style-guide-2024/
- Legibility.info: Rules for text in videos: https://legibility.info/rules-for-text-in-videos
- Biteable: How many words in a 60-second video: https://biteable.com/blog/video-word-count/

### Safe areas

- EBU R95: Safe areas for 16:9 television production: https://tech.ebu.ch/publications/r095
- NAB: Television Safe Areas Redefined (SMPTE ST 2046-1): https://www.nab.org/xert/scitech/pdfs/tv031510.pdf
- Wikipedia: Safe area (television): https://en.wikipedia.org/wiki/Safe_area_(television)
- Meta Ad Sizes & Safe Zones (14 / 35 / 6 %): https://kive.ai/learn/meta-ad-sizes
- Meta Ad Specs and Safe Zones: https://www.biddyco.com/blog-posts/meta-ad-specs
- Social Media Safe Zones 2026: https://postplanify.com/blog/social-media-safe-zones-2026-complete-guide
- Kreatli: Safe zone guide: https://kreatli.com/guides/safe-zone-guide

### Repositorio de referencia (HyperFrames, leído como datos)

- `/home/user/heygen-com/hyperframes/skills/hyperframes-creative/references/motion-principles.md` (guardrails, easing como emoción, build/breathe/resolve, asimetría entrada/salida)
- `/home/user/heygen-com/hyperframes/skills/hyperframes-creative/references/beat-direction.md` (dirección por beat, verbos de movimiento, ritmo, velocity-matched)
- `/home/user/heygen-com/hyperframes/skills/hyperframes-creative/references/house-style.md` (lazy defaults de IA, capas de fondo)
- `/home/user/heygen-com/hyperframes/skills/hyperframes-creative/references/video-composition.md` (escala video vs web, densidad, color)
- `/home/user/heygen-com/hyperframes/skills/hyperframes-creative/references/typography.md` (tamaños, fuentes sobreusadas, tracking, tabular-nums)
- `/home/user/heygen-com/hyperframes/skills/hyperframes-creative/references/data-in-motion.md`
- `/home/user/heygen-com/hyperframes/skills/hyperframes-creative/references/narration.md` (2,5 palabras/s)
- `/home/user/heygen-com/hyperframes/skills/hyperframes-creative/references/audio-reactive.md`
- `/home/user/heygen-com/hyperframes/skills/hyperframes-animation/SKILL.md`
- `/home/user/heygen-com/hyperframes/skills/hyperframes-animation/rules-index.md` (contrato: stagger ≤ 0,5 s, solo transforms, determinismo)
- `/home/user/heygen-com/hyperframes/skills/hyperframes-animation/adapters/gsap-easing-and-stagger.md` (vocabulario de easing, springEase, tablas ζ/response)
- `/home/user/heygen-com/hyperframes/skills/hyperframes-animation/transitions/overview.md` y `transitions/catalog.md` (energía → transición, narrativa, blur por energía, presets)
- `/home/user/heygen-com/hyperframes/skills/hyperframes-animation/references/motion-blur.md`
- `/home/user/heygen-com/hyperframes/skills/hyperframes-animation/techniques.md`
- `/home/user/heygen-com/hyperframes/skills/hyperframes-animation/rules/` (`spring-pop-entrance`, `waterfall-entry`, `kinetic-beat-slam`, `counting-dynamic-scale`, `stat-bars-and-fills`, `chart-scrub-readout`, `coordinate-target-zoom`, `viewport-change`, `camera-cursor-tracking`, `discrete-text-sequence`, `dynamic-content-sequencing`, `svg-path-draw`, `sine-wave-loop`, `ambient-glow-bloom`, `gsap-effects`)
- Skills hermanos consultados como datos complementarios:
  - `/home/user/heygen-com/hyperframes/skills/hyperframes-studio/SKILL.md` (safe zones 90/80)
  - `/home/user/heygen-com/hyperframes/skills/embedded-captions/references/aesthetic-principles.md` (18 reglas de captions)
  - `/home/user/heygen-com/hyperframes/skills/motion-graphics/` (SKILL.md, `references/motion-vocabulary.md`, `references/builder-contract.md`, `categories/*/module.md`)
  - `/home/user/heygen-com/hyperframes/skills/pr-to-video/references/motion-language.md`, `code-vocabulary.md`, `cut-catalog.md` (doctrina de motion, código, cortes por velocidad)
