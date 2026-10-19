---
name: marca
description: Setup o actualización del sistema de marca para motion (brand intake). Entrevista corta + archivos de logo/fuentes/referencias → brand/brand.config.json → npm run brand → brand board y reporte de contraste para aprobar. Usar al empezar con el kit, al cambiar de cliente/marca, o cuando digan "seteá mi marca", "aplicá mi branding", "cambiá la paleta/tipografía/motion".
---

# /marca — sistema de marca para motion

Todo lo que el kit produce sale de `brand/brand.config.json`. Esta skill lo completa con datos REALES de la marca. Nunca rellenes un hueco con un supuesto: preguntá o dejá el placeholder marcado.

## Paso 1 — Entrevista (dos tandas; esperá respuesta entre tandas)

**Tanda 1**
1. Nombre de la marca y qué hace, en una línea. Tagline si existe.
2. Audiencia: quién mira y dónde (YouTube desktop / LinkedIn mobile sin sonido / Reels / eventos).
3. Personalidad en 3-4 adjetivos y qué tiene que sentir alguien en el primer segundo.
4. Idioma y registro (es-AR con vos, es-419 neutro, es-ES, en-US).

**Tanda 2**
5. Colores en HEX (no muestreados de un JPG): fondo, texto, primario, secundario, acento. ¿Marca clara u oscura?
6. Tipografías (display / texto / mono) y su licencia: ¿cubre uso en video? Archivos `.woff2`/`.ttf` a `brand/fonts/`. Si son Google Fonts / OFL, decime el nombre y uso `@fontsource`.
7. Logos en SVG a `brand/logo/` (`logo.svg`, `mark.svg`, versión para fondo claro). Para animarlo por partes: `<g data-part="mark">` y `<g data-part="wordmark">`.
8. 3-5 frames de referencia del motion que les gusta a `brand/references/` y UNA cosa que su motion nunca debe hacer.

## Paso 2 — Traducir a `brand/brand.config.json`
- `identity`, `colors` (incluí `code.*` y `dataViz` con contraste suficiente), `typography` (`source: "fontsource"` + `package` o `source: "local"` + `files: {"400": "Archivo.woff2"}`), `logo`.
- **Motion:** traducí la personalidad a números, no a adjetivos:
  - productive (B2B, sobrio): enter 450-550 ms, `enter` = power3.out, sin overshoot, transición por defecto `cut`.
  - balanced: enter 500-650 ms, `emphasized` en titulares, crossfades cortos permitidos.
  - expressive (social/lanzamiento): enter 300-450 ms, más stagger, `expressive` habilitado SOLO en momentos lúdicos aprobados.
- Si dieron referencias, describí en `motion.principles` lo que ves en ellas (ritmo, entradas, texturas), sin inventar: si no se puede inferir, escribí "ASK ME".
- `audio.voice.consentOnFile` solo `true` si hay contrato de voz.

## Paso 3 — Generar y verificar
```bash
npm run brand            # valida y genera brand/dist, MOTION.md, brand.md
npm run brand:logo       # SOLO si todavía no hay logo oficial (placeholder)
```
- Leé `brand/dist/contrast-report.md`: todo par en FALLA se corrige antes de seguir.
- Renderizá el board para mostrarlo: `npx hyperframes` no hace falta; abrí `brand/dist/brand-board.html` (o captura con Chromium headless).
- Si hay proyectos abiertos: `npm run build:roots -- <proyecto>` y `npm run frames -- <proyecto>` para ver la marca nueva aplicada en escenas reales.

## Paso 4 — Entregar
Mostrá: board, reporte de contraste, 2-3 frames de la galería (`projects/_galeria-bloques`, `npm run frames -- _galeria-bloques`) con la marca nueva, y la lista de lo que quedó en "ASK ME"/placeholder. El director de arte aprueba antes de producir.
