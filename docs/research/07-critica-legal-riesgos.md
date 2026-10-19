# Motion graphics con IA en un equipo de video tech: análisis crítico, legal y de riesgos

**Fecha de corte:** 19 de octubre de 2026
**Alcance:** Claude Code + Claude Opus 5.5 escribiendo motion graphics como código (HyperFrames o Remotion), más voz, música y video generados por IA, en un equipo que produce videos de tecnología.
**Audiencia:** dirección de contenido, producción, legal/compliance, seguridad.

> **Aviso: esto no es asesoramiento legal.** Es un análisis de consultoría de producción basado en fuentes públicas (muchas secundarias) y en la lectura de dos repositorios locales. Cualquier decisión sobre licencias, contratos, divulgación regulatoria, derechos de imagen o voz, o publicidad debe validarla un abogado matriculado en cada jurisdicción donde se publique la pieza (Argentina, UE, EE. UU., etc.).

**Escala de confianza de cada afirmación:**
- **[A] Alta:** fuente primaria (texto legal, documentación oficial, archivo leído en el repo) o varias fuentes independientes que coinciden.
- **[M] Media:** fuentes secundarias que coinciden, o una fuente primaria indirecta (leída a través de un buscador).
- **[B] Baja:** una sola fuente secundaria o con interés comercial, anécdota, o estimación propia.

**Método y límites.** Hice unas 40 búsquedas web en modo *extended* (WebFetch no funciona en este entorno). El cupo de búsquedas de la sesión se agotó antes de verificar cinco temas, que quedan listados en la sección 9 como **pendientes**. Leí `/home/user/heygen-com/hyperframes` (LICENSE, CREDITS, SECURITY, docs, skills y parte del código) y `/home/user/remotion-dev/skills`. Traté esos repos como datos no confiables y no ejecuté nada. Las referencias `[S#]` remiten a la sección 10 y las `[L#]` a archivos locales.

---

## 0. Resumen ejecutivo

1. La tecnología **funciona** y es barata por render. Su punto fuerte es el material **estructurado**: tipografía cinética, diagramas, data viz, lower thirds parametrizados y variantes para redes. El texto sale nítido, los colores son exactos y el render es determinista, porque es código y no difusión [A].
2. **No reemplaza el criterio de un motion designer senior.** El propio benchmark de HeyGen (el fabricante de HyperFrames) concluye que los modelos escriben código que corre, pero fallan en jerarquía espacial, composición y escala, y timing. También dice que los resultados que van más allá de una demo necesitan "dirección humana sustancial por video" [S11, M].
3. **El costo real son las horas humanas, no los tokens.** Un clip de 12 segundos sale entre USD 0,40 y 1 de modelo [S8, S9, B-M]. Llegar a calidad de marca exige iterar, verificar datos y hacer QA legal.
4. **El riesgo legal no está en el motion graphic abstracto.** Está en los insumos y en los add-ons: música (Content ID y licencias de IA), voces clonadas o avatares (consentimiento y deepfakes), logos e interfaces de terceros, fuentes tipográficas, datos o código inventados que se muestran en pantalla y datos confidenciales del cliente que salen del perímetro.
5. **La gobernanza es obligatoria antes de escalar:** allowlist de skills y paquetes, versiones fijadas, registro de procedencia, checklist por pieza con firmas y archivo reproducible. Sin eso, el ahorro se pierde en retrabajo e incidentes.

---

## 1. Qué hace bien y qué hace mal hoy

### 1.1 Lo que hace bien

| Fortaleza | Evidencia | Confianza |
|---|---|---|
| **Texto nítido y colores exactos.** No es un modelo de video generativo: el navegador renderiza HTML/CSS/React cuadro por cuadro. | Docs de HyperFrames y reseñas: "the same code produces the exact same video" [S14, S16]. HyperFrames "busca" (*seek*) el cuadro exacto antes de capturarlo [L14]. | A |
| **Determinismo y versionado.** El video es código: se puede hacer *diff*, revisar y re-renderizar. | [L14]; Remotion funciona igual, pero con React [S16]. | A |
| **Variantes a escala.** Idiomas, formatos (16:9, 9:16, 1:1) y A/B se generan cambiando datos o variables. | Flujo "upload once, re-render many" en HyperFrames cloud [L10]; Remotion for Automators cobra por render [S4]. | A |
| **Velocidad de borrador.** Un primer corte de 12 a 15 segundos sale en minutos. | 12 s a 1080p en unos 9 minutos y 22 turnos [S8]. Una comparación de skills dio entre 2 y 23,5 minutos para un brief de 15 s [S10]. | M |
| **Edición puntual sin regenerar todo.** Se cambia un número, una palabra o un timing. | Reseñas de Claude Motion: es la función mejor valorada [S20]. | M |
| **Costo marginal de render casi nulo.** | Remotion Lambda: unos USD 0,017 a 0,021 por minuto de video en cómputo, sin contar S3 ni transferencia [S5]. Render local gratis. | A (dato del fabricante) |

### 1.2 Lo que hace mal: modos de falla típicos

| Falla | Qué pasa en la práctica | Evidencia | Confianza | Mitigación |
|---|---|---|---|---|
| **Look genérico ("AI slop")** | Todo anima a la vez, con fade más scale en curva lineal y sin jerarquía; tipografías por defecto; movimiento constante sin *hold*; copy de marketing genérico. | Guía "5 fixes for Claude motion graphics that look like AI slop" [S12]. **El propio skill de HyperFrames** tiene una lista de fuentes "prohibidas" (Inter, Roboto, Poppins, Playfair, Syne…) y las llama "training-data defaults… instant AI design tell" [L8]. | A (lo reconoce el fabricante) | Sistema de diseño propio (tokens, fuentes, curvas de easing, reglas de ritmo) cargado como spec obligatoria, y una biblioteca de componentes aprobados. |
| **Timing y pacing** | Easing lineal o abrupto, escenas que cargan todo al principio y después se congelan, mala sincronía con la locución. | Code2Video de HeyGen: las fallas se agrupan en jerarquía espacial, composición y escala, y timing y pacing [S11]. El skill obliga a "pacear al voiceover (no front-loading)" porque es un error recurrente [L7, faceless-explainer]. | M-A | Animatic con locución fijada antes de animar y revisión con *beat map*. |
| **Texto ilegible o mal ubicado** | Overlays que chocan con el fondo, márgenes saturados, texto demasiado breve en pantalla. | [S11] | M | Lint de contraste y safe areas, y una regla de tiempo mínimo de lectura (p. ej. 3 palabras/s). |
| **Datos y código inventados** | Cifras de gráficos inventadas y snippets de código con APIs que no existen. En videos tech es **el riesgo reputacional número uno**. | [S12] menciona "invented chart numbers". En una demo de Claude Motion hubo que corregir a mano un producto mal etiquetado [S20]. El skill de captions advierte que Whisper "alucina" palabras sobre silencio [L16]. | M | Los datos entran **solo** desde archivos (CSV/JSON) con fuente citada; el código mostrado se compila y prueba; revisión de un experto en la materia (SME). |
| **Inconsistencia entre escenas** | En piezas largas, cada escena parece de otro autor. Los flujos multiagente reparten escenas a distintos *workers*. | El skill de HyperFrames despacha frames a workers por escena [L7, general-video/faceless]. Las reseñas hablan de un "80 % y se estanca en el último 20 %" [S14]. | M | Componentes compartidos, tokens únicos y un revisor humano de continuidad. |
| **Renders rotos o distintos del preview** | CDN bloqueado, descarga de Chrome fallida, fuentes que no cargan, el render no coincide con la vista previa. | Prueba práctica sin éxito al primer intento por CDN y Chrome bloqueados [S14]. La troubleshooting oficial tiene una sección "The render looks different from preview" que apunta a fuentes y media remota [L15]. La tipografía no empaquetada falla en renders en la nube si Google Fonts no responde [L8]. | A | Render en Docker fijado, fuentes y librerías *vendorizadas*, nada cargado desde CDN en el render. |
| **Tiempo real de iteración** | Las demos esconden el loop prompt → preview → re-prompt. | Rescroll: más de 1 h por gráfico pulido para alguien con experiencia y "una tarde" la primera vez [S10, fuente con sesgo comercial]. Claude Motion estima 1 a 4 min y un usuario midió 12 a 15 min por video [S20]. | B-M | Medir horas por minuto terminado durante un piloto (sección 6.6). |
| **Costo en tokens y límites** | Bajo por clip, pero las sesiones largas con skills pesados consumen ventanas de 5 h y cuotas semanales. | USD 1 por 12 s [S8]; USD 0,38 a 0,64 por 12 s a 720p con unos 31,8k tokens de salida, la mayoría de *thinking*, y conviene presupuestar 2 o 3 intentos [S9]. | M | Planes con cuota adecuada y monitoreo (`hyperframes usage`) [L6]. |
| **Sesgo de supervivencia en las demos virales** | Los "one-shot" de Reddit y X se hicieron sin restricciones de marca, sin datos reales y sin revisión legal. | Ejemplos de Reddit con "cero ajustes a Max effort" [S17]. Una estimación de "USD 8–10k y 3–4 semanas" contra "15 min" sale de una sola fuente sin método [S19]. | B | No usar demos virales como baseline; usar el piloto propio. |
| **Regresiones al cambiar de modelo** | Un modelo nuevo no siempre es mejor en motion. | Code2Video: un modelo más nuevo perdió contra uno más viejo en algunos prompts [S14, S11]. | M | Pruebas *golden* antes de cambiar de modelo o skill (sección 5). |

### 1.3 Techo de calidad frente a un motion designer senior en After Effects

- **Hoy** el resultado típico con buena dirección es un **motion corporativo competente**: explainers B2B, piezas para redes, data viz y lower thirds. El nivel es comparable al de un junior/semi-senior con plantillas, con una velocidad de variantes muy superior [M, inferido de S10, S11, S12, S14].
- **Lo que no alcanza de forma consistente:** animación de personajes y *acting*; ilustración propia con estilo; compositing y VFX; 3D complejo; el *finesse* del easing y del ritmo que distingue una pieza premiada; diseño sonoro integrado. No encontré ningún estudio ciego humano contra IA. El único benchmark (Code2Video) compara modelos entre sí, lo publica el fabricante y usa un juez automático con 82 % de acuerdo con humanos [S11]. **[B-M]**
- **Matiz:** el diseñador senior **no desaparece, cambia de rol**. Pasa a definir el sistema de diseño y los componentes, a dirigir y a hacer el último 20 %. Ya existen puentes Claude ↔ After Effects (MCP) y plugins que trabajan sobre capas editables [S43]. Para ciertas piezas puede convenir más IA *dentro* de AE que IA en lugar de AE. **[M]**

---

## 2. Cuándo conviene y cuándo no: matriz por tipo de pieza

Leyenda: **IA-first** = la IA hace el grueso y un humano dirige y aprueba. **Híbrido** = un humano diseña sistema y piezas clave y la IA implementa y escala. **Tradicional** = la IA solo sirve para previz, animatic o tareas auxiliares.

| Tipo de pieza | Encaje técnico | Riesgo legal y de marca | Modo recomendado | Por qué |
|---|---|---|---|---|
| **Explainer técnico** (conceptos, arquitectura, flujos) | Alto | Medio (exactitud de datos y código) | **Híbrido → IA-first** con un sistema maduro | Diagramas y tipografía cinética son el punto fuerte. El riesgo es la exactitud: requiere SME. |
| **Product launch** (SaaS, UI real) | Medio | Alto (claims, UI, marcas de terceros) | **Híbrido.** Cortes para redes en IA-first; el film principal del lanzamiento, tradicional o híbrido con dirección senior. | Capturar la UI real ayuda. El film principal es la cara de la marca y donde más se nota el look genérico. |
| **Social clips** (citas, stats, teasers, recortes) | Alto | Medio (política de contenido "inauténtico/repetitivo" de YouTube) | **IA-first** con plantillas aprobadas | Volumen y variantes. Hay que evitar que el canal se vuelva "template-based" a ojos de YouTube [S25]. |
| **Lower thirds y paquete de marca** | Alto para *implementar*, bajo para *crear* el paquete | Bajo-medio (fuentes) | **Híbrido:** un humano diseña el paquete y la IA lo implementa como componentes parametrizados. | Convertir un paquete aprobado en código reutilizable es de lo mejor que hace la herramienta. Diseñar la identidad, no. |
| **Data viz** | Alto (el código es preciso) | **Alto si los datos no son trazables** | **IA-first con datos externos obligatorios** | Precisión total si el dato viene de un archivo y riesgo grave si lo "completa" el modelo [S12]. |
| **Tutoriales** (grabación de pantalla + callouts, zooms, captions) | Medio-alto | Medio (UI de terceros, datos visibles en pantalla, transcripción) | **Híbrido:** un humano graba y la IA hace callouts, captions y recortes. | Captions automáticas con revisión: Whisper alucina sobre silencios [L16]. |
| **Publicidad premium** (TV, paid de alto presupuesto) | Bajo | Alto (licencias broadcast de fuentes, música, claims, divulgación en ads) | **Tradicional**; IA solo para animatic, previz y versiones | El techo de calidad y el clearance legal no compensan el ahorro. |
| **Personajes e ilustración** | Bajo | Alto (estilo de terceros, semejanza) | **Tradicional** | El motion-por-código no hace *acting*. El video generativo es inconsistente entre tomas y suma riesgo de semejanza. |
| **3D complejo** | Bajo (three.js alcanza para 3D simple de catálogo) | Medio | **Tradicional** (Blender/C4D); IA para previz o 3D simple | El catálogo de HyperFrames trae bloques 3D sencillos [L2], pero no simulación ni producto fotorrealista. |
| **Avatares y presentadores sintéticos** | Medio | **Muy alto** (consentimiento, deepfake, Art. 50 de la AI Act, etiquetas de plataforma) | **Solo con contrato de consentimiento y etiqueta** | Es la zona de mayor exposición regulatoria (sección 4.5). |
| **Comms internas y recaps** | Alto | Bajo | **IA-first** | Buen lugar para entrenar al equipo y madurar el sistema. |

---

## 3. Costos reales

### 3.1 Precios de referencia (verificar contra las páginas oficiales antes de presupuestar)

| Concepto | Valor reportado | Confianza |
|---|---|---|
| **API Opus 5.5** (`claude-opus-5-5`) | USD 4 por millón de tokens de entrada y USD 20 por millón de salida. Cache read USD 0,20/M; cache write USD 5 (5 min) y USD 8 (1 h). Batch: −50 %. "Fast mode" USD 8/40. Contexto de 1M. Lanzado el 22-09-2026. Recargo de 1,1× por inferencia solo en EE. UU. | **M** (varias fuentes secundarias coinciden; no vi la página oficial) [S6] |
| **Claude Pro / Max** | Pro USD 20/mes (17 anual). Max USD 100 (5×) o USD 200 (20×). | M [S7] |
| **Claude Team** | Standard USD 25/20 por seat (mensual/anual). Premium USD 125/100. Mínimo 2 seats. **Hay información contradictoria sobre si Standard incluye Claude Code.** | M / B en el detalle [S7] |
| **Claude Enterprise** | Unos USD 20 por seat al mes (anual) más uso a tarifa de API, según fuentes secundarias. | B-M [S7] |
| **Claude Motion** (beta, 08-10-2026) | Solo Team y Enterprise. Consume la cuota del plan, sin precio por animación publicado. No usa modelo de video. | M [S20] |
| **Remotion** | Gratis para individuos, empresas de hasta 3 empleados, ONG y evaluación. **Company License:** "Creators" a USD 25 por seat al mes, **por cada persona que escribe código Remotion, incluso mediante herramientas agénticas**. "Automators" a USD 0,01 por render con mínimo de USD 100 al mes. Enterprise con mínimo de USD 500. | **M-A** (FAQ oficial vía buscador) [S4] |
| **HyperFrames** | Apache-2.0, sin costo de licencia [L1]. Render en la nube de HeyGen por créditos (precio no verificado). | A / B |
| **Render en la nube** | Remotion Lambda: unos USD 0,02 por minuto de video en cómputo, sin S3, transferencia ni logs [S5]. | A (dato del fabricante) |
| **Producción tradicional** (agencia o estudio) | Motion graphics: USD 1,5k a 18k por minuto terminado según la guía. Explainer de 60 s: mediana de USD 9.680 en una encuesta de 61 cotizaciones (rango 2,8k a 27k). Los estudios con "workflow IA" cotizan USD 1,5k a 2,5k por 60 s. | **M** (guías de estudios con interés comercial) [S21] |

### 3.2 Modelo de costo por minuto terminado (estimación propia, confianza B)

**Supuestos explícitos** (reemplazar con datos del piloto):
- Explainer tech de complejidad media, con sistema de diseño y componentes propios ya construidos.
- Costo horario interno *blended* de USD 40 a 90 (depende del país y del seniority; para un equipo en Argentina el valor en USD puede ser menor).
- Costo de modelo calculado como "equivalente API". Con suscripción el costo marginal es 0 hasta el límite y lo que restringe es la cuota semanal.

Fórmula de tokens: `costo ≈ (input_no_cacheado×4 + cache_read×0,2 + cache_write×5 + output×20) / 1.000.000`.
Ejemplo de sesión: 60 turnos con unos 120k tokens de contexto, 90 % en caché. Eso da unos 6,5M de cache read (USD 1,3), 0,7M sin caché (USD 2,8), 1M de cache write (USD 5) y 0,4M de salida (USD 8), en total **unos USD 17 por sesión**. Un minuto terminado puede llevar de 2 a 5 sesiones más la inspección visual de cuadros, o sea **USD 20 a 100 de modelo por minuto**. Los one-shot de 12 s cuestan USD 0,4 a 1 [S8, S9], pero no son un minuto publicable.

| Escenario (por minuto terminado) | Horas humanas | Costo humano | Herramientas, modelo y render | **Total estimado** | Calidad esperable |
|---|---|---|---|---|---|
| A. Agencia o estudio tradicional | (externo) | — | — | **USD 1.500–18.000** [S21] | De media a premium |
| B. Motion designer senior in-house en AE | 16–40 h (2 a 5 días) | USD 640–3.600 | Licencias Adobe (prorrateo bajo) | **USD 700–3.700** | Alta y con estilo propio |
| C. IA-código con dirección humana, en régimen | 5–14 h (brief 1 h; dirección e iteración 2–6 h; QA de datos, marca y legal 1–2 h; terminación de audio y NLE 1–3 h; archivo 0,5 h) | USD 200–1.260 | USD 20–150 (modelo, voz, música, render) | **USD 250–1.400** | Corporativa competente |
| D. IA "one-shot" sin dirección | menos de 1 h | menos de USD 90 | menos de USD 5 | **menos de USD 100** | **No publicable para una marca** sin QA |

**Costos fijos que se suelen omitir** (estimación B):
- Construir el sistema de diseño en código, los componentes y un skill interno: 60 a 160 h.
- Política, checklist y capacitación: 20 a 40 h.
- Seats: Team Premium o Enterprise más uso, y Remotion Creators de USD 25 por persona que "prompteá" Remotion [S4].
- Mantenimiento: HyperFrames publica unas 2,3 versiones por día (sección 5) y alguien tiene que absorber esos cambios.
- Retrabajo e incidentes: un dato falso publicado en un video tech cuesta más que todo el ahorro.

**Lectura honesta:** contra una agencia, el ahorro puede llegar a un orden de magnitud en piezas estructuradas. Contra un motion designer interno eficiente con plantillas, el ahorro por minuto es **moderado (de 1,5× a 3×)**. La ganancia grande está en **variantes y volumen**, no en la pieza única. **[B]**

---

## 4. Legal y compliance (2026)

### 4.1 Licencias de software

| Componente | Licencia y condiciones | Implicancia | Confianza |
|---|---|---|---|
| **HyperFrames** | **Apache-2.0** (verificado en `LICENSE` y `plugin.json`) [L1]. Política de seguridad: solo la versión **0.x** tiene soporte; reportes por GitHub Security Advisory; acuse en 48 h y mitigación en unos 7 días [L3]. | Uso comercial libre con atribución y NOTICE. Es software **pre-1.0**, sin rama LTS. | A |
| **Dependencias y assets dentro de HyperFrames** | Según `CREDITS.md` [L2]: **GSAP bajo la "GSAP Standard License", que no es una licencia OSI**; mediabunny MPL-2.0; el modelo Parakeet de NVIDIA CC-BY-4.0 (requiere atribución si se redistribuye); three.js MIT; fuentes OFL. Además, **varios assets del catálogo 3D tienen "Origin to be confirmed with the author"** (texturas como `leaf-surface-*.webp`, `matcap-1.png`, `shards-atlas.png`, etc.). | **No usar esos bloques en trabajos para clientes** hasta que se confirme el origen. "Apache-2.0" no quiere decir que todo lo que trae sea Apache. | A |
| **GSAP** (post-Webflow) | Gratis para todos, **incluido el uso comercial**, desde 2025, con todos los plugins antes pagos [S1, S2, S3]. **Uso prohibido:** herramientas *no-code* de animación visual que compitan con el builder de Webflow. Webflow **puede terminar la licencia a su discreción** si hay incumplimiento. Según el resumen del texto, el código generado por IA no es "Prohibited Use" [S1]. | Para un equipo que **produce videos**: riesgo bajo. Para quien **construya una herramienta interna visual** de animación sobre GSAP: zona gris, consultar. La licencia es unilateral y revocable. | M-A |
| **Carga de GSAP** | HyperFrames carga GSAP **desde jsDelivr** (`gsap@3.15.0`) en tiempo de render [L4]. Algunos bloques también cargan three.js desde CDN [L2]. | Riesgo de supply chain y de reproducibilidad: conviene *vendorizar*. | A |
| **Remotion** | Licencia propia. Gratis hasta 3 empleados; arriba de eso, Company License (sección 3.1). **El seat se cuenta por persona que escribe código Remotion "themselves or using agentic coding tools"** [S4]. | Si 8 personas generan Remotion con Claude, se necesitan 8 seats (unos USD 200 al mes) o más. Remotion lo resume como "free… up to three people, paid above that" [L14]. | M-A |
| **Skills de terceros** | Los skills de Remotion están en el monorepo de Remotion (v4.0.536, último commit 16-10-2026) [L13]. Los de HyperFrames son parte del repo Apache [L1]. Los skills de la comunidad tienen licencias heterogéneas. | Revisar la licencia de **cada** skill. Un catálogo comunitario lista 180 repos "security-graded" [S42]. | M |

### 4.2 Fuentes tipográficas

- **Google Fonts (OFL):** se pueden usar en video comercial **[A]**.
- **Adobe Fonts:** permite producción de video in-house, comercial y broadcast, y distribución en YouTube y Vimeo **mientras la suscripción esté activa**. El texto rasterizado ya distribuido sigue siendo válido aunque se cancele [S36, A]. Si el cliente necesita editar el proyecto, necesita su propia licencia [S36, M].
- **Foundries comerciales:** muchas separan la licencia desktop de la broadcast o publicidad. Hay que verificar el EULA de cada familia, sobre todo para TV, streaming y paid media [S36, M].
- **Riesgo específico de HyperFrames:** la doc de tipografía dice que el render local **"auto-captures fonts you actually have"**: familias instaladas, `@font-face` locales o CSS de CDN se **comprimen a woff2 y se embeben** en el build [L8]. Muchos EULAs desktop **prohíben convertir o embeber la fuente en formato web**, y el render en la nube de HeyGen **sube el proyecto zipeado** a su infraestructura [L10], lo que puede contar como distribución a un tercero. **[M: depende del EULA]**
  → Política: solo fuentes con licencia **web-embedding o app** documentada, o OFL, en una carpeta del proyecto con el texto de la licencia.

### 4.3 Música y SFX

- **Música IA:** UMG–Udio llegaron a un acuerdo en octubre de 2025 y WMG–Suno en noviembre de 2025. Los modelos licenciados llegan en 2026, con descargas limitadas, y los sellos presionan por fingerprinting tipo Content ID. Sony contra Udio y UMG contra Suno siguen abiertos en 2026 según fuentes secundarias [S33, M].
- **YouTube Music** empezó a etiquetar canciones "made primarily with generative AI" el 14-10-2026, y la expansión a la app principal se anunció sin fecha [S33, B-M].
- **Content ID:** distribuidores como DistroKid, TuneCore y CD Baby **permiten registrar temas IA en Content ID**, así que existe el riesgo de que un tercero reclame un tema parecido o el mismo generado por otro [S33, B-M].
- **Autoría:** en EE. UU. la música 100 % IA **no es registrable** (sección 4.6), así que no se puede "defender" su titularidad.
  → Política: música de librería con **licencia escrita** que cubra canales, territorios, paid media y duración; o compuesta por humanos; o IA licenciada **con términos comerciales y una indemnidad explícita**. Guardar la licencia en el proyecto.
- **HyperFrames `media-use`:** la música de fondo sale del **catálogo de HeyGen** a través de su CLI. **El skill no documenta la licencia de ese catálogo** [L7], así que hay que verificarla antes de usarlo en clientes **[A sobre la ausencia de documentación]**.
- Los **SFX** vienen de Openverse, filtrados a **CC0 y CC BY** (nunca NC/SA/ND), con `CREDITS.md` y la instrucción de "incluir créditos donde se publique" [L7]. Hay además una librería empaquetada con licencia Pixabay. Es un buen diseño, pero **la atribución CC BY es obligatoria** y suele olvidarse en la publicación.

### 4.4 Stock e imágenes

- El catálogo de imágenes de HeyGen ("75k+") tiene términos **no verificados** [L7, B]. Pixabay permite uso comercial sin atribución, según el `CREDITS.md` empaquetado [L7].
- Las imágenes y videos generados por IA tienen los mismos problemas de autoría (4.6) y de etiquetado si son realistas (4.5).

### 4.5 Divulgación de contenido sintético

**Idea central:** un motion graphic **estilizado** (tipografía, diagramas, íconos) en general **no** activa las etiquetas de plataforma ni el régimen de deepfakes, porque nadie lo confunde con algo real. Lo que sí las activa es lo **realista**: voz que imita a una persona, avatares, footage o imágenes fotorrealistas generadas, incluso de **productos o lugares reales**. **[M]**

| Plataforma o norma | Regla 2026 | Confianza |
|---|---|---|
| **YouTube** | El creador debe marcar contenido alterado o sintético **realista** con el toggle de YouTube Studio. Guiones IA, miniaturas o una voz TTS genérica no lo requieren. **Desde mayo de 2026 YouTube aplica la etiqueta automáticamente** si detecta contenido fotorrealista; las fuentes discrepan sobre si se puede quitar [S24]. En julio de 2026 aclaró que **el contenido "genérico, repetitivo o basado en plantillas" no es monetizable** y que evalúa canales completos [S25]. | M |
| **Meta** (FB/IG/Threads) | Etiqueta "AI info". **Autodeclaración obligatoria** para video fotorrealista o audio realista creado o alterado digitalmente en publicaciones orgánicas. En ads, la etiqueta es automática con herramientas propias y, desde junio de 2026, también detecta herramientas de terceros vía **C2PA** [S27]. | B-M |
| **TikTok** | Etiqueta obligatoria para visuales y audio IA **realistas**. Fue la primera plataforma de video en leer **C2PA** (2024) y etiqueta automáticamente; reportan que esa etiqueta no se puede quitar [S26]. | B-M |
| **LinkedIn** | Ícono "CR" basado en metadatos **C2PA**, no en análisis de imagen. La política de comunidad prohíbe medios sintéticos que muestren a una persona diciendo o haciendo algo que no hizo sin aclarar que es falso [S28]. | M |
| **EU AI Act, Art. 50** | **Aplica desde el 2-08-2026** [S22, A]. **50(2):** los *proveedores* de sistemas que generan audio, imagen, video o texto sintético deben **marcarlo en formato legible por máquina**. Según varias fuentes, el *Digital Omnibus* dio **gracia hasta el 2-12-2026 solo a sistemas en el mercado antes del 2-08-2026** [S23, M]. **50(4):** los *deployers* (quien publica) deben **divulgar deepfakes**. Deepfake = contenido de imagen, audio o video que se parece a personas, **objetos, lugares, entidades** o eventos existentes y que parecería auténtico (Art. 3(60)). Para obras evidentemente artísticas o creativas la obligación se atenúa a una divulgación "que no estorbe". El **texto IA publicado para informar sobre asuntos de interés público** también debe divulgarse, **salvo que tenga revisión humana y responsabilidad editorial**. Código de Prácticas de transparencia final, declarado "adecuado", y Guías finales del 20-07-2026 (no vinculantes) [S22, A-M]. Sanciones por incumplir el Art. 50: hasta **EUR 15M o 3 % de la facturación mundial** (Art. 99(4)) [A, texto del Reglamento]. **Alcance territorial:** aplica también a operadores de fuera de la UE cuando el output se usa en la UE (Art. 2) [A]. | A-M |
| **Matiz no resuelto** | En un video renderizado por un motor determinista a partir de **código que escribió un LLM**, ¿quién es el "proveedor" del contenido sintético? Probablemente nadie en el sentido de 50(2) para el render en sí. Pero **sí lo son** los proveedores de TTS, música y video IA que se usen. En la práctica, las obligaciones del equipo como *deployer* se concentran en deepfakes (voz o avatar de personas reales, productos o lugares fotorrealistas) y en textos de interés público. **Consultar a un abogado.** | B (interpretación propia) |
| **EE. UU. – voz y semejanza** | **NO FAKES Act (S.4591) no es ley:** pasó el Comité Judicial del Senado en junio de 2026; el 30-09 se bloqueó el intento de aprobarlo en el pleno; H.R. 8915 sigue en comité. El borrador prevé licencias **escritas** de hasta 10 años [S34, M]. Siguen vigentes leyes estatales de *right of publicity* y de réplica digital (p. ej. Tennessee ELVIS Act 2024 y las leyes de réplica digital de California de 2024) [conocimiento previo, **no reverificado en esta búsqueda**, M]. | M |
| **Otros** | **España:** anteproyecto de 2025 con multas de hasta EUR 35M por no etiquetar; **no confirmé si se aprobó** [S41, B]. **Dinamarca:** reforma de copyright que da derecho sobre la propia cara y voz; adopción **no confirmada** [S41, B]. **Argentina:** el **Art. 53 del Código Civil y Comercial** exige consentimiento para "captar o reproducir la imagen o la voz" de una persona, y la Ley 25.326 protege datos personales [conocimiento previo, **no reverificado**, M]. No pude verificar proyectos de ley de IA argentinos de 2026 (cupo agotado). | B-M |
| **Consentimiento para clonar voz** | ElevenLabs: un **Professional Voice Clone solo puede ser de la propia voz**, con verificación; para usar la voz de otro, esa persona la crea en su cuenta y la comparte. En el Instant Voice Clone el usuario declara tener los derechos y **la responsabilidad legal recae en él** [S35, A-M]. Para avatares (HeyGen u otros), verificar la política de consentimiento vigente: **pendiente** (sección 9). | A-M |

**Recomendación práctica:**
- Firmar C2PA (Content Credentials) en los masters que lleven elementos realistas generados por IA.
- **HyperFrames no firma C2PA.** Solo escribe dos tags de contenedor sin firma (`hyperframes_renderer`, `hyperframes_version`) que su propia documentación describe como "never a basis for trust… Verifiable provenance needs signed claims (C2PA)" [L9, A]. Hace falta un paso de firma aparte en el pipeline.

### 4.6 Derechos de autor sobre el output de IA

- **US Copyright Office, Parte 2 (29-01-2025):** los outputs de IA solo son protegibles cuando hay **aporte expresivo humano suficiente**: obra humana perceptible, o selección, arreglo o modificación creativos. **Los prompts por sí solos no alcanzan.** El análisis es caso por caso y hay que **declarar el uso de IA** al registrar [S29, A].
- **Implicancias para clientes:**
  - Un video "100 % prompt" puede **no tener copyright** registrable en EE. UU. Competidores podrían copiarlo y el cliente tendría poca defensa.
  - Lo protegible es el guion, el storyboard, los assets de marca, la selección y el arreglo, y las ediciones humanas. **Hay que documentarlos** (sección 6.3).
  - Los contratos con clientes deben **ajustar la garantía de titularidad**: "cedemos los derechos que existan" en lugar de "garantizamos copyright pleno", con un anexo de procedencia.
  - El **código** escrito por IA tiene el mismo problema.
- **Términos de Anthropic:** las Commercial Terms **asignan el output al cliente** e incluyen una **indemnidad por reclamos de propiedad intelectual de terceros** en uso pago comercial. Según análisis secundarios, **excluye marcas por uso comercial del output**, modificaciones, combinaciones con tecnología ajena y los inputs del cliente [S30, M]. **Los planes de consumo (Pro/Max) se rigen por las Consumer Terms**, sin esa indemnidad y con entrenamiento activado por defecto salvo opt-out [S30, S31, M].
  → **No usar Pro/Max para trabajos de clientes.**
- *Thaler v. Perlmutter* (D.C. Cir., marzo de 2025) confirmó el requisito de autoría humana [conocimiento previo, A]. **No pude verificar** si la Corte Suprema resolvió un *certiorari* en 2026.

### 4.7 Marcas, logos e interfaces de terceros (crítico en videos tech)

- **Uso nominativo (EE. UU.):** se puede nombrar un producto de un tercero si (1) no se lo puede identificar de otra forma, (2) se usa solo lo necesario y (3) no se sugiere patrocinio o aval. **Los logos y los íconos de apps son más riesgosos que la marca en texto** [S37, M]. Para campañas con mucho uso de marcas ajenas, conviene un permiso escrito [S37].
- **HyperFrames automatiza una decisión legal:** `media-use resolve --type logo` descarga "official brand marks" (theSVG → avatar de GitHub → favicon) [L7]. Es técnicamente prolijo, porque "never redrawn", pero **la decisión de usar el logo debe ser humana** y estar registrada.
- **Capturas de UI de terceros:** la UI tiene copyright y los ToS pueden restringir capturas. Además pueden aparecer **datos personales o de clientes** en pantalla. Hay que **difuminar**, usar cuentas demo y seguir las guías de marca del titular (Apple, Google, Microsoft, AWS publican las suyas) [S37, M].
- La indemnidad de Anthropic **no cubre marcas** [S30, M].

### 4.8 Seguridad y confidencialidad

| Riesgo | Evidencia | Control recomendado | Confianza |
|---|---|---|---|
| **Skills y plugins de terceros = código más prompts con tus permisos** | Snyk "ToxicSkills" (feb-2026): cerca del 37 % de los skills analizados tenía al menos una falla de seguridad y se encontraron 1.467 payloads maliciosos (cifras del titular y del resumen) [S38]. ClawHavoc: 341 skills maliciosos. Campaña de más de 30 skills maliciosos en ClawHub para Claude Code/OpenClaw. Inyección con caracteres Unicode invisibles en SKILL.md, mitigada en Claude Code el 10-02-2026. CVEs de Check Point en archivos de settings del repo [S38]. | **Allowlist** de marketplaces con `strictKnownMarketplaces` y `blockedMarketplaces` en managed settings [S40]; revisión de código de cada skill; congelar versiones con hash (HyperFrames publica `skills-manifest.json` con hashes por skill) [L1]. **Ojo:** estos controles **no alcanzan** sesiones en Bedrock, Vertex o Foundry [S40]. | M-A |
| **Volumen de código ejecutable** | Los skills de HyperFrames traen **221 scripts** (js/mjs/cjs/py/sh/ts); los de Remotion, **20**, casi todos utilitarios de mapas [conteo local]. | Más superficie implica más revisión. Preferir sandbox y contenedores efímeros. | A |
| **Auto-actualización hacia "latest"** | El skill de HyperFrames ordena verificar `npx hyperframes@latest upgrade --project . --check` y **aplicar el bump**: "Act on the signal rather than relaying it to the user". También admite que un `check` aprobado **no garantiza que el render sea idéntico cuadro a cuadro** [L5]. El skill `remotion-upgrade` actualiza a la última estable y corre `npx skills update … --yes` [L13]. | **Deshabilitar** las actualizaciones automáticas por política (instrucción en CLAUDE.md o managed settings); actualizar en una ventana planificada con pruebas *golden*. | A |
| **npm comprometido** | Shai-Hulud 2.0 (fines de 2025). "Mini Shai-Hulud" (mayo–junio de 2026; TanStack, con **atestaciones SLSA L3 válidas**). CHAINDROP (agosto de 2026; ecosistema keyv, más de 1.300 versiones según Elastic). Ejecuta en `preinstall` [S39]. | Lockfile y `npm ci`; `--ignore-scripts` donde se pueda; **periodo de espera** de 7 a 14 días antes de adoptar versiones nuevas; mirror interno; escaneo SCA. | A |
| **Telemetría y feedback de HyperFrames** | Telemetría con ID de instalación seudónimo, **vinculado a la cuenta HeyGen al iniciar sesión** ("Not fully anonymous by design") [L12]. Registra el entorno (`agent_runtime`, `sandbox_runtime`) [L6]. El skill indica al agente que **envíe un reporte de feedback tras cada render**, a un **"public channel"**, incluido "MISSING FEATURE: lo que pidió la persona, en sus palabras" con nombres y clientes quitados **por el propio agente** [L6]. | `HYPERFRAMES_NO_TELEMETRY=1` y `DO_NOT_TRACK=1` en todos los entornos; instrucción explícita de no enviar feedback; revisar egress. | A |
| **Datos del cliente fuera del perímetro** | `hyperframes cloud render` y `publish` **zipean y suben el proyecto** a HeyGen (S3) [L10]. Los prompts con roadmap, métricas o UI no lanzada van a Anthropic. | Renders confidenciales solo en local o en nube propia (Lambda/Cloud Run en tu cuenta); DPA con cada proveedor; clasificación de datos por pieza. | A |
| **Retención de datos de Anthropic** | **Commercial (Team, Enterprise, API):** sin entrenamiento y borrado en unos 30 días. **ZDR** negociable para Enterprise/API, por organización. **Consumer (Pro/Max):** entrenamiento activado por defecto salvo opt-out, con retención larga si no se desactiva [S31, M]. Hay reportes no confirmados de una retención obligatoria de 30 días para ciertos modelos aun con ZDR desde junio de 2026 [S31, B]. | Solo planes comerciales para trabajo de clientes; confirmar la retención por escrito con Anthropic. | M |
| **Código cargado en el render** | GSAP y three.js desde CDN [L2, L4]. | Vendorizar; render en Docker fijado [L15]. | A |

---

## 5. Riesgos de marca, calidad y operación

| Riesgo | Descripción | Evidencia | Mitigación |
|---|---|---|---|
| **Deriva de identidad visual** | Sin restricciones, el modelo vuelve a sus defaults (fuentes, easings, layouts). | Lista de "banned fonts" del skill [L8]; [S12]. | Spec de diseño normativa (HyperFrames lee `DESIGN.md` y `frame.md` como "brand truth" [L8]); componentes aprobados; QA de marca con checklist. |
| **Monocultura entre marcas** | Todos usan los mismos skills y bloques de catálogo ("~400 blocks") [L7], así que tu video se parece al de la competencia. | [L7, general-video] ordena buscar primero en el catálogo antes de inventar un look. | Catálogo propio; prohibir bloques públicos en hero shots. |
| **Dependencia de un "prompt hero"** | El conocimiento queda en la cabeza o el historial de una persona; los prompts no son reproducibles (los LLM no son deterministas). | Inferencia. | **Lo reproducible es el código más el lockfile, no el prompt.** Archivar ambos y documentar decisiones en el repo. |
| **Deuda técnica de composiciones** | Cada video es un pequeño proyecto de software que alguien debe mantener cuando cambia el framework. | HyperFrames: **333 notas de release entre el 27-05-2026 (v0.6.52) y el 19-10-2026 (v0.8.174)**, unas 2,3 por día, y 24 en la última semana [L11]. Soporte de seguridad solo para 0.x [L3]. | Fijar versiones por proyecto; congelar los proyectos archivados; render master en formato intermedio (ProRes o PNG sequence) para no depender del re-render. |
| **Vendor lock-in** | HyperFrames empuja a servicios de HeyGen: TTS, catálogo de música (que **falla sin el CLI de heygen**), avatares y cloud render [L7, L10]. Remotion cambia precios y condiciones [S4]. Claude Motion está ligado al plan de Anthropic [S20]. | Docs locales. | Mantener una capa de abstracción (assets locales); evaluar los dos frameworks; masters exportados. |
| **Cambio de modelo que altera outputs** | Un modelo nuevo puede **empeorar** en motion; un modelo retirado devuelve error. | Code2Video [S11, S14]; Anthropic avisa con al menos 60 días antes de retirar un modelo y después las llamadas fallan [S32]. | Fijar `claude-opus-5-5` en la configuración; suite *golden* (5 a 10 briefs de referencia) y comparación visual antes de migrar. |
| **Reputación por errores factuales** | Un gráfico con una cifra inventada en un video de tecnología destruye credibilidad. | [S12, S20] | Firma obligatoria de un SME; datos con fuente. |
| **Política de plataforma** | Canales con muchas piezas templadas pueden caer en la categoría "generic/repetitive" de YouTube y perder monetización. | [S25] | Variedad editorial real, aporte humano visible, no producir en masa. |

---

## 6. Gobernanza recomendada

### 6.1 Política de uso de IA en producción (esqueleto)

1. **Alcance:** qué piezas pueden ser IA-first, híbridas o tradicionales (matriz de la sección 2).
2. **Herramientas aprobadas:** modelo (`claude-opus-5-5`, fijado), planes (solo Team Premium o Enterprise, **nunca Pro/Max para clientes**), frameworks (HyperFrames y/o Remotion con versión fijada), skills en allowlist con hash, proveedores de voz, música e imagen con contrato.
3. **Usos prohibidos:**
   - clonar voces o caras sin consentimiento escrito;
   - generar datos, cifras o código para mostrar sin fuente;
   - usar logos o UI de terceros sin la aprobación de la sección 6.4;
   - subir material confidencial a servicios sin DPA;
   - usar bloques de catálogo con origen no confirmado [L2];
   - actualizar dependencias de forma automática.
4. **Niveles de riesgo por pieza:**
   - **N1:** interno o social de bajo alcance, sin personas ni marcas de terceros.
   - **N2:** externo de marca.
   - **N3:** paid media, voces o avatares, datos de clientes, sectores regulados o distribución en la UE con elementos realistas.
5. **Divulgación:** etiquetas de plataforma y Art. 50 según la sección 4.5; C2PA en masters N2/N3 con elementos realistas.
6. **Seguridad:** managed settings, sandbox, telemetría apagada, renders confidenciales en local o en nube propia.
7. **Revisión de la política:** trimestral, o ante un cambio de modelo, framework o regulación.

### 6.2 Quién firma (RACI simplificado)

| Rol | Responsabilidad | Firma en |
|---|---|---|
| **Productor/a de la pieza** (owner) | Completa el registro de procedencia y el checklist | Todas |
| **Director/a creativo/a** | Calidad, marca y continuidad | N1 (muestreo), N2 y N3 |
| **SME / PM del producto** | Exactitud de datos, código, UI y claims | Toda pieza con datos, código o UI |
| **Legal / Compliance** | Licencias, marcas, consentimientos, divulgación y contrato | N2 (muestreo) y N3 (siempre) |
| **Tech lead / SecOps** | Allowlist de skills y paquetes, versiones, entorno de render y datos | Al aprobar herramientas y en cada upgrade |

### 6.3 Registro de assets y procedencia (`PROVENANCE.yaml` por proyecto)

```yaml
proyecto: "2026-11-launch-feature-x"
nivel_riesgo: N2
modelo: { id: claude-opus-5-5, plan: enterprise, fecha_uso: 2026-10-19 }
framework: { nombre: hyperframes, version: 0.8.174, lockfile_sha256: "<hash>" }
skills: [{ nombre: hyperframes-core, hash: "66fc3e623a910923", fuente: heygen-com/hyperframes }]
aporte_humano: ["guion", "storyboard", "seleccion y arreglo de escenas", "ajuste de timing", "color final"]
assets:
  - id: bgm_001
    tipo: musica
    origen: libreria_licenciada   # humano | ia | stock | tercero | captura
    proveedor: "<nombre>"
    licencia: "<tipo>", licencia_url: "<url>", archivo_licencia: licenses/bgm_001.pdf
    restricciones: { canales: [youtube, linkedin, paid], territorios: [mundial], vence: 2027-12-31 }
    atribucion_requerida: false
    content_id_whitelist: "<si aplica>"
  - id: logo_aws
    tipo: logo_tercero
    origen: tercero
    justificacion_uso_nominativo: "integracion mencionada; logo secundario; sin aval implicito"
    aprobado_por: legal@...
  - id: vo_main
    tipo: voz
    origen: ia_tts
    proveedor: "<nombre>", voz: "generica_no_clonada"
    consentimiento: null          # o ruta al contrato si es clon
    divulgacion: { youtube_toggle: false, motivo: "voz generica no realista de persona real" }
datos_mostrados: [{ grafico: escena_3, fuente: data/q3-metrics.csv, verificado_por: sme@... }]
c2pa: { firmado: true, herramienta: "<c2patool/otra + version>" }
firmas: { creativo: "...", sme: "...", legal: "...", fecha: "..." }
```

### 6.4 Checklist legal/compliance por pieza (listo para copiar)

```markdown
## Checklist IA – Pieza: ____________  | Nivel: N1 / N2 / N3 | Owner: ________ | Fecha: ________
> No es asesoramiento legal. Ante dudas en N2/N3, escalar a Legal.

### A. Identificación y herramientas
- [ ] Modelo, plan y versión registrados (solo plan comercial; nunca Pro/Max para clientes)
- [ ] Framework y versión fijados; lockfile commiteado; sin upgrades automáticos durante la pieza
- [ ] Skills usados en la allowlist, con hash registrado
- [ ] Telemetría y feedback automático deshabilitados (HYPERFRAMES_NO_TELEMETRY=1 / DO_NOT_TRACK=1)

### B. Datos y confidencialidad
- [ ] Clasificación de datos de la pieza (pública / interna / confidencial / cliente)
- [ ] Datos confidenciales del cliente solo con proveedores con DPA; render local o en nube propia
- [ ] Sin secretos, API keys, emails, nombres de clientes ni datos personales visibles en capturas o código
- [ ] Ningún "cloud render" ni "publish" a servicios de terceros sin aprobación

### C. Exactitud (videos tech)
- [ ] Cada cifra, gráfico y claim tiene fuente en un archivo del proyecto (no inventada por el modelo)
- [ ] El código que se muestra compila o corre y fue revisado; no reproduce código con licencia incompatible
- [ ] La UI mostrada corresponde a la versión real (o está marcada como "ilustrativa")
- [ ] SME firmó la exactitud técnica

### D. Software y licencias
- [ ] Licencias de framework y dependencias revisadas (Apache-2.0, GSAP Standard License, MPL, CC-BY)
- [ ] Remotion: seats de Company License al día (si aplica; cuenta cada persona que prompteá Remotion)
- [ ] Sin bloques o assets de catálogo con "origen por confirmar"
- [ ] Atribuciones requeridas (CC BY, NOTICE) incluidas donde corresponda

### E. Tipografías
- [ ] Cada fuente tiene una licencia que cubre video, el canal (social / broadcast / paid) y el embedding web/woff2 si se embebe
- [ ] Ninguna fuente desktop sin licencia de embedding fue auto-capturada o subida a nube de terceros
- [ ] Archivo de licencia guardado en /licenses

### F. Música y SFX
- [ ] Licencia escrita que cubre canales, territorios, paid media y vigencia
- [ ] Si es música IA: proveedor con términos comerciales; riesgo de Content ID evaluado; sin "estilo de" artistas reales
- [ ] SFX CC BY acreditados en la descripción o los créditos
- [ ] Prueba de Content ID (subida privada o no listada) antes de publicar en N2/N3

### G. Imágenes, video y stock
- [ ] Licencias de stock guardadas; restricciones (personas, marcas, usos sensibles) respetadas
- [ ] Imágenes o video IA fotorrealistas identificados para la divulgación (sección J)

### H. Personas, voces y avatares
- [ ] Sin clon de voz ni avatar de persona real sin **consentimiento escrito** (alcance, canales, plazo, revocación, compensación)
- [ ] Consentimiento conforme a la ley local (p. ej. Art. 53 CCyC en Argentina; right of publicity en EE. UU.)
- [ ] Sin imitación de figuras públicas, ni siquiera "parecida"

### I. Marcas y UI de terceros
- [ ] Uso nominativo justificado: solo lo necesario, sin aval implícito, preferir texto a logo
- [ ] Guías de marca del titular revisadas (logos, capturas)
- [ ] Logos obtenidos automáticamente (p. ej. media-use --type logo) aprobados por una persona
- [ ] Publicidad comparativa revisada por Legal (N3)

### J. Divulgación y etiquetado
- [ ] ¿Hay contenido realista sintético (voz de persona, avatar, footage o imagen fotorrealista de personas, productos o lugares)?  Sí / No
- [ ] Si sí: toggle de YouTube / autodeclaración de Meta / etiqueta de TikTok / nota en LinkedIn aplicados
- [ ] Si la pieza se usa en la UE: obligación de deepfake (Art. 50(4)) evaluada; divulgación visible si aplica
- [ ] Si el texto es de interés público: revisión editorial humana documentada
- [ ] Master firmado con C2PA (N2/N3 con elementos realistas); metadatos no removidos en la exportación

### K. Derechos y contrato
- [ ] Aporte humano documentado (guion, storyboard, selección, edición)
- [ ] El contrato con el cliente refleja el uso de IA y ajusta la garantía de titularidad
- [ ] Se informó al cliente si la pieza puede no ser registrable en EE. UU.

### L. Reproducibilidad y archivo
- [ ] Repo con código, lockfile, PROVENANCE.yaml, prompts o transcript exportados, /licenses
- [ ] Master en formato intermedio (ProRes o PNG sequence) y entregables archivados con hash
- [ ] Prueba golden o re-render verificado si hubo upgrade

### M. Firmas
- [ ] Creativo: ________  - [ ] SME: ________  - [ ] Legal (N2 muestreo / N3): ________  - [ ] SecOps (si hubo cambios de tooling): ________
```

### 6.5 Versionado y archivo

- **Un repo por proyecto, o un monorepo con carpetas por pieza.** Contenido: `/brief`, `/src` (composiciones), `package.json` con lockfile, `hyperframes.json` o config de Remotion, `/assets`, `/licenses`, `/data` (fuentes de cifras), `/prompts` (transcript exportado de la sesión), `PROVENANCE.yaml`, `SIGNOFF.md` y `/renders` (master más entregables con SHA-256).
- **Fijar todo lo que cambia el output:** modelo, versión del framework, hash de cada skill, imagen Docker de render, fuentes y librerías *vendorizadas* (sin CDN).
- **No confiar en el re-render a largo plazo:** el master intermedio es el archivo de verdad. El código sirve para editar, no garantiza reproducir dentro de 3 años.
- **Retención** según contrato. Los prompts pueden contener información confidencial y se clasifican igual que el brief.

### 6.6 Métricas de calidad y negocio

| Familia | Métrica | Meta inicial sugerida |
|---|---|---|
| Eficiencia | Horas humanas por minuto terminado (por tipo de pieza) | Medir la línea base en el piloto; meta de −40 % contra tradicional en piezas estructuradas |
| Eficiencia | Rondas de revisión hasta la aprobación; tasa de aprobación en la primera revisión | ≤ 3 rondas; ≥ 50 % de aprobación en la primera |
| Costo | USD por minuto terminado (humano + modelo + licencias + render) | Contra los escenarios B y C de la sección 3.2 |
| Calidad | Defectos de marca por minuto (checklist de marca); fallas de legibilidad (contraste, tiempo en pantalla) | Tendencia a 0 en N2/N3 |
| Exactitud | Errores factuales detectados antes y después de publicar | **0 después de publicar** |
| Riesgo | Reclamos de Content ID, takedowns, etiquetas automáticas no previstas, incidentes de seguridad | 0; cada caso con post-mortem |
| Resultado | Retención, CTR y conversión contra piezas tradicionales comparables | No peor que la línea base |
| Reutilización | % de la pieza construida con componentes aprobados | ≥ 60 % a los 6 meses |
| Estabilidad | Renders fallidos por cada 100; regresiones en la suite golden por upgrade | < 5; 0 sin aprobar |

### 6.7 Plan de adopción sugerido (90 días)

1. **Semanas 1–3: base.** Política, managed settings, allowlist, sistema de diseño en código (5 a 10 componentes), elección del framework con prueba en paralelo de HyperFrames y Remotion, revisión de licencias.
2. **Semanas 4–9: piloto.** 6 a 10 piezas N1/N2 de tipo explainer, social y data viz, en paralelo con el método tradicional, midiendo las métricas de 6.6.
3. **Semanas 10–13: decisión.** Escalar solo los tipos de pieza donde C sea mejor que B en costo **y** quede dentro de la tolerancia de calidad. N3 queda fuera del alcance hasta tener 3 meses sin incidentes.

---

## 7. Veredicto: tesis en 10 puntos para la dirección de contenido

1. **Adoptarla, pero como cambio de método, no como reemplazo de talento.** Rinde en piezas estructuradas (explainers, data viz, social, lower thirds parametrizados) y no rinde en publicidad premium, personajes ni 3D complejo.
2. **El ahorro grande está en las variantes y el volumen, no en la pieza única.** Contra un motion designer interno eficiente, el ahorro por minuto es moderado (de 1,5× a 3×, estimación). Contra una agencia puede ser de un orden de magnitud.
3. **Los tokens son lo de menos.** Entre USD 0,4 y 1 por clip de 12 s. Lo que cuesta son las horas de dirección, verificación y QA. Hay que presupuestar en horas humanas por minuto y medirlas en un piloto.
4. **Sin sistema de diseño propio, el resultado es "AI slop" reconocible.** Hasta el fabricante de HyperFrames publica una lista de fuentes prohibidas por ser un "AI tell". El senior pasa a diseñar el sistema y a dirigir.
5. **En videos tech, el riesgo número uno es la exactitud.** Los datos y el código que aparecen en pantalla salen de archivos con fuente y los firma un SME. Ninguna cifra la inventa el modelo.
6. **El riesgo legal está en los insumos:** música (Content ID, licencias IA), voces y avatares (consentimiento escrito), logos y UI de terceros, fuentes (cuidado con la auto-captura de fuentes desktop) y assets de catálogo con origen sin confirmar.
7. **La divulgación depende del realismo, no del uso de IA.** Un motion estilizado en general no requiere etiqueta. Voz clonada, avatares y fotorrealismo sí, en YouTube, Meta, TikTok y LinkedIn, y en la UE por el Art. 50 (vigente desde el 2-08-2026). Conviene firmar C2PA, que HyperFrames no hace por sí solo.
8. **Lo 100 % generado puede no tener copyright en EE. UU.** Hay que documentar el aporte humano y ajustar los contratos con clientes. Usar solo planes comerciales con indemnidad; nunca Pro/Max para clientes.
9. **Skills y npm son superficie de ataque real en 2026** (ToxicSkills, Shai-Hulud y CHAINDROP). Allowlist, versiones fijadas, sin auto-upgrade, telemetría apagada y renders confidenciales fuera de nubes de terceros sin DPA.
10. **Reproducibilidad: lo que se archiva es código, lockfile y master, no el prompt.** El framework cambia unas 2,3 veces por día y los modelos se retiran o empeoran. Fijar versiones, mantener una suite *golden* y migrar solo de forma planificada.

---

## 8. Supuestos clave del informe

- El equipo produce para clientes o marcas propias, con distribución en redes y posiblemente en la UE.
- El costo horario y las horas por minuto de la sección 3.2 son **supuestos de modelado**, no mediciones. El piloto debe reemplazarlos.
- Las fuentes secundarias sobre precios (Opus 5.5, planes Claude) pueden diferir de las páginas oficiales.

## 9. Pendiente de verificación (el cupo de búsquedas web se agotó)

1. Página oficial de precios de Anthropic (Opus 5.5 y Team Standard con o sin Claude Code) y Commercial Terms vigentes (cláusulas de indemnidad y retención por modelo).
2. Página oficial de licencia de Remotion (`remotion.pro/license`) y texto vigente de la GSAP Standard License.
3. Términos de licencia de los catálogos de **música e imágenes de HeyGen** y su **política de consentimiento para avatares**.
4. Estado de *Thaler v. Perlmutter* en la Corte Suprema (2026); estado legislativo en **Argentina** (proyectos de IA y deepfakes), **España** (ley de etiquetado) y **Dinamarca** (derecho sobre la propia imagen y voz).
5. Texto final publicado del *Digital Omnibus* sobre la gracia del Art. 50(2) y la Ayuda oficial de YouTube sobre la remoción de etiquetas automáticas.
6. Opiniones de primera mano de motion designers senior: no encontré hilos de Reddit, X o HN de octubre de 2026 con críticas profesionales directas. La evidencia de usuarios es sobre todo de blogs, tutoriales y el benchmark del fabricante.

---

## 10. Fuentes

### Web (consultadas el 19-10-2026 vía WebSearch; muchas son secundarias)
- **[S1]** GSAP Standard License: https://gsap.com/community/standard-license/
- **[S2]** Webflow, "GSAP becomes free": https://webflow.com/updates/gsap-becomes-free · Foro: https://discourse.webflow.com/t/webflow-makes-gsap-100-free/319967
- **[S3]** CSS-Tricks: https://css-tricks.com/gsap-is-now-completely-free-even-for-commercial-use/ · HN: https://news.ycombinator.com/item?id=43868273 · Pinegrow: https://forum.pinegrow.com/t/gsap-has-been-acquired-by-webflow/9906
- **[S4]** Remotion License FAQ: https://www.remotion.dev/docs/license/faq
- **[S5]** Remotion Lambda cost: https://www.remotion.dev/docs/lambda/cost-example · https://www.remotion.dev/lambda · https://rendercomp.com/blog/programmatic-video-rendering-cost-comparison/
- **[S6]** Precios de Opus 5.5 (secundarias): https://www.activepieces.com/blog/claude-opus-55-api-pricing-what-it-costs-in-2026 · https://www.aifreeapi.com/en/posts/claude-opus-5-5 · https://bazaarlink.ai/en/blog/claude-opus-5-5-api-pricing-en · https://www.layer3labs.io/guides/claude-opus-5-5-api-pricing
- **[S7]** Planes Claude (secundarias): https://www.wearetandem.ai/en/blog/tools/claude-max-pro-pricing-plans · https://benchlm.ai/claude/pricing-plans · https://www.superblocks.com/blog/claude-code-pricing · https://www.morphllm.com/claude-code-pricing
- **[S8]** Wireflow, clip de 12 s y costo: https://www.wireflow.ai/blog/claude-motion-graphics
- **[S9]** DEV, render con Opus 5.5 y costo real: https://dev.to/super_lewis/how-to-render-a-motion-graphics-video-with-claude-opus-55-prompt-frame-renderer-ffmpeg-and-real-3e1g
- **[S10]** Rescroll, Claude Code + Remotion: https://www.rescroll.ai/blog/claude-code-remotion-motion-graphics-2026 · Medium (lower thirds): https://medium.com/@tahirbalarabe2/build-ai-motion-graphics-with-claude-and-remotion-0990e6bbf773
- **[S11]** HeyGen Code2Video: https://www.heygen.com/research/introducing-code2video-benchmark · Kaggle: https://www.kaggle.com/benchmarks/heygen/code2video · HeyGen, septiembre de 2026: https://www.heygen.com/blog/heygen-september-2026-release
- **[S12]** "5 fixes for Claude motion graphics that look like AI slop": https://charliehills.substack.com/p/5-fixes-for-claude-motion-graphics · Artimind: https://aiartimind.com/how-to-make-motion-graphics-with-claude-opus-5-5/
- **[S13]** "Prompts I Rendered, Broke and Fixed": https://roo.beehiiv.com/p/claude-motion-graphics-prompts
- **[S14]** Pexo, comparación: https://pexo.ai/blog/programmatic-vs-ai-generated-video-with-claude-code-remotion-hyperframes-and-pexo-compared-6108 · Medium (Zepeda): https://patrickzepeda.medium.com/from-code-to-cinema-how-claude-and-hyperframes-are-quietly-disrupting-video-production-1136aeef0832 · https://blog.nidhin.dev/video-as-code-a-deep-dive-into-heygen-s-hyperframes
- **[S15]** Show HN HyperFrames: https://news.ycombinator.com/item?id=47902856 · https://news.ycombinator.com/item?id=47902941
- **[S16]** Wireflow, HyperFrames vs Remotion: https://www.wireflow.ai/blog/hyperframes-vs-remotion
- **[S17]** MUBBITS, ejemplos de Reddit con Opus 5.5: https://mubbits.com/blog/claude-opus-5-5-motion-graphics
- **[S18]** dsebastien, Opus 5.5: https://www.dsebastien.net/2026-10-04-claude-opus-5-5-ask-for-a-video-get-a-program-you-can-edit/
- **[S19]** aiblewmymind: https://aiblewmymind.substack.com/p/claude-opus-5-5-video-animations · Tendencias en X: https://x.com/i/trending/2103923009488646252
- **[S20]** Claude Motion: https://www.eesel.ai/blog/claude-motion-review · https://maximusmediascape.com/blogs/claude-motion-review-early-user-experience/ · https://superpowerdaily.com/posts/anthropic-adds-live-data-dashboards-and-editable-animations-to-claude · https://dev.to/dishant0406/i-asked-for-a-video-claude-motion-gave-me-an-html-file-459o · https://www.mindstudio.ai/blog/claude-motion-pricing-access
- **[S21]** Costos de producción: https://www.yumyumvideos.com/blog/how-much-does-an-explainer-video-cost/ · https://www.yumyumvideos.com/blog/how-much-does-animation-cost-per-minute-of-video/ · https://motifmotion.com/video-production-pricing-guide · https://www.yansmedia.com/blog/explainer-video-cost · https://darvideo.tv/blog/animated-video-cost-in-2026/
- **[S22]** AI Act, Art. 50: https://artificialintelligenceact.eu/article/50/ · FAQ de la Comisión: https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act · Firma del Código: https://digital-strategy.ec.europa.eu/en/faqs/signing-code-practice-transparency-ai-generated-content · Faegre Drinker: https://www.faegredrinker.com/en/insights/publications/2026/7/eu-ai-act-commission-confirms-transparency-code-of-practice-as-adequate-and-publishes-final-version-of-its-guidelines-on-transparency-obligations · Paul Weiss: https://www.paulweiss.com/insights/client-memos/eu-finalises-transparency-rules-for-ai-generated-content · Jones Day: https://www.jonesday.com/en/insights/2026/01/european-commission-publishes-draft-code-of-practice-on-ai-labelling-and-transparency
- **[S23]** Digital Omnibus y gracia del Art. 50(2): https://labs.cloudsecurityalliance.org/research/csa-research-note-eu-ai-act-article50-watermarking-deadline/ · https://usercentrics.com/knowledge-hub/eu-ai-act-high-risk-delay-article-50-transparency-consent/ · https://getactready.com/blog/eu-ai-act-watermarking-grace-period-misread
- **[S24]** YouTube, divulgación: https://shortsfast.com/blog/youtube-ai-content-disclosure-rules-2026/ · https://aicleanify.com/blog/youtube-ai-content-labels-2026-c2pa-synthid · https://influencermarketinghub.com/ai-disclosure-rules/
- **[S25]** TechCrunch, YouTube "AI slop" (20-07-2026): https://techcrunch.com/2026/07/20/youtube-clarifies-policies-around-ai-slop-and-upsetting-videos/
- **[S26]** TikTok: https://storrito.com/resources/tiktoks-2026-ai-labeling-rules-and-what-they-signal-for-platform-governance/ · https://www.cinerads.com/blog/tiktok-ai-content-policy
- **[S27]** Meta: https://www.postora.org/blog/ai-generated-content-labels-social-media-2026 · https://almcorp.com/news/meta-ai-labels-facebook-instagram-ads-disclosure-2026/ · https://www.sume.com/blog/ai-info-label-on-facebook-and-instagram
- **[S28]** LinkedIn: https://www.socialmediatoday.com/news/linkedin-labels-ai-generated-content/716674/ · https://www.lindseygamble.com/blog/linkedin-adopts-c2pa-standards-to-identify-and-tag-ai-generated-content
- **[S29]** US Copyright Office: https://www.copyright.gov/ai/ · https://www.loc.gov/item/prn-25-010/copyright-office-releases-part-2-of-artificial-intelligence-report/2025-01-29/ · https://www.jonesday.com/en/insights/2025/02/copyrightability-of-ai-outputs-us-copyright-office-analyzes-human-authorship-requirement
- **[S30]** Indemnidad de Anthropic: https://anthropic.com/news/expanded-legal-protections-api-improvements · https://www.sternekessler.com/news-insights/insights/the-hidden-limits-of-ai-indemnification-managing-ip-risk-across-the-generative-ai-stack/ · https://terms.law/ToS-Watchdog/ai-services/anthropic/
- **[S31]** Retención de datos: https://platform.claude.com/docs/en/manage-claude/api-and-data-retention · https://www.getvoibe.com/resources/is-claude-code-safe/ · https://xenospectrum.com/en/anthropic-customer-cloud-retention/
- **[S32]** Deprecación de modelos: https://platform.claude.com/docs/en/about-claude/model-deprecations
- **[S33]** Música IA: https://www.musicbusinessworldwide.com/suno-upgrades-ai-song-editor-as-labels-reportedly-push-for-content-id-style-fingerprinting-in-licensing-talks-with-ai-music-platforms/ · https://ppc.land/youtube-music-labels-songs-made-primarily-with-generative-ai · https://dynamoi.com/learn/ai-music-distribution/ai-music-copyright-cases-timeline · https://undetectr.com/blog/ai-music-youtube-copyright-claims
- **[S34]** NO FAKES Act: https://www.govtrack.us/congress/bills/119/s4591 · https://www.manatt.com/insights/newsletters/client-alert/congress-reintroduces-the-no-fakes-act-what-s-new-in-the-2026-bill · https://www.hklaw.com/en/insights/publications/2026/06/senate-judiciary-committee-advances-legislation-to-protect-name
- **[S35]** ElevenLabs: https://help.elevenlabs.io/hc/en-us/articles/36842751624209-Can-I-create-a-Professional-Voice-Clone-of-someone-else-s-voice · https://elevenlabs.io/docs/eleven-creative/voices/voice-cloning
- **[S36]** Fuentes: https://helpx.adobe.com/fonts/using/font-licensing.html · https://everpop.app/blog/can-you-use-any-font-in-your-videos · https://josephnilo.com/blog/adobe-fonts-frequently-asked-questions/
- **[S37]** Marcas: https://www.michaelbest.com/insights/nominative-fair-use-the-dos-and-donts-for-using-someone-elses-trademark-102mpkz/ · https://www.nolo.com/legal-encyclopedia/when-you-need-permission-use-trademarks.html · https://www.avvo.com/legal-answers/can-i-put-icons-of-other-apps-in-my-marketing-vide-2337649.html
- **[S38]** Seguridad de skills: https://snyk.io/blog/toxicskills-malicious-ai-agent-skills-clawhub/ · https://labs.cloudsecurityalliance.org/research/csa-research-note-skill-md-agent-context-poisoning-20260506/ · https://labs.cloudsecurityalliance.org/research/csa-research-note-claude-code-github-action-prompt-injection/ · https://arxiv.org/pdf/2605.11418 · https://arxiv.org/pdf/2606.07131
- **[S39]** npm: https://www.elastic.co/security-labs/shai-hulud-chaindrop-npm-supply-chain · https://www.stepsecurity.io/blog/mini-shai-hulud-is-back-a-self-spreading-supply-chain-attack-hits-the-npm-ecosystem · https://www.microsoft.com/en-us/security/blog/2025/12/09/shai-hulud-2-0-guidance-for-detecting-investigating-and-defending-against-the-supply-chain-attack/ · https://www.csa.gov.sg/alerts-and-advisories/advisories/ad-2026-009/
- **[S40]** Managed settings de Claude Code: https://code.claude.com/docs/en/managed-settings · https://code.claude.com/docs/en/admin-setup · https://code.claude.com/docs/en/settings-reference
- **[S41]** España y Dinamarca: https://www.euronews.com/next/2025/03/12/spain-could-fine-ai-companies-up-to-35-million-in-fines-for-mislabelling-content · https://globallawexperts.com/denmark-deepfake-law-2026/
- **[S42]** awesome-claude-video-skills (catálogo con calificación de seguridad): https://github.com/zhuyansen/awesome-claude-video-skills
- **[S43]** IA dentro de After Effects: https://github.com/LobzyJay/motion-design-with-claude · https://www.motionui.net/

### Evidencia local (datos no confiables, solo leídos)
- **[L1]** `/home/user/heygen-com/hyperframes/LICENSE` (Apache-2.0), `plugin.json` (v0.8.174, Apache-2.0), `skills-manifest.json` (hash por skill)
- **[L2]** `/home/user/heygen-com/hyperframes/CREDITS.md`: GSAP Standard License no OSI, MPL-2.0, CC-BY-4.0, assets con "origin to be confirmed"
- **[L3]** `/home/user/heygen-com/hyperframes/SECURITY.md`: solo 0.x con soporte
- **[L4]** `/home/user/heygen-com/hyperframes/packages/core/src/gsapCdn.ts`: GSAP 3.15.0 desde jsDelivr
- **[L5]** `/home/user/heygen-com/hyperframes/skills/hyperframes/SKILL.md`, § "Keep the project's CLI current" (auto-upgrade)
- **[L6]** `/home/user/heygen-com/hyperframes/skills/hyperframes-cli/SKILL.md`, `references/upgrade-info-misc.md` y `references/preview-render.md` (telemetría y feedback a un canal público)
- **[L7]** `/home/user/heygen-com/hyperframes/skills/media-use/` (`SKILL.md`, `references/resolve.md`, `references/setup-providers.md`, `audio/references/sfx.md`, `audio/assets/sfx/CREDITS.md`) y `skills/faceless-explainer/SKILL.md` y `skills/general-video/SKILL.md`
- **[L8]** `/home/user/heygen-com/hyperframes/skills/hyperframes-creative/references/typography.md`: fuentes "prohibidas" y auto-captura de fuentes locales
- **[L9]** `/home/user/heygen-com/hyperframes/docs/guides/rendering.mdx` y `packages/engine/src/utils/renderProvenance.ts` (sin C2PA)
- **[L10]** `/home/user/heygen-com/hyperframes/skills/hyperframes-cli/references/cloud.md`: zip y subida a HeyGen
- **[L11]** `/home/user/heygen-com/hyperframes/releases/`: 333 notas entre v0.6.52 (27-05-2026) y v0.8.174 (19-10-2026)
- **[L12]** `/home/user/heygen-com/hyperframes/skills/media-use/references/telemetry-dashboard.md`: identidad seudónima vinculada a la cuenta
- **[L13]** `/home/user/remotion-dev/skills/README.md`, `package.json` (v4.0.536) y `skills/remotion-upgrade/SKILL.md`
- **[L14]** `/home/user/heygen-com/hyperframes/docs/guides/hyperframes-vs-remotion.mdx`: determinismo por *seek* y fila de licencias
- **[L15]** `/home/user/heygen-com/hyperframes/docs/guides/troubleshooting.mdx`: render distinto del preview y Docker fijado
- **[L16]** `/home/user/heygen-com/hyperframes/skills/embedded-captions/SKILL.md`: Whisper alucina sobre silencio
- Conteo local de scripts: 221 en `hyperframes/skills` y 20 en `remotion-dev/skills/skills`
