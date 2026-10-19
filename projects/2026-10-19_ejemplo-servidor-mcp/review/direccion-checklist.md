# Revisión de dirección anti-slop — [PIEZA] · [VERSIÓN]

> **Estado en este ejemplo (2026-10-19):** sin revisar. Ningún ítem está marcado porque la revisión de dirección con este checklist no se hizo; las notas de dirección que sí hubo están en `review/CHANGELOG.md` (R1, R2).

> Usar en cada ronda de review (G8) y antes de picture lock (G9). Fuente: research/04-fundamentos-motion.md §12. Los valores numéricos son los tokens de brand/brand.config.json.

## 1 El "look IA" (diagnóstico)

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

## 2 Traducción de feedback vago a dirección concreta

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

## 3 Checklist de crítica del director (28 puntos)

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

## 4 Plantilla de dirección para la IA (por beat)

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
