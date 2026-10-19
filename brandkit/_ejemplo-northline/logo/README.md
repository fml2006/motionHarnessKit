# Logo: qué archivos poner acá

| Archivo | Qué es | Obligatorio |
|---|---|---|
| `logo.svg` | Logo completo (símbolo y nombre) para fondos claros | Sí |
| `logo-dark.svg` | Logo completo para fondos oscuros | Sí |
| `mark.svg` | Solo el símbolo o isotipo | Sí |
| `manual.pdf` | Manual o guía de marca | No |

**Cómo tienen que estar los SVG:**

- **Vector, no foto.** Un SVG que adentro trae un PNG o JPG (`<image>`) no sirve: se pixela y no se puede animar.
- **Textos convertidos a contornos.** Si el nombre está escrito con una fuente (`<text>`), en otra máquina puede verse con otra letra.
- **Con `viewBox`**, sin márgenes vacíos de más alrededor del dibujo.
- **Colores de la paleta**, en hex.
- **Para animar el logo por partes**, agrupá el símbolo en `<g data-part="mark">…</g>` y el nombre en `<g data-part="wordmark">…</g>`.

Si no tenés logo todavía, dejá la carpeta vacía: el kit genera uno provisorio (`npm run brand:logo`) hasta que tengas el definitivo.
