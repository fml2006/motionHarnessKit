# 05 — Pipeline de producción enterprise para motion graphics con IA

**Versión 1.0 · 2026-10-19 · Productora de contenido tech (YouTube, redes, video corporativo)**
**Stack de referencia:** Claude Code como agente que escribe motion graphics como código sobre **HyperFrames** (HTML/CSS/GSAP → MP4, Apache-2.0) o **Remotion** (React → MP4, licencia comercial para empresas de más de 3 personas).
**Plantillas:** `templates/` (brief, guion a dos columnas, storyboard, shot list CSV, review, QA, entrega, naming, RACI).

> Nota de método: WebFetch no estaba disponible. Las cifras salen de búsquedas web con respaldo de fuentes primarias cuando las hubo (YouTube Help, LinkedIn Business, Netflix Partner Help, AES, EBU, Copyright Office, AI Act) y de fuentes secundarias en lo demás. Donde las fuentes se contradicen, el documento lo dice con **[verificar]**. Las horas y los costos con IA son **estimaciones propias** para calibrar en el piloto (§9.6), no benchmarks.

---

## 0. Resumen ejecutivo

1. **La IA no cambia la forma del pipeline, cambia su estructura de costos.** Construir y reconstruir una escena pasa de horas a minutos. Decidir, aprobar, verificar y licenciar cuesta lo mismo que antes. Por eso los *gates* pesan **más** que antes: con IA iterar es barato, y también lo es iterar en la dirección equivocada.
2. **Regla de costo: cada decisión se aprueba en el artefacto más barato que la puede mostrar.** El mensaje se aprueba en el brief, las palabras en el guion, el look en un styleframe y el orden y los tiempos en el animatic. Nunca "lo vemos cuando esté animado".
3. **El storyboard pasa a ser la especificación ejecutable.** En HyperFrames lo es en sentido literal: `STORYBOARD.md` tiene un bloque `## Frame N` por escena, con `status: outline → built → animated`, y el agente despacha cada bloque como unidad de trabajo. Si la spec es vaga, el agente completa con el promedio estadístico, que en la práctica es "tech genérico azul con partículas".
4. **Aparece un rol nuevo: Technical Director / harness engineer.** Es dueño del entorno del agente: skills con versión fija, tokens de marca (`frame.md`/`design.md`), plantillas, gates automáticos (`lint`, `check`, contraste WCAG), render, pipeline de masters, costos y licencias de software.
5. **Lo que no se delega a la IA:** mensaje y estrategia, aprobación de claims técnicos y números, gusto final (hook, momentos héroe, estilo), consolidación de feedback y negociación de alcance, derechos (música, voz, imagen) y disclosure, el visionado final en dispositivos reales, la escucha de la mezcla, y el botón de publicar (§1.4).
6. **Qué esperar (estimación a calibrar):** entre −35 % y −55 % de horas humanas en una pieza de 60–90 s frente a un flujo tradicional en After Effects. El ahorro se concentra en build/animación y animatic. El calendario se comprime menos, entre −25 % y −40 %, porque **la latencia de aprobación del cliente no se acelera con IA**.

```
G0 BRIEF ─▶ G1 INVESTIGACIÓN ─▶ G2 TREATMENT ─▶ G3 GUION ───────┐
                                      └──▶ G4 MOODBOARD/STYLEFRAMES (en paralelo al guion)
                                                                 ▼
G5 STORYBOARD (= spec ejecutable) ─▶ G6 ANIMATIC (VO scratch) ─▶ G6b VO FINAL
   ─▶ G7 BUILD CON IA (+ gates automáticos) ─▶ G8 REVIEW R1/R2 ─▶ G9 PICTURE LOCK
   ─▶ G10 SONIDO/MEZCLA ─▶ G11 CAPTIONS ─▶ G12 MASTER ─▶ G13 VERSIONADO
   ─▶ G14 QA ─▶ G15 ENTREGA + ARCHIVO
```

**Mapa de artefactos (flujo HyperFrames).** El mismo esquema vale para Remotion con JSON de props.

| Fase | Artefacto en el repo del proyecto | Quién lo edita |
|---|---|---|
| Brief | `BRIEF.md` | Productor (el agente puede redactar el borrador desde notas) |
| Investigación | `research/digest.md`, `research/claims.csv`, `research/glosario.md` | Guionista + SME |
| Guion | `GUION.md` (dos columnas) → `SCRIPT.md` (narración bloqueada para TTS/locutor) | Guionista |
| Estilo | `frame.md` / `design.md` (tokens: color, tipografía, grid, easing, duraciones) | Director de arte |
| Storyboard | `STORYBOARD.md` + `boards/storyboard.html` + `boards/stills/` | Motion director, con sketches del agente |
| Build | `compositions/frames/*.html` + `*.motion.json` | Agente, dirigido por el motion director |
| Revisión | `reviews/R1.md`, `reviews/R2.md` + tags de git `rvw-v01`… | Productor + motion director |
| Entrega | `delivery/` + `archive/` | Technical director + editor |

---

## 1. Roles, RACI y cómo cambia cada rol

### 1.1 Roles: qué deciden y cómo cambian

| Rol | Decide | Aprueba (gate) | Cómo cambia con IA | Lo que no delega |
|---|---|---|---|---|
| **Productor ejecutivo / productor** | Alcance, presupuesto, calendario, rondas, riesgos, matriz de entregables. Es la **voz única** hacia el cliente. | G0 (con cliente), G9 lock, G15 entrega | Usa al agente para actas, estimaciones, consolidar comentarios exportados de Frame.io y armar changelogs | Priorizar feedback contradictorio, decir "esto es ronda extra o change order", la relación con el cliente |
| **Guionista** | Estructura, palabras, hook, ritmo, registro de claims | Responsable de G3 (aprueba el DC; los claims, el SME) | El agente genera de 10 a 20 hooks, comprime líneas a presupuesto de palabras, mide wpm y chequea densidad. El guionista elige y reescribe | La voz, el hook final, la verificación de claims con el SME |
| **Director creativo / de arte (DC)** | Concepto, look, sistema visual (tokens), calidad final | G2, G4, G5, G6, aprobación interna antes de cada versión al cliente | Explora de 3 a 5 direcciones **en código** en horas, no en días. Define tokens y rechaza | El estilo, los momentos héroe, el "esto se ve barato" |
| **Motion designer → "motion director"** | Lenguaje de movimiento: easing, duraciones, jerarquía, sincronía con la VO | Responsable de G5–G8 | Antes animaba keyframe por keyframe. Ahora escribe specs de movimiento, dirige al agente escena por escena, revisa en preview y hace *polish* manual en el 10–20 % de escenas clave (en código, o en After Effects con import) | El criterio de "se siente bien", el ritmo, el timing fino |
| **Technical Director / harness engineer** (nuevo) | Entorno del agente: repo plantilla, `CLAUDE.md` de la casa, skills con versión fija, registry interno de bloques, tokens, gates en CI, presets de render, scripts ffmpeg, costos de tokens/cómputo, licencias de software, seguridad de datos | Responsable técnico de G7, G12, G15 | Rol nuevo. Equivale al pipeline TD de un estudio de animación | Permisos del agente (nunca publica, nunca sube proyectos de cliente a servicios públicos), revisión de cambios en skills |
| **Editor** | Ritmo global, ensamble con footage (talking head, screen recordings), cortes, J/L | Responsable de G6 (timing), G9, G13 | El agente transcribe, arma ensambles preliminares y overlays sincronizados a transcript (`/talking-head-recut`) | El pacing final y el corte de la entrevista |
| **Sound designer / mezclador** | SFX, música (elige con el DC), mezcla, loudness, stems | A/R de G10 | Análisis automático de loudness (`hyperframes audio`, BS.1770), ducking automático (*voiceover carve*), sugerencia de SFX | La escucha final en auriculares y en el parlante del teléfono, y la elección de música con licencia |
| **QA / compliance** | Conformidad técnica, legal, de marca y de accesibilidad, y AI disclosure | A de G14, con **veto de entrega** | Automatiza lo medible: specs, loudness, contraste, overflow, ortografía, números vs registro de claims | El visionado completo, el juicio legal y la decisión de disclosure |
| **SME (experto técnico)** | Exactitud técnica | Firma el registro de claims (G1/G3) y revisa el animatic | Recibe el registro de claims ya armado, con fuente por claim | La firma de exactitud |
| **Cliente / stakeholder** | Objetivo de negocio, mandatorios, aprobación final | Sign-off en G0, G2, G3, G4, G6, G9 y G15 | Ve más opciones antes, a menor costo | Un **único aprobador final con nombre**; los demás son consultados |
| **Agente IA (Claude Code)** | Nada, porque **ejecuta** | Ninguno | Redacta borradores, construye escenas, corre checks y aplica cambios | No aparece nunca como A ni como aprobador |

### 1.2 RACI resumido

R = ejecuta · A = aprueba internamente (uno solo por fila) · C = consultado · I = informado · R* = el agente ejecuta bajo supervisión del R humano de la fila. Detalle completo en `templates/raci.md`.

| Fase | Prod | Guion | DC | Motion | TD | Editor | Sonido | QA | SME | IA | Sign-off cliente |
|---|---|---|---|---|---|---|---|---|---|---|---|
| G0 Brief | **A**/R | C | C | I | C | I | I | I | C | R* | **Sí** |
| G1 Investigación | A | R | I | I | I | – | – | I | C | R* | Si hay claims sensibles |
| G2 Treatment | C | R | **A** | C | C | I | I | – | I | R* | **Sí** |
| G3 Guion | C | R | **A** | C | I | C | I | C | C (veto de exactitud) | R* | **Sí** |
| G4 Styleframes | I | I | **A** | R | C | I | – | C | – | R* | **Sí** |
| G5 Storyboard | C | C | **A** | R | C | C | I | I | C | R* | Opcional (recomendado en corporativo) |
| G6 Animatic | C | C | **A** | R | C | R | C | I | C | R* | **Sí** |
| G6b VO final | A | C | C | I | I | I | R | I | C | R* (si es TTS) | Sí, si es voz de marca |
| G7 Build | I | I | **A** | R | R | C | I | I | I | R* | No |
| G8 Revisiones | **A** | C | R | R | C | R | C | I | C | R* | **Sí** |
| G9 Picture lock | **A** | C | R | R | I | R | I | C | C | – | **Sí** |
| G10 Sonido/mezcla | I | I | C | I | I | C | **A**/R | C | – | R* | En la R final |
| G11 Captions | I | C | I | I | C | R | I | **A** | C | R* | No |
| G12 Master | I | – | C | C | R | R | R | **A** | – | R* | No |
| G13 Versionado | C | I | **A** | R | R | R | C | C | – | R* | Muestra |
| G14 QA | I | C | C | C | C | C | C | **A**/R | C | R* | No |
| G15 Entrega/archivo | **A** | I | I | I | R | R | R | C | – | R* | **Acuse** |

### 1.3 Qué cambia en la organización

- **Pasa de "manos" a "dirección + verificación".** Lo escaso deja de ser la capacidad de animar y pasa a ser la capacidad de **especificar** con precisión y de **revisar** rápido. Hay que contratar y formar para eso: escritura de specs, ojo de revisión, criterio.
- **El motion designer no desaparece, sube de nivel.** Las fuentes coinciden en que el agente es mediocre para *inventar* gusto en motion, pero muy bueno para *ejecutar* un gusto que alguien sabe articular ([Medium/Balarabe](https://medium.com/@tahirbalarabe2/build-ai-motion-graphics-with-claude-and-remotion-0990e6bbf773)). También rinde menos en animación orgánica o de personajes ([Pexo](https://pexo.ai/blog/programmatic-vs-ai-generated-video-with-claude-code-remotion-hyperframes-and-pexo-compared-6108)). Esas escenas siguen siendo trabajo artesanal.
- **El agente no mira el video.** Revisa snapshots, mide el layout y corre auditorías, pero no percibe el ritmo. Rescroll lo resume así: "Claude doesn't watch your Studio preview" ([Rescroll](https://www.rescroll.ai/blog/claude-code-remotion-motion-graphics-2026)). Siempre tiene que haber un humano que reproduzca la pieza completa.
- **Un consolidador único de feedback.** Con iteraciones baratas, el riesgo es ejecutar notas contradictorias de cinco personas. El productor consolida y el motion director traduce a instrucciones (§8.6).

### 1.4 Lo que NO conviene delegar a la IA

| No delegar | Por qué | Qué sí puede hacer la IA |
|---|---|---|
| **Mensaje único, audiencia y objetivo** | Es una decisión de negocio con dueño humano, y el error se propaga a todo lo demás | Proponer alternativas y detectar incoherencias en el brief |
| **Claims técnicos, cifras, benchmarks, comparativos, pricing y roadmap** | Exposición legal y reputacional. Un LLM puede producir cifras plausibles pero falsas | Armar el registro de claims con fuente, y comparar en QA los números en pantalla contra el registro |
| **Datos de gráficos** | Un gráfico "lindo" con datos inventados es un riesgo grave | Ligar el gráfico a un CSV/JSON verificado. **Prohibido inventar datos** (va en `CLAUDE.md`) |
| **Elección de estilo, hook final y momentos héroe** | Es el gusto, y es lo que diferencia a la productora | Explorar variantes, ejecutar la elegida y mantener consistencia con los tokens |
| **Consolidar feedback contradictorio y negociar alcance** | Es relación con el cliente y contrato | Exportar y agrupar comentarios, y proponer una clasificación |
| **Derechos: música, voz (clonada o de locutor), imagen, logos de terceros, fuentes** | Licencias, consentimiento y Content ID | Llevar un ledger de procedencia de assets (`media-use` registra un manifest por asset) |
| **Decisión de disclosure de IA** (YouTube, AI Act, cliente) | Es una decisión de compliance | Marcar en QA las escenas con contenido sintético realista |
| **Visionado final completo en dispositivos reales y escucha de la mezcla** | El agente no "ve" el ritmo ni "oye" la mezcla | Pre-QA automatizado (specs, loudness, contraste, overflow, flashes) |
| **Publicar o enviar al cliente** | Es irreversible y tiene impacto externo | Preparar el paquete y la metadata, dejando la acción final a un humano |
| **Subir material de cliente a servicios externos** (issues públicos, APIs de visión de terceros) | Confidencialidad. HyperFrames advierte que su flujo `feedback --file-issue` sube el proyecto a una URL pública, y `snapshot --describe` envía frames a Gemini si hay API key | El TD deshabilita esas opciones o las restringe por política |

---

## 2. Fases, gates y entregables

### 2.0 Tabla maestra

Duración en **días hábiles de calendario**, incluida la latencia de feedback, para un cliente corporativo con aprobaciones de 24–48 h. Para un **canal propio** con aprobación interna en el día, los tiempos de calendario se reducen entre 40 y 50 %.

| # | Fase | Entregable de salida | Aprueba | 60–90 s | Explainer 3–5 min |
|---|---|---|---|---|---|
| G0 | Brief | `BRIEF.md` firmado + SOW + matriz de entregables | Productor + cliente | 0,5–1 | 1–2 |
| G1 | Investigación | Digest, registro de claims, glosario | Productor (SME firma claims) | 0,5–1 | 2–4 |
| G2 | Concepto / treatment | Treatment de 1 página + 2–3 hooks | DC + cliente | 1 | 2–3 |
| G3 | Guion | Guion a dos columnas firmado | DC + SME + cliente | 1–2 (2 rondas) | 3–5 (2–3 rondas + legal) |
| G4 | Moodboard / styleframes | Dirección elegida + `frame.md` con tokens | DC + cliente | 1–2 (en paralelo a G3) | 2–4 (en paralelo) |
| G5 | Storyboard | `STORYBOARD.md` + board de stills + shot list | DC | 1 | 2–4 |
| G6 | Animatic | Animatic con VO scratch + timing sheet | DC + cliente | 0,5–1 | 1–2 |
| G6b | VO final | WAV + timestamps por palabra | Productor (+ cliente si es voz de marca) | 0,5–1 | 1–2 |
| G7 | Build con IA | v01 interna (draft), proyecto con tag | DC (interno) | 1–3 | 4–8 |
| G8 | Revisiones | v02/v03 + changelog por ronda | Productor + cliente | 2–3 (2 rondas) | 4–6 (2–3 rondas) |
| G9 | Picture lock | Acta de lock firmada | Productor + cliente | Hito (24–48 h) | Hito |
| G10 | Sonido / mezcla | Mezcla, stems, M&E, reporte de loudness | Sonido | 0,5–1 | 1–3 |
| G11 | Captions | SRT/VTT por idioma + versión quemada | QA | 0,25–0,5 | 0,5–1 (+1–2 por idioma) |
| G12 | Master | Master de archivo + textless | QA | 0,25 | 0,5 |
| G13 | Versionado | Formatos, cutdowns, idiomas | DC | 0,5–1 | 1–2 |
| G14 | QA | Reporte de QA firmado | QA | 0,5 | 1 |
| G15 | Entrega / archivo | Paquete, acuse de recibo, archivo | Productor | 0,25 | 0,5 |
| | **Camino crítico** (con paralelismos) | | | **≈ 12–17 días (2,5–3,5 semanas)** | **≈ 25–35 días (5–7 semanas)** |
| | Referencia: flujo tradicional | | | 4–6 semanas | 6–10 semanas |

Las referencias de mercado para un explainer animado tradicional hablan de **4 a 8 semanas** de brief a entrega, con el guion en 1–3 rondas, el storyboard en 1–2 semanas y la animación como fase más larga. La variable que más pesa es **la velocidad de feedback del cliente** ([VideoIgniter](https://videoigniter.com/how-long-does-it-take-to-make-an-animated-explainer-video/), [Yum Yum Videos](https://www.yumyumvideos.com/blog/explainer-video-production-process/)).

### 2.1 Fichas por fase

Cada ficha sigue el formato **Objetivo · Inputs · Outputs · Aprueba · Criterio de salida · Rol de la IA · Errores comunes**.

**G0 — Brief**
- **Objetivo:** fijar qué tiene que lograr la pieza, cómo se mide y qué incluye el contrato.
- **Inputs:** pedido, kickoff (grabado y transcripto), material de producto, guía de marca, presupuesto tentativo.
- **Outputs:** `BRIEF.md` (plantilla), SOW con **rondas incluidas por gate** y precio de la ronda extra, matriz de entregables (pieza × formato × idioma × plataforma), calendario v1 con **fechas de feedback del cliente**.
- **Aprueba:** productor y cliente, por escrito.
- **Criterio de salida:** mensaje único en **una oración**; KPI primario con línea base; matriz cerrada; aprobador final con nombre; mandatorios legales listados; declaración de uso de IA aceptada por el cliente.
- **IA:** convierte la transcripción del kickoff en borrador de brief y lista de preguntas abiertas.
- **Errores:** tres mensajes "igual de importantes"; pedir "para todas las plataformas" sin matriz; aprobación por comité; KPI de vanidad; no preguntar por claims comparativos, benchmarks o roadmap no anunciado; no acordar la variante de español (es-419, es-AR, es-ES).

**G1 — Investigación**
- **Objetivo:** entender producto, audiencia, competencia y qué funciona en la plataforma; armar el **registro de claims**.
- **Inputs:** brief, documentación, changelog o PRs, demos, entrevista al SME, analytics de piezas previas (retención a 30 s, CTR) y outliers del nicho.
- **Outputs:** digest de 1–2 páginas; `claims.csv` (ID, claim, fuente primaria, fecha "a octubre 2026", condiciones, dueño, estado); glosario con pronunciación ("Kubernetes", "SQL", "GIF"); referencias visuales.
- **Aprueba:** productor; el SME firma los claims.
- **Criterio de salida:** toda cifra o afirmación técnica que pueda llegar al guion tiene **fuente primaria y fecha**.
- **IA:** sintetiza documentación y PRs, extrae specs y transcribe entrevistas. Todo lo que produce es **hipótesis** hasta que un humano lo verifica en la fuente.
- **Errores:** usar cifras de marketing sin las condiciones del benchmark; investigar después de escribir; no fijar la fecha de corte (la versión del producto cambia durante la producción).

**G2 — Concepto / treatment**
- **Objetivo:** elegir ángulo y estructura antes de escribir líneas.
- **Outputs:** treatment de 1 página con logline, ángulo, estructura por beats con porcentaje de duración, tono, **idea visual central** (metáfora o sistema gráfico), 2–3 hooks candidatos y plan de derivados (cutdowns, Shorts).
- **Aprueba:** DC y cliente.
- **Criterio de salida:** una dirección elegida; estructura y duración objetivo fijas.
- **IA:** propone entre 5 y 10 ángulos y hooks alternativos para ampliar el espacio; un humano filtra.
- **Errores:** saltear el treatment y discutir el concepto sobre el guion; elegir metáforas que el pipeline no puede ejecutar bien (personajes orgánicos, acting).

**G3 — Guion**
- **Objetivo:** palabras definitivas y spec visual por beat (§3).
- **Outputs:** `GUION.md` a dos columnas, con conteo de palabras, duración estimada y claims referenciados por ID.
- **Aprueba:** DC (creativo), SME (exactitud), legal si hay comparativos, y cliente.
- **Criterio de salida:** lectura en voz alta cronometrada dentro de ±10 % del objetivo; columna VIDEO completa en todas las filas; todos los claims en estado `aprobado`.
- **IA:** comprime al presupuesto de palabras, señala líneas largas o subordinadas difíciles de oír y genera variantes de hook.
- **Errores:** escribir para leer y no para oír; VIDEO vacío ("gráfico de esto"); cambiar el guion después del animatic, que es el cambio más caro del pipeline.

**G4 — Moodboard y styleframes** (en paralelo a G3, después de G2)
- **Objetivo:** congelar el look **antes** de animar.
- **Outputs:** moodboard con el porqué de cada referencia; 2–3 direcciones de 3–5 frames cada una, **renderizadas en la herramienta final** (HTML o React), para no aprobar algo que después no se puede construir; `frame.md`/`design.md` con tokens; opcionalmente un *motion test* de 5–10 s.
- **Aprueba:** DC y cliente (marca).
- **Criterio de salida:** dirección elegida, tokens congelados, contraste AA validado, fuentes con licencia que permita render a video.
- **Por qué antes de animar:** un styleframe adelanta la conversación de look al momento en que cambiarlo cuesta "una tarde y no dos semanas" ([Art of Styleframe](https://artofstyleframe.com/blog/styleframe-design-guide/)). El storyboard se aprueba por narrativa y el styleframe por dirección de arte; hacen falta los dos. **Con IA el argumento pesa más:** el agente propaga el look a todas las escenas, así que cambiarlo después del build obliga a revestir y re-revisar todo.
- **Errores:** aprobar solo el frame "lindo". Los styleframes tienen que incluir **el peor caso**: un bloque de código, un diagrama de 8 nodos, una tabla, la versión 9:16 y el end card con legales.

**G5 — Storyboard** (§5)
- **Outputs:** `STORYBOARD.md` con la spec por escena, el board de stills (`boards/storyboard.html`), el shot list en CSV y la lista de assets.
- **Aprueba:** DC; el motion director es el responsable.
- **Criterio de salida:** cada escena tiene VO literal, texto en pantalla literal, layout del key frame, movimiento descripto de forma ejecutable, transición, duración, assets con fuente y criterio de aceptación.
- **Errores:** boards prolijos pero sin timing; escenas sin texto en pantalla definido, que el agente termina inventando.

**G6 — Animatic con VO scratch**
- **Objetivo:** validar timing, orden, comprensión y ritmo **con audio** antes del build. Un animatic es la secuencia de cuadros del storyboard montada con sonido ([StudioBinder](https://www.studiobinder.com/blog/what-is-an-animatic-definition/)). Expone problemas de ritmo cuando arreglarlos todavía cuesta horas y no semanas ([Motif Motion](https://motifmotion.com/what-is-an-animatic)).
- **Inputs:** storyboard aprobado, VO scratch (TTS o lectura interna), música temporal con marca de agua.
- **Outputs:** MP4 del animatic con la leyenda "ANIMATIC — NO FINAL". En HyperFrames corresponde al *sketch pass*: frames estáticos con tipografía, colores y copy reales, y bloques en lugar de los gráficos, con status `built`.
- **Aprueba:** DC y cliente.
- **Criterio de salida:** duración total dentro de ±5 %; cada texto en pantalla tiene tiempo de lectura (§3.8); no quedan cambios de orden ni de guion. **Después de G6, cambiar el guion es un change order.**
- **IA:** produce el animatic casi sin costo (TTS + sketches con el layout real). Saltearlo deja de tener justificación.
- **Errores:** usar un TTS sin dirección y que el cliente se enamore de esa voz o la rechace; *temp love* por una música temporal que después no se puede licenciar.

**G6b — VO final** (subgate)
- **Por qué va acá:** en motion graphics la animación se cronometra a la voz. Grabar la VO después del build obliga a re-timear todo.
- **Outputs:** WAV 48 kHz/24 bit editado, **timestamps por palabra** (para sincronizar animación y captions) y pronunciación según el glosario.
- **Decisión humana:** locutor con contrato o TTS. Con TTS hay que revisar la licencia comercial del proveedor; una voz clonada solo con **consentimiento escrito específico por proyecto** (§4.7).

**G7 — Producción: build con IA**
- **Objetivo:** construir escenas que cumplan la spec y el sistema de diseño.
- **Inputs:** `STORYBOARD.md`, `SCRIPT.md`, `frame.md`, VO final con timestamps, assets ingestados (screen recordings, SVG, CSV o JSON de datos).
- **Proceso:**
  1. El TD crea el proyecto desde la plantilla: repo git, skills con versión fija, tokens y `CLAUDE.md` de la casa.
  2. El agente construye escena por escena, o en paralelo con subagentes por *frame packet* (escena + tokens + recetas citadas).
  3. Cada escena pasa `npx hyperframes lint` y `npx hyperframes check` (errores de runtime, layout con overflow y oclusiones, aserciones de movimiento y contraste WCAG AA) más `snapshot --at` en los key frames.
  4. El motion director revisa en preview, con reproducción completa.
  5. *Polish* manual de los momentos héroe.
  6. Ensamble y `render --quality draft` para la revisión interna.
- **Outputs:** proyecto con tag `int-v01`, render interno y log de decisiones.
- **Aprueba:** el DC internamente. **Nunca se muestra al cliente algo que el DC no vio completo.**
- **Criterio de salida:** todas las escenas en `animated`; `check` sin errores; duración dentro de ±2 % del animatic; revisión interna aprobada.
- **Errores:** dejar que el agente "mejore" escenas ya aprobadas (hay que pasarle siempre una lista de *no tocar*); no fijar versiones de skills y dependencias, lo que vuelve el render irreproducible; datos inventados; fuentes de fallback por no cargar las webfonts; usar `Date.now()` o random sin semilla (HyperFrames exige render determinista); mezclar texto vectorial nítido en 4K con screen recordings blandos en 1080p.

**G8 — Rondas de revisión** (§8)
- **Contrato típico:** **2 rondas incluidas** en el build. R1 es de contenido y estructura dentro de lo aprobado; R2 es de pulido. Una R3 solo corrige errores. Lo demás se cotiza.
- **Proceso:** se comenta con timecode en Frame.io o Vimeo; el productor consolida y clasifica; el motion director traduce a instrucciones para el agente; el agente aplica; se verifica; sale la nueva versión con changelog.
- **Criterio de salida:** todos los *Must* resueltos y verificados, con la respuesta en cada comentario indicando la versión en que se corrigió.
- **Errores:** feedback por cinco canales; cambios de guion disfrazados de feedback visual en R2; "más dinámico" sin referencia; re-revisar solo lo que cambió y no ver la pieza completa en R2.

**G9 — Picture lock**
- **Definición:** a partir de acá no cambian el orden, la duración de escenas ni el texto en pantalla, salvo errores. El lock es el punto en que el corte se declara final y después de él sonido, color y entregables se terminan sobre una línea de tiempo fija ([The Post Flow](https://thepostflow.com/post-production/post-production-workflows/the-post-production-workflow/), [Trisha Studios](https://trishastudios.com/knowledge/what-happens-after-picture-lock)).
- **Riesgo específico de la IA:** como "el cambio es fácil", se tiende a reabrir el lock. Pero cada cambio invalida la mezcla, los captions, las N versiones y el QA, y el costo real se multiplica por formatos × idiomas.
- **Firma:** acta de lock (versión, hash del commit, duración) firmada por el cliente.

**G10 — Sonido y mezcla** (§6.4)
- **Outputs:** mezcla estéreo en WAV 48 kHz/24 bit; stems de VO, música y SFX; **M&E** (música y efectos sin voz, para localizar); reporte de loudness (integrado, true peak, LRA).
- **Errores:** mezclar en auriculares y no chequear en el parlante del teléfono; música que tapa la VO en los términos técnicos.

**G11 — Captions** (§6.6)
- **Outputs:** SRT para plataformas y VTT para web, por idioma; versión con subtítulos quemados (*open*) para vertical; transcript.
- **Criterio de salida:** 100 % revisado por un humano contra el audio final y el glosario, con nombres de producto, mayúsculas de APIs y versiones correctos.

**G12 — Master**
- **Outputs:** master de archivo en **ProRes 422 HQ** (o DNxHR HQX en entornos Avid o Windows) con audio PCM; **textless** para localización; ProRes 4444 solo si hace falta alpha. El render tiene que ser reproducible desde el tag de git.
- **Dato de HyperFrames:** `render --format mov` siempre genera **ProRes 4444** (perfil fijo con alpha). Para un master opaco 422 HQ se transcodifica (§7.4).

**G13 — Versionado por formato**
- Recomposición nativa para 9:16, 1:1 y 4:5 (**no recorte del 16:9**), cutdowns de 6, 15 y 30 s, e idiomas. Con motion por código, el reencuadre es una variable de layout (composición responsiva), lo que es una **ventaja enorme** del pipeline con IA. Aun así, cada formato necesita revisión visual de safe zones (§7.2).

**G14 — QA** (`templates/qa-checklist.md`)
- Visionado completo en tres pantallas (monitor, laptop, teléfono), con y sin sonido, por **dos personas que no construyeron la pieza**, más los chequeos automáticos.

**G15 — Entrega y archivo** (`templates/delivery-checklist.md`)
- Paquete con naming, checksums, *delivery note*, licencias, metadata (título, descripción, capítulos), miniaturas y captions. Archivo: tag del repo, assets, fuentes, licencias, VO, stems, masters y log de decisiones.

---

## 3. Guionismo para contenido tech

### 3.1 Principios
- **Se escribe para el oído y para la pantalla a la vez.** Una idea por oración, verbos activos, sujeto al principio y nada de subordinadas anidadas.
- **Mostrar, no afirmar.** En tech la prueba visual (demo, número, antes y después) vale más que el adjetivo. Palabras como "revolucionario", "potente" o "seamless" no prueban nada.
- **Una escena, una idea.** La densidad mata la comprensión y la retención (§3.8).
- **La promesa del título y la miniatura se cumple en los primeros segundos.** La guía de MrBeast insiste en que el primer minuto concentra la mayor pérdida de audiencia y que tiene que entregar de inmediato lo que prometen título y miniatura ([PDF del handbook](https://cdn.prod.website-files.com/6623b7720b009050313e701c/66ede69453b7bbadcd2f05a8_How-To-Succeed-At-MrBeast-Production%20(2).pdf), [Tubefilter](https://www.tubefilter.com/2024/09/17/mrbeast-internal-production-guide-leaked-key-points/)). Es un documento filtrado y no oficial, pero sus principios coinciden con los datos de retención de YouTube.

### 3.2 Estructuras (beats con porcentaje de la duración)

| Estructura | Uso | Beats (porcentaje aproximado) | Nota tech |
|---|---|---|---|
| **Hook → Problema → Solución → Prueba → CTA** | Lanzamientos, spots de 30–90 s, ads | Hook 5–8 % · Problema 15–20 % · Solución 30–35 % · Prueba 20–25 % · CTA 8–10 % | La prueba es una demo real o un número con condiciones, no un testimonio genérico |
| **Explainer conceptual** | 3–5 min, YouTube y corporativo | Hook + promesa (≤20 s) · Por qué importa · Modelo mental (analogía) · Mecanismo en 3–5 bloques, cada uno con *re-hook* · Límites y trade-offs · Recap + CTA | Decir lo que **no** hace el producto da credibilidad |
| **How it works** | Arquitectura, protocolos, IA | Entrada → proceso → salida, siguiendo **un dato concreto** por el sistema ("sigamos este request"), con zoom in y out | El motion por código es ideal: diagramas que se construyen de a pasos |
| **Comparativa** | X vs Y, antes vs después | Criterios primero ("cómo lo evaluamos") · tabla progresiva · veredicto por caso de uso | Requiere legal: sustento, condiciones, fecha. Logos de terceros solo con OK legal |
| **Changelog / feature reveal** | Releases, PRs (HyperFrames tiene `/pr-to-video`) | Qué cambió en una pantalla · antes y después · cómo se usa · disponibilidad (plan, región, GA o beta, versión) | Versión y fecha **en pantalla**. 1 feature = 1 escena |
| **Tutorial** | How-to | Resultado final primero (≤5 s) · requisitos · pasos numerados (1 acción = 1 paso) · errores comunes · recap | Capítulos de YouTube; código legible (§3.8) |

### 3.3 Hooks de 3 a 5 segundos

YouTube mide la retención a los **30 s** como métrica "Intro" en su reporte de *key moments* ([YouTube Help](https://support.google.com/youtube/answer/9314415)). Paddy Galloway sostiene que **+10 % de retención** puede ser la diferencia entre 100 mil y 1 millón de vistas, que la mejora más rentable está en el intro (sumar 10 % a los 30 s) y que los CTA al inicio generan caídas ([Galloway en X](https://twitter.com/PaddyG96/status/1510219133895741443)). Otras guías piden **probar el título en los primeros 10 s** y explicar por qué importa en los 10 siguientes ([1of10](https://1of10.com/blog/how-to-hook-viewers-in-the-first-30-seconds-of-a-youtube-video/)).

| Tipo de hook | Ejemplo tech (ficticio) |
|---|---|
| Resultado primero | "Este deploy tarda 4 segundos. El mes pasado tardaba 11 minutos." |
| Creencia equivocada | "Tu base de datos no es lenta. Tus índices sí." |
| Número con contexto | "El 70 % de este bundle es código que nadie ejecuta." (con fuente en el registro de claims) |
| Demo imposible | El visual hace algo que el espectador no creía posible, sin VO durante 2 s |
| Stakes / costo | "Este bug le costó a un equipo tres días de guardia." |
| Pregunta específica | "¿Qué pasa realmente cuando escribís `git push`?" |

**Reglas de hook:** nada de "hola, bienvenidos" ni de intro de logo de 5 s (un sting de ≤1 s o el logo al final). **Movimiento desde el frame 1**, porque en feeds con autoplay mudo el primer frame es la miniatura. Texto en pantalla que funcione **sin sonido**. Coherencia con título y miniatura, para que no se sienta clickbait.

### 3.4 Retención y ritmo narrativo
- **Re-hooks:** en explainers de 3–5 min, un *open loop* o cambio de bloque cada **45–90 s** ("pero hay un problema…", "y esto es lo raro"). La guía de MrBeast describe re-enganches periódicos y progresión rápida en los primeros minutos ([Scrivner](https://www.danielscrivner.com/how-to-succeed-in-mrbeast-production-summary/)).
- **Cambio visual cada 2–4 s en redes y cada 4–8 s en explainers.** Es una orientación de la casa para medir contra la curva, no una regla de plataforma.
- **Medición:** curva de retención contra *typical retention* (los últimos 10 videos de duración similar), picos (re-visionado) y caídas (abandono). Cada caída mayor a la media se analiza en la retro y se convierte en regla del guion.

### 3.5 Presupuesto de palabras (narración)

A **140–150 wpm** (explainer); comerciales a 160–180 wpm; e-learning a 120–140 wpm ([The Voice Realm](https://www.thevoicerealm.com/count-script.php), [GoTeleprompter](https://goteleprompter.com/blog/voiceover-script-word-count-calculator/)). Hay que restar entre 10 y 15 % por pausas y respiros musicales.

| Duración | Palabras de VO (bruto) | Neto recomendado (con pausas) |
|---|---|---|
| 15 s | 35–40 | 30–35 |
| 30 s | 70–75 | 60–65 |
| 60 s | 140–150 | 120–130 |
| 90 s | 210–225 | 185–200 |
| 3 min | 420–450 | 370–400 |
| 5 min | 700–750 | 620–670 |

- **Para contenido técnico denso conviene bajar a 130–140 wpm.** Los nombres de API y los números se escuchan más lento.
- **Localización:** del inglés al español el texto suele crecer entre 15 y 20 % en palabras ([GoTeleprompter](https://goteleprompter.com/blog/voiceover-script-word-count-calculator/)). Hay que diseñar layouts con margen para textos un 20–30 % más largos.

### 3.6 Guion a dos columnas (AUDIO | VIDEO) y por qué es clave en motion

El formato AV separa lo que se oye de lo que se ve, fila por fila ([StudioBinder](https://www.studiobinder.com/templates/av-scripts/two-column-script-template/)). En motion graphics la columna VIDEO **es** la spec de producción, y en un flujo con agente es literalmente el input del build. Cada fila es un beat de 3 a 8 s, con estas columnas:

`# | TC in–out | Dur | AUDIO (VO literal · SFX · música) | VIDEO (visual · texto en pantalla literal · movimiento · transición) | Claims (IDs) | Notas`

Si la columna VIDEO de una fila dice "gráfico" o "animación copada", **la fila no está escrita** y el agente la va a completar con el promedio. Plantilla en `templates/guion-dos-columnas.md`.

### 3.7 Cómo escribir instrucciones visuales que una IA pueda ejecutar

**Diez reglas:**
1. **Anclar al tiempo:** timecode, o la palabra de la VO que dispara el evento ("cuando la VO dice 'ahora'").
2. **Usar tokens, no colores sueltos:** `--accent`, `--bg-900`, `type.display`.
3. **Texto en pantalla literal y entre comillas**, con mayúsculas exactas.
4. **Datos desde archivo:** `data/latencias.json`. Nunca "números de ejemplo".
5. **Un verbo de movimiento por elemento**, con duración y easing ("entra desde y+40 px, 0,5 s, power3.out").
6. **Estado inicial y final** de la escena (qué hay en pantalla al entrar y al salir).
7. **Reusar antes que describir:** nombrar un bloque o blueprint del registry o del catálogo (`npx hyperframes catalog --query "…"`) o un componente interno. Describir un look desde cero solo si no existe.
8. **Referencia visual:** el still aprobado (`boards/stills/S04.png`), un frame de una pieza anterior o un link.
9. **Restricciones negativas:** qué no hacer (sin partículas, sin glow, sin 3D, sin tocar S03).
10. **Criterio de aceptación verificable:** qué tiene que ser cierto en un snapshot en el TC X.

**Mal:** "Animación dinámica que muestre lo rápido que es el producto."
**Bien:**
> **S03 · 00:12–00:17 (5 s).** Fondo `--bg-900`. Dos barras horizontales alineadas a la izquierda en el grid de 12 col (col 2–11). Barra A, label "v1 — 11 min", color `--neutral-500`. Barra B, label "v2 — 4 s", color `--accent`. A crece de 0 a 100 % en 1,2 s (power2.out) cuando la VO dice "antes". B crece en 0,3 s cuando la VO dice "ahora". 0,2 s después aparece el label "−99 %" (`type.display`, scale 0,9→1, 0,25 s). Datos: `data/deploy-times.json` (claim C-007). Salida: corte seco. **No:** partículas, glow, ejes. **Aceptación:** en el snapshot a 00:16 "−99 %" es el elemento de mayor contraste y las cifras coinciden con el JSON; `check` sin overflow.

### 3.8 Densidad de información por escena
- **Una idea nueva por escena y como máximo tres elementos nuevos a la vez.**
- **Texto en pantalla:** el tiempo mínimo en pantalla es aproximadamente **1 s + 0,3 s por palabra**, y en piezas de redes no más de 7 palabras por frame. Es una orientación interna; en el animatic se valida leyendo en voz baja dos veces. **No poner en pantalla la misma oración que dice la VO** (redundancia): mostrar el keyword, el número o el diagrama.
- **Código en pantalla:** 8–12 líneas visibles como máximo, fuente monoespaciada de **≥28–32 px en 1080p**, la línea comentada resaltada y el resto atenuado. Animar el *diff*, no el archivo completo.
- **Diagramas:** construcción progresiva, nodo por nodo, sincronizada con la VO. Nunca el diagrama completo de entrada.
- **9:16:** la mitad de densidad que la versión 16:9.

### 3.9 Claims técnicos verificados
- **Registro de claims** (`research/claims.csv`): ID · texto exacto · tipo (performance, compatibilidad, seguridad, comparativo, pricing, roadmap, cliente o logo) · fuente primaria · fecha · condiciones · dueño · estado (propuesto, verificado, aprobado por SME, aprobado por legal).
- **Reglas:** (a) no aparece en pantalla ni en la VO ningún número sin ID; (b) los benchmarks llevan condiciones en un super o en la descripción; (c) la fecha de corte va escrita ("a octubre 2026"); (d) los comparativos pasan por legal; (e) **el agente tiene prohibido introducir cifras que no estén en el registro**, y QA compara los números del render con el registro.
- **Versionado del producto:** si la UI cambia durante la producción, la pieza se queda con la versión de corte acordada en el brief.

### 3.10 Tono
- Calibrar la jerga al nivel técnico de la audiencia, definido en el brief en una escala de 1 a 5. Explicar cada sigla la primera vez o no usarla.
- Por plataforma: YouTube conversacional y con opinión; LinkedIn sobrio y con datos; TikTok y Reels directo, en primera persona y con la conclusión primero; corporativo preciso y sin hype.
- Elegir variante de español en el brief (es-419 neutro, es-AR, es-ES) y mantenerla en VO, pantalla y captions.

---

## 4. Preproducción

### 4.1 Brief
Plantilla completa en `templates/brief.md`. Campos críticos: objetivo de negocio y de comunicación, audiencia (con nivel técnico), **mensaje único**, CTA, KPIs con línea base y ventana de medición, matriz de entregables, mandatorios de marca (link a `frame.md`), restricciones legales, **política de uso de IA acordada con el cliente**, presupuesto con rondas, calendario con fechas de feedback y aprobadores con SLA.

### 4.2 Treatment
Una página con logline, ángulo, estructura de beats con porcentajes, tono, idea visual central, 2–3 hooks, referencias y plan de derivados. Su función es elegir la dirección **antes** de gastar en escribir y diseñar.

### 4.3 Moodboard
Entre 8 y 15 referencias, cada una con **el porqué** (qué tomar: ritmo, paleta, transición, tipografía) y con un "no queremos" explícito. Las referencias de motion van como clips con timecode, no solo como imágenes fijas.

### 4.4 Styleframes y design spec
- Entre 3 y 5 frames por dirección, incluido el peor caso (§G4). En el pipeline con IA se construyen **en código** (HTML o React) para garantizar que sean ejecutables y para que la dirección aprobada se convierta directamente en tokens.
- El resultado es `frame.md` o `design.md`, con frontmatter normativo (colores, fuentes, spacing, radios, sombras) y prosa de contexto. HyperFrames lo lee como "verdad de marca" antes de cualquier escena (orden de precedencia `frame.md` → `design.md` → `DESIGN.md`).
- **Lenguaje de movimiento** (sumarlo al design spec): easing por defecto (por ejemplo `power3.out` para entradas y `power2.in` para salidas), duraciones estándar (micro 0,2–0,3 s, entradas 0,4–0,6 s, transiciones de escena 0,5–0,8 s), vocabulario cerrado de transiciones (corte, wipe de marca, match cut) y prohibiciones.

### 4.5 Lista de assets
Logos en SVG, fuentes (con licencia para video o render), UI del producto (Figma o captura), archivos de datos, íconos, footage, música, SFX y VO. Cada asset lleva **dueño, fuente, licencia y estado**. HyperFrames `media-use` registra procedencia en un manifest, y ese registro se usa como ledger de licencias.

### 4.6 Plan de captura (screen recordings, UI, b-roll)
- **Resolución:** capturar en 4K o en HiDPI al 100 % de zoom (en Retina, monitor 1:1 o escala nativa) para evitar blur ([Clueso](https://www.clueso.io/blog/how-to-make-tasteful-screen-capture-videos)). **Mezclar texto vectorial nítido con capturas blandas delata la pieza.**
- **Fps:** 30 para UI estática y 60 para scroll, drag and drop o cursor rápido. No mezclar 25 y 30 fps.
- **Entorno limpio:** zoom de la app al 110–125 %, notificaciones apagadas, wallpaper neutro y sin barras ni chrome del navegador ([Dynatrace style guide](https://styleguide.dynatrace.com/docs/product-capture/screen-recordings)). **Cuenta demo con datos ficticios**, sin PII ni nombres de clientes reales.
- **Cursor:** más lento que lo natural, con pausa antes y después de cada click; resaltado de clicks solo cuando suma ([UBC](https://wiki.ubc.ca/images/b/b5/Screencasting_Best_Practices.pdf)). Grabar cada acción como clip separado con 2 s de colas.
- **Pensar en el vertical:** capturar también un viewport alto o planificar la UI recreada.
- **UI recreada en código vs UI capturada.** El agente puede reconstruir la UI en HTML: queda nítida, animable por elemento y localizable. El riesgo es mostrar **una UI que no existe**. Solo se hace con aprobación del equipo de producto y sobre una captura de referencia.
- **B-roll:** stock con licencia. Si se usa video generado con IA que es realista, hay que evaluar disclosure (§6.3 y QA).

### 4.7 Plan de audio
- **VO:** locutor (casting, contrato, derechos de uso por medio, territorio y plazo) o TTS (licencia comercial del plan). **Voz clonada solo con consentimiento escrito, separado y específico por proyecto.** El apéndice de IA de SAG-AFTRA exige consentimiento "claro y conspicuo", por escrito separado y por proyecto ([SAG-AFTRA](https://www.sagaftra.org/sites/default/files/Sound%20Recordings%20Code%20Appendix%20on%20Artificial%20Intelligence.pdf)). El acuerdo con Narrativ exige consentimiento del performer para cada uso publicitario ([SAG-AFTRA/Narrativ](https://www.sagaftra.org/sag-aftra-and-narrativ-announce-new-agreement)). Leyes estatales como la ELVIS Act de Tennessee protegen la voz como derecho de imagen.
- **Glosario de pronunciación** entregado al locutor o configurado en el TTS.
- **Música y SFX:** librería y tier de licencia definidos en el brief (§6.3). *Cue sheet* por pieza.
- **Targets de mezcla** por plataforma definidos desde el inicio (§6.4).

### 4.8 Cronograma
Ver §9.3. Regla: **las fechas de feedback del cliente van en el contrato.** Una cláusula del tipo "sin comentarios en 48 h hábiles se considera aprobado" evita que la latencia se coma el ahorro de la IA.

---

## 5. Storyboard y animatic

### 5.1 Formato de storyboard para motion graphics

| Campo | Contenido |
|---|---|
| Frame / escena | ID estable (`S01`…). No se renumera; si se inserta una escena, es `S03b` |
| Timecode in–out y duración | Del animatic aprobado |
| VO | Literal, con la palabra ancla de cada evento |
| Texto en pantalla | Literal, con mayúsculas exactas |
| Layout / key frame | Still aprobado (`boards/stills/S03.png`) |
| Movimiento | Elementos × verbo × duración × easing × disparador |
| Transición in/out | Del vocabulario cerrado |
| SFX y música | Cue, sincronía y nivel relativo |
| Assets y datos | Rutas y licencias |
| Claims | IDs del registro |
| Aceptación | Lo que debe ser cierto en un snapshot |
| No tocar | Elementos o escenas protegidas |
| Notas | Intención, referencia |

### 5.2 Shot list
Es la lista de **todo lo que hay que conseguir o fabricar**: capturas, b-roll, UI mock, gráficos de datos, 3D, footage de la entrevista. Indica para cada ítem tipo, fuente, responsable, specs, escena destino, estado y licencia. Plantilla en `templates/shot-list.csv`.

### 5.3 Del storyboard a una especificación ejecutable escena por escena
- **Formato:** `STORYBOARD.md` compatible con el parser de HyperFrames. El frontmatter lleva `format`, `duration`, `message`, `arc` y `audience`. Hay un bloque `## Frame N — Título` por escena con `status`, `src`, `duration`, `transition_in`, `scene`, `voiceover` y `poster`. **Cualquier otra clave** (por ejemplo `on_screen_text`, `motion`, `acceptance` o `do_not`) se conserva en `extra`, así que la spec de la casa viaja con el storyboard sin romper el parser. La plantilla `templates/storyboard.md` se validó con `parseStoryboard` del repo: 3 frames, 0 warnings y todas las claves de la casa preservadas.
- **Unidad de despacho:** cada bloque se convierte en un *frame packet* (la spec de la escena, el blueprint o las reglas citadas y los tokens). Los workers del agente leen **solo su packet y el design spec**. Eso permite construir en paralelo y aplicar correcciones localizadas sin tocar otras escenas.
- **Ciclo de estados:** `outline` (spec escrita) → `built` (layout confirmado en sketch, que es el animatic) → `animated` (movimiento y assets reales). La convención de la casa agrega `locked` en `extra.lock: true` después de G9.
- **Escenas como subcomposiciones independientes:** un archivo por escena (`compositions/frames/S03.html`) con su `*.motion.json` (duración y vectores de entrada y salida para empalmar transiciones).
- **En Remotion:** el mismo `STORYBOARD.md` se transforma en un JSON de props con un componente o `<Sequence>` por escena. Remotion no sabe qué dice la VO, así que hacen falta timestamps por palabra para sincronizar ([Rescroll](https://www.rescroll.ai/blog/claude-code-remotion-motion-graphics-2026)).
- **Orden de build:** primero el sistema (tokens, componentes reutilizables), después la escena más difícil o representativa como prueba de estilo, después el resto y al final las transiciones y el ensamble.

### 5.4 El animatic como gate
- **Qué se evalúa:** ¿se entiende sin explicación? ¿El hook funciona en 5 s? ¿Hay tiempo de lectura? ¿El orden es el correcto? ¿La duración está en el objetivo? ¿Hay escenas que sobran?
- **Cómo se muestra:** VO scratch, música temporal con marca de agua y la leyenda "ANIMATIC". Se explica al cliente qué **no** se evalúa todavía (movimiento final, color fino).
- **Cierre:** después de G6 el guion y el orden quedan congelados. Lo que cambie después es change order con impacto en calendario.

---

## 6. Edición y postproducción

### 6.1 Pacing y cortes
- Los cortes van sobre el beat o la palabra ancla, no a mitad de palabra.
- Alternar ritmos: secuencias rápidas, y respiro de 0,5–1 s después de cada dato clave.
- El equivalente motion de "cortar en la acción" es transicionar en el pico del movimiento o con match cut de formas (el círculo que cierra una escena es el que abre la siguiente).
- Revisar el pacing **siempre en reproducción continua y a velocidad 1×**. Los snapshots no muestran el ritmo.

### 6.2 J-cuts y L-cuts aplicados a motion
- En el **J-cut** el audio de la escena siguiente entra antes que su imagen. En el **L-cut** el audio de la anterior sigue sobre la nueva imagen. Son herramientas para controlar el ritmo y suavizar transiciones ([StudioBinder](https://www.studiobinder.com/blog/what-is-an-l-cut)). La práctica recomendada es armar primero el corte seco y recién después dividir audio e imagen ([Filmdaft](https://filmdaft.com/the-l-cut-and-j-cut-how-film-editors-use-audio-to-control-time/)).
- **En motion:** un SFX *whoosh* que pre-lapea la transición visual entre 4 y 8 frames; la VO de la escena siguiente que arranca mientras la anterior sale; una cola musical o un *riser* sobre la escena nueva (L).

### 6.3 Música: licencias, librerías e IA

| Opción | Modelo | Trabajo para clientes | Riesgo / nota |
|---|---|---|---|
| **Epidemic Sound** | Suscripción | El tier de entrada **no** cubre trabajo para clientes ni publicidad de marca. Hace falta **Pro**; broadcast va por Pro Plus | Perpetuidad para lo publicado durante la suscripción [verificar la licencia vigente] |
| **Artlist** | Suscripción, licencia universal | Pro o Business según el uso. Las fuentes discrepan sobre cuál alcanza para agencia | Confirmar el tier antes de firmar ([The Post Flow](https://thepostflow.com/post-production/video-editing/music-subscriptions-compared/), [Restorm](https://restormuk.com/2026/07/28/artlist-vs-epidemic-sound/)) |
| **Musicbed** | *Rights-managed*, por proyecto | Licencia por canción × edit × uso | Penalidades altas por uso no autorizado; ideal para piezas premium ([Soundstripe](https://www.soundstripe.com/blogs/musicbed-alternatives)) |
| **Música generada con IA** (Suno, Udio y similares) | Según el plan | Riesgosa para clientes | (1) Sin autoría humana no hay copyright en EE. UU., así que la productora **no puede ceder exclusividad** ([Copyright Office Part 2](https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf)). (2) Los planes gratuitos no dan uso comercial ([terms.law](https://terms.law/ai-output-rights/suno/)). (3) Hay riesgo de falsos positivos de Content ID y no se puede registrar en Content ID ([Undetectr](https://undetectr.com/blog/ai-music-youtube-copyright-claims)). (4) Litigios con las discográficas parcialmente resueltos. **Uso recomendado:** música temporal interna o piezas propias de bajo riesgo, con OK legal |

**Reglas:** guardar el certificado de licencia por pieza en `archive/licenses/`; registrar el canal del cliente en la librería (*whitelisting*) si la librería lo permite; nunca entregar con música temporal.

### 6.4 Mezcla y loudness

| Destino | Integrado | True peak | Fuente / nota |
|---|---|---|---|
| **YouTube** | **−14 LUFS** (normaliza hacia abajo y **no sube** lo bajo) | −1 dBTP | Consenso de fuentes ([Critical Listening Lab](https://www.criticallisteninglab.com/en/learn/loudness)) |
| Spotify (video o podcast) | −14 LUFS | −1 dBTP (−2 si el master es muy fuerte) | [Venia](https://veniamastering.studio/blog/how-loud-should-your-master-be-in-2026/) |
| Apple Podcasts | −16 LUFS ±1 | −1 dBTP | Fuente secundaria [verificar] |
| AES TD1008 (streaming de voz) | −18 LUFS (rango −16 a −20) | −1 dBTP | [AES TD1008](https://aes.org/wp-content/uploads/2024/01/20210924_TD1008_v3.13.pdf) |
| TikTok / Reels / Shorts / LinkedIn / X | **No documentado oficialmente**; las fuentes dicen de −9 a −16 | −1 dBTP | Recomendación de la casa: **−14 LUFS / −1 dBTP** como master único web |
| Broadcast UE (**EBU R128**) | −23 LUFS (±0,5 LU; ±1 LU en vivo) | −1 dBTP | [RTW](https://www.rtw.com/blog/rtw-knowledge-base-1/worldwide-loudness-delivery-standards-4) |
| Broadcast EE. UU. (ATSC A/85) | −24 LKFS ±2 | −2 dBTP | [Fora Soft](https://www.forasoft.com/learn/audio-for-video/articles-audio/loudness-normalization-ebu-r128-bs1770-atsc-a85) |
| Netflix (referencia de rigor) | −27 LKFS **dialog-gated** ±2 | −2 dBTP | [Netflix Sound Mix Spec v1.6](https://partnerhelp.netflixstudios.com/hc/en-us/articles/360001794307-Netflix-Sound-Mix-Specifications-Best-Practices-v1-6) |
| Eventos, pantallas e intranet corporativa | Recomendación de la casa: −16 a −18 LUFS | −1 dBTP | Preguntar por el sistema de reproducción del venue |

**Práctica:**
- La VO es lo primero. La música va de 15 a 20 dB por debajo durante el habla, con ducking o *voiceover carve*, que en HyperFrames atenúa la música solo en las bandas de la voz.
- La LRA es moderada, porque en móvil las dinámicas amplias se pierden.
- **Chequear en el parlante del teléfono.**
- Medir con `ffmpeg -af ebur128=peak=true` o `npx hyperframes audio` (BS.1770, integrado, short-term, sample y true peak, clipping).
- Entregar stems y **M&E**.

### 6.5 Color
- El motion por código es **sRGB** y la entrega va en **BT.709** etiquetada (`-color_primaries bt709 -color_trc bt709 -colorspace bt709`), para evitar el corrimiento de gamma entre reproductores.
- **Cuidado con el 4:2:0:** texto fino rojo o magenta sobre azul o negro sangra en H.264 y H.265. Conviene usar pesos tipográficos más gruesos y evitar pares de color saturado complementario en texto pequeño.
- **Banding en gradientes:** agregar un ruido o dither sutil y renderizar con bitrate alto.
- **UI oscuras:** no aplastar los negros cercanos a 0, que se ven como bloques en compresión.
- Verificar los colores de marca en el monitor y en dos teléfonos (OLED y LCD).
- Si hay footage, la corrección técnica va antes que el grade creativo, y el footage se ajusta al look de los gráficos.

### 6.6 Captions
- **Formatos:** SRT (sin header, coma antes de los milisegundos; el formato más compatible para YouTube, LinkedIn y Facebook) y **WebVTT** (header `WEBVTT`, posición y estilos; estándar para `<track>` en HTML5 y reproductores web) ([Vocova](https://vocova.app/blog/srt-vs-vtt)).
- **Estilo:** **32–42 caracteres por línea, máximo 2 líneas**, cues de 1 a 7 s y sin cortar sintagmas ([AIR](https://air.io/en/youtube-hacks/best-practices-for-writing-and-formatting-subtitles)). Es una convención de estilo; WCAG pide captions sincronizados (1.2.2 y 1.2.4), no un límite de caracteres.
- **Closed vs quemados:** los *closed* se pueden apagar, son indexables y accesibles para tecnologías de asistencia. Los quemados (*open*) son parte del diseño en vertical, donde la mayoría mira sin sonido. **Recomendación:** en vertical, quemados de diseño **más** SRT subido donde la plataforma lo acepte; en 16:9, closed.
- **Con IA:** transcribir desde la VO final con timestamps por palabra (`npx hyperframes transcribe`) y **revisión humana obligatoria** contra el glosario (nombres de producto, `camelCase` de APIs, versiones).
- Los captions quemados se diseñan **dentro de la safe zone** (§7.2).

### 6.7 Versiones por plataforma
Matriz en el brief. Principio: **componer nativo por formato, no recortar.** Cada versión tiene su propia revisión de safe zones, densidad (la mitad en 9:16) y CTA de plataforma.

---

## 7. Specs de entrega 2026 por plataforma

> Las plataformas cambian specs varias veces al año. **Hay que confirmar contra la ayuda oficial antes de cada campaña.** Donde las fuentes discrepan se marca [verificar].

### 7.1 Tabla de specs

| Plataforma | Formato / resolución | fps | Codec / contenedor | Duración máx. | Peso máx. | Notas |
|---|---|---|---|---|---|---|
| **YouTube (largo)** | 16:9 · 3840×2160 o 1920×1080 | El nativo de la pieza (24/25/30/48/50/60) | MP4, H.264 High, progresivo, **moov al inicio (fast start)**, sin edit lists, GOP cerrado de la mitad del fps, CABAC, VBR; AAC-LC 48 kHz estéreo 384 kbps; BT.709 ([YouTube Help](https://support.google.com/youtube/answer/1722171)) | 12 h (cuenta verificada; sin verificar, 15 min) | 256 GB | **Bitrate SDR:** 1080p 8 Mbps (24–30) / 12 Mbps (48–60); 4K 35–45 / 53–68 Mbps ([Joseph Nilo](https://josephnilo.com/blog/best-target-bitrate-for-youtube/)). Práctica: subir en 4K aunque la pieza sea 1080p mejora el códec de reproducción [práctica, no spec] |
| **YouTube Shorts** | 9:16 · 1080×1920 (mínimo 720×1280); 1:1 también clasifica | 24–60 | MP4 H.264 + AAC | **3 min** (desde el 15 de octubre de 2024) | Igual que YouTube | Más ancho que cuadrado no es Short ([1of10](https://1of10.com/blog/how-long-can-youtube-shorts-be/)) |
| **Instagram Reels** | 9:16 · 1080×1920 | 30 (24–60) | MP4 H.264 + AAC | 3 min estándar; algunas cuentas suben más largos, pero el alcance a no seguidores cae después de 3 min [verificar] | 4 GB (conviene menos de 1 GB) | La grilla del perfil muestra la portada en 3:4: la info crítica de la portada va en el centro ([ScreenSnap](https://www.screensnap.pro/blog/instagram-reels-size-guide), [SocialCal](https://www.socialcal.app/blog/instagram-video-length-limits-2026)) |
| **TikTok** | 9:16 · 1080×1920 (mínimo 540×960) | 30 (60 para movimiento rápido) | MP4/MOV H.264 + AAC | 10 min para la mayoría; 60 min en algunas cuentas o por web [verificar] | Unos 287 MB en móvil; por web, cifras de 500 MB a 10 GB según la fuente [verificar] | Ads: 5–60 s, ≤500 MB ([Sked](https://skedsocial.com/blog/tiktok-video-size-guide), [filesize.org](https://filesize.org/limits/tiktok/)) |
| **LinkedIn (orgánico)** | 16:9, 1:1, 4:5 (vertical recomendado), 9:16 · hasta 1920 px | 30 | MP4 H.264 + AAC | 15 min por escritorio [verificar] | 5 GB [verificar] | Acepta SRT |
| **LinkedIn Ads** | 9:16 a 16:9 · 360–1920 px | 30 | MP4, audio AAC o MPEG4 | 3 s – 30 min | 75 KB – **500 MB** (oficial; varias guías todavía dicen 200 MB) | ([LinkedIn Business](https://business.linkedin.com/advertise/ads/sponsored-content/video-ads/specs)) |
| **X** | 16:9 1920×1080 o 1280×720; máximo 1920×1200 / 1200×1920 | ≤60 | MP4/MOV **H.264** (H.265 rechazado según guías) + AAC | Gratis: **2:20**. Premium: varias horas [verificar] | Gratis: 512 MB; Premium: 8–16 GB [verificar] | ([VideoToolery](https://videotoolery.com/blog/x-twitter-video-size-limits)) |
| **Miniatura YouTube** | 1280×720 (16:9), ancho mínimo 640 | — | JPG / PNG / GIF | — | **2 MB** | Diseñar legible a 160 px de ancho; "Test & Compare" de YouTube permite A/B de miniaturas [verificar la disponibilidad en el canal] ([ThumbnailTest](https://thumbnailtest.com/guides/youtube-thumbnail-size/)) |

### 7.2 Safe zones en vertical (1080×1920)
- **Meta (Reels y Stories):** dejar libre el **14 % superior** (≈269 px), el **35 % inferior** (≈672 px) y el **6 % a cada lado** (≈65 px). Para disclaimers se recomienda hasta 40 % abajo ([Solid Labs](https://www.solidlabs.com/social-safe-zones)).
- **TikTok:** márgenes medidos por terceros de aproximadamente 130–140 px arriba, 320–480 px abajo y 140–180 px a la derecha (columna de botones). No hay spec oficial ([Brandeal](https://brandeal.ai/en/blog/tiktok-safe-zone-guide), [Postplanify](https://postplanify.com/blog/social-media-safe-zones-2026-complete-guide)).
- **Regla de la casa ("zona segura universal 9:16"):** la intersección conservadora, **x 65–900 px, y 270–1248 px**, para todo lo crítico (claims, logo, CTA, captions quemados). Lo decorativo puede ocupar el frame completo. Se automatiza como overlay de guía en el preview y como chequeo en QA, con un elemento `#safe-zone` y `check` de overflow.

### 7.3 Master de archivo vs entregables
| Tipo | Codec | Uso |
|---|---|---|
| **Master de archivo (mezzanine)** | **ProRes 422 HQ** (10 bit) o **DNxHR HQX** (Windows, Avid, broadcast), audio PCM 48 kHz/24 bit | Fuente de todas las versiones. **Nunca se re-exporta desde un comprimido** ([Lowepost](https://lowepost.com/courses/blog/the-difference-between-dnxhr-and-prores-codecs-r4/), [MpegFlow](https://www.mpegflow.com/topics/codecs/mezzanine-codecs)) |
| Master con alpha | ProRes 4444 (es lo que emite `hyperframes render --format mov`) o WebM VP9 con alpha para web | Overlays para editores o NLE |
| Textless | Igual que el master, sin textos ni captions | Localización |
| Entregables | H.264 (máxima compatibilidad); H.265 o AV1 solo donde la plataforma lo acepte (X rechaza H.265) | Publicación |
| Fuente "verdadera" | **El repo** (código de la composición + assets + tokens + lockfile) con tag | Re-render en cualquier resolución o idioma. Es el archivo más valioso del pipeline con IA |

Como referencia de rigor, Netflix exige masters ProRes 422 HQ o paquetes IMF, mezclas a −27 LKFS dialog-gated, stems, M&E, textless, captions y QC formal ([DeliveryQC](https://deliveryqc.com/netflix-delivery-specs), [The Post Flow](https://thepostflow.com/filmmaker-resources/delivery-specs-cheat-sheet/)). No entregamos a Netflix, pero adoptamos su disciplina: **schedule de entregables, stems, textless, reporte de QC y naming.**

### 7.4 Recetas ffmpeg (TD)
```bash
# Master opaco ProRes 422 HQ desde el MOV 4444 de HyperFrames
ffmpeg -i render_4444.mov -c:v prores_ks -profile:v 3 -vendor apl0 -pix_fmt yuv422p10le \
  -c:a pcm_s24le -ar 48000 MASTER_422HQ.mov

# Entregable YouTube 1080p30 (H.264 High, GOP = fps/2, BT.709, faststart)
ffmpeg -i MASTER_422HQ.mov -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p \
  -crf 16 -maxrate 12M -bufsize 24M -g 15 -bf 2 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 384k -ar 48000 -movflags +faststart YT_16x9_1080p30.mp4

# Medir loudness y true peak
ffmpeg -i YT_16x9_1080p30.mp4 -af ebur128=peak=true -f null -

# Normalizar la mezcla a -14 LUFS / -1 dBTP (pasada 1: medir; pasada 2: aplicar con measured_*)
ffmpeg -i mix.wav -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null -

# Specs para QA
ffprobe -v error -show_entries stream=codec_name,profile,width,height,r_frame_rate,pix_fmt,color_primaries,bit_rate,sample_rate,channels -of compact FILE.mp4
```
En HyperFrames: `render --quality draft` para revisiones, `--quality high` para el master, `--fps` explícito, `--format webm` y `--format mov` para alpha. La documentación del CLI (`docs/packages/cli.mdx`) documenta además `snapshot`, `compare`, `keyframes` y `history` para QA y control de cambios.

---

## 8. Revisión y aprobación

### 8.1 Herramientas
| Herramienta | Fortalezas | Límites | Uso recomendado |
|---|---|---|---|
| **Frame.io** | Comentarios con **frame exacto** y por rango, dibujo sobre el cuadro, *version stacks* (comparar v02 y v03 lado a lado), aprobación registrada, **export de comentarios a CSV o XML** | El flujo de aprobación es básico frente a herramientas dedicadas ([Increditors](https://increditors.com/frame-io-video-review-guide/), [Framekit](https://framekit.ai/blog/best-video-review-and-approval-tools-2026)) | Estándar para clientes. El CSV de comentarios es **el input del agente** |
| Vimeo (review) | Simple, familiar para clientes, comentarios con timecode | Menos control de versiones y aprobación | Clientes chicos o canal propio |
| Google Drive / Docs | Ideal para brief, treatment y guion (modo sugerencia) | **No sirve para video** (sin frame exacto) | Solo documentos |
| HyperFrames Studio / preview | Timeline vivo y editable, cambios al instante | Interno; localhost no llega al cliente | Revisión interna DC y motion director, sesiones en vivo |

### 8.2 Feedback accionable sobre motion
**Fórmula: timecode (o rango) + qué + por qué + referencia + prioridad.**
- "No me gusta el gráfico" no sirve.
- Sirve: "**00:41–00:44** · Las barras entran demasiado lento y el dato clave aparece último · **Por qué:** el espectador pierde la conclusión · **Ref:** el ritmo de S02, que sí funciona · **Must**." Las guías de Frame.io recomiendan notas con objetivo, momento exacto y resultado aceptable, por ejemplo "a 00:17 sostener el close-up 2 s más para que se lea la etiqueta".
- **Categorías:** *Bug* (error objetivo) · *Cambio* (dentro de lo aprobado) · *Nuevo alcance* (contradice un gate aprobado, y genera change order).
- **Prioridad:** *Must* / *Should* / *Could*.
- **Subjetivo vs objetivo:** las notas subjetivas sin "por qué" vuelven al cliente pidiendo la intención antes de ejecutarlas.

### 8.3 Número de rondas
- **Gates de documento** (brief, treatment, guion): 2 rondas cada uno.
- **Styleframes:** elección entre 2–3 direcciones más 1 ronda de ajuste.
- **Animatic:** 1 ronda más un ajuste menor.
- **Build:** 2 rondas (R1 y R2) más R3 solo para bugs.
- **Una ronda = una lista consolidada de una sola fuente, en una sola entrega.** Comentarios sueltos que llegan después son parte de la siguiente ronda.
- Cualquier cambio que contradiga un gate firmado es **change order**, con costo y fecha.

### 8.4 Versionado y naming
Ver `templates/naming-convention.md`. Resumen: `CLIENTE_PROYECTO_PIEZA_FASE_vNN_FORMATO_IDIOMA_AAAAMMDD.ext`. Nunca "final", "final2" ni "definitivo". Las versiones al cliente son `v01`, `v02`…; las internas, `v02.3`. Cada versión al cliente corresponde a un **tag de git** (`rvw-v02`) y lleva changelog.

### 8.5 Control de cambios
- **Un repo git por proyecto.** Commit por ronda; tag por versión mostrada; el hash va en el acta de lock.
- **HyperFrames `history`** registra cada cambio con autor y etiqueta (`history begin --who claude --label "R1 FB-012"`) y permite `undo`. Conviene usarlo para cambios del agente en sesión, y git para hitos.
- **Escenas protegidas:** después de la aprobación de una escena se marca `extra.lock: true` en el storyboard, y toda instrucción al agente incluye la lista de *no tocar*.
- **Revisión diferencial:** en R1 y R2 se revisan primero las escenas cambiadas (con `compare` o snapshots antes y después en el mismo timecode) y **después la pieza completa**.

### 8.6 Traducir feedback humano a instrucciones para el agente
**Flujo:**
1. Exportar los comentarios (CSV de Frame.io).
2. El productor consolida, resuelve contradicciones y clasifica.
3. El motion director interpreta: convierte el síntoma en causa.
4. Se escribe la instrucción para el agente (plantilla en `templates/review-feedback.md`).
5. El agente aplica, corre `check` y saca snapshots en los timecodes.
6. El motion director verifica en reproducción.
7. Se responde el comentario original indicando la versión que lo corrige.

| Feedback humano | Diagnóstico (motion director) | Instrucción al agente |
|---|---|---|
| "Más dinámico" | La duración media de escena es de 7 s y las entradas son lineales | "S02–S05: entradas a 0,4–0,5 s con power3.out; stagger de 0,06 s; acortar los holds a ≤1,5 s después de cada dato; sin cambiar la duración total ni el texto" |
| "No se lee" | Texto de 24 px sobre un gradiente y 1,2 s en pantalla | "S07: subir `type.body` a 36 px, fondo sólido `--bg-800` detrás del texto, mantener el texto 2,5 s (VO 'latencia' + 1,5 s); aceptación: contraste ≥4,5:1 en `check`" |
| "Se siente barato" | Mezcla de 4 easings, sombras genéricas, ícono stock | "Aplicar el easing del design spec en todas las escenas; quitar sombras no tokenizadas; reemplazar el ícono por el SVG de marca `assets/icons/deploy.svg`" |
| "El logo más grande" | El end card no sigue la guía de marca | "S12: logo a 22 % del ancho según `frame.md`, centrado y con área de respeto del token `logo.clearspace`; no tocar el claim" |
| "Cambiemos esta frase" (en R2) | Cambio de guion después del animatic, que es change order | No va al agente hasta que el productor lo aprueba como change order (VO, captions y timing) |

---

## 9. Gestión

### 9.1 Estimación de esfuerzo (horas humanas)

**Estimación propia**, con un equipo con experiencia y a calibrar en el piloto. Referencias de mercado para la animación tradicional: un animador de motion plano produce de 30 a 45 s terminados por día en los casos simples ([Magic Motion](https://magicmotionstudio.com/how-long-does-2d-animation-take/)), y entre 5 y 10 s por día en infografía tipo After Effects (≈45–90 h por minuto) ([StuCreative](https://www.stucreative.com/how-long-will-my-animation-take)).

| Fase | 90 s tradicional | 90 s con IA | 4 min tradicional | 4 min con IA | Dónde está el ahorro |
|---|---|---|---|---|---|
| Brief + kickoff | 4–6 | 3–5 | 6–10 | 5–8 | Actas y borradores |
| Investigación + claims | 4–8 | 3–6 | 12–20 | 9–15 | Síntesis. **La verificación no se acelera** |
| Treatment | 4–6 | 3–4 | 8–12 | 6–9 | Exploración de variantes |
| Guion (2–3 rondas) | 6–10 | 5–8 | 16–28 | 12–22 | Compresión, timing |
| Moodboard + styleframes | 12–20 | 8–14 | 16–28 | 10–18 | Exploración en código |
| Storyboard | 8–12 | 6–10 | 20–32 | 14–24 | Sketches automáticos (la spec se escribe con más precisión) |
| Animatic + VO scratch | 6–10 | 1–3 | 12–20 | 3–6 | TTS + sketch pass |
| VO final (dirección + edición) | 2–4 | 2–4 | 4–8 | 4–8 | — |
| **Build / animación** (incluye dirección y polish) | **60–110** | **18–40** | **160–300** | **50–110** | **Ahí está el grueso del ahorro** |
| Revisiones (2 rondas) | 10–20 | 5–10 | 24–40 | 12–24 | Aplicación de cambios |
| Sonido / mezcla | 6–10 | 4–8 | 12–24 | 8–18 | Análisis y ducking automáticos |
| Captions | 1–2 | 0,5–1 | 2–4 | 1–2 | Transcripción. La revisión sigue siendo humana |
| Master + versiones (3 formatos) | 8–16 | 3–6 | 12–24 | 5–10 | Composición responsiva |
| QA + entrega + archivo | 4–6 | 3–5 | 6–10 | 5–8 | Chequeos automáticos. El visionado no se acelera |
| Harness / TD (amortizado) | 0 | 3–6 | 0 | 5–10 | Costo nuevo |
| Gestión de proyecto (~12 %) | 15–25 | 10–18 | 35–60 | 20–35 | — |
| **Total** | **≈150–275 h** | **≈85–150 h** | **≈350–640 h** | **≈170–330 h** | **−40 a −50 %** |

### 9.2 Costos
- **Fórmula:** costo = Σ(horas por rol × tarifa) + talento (locutor) + licencias (música, stock, fuentes) + **IA** (tokens o asientos) + render (local, o nube con Lambda o Cloud Run) + herramientas (Frame.io, licencia de framework) + contingencia de 10–15 %.
- **Ejemplo** con tarifa combinada de USD 55–75/h: 90 s tradicional ≈ **USD 8–20 mil**; con IA ≈ **USD 4,7–11 mil** más IA y licencias. Contraste de mercado: la mediana de 61 cotizaciones para un explainer animado custom de 60 s fue **USD 9.680** (julio de 2026), con rangos de USD 5–20 mil ([Yum Yum Videos](https://www.yumyumvideos.com/blog/how-much-does-an-explainer-video-cost/)). Hay estudios "asistidos por IA" que cotizan USD 1.500–2.500 por 60 s ([Yans Media](https://www.yansmedia.com/blog/explainer-video-cost)).
- **Recomendación de pricing:** **no trasladar todo el ahorro de horas al precio.** Cotizar por valor y alcance (piezas, formatos, idiomas, rondas) y reinvertir parte del ahorro en más exploración en preproducción y más versiones. Competir con estudios de USD 2 mil es una carrera hacia abajo.
- **Costos de IA:** medirlos desde el piloto, con **tope por proyecto**. Suelen ser marginales frente a las horas humanas, pero no son cero, y crecen con el número de iteraciones.
- **Licencias de software:** **Remotion exige Company License para organizaciones de más de 3 personas.** Se reportan para 2026 tiers como Creators USD 25 por asiento al mes, Automators USD 0,01 por render con mínimo de USD 100 al mes, y Enterprise desde USD 500 al mes [verificar en companies.remotion.dev] ([LICENSE](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md), [GenMotion](https://genmotion.dev/answers/remotion-do-i-need-a-company-license)). **HyperFrames es Apache-2.0.** Las fuentes tipográficas necesitan una licencia que cubra render a video o embedding web.

### 9.3 Cronograma tipo

**Pieza de 90 s para un cliente corporativo (≈15 días hábiles):**

| Día | Actividad | Gate |
|---|---|---|
| 1 | Kickoff, brief firmado, inicio de investigación | G0 |
| 2 | Investigación y claims; treatment | G1 |
| 3 | Treatment aprobado; guion v1; styleframes, 2 direcciones (en paralelo) | G2 |
| 4 | Feedback del cliente sobre guion y styleframes (24 h) | — |
| 5 | Guion v2 firmado; dirección de estilo y tokens congelados; storyboard | G3, G4 |
| 6 | Storyboard + animatic con TTS (se revisan juntos) | G5 |
| 7 | Feedback del animatic; grabación de la VO final | G6, G6b |
| 8–9 | Build con IA, polish, revisión interna DC | G7 |
| 10 | v01 al cliente | R1 |
| 11 | Feedback R1 consolidado | — |
| 12 | v02 con changelog | R2 |
| 13 | Feedback R2 y picture lock | G9 |
| 14 | Mezcla, captions, master, versiones 9:16 y 1:1, QA | G10–G14 |
| 15 | Entrega y archivo | G15 |

**Canal propio:** de 8 a 10 días hábiles, con feedback en el día y G5 y G6 en una misma sesión.

**Explainer de 4 min para un cliente corporativo (≈6 semanas):**

| Semana | Actividad |
|---|---|
| S1 | Brief, investigación profunda, entrevistas con el SME, registro de claims, treatment |
| S2 | Guion v1–v2 (con SME y legal); styleframes y tokens en paralelo |
| S3 | Guion firmado; storyboard; animatic; VO final |
| S4 | Build (subagentes por escena), polish de los momentos héroe, revisión interna, v01 |
| S5 | R1, R2 y lock |
| S6 | Sonido, captions (+ idiomas), master, versiones, cutdowns, QA, entrega |

### 9.4 Registro de riesgos

| # | Riesgo | Prob. | Impacto | Mitigación | Dueño |
|---|---|---|---|---|---|
| 1 | Claim técnico erróneo o cifra "plausible" inventada | Media | Alto | Registro de claims, firma del SME, regla de "sin ID no hay número", QA de números vs registro | Guionista / QA |
| 2 | Scope creep del tipo "como es con IA, es rápido" | Alta | Alto | Rondas en contrato, change orders, picture lock firmado | Productor |
| 3 | Look genérico (*AI slop*) | Alta | Medio-alto | Styleframes y tokens, registry curado, referencias, aprobación del DC antes de cada versión | DC |
| 4 | Render no reproducible (versiones de skills o dependencias, fuentes, red durante el render, random) | Media | Alto | Lockfile, versiones fijas, fuentes locales, regla de determinismo, re-render de verificación desde el tag | TD |
| 5 | Derechos de música, voz, imagen o fuentes | Media | Alto | Librería con cobertura para clientes, consentimientos, ledger de assets, certificados en el archivo | Productor / QA |
| 6 | Fuga de datos del cliente (prompts, APIs de terceros, issues públicos) | Baja-media | Muy alto | Política de datos, cuentas enterprise sin entrenamiento, deshabilitar `--describe` y `--file-issue`, revisión de permisos | TD |
| 7 | Latencia del cliente que se come el calendario | Alta | Medio | Fechas de feedback en el SOW, cláusula de aprobación tácita, sesiones de revisión en vivo | Productor |
| 8 | Vertical recortado y con mala composición | Media | Medio | Composición nativa por formato, guía de safe zone automatizada | Motion director |
| 9 | Accesibilidad: contraste, flashes, captions | Media | Medio-alto | `check` (WCAG AA), revisión de flashes (WCAG 2.3.1: ≤3 por segundo), captions revisados | QA |
| 10 | Disclosure regulatorio (AI Act, YouTube) | Media | Medio-alto | Checklist de disclosure en QA, consulta legal en casos realistas | QA / legal |
| 11 | Titularidad de outputs IA (copyright) | Media | Medio | Cláusula contractual, registro de autoría humana (decisiones, guion, diseño), declaración de uso de IA | Productor / legal |
| 12 | Dependencia de una sola persona (TD) | Media | Alto | Documentación, recipes, pairing, backup formado | Productor ejecutivo |
| 13 | Costos de IA descontrolados | Baja | Bajo-medio | Tope por proyecto, monitoreo semanal | TD |
| 14 | Resistencia o desmotivación del equipo de motion | Media | Alto | Nuevos roles (motion director, TD), formación y criterio de éxito compartido, sin recortes durante el piloto | Productor ejecutivo |

**Notas legales para el registro de riesgos** (no constituyen asesoría legal):
- **Copyright:** la Copyright Office (Part 2, enero de 2025) sostiene que lo generado íntegramente por IA no es protegible, pero que sí lo es la expresión humana perceptible, las modificaciones creativas y la selección o el arreglo humano. *Thaler v. Perlmutter* (D.C. Cir., 18 de marzo de 2025; certiorari denegado el 2 de marzo de 2026) confirmó el requisito de autoría humana ([Copyright Office](https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf), [Baker Donelson](https://www.bakerdonelson.com/supreme-court-denies-certiorari-in-thaler-v-perlmutter-ai-cannot-be-an-author-under-the-copyright-act)). Consecuencia práctica: **documentar las decisiones humanas** (guion, design spec, storyboard, selección).
- **AI Act, artículo 50:** rige desde el **2 de agosto de 2026**. Los *deployers* deben etiquetar los deepfakes (contenido realista que se parece a personas, lugares o eventos reales); para obras evidentemente artísticas o creativas la obligación es más limitada. Hay un Código de Práctica final ([AI Act art. 50](https://artificialintelligenceact.eu/article/50/), [Comisión Europea](https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act), [Paul Weiss](https://www.paulweiss.com/insights/client-memos/eu-finalises-transparency-rules-for-ai-generated-content)).
- **YouTube:** exige declarar contenido sintético o alterado **realista**. Lo animado o claramente irreal queda exento. Desde mayo de 2026 también etiqueta automáticamente cuando detecta uso fotorrealista significativo ([YouTube Blog](https://blog.youtube/news-and-events/improving-ai-labels-viewers-creators/), [YouTube Help](https://support.google.com/youtube/answer/14328491)). Los motion graphics abstractos normalmente no requieren etiqueta; **una voz clonada de una persona real o el b-roll realista generado sí la pueden requerir.**

### 9.5 Métricas

**Producción (operativas):**

| Métrica | Definición | Meta inicial (a calibrar) |
|---|---|---|
| **Time-to-first-cut (TTFC)** | Días hábiles desde el brief firmado hasta la v01 enviada al cliente | 90 s: ≤8 días; 4 min: ≤18 días |
| Build time | Horas desde G6b hasta la v01 interna | −60 % vs línea base |
| **Rondas por pieza** | Rondas de build hasta el lock | ≤2 en el 80 % de las piezas |
| First-pass acceptance | Porcentaje de escenas aprobadas sin cambios en R1 | ≥60 % |
| Iteraciones de agente por escena | Instrucciones hasta la aprobación interna | Medir; bajar con mejores specs |
| **Horas humanas por minuto terminado** | Total de horas / minutos entregados (master, sin versiones) | −40 % vs línea base |
| **Costo por minuto terminado** | Costo total / minutos del master (reportar aparte el costo por versión) | Medir |
| Defectos en QA | Defectos por minuto encontrados en G14 | Bajar ronda a ronda |
| **Defectos escapados** | Errores detectados por el cliente después de la entrega o después de publicar | **0 críticos** |
| Change orders | Cantidad y monto por pieza | Visibles y facturados |
| Ratio de retrabajo | Horas de retrabajo / horas totales | <20 % |

**Desempeño (por plataforma):**

| Métrica | Fuente | Uso |
|---|---|---|
| **CTR de impresiones** | YouTube Studio | Packaging (título y miniatura) |
| **Retención a 30 s ("Intro")** y curva vs *typical retention* | YouTube Key moments | Calidad del hook y de la estructura |
| AVD / AVP | YouTube Studio | Calidad global. MrBeast prioriza CTR, AVD y AVP ([Tubefilter](https://www.tubefilter.com/2024/09/17/mrbeast-internal-production-guide-leaked-key-points/)) |
| Tasa de finalización, guardados y compartidos | TikTok, Reels, Shorts | Short-form |
| VTR, CPV, CPA | Plataformas de ads | Piezas pagas |
| Conversiones (demos, signups) | CRM o analytics del cliente | Corporativo, el KPI de negocio del brief |

### 9.6 Plan de adopción 30-60-90 días

**Días 1–30: fundaciones y piloto interno**
- **Elegir framework:** HyperFrames (HTML/CSS/GSAP, Apache-2.0, skills por workflow) o Remotion (React, licencia de empresa). Criterios: skills del equipo, costo de licencia, catálogo de bloques, necesidad de footage y captions.
- **El TD arma el harness:**
  - repo plantilla;
  - `CLAUDE.md` de la casa (reglas: no inventar datos, no tocar escenas bloqueadas, no publicar, tokens obligatorios);
  - skills con versión fija (`npx hyperframes skills update` controlado);
  - `frame.md` de la marca propia y de 1–2 clientes;
  - CI con `lint` + `check`;
  - presets de render;
  - scripts ffmpeg de masters, entregables y loudness;
  - naming y estructura de carpetas;
  - política de datos y permisos del agente.
- **Formación:** 4 sesiones de 2 h: (1) specs ejecutables y guion a dos columnas; (2) del feedback a instrucciones; (3) QA y specs de entrega; (4) legal: música, voz, disclosure y claims.
- **Piloto:** 3 piezas del **canal propio** de 30–90 s, una por estructura (hook-PSPC, changelog, how-it-works). Una de ellas también en flujo tradicional "sombra" para comparar.
- **Línea base:** horas, rondas y defectos de las últimas 10 piezas tradicionales.

**Días 31–60: cliente piloto y estandarización**
- 2–3 piezas para **un cliente de confianza**, con el uso de IA declarado en el SOW.
- Plantillas consolidadas (las de `templates/`), retro por pieza y ajuste de estimaciones.
- Registry interno de escenas y bloques reutilizables (intros, lower thirds, charts, end cards por cliente). *Recipes* congeladas de piezas aprobadas para repetir formatos.
- Primer dashboard de métricas (§9.5). Definición de pricing.

**Días 61–90: escala y gobierno**
- Entre 30 y 50 % de las piezas de motion en el pipeline nuevo. Los explainers de 3–5 min entran con subagentes por escena.
- **Política de IA** firmada por legal (datos, disclosure, licencias, cláusulas para clientes) y planes de carrera (motion director, TD).
- **Go/no-go** con criterios explícitos: ≥30 % menos horas por minuto terminado **sin** aumentar rondas, defectos escapados ni retrabajo, y satisfacción del cliente igual o mayor que la línea base.

---

## 10. Plantillas (en `templates/`)

| Archivo | Para qué |
|---|---|
| `brief.md` | Brief completo con matriz de entregables, KPIs, mandatorios, legales, política de IA y aprobadores |
| `guion-dos-columnas.md` | Guion AV con presupuesto de palabras, registro de claims, glosario y export a `SCRIPT.md` |
| `storyboard.md` | Ficha por escena + `STORYBOARD.md` ejecutable compatible con HyperFrames |
| `shot-list.csv` | Lista de capturas, assets y gráficos a producir |
| `review-feedback.md` | Plan de revisión, log de feedback, traducción a instrucciones para el agente, changelog |
| `qa-checklist.md` | QA técnico, de contenido, marca, legal, accesibilidad y específico de IA, con comandos |
| `delivery-checklist.md` | Paquete de entrega, metadata por plataforma, archivo y acuse |
| `naming-convention.md` | Naming de archivos, carpetas, versiones, tags de git e idiomas |
| `raci.md` | Roles, RACI completo, derechos de decisión y límites del agente |

---

## Fuentes

**Plataformas y specs**
- YouTube Help — Recommended upload encoding settings: https://support.google.com/youtube/answer/1722171
- YouTube Help — Key moments for audience retention: https://support.google.com/youtube/answer/9314415
- YouTube Help — Disclosing use of altered or synthetic content: https://support.google.com/youtube/answer/14328491
- YouTube Blog — Improving AI labels: https://blog.youtube/news-and-events/improving-ai-labels-viewers-creators/
- Joseph Nilo — YouTube bitrate (verificado contra YouTube Help, junio de 2026): https://josephnilo.com/blog/best-target-bitrate-for-youtube/
- Alan Spicer — Best bitrate for YouTube: https://alanspicer.com/what-is-the-best-bitrate-for-youtube/
- 1of10 — YouTube Shorts length: https://1of10.com/blog/how-long-can-youtube-shorts-be/
- Hopper HQ — Shorts dimensions: https://www.hopperhq.com/blog/youtube-shorts-dimensions/
- Solid Labs — Social safe zones (porcentajes de Meta): https://www.solidlabs.com/social-safe-zones
- Brandeal — TikTok safe zone 2026: https://brandeal.ai/en/blog/tiktok-safe-zone-guide
- Postplanify — Social media safe zones 2026: https://postplanify.com/blog/social-media-safe-zones-2026-complete-guide
- ScreenSnap — Instagram Reels size: https://www.screensnap.pro/blog/instagram-reels-size-guide
- SocialCal — Instagram video length limits 2026: https://www.socialcal.app/blog/instagram-video-length-limits-2026
- Sked Social — TikTok video size: https://skedsocial.com/blog/tiktok-video-size-guide
- filesize.org — TikTok limits: https://filesize.org/limits/tiktok/
- LinkedIn Business — Video ads specs: https://business.linkedin.com/advertise/ads/sponsored-content/video-ads/specs
- LinkedIn Help — Video ads specifications: https://www.linkedin.com/help/linkedin/answer/a424737
- VideoToolery — X video size limits 2026: https://videotoolery.com/blog/x-twitter-video-size-limits
- Sendcove — X video specs: https://www.sendcove.app/integrations/twitter/video-specs
- ThumbnailTest — YouTube thumbnail size: https://thumbnailtest.com/guides/youtube-thumbnail-size/

**Audio y loudness**
- Netflix — Sound Mix Specifications & Best Practices v1.6: https://partnerhelp.netflixstudios.com/hc/en-us/articles/360001794307-Netflix-Sound-Mix-Specifications-Best-Practices-v1-6
- DeliveryQC — Netflix audio delivery specs: https://deliveryqc.com/netflix-delivery-specs
- The Post Flow — Delivery specs cheat sheet: https://thepostflow.com/filmmaker-resources/delivery-specs-cheat-sheet/
- AES TD1008 — Loudness of internet audio streaming: https://aes.org/wp-content/uploads/2024/01/20210924_TD1008_v3.13.pdf
- Production Advice — AES TD1008 explained: https://productionadvice.co.uk/td1008/
- RTW — Worldwide loudness delivery standards: https://www.rtw.com/blog/rtw-knowledge-base-1/worldwide-loudness-delivery-standards-4
- Fora Soft — EBU R128, BS.1770 y ATSC A/85: https://www.forasoft.com/learn/audio-for-video/articles-audio/loudness-normalization-ebu-r128-bs1770-atsc-a85
- Critical Listening Lab — LUFS por plataforma: https://www.criticallisteninglab.com/en/learn/loudness
- Venia Mastering — Streaming LUFS 2026: https://veniamastering.studio/blog/how-loud-should-your-master-be-in-2026/

**Codecs y post**
- Lowepost — DNxHR vs ProRes: https://lowepost.com/courses/blog/the-difference-between-dnxhr-and-prores-codecs-r4/
- MpegFlow — Mezzanine codecs: https://www.mpegflow.com/topics/codecs/mezzanine-codecs
- The Post Flow — Post-production workflow: https://thepostflow.com/post-production/post-production-workflows/the-post-production-workflow/
- Trisha Studios — What happens after picture lock: https://trishastudios.com/knowledge/what-happens-after-picture-lock
- StudioBinder — L cut: https://www.studiobinder.com/blog/what-is-an-l-cut
- Filmdaft — L-cut y J-cut: https://filmdaft.com/the-l-cut-and-j-cut-how-film-editors-use-audio-to-control-time/

**Guion, preproducción y retención**
- StudioBinder — Two-column (AV) script template: https://www.studiobinder.com/templates/av-scripts/two-column-script-template/
- StudioBinder — AV script template: https://www.studiobinder.com/blog/av-script-template/
- StudioBinder — What is an animatic: https://www.studiobinder.com/blog/what-is-an-animatic-definition/
- School of Motion — What are animatics: https://schoolofmotion.com/blog/what-are-animatics-and-why-are-they-important
- Motif Motion — What is an animatic: https://motifmotion.com/what-is-an-animatic
- Art of Styleframe — Styleframe design guide: https://artofstyleframe.com/blog/styleframe-design-guide/
- Medium (Delacelle) — The power of styleframes: https://medium.com/@adrien.delacelle/the-power-of-styleframes-d1b0ed1c8790
- MrBeast — How to Succeed in MrBeast Production (PDF filtrado): https://cdn.prod.website-files.com/6623b7720b009050313e701c/66ede69453b7bbadcd2f05a8_How-To-Succeed-At-MrBeast-Production%20(2).pdf
- Tubefilter — MrBeast production guide key points: https://www.tubefilter.com/2024/09/17/mrbeast-internal-production-guide-leaked-key-points/
- Daniel Scrivner — Resumen del handbook de MrBeast: https://www.danielscrivner.com/how-to-succeed-in-mrbeast-production-summary/
- Paddy Galloway (X) — Retención: https://twitter.com/PaddyG96/status/1510219133895741443
- 1of10 — Hook en los primeros 30 s: https://1of10.com/blog/how-to-hook-viewers-in-the-first-30-seconds-of-a-youtube-video/
- The Voice Realm — Words to minutes: https://www.thevoicerealm.com/count-script.php
- GoTeleprompter — Voiceover word count: https://goteleprompter.com/blog/voiceover-script-word-count-calculator/
- AIR Media-Tech — Subtitle formatting 2026: https://air.io/en/youtube-hacks/best-practices-for-writing-and-formatting-subtitles
- Vocova — SRT vs WebVTT 2026: https://vocova.app/blog/srt-vs-vtt
- TestParty — WCAG captioning requirements: https://testparty.ai/blog/video-captioning-requirements
- Clueso — Tasteful screen-capture videos: https://www.clueso.io/blog/how-to-make-tasteful-screen-capture-videos
- Dynatrace — Screen recordings style guide: https://styleguide.dynatrace.com/docs/product-capture/screen-recordings
- UBC — Screencasting best practices: https://wiki.ubc.ca/images/b/b5/Screencasting_Best_Practices.pdf

**Revisión**
- Increditors — Frame.io video review guide: https://increditors.com/frame-io-video-review-guide/
- Framekit — Best video review and approval tools 2026: https://framekit.ai/blog/best-video-review-and-approval-tools-2026
- Adobe Video World — Frame.io review: https://adobevideoworld.com/frame-io-video-review/

**Costos y tiempos**
- Yum Yum Videos — Explainer video cost 2026: https://www.yumyumvideos.com/blog/how-much-does-an-explainer-video-cost/
- Yum Yum Videos — Explainer production process: https://www.yumyumvideos.com/blog/explainer-video-production-process/
- Vidico — Animation cost: https://vidico.com/news/how-much-does-animation-cost/
- Motif Motion — Pricing guide: https://motifmotion.com/video-production-pricing-guide
- Yans Media — Explainer video cost: https://www.yansmedia.com/blog/explainer-video-cost
- StuCreative — How long will my animation take: https://www.stucreative.com/how-long-will-my-animation-take
- Magic Motion Studio — How long does 2D animation take: https://magicmotionstudio.com/how-long-does-2d-animation-take/
- VideoIgniter — How long to make an explainer: https://videoigniter.com/how-long-does-it-take-to-make-an-animated-explainer-video/

**IA, herramientas y licencias**
- HyperFrames — Docs: https://hyperframes.heygen.com/introduction · Repo: https://github.com/heygen-com/hyperframes (y en el repo local: `docs/packages/cli.mdx`, `docs/guides/rendering.mdx`, `skills/hyperframes/references/storyboard-format.md`, `script-format.md`, `review-loop.md`, `skills/general-video/SKILL.md`)
- Rescroll — Claude Code + Remotion, what it actually takes: https://www.rescroll.ai/blog/claude-code-remotion-motion-graphics-2026
- Medium (Balarabe) — AI motion graphics with Claude and Remotion: https://medium.com/@tahirbalarabe2/build-ai-motion-graphics-with-claude-and-remotion-0990e6bbf773
- Pexo — Remotion vs HyperFrames vs IA generativa: https://pexo.ai/blog/programmatic-vs-ai-generated-video-with-claude-code-remotion-hyperframes-and-pexo-compared-6108
- Remotion — LICENSE: https://github.com/remotion-dev/remotion/blob/main/LICENSE.md
- GenMotion — Remotion company license: https://genmotion.dev/answers/remotion-do-i-need-a-company-license

**Música**
- The Post Flow — Music subscriptions compared: https://thepostflow.com/post-production/video-editing/music-subscriptions-compared/
- Restorm — Artlist vs Epidemic Sound: https://restormuk.com/2026/07/28/artlist-vs-epidemic-sound/
- Soundstripe — Musicbed alternatives: https://www.soundstripe.com/blogs/musicbed-alternatives
- terms.law — Suno output rights: https://terms.law/ai-output-rights/suno/
- Undetectr — AI music y Content ID: https://undetectr.com/blog/ai-music-youtube-copyright-claims

**Legal**
- US Copyright Office — Copyright and AI, Part 2: https://www.copyright.gov/ai/Copyright-and-Artificial-Intelligence-Part-2-Copyrightability-Report.pdf
- D.C. Circuit — Thaler v. Perlmutter: https://www.copyright.gov/ai/docs/court-of-appeals-decision-affirming-refusal-of-registration.pdf
- Baker Donelson — Certiorari denegado en Thaler: https://www.bakerdonelson.com/supreme-court-denies-certiorari-in-thaler-v-perlmutter-ai-cannot-be-an-author-under-the-copyright-act
- EU AI Act, artículo 50: https://artificialintelligenceact.eu/article/50/
- Comisión Europea — FAQ del artículo 50: https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act
- Paul Weiss — Reglas finales de transparencia de la UE: https://www.paulweiss.com/insights/client-memos/eu-finalises-transparency-rules-for-ai-generated-content
- SAG-AFTRA — Sound Recordings Code, apéndice de IA: https://www.sagaftra.org/sites/default/files/Sound%20Recordings%20Code%20Appendix%20on%20Artificial%20Intelligence.pdf
- SAG-AFTRA — Acuerdo con Narrativ: https://www.sagaftra.org/sag-aftra-and-narrativ-announce-new-agreement
