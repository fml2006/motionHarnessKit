# motion-harness-kit

**Un estudio de motion graphics dentro de Claude Code:** cargás tu marca una vez y cada video sale con el mismo estilo. Lo producen subagentes por rol, coordinados por un orquestador que frena para que una persona apruebe cada paso.

## Qué es

- **Motion graphics como código.** Claude escribe cada escena en HTML y GSAP, y HyperFrames la renderiza a MP4, cuadro por cuadro. El texto sale nítido, los colores son exactos y el mismo proyecto da siempre el mismo video. Funciona para explainers, datos, código, lanzamientos y piezas para redes.
- **Estudio multimarca.** Cada marca vive en `brands/<marca>/`: colores, tipografía, motion, un *look* propio (fondo, alineación, acento, cómo entra el texto) y escenas firma. Con los mismos 13 bloques, dos marcas no se ven iguales; dentro de una marca, todas las piezas comparten estilo.
- **Orquestador `/pieza`.** Lleva un video de punta a punta: brief → guion → storyboard → animatic → revisión → lock → entrega. En cada fase llama al subagente del rol (productor, investigador, guionista, director de arte, storyboarder, motion designer, sonido, QA) y frena en cada checkpoint para preguntar si aprobás, pedís cambios o pausás.
- **Controles que frenan.**
  - Ninguna cifra sale sin fuente firmada.
  - Los valores fuera de marca se detectan.
  - El QA técnico corre en cada render.
  - La entrega arma un master ProRes y los MP4 por plataforma con el volumen normalizado.
- **Lo que siempre decide una persona:** el mensaje, las cifras (las firma el experto), el look, cada aprobación y la publicación. Claude construye, no aprueba.

La guía completa (conceptos, roles, pipeline, legal, costos) está en `docs/GUIA.md`. Lo que se probó y lo que no, en `docs/VERIFICACION.md`.

## Cómo se usa: tres sesiones

```
Sesión 1 · una vez por máquina  → instala y verifica el kit                 → prompt de instalación (abajo)
Sesión 2 · una vez por marca    → carga tu marca desde un brandkit          → /marca desde brandkit/<slug>
Sesión 3+ · cada video          → produce con el orquestador                → /pieza nueva "<pedido>" --marca <slug>
```

### Antes de empezar

- **Equipo:** Mac o Linux. En Windows, WSL2 (no está probado).
- **Claude Code** instalado y con sesión iniciada. Para material de clientes, plan comercial: Team Premium, Enterprise o API.
- **Acceso al repo.** Si es privado, `gh auth login` o una clave SSH configurada.
- **Node 22, ffmpeg y git:** el prompt de instalación los revisa y te pide permiso antes de instalar lo que falte.

### Paso 1 · Instalar el kit con un prompt (sesión 1)

Abrí una terminal en la carpeta donde querés el kit (por ejemplo `~/Proyectos`), ejecutá `claude` y pegá este prompt. Si usás otro repo, cambiá la URL.

```text
Instalá y verificá el motion-harness-kit en esta máquina.
Repo: https://github.com/fml2006/motionHarnessKit

Trabajá en este orden. Si un paso falla, frená: mostrame la salida y proponé la solución antes de seguir.

1. Cloná el repo en ./motionHarnessKit. Si la carpeta ya existe, no la borres: entrá y corré git pull.
   Si git pide credenciales (repo privado), guiame con `gh auth login` o con una clave SSH. No guardes tokens en archivos.
2. Verificá y reportá la versión de git, Node (tiene que ser 22 o más), npm, ffmpeg y ffprobe.
   Si falta algo o la versión no alcanza, decime el comando para instalarlo en mi sistema (en Mac, con Homebrew)
   y esperá mi OK antes de instalar nada.
3. Dentro de ./motionHarnessKit: `npm ci` (versiones exactas del lockfile; no corras npm install ni npm update).
4. `npm run setup`: apaga la telemetría de HyperFrames y descarga el Chrome que usa el render.
5. `npm run doctor`: tiene que terminar en "Listo para producir". El aviso de marca placeholder es normal.
6. `npm run selftest`: prueba render → loudness → master → QA en un proyecto temporal.
   Tienen que dar OK todos los chequeos. Tarda unos minutos.
7. `npm run brand:check` y `npm run brand:list`.

No configures marcas, no crees piezas y no edites archivos del kit.
No ejecutes `hyperframes publish`, `cloud`, `lambda`, `auth`, `feedback`, `upgrade` ni `skills update`.

Al terminar, dame una tabla con paso, resultado y salida relevante, la ruta absoluta de la carpeta del kit
y el próximo paso: abrir una sesión nueva de Claude Code en esa carpeta y cargar la marca con /marca desde brandkit/<slug>.
```

Tarda unos 10 a 15 minutos, la mayor parte por el selftest. Al final tenés la ruta de la carpeta y una tabla con cada paso en OK.

### Paso 2 · Preparar tu brandkit

Un brandkit es una carpeta con un formulario (`BRANDKIT.md`), tus logos, tus fuentes y referencias de motion. Lo podés completar vos, tu diseñador o el cliente.

```bash
cd motionHarnessKit
npm run brandkit:new -- acme --name "Acme Cloud"   # crea brandkit/acme/ desde la plantilla
# completá brandkit/acme/BRANDKIT.md y poné los archivos en logo/, fonts/ y references/
npm run brandkit:check -- acme                     # ✗ bloquea, ⚠ queda pendiente o lo decide el director de arte
```

Qué va en cada parte y por qué está en `brandkit/README.md`. Un ejemplo completo, en `brandkit/_ejemplo-northline/BRANDKIT.md`.

### Paso 3 · Cargar la marca (sesión 2, nueva, abierta en la carpeta del kit)

```bash
cd ~/Proyectos/motionHarnessKit && claude
```

Pegá:

```text
/marca desde brandkit/acme
```

O, si preferís el pedido completo en palabras:

```text
Cargá la marca desde brandkit/acme/ siguiendo la skill /marca, sección "Desde un brandkit".
Corré npm run brandkit:check -- acme y, si hay ✗, frená y mostrame qué corregir.
Preguntame en una sola tanda lo que falte. Creá brands/acme/ con su look, su LOOK.md y al menos un bloque firma.
Corré npm run brand -- acme y la comparación de la galería contra las otras marcas.
Mostrame el brand board, el reporte de contraste y las hojas de comparación para aprobar.
No cambies ningún hex sin mi OK.
```

Al final te muestra:

- **El brand board**, con logo, paleta, contraste, tipografía y curvas.
- **La galería de 13 bloques con tu marca**, al lado de las otras.
- **Lo que quedó PENDIENTE.**

Lo aprueba el director de arte. Las marcas de ejemplo (`tumarca`, `northline`, `pulso`) se pueden borrar cuando tengas las tuyas; el paso a paso está en `docs/EMPEZAR.md`.

### Paso 4 · Producir un video (sesión 3 en adelante, en la carpeta del kit)

```text
/pieza nueva "Explainer de 60 s sobre cómo funciona nuestra API de pagos, para LinkedIn y Reels" --marca acme
```

- **Cómo avanza:** pasa por brief y claims, guion, storyboard (con frames reales), animatic, revisión, lock y entrega. En cada checkpoint te muestra qué mirar y te pregunta si aprobás, pedís cambios o pausás.
- **Pausar y retomar:** para seguir otro día, `/pieza continuar <proyecto>`. Para ver todas las piezas, `/pieza estado`.
- **Modo express:** para piezas internas o de redes de bajo riesgo, `--modo express` reduce el recorrido a 4 checkpoints.

### Problemas frecuentes

| Síntoma | Qué hacer |
|---|---|
| `git clone` pide usuario y contraseña | El repo es privado: `gh auth login` (y `gh auth setup-git`) o configurá una clave SSH y cloná con la URL `git@github.com:…` |
| Node más viejo que 22 | `brew install node@22` (Mac) o `nvm install 22` |
| Falta ffmpeg | `brew install ffmpeg` (Mac) · `sudo apt install ffmpeg` (Debian/Ubuntu) |
| `npm run setup` no puede descargar Chrome | Red con proxy o firewall: pedí acceso o indicá un Chrome existente con `MHK_BROWSER_PATH=/ruta/al/chrome` |
| Claude Code pide permiso para editar `scripts/`, `.claude/` o `package.json` | Es a propósito: son archivos de gobernanza. Aprobá solo si sabés por qué los toca |
| El build dice "La marca cambió desde que se bloqueó este proyecto" | Cambiaste la marca y la pieza está protegida. Si el DA aprueba usar la versión nueva: `npm run build:roots -- <proyecto> --rebrand` |
| El selftest o un render falla | Pegale la salida a Claude en la misma sesión; `npm run doctor` dice qué falta |

---

# Referencia

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

## Setear tu marca (o tus marcas)

El kit es un **estudio multimarca**: `brands/<marca>/` por marca, y cada pieza elige una con `--brand`. Trae tres de ejemplo bien distintas para que se vea la diferencia: `tumarca` (oscura técnica, default), `northline` (editorial clara) y `pulso` (social energética). `npm run brand:compare -- _galeria-bloques --brands tumarca,northline,pulso` las pone lado a lado sobre la misma pieza (`projects/_galeria-bloques/review/compare/`).

0. **Desde un brandkit (recomendado):** `npm run brandkit:new -- <slug>`, completás `brandkit/<slug>/BRANDKIT.md` + logos, fuentes y referencias, `npm run brandkit:check -- <slug>` y en Claude Code `/marca desde brandkit/<slug>`. Detalle en `brandkit/README.md`.
1. **Marca nueva:** `npm run brand:new -- <slug> --from <la más parecida> --name "Nombre"` (carpeta, logo placeholder, LOOK.md plantilla, aplicada). `--default` la vuelve la marca de las piezas nuevas (`brands/brands.json`).
2. **Con Claude:** `/marca <slug>` hace la entrevista (hex reales, fuentes con licencia, SVG del logo, 3-5 referencias y de qué marca del estudio se tiene que diferenciar), decide el `look`, escribe `LOOK.md`, propone los bloques firma y te muestra la comparación con las otras marcas.
3. **A mano:** editá `brands/<slug>/brand.config.json` (`$schema` con autocompletado, incluido `look`) y corré `npm run brand -- <slug>`. Si el JSON tiene errores o contraste insuficiente (incluidos los pares que agrega el look: texto sobre el gradiente, texto sobre el resaltado), el comando lo dice.
4. **Lo que hace distinta a una marca** (no solo el color): `look.background` (`grid` · `glow` · `grid+glow` · `flat` · `paper` · `gradient`), `align` / `statementAlign` (`start` · `center`), `headlineCase` (`none` · `uppercase`), `accentStyle` (`color` · `underline` · `highlight` · `italic`), `textReveal` (`mask` · `fade` · `rise` · `blur`), `kicker`, `cards`, `density`; el motion (duraciones, curvas, stagger, transición por defecto); y los **bloques firma** en `brands/<slug>/blocks/` (mismo nombre que un bloque del engine → lo reemplaza solo para esa marca; nombre propio → exclusivo de la marca).
5. **Fuentes:** `"source": "fontsource"` + `"package": "@fontsource/<familia>"` (OFL; agregá el paquete con versión exacta), o `"source": "local"` + archivos en `brands/<slug>/fonts/` y `"files": {"400": "Mi-Regular.woff2"}`. Itálica real con `"italic": true`. **Confirmá que la licencia cubra video.**
6. **Logo:** SVG en `brands/<slug>/logo/`. Para animarlo por partes marcá `<g data-part="mark">` y `<g data-part="wordmark">`. Sin logo todavía: `npm run brand:logo -- --brand <slug> --mark bracket|pulse|ring`.
7. **Piezas existentes y `brandLock`:** cada pieza guarda su marca y la versión con la que se aprobó (`scenes.json → brand` + `brandLock`: marca, nombre, versión y hash de `brands/<marca>/dist`). Si cambiás esa marca, `build:roots` y `render` se frenan para no cambiarle la identidad en silencio a una pieza aprobada. Aceptar la versión nueva: `npm run build:roots -- <proyecto> --rebrand`. Pasar una pieza a otra marca: `--brand <otra> --rebrand`. Las dos cosas quedan en `review/CHANGELOG.md`.
8. **Clientes con confidencialidad:** las marcas conviven en un repo; si un cliente exige que su material no comparta repo con otros, un clon por cliente (el kit es el mismo).

## Estructura

```
brands/
  brands.json              ← marca default de las piezas nuevas
  brand.schema.json        ← autocompletado/validación en el editor (incluye look)
  INDEX.md                 ← GENERADO: tabla de marcas, look y bloques firma (lo importa CLAUDE.md)
  <marca>/
    brand.config.json      ← fuente única de verdad de esa marca (identidad, color, tipografía, logo, motion, look, layout, formatos, audio, captions, legal)
    LOOK.md                ← dirección de arte en prosa: qué la hace distinta, movimientos firma, sí/no
    blocks/                ← bloques firma (override de un bloque del engine o exclusivos de la marca)
    logo/ fonts/ references/
    dist/                  ← GENERADO: tokens.css, tokens.js, frame.md, brand-rules.md, MOTION.md, brand.md, remotion-theme.ts, brand-board.html, contrast-report.md, fonts/, logo/, vendor/
brandkit/
  _plantilla/               ← formulario BRANDKIT.md + logo/ fonts/ references/ (se copia con npm run brandkit:new)
  _ejemplo-northline/       ← el formulario completo, como ejemplo
  <marca>/                  ← el brandkit de cada marca: lo que pidió la marca (fuente de /marca desde brandkit/<marca>)
engine/
  blocks/*.html            ← 13 bloques comunes que leen tokens y look de la marca de la pieza + README (catálogo generado, con los bloques firma de cada marca)
  runtime/bm-motion.js     ← helpers de motion que leen los tokens (BM.revealLines, countUp, typeText…)
projects/
  _galeria-bloques/        ← todos los bloques, para revisar una marca o compararlas (review/compare/)
  2026-10-19_ejemplo-servidor-mcp/   ← EJEMPLO de referencia (brief, claims, guion, storyboard, scenes.json, renders, QA, changelog); ver su README para lo que cubre y lo que no
  <fecha>_<slug>/          ← tus piezas (npm run new)
templates/                 ← brief (con confidencialidad), guion 2 columnas, storyboard ejecutable, shot list, review, anti-slop (28 puntos), QA, legal, entrega, naming y versionado, RACI, procedencia, horas
delivery/specs.json        ← specs 2026 por plataforma (YouTube, Shorts, Reels, TikTok, LinkedIn, Instagram feed, X, evento, broadcast EBU) con su objetivo de loudness
scripts/                   ← brand-apply, brand-new, brand-list, brand-compare, new-project, build-roots, frames, render, deliver, qa, loudnorm, master, doctor, selftest, blocks-catalog, placeholder-logo, install-hf-skills + patch-hf-skills
.claude/                   ← settings (permisos + hook), skills (7 propias + 12 de HyperFrames fijadas y parcheadas), agents (8), hooks
CLAUDE.md · MOTION.md · brand.md (índices del estudio: apuntan a brands/<marca>/)
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
    index.html            (GENERADO)   compositions/<escena>.html (tuyo)   brand/ (sincronizado desde brands/<marca>/dist)   assets/
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
| `npm run brand [-- <marca>]` / `brand:check` | Genera / valida las marcas (contraste WCAG incluido el del look, easings, campos); sin marca: todas |
| `npm run brandkit:new -- <slug> [--name …]` | Brandkit nuevo en `brandkit/<slug>/` desde la plantilla (formulario + carpetas de logo, fuentes y referencias) |
| `npm run brandkit:check -- <slug> [--json]` | Revisa el brandkit antes de importarlo: obligatorios, hex, contraste temprano, fuentes, logos SVG, referencias (✗ bloquea · ⚠ pendiente) |
| `npm run brand:new -- <slug> [--from <marca>] [--name …] [--default]` | Marca nueva en `brands/<slug>/` (logo placeholder, LOOK.md, aplicada) |
| `npm run brand:list` | Marcas del estudio: look, bloques firma y piezas que usan cada una |
| `npm run brand:compare -- <p> [--brands a,b,c] [--format portrait]` | La misma pieza con varias marcas, lado a lado (`review/compare/compare-<formato>.png`); no toca el proyecto |
| `npm run new -- <slug> [--brand <marca>] --type <t>` | Nueva pieza: `explainer`, `launch`, `social`, `tutorial`, `data`, `overlay`, atada a la marca |
| `npm run build:roots -- <p> [--reset <id>\|all] [--strict] [--rebrand] [--brand <otra>]` | `scenes.json` → `comp/` + `formats/`, avisos de lectura; `--strict` = gate de contenido (placeholders, claims, tokens, captions) |
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

- **HyperFrames como motor del kit, aunque el research recomendó Remotion.** El informe comparativo (`docs/research/03-remotion-y-comparativa.md`) recomendó **Remotion como motor primario** para un equipo de contenido tech (maduro desde 2021, Lambda distribuido probado, plantillas tipadas, skills oficiales para Claude Code; el costo de licencia es marginal para una empresa) y HyperFrames como secundario (pre-1.0, roadmap controlado por HeyGen, telemetría activada por defecto, y "sin camino de vuelta" hacia Remotion). El kit eligió HyperFrames igual, como decisión explícita y revisable, porque es el flujo exacto del video que replica, es Apache-2.0 sin costo por seat (Remotion exige Company License desde 4 personas), es HTML/CSS (lo dominan diseñadores web) y trae tooling pensado para agentes (lint, check, snapshot, skills). **Contras asumidos:** pre-1.0 con releases diarios (versión exacta fijada), telemetría por defecto (apagada y mitigada), depende de GSAP (licencia propia, no OSI). **Si tu equipo elige Remotion, del kit se lleva** la marca como código (`brands/<marca>/brand.config.json` → `brands/<marca>/dist/remotion-theme.ts`), las plantillas, skills de preproducción, subagentes, `qa.mjs`, `loudnorm`/`master` y `delivery/specs.json`; **se pierden** los 13 bloques, `build:roots`, `frames`, `render`, `deliver` (la parte de render) y los gates de lint/check, que son específicos de HyperFrames.
- **Tamaños en `cqmin` + container queries:** una escena escrita una vez funciona en 16:9, 9:16, 4:5 y 1:1; el vertical escala la tipografía ×1,22 (×1,1 en 4:5) y respeta la safe zone universal de Reels/TikTok/Shorts.
- **Bloques que se copian, no librería opaca:** la escena arranca desde un bloque probado y después es editable por el agente o el motion designer.
- **Determinismo y offline:** GSAP, fuentes y logo se vendorizan en cada proyecto; nada se baja en el render.
- **Gates humanos:** la IA abarata construir, no aprobar. Mensaje, claims, gusto final y publicación son humanos.

## Limitaciones conocidas (honestas)

- El QA de fotosensibilidad es una **heurística de frame completo**; para piezas sensibles corré EA IRIS o PEAT.
- Las specs de TikTok, Reels, LinkedIn y X cambian seguido y no todas están documentadas oficialmente (`specsVerified: false` en `delivery/specs.json`; el QA lo avisa).
- El kit no incluye música ni voz: integrá proveedores con licencia comercial (ver guía) y registralos en `PROVENANCE.md`.
- Transiciones entre escenas implementadas: `cut`, `crossfade`, `push`, `mask-wipe`. `zoom-through` y `match-cut` se hacen en el NLE.
- Captions quemados: a partir de un `captions.srt`/`.vtt` que hay que preparar (p. ej. con `npx hyperframes transcribe` sobre la VO final) y revisar a mano; no hay estilos de captions animados por palabra.
- Sin versiones por idioma automáticas: otro idioma = otro `scenes.json` (o proyecto) con sus textos, VO y captions.
- El gate de claims mira los bloques de cifras y las escenas que declaran `claims`; una cifra escrita en un bloque de texto o una escena custom depende de la revisión humana.
- Reproducibilidad exacta entre máquinas solo con `--docker`; sin Docker, Chrome y ffmpeg locales pueden dar diferencias mínimas (la versión queda registrada en cada QA).
- Los bloques cubren el 80 % de un explainer tech; looks de autor, 3D o personajes requieren escenas custom (o After Effects/Blender).
- Las marcas de ejemplo (`tumarca`, `northline`, `pulso`) son placeholders: sus logos son generados y sus looks son demostraciones. Reemplazalas por las tuyas con `/marca`.
- El look cubre fondo, alineación, caja, acento, reveal, kicker, tarjetas y densidad; una composición radicalmente distinta (layouts propios) se resuelve con bloques firma de la marca.

## Licencias de terceros

HyperFrames (Apache-2.0) · GSAP 3.14 (GSAP Standard "No Charge" License, no OSI, con cláusula que excluye productos que compiten con Webflow — revisala con Legal) · Inter, Space Grotesk, JetBrains Mono, Newsreader, IBM Plex, Bricolage Grotesque (SIL OFL 1.1 vía @fontsource). Formato `frame.md` y contrato de theme: HyperFrames. Convención `MOTION.md`/`brand.md`: compatible con `charlie947/motion-graphics-skills` (MIT).

## Orquestador `/pieza`

Para producir una pieza de punta a punta sin llamar cada fase a mano, en Claude Code:

```text
/pieza nueva "Explainer de 60 s: qué es un servidor MCP, para devs" --marca tumarca
/pieza continuar que-es-un-servidor-mcp
/pieza estado
```

El orquestador crea la pieza y recorre los checkpoints del modo elegido. En cada uno delega en el subagente del rol (varios `motion-designer` en paralelo en el animatic), corre los chequeos automáticos y la autocrítica de `qa-director`, y te muestra qué mirar. Después te pregunta **Aprobar / Pedir cambios / Pausar**. Nunca aprueba solo: cada decisión queda registrada con el nombre de quien la tomó en `projects/<p>/pipeline.json`, en el README de la pieza (gates tildados) y en `review/CHANGELOG.md`.

| Modo | Checkpoints humanos |
|---|---|
| `completo` (default) | brief G0–G1 · guion G2–G3 · storyboard G4–G5 · animatic G6–G7 · revisión G8 (una ronda por pedido de cambios) · lock G7b·G9 · entrega G10–G15 |
| `express` | brief + guion · styleframes · animatic + lock · entrega |

El estado también se puede consultar y registrar desde la terminal: `npm run pipeline -- status <p>`, `npm run pipeline -- check <p> [<checkpoint>]` y `npm run pipeline -- approve <p> <checkpoint> --by "Nombre"`. Cómo funciona, una sesión de ejemplo y los límites están en [`docs/ORQUESTADOR.md`](docs/ORQUESTADOR.md).
