# 06 — Ecosistema de herramientas para motion graphics y video tech con Claude Code

**Fecha de corte:** 2026-10-19 · **Audiencia:** dirección técnica de un estudio de motion/video con IA, cliente enterprise
**Alcance:** herramientas que suben la calidad de lo que sale de Claude Code con motores *HTML→video* (HyperFrames) o *React→video* (Remotion).

## Cómo leer las marcas de verificación

| Marca | Significa |
|---|---|
| **[V-repo]** | Lo verifiqué leyendo código o docs: el repo local de HyperFrames (`/home/user/heygen-com/hyperframes`, v0.8.174), clones de `remotion-dev/skills`, `Barty-Bart/motion-graphics`, `anthropics/skills`, `electronicarts/IRIS` y `zhuyansen/awesome-claude-video-skills`, o el registro npm (`npm view`). |
| **[V-sesión]** | Lo observé en las herramientas MCP conectadas a esta sesión (Canva, Higgsfield, Google Drive). Lo vi en el listado de tools, no lo ejecuté. |
| **[V-web]** | Lo corroboran 2 o más fuentes web, casi siempre secundarias (blogs o agregadores de precios). Es indicativo: antes de comprar, confirmalo en la página oficial. |
| **[1F]** | Hay una sola fuente o las fuentes se contradicen. |
| **[NV]** | **No verificado** en esta sesión: viene de conocimiento previo, o el presupuesto de búsquedas se agotó antes de poder chequearlo. |

> **Limitación de esta investigación:** se agotó el presupuesto de WebSearch (compartido entre agentes) antes de cubrir QA de flashing (PEAT/Harding), costos de Remotion Lambda, GitHub Actions, OBS, Jitter, Midjourney y Musicbed enterprise. Esos puntos van marcados **[NV]**. WebFetch no funcionó (DNS), así que ninguna página oficial de precios se leyó directamente.

---

## TL;DR para la dirección técnica

1. **El motor y sus skills oficiales son lo único imprescindible del lado del agente.** HyperFrames (Apache-2.0) ya trae TTS, música, SFX, transcripción, captions, Figma, grading, mezcla de audio, QA de layout y contraste WCAG, además de render en Lambda o Cloud Run [V-repo]. Remotion trae 12 skills oficiales, pero su licencia se paga a partir de 4 personas [V-web].
2. **Los packs comunitarios de motion no cambian si un video "pasa"; cambian el look.** En un benchmark de terceros del 2026-10-11, 16 skills y *Claude Code sin skill* produjeron el mismo promo y todos pasaron los 4 chequeos. Lo que varió fue el tiempo (2 a 23 min) y el estilo [V-repo: awesome-claude-video-skills]. Conviene tratarlos como **referencias de estilo para forkear**, no como dependencias.
3. **La seguridad de la cadena de suministro es un tema real.** Snyk auditó 3.984 skills: 76 tenían payload malicioso y 36,8 % alguna falla. Hubo una campaña de más de 30 skills maliciosas contra Claude Code (feb-2026) y dos CVE de Claude Code ya parcheados [V-web]. Blender MCP tiene CVE de path traversal y SSRF en 2026 [V-web]. **Política recomendada:** allowlist de orgs, pin a SHA, fork interno, revisión humana y sandbox.
4. **Los MCP que realmente suben la calidad:** Playwright MCP (graba video `.webm` con cursor animado y capítulos [V-repo]), Figma (marca), ElevenLabs (voz/SFX/música), Frame.io (comentarios de review hacia el agente, beta pública desde el 7-oct-2026 [V-web]) y **DaVinci Resolve 21.1 Studio, que trae MCP nativo** (8-sep-2026 [V-web]). **Evitar** los "FFmpeg MCP": Claude Code ya ejecuta ffmpeg directamente.
5. **Cambios de mercado 2026 con impacto directo:**
   - **Sora:** la app cerró en abr-2026 y la API se removió el 24-sep-2026 [V-web].
   - **Veo 3.1 preview en Gemini API:** shutdown anunciado para el **22-oct-2026**; el reemplazo es Gemini Omni Flash [1F, verificar urgente].
   - **Udio:** sigue como *walled garden*, sin descargas [V-web].
   - **Suno:** tiene modelos licenciados con Warner, pero los litigios con UMG y Sony siguen abiertos [V-web].
   - **Cavalry Pro:** gratis para individuos desde abr-2026 [V-web].
   - **Figma Motion:** lanzado en Config 2026 [V-web].
6. **Regulación:** el art. 50 del EU AI Act (etiquetado de deepfakes y marcado de contenido IA) aplica desde el **2-ago-2026**, y el Code of Practice es de jun-2026 [V-web]. NO FAKES Act de EE.UU.: pendiente, bloqueado en el pleno el 30-sep-2026 [V-web]. Ley ELVIS (Tennessee) vigente. **La voz clonada y los avatares necesitan consentimiento escrito y etiquetado.**
7. **Brecha de QA que nadie cubre:** ni HyperFrames ni los packs revisados chequean **fotosensibilidad (flashing)** [V-repo: grep sin resultados]. Hay que agregar EA IRIS (BSD) o un test Harding si hay broadcast.

---

## 1. Tabla maestra

Columnas: *Cat.* = número de categoría (sección 3). *Integración CC* = cómo se conecta a Claude Code. Costos en USD/mes salvo indicación.

| Herramienta | Cat. | Rol en pipeline | Integración CC | Costo 2026 aprox. | Licencia / derechos | Veredicto |
|---|---|---|---|---|---|---|
| **HyperFrames** (CLI + 21 skills) | 1·12 | Motor HTML→video; media-use, audio, captions, figma, QA | Plugin `claude plugin marketplace add heygen-com/hyperframes`; `npx skills add heygen-com/hyperframes`; CLI `npx hyperframes`; MCP hosted (beta) [V-repo] | $0 local; HeyGen cloud/TTS/BGM por créditos | Apache-2.0 [V-repo]; usa GSAP (licencia propia sin costo [NV]) | **IMPRESCINDIBLE** (motor HTML) |
| **Remotion** + `remotion-dev/skills` | 1·12 | Motor React→video + 12 skills oficiales | `npx skills add remotion-dev/skills`; plugin `remotion@remotion` [V-repo/V-web] | Gratis ≤3 personas; Creators $25/seat; Automators $0,01/render (mín. $100); Enterprise desde $500 [V-web] | Licencia propia (source-available); `@remotion/captions` MIT [V-repo npm] | **IMPRESCINDIBLE** (motor React) |
| Barty-Bart/motion-graphics | 1 | B-roll sincronizado al habla, 3 explainers, SFX pass, separación de objetos (SAM 2.1) | skill `npx skills add Barty-Bart/motion-graphics` | $0 | MIT; SFX CC0 + Mixkit bajado en runtime [V-repo] | **OPCIONAL** (forkear y revisar) |
| Otros packs (digitalsamba toolkit, OpenMontage, onetake, motion-video-kit, charlie947…) | 1 | Criterio estético, plantillas | skill/plugin | $0 | Varía | **OPCIONAL** |
| `frontend-design` (Anthropic) | 1 | Dirección de arte y tipografía para composiciones HTML | skill/plugin `anthropics/skills` | $0 | Apache-2.0 [V-repo] | **RECOMENDABLE** |
| `skills` CLI / `claude plugin` | 1 | Instalación y actualización de skills | CLI (`skills` v1.7.2, MIT [V-repo npm]) | $0 | MIT | **RECOMENDABLE** (con pinning) |
| **Playwright MCP** | 2·7 | Captura de UI, grabación `.webm` con cursor y capítulos, flujos | `claude mcp add playwright npx @playwright/mcp@latest`; video con `--caps=devtools` [V-repo] | $0 | Apache-2.0 (v0.0.83) | **IMPRESCINDIBLE** |
| Chrome DevTools MCP | 2·11 | Debug y perf de composiciones, screenshots, emulación | MCP local (`chrome-devtools-mcp` v1.11.0) | $0 | Apache-2.0 [V-repo npm] | **RECOMENDABLE** |
| Figma MCP oficial / skill `figma` de HyperFrames (REST) | 2·8 | Tokens de marca, componentes, assets | MCP remoto oficial; REST con `FIGMA_TOKEN` de solo lectura [V-repo] | Dev seat $12–35; Full $16–90 [V-web] | Propietario | **RECOMENDABLE** |
| Canva MCP | 2·8 | Brand kit, assets de marketing, importar motion de Claude | Conector oficial OAuth; tool `import-claude-motion-from-url` [V-sesión] | Plan Canva | Propietario | **OPCIONAL** |
| ElevenLabs MCP | 2·3·4 | TTS, SFX y música desde chat | Conector hosted OAuth o `uvx elevenlabs-mcp` [V-web] | Consume créditos del plan | Propietario | **RECOMENDABLE** (exploración) |
| Higgsfield MCP | 2·6 | Agregador de video, imagen, audio y voz (Veo, Kling, Seedance…) | MCP remoto `mcp.higgsfield.ai` [V-web/V-sesión] | $9–129 + créditos que vencen [V-web, conflictivo] | Comercial solo en planes pagos [1F] | **RECOMENDABLE** (ideación/b-roll) |
| Google Drive MCP | 2·10 | Recepción y entrega de assets | Conector oficial [V-sesión] | Workspace | — | **RECOMENDABLE** (orgs Google) |
| Frame.io MCP | 2·10 | Pasar comentarios de review al agente | MCP remoto, OAuth Adobe IMS, solo V4; beta pública desde el 7-oct-2026 [V-web] | Incluido en plan [NV] | Propietario | **RECOMENDABLE** |
| DaVinci Resolve MCP (oficial) | 2·9 | Automatizar conform, render queue y entrega | Nativo en Resolve **Studio** 21.1 (File → Setup AI Assistants) [V-web] | $295 pago único | Propietario | **RECOMENDABLE** |
| After Effects / Premiere MCP (comunidad) | 2·8·9 | ExtendScript/UXP manejado por el agente | MCP local vía puente CEP [V-web] | $0 + CC | Varía | **OPCIONAL** (sandbox) |
| FFmpeg MCP servers | 2·11 | Wrappers de ffmpeg | MCP local | $0 | Varía | **EVITAR** |
| Blender MCP (ahujasid) | 2·8 | 3D manejado por el agente | MCP local + addon | $0 | Open source; CVE 2026 [V-web] | **OPCIONAL** solo en VM aislada |
| **ElevenLabs** (TTS/clonación) | 3 | VO final multilingüe, clonación profesional | API; skill Remotion `voiceover.md`; voz narradora de los docs de HyperFrames [V-repo] | Starter $6 · Creator $22 · Pro $99 · Scale $299 · Business $990 [V-web] | Comercial desde Starter [V-web] | **IMPRESCINDIBLE** |
| HeyGen TTS (Starfish) + avatares | 3 | VO con word timestamps en una llamada; avatar | `media-use` (heygen CLI ≥0.3.0, OAuth) [V-repo] | Web Creator $29; API pay-as-you-go [V-web]; OAuth ≈10 min/mes gratis [V-repo] | Propietario; derechos [NV] | **RECOMENDABLE** |
| Gemini TTS | 3 | VO dirigida | `media-use --provider gemini` [V-repo] | Por tokens [NV] | Términos de Gemini API | **OPCIONAL** |
| OpenAI gpt-4o-mini-tts | 3 | VO barata y dirigible, sin clonación | API | ≈$0,015/min [V-web, estimación] | Política de divulgación de voz IA [NV] | **OPCIONAL** |
| Cartesia Sonic 3.x | 3 | TTS de latencia baja y clonación | API | Pro $5 · Startup $49 · Scale $299 [V-web] | Comercial desde Pro | **OPCIONAL** |
| Kokoro-82M (local) | 3 | VO temporal para animatic, offline | `npx hyperframes tts` [V-repo] | $0 | Apache-2.0 (`kokoro-js` [V-repo npm]; pesos [NV]) | **RECOMENDABLE** (borradores) |
| ElevenLabs Music | 4 | Música generada con entrenamiento licenciado | API/MCP | Pool de créditos (≈900 cr/min [1F]) | Comercial; el self-serve excluiría cine/TV/juegos [1F] | **RECOMENDABLE** |
| Google Lyria 3.5 / RealTime | 4 | Música generada | Gemini API; fallback local de `media-use` [V-repo] | $0,08/canción [V-web] | SynthID; términos comerciales a verificar | **OPCIONAL** |
| Suno v6 | 4 | Canciones IA | Sin API oficial [NV] | Pro $8 / Premier $24 [1F] | Litigios UMG/Sony abiertos; topes de descarga [V-web] | **EVITAR** (enterprise) |
| Udio | 4 | — | — | — | Walled garden, sin descargas [V-web] | **EVITAR** |
| Epidemic Sound | 4 | Librería de música y SFX, manejo de Content ID | Descarga | Creator ≈$15–18 · Pro ≈$40 · Business $30–75 · Enterprise [V-web, conflictivo] | Suscripción; preclearance de Content ID [1F] | **RECOMENDABLE** |
| Artlist | 4 | Música, SFX y footage | Descarga | Music&SFX Pro ≈$25 anual; Enterprise (50+ empleados) [V-web] | Licencia por suscripción [NV detalle] | **RECOMENDABLE** (alternativa) |
| Musicbed | 4 | Música cinematográfica premium | Descarga | Individual $30–110 · Business $100–220 [V-web] | Por plan | **OPCIONAL** (hero spots) |
| Sonniss GDC bundles | 4 | SFX profesionales gratis | Archivos | $0 | Comercial, sin atribución [V-web] | **RECOMENDABLE** |
| Openverse / Freesound (CC0/CC BY) | 4 | SFX bajo demanda | `media-use resolve --type sfx` [V-repo] | $0 | CC0/CC BY con crédito | **RECOMENDABLE** |
| Mixkit | 4 | SFX y música free | Descarga en runtime (Barty-Bart) [V-repo] | $0 | Prohíbe redistribuir y registrar en Content ID [V-repo] | **OPCIONAL** |
| BOOM Library | 4 | SFX premium | Archivos | Perpetuo, caro [V-web] | Royalty-free perpetuo | **OPCIONAL** (enterprise) |
| whisper.cpp | 5 | ASR local | `npx hyperframes transcribe` [V-repo] | $0 | MIT [NV] | **RECOMENDABLE** |
| Parakeet (NVIDIA) | 5 | ASR local rápido con timestamps nativos | `npx hyperframes models install parakeet` [V-repo] | $0 | CC-BY-4.0 [NV] | **RECOMENDABLE** (EN/EU) |
| WhisperX | 5 | Forced alignment contra guion conocido (karaoke) | CLI Python | $0 (GPU) | BSD-2 [NV] | **RECOMENDABLE** |
| `@remotion/whisper-webgpu` | 5 | ASR local dentro de Remotion | skill `remotion-captions` [V-repo] | $0 | MIT [V-repo npm] | **RECOMENDABLE** (Remotion) |
| ElevenLabs Scribe v2 + Forced Alignment | 5 | ASR y alineación en la nube | API | $0,22/h [V-web] | Propietario | **RECOMENDABLE** |
| AssemblyAI | 5 | ASR enterprise, diarización | API | $0,15–0,21/h [V-web] | Propietario | **OPCIONAL** |
| Deepgram Nova-3 | 5 | ASR streaming y batch | API | $0,26–0,46/h [V-web, conflictivo] | Propietario | **OPCIONAL** |
| Groq Whisper turbo | 5 | ASR barato | API; HyperFrames importa su JSON [V-repo] | $0,04/h [V-web] | — | **OPCIONAL** |
| Veo 3.1 / Gemini Omni Flash | 6 | B-roll realista con audio | Gemini API / Vertex; Higgsfield | Veo $0,05–0,60/s; Omni ≈$0,10/s [V-web] | SynthID; términos de Google | **RECOMENDABLE** (vía Vertex) |
| Kling 3.0 | 6 | B-roll con buena relación costo/calidad | API; Higgsfield | ≈$0,08–0,17/s [V-web] | Comercial en planes pagos; el riesgo de infracción recae en el usuario [1F] | **RECOMENDABLE** (revisar residencia de datos) |
| Runway Gen-4.5 / Aleph 2.0 | 6 | Generación y edición de footage existente | API/web | $12–76; Aleph ≈$0,28/s [V-web] | Enterprise con SOC2 [NV] | **RECOMENDABLE** (edición) |
| Sora 2 | 6 | — | — | — | App cerrada abr-2026; API removida el 24-sep-2026 [V-web] | **EVITAR** |
| Luma Ray3.2 | 6 | B-roll con salida HDR/EXR | API | $30–300; API $0,30–3,60/clip [V-web] | [NV] | **OPCIONAL** |
| Midjourney V8 | 6 | Style frames, moodboards | Sin API pública [1F] | [NV] | ToS propio | **OPCIONAL** |
| Nano Banana Pro (Gemini 3 Pro Image) | 6 | Imágenes, edición, texto dentro de la imagen | API; Higgsfield | ≈$0,134/img (≤2K), $0,24 (4K) [V-web] | SynthID | **RECOMENDABLE** |
| FLUX.2 (BFL) | 6 | Imagen fotorrealista | API BFL/fal/Replicate; mflux local [V-repo] | $0,014–0,07/img [V-web] | Pro/Flex/Max comerciales vía API; **dev no comercial**; Klein 4B Apache [V-web] | **RECOMENDABLE** (API) |
| Adobe Firefly | 6·8 | Gen IA "commercially safe" | Apps CC | $10–200 [V-web, conflictivo] | Indemnización enterprise [NV] | **RECOMENDABLE** (shops Adobe) |
| HyperFrames `capture` | 7 | Sitio web → componentes editables | CLI [V-repo] | $0 | Apache-2.0 | **IMPRESCINDIBLE** (HTML) |
| Screen Studio | 7 | Grabación pulida en macOS | Archivo | ≈$9 anual / $20–29 mensual [V-web] | Propietario | **RECOMENDABLE** (Mac) |
| Cap | 7 | Grabación open source, cross-platform | Archivo | $0 local; Pro ≈$8–12/user [V-web] | Open source [licencia NV] | **RECOMENDABLE** |
| Tella | 7 | Presentador + pantalla, hosting | Archivo | $13–19 [V-web] | — | **OPCIONAL** |
| OBS Studio | 7 | Captura raw de alta calidad | Archivo; obs-websocket [NV] | $0 | GPL-2.0 [NV] | **RECOMENDABLE** |
| Rotato | 7 | Mockups 3D de dispositivos | Archivo | $49–199 [V-web, conflictivo] | — | **OPCIONAL** |
| After Effects | 8 | Animación tradicional, Lottie (Bodymovin) | MCP comunitario / ExtendScript | Plan CC [NV] | — | **OPCIONAL** (equipos híbridos) |
| Cavalry | 8 | Motion procedural 2D | Archivos (ProRes/PNG) | **Gratis para individuos** desde abr-2026; Enterprise vía Canva [V-web] | Comercial permitido | **RECOMENDABLE** |
| Figma Motion | 8 | Timeline nativo en Figma; exporta CSS/JSON/React/MP4 | Vía Figma (MCP/Dev Mode) [NV] | Incluido en seats [NV] | — | **RECOMENDABLE** (seguir de cerca) |
| Jitter | 8 | Motion UI rápido desde Figma | Archivos | [NV] | — | **OPCIONAL** |
| Rive | 8 | Animación interactiva con state machines | Runtime | $0 / $9 / $32 seat [V-web] | — | **OPCIONAL** |
| LottieFiles | 8 | Librería y hosting de Lottie | Archivos; HyperFrames soporta Lottie [V-web] | $0–25/seat [V-web] | Lottie Simple License (contenido público) | **OPCIONAL** |
| Spline | 8 | Escenas 3D web | Export de video (Pro) | $12–60/seat [V-web] | — | **OPCIONAL** |
| Blender 5.2 LTS | 8 | Planos 3D hero, pases EXR | Python; MCP | $0 | GPL | **RECOMENDABLE** |
| Claude Design → HyperFrames | 8 | Primer borrador visual exportado como proyecto HyperFrames | Handoff documentado (ZIP o "Send to") [V-repo] | Plan Claude [NV] | — | **RECOMENDABLE** |
| **DaVinci Resolve 21.1** | 9 | Finishing, color, Fairlight, entrega | MCP (Studio); el scripting Python pasó a Studio [V-web] | Free / Studio $295 único [V-web] | — | **IMPRESCINDIBLE** |
| Premiere Pro | 9 | NLE Adobe + Frame.io nativo | MCP comunitario | ≈$23–35 [V-web] | — | **RECOMENDABLE** (si ya usan Adobe) |
| Final Cut Pro 12.3 | 9 | NLE Mac | — | $299,99 o Creator Studio $12,99/mes [1F] | — | **OPCIONAL** |
| CapCut | 9 | — | — | — | ToS con licencia irrevocable y sublicenciable [V-web] | **EVITAR** |
| Descript | 9 | Edición por texto de talking-heads | — | $16–50 [V-web] | — | **OPCIONAL** |
| **Frame.io V4** | 10 | Review, aprobación, C2C | MCP beta; integración con NLE | Free · Pro $15 · Team $25/seat · Enterprise [V-web] | — | **IMPRESCINDIBLE** (enterprise) |
| Vimeo Review | 10 | — | — | — | Bending Spoons; despidos en ene-2026 [V-web] | **EVITAR** (para compromisos nuevos) |
| Dropbox Replay | 10 | Review simple | — | Add-on $10–12/user [V-web] | — | **OPCIONAL** |
| Air | 10 | DAM + review | — | $0 / $25 / $900 [V-web] | Créditos que no se acumulan | **OPCIONAL** |
| **ffmpeg/ffprobe QC** | 11 | Specs, loudness, negro/congelado/silencio, escenas, contact sheets | Bash directo | $0 | LGPL/GPL | **IMPRESCINDIBLE** |
| HyperFrames `check` / `lint` / `snapshot` | 11 | Overflow de layout, contraste WCAG AA, muestras | CLI [V-repo] | $0 | Apache-2.0 | **IMPRESCINDIBLE** (HTML) |
| EA IRIS | 11 | Detección de flashing y patrones (fotosensibilidad) | CLI/lib C++ | $0 | BSD-3 [V-repo]; último commit ene-2025 | **RECOMENDABLE** |
| PEAT / Harding FPA | 11 | Validación de flashing / certificación broadcast | GUI Windows / servicio comercial | $0 / licencia [NV] | — | Harding: **IMPRESCINDIBLE solo para broadcast UK** [NV] |
| PySceneDetect · VMAF · MediaConch | 11 | Cortes, calidad de encode, políticas de spec | CLI | $0 | Open source [NV] | **RECOMENDABLE** |
| Crítica multimodal (Claude vision, Gemini video) | 11 | Revisión de frames, contact sheets y video completo | Nativo / API | Tokens | — | **RECOMENDABLE** (nunca como único gate) |
| HyperFrames Lambda / Cloud Run | 12 | Render distribuido en la cuenta propia | `hyperframes lambda`, CDK construct [V-repo] | Centavos por render (ej.: $0,0214 por 480 frames) [V-repo] | Apache-2.0 | **RECOMENDABLE** |
| HyperFrames `--docker` | 12 | Render reproducible con Chrome, FFmpeg y fuentes fijos | CLI [V-repo] | Infra propia | Apache-2.0 | **RECOMENDABLE** (CI) |
| HeyGen cloud render | 12 | Render gestionado | `hyperframes cloud render` [V-repo] | Créditos HeyGen [NV]; 4K = 1,5× [V-repo] | — | **OPCIONAL** |
| Remotion Lambda / Cloud Run | 12 | Render distribuido | `@remotion/lambda`, `@remotion/cloudrun` v4.0.536 [V-repo npm] | AWS + licencia Automators | Licencia Remotion | **RECOMENDABLE** (si usan Remotion) |
| GitHub Actions | 12 | CI: lint, check y render de previews | Workflow | Por minuto [NV] | — | **RECOMENDABLE** |

---

## 2. Mapa del pipeline (dónde entra cada cosa)

```
BRIEF ─► DISEÑO/MARCA ─────────► GUION ─► VOZ ─────────► TIMING ─────────► ASSETS ──────────────► COMPOSICIÓN ─────► MEZCLA ─────► RENDER ─────► QA ──────────► FINISHING ──► REVIEW ──► ENTREGA
         Figma MCP / skill figma          ElevenLabs     TTS word-ts       media-use resolve       HyperFrames         hyperframes-   local/--docker  ffprobe/ebur128 Resolve 21.1  Frame.io   Drive/
         Claude Design → ZIP              HeyGen TTS     (HeyGen) o        (logo/icon/img/sfx/bgm) o Remotion          audio (carve,  Lambda/CloudRun blackdetect...  (MCP Studio)  (MCP beta) DAM
         Canva MCP (brand kit)            Kokoro (temp)  WhisperX/Parakeet Playwright MCP capture   + skills oficiales  ducking, LUFS) HeyGen cloud    IRIS flashing   Premiere/AE
         frontend-design (art dir.)                      Scribe align      HyperFrames capture      + frontend-design                                  check/contrast  ProRes 4444
                                                                           Gen-IA b-roll (Veo/Kling)                                                   crítica multimodal
                                                                           Nano Banana / FLUX
```

**Principio rector:** todo lo que tenga texto, UI, datos, logos o timing exacto se hace **como código**: HTML/React, editable y diffeable. La IA generativa queda para **textura y mundo**: atmósferas, b-roll orgánico, fondos abstractos, personas y lugares genéricos. Ver §4.

---

## 3. Detalle por categoría

### Categoría 1 — Skills y plugins de Claude Code para video y motion

**HyperFrames (heygen-com/hyperframes)** · v0.8.174 publicada el 2026-10-19 [V-repo npm] · Apache-2.0 [V-repo]
- **Qué resuelve:** composiciones HTML con timeline GSAP pausado. Chrome headless avanza frame a frame y FFmpeg codifica. Salidas: MP4, MOV (ProRes 4444 fijo, con alfa), WebM VP9 con alfa, PNG sequence, GIF y HLS [V-repo `docs/guides/rendering.mdx`].
- **Skills incluidas (21):** `hyperframes`, `-core`, `-animation`, `-creative`, `-keyframes`, `-audio`, `-cli`, `-registry`, `-studio`, `media-use`, `embedded-captions`, `figma`, `motion-graphics`, `product-launch-video`, `pr-to-video`, `faceless-explainer`, `music-to-video`, `slideshow`, `talking-head-recut`, `general-video` y `remotion-to-hyperframes` [V-repo].
- **`media-use`, el "Media OS" del motor:** `resolve --type bgm|sfx|image|icon|logo|voice|grade|lut` deja cada archivo congelado en local y registrado en un *ledger* [V-repo]. Los proveedores:
  - **bgm, image, icon, voice:** catálogo HeyGen vía `heygen` CLI ≥0.3.0, con OAuth gratis hasta un tope.
  - **sfx:** Openverse (solo CC0/CC BY) y, offline, una librería de 21 archivos incluida.
  - **logo:** theSVG → avatar de GitHub → favicon. Nunca se redibuja.
  - **Locales opcionales:** Kokoro (voz), mflux/FLUX (imagen), Parakeet o whisper.cpp (ASR), LTX (video).
  - **Música:** Lyria RealTime → MusicGen.
  - **TTS:** HeyGen Starfish (devuelve word timestamps) → ElevenLabs → Kokoro. Gemini TTS solo si se elige explícitamente [V-repo `setup-providers.md`, `tts.md`, `bgm.md`].
- **`hyperframes-audio`:** cadena de efectos Web Audio idéntica en preview y render (EQ, compresor, limiter, true-peak, gate, reverb…), automatización y **voiceover carve**, que hace ducking por bandas en vez de bajar el volumen general [V-repo].
- **QA incluido:**
  - `hyperframes check`: muestras a lo largo de la duración, overflow de layout y contraste WCAG AA.
  - `lint`, `snapshot`, `inspect`, `compare`, `normalize-audio` (default −16 LUFS [V-repo `loudness.ts`]).
  - `capture`: sitio web → componentes editables [V-repo].
- **Integración:**
  - Plugin: `claude plugin marketplace add heygen-com/hyperframes` + `claude plugin install hyperframes@hyperframes`.
  - Skill: `npx skills add heygen-com/hyperframes`. Si corre sin `--skill`, instala las 21; conviene usar el *core set* con `npx hyperframes skills update` [V-repo README].
  - MCP hosted (beta) en `https://mcp.heygen.com/mcp/hyperframes/`, para usuarios no técnicos [V-repo `docs/guides/mcp.mdx`].
  - WebMCP dentro de Studio [V-repo].
- **Para tener en cuenta en enterprise:**
  1. Es una versión pre-1.0 con cadencia de release casi diaria: **pinear la versión** y actualizar a propósito.
  2. Telemetría anónima activada por defecto: apagarla con `HYPERFRAMES_NO_TELEMETRY=1`, `DO_NOT_TRACK=1` o `hyperframes telemetry disable` [V-repo].
  3. La música del catálogo HeyGen (bgm) depende de una cuenta HeyGen, y **sus términos de licencia para uso comercial no los verifiqué** [NV].
  4. La regla de "una sola voz" de los docs usa ElevenLabs "River", lo que muestra que el propio equipo de HeyGen prefiere ElevenLabs para narración [V-repo].
- **Veredicto: IMPRESCINDIBLE** si el motor es HTML. Es el kit más completo y con mejor licencia (Apache, sin seats).

**Remotion + remotion-dev/skills** · remotion v4.0.536 [V-repo npm]
- **Skills (12):** `remotion-best-practices` (router), `-create`, `-markup`, `-studio`, `-render`, `-captions`, `-maps`, `-multimedia` (Mediabunny), `-interactivity`, `-saas`, `-docs` y `-upgrade` [V-repo clone].
- **Defaults de las skills:** para TTS, ElevenLabs (`ELEVENLABS_API_KEY`). Para transcripción, `@remotion/whisper-webgpu`, Whisper local en GPU (MIT) [V-repo].
- **Instalación:**
  - `npx skills add remotion-dev/skills`.
  - Plugin: `claude plugin marketplace add remotion-dev/claude-code-plugin` + `claude plugin install remotion@remotion` [V-web].
- **Licencia:** gratis para individuos y organizaciones de hasta 3 personas. Por encima de eso:
  - Creators $25/seat/mes.
  - Automators $0,01/render con mínimo de $100/mes.
  - Enterprise desde $500/mes [V-web, términos v5.0].
- **Veredicto: IMPRESCINDIBLE** si el equipo ya trabaja en React o necesita el ecosistema más maduro (más plantillas, más tutoriales, Player embebible). Para un equipo enterprise, hay que **presupuestar la licencia**.

**Barty-Bart/motion-graphics** · MIT · último commit 2026-10-13 [V-repo clone]
- **Skills:** `motion-broll` (B-roll sincronizado con el transcript), `object-separation` (SAM 2.1 local), `explainer-high-energy|default|engaging` y `sound-effects`. Esta última hace grilla de beat, una SFX por cue, mezcla a −16 LUFS y **verifica la licencia de cada sonido**.
- **Lo que encontré al revisarlo:**
  - **No usa HyperFrames ni Remotion:** trae su propio renderer con Playwright + Chromium + ffmpeg (`engine/render.js`).
  - `setup.sh` hace `pip install --user`, y si eso falla, cae a **`--break-system-packages`**.
  - `object-separation` instala torch y transformers y baja pesos de SAM.
  - `sound-effects` descarga audio de Mixkit con `curl` en runtime (la licencia de Mixkit prohíbe redistribuirlo).
  - El README promociona una comunidad paga en Skool.
- **En el benchmark de terceros** quedó 5.º en tiempo (4,7 min) con "un look propio" [V-repo awesome-list].
- **Veredicto: OPCIONAL.** Sirve como **referencia de oficio**; lo más valioso es la disciplina de licencias y loudness de `sound-effects`. Forkear, quitar el fallback `--break-system-packages` y correrlo en venv o contenedor.

**Otros packs comunitarios.** La lista `awesome-claude-video-skills` (315 repos, "security-graded" por un modelo, actualizada el 2026-10-18) [V-repo] incluye: OpenMontage (≈69k★), hypit, digitalsamba/claude-code-video-toolkit, onetake, motion-video-kit, motionmaxxing, charlie947/motion-graphics-skills, howseen-ai/claude-motion-design y varios packs "HyperFrames motion reel".
- **Lectura crítica:** el dato más útil de esa lista es que **Claude Code sin skill también pasó los 4 chequeos** del benchmark. Los packs aportan *estilo* y *velocidad*, no corrección. Las estrellas y el "SAFE" son señales débiles: el grading lo hace un LLM leyendo el README, no un auditor.
- **Veredicto: OPCIONAL.** Elegir 1 o 2 como *moodboard de código*, forkear internamente y nunca instalarlos con auto-update.

**frontend-design (Anthropic)** · Apache-2.0 [V-repo clone]. Orienta paleta, tipografía y layout "no templated". Es barato y mejora los títulos y las placas. Hay que combinarlo con los tokens de marca que vienen de Figma, porque si no, "toma riesgos estéticos" fuera de marca. **RECOMENDABLE.**

**Captions.** `embedded-captions` (HyperFrames) y `remotion-captions` (Remotion, con `createTikTokStyleCaptions` de `@remotion/captions`, MIT) vienen incluidos. No hace falta un pack aparte. **RECOMENDABLE** (incluidos).

**Instalación y riesgo de supply chain** (ver §5 para la política completa):
- `npx skills add <owner/repo>` (CLI `skills`, MIT, v1.7.2) copia carpetas a `.claude/skills/`. `claude plugin marketplace add` registra un marketplace git, y sus actualizaciones pueden ser automáticas si se habilitan.
- **Evidencia 2026:**
  - Snyk ToxicSkills: 3.984 skills de ClawHub/skills.sh, **76 con payload malicioso**, 36,8 % con alguna falla y 13,4 % críticas.
  - Campaña de más de 30 skills maliciosas contra Claude Code/OpenClaw (feb-2026).
  - Inyección con caracteres Unicode Tag: Claude Code la detecta desde el release del 10-feb-2026.
  - CVE-2025-59536 y CVE-2026-21852 en Claude Code, parcheados [V-web].

### Categoría 2 — MCP servers

| MCP | Qué aporta al video | Observaciones críticas | Veredicto |
|---|---|---|---|
| **Playwright MCP** (`@playwright/mcp` 0.0.83, Apache) | `browser_start_video`: graba **webm** a fps configurable y con **cursor animado**, que pausa 800 ms por acción. `browser_video_chapter` agrega placas de capítulo. `browser_video_show_actions` agrega callouts. También screenshots y traces [V-repo README npm] | Las tools de video requieren `--caps=devtools`. El cursor sintético sirve para demos de producto; para hero shots, mejor reconstruir la UI en HTML (§7) | **IMPRESCINDIBLE** |
| **Chrome DevTools MCP** (v1.11.0, Apache) | Performance traces, consola, red, screenshots y emulación | Ideal para debuggear por qué una composición tira frames o no carga fuentes. Sin grabación de video [V-web] | **RECOMENDABLE** |
| **Figma** | Tokens, variables, componentes y assets | El MCP oficial requiere seat Dev o Full para uso real; las fuentes no coinciden en los límites para seats Collab o Starter [V-web, conflictivo]. **Alternativa sin MCP:** la skill `figma` de HyperFrames usa REST con un token de solo lectura (`File content` + `File metadata` + `Library content`); `Variables` es solo Enterprise [V-repo]. La comunitaria `figma-developer-mcp` (Framelink, MIT, v0.13.2) [V-repo npm] | **RECOMENDABLE** |
| **Canva** | Brand kits, diseños, export, remove-background, `import-claude-motion-from-url` [V-sesión] | Útil si marketing vive en Canva. No reemplaza a Figma para tokens de producto | **OPCIONAL** |
| **ElevenLabs** | TTS, SFX, música y clonación desde el chat | Hosted con OAuth o self-hosted `uvx elevenlabs-mcp`. **En producción, usar scripts de API versionados**: dejan seed y parámetros reproducibles y logueados, cosa que una llamada desde chat no garantiza | **RECOMENDABLE** |
| **Higgsfield** | Un login para Veo 3.1, Kling 3.0, Seedance 2.0, Wan, Hailuo y modelos propios. En esta sesión expone `generate_video/image/audio`, `create_voice`, `dubbing`, `upscale_video`, `reframe`, `remove_background`, `video_analysis_create`, `virality_predictor` y `generate_3d` [V-sesión] | Créditos que **vencen** y "unlimited" por ventanas de 7 días [V-web]. Agrega un intermediario: en enterprise, revisar términos de datos y licencia frente a ir directo a Vertex | **RECOMENDABLE** (ideación) |
| **Google Drive** | Buscar, leer y crear archivos [V-sesión] | Recepción de briefs y assets, y entrega | **RECOMENDABLE** |
| **Frame.io** | Comentarios con timecode → el agente aplica fixes en la composición | Beta pública desde el 7-oct-2026, OAuth Adobe IMS, **sin cuentas Legacy**; hay reportes de 403 [V-web] | **RECOMENDABLE** |
| **DaVinci Resolve 21.1 (oficial)** | El agente maneja Resolve: proyectos, timeline, render queue | Solo **Studio**. Requiere `External scripting = Local`. El scripting Python también pasó a Studio [V-web] | **RECOMENDABLE** |
| AE / Premiere (comunidad) | `ae_run_script` ejecuta ExtendScript arbitrario; el puente CEP de Premiere dice tener 434 tools [V-web] | No hay MCP oficial de Adobe [V-web]. Ejecución arbitraria: solo en máquinas de edición aisladas | **OPCIONAL** |
| FFmpeg MCP (varios) | Wrappers de trim, concat y subtítulos | Claude Code ya ejecuta `ffmpeg`/`ffprobe` por Bash con permisos. Suma superficie de ataque sin aportar capacidad; muchos repos tienen poco mantenimiento [V-web] | **EVITAR** |
| Blender MCP | Escenas 3D por agente | `execute_blender_code` ejecuta Python arbitrario. CVE 2026 de path traversal (Poly Haven) y SSRF (`zip_file_url`). Telemetría con opt-out [V-web] | **OPCIONAL**, solo en VM aislada |

### Categoría 3 — Voz/TTS, clonación y consentimiento

- **ElevenLabs.** Calidad de referencia, multilingüe y clonación profesional desde Creator.
  - Planes: Free (sin uso comercial) · Starter $6 · Creator $22 · Pro $99 (PCM 44,1 kHz por API) · Scale $299 (3 seats) · Business $990 (10 seats) [V-web].
  - Es el default de las skills de Remotion y la voz canónica de los docs de HyperFrames [V-repo].
  - **IMPRESCINDIBLE.** Para un equipo, Pro o Scale.
- **HeyGen TTS (Starfish).** Su ventaja técnica concreta: devuelve **`word_timestamps[]` en la misma llamada**, lo que evita la pasada de ASR [V-repo `tts.md`]. Además trae avatares y voice clone (`heygen-voice.mjs`).
  - El API pasó a pay-as-you-go en 2026 y se eliminaron los créditos API gratis en feb-2026 [V-web].
  - **RECOMENDABLE**, sobre todo si se usan avatares.
- **Gemini TTS.** Soportado explícitamente por `media-use`, con voces prebuilt o custom y "directed delivery" [V-repo]. **OPCIONAL.**
- **OpenAI gpt-4o-mini-tts.** Barato (≈$0,015/min según estimación de terceros) y dirigible por instrucciones, pero sin clonación [V-web]. **OPCIONAL.**
- **Cartesia Sonic 3/3.5/3.6.** Optimizado para latencia (agentes de voz), irrelevante para render offline. Barato: Pro $5 [V-web]. **OPCIONAL.**
- **Kokoro-82M local.** Para animatics y para iterar el timing sin gastar. **No usarlo en la entrega final** si la marca tiene voz definida: los docs de HyperFrames cuentan que tuvieron que re-vocear 3 videos por eso [V-repo]. **RECOMENDABLE** (borradores).

**Consentimiento y derechos de voz:**
- **Marco legal vigente o en curso:**
  1. Ley **ELVIS** (Tennessee, vigente desde jul-2024): prohíbe réplicas digitales de voz sin consentimiento.
  2. **California** AB 2602 y AB 1836 (vigentes desde ene-2025), Illinois y Nueva York tienen leyes de réplica digital.
  3. **NO FAKES Act** (S. 4591 / H.R. 8915): avanzó en el Comité Judicial del Senado el 18-jun-2026, pero su paso al pleno quedó bloqueado el 30-sep-2026 [V-web].
  4. **EU AI Act art. 50**, desde el 2-ago-2026: el deployer debe **etiquetar deepfakes** (en obras artísticas o de ficción, de manera que no arruine la obra) y no puede delegar la obligación al watermark del proveedor [V-web].
- **Política mínima recomendada:**
  1. Release escrito del talento: alcance, territorios, plazo, revocación y compensación.
  2. Nada de clonar ejecutivos ni empleados sin ese documento.
  3. Usar la verificación de voz del proveedor.
  4. Registrar en el ledger qué voz, qué modelo y qué consentimiento se usó en cada pieza.
  5. Disclosure "voz generada con IA" cuando aplique.

### Categoría 4 — Música y SFX

**Generativa:**
- **ElevenLabs Music:** entrenamiento con licencias de Merlin y Kobalt, y uso comercial en planes pagos [V-web]. **Ojo:** una fuente dice que el self-serve **excluye cine, TV y juegos**, que requieren Enterprise [1F]. Hay que verificarlo en `elevenlabs.io/music-terms` antes de piezas broadcast. **RECOMENDABLE.**
- **Lyria 3.5** (Gemini API, desde el 4-sep-2026): $0,08 por canción, con SynthID. Los términos comerciales no son explícitos en la página del modelo [V-web]. `media-use` lo usa como fallback local de BGM (Lyria RealTime) [V-repo]. **OPCIONAL** hasta que legal lo valide.
- **Suno:** acuerdo con Warner (nov-2025), modelos v6, v6-wild y v6-mini (sep-2026), sin descargas en el plan free y con topes en los pagos. Siguen activos los juicios de UMG y Sony [V-web]. **EVITAR** en enterprise por riesgo de titularidad y de Content ID.
- **Udio:** acuerdo con UMG; la plataforma es *walled garden* sin exportar audio. A la fecha no confirmé que el servicio nuevo esté en vivo [V-web]. **EVITAR.**

**Librerías licenciadas:**
- **Epidemic Sound:** es la más citada por su manejo de Content ID; tiene plan Pro y Business para trabajo con clientes y ads. Los precios no coinciden entre fuentes [V-web]. **RECOMENDABLE.**
- **Artlist:** música, SFX y footage; licencia Enterprise para empresas de más de 50 empleados y agencias; "Clearlist" para limpiar reclamos [V-web]. **RECOMENDABLE** como alternativa; conviene elegir una sola de las dos.
- **Musicbed:** catálogo cinematográfico premium; no confirmé cómo maneja Content ID [V-web]. **OPCIONAL**, para hero spots.

**SFX:**
- **Sonniss GDC 2026:** 7,47 GB y 347 WAV, comercial sin atribución, más el archivo de más de 200 GB de años anteriores [V-web]. **RECOMENDABLE.**
- **Openverse/Freesound** (filtrar CC0; si es CC BY, va con crédito) vía `media-use`, que genera `CREDITS.md` [V-repo]. **RECOMENDABLE.**
- **Mixkit:** permite usarlo en videos, pero **prohíbe redistribuirlo** y **registrarlo en Content ID** [V-repo, licencia citada por Barty-Bart]. **OPCIONAL.**
- **BOOM Library:** perpetua y premium. **OPCIONAL.**
- **ElevenLabs SFX:** para UI sounds a medida. **RECOMENDABLE.**
- Soundly: no lo verifiqué [NV].

**Content ID:** nunca subir a YouTube con música IA "registrable" por terceros. Para cada pieza, guardar la licencia o el recibo de la pista y el ID de la cuenta.

### Categoría 5 — Transcripción, captions y forced alignment

**Regla de oro:** en motion de producto, el guion **ya se conoce** porque lo escribimos para el TTS. Entonces:
- **No transcribir: alinear.**
- Si el TTS ya da timestamps (HeyGen), no hace falta ningún ASR.

**Opciones locales:**
- **whisper.cpp** vía `npx hyperframes transcribe`. **Trampa documentada:** los modelos `.en` *traducen* el audio que no está en inglés. Siempre pasar `--model small --language es` para español [V-repo `transcribe.md`]. La precisión por palabra es la más débil de las tres [V-web]. **RECOMENDABLE** como default local.
- **Parakeet TDT** (NVIDIA): timestamps nativos por palabra y muy rápido, pero solo cubre 25 idiomas europeos [V-web]. **RECOMENDABLE** para EN/EU.
- **WhisperX** (wav2vec2): la mejor opción documentada para **forced alignment de un texto conocido**; karaoke con precisión menor a 100 ms según guías [V-web]. **RECOMENDABLE.**
- **`@remotion/whisper-webgpu`:** es el camino actual de la skill oficial de Remotion; `convertToCaptions()` está deprecado [V-repo/V-web]. **RECOMENDABLE** (Remotion).

**Opciones cloud:**
- **ElevenLabs Scribe v2** a $0,22/h; Forced Alignment al mismo precio según un PR que cita la documentación [1F]. **RECOMENDABLE.**
- **AssemblyAI** $0,15–0,21/h y **Deepgram Nova-3** $0,26–0,46/h [V-web]. **OPCIONALES**: valen la pena por compliance o diarización, no por calidad de captions.
- **Groq Whisper turbo** $0,04/h, y HyperFrames importa su JSON [V-repo/V-web]. **OPCIONAL.**
- **OpenAI `gpt-4o-transcribe`:** una fuente lo marca "Deprecating 2026-10-15" [1F]. **No construir pipelines nuevos sobre él.**

**QA de captions:** HyperFrames marca como sospechosas las palabras con `end - start < 0.05` s [V-repo]. Hay que revisar a ojo los nombres propios y la jerga técnica.

### Categoría 6 — Generación de video e imagen IA (b-roll y texturas)

**Estado y precios a oct-2026:**

| Modelo | Precio (API) | Estado / notas | Veredicto |
|---|---|---|---|
| Veo 3.1 (Lite / Fast / Std) | $0,05–0,08 / $0,10–0,30 / $0,40–0,60 por s, con audio [V-web] | **Preview en Gemini API: shutdown anunciado para el 22-oct-2026** [1F]. En enterprise, usar **Vertex AI** | **RECOMENDABLE** |
| Gemini Omni Flash | ≈$0,10/s (720p) [V-web] | GA 27-ago-2026 [1F]; genera y edita video | **RECOMENDABLE** (evaluar) |
| Kling 3.0 | ≈$0,08–0,17/s según resolución y audio [V-web] | Uso comercial en planes pagos; el riesgo de infracción queda en el usuario [1F]. Proveedor chino: revisar residencia de datos | **RECOMENDABLE** |
| Runway Gen-4.5 / Aleph 2.0 | 12 cr/s; Aleph ≈$0,28/s [V-web] | Aleph **edita footage existente** (relight, cambio de ángulo). Enterprise con SSO y SOC2 [NV] | **RECOMENDABLE** (edición) |
| Sora 2 | — | **Discontinuado**: app cerrada el 26-abr-2026 y API removida el 24-sep-2026 [V-web] | **EVITAR** |
| Luma Ray3.2 | $0,30–3,60 por clip [V-web] | HDR y **EXR**, útiles para compositing | **OPCIONAL** |
| Midjourney V8 | [NV] | Sin API pública: no se integra con Claude Code [1F] | **OPCIONAL** (moodboards) |
| Nano Banana Pro | $0,134 (≤2K) / $0,24 (4K) por imagen; batch ≈50 % [V-web] | El mejor en **texto dentro de la imagen** y edición; SynthID | **RECOMENDABLE** |
| FLUX.2 | Pro $0,03 · Flex $0,05 · Max $0,07 · Klein $0,014 [V-web] | **`dev` no comercial**; Klein 4B Apache; la licencia self-hosted comercial costaría ≈$999/mes [1F] | **RECOMENDABLE** (API) |
| Adobe Firefly | $10–200/mes [V-web] | "Commercially safe" e indemnización enterprise [NV] | **RECOMENDABLE** (shops Adobe) |
| Higgsfield (agregador) | Planes $9–129 [V-web] | Es una puerta a todo lo anterior vía MCP; los créditos vencen | **RECOMENDABLE** (ideación) |

**Cuándo IA generativa y cuándo motion como código:**

| Usar **motion como código** (HyperFrames/Remotion) | Usar **IA generativa** |
|---|---|
| Texto, tipografía cinética, captions | Atmósferas, partículas orgánicas, texturas |
| UI de producto, dashboards, datos, gráficos | B-roll de personas y lugares genéricos (stock "imposible") |
| Logos y marcas (nunca generarlos) | Fondos abstractos, transiciones orgánicas |
| Timing exacto con VO o beat; versiones A/B o localizadas | Plano "hero" de concepto difícil de filmar |
| Todo lo que el cliente va a pedir cambiar | Imagen base para luego animar con código (parallax o 2.5D) |

**Por qué mezclarlos con criterio:**
1. **Editabilidad:** el código se cambia con un diff; un clip IA se regenera y nunca sale idéntico.
2. **Precisión:** la IA alucina texto, UI y logos.
3. **Costo:** un clip Veo Standard de 8 s cuesta $3,20; un render HTML cuesta centavos.
4. **Riesgo legal:** etiquetado del art. 50 y riesgo de infracción.

**Patrón recomendado:** la IA genera *plates* (fondos, texturas, b-roll) que entran como `<video>`/`<img>` en una composición que sí es código. El texto, la UI y la marca van siempre arriba como capas de código. Para cada clip IA, guardar prompt, seed, modelo, fecha y costo en el ledger, y conservar las content credentials (SynthID/C2PA).

### Categoría 7 — Captura de pantalla y demos de producto

- **Orden de preferencia para UI en videos tech:**
  1. **Reconstruir la UI en HTML.** Lo dice la guía de HyperFrames: "Screenshots are proof. HTML is what changes" [V-repo `design-tools.mdx`].
  2. `hyperframes capture`: sitio → componentes editables, con modo `--video` para bajar los videos del sitio [V-repo].
  3. **Playwright MCP** grabando un flujo real, con cursor animado y capítulos [V-repo].
  4. Grabadores dedicados.
- **Screen Studio:** auto-zoom y cursor suavizado, solo Mac, ≈$9/mes anual [V-web]. **RECOMENDABLE** para demos narrados.
- **Cap:** open source, Mac y Windows, grabación local gratis y self-hostable [V-web]. **RECOMENDABLE** en enterprise, por control de datos.
- **Tella:** presentador más pantalla, $13–19 [V-web]. **OPCIONAL.**
- **OBS:** raw de alta calidad, gratis [NV detalles]. **RECOMENDABLE** como captura de master.
- **Rotato:** mockups 3D de dispositivos; precio en conflicto entre $49/año y $79–199 de pago único; solo macOS [V-web]. **Alternativa como código:** un device frame en Three.js o CSS 3D dentro de la composición. **OPCIONAL.**
- **Cómo integrarlos:**
  - Grabar a 2× (retina), 60 fps y con perfil sRGB.
  - Exportar la grabación limpia (sin zoom automático) y animar zoom y paneo **en la composición**, así se puede editar y sincronizar con la VO.
  - Usar el cursor nativo o el del grabador, nunca los dos.

### Categoría 8 — Diseño y animación tradicional complementaria

- **Figma + Figma Motion.** Motion se lanzó en Config 2026 (24-jun): timeline con keyframes y presets, exporta CSS, JSON, React, MP4, WebM, SVG animado y GIF, y Dev Mode muestra timing y easing [V-web]. El estado (beta abierta o GA) no coincide entre fuentes. **RECOMENDABLE seguirlo de cerca:** puede volverse la fuente de verdad de los *motion tokens* (durations y easings) que la composición consume.
- **Claude Design → HyperFrames.** Flujo documentado: Claude Design hace el primer borrador (identidad, layout, primera animación), se exporta como ZIP o con "Send to HyperFrames", y Claude Code pule timing y QA [V-repo]. **RECOMENDABLE.**
- **Cavalry:** Pro gratis para individuos con uso comercial desde abr-2026, tras la compra por Canva; requiere cuenta Canva y el Enterprise pasa por Canva Enterprise (SSO) [V-web]. **RECOMENDABLE** para motion procedural que después entra como ProRes o PNG.
- **After Effects:** sigue siendo el estándar para personajes y compositing complejo; hay MCP comunitario [V-web]. Exporta Lottie (Bodymovin), que HyperFrames soporta [V-web]. **OPCIONAL** para equipos híbridos.
- **Jitter** [NV], **Rive** ($0/9/32 por seat, orientado a interactivo) [V-web], **LottieFiles** ($0–25/seat; las animaciones públicas van bajo Lottie Simple License) [V-web] y **Spline** (export de video solo en Pro, $12–60) [V-web]: **OPCIONALES**.
- **Blender 5.2 LTS** (14-jul-2026; 5.3 esperado para el 10-nov-2026) [V-web]: para planos 3D hero se renderiza EXR o PNG con alfa y se compone en código. **RECOMENDABLE.**

### Categoría 9 — Edición/NLE y finishing

- **DaVinci Resolve 21 / 21.1** (estable desde jun-2026; 21.1.1 en oct-2026) [V-web]:
  - Free: masteriza hasta UHD 60 fps.
  - Studio $295 (pago único): herramientas IA, **MCP** y, desde 21.1, el scripting Python.
  - **IMPRESCINDIBLE** para color, Fairlight y entrega.
- **Premiere Pro:** si ya usan Adobe, por la integración nativa con Frame.io. Generative Extend consume créditos [V-web]. **RECOMENDABLE** condicional.
- **Final Cut Pro 12.3:** una fuente dice que Apple agregó "Creator Studio" a $12,99/mes [1F]. **OPCIONAL.**
- **CapCut:** los ToS (jun-2025) otorgan una licencia **irrevocable, perpetua, sublicenciable y transferible** sobre el contenido, incluidos los borradores, y sobre nombre, imagen y semejanza [V-web]. Es incompatible con NDA de cliente. **EVITAR.**
- **Descript:** para talking-heads y podcasts (Underlord) [V-web]. No sirve para motion. **OPCIONAL.**

**Cómo entran los renders al NLE:**

| Necesidad | HyperFrames | Remotion | Notas |
|---|---|---|---|
| Overlay con alfa para NLE | `--format mov` → **ProRes 4444 fijo** [V-repo] | `--codec=prores` + perfil `4444`/`4444-xq`, `pixelFormat=yuva444p10le`, imágenes PNG (no JPEG) [V-web] | Ocupa ≈5–15 MB/s [V-web] |
| Overlay web | `--format webm` (VP9 con alfa) [V-repo] | VP8/VP9 con alfa | `ffprobe` puede reportar `yuv420p` aunque haya alfa: decodificar con `-c:v libvpx-vp9` antes del input [V-repo] |
| Máxima robustez | `--format png-sequence` [V-repo] | PNG sequence | Lo más seguro para AE o Resolve |
| HEVC con alfa | — | **No soportado** [V-web] | — |

**Advertencias técnicas [NV, conocimiento previo]:**
1. El ProRes que sale de ffmpeg (`prores_ks`) no está certificado por Apple. Algunos QC de broadcast lo marcan, y en ese caso hay que re-envolver o re-exportar desde Resolve.
2. El browser renderiza en sRGB/RGB: verificar los tags BT.709 y el rango (limited o full) en el MP4. Si no, aparecen gammas lavadas en el NLE.
3. Fijar la fps del proyecto del NLE igual a la del render (30 o 60). No mezclar 29,97 con 30.

### Categoría 10 — Review y colaboración

- **Frame.io V4:** Free (2 miembros, 2 GB) · Pro $15/seat (hasta 5) · Team $25/seat (hasta 15) · Enterprise (watermarking forense, DRM, Storage Connect, SLA) [V-web]. A esto se suma el **MCP** (beta pública) para que el agente lea los comentarios [V-web]. **IMPRESCINDIBLE** en enterprise.
- **Vimeo Review:** Bending Spoons compró Vimeo por $1,38 B y hubo despidos masivos en ene-2026. Sigue operando, pero los analistas recomiendan revisar SLAs [V-web]. **EVITAR** compromisos nuevos.
- **Dropbox Replay:** add-on de $10–12/user [V-web]. **OPCIONAL** si la org ya vive en Dropbox.
- **Air:** DAM con créditos compartidos entre storage e IA, sin overage, y un salto de precio de $25 a $900. No confirmé las features de review de video [V-web]. **OPCIONAL.**

### Categoría 11 — QA automatizado

**Gate mínimo de QA**, con ffmpeg/ffprobe directo desde Claude Code (sintaxis de filtros por conocimiento previo; los umbrales hay que ajustarlos):

```bash
# 1) Spec: codec, resolución, fps, pix_fmt, color, duración, bitrate
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt,color_space,color_transfer,color_primaries:format=duration,bit_rate -of json out.mp4

# 2) Loudness: medir (integrado, LRA, true peak)
ffmpeg -hide_banner -i out.mp4 -af ebur128=peak=true -f null - 2>&1 | tail -12
#    Normalizar en 2 pasadas: 1.ª mide (print_format=json); 2.ª aplica measured_* con linear=true
ffmpeg -i mix.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null -

# 3) Negro, congelado y silencio no intencionales
ffmpeg -i out.mp4 -vf "blackdetect=d=0.5:pix_th=0.10,freezedetect=n=-60dB:d=1" \
       -af silencedetect=n=-50dB:d=1 -f null - 2>&1 | grep -E "black_|freeze_|silence_"

# 4) Cortes de escena (ritmo / cortes accidentales)
ffmpeg -i out.mp4 -vf "select='gt(scene,0.35)',showinfo" -f null - 2>&1 | grep -o "pts_time:[0-9.]*"

# 5) Contact sheet para revisión humana o multimodal
ffmpeg -i out.mp4 -vf "fps=1,scale=480:-1,tile=6x5" -frames:v 1 contact.png
```

- **Targets de loudness:**
  - Web y social: ≈ −14 LUFS, TP ≤ −1 dBTP.
  - Default de HyperFrames: **−16 LUFS** [V-repo].
  - Broadcast EBU R128: −23 LUFS, TP ≤ −1.
  - ATSC A/85: −24 LKFS [NV en detalle].
- **QA específico del motor:**
  - `hyperframes check` (layout y **WCAG AA**), `lint` y `snapshot` [V-repo].
  - En Remotion: `remotion still` en timestamps clave y tests de componentes.
- **Fotosensibilidad (brecha):**
  - **EA IRIS**, BSD-3 [V-repo]. Detecta flashes de luminancia y de rojo saturado (más de 3 por segundo = fail; 2 a 3 sostenidos durante 5 s = *extended fail*) y patrones espaciales de 0,5 s o más. Salida en CSV.
  - El propio README aclara que **no certifica cumplimiento**, y el último commit es de ene-2025.
  - **PEAT** (Trace Center, gratis, Windows) [NV] y **Harding FPA** (comercial, el estándar de los broadcasters del Reino Unido) [NV] para certificación formal.
  - En motion tech el riesgo es real: glitches, strobes de transición y fondos con patrones de líneas.
  - **RECOMENDABLE** (IRIS en CI). Harding **solo si hay broadcast**.
- **Otros [NV]:** PySceneDetect (cortes), VMAF (calidad de encode vs. master), MediaConch (políticas de spec por cliente) y `signalstats` (niveles legales).
- **Crítica multimodal:**
  - Claude lee contact sheets y frames clave: legibilidad, jerarquía, marca, errores de copy.
  - Para audio y video completo, un modelo con entrada de video (Gemini [NV]) o el `video_analysis_create` de Higgsfield [V-sesión].
  - **Regla:** los modelos son *críticos asesores*, no gates; los gates son medibles (ffprobe, LUFS, IRIS, WCAG). El patrón de `media-use` (contact sheet de inicio, medio y fin; escalar a frames sueltos solo si hace falta) es un buen modelo de costo [V-repo].

### Categoría 12 — Infra de render

| Opción | Cuándo | Costo | Notas |
|---|---|---|---|
| Local (laptop o workstation) | Iteración y piezas cortas | Hardware | HyperFrames: Chrome + FFmpeg. Remotion: igual |
| **HyperFrames `--docker`** | CI y producción reproducible | Infra propia | Fija la versión de Chrome, FFmpeg y fuentes [V-repo] |
| **HyperFrames Lambda** (Step Functions: plan → N renderChunk → assemble) | Volumen, piezas largas, paralelismo | Ej.: **$0,0214 por 480 frames con 5 lambdas**, sin contar transferencia S3 [V-repo] | CDK construct `HyperframesRenderStack`, `computeRenderCost`, `lambda policies validate` [V-repo] |
| HyperFrames Cloud Run | Orgs en GCP | GCP | Paquete `@hyperframes/gcp-cloud-run` [V-repo] |
| HeyGen cloud (`hyperframes cloud render`) | Sin infra, usuarios no técnicos | Créditos HeyGen [NV]; **4K = 1,5×** y solo MP4 [V-repo] | En CI usa API key, porque device login se rechaza [V-repo] |
| Remotion Lambda / Cloud Run | Shops Remotion | AWS/GCP **más** licencia Automators ($0,01/render, mín. $100/mes) [V-web] | Precio de AWS por minuto de video [NV] |
| GitHub Actions | Gates en PR: lint, check, preview de baja resolución, IRIS, loudness | Minutos de runner [NV] | OIDC a AWS (sin llaves largas), cache de Chrome; renders finales en Lambda |

**Recomendación:** preview local, gates de PR en Actions con un render draft en Docker, y finales en Lambda o Cloud Run dentro de la **cuenta propia del cliente** (datos dentro de su perímetro). HeyGen cloud solo si el contrato con HeyGen cubre los datos.

---

## 4. Seguridad y gobernanza (skills, MCP y derechos)

**Política de supply chain para skills y plugins:**
1. **Allowlist de orgs:** `anthropics`, `heygen-com`, `remotion-dev` y, opcionalmente, `microsoft/playwright-mcp` y `ChromeDevTools`. Todo lo demás pasa por **fork interno** y revisión.
2. **Pin a commit SHA.** Sin auto-update en marketplaces de terceros.
3. **Revisión previa obligatoria** con un grep orientativo antes de leer a mano:
   ```bash
   grep -rnP "[\x{E0000}-\x{E007F}]" ./skill                      # caracteres Unicode Tag ocultos
   grep -rnE "curl[^|]*\|\s*(ba)?sh|wget[^|]*\|\s*sh|--break-system-packages|base64 -d|eval\(|\.ssh|\.aws|credentials|keychain" ./skill
   grep -rnoE "https?://[a-zA-Z0-9.-]+" ./skill | sort | uniq -c | sort -rn   # inventario de dominios
   ```
4. **Sandbox:** devcontainer o VM con egress allowlist (dominios de proveedores aprobados) y sin credenciales de producción.
5. **MCP:** preferir servidores **remotos oficiales con OAuth** (Figma, Canva, ElevenLabs, Frame.io, Higgsfield, HyperFrames). Un MCP comunitario local equivale a ejecución de código: Blender MCP y AE MCP solo en VM.
6. **Claude Code al día:** CVE-2025-59536 y CVE-2026-21852 están parcheados [V-web]. Para restringir servidores MCP y marketplaces, usar managed settings; los nombres exactos de las claves no los verifiqué [NV].
7. **Telemetría:** `HYPERFRAMES_NO_TELEMETRY=1` [V-repo]; opt-out en Blender MCP [V-web].
8. **Secretos:** `.env` fuera del repo; en CI, API keys de servicio. HyperFrames admite gateway del host (`HEYGEN_API_BASE`) para que la key nunca entre al entorno del agente [V-repo].

**Derechos y procedencia** (un ledger por pieza; `media-use` ya registra y genera `CREDITS.md` [V-repo]):
- **Voz:** proveedor, modelo, voice_id y release del talento.
- **Música:** proveedor, ID de pista, licencia y política de Content ID.
- **SFX:** fuente y licencia (CC0, CC BY con crédito, Mixkit).
- **Gen-IA:** modelo, prompt, seed, fecha, costo y marca de agua o C2PA.
- **Etiquetado del art. 50** cuando haya deepfake o voz sintética de una persona real.

---

## 5. Stack recomendado en 3 niveles

> Los costos excluyen el plan de Claude/Claude Code y la nómina. Son estimaciones **[V-web/NV]** a validar en las páginas oficiales.

### Starter — $0–50/mes (piloto o un creativo)
| Capa | Elección | $/mes |
|---|---|---|
| Motor | **HyperFrames** (Apache): plugin + core skills, versión pinneada | 0 |
| Diseño | `frontend-design` + skill `figma` vía REST (token read-only) o Claude Design → ZIP | 0 |
| Captura | Playwright MCP + `hyperframes capture`; Cap u OBS | 0 |
| Voz | Kokoro para borradores; **ElevenLabs Starter $6 o Creator $22** para la final | 6–22 |
| Timing | Timestamps de HeyGen TTS (allowance OAuth) o whisper.cpp/Parakeet local | 0 |
| Música/SFX | SFX: librería incluida + Openverse CC0 + Sonniss GDC. Música: ElevenLabs Music (mismo pool de créditos) | 0 |
| Imagen IA | Nano Banana Pro o FLUX.2 Pro por API, pago por uso (≈20–50 imágenes) | 3–10 |
| Finishing | DaVinci Resolve Free | 0 |
| Review | Frame.io Free (2 GB) o Drive | 0 |
| QA | Gate ffmpeg + `hyperframes check` + IRIS | 0 |
| Render | Local / `--docker` | 0 |
| **Total** | | **≈ $10–35** |

*Si el estudio prefiere Remotion: es gratis solo si la organización tiene 3 personas o menos [V-web]. Para un equipo enterprise, Starter no aplica con Remotion.*

### Pro — ≈ $400–1.200/mes (equipo de 3–6)
| Capa | Elección | $/mes aprox. |
|---|---|---|
| Motor | HyperFrames (o Remotion Creators: $25 × seats) | 0–150 |
| Diseño | Figma Professional: 2 seats Dev ($12) + 1 Full ($16) + Figma MCP; **Cavalry** (gratis) | ≈40 |
| Voz | **ElevenLabs Pro $99** (clonación profesional y PCM 44,1 kHz) | 99 |
| Música | **Epidemic Sound Pro/Business** o **Artlist** (elegir una) | 40–75 |
| Gen-IA | Higgsfield Pro/Plus para ideación ($29–59) + Veo/Kling por API para lo que se entrega (≈$50–300 según volumen) | 80–360 |
| Captura | Screen Studio ($9) o Cap Pro + OBS | 10–40 |
| Timing | WhisperX local + ElevenLabs Scribe/Alignment en la nube | <10 |
| Finishing | **DaVinci Resolve Studio** ($295 pago único ≈ $25/mes amortizado) con MCP | ≈25 |
| Review | **Frame.io Team** $25 × 4–6 seats + MCP | 100–150 |
| Render | **HyperFrames Lambda** en la cuenta AWS propia (centavos por render) + GitHub Actions para gates | 10–50 |
| QA | Gate ffmpeg + IRIS en CI + crítica multimodal sobre contact sheets | 0–20 |
| **Total** | | **≈ $400–1.200** |

### Enterprise — ≈ $3.000–15.000+/mes (estudio con clientes corporativos)
- **Motor:** HyperFrames en el perímetro del cliente (Lambda o Cloud Run vía CDK, VPC propia) y/o **Remotion Enterprise** (desde $500/mes) si hay Player embebido o apps SaaS.
- **Gobernanza:**
  - Marketplace interno de skills (forks pinneados y revisados).
  - Managed settings de Claude Code con allowlist de MCP.
  - Devcontainers con egress controlado.
  - Ledger de procedencia por pieza.
  - Etiquetado del art. 50 y C2PA.
- **Voz:** ElevenLabs **Business ($990) o Enterprise**, con releases de talento firmados. HeyGen Enterprise si hay avatares.
- **Música:** ElevenLabs Music **Enterprise** (cubre cine, TV y juegos [1F]) + **Epidemic o Artlist Enterprise** (licencia para más de 50 empleados y whitelisting de canales). Musicbed para hero spots.
- **Gen-IA:** **Vertex AI** (Veo/Omni, Nano Banana) bajo el contrato cloud del cliente; **Runway Enterprise** (SSO, SOC2 [NV]); **Adobe Firefly** con indemnización [NV] para clientes adversos al riesgo. Higgsfield solo en sandbox creativo. Sin Suno, Udio ni FLUX-dev.
- **Diseño:** Figma Organization o Enterprise (Variables para tokens [V-repo]) y Figma Motion. Adobe CC for Teams si hay AE o Premiere.
- **Finishing:** Resolve Studio (MCP) en estaciones de color/finishing; Premiere si el cliente es shop Adobe.
- **Review:** **Frame.io Enterprise** (SSO, watermarking forense, DRM, Storage Connect) con MCP.
- **QA:**
  - Gate automatizado: spec por cliente (MediaConch [NV]), loudness por destino (web −14, broadcast −23), IRIS y WCAG.
  - **Harding FPA** para entregas broadcast UK [NV].
  - Revisión humana final obligatoria.
- **Render:** Lambda o Cloud Run con presupuestos y alertas de costo; Docker para reproducibilidad; renders finales firmados y archivados con el ledger.

---

## 6. Lista de "evitar" (y por qué)

| Evitar | Motivo |
|---|---|
| **Sora 2** | Discontinuado (app el 26-abr, API el 24-sep-2026) [V-web] |
| **Suno / Udio** en entregables de cliente | Litigios abiertos (UMG/Sony), walled garden y topes de descarga; titularidad y Content ID inciertos [V-web] |
| **CapCut** | Licencia irrevocable y sublicenciable sobre el contenido y la semejanza; propiedad de ByteDance [V-web] |
| **FFmpeg MCP servers** | Duplican lo que Claude Code ya hace por Bash y suman superficie de ataque |
| **FLUX.2 [dev]** en producción comercial | Licencia no comercial [V-web] |
| **Vimeo** para compromisos nuevos | Riesgo de continuidad y soporte tras Bending Spoons [V-web] |
| Skills de terceros **sin fork ni pin** | Evidencia de malware en registros públicos [V-web] |
| **Clonar voces sin release escrito** | ELVIS y leyes estatales vigentes; art. 50 del AI Act [V-web] |
| Generar con IA **logos, UI o texto** | Alucinación y fuera de marca: se hacen como código |

---

## 7. Datos no verificados o pendientes (para un segundo pase)

1. **Shutdown de Veo 3.1 preview el 22-oct-2026** y reemplazo por Gemini Omni [1F]: **urgente**, verificar en la página de deprecations de Gemini API.
2. Deprecación de `gpt-4o-transcribe` el 2026-10-15 [1F].
3. Exclusión de cine, TV y juegos en el self-serve de ElevenLabs Music [1F]; términos comerciales de Lyria 3.5.
4. Términos de licencia comercial de la música del catálogo HeyGen (`media-use --type bgm`) y precios de HeyGen cloud render.
5. Precios exactos de Epidemic, Artlist y Musicbed (las fuentes no coinciden) y sus políticas de Content ID enterprise.
6. Figma MCP: límites por tipo de seat (las fuentes no coinciden).
7. QA de flashing: estado actual de PEAT y costo de Harding FPA [NV]; IRIS sin commits desde ene-2025.
8. Costo por minuto de Remotion Lambda; precios 2026 de GitHub Actions; claves exactas de managed settings de Claude Code.
9. Licencias de Cap, OBS, WhisperX, Parakeet y Kokoro (pesos), y de GSAP (la usa HyperFrames): conocimiento previo, a confirmar con legal.
10. Precios de Midjourney, Jitter y Soundly; features de review de Air.

---

## 8. Fuentes

**Verificadas localmente [V-repo]:**
- HyperFrames v0.8.174: `README.md`, `plugin.json`, `skills/media-use/{SKILL.md, references/setup-providers.md, audio/references/{tts,bgm,sfx,transcribe}.md, audio/references/captions/transcript-handling.md}`, `skills/hyperframes-audio/SKILL.md`, `skills/figma/SKILL.md`, `docs/guides/{mcp,rendering,design-tools,claude-design-hyperframes,webmcp,hyperframes-vs-remotion}.md(x)`, `docs/deploy/{aws-lambda,cloud}.mdx`, `packages/aws-lambda/README.md`, `packages/cli/src/commands/*`, `packages/studio-server/src/helpers/loudness.ts`.
- Clones: [remotion-dev/skills](https://github.com/remotion-dev/skills), [Barty-Bart/motion-graphics](https://github.com/Barty-Bart/motion-graphics), [anthropics/skills](https://github.com/anthropics/skills), [electronicarts/IRIS](https://github.com/electronicarts/IRIS) y [zhuyansen/awesome-claude-video-skills](https://github.com/zhuyansen/awesome-claude-video-skills).
- npm: `@playwright/mcp`, `chrome-devtools-mcp`, `skills`, `hyperframes`, `remotion`, `@remotion/{lambda,cloudrun,captions,install-whisper-cpp,whisper-webgpu}`, `figma-developer-mcp`, `@hyperframes/aws-lambda`, `@elevenlabs/elevenlabs-js`, `kokoro-js` (versiones, licencias y README de Playwright MCP).

**Web (mayormente secundarias):**
- Skills/plugins: [HeyGen en X](https://x.com/HeyGen/status/2044827454460871072) · [andrew.ooo review de HyperFrames](https://andrew.ooo/posts/hyperframes-heygen-html-video-agents-review/) · [Skillselion guía HyperFrames](https://skillselion.com/guides/hyperframes-skill-claude-code-guide) · [Remotion Claude Code plugin](https://www.remotion.dev/docs/ai/claude-code-plugin) · [Remotion Agent Skills](https://www.remotion.dev/docs/ai/skills) · [Remotion terms](https://www.remotion.dev/docs/terms) · [Remotion License FAQ](https://www.remotion.dev/docs/license/faq) · [remotion.pro/license](https://www.remotion.pro/license) · [fernandokaraka skill](https://github.com/fernandokaraka/remotion-motion-graphics-skill) · [Liamrjohnston skill](https://github.com/Liamrjohnston/remotion-motion-graphics-skill) · [iart-ai](https://github.com/iart-ai/motion-design-skills) · [wilwaldon toolkit](https://github.com/wilwaldon/Claude-Code-Video-Toolkit)
- Seguridad: [Snyk ToxicSkills](https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/) · [CSA: SKILL.md context poisoning](https://labs.cloudsecurityalliance.org/research/csa-research-note-skill-md-agent-context-poisoning-20260506/) · [arXiv 2603.00195](https://arxiv.org/html/2603.00195v1) · [CyberDesserts](https://blog.cyberdesserts.com/ai-agent-security-risks/) · [Blender MCP CVE-2026-10661](https://github.com/advisories/GHSA-qqw9-95ww-prfm) · [blender-mcp issue #203 (SSRF)](https://github.com/ahujasid/blender-mcp/issues/203) · [OpenCVE blender-mcp](https://app.opencve.io/cve/?product=blender-mcp&vendor=ahujasid)
- MCP: [mcp.directory Chrome vs Playwright](https://mcp.directory/blog/chrome-devtools-mcp-vs-playwright-mcp-2026) · [test-lab.ai](https://www.test-lab.ai/blog/chrome-mcp-vs-playwright-mcp) · [usecarly Figma MCP](https://www.usecarly.com/blog/figma-mcp/) · [Figma pricing](https://www.figma.com/pricing/) · [ElevenLabs MCP](https://elevenlabs.io/mcp) · [Glama ElevenLabs MCP](https://glama.ai/mcp/servers/elevenlabs/elevenlabs-mcp) · [Higgsfield blog MCP](https://higgsfield.ai/blog/Generate-AI-Videos-From-Claude-with-Higgsfield-MCP) · [claudefa.st Higgsfield](https://claudefa.st/blog/tools/mcp-extensions/higgsfield-mcp) · [Frame.io MCP forum](https://forum.frame.io/t/introducing-the-frame-io-mcp-server/3466) · [Frame.io MCP docs](https://next.developer.frame.io/platform/docs/mcp/frame-io-mcp) · [Canva connector guide](https://aitoolsreview.co.uk/insights/canva-claude-connector) · [CineD Resolve 21.1 MCP](https://www.cined.com/davinci-resolve-21-1-released-ai-assistant-integration-via-mcp-individual-hdr-trims-and-python-scripting-moves-to-studio/) · [Digital Production Resolve 21.1](https://digitalproduction.com/2026/09/08/resolve-21-1-adds-mcp-and-finally-gets-presets/) · [YMCinema Resolve MCP](https://ymcinema.com/2026/09/17/davinci-resolve-21-1-mcp-ai-assistants-control-edit/) · [LiamcKerr AE MCP](https://github.com/LiamcKerr/after-effects-mcp) · [premiere-pro-mcp](https://github.com/leancoderkavy/premiere-pro-mcp) · [a1adams comparativa MCP video](https://github.com/a1adams/mcp-servers-for-video-editing) · [kevinwatt ffmpeg-mcp-lite](https://github.com/kevinwatt/ffmpeg-mcp-lite)
- Voz y legal: [Cartesia: ElevenLabs pricing](https://www.cartesia.ai/learn/elevenlabs-pricing) · [CloudZero ElevenLabs](https://www.cloudzero.com/blog/elevenlabs-pricing/) · [invideo Cartesia](https://invideo.io/blog/cartesia-sonic-ai-voice/) · [eesel Cartesia pricing](https://www.eesel.ai/blog/cartesia-sonic-3-pricing) · [costgoat OpenAI TTS](https://costgoat.com/pricing/openai-tts) · [G2 HeyGen API pricing](https://www.g2.com/articles/heygen-api-pricing) · [Fastlane HeyGen](https://www.usefastlane.ai/pricing/heygen) · [GovTrack S.4591](https://www.govtrack.us/congress/bills/119/s4591) · [Manatt NO FAKES 2026](https://www.manatt.com/insights/newsletters/client-alert/congress-reintroduces-the-no-fakes-act-what-s-new-in-the-2026-bill) · [Holland & Knight](https://www.hklaw.com/en/insights/publications/2026/06/senate-judiciary-committee-advances-legislation-to-protect-name) · [Armstrong Teasdale ELVIS](https://www.armstrongteasdale.com/thought-leadership/artificial-intelligence-and-copyrights-tennessees-elvis-act-becomes-law/) · [EC Code of Practice marcado IA](https://digital-strategy.ec.europa.eu/en/news/commission-publishes-code-practice-marking-and-labelling-ai-generated-content) · [EC FAQ art. 50](https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act) · [Paul Weiss](https://www.paulweiss.com/insights/client-memos/eu-finalises-transparency-rules-for-ai-generated-content)
- Música y SFX: [MBW Warner–Suno](https://www.musicbusinessworldwide.com/warner-music-group-settles-with-suno-strikes-first-of-its-kind-deal-with-ai-song-generator/) · [ProPakistani Suno v6](https://propakistani.pk/2026/09/10/suno-launches-licensed-ai-music-models-after-warner-copyright-settlement/) · [MBW UMG–Udio](https://www.musicbusinessworldwide.com/universal-music-settles-udio-lawsuit-strikes-deal-for-licensed-ai-music-platform/) · [Rolling Stone Udio](https://www.rollingstone.com/music/music-features/ai-music-universal-music-group-settlement-udio-1235457945/) · [BusinessWire Eleven Music](https://www.businesswire.com/news/home/20250805333301/en/ElevenLabs-Launches-Eleven-Music-in-Collaboration-with-Music-Industry-Partners) · [invideo ElevenLabs Music](https://invideo.io/blog/elevenlabs-music-ai-generator/) · [invideo Lyria](https://invideo.io/blog/lyria-ai-music-generator/) · [cellcog Lyria 3.5](https://cellcog.ai/blog/lyria-3-5/) · [Epidemic vs Artlist](https://www.epidemicsound.com/blog/artlist-vs-epidemic-sound/) · [Epidemic vs Musicbed](https://www.epidemicsound.com/blog/musicbed-vs-epidemic-sound/) · [cchound](https://www.cchound.com/epidemic-sound/artlist-vs-epidemic-sound/) · [Sonniss GDC](https://sonniss.com/gameaudiogdc/) · [Bedroom Producers Blog GDC 2026](https://bedroomproducersblog.com/2026/03/16/sonniss-gdc-2026-bundle/)
- Transcripción: [forasoft WhisperX](https://www.forasoft.com/learn/ai-for-video-engineering/articles-ai/whisperx-diarization-word-level-timestamps) · [whipscribe implementaciones](https://whipscribe.com/whisper-implementations-compared) · [yaps Parakeet vs Whisper](https://www.yaps.ai/blog/parakeet-vs-whisper) · [AssemblyAI pricing (cekura)](https://www.cekura.ai/blogs/assemblyai-pricing) · [Deepgram vs AssemblyAI](https://aibizhub.io/articles/deepgram-vs-assemblyai-pricing-2026/) · [Scribe v2 (therundown)](https://www.therundown.ai/tools/scribe-v2) · [PR forced alignment pricing](https://github.com/Kuble-Lab/open-creative-director/pull/19) · [Groq models](https://console.groq.com/docs/models) · [OpenAI gpt-4o-transcribe](https://developers.openai.com/api/docs/models/gpt-4o-transcribe) · [Remotion transcribing](https://www.remotion.dev/docs/captions/transcribing) · [@remotion/captions](https://www.remotion.dev/docs/captions/api)
- Gen-IA: [benchlm Veo](https://benchlm.ai/media-pricing/veo) · [veopricing providers](https://www.veopricing.com/veo-3-1-api-providers/) · [CloudZero Veo](https://www.cloudzero.com/blog/veo-3-pricing/) · [unifically Omni vs Veo](https://unifically.com/blogs/gemini-omni-1.1-flash-vs-veo-3.1) · [geotoolbox Omni](https://geotoolbox.ai/blog/gemini-omni) · [magichour Kling](https://magichour.ai/blog/kling-ai-pricing) · [CloudZero Kling](https://www.cloudzero.com/blog/kling-ai-pricing/) · [CNN Sora shutdown](https://www.cnn.com/2026/03/24/tech/openai-sora-video-app-shutting-down) · [OpenAI Sora](https://openai.com/index/sora/) · [costgoat Sora sunset](https://costgoat.com/pricing/sora) · [eesel Runway](https://www.eesel.ai/blog/runway-ai-pricing) · [magichour Luma](https://magichour.ai/blog/luma-dream-machine-pricing) · [Wikipedia Midjourney](https://en.wikipedia.org/wiki/Midjourney) · [aifreeapi Nano Banana Pro](https://www.aifreeapi.com/en/posts/nano-banana-pro-price) · [invideo FLUX](https://invideo.io/blog/flux-ai-image-generator/) · [BFL flux2 repo](https://github.com/black-forest-labs/flux2) · [Krea Higgsfield pricing](https://www.krea.ai/blog/higgsfield-pricing-explained-2026-unlimited-credits-and-real-monthly-costs) · [Krea Firefly](https://www.krea.ai/blog/is-adobe-firefly-free-what-it-is-and-how-it-compares-in-2026)
- Captura y diseño: [docsie Screen Studio vs Cap](https://www.docsie.io/vs/screen-studio-vs-cap-pricing/) · [Tella alternatives](https://www.tella.com/alternatives/screen-studio) · [Rotato pricing](https://rotato.app/pricing) · [matte Rotato alternatives](https://matte.app/blog/rotato-alternatives) · [CG Channel Cavalry gratis](https://www.cgchannel.com/2026/04/canva-makes-motion-graphics-and-animation-app-cavalry-free/) · [Figma: Introducing Figma Motion](https://www.figma.com/blog/introducing-figma-motion/) · [Figma Config 2026 recap](https://www.figma.com/blog/config-2026-recap/) · [LottieFiles best tools 2026](https://lottiefiles.com/blog/design-guides-and-tips/best-motion-design-tools-ranked-by-use-case/) · [Spline pricing](https://spline.design/pricing) · [Blender 5.2 LTS](https://www.blender.org/download/releases/5-2/)
- NLE y review: [PetaPixel Resolve 21](https://petapixel.com/2026/06/03/davinci-resolve-21-officially-released-with-new-photo-editing-ai-tools-and-much-more/) · [Digital Production 21.1.1](https://digitalproduction.com/2026/10/06/davinci-resolve-21-1-1/) · [The Post Flow NLE 2026](https://thepostflow.com/post-production/video-editing/best-video-editing-software-2026/) · [Digital Camera World CapCut ToS](https://www.digitalcameraworld.com/tech/social-media/capcuts-new-terms-of-service-are-angering-the-internet-and-so-confusing-that-video-editors-are-asking-chatgpt-to-decipher-them) · [Descript pricing (costbench)](https://costbench.com/software/ai-video-generators/descript/) · [Remotion ProRes](https://www.remotion.dev/docs/prores) · [Remotion transparent videos](https://www.remotion.dev/docs/transparent-videos) · [rendercomp transparent export](https://rendercomp.com/blog/remotion-transparent-background-green-screen-export/) · [prelap Frame.io pricing](https://prelap.io/blog/frame-io-pricing-2026) · [krock Frame.io](https://krock.io/frame-io-pricing/) · [PetaPixel Vimeo layoffs](https://petapixel.com/2026/01/23/almost-all-of-vimeo-staff-laid-off-after-acquisition-by-bending-spoons/) · [TechCrunch Vimeo](https://techcrunch.com/2026/01/22/vimeo-starts-layoffs-after-acquisition-by-bending-spoons) · [Shade Dropbox Replay](https://shade.inc/blog/dropbox-review-video-production) · [brault Air review](https://brault.app/blog/creative-asset-management/air-review)
