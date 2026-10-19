# motion-harness-kit

**Kit harness para producir motion graphics de tecnología con IA (Claude Code + HyperFrames), con tu marca y un pipeline de producción profesional.**

Lo que muestran los tutoriales ("pedile a Opus un video y sale un MP4") es real, pero sin harness da resultados genéricos, irrepetibles y sin control de calidad. Este kit convierte esa capacidad en un proceso de equipo:

- **Marca como código:** un solo `brand/brand.config.json` → tokens CSS/JS, `frame.md` (HyperFrames), `MOTION.md` (packs de skills), theme de Remotion, brand board y reporte de contraste WCAG.
- **13 bloques de marca** parametrizables (títulos, datos, código, terminal, gráficos, pasos, comparaciones, citas, lower thirds, logo, cierre) que se adaptan solos a **16:9, 9:16 y 1:1**.
- **Pipeline con gates humanos** (brief → guion → storyboard → animatic → build → revisión → entrega) con plantillas, 7 skills (`/marca`, `/brief`, `/guion`, `/storyboard`, `/producir`, `/revisar`, `/entregar`) y 8 subagentes por rol.
- **QA automático:** lint/check de HyperFrames, presupuesto de lectura por escena, specs de plataforma, loudness, negros/congelados, heurística de fotosensibilidad (WCAG 2.3.1) y contact sheets.
- **Gobernanza:** versiones fijadas, telemetría apagada, comandos riesgosos bloqueados, ledger de procedencia, checklist legal.

> La guía completa de uso (de conceptos básicos a operación enterprise) está en `docs/GUIA.md` y en la versión publicada que acompaña este kit.

---

## Inicio rápido

Requisitos: Node ≥ 22, ffmpeg/ffprobe, Claude Code. (Chrome headless lo descarga HyperFrames la primera vez, o usá `HYPERFRAMES_BROWSER_PATH`.)

```bash
npm install                 # versiones exactas (hyperframes 0.8.174, gsap 3.14.2, fuentes OFL)
npm run doctor              # verifica entorno, marca, skills y privacidad
npm run brand               # genera brand/dist + MOTION.md desde brand.config.json
npm run frames -- _galeria-bloques            # ver los 13 bloques con tu marca (PNG + contact sheet)
npm run new -- mi-primer-video --type explainer
```

Después, en Claude Code dentro de esta carpeta: `/marca` (una vez), y por cada pieza `/brief` → `/guion` → `/storyboard` → `/producir` → `/revisar` → `/entregar`.

## Setear tu marca

1. **Con Claude:** `/marca` hace una entrevista en dos tandas, pide hex reales, fuentes con licencia, SVG del logo y 3-5 referencias, y completa el JSON.
2. **A mano:** editá `brand/brand.config.json` (tiene `$schema` para autocompletar) y corré `npm run brand`. Si el JSON tiene errores o contraste insuficiente, el comando lo dice.
3. **Fuentes:** `"source": "fontsource"` + `"package": "@fontsource/<familia>"` (OFL), o `"source": "local"` + archivos en `brand/fonts/` y `"files": {"400": "Mi-Regular.woff2"}`. **Confirmá que la licencia cubra video.**
4. **Logo:** SVG en `brand/logo/`. Para animarlo por partes marcá `<g data-part="mark">` y `<g data-part="wordmark">`. Sin logo todavía: `npm run brand:logo` genera un placeholder.
5. **Aplicarla a proyectos existentes:** `npm run build:roots -- <proyecto>` (re-sincroniza la marca; las escenas no se tocan).

Demo de rebranding: `brand/examples/editorial-claro.json` es otra marca completa (clara, serif, motion más pausado). `node scripts/brand-apply.mjs --config brand/examples/editorial-claro.json` + `npm run build:roots -- <proyecto>` y la misma pieza cambia de identidad sin tocar una escena. Volvé con `npm run brand`.

## Estructura

```
brand/
  brand.config.json        ← fuente única de verdad (identidad, color, tipografía, logo, motion, layout, formatos, audio, captions, legal)
  brand.schema.json        ← autocompletado/validación en el editor
  logo/ fonts/ references/ examples/
  dist/                    ← GENERADO: tokens.css, tokens.js, frame.md, brand-rules.md, remotion-theme.ts, brand-board.html, contrast-report.md, fonts/, logo/, vendor/
engine/
  blocks/*.html            ← 13 bloques de marca (sub-composiciones HyperFrames) + README (catálogo generado)
  runtime/bm-motion.js     ← helpers de motion que leen los tokens (BM.revealLines, countUp, typeText…)
projects/
  _galeria-bloques/        ← todos los bloques, para revisar la marca
  2026-10-19_ejemplo-servidor-mcp/   ← EJEMPLO RESUELTO de punta a punta (brief, claims, guion, storyboard, scenes.json, renders v001-v00n, QA, changelog)
  <fecha>_<slug>/          ← tus piezas (npm run new)
templates/                 ← brief, guion 2 columnas, storyboard ejecutable, shot list, review, anti-slop (28 puntos), QA, legal, entrega, naming, RACI, procedencia
delivery/specs.json        ← specs 2026 por plataforma (YouTube, Shorts, Reels, TikTok, LinkedIn, X)
scripts/                   ← brand-apply, new-project, build-roots, frames, render, qa, loudnorm, master, doctor, blocks-catalog, placeholder-logo
.claude/                   ← settings (permisos + hook), skills (7), agents (8), hooks
CLAUDE.md · MOTION.md · brand.md
docs/                      ← GUIA.md + research (7 informes) + imágenes
```

## Anatomía de una pieza

```
projects/2026-10-19_mi-video/
  00_brief.md  01_guion.md  02_storyboard.md  03_shot-list.csv   ← preproducción (gates G0-G5)
  research/claims.csv                                             ← cada número con fuente
  scenes.json                                                     ← plan de escenas ejecutable (bloque + vars + duración)
  comp/                                                           ← proyecto HyperFrames maestro (16:9)
    index.html            (GENERADO)   compositions/<escena>.html (tuyo)   brand/ (sincronizado)   assets/
  formats/portrait|square/                                        ← variantes GENERADAS desde el maestro
  renders/<slug>_<formato>_v###.mp4   review/ (frames, R1.md, CHANGELOG.md)   qa/   delivery/   PROVENANCE.md
```

`scenes.json` es el contrato entre el storyboard y el render:

```json
{ "id": "s04-dato", "block": "stat-hit", "duration": 5,
  "vars": { "value": 62, "suffix": "%", "label": "menos latencia", "source": "Fuente: benchmark interno Q3 (C-004)" },
  "formats": { "portrait": { "vars": { "label": "menos latencia" } } },
  "notes": "VO: '…62 por ciento menos…' · acceptance: el número es el único acento" }
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run doctor` | Chequea Node, ffmpeg, HyperFrames fijado, marca, skills, privacidad |
| `npm run brand` / `brand:check` | Genera / valida la marca (contraste WCAG, easings, campos) |
| `npm run new -- <slug> --type <t>` | Nueva pieza: `explainer`, `launch`, `social`, `tutorial`, `data`, `overlay` |
| `npm run build:roots -- <p> [--reset <id>]` | `scenes.json` → `comp/` + `formats/` + avisos de presupuesto de lectura |
| `npm run frames -- <p> [--format portrait]` | Frame clave por escena + contact sheet (styleframes reales) |
| `npm run render -- <p> [--quality draft\|standard\|high] [--alpha]` | Lint → render versionado por formato → QA |
| `npm run qa -- <p\|video> [--platform reels]` | QA técnico con reporte `.md`/`.json` |
| `npm run loudnorm -- <video>` | Normaliza a −14 LUFS / −1 dBTP (dos pasadas) |
| `npm run master -- <render> <dir> [youtube\|vertical]` | ProRes 422 HQ + H.264 BT.709 faststart |
| `node scripts/blocks-catalog.mjs` | Regenera el catálogo de bloques |

Studio de HyperFrames para ajustes visuales finos: `cd projects/<p>/comp && npx hyperframes preview`.

## Decisiones de diseño (y por qué)

- **HyperFrames como motor primario:** es lo que usa el flujo del video, es Apache-2.0 sin costo por seat, está pensado para agentes (skills oficiales, lint/check/snapshot) y es HTML/CSS (lo dominan diseñadores web). **Contras asumidos:** pre-1.0 con releases diarios (por eso versión exacta fijada), telemetría por defecto (apagada por el kit), depende de GSAP (licencia propia, no OSI). **Remotion** es la alternativa madura si tu equipo es React-first: el kit genera `brand/dist/remotion-theme.ts`, pero exige Company License desde 4 personas en la empresa (ver guía).
- **Tamaños en `cqmin` + container queries:** una escena escrita una vez funciona en 16:9, 9:16 y 1:1; el vertical escala la tipografía ×1,22 y respeta la safe zone universal de Reels/TikTok/Shorts.
- **Bloques que se copian, no librería opaca:** la escena arranca desde un bloque probado y después es editable por el agente o el motion designer.
- **Determinismo y offline:** GSAP, fuentes y logo se vendorizan en cada proyecto; nada se baja en el render.
- **Gates humanos:** la IA abarata construir, no aprobar. Mensaje, claims, gusto final y publicación son humanos.

## Limitaciones conocidas (honestas)

- El QA de fotosensibilidad es una **heurística de frame completo**; para piezas sensibles corré EA IRIS o PEAT.
- Las specs de TikTok, Reels, LinkedIn y X cambian seguido y no todas están documentadas oficialmente (`verified: false` en `delivery/specs.json`).
- El kit no incluye música ni voz: integrá proveedores con licencia comercial (ver guía) y registralos en `PROVENANCE.md`.
- Los bloques cubren el 80 % de un explainer tech; looks de autor, 3D o personajes requieren escenas custom (o After Effects/Blender).
- La marca por defecto (`TuMarca`) es un placeholder neutro: Inter/Space Grotesk son elecciones seguras, no distintivas.

## Licencias de terceros

HyperFrames (Apache-2.0) · GSAP 3.14 (GSAP Standard "no charge" License — revisala con legal) · Inter, Space Grotesk, JetBrains Mono, Newsreader, IBM Plex (SIL OFL 1.1 vía @fontsource). Formato `frame.md` y contrato de theme: HyperFrames. Convención `MOTION.md`/`brand.md`: compatible con `charlie947/motion-graphics-skills` (MIT).
