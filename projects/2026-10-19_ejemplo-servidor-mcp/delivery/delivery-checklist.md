# CHECKLIST DE ENTREGA Y ARCHIVO — [CLIENTE] · [PROYECTO]

> **Estado en este ejemplo (2026-10-19):** no hubo entrega. Ningún ítem marcado.

> Gate **G15**. Dueño: Productor (A) · Ejecuta: Technical director + Editor + Sound designer · Requiere: QA aprobado (G14).
> **Publicar o enviar es una acción humana.** El agente prepara el paquete; una persona lo envía / sube.

## 1. Pre-requisitos
- [ ] Reporte de QA firmado (G14), sin defectos críticos ni mayores abiertos
- [ ] Acta de picture lock (G9) con tag/commit
- [ ] Nombres de archivo según `naming-convention.md`

## 2. Contenido del paquete de entrega (cliente)
| Ítem | Archivo(s) | ✔ |
|---|---|---|
| Entregables por plataforma (según matriz del brief) | `DLV_v__` por formato/idioma | ☐ |
| Captions closed por idioma | `.srt` (plataformas) · `.vtt` (web) — tags BCP-47 (`es-419`, `en-US`) | ☐ |
| Versión con captions quemados (vertical) | `…_9x16-1080p30_ES-419_BURN_…mp4` | ☐ |
| Miniaturas / portadas | YouTube 1280×720 ≤2 MB (2–3 variantes A/B) · portadas 9:16 | ☐ |
| Transcript | `.txt` / `.docx` | ☐ |
| Metadata por plataforma | `metadata.md` (ver §4) | ☐ |
| Licencias | Certificados de música, stock, fuentes; contrato/consentimiento de VO | ☐ |
| Delivery note | `DELIVERY_NOTE.md` (ver §5) | ☐ |
| Checksums | `checksums.sha256` | ☐ |
| (Si contratado) Master de archivo | ProRes 422 HQ / DNxHR HQX + PCM 48k/24 | ☐ |
| (Si contratado) Textless | Master sin textos ni captions | ☐ |
| (Si contratado) Stems + M&E | VO, MX, SFX, M&E — WAV 48k/24 | ☐ |
| (Si contratado) Proyecto fuente | Repo (tag) + assets + fuentes con licencia transferible + README de render | ☐ |

```bash
# Checksums
sha256sum delivery/* > delivery/checksums.sha256
# Verificación en destino
sha256sum -c checksums.sha256
```

## 3. Ajustes por plataforma al subir (los hace una persona)
| Plataforma | Checklist |
|---|---|
| **YouTube** | Título · descripción (con condiciones de benchmarks / fuentes) · **capítulos** (00:00 primero) · tags · miniatura + Test & Compare · captions SRT por idioma · idioma del video · **declaración de contenido alterado/sintético** (solo si hay contenido realista) · end screens · cards · playlist · visibilidad/programación |
| **YouTube Shorts** | ≤3 min, 9:16 · título · vínculo a video largo relacionado |
| **Instagram Reels** | Portada (centro 3:4) · caption · captions/subtítulos · etiqueta de IA si aplica · colaboradores |
| **TikTok** | Portada · caption · etiqueta "AI-generated" si aplica · sonido (no reemplazar por música no licenciada de la app en piezas de marca) |
| **LinkedIn** | SRT subido · thumbnail · copy con dato principal en las 2 primeras líneas |
| **X** | ≤2:20 (free) · H.264 · thumbnail · alt text |
| **Web / corporativo** | VTT + `<track>` · poster frame · hosting (Vimeo/Wistia/propio) · autoplay mudo con captions |

## 4. Metadata (`metadata.md`) — por pieza y por idioma
```
Pieza: EXPL01 · Idioma: es-419
Título (≤70 car. visibles): 
Descripción (primeras 2 líneas = gancho + CTA):
Condiciones / fuentes de claims: "Benchmark interno Acme, 2026-10-05: repo 120k LOC, cache caliente, runner 8 vCPU."
Capítulos:
00:00 …
00:17 …
Tags:
CTA / URL con UTM:
Disclosure IA (si aplica):
```

## 5. Delivery note (`DELIVERY_NOTE.md`)
```
Proyecto: ACME_LAUNCH26 · Fecha: AAAA-MM-DD · Versión aprobada: v03 (tag lock-v03, commit abc1234)
Archivos entregados: (lista con tamaño y checksum)
Specs: (resolución, fps, codec, loudness medido: −14,1 LUFS / −1,3 dBTP)
Licencias incluidas: (música: track/ID/tier; VO: contrato; stock: IDs)
Restricciones de uso: (territorio, plazo, medios — según licencias de música/VO)
Uso de IA: (resumen de lo declarado en el brief; disclosure aplicado o no y por qué)
Contacto para soporte post-entrega:
```

## 6. Acuse de recibo
- [ ] Cliente confirma recepción y apertura correcta de archivos (fecha, nombre)
- [ ] Cliente confirma publicación (link) — para iniciar medición de KPIs

## 7. Archivo interno (`archive/`)
| Ítem | ✔ |
|---|---|
| Repo del proyecto con tag `lock-vNN` y `dlv-vNN` (código de composiciones, `STORYBOARD.md`, `SCRIPT.md`, `frame.md`, `BRIEF.md`, reviews) | ☐ |
| Lockfile y versiones de skills/framework/render (reproducibilidad) | ☐ |
| Assets originales (capturas, footage, logos, datos) + manifest de procedencia | ☐ |
| Fuentes tipográficas + licencias | ☐ |
| VO (raw + editada) + timestamps por palabra | ☐ |
| Música/SFX + certificados de licencia + cue sheet | ☐ |
| Masters, textless, stems, M&E | ☐ |
| Captions y transcript | ☐ |
| Registro de claims firmado + glosario | ☐ |
| **Log de decisiones humanas** (aprobaciones por gate, actas, change orders) — sustenta autoría humana | ☐ |
| Reporte de QA | ☐ |
| Política de retención aplicada (p. ej. 3 años; datos del cliente según NDA) | ☐ |

## 8. Post-entrega (medición)
- [ ] Fecha de lectura de KPIs (7 / 28 días): ______
- [ ] Retro interna (horas reales vs estimadas, rondas, defectos, aprendizaje para plantillas) programada
- [ ] Recipe congelada si el formato se repetirá (HyperFrames: `media-use` → `scripts/recipe.mjs freeze --name <nombre>`)
