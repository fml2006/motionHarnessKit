---
name: marca
description: Crear o editar una marca del estudio multimarca (brands/<slug>/) con estilo propio. Entrevista + logo/fuentes/referencias → brand.config.json (colores, tipografía, motion y LOOK) + LOOK.md + bloques firma → npm run brand → brand board, contraste y comparación contra las otras marcas para aprobar. Importa un brandkit completo con `/marca desde brandkit/<slug>` (plantilla en brandkit/_plantilla/). Usar al empezar con el kit, al sumar un cliente o una marca nueva, cuando digan "cargá mi brandkit", o cuando digan "seteá mi marca", "aplicá mi branding", "otra marca", "que no se vea igual que…", "cambiá la paleta/tipografía/motion/estilo".
---

# /marca — una marca con estilo propio dentro del estudio

El kit es un **estudio multimarca**: cada marca vive en `brands/<slug>/` (`brand.config.json`, `logo/`, `references/`,
`LOOK.md`, `blocks/`, y `dist/` generado) y cada pieza elige UNA (`scenes.json → brand`). Colores y fuentes solos no
alcanzan: con los mismos 13 bloques, dos marcas que solo cambian paleta se ven "hermanas". Lo que las separa es el
**look** (fondo, alineación, caja de titulares, forma del acento, cómo entra el texto, kicker, tarjetas, densidad),
el **motion** (duraciones, curvas, stagger) y sus **bloques firma**. Esta skill define las tres cosas con datos REALES.
Nunca rellenes un hueco con un supuesto: preguntá o dejá el placeholder marcado ("PENDIENTE").

Uso: `/marca` (pregunta qué marca), `/marca nueva <slug>`, `/marca <slug>` (editar), `/marca desde brandkit/<slug>` (importar un brandkit completo).

## Desde un brandkit (`/marca desde brandkit/<slug>`)
El brandkit (`brandkit/<slug>/BRANDKIT.md` + `logo/`, `fonts/`, `references/`; plantilla en `brandkit/_plantilla/`) reemplaza la entrevista: solo preguntás lo que falta.
1. `npm run brandkit:check -- <slug>`. Con ✗, mostrá la lista y frená: lo corrige la persona en el brandkit, vos no completás datos de marca. Los ⚠ siguen: anotalos para el resumen final. Para el detalle estructurado: `--json`.
2. Leé `BRANDKIT.md` completo y las referencias (mirá las imágenes; los links solo como texto: no navegues sitios del cliente sin permiso §11b).
3. Juntá en UNA tanda (AskUserQuestion o lista) solo lo que quedó vacío, en `no sé` o ambiguo. `que decida el DA` NO se pregunta: lo proponés vos y lo aprueba el DA en el Paso 5.
4. Si `brands/<slug>/` no existe: `npm run brand:new -- <slug> --from <la marca existente más parecida> --name "<Nombre>"` (+ `--default` si el brandkit lo pide). Si existe, avisá que vas a actualizarla (`brandLock` frena sus piezas hasta un `--rebrand` aprobado).
5. Copiá `logo/*.svg` a `brands/<slug>/logo/` (sin logos: `npm run brand:logo -- --brand <slug> --mark bracket|pulse|ring` y anotalo PENDIENTE), `fonts/*` a `brands/<slug>/fonts/` y `references/*` a `brands/<slug>/references/`.
6. Traducí campo por campo y seguí con el Paso 2 (look y motion), el 3 (LOOK.md y bloques firma), el 4 (generar y verificar) y el 5 (entregar):

| Sección del brandkit | → `brands/<slug>/brand.config.json` |
|---|---|
| 1 Nombre, slug, aprobador | `meta.name`, `meta.slug`, `meta.owner` |
| 2 Qué hace, tagline, audiencia, personalidad, idioma, tono, sí/no | `identity.mission`, `identity.tagline`, `identity.audience`, `identity.personality[]`, `identity.voice.{language,register,tone,do[],dont[]}` |
| 3 Diferenciación | `LOOK.md` ("qué la hace distinta de…") + criterio del look |
| 4 Logo y su uso | `logo.*` (`clearSpaceRatio`, `minHeightPx1080`, `dont[]`, `sting.style`) + bloque firma `logo-sting` |
| 5 Colores (tabla), datos, gradiente, reglas | `colors.{background,surface,border,text,textMuted,primary,secondary,accent,danger,success,onPrimary}`, `colors.dataViz[]`, `colors.gradients.hero`, `colors.rules.notes`. Los vacíos se derivan de la paleta y se muestran como propuesta. `colors.code.*` se deriva y se valida por contraste |
| 6 Tipografía, caja | `typography.{display,body,mono}` (`family`, `weights`, `italic`, `source`: Google Fonts → `fontsource` + `npm install -E -D @fontsource/<fuente>@<versión exacta>`, que pide permiso; archivo propio → `local`) + `look.headlineCase` |
| 7 Look | `look.{background,align,statementAlign,accentStyle,textReveal,kicker,cards,density}` + `layout.radius` (rectas 0.2 · apenas 0.8 · redondeadas 1.5 · muy 2.5 cqmin en `md`) + `look.summary` |
| 8 Motion | `motion.personality`; velocidad: más rápida −15 % · más calma +20 % sobre las duraciones de esa personalidad; `motion.transitions.default`; `motion.forbidden[]` |
| 9 Referencias | `brands/<slug>/references/` + `LOOK.md` (qué sí / qué no) + decisiones de look y motion |
| 10 Bloques firma | `brands/<slug>/blocks/` (apertura `logo-sting.html`, cierre y un exclusivo `<slug>-<algo>.html`) |
| 11 Audio | `audio.music.{moods[],policy}`, `audio.sfx.style`, `audio.voice.{provider,voiceId,synthetic,consentOnFile}` (`consentOnFile: true` solo con contrato) |
| 12 Formatos | `formats[]` (los tildados; 16:9 siempre) + `captions.burnIn` |
| 13 Legal | `legal.aiDisclosure`, `legal.thirdPartyLogos`, `legal.fontsLicensedForVideo` (`false` si la licencia dice `no sé`, con aviso a Legal) |

Reglas de la importación:
- **Nunca cambies un hex de la marca sin aprobación.** Si un par no llega al contraste, proponé el ajuste mínimo (por ejemplo, oscurecer `textMuted` o usar el acento solo en texto grande), mostralo con el ratio y esperá el OK.
- **Lo que no esté en el brandkit queda PENDIENTE** en el resumen; no lo rellenes con un supuesto.
- **Al terminar,** agregá al final de `brandkit/<slug>/BRANDKIT.md` una línea `Importado a brands/<slug>/ el <fecha> (versión <x.y.z>)`. El brandkit queda como fuente de lo que pidió la marca.

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
