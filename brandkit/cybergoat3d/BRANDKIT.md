# Brandkit digital para motion — CyberGoat3D

> **Cómo se completa**
>
> 1. Copiá esta carpeta a `brandkit/<slug>/`, o corré `npm run brandkit:new -- <slug>`.
> 2. Completá este archivo: escribí después de cada `:`.
> 3. Poné los archivos en `logo/`, `fonts/` y `references/`.
> 4. Revisalo con `npm run brandkit:check -- <slug>`.
> 5. En Claude Code, dentro del kit: `/marca desde brandkit/<slug>`.
>
> - Los campos con `*` son obligatorios.
> - Si no sabés algo, escribí `no sé`. Claude te pregunta o lo marca como PENDIENTE; nunca inventa un dato de marca.
> - Si hay opciones, escribí UNA de las que figuran en la línea _Opciones_ de abajo, o `que decida el DA` (director de arte).

---

## 1. Datos básicos

- Nombre de la marca *: CyberGoat3D
- Slug *: cybergoat3d
  _Minúsculas, sin espacios ni tildes, p. ej. `acme` o `acme-latam`. Es el nombre de la carpeta `brands/<slug>/`._
- Quién aprueba la marca (director de arte) *: Facundo Lemos (dueño)
- ¿Es la marca por defecto de las piezas nuevas? (sí / no): sí (primera marca propia del estudio)

## 2. Identidad y voz

- Qué hace la marca, en una línea *: Vende productos de impresión 3D
- Tagline (si existe):
- Audiencia (quién mira) *: no sé
- Dónde se ve *: Instagram Reels, TikTok, Mercado Libre
  _Opciones, una o varias: YouTube · LinkedIn · Instagram Reels · TikTok · YouTube Shorts · Mercado Libre · X · eventos / pantallas · web / producto_
- Personalidad en 3 o 4 adjetivos *: audaz, cercana, artesanal, precisa (propuesta desde el logo, a confirmar)
- Qué tiene que sentir alguien en el primer segundo: que el producto está bien hecho y le dan ganas de tenerlo (propuesta desde el logo, a confirmar)
- Idioma y registro *: es-AR (vos)
  _Opciones: es-AR (vos) · es-419 neutro (tú) · es-ES (tú) · en-US · otro: …_
- Tono, en una frase: Sutil y con poco texto: el producto habla; cada texto en pantalla se consulta con la marca antes de ponerlo
- Sí, siempre (3 cosas): poco texto y sutil; el producto como protagonista; consultar con la marca qué texto va antes de ponerlo
- No, nunca (3 cosas):

## 3. Diferenciación

- ¿De qué marcas tiene que diferenciarse? (otras marcas del estudio o competidores): de las marcas de ejemplo del estudio (TuMarca, Northline, Pulso)
- ¿Qué NO tiene que parecer? (p. ej. "startup genérica azul con partículas"): un video "tech" genérico oscuro con neón y partículas (propuesta desde el logo, a confirmar)

## 4. Logo

Archivos en `logo/` (ver `logo/README.md`). Si todavía no hay logo, dejá la carpeta vacía: el kit usa uno provisorio marcado como PENDIENTE hasta que esté el definitivo.

- [x] `logo.svg`: logo completo, para fondos claros
- [x] `logo-dark.svg`: logo completo, para fondos oscuros
- [x] `mark.svg`: isotipo o símbolo solo
- [ ] Manual o guía de marca en PDF (opcional): `logo/manual.pdf`

Uso:

- ¿Se puede animar por partes (símbolo y texto por separado)? (sí / no): sí (vectorizado: `data-part="mark"` y `data-part="wordmark"`; en el isologo, anillo y cabra por separado)
  _Si es sí, el SVG tiene `<g data-part="mark">` y `<g data-part="wordmark">`._
- Área de respeto alrededor del logo (en proporción a su alto, p. ej. 0.5): 0.5
- Alto mínimo en pantalla (px a 1080p, p. ej. 40): 40
- Lo que nunca se le hace al logo: deformar, rotar, cambiar sus colores, separar la cabra del anillo, sombras o glow (propuesta desde el logo, a confirmar)
- Cómo debería aparecer la firma de logo al abrir un video: aparece el símbolo y después el texto: el anillo rojo se dibuja, entra la cabra y después el logotipo (propuesta desde el logo, a confirmar)
  _Opciones: aparece el símbolo y después el texto · revelado con máscara · escaneo técnico · fundido sereno · golpe enérgico · que decida el DA_

## 5. Colores

Solo hex reales del manual de marca, nunca colores muestreados de un JPG. Si un color no existe, dejalo vacío y el kit propone uno derivado para que lo apruebes.

- Modo principal *: claro
  _Opciones: oscuro · claro_

| Rol | HEX | Para qué se usa |
|---|---|---|
| Fondo * | #FFFFFF | Blanco: fondo de producto |
| Superficie (tarjetas, paneles) | #F2F2F2 | Tarjetas y paneles |
| Borde | #E0E0E0 | Filetes |
| Texto principal * | #1A1A1A | Negro del logo |
| Texto secundario | #5C5C5C | Bajadas y datos |
| Primario * | #1A1A1A | Negro del logo: estructura, píldoras, números |
| Secundario | #8E0505 | Rojo profundo (derivado del rojo) |
| Acento * | #BE0707 | Rojo del logo: la palabra o el dato clave, uno por pantalla |
| Error | #9E0000 |  |
| Éxito | #2E7D32 | Funcional (no aparece en el logo) |
| Texto sobre primario | #FFFFFF |  |

- Colores para gráficos de datos, en orden (hasta 6 hex): #BE0707, #1A1A1A, #6B6B6B, #D9534F, #8E0505, #7A7A7A
- Gradiente de marca, si existe (2 hex): #BE0707, #8E0505
- Reglas de color (p. ej. "el acento solo para el dato clave"): rojo solo para la palabra o el dato clave (como CYBER y 3D en el logo); negro para estructura; fondo blanco para que el producto sea protagonista (propuesta desde el logo, a confirmar)

## 6. Tipografía

| Rol | Familia | Origen | Pesos | ¿Itálica real? | ¿La licencia cubre video? |
|---|---|---|---|---|---|
| Display (titulares) * | Luckiest Guy | Google Fonts | 400 | no | sí (OFL) |
| Texto * | Nunito | Google Fonts | 400, 700, 800 | no | sí (OFL) |
| Mono (código y labels) | JetBrains Mono | Google Fonts | 400, 500 | no | sí (OFL) |

- **Origen:** `Google Fonts` / `archivo propio`. Si es archivo propio, va en `fonts/` junto con su licencia.
- **¿La licencia cubre video?** `sí` / `no` / `no sé`. Si respondés `no sé`, Legal tiene que confirmarlo antes de producir.
- Titulares en mayúsculas o en caja normal: MAYÚSCULAS (como el logotipo)
  _Opciones: caja normal · MAYÚSCULAS · que decida el DA_

## 7. Look (el estilo que la distingue)

Con los mismos bloques, el look es lo que hace que tu marca no se parezca a otra. Si no sabés, `que decida el DA`: lo propone Claude y lo aprueba el director de arte con frames reales.

- Fondo: flat (blanco liso: el producto es el protagonista) (propuesta desde el logo, a confirmar)
  _Opciones: grid (grilla técnica) · glow (luces suaves) · grid+glow · flat (liso) · paper (papel editorial) · gradient (gradiente de marca)_
- Alineación de títulos y frases: center (propuesta desde el logo, a confirmar)
  _Opciones: start (a la izquierda, directo) · center (centrado, editorial)_
- Cómo se marca la palabra clave: color (rojo de marca) (propuesta desde el logo, a confirmar)
  _Opciones: color · underline (subrayado) · highlight (resaltado tipo marcador) · italic (itálica)_
- Cómo entra el texto: rise (suave, con las duraciones calmas de balanced) (propuesta desde el logo, a confirmar)
  _Opciones: mask (sube desde una máscara, preciso) · fade (fundido, calmo) · rise (sube con fuerza) · blur (desenfoque suave)_
- Kicker (la etiqueta chica sobre el título): dot (propuesta desde el logo, a confirmar)
  _Opciones: line (con línea) · dot (con punto) · none (sin decoración)_
- Tarjetas (pasos, comparaciones): filled (gris claro) (propuesta desde el logo, a confirmar)
  _Opciones: outline (contorno) · filled (rellenas) · none (sin tarjeta)_
- Densidad: airy (propuesta desde el logo, a confirmar)
  _Opciones: airy (mucho aire) · regular · compact (más información por pantalla)_
- Esquinas: redondeadas (como las letras del logotipo) (propuesta desde el logo, a confirmar)
  _Opciones: rectas · apenas redondeadas · redondeadas · muy redondeadas_

## 8. Motion

- Personalidad del movimiento *: balanced
  _Opciones: productive (preciso y sobrio, B2B y tech) · balanced (editorial, más calmo) · expressive (enérgico, social y lanzamientos)_
- Velocidad comparada con esa personalidad: normal
  _Opciones: más rápida · normal · más calma_
- Transición entre escenas por defecto: crossfade (propuesta desde el logo, a confirmar)
  _Opciones: cut (corte) · crossfade (fundido) · push (empuje) · mask-wipe (cortina) · que decida el DA_
- Lo que el motion nunca debe hacer (p. ej. "rebotes", "glitch", "girar el logo"): glitch, partículas, girar el logo, rebote en textos (propuesta desde el logo, a confirmar)

## 9. Referencias *

De 3 a 5 videos o frames que te gustan. Los archivos van en `references/` y los links se pegan acá. Para cada uno, anotá qué tomar y qué no.

| # | Archivo en `references/` o link | Qué tomar | Qué NO tomar |
|---|---|---|---|
| 1 | 01-isologo.png | Badge circular: anillo rojo grueso, figura negra plana, mucho contraste, formas redondeadas | — |
| 2 | 02-logotipo.png | Mayúsculas gruesas y redondeadas con baile irregular; rojo para CYBER y 3D, negro para GOAT | Usar esa tipografía en textos largos |
| 3 | | | |
| 4 | | | |
| 5 | | | |

## 10. Bloques firma (escenas propias de la marca)

Opcional: si no sabés, que lo proponga el DA.

- Producto destacado: la foto del producto con un movimiento de cámara suave y, como mucho, el nombre y un dato (consultados con la marca) (propuesta desde el logo, a confirmar)
- Tipo de video principal: producto destacado (una pieza impresa como protagonista, con muy poco texto)
- Material disponible: fotos del producto con fondo limpio y fotos o videos del producto en uso

- Apertura de los videos (cómo arranca):
- Cierre de los videos (cómo termina, CTA):
- Un movimiento característico que la gente reconozca:

## 11. Audio

- Música, estilo y BPM aproximado (p. ej. "electrónica minimal, 100–120 BPM, sin voces"): sutil, de fondo, sin competir con el producto
- Librería de música con licencia comercial (Epidemic, Artlist…):
- Voz: locutor humano o voz sintética (TTS), según la pieza
  _Opciones: locutor humano · voz sintética (TTS) · sin voz · no sé_
- Proveedor y voz, si es TTS: HeyGen (voz a elegir); la alternativa humana la graba alguien del equipo
- ¿Hay consentimiento escrito si la voz es de una persona real o un clon? (sí / no / no aplica): pendiente: dejar por escrito el consentimiento de quien graba, aunque sea del equipo
- Efectos de sonido (p. ej. "sutiles, clicks de UI, un golpe grave en el dato clave"): sí, para llamar la atención en los momentos clave (aparece el producto, cambio de escena), sobre una música sutil

## 12. Formatos y plataformas

- [ ] 16:9 (YouTube, web)
- [x] 9:16 (Reels, TikTok, Shorts)
- [ ] 4:5 (feed de LinkedIn e Instagram)
- [ ] 1:1 (feed)
- ¿Captions quemados en vertical y 4:5? (sí / no):

## 13. Legal

- Texto de disclosure de IA (el kit lo agrega cuando hay voz sintética o imágenes realistas generadas):
- ¿Se pueden mostrar logos o interfaces de terceros? (solo uso nominativo / con permiso escrito / nunca):
- Notas legales de la marca:

## 14. Pendientes y dudas

- Logos vectorizados desde las imágenes de Mercado Libre (originales en `logo/originales/`). Si existe un archivo vectorial original (AI, SVG, PDF o Canva), reemplaza a estos.
- La tipografía del logotipo coincide con Luckiest Guy (Google Fonts, OFL): confirmar que es esa.
- Audiencia: quién compra.
- Referencias de motion: hoy son solo el logo y el isologo; sumar 3 videos o cuentas que les gusten.
- Todo lo marcado "propuesta desde el logo" lo confirma el dueño viendo el brand board.
- Si se usa TTS de HeyGen: el guion de cada pieza se envía a HeyGen (registrar en PROVENANCE) y el video lleva el aviso de IA (política de la casa).
- Formato de Mercado Libre: confirmar si sus videos de producto van en 9:16 u otro formato.
- Logos: las imágenes de Mercado Libre (JPG/WebP) no se pudieron descargar desde la sesión; falta el archivo y, si existe, el original vectorial.
- Specs de video de Mercado Libre: confirmar formato, duración y peso antes de la primera entrega (no están en `delivery/specs.json`).

---

Importado a `brands/cybergoat3d/` el 2026-10-20 (versión 0.1.0). Los campos marcados "propuesta desde el logo" los confirma el dueño viendo el brand board.
