# 01 — Reconstrucción de "Como Fazer Motion Graphics INSANOS com Opus 5.5" (YouTube 4wk7nTZler4)

Fecha del informe: 2026-10-19. Autor: subagente de investigación.

## Convenciones de evidencia (leer primero)

| Etiqueta | Significa |
|---|---|
| **[V-repo]** | Verificado: lo leí directamente en un repositorio clonado (ruta y commit en la sección h). |
| **[V-web]** | Aparece en resultados/resúmenes del buscador. Es fuente secundaria: no leí la página completa. Las citas textuales de este tipo pueden estar recortadas. |
| **[PISTA]** | Dato que me pasó el agente coordinador. No pude confirmarlo de forma independiente. |
| **[INF]** | Inferencia mía a partir de lo anterior. No es un hecho. |
| **[NO VERIFICADO]** | Busqué y no lo encontré. |

**Límites de esta investigación:**
- YouTube está bloqueado y WebFetch no funciona, así que **no vi el video ni leí su descripción ni sus subtítulos**.
- El cupo de WebSearch de la sesión (200 llamadas, compartido por todos los agentes) **se agotó a mitad de la tarea**. Por eso varias URLs pedidas no se consultaron (lista en h.3). Para cubrirlas hace falta un mensaje de seguimiento o subir `CLAUDE_CODE_MAX_WEB_SEARCHES_PER_SESSION`.

---

## (a) Identificación del video y nivel de confianza

### Lo verificado
- **Existe el video** `https://www.youtube.com/watch?v=4wk7nTZler4` con título exacto "Como Fazer Motion Graphics INSANOS com Opus 5.5". El buscador lo indexa con el texto "Aula completa de motion graphics com Claude Code" y con fecha de "hace 12 días" el 2026-10-19, o sea **~7 de octubre de 2026**. [V-web]
- El snippet indexado es casi todo descripción del canal y links. El buscador **no devolvió el nombre del canal, ni la duración, ni los capítulos, ni los links**. [NO VERIFICADO]

### Contexto temporal que acota el contenido
Todo [V-web] salvo donde se indica otra cosa.
- **2026-09-22:** sale Claude Opus 5.5. Fuentes de terceros citan además 1M de contexto, 128K de salida y $4/$20 por millón de tokens (entrada/salida). La página oficial `anthropic.com/claude-opus-5-5` existe, pero no la leí completa.
- **~2026-09-23 a 25:** se viraliza en X el prompt del "showreel de 15 segundos". Gabriel Buzzi (@gabrielbuzziv, brasileño) publica el 2026-09-25 un "TUTORIAL" en portugués. @thayto_dev lo reposteó.
- **2026-09-26/27:** Charlie Hills publica el repo `charlie947/motion-graphics-skills` (13 skills) y la edición de Substack (27/09). [V-repo para las fechas del repo]
- **~2026-10-07:** se publica el video en portugués.
- **2026-10-08:** Anthropic lanza **Claude Motion** (`/motion`, beta, Team/Enterprise según la mayoría de las fuentes). **Es posterior al video.** Por lo tanto el video casi seguro trata de **Claude Code + skills + HyperFrames/Remotion** y no de Claude Motion. [INF, fuerte]
- **2026-10-10/11:** el pack de Charlie Hills pasa de 13 a 15 skills; las dos nuevas son para Claude Motion. [V-repo]

### Hipótesis sobre el autor o canal (confianza BAJA)
1. **Creador brasileño que replica la receta de Charlie Hills.** Las pistas del coordinador coinciden casi palabra por palabra con esa guía: "13 carpetas" que se copian a `~/.claude/skills/`, elegir Opus 5.5 con `/model`, `npx skills add heygen-com/hyperframes` y el prompt del showreel. [INF a partir de PISTA + V-repo]
2. **Gabriel Buzzi (@gabrielbuzziv).** Hizo el primer tutorial en portugués conocido de esta ola, en X: instalar la skill de hyperframes, usar el prompt del showreel, referenciar la carpeta del proyecto, Opus 5.5 con effort max, "~5% do limite de 5 horas". **No encontré ningún canal de YouTube suyo ligado a este video.** [V-web / NO VERIFICADO]
3. **INEMA (`inematds`, inema.club / inema.pro).** Educador brasileño que mantiene `inematds/hyperframes-student-kit` en portugués. El kit trae una skill `motion-showreel` que "corta en la grilla de tiempos de la música", lo que encaja con la pista de "música original sincronizada a los cortes". **Tampoco hay ningún vínculo verificado con el video.** [V-repo / INF]
4. El título copia la fórmula de videos en inglés de esa misma semana, como "How To Make INSANE Motion Graphics With Opus 5.5 (Full Guide)" (`6yWPy5aVHb8`, ~6 oct). Es el patrón típico de canal brasileño que traduce un formato viral. [V-web + INF]

### Confianza global
- **Identidad del canal:** baja. No identificado.
- **Que el video enseñe Claude Code + Opus 5.5 + HyperFrames + un pack de skills:** media-alta. Lo sostienen las pistas del coordinador, que coinciden con fuentes primarias que sí leí.
- **Detalle exacto de lo que se ve en pantalla:** baja. No tuve acceso al video.

---

## (b) Paso a paso reconstruido del tutorial

La columna "Evidencia" separa qué está documentado en las fuentes gemelas de qué supongo que aparece en el video.

| # | Paso | Detalle / comando | Evidencia |
|---|---|---|---|
| 0 | Requisitos | Claude Code (terminal, o la app de escritorio con la pestaña **Code** eligiendo el modelo en el menú bajo la caja de prompt). Node.js 22+ y FFmpeg (requisitos de HyperFrames). Chrome/Chromium. | [V-repo] HyperFrames README; [V-web] Charlie Hills sobre la app de escritorio |
| 1 | Probar el prompt viral "en frío" | Pegar el prompt del showreel de 15 s en un Claude Code limpio y ver qué sale. Charlie Hills lo hace como paso 1: "did the rounds on X this week, so I tried it on Opus 5.5 with nothing added". | [V-web] Charlie Hills; [PISTA] el video usa este prompt |
| 2 | Elegir el modelo | `/model` → Opus 5.5. Effort: los one-shots virales corrieron en `xhigh`/`max` (0xMovez; Buzzi usó `max`). Tabla de `claude-motion`: `low` para storyboard, `medium` para construir escenas, `high` para revisión y pulido, `xhigh`/`max` para "hacelo todo, me voy por un café" (se cambia con `/effort`). | [V-repo] claude-motion README; [V-web] 0xMovez, Buzzi; [PISTA] /model |
| 3 | Instalar HyperFrames | `npx skills add heygen-com/hyperframes`. Abre un selector interactivo y alcanza con el grupo "Core Skills". Alternativa de plugin: `claude plugin marketplace add heygen-com/hyperframes` y `claude plugin install hyperframes@hyperframes`. Para agentes o modo no interactivo: `npx hyperframes skills update`. | [V-repo] HyperFrames README/CLAUDE.md; [PISTA] |
| 4 | Instalar el "motion graphics skill pack" | `npx skills add charlie947/motion-graphics-skills`, o copia manual de las **13** carpetas de `skills/` a `~/.claude/skills/` con el loop del README (que preserva las skills que ya existan). | [V-repo] README en el commit `4cd156a` (30-sep), vigente el 7-oct |
| 5 | Sistema de marca | Correr `brand-intake`. Hace una entrevista en 2 tandas y pide 3 a 5 frames de referencia en `examples/`. Escribe `brand.md` y `MOTION.md` y agrega el bloque "read-first" a `CLAUDE.md`. | [V-repo]; que el video lo muestre es [INF] |
| 6 | Generar | Prompt del showreel. Con skills de HyperFrames el agente hace `init` del proyecto, planifica (director), construye `compositions/index.html` (timeline GSAP pausada, determinista) y pasa a la verificación. | [V-repo] skill `motion-graphics` de HyperFrames |
| 7 | Previsualizar | `npx hyperframes preview` (Studio en el navegador, con live reload). | [V-repo] |
| 8 | Inspeccionar | `npx hyperframes lint` + `npx hyperframes check`, y `npx hyperframes snapshot --at t1,t2,t3` (contact sheet). En la versión actual, `inspect` es alias deprecado de `check` desde la v0.7.50 (2026-07-10), pero sigue funcionando. Si el video dice "inspect", puede ser el comando literal o el verbo genérico. | [V-repo] releases/v0.7.50.md; [PISTA] flujo "inspect" |
| 9 | Criticar | El modelo mira sus propios frames: capturas en tiempos fijos, contra un checklist de texto cortado, solapamientos, legibilidad en celular, cifras inventadas y marca. Ejemplos: `animated-chart` (Prompt 2), `motion-effects` (paso 4), `review-loop` de claude-motion y "Before you finish" del motion-prompt-writer. | [V-repo]; [PISTA] "critique" |
| 10 | Revisar | Una nota por vez, "describí el cambio": "Slow down the second scene.", "Swap the text for mine", "Make it 1080 x 1350 for LinkedIn". Congelar lo que ya funciona. | [V-repo] start-here.md, briefs.md, HyperFrames `iterating.mdx` |
| 11 | Versiones por formato | 9:16, 1:1 y 16:9. En el pack: `reel-export` (1080×1920, safe zone y ffmpeg), `launch-video` ("Export a 16:9 and a 4:5 cut") y `model-showdown`. "En paralelo" probablemente significa subagentes: HyperFrames `music-to-video` despacha un frame-worker por frame en paralelo, y Vox (@Voxyz_ai) propone un "equipo de 4 subagentes". | [V-repo] / [V-web] Vox; [PISTA] layouts en paralelo; mecanismo exacto [INF] |
| 12 | Música y sonido sincronizados | Opciones documentadas: HyperFrames `/music-to-video` + `/media-use` (BGM generada) + `/hyperframes-audio`; motor `sfx` procedural de claude-motion (−14 LUFS); `motion-showreel` de INEMA (grilla de 120–130 BPM, `music-grid.mjs`, `splice-music.mjs`, `mix.mjs` a −14 LUFS); `buildAudio(ctx)` con WebAudio de Barty-Bart. | [V-repo]; [PISTA] "música original sincronizada" |
| 13 | Render final | `npx hyperframes render` (p. ej. `-q high -o ./renders/video.mp4`; `--format webm/mov` para overlay transparente). Si aparece una franja oscura que parpadea en el borde: `--workers 1`. | [V-repo]; [V-web] claudecodeformarketers |

**El ciclo que la pista llama "generate → preview → inspect → critique → revise → render"** coincide con el bucle oficial de HyperFrames, "plan → write HTML → lint → preview → render" con `check` y `snapshot` como compuertas. La skill `motion-graphics` lo formaliza como init → plan → (source) → design → build → verify → approve → render, y antes de renderizar pide aprobación explícita: "render now, or what changes?". [V-repo]

---

## (c) Herramientas, skills y repos exactos, con comandos de instalación

### c.1 HyperFrames (HeyGen), el motor HTML→MP4
- Repo `heygen-com/hyperframes`, Apache-2.0. npm `hyperframes`: v0.8.139/0.8.140 el 2026-10-07 y **v0.8.174 hoy**. Sale casi una versión por día, así que hay que fijar versión. [V-repo + `npm view`]
- Instalación: `npx skills add heygen-com/hyperframes` (selector interactivo), `npx skills add heygen-com/hyperframes --skill <name>`, `--all` (21 skills) o el plugin descrito en (b). CLI manual: `npx hyperframes init my-video && cd my-video && npx hyperframes preview && npx hyperframes render`.
- **Advertencia del repo:** nunca correr `npx skills add ... --all` dentro de un checkout de HyperFrames, porque borra `skills/<name>`. [V-repo CLAUDE.md]
- 21 skills:
  - Router `/hyperframes`.
  - Workflows: `product-launch-video`, `faceless-explainer`, `pr-to-video`, `embedded-captions`, `talking-head-recut`, `motion-graphics`, `music-to-video`, `slideshow`, `general-video`, `remotion-to-hyperframes`.
  - Skills de dominio: `hyperframes-core`, `-animation`, `-keyframes`, `-creative`, `media-use`, `-cli`, `-audio`, `-registry`, `figma`.
- Contrato técnico: clips con `class="clip"`, una timeline GSAP raíz pausada en `window.__timelines`, determinismo (nada de `Date.now()`, nada de `Math.random()` sin semilla, nada de fetch en render).
- Comandos de la CLI: `init`, `add`, `catalog`, `lint`, `check`, `snapshot`, `preview`, `render`, `publish`, `doctor`, `cloud render`, `lambda`.

### c.2 El "motion graphics skill pack": `charlie947/motion-graphics-skills` (Charlie Hills, MIT)
**[V-repo]** Clonado con historial completo.
- Creado el 2026-09-26 con 5 skills. Ese mismo día llegó a **13**, y así siguió hasta el 2026-10-10. Por eso el video (~7 oct) vio **13**.
- Hoy tiene **15**: el 10-oct se agregó `reference-to-motion` y el 11-oct `motion-prompt-writer`, ambas para "Claude Motion".
- La descripción de GitHub todavía dice "13 Claude Code skills…".
- Hay forks y copias (adeyholar, lois-react) y un PR en `justino17-cmd/teamop` que lo describe como "13 skills, licence MIT". [V-web]

Instalación (README):
```bash
npx skills add charlie947/motion-graphics-skills
# luego: Claude Code → /model → Opus 5.5 → correr brand-intake primero
# Exportar a MP4: npx skills add heygen-com/hyperframes
# Manual: git clone https://github.com/charlie947/motion-graphics-skills.git
#         y copiar skills/* a ~/.claude/skills/ (o .claude/skills/ del proyecto)
# Codex: copiar a .agents/skills/
# Claude Desktop: zip -r brand-intake.skill brand-intake → Customise → Skills
```

**Resumen de cada SKILL.md.** Las 13 presentes el 7-oct, más las 2 posteriores:

| Skill | Qué hace | Detalles clave leídos en SKILL.md |
|---|---|---|
| `brand-intake` | Setup obligatorio. Escribe `brand.md` (<300 palabras), `MOTION.md` y el bloque read-first en `CLAUDE.md`. | Entrevista en 2 tandas (4 + 3 preguntas). `MOTION.md` cubre hex y uso, fuentes y tamaños, timing de entrada/hold/salida, fps/easing/"handmade", textura, 5 "never", y un ejemplo plano por plano; "ASK ME" donde no se sabe. Lecciones: frames mezclados dan looks mezclados; la "línea de ambición" es obligatoria; los hex muestreados de JPEG derivan. |
| `motion-brief-writer` | Convierte una idea vaga en un brief de construcción para Claude Code. | Hasta 5 preguntas. Salida: resumen de 3 frases + un prompt con W×H, segundos, 4 estados (start/change/hold/return), textos fijos, `window.seek(seconds)`, reduced-motion, captura de frames y chequeo, "no installs/spending sin preguntar". Separa resultados reales de "Illustrative data". |
| `launch-video` | Lanzamiento de 30–45 s. | 7 beats (0-4 hook … 38-45 CTA). "Premium" = colores reales de marca, UI de vidrio, prompt tipeado solo dentro del input, prueba real, variedad. Construir los primeros 10 s en 2–3 estilos y elegir uno. Prohibidos: typewriter en titulares, glow, bounce, gradientes en texto, testimonios falsos. Exportar 16:9 + 4:5. |
| `apple-launch-film` | Film estilo keynote de Mac (notch, widgets, wallpapers en gradiente), todo en código. | Requiere `npx skills add emilkowalski/skills --skill apple-design`. "Springs, not tweens". Nombrar "the notch at the top centre" (sin eso un modelo dibujó una laptop entera). Comparar escena por escena contra la referencia. |
| `vox-explainer` | Explainer documental de 30–60 s estilo Vox. | Papel rasgado, halftone, grano, tipografía condensada, **animación en "twos"** (24 fps, cada pose 2 frames). Paleta por defecto `#B8312A #F1E6D0 #FBF7EE #14213D #F2C230`. Score sonoro escrito en código. Cada dato con fuente. 8–14 planos. |
| `animated-chart` | Gráfico en loop: barras que se vuelven línea, contadores. | 3 prompts: build / "look again" (crítica) / export a MP4 + GIF. 8 s (2 de cambio, 4 de hold, 1.5 de retorno). Último frame = primero. Nunca redondear valores. |
| `milestone-reveal` | 12 s: ~3.200 partículas tipo cielo nocturno que forman tu número real. | El número se muestrea de un canvas offscreen; ~2.700 puntos van a los dígitos. `willReadFrequently: true` para que Chrome no cambie el modo de dibujo. Semilla fija. Costura medida (0 px de diferencia entre frame 0 y 12). |
| `motion-effects` | 16 efectos premium en loop de 8 s, "en tu marca". | Botón→player, búsqueda→resultados, card→workspace, tabs→panels, chart morph, dashboard zoom, spring stack, magnetic dock, masked type, elastic type, text→layout, image reveal, perspective shift, glass focus, flowing paths, particle logo. Reloj único: movimiento 0–2.2, hold hasta 6.6, retorno hasta 8.0. Recetas detalladas en `references/effects.md`. |
| `title-sequence-3d` | Opener cinematográfico 3D de 8–15 s. | Three.js con versión fijada, calle lluviosa nocturna, logos como carteles con `UnrealBloomPass` sutil, dolly lento, lluvia con semilla. GIF de 9 s <5 MB para newsletter. |
| `model-showdown` | Mismo brief a 3 modelos y comparación apilada. | Solo el primer intento, mismo renderer, y una falla queda en el video. Comando ffmpeg completo para reel 1080×1920 con 3 paneles de 1080×360 y overlay PNG. |
| `newsletter-promo` | Promo de 12–20 s de una edición. | 0–3 hook, 3–11 tres pruebas de ~2.5 s, 11–15 cierre. |
| `loop-cover` | Portada de newsletter como GIF en loop. | 896×640, 180 frames a 20 fps. Rotar el loop para que el frame 1 sea la imagen terminada. Paleta sin dither. Script Python que mide costura (0.0–0.3) y excursión (0.7–2.8). |
| `reel-export` | Cualquier video a Reel/TikTok 1080×1920 limpio. | Safe zone y 360–1420 y fuera de los 120 px derechos. H.264, yuv420p, rango limitado, bt709, pista AAC silenciosa y `+faststart`. Chequeo con `ffprobe`. |
| `reference-to-motion` *(10-oct, posterior al video)* | Descompone un video de referencia ("moves") y una referencia de "look" en un prompt escena por escena para **Claude Motion**. | Breakdown en 5 líneas: pace, change, type, color, one idea. Prompt de <300 palabras que termina con "render a still every 2 seconds…". |
| `motion-prompt-writer` *(11-oct, posterior)* | Prompt de 8 partes para Claude Motion. | The bar / Format / One rule / Look / Motion / Never / Before you finish / Scene. Default "Apple-style" (`#F5F5F7`, `#0A84FF`…). Héroe 60–70% del cuadro, hold ≥1.2 s, labels ≥34 px. |

**"House rules" del pack** (README, [V-repo]):
1. Facts first.
2. Your brand, not the average.
3. Defaults prohibidos: typewriter, glow, bounce, gradiente en texto, fondos violeta→azul.
4. Motion on twos.
5. Los primeros 3 s cargan el hook.
6. Chequeo antes de exportar: un frame del medio de cada plano.
7. Solo assets reales, nunca logos redibujados.

### c.3 Repos complementarios de la misma ola (todos [V-repo] salvo indicación)

| Repo | Autor / fecha | Qué aporta | Instalación |
|---|---|---|---|
| `Barty-Bart/motion-graphics` | "Bart" (Skool "Bart's AI Workshop"). Primer commit 2026-09-25; 10 commits. | 6 skills: `motion-broll` (25-sep: B-roll sincronizado a la transcripción, una forma que muta sin cortes, cursor, ProRes 4444 transparente); `object-separation` (5-oct: SAM 2 local); `explainer-high-energy`, `explainer-default`, `explainer-engaging` y `sound-effects` (**12–13 oct, posteriores al video**). | `npx skills add Barty-Bart/motion-graphics` o copiar a `.claude/skills/` |
| `whaleyxbt/claude-motion` | whaley. 2026-09-29; sims el 2026-10-04. | Kit de "gusto" sobre **Remotion**: `motion-design` (easings y springs con números), `review-loop` (contact sheets por beat), `sound-design` (motor `sfx` en Python stdlib, −14 LUFS), `web-sims` (Three.js → 60 fps). Ejemplo: video de `/effort` hecho con el prompt del showreel. | `git clone … && npm install && npm run build` |
| `remotion-dev/skills` | Oficial de Remotion. | 12 skills (`remotion-best-practices`, `-create`, `-markup`, `-render`, `-captions`…). | `npx skills add remotion-dev/skills` |
| `emilkowalski/skills` | Emil Kowalski. | `apple-design` (WWDC "Designing Fluid Interfaces" llevado a la web), más `animate`, `review-animations` y otras. | `npx skills add emilkowalski/skills --skill apple-design` |
| `inematds/hyperframes-student-kit` | INEMA (BR). Último commit 2026-09-26. | Kit **en portugués** (port del "Herk Edit Kit" de `nateherkai`): 15 skills, 406 cards, transcripción traducida del tutorial de Nate Herk (Codex). Incluye `motion-showreel`, que hace ingeniería inversa del reel viral "CLAUDE / MOTION REEL" (ver e). | `git clone … && npm ci && npm run setup` |
| 21st.dev | Web, no es repo. | Componentes UI reales con un prompt cada uno, para no "dibujar UI falsa". | Pegar el prompt del componente. |
| Claude Motion (`/motion`) | Anthropic, 2026-10-08. | Producto oficial que anima por código y exporta MP4. **Posterior al video.** [V-web] | Escribir `/motion` en Claude (beta). |

Otros repos solo vistos en snippets: `nateherkai/hyperframes-student-kit` ("Herk Edit Kit", 15 skills), `imMamdouhaboammar/motion-graphics-skills` (53 skills, distinto del de Charlie), listas como "20 GitHub Repos That Turn Claude Opus 5.5 Into a Complete Motion Design Studio" (Medium) y "awesome-opus5-5-videos: 475 viral Opus…" (lista de Charlie en X). [V-web]

---

## (d) Biblioteca de prompts literales con fuente

Todos los textos están copiados tal cual. Las versiones [V-web] pueden estar recortadas por el buscador.

**P1 — Prompt viral del showreel, versión del pack** [V-repo `prompts/start-here.md`; también en `brand-intake` paso 5]
```
Make a dynamic 15-second motion graphics video that shows what an incredible motion designer you are. Go all out.
```

**P2 — Prompt viral, versión larga que circuló en X** [V-web: tweets de @gabrielbuzziv 2026-09-25 y @ayushunleashed]. La autoría original se disputa: @stephanlivera, @condzxyz, @himanshutwtxs, ajith_io.
```
make a dynamic 15-second motion graphics video that shows what an incredible motion designer you are, like it's your showreel for a résumé. go all out.
```
Pasos de Buzzi en portugués [V-web, repost de @thayto_dev]: "1. instale a skill hyperframes 2. prompt: "…go all out." 3. no prompt referencia a pasta do seu projeto 4. espera a mágica acontecer — modelo usado: opus 5.5 (effort: max)".

**P3 — Editar describiendo el cambio** [V-repo `start-here.md`]
```
Slow down the second scene.
Swap the text for mine: [your words].
Make the orange navy.
Use my brand colours: [hex codes].
Make it 1080 x 1350 for LinkedIn.
```

**P4 — Crear MOTION.md desde 5 frames de referencia** [V-repo `prompts/brand-design-system.md`]
```
I am giving you five frames from motion graphics I already like. They are in the examples folder.

Write me one file called MOTION.md that any AI can read before it animates anything for me. It must cover:

1. Every colour as a hex code, and what each one is for
2. The fonts and the type sizes
3. Timing: how things come in, how long they hold, and how they leave
4. How things move: the frame rate, the easing, and anything that makes it feel handmade
5. Texture and finish
6. Five things my motion must never do, named plainly
7. One example, described shot by shot, of it done right

Work only from what is in the frames. Where you cannot tell, write ASK ME rather than guessing.

Show me the file before you save it.
```

**P5 — Regla "read-first" en CLAUDE.md** [V-repo `brand-design-system.md` y `brand-intake`]
```
Add this to CLAUDE.md, and create the file if it does not exist:

Before designing, generating or animating anything, read MOTION.md in full.

Every colour, font, timing and motion value comes from that file.

The file sets the look, not the ambition. When I say go all out, go all out.

If something I ask for is not covered there, ask me rather than choosing for yourself.

When you have finished, check your own frames against MOTION.md, fix what fails, and only then show me.
```

**P6 — Componentes reales como "donante estructural"** [V-repo README y `polish.md`]
```
Add this rule to CLAUDE.md: whenever I paste a component prompt or third-party component code, treat it as a structural donor only. Keep its engineering. Replace its demo copy with my real copy, and translate every colour, border, shadow, font and timing to MOTION.md.
```

**P7 — Auditoría con las reglas de movimiento de Apple** [V-repo `polish.md`]
```
Use the apple-design skill to audit this animation. Give me a ranked list of everything that feels off, worst first.
```

**P8 — Arreglar una sola cosa** [V-repo `polish.md` y `effects.md`]
```
effect.html is close. Fix one thing only: [what looks wrong, e.g. the headline runs past its box at 3 seconds]. Keep the motion, the timing and the loop exactly as they are. Tell me what you changed.
```

**P9 — Brief del film "Why do we dream?"** (con `vox-explainer`) y su plantilla [V-repo `briefs.md`]
```
Why do we dream? And then someone suddenly wakes up, zooms out of the eye, and goes into outer space. There are neural networks of interconnectivity to convey the brain.
```
```
[The question your audience keeps asking]? And then [the visual turn: what happens on screen that nobody expects]. [The metaphor that shows the idea: what it looks like].
```

**P10 — Notas de "director" reales, palabra por palabra** [V-repo `briefs.md`]
```
the text at the start undersells what's coming next
you can't really hear the audio on top of the sound effects
I wouldn't say it looks very premium.
This just isn't in my brand colours.
It needs a full stop at the end of 'in your voice.' It takes a while to get to the reveal.
I hate the voice. Maybe we should just go for a nice backing soundtrack instead.
```

**P11 — Autocrítica sobre los frames capturados** [V-repo `animated-chart`, Prompt 2]
```
Inspect the five captured frames and the loop boundary. Check that the values stay the same, labels are readable, nothing overlaps, and each element appears only when it should. Report only problems you actually observe. Fix any you find, preserve the earlier version, and capture the same frames again. If no problems are found, say so and do not invent a revision.
```

**P12 — Exportar a MP4 y GIF sin instalar a escondidas** [V-repo `motion-effects`, paso 5]
```
Now turn effect.html into a video and a GIF I can post. Use tools already on this computer. If you need something that is not installed, stop and tell me what it is before you install anything. Load the page with ?render, call window.seek() for every frame at 30 frames per second (240 frames for 8 seconds), and encode an MP4 in H.264 at [SIZE]. Then make a GIF that loops forever. Show me three frames from the finished GIF so I can check it came out right.
```

**P13 — Un efecto del pack (ejemplo: 05 Chart morph / 16 Particle logo)** [V-repo `prompts/effects.md`]
```
Read MOTION.md first. Build effect.html from scratch: scattered dots fly in on gentle arcs and pack into the shape of [MY LOGO FILE], with [BRAND NAME] and [TAGLINE] underneath. Seed the scatter so every loop is identical. One 8-second loop with window.seek(seconds), ending where it starts. Size: [SIZE]. Trace my real logo, never a redrawn one.
```

**P14 — Pedido con proceso explícito (claude-motion)** [V-repo README]
```
Make a 15-second 1080×1080 motion graphic announcing <your thing>.
Follow AGENTS.md: storyboard first, then the timeline, review loop, sound.
```
La revisión real que recibió el ejemplo `/effort` [V-repo `examples/01-effort/README.md`]:
```
can you slow down the scene transitions a bit? stretch the video to 20–25 seconds so it's more readable
```

**P15 — Showreel con música y grilla de cortes, en portugués** [V-repo `inematds/hyperframes-student-kit` README]
```
Use motion-showreel para criar um showreel de 15 segundos para [marca]. Estude meu reel
de referência em [caminho local], se eu der um. Escolha um motivo que se transforme em
todos os capítulos, corte na grade de tempos da música e termine no logo. Me mostre o
storyboard e a folha de tempos antes de construir, e confirme antes de qualquer geração paga.
```

**P16 — Prompt de ejemplo oficial de HyperFrames** [V-repo `docs/prompting/motion-graphics.mdx`]
```
/motion-graphics Make an 8-second 1920x1080 video. Beat 1 (0-4s): dark macOS terminal types "npx skills add heygen-com/hyperframes" character by character, then hold on the blinking cursor. Beat 2 (4-5s): the terminal shatters into fragments. Beat 3 (5-8s): bold white kinetic text on black slams in word by word, snappy: "YOU JUST MADE THIS / WITH HYPERFRAMES." Adapt the `code-typing` and `vfx-shatter` registry blocks; hand-author the kinetic text. No narration, no image or media files.
```

**P17 — Método de 3 pasos de Charlie Hills para los 16 efectos** [V-web, X @charliejhills]
"1. Pick one motion, like a chart that morphs. 2. Show Claude a reference and name every state. 3. Ask for HTML and SVG, then fix it round by round." El mismo hilo admite: "it wasn't one prompt. I needed the exact states, a good reference and a few rounds of fixes".

---

## (e) Técnicas de motion que se ven

**Aviso:** no vi el video. Lo que sigue es (1) el análisis **medido** del reel viral que produce el prompt del showreel, hecho por INEMA en su skill, y (2) las técnicas que las skills le ordenan al modelo. Es lo más probable que se vea en pantalla. [V-repo; aplicarlo al video es INF]

### e.1 Anatomía del "CLAUDE / MOTION REEL" (Opus 5.5, hecho para Nate Herk, septiembre de 2026)
Fuente: `motion-showreel/references/reference-breakdown.md`.
- **Formato y ritmo:** 1920×1080, 60 fps, 15.06 s, 900 frames. 128 BPM (tempo 0.469 s). Todos los cortes secos caen a ≤2 frames de la grilla. Hay un "hueco" de audio antes del drop (−12 → −25 dB a los 7.25 s) y un flash de iris a los 7.50 s.
- **Capítulos rotulados en el HUD:**
  - 01 Squash & Stretch: pelota roja con lectura POS/SCL/VEL.
  - 02 Kinetic Type: "EVERY FRAME is a DECISION", con caja de selección de herramienta de diseño, cursor, serif itálica roja, motion blur y wallpaper de palabras.
  - 03 Shape Language: grilla de círculos→cuadrados→cruces→triángulos con cámara inclinada.
  - 04 Particle Systems: explosión que se condensa en anillo.
  - 05 Lookdev/SDF: toro cromado iridiscente, smooth-union en blobs y luego cubo, con lecturas IOR y ROUGH.
  - 06 Easing: gráfico `cubic-bezier(0.83,0,0.17,1)` con onion-skin.
  - Ráfaga de cortes: Op Art, Glitch RGB, isométrico, simetría/caleidoscopio, ruido.
  - 07 Fin: "CLAUDE" sale del ruido con bloom, línea que se dibuja, "MOTION DESIGN / SHOWREEL 2026" tipeado con cursor de bloque, y el punto rojo como punto final.
- **HUD persistente:** marcas de corte, `CLAUDE / MOTION REEL`, `● 1920×1080 · 60P · 128 BPM`, timecode, regla de progreso y rótulo del capítulo. Mono en mayúsculas, tracking 0.2 em.
- **Por qué funciona:**
  - Un solo protagonista que se transforma.
  - El reel "narra su propio oficio".
  - Paleta tinta/papel/rojo, con el azul reservado para el clímax.
  - El valor se invierte en cada cambio de capítulo.
  - Curva de cortes ~75% desarrollo / 13% ráfaga / 12% resolución.
  - Densidad que respira.
  - 3 voces tipográficas.
  - Acabado físico: motion blur, bloom, aberración cromática, grano, viñeta.

### e.2 Técnicas que dictan las skills [V-repo]
- **Tipografía cinética:** máscaras que suben con leve inclinación (~0.8 s), stagger de palabras de ~0.09 s, slams en grotesca pesada, serif itálica para "el aparte humano", tipeo a ~0.035 s por carácter y cursor que parpadea a 2.4 Hz. *(claude-motion, Barty-Bart)*
- **Easing con números:**
  - Entradas `bezier(0.16,1,0.3,1)`, salidas `bezier(0.6,0,0.9,0.35)`, cambios de estado `bezier(0.65,0,0.35,1)`, overshoot `bezier(0.55,0,0.2,1.12)`.
  - Springs (damping/stiffness/mass) de 14/140/0.8 por defecto y 9–11/200–230 para "pop".
  - Las salidas duran ~la mitad que las entradas.
  - Holds de lectura ≥1 s, +0.25 s por palabra extra. *(claude-motion `motion-design`)*
- **Springs en vez de tweens.** Fórmula cerrada `spring(t,w,z)` y `track()` que suma un spring por cada cambio de objetivo. *(Barty-Bart; `apple-launch-film`)*
- **Transiciones como objetos, no cortes:** flood de color, un punto que crece hasta ser el fondo siguiente, morph de forma. Cortes duros solo en downbeat. "A ghost of the start state sells the change." *(Barty-Bart high-energy, `motion-effects`)*
- **Animación "on twos"** para look hecho a mano, con PRNG con semilla y holds de 2 frames. *(`vox-explainer`, HyperFrames `motion.mdx`, regla 8)*
- **Partículas:** número o logo muestreado de un canvas offscreen, ~3.200 puntos con semilla, `willReadFrequently`. *(`milestone-reveal`, `motion-effects` #16)*
- **3D:** Three.js con versión fijada, `UnrealBloomPass` sutil, dolly lento, lluvia con semilla. Campo de cubos con proyección propia. SDF y lookdev en el reel viral. *(`title-sequence-3d`, Barty-Bart)*
- **Datos:** chart morph (barras→línea), count-up, donut, dashboard zoom, valores intocables y rótulo "Illustrative data". *(`animated-chart`, `motion-effects`)*
- **Profundidad y parallax:** planos a 0.2×/1×/6× con un único elemento de primer plano desenfocado que **ocluye**. *(HyperFrames `motion.mdx`, regla 6)*
- **Pacing de showreel:** 1.5–4 s por idea; en el ejemplo "con", 1.1 s por beat con cortes duros. *(HyperFrames, regla 7)*
- **Motion blur real:** 4–8 subframes por frame con obturador de 180°, blendeados con ffmpeg. *(Barty-Bart)*
- **Sonido:**
  - Grilla de 120–130 BPM, cortes a ≤2 frames del beat, whoosh 2 frames antes, riser que termina justo en el hit, un solo impacto por video, pad debajo con ducking.
  - Loudness −14 LUFS (claude-motion, INEMA) o −16 LUFS con picos < −4 dBFS medidos sobre el MP4 (Barty-Bart).
- **Determinismo (base de todo):** `window.seek(t)` o `render(t)` como función pura del tiempo, sin `setTimeout` ni transiciones CSS, aleatoriedad con semilla, `?render` para congelar, fuentes embebidas en base64.

---

## (f) Problemas, limitaciones y críticas reportadas

### f.1 "One-shot" engañoso
- Thariq, del equipo de Claude Code, habría señalado que el post viral decía "one-shot" pero el prompt real tenía ~10k caracteres, con skills, ejemplos y API keys (tuit del 23-sep según un write-up). [V-web, **de segunda mano**: no vi el tuit original]
- Otros casos citados: un brief de director de 9.500 caracteres, una carpeta de skills, 2 API keys y una corrida autónoma de 12 h; otra pieza de ~8 h. [V-web]
- Charlie Hills: "it wasn't one prompt…". Tres primeros drafts suyos fueron rechazados como "not premium" y "not my brand colours". [V-web / V-repo `launch-video`]

### f.2 Look genérico ("AI slop")
- En un Claude Code limpio el prompt "picks its own colours, its own type and its own idea of motion". Con `MOTION.md` y sin la línea de ambición, sale "far too polite". [V-repo]
- Artículo de nocode.mba (clip "talking head" de 56 s → intro de YouTube): en el primer render faltaba el logo, los SFX eran demasiado frecuentes y "copy and animation still felt AI-generated". [V-web]
- Un write-up dice que sin la skill el modelo **ignoró Remotion y HyperFrames aunque estuvieran disponibles**. [V-web]
- La UI que dibuja el modelo "looks fake": se arregla con 21st.dev. Un fade entre dos imágenes "looks cheap every time". [V-repo]
- HyperFrames lo advierte en su propia doc: "passes every automated gate, fails human review" ("sparse elements floating", "a well-dressed slideshow"). [V-repo `iterating.mdx`]

### f.3 Costos, tokens y tiempos reportados
Ninguna fuente publica costo por video de forma sistemática; esa crítica también aparece en las fuentes. [V-web]

| Fuente | Dato |
|---|---|
| @gabrielbuzziv (X, 25-sep) | "gastou tipo 5% do limite de 5 horas", Opus 5.5 effort max [V-web] |
| @ayushunleashed (X) | "made this video in 1 hour. API cost: $21" [V-web] |
| wireflow.ai | clip de 12 s a 1080p en ~9 min, "$1.00 in list-price model usage", con prompt tipo shot-list [V-web] |
| claude-motion, ejemplo `/effort` | prompt → primer corte de 15 s con sonido: ~30 min; revisión → 22 s: ~8 min [V-repo] |
| Barty-Bart | render final con motion blur: "a 60 s final can take 20–60 minutes on a laptop" [V-repo] |
| Precio Opus 5.5 | $4 entrada / $20 salida por millón de tokens (doc de plataforma citada en un snippet) [V-web] |
| Charlie Hills | "Opus 5.5 on medium beats Astra and Fable on their highest settings (for a fraction of the cost)" [V-web, afirmación promocional] |

### f.4 Errores de render y bugs técnicos documentados [V-repo salvo indicación]
- Franja oscura que parpadea en el borde: `npx hyperframes render --workers 1`. [V-web claudecodeformarketers]
- El frame 0 sale con la fuente de reserva: precargar las fuentes antes de `seek(0)`.
- Chrome cambia de modo de dibujo tras lecturas repetidas: `willReadFrequently: true`.
- `Math.random()` en render rompe el loop y hace cada export distinto.
- Página en blanco: casi siempre una constante declarada dos veces. Pegar el error de consola.
- `background-clip: text` es invisible en la captura. Propiedades con varios tweens se "traban" al hacer seek hacia atrás. `<video data-start>` no puede estar dentro de un `.clip` temporizado.
- HyperFrames re-encodea el audio más bajo: hacer remux del master.
- En Linux con GPU por software se toma el "slow path".
- Un loop de 8 s es demasiado lento para un Reel: usar el modo hold.
- Videos de celular en HEVC/rango completo salen lavados: re-encode a H.264 en rango limitado.
- Los modelos de video agregan movimientos de cámara no pedidos (para fijar la cámara, animar en código).

### f.5 Sonido
- "Claude can't hear": hay que medir y dar 5 timestamps para escuchar con auriculares. [V-repo Barty-Bart]
- **Contradicción entre fuentes:**
  - Barty-Bart `sound-effects` prohíbe sintetizar ("cheap beeps") y usa una biblioteca CC0.
  - `explainer-high-energy` (del mismo autor) y claude-motion **sintetizan** todo.
  - INEMA prefiere música de librería gratuita o generada con Suno vía Kie.ai (pago).

### f.6 Licencias y dependencias
- Remotion exige licencia de empresa por encima de un umbral. [V-repo claude-motion]
- Mixkit prohíbe redistribuir dentro de herramientas o plantillas. Kling y Kie.ai son pagos. [V-repo]
- MIT obliga a conservar el aviso de copyright (motivo del PR en teamop). [V-web]
- Límite admitido del pack: "a photoreal human face" sigue necesitando un modelo de imagen. [V-repo]

### f.7 Deriva de versiones
- HyperFrames saca ~1 versión por día (v0.8.139 → v0.8.174 en 12 días). `skills add` puede ir horas detrás de `main`. [V-repo + npm]
- El pack de Charlie cambió de 13 a 15 skills después del video. [V-repo]

---

## (g) Lo que el video probablemente NO cubre y un equipo profesional necesita

Todo esto es [INF]. Se basa en que es una "aula" de YouTube con el patrón "INSANOS" y en el contenido de las fuentes gemelas.

1. **Gobernanza de marca a escala:** `MOTION.md` y `brand.md` versionados en git, con dueño, aprobación y changelog; tokens compartidos con Figma (skill `/figma` de HyperFrames); un "master look" por tipo de pieza.
2. **CLAUDE.md de equipo y repo de referencias:** el "render contract" de 0xMovez ("the prompt is 10%, the harness is 90%"), el bloque read-first, house rules y una biblioteca de referencias curada (frames y breakdowns medidos como el de INEMA), en lugar de improvisar por prompt.
3. **Fijar versiones y reproducibilidad:** fijar `hyperframes`, el pack de skills (commit) y Three.js; mantener entornos idénticos (Docker); guardar el prompt y los artefactos junto al MP4.
4. **QA con criterio humano:** checklists de frames (contact sheets por beat), revisión con comentarios por timecode, sign-off; separar "pasa los gates" de "es bueno".
5. **Integridad de datos y legal:** fuentes por cifra, rótulo "Illustrative data", derechos sobre logos de terceros y sobre fuentes tipográficas, licencias de música y SFX (Content ID), licencia de empresa de Remotion.
6. **Especificaciones de entrega por plataforma:** matriz 16:9 / 1:1 / 4:5 / 9:16 con safe zones, bt709 en rango limitado, `+faststart` y loudness por destino (−14 vs −16 LUFS); subtítulos, accesibilidad y reduced-motion.
7. **Interoperabilidad con el NLE:** overlays transparentes (ProRes 4444 / webm / mov), EDL, entrega de proyectos editables para After Effects, Premiere o DaVinci (Claude Motion abre en Adobe, Descript y otros, pero es posterior).
8. **Costos y capacidad:** presupuesto de tokens por pieza, effort por etapa, límites de 5 horas de los planes, render en la nube (HyperFrames `cloud render` / AWS Lambda) y colas de render.
9. **Seguridad de la cadena de suministro:** `npx skills add` instala instrucciones y scripts de terceros que se ejecutan con permisos del agente. Hace falta revisión de código, allowlists y no correr `--all` dentro de checkouts.
10. **Evaluación de modelos:** comparaciones justas (patrón `model-showdown`), métricas de retención y A/B, en lugar de "INSANO" como criterio.
11. **Sonido profesional:** compositor o librería licenciada, mezcla con escucha humana; la IA "no oye".
12. **Personas fotorrealistas y footage real:** fuera del alcance de "todo en código".

---

## (h) Fuentes

### h.1 Repositorios leídos (clonados en `/tmp/claude-0/-home-user/5edbc552-509f-56b0-b000-c8cd066bda1f/scratchpad/refs/`)

| Repo | Ruta local | HEAD / fecha |
|---|---|---|
| https://github.com/charlie947/motion-graphics-skills | `/tmp/claude-0/-home-user/5edbc552-509f-56b0-b000-c8cd066bda1f/scratchpad/refs/charlie947__motion-graphics-skills` | `229022e` 2026-10-11 (historial completo; estado al 7-oct = `4cd156a`, 2026-09-30) |
| https://github.com/Barty-Bart/motion-graphics | `/tmp/claude-0/-home-user/5edbc552-509f-56b0-b000-c8cd066bda1f/scratchpad/refs/Barty-Bart__motion-graphics` | 2026-10-13 |
| https://github.com/whaleyxbt/claude-motion | `/tmp/claude-0/-home-user/5edbc552-509f-56b0-b000-c8cd066bda1f/scratchpad/refs/whaleyxbt__claude-motion` | 2026-10-09 |
| https://github.com/inematds/hyperframes-student-kit | `/tmp/claude-0/-home-user/5edbc552-509f-56b0-b000-c8cd066bda1f/scratchpad/refs/inematds__hyperframes-student-kit` | 2026-09-26 |
| https://github.com/emilkowalski/skills | `/tmp/claude-0/-home-user/5edbc552-509f-56b0-b000-c8cd066bda1f/scratchpad/refs/emilkowalski__skills` | — |
| https://github.com/heygen-com/hyperframes | `/home/user/heygen-com/hyperframes` | npm 0.8.174 hoy; 0.8.139/140 el 7-oct |
| https://github.com/remotion-dev/skills | `/home/user/remotion-dev/skills` | — |

### h.2 Fuentes web, solo vía resúmenes del buscador
- Video objetivo: https://www.youtube.com/watch?v=4wk7nTZler4
- Charlie Hills: https://charliehills.substack.com/p/claude-code-motion-graphics · https://charliehills.substack.com/p/opus-55-motion-graphics · https://x.com/charliejhills/status/2103893708550914076 · https://www.threads.com/@charliehills/post/Dd6PoOXkT-P/ · https://www.threads.com/@charliehills/post/Ddv7nZgHGt3/ · https://charliehills.substack.com/p/28-things-to-install-into-claude
- Gabriel Buzzi: https://x.com/gabrielbuzziv/status/2103590703289057430 · repost https://x.com/thayto_dev/status/2104200591278739735
- Ayush Yadav: https://x.com/ayushunleashed/status/2103794962257084755
- 0xMovez: https://x.com/0xMovez/article/2104216919033192746 · https://x.com/0xMovez/status/2104576360119206296 · https://movez.substack.com/p/how-to-build-motion-design-studio · repost en Medium https://medium.com/@raghu250407/how-to-build-motion-design-studio-with-opus-5-5-full-course-7013d15aaa12
- Full Course (humzaakhalid): https://x.com/humzaakhalid/article/2105203643758895454 (= x.com/i/article/2105203643758895454)
- Vox (subagentes): https://x.com/Voxyz_ai/status/2104194355556671987
- nocode.mba: https://www.nocode.mba/articles/claude-opus-5-5-motion-graphics
- dsebastien: https://www.dsebastien.net/2026-10-04-claude-opus-5-5-ask-for-a-video-get-a-program-you-can-edit/
- wireflow (costo $1.00, ~9 min): https://www.wireflow.ai/blog/claude-motion-graphics
- claudecodeformarketers (`--workers 1`): https://claudecodeformarketers.com/blog/motion-graphics-with-hyperframes/
- AY Automate: https://www.ayautomate.com/resources/claude-opus-5-5-motion-graphics · aiartimind: https://aiartimind.com/how-to-make-motion-graphics-with-claude-opus-5-5/ · aiidelist: https://aiidelist.com/blog/opus-5-5-motion-design · youmind: https://youmind.com/opus-5-5-prompts (solo títulos y fragmentos mínimos)
- Hugging Face: https://huggingface.co/blog/karmen-beatapi/how-to-make-videos-with-claude-opus-5-5
- Claude Motion (lanzamiento 8-oct): https://www.unite.ai/anthropic-launches-claude-dashboards-and-motion-takes-docs-out-of-beta/ · https://www.eesel.ai/blog/claude-motion · https://emergent.sh/news/claude-dashboards-motion-launch-beta-all
- Opus 5.5: https://www.anthropic.com/claude-opus-5-5 · https://platform.claude.com/docs/en/models/opus-5-5/overview
- Atribución del prompt viral: https://fliki.ai/features/claude-motion-graphics · https://www.prompt-motion.com/himanshutwtxs-5f4b43
- Videos relacionados (solo título):
  - https://www.youtube.com/watch?v=6yWPy5aVHb8 ("How To Make INSANE Motion Graphics With Opus 5.5 (Full Guide)")
  - https://www.youtube.com/watch?v=EEAoafG-qxA ("How to Make INCREDIBLE Motion Graphics With Opus 5.5")
  - https://www.youtube.com/watch?v=Ll45R_Z8tQc ("Claude Opus 5.5 Animated Every Motion Graphic in This Video (I Didn't Keyframe a Thing)")
  - https://www.youtube.com/watch?v=viIENc2_C70 ("How to Make Insane Motion Graphic + Ai video Editing + Remotion with Opus 5.5": talking head → tutorial con texto animado)
  - https://www.youtube.com/watch?v=nCUQGEDkOM8 ("How to Make Insane Motion Graphics With Claude Opus")
  - https://www.youtube.com/watch?v=Ww4qaxCrQow ("Motion Design com IA SEM After Effects", en portugués)

### h.3 Pedidas pero NO consultadas (se agotó el cupo de búsqueda)
keepylabs.com/blog/claude-code-motion-graphics · dianeswonderland.com · vosu.ai · los videos `6_rCyryA6hg` y `kXmY6yQa5q4` · el contenido completo (no solo el snippet) de youmind, aiidelist, ayautomate, aiartimind y de los artículos de X. **Siguiente paso sugerido:** un mensaje de seguimiento para seguir buscando, priorizando (1) nombre del canal y descripción de `4wk7nTZler4` vía agregadores (Social Blade, Playboard, NoxInfluencer) y (2) el texto completo de los artículos de 0xMovez y humzaakhalid.
