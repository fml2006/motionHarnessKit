# 03 — Remotion (React → video) con Claude Code + skills, y comparativa crítica para un equipo enterprise de video tech

Fecha de corte: 2026-10-19. Autor: investigación de ingeniería de video programático.

## 0. Cómo leer este informe (niveles de evidencia)

| Marca | Significado |
|---|---|
| **[V]** | Verificado en esta sesión contra fuente primaria: archivos de las skills oficiales, registry de npm (`npm view` / `npm pack`), código fuente de la documentación oficial de Remotion (clon parcial de `remotion-dev/remotion`, commit `4ffefcc`, 2026-10-18) o el repo de HyperFrames (commit `cea0bad`, 2026-10-19). |
| **[S]** | Fuente secundaria: resultados de búsqueda web (blogs, agregadores). Útil como contraste, no como base de decisión. |
| **[I]** | Inferido o conocimiento previo del autor (corte de conocimiento: junio de 2026). No verificado en esta sesión. Antes de decidir sobre esto, hay que confirmarlo. |

**Limitación importante:** el cupo de WebSearch, compartido entre agentes, se agotó después de 4 búsquedas. Por eso la licencia y los precios de Remotion se verificaron contra el **código fuente oficial de la documentación** (`packages/docs/docs/license/faq.mdx` y `terms.mdx`) y contra el `LICENSE.md` del paquete npm. Esas fuentes son mejores que las búsquedas. En cambio, casi toda la información sobre alternativas que no son de código (Jitter, Cavalry, Canva, After Effects, Veo/Kling/Runway) es **[I]**. Si se quiere completar con precios 2026 de esas herramientas, hace falta otra ronda de búsqueda.

---

## 1. Resumen ejecutivo

- **Versión actual de Remotion:** `4.0.536`, publicada el 2026-10-16 [V npm]. Remotion 5.0 **no está publicado**. Existe una guía de migración con cambios planificados y el dist-tag `alpha` apunta a `4.1.0-alpha12` [V]. La cadencia es de unas 3 releases de patch por semana: 4.0.400 salió el 2026-01-05 y 4.0.536 el 2026-10-16 [V]. Las skills oficiales están versionadas en lockstep (`version: 4.0.536` en cada SKILL.md) [V].
- **Licencia de Remotion:** el código es source-available, **no es open source según OSI** [V faq.mdx].
  - Es **gratis**, incluso para uso comercial y automatizaciones, para individuos, organizaciones de **hasta 3 personas**, entidades sin fines de lucro y uso en evaluación.
  - A partir de **4 personas** de headcount total (cuentan todos los empleados, usen o no Remotion; con los términos v5 también cuentan los contratistas), hace falta una **Company License**:
    - **Creators:** USD 25 por seat al mes, sin mínimo.
    - **Automators:** USD 0,01 por render, facturado en bloques de 1.000 (USD 10), con un mínimo de USD 100 al mes.
    - **Enterprise:** el mismo esquema con un mínimo de USD 500 al mes, que incluye papeleo, contrato firmado, consultoría mensual y canal privado.
  - Con Remotion 5.0, la **telemetría pasa a ser obligatoria** para clientes Automators, mediante una license key. Quien no pueda habilitarla debe entregar un reporte mensual verificable [V].
- **Recomendación:**
  - **Motor primario: Remotion.** Es maduro (1.0 en 2021, 4.0 en 2023), tiene Lambda distribuido probado, plantillas tipadas con zod, Studio con edición visual que escribe al código y skills/plugin oficiales para Claude Code mantenidos por el vendor. Para una empresa, el costo de licencia es marginal.
  - **Motor secundario: HyperFrames** (Apache 2.0, HTML + GSAP, pensado para agentes). Sirve para reusar material web y HTML, para los workflows "PR-to-video" y "product launch" que trae listos, para renders en GCP Cloud Run o HDR y como cobertura ante riesgo de licencia.
  - **Por qué HyperFrames no va como primario:** tiene unos 7 meses de vida (primera publicación en npm el 2026-03-23), está en `0.8.x` con 528 versiones publicadas, su roadmap lo controla HeyGen, depende de GSAP (licencia no OSI), su Lambda es más nuevo y la telemetría viene activada por defecto [V].
  - **Herramientas complementarias, no motores:**
    - After Effects con Lottie o Rive, para piezas "hero" hechas por diseñadores.
    - Un NLE (Premiere o Resolve) para el armado final.
    - IA generativa (Veo, Kling, Runway) **solo para b-roll**, nunca para texto, UI, código ni datos.

---

## 2. Remotion: modelo mental y superficie técnica

### 2.1 Modelo mental [V salvo indicación]

**Un video es una función pura del número de frame.** El renderer abre varias pestañas de Chrome headless en paralelo y les pide frames en cualquier orden. Si un componente devuelve algo distinto para el mismo frame, o depende del orden, aparece flicker. Fuente: `packages/docs/docs/flickering.mdx`: "Tabs don't share state and animations that run independent of `useCurrentFrame()` will break."

| Concepto | API | Notas clave |
|---|---|---|
| Composición | `<Composition id component width height fps durationInFrames defaultProps schema calculateMetadata>` | `defaultProps` debe ser JSON-serializable (también se admiten `Date`, `Map`, `Set` y `staticFile()`). `<Still>` sirve para imágenes; `<Folder>` organiza el sidebar (`skills/remotion-markup/compositions.md`). |
| Tiempo | `useCurrentFrame()`, `useVideoConfig()` | El `fps` siempre sale de `useVideoConfig()`, nunca de una constante (`remotion-markup/SKILL.md`). |
| Interpolación | `interpolate(frame, inRange, outRange, {extrapolateLeft/Right:'clamp', easing, output:'perceptual-scale', posterize})` | Sin clamp extrapola. Admite multi-keyframe con un array de `n-1` easings. `output:'perceptual-scale'` corrige la percepción de las animaciones de escala (`remotion-markup/timing.md`). |
| Easing / spring | `Easing.bezier()`, `Easing.spring({damping})`; `spring()` sigue exportado | Las skills actuales **prefieren `Easing.spring` dentro de `interpolate`** en lugar de `spring()` suelto, porque así Studio puede editar los keyframes. Se verificó que `spring` sigue exportado en `remotion@4.0.536`. |
| Secuenciación | `<Sequence from durationInFrames layout>`, `<Series>`, **`<Track>`** (nuevo), timing props directos | Los componentes aceptan `from`, `trimBefore`, `durationInFrames`, `playbackRate` y `loop` directamente (`remotion-markup/timing-props.md`). Orden de operaciones: from → trimBefore → durationInFrames → playbackRate → loop. |
| Escenas | `Interactive.create({Component, layout:'absolute-fill'|'none', schema})` + "connected compositions" | Cada escena o elemento reusable se registra como su propia `<Composition>` y se abre con doble clic en Studio (`remotion-interactivity/timeline-structure.md`). |
| Transiciones | `<TransitionSeries>` con `.Sequence`, `.Transition` (`fade`, `slide`, `wipe`, `flip`, `clockWipe`; `linearTiming`/`springTiming`) y `.Overlay` | Las transiciones **acortan** la duración total (60 + 60 − 15 = 105); los overlays no (`remotion-markup/transitions.md`). |
| Metadata dinámica | `calculateMetadata({props, abortSignal})` | Devuelve `durationInFrames`, `width`, `height`, `fps`, `props`, `defaultOutName`, `defaultCodec`, `defaultPixelFormat`, `defaultProResProfile`, etc. Corre una sola vez y no en paralelo, así que ahí sí se permite `Math.random` (`docs/using-randomness.mdx`). |
| Parámetros | `schema={z.object(...)}` + `zColor()` de `@remotion/zod-types` | El nivel superior tiene que ser un `z.object()`. Studio genera un formulario en el sidebar (`remotion-markup/parameters.md`). |
| Carga asíncrona | `delayRender()` / `continueRender()` / `cancelRender()`, `useDelayRender()` | El timeout por defecto es de unos 30 s (`docs/timeout.mdx`). |
| Aleatoriedad | `random(seed)` | `Math.random()` rompe el render paralelo (`docs/using-randomness.mdx`). |
| Assets | `public/` + `staticFile()` | |
| Media | `<Video>`/`<Audio>` de `@remotion/media` (recomendado), `<CanvasImage>`, `<Img>`, `<AnimatedImage>` (GIF, APNG, WebP, AVIF) | `<OffthreadVideo>` queda como legado o fallback; tiene el problema de la descarga previa con timeout (`docs/timeout.mdx`). |
| Efectos | `effects={[...]}` con `@remotion/effects` (WebGL2) y `createEffect()` | Unos 70 efectos: color, blur, glow, `lightLeak`, distorsión, texturas y LUT `.cube` (`remotion-markup/effects.md`, `color-correction.md`). |

### 2.2 Remotion Studio [V]

- Preview interactivo (`npx remotion studio`; flags `--no-open`, `--port`, `--force-new`; `remotion-studio/SKILL.md`).
- **Interactividad con escritura al código**, disponible desde la 4.0.475 (2026-06-10) [V `docs/studio/interactivity.mdx` + npm time]:
  - mover, escalar y rotar en el canvas (escribe `style.translate`, `style.scale` y `style.rotate`);
  - mover y borrar keyframes, editar easing con un editor bezier;
  - arrastrar efectos, copiar y pegar, Ctrl+Z, duplicar secuencias.
- **Restricción dura:** solo es editable lo que está *inline* en el JSX. Los estilos que vienen de constantes, spreads o cuentas quedan en gris (`remotion-interactivity/SKILL.md`).
- Panel de props: escribe de vuelta solo cuando `defaultProps` es un objeto literal inline en la `<Composition>`.
- Herramientas WebMCP, para que un agente con navegador opere Studio (`remotion-best-practices/SKILL.md`: "The Studio supports WebMCP tools").
- Opción `--default-coding-agent`, disponible desde la 4.0.506, para integrar `claude-code`, `codex`, `cursor` o `copilot` en Studio (`docs/options/coding-agent.mdx`).
- Existen docs de Studio desplegable en servidor y en modo estático (`docs/studio/deploy-server.mdx`, `deploy-static.mdx`). Solo se leyeron los nombres de archivo; el detalle es [I].

### 2.3 Render [V]

| Vía | Estado y notas |
|---|---|
| CLI | `npx remotion render [comp] [out]`, `npx remotion still`, `--frames=0,30,90` para varios stills, `--sequence` para secuencia de imágenes (JPEG por defecto), `--props=./file.json`, `--codec` (`h264`, `h265`, `av1`, `vp8`, `vp9`, `prores`, `png`, `mp3`, `aac`, `wav`, `h264-mkv`), `--color-space` (`bt709`, `bt2020-ncl`, …), `--hardware-acceleration`, `--separate-audio-to`, `--gl=angle`. |
| Node SSR | `@remotion/bundler` `bundle()` + `@remotion/renderer` `selectComposition()` / `renderMedia()` (`docs/dataset-render.mdx`). La documentación advierte que no conviene renderizar más de un video a la vez por máquina. |
| **Lambda** | Render distribuido por chunks y "la opción más rápida y escalable". Límites: alrededor de 80 min de video Full HD (timeout de 15 min de AWS), unos 5 GB de salida (aprox. 2 h FHD), 1.000 lambdas concurrentes por región por defecto, sin AV1. Costos de ejemplo de la documentación (us-east-1, 2048 MB, v4.0.381): Hello World ≈ USD 0,001; 1 min de video ≈ USD 0,017–0,021; 10 min HD ≈ USD 0,10 (`docs/lambda.mdx`, `lambda/cost-example.mdx`). Hay que **redesplegar la función al actualizar Remotion** y el sitio al cambiar el código (`remotion-saas/rendering.md`). |
| **Cloud Run** | `@remotion/cloudrun` existe en 4.0.536, pero la documentación dice: **"Alpha status and not actively being developed"** (`docs/cloudrun.mdx`). No conviene para producción enterprise; si GCP es obligatorio, mejor usar Node SSR propio en un contenedor. |
| Vercel Sandbox, Cloudflare Containers, Azure Container Apps, GitHub Actions | Documentados. La comparativa oficial recomienda Lambda "for most people" y señala que el servidor propio es el cómputo más barato a gran volumen (`docs/compare.mdx`). |
| Client-side | `renderMediaOnWeb()` / `renderStillOnWeb()`. **Tiene telemetría obligatoria** (`license/faq.mdx`). |
| Player | `@remotion/player` para previews en una app React. Para empresas, **embeberlo cuenta como "automation"** (ver §3). |

### 2.4 Captions, audio, fuentes, Tailwind, 3D, Lottie [V]

- **Captions:**
  - Tipo `Caption {text, startMs, endMs, timestampMs, confidence, pageBreakAfter?}`.
  - `@remotion/captions` exporta `parseSrt`, `serializeSrt`, `createTikTokStyleCaptions` y `ensureMaxCharactersPerLine` [V d.ts].
  - **Transcripción:** la skill actual usa **`@remotion/whisper-webgpu`** (Whisper local en GPU, en Node y en el navegador).
    - Modelo por defecto: `small.en`.
    - Para español hay que usar un modelo multilingüe (`small`) y pasar `language`: **no hay autodetección de idioma**.
    - Necesita una GPU compatible. **ONNX Runtime no funciona en Linux arm64** (`remotion-captions/transcribe-captions.md`).
    - También siguen publicados `@remotion/install-whisper-cpp` y `@remotion/openai-whisper` (4.0.536) [V npm].
  - **Visualización:** el elemento "Basic Captions" se copia sin modificar desde remotion.dev/elements. Las captions van como array inline, por clip, con timestamps relativos al archivo fuente (`display-captions.md`).
- **Audio:**
  - `<Audio>` de `@remotion/media` admite `trimBefore`, `durationInFrames`, `from`, `volume` (con keyframes vía `interpolate`, editables como curva en Studio), `muted`, `playbackRate` (sin reversa), `loop` y `toneFrequency`. Este último **solo funciona en render, no en preview** (`audio.md`).
  - Voiceover con ElevenLabs + `calculateMetadata` (`voiceover.md`).
  - Visualización de audio con `useWindowedAudioData` + `visualizeAudio`.
  - Detección de silencios con `loudnorm` + `silencedetect` (`silence-detection.md`).
  - FFmpeg incluido vía `npx remotion ffmpeg`/`ffprobe` (`ffmpeg.md`).
- **Fuentes:**
  - Google Fonts con `@remotion/google-fonts/<Family>` y `loadFont("normal",{weights,subsets})`: "automatically blocks rendering until the font is ready".
  - Fuentes locales con `@remotion/fonts` `loadFont({family,url:staticFile(...),weight})`.
  - Medir texto (`@remotion/layout-utils` `measureText`, `fitText`, `fillTextBox`) **solo después** de `waitUntilDone()` (`google-fonts.md`, `local-fonts.md`, `measuring-text.md`).
- **Tailwind:** `npx create-video@latest --tailwind`; `@remotion/tailwind-v4` en 4.0.536. Las clases **`transition-*` y `animate-*` no se renderizan** (`remotion-create/tailwind.md`).
- **3D:**
  - `@remotion/three` con `<ThreeCanvas width height>`.
  - **Prohibido `useFrame()` de R3F**; todo se anima desde `useCurrentFrame()`.
  - `<Sequence layout="none">` dentro del canvas (`remotion-markup/3d.md`).
  - Para WebGL en render hace falta `--gl=angle` en 4.x. En 5.0 pasa a ser el default (`docs/5-0-migration.mdx`).
- **Lottie y Rive:**
  - `@remotion/lottie` con `delayRender` mientras carga el JSON (`lottie.md`).
  - `@remotion/rive` (`<RemotionRiveCanvas>` acepta `effects`).
- **Extras:**
  - Mapas: skill `remotion-maps` con técnicas static, Mapbox, MapLibre, MapTiler y Cesium.
  - `@remotion/rough-notation` para subrayados y resaltados.
  - Motion blur con `<HtmlInCanvasMotionBlur>`, disponible desde la 4.0.529.
  - Ojo: `<HtmlInCanvas>` **exige Chrome 149+ con flag** para la preview (`html-in-canvas.md`).

### 2.5 Integración con Claude Code [V]

- **Skills:** `npx skills add remotion-dev/skills` o `npx remotion skills add`. También se ofrecen al hacer `bun create video` (`docs/ai/skills.mdx`, `docs/ai/coding-agents.mdx`).
- **Plugin oficial:**
  ```bash
  claude plugin marketplace add remotion-dev/claude-code-plugin
  claude plugin install remotion@remotion
  ```
  Se usa como `/remotion:remotion-create <prompt>` (`docs/ai/claude-code-plugin.mdx`).
- **Docs para agentes:** agregando `.md` a cualquier URL de la documentación se obtiene Markdown; además está la búsqueda Algolia pública (`remotion-docs/SKILL.md`).

---

## 3. Licencia de Remotion (crítico para enterprise)

### 3.1 Texto vigente (v4) [V — `LICENSE.md` dentro de `remotion@4.0.536` en npm]

> "You are eligible to use Remotion for free if you are: an individual; a for-profit organization with up to 3 employees; a non-profit or not-for-profit organization; evaluating whether Remotion is a good fit, and are not yet using it in a commercial way."
>
> "You are required to obtain a Company License to use Remotion if you are not within the group of entities eligible for a Free License."
>
> "It is not allowed to copy or modify Remotion code for the purpose of selling, renting, licensing, relicensing, or sublicensing your own derivate of Remotion."
>
> "In Remotion 5.0, the license will slightly change."

### 3.2 Términos v5.0 y FAQ [V — `packages/docs/docs/terms.mdx` y `license/faq.mdx`, commit 2026-10-18]

- **Vigencia.** Los términos v5.0 "will take effect upon the release of Remotion 5.0". Los términos actuales (v4) están en `remotion.pro/terms-4-0` (`terms.mdx` l.12). La FAQ ya está redactada con el criterio nuevo.
- **Headcount.** "A Company License is required when the combined total headcount of all involved parties … is 4 or more … Headcount means all personnel, regardless of whether they use the Remotion Software." (`terms.mdx` §TeamSize).
  - Incluye part-time y contratistas.
  - **Una empresa de 20 personas en la que solo una usa Remotion necesita Company License.** En la modalidad Creators alcanza con 1 seat de USD 25 (FAQ).
- **Precios** (`terms.mdx` l.223–236; FAQ):

  | Opción | Precio | Para qué |
  |---|---|---|
  | **Remotion for Creators** | USD 25 por seat al mes, sin mínimo | "organizations creating low-volume videos for themselves using Remotion, without setting up an automation" |
  | **Remotion for Automators** | USD 0,01 por render, **facturado en bloques de 1.000 renders (USD 10)**, mínimo USD 100 al mes | Editores de video, prompt-to-video, pipelines automatizados, **embeber el `<Player>`** |
  | Ambas activas | Mínimo combinado de USD 100 al mes; los seats cuentan para el mínimo | |
  | **Enterprise** | Mismo pricing con **mínimo de USD 500 al mes** (puede cotizarse más alto) | Términos a medida, contrato firmado, formularios de vendor y compliance, canal privado (Slack/Teams), consultoría mensual con un ingeniero, más peso en el roadmap, "Editor Starter" gratis |

- **Qué es un seat.** "a single person either writes Remotion code themselves or leverages agentic coding tools such as Claude Code, Codex, OpenCode, or similar" (`terms.mdx` §Seat). **Usar Claude Code no cambia la categoría.** Una persona que produce videos con un agente necesita un seat Creators.
- **Qué es una "automation".** "Owning code that calls one of the following APIs or commands programmatically: `renderMedia()`, `renderStill()`, `renderFrames()`, `renderMediaOnLambda()`, … `npx remotion render`, `npx remotion still`, `npx remotion lambda render`, … or using the `<Player>` component."
  - Un script batch que llama a `npx remotion render` **sí** es automation.
  - Un CI que renderiza en cada merge **sí** es automation.
  - Una herramienta interna con `<Player>` **sí** es automation.
  - Que una persona haga clic en "Render" en Studio no es automation [V por definición; la frontera exacta se discute en §3.4].
- **Qué es un render.** "One render means outputting a video, an audio file, a still image, or an image sequence … Only successful renders count." Las previews en Studio o en el Player no cuentan. Los renders de desarrollo se marcan con `isProduction: false` y no se facturan (`docs/options/is-production.mdx`, desde la 4.0.409).
- **Usos comerciales permitidos y prohibidos.**
  - Se puede vender video. Se puede ofrecer un servicio donde los usuarios cambien parámetros de una plantilla. Se puede generar código Remotion con IA para clientes, y esos clientes no necesitan licencia.
  - **Está prohibido** un servicio que permita a terceros **subir sus propios proyectos Remotion** para renderizarlos, y revender Remotion como producto (`terms.mdx` l.331–341; FAQ).
- **Agencias.** Si solo se entrega el MP4, cuenta solamente el headcount de la agencia. Si el cliente es dueño o co-opera el código, **los headcounts se suman** y la licencia la compra el dueño de la IP (FAQ y `terms.mdx` §Partnerships).
- **Telemetría.**
  - Client-side: siempre activa y no se puede desactivar.
  - Server-side: voluntaria en v4. **En 5.0 es obligatoria para Automators**, mediante una license key en la configuración (`--license-key`, `licenseKey` en `renderMedia`/`renderMediaOnLambda`, desde la 4.0.409).
  - Si la política corporativa la bloquea, hay que mandar un "monthly verifiable report".
  - Solo envía metadata de licencia: prod/dev y video/still. "No information about the content … is collected" (`terms.mdx` §Telemetry).
- **Otros puntos.**
  - **No incluye patentes de códecs** (H.264, HEVC, AAC) (FAQ §Legal).
  - No hay reembolsos.
  - Los precios pueden ajustarse al inicio del siguiente ciclo de facturación, con aviso (`terms.mdx` l.440, 476).
  - Remotion no es un servicio hosteado: la infraestructura la pone el cliente.

### 3.3 Escenarios para un equipo de contenido tech de una empresa mediana o grande [cálculo propio sobre los precios verificados]

| Escenario | Licencia | Costo mensual |
|---|---|---|
| 3 personas producen videos con Claude Code y renderizan a mano desde Studio o CLI | Creators × 3 | USD 75 |
| Lo anterior + pipeline batch CSV → 2.000 videos/mes (`renderMedia` o Lambda) | Creators × 3 + Automators (2 bloques de 1.000) | 75 + 20 = 95, **sube al mínimo combinado de USD 100** |
| Pipeline de 50.000 renders/mes + 5 seats | Automators + Creators | 500 + 125 = USD 625 |
| Procurement exige vendor onboarding, DPA firmado o PO | **Enterprise** | ≥ USD 500/mes |
| Herramienta interna con `<Player>` para que marketing previsualice | Automators | ≥ USD 100/mes (Player sin renders: se paga el mínimo) |

Además hay que sumar AWS (Lambda, S3, egress) o el cómputo propio [V `lambda.mdx`: "You might also need a Remotion license"].

### 3.4 Zonas grises y recomendaciones [I]

- **Agente que corre `npx remotion render` a pedido de una persona.** La definición de seat menciona explícitamente a Claude Code, así que lo razonable es tratarlo como Creators. En cambio, un agente o un scheduled task que renderiza sin intervención humana se parece a una automation. **Hay que pedir confirmación escrita a hi@remotion.dev**; con Enterprise se puede obtener firmada.
- **Fuentes secundarias desactualizadas [S].** Algunos agregadores (toolradar, reviews) todavía citan "USD 100/mes o USD 1.000/año" o "desde USD 15/mes". Son datos viejos: hay que ignorarlos. El precio vigente sale de `terms.mdx` y la FAQ, coherentes con el resultado de búsqueda que cita la página oficial ([remotion.dev/docs/license/pricing](https://www.remotion.dev/docs/license/pricing)).
- **Riesgo de cambio.** Los términos v5 permiten ajustar precios por ciclo. Conviene presupuestar con margen y fijar la versión de Remotion (sin `^`).

---

## 4. Las skills oficiales (`/home/user/remotion-dev/skills`, v4.0.536, commit `1441a11`, 2026-10-16)

### 4.1 Mapa

La skill `remotion-best-practices` actúa como **router** y embebe copias de las demás como `REFERENCE.md`. Las copias embebidas son idénticas salvo los links; se verificó con `diff` [V].

| Skill | Qué hace | Puntos fuertes / débiles |
|---|---|---|
| `remotion-best-practices` | Router. Preservar los cambios del usuario; abrir Studio antes de construir; **no renderizar salvo pedido explícito** | Buen comportamiento por defecto para trabajar con un humano en el loop. |
| `remotion-create` | Scaffold (`npx create-video@latest --yes --blank --no-tailwind`), abrir Studio, reglas de layout para video | Reglas de safe area y tamaños mínimos (ver 4.2). |
| `remotion-markup` | El corpus principal: animación, timing, media, efectos, fuentes, 3D, Lottie, captions, parámetros, `calculateMetadata`, transiciones, voiceover, SFX, FFmpeg | Es la skill con más valor para la calidad. |
| `remotion-interactivity` | Cómo escribir JSX para que Studio pueda editarlo (inline, `Interactive.create`, `Track`, schemas) | Impone un estilo de código que choca con las prácticas de "design tokens" (ver 4.3). |
| `remotion-studio` | Lanzar y enfocar Studio, flags | Corta. |
| `remotion-render` | `render`, `still`, `--frames`, transparencias | Corta. Remite a la documentación de la CLI. |
| `remotion-captions` | Tipo `Caption`, whisper-webgpu, Basic Captions, SRT | Sólida en la estructura por clip. |
| `remotion-saas` | Templates (Next.js, React Router, Vercel, Express render server), Player, Lambda paso a paso, Vercel, Cloudflare, Azure | Incluye un recordatorio de producción: rate limit, auth, control de costos, privacidad del output, limpieza. |
| `remotion-maps` | Static, Mapbox, MapLibre, MapTiler y Cesium, con referencias de estabilidad de render | Muy específica y de alta calidad (fixed map plate, `viewer.render()`). |
| `remotion-multimedia` | Mediabunny: duración y dimensiones | Utilitaria. |
| `remotion-docs` | Buscar en la documentación vía Algolia y bajarla como `.md` | Requiere red; en este entorno WebFetch no funciona. |
| `remotion-upgrade` | `npx remotion upgrade` o upgrade manual alineando `zod`, `mediabunny` y `@huggingface/transformers` | Importante: todos los `@remotion/*` deben estar en **la misma versión**. |

### 4.2 Reglas de calidad valiosas (literales, con ruta)

1. **Sin animaciones CSS.** `skills/remotion-markup/SKILL.md`:
   > "Drive animations using `useCurrentFrame()` and `interpolate()`. CSS `transition` or `animation` will not render correctly, they need to refactored. Tailwind animation class will not render correctly, they need to be refactored."
2. **El `fps` sale de `useVideoConfig()`.** `skills/remotion-markup/SKILL.md`:
   > "get `fps` from `useVideoConfig()` for all seconds-to-frames calculations, including timing props such as `from`, `trimBefore` and `durationInFrames`. Keeping the expression on the JSX node, such as `trimBefore={4 * fps}`, lets Studio edit the timing and keeps it correct if the composition frame rate changes."
3. **Escala perceptual.** `skills/remotion-markup/timing.md`:
   > "When animating scale, if the output is linear, the perceived scale would be smaller the larger the scale gets. Use this option to compensate: … `output: 'perceptual-scale'`"
4. **Layout pensado para video.** `skills/remotion-create/video-layout.md`:
   > "You are designing a video, not a webpage. Decide what the viewer should notice first in each scene. Build the frame around that one thing. Keep important content inside a generous safe area. For 1080px-wide videos, keep key text at least 80px from the sides and 100px from the top and bottom. Do not add redundant elements. … Main headline: 84px; Important supporting text: 44px. Scale those values with the composition width."
5. **No pisar los cambios del usuario.** `skills/remotion-best-practices/SKILL.md`:
   > "If you detect a surprising change made in the meanwhile, don't overwrite it, assume it was intentional or ask for confirmation."
6. **Renderizar solo si se pide.** `skills/remotion-best-practices/SKILL.md`:
   > "Only render if the user is very explicit in asking for it. E.g. 'Render the video', 'Export', 'Give me the MP4'."
7. **3D.** `skills/remotion-markup/3d.md`:
   > "Shaders, models etc MUST NOT animate by themselves. No animations are allowed unless they are driven by `useCurrentFrame()`. … Using `useFrame()` from `@react-three/fiber` is forbidden."
8. **Un nodo JSX por ítem editable.** `skills/remotion-interactivity/SKILL.md`:
   > "A `.map()` or another programmatic loop would create multiple runtime items from one JSX source node. That is appropriate for repeated output that is intentionally controlled as one template, such as visualization bars or particles. It is not appropriate when the instances need independent IDs or names, props, metadata, timing, ordering, deletion or duplication in the Studio."
9. **`defaultProps` inline.** `skills/remotion-markup/compositions.md`:
   > "For Studio editing, keep `defaultProps` as an inline object literal on `<Composition>` or `<Still>`. … Do not store it in a variable, import it, spread it, create it with a helper, or wrap it in `satisfies`. Use `type` declarations for props rather than `interface`…"
10. **Captions sincronizadas por clip.** `skills/remotion-captions/display-captions.md`:
    > "Putting captions inside a scene is insufficient if `trimBefore` or `playbackRate` is still applied only to `<Video>`: its sibling captions do not inherit those props. Apply them to the shared parent instead." y "The captions are whitespace sensitive. You should include spaces in the `text` field before each word."
11. **Trims con FFmpeg.** `skills/remotion-markup/ffmpeg.md`:
    > "You MUST re-encode the video to avoid frozen frames at the start of the video."
12. **Mapas.** `skills/remotion-maps/techniques/maplibre/references/render-stability.md`:
    > "If basemap detail shimmers or jitters during a pan/zoom, the likely cause is per-frame `map.jumpTo()`. … Render a short MP4, not only a Studio preview."
13. **Lambda.** `skills/remotion-saas/rendering.md`:
    > "Store credentials in `.env` … never ask the user to paste secrets into chat. … functions are bound to the Remotion version and must be redeployed after Remotion upgrades."

### 4.3 Problemas detectados en las skills (lectura crítica) [V salvo indicación]

- **Bug en un ejemplo.** En `skills/remotion-markup/parameters.md` el componente se declara `const MyComponent: React.FC<…> = () => { … props.title … }`: no recibe `props`. Además, el Root importa `MycComponent` (typo). Un agente que copie el ejemplo genera código que no compila.
- **Inconsistencia de códec.** En `skills/remotion-render/transparent-videos.md`, la CLI usa `--codec=vp9` pero el ejemplo con `calculateMetadata` usa `defaultCodec: "vp8"`. La documentación oficial usa vp8 en todos lados (`docs/transparent-videos.mdx`). Las dos opciones funcionan; el problema es la incoherencia.
- **Omisión importante: `Math.random`.** Las skills actuales **no mencionan `Math.random()` ni `random()`** (se verificó con grep). La regla vive solo en la documentación (`docs/using-randomness.mdx`). Hay que agregarla al `CLAUDE.md` del equipo.
- **SFX con riesgo legal [I].** `skills/remotion-markup/sfx.md` recomienda sonidos meme (`vine-boom.wav`, `spongebob-fail.wav`, `windows-xp-error.wav`, `price-is-right-fail.wav`…) hosteados en remotion.media. Para una marca es un riesgo de licencias y de tono. **Conviene prohibirlos y usar una librería licenciada propia.**
- **Proveedor de TTS por defecto.** `voiceover.md` impone ElevenLabs y pide la API key ("recommend ElevenLabs and ask for their API key"). En enterprise hay que redirigir al proveedor aprobado por compras y seguridad.
- **Tensión con los design tokens.** La interactividad exige estilos inline sin constantes (`❌ Referring to constants is not supported`). Un theme de marca en constantes TS queda **no editable en Studio**. Eso puede ser una ventaja (bloquea la marca), pero conviene decidirlo a propósito (ver §5).
- **Funciones experimentales.**
  - `HtmlInCanvas` y el motion blur que se apoya en él requieren Chrome 149+ con flag para la preview.
  - La interactividad de Studio existe desde junio de 2026, así que hay riesgo de cambios en la API (por ejemplo, `text-content` ya figura como alias deprecado).
  - Recomendación: congelar la versión por proyecto.
- **Skill de migración desfasada.** `remotion-to-hyperframes` de HyperFrames mapea APIs viejas de Remotion (`OffthreadVideo`, `startFrom`/`endAt`, `Series`) y no contempla `Interactive.create`, `Track` ni `@remotion/effects`. Su corpus se validó el 2026-04-27. Un proyecto escrito con el estilo actual de Remotion probablemente migraría con más pérdidas [V lectura de `skills/remotion-to-hyperframes/references/api-map.md`; consecuencia: I].

---

## 5. Plantillas parametrizables con marca

### 5.1 Arquitectura recomendada [diseño propio; APIs V]

```
brand/                       # paquete interno versionado (monorepo)
  tokens.ts                  # color, tipografía, spacing, safe areas, motion
  fonts.ts                   # @remotion/fonts con woff2 corporativas (no Google CDN en render)
  components/                # LowerThird, TitleCard, CodeBlock, StatCallout, BulletList, LogoSting
src/
  schemas/explainer.ts       # zod: contrato de contenido (lo que edita un no-programador)
  compositions/Explainer.tsx # escenas con Interactive.create + Track/TransitionSeries
  Root.tsx                   # <Folder name="Explainer"> 16:9 / 9:16 / 1:1
scripts/render-batch.ts      # CSV/JSON → renderMedia (o renderMediaOnLambda)
public/brand/                # logos, LUT .cube, música licenciada
```

**Los tokens son TypeScript, pero se exponen como enums, no como valores libres.** Así se evita que alguien elija un color fuera de la marca con `zColor()`.

```ts
// brand/tokens.ts
export const tokens = {
  color: { bg: '#0B1020', surface: '#121A33', primary: '#4F8CFF', accent: '#22D3A6', warn: '#FFB020', text: '#F5F7FF', muted: '#9AA4BF' },
  font: { display: 'BrandSans', mono: 'BrandMono' },
  // tamaños base para 1080 px de ancho (escalar con width/1080), alineados a video-layout.md
  type: { h1: 84, h2: 60, body: 44, caption: 36 },
  safe: { x: 80, y: 100 },
  motion: { enterS: 0.6, exitS: 0.4, staggerS: 0.08, bezier: [0.16, 1, 0.3, 1] as const },
} as const;
export type AccentName = 'primary' | 'accent' | 'warn';
```

```ts
// src/schemas/explainer.ts
import { z } from 'zod';
export const explainerSchema = z.object({
  title: z.string().min(3).max(60),
  accent: z.enum(['primary', 'accent', 'warn']),          // guardrail de marca
  format: z.enum(['16:9', '9:16', '1:1']),
  scenes: z.array(z.object({
    kind: z.enum(['title', 'bullets', 'code', 'stat']),
    headline: z.string().max(60),
    bullets: z.array(z.string().max(70)).max(4).optional(),
    code: z.string().max(1200).optional(),
    durationS: z.number().min(2).max(15),
  })).min(1).max(12),
  voiceoverSrc: z.string().optional(),
});
export type ExplainerProps = z.infer<typeof explainerSchema>;
```

```tsx
// src/Root.tsx (defaultProps inline para que Studio pueda guardarlas)
<Composition
  id="Explainer-16x9"
  component={Explainer}
  schema={explainerSchema}
  fps={30} width={1920} height={1080} durationInFrames={300}
  calculateMetadata={calcExplainer}
  defaultProps={{ title: 'Novedades de la API v3', accent: 'primary', format: '16:9',
    scenes: [{ kind: 'title', headline: 'API v3', durationS: 4 }] }}
/>
```

```ts
// calculateMetadata: la duración sale de los datos (o de la duración del voiceover)
const FPS = 30; // debe coincidir con la <Composition>; calculateMetadata no puede usar useVideoConfig (voiceover.md)
export const calcExplainer: CalculateMetadataFunction<ExplainerProps> = async ({ props }) => ({
  durationInFrames: Math.ceil(props.scenes.reduce((s, x) => s + x.durationS, 0) * FPS),
  ...(props.format === '9:16' ? { width: 1080, height: 1920 } : props.format === '1:1' ? { width: 1080, height: 1080 } : {}),
  defaultOutName: `explainer-${props.format.replace(':', 'x')}`,
});
```

### 5.2 Edición por no-programadores [V APIs; organización I]

- **Contenido** (textos, listas, enums, duraciones): con el **schema zod** a nivel composición, Studio genera el formulario y guarda en `defaultProps` inline.
- **Ajustes visuales por instancia** (posición, keyframes, color de acento): con **`InteractivitySchema`** en los componentes creados con `Interactive.create()`. Tipos disponibles: `string`, `number`, `color`, `enum`, `asset`, `font-family`, `remotion-captions`… (`remotion-interactivity/SKILL.md`).
- **Riesgo:** son dos sistemas de parámetros paralelos. Regla práctica:
  - zod para lo que llega desde datos o un CMS;
  - Interactive schema para lo que un editor retoca a mano en Studio;
  - los tokens de marca, **no editables**.
- **Flujo de equipo:** Studio local o desplegado (`docs/studio/deploy-server.mdx`). Cada cambio visual es un diff en git: se revisa en PR y la plantilla se publica con tag. Es una ventaja real frente a .aep o Canva para auditoría y rollback.

### 5.3 Videos data-driven (batch desde CSV/JSON) [V API]

```ts
// scripts/render-batch.ts — ejecutar con Node; esto ES una "automation" (licencia Automators si >3 personas)
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'node:fs';
import { explainerSchema } from '../src/schemas/explainer';

const serveUrl = await bundle({ entryPoint: './src/index.ts' });
const rows = parse(readFileSync('data/releases.csv'), { columns: true });
for (const row of rows) {
  const inputProps = explainerSchema.parse(rowToProps(row));   // validar ANTES de gastar render
  const composition = await selectComposition({ serveUrl, id: 'Explainer-16x9', inputProps });
  await renderMedia({ composition, serveUrl, codec: 'h264', inputProps,
    outputLocation: `out/${row.slug}.mp4`,
    licenseKey: process.env.REMOTION_LICENSE_KEY,               // telemetría (obligatoria en 5.0 para Automators)
    isProduction: process.env.CI === 'true' });                 // renders de dev no facturables
}
```

- Desde la CLI: `npx remotion render Explainer-16x9 out/a.mp4 --props=./data/a.json` (`docs/options/props.mdx`).
- A gran escala: `renderMediaOnLambda()` con una cola (SQS) y webhooks. La documentación advierte que no conviene renderizar más de un video a la vez por máquina (`dataset-render.mdx`).

### 5.4 Integración con CMS [I salvo API]

- **Opción A (recomendada).** Un webhook del CMS (Contentful, Sanity, Strapi o el headless que haya) dispara un job que hace snapshot del contenido a JSON, lo valida con zod, renderiza en Lambda, sube el resultado a S3 o al DAM y escribe la URL de vuelta en el CMS. Es reproducible: el JSON queda archivado junto al MP4.
- **Opción B.** `calculateMetadata` hace `fetch(props.cmsUrl, {signal: abortSignal})` (patrón documentado en `calculate-metadata.md`). Es cómodo en Studio, pero el resultado depende del estado del CMS en el momento del render. Para auditoría, la A es mejor.
- **Preview en la herramienta del CMS:** `@remotion/player` con el mismo componente. Recordar que eso es Automators (§3).

---

## 6. Comparativa crítica (2026)

### 6.1 Datos duros verificados [V]

| Herramienta | Versión / última release | Licencia | Señal |
|---|---|---|---|
| Remotion | 4.0.536 (2026-10-16); 1.0 en 2021-02; 4.0 en 2023-07 | Remotion License (source-available) | Muy activo, unas 3 releases por semana |
| HyperFrames | 0.8.174 (2026-10-19); primera publicación 2026-03-23; 528 versiones | Apache-2.0 (GSAP: "Standard no charge license", no OSI, según `CREDITS.md`) | Muy activo pero joven, mucha rotación. Adopters: HeyGen, tldraw, TanStack (evaluando), reap y otros (`ADOPTERS.md`) |
| Motion Canvas | `@motion-canvas/core` 3.17.2 (**2025-02-16**) | MIT | **Sin releases en unos 20 meses**: señal de estancamiento |
| Revideo | `@revideo/core` 0.11.0 (2026-07-10) | MIT | Fork de Motion Canvas con render headless; equipo chico |
| Rendervid | `@rendervid/core` 0.1.0 (2026-02-02) | — | Inmaduro (0.1.0); no apto para enterprise |
| lottie-web / dotLottie | 5.13.0 (2025-05) / 0.81.0 (2026-10) | MIT | El runtime de Lottie migra hacia dotLottie |
| Rive runtime | `@rive-app/canvas` 2.45.0 (2026-10-17) | MIT (runtime) | Activo; editor SaaS aparte |

### 6.2 Tabla comparativa

Escala: ●●● alto o bueno, ●● medio, ● bajo o malo. "Determinismo" significa que el mismo input produce el mismo output, píxel por píxel.

| Herramienta | Determinismo | Curva de aprendizaje | Calidad de motion | Colaboración con diseñadores | Licencia / costo | Ajuste para agentes IA | Render en la nube | Edición posterior (NLE) |
|---|---|---|---|---|---|---|---|---|
| **Remotion** | ●●● si se respeta el contrato (función pura del frame; el render paralelo expone los errores) [V] | ●● (React/TS + modelo de frames; los no-devs solo editan props en Studio) | ●●● techo alto, pero "a mano"; ~70 efectos WebGL; springs y bezier; sin graph editor tipo AE salvo el editor de easing de Studio [V] | ●● Studio escribe al código (desde 06/2026); Lottie y Rive como puente [V]; sin import oficial de Figma [I] | Gratis ≤3 personas; empresa USD 25/seat/mes o USD 0,01/render (mín. USD 100); Enterprise mín. USD 500 [V] | ●●● skills y plugin oficiales en lockstep con la versión, docs en .md, WebMCP [V]; React es terreno conocido para los LLM [I] | ●●● Lambda distribuido maduro; Vercel, Node, Cloudflare; Cloud Run **en alpha y abandonado** [V] | ●●● ProRes 422/4444, WebM alpha, PNG seq, audio separado, color space [V] |
| **HyperFrames** | ●●● por diseño (seek de timelines pausados; Docker para fijar Chrome, fuentes y FFmpeg). Su propia doc admite que "breaks quietly" si no se sigue el contrato [V] | ●●● para quien sabe HTML/CSS/GSAP; contrato `data-*` + `window.__timelines` [V] | ●●● GSAP + catálogo de ~400 bloques y componentes, shader transitions, mezcla de audio con efectos y automatización [V] | ●●● skill de Figma, `frame.md` (design system para cámara), Studio que edita el DOM [V] | Apache 2.0 sin umbrales [V]; ojo con GSAP (no OSI) [V] y su cláusula anti-competencia con Webflow [I]; HeyGen Cloud pago (4K a 1,5×) [V]; telemetría activada por defecto, opt-out [V] | ●●● agent-first: 21 skills, `lint`/`check`, workflows `pr-to-video`, `product-launch-video` y `embedded-captions` [V] | ●●● local, Docker, HeyGen Cloud, AWS Lambda (más nuevo), **GCP Cloud Run** [V] | ●●● MOV ProRes 4444, WebM alpha, PNG seq, **HDR 10-bit H.265** [V] |
| Motion Canvas | ●●● (generators por frame) [I] | ●● (TS + generators) [I] | ●●● para explainers y animación de código [I] | ● editor propio de timing, sin flujo para diseñadores [I] | MIT, gratis [V] | ● poco corpus, sin skills oficiales [I] | ● sin render headless oficial (Revideo nace por eso) [I] | ●● secuencias de imágenes o video vía ffmpeg [I] |
| Revideo | ●●● [I] | ●● [I] | ●●● (hereda de MC) [I] | ● [I] | MIT [V] | ●● API de render; corpus chico [I] | ●● headless; deploy propio [I] | ●● [I] |
| Rendervid | ? | ? | ? | ? | ? | ? | ? | ? — 0.1.0, descartado por madurez [V versión] |
| Jitter | ●●● (keyframes) [I] | ●●● muy baja (web, tipo Figma) [I] | ●●● para motion de UI y producto [I] | ●●● colaborativo y multiusuario [I] | SaaS por seat (precio 2026 no verificado) [I] | ● sin API madura para agentes [I] | SaaS [I] | ●● exporta MP4, MOV y Lottie (alpha a verificar) [I] |
| Rive | ●●● [I] | ●● (state machines) [I] | ●●● para UI interactiva y personajes [I] | ●●● [I] | Runtime MIT [V]; editor SaaS pago [I] | ● formato binario `.riv` [I]; consumible desde `@remotion/rive` [V] | — | ●● export de video desde el editor [I] |
| After Effects + Bodymovin (Lottie) | ●●● | ● (AE es profundo) | ●●● estándar de la industria | ●●● es la herramienta nativa del diseñador | Adobe CC por seat [I]; lottie-web MIT [V] | ●● los agentes pueden parametrizar el JSON de Lottie (texto, colores), pero no diseñar [I] | ● sin render farm nativa para AE (hay terceros, p. ej. Nexrender o Plainly) [I] | ●●● nativo (MOGRT para Premiere) [I] |
| Cavalry | ●●● [I] | ●● [I] | ●●● procedural y data-driven (CSV) [I] | ●●● para motion designers [I] | Suscripción con tier free [I] | ●● scripting JS [I] | ● [I] | ●●● ProRes [I] |
| Canva | ●●● (plantillas) [I] | ●●● mínima [I] | ● motion limitado [I] | ●●● brand kit y comentarios [I] | SaaS Teams/Enterprise [I] | ●● vía MCP/Connect API (en este mismo entorno hay herramientas `mcp__Canva__*`, como `create-design-from-brand-template` y `export-design`) [V existencia; I capacidad] | SaaS | ●● MP4 (alpha limitada) [I] |
| After Effects con IA (Firefly, etc.) | ●●● render; la IA no es determinista [I] | ● [I] | ●●● [I] | ●●● [I] | Adobe CC + créditos IA [I] | ● [I] | ● [I] | ●●● [I] |
| IA generativa (Veo, Kling, Runway, Sora) | ● **no determinista**; cada generación es distinta [I] | ●●● prompt [I] | ●● fotorrealismo creíble, pero texto, UI, logos y código poco fiables [I] | ● [I] | Créditos por segundo; términos de IP e indemnización variables según proveedor [I] | ●●● APIs (hay un MCP de Higgsfield en este entorno) [V existencia] | SaaS | ● solo MP4; "editar" implica regenerar [I] |

### 6.3 Remotion vs HyperFrames: comparación cabeza a cabeza

- **Modelo de autoría.** En Remotion, el componente lee `frame` y devuelve el estado. En HyperFrames, el renderer pausa la animación y la busca (*seek*) en el tiempo `t = frame/fps`.
  - La ventaja real de HyperFrames: **GSAP, WAAPI, CSS keyframes y Lottie** se vuelven deterministas sin reescribirlos [V `docs/concepts/determinism.mdx`, `hyperframes-vs-remotion.mdx`].
  - En Remotion, una animación CSS o GSAP existente **hay que reescribirla** con `interpolate`.
- **Admisiones de HyperFrames** en su propia guía (`docs/guides/hyperframes-vs-remotion.mdx`) [V]:
  > "Remotion is older and much more established… Remotion Lambda in particular is a mature, heavily documented rendering system; ours is newer."
  >
  > "its model is genuinely simpler to hold in your head… HyperFrames asks you to follow rules — paused timeline, no wall clocks, no unseeded randomness — and breaks quietly if you don't."
- **Migración.** Solo existe en una dirección (Remotion → HyperFrames).
  - Cerca del 80 % es mecánico.
  - Rechaza `useState`/`useEffect` con dependencias, `calculateMetadata` asíncrono y librerías de UI React.
  - Aproxima `spring` con `back.out(N)` (con pérdida).
  - SSIM validado: 0,95–0,985 sobre 4 fixtures (`skills/remotion-to-hyperframes/SKILL.md`, `references/timing.md`) [V].
  - **No hay camino de vuelta.** Elegir HyperFrames es un compromiso de una sola vía.
- **Gobernanza.** Remotion es de Remotion AG, que vive de las licencias (un incentivo alineado con mantener el producto). HyperFrames lo mantiene HeyGen: es Apache 2.0, pero el roadmap y la nube los decide una empresa cuyo negocio es el video IA. Si HeyGen cambia de prioridades, queda un fork posible, pero sin el equipo. **[I]**
- **Licencia efectiva.** "Sin revisión de licencia" es casi cierto: GSAP, el adapter primario, tiene su propia licencia "no charge" no OSI [V `CREDITS.md`]. Para uso interno de contenido no debería ser un problema [I], pero legal tiene que leerla.

### 6.4 Recomendación para un equipo de contenido tech

**Motor primario: Remotion.**

1. El equipo es tech: TypeScript y React son su idioma, y los componentes del design system web se pueden reusar.
2. Tiene **contratos tipados** (zod), validación antes del render y git como fuente de verdad, lo que da auditoría y rollback.
3. Lambda es la vía de render distribuido más probada del ecosistema.
4. Las skills y el plugin para Claude Code son del vendor y van en lockstep con la versión.
5. La edición visual en Studio escribe al código: reduce la fricción con quienes no programan.
6. El costo de licencia, de USD 100–600 al mes para la mayoría de los escenarios, es irrelevante frente a la nómina. Lo que sí importa es el **cumplimiento**: telemetría, conteo de renders y headcount.

**Motor secundario: HyperFrames,** acotado a:

- (a) convertir material HTML, CSS o GSAP existente (landings, demos web, prototipos de diseño, exports de Figma) sin reescribirlo;
- (b) los workflows listos `pr-to-video`, `product-launch-video` y `embedded-captions` para changelogs y lanzamientos;
- (c) cuando hay que renderizar en GCP (el Cloud Run de Remotion está abandonado) o en HDR;
- (d) cobertura ante un cambio adverso de la licencia de Remotion en 5.0.

**Complementos (no son motores):**

- AE con Lottie o Rive para piezas hero de diseñadores, consumidas desde Remotion (`@remotion/lottie`, `@remotion/rive`).
- Canva para piezas sociales rápidas de equipos no técnicos con el brand kit.
- IA generativa **solo para b-roll ambiental**, con revisión legal de términos e indemnización, y nunca para texto, UI, código ni datos.
- Un NLE (Premiere o Resolve) para talking heads y screen recordings, donde el editor humano manda.

**Qué evitar:**

- Motion Canvas: sin releases desde 2025-02.
- Rendervid: está en 0.1.0.
- Revideo como base: equipo chico. Solo tiene sentido si se necesita específicamente el modelo de generators.
- Mantener dos motores primarios en paralelo: duplica componentes de marca. El secundario debería tener un alcance escrito.

---

## 7. Workflow híbrido: exportar a Premiere, DaVinci, Final Cut o CapCut

### 7.1 Settings recomendados (Remotion) [V comandos; V tabla de bitrates; notas de NLE: I]

| Destino | Formato | Comando | Notas |
|---|---|---|---|
| Overlay con alpha para NLE (lower thirds, callouts, títulos) | **ProRes 4444** `.mov` | `npx remotion render <Comp> out/overlay.mov --codec=prores --prores-profile=4444 --image-format=png --pixel-format=yuva444p10le` | ~330 Mbps (4444) / ~500 Mbps (4444-xq) según la tabla de `docs/prores.mdx`. Funciona en Premiere, Resolve y FCP [V doc]. **Preferirlo también en Lambda**, porque WebM alpha "can flicker at chunk boundaries" en ese entorno [V `transparent-videos.mdx`]. |
| Intermedio opaco para NLE | ProRes 422 HQ | `--codec=prores --prores-profile=hq` | `hq` es el perfil por defecto (~220 Mbps). |
| Overlay transparente para web o browser | WebM VP8/VP9 con alpha | `--codec=vp8 --image-format=png --pixel-format=yuva420p` | Chrome/Firefox. En Lambda, renderizar en una sola pasada local o subir `framesPerLambda`. |
| Compositing (AE, Nuke, Fusion) o máxima compatibilidad | Secuencia PNG | `npx remotion render <Comp> out/frames --sequence --image-format=png` | El default de `--sequence` es JPEG, **sin alpha** [V]. Para alpha hace falta PNG [V para la regla de imagen PNG; combinación exacta de flags: I]. |
| Entrega final | H.264 MP4 | por defecto; `--crf`, `--x264-preset`, `--color-space=bt709` | Para color consistente con el NLE: `--color-space=bt709` + `--image-format=png` ("For best color accuracy … use png") [V `options/color-space.mdx`]. |
| Stems de audio | WAV | `--separate-audio-to=/abs/path/audio.wav` (desde la 4.0.123) o `--codec=wav` | Permite mezclar en el NLE [V]. |
| CapCut | ProRes 4444 o secuencia PNG | — | **Soporte de alpha en CapCut no verificado [I]**: probar con una pieza piloto antes de estandarizar. Plan B: secuencia PNG, o renderizar el overlay ya compuesto sobre el clip. |

Para fijar estos settings por composición se usa `calculateMetadata` con `defaultCodec`, `defaultVideoImageFormat`, `defaultPixelFormat` y `defaultProResProfile` (`skills/remotion-render/transparent-videos.md`). Así un "Render" desde Studio sale siempre con el preset correcto.

**Equivalentes en HyperFrames [V `docs/guides/rendering.mdx`]:**

- `--format mov`: ProRes 4444 fijo; rechaza `--crf` y `--video-bitrate`.
- `--format webm`
- `--format png-sequence`
- HDR automático a H.265 10-bit si hay fuentes BT.2020 PQ o HLG.

### 7.2 Checklist para entregar overlays transparentes [V salvo I]

1. Composición sin fondo opaco en ningún nivel: root, `AbsoluteFill` o el body. Verificarlo en Studio con el **fondo de damero** (`docs/prores.mdx`).
2. Que el fps de la composición sea **igual** al de la secuencia del NLE. Usar 30 o 60 enteros y alinear la secuencia del NLE; evitar mezclar 29,97 y 30 [I].
3. Verificar el alpha:
   - ProRes: `ffprobe` tiene que reportar `pix_fmt=yuva444p10le`.
   - WebM: `ffprobe` puede mostrar `yuv420p` aunque haya alpha. Hay que forzar el decoder: `ffmpeg -c:v libvpx-vp9 -i overlay.webm -frames:v 1 -pix_fmt rgba test.png` [V `hyperframes/docs/guides/rendering.mdx`].
4. Nombres de archivo con metadata: `<proyecto>_<pieza>_<WxH>_<fps>_<alpha|opaque>_v<NN>.mov`.
5. **Limitación vs MOGRT [I]:** un overlay renderizado no es editable en el NLE. Si los editores necesitan cambiar el texto, la respuesta es generar variantes por props (batch) o mantener plantillas MOGRT de AE para ese caso.

---

## 8. Gotchas para agentes: errores típicos de un LLM con Remotion

| # | Error | Por qué falla | Corrección | Fuente |
|---|---|---|---|---|
| 1 | `transition`, `@keyframes` o Tailwind `animate-*`/`transition-*` | El render captura frames sueltos; el tiempo CSS no se sincroniza | `interpolate(useCurrentFrame(), …)` | `remotion-markup/SKILL.md`, `remotion-create/tailwind.md` [V] |
| 2 | `Math.random()` en el render (o dentro de `useState`) | Cada pestaña paralela genera valores distintos, lo que produce flicker | `random('seed-' + i)`; `Math.random` solo dentro de `calculateMetadata` | `docs/using-randomness.mdx` [V] (las skills no lo dicen) |
| 3 | `Date.now()`, `setTimeout`, `requestAnimationFrame`, `useFrame()` de R3F, animaciones internas de librerías | Dependen del reloj de pared, no del frame | Derivar todo del frame; en 3D, prohibido `useFrame` | `docs/flickering.mdx`, `remotion-markup/3d.md` [V] |
| 4 | `fetch` en `useEffect` sin `delayRender` | Remotion captura el estado de "loading" | `useDelayRender()` + `continueRender`/`cancelRender`, o mejor `calculateMetadata` | `flickering.mdx`, `import-srt-captions.md` [V] |
| 5 | `delayRender()` sin `continueRender()` en algún camino (por ejemplo, en un `catch`) | Timeout de unos 30 s | `cancelRender(err)` en el catch; para trabajo pesado, `timeoutInMilliseconds` | `docs/timeout.mdx` [V] |
| 6 | Fuentes con `@import` de CSS o `<link>`, o medir texto antes de cargarlas | El primer frame sale con la fuente de fallback y `fitText` mide mal | `@remotion/google-fonts` o `@remotion/fonts`; medir tras `waitUntilDone()` | `google-fonts.md`, `measuring-text.md`, `flickering.mdx` [V] |
| 7 | `<img>` o `<video>` HTML en lugar de los componentes de Remotion | No bloquean el render hasta que cargan | `<Img>`/`<CanvasImage>`, `<Video>`/`<Audio>` de `@remotion/media` | `flickering.mdx` [V] |
| 8 | CSS `background-image` o `mask-image` con URLs | No hay espera de carga | `<Img>` o `<CanvasImage>` | `flickering.mdx` [V] |
| 9 | `const FPS = 30` hardcodeado en componentes | Se rompe al cambiar el fps y Studio no puede editarlo | `const {fps} = useVideoConfig()` | `remotion-markup/SKILL.md` [V] |
| 10 | `interpolate` sin clamp | Valores fuera de rango (opacidad > 1, escala negativa) | `extrapolateLeft/Right: 'clamp'` | `timing.md` [V] |
| 11 | Calcular mal la duración con `TransitionSeries` | Las transiciones restan frames y quedan negros al final | Restar `getDurationInFrames()` de cada transición | `transitions.md` [V] |
| 12 | `defaultProps` en una variable, con spread, `satisfies` o `as Props` | Studio no puede escribir de vuelta | Objeto literal inline; tipar con `type` | `compositions.md`, `remotion-interactivity/SKILL.md` [V] |
| 13 | `transform: translate(...) scale(...)` en un string | No es editable en Studio | Propiedades CSS `scale`, `translate` y `rotate` | `remotion-interactivity/SKILL.md` [V] |
| 14 | `.map()` para escenas o clips que se editan por separado | Comparten un único nodo fuente | Un nodo JSX por ítem | `remotion-interactivity/SKILL.md` [V] |
| 15 | Renderizar sin que se pida, o no abrir Studio | Desperdicio y mala experiencia; con Automators, además, **costo** | Abrir Studio y renderizar solo ante pedido explícito | `remotion-best-practices/SKILL.md` [V] |
| 16 | Pisar ediciones que el usuario hizo en Studio | Studio escribe al mismo código que el agente | Releer antes de editar y preguntar ante cambios inesperados | `remotion-best-practices/SKILL.md` [V] |
| 17 | Efectos WebGL o 3D sin `--gl=angle` (4.x) | Salen frames negros o vacíos | `Config.setChromiumOpenGlRenderer('angle')` | `effects.md`, `html-in-canvas.md` [V] |
| 18 | `--concurrency=1` como "arreglo" del flicker | Enmascara el no-determinismo y bloquea Lambda | Arreglar la causa (función pura del frame) | `flickering.mdx` [V] |
| 19 | `toneFrequency` y esperar oírlo en Studio | Solo se aplica en el render server-side | Validar con un render corto | `audio.md` [V] |
| 20 | Captions: un overlay global para varios clips, sin espacios iniciales o con timestamps de composición | Se desincronizan al recortar o mover clips | Captions por clip, inline, relativas a la fuente | `display-captions.md`, `transcribe-captions.md` [V] |
| 21 | Whisper en español con `small.en` o confiando en la autodetección | No hay autodetección de idioma | Modelo multilingüe + `language: 'es'` | `transcribe-captions.md` [V] |
| 22 | Usar APIs de memoria vieja (`startFrom`/`endAt`, `OffthreadVideo` por defecto, `<Audio>` de `remotion`) | La API evolucionó (`trimBefore`, `@remotion/media`) | Consultar `/remotion-docs` (docs en .md) antes de implementar | `remotion-docs/SKILL.md`, `timeout.mdx` [V]; frecuencia del error: [I] |
| 23 | Versiones mezcladas de `@remotion/*` o `npm i` directo | Errores sutiles en runtime | `npx remotion add <pkg>` y `npx remotion upgrade` | `remotion-markup/SKILL.md`, `remotion-upgrade/SKILL.md` [V] |
| 24 | Lambda: no redesplegar la función o el sitio tras un upgrade o un cambio de código | Se renderiza código viejo o la versión no coincide | Redesplegar ambos en el pipeline | `remotion-saas/rendering.md` [V] |
| 25 | WebM alpha en Lambda | Flicker del alpha en los bordes de chunk | ProRes 4444 o render local en una sola pasada | `docs/transparent-videos.mdx` [V] |
| 26 | `HtmlInCanvas` o motion blur en plantillas de producción | La preview necesita Chrome 149+ con flag | Evitarlo en plantillas compartidas o documentar el requisito | `html-in-canvas.md`, `motion-blur.md` [V] |
| 27 | Usar los SFX meme de `sfx.md` o ElevenLabs por defecto | Riesgo de licencias o de marca; proveedor no aprobado | Librería de audio licenciada y TTS aprobado en `CLAUDE.md` | `sfx.md`, `voiceover.md` [V]; riesgo: [I] |
| 28 | Que el agente arme un "script de batch" sin avisar | Convierte el uso en **automation** a efectos de licencia | Marcar en `CLAUDE.md` que cualquier `renderMedia` o loop de render pasa por revisión | `terms.mdx` §Automators [V] |
| 29 | Copiar el ejemplo de `parameters.md` | El componente no recibe `props` y hay un typo en el import | Usar `(props) =>` o desestructurar | `remotion-markup/parameters.md` [V] |

### 8.1 Fragmento sugerido para el `CLAUDE.md` del repo de video [propuesta]

```md
## Reglas de video (Remotion 4.0.536 fijado; no actualizar sin PR)
- Todo movimiento sale de useCurrentFrame()+interpolate (clamp siempre). Nada de CSS transitions/animations ni Tailwind animate-*.
- Aleatoriedad: random(seed) de 'remotion'. Prohibido Math.random()/Date.now()/setTimeout fuera de calculateMetadata.
- Datos externos: calculateMetadata (preferido) o useDelayRender + continueRender/cancelRender.
- Fuentes: solo brand/fonts.ts (@remotion/fonts, woff2 locales). Medir texto después de cargar fuentes.
- Media: <Video>/<Audio> de @remotion/media, <Img>/<CanvasImage>. Nada de <img>/<video> HTML ni background-image.
- Marca: colores/tipos solo desde brand/tokens.ts vía enums del schema; no exponer zColor libre.
- Audio: solo librería licenciada en public/audio; prohibidos los SFX de remotion.media; TTS = <proveedor aprobado>.
- No renderizar salvo pedido explícito. No crear scripts que llamen renderMedia/npx remotion render en loop sin aprobación (licencia "Automators").
- Overlays para NLE: ProRes 4444 (prores-profile=4444, png, yuva444p10le). Entrega web: H.264 bt709.
- Antes de usar una API, consultar /remotion-docs (no confiar en memoria).
```

---

## 9. Fuentes

### Primarias locales [V]

- Skills de Remotion: `/home/user/remotion-dev/skills/README.md`; `/home/user/remotion-dev/skills/skills/*/SKILL.md` (remotion-best-practices, remotion-create, remotion-markup, remotion-studio, remotion-render, remotion-captions, remotion-saas, remotion-interactivity, remotion-docs, remotion-upgrade, remotion-multimedia, remotion-maps) y sus subarchivos `.md` (en particular `remotion-markup/{compositions,calculate-metadata,parameters,sequencing,timing,timing-props,transitions,multi-scene-video,connected-compositions,audio,voiceover,video-editing,embedding-videos,effects,html-in-canvas,motion-blur,google-fonts,local-fonts,lottie,3d,sfx,ffmpeg,measuring-text}.md`, `remotion-create/{tailwind,video-layout}.md`, `remotion-render/transparent-videos.md`, `remotion-captions/*.md`, `remotion-saas/*.md`, `remotion-interactivity/{timeline-structure,inline-effects}.md`, `remotion-maps/techniques/*/references/*.md`).
- HyperFrames: `/home/user/heygen-com/hyperframes/README.md`, `CLAUDE.md`, `CREDITS.md`, `ADOPTERS.md`, `LICENSE`, `docs/guides/hyperframes-vs-remotion.mdx`, `docs/concepts/determinism.mdx`, `docs/concepts/variables.mdx`, `docs/deploy/overview.mdx`, `docs/deploy/cloud.mdx`, `docs/guides/rendering.mdx`, `docs/guides/hdr.mdx`, `docs/packages/cli.mdx` (telemetría), `skills/remotion-to-hyperframes/SKILL.md`, `references/{api-map,limitations,timing}.md`.
- Documentación oficial de Remotion, desde el código fuente (clon sparse en `/tmp/claude-0/-home-user/5edbc552-509f-56b0-b000-c8cd066bda1f/scratchpad/refs/remotion-dev__remotion/packages/docs/docs/`, commit `4ffefcc`, 2026-10-18): `license/faq.mdx`, `license/pricing.mdx`, `terms.mdx`, `5-0-migration.mdx`, `lambda.mdx`, `lambda/cost-example.mdx`, `cloudrun.mdx`, `compare.mdx`, `transparent-videos.mdx`, `prores.mdx`, `flickering.mdx`, `using-randomness.mdx`, `timeout.mdx`, `dataset-render.mdx`, `tailwind.mdx`, `studio/interactivity.mdx`, `ai/{claude-code-plugin,skills,coding-agents}.mdx`, `options/{color-space,license-key,is-production,coding-agent,separate-audio-to,hardware-acceleration,sequence,props}.mdx`, `cli/render.mdx`.
- npm: `remotion@4.0.536` (`LICENSE.md` extraído del tarball; d.ts de exports), `@remotion/captions@4.0.536` (exports), `npm view` de versiones y fechas de remotion, `@remotion/*`, hyperframes, `@revideo/core`, `@motion-canvas/core`, `@rendervid/core`, lottie-web, `@lottiefiles/dotlottie-web`, `@rive-app/canvas`, gsap.

### URLs oficiales correspondientes

- https://github.com/remotion-dev/remotion/blob/main/LICENSE.md
- https://www.remotion.dev/docs/license/pricing · https://www.remotion.dev/docs/license/faq · https://www.remotion.dev/docs/terms (v5.0) · https://www.remotion.pro/license · https://www.remotion.pro/terms-4-0
- https://www.remotion.dev/docs/5-0-migration · https://www.remotion.dev/docs/lambda · https://www.remotion.dev/docs/cloudrun · https://www.remotion.dev/docs/compare-ssr
- https://www.remotion.dev/docs/transparent-videos · https://www.remotion.dev/docs/prores · https://www.remotion.dev/docs/flickering · https://www.remotion.dev/docs/using-randomness
- https://www.remotion.dev/docs/ai/skills · https://www.remotion.dev/docs/ai/claude-code-plugin · https://github.com/remotion-dev/claude-code-plugin
- https://hyperframes.heygen.com/guides/hyperframes-vs-remotion · https://github.com/heygen-com/hyperframes

### Secundarias consultadas por WebSearch [S]

- [Remotion Company Licensing (remotion.pro)](https://www.remotion.pro/license)
- [License & Pricing (remotion.dev)](https://www.remotion.dev/docs/license/pricing)
- [License FAQ](https://www.remotion.dev/docs/license/faq)
- [Terms and Conditions of Remotion (v5.0)](https://www.remotion.dev/docs/license/terms)
- [v5.0 Migration](https://www.remotion.dev/docs/5-0-migration)
- [remotion LICENSE.md en GitHub](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)
- [Toolradar: Remotion Pricing 2026](https://toolradar.com/tools/remotion/pricing) (cifras parcialmente desactualizadas)
- [autoae: Is Remotion Free? (2026)](https://autoae.online/blog/is-remotion-free)
- [rendercomp: Remotion Licensing Explained](https://rendercomp.com/blog/remotion-license-commercial-use-explained/)
- [GenMotion: Do I need a Remotion Company License](https://genmotion.dev/answers/remotion-do-i-need-a-company-license)
- [wireflow: HyperFrames vs Remotion (2026)](https://www.wireflow.ai/blog/hyperframes-vs-remotion)
- [moonjar: Remotion vs HyperFrames](https://moonjar.ai/blog/remotion-vs-hyperframes)
- [orshot: Remotion Alternatives](https://orshot.com/blog/remotion-alternatives)
- [eesel: Claude Motion alternatives](https://www.eesel.ai/blog/claude-motion-alternatives)

### Pendiente por falta de cupo de búsqueda

Precios 2026 de Jitter, Cavalry, Canva Enterprise y Adobe; soporte de alpha en CapCut; términos de IP e indemnización de Veo, Kling y Runway; estado actual de mantenimiento de Revideo; texto de la licencia estándar de GSAP (cláusula sobre Webflow).
