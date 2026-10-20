# Brandkit digital para motion — [NOMBRE DE LA MARCA]

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

- Nombre de la marca *:
- Slug *:
  _Minúsculas, sin espacios ni tildes, p. ej. `acme` o `acme-latam`. Es el nombre de la carpeta `brands/<slug>/`._
- Quién aprueba la marca (director de arte) *:
- ¿Es la marca por defecto de las piezas nuevas? (sí / no):

## 2. Identidad y voz

- Qué hace la marca, en una línea *:
- Tagline (si existe):
- Audiencia (quién mira) *:
- Dónde se ve *:
  _Opciones, una o varias: YouTube · LinkedIn · Instagram Reels · TikTok · YouTube Shorts · Mercado Libre · X · eventos / pantallas · web / producto_
- Personalidad en 3 o 4 adjetivos *:
- Qué tiene que sentir alguien en el primer segundo:
- Idioma y registro *:
  _Opciones: es-AR (vos) · es-419 neutro (tú) · es-ES (tú) · en-US · otro: …_
- Tono, en una frase:
- Sí, siempre (3 cosas):
- No, nunca (3 cosas):

## 3. Diferenciación

- ¿De qué marcas tiene que diferenciarse? (otras marcas del estudio o competidores):
- ¿Qué NO tiene que parecer? (p. ej. "startup genérica azul con partículas"):

## 4. Logo

Archivos en `logo/` (ver `logo/README.md`). Si todavía no hay logo, dejá la carpeta vacía: el kit usa uno provisorio marcado como PENDIENTE hasta que esté el definitivo.

- [ ] `logo.svg`: logo completo, para fondos claros
- [ ] `logo-dark.svg`: logo completo, para fondos oscuros
- [ ] `mark.svg`: isotipo o símbolo solo
- [ ] Manual o guía de marca en PDF (opcional): `logo/manual.pdf`

Uso:

- ¿Se puede animar por partes (símbolo y texto por separado)? (sí / no):
  _Si es sí, el SVG tiene `<g data-part="mark">` y `<g data-part="wordmark">`._
- Área de respeto alrededor del logo (en proporción a su alto, p. ej. 0.5):
- Alto mínimo en pantalla (px a 1080p, p. ej. 40):
- Lo que nunca se le hace al logo:
- Cómo debería aparecer la firma de logo al abrir un video:
  _Opciones: aparece el símbolo y después el texto · revelado con máscara · escaneo técnico · fundido sereno · golpe enérgico · que decida el DA_

## 5. Colores

Solo hex reales del manual de marca, nunca colores muestreados de un JPG. Si un color no existe, dejalo vacío y el kit propone uno derivado para que lo apruebes.

- Modo principal *:
  _Opciones: oscuro · claro_

| Rol | HEX | Para qué se usa |
|---|---|---|
| Fondo * | | |
| Superficie (tarjetas, paneles) | | |
| Borde | | |
| Texto principal * | | |
| Texto secundario | | |
| Primario * | | |
| Secundario | | |
| Acento * | | El momento clave: máximo uno por pantalla |
| Error | | |
| Éxito | | |
| Texto sobre primario | | |

- Colores para gráficos de datos, en orden (hasta 6 hex):
- Gradiente de marca, si existe (2 hex):
- Reglas de color (p. ej. "el acento solo para el dato clave"):

## 6. Tipografía

| Rol | Familia | Origen | Pesos | ¿Itálica real? | ¿La licencia cubre video? |
|---|---|---|---|---|---|
| Display (titulares) * | | | | | |
| Texto * | | | | | |
| Mono (código y labels) | | | | | |

- **Origen:** `Google Fonts` / `archivo propio`. Si es archivo propio, va en `fonts/` junto con su licencia.
- **¿La licencia cubre video?** `sí` / `no` / `no sé`. Si respondés `no sé`, Legal tiene que confirmarlo antes de producir.
- Titulares en mayúsculas o en caja normal:
  _Opciones: caja normal · MAYÚSCULAS · que decida el DA_

## 7. Look (el estilo que la distingue)

Con los mismos bloques, el look es lo que hace que tu marca no se parezca a otra. Si no sabés, `que decida el DA`: lo propone Claude y lo aprueba el director de arte con frames reales.

- Fondo:
  _Opciones: grid (grilla técnica) · glow (luces suaves) · grid+glow · flat (liso) · paper (papel editorial) · gradient (gradiente de marca)_
- Alineación de títulos y frases:
  _Opciones: start (a la izquierda, directo) · center (centrado, editorial)_
- Cómo se marca la palabra clave:
  _Opciones: color · underline (subrayado) · highlight (resaltado tipo marcador) · italic (itálica)_
- Cómo entra el texto:
  _Opciones: mask (sube desde una máscara, preciso) · fade (fundido, calmo) · rise (sube con fuerza) · blur (desenfoque suave)_
- Kicker (la etiqueta chica sobre el título):
  _Opciones: line (con línea) · dot (con punto) · none (sin decoración)_
- Tarjetas (pasos, comparaciones):
  _Opciones: outline (contorno) · filled (rellenas) · none (sin tarjeta)_
- Densidad:
  _Opciones: airy (mucho aire) · regular · compact (más información por pantalla)_
- Esquinas:
  _Opciones: rectas · apenas redondeadas · redondeadas · muy redondeadas_

## 8. Motion

- Personalidad del movimiento *:
  _Opciones: productive (preciso y sobrio, B2B y tech) · balanced (editorial, más calmo) · expressive (enérgico, social y lanzamientos)_
- Velocidad comparada con esa personalidad:
  _Opciones: más rápida · normal · más calma_
- Transición entre escenas por defecto:
  _Opciones: cut (corte) · crossfade (fundido) · push (empuje) · mask-wipe (cortina) · que decida el DA_
- Lo que el motion nunca debe hacer (p. ej. "rebotes", "glitch", "girar el logo"):

## 9. Referencias *

De 3 a 5 videos o frames que te gustan. Los archivos van en `references/` y los links se pegan acá. Para cada uno, anotá qué tomar y qué no.

| # | Archivo en `references/` o link | Qué tomar | Qué NO tomar |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |

## 10. Bloques firma (escenas propias de la marca)

Opcional: si no sabés, que lo proponga el DA.

- Apertura de los videos (cómo arranca):
- Cierre de los videos (cómo termina, CTA):
- Un movimiento característico que la gente reconozca:

## 11. Audio

- Música, estilo y BPM aproximado (p. ej. "electrónica minimal, 100–120 BPM, sin voces"):
- Librería de música con licencia comercial (Epidemic, Artlist…):
- Voz:
  _Opciones: locutor humano · voz sintética (TTS) · sin voz · no sé_
- Proveedor y voz, si es TTS:
- ¿Hay consentimiento escrito si la voz es de una persona real o un clon? (sí / no / no aplica):
- Efectos de sonido (p. ej. "sutiles, clicks de UI, un golpe grave en el dato clave"):

## 12. Formatos y plataformas

- [ ] 16:9 (YouTube, web)
- [ ] 9:16 (Reels, TikTok, Shorts)
- [ ] 4:5 (feed de LinkedIn e Instagram)
- [ ] 1:1 (feed)
- ¿Captions quemados en vertical y 4:5? (sí / no):

## 13. Legal

- Texto de disclosure de IA (el kit lo agrega cuando hay voz sintética o imágenes realistas generadas):
- ¿Se pueden mostrar logos o interfaces de terceros? (solo uso nominativo / con permiso escrito / nunca):
- Notas legales de la marca:

## 14. Pendientes y dudas

-
