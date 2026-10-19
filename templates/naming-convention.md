# CONVENCIÓN DE NOMBRES Y VERSIONADO

> Dueño: Technical director. Aplica a archivos, carpetas, tags de git y versiones enviadas al cliente.
> Objetivo: que cualquiera (o el agente) sepa **qué es, en qué fase está, qué versión es y para qué plataforma** sin abrir el archivo.

## 1. Patrón de archivo
```
{CLIENTE}_{PROYECTO}_{PIEZA}_{FASE}_v{NN}[.{n}]_{FORMATO}_{IDIOMA}[_{VARIANTE}]_{AAAAMMDD}.{ext}
```
| Segmento | Regla | Ejemplos |
|---|---|---|
| `CLIENTE` | 3–6 letras, MAYÚSCULAS | `ACME`, `INT` (interno/canal propio) |
| `PROYECTO` | Código corto + año | `LAUNCH26`, `DEVCONF26` |
| `PIEZA` | Tipo + número | `EXPL01` (explainer), `SPOT01`, `SHRT01` (short), `TUT03`, `CHLG07` (changelog) |
| `FASE` | Código de fase (tabla §2) | `ANM`, `RVW`, `MST`, `DLV` |
| `vNN` | Versión **al cliente**, 2 dígitos | `v01`, `v02` |
| `.n` | Iteración **interna** (no sale de la productora) | `v02.3` |
| `FORMATO` | Aspecto-resolución-fps | `16x9-2160p30`, `16x9-1080p30`, `9x16-1080p30`, `1x1-1080p30`, `4x5-1080p30` |
| `IDIOMA` | BCP-47 en mayúsculas (sin idioma: `XX`) | `ES-419`, `ES-AR`, `EN-US`, `XX` |
| `VARIANTE` (opcional) | Qué distingue al archivo | `BURN` (captions quemados), `TXTLS` (textless), `CUT15` (cutdown 15 s), `NOCTA`, `A`/`B` (A/B) |
| `AAAAMMDD` | Fecha de render/export | `20261019` |

**Reglas**
1. Sin espacios, tildes, ñ ni caracteres especiales. Separador `_`; dentro de un segmento `-`.
2. **Prohibido:** `final`, `final2`, `definitivo`, `ok`, `nuevo`, `ultimo`. El estado lo dan la fase y el tag de lock.
3. Versión al cliente siempre sube (`v01` → `v02`), aunque el cambio sea mínimo. Nunca se reutiliza un número.
4. Internas: `v02.1`, `v02.2`… al enviarse al cliente, la última interna se renombra a `v03`.
5. Todo archivo enviado al cliente tiene un **tag de git** equivalente (§5).

### 1.1 Versión interna de render vs versión al cliente
| | Versión **interna** de render | Versión **al cliente** |
|---|---|---|
| Formato | `_v###` (3 dígitos): `mcp-explainer_landscape_v004.mp4` | `vNN` (2 dígitos) en el nombre del §1: `…_RVW_v02_…mp4` |
| Quién la pone | `npm run render` / `npm run deliver` (autoincremental por proyecto y formato) | El productor, al enviar |
| Cuándo sube | En cada render (draft o high) | Solo cuando algo sale de la productora |
| Trazabilidad | `review/CHANGELOG.md` (una entrada por render) | Tag de git `rvw-vNN` / `lock-vNN` / `dlv-vNN` + tabla de equivalencias abajo |

En `review/CHANGELOG.md`, cada entrada se anota bajo la versión **nueva** que la contiene (qué notas de `R<n>.md` resuelve) y, cuando se envía, se agrega la equivalencia: `v007 (interna) = RVW v02 (cliente) · tag rvw-v02 · commit abc1234`.

## 2. Códigos de fase
| Código | Fase | Ejemplo |
|---|---|---|
| `BRF` | Brief | `ACME_LAUNCH26_EXPL01_BRF_v01_XX_XX_20261019.pdf` |
| `RSC` | Investigación / claims | `…_RSC_v01_…_claims.csv` |
| `TRT` | Treatment | `…_TRT_v02_…pdf` |
| `SCR` | Guion | `…_SCR_v02_XX_ES-419_20261022.pdf` |
| `STY` | Styleframes | `…_STY_v01_16x9-1080p_XX_A_20261021.png` (dirección A) |
| `SBD` | Storyboard | `…_SBD_v01_…pdf` / board HTML |
| `ANM` | Animatic | `…_ANM_v01_16x9-1080p30_ES-419_20261024.mp4` |
| `WIP` | Trabajo interno | `…_WIP_v01.3_…mp4` |
| `RVW` | Versión de revisión al cliente | `ACME_LAUNCH26_EXPL01_RVW_v02_16x9-1080p30_ES-419_20261029.mp4` |
| `LCK` | Versión lockeada | `…_LCK_v03_…mp4` |
| `MIX` | Audio | `…_MIX_v01_XX_ES-419_FULL_….wav`, `…_STEM-VO_…`, `…_STEM-MX_…`, `…_STEM-SFX_…`, `…_ME_…` |
| `CAP` | Captions | `…_CAP_v01_XX_ES-419_….srt` / `.vtt` |
| `MST` | Master | `ACME_LAUNCH26_EXPL01_MST_v03_16x9-2160p30_ES-419_20261103.mov` · `…_MST_v03_16x9-2160p30_XX_TXTLS_….mov` |
| `DLV` | Entregable final por plataforma | `ACME_LAUNCH26_SHRT01_DLV_v03_9x16-1080p30_ES-419_BURN_20261104.mp4` |
| `THB` | Miniatura / portada | `…_THB_v01_16x9-720p_ES-419_A_….jpg` |
| `ARC` | Paquete de archivo | `ACME_LAUNCH26_ARC_20261110.zip` |

## 3. Estructura de carpetas del proyecto (la crea `npm run new`)
```
projects/<AAAA-MM-DD>_<slug>/
├── README.md            estado de gates (G0–G15) + comandos
├── 00_brief.md · 01_guion.md (incluye "VO limpia") · 02_storyboard.md · 03_shot-list.csv
├── research/            digest.md · claims.csv · glosario.md · data/ (datos verificados para gráficos)
├── scenes.json          plan de escenas ejecutable (bloque + vars + duración + claims + brandLock)
├── comp/                proyecto HyperFrames maestro (compositions/<id>.html editables; index.html GENERADO)
│   └── assets/          audio/ · images/ · video/ (y captions.srt opcional)
├── formats/             variantes GENERADAS por build:roots (portrait, square, feed) — fuera de git
├── renders/             <slug>_<fmt>_v###.mp4 (versión interna) — fuera de git
├── review/              R1.md · R2.md · CHANGELOG.md · HORAS.csv · direccion-checklist.md · frames-<fmt>/
├── qa/                  <render>_qa.md/.json · qa-checklist.md · legal-checklist.md · defects.md
├── delivery/            *_ARCHIVE.mov · *_DELIVERY.mp4 · captions · metadata.md · DELIVERY_NOTE.md · checksums.sha256
├── licenses/            certificados de música, stock, fuentes, contratos de voz
├── sources/             material original del cliente (capturas, footage) — pesado → LFS / DAM
└── PROVENANCE.md        ledger de procedencia (YAML)
```

**Dónde viven los binarios.** `renders/`, `formats/`, `*.mov` y `delivery/*.mov` están en `.gitignore`. Los masters y entregables firmados se archivan en un DAM o bucket con versionado (o Git LFS si el equipo ya lo usa), con el `checksums.sha256` y el tag de git del lock como referencia cruzada.

## 4. Escenas, claims, feedback
| Objeto | Formato | Regla |
|---|---|---|
| Escena | `s01-hook`, `s02-…`; inserción: `s03b-…` | Nunca renumerar (rompe referencias de feedback, frames y del agente) |
| Archivo de escena | `comp/compositions/s03-antes-ahora.html` | Mismo `id` que en `scenes.json` (minúsculas, `sNN-slug`) |
| Claim | `C-001` | Único por proyecto, no se reutiliza |
| Feedback | `FB-012` | Correlativo por proyecto (no por ronda) |
| Defecto QA | `QA-004` | Correlativo |
| Change order | `CO-02` | Con costo e impacto |

## 5. Git: ramas y tags
| Tipo | Patrón | Ejemplo |
|---|---|---|
| Rama principal | `main` | — |
| Rama de ronda | `r1`, `r2` | Cambios del agente por ronda; merge al aprobar internamente |
| Tag interno | `int-vNN.n` | `int-v01.3` |
| Tag de revisión (enviado al cliente) | `rvw-vNN` | `rvw-v02` |
| Tag de lock | `lock-vNN` | `lock-v03` |
| Tag de entrega | `dlv-vNN` | `dlv-v03` |
| Commits del agente | `feat(S08): FB-012 barras 0.6s power3.out` | Convencional + escena + FB-ID |

> En HyperFrames, además: `npx hyperframes history begin --who claude --label "R1 FB-012"` / `history end` para trazabilidad fina dentro de la sesión.

## 6. Idiomas y captions
- Tags BCP-47: `es-419` (LatAm neutro), `es-AR`, `es-ES`, `en-US`, `pt-BR`.
- Captions: `{BASE}_CAP_v03_XX_ES-419_20261104.srt` · mismo `vNN` que el video al que corresponden.
- Si el video cambia de versión, los captions **también** suben de versión (aunque el texto no cambie) para evitar desincronización.

## 7. Metadatos dentro del archivo (opcional, recomendado)
```bash
ffmpeg -i in.mp4 -c copy -metadata title="ACME LAUNCH26 EXPL01 v03" \
  -metadata comment="tag lock-v03 commit abc1234" out.mp4
```
> HyperFrames escribe metadata de contenedor del renderer (sin marca visible); puede conservarse o eliminarse según política del cliente.
