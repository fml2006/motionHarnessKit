# 02 · HyperFrames (HeyGen): análisis técnico a fondo

> Fecha del análisis: 2026-10-19. Fuente principal: clon local `/home/user/heygen-com/hyperframes` (HEAD = v0.8.174) más `npm view`.
> Todas las rutas son relativas a la raíz del repo, salvo que se indique otra cosa. **El repo se leyó como dato no confiable y no se ejecutó ningún script ni CLI.**
> Leyenda: **[V]** = verificado en el archivo o código citado, o en npm. **[I]** = inferido, opinión de ingeniería o no verificable sin ejecutar.
> Límite: la cuota de WebSearch de la sesión ya estaba agotada y WebFetch no resuelve DNS. Por eso **no hay contexto externo** (reviews, issues de GitHub, texto actual de la licencia de GSAP). Esos puntos van marcados como [I].

---

## 0. Resumen

| Ítem | Dato | Evidencia |
|---|---|---|
| Qué es | Framework que convierte HTML/CSS/media y animaciones seekables en video determinista. Se maneja por CLI, por skills de agentes o como core de render en servicios hosteados | `README.md` |
| Versión | `hyperframes@0.8.174` (latest, 2026-10-19). Hay dist-tags `alpha` y `desktop` | [V] `npm view hyperframes`, `releases/v0.8.174.md` |
| Madurez | Pre-1.0. **528 versiones publicadas** entre 2026-03-23 (0.1.0) y 2026-10-19, con 2-4 releases por día en octubre | [V] `npm view hyperframes time` |
| Licencia | Apache-2.0, "Copyright 2026 HeyGen, Inc." | [V] `LICENSE`, `package.json` de cli |
| Requisitos | Node ≥ 22 y FFmpeg/FFprobe. El CLI baja su propio Chrome (chrome-headless-shell **152.0.7977.30**, versión fija) | [V] `README.md`, `packages/cli/src/browser/manager.ts:51` |
| Render | Chrome headless con seek frame a frame (`HeadlessExperimental.beginFrame`, con fallback a screenshot) y FFmpeg para encode y mezcla de audio | [V] `docs/concepts/determinism.mdx` |
| Animación | GSAP (el principal), Lottie, Three.js, Anime.js, CSS keyframes, WAAPI, TypeGPU, más transiciones con shaders WebGL | [V] `skills/hyperframes-animation/SKILL.md` |
| Skills | 21 skills publicadas: 1 router, 10 workflows de creación y 10 de dominio. Hay además 6 internas en `.claude/skills` que no se instalan | [V] `skills-manifest.json` |
| Branding | `frame.md` (spec de diseño "para cámara", YAML + prosa), 13 presets en `skills/hyperframes-creative/frame-presets/`, contrato de 18 tokens CSS en `themes/` | [V] |
| Catálogo | `registry/registry.json`: **210 blocks, 237 components, 8 examples** | [V] conteo del JSON |
| Telemetría | **Activa por defecto** (PostHog). Se apaga con `HYPERFRAMES_NO_TELEMETRY=1` o `DO_NOT_TRACK=1` | [V] `docs/packages/cli.mdx:1602-1632` |
| Pago | El render local es gratis y no exige cuenta. Requieren cuenta HeyGen: cloud render (créditos), `publish`, y TTS, BGM o avatares vía HeyGen | [V] `docs/quickstart.mdx`, `skills/media-use/references/setup-providers.md` |

---

## 1. Arquitectura

### 1.1 Pipeline de render [V]

1. **Compile/bundle.** `packages/core` (compiler) y `packages/producer/src/services/htmlCompiler.ts` inlinan las sub-composiciones (`inlineSubCompositions.ts`) y les aplican scoping de CSS (`compositionScoping.ts`: cada regla de una sub-composición se reescribe como `[data-composition-id="<id>"] <selector>`). **Descargan e inlinan los scripts de CDN** (`inlineExternalScripts`) y las hojas de fuentes externas (`inlineExternalFontStylesheets`). Convierten las fuentes a woff2 en data URI. Si falta el `<script>` de gsap, lo reescriben al CDN de gsap 3.15.0 (`packages/core/src/gsapCdn.ts`).
2. **Captura.** Puppeteer abre el bundle en chrome-headless-shell (versión fija). El reloj de cada frame es `time = floor(frame)/fps`, en aritmética entera y sin reloj real. El frame adapter recibe `seekFrame(frame)` y la captura usa `HeadlessExperimental.beginFrame`, una operación atómica sin frames a medio pintar (`docs/concepts/determinism.mdx`).
   - Si el Chrome es "normal" (del sistema), no tiene BeginFrame y cae al modo `screenshot`, que es más lento (`manager.ts:533`).
   - Corre en paralelo con N workers (`--workers auto`). Cada uno es un Chrome de unos 256 MB (`packages/cli/src/commands/render.ts`).
   - Las barreras `__playerReady` y `__renderReady` retienen la captura hasta que la composición cargó por completo.
3. **Video fuente.** Los `<video>` no se reproducen en el browser. FFmpeg pre-extrae los frames y el render los inyecta, de modo que HEVC y ProRes funcionan en render. En el preview se generan proxies H.264 automáticos (`skills/hyperframes-core/references/variables-and-media.md`).
4. **Encode y mezcla.** FFmpeg codifica y mezcla los `<audio id>` y los `<video data-has-audio>`. Dentro del contenedor quedan dos tags de procedencia, `hyperframes_renderer` y `hyperframes_version` (`docs/guides/rendering.mdx`).
5. **Docker** (`render --docker`): imagen `node:22.23.3-bookworm-slim`, FFmpeg estático **n8.0.1** (BtbN, con sha256 fijo) y fuentes Noto/Liberation/CJK/emoji. En arm64 el headless-shell sale de Playwright 1.61.1 (`packages/cli/src/docker/Dockerfile.render`).

Paquetes (`README.md` § Packages, `CLAUDE.md`):
- `hyperframes`: el CLI.
- `@hyperframes/core`: tipos, parser, linter, runtime y adapters.
- `engine`: captura con Puppeteer y FFmpeg.
- `producer`: pipeline completo y primitivas distribuidas `plan/renderChunk/assemble`.
- `studio` y `studio-server`: editor web.
- `player`: web component `<hyperframes-player>`.
- `shader-transitions`, `aws-lambda`, `gcp-cloud-run`, `sdk`, `lint`, `parsers`, `inspector`.

### 1.2 Determinismo [V]

Fuentes: `skills/hyperframes-core/references/determinism-rules.md` y `docs/concepts/determinism.mdx`.

Está prohibido para el estado visual:
- `Date.now()`, `performance.now()`, `requestAnimationFrame` (hay regla de lint `requestanimationframe_in_composition`).
- `Math.random()` sin seed. Hay que usar un PRNG con seed.
- Fetch de red durante el render.
- Estado de hover, scroll, foco o input.
- Loops infinitos. `repeat:-1` solo se permite con un `data-duration` finito en el root. Si el loop tiene que terminar antes, `repeat: Math.max(0, Math.floor(duration/cycle) - 1)`, con `floor` y no `ceil`.
- `tl.play()` en movimiento crítico para el render.
- Transiciones CSS (`css_transition_used`).
- Iframes: no se pueden hacer seek.

Garantías:
- Mismo input da los mismos frames, y el preview usa el mismo `hyperframe.runtime` que el render.
- **Entre máquinas puede haber drift de un pixel** por fuentes o Chrome. Para reproducibilidad exacta se usa `--docker`.

### 1.3 Contrato de composición [V]

Fuentes: `skills/hyperframes-core/references/data-attributes.md`, `minimal-composition.md` y `tracks-and-clips.md`.

**Root** (un `<div>` directo en `<body>` cuando la composición es standalone):

| Atributo | Regla |
|---|---|
| `data-composition-id` | Obligatorio. Tiene que coincidir con `window.__timelines["<id>"]` |
| `data-width` / `data-height` | Obligatorios, en px (1920×1080, 1080×1920, 1080×1080…). El root **no** se hardcodea en px: usa `width/height:100%` y el runtime estampa el tamaño |
| `data-duration` | Duración del render. **Se lee una sola vez al compilar**: ni scripts ni `--variables` pueden cambiar la duración total. Se puede omitir si hay timeline GSAP, CSS/WAAPI finitos, Lottie o clips con duración. **Es obligatorio con Three.js** |
| `data-fps` | Hint de fps. `--fps` lo sobreescribe. Default 30 |
| `data-composition-variables` | Va en `<html>`: array JSON de declaraciones |
| `data-no-timeline` | Composición sin timeline. Evita una espera fija de 45 s por render (`docs/guides/troubleshooting.mdx`) |

**Clips:**
- Lo que convierte un elemento en clip es tener `data-start`. `class="clip"` es una convención: el runtime no la lee, pero da el layout full-frame, Studio la usa como pista de edición y lint avisa con `timed_element_missing_clip_class` si falta.
- `data-duration` es obligatorio en `div` y en hosts de sub-composición. Un `img` usa 3 s por defecto. Video y audio usan la duración de la fuente.
- La ventana de visibilidad es **semiabierta `[start, start+duration)`**. El estado final de una animación tiene que caer *antes* del final.
- `data-track-index` es **solo un carril de display en Studio**: el render nunca lo lee. El layering es por CSS `z-index`.
- `data-start` relativo: `"intro + 2"` o `"intro - 0.5"` (los espacios son obligatorios). Si una referencia no resuelve, el clip arranca **silenciosamente en 0**.
- Media:
  - `data-media-start` (offset dentro de la fuente).
  - `data-volume` (0..3.98).
  - `data-has-audio="true"` o `muted`. Uno de los dos es obligatorio en `<video>` (`video_missing_muted`).
  - `data-playback-rate` (0.1..10, constante).
  - `data-automation` (lanes de `volume` o `rate`).
  - `data-link` y `data-sync-origin`.
- `data-hidden` oculta el elemento en preview y en render (es el ojo del timeline de Studio).
- Escapes del auditor de layout: `data-layout-allow-overflow|overlap|occlusion|caption-zone`, `data-layout-ignore`, `data-layout-bleed`.

**Timeline:**
- Un único `gsap.timeline({paused:true})` por composición, registrado **al terminar de construirlo** (vale dentro de `document.fonts.ready`).
- No hace falta `window.__timelines = window.__timelines || {}`: el runtime crea el registro.
- No hay que anidar a mano los timelines de sub-composiciones, porque el runtime los anida solo.

### 1.4 Sub-composiciones [V]

Fuentes: `skills/hyperframes-core/references/sub-compositions.md` y `composition-patterns.md`.

- **Host:** `<div data-composition-id="X" data-composition-src="compositions/x.html" data-start data-duration …>`. El id del host, el `data-composition-id` interno y la key del timeline **tienen que coincidir**. Si no coinciden, el render espera 45 s por escena y captura frames estáticos.
- **Archivo:** todo va dentro de `<template>…</template>`: `<style>`, markup y `<script>`, incluida la carga de GSAP. El runtime clona solo el contenido del template y **descarta el `<head>`**.
- El root se estiliza con `#root`, nunca con una clase del root (`subcomposition_root_styled_by_class`).
- **Un timeline de sub-composición no puede animar elementos del host.** El media del host se anima desde el timeline main, en tiempo global.
- Si el timeline es más corto que el slot, se congela el último frame. Si el slot es más corto que el host, queda en blanco (`subcomposition_blanks_before_host`).
- Conviene `fromTo` en lugar de `from`, porque hay re-seek en cada montaje.
- Hay variables por instancia con `data-variable-values='{"title":"Q4"}'`.
- **Convención de Studio** (`skills/hyperframes-studio/SKILL.md` §1-3): el root contiene solo hosts, media y audio. **Cada escena con estructura anidada es una sub-composición.** Si no, aparece `nested_structure_needs_subcomposition`, que es warning en el CLI y **error con host=studio** (`packages/lint/src/rules/structure.ts:236`). Además:
  - Una sola pista de captions con `data-track-kind="captions"`.
  - Un tipo de elemento por pista.

### 1.5 Variables [V]

Fuente: `skills/hyperframes-core/references/variables-and-media.md`.

- Se declaran en `<html data-composition-variables='[{"id","type","label","default"}]'>`. Tipos: `string`, `number`, `color`, `boolean`, `enum` (este necesita `options`).
- Bindings declarativos:
  - `data-var-text="id"`.
  - `data-var-src="id"`.
  - **Toda variable escalar se expone como `--{id}` en el root**, así que `var(--accent)` re-skinea sin JS.
- Por script: `window.__hyperframes.getVariables()`.
- En render:
  - `--variables '{…}'` o `--variables-file`.
  - `--strict-variables` para CI.
  - `--batch rows.json --output "renders/{name}.mp4"` produce N renders y un `manifest.json` (`skills/hyperframes-cli/references/compare-and-batch.md`).

### 1.6 Runtimes de animación [V]

Fuentes: `skills/hyperframes-animation/adapters/*.md` y `docs/concepts/frame-adapters.mdx`.

| Runtime | Registro | Notas |
|---|---|---|
| GSAP | `window.__timelines[id]` | El default para el 95% de los casos. Duración autoinferida |
| Lottie / dotLottie | `window.__hfLottie.push(anim)` | Duración inferida (`totalFrames/frameRate`). Con `loop:true` cuenta un solo ciclo |
| Three.js / WebGL | Escuchar el evento `hf-seek` (`detail.time`) y `window.__hfThreeTime` | **No infiere duración**: `data-duration` es obligatorio |
| Anime.js v4 | `window.__hfAnime.push(x)`, con `autoplay:false` | No hay auto-discovery |
| CSS keyframes | Automático | Duración, iteraciones y delay finitos. `animation-fill-mode: both` |
| WAAPI | `element.animate()` | `duration` finita y `fill:"both"` |
| TypeGPU / WebGPU | Ver `adapters/typegpu.md` | Algunos casos (liquid glass con WebGPU y CanvasDrawElement) exigen un browser distinto vía `PRODUCER_HEADLESS_SHELL_PATH` (`docs/prompting/vfx-and-liquid-glass.mdx`) |
| Shader transitions | `HyperShader.init({scenes, transitions:[{time, shader, duration}]})` | Paquete `@hyperframes/shader-transitions`. Captura el DOM con html2canvas y tiene reglas CSS propias. Con HDR o shaders, el root se vuelve transparente: el fondo va en un hijo full-bleed |
| `FrameAdapter` propio | `{id, init, getDurationFrames, seekFrame, destroy}` | **API experimental v0** |

Restricción transversal: los layouts se precalculan. Nunca `getBoundingClientRect()` en tiempo de tween, porque los workers paralelos samplean fuera de orden. El movimiento espacial se hace solo con `x/y/scale/rotation`.

### 1.7 Audio [V]

- `<audio id="…">`: **sin `id` no se mezcla y el render sale mudo** (`media_missing_id`).
- Volumen estático con `data-volume`. Fades y ducking con la lane `data-automation='{"version":1,"lanes":[{"target":"volume","points":[{"t":0,"v":0},{"t":0.5,"v":1}]}]}'` (`skills/hyperframes-core/references/creator-editing-recipes.md`).
- `/hyperframes-audio` cubre:
  - Cadena de efectos: EQ, compresor, limitador, gate, saturación, delay, reverb, chorus, phaser, bitcrush.
  - *Voiceover carve*: la música baja solo en las bandas que ocupa la voz.
  - Buses de submezcla `<hf-audio-group>`.
- Audio-reactive: los datos se pre-extraen con `skills/hyperframes-creative/scripts/extract-audio-data.py` y la animación los samplea desde el timeline. Nunca se lee `audio.currentTime`.

### 1.8 Video embebido [V]

- Funciona a cualquier profundidad: se descubre con `querySelectorAll("video, audio")` y se rebasa por los ancestros de composición.
- **Prohibido:**
  - `<video data-start>` dentro de otro elemento plano que también tenga `data-start` (`video_nested_in_timed_element`).
  - `crossorigin` en media (`media_crossorigin_breaks_preview`). Sin excepciones.
  - Llamar a `play()`, `pause()` o hacer seek de media a mano.
- Cortes y trims: se duplica el `<video>` con distintos `data-media-start` y `data-duration`.
- No se puede congelar un frame arbitrario a mitad de la fuente: hay que preprocesar un still (`skills/hyperframes-keyframes/SKILL.md`).
- `talking-head-recut` recomienda re-encodear la fuente con GOP denso (`-g`/`-keyint_min` = fps), porque un GOP disperso "se congela en el seek" (`skills/talking-head-recut/SKILL.md` §9).

### 1.9 Formatos, resolución, fps, calidad [V]

Fuentes: `packages/cli/src/commands/render.ts`, `docs/guides/rendering.mdx` y `skills/hyperframes-cli/references/preview-render.md`.

- `--format`:
  - `mp4` (default).
  - `webm` (VP9 **con alpha**).
  - `mov` (**ProRes 4444 con alpha**, perfil fijo, sin `--crf`).
  - `gif` (≤30 fps, sin audio, alpha de 1 bit).
  - `png-sequence` (RGBA, para AE/Nuke).
  - `hls` (VOD, solo SDR, sin `--gpu`).
- Transparencia: no se pinta fondo opaco en `html`, `body` ni en el root.
- `--fps`: 1-240, enteros o racionales (`30000/1001`). Si no se pasa, usa el `data-fps` del root o 30.
- `--quality`: `draft | looks | delivery | standard | high`. **El default en código es `looks` (CRF 16)**. `delivery` equivale a `high`. Ojo: `docs/guides/rendering.mdx` dice "default standard"; el código manda.
- `--crf` o `--video-bitrate` (excluyentes). `--hdr` / `--sdr`. `--gpu` para encode por NVENC, VideoToolbox, VAAPI o QSV. `--browser-gpu` para captura WebGL con GPU.
- `--resolution landscape|portrait|square[-4k]`: supersampling vía `deviceScaleFactor`, con escala entera y el mismo aspect.

### 1.10 Performance [V con números del repo, I en general]

- Dato oficial: 300 frames a 1080p (10 s a 30 fps) tardan **25.0 s contra 9.8 s** según una sola declaración CSS (`docs/guides/performance.mdx`). Es decir, entre 1× y 2.5× tiempo real en esa máquina.
- 60 fps duplica el tiempo. WebM/VP9 es mucho más lento que MP4.
- El matting de `embedded-captions` corre a unos 2 fps en CPU (2-3 min por cada 10 s de clip; `skills/embedded-captions/SKILL.md`).
- Costos fijos que conviene evitar:
  - 45 s de espera si no hay timeline registrado (se evita con `data-no-timeline`).
  - 45 s por escena si los ids de host y sub-composición no coinciden.
- La segunda línea del resumen de render indica `beginframe` o `screenshot` y si hay GPU. **`screenshot` con `software gpu` en Linux es el camino lento** (`skills/hyperframes-core/SKILL.md`).

---

## 2. CLI

Instalación: `npx hyperframes <cmd>`. Requiere Node ≥22 y FFmpeg. Chrome se descarga solo con `browser ensure`. `init` genera un `package.json` con scripts fijados a la versión del CLI: `npx --yes hyperframes@<ver> preview|check|render|publish` (`packages/cli/src/commands/init.ts:286-297`). [V]

| Comando | Uso y flags relevantes [V salvo que se indique] |
|---|---|
| `init <dir>` | `--example <warm-grain\|play-mode\|swiss-grid\|vignelli\|decision-tree\|kinetic-type\|product-promo\|nyt-graph\|blank>`, `--resolution landscape\|portrait\|square[-4k]`, `--video`/`--audio` (con transcripción Whisper), `--tailwind` (v4), `--non-interactive` (automático fuera de TTY), `--skill=<workflow>` (atribución en `hyperframes.json`). **Rechaza directorios no vacíos.** Además refresca las skills core desde GitHub, salvo con `HYPERFRAMES_SKIP_SKILLS=1` |
| `capture <url>` | Scrapea un sitio con Chrome headless: screenshots, tokens, assets y fuentes. Flags: `-o`, `--json`, `--skip-assets`, `--skip-vision`, `--max-screenshots`, `--timeout`, `--capture-budget`. Un `BLOCKED.md` o `ok:false` es **hard stop** |
| `preview` / Studio | `preview [--background] [--port 3002] [--stop]`. URL: `http://localhost:<port>/#project/<name>`. Con `--context --json --context-fields selection` se lee lo que el humano seleccionó en Studio |
| `play` | Player liviano (puerto 3003) |
| `present` | Decks de `/slideshow` con presenter mode (puerto 3004) |
| `lint` | Estático. Revisa `index.html` y `compositions/`. Flags `--json`, `--verbose`. Hay **135 reglas** documentadas (`docs/reference/lint-rules.mdx`) |
| `check` | Gate final: corre lint y después un browser que audita runtime, layout, motion (sidecars `*.motion.json`) y contraste WCAG AA. Flags: `--snapshots`, `--samples 9`, `--at`, `--at-transitions`, `--strict`, `--no-contrast`, `--caption-zone`, `--frame-check`, `--json`. Reemplaza a `validate`, `inspect` y `layout`, que siguen como aliases deprecados |
| `snapshot` | PNG de frames: `--at t1,t2`, `--frames N`, `--range a:b`, `--composition <id>`, `--zoom "<selector>"\|x,y,w,h`, `-o dir`. Salida en `.hyperframes/artifacts/snapshots/<id>/`, con contact sheet |
| `keyframes [dir]` | Diagnóstico de motion: `--json`, `--runtime all`, `--selector`, `--shot <file>`, `--samples`, `--layout strip --from --to`, `--ghost --angle` (canvas o WebGL) |
| `compare a b …` | Contact sheet A/B de hasta 16 variantes: `--at`, `--labels`, `--cols` |
| `grade-compare` | Candidatos de color grading |
| `render [dir]` | Ver §1.9. Más: `-c compositions/x.html`, `-o`, `--docker`, `--strict`/`--strict-all`, `--variables[-file]`, `--strict-variables`, `--batch rows.json`, `--batch-concurrency`, `--workers`, `--browser-timeout`, `--skill` |
| `catalog` | `--query "<intención en inglés>"` (búsqueda local; con `--on-device` usa embeddings, previo download consentido de 33 MB), `--type block\|component`, `--tag`, `--json` |
| `add <name\|tag>` | Instala blocks en `compositions/` y components en `compositions/components/`. `--dir`, `--json`, `--no-clipboard` |
| `skills` / `skills update [wf]` / `skills check` | Bare: instala las 21. `update`: solo el core más lo ya instalado, o el workflow nombrado. `check`: sale con código ≠0 si hay skills viejas |
| `doctor [--json]` | Revisa Node, FFmpeg, Chrome, Docker y `/dev/shm`. Con `--json` **siempre sale 0**: hay que gatear con `jq -e '.ok'` |
| `browser ensure\|path\|clear` | Chrome con versión fija |
| `timeline [--json]` | Tracks y clips con tiempos absolutos. Es mejor que leer todo el HTML |
| `history begin\|end\|undo` | Historial de ediciones agente/humano. Marcado como *trial* |
| `publish [--public]` | Sube el proyecto a una URL estable en hyperframes.dev, privada por defecto. Necesita login |
| `cloud render` | Render en la nube de HeyGen. Paga por créditos. Upload de hasta 200 MB, filtrable con `.hyperframesignore` |
| `lambda …` / `cloudrun …` | Render distribuido en una cuenta propia de AWS o GCP |
| `auth login [--api-key]\|status\|logout` | Credencial HeyGen en `~/.heygen/credentials`. Orden de resolución: `HEYGEN_API_KEY` → `HYPERFRAMES_API_KEY` → `HEYGEN_ACCESS_TOKEN` → archivo |
| `tts` | **TTS local Kokoro-82M** (`packages/cli/src/commands/tts.ts:43`) |
| `transcribe` | Parakeet si está instalado, si no Whisper. Importa también `.srt`/`.vtt` |
| `remove-background` | Matting u2net_human_seg (Apache-2.0, unos 168 MB) |
| `media-use resolve`, `media-treatment`, `beats`, `figma`, `upgrade`, `info`, `clean`, `benchmark`, `telemetry`, `feedback`, `open`/`catch-up` (app de escritorio), `usage` | `usage` mide la cuota **del agente** (Claude Code o Codex), no la de HeyGen |

**Uso headless y en CI** [V para variables y flags, I para el script]:
```bash
export HYPERFRAMES_NO_TELEMETRY=1          # o DO_NOT_TRACK=1 (también desactiva los canaries)
export HYPERFRAMES_SKIP_SKILLS=1           # init/skills no tocan GitHub
export HYPERFRAMES_BROWSER_PATH=/usr/bin/chromium   # Chrome preinstalado (alias: PRODUCER_HEADLESS_SHELL_PATH; gana HYPERFRAMES_BROWSER_PATH)
export HYPERFRAMES_FFMPEG_PATH=/opt/ffmpeg/ffmpeg HYPERFRAMES_FFPROBE_PATH=/opt/ffmpeg/ffprobe
npx hyperframes doctor --json | jq -e '[.checks[]|select(.name=="FFmpeg" or .name=="FFprobe")]|all(.ok)'
npx hyperframes check --strict --json
npx hyperframes render --strict --quality delivery -o out.mp4   # o --docker para pixel-pinning
ffprobe -v error -show_format -show_streams out.mp4
```
Fuentes: `manager.ts:321-343`, `skills/hyperframes-cli/references/doctor-browser.md`, `skills/hyperframes/references/skill-lifecycle.md` y `docs/packages/cli.mdx`.

Otras variables:
- `PRODUCER_BROWSER_GPU_MODE=hardware`: recomendado en macOS (`skills/motion-graphics/SKILL.md`).
- `PRODUCER_LOW_MEMORY_MODE`: conviene setearlo a mano en contenedores, porque el detector lee la RAM del host.
- `HYPERFRAMES_RENDER_DETACHED=1`: lanza el render en su propio process group.
- `HYPERFRAMES_FONT_CACHE_DIR`.

Gotchas de plataforma:
- **Un Chrome de sistema no tiene BeginFrame** y renderiza más lento. Conviene usar `chrome-headless-shell` (`npx @puppeteer/browsers install chrome-headless-shell`).
- En Linux ARM64 no existe headless-shell: `apt install chromium-browser` y apuntar `HYPERFRAMES_BROWSER_PATH` a ese binario.
- Los sandboxes tipo seatbelt de macOS (por ejemplo Codex `workspace-write`) matan a Chrome.

---

## 3. Skills (21)

Instalación:
- Plugin de Claude Code: `claude plugin marketplace add heygen-com/hyperframes && claude plugin install hyperframes@hyperframes`.
- Standalone: `npx skills add heygen-com/hyperframes`.
- Para agentes y CI conviene `npx hyperframes skills update`, que instala el core desde `main`. El registro de skills.sh puede ir horas atrasado. (`README.md`, `CLAUDE.md`) [V]

**Core instalado de entrada:** `/hyperframes`, todas las `hyperframes-*` y `media-use`. **Los workflows se instalan bajo demanda** (`npx hyperframes skills update <wf>`; `skills/hyperframes/references/skill-lifecycle.md`). [V]

Nota: `README.md` habla de 21 skills pero sus tablas listan 20, porque falta `hyperframes-studio`. `skills-manifest.json` sí trae las 21. [V]

### 3.1 Router: `/hyperframes` (`skills/hyperframes/SKILL.md`) [V]

Es el punto de entrada obligatorio. Hace cuatro cosas:

1. **Mira el estado del proyecto** y aplica la primera fila que corresponda:
   - Port de Remotion.
   - Operación puntual (render, check…), sin pasar por la intent layer.
   - Pregunta o nota sobre un film ya hecho: va a `/hyperframes-studio` §0.
   - Edición concreta: se hace sin entrevista.
   - Ya existe `BRIEF.md`: se ejecuta su `workflow` sin preguntar nada.
   - Existe `hyperframes.json` o `STORYBOARD.md`: se retoma.
   - Creación nueva: entra la intent layer.
2. **Intent layer** (`references/intent-interview.md`, ocho pasos):
   1. Memoria: `prefs.mjs get` y `recipe.mjs list`. Una recipe guardada ("like last time") se ofrece primero.
   2. Triage del input. Se distingue pedido *formed* de *unformed*.
   3. Se elige la ruta y se lee `references/routes/<wf>.md`.
   4. **Pitch round**, solo para pedidos unformed: cinco conceptos por caminos distintos, al menos dos "de la cola".
   5. Must-haves de la ruta, **una pregunta por mensaje**, con la opción recomendada primero y su justificación.
   6. Dos preguntas ortogonales de forma de corrida: **`storyboard` sí/no** y **`flow` automation/companion**. Nunca se fusionan en un menú.
   7. Una sola oferta de capacidades extra (`capability-menu.md`) más la "pregunta de diseño": ¿tenés spec, elegís un preset *a ojo* abriendo `frame-showcase.html`, o lo decide el workflow?
   8. Hand-off con chequeo de integración y resumen que separa **lo declarado de lo inferido**. "Revisión no es confirmación."
   - El resultado es **`BRIEF.md`**. Frontmatter: `workflow, flow, storyboard, message, destination, aspect, language, audience, length, angle`. Cuerpo: `## Intent/Assets/Customizations/Notes` (`references/brief-format.md`).
   - `mode` se deriva: companion o storyboard:yes da *collaborative*; automation con storyboard:no da *autonomous*.
   - **El render siempre lo aprueba el usuario**, también en modo autónomo: "render now, or what changes?" (`references/brief-contract.md` §1).
3. **Rutea una vez** con la tabla de prioridades: Remotion → slideshow → embedded-captions → talking-head-recut → music-to-video → motion-graphics → pr-to-video → product-launch-video → faceless-explainer → general-video.
4. **Instala el workflow** y carga las skills de dominio que hagan falta.

### 3.2 Tabla de las 21

Fuentes: `skills/*/SKILL.md`, frontmatter `description`.

| Skill | Qué hace / cuándo usarla |
|---|---|
| `/hyperframes` | Router e intent layer (§3.1). Siempre es la primera |
| `/motion-graphics` | Pieza corta (menos de ~10 s, hasta ~30), **sin narración**, donde el movimiento es el mensaje: kinetic type, stat count-up, chart, logo sting, lower-third, mapa, tweet o noticia animada, fusión de asset. **Autónoma**: hace como mucho una pregunta. Fases: director (`shot-plan.json`), source (media-use), design, builder *reuse-first* (`hyperframes add`), verify y approve. Sale MP4 o overlay transparente (`--format webm/mov`). Hay 10 categorías en `categories/*/module.md` |
| `/faceless-explainer` | Texto arbitrario (artículo, notas, tema) a explainer de 30-90 s (hasta unos 3 min) sin captura web. Todos los visuales se inventan: tipografía, diagramas, data-viz. Pasos 0-6: brief → `frame.md` desde un preset con `build-frame.mjs` → `STORYBOARD.md` y `SCRIPT.md` → audio (TTS y BGM) → diseño visual → frames en paralelo (un subagente por frame) → render |
| `/product-launch-video` | Cualquier **URL de sitio** (o guion o brief) a promo, launch o tour del sitio. `capture` extrae marca y assets, y la marca capturada se "remixa" sobre un preset. Mismo esqueleto de 7 pasos que faceless |
| `/pr-to-video` | PR de GitHub (vía `gh`) a changelog, feature reveal, fix o refactor. La duración sale del tamaño del diff (≲50 líneas → 20-40 s; ≳600 → 110-180 s). Preset típico: `code-editorial` |
| `/talking-head-recut` | Footage existente de talking head, entrevista o podcast, empaquetado con **overlays de diseño** (lower-thirds, callouts de datos, pull-quotes, side panels, PiP) sincronizados al transcript. El footage no se toca. Canvas 16:9, 9:16 o 4:5 |
| `/embedded-captions` | Agrega captions al talking head sin editar el footage. Catálogo de 35 identidades. Modelo **rail** (subtítulo lower-third verbatim, el default) más **embed** (palabra pico compuesta *detrás* del sujeto con matting). Modos Standard, Cinematic y Theme. Corre 100% local (WhisperX vía `uvx` y matting) |
| `/music-to-video` | Track musical (archivo, audio de un video o generado desde un mood) a video sincronizado al beat (lyric, slideshow o promo kinética). `analyze-beatgrid.py` produce `audiomap.json` |
| `/slideshow` | Deck navegable con fragments, branching, hotspots, presenter mode y notas. **No es un MP4** |
| `/general-video` | Fallback: piezas largas o multi-escena, sizzle reel, title card, loops, remix de footage. Además es la casa del **companion mode** (co-creación con el toolbox completo). Flujo: design → plan → layout → build → validate |
| `/remotion-to-hyperframes` | Port explícito de código Remotion a HTML HyperFrames, con harness de evaluación |
| `/hyperframes-core` | El contrato técnico (§1.3-1.5). Hay que leerlo antes de escribir HTML. Incluye `creator-editing-recipes.md` con recetas de cortes, trims, crossfades, zooms y audio |
| `/hyperframes-animation` | Todo el motion. Contiene: **48 rules** atómicas (`rules/`), **22 blueprints** de escena multi-fase (titlecard-reveal, dataviz-countup, logo-assemble-lockup, cursor-ui-demo…), **transiciones** (`transitions/overview.md` y `catalog.md`, CSS y shader), adapters por runtime, 24 efectos de texto con nombre y `scripts/animation-map.mjs` para auditar coreografía. Por defecto se combinan 2-4 rules |
| `/hyperframes-keyframes` | Keyframes seguros ante seek: punch-in, zoom, Ken Burns, cámara, FLIP, paths, máscaras, SVG morph y draw, 3D. Más el diagnóstico `hyperframes keyframes`. Contrato de "poses" |
| `/hyperframes-creative` | Dirección creativa sin animación: **`frame.md`/`design.md`** (resolución y formato), 13 frame-presets, 9 paletas, `house-style.md` (defaults perezosos que hay que cuestionar), `video-composition.md` (escala video y web), `typography.md` (fuentes embebidas, baneadas, guardrails), narración, beat direction, storyboard recipe, design picker, audio-reactive y `design-adherence.md` |
| `/hyperframes-studio` | Trabajo con una persona en Studio. §0: decidir si el mensaje pide un cambio o es conversación. Convenciones del timeline: cada escena es una sub-composición, una pista de captions y un tipo por pista. **Safe zones**. Orden para un film nuevo |
| `/hyperframes-audio` | Mezcla del audio ya colocado: fades, automation, voiceover carve, cadena de FX, `<hf-audio-group>` |
| `/hyperframes-cli` | Loop del CLI (§2), cloud, Lambda, Cloud Run, protocolo de feedback |
| `/hyperframes-registry` | Buscar e instalar blocks y components (`catalog --query`, `add`). Cablearlos y contribuir items nuevos. **Hay que consultarla antes de construir a mano cualquier efecto con nombre** |
| `/media-use` | El "media OS": `resolve --type bgm\|sfx\|image\|icon\|logo\|voice\|grade\|lut` deja un archivo local congelado y una entrada en el ledger `.media/manifest.jsonl`. También genera (TTS, imagen, video avatar), transcribe, recorta por transcript, quita fondos, hace media treatments (grades y LUTs) y maneja **memoria de preferencias y recipes** (`prefs.mjs`, `recipe.mjs freeze/use`) |
| `/figma` | Importa assets, tokens de marca (como `var()`), componentes y frames de storyboard (leídos como estados, no slides) vía REST con `FIGMA_TOKEN`, y motion y shaders vía MCP |

Skills internas del repo, no publicadas: `captions-overlay`, `changelog-video`, `cut-the-curve`, `motion-doctrine`, `oversized-cursor`, `seam-craft` (`.claude/skills/`). [V]

---

## 4. Branding: cómo se define una identidad

### 4.1 Archivos y precedencia [V]

Fuente: `skills/hyperframes-creative/references/design-spec.md`.

```
frame.md  →  design.md  →  DESIGN.md      (se usa el primero que existe)
```

- **`frame.md`** es la spec de diseño a escala de frame y siempre va en minúscula. Los presets se distribuyen como `FRAME.md` en mayúscula y se *adoptan* copiándolos como `frame.md`.
- **`design.md`** sigue el formato de google-labs-code/design.md:
  - Frontmatter: `colors`, `typography`, `rounded`, `spacing`.
  - Secciones: `## Overview/Colors/Typography/Layout/Elevation/Components/Do's and Don'ts`.
  - El *design picker* lo genera (`references/design-picker.md:123`).
- **Ojo:** el `DESIGN.md` de la raíz del repo es la guía de marca **de los docs de HyperFrames** (Mintlify). No es una spec de video ni hay que copiarlo.

Cómo se lee la spec:
- **El frontmatter es normativo.** Hex, familias y pesos se citan textualmente y nunca se redondean.
- **La prosa es contexto e intención.**

Contrato de consumo (`references/video-composition.md`, "The Design Spec Is Brand, Not Layout"):
- **Estricto:** hex, incluido el fondo; familias; relaciones de peso; Do's y Don'ts.
- **Se adapta a video:** tamaños, spacing, opacidad decorativa, grosor de bordes. "A web UI card at `border: 1px solid #e2e3e6` … is invisible on video."

### 4.2 Esquema de `frame.md` (los 13 presets lo comparten) [V]

**Frontmatter:**
- `version: alpha`, `name`, `description`, `unit` ("the frame — 1920×1080 primary; 9:16 and 1:1 documented").
- `principle`: "atoms are sacred · composition is free · numbers come from the script".
- `colors:` (mapa `nombre: "#HEX"`).
- Opcionales: `borders:`, `shadows:`, `radii:`.
- `typography:`, con roles `{fontFamily, cqw, px?, weight, lineHeight, tracking, upper?, italic?}`. **Los tamaños van en `cqw`** (container query width: px ÷ 1920 × 100), así sobreviven a 9:16 y 1:1.
- `spacing:` (`slide-pad`, `gap-*`, radios).
- `components:`, con referencias `{colors.x}` y `{typography.y}` más una `description`.

**Cuerpo:** 14 secciones fijas, en este orden:
1. `## Overview`
2. `## The Frame`: Frame Craft Bar, safe area y la "container law" (`container-type: size`, solo `cqw/cqh`)
3. `## Colors`
4. `## Typography`: legibility floor y fit-to-measure
5. `## Depth & Surface`
6. `## Shapes`
7. `## Components`
8. `## Frame Treatments`: recetas Cover, Statement, Number, Quote, CTA… con `Ground · Composes · Focal · Chrome · Accent · Fixed/Free · Density`
9. `## Composition Rules`: Do y Don't
10. `## Aspect-Ratio Behavior`: tabla 16:9, 9:16 y 1:1
11. `## Approved (Real) Entities`
12. `## Numerals & Claims`: "never invent figures"
13. `## Pre-Render Self-Audit`
14. `## Known Gaps`

Opcional: `## Font loading (auto-generated)`, con un bloque `@font-face` que agrega `build-frame.mjs`.

**El motion queda explícitamente fuera de `frame.md`.** "Motion intentionally out of scope. frame.md specifies composition only." Vive en el `references/motion-language.md` de cada workflow y en `/hyperframes-animation`. (Known Gaps de `code-editorial/FRAME.md`.)

### 4.3 Ejemplo real completo: `skills/hyperframes-creative/frame-presets/code-editorial/FRAME.md` (copiado verbatim) [V]

Este es el único preset que **trae sus fuentes como WOFF2 locales con licencia OFL** (`frame-presets/code-editorial/fonts/`). Por eso es el mejor modelo para un kit offline y determinista.

````markdown
---
version: alpha
name: Code editorial — Frame (video / frame layer)
description: >
  Video-first companion to Code editorial's design.md. The unit is the frame (1920×1080). Atoms are
  identical and sacred — warm cream paper (never pure white, never cool), a single terracotta coral
  as scarce "voltage", hairline ink elevation (no heavy shadow), EB Garamond for all
  display + Inter body + JetBrains Mono for the index/code voice on a warm-navy code surface,
  sentence-case display, and the ✱ coral spike mark. Composition + frame scale rewritten. Motion out
  of scope.
unit: the frame — 1920×1080 primary; 9:16 and 1:1 documented
principle: atoms are sacred · composition is free · numbers come from the script

colors:
  ink: "#141413"
  cream: "#FAF9F5"
  tile: "#EFE9DE"
  tile-strong: "#ECE3D4"
  coral: "#CC785C"
  navy: "#181715"
  navy-soft: "#1F1E1B"
  navy-elev: "#252320"

borders: { hairline: "1px solid ink@12%", hairline-strong: "1px solid ink@20%", dark: "1px solid cream@14% (on navy)" }
shadows: { card: "0 1px 3px ink@8%, 0 4px 16px ink@4%", none: "none" }

typography:
  # — reading + chrome ramp —
  body:    { fontFamily: "Inter", cqw: 1.5, weight: 400, lineHeight: 1.5 }
  lead:    { fontFamily: "Inter", cqw: 2.08, weight: 400, lineHeight: 1.5 }
  card-title:{ fontFamily: "Inter", cqw: 2.3, weight: 500, lineHeight: 1.25, tracking: "-0.005em" }
  button:  { fontFamily: "Inter", cqw: 1.46, weight: 500, lineHeight: 1.0 }
  tag-upper:{ fontFamily: "Inter", cqw: 1.35, weight: 500, tracking: "0.18em", upper: true }
  kicker:  { fontFamily: "JetBrains Mono", px: 28, cqw: 1.46, weight: 500, tracking: "0.16em", upper: true }
  mono-label:{ fontFamily: "JetBrains Mono", px: 26, cqw: 1.35, weight: 500, tracking: "0.02em" }
  code:    { fontFamily: "JetBrains Mono", cqw: 1.67, weight: 400, lineHeight: 1.6 }
  # — display ramp (EB Garamond 400, sentence case, negative tracking. Renderer embeds only 400/700 — author at 400; italic is the synthesized slant) —
  headline:{ fontFamily: "EB Garamond", cqw: 4.6, weight: 400, lineHeight: 1.06, tracking: "-0.018em" }
  quote-pull:{ fontFamily: "EB Garamond", cqw: 5.0, weight: 400, lineHeight: 1.12, tracking: "-0.012em", italic: true }
  display-italic:{ fontFamily: "EB Garamond", cqw: 6.7, weight: 400, lineHeight: 1.05, tracking: "-0.012em", italic: true }
  display:{ fontFamily: "EB Garamond", cqw: 7.3, weight: 400, lineHeight: 1.02, tracking: "-0.022em" }
  number-hero:{ fontFamily: "EB Garamond", cqw: 9.4, weight: 400, lineHeight: 0.95, tracking: "-0.025em" }
  display-cover:{ fontFamily: "EB Garamond", cqw: 9.9, weight: 400, lineHeight: 0.98, tracking: "-0.028em" }
  number-unit:{ fontFamily: "JetBrains Mono", cqw: 2.08, weight: 500, lineHeight: 1.0 }

spacing:
  slide-pad: "4.2cqw"   # ~80px @1920
  gap-md: "1.7cqw"
  hairline: "1px"
  radius-sm: "6px"
  radius-md: "8px"
  radius-lg: "12px"
  radius-pill: "9999px"

components:
  card-hairline:
    backgroundColor: "{colors.cream} or {colors.tile}"
    border: "1px solid {colors.ink}@12%"
    rounded: "{spacing.radius-lg}"
    shadow: "{shadows.card}"
    typography: "{typography.card-title} + {typography.body}"
    description: "The editorial content card. Elevation is the hairline + ONE soft warm shadow — never a heavy drop, glow, or gradient."
  kicker-spike:
    typography: "{typography.kicker}"
    mark: "✱ coral spike prefix"
    description: "The eyebrow — JetBrains Mono uppercase, indexical (2–5 words), prefixed with the coral ✱. Never plain text, never a sentence."
  coral-callout:
    backgroundColor: "{colors.coral} (full-bleed) or {colors.cream} with a coral edge"
    textColor: "{colors.cream} on coral"
    rounded: "{spacing.radius-md}"
    typography: "{typography.button} / {typography.h2}"
    description: "The ONE voltage moment per frame — the CTA, the single inline link, OR the full-bleed band. Never two corals in one frame."
  number-lockup:
    typography: "{typography.number-hero} figure + {typography.number-unit} unit"
    description: "Hero stat — a EB Garamond figure paired with a JetBrains Mono unit (200K, +1,204, −318, 17 files). Figure is serif; the unit is ALWAYS mono, never the serif."
  pull-quote:
    typography: "{typography.quote-pull} (EB Garamond italic) + {typography.tag-upper} cite"
    description: "A commit message, a reviewer line, or the thesis. EB Garamond italic, small Inter uppercase cite beneath."
  section-rule:
    rule: "1px solid {colors.ink}@12% (or {colors.cream}@14% on navy)"
    description: "The only separator. A coral 1px rule may draw on to introduce a section. Never 2px+, never a heavy divider."
  code-surface:
    backgroundColor: "{colors.navy} body / {colors.navy-elev} title bar + status strip"
    textColor: "{colors.cream} (JetBrains Mono); syntax in coral (keywords) / teal #5DB8A6 (strings) / amber #E8A55A (numbers)"
    border: "1px solid {colors.cream}@14%"
    rounded: "{spacing.radius-md}"
    description: "The warm-navy code / terminal surface. The CODE ITSELF is rendered by the code-* registry blocks (code-diff / code-typing / code-snippet-*); this preset owns the surrounding surface, title bar, status strip, and mono chrome — not the code rendering."
  spike-mark:
    glyph: "✱ (U+2731), always {colors.coral}"
    description: "The brand mark. Fades + scales 0.92→1 on a single emphasis beat; never spins."
---

# Code editorial — Frame (video / frame layer)

## Overview

Code editorial at frame scale is a **warm-editorial brand book come to life** — the register of a literary
imprint or a research note. The thesis is three colors: **cream is the ground, ink is the voice,
coral is the voltage** — and a fourth (warm navy) only where code shows itself. Every surface is
**warm cream** (never pure white, never cool gray); content gathers on a **tile** surface half a
step darker — the demarcation is a half-step, never a hard contrast. Elevation is a **1px hairline**
ink border at low alpha plus, rarely, one soft warm shadow. There are no heavy drops, no glows, no
gradients on content.

Three editorial voices, each in its own face: **EB Garamond** carries every display moment — covers,
headlines, pull-quotes, big stat numerals — at large display sizes with gentle negative tracking;
its **italic** is the expressive register. **Inter** carries body, leads, card titles, buttons, and
UI chrome. **JetBrains Mono** carries the indexical layer — kickers, technical labels, the code
window, status strips. Switching a voice's face collapses the register: a sans headline or a serif
label reads as a different brand.

**Key characteristics at frame scale:**

- **Cream / ink / coral trinity** + a warm-navy code surface; cream is the default ground, ink the voice, coral the scarce voltage.
- **EB Garamond** (sentence case, negative-tracked) for all display; **Inter** body/chrome; **JetBrains Mono** index + code.
- **Hairline elevation** — a 1px low-alpha ink border + at most one soft warm shadow. No heavy drop, glow, or gradient.
- **Coral is rationed** — at most ONE coral moment per frame (CTA, inline link, OR full-bleed band); coral never sets a headline or a body run.
- **Density is free** — fill the frame as the content wants; a frame may stand on a single focal or carry a dense, layered composition.
- **The ✱ coral spike** opens kickers; warm navy is reserved for the code/terminal surface.

## The Frame

### Frame Craft Bar

Eyeball tests gate every frame before any structural check:

- **Squint** — one EB Garamond display moment dominates at 3–6× its neighbor.
- **Trinity** — cream/tile ground, ink text, coral exactly **once**; warm navy only on the code surface; no cool gray / pure white / fourth hue.
- **Type** — EB Garamond sentence-case display (negative-tracked); Inter 400 body; JetBrains Mono kickers (uppercase 0.16em, coral ✱) + code.

- **Primary:** 1920×1080 (16:9). Display authored in **`cqw`** (`px ÷ 1920 × 100 = cqw`).
- **Vertical:** 1080×1920 (9:16). **Square:** 1080×1080 (1:1).
- **Safe area:** `slide-pad` ~4.2cqw; the kicker/mono chrome sit inside it.

**The container law (load-bearing).** Every frame ground sets `container-type: size`; ALL
frame-relative units are `cqw`/`cqh` against it — never `vw`. Hairlines stay 1px; card radii stay
6/8/12px; the warm-paper reading must survive every ratio.

## Colors

Tokens identical to the source. Default ground `{colors.cream}`; content gathers on
`{colors.tile}` / `{colors.tile-strong}` (half-step warm steps, never a hard contrast).
**Headlines & body:** `{colors.ink}` on cream/tile; `{colors.cream}` on navy. **Coral**
(`{colors.coral}`) is the scarce voltage — one moment per frame (CTA, inline link, or full-bleed
band), never body text, never a card fill. **Warm navy** (`{colors.navy}` / `navy-soft` /
`navy-elev`) is the code / terminal / dark-card surface — a structural anchor, not a fourth brand
hue. **No cool grays, no pure white, no pure black.**

**Fixed syntax colors (decoration, NOT remixable brand hues).** When a code line is hand-set rather
than rendered by a `code-*` block, keywords are coral, strings are **teal `#5DB8A6`**, numbers are
**amber `#E8A55A`**; status reads success `#5DB872` / warn `#C64545`. These track the code surface,
not the brand trinity — keep them out of the brand palette.

## Typography

Two ramps. The **reading/chrome ramp** (Inter `body` 1.5cqw / `lead` 2.08cqw weight 400; JetBrains
Mono `kicker`/`mono-label` in px) carries copy + chrome; the **display ramp** (EB Garamond `headline` 4.6cqw
→ `display-cover` 9.9cqw, weight 400, negative-tracked) carries every headline + stat.

- **Legibility floor:** any load-bearing line ≥ **1.4cqw**; mono px labels are chrome only.
- **Fit-to-measure:** size the headline to its length. Cap the block at **≤ 78cqw**; ≤3 words → `display-cover`; 4–6 → `display`; 7+ → `headline`. Reserve the 7.3–9.9cqw tier for cover / statement / stat.
- **EB Garamond display is sentence case** (NOT title case, NOT uppercase), weight 400, negative-tracked (−0.012..−0.028em); reach for **italic** when the line is a stance or a definition. **Inter body** sentence case weight 400. **JetBrains Mono** kickers UPPERCASE 0.16em with the coral ✱. No uppercase serif, no sans headline, no serif label.

## Depth & Surface

Hairline elevation:

- **1px hairline** ink border at ~12% alpha is the primary lift (cream@14% on navy).
- **One soft warm shadow** (`0 1px 3px ink@8%, 0 4px 16px ink@4%`) — used rarely, never heavy.
- **Half-step surface** — a `{colors.tile}` block on cream reads elevated by the warm step, not by a cast shadow.

**Ceiling:** no heavy drop shadow, no glow, no gradient on content, no tilt. The system has no light
to emit; it reads by warmth and hairline.

## Shapes

- **6px** small chrome, **8px** cards / code surface, **12px** large cards / quote frames, **9999px** true pills only. No square corners, no heavy rounding; the editorial register is gently rounded, never hard.

## Components

- **card-hairline** — the editorial content card (hairline + one soft shadow). **section-rule** — the only separator (1px, coral may draw on).
- **kicker-spike** — the ✱ coral eyebrow. **coral-callout** — the one voltage moment (CTA / inline link / full-bleed band).
- **number-lockup** — EB Garamond figure + mono unit (the PR `+N / −M`, `200K`, file counts). **pull-quote** — EB Garamond italic + cite (a commit message / reviewer line).
- **code-surface** — the warm-navy code / terminal surface; the code itself comes from the **`code-*` registry blocks**, this owns the surface + mono chrome.
- **spike-mark** — the ✱ brand glyph, always coral.

## Frame Treatments

> Recipe: ground · container · composes · focal · chrome · accent · Fixed/Free · density.
> One coral moment per frame; open with a kicker-spike.

### 1 · Cover (identity · move: oversized EB Garamond · cream)

**Ground** `{colors.cream}`, `slide-pad`. **Composes** kicker-spike, display-cover, lead, mono-label index. **Focal** a 2–3 line EB Garamond `display-cover` (sentence case, ink) under a coral ✱ kicker. **Chrome** mono index strip (repo · branch). **Accent** the single coral ✱. **Fixed** EB Garamond 400 sentence case, hairline, cream ground. **Free** title, the mono index, layout + how full the frame runs. **Density** free.

### 2 · Statement (statement · move: single EB Garamond line · cream or navy)

**Ground** `{colors.cream}` (or `{colors.navy}` for gravity). **Composes** kicker-spike, display, optional lead. **Focal** one 2-line EB Garamond `display` carrying the change in a sentence — reach for **italic** if it's a stance. **Chrome** mono kicker. **Accent** none — the serif carries it (or one coral word). **Fixed** sentence-case serif. **Free** the line, ground, layout + density. **Density** free.

### 3 · Code Surface (code · move: warm-navy code window · the PR-critical frame)

**Ground** `{colors.cream}` framing a `{colors.navy}` **code-surface** (8px, cream@14% hairline, `navy-elev` title bar + filename in mono). **Composes** mono-label filename, the **`code-*` block** (code-diff / code-typing / code-snippet-_), optional `section-rule`. **Focal** the code panel — the diff / before→after / typed-on snippet. **Chrome** mono filename + status strip. **Accent** syntax coral/teal/amber inside the panel; one coral marker outside (e.g. a `+`/`−` gutter cue). **Fixed** warm-navy surface, mono code, hairline. **Free** which code-_ block, the code (from the diff), how large the panel runs. **Density** dense.

### 4 · Number / Impact (data · move: oversized figure · cream)

**Ground** `{colors.cream}`, `slide-pad`. **Composes** kicker-spike, number-lockup, lead/caption, optional `section-rule`. **Focal** a EB Garamond `number-hero` figure with a mono unit over a 1px rule — the PR impact (`+1,204 / −318`, `17 files`, `2.1× faster`). **Chrome** mono tag. **Accent** the figure in ink; at most one coral unit. **Fixed** serif figure + mono unit, hairline rule. **Free** the figures (from the script), tag, layout + density. **Density** free.

### 5 · Pull-quote (quote · move: EB Garamond italic · cream)

**Ground** `{colors.cream}`. **Composes** kicker-spike, pull-quote, tag-upper cite. **Focal** a EB Garamond **italic** `quote-pull` — a commit message, a reviewer line, or the thesis — with a small Inter uppercase cite (author · role) beneath. **Chrome** mono kicker. **Accent** none, or one coral mark. **Fixed** EB Garamond italic quote + uppercase cite. **Free** quote, attribution, layout + density. **Density** free.

### 6 · Closing / CTA (closer · move: coral voltage · cream or navy)

**Ground** `{colors.cream}` (or `{colors.navy}`). **Composes** display sign-off, coral-callout, optional contributor row (`assets/<login>.png` avatars + mono names). **Focal** a short EB Garamond sign-off with the one **coral-callout** (the CTA or full-bleed band) and, for a "shipped-by" close, a row of hairline-ringed avatar chips. **Chrome** mono index. **Accent** the single coral voltage. **Fixed** one coral moment, hairline avatar rings, sentence-case serif. **Free** sign-off, who ships, layout + density. **Density** free.

## Composition Rules

### Do

- Stand every frame on the **warm cream floor**; gather content on a **half-step tile** surface.
- Set all display in **EB Garamond, sentence case**, negative-tracked; **Inter 400** body; **JetBrains Mono** kickers (uppercase, 0.16em, coral ✱) + code.
- Ration **coral to one moment per frame** — CTA, inline link, OR full-bleed band.
- Elevate with a **1px hairline** + at most one soft warm shadow; reserve **warm navy** for the code/terminal surface.
- Lead with **one clear focal**; open regions with a **kicker-spike**. Fill the frame as the content wants.
- Pair a EB Garamond figure with a **mono unit** for every stat; render code via the **`code-*` blocks** on the navy surface.

### Don't

- No pure white, no cool gray, no pure black; no fourth brand hue (navy is structural, syntax colors are decoration).
- No heavy drop shadow, glow, gradient on content, or tilt — hairline elevation only.
- No uppercase or title-case EB Garamond display; no sans headline; no serif label; no serif-set numeric unit.
- No two coral moments in one frame; coral never sets a headline or body run.
- Don't blow a headline past the measure — step the ramp down.

## Aspect-Ratio Behavior

| Treatment     | 16:9                    | 9:16                        | 1:1                    |
| ------------- | ----------------------- | --------------------------- | ---------------------- |
| Cover         | display left, index top | display top, index below    | display, index corner  |
| Statement     | line left/centered      | line stacked                | centered               |
| Code Surface  | panel framed in cream   | panel taller, fewer lines   | panel centered, square |
| Number/Impact | figure left             | figure centered, taller     | centered               |
| Pull-quote    | quote left              | quote stacked               | centered               |
| Closing/CTA   | sign-off + avatar row   | sign-off top, avatars below | centered, avatars wrap |

`slide-pad` holds on the short edge; re-step display above the 1.4cqw floor. The code surface keeps
its hairline + mono chrome on every ratio; the avatar row wraps rather than shrinks below legibility.

## Approved Real Entities

No real customers, logos, or vendors are defined in the source — render any such mark as a
placeholder. Contributor avatars come from the project's `assets/<login>.png` (staged from the PR's
people graph); the ✱ spike, hairlines, and the code surface are CSS-only and need no external imagery.

## Numerals & Claims (hard rule)

Never invent figures, stats, diffs, or counts at frame scale. Render slots as `— figure —`,
`{metric}`, `+N / −M`. Number-lockups, code panels, and impact stats carry placeholders until the
script (from the PR ingest) supplies real values. Branch names, file counts, and `+/−` totals trace
to the diff; commit/issue numbers are chrome.

## Pre-Render Self-Audit

- **Squint** — one EB Garamond display moment dominates.
- **Trinity** — cream floor + tile step + ink voice; coral appears exactly once; warm navy only on the code surface; no cool gray / pure white / fourth hue.
- **Type** — EB Garamond sentence-case display (negative-tracked); Inter 400 body; JetBrains Mono kickers (uppercase 0.16em, coral ✱) + code; ≥1.4cqw floor.
- **Depth** — 1px hairline + at most one soft warm shadow; no heavy drop / glow / gradient / tilt; 6/8/12px radii.
- **Code** — code rendered by a `code-*` block on the warm-navy surface; syntax coral/teal/amber; figures paired with a mono unit.
- **Fabrication** — every numeral / diff traces to the PR, else placeholder.

## Known Gaps

- **Motion intentionally out of scope.** frame.md specifies composition only. Code editorial's motion register — short cross-dissolves, no overshoot/bounce/elastic, coral the only "draw-on", numbers count up, code types on line by line — lives in the workflow's `motion-language.md` + `hyperframes-animation`, not here.
- **EB Garamond + Inter + JetBrains Mono ship as licensed local WOFF2 assets with this preset.** `build-frame.mjs` stages weights 400 + 700 into `assets/fonts/` and appends the exact `@font-face` block to the generated `frame.md`, so Studio, snapshots, and renders resolve them offline without a first-run Google Fonts fetch. Author display at **weight 400** (700 reads as a heavy bold, off-register), and treat italic as the browser-synthesized slant (acceptable for the pull-quote register; add a real italic face only if a project leans hard on it). EB Garamond is a warm old-style serif (low contrast, humanist); if it ever fails, fall to Georgia or another old-style serif — never to a sans. CJK: Noto Serif SC (display) / Noto Sans SC (body) / Noto Sans Mono CJK (code); the sentence-case warmth carries when the serif drops.
- **Syntax colors (teal `#5DB8A6` / amber `#E8A55A` / status) are fixed decoration**, declared in §Colors — they are NOT in the remixable `colors:` block, so a brand remix never repaints them.
- **The code itself is the `code-*` registry blocks**, not this preset — this preset owns only the surrounding warm-navy surface + mono chrome.
- **9:16 / 1:1 are guidance**; verify the legibility floor and that the cream/tile warmth + one-coral discipline hold per ratio.
````

Los otros 12 presets son `biennale-yellow`, `blockframe`, `blue-professional`, `bold-poster`, `broadside`, `capsule`, `cartesian`, `cobalt-grid`, `coral`, `creative-mode`, `daisy-days` y `editorial-forest`. Cada uno trae `FRAME.md`, `caption-skin.html` (skin de captions karaoke) y `frame-showcase.html` (contact sheet para elegir a ojo). La tabla "Look / Pick when" está en `references/design-spec.md`. La mayoría usa Google Fonts (ver §4.5).

### 4.4 Cómo un workflow aplica la marca: `build-frame.mjs` [V]

Fuente: `skills/faceless-explainer/scripts/build-frame.mjs` (el mismo patrón en `product-launch-video`).

```bash
node <SKILL_DIR>/scripts/build-frame.mjs --preset <name> --hyperframes . [--tokens capture/extracted/tokens.json]
```

- Copia `FRAME.md` como `frame.md` y **remezcla solo los valores de `colors:` y la `fontFamily` de `typography:`**. Claves, estructura, geometría y componentes no se tocan.
- Colores **por rol**: ink toma el más oscuro, canvas el más claro y el resto se repinta con el hue y la saturación del acento de marca, conservando su luminosidad. Si la marca es dark y el preset es light, invierte el mapeo.
- Fuentes: la display del preset pasa a la display de la marca y la body a la body.
- Recorta los pesos de la tipografía a los que la fuente de marca realmente tiene.
- Pone las fuentes de `capture/assets/fonts` o `assets/fonts` en `assets/fonts/`, con nombres limpios, y **agrega el bloque `@font-face` a `frame.md`**.
- Copia `caption-skin.html` a `.hyperframes/caption-skin.html`.
- Se autovalida: sale con 1 si el mapeo se rompe.

Formato de `tokens.json` que acepta:
```json
{ "title": "", "description": "",
  "colors": ["#0E1116", "#F4F1EA", {"hex": "#FF5A36"}],
  "fonts": ["Brand Sans", {"family": "Brand Serif", "weights": [400, 700]}],
  "colorStats": [ /* opcional, producido por capture: areaBg / interactiveBg / textCount… */ ] }
```

Otra vía: el equipo ya tiene su spec. En ese caso se anota la ruta en `BRIEF.md § Assets` y el workflow la toma como verdad de marca (`skills/hyperframes/references/capability-menu.md`, "The design ask"). También se puede congelar una corrida aprobada como **recipe** (`media-use/scripts/recipe.mjs freeze --name <n>`), que guarda `frame.md`, el esqueleto de storyboard y el de brief. `recipe.mjs use` copia ese `frame.md` y se salta el paso 2. El preset elegido se recuerda como pref `style_preset` por workflow.

### 4.5 Tipografías: locales o Google Fonts [V]

Fuente: `skills/hyperframes-creative/references/typography.md`.

- **18 familias pre-embebidas** (data URI, offline, sin warning):
  - Inter 400/700/900; Roboto 400/700/900; Open Sans 400/700; Lato 400/700/900; Nunito 400/700/900.
  - Montserrat 400/700/900; Poppins 400/700/900; Outfit 400/700/900; Oswald 400/700.
  - **League Gothic y Archivo Black, solo 400.**
  - Playfair Display 400/700/900; EB Garamond 400/700.
  - Space Mono, IBM Plex Mono, JetBrains Mono, Source Code Pro y Noto Sans JP, todas 400/700.
  - Aliases: Helvetica y Arial resuelven a Inter; Futura, DIN y Arial Black a Montserrat; Bebas Neue a League Gothic; Courier a JetBrains Mono; Garamond a EB Garamond.
- **Una Google Font que no está embebida** se baja en build y se embebe. Pero dispara el warning `font_family_without_font_face` y en cloud o Lambda es **fail-closed**: si Google no responde, el render falla.
- El render local captura fuentes instaladas en el sistema y `@font-face` locales. **Lambda desactiva la captura de fuentes del sistema.**
- **Recomendación del repo para algo predecible:** fuentes de marca como archivos en `assets/fonts/` con `@font-face{font-display:block; src:url("assets/fonts/…")}` **dentro de cada archivo o template que las use**. No usar `<link>` a Google Fonts ni nombres de fuentes del sistema (CJK incluidas) (`skills/hyperframes/references/frame-worker-core.md`).
- `font-family` con nombres concretos, nunca `var(--font)`: el resolver estático no expande variables (`skills/talking-head-recut/SKILL.md:1159`).
- Lista "baneada" por monocultura de IA (renderizan bien, pero se ven genéricas): Inter, Roboto, Open Sans, Noto Sans, Arimo, Lato, Source Sans, PT Sans, Nunito, Poppins, Outfit, Sora, Playfair Display, Cormorant Garamond, Bodoni Moda, EB Garamond, Cinzel, Prata, Syne. Embebidas y no baneadas: Montserrat, Oswald, League Gothic, Archivo Black y las mono.

### 4.6 Logo [V]

- `media-use resolve --type logo` busca marcas oficiales en theSVG, después en el avatar de la org de GitHub y por último el favicon. **"never redrawn"**.
- Se prefiere el SVG: escala y se puede animar (`docs/prompting/design-systems.mdx`).
- Los paths se pasan explícitos: "Logo at `assets/logo.svg`, brand font files in `assets/fonts/` … don't invent placeholders."
- `/figma` sanea los SVG y deja procedencia en `.media/manifest.jsonl`.
- Hay blocks `logo-outro` y `extruded-logo`, y el blueprint `logo-assemble-lockup`.

### 4.7 Tokens de motion [V para themes, I para la propuesta]

- `frame.md` no tiene motion. El único lugar con tokens de motion formalizados es el **contrato de temas** `themes/CONTRACT.md`: **18 tokens CSS** que consumen los primitives del registry con fallback (`var(--fg, #f8fafc)`).

| Grupo | Tokens |
|---|---|
| Paleta | `--bg --fg --muted --surface --border --brand --accent --accent-2` |
| Tipo | `--font-display --font-body --font-mono` |
| Forma y espaciado | `--radius --space-1 --space-2 --space-3`, en `cqmin` |
| Motion | `--dur-beat --ease-standard --ease-emphasis` (cubic-bezier) |

- Ejemplo real `themes/neutral.css`: `--dur-beat:0.4s; --ease-standard:cubic-bezier(0.215,0.61,0.355,1); --ease-emphasis:cubic-bezier(0.19,1,0.22,1)`. `bold.css` usa 0.32 s con overshoot y `editorial.css` 0.48 s.
- Los theme packs se inyectan en la QA de primitives. Los primitives no declaran tokens en `:root` (`themes/CONTRACT.md`).
- Por ejemplo, `registry/components/cta-close/cta-close.html` mapea su variable `accent` a `var(--brand)`, `var(--accent)` y `var(--accent-2)`.
- **[I] Propuesta para el kit:**
  - Declarar los 18 tokens en el `:root` del `index.html`. Las sub-composiciones se inlinan en el mismo documento, así que las custom properties heredan a los components instalados.
  - Documentar el motion de marca en una sección `## Motion` agregada a `frame.md`: duraciones, eases GSAP equivalentes, transición primaria y acentos, siguiendo `transitions/overview.md` (Energy → Primary Transition, Presets `snappy/smooth/gentle/dramatic/luxe`). No es un campo oficial; para el agente es prosa de contexto.
  - Para usar los cubic-bezier en GSAP hace falta `CustomEase` o elegir el ease nombrado equivalente. No lo verifiqué en el repo.

### 4.8 Safe zones [V]

- **Studio** (`skills/hyperframes-studio/SKILL.md` §4, fuente `packages/studio/src/utils/previewSafeMargins.ts`):
  - **Action-safe: 90%** del frame, 5% de inset por lado. Todo lo visible va adentro.
  - **Title-safe: 80%**, 10% de inset. Captions y contenido clave van adentro.
  - Las guías se ven en el preview. **Nunca se meten elementos guía en el HTML.**
- **Workflows narrativos** (`frame-worker-core.md`): todo el contenido va en el **83% superior**, porque el caption pill ocupa el 17% inferior (y ≤ 900 en 1080 de alto), aunque los captions estén desactivados.
- **Gate automatizable:** `check --caption-zone "x0=0;y0=.82;x1=1;y1=1;severity=error"`, con opt-out `data-layout-allow-caption-zone`.
- **Talking head:** la cara nunca puede quedar 100% cubierta. En cada ventana de 0.3 s, al menos el 30% del bbox de la cara queda libre (`skills/embedded-captions/SKILL.md`).
- Los frame.md definen `slide-pad` (unos 4.2 cqw ≈ 80 px a 1920).

### 4.9 Componentes reutilizables [V]

- **Registry:** blocks (sub-composiciones con dimensiones, duración y timeline propios) y components (snippets que se pegan). Se instalan con `npx hyperframes add <name|tag>`.
- **Registry propio:** `hyperframes.json` tiene `"registry": "<baseUrl>"`, y `add` usa `config.registry` como base (`packages/cli/src/commands/add.ts:344`). El schema dice "Point at the official Hyperframes registry or a custom one" (`docs/schema/hyperframes.json`). El layout es `registry.json` más `<tipo>/<name>/registry-item.json` (`$schema https://hyperframes.heygen.com/schema/registry-item.json`, con `files[].target`, `variables[]`, `tags`, `syncPoints`).
- **Ojo con el cache:** el manifest se cachea 24 h, pero **`add` siempre necesita red** para bajar los archivos.
- **Sub-composiciones parametrizadas:** `data-composition-variables` y `data-variable-values` permiten una misma lower-third de marca con N contenidos.
- **Serie consistente:** "All four videos share `frame.md` … Only the headline and the stat change per video". Los tokens de marca como variables se re-skinean al renderizar (`docs/prompting/design-systems.mdx`). Para lotes: `render --batch`.

### 4.10 Kit de marca propuesto [I]

```
brand-kit/
├── frame.md            # spec normativa (formato §4.2) + sección "## Motion" + bloque @font-face
├── theme.css           # los 18 tokens del contrato themes/ con los valores de marca (pegar en :root de index.html)
├── tokens.json         # formato de build-frame.mjs, para remixar presets en workflows
├── assets/fonts/*.woff2 (+ LICENSE de cada fuente)
├── assets/logo/{logo.svg, logo-mono.svg, logo-on-accent.svg}
├── compositions/brand/ # lower-third.html, logo-sting.html, end-card.html, kicker.html (sub-composiciones con variables)
├── recipes/            # recipes congeladas por media-use (o un BRIEF.md plantilla)
└── registry/           # opcional: registry.json + items, y hyperframes.json → "registry": "https://…/registry"
```

---

## 5. Reglas de calidad que el repo le impone al agente (citas literales o casi)

**Contrato y determinismo**
- "Center with flex/`inset`, not CSS `transform: translate(-50%,-50%)` on a node you then GSAP `x`/`y`." (`skills/hyperframes-core/SKILL.md`)
- "Never pair a CSS initial `transform` with a GSAP tween on the **same** property … Set the initial state inside the tween with `gsap.fromTo`." (ídem)
- "Every `<audio>` needs an `id` … an id-less `<audio>` is never picked up by the mixer, so the render is **silent**." (ídem)
- "A lint **error** also switches off the layout and contrast audits: `check` then reports `0 sample(s)` … which reads like a clean file but means nothing ran." (ídem)
- "No `<br>` in body text; transformed elements must be block-level + sized; pulsing absolute decoratives need peak clearance." (ídem)
- "Build the visible end-state in static HTML and CSS first, then animate from/to that state." (`references/determinism-rules.md`)
- "**Pre-calculated layout constants** — never derive positions from `getBoundingClientRect()` at tween time." (`skills/hyperframes-animation/SKILL.md`)
- "**Ambient pulses must attach to the seekable `tl`, never bare `gsap.to()`** … the effect is absent in the rendered video even though it looks correct in the studio preview." (`skills/hyperframes-creative/references/motion-principles.md`)
- "**Prefer `tl.fromTo()` over `tl.from()` inside `.clip` scenes.**" y "**No iframes for captured content.**" (ídem)
- "Build the timeline SYNCHRONOUSLY … HF renders frames in parallel workers, each a fresh browser" (`skills/hyperframes-animation/rules/camera-cursor-tracking.md:133`)

**Motion**
- "Don't use the same ease on every tween … no more than 2 independent tweens with the same ease in a scene." (`motion-principles.md`)
- "The slowest scene should be 3× slower than the fastest." / "Don't enter everything from the same direction." / "Don't start at t=0. Offset the first animation 0.1-0.3s."
- "`.out` for elements entering … `.in` for elements leaving … `.inOut` for elements moving between positions."
- "**Build (0-30%)** … **Breathe (30-70%)** … **Resolve (70-100%)** … Exits are faster than entrances."
- "Total stagger sequence under 500ms regardless of item count." / "Entrances need longer than exits. A card takes 0.4s to appear but 0.25s to disappear."
- Velocidad: "Fast (0.15-0.3s) energy … Medium (0.3-0.5s) professional … Slow (0.5-0.8s) gravity … Very slow (0.8-2.0s) cinematic."
- "Every element gets a verb. If you can't name the verb, the element is not yet designed." (`references/beat-direction.md`)
- "Never embed a raw flat image. Every image must have motion treatment" (perspective tilt, Ken Burns 1→1.04, device frame…).

**Transiciones** (`skills/hyperframes-animation/transitions/overview.md`)
- "**Every composition uses transitions.** No exceptions." / "**Every scene uses entrance animations.**"
- "**Exit animations are BANNED** except on the final scene … The transition IS the exit."
- "Pick ONE primary (60-70% of scene changes) + 1-2 accents. Never use a different transition for every scene."
- Energía: Calm 0.5-0.8 s `sine.inOut`; Medium 0.3-0.5 s `power2/3`; High 0.15-0.3 s `power4/expo`.

**Tipografía y legibilidad** (`references/typography.md`, `video-composition.md`)
- "**Don't pair two sans-serifs.**" / "**One expressive font per scene.**" / "Video needs 300 vs 900."
- "Full-screen viewing … body 20px minimum, headlines 60px+ … **In-feed** … body ≥32px, headlines ≥90px, data labels ≥24px."
- "**Fixed reading time.** 3 seconds on screen = must be readable in 2. Fewer words, larger type." / "Tracking tighter than web. -0.03em to -0.05em on display sizes."
- Tabla de escala web→video: headlines 64-120 px, body 28-42 px, labels 18-24 px, opacidad decorativa 12-25%, bordes 2-4 px, padding 60-140 px. "If you're writing a font-size under 24px in a video composition, justify it."
- "`tabular-nums` is essential any time numbers are stacked vertically."
- Contraste WCAG AA, que `check` hace cumplir: 4.5:1 para texto normal y 3:1 para grande.

**Color y composición** (`house-style.md`, `video-composition.md`, `motion-principles.md`)
- Defaults perezosos que hay que cuestionar: "Gradient text … Left-edge accent stripes … Cyan-on-dark / purple-to-blue gradients … Pure `#000` or `#fff` … Identical card grids … Everything centered with equal weight."
- "**No full-screen linear gradients on dark backgrounds.** They band visibly under H.264 compression."
- "Brand accent should be VISIBLE — not a 5% opacity glow lost in compression."
- "**Two focal points minimum.**" / "Hero text: 60-80% of frame width." / "Anchor to edges … Centered-and-floating is a web pattern." / "Three layers minimum per scene."
- "Connector lines earn their place … A line the frame can lose without losing meaning is decoration: cut it."

**Datos** (`references/data-in-motion.md`): "**No pie charts** … **No multi-axis charts** … **No 6-panel dashboards** … **No gridlines, tick marks, or legends** … **No chart library output** — build with GSAP + SVG/CSS."

**Narración y timing de texto**
- "**2.5 words per second** is natural speaking pace … The script should feel SHORTER than the video." (`references/narration.md`)
- "TTS runs at **~2.2 words/second**, so a 45-word '7-second' script is really 20 seconds." (`skills/pr-to-video/references/story-design.md:175`)
- Pronunciación: escribir "ninety nine point nine percent", "A P I", "stripe dot com"; en pantalla puede ir la cifra exacta.
- "Visible text is short motion-graphics copy … never a sentence from the narration." / "**Build the whole shot — reveal across the full `duration`, never front-load.**" (`frame-worker-core.md`)

**Captions** (`skills/embedded-captions/SKILL.md`)
- "**Each caption ≥ 0.5s on screen**." / "**Word timings must match transcript.json within 80ms**." / "Never pack multiple transcript words into one entry."
- "**Embed is scarce + spaced.** ≤1 embed per sentence/beat … at most one `apex`." / "**Never grade/recolor the video.**"

**Veracidad**: "Never invent figures, stats, diffs, or counts at frame scale. Render slots as `— figure —`." (Numerals & Claims, en todos los FRAME.md)

**Proceso**: "Never render merely because checks pass. Pause at the final preview and wait for approval." (`skills/hyperframes-cli/SKILL.md`). "Search the catalog before writing motion by hand." "Do not recreate supported vignette, grain, blur … with CSS/SVG overlays." (`media-use`)

---

## 6. Flujo de revisión humano y agente [V]

Fuentes: `skills/hyperframes/references/review-loop.md`, `production-loop.md` y `storyboard-recipe.md`.

1. **Plan en el chat (§1):** "This video tells [audience] that [message]" y una tabla por frame (frame · beat · on screen · why). Se guarda en `STORYBOARD.md`, con frontmatter `format, duration, message, arc, audience, mode` y por frame `status outline|built|animated, src, duration, transition_in, scene, voiceover, poster`. El checkpoint pregunta: ¿aprobás, y querés sketches primero?
2. **Sketch pass (§2):** se posa cada frame estático con la marca real, en `index.html`. `snapshot --at <t de cada frame> --no-end -o boards/stills` arma el **board `boards/storyboard.html`** (`.frame > img + .title "NN: nombre" + .time`). El humano comenta frames y **solo esos se re-posan**. Un board confirmado ya puede ser el entregable.
3. **Build (§3):** se viste el layout aprobado sin redibujarlo. Los frames se construyen en paralelo con subagentes, y los blocks se instalan **antes** del trabajo paralelo.
4. **Verificación:**
   - `lint` mientras se itera; `check` como gate, con `--snapshots` (overview anotado y crops por hallazgo).
   - Sidecar **`*.motion.json`** con aserciones `appearsBy`, `before`, `staysInFrame` y `keepsMoving`.
   - Contact sheet en los puntos medios de cada escena.
   - `keyframes --shot` para motion.
   - `compare` para A/B.
   - `snapshot --zoom "#sel"` para inspeccionar de cerca.
   - "Batch visual checks (one contact sheet beats N single-frame views)", porque las imágenes invalidan el prompt cache.
5. **Final look (§4):** `preview --background`, URL `#project/<name>` verificada con HTTP 200 y una sola pregunta: "render now, or what changes?". En **Studio** el humano puede editar directamente (click, texto, trim en el timeline) y los cambios se escriben al source. Para "this element", el agente consulta `preview --context --json --context-fields selection`. `history` separa ediciones humanas de las del agente. Se ofrece la app de escritorio (Framey, edición por chat y dibujo sobre el frame).
6. **Render** con aprobación. Después: verificación con ffprobe, `publish` opcional (link privado), **oferta de congelar recipe** y `feedback --rating`.
7. Pedidos de cambio: el feedback llega por chat y se aplican **solo los frames nombrados**. Una "nota sentida" ("se siente jolty") se traduce a una causa medible y se registra en `STORYBOARD.md` (`hyperframes-studio` §0).

---

## 7. Licencias, dependencias, telemetría, cuenta, HeyGen

**Licencias**
- HyperFrames es **Apache-2.0** [V].
- **GSAP:** no es OSI. Los composites lo cargan desde el CDN (gsap 3.14.2/3.15.0) y algunos blocks lo vendorizan con `GSAP-NOTICE.txt`. Según `CREDITS.md` va "under the GSAP Standard License (not an OSI open-source licence)". El npm de `gsap@3.15.0` declara la licencia "Standard 'no charge' license: https://gsap.com/standard-license" [V].
- [I] Por lo que sé (sin verificar online en esta sesión): desde 3.13 (2025, tras la compra por Webflow) GSAP y todos sus plugins son gratis también para uso comercial, pero la licencia excluye usarlo en productos que compitan con las herramientas visuales de Webflow. **Hay que revisarlo con legal si el kit se vuelve un producto o editor visual de terceros.** Para uso interno de marketing no parece problemático.
- Otras [V] (`CREDITS.md`):
  - mediabunny: MPL-2.0, en Studio.
  - Parakeet TDT 0.6B v3: CC-BY-4.0.
  - u2net_human_seg: Apache-2.0.
  - Kokoro-82M: [I] Apache-2.0 según upstream, no verificado.
  - Three.js: MIT, vendorizado en algunos blocks.
  - Fuentes de presets: OFL.
  - Algunos assets de blocks 3D tienen "Origin to be confirmed".
- El CLI depende de puppeteer-core, sharp, esbuild, hono, fontkit, postcss y prettier (`npm view hyperframes dependencies`). Unpacked pesa unos 21.8 MB [V].

**Telemetría** [V] (`docs/packages/cli.mdx:1602-1632`, `packages/cli/src/telemetry/`)
- Activa por defecto, vía PostHog. Junta:
  - Comandos y performance de render.
  - Nombres de errores.
  - Fingerprint coarse: SO, kernel, CPU, RAM, sandbox y el **nombre del agente** detectado (`claude_code`, `codex`…).
  - Items de registry instalados.
- **No** junta nombres de proyecto, contenido ni valores de variables de entorno.
- Con `auth login`, vincula el email HeyGen y **costura el uso anónimo previo**.
- Opt-out: `npx hyperframes telemetry disable`, `HYPERFRAMES_NO_TELEMETRY=1` o `DO_NOT_TRACK=1`. Desactivarla saca a la instalación de los canary rollouts.
- Las skills le piden al agente que mande `feedback`, que va a un **canal público**. Hay que anonimizar o desactivarlo por política.

**Cuenta y pago** [V]
- Render local, lint, check, preview y Studio: gratis y sin cuenta. "local rendering does not use HeyGen credits" (`docs/quickstart.mdx`).
- Con cuenta HeyGen: `cloud render` (créditos), `publish` y `auth`.

**Integraciones HeyGen** [V] (`skills/media-use/references/setup-providers.md`)
- El CLI `heygen` (≥0.3.0) con `heygen auth login --oauth` da una **cuota gratis** para:
  - Búsqueda de **BGM** en el catálogo, más de 10k tracks. `resolve --type bgm` **requiere** el CLI heygen.
  - Imágenes (más de 75k vectores) e íconos.
  - **TTS**: voz default "Marcia".
  - **Videos de avatar** (`heygen video create`) y `video-translate` (doblaje).
- Con API key se cobran créditos de API.
- Una app host puede inyectar `HEYGEN_API_BASE/HEYGEN_API_KEY`.

**Alternativas locales, sin cuenta** [V]
- TTS **Kokoro** (`hyperframes tts`, voces `am_/bm_/af_/bf_`).
- Transcripción con Parakeet o whisper.cpp.
- Imagen con mflux (FLUX) y video con LTX.
- SFX desde Openverse (CC0 o CC BY, sin cuenta) más una librería bundled de 21 archivos (`skills/media-use/audio/assets/sfx`).
- Logos por theSVG, GitHub o favicon.
- `--local-only` corta toda la red.
- **No hay una librería de música libre bundled.** Sin HeyGen, la música la aporta el equipo [V/I].
- Opcionales: `GEMINI_API_KEY`/`GOOGLE_API_KEY` (generación de imagen y captions de visión en capture), `OPENROUTER_API_KEY`, Vertex, `FIGMA_TOKEN`.

**Adopters declarados** (`ADOPTERS.md`) [V]
- En producción: HeyGen, tldraw (videos de PR), reap, Typeframe, THU-MAIC, Mini Course Generator, PandaStudio y Skyflo.
- Evaluando: TanStack y OptinMonster.

---

## 8. Limitaciones, riesgos y gotchas

**Madurez y churn**
- Pre-1.0, más de 500 releases en 7 meses (2-4 por día). Las skills cambian sin parar y skills.sh va atrasado.
- `FrameAdapter` es experimental v0. `history` está en *trial*. Studio está "Available, evolving".
- Mitigación [I]: fijar `hyperframes@<ver>` (init ya lo hace en `package.json`), congelar skills con `HYPERFRAMES_SKIP_SKILLS=1` o vendorizarlas, y subir de versión con `npx hyperframes@latest upgrade --project . --check` más un `check` (`skills/hyperframes/SKILL.md`).

**Costo y complejidad del agente** [I]
- Las skills son extensas: `talking-head-recut` tiene 1204 líneas y `hyperframes-animation` 122 archivos.
- Los workflows narrativos usan subagentes por frame y varios checkpoints.
- La intent layer hace preguntas de a una por mensaje, lo que suma latencia y tokens.
- Para un kit conviene fijar el flujo (BRIEF.md o recipe) y usar `/general-video` o `/motion-graphics`.

**Determinismo, gotchas** [V]
- Hay drift entre máquinas por Chrome, fuentes y GPU. `--docker` lo fija, pero agrega overhead.
- WebGL y shaders pueden diferir entre GPUs; el software GL es lento. Shader transitions usan html2canvas, que no replica CSS exacto.
- Los iframes no hacen seek.
- `document.fonts.ready` con workers paralelos produce frames con fuente fallback si se registra tarde. Conviene `font-display:block` y build síncrono, o registrar al final del callback.
- `data-duration` del root es de compile-time: no se puede variar por variable.
- Referencias relativas de `data-start` mal escritas caen silenciosamente en t=0.
- `gsap.from` con CSS `opacity:0` es un no-op 0→0 y el elemento nunca aparece.
- **Red durante el compile:** GSAP y Google Fonts se bajan y se inlinan en build (`inlineExternalScripts`). En CI air-gapped hay que vendorizar `gsap.min.js` y las fuentes localmente [V el mecanismo, I la recomendación].
- Fuentes de Google no embebidas son fail-closed en cloud. Lambda no captura fuentes del sistema.
- Videos con GOP disperso se congelan. No hay freeze arbitrario a mitad de la fuente, ni face tracking o reencuadre semántico automático, ni detección automática de match frame (`hyperframes-keyframes`).
- **Los ejemplos de `registry/examples/` usan patrones viejos**: `<link>` a Google Fonts, textura remota `transparenttextures.com`, `@keyframes` infinito, clase `.scene`, root de sub-composición estilizado por atributo. **Las skills mandan.** No hay que copiar esos ejemplos tal cual.

**Tiempos de render** [V/I]
- Entre 1× y 2.5× tiempo real a 1080p30 en una máquina dev (dato del repo).
- 60 fps duplica el tiempo y 4K (supersampling) lo multiplica [I].
- WebM con alpha es lento por VP9.
- Hay penalizaciones fijas de 45 s si falta el timeline o si los ids no coinciden.
- Linux sin BeginFrame (Chrome de sistema) o con software GL es el camino lento.

**Plataforma**
- No hay headless-shell para Linux ARM64.
- Sandboxes de macOS bloquean Chrome.
- WSL2 sin GPU.
- Cloud render tiene un límite de 200 MB.

**Producto**
- El "Ask agent" de Studio solo copia el prompt; la edición conversacional vive en la app de escritorio Framey.
- La telemetría y el `feedback` público van activos por defecto.
- BGM e imagen "free" atan el flujo a una cuenta HeyGen.

---

## 9. Hello world mínimo correcto (base del kit)

Está construido siguiendo exactamente el contrato de `hyperframes-core`, la convención de Studio (cada escena es una sub-composición) y la mecánica de transiciones de los workflows. Los crossfades se hacen sobre los hosts `#el-*` en el timeline `main`, alargando solo el slot saliente (`skills/faceless-explainer/scripts/transitions.mjs` y `lib/transitions.json`). El esqueleto viene de `packages/cli/src/templates/blank/index.html`, `skills/hyperframes-core/references/composition-patterns.md` y `registry/blocks/lt-clean-bar`.

**Usa solo fuentes pre-embebidas (Montserrat e IBM Plex Mono), así que no necesita archivos ni red para fuentes.** [I] **No ejecuté `lint`/`check`, por la restricción de no correr código del repo.** Lo validé a mano contra las reglas citadas. Primer paso recomendado: `npx hyperframes check --strict`.

Contraste calculado:
- `#F4F1EA` sobre `#0E1116`: más de 15:1.
- `#FF5A36` sobre `#0E1116`: unos 6.1:1.
- `#0E1116` sobre `#FF5A36`: unos 6.1:1.
- `#9AA3AE` sobre `#0E1116`: unos 7.4:1.

### 9.1 Estructura

```
hello-brand/
├── hyperframes.json          # lo crea init (registry + paths)
├── package.json              # lo crea init (scripts fijados: dev/check/render/publish)
├── index.html                # root: solo hosts + (audio opcional) + timeline main con transiciones
├── compositions/
│   ├── intro.html            # escena 1 (0–4 s, slot 4.5 s por el solape)
│   ├── stat.html             # escena 2 (4–8 s, slot 4.5 s)
│   └── outro.html            # escena 3 (8–12 s)
└── assets/                   # opcional: fonts/, logo.svg, bgm.mp3
```

### 9.2 `index.html`

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>Hello Brand</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1920px; height: 1080px; overflow: hidden; background: #0e1116; }
      /* Tokens de marca (contrato themes/CONTRACT.md): los components del registry los heredan */
      :root {
        --bg: #0e1116; --fg: #f4f1ea; --muted: #9aa3ae; --surface: #171b22; --border: #2a2f38;
        --brand: #ff5a36; --accent: #ff5a36; --accent-2: #ffb199;
        --font-display: "Montserrat", sans-serif; --font-body: "Montserrat", sans-serif;
        --font-mono: "IBM Plex Mono", monospace;
        --radius: 1.2cqmin; --space-1: 1.2cqmin; --space-2: 2.4cqmin; --space-3: 4cqmin;
        --dur-beat: 0.4s; --ease-standard: cubic-bezier(0.215, 0.61, 0.355, 1);
        --ease-emphasis: cubic-bezier(0.19, 1, 0.22, 1);
      }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; background: #0e1116; }
      #root > div[data-composition-src] { position: absolute; inset: 0; }
    </style>
  </head>
  <body>
    <div
      id="root"
      data-composition-id="main"
      data-start="0"
      data-duration="12"
      data-fps="30"
      data-width="1920"
      data-height="1080"
    >
      <!-- Escena 1: 0–4 s; el slot dura 4.5 s para cubrir el crossfade -->
      <div
        id="el-intro"
        data-composition-id="intro"
        data-composition-src="compositions/intro.html"
        data-start="0"
        data-duration="4.5"
        data-track-index="1"
        data-track-kind="graphics"
      ></div>

      <!-- Escena 2: 4–8 s; pista alternada para que los slots que se solapan no compartan carril -->
      <div
        id="el-stat"
        data-composition-id="stat"
        data-composition-src="compositions/stat.html"
        data-start="4"
        data-duration="4.5"
        data-track-index="2"
        data-track-kind="graphics"
      ></div>

      <!-- Escena 3: 8–12 s (final: puede sostener el lockup) -->
      <div
        id="el-outro"
        data-composition-id="outro"
        data-composition-src="compositions/outro.html"
        data-start="8"
        data-duration="4"
        data-track-index="1"
        data-track-kind="graphics"
      ></div>

      <!-- Música opcional: id obligatorio, pista alta, fade con automation lane.
      <audio id="bgm" src="assets/bgm.mp3" data-start="0" data-duration="12" data-track-index="10"
        data-volume="0.5"
        data-automation='{"version":1,"lanes":[{"target":"volume","points":[{"t":0,"v":0},{"t":0.8,"v":1},{"t":10.8,"v":1},{"t":11.9,"v":0}]}]}'></audio>
      -->
    </div>

    <script>
      const tl = gsap.timeline({ paused: true });
      // 1 → 2: crossfade 0.5 s en T=4 (primaria)
      tl.to("#el-intro", { opacity: 0, duration: 0.5, ease: "power2.inOut" }, 4);
      tl.fromTo("#el-stat", { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.inOut" }, 4);
      // 2 → 3: blur-crossfade 0.5 s en T=8 (acento)
      tl.to("#el-stat", { filter: "blur(10px)", scale: 1.03, opacity: 0, duration: 0.5, ease: "power2.inOut" }, 8);
      tl.fromTo(
        "#el-outro",
        { filter: "blur(10px)", scale: 0.97, opacity: 0 },
        { filter: "blur(0px)", scale: 1, opacity: 1, duration: 0.5, ease: "power2.inOut" },
        8,
      );
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
```

### 9.3 `compositions/intro.html`

```html
<template id="intro-template">
  <div id="root" data-composition-id="intro" data-width="1920" data-height="1080" data-duration="4.5">
    <style>
      #root { position: absolute; inset: 0; overflow: hidden; color: #f4f1ea; font-family: "Montserrat", sans-serif; }
      .intro-bg { position: absolute; inset: 0; background: #0e1116; }
      .intro-glow {
        position: absolute; width: 1200px; height: 1200px; right: -300px; top: -360px; border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 90, 54, 0.3) 0%, rgba(255, 90, 54, 0) 65%);
      }
      /* bottom 180px: keep-out de captions (17% inferior) */
      .intro-content {
        position: absolute; left: 160px; top: 0; bottom: 180px; width: 1400px;
        display: flex; flex-direction: column; justify-content: center; gap: 32px;
      }
      .intro-kicker {
        font-family: "IBM Plex Mono", monospace; font-size: 30px; font-weight: 700;
        letter-spacing: 0.16em; text-transform: uppercase; color: #ff5a36;
      }
      .intro-title { margin: 0; font-size: 136px; font-weight: 900; line-height: 0.98; letter-spacing: -0.035em; max-width: 1400px; }
      .intro-rule { display: block; width: 420px; height: 8px; background: #ff5a36; transform-origin: 0 50%; }
    </style>

    <!-- Fondo full-bleed como clip propio (no en #root): frame-worker-core.md -->
    <div id="intro-bg" class="intro-bg clip" data-start="0" data-duration="4.5" data-track-index="0"></div>
    <div id="intro-glow" class="intro-glow" data-layout-ignore></div>
    <div class="intro-content">
      <div id="intro-kicker" class="intro-kicker">Kit de marca · v1</div>
      <h1 id="intro-title" class="intro-title">Video con código, marca intacta.</h1>
      <div id="intro-rule" class="intro-rule"></div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      (function () {
        const tl = gsap.timeline({ paused: true });
        // ambiente: respira durante toda la escena (atado al tl, nunca gsap.to suelto)
        tl.fromTo("#intro-glow", { scale: 0.92, opacity: 0.55 }, { scale: 1.08, opacity: 1, duration: 4.4, ease: "sine.inOut" }, 0);
        // entradas escalonadas, eases y direcciones distintas, primer tween en 0.2 s
        tl.fromTo("#intro-kicker", { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.45, ease: "power3.out" }, 0.2);
        tl.fromTo("#intro-title", { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" }, 0.35);
        tl.fromTo("#intro-rule", { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power2.inOut" }, 0.9);
        // sin exit: la transición del root ES la salida
        window.__timelines["intro"] = tl;
      })();
    </script>
  </div>
</template>
```

### 9.4 `compositions/stat.html`

Patrón de `skills/hyperframes-animation/rules/counting-dynamic-scale.md` y `stat-bars-and-fills.md`.

```html
<template id="stat-template">
  <div id="root" data-composition-id="stat" data-width="1920" data-height="1080" data-duration="4.5">
    <style>
      #root { position: absolute; inset: 0; overflow: hidden; color: #f4f1ea; font-family: "Montserrat", sans-serif; }
      .stat-bg { position: absolute; inset: 0; background: #0e1116; }
      .stat-grid {
        position: absolute; top: 0; bottom: 0; left: 0; right: -120px; opacity: 0.18;
        background-image: linear-gradient(#2a2f38 2px, transparent 2px), linear-gradient(90deg, #2a2f38 2px, transparent 2px);
        background-size: 120px 120px;
      }
      .stat-panel {
        position: absolute; left: 160px; right: 160px; top: 140px; height: 700px;
        display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 80px;
      }
      .stat-kicker {
        font-family: "IBM Plex Mono", monospace; font-size: 30px; font-weight: 700;
        letter-spacing: 0.16em; text-transform: uppercase; color: #9aa3ae; margin-bottom: 24px;
      }
      .stat-number-wrap { display: flex; align-items: baseline; width: 760px; }
      .stat-number {
        display: inline-block; font-size: 300px; font-weight: 900; line-height: 0.9; letter-spacing: -0.04em;
        font-variant-numeric: tabular-nums; transform-origin: 0 100%;
      }
      .stat-suffix { display: inline-block; font-size: 160px; font-weight: 900; color: #ff5a36; margin-left: 12px; }
      .stat-label { margin: 0; font-size: 52px; font-weight: 700; line-height: 1.15; max-width: 640px; }
      .stat-track { margin-top: 48px; width: 640px; height: 24px; background: #232833; }
      .stat-fill { display: block; width: 100%; height: 100%; background: #ff5a36; transform-origin: 0 50%; }
    </style>

    <div id="stat-bg" class="stat-bg clip" data-start="0" data-duration="4.5" data-track-index="0"></div>
    <div id="stat-grid" class="stat-grid" data-layout-ignore></div>
    <div class="stat-panel">
      <div>
        <div id="stat-kicker" class="stat-kicker">Resultado · Q3</div>
        <div class="stat-number-wrap">
          <span id="stat-number" class="stat-number">0</span><span id="stat-suffix" class="stat-suffix">%</span>
        </div>
      </div>
      <div>
        <p id="stat-label" class="stat-label">menos tiempo de edición por pieza</p>
        <div class="stat-track"><div id="stat-fill" class="stat-fill"></div></div>
      </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      (function () {
        const tl = gsap.timeline({ paused: true });
        const numberEl = document.getElementById("stat-number");
        const state = { value: 0 };
        // ambiente: la grilla deriva despacio toda la escena
        tl.fromTo("#stat-grid", { x: 0 }, { x: -120, duration: 4.4, ease: "none" }, 0);
        tl.fromTo("#stat-kicker", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0.15);
        // count-up: valor (solo texto) + escala con el MISMO tiempo y ease
        tl.fromTo(
          state,
          { value: 0 },
          { value: 38, duration: 1.4, ease: "power3.out",
            onUpdate: () => { numberEl.textContent = String(Math.round(state.value)); } },
          0.3,
        );
        tl.fromTo("#stat-number", { scale: 0.6 }, { scale: 1, duration: 1.4, ease: "power3.out" }, 0.3);
        tl.fromTo("#stat-fill", { scaleX: 0 }, { scaleX: 0.38, duration: 1.4, ease: "power3.out" }, 0.3);
        // el sufijo llega DESPUÉS de que el número aterriza (su propio beat)
        tl.fromTo("#stat-suffix", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.6)" }, 1.7);
        tl.fromTo("#stat-label", { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.6, ease: "expo.out" }, 0.9);
        window.__timelines["stat"] = tl;
      })();
    </script>
  </div>
</template>
```

### 9.5 `compositions/outro.html`

```html
<template id="outro-template">
  <div id="root" data-composition-id="outro" data-width="1920" data-height="1080" data-duration="4">
    <style>
      #root { position: absolute; inset: 0; overflow: hidden; color: #0e1116; font-family: "Montserrat", sans-serif; }
      .outro-bg { position: absolute; inset: 0; background: #ff5a36; }
      .outro-lockup {
        position: absolute; left: 0; right: 0; top: 0; bottom: 180px;
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 36px;
      }
      /* placeholder del logo: reemplazar por <img id="outro-mark" src="assets/logo.svg" …> */
      .outro-mark { display: block; width: 140px; height: 140px; border-radius: 50%; background: #0e1116; }
      .outro-word { margin: 0; font-size: 150px; font-weight: 900; line-height: 1; letter-spacing: -0.04em; }
      .outro-url { font-family: "IBM Plex Mono", monospace; font-size: 40px; font-weight: 700; letter-spacing: 0.08em; }
    </style>

    <div id="outro-bg" class="outro-bg clip" data-start="0" data-duration="4" data-track-index="0"></div>
    <div class="outro-lockup">
      <div id="outro-mark" class="outro-mark"></div>
      <h2 id="outro-word" class="outro-word">acme</h2>
      <div id="outro-url" class="outro-url">acme.dev/kit</div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <script>
      (function () {
        const tl = gsap.timeline({ paused: true });
        tl.fromTo("#outro-mark", { scale: 0 }, { scale: 1, duration: 0.6, ease: "back.out(1.7)" }, 0.25);
        tl.fromTo("#outro-word", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.45);
        tl.fromTo("#outro-url", { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power1.out" }, 0.9);
        // escena final: el lockup se sostiene quieto hasta el corte (no terminar en negro)
        window.__timelines["outro"] = tl;
      })();
    </script>
  </div>
</template>
```

### 9.6 Comandos exactos

```bash
npx hyperframes init hello-brand --non-interactive      # crea index.html, hyperframes.json, package.json (dir debe estar vacío o no existir)
cd hello-brand                                          # reemplazar index.html y crear compositions/*.html (9.2–9.5)
npx hyperframes lint                                    # estático, iterar hasta 0 errores
npx hyperframes check --snapshots                       # gate final (runtime, layout, motion, contraste WCAG)
npx hyperframes snapshot --at 2,6,10.5                  # punto medio de cada escena → contact sheet
npx hyperframes preview --background                    # Studio: http://localhost:3002/#project/hello-brand
npx hyperframes render --quality delivery --output renders/hello-brand.mp4
ffprobe -v error -show_format -show_streams renders/hello-brand.mp4   # duración debe ser 12 s
# reproducible / CI:
HYPERFRAMES_NO_TELEMETRY=1 npx hyperframes render --docker --strict --quality delivery -o renders/hello-brand.mp4
# overlay transparente (sin fondos opacos): --format mov  (ProRes 4444) o --format webm
```

**Para convertirlo en kit [I]:**
- Reemplazar hex y fuentes por los de la marca, con `@font-face` hacia `assets/fonts/*.woff2` dentro de cada `<template>`.
- Agregar `frame.md` con el esquema de §4.2.
- Pasar `kicker`, `title`, `value` y `label` a `data-composition-variables` en cada sub-composición, para usar `data-variable-values` por instancia y `render --batch`.
- Opcional: un sidecar `index.motion.json` con `appearsBy` para `#intro-title`, `#stat-number` y `#outro-word`.
