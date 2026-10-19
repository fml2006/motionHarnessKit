# CHECKLIST DE QA FINAL — [CLIENTE] · [PIEZA] · [VERSIÓN]

> Gate **G14**. Dueño y aprobador: QA / compliance (con **veto de entrega**).
> Regla: el QA lo hacen **dos personas que no construyeron la pieza**. Lo automatizable lo corre el agente/TD; **el visionado completo y la escucha son humanos**.
> Marcar: ✅ OK · ❌ falla (abrir defecto) · N/A. Columna "Auto" = se puede automatizar (comando sugerido).

| Campo | Valor |
|---|---|
| Archivo(s) revisado(s) | |
| Tag / commit | |
| QA 1 / QA 2 | |
| Fecha | |

---

## A. Técnico (archivo)
| # | Chequeo | Criterio | Auto | Estado |
|---|---|---|---|---|
| A1 | Resolución / aspecto | Según matriz de entregables | `ffprobe -show_entries stream=width,height` | |
| A2 | Frame rate | Constante, igual al de la pieza (sin mezcla 25/30) | `ffprobe … r_frame_rate` | |
| A3 | Codec / perfil / pix_fmt | H.264 High yuv420p (entregables) · ProRes 422 HQ yuv422p10 (master) | `ffprobe … codec_name,profile,pix_fmt` | |
| A4 | Color tags | BT.709 primaries/trc/matrix | `ffprobe … color_primaries,color_transfer,color_space` | |
| A5 | Contenedor | MP4 con moov al inicio (faststart), sin edit lists | `ffprobe -v trace` / `qt-faststart` check | |
| A6 | Duración | Exacta vs acta de lock (±1 frame) | `ffprobe … duration` | |
| A7 | Audio | AAC-LC 48 kHz estéreo 384 kbps (entregable) · PCM 48k/24 (master) | `ffprobe … sample_rate,channels,bit_rate` | |
| A8 | Loudness integrado | YouTube/web: −14 LUFS ±1 · broadcast según spec | `ffmpeg -af ebur128=peak=true` · `npx hyperframes audio` | |
| A9 | True peak | ≤ −1 dBTP (web) / ≤ −2 dBTP (Netflix/ATSC) | ídem | |
| A10 | Frames negros / congelados no intencionales | Ninguno (revisar alertas manualmente) | `blackdetect`, `freezedetect` | |
| A11 | Primer y último frame | Primer frame = imagen con sentido (no negro); sin flash al final | Snapshot @0 y @end | |
| A12 | Peso de archivo | ≤ límite de plataforma | `ls -lh` | |
| A13 | Render reproducible | Re-render desde el tag produce mismo resultado (sin red, sin random, fuentes locales) | Re-render + hash / comparación de frames | |
| A14 | Sync A/V | Sin deriva al final de la pieza | Visionado + chequeo de 3 puntos | |

## B. Contenido y exactitud
| # | Chequeo | Criterio | Auto | Estado |
|---|---|---|---|---|
| B1 | Ortografía y gramática (pantalla) | 0 errores; variante de idioma consistente | Extraer textos de `on_screen_text` + corrector | |
| B2 | **Números en pantalla y VO = registro de claims** | Cada cifra tiene ID aprobado; valores idénticos | Script: comparar números del storyboard/HTML vs `claims.csv` | |
| B3 | Condiciones de benchmarks / fecha "as-of" | Presentes (super o descripción) | | |
| B4 | Nombres de producto, versiones, mayúsculas de APIs | Según glosario | | |
| B5 | UI mostrada = UI real de la versión de corte | Validado por Producto | | |
| B6 | URLs / handles / CTA | Existen, llevan a destino correcto, UTM correcta | `curl -I` a cada URL | |
| B7 | Ningún texto inventado por el agente | Todo texto en pantalla existe en `on_screen_text` / guion firmado | Diff textos render vs storyboard | |
| B8 | Ningún placeholder | Sin "Lorem", "TODO", "XXX", datos de ejemplo | grep en el proyecto | |

## C. Marca
| # | Chequeo | Criterio | Estado |
|---|---|---|---|
| C1 | Logo: versión, tamaño, área de respeto, fondo | Según `frame.md` / guía | |
| C2 | Paleta y tipografías | Solo tokens; **sin fuentes fallback** (verificar en snapshots) | |
| C3 | Marcas registradas (®/™) y nombres de terceros | Según guía y legal | |
| C4 | End card / legales | Texto literal, tiempo mínimo en pantalla cumplido | |
| C5 | Consistencia de movimiento | Easing/duraciones del design spec en toda la pieza | |

## D. Legal y derechos
| # | Chequeo | Criterio | Estado |
|---|---|---|---|
| D1 | Música | Licencia del tier correcto (cubre cliente/publicidad), certificado en `archive/licenses/`, cue sheet | |
| D2 | Música IA | No usada en entrega a cliente, o con OK legal escrito | |
| D3 | VO | Contrato locutor (medios/territorio/plazo) o licencia comercial TTS; **voz clonada solo con consentimiento escrito por proyecto** | |
| D4 | Imagen de personas | Releases firmados (entrevistados, footage) | |
| D5 | Logos / marcas de terceros / capturas de productos ajenos | OK legal | |
| D6 | **PII en screen recordings** | Ninguna (emails, nombres, tokens, IDs de clientes reales) — revisar frame a frame en capturas | |
| D7 | Claims comparativos / pricing | Aprobados por legal | |
| D8 | Fuentes tipográficas | Licencia que cubre render a video / embedding | |
| D9 | Stock / b-roll | Licencias archivadas | |

## E. Accesibilidad
| # | Chequeo | Criterio | Auto | Estado |
|---|---|---|---|---|
| E1 | Contraste de texto | WCAG AA (≥4,5:1 texto normal; ≥3:1 grande) | `npx hyperframes check` (audita contraste WCAG AA) | |
| E2 | **Flashes** | WCAG 2.3.1: ≤3 flashes por segundo; cuidado con glitch/strobe | Revisión visual + herramienta de análisis de flashes si es broadcast | |
| E3 | Captions closed | Presentes por idioma; 100 % revisados vs audio final | | |
| E4 | Formato captions | ≤42 caracteres/línea, ≤2 líneas, cues 1–7 s, sin cortar sintagmas | Script de validación SRT/VTT | |
| E5 | Captions quemados (vertical) | Dentro de safe zone; legibles en teléfono | Snapshot con overlay de safe zone | |
| E6 | Comprensible sin sonido (social) | Texto en pantalla transmite el mensaje | Visionado mudo | |
| E7 | Info no solo por color | Diferencias también por forma/etiqueta | | |

## F. Plataforma y formatos
| # | Chequeo | Criterio | Estado |
|---|---|---|---|
| F1 | Safe zones 9:16 | Lo crítico dentro de x 65–900, y 270–1248 (1080×1920); verificado con overlay de UI real de la app | |
| F2 | Composición nativa por formato | No es un recorte del 16:9; densidad reducida en vertical | |
| F3 | Miniaturas | 1280×720, ≤2 MB, legible a 160 px de ancho; variantes A/B | |
| F4 | Portadas verticales | Info crítica en el centro 3:4 (grilla de perfil) | |
| F5 | Duración vs límites | Shorts ≤3 min; X free ≤2:20; etc. | |
| F6 | Primer segundo | Funciona como "miniatura" en autoplay mudo | |

## G. Específico de pipeline con IA
| # | Chequeo | Criterio | Auto | Estado |
|---|---|---|---|---|
| G1 | `lint` y `check` | 0 errores; warnings revisados | `npx hyperframes lint` · `npx hyperframes check --strict` | |
| G2 | Layout | Sin overflow, clipping, solapamientos no intencionales | `check` (layout audit) | |
| G3 | Escenas con `lock: true` | Sin cambios desde su aprobación | `git diff lock-vNN -- compositions/frames/<locked>` | |
| G4 | Determinismo | Sin `Date.now()`, random sin semilla, fetch en render | lint + revisión de código | |
| G5 | Datos de gráficos | Ligados a archivo verificado; ningún valor hardcodeado "de ejemplo" | grep de números en HTML vs `data/` | |
| G6 | Contenido sintético realista | ¿Hay voces clonadas, personas/lugares/eventos realistas generados? → decisión de disclosure documentada (YouTube "altered or synthetic"; EU AI Act art. 50 si aplica) | | |
| G7 | Herramientas externas | No se enviaron frames/proyecto del cliente a servicios no aprobados (p. ej. `snapshot --describe`, `feedback --file-issue`) | Revisión de logs | |
| G8 | Versiones fijadas | Skills/dependencias con versión registrada en el archivo | `package.json` / lockfile / `skills` | |

## H. Visionado humano (no delegable)
| # | Chequeo | Quién | Estado |
|---|---|---|---|
| H1 | Visionado completo 1× en monitor de referencia, con audio | QA 1 | |
| H2 | Visionado completo en laptop | QA 2 | |
| H3 | Visionado completo en teléfono (vertical y horizontal), con y sin audio | QA 1 + QA 2 | |
| H4 | Escucha en auriculares + parlante de teléfono (VO inteligible en términos técnicos) | Sound designer | |
| H5 | Ritmo / pacing / transiciones (sin "saltos" entre escenas construidas por distintos workers) | Motion director | |

---

## Resultado
| Defectos | Críticos | Mayores | Menores |
|---|---|---|---|
| Cantidad | | | |

- [ ] **APROBADO PARA ENTREGA** — Firma QA: ____________ Fecha: ______
- [ ] RECHAZADO — defectos abiertos en `reviews/qa-defects.md`

> Severidad: **Crítico** = error de dato/claim, legal, marca, PII, spec que impide publicar → bloquea. **Mayor** = visible para el espectador (typo, sync, safe zone) → bloquea. **Menor** = detalle → se corrige si no afecta calendario o se documenta.
