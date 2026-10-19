---
name: marca
description: Crear o editar una marca del estudio multimarca (brands/<slug>/) con estilo propio. Entrevista + logo/fuentes/referencias → brand.config.json (colores, tipografía, motion y LOOK) + LOOK.md + bloques firma → npm run brand → brand board, contraste y comparación contra las otras marcas para aprobar. Usar al empezar con el kit, al sumar un cliente o una marca nueva, o cuando digan "seteá mi marca", "aplicá mi branding", "otra marca", "que no se vea igual que…", "cambiá la paleta/tipografía/motion/estilo".
---

# /marca — una marca con estilo propio dentro del estudio

El kit es un **estudio multimarca**: cada marca vive en `brands/<slug>/` (`brand.config.json`, `logo/`, `references/`,
`LOOK.md`, `blocks/`, y `dist/` generado) y cada pieza elige UNA (`scenes.json → brand`). Colores y fuentes solos no
alcanzan: con los mismos 13 bloques, dos marcas que solo cambian paleta se ven "hermanas". Lo que las separa es el
**look** (fondo, alineación, caja de titulares, forma del acento, cómo entra el texto, kicker, tarjetas, densidad),
el **motion** (duraciones, curvas, stagger) y sus **bloques firma**. Esta skill define las tres cosas con datos REALES.
Nunca rellenes un hueco con un supuesto: preguntá o dejá el placeholder marcado ("PENDIENTE").

Uso: `/marca` (pregunta qué marca), `/marca nueva <slug>`, `/marca <slug>` (editar).

## Paso 0 — ¿Nueva o existente?
- `npm run brand:list` para ver las marcas, su look y qué piezas usan cada una.
- Nueva: `npm run brand:new -- <slug> --from <la más parecida> --name "Nombre"` (crea la carpeta, logo placeholder, LOOK.md plantilla y la aplica). Si va a ser la marca por defecto de las piezas nuevas: `--default`.
- Existente: trabajá sobre `brands/<slug>/`. Si la marca ya tiene piezas aprobadas, avisá: cambiarla frena esas piezas por `brandLock` hasta que alguien acepte el cambio con `--rebrand`.

## Paso 1 — Entrevista (dos tandas; esperá respuesta entre tandas)

**Tanda 1 — identidad y estilo**
1. Nombre y qué hace, en una línea. Tagline si existe.
2. Audiencia: quién mira y dónde (YouTube desktop / LinkedIn mobile sin sonido / Reels / eventos).
3. Personalidad en 3-4 adjetivos y qué tiene que sentir alguien en el primer segundo.
4. Idioma y registro (es-AR con vos, es-419 neutro, es-ES, en-US).
5. **Referencias:** 3-5 frames o links de motion que les gustan (a `brands/<slug>/references/`) y, para cada uno, qué tomar. UNA cosa que su motion nunca debe hacer.
6. **¿De qué marca del estudio se tiene que diferenciar?** (mostrá `brands/INDEX.md`).

**Tanda 2 — átomos**
7. Colores en HEX (no muestreados de un JPG): fondo, texto, primario, secundario, acento. ¿Clara u oscura?
8. Tipografías (display / texto / mono) y su licencia: ¿cubre video? Archivos `.woff2` a `brands/<slug>/fonts/` (`source: "local"`) o, si son OFL/Google Fonts, el nombre y uso `@fontsource` (agregar el paquete con versión EXACTA: `npm install -E -D @fontsource/<fuente>@<versión>` — pide permiso). Si el acento va en itálica, que la fuente tenga itálica real (`typography.display.italic: true`).
9. Logos en SVG a `brands/<slug>/logo/` (`logo.svg`, `mark.svg`, `logo-dark.svg`). Para animarlo por partes: `<g data-part="mark">` y `<g data-part="wordmark">`. Sin logo todavía: `npm run brand:logo -- --brand <slug> --mark bracket|pulse|ring`.

## Paso 2 — Traducir a `brands/<slug>/brand.config.json`
- `identity`, `colors` (incluí `code.*`, `dataViz` y, si el acento es resaltado, `onAccent`), `typography`, `logo`.
- **`look`** — decidilo desde las referencias y la diferencia con las otras marcas (escribí `look.summary` en una línea):

  | Campo | Opciones | Cuándo |
  |---|---|---|
  | `background` | `grid` · `glow` · `grid+glow` · `flat` · `paper` · `gradient` | técnico · cálido · técnico con aperturas brillantes · minimal · editorial claro · social/energético |
  | `align` / `statementAlign` | `start` · `center` | asimétrico y directo · editorial y simétrico |
  | `statementSize` | `h1` · `hero` | hero solo si los hooks son de ≤ 5 palabras (el bloque lo respeta solo) |
  | `headlineCase` | `none` · `uppercase` | mayúsculas = energía; las citas quedan en caja normal |
  | `accentStyle` | `color` · `underline` · `highlight` · `italic` | sobrio · editorial · social · literario |
  | `textReveal` | `mask` · `fade` · `rise` · `blur` | preciso · calmo · enérgico · suave (con moderación) |
  | `kicker` · `cards` · `density` | `line/dot/none` · `outline/filled/none` · `airy/regular/compact` | estructura, aire y peso visual |
- **Motion** — la personalidad en números, no en adjetivos:
  - productive (B2B, sobrio): enter 450-550 ms, `enter` = power3.out, sin overshoot, transición por defecto `cut`.
  - balanced (editorial): enter 600-700 ms, stagger amplio, `crossfade` por defecto.
  - expressive (social): enter 380-450 ms, stagger corto, `push` por defecto; `expressive` (overshoot) SOLO en momentos lúdicos aprobados, nunca en texto.
- `motion.principles` y `motion.forbidden` desde lo que se ve en las referencias; si no se puede inferir: "ASK ME".
- `audio.voice.consentOnFile` solo `true` si hay contrato de voz.

## Paso 3 — LOOK.md y bloques firma
- Completá `brands/<slug>/LOOK.md`: en una frase · qué la hace distinta de cada otra marca · movimientos firma (apertura, texto, dato, cierre) · referencias (qué sí, qué no) · Sí · Nunca. Es lo que leen los agentes antes de diseñar.
- Al menos UN bloque firma en `brands/<slug>/blocks/`: lo más rentable es la apertura (`logo-sting.html`, mismo nombre que el del engine → lo reemplaza solo para esta marca). Un bloque exclusivo (`<slug>-<algo>.html`) para el movimiento más característico de la marca. Partí de un bloque del engine: mismo contrato (`<template>`, `#root` con `container-type: size`, `BM.vars(defaults, window.__hyperframes)`, una timeline pausada en `window.__timelines["__ID__"]`, solo tokens y `BM.*`), defaults como placeholders visibles.
- `node scripts/blocks-catalog.mjs` para sumarlos al catálogo.

## Paso 4 — Generar y verificar
```bash
npm run brand -- <slug>          # valida (contraste del look incluido) y genera brands/<slug>/dist + índices
npm run frames -- _galeria-bloques   # solo si la galería es de esta marca; si no:
npm run brand:compare -- _galeria-bloques --brands <slug>,<otras>             # 16:9
npm run brand:compare -- _galeria-bloques --brands <slug>,<otras> --format portrait
```
- `brands/<slug>/dist/contrast-report.md`: todo par en FALLA se corrige antes de seguir.
- **Mirá la comparación** (`projects/_galeria-bloques/review/compare/compare-*.jpg`) con el subagente `director-de-arte`: si la marca nueva se ve "hermana" de otra, cambiá el look (no solo colores) hasta que se distinga en composición y comportamiento. El borde amarillo marca los bloques firma.
- Si hay piezas abiertas de esta marca: `npm run build:roots -- <proyecto> --rebrand` SOLO con aprobación del director de arte (queda en su CHANGELOG).

## Paso 5 — Entregar
Mostrá: board (`brands/<slug>/dist/brand-board.html`), reporte de contraste, las dos hojas de comparación, LOOK.md y la lista de lo que quedó en "ASK ME"/PENDIENTE. El director de arte aprueba antes de producir con esta marca.
