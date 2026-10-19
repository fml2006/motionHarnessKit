# motion-harness-kit

**Kit harness para producir motion graphics de tecnología con IA (Claude Code + HyperFrames), con tu marca y un pipeline de producción profesional.**

Lo que muestran los tutoriales ("pedile a Opus un video y sale un MP4") es real, pero sin harness da resultados genéricos, irrepetibles y sin control de calidad. Este kit convierte esa capacidad en un proceso de equipo:

- **Marca como código:** un solo `brand/brand.config.json` → tokens CSS/JS, `frame.md` (HyperFrames), `MOTION.md` (packs de skills), theme de Remotion, brand board y reporte de contraste WCAG.
- **13 bloques de marca** parametrizables (títulos, datos, código, terminal, gráficos, pasos, comparaciones, citas, lower thirds, logo, cierre) que se adaptan solos a **16:9, 9:16, 1:1 y 4:5**.
- **Pipeline con gates humanos** (brief → guion → storyboard → animatic → build → revisión → entrega) con plantillas, 7 skills propias (`/marca`, `/brief`, `/guion`, `/storyboard`, `/producir`, `/revisar`, `/entregar`), 8 subagentes por rol y las 12 skills oficiales de HyperFrames fijadas a un commit (los workflows end-to-end solo corren si un humano los invoca).
- **Gates que frenan de verdad:** placeholders y cifras sin claim firmado bloquean el render final; lint/check por exit code; QA con FAIL corta el script; la marca de cada pieza queda bloqueada (`brandLock`).
- **QA y entrega automáticos:** presupuesto de lectura por escena, specs por plataforma, loudness, negros/congelados, heurística de fotosensibilidad (WCAG 2.3.1), contact sheets, y una cadena de entrega sin pasos manuales (master sin pérdida → loudness → archivo + entregable → re-medición → QA).
- **Gobernanza (mitigación, no blindaje):** versiones fijadas, telemetría apagada, comandos de nube/publicación/feedback denegados en Claude Code, ledger de procedencia, checklist legal y registro de horas. Los controles de organización que faltan están listados en [Gobernanza](#gobernanza-qué-cubre-el-kit-y-qué-tiene-que-sumar-la-organización).

> La guía completa de uso (de conceptos básicos a operación enterprise) está en `docs/GUIA.md` y en la versión publicada que acompaña este kit.

---

## Inicio rápido

**Prerrequisitos**

| Herramienta | Versión | Para qué |
|---|---|---|
| Node.js | ≥ 22 | Scripts del kit y CLI de HyperFrames |
| ffmpeg + ffprobe | 6 o superior (la versión queda registrada en `doctor` y en cada QA) | Render, loudness, master, QA |
| Claude Code | Plan comercial (Team Premium / Enterprise o API) para material de clientes | Agente, skills, subagentes, hooks |
| git | cualquiera reciente | Versionado de proyectos, tags `rvw-`/`lock-`/`dlv-` |
| Docker | opcional | `--docker`: render idéntico en todas las máquinas |

Chrome headless lo descarga HyperFrames la primera vez (o usá `HYPERFRAMES_BROWSER_PATH`).

```bash
npm install                 # versiones exactas (hyperframes 0.8.174, gsap 3.14.2, fuentes OFL)
npm run setup               # una vez por máquina: apaga la telemetría de HyperFrames también fuera de Claude Code
npm run doctor              # verifica entorno, marca, skills y privacidad
npm run selftest            # prueba de punta a punta: render → loudness → master → QA en un proyecto temporal
npm run brand               # genera brand/dist + MOTION.md desde brand.config.json
npm run frames -- _galeria-bloques            # ver los 13 bloques con tu marca (PNG + contact sheet)
npm run new -- mi-primer-video --type explainer
```

Después, en Claude Code dentro de esta carpeta: `/marca` (una vez), y por cada pieza `/brief` → `/guion` → `/storyboard` → `/producir` → `/revisar` → `/entregar`.

## Flujo diario: quién hace qué

| Paso | Lo hace | Cómo | Gate / aprueba |
|---|---|---|---|
| Crear la pieza | Claude (o humano) | `/brief` → `npm run new -- <slug> --type <t>` | — |
| Brief, confidencialidad (§11b), KPIs | Humano (productor) con borrador de Claude | `/brief`, subagente `productor` | G0 · productor + cliente |
| Claims y fuentes | Claude prepara · **SME firma** | subagente `investigador` → `research/claims.csv` | G1 · SME |
| Treatment y guion a dos columnas | Claude escribe · humano elige hook y aprueba | `/guion` | G2-G3 · director creativo |
| Storyboard ejecutable + styleframes | Claude | `/storyboard` → `scenes.json`, `npm run frames` | G4-G5 · director creativo |
| Animatic y build | Claude | `/producir` → `npm run render -- <p> --quality draft` | G6-G7 · director creativo |
| Feedback y rondas | Humano da notas (TC + qué + por qué) · Claude aplica | `/revisar`, `review/R<n>.md`, `review/CHANGELOG.md` | G8 · productor + cliente |
| Picture lock | **Humano** | acta en `review/`, tag `lock-vNN` | G9 · aprobador único |
| VO, música, mezcla | Humano (editor de sonido) + proveedores con licencia | `comp/assets/audio/`, `PROVENANCE.md` | G10 |
| Captions | Claude prepara `captions.srt` · **humano revisa** | `captions.srt` en la raíz del proyecto | G11 |
| Master, entregables, QA | Claude ejecuta | `npm run deliver -- <p> --platform …` | G12-G14 · QA + Legal |
| Subir / publicar | **Humano** (nunca el agente) | según `delivery/delivery-checklist.md` | G15 · productor |
| Registrar horas | **Cada persona** | `review/HORAS.csv` | Métrica horas por minuto terminado |

## Setear tu marca

1. **Con Claude:** `/marca` hace una entrevista en dos tandas, pide hex reales, fuentes con licencia, SVG del logo y 3-5 referencias, y completa el JSON.
2. **A mano:** editá `brand/brand.config.json` (tiene `$schema` para autocompletar) y corré `npm run brand`. Si el JSON tiene errores o contraste insuficiente, el comando lo dice.
3. **Fuentes:** `"source": "fontsource"` + `"package": "@fontsource/<familia>"` (OFL), o `"source": "local"` + archivos en `brand/fonts/` y `"files": {"400": "Mi-Regular.woff2"}`. **Confirmá que la licencia cubra video.**
4. **Logo:** SVG en `brand/logo/`. Para animarlo por partes marcá `<g data-part="mark">` y `<g data-part="wordmark">`. Sin logo todavía: `npm run brand:logo` genera un placeholder.
5. **Proyectos existentes y `brandLock`:** cada pieza queda atada a la versión de marca con la que se aprobó (`scenes.json → brandLock`: nombre, versión y hash de `brand/dist`). Si cambiás la marca, `build:roots` y `render` se frenan para no cambiarle la identidad en silencio a una pieza ya aprobada. Para aplicar la marca nueva a una pieza puntual, con aprobación del director de arte: `npm run build:roots -- <proyecto> --rebrand` (queda anotado en `review/CHANGELOG.md`).
6. **Varias marcas o clientes:** un repo (o una rama) por marca. `brand-apply --config` cambia la marca de todo el repo; `brandLock` protege los re-renders, pero no reemplaza separar clientes.

Demo de rebranding: `brand/examples/editorial-claro.json` es otra marca completa (clara, serif, motion más pausado). `node scripts/brand-apply.mjs --config brand/examples/editorial-claro.json` + `npm run build:roots -- <proyecto> --rebrand` y la misma pieza cambia de identidad sin tocar una escena. Volvé con `npm run brand` + `--rebrand` otra vez (o con `git checkout` de `scenes.json`).

## Estructura

```
brand/
  brand.config.json        ← fuente única de verdad (identidad, color, tipografía, logo, motion, layout, formatos, audio, captions, legal)
  brand.schema.json        ← autocompletado/validación en el editor
  logo/ fonts/ references/ (frames de referencia del motion) examples/
  dist/                    ← GENERADO: tokens.css, tokens.js, frame.md, brand-rules.md, remotion-theme.ts, brand-board.html, contrast-report.md, fonts/, logo/, vendor/
engine/
  blocks/*.html            ← 13 bloques de marca (sub-composiciones HyperFrames) + README (catálogo generado)
  runtime/bm-motion.js     ← helpers de motion que leen los tokens (BM.revealLines, countUp, typeText…)
projects/
  _galeria-bloques/        ← todos los bloques, para revisar la marca
  2026-10-19_ejemplo-servidor-mcp/   ← EJEMPLO de referencia (brief, claims, guion, storyboard, scenes.json, renders, QA, changelog); ver su README para lo que cubre y lo que no
  <fecha>_<slug>/          ← tus piezas (npm run new)
templates/                 ← brief (con confidencialidad), guion 2 columnas, storyboard ejecutable, shot list, review, anti-slop (28 puntos), QA, legal, entrega, naming y versionado, RACI, procedencia, horas
delivery/specs.json        ← specs 2026 por plataforma (YouTube, Shorts, Reels, TikTok, LinkedIn, Instagram feed, X, evento, broadcast EBU) con su objetivo de loudness
scripts/                   ← brand-apply, new-project, build-roots, frames, render, deliver, qa, loudnorm, master, doctor, selftest, blocks-catalog, placeholder-logo, install-hf-skills + patch-hf-skills
.claude/                   ← settings (permisos + hook), skills (7 propias + 12 de HyperFrames fijadas y parcheadas), agents (8), hooks
CLAUDE.md · MOTION.md · brand.md
docs/                      ← GUIA.md + research (7 informes) + imágenes
```

## Anatomía de una pieza

```
projects/2026-10-19_mi-video/
  00_brief.md  01_guion.md  02_storyboard.md  03_shot-list.csv   ← preproducción (gates G0-G5)
  research/claims.csv                                             ← cada número con fuente, estado y firma del SME
  scenes.json                                                     ← plan de escenas ejecutable (bloque + vars + duración + claims) + brandLock
  captions.srt                                                    ← opcional: captions quemados en vertical / 4:5
  comp/                                                           ← proyecto HyperFrames maestro (16:9, o 9:16 en piezas social)
    index.html            (GENERADO)   compositions/<escena>.html (tuyo)   brand/ (sincronizado)   assets/
  formats/portrait|square|feed/                                   ← variantes GENERADAS desde el maestro
  renders/<slug>_<formato>_v###.mp4                               ← versión interna de render (fuera de git)
  review/ (frames, R1.md, CHANGELOG.md, HORAS.csv)   qa/   PROVENANCE.md
  delivery/ (*_ARCHIVE.mov ProRes 422 HQ, *_DELIVERY.mp4 por plataforma, reporte de entrega)
```

`scenes.json` es el contrato entre el storyboard y el render:

```json
{ "id": "s04-dato", "block": "stat-hit", "duration": 5,
  "vars": { "value": 62, "suffix": "%", "label": "menos latencia", "source": "Fuente: benchmark interno Q3 (C-004)" },
  "claims": ["C-004"],
  "formats": { "portrait": { "vars": { "label": "menos latencia" } } },
  "notes": "VO: '…62 por ciento menos…' · acceptance: el número es el único acento" }
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run setup` | Una vez por máquina (`doctor --fix`): `hyperframes telemetry disable` y chequeo de privacidad |
| `npm run doctor` | Chequea Node, ffmpeg, Chrome, HyperFrames fijado, marca, skills y privacidad |
| `npm run selftest` | Prueba de punta a punta de la cadena de render y entrega en un proyecto temporal |
| `npm run brand` / `brand:check` | Genera / valida la marca (contraste WCAG, easings, campos) |
| `npm run new -- <slug> --type <t>` | Nueva pieza: `explainer`, `launch`, `social`, `tutorial`, `data`, `overlay` |
| `npm run build:roots -- <p> [--reset <id>] [--strict] [--rebrand]` | `scenes.json` → `comp/` + `formats/`, avisos de lectura; `--strict` = gate de contenido (placeholders, claims, tokens, captions) |
| `npm run frames -- <p> [--format portrait]` | Frame clave por escena + contact sheet (styleframes reales) |
| `npm run render -- <p> [--formats …] [--quality draft\|standard\|high] [--alpha] [--docker]` | Build → lint/check (por exit code) → render versionado por formato → QA; sale con error si algo falla. `high` usa `--strict` |
| `npm run deliver -- <p> --platform youtube,reels[,linkedin=square] [--lufs -16]` | Entrega: render intermedio ProRes 4444 → mezcla PCM → loudness en dos pasadas → `*_ARCHIVE.mov` (ProRes 422 HQ + PCM 24) + `*_DELIVERY.mp4` → re-medición → QA por plataforma |
| `npm run qa -- <p\|video> --platform <p> [--lufs n] [--allow-silent]` | QA técnico de un archivo, con reporte `.md`/`.json` |
| `npm run loudnorm -- <video>` | Normalización suelta para archivos externos (la entrega ya la incluye) |
| `node scripts/blocks-catalog.mjs` | Regenera el catálogo de bloques |
| `bash scripts/install-hf-skills.sh` | Reinstala las skills de HyperFrames fijadas a `HF_SHA` y aplica el parche local |

Studio de HyperFrames para ajustes visuales finos: `cd projects/<p>/comp && npx hyperframes preview` (fuera de Claude Code, corré antes `npm run setup` o exportá `HYPERFRAMES_NO_TELEMETRY=1 DO_NOT_TRACK=1`).

## Gobernanza: qué cubre el kit y qué tiene que sumar la organización

El kit **mitiga**; no blinda. Lo que hace:

- **Permisos de Claude Code** (`.claude/settings.json`): deniega `hyperframes publish | cloud | lambda | cloudrun | auth | feedback | upgrade | skills | telemetry enable` en todas las formas de invocación conocidas (`npx hyperframes`, `npx hyperframes@<versión>`, `npm exec`, `node_modules/.bin/hyperframes`, `pnpm dlx`, `yarn dlx`, `bunx`, y comodines); pide permiso para `hyperframes add | tts`, `npm install` y para editar `package.json`, `scripts/**` y `.claude/**` (así el agente no puede escribirse un script que esquive un deny).
- **Telemetría:** `HYPERFRAMES_NO_TELEMETRY=1` y `DO_NOT_TRACK=1` en el `env` de Claude Code, y `npm run setup` ejecuta `hyperframes telemetry disable` para que también quede apagada cuando un humano corre `npx hyperframes preview` en su terminal. La variable de entorno de settings **solo rige dentro de Claude Code**.
- **Supply chain:** versiones exactas (`package.json`), skills fijadas a un commit con lockfile y parche local (`scripts/patch-hf-skills.mjs`: workflows solo por invocación explícita, feedback neutralizado), GSAP y fuentes vendorizados.

Lo que **tiene que sumar la organización** para un uso enterprise:

1. **Managed settings de Claude Code** a nivel organización (no editables por el proyecto) con los mismos deny, para que un cambio local en `.claude/settings.json` no los desactive.
2. **Bloqueo de egress** en la red o el proxy de las máquinas de producción hacia los hosts que usa la CLI y que el kit no necesita: `us.i.posthog.com` (telemetría), `api.heygen.com`, `api2.heygen.com`, `api-canary.heygen.com`, `app.heygen.com`, `hyperframes.heygen.com`, `static.heygen.ai`, `hyperframes.dev` (cloud, publish, feedback, assets alojados). Si se usa `media-use` con aprobación, abrir solo lo necesario (`generativelanguage.googleapis.com`, `api.openverse.org`, `freesound.org`, `huggingface.co`).
3. **Plan comercial y DPA** con Anthropic (Team Premium / Enterprise o API con Commercial Terms; ZDR si el cliente lo exige) y consentimiento del cliente para procesar su material (`00_brief.md` §11b).
4. **Revisión de las skills de terceros** antes de cada actualización de `HF_SHA` (scripts que traen, instrucciones nuevas de red o feedback) y prueba golden de la galería.

## Decisiones de diseño (y por qué)

- **HyperFrames como motor del kit, aunque el research recomendó Remotion.** El informe comparativo (`docs/research/03-remotion-y-comparativa.md`) recomendó **Remotion como motor primario** para un equipo de contenido tech (maduro desde 2021, Lambda distribuido probado, plantillas tipadas, skills oficiales para Claude Code; el costo de licencia es marginal para una empresa) y HyperFrames como secundario (pre-1.0, roadmap controlado por HeyGen, telemetría activada por defecto, y "sin camino de vuelta" hacia Remotion). El kit eligió HyperFrames igual, como decisión explícita y revisable, porque es el flujo exacto del video que replica, es Apache-2.0 sin costo por seat (Remotion exige Company License desde 4 personas), es HTML/CSS (lo dominan diseñadores web) y trae tooling pensado para agentes (lint, check, snapshot, skills). **Contras asumidos:** pre-1.0 con releases diarios (versión exacta fijada), telemetría por defecto (apagada y mitigada), depende de GSAP (licencia propia, no OSI). **Si tu equipo elige Remotion, del kit se lleva** la marca como código (`brand/brand.config.json` → `brand/dist/remotion-theme.ts`), las plantillas, skills de preproducción, subagentes, `qa.mjs`, `loudnorm`/`master` y `delivery/specs.json`; **se pierden** los 13 bloques, `build:roots`, `frames`, `render`, `deliver` (la parte de render) y los gates de lint/check, que son específicos de HyperFrames.
- **Tamaños en `cqmin` + container queries:** una escena escrita una vez funciona en 16:9, 9:16 y 1:1; el vertical escala la tipografía ×1,22 y respeta la safe zone universal de Reels/TikTok/Shorts.
- **Bloques que se copian, no librería opaca:** la escena arranca desde un bloque probado y después es editable por el agente o el motion designer.
- **Determinismo y offline:** GSAP, fuentes y logo se vendorizan en cada proyecto; nada se baja en el render.
- **Gates humanos:** la IA abarata construir, no aprobar. Mensaje, claims, gusto final y publicación son humanos.

## Limitaciones conocidas (honestas)

- El QA de fotosensibilidad es una **heurística de frame completo**; para piezas sensibles corré EA IRIS o PEAT.
- Las specs de TikTok, Reels, LinkedIn y X cambian seguido y no todas están documentadas oficialmente (`verified: false` en `delivery/specs.json`).
- El kit no incluye música ni voz: integrá proveedores con licencia comercial (ver guía) y registralos en `PROVENANCE.md`.
- Transiciones entre escenas implementadas: `cut`, `crossfade`, `push`, `mask-wipe`. `zoom-through` y `match-cut` se hacen en el NLE.
- Captions quemados: a partir de un `captions.srt`/`.vtt` que hay que preparar (p. ej. con `npx hyperframes transcribe` sobre la VO final) y revisar a mano; no hay estilos de captions animados por palabra.
- Sin versiones por idioma automáticas: otro idioma = otro `scenes.json` (o proyecto) con sus textos, VO y captions.
- El gate de claims mira los bloques de cifras y las escenas que declaran `claims`; una cifra escrita en un bloque de texto o una escena custom depende de la revisión humana.
- Reproducibilidad exacta entre máquinas solo con `--docker`; sin Docker, Chrome y ffmpeg locales pueden dar diferencias mínimas (la versión queda registrada en cada QA).
- Los bloques cubren el 80 % de un explainer tech; looks de autor, 3D o personajes requieren escenas custom (o After Effects/Blender).
- La marca por defecto (`TuMarca`) es un placeholder neutro: Inter/Space Grotesk son elecciones seguras, no distintivas.

## Licencias de terceros

HyperFrames (Apache-2.0) · GSAP 3.14 (GSAP Standard "No Charge" License, no OSI, con cláusula que excluye productos que compiten con Webflow — revisala con Legal) · Inter, Space Grotesk, JetBrains Mono, Newsreader, IBM Plex (SIL OFL 1.1 vía @fontsource). Formato `frame.md` y contrato de theme: HyperFrames. Convención `MOTION.md`/`brand.md`: compatible con `charlie947/motion-graphics-skills` (MIT).
