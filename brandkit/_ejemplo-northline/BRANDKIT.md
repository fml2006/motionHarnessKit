# Brandkit digital para motion — Northline (EJEMPLO COMPLETO)

> **Este es un ejemplo, no se importa.** Muestra cómo queda completo el brandkit de la marca `northline` que ya trae el kit. Las referencias son frames generados por el propio kit; en tu brandkit poné referencias reales que te gusten.
>
> Plantilla vacía: `brandkit/_plantilla/` o `npm run brandkit:new -- <slug>`.

---

## 1. Datos básicos

- Nombre de la marca *: Northline
- Slug *: northline
- Quién aprueba la marca (director de arte) *: Dirección de arte de Northline
- ¿Es la marca por defecto de las piezas nuevas? (sí / no): no

## 2. Identidad y voz

- Qué hace la marca, en una línea *: Explica ingeniería y producto con la calma de una publicación editorial
- Tagline (si existe): Ingeniería explicada con calma
- Audiencia (quién mira) *: Profesionales de tecnología y tomadores de decisión, 25 a 45 años
- Dónde se ve *: LinkedIn, YouTube, web / producto
  _Opciones, una o varias: YouTube · LinkedIn · Instagram Reels · TikTok · YouTube Shorts · X · eventos / pantallas · web / producto_
- Personalidad en 3 o 4 adjetivos *: editorial, serena, rigurosa, cálida
- Qué tiene que sentir alguien en el primer segundo: que va a entender algo complejo sin apuro
- Idioma y registro *: es-AR (vos)
  _Opciones: es-AR (vos) · es-419 neutro (tú) · es-ES (tú) · en-US · otro: …_
- Tono, en una frase: Directo, didáctico y concreto; cada afirmación técnica se puede verificar
- Sí, siempre (3 cosas): una idea por pantalla; verbos concretos y números verificados; analogías simples antes del detalle técnico
- No, nunca (3 cosas): hype vacío ("revolucionario", "game changer"); jerga sin explicar; claims de rendimiento sin fuente

## 3. Diferenciación

- ¿De qué marcas tiene que diferenciarse? (otras marcas del estudio o competidores): TuMarca (oscura y técnica) y Pulso (energética para redes)
- ¿Qué NO tiene que parecer? (p. ej. "startup genérica azul con partículas"): un dashboard oscuro de startup ni un reel con efectos

## 4. Logo

Archivos en `logo/` (ver `logo/README.md`). Si todavía no hay logo, dejá la carpeta vacía: el kit usa uno provisorio marcado como PENDIENTE hasta que esté el definitivo.

- [x] `logo.svg`: logo completo, para fondos claros
- [x] `logo-dark.svg`: logo completo, para fondos oscuros
- [x] `mark.svg`: isotipo o símbolo solo
- [ ] Manual o guía de marca en PDF (opcional): `logo/manual.pdf`

Uso:

- ¿Se puede animar por partes (símbolo y texto por separado)? (sí / no): sí
  _Si es sí, el SVG tiene `<g data-part="mark">` y `<g data-part="wordmark">`._
- Área de respeto alrededor del logo (en proporción a su alto, p. ej. 0.5): 0.5
- Alto mínimo en pantalla (px a 1080p, p. ej. 40): 40
- Lo que nunca se le hace al logo: deformar, rotar, cambiar colores fuera de la paleta, glow o bevel
- Cómo debería aparecer la firma de logo al abrir un video: fundido sereno
  _Opciones: aparece el símbolo y después el texto · revelado con máscara · escaneo técnico · fundido sereno · golpe enérgico · que decida el DA_

## 5. Colores

Solo hex reales del manual de marca, nunca colores muestreados de un JPG. Si un color no existe, dejalo vacío y el kit propone uno derivado para que lo apruebes.

- Modo principal *: claro
  _Opciones: oscuro · claro_

| Rol | HEX | Para qué se usa |
|---|---|---|
| Fondo * | #F6F1E8 | Papel crema |
| Superficie (tarjetas, paneles) | #ECE4D6 | Tarjetas de pasos y comparación |
| Borde | #CDBFA9 | Filetes y contornos |
| Texto principal * | #1B1A17 | Tinta |
| Texto secundario | #5B554B | Bajadas y labels |
| Primario * | #1F3A5F | Tinta azul para estructura |
| Secundario | #2F6B4F | Verde de apoyo |
| Acento * | #B4532A | Terracota: solo la palabra o el dato clave |
| Error | #A33A2C | |
| Éxito | #2F6B4F | |
| Texto sobre primario | #F6F1E8 | |

- Colores para gráficos de datos, en orden (hasta 6 hex): #1F3A5F, #B4532A, #2F6B4F, #8A6D3B, #6B4E71, #7A7568
- Gradiente de marca, si existe (2 hex): #1F3A5F, #2F6B4F
- Reglas de color (p. ej. "el acento solo para el dato clave"): terracota solo para el dato o la palabra clave; tinta azul para la estructura

## 6. Tipografía

| Rol | Familia | Origen | Pesos | ¿Itálica real? | ¿La licencia cubre video? |
|---|---|---|---|---|---|
| Display (titulares) * | Newsreader | Google Fonts | 500, 600 | sí | sí |
| Texto * | IBM Plex Sans | Google Fonts | 400, 500, 600 | no | sí |
| Mono (código y labels) | IBM Plex Mono | Google Fonts | 400, 500 | no | sí |

- **Origen:** `Google Fonts` / `archivo propio`. Si es archivo propio, va en `fonts/` junto con su licencia.
- **¿La licencia cubre video?** `sí` / `no` / `no sé`. Si respondés `no sé`, Legal tiene que confirmarlo antes de producir.
- Titulares en mayúsculas o en caja normal: caja normal
  _Opciones: caja normal · MAYÚSCULAS · que decida el DA_

## 7. Look (el estilo que la distingue)

Con los mismos bloques, el look es lo que hace que tu marca no se parezca a otra. Si no sabés, `que decida el DA`: lo propone Claude y lo aprueba el director de arte con frames reales.

- Fondo: paper
  _Opciones: grid (grilla técnica) · glow (luces suaves) · grid+glow · flat (liso) · paper (papel editorial) · gradient (gradiente de marca)_
- Alineación de títulos y frases: center
  _Opciones: start (a la izquierda, directo) · center (centrado, editorial)_
- Cómo se marca la palabra clave: italic
  _Opciones: color · underline (subrayado) · highlight (resaltado tipo marcador) · italic (itálica)_
- Cómo entra el texto: fade
  _Opciones: mask (sube desde una máscara, preciso) · fade (fundido, calmo) · rise (sube con fuerza) · blur (desenfoque suave)_
- Kicker (la etiqueta chica sobre el título): none
  _Opciones: line (con línea) · dot (con punto) · none (sin decoración)_
- Tarjetas (pasos, comparaciones): outline
  _Opciones: outline (contorno) · filled (rellenas) · none (sin tarjeta)_
- Densidad: airy
  _Opciones: airy (mucho aire) · regular · compact (más información por pantalla)_
- Esquinas: apenas redondeadas
  _Opciones: rectas · apenas redondeadas · redondeadas · muy redondeadas_

## 8. Motion

- Personalidad del movimiento *: balanced
  _Opciones: productive (preciso y sobrio, B2B y tech) · balanced (editorial, más calmo) · expressive (enérgico, social y lanzamientos)_
- Velocidad comparada con esa personalidad: normal
  _Opciones: más rápida · normal · más calma_
- Transición entre escenas por defecto: crossfade
  _Opciones: cut (corte) · crossfade (fundido) · push (empuje) · mask-wipe (cortina) · que decida el DA_
- Lo que el motion nunca debe hacer (p. ej. "rebotes", "glitch", "girar el logo"): rebotes, glitch, partículas, movimiento continuo detrás de un texto que se está leyendo

## 9. Referencias *

De 3 a 5 videos o frames que te gustan. Los archivos van en `references/` y los links se pegan acá. Para cada uno, anotá qué tomar y qué no.

| # | Archivo en `references/` o link | Qué tomar | Qué NO tomar |
|---|---|---|---|
| 1 | 01-titulo-centrado.png | Composición centrada y simétrica, mucho aire, el acento en itálica | El kicker pequeño, que se pierde en mobile |
| 2 | 02-frase-italica.png | Una frase por pantalla, serif grande, una sola palabra en terracota | — |
| 3 | 03-pasos-tarjetas.png | Pasos en tarjetas con contorno fino, tinta azul en el paso activo | Descripciones de más de 6 palabras |
| 4 | | | |
| 5 | | | |

## 10. Bloques firma (escenas propias de la marca)

Opcional: si no sabés, que lo proponga el DA.

- Apertura de los videos (cómo arranca): "Folio": el símbolo aparece en el centro entre dos filetes, como la portada de una revista
- Cierre de los videos (cómo termina, CTA): CTA centrado en serif con el link en una píldora de tinta azul
- Un movimiento característico que la gente reconozca: un folio de capítulo con número grande y filete que se dibuja

## 11. Audio

- Música, estilo y BPM aproximado (p. ej. "electrónica minimal, 100–120 BPM, sin voces"): piano y cuerdas suaves, 80–95 BPM, sin voces
- Librería de música con licencia comercial (Epidemic, Artlist…): no sé
- Voz:
  _Opciones: locutor humano · voz sintética (TTS) · sin voz · no sé_
- Proveedor y voz, si es TTS:
- ¿Hay consentimiento escrito si la voz es de una persona real o un clon? (sí / no / no aplica): no aplica
- Efectos de sonido (p. ej. "sutiles, clicks de UI, un golpe grave en el dato clave"): casi ninguno; un roce de papel en los cambios de capítulo

## 12. Formatos y plataformas

- [x] 16:9 (YouTube, web)
- [ ] 9:16 (Reels, TikTok, Shorts)
- [x] 4:5 (feed de LinkedIn e Instagram)
- [ ] 1:1 (feed)
- ¿Captions quemados en vertical y 4:5? (sí / no): sí

## 13. Legal

- Texto de disclosure de IA (el kit lo agrega cuando hay voz sintética o imágenes realistas generadas): Este video incluye elementos generados o asistidos por IA.
- ¿Se pueden mostrar logos o interfaces de terceros? (solo uso nominativo / con permiso escrito / nunca): solo uso nominativo
- Notas legales de la marca:

## 14. Pendientes y dudas

- Definir la librería de música con licencia comercial.
- Definir la voz (locutor o TTS) para piezas con narración.
