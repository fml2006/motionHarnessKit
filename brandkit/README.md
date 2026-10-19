# Brandkit digital: cómo se carga una marca

Un **brandkit** es una carpeta con todo lo que el kit necesita para crear una marca: un formulario (`BRANDKIT.md`), los logos, las fuentes y las referencias de motion. Lo completás vos, o se lo mandás a tu diseñador o al cliente. Después, `/marca` lo convierte en `brands/<slug>/`: tokens, look, `LOOK.md` y bloques firma.

```
brandkit/
├── _plantilla/            ← vacía: no la edites, se copia
│   ├── BRANDKIT.md        ← el formulario
│   ├── logo/              ← logo.svg, logo-dark.svg, mark.svg (+ manual.pdf opcional)
│   ├── fonts/             ← solo si la fuente es propia: .woff2 + licencia
│   └── references/        ← 3 a 5 frames, clips o links de motion que te gustan
├── _ejemplo-northline/    ← el mismo formulario, completo (la marca de ejemplo Northline)
└── <tu-marca>/            ← el tuyo
```

## Paso a paso

1. **Crear tu brandkit:**
   ```bash
   npm run brandkit:new -- acme --name "Acme Cloud"
   ```
   Crea `brandkit/acme/` desde la plantilla, con el nombre y el slug ya cargados.
2. **Completar `brandkit/acme/BRANDKIT.md`.** Los campos con `*` son obligatorios. Si no sabés algo, escribí `no sé`: Claude lo pregunta o lo deja PENDIENTE, nunca lo inventa. Mirá `_ejemplo-northline/BRANDKIT.md` para ver cómo queda completo.
3. **Poner los archivos:** logos en SVG en `logo/`, referencias en `references/` y, si la fuente no es de Google Fonts, sus archivos y la licencia en `fonts/`. Cada carpeta tiene un `README.md` con los requisitos.
4. **Revisar:**
   ```bash
   npm run brandkit:check -- acme
   ```
   - ✗ bloquea la importación: hex inválidos, falta un dato obligatorio, logo raster, fuente propia sin archivo, ninguna referencia.
   - ⚠ se puede importar, pero queda PENDIENTE o lo decide el director de arte.
5. **Importar en Claude Code**, abierto en la carpeta del kit:
   ```
   /marca desde brandkit/acme
   ```
   - Claude lee el formulario y pregunta en una sola tanda lo que falte.
   - Crea `brands/acme/`, decide el look a partir de tus referencias y escribe `LOOK.md`.
   - Arma al menos un bloque firma, genera el brand board y el reporte de contraste, y te muestra la galería de 13 bloques con tu marca al lado de las otras.
   - **El director de arte la aprueba** antes de producir.

## Qué se puede dejar en "que decida el DA"

- **El look** (fondo, alineación, acento, entrada del texto, tarjetas, densidad) y **los bloques firma** se pueden dejar en `que decida el DA`: Claude los propone a partir de las referencias.
- **Lo que no se puede dejar sin dato** son los hex del fondo, el texto, el primario y el acento, las fuentes y las referencias. Con eso la marca no sale genérica.

## Confidencialidad

Si el repo tiene marcas de clientes, tiene que ser privado. Para clientes con confidencialidad estricta, usá un repo por cliente: el brandkit de uno no tiene que ser visible para los otros.
