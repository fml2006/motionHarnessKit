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

## 3. Estructura de carpetas del proyecto (repo + almacenamiento)
```
ACME_LAUNCH26/
├── BRIEF.md
├── research/            digest.md · claims.csv · glosario.md · referencias/
├── GUION.md             (dos columnas) 
├── SCRIPT.md            (narración bloqueada → TTS / locutor)
├── frame.md             (design spec: tokens de marca y movimiento)
├── STORYBOARD.md        (spec ejecutable por escena)
├── boards/              storyboard.html · stills/S01.png …
├── compositions/        index.html · frames/S01-hook.html · S01-hook.motion.json …
├── data/                *.json / *.csv (datos verificados para gráficos)
├── assets/              logos/ · fonts/ · icons/ · images/
├── capture/             screen recordings (originales, NO en git si son pesados → LFS / storage)
├── footage/             entrevistas / b-roll
├── audio/               vo/ · mx/ · sfx/ · mix/
├── reviews/             plan.md · R1.md · R2.md · qa-defects.md · lock.md
├── renders/             (ignorado en git) WIP / RVW
├── delivery/            DLV + CAP + THB + metadata.md + DELIVERY_NOTE.md + checksums.sha256
└── archive/             licenses/ · masters/ · stems/ · decision-log.md
```

## 4. Escenas, claims, feedback
| Objeto | Formato | Regla |
|---|---|---|
| Escena | `S01`, `S02`… inserción: `S03b` | Nunca renumerar (rompe referencias de feedback y del agente) |
| Archivo de escena | `S03-antes-ahora.html` | ID + slug |
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
