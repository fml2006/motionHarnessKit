# BRIEF — [CLIENTE] · [PROYECTO] · [PIEZA]

> Gate **G0**. Sin brief firmado no arranca la producción. Dueño: Productor. Sign-off: Cliente (aprobador final con nombre).
> Archivo en el repo del proyecto: `00_brief.md` (lo copia `npm run new`). Versión: `BRF_v01` · Fecha: AAAA-MM-DD

---

## 0. Metadatos
| Campo | Valor |
|---|---|
| Código de proyecto | `ACME_LAUNCH26` |
| Pieza(s) | `EXPL01` (explainer 90 s) · `SHRT01–03` (cutdowns) |
| Productor | Nombre · email |
| Director creativo | Nombre |
| Aprobador final (cliente) | **Nombre · cargo · email** (una sola persona) |
| Consultados (cliente) | Nombre / rol — qué revisan (p. ej. Legal: claims; Producto: UI) |
| SLA de feedback del cliente | 24 / 48 h hábiles por gate |
| Fecha de brief | AAAA-MM-DD |

## 1. Contexto
- ¿Qué pasa en el negocio o en el producto que motiva la pieza? (lanzamiento, feature, cambio de pricing, evento)
- ¿Qué se hizo antes y cómo funcionó? Links y métricas.
- Fecha de corte de la información técnica ("as-of"): **AAAA-MM-DD** · versión del producto: **vX.Y**

## 2. Objetivo
- **Objetivo de negocio:** (p. ej. +15 % de solicitudes de demo del segmento DevOps en el Q4)
- **Objetivo de comunicación:** qué tiene que **saber / creer / hacer** la audiencia después de ver la pieza.
  - Saber: …
  - Creer: …
  - Hacer: … (CTA)

## 3. Audiencia
| Campo | Primaria | Secundaria |
|---|---|---|
| Quiénes son | (rol, industria, seniority) | |
| Nivel técnico (1 = general · 5 = experto) | 4 | 2 |
| Qué ya saben / creen | | |
| Objeción principal | | |
| Dónde y cómo lo ven | (YouTube desktop con sonido / LinkedIn mobile sin sonido / evento en pantalla grande) | |
| Idioma y variante | es-419 / es-AR / es-ES / en-US | |

## 4. Mensaje único
> **Una sola oración** que la audiencia tiene que poder repetir.
> p. ej. "Con Acme Deploy, un deploy a producción pasa de minutos a segundos sin cambiar tu pipeline."

**Pruebas de soporte** (máx. 3, cada una con ID de claim → `research/claims.csv`):
1. C-001 — …
2. C-002 — …
3. C-003 — …

**Lo que NO decimos** (para evitar promesas, temas sensibles o comparaciones no aprobadas): …

## 5. CTA
- Acción primaria: (visitar URL / probar gratis / suscribirse / registrarse al webinar)
- URL / handle exacto: `acme.dev/deploy` (verificar que exista y que la UTM esté definida)
- CTA por plataforma (si difiere): YouTube: … · LinkedIn: … · TikTok: …

## 6. KPIs
| KPI | Tipo | Línea base | Meta | Ventana | Fuente |
|---|---|---|---|---|---|
| CTR de impresiones (YouTube) | Primario / secundario | 4,2 % | 6 % | 28 días | YouTube Studio |
| Retención a 30 s ("Intro") | | 55 % | 65 % | 28 días | Key moments |
| AVP | | | | | |
| Completion rate (Shorts / Reels / TikTok) | | | | | |
| Conversiones (demos / signups) | | | | | CRM / GA4 con UTM |

## 7. Matriz de entregables
| ID pieza | Formato | Resolución / fps | Duración | Plataforma | Idioma(s) | Captions (closed / quemados) | Miniatura / portada | Fecha |
|---|---|---|---|---|---|---|---|---|
| EXPL01 | 16:9 | 3840×2160 / 30 | 90 s | YouTube | es-419, en-US | Closed SRT | Sí (3 variantes A/B) | |
| EXPL01 | 1:1 | 1080×1080 / 30 | 90 s | LinkedIn | es-419 | SRT + quemados | Portada | |
| SHRT01 | 9:16 | 1080×1920 / 30 | 30 s | Shorts / Reels / TikTok | es-419 | Quemados | Portada 9:16 (centro 3:4) | |
| EXPL01 | Master | ProRes 422 HQ + textless + stems + M&E | 90 s | Archivo | — | — | — | |

## 8. Tono y referencias
- Tono (3 adjetivos + 1 "no"): p. ej. *claro, seguro, con humor seco — no hype*.
- Referencias **sí** (link + qué tomar: ritmo / paleta / transiciones / tipografía): …
- Referencias **no** (link + por qué): …

## 9. Mandatorios de marca
- Design spec: `brands/<marca>/brand.config.json` (versión `meta.version`) → `brands/<marca>/dist/MOTION.md` + `brands/<marca>/LOOK.md` / `brands/<marca>/dist/frame.md` + guía de marca del cliente (link + versión)
- Logo: versión, área de respeto, tamaño mínimo, fondos permitidos
- Paleta y tipografías (con licencia para render a video)
- End card / sting / música de marca (si existe)
- Reglas de marcas registradas (®, ™), nombres de producto exactos y mayúsculas
- Disclaimers / legales obligatorios (texto literal y duración mínima en pantalla)

## 10. Restricciones legales y de compliance
- [ ] ¿Claims comparativos contra competidores? → requieren revisión legal + sustento
- [ ] ¿Benchmarks? → condiciones obligatorias en super o descripción
- [ ] ¿Roadmap o features no anunciados? → embargo hasta AAAA-MM-DD
- [ ] ¿Logos / nombres de clientes del cliente? → autorización escrita
- [ ] ¿Datos personales en capturas de pantalla? → **prohibido**; usar cuenta demo con datos ficticios
- [ ] ¿Industria regulada (finanzas, salud)? → revisión adicional
- [ ] Música: librería y tier de licencia aprobados: ______
- [ ] Voz: locutor (contrato de uso: medios / territorio / plazo) / TTS (licencia comercial) / voz clonada (**consentimiento escrito por proyecto**)

## 11. Uso de IA (declaración acordada con el cliente)
| Tema | Acuerdo |
|---|---|
| Qué hará el agente de IA | Construcción de motion graphics como código (HyperFrames / Remotion), borradores de guion, transcripción, versionado |
| Qué NO hará | Aprobar claims, generar datos, generar personas o voces realistas sin consentimiento, publicar |
| Herramientas / proveedores | Claude Code (cuenta enterprise), TTS: ____, música: ____ |
| Datos del cliente que se cargan al agente | (docs públicos / docs bajo NDA / ninguno) — ver §11b |
| Contenido sintético | Voz sintética (TTS): Sí / No → **la marca siempre lo divulga** (`brand.config legal.aiDisclosure`). Personas, lugares o productos realistas generados: Sí / No → disclosure en plataforma (YouTube "altered or synthetic", Meta, TikTok) y EU AI Act art. 50 si aplica |
| Titularidad | Cesión de derechos sobre la obra final; registro de autoría humana (guion, diseño, storyboard, selección) |

## 11b. Confidencialidad y procesamiento por IA y proveedores
> Se completa y firma ANTES de cargar material del cliente al agente. **No es asesoramiento legal:** validar con Legal el plan contratado y los términos vigentes.

| Tema | Decisión |
|---|---|
| Clasificación del material de la pieza | Pública / interna / confidencial / bajo NDA / datos personales (prohibido en pantalla) |
| Procesamiento por LLM | Todo lo que se abre en Claude Code (brief, docs, guion, capturas, código) **viaja a Anthropic** para ser procesado. Requiere plan comercial (Team Premium / Enterprise o API con Commercial Terms), DPA firmado y, si aplica, Zero Data Retention. ☐ Plan: ______ ☐ DPA: ______ ☐ ZDR: Sí / No |
| Consentimiento del cliente | ☐ El cliente autoriza por escrito procesar su material con IA (fecha, quién, alcance) |
| Proveedores que recibirían texto o assets del cliente | TTS / voz: ______ · Música IA: ______ · Imagen/video IA: ______ · Transcripción: local (`hyperframes transcribe`) / externa: ______ · Render en nube: **No** (local por defecto) |
| Búsqueda web del investigador | ☐ Permitida con términos públicos · ☐ **Sin búsqueda web con términos del cliente** (nombres de producto no anunciado, clientes, cifras internas): solo fuentes que entrega el cliente |
| Embargos | Nada no anunciado sale a servicios externos (TTS, música, publicación, feedback) antes del AAAA-MM-DD |
| Retención | Dónde quedan las copias (repo, renders, DAM) y por cuánto tiempo; borrado al cierre según NDA |

## 12. Contenido técnico
- SME asignado (nombre, disponibilidad, SLA): …
- Entorno demo / cuenta de prueba: …
- Material fuente: docs, PRs, changelog, specs (links)
- Glosario y pronunciación: `research/glosario.md`

## 13. Assets disponibles
| Asset | Formato | Dónde | Licencia / dueño | Estado |
|---|---|---|---|---|
| Logo | SVG | | Cliente | ☐ |
| UI del producto | Figma / capturas | | Cliente | ☐ |
| Datos para gráficos | CSV / JSON | | Cliente (verificado) | ☐ |
| Footage / entrevistas | MP4 / MOV | | | ☐ |

## 14. Presupuesto y alcance
| Concepto | Incluido | Monto |
|---|---|---|
| Preproducción (investigación, treatment, guion 2 rondas, styleframes 2–3 direcciones + 1 ajuste, storyboard, animatic 1 ronda) | ✔ | |
| Producción (build + **2 rondas de revisión** + R3 solo bugs) | ✔ | |
| Post (mezcla, captions N idiomas, master, X versiones) | ✔ | |
| Talento (locutor), música, stock | | |
| **Ronda extra** | — | $ / ronda |
| **Change order** (cambio que contradice un gate firmado) | — | Cotización + impacto en calendario |
| Contingencia | 10–15 % | |

## 15. Calendario e hitos
| Gate | Entregable | Envío productora | **Feedback cliente (fecha límite)** |
|---|---|---|---|
| G2 | Treatment | | |
| G3 | Guion | | |
| G4 | Styleframes | | |
| G6 | Animatic | | |
| R1 | v01 | | |
| R2 | v02 | | |
| G9 | Lock | | |
| G15 | Entrega | | |

> Cláusula sugerida: "Si no hay comentarios consolidados dentro del SLA, el entregable se considera aprobado y el calendario avanza."

## 16. Riesgos y preguntas abiertas
| # | Pregunta / riesgo | Dueño | Fecha |
|---|---|---|---|
| 1 | | | |

## 17. Criterio de salida de G0 (checklist)
- [ ] Mensaje único en una oración
- [ ] KPI primario con línea base y meta
- [ ] Matriz de entregables cerrada
- [ ] Aprobador final con nombre + SLA
- [ ] Mandatorios y restricciones legales listados
- [ ] Declaración de uso de IA aceptada
- [ ] Confidencialidad y procesamiento (§11b) completos y autorizados por el cliente
- [ ] Presupuesto, rondas y calendario firmados

## 18. Firmas
| Rol | Nombre | Fecha | Firma / OK por escrito |
|---|---|---|---|
| Productor | | | |
| Aprobador cliente | | | |
