# RACI Y DERECHOS DE DECISIÓN — Pipeline de motion graphics con IA

> R = Responsable (ejecuta) · A = Aprueba internamente (**uno solo por fila**) · C = Consultado · I = Informado
> **R\*** = el agente de IA ejecuta **bajo supervisión** del R humano de la fila. El agente **nunca** es A ni aprobador.
> **Sign-off cliente** = aprobación formal del aprobador único del cliente (además de la A interna).

## 1. Roles
| Sigla | Rol | Misión en una línea |
|---|---|---|
| PE | Productor ejecutivo / Productor | Alcance, dinero, tiempo, riesgo; voz única hacia el cliente; consolida feedback |
| GU | Guionista | Palabras, estructura, hook, ritmo, registro de claims |
| DC | Director creativo / de arte | Concepto, look, design spec, calidad final |
| MD | Motion director (ex motion designer) | Lenguaje de movimiento; escribe specs; dirige al agente escena por escena; polish de momentos héroe |
| TD | Technical director / harness engineer | Entorno del agente, gates automáticos, render, masters, versiones fijadas, costos, licencias de software, seguridad de datos |
| ED | Editor | Ritmo global, ensamble con footage, cortes, versiones |
| SD | Sound designer / mezclador | SFX, música (licencias), mezcla, loudness, stems |
| QA | QA / compliance | Conformidad técnica, legal, marca, accesibilidad, disclosure; veto de entrega |
| SME | Experto técnico | Exactitud de claims y UI |
| CL | Cliente (aprobador único + consultados) | Objetivo, mandatorios, aprobaciones |
| IA | Agente (Claude Code + skills) | Ejecución: borradores, build, checks, versiones, empaquetado |

## 2. Matriz RACI por fase
| Fase / entregable | PE | GU | DC | MD | TD | ED | SD | QA | SME | IA | Sign-off CL |
|---|---|---|---|---|---|---|---|---|---|---|---|
| G0 Brief + SOW + matriz de entregables | **A**/R | C | C | I | C | I | I | I | C | R\* (borrador) | **Sí** |
| G1 Investigación + registro de claims | A | R | I | I | I | – | – | I | C (firma claims) | R\* (síntesis) | Si hay claims sensibles |
| G2 Concepto / treatment | C | R | **A** | C | C | I | I | – | I | R\* (variantes) | **Sí** |
| G3 Guion a dos columnas | C | R | **A** | C | I | C | I | C | C (veto exactitud) | R\* (compresión/timing) | **Sí** |
| G4 Moodboard / styleframes / `frame.md` | I | I | **A** | R | C | I | – | C | – | R\* (exploración en código) | **Sí** |
| G5 Storyboard (`STORYBOARD.md`) + shot list | C | C | **A** | R | C | C | I | I | C | R\* (sketches) | Opcional |
| G6 Animatic con VO scratch | C | C | **A** | R | C | R | C | I | C | R\* (TTS + sketch pass) | **Sí** |
| G6b VO final (locutor / TTS) | **A** | C | C | I | I | I | R | I | C (pronunciación) | R\* (si TTS) | Si voz de marca |
| Captura (screen recordings, footage) | A | I | C | C | C | R | I | C (PII) | C | – | No |
| Harness (plantilla, skills, tokens, CI, render) | I | – | C | C | **A**/R | – | – | C | – | R\* | No |
| G7 Build con IA | I | I | **A** | R | R | C | I | I | I | R\* (ejecución) | No |
| G8 Rondas de revisión | **A** | C | R | R | C | R | C | I | C | R\* (aplica cambios) | **Sí** |
| Change orders | **A** | C | C | C | C | I | I | I | – | – | **Sí** |
| G9 Picture lock | **A** | C | R | R | I | R | I | C | C | – | **Sí** |
| G10 Sonido / mezcla / stems | I | I | C | I | I | C | **A**/R | C | – | R\* (análisis loudness) | En R final |
| G11 Captions | I | C | I | I | C | R | I | **A** | C | R\* (transcripción) | No |
| G12 Master + textless | I | – | C | C | R | R | R | **A** | – | R\* (render) | No |
| G13 Versionado por formato / idioma | C | I | **A** | R | R | R | C | C | – | R\* | Muestra |
| G14 QA | I | C | C | C | C | C | C | **A**/R | C | R\* (chequeos automáticos) | No |
| G15 Entrega + archivo | **A** | I | I | I | R | R | R | C | – | R\* (empaquetado) | **Acuse** |
| Publicación (si la hace la productora) | **A**/R | I | C | I | I | R | I | C | – | – (prohibido) | **Sí** |

## 3. Derechos de decisión (quién tiene la última palabra)
| Decisión | Decide | Veto | Nunca decide |
|---|---|---|---|
| Mensaje único, audiencia, KPI | CL (con PE) | — | IA |
| Alcance, rondas, change orders | PE | CL (firma) | IA, MD |
| Exactitud técnica de claims / UI | SME | Legal (comparativos, pricing) | IA, GU solo |
| Look / design spec | DC | CL (marca) | IA |
| Hook final y momentos héroe | DC + GU | CL | IA |
| Ritmo / timing fino | MD + ED | DC | IA |
| Música y voz (incl. licencias y consentimientos) | SD + PE | Legal / QA | IA |
| Disclosure de IA | QA (con legal) | — | IA |
| "Listo para entregar" | QA | PE | IA |
| Herramientas y datos que se envían a terceros | TD | Legal / CL | IA |

## 4. Límites del agente (para `CLAUDE.md` de la casa y permisos)
- ✅ Puede: redactar borradores; construir y modificar composiciones; correr `lint`/`check`/`snapshot`/`render`; transcribir; preparar paquetes; proponer clasificación de feedback.
- ⛔ No puede: aprobar nada; inventar datos, cifras o textos en pantalla; modificar escenas con `lock: true`; publicar o enviar a clientes; subir proyectos/frames del cliente a servicios externos no aprobados (p. ej. issues públicos, APIs de visión de terceros); usar música/voz sin licencia registrada; cambiar versiones de skills/dependencias sin TD.
- 🔁 Siempre: trabajar sobre rama de ronda; commitear con FB-ID; reportar qué verificó (comandos + timestamps de snapshots) y qué NO pudo verificar (ritmo, audio).

## 5. Escalamiento
| Situación | Escala a | Plazo |
|---|---|---|
| Feedback contradictorio entre stakeholders | PE → aprobador CL | 24 h |
| Claim sin sustento pedido por el cliente | PE → SME + Legal | Antes de ejecutar |
| Cambio post-gate | PE (change order) | Antes de ejecutar |
| Riesgo de calendario > 2 días | PE → Productor ejecutivo / CL | Inmediato |
| Incidente de datos (PII, envío a tercero) | TD → Legal + CL | Inmediato |
| Defecto crítico en QA | QA → PE (bloquea entrega) | Inmediato |
