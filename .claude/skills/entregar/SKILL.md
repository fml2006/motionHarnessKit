---
name: entregar
description: Gates G9-G15. Picture lock → mezcla final → npm run deliver (render final, loudness, ARCHIVE ProRes 422 HQ y DELIVERY H.264 por plataforma, QA) → captions → QA final y legal → paquete de entrega y archivo reproducible. Usar cuando la versión está aprobada y piden "final", "exportá para YouTube/Reels/LinkedIn", "entrega".
---

# /entregar — cerrar sin sorpresas

Prerrequisito: aprobación explícita de la versión (G9 picture lock) con nombre y fecha en `review/CHANGELOG.md`. Sin eso, no se renderiza en calidad final.

El orden no se altera: **lock → mezcla final → deliver → captions → QA final y legal → entrega.** La normalización de loudness ocurre una sola vez, dentro de `deliver`, sobre la mezcla PCM; nunca se normaliza un MP4 y después se vuelve a renderizar.

## 1. Mezcla final (G10)
Subagente `editor-sonido`: VO y música finales en `comp/assets/audio/`, referenciadas en `scenes.json → audio`, con licencias registradas en `PROVENANCE.md`. Ducking y balance se resuelven en los volúmenes del plan (o en una sesión de audio que entrega un WAV ya mezclado). Si la mezcla tiene picos, limitador en la sesión de audio: `deliver` avisa y puede fallar si tiene que comprimir.

## 2. Render final + loudness + masters (G12-G13): un solo comando
```bash
npm run deliver -- <p> --platform youtube,reels          # la matriz sale del brief (00_brief.md)
npm run deliver -- <p> --platform linkedin=square,evento # forzar formato / plataforma con otro objetivo (−16 LUFS)
```
Qué hace, en orden (si algo falla, sale con código 1 y no hay entrega):
1. build `--strict` (placeholders o cifras sin claim verificada en `research/claims.csv` → FAIL), lint y `check --strict`.
2. Render del intermedio ProRes 4444 por formato (`renders/<slug>_<fmt>_v###_master.mov`).
3. Mezcla PCM 48 kHz / 24 bit desde la timeline de HyperFrames (`renders/..._mix.wav`), sin pasar por AAC.
4. `master.sh`: loudness al objetivo de cada plataforma (`delivery/specs.json`, o `--lufs`) → `delivery/<slug>_<fmt>_v###_ARCHIVE.mov` (ProRes 422 HQ + PCM 24) y `_DELIVERY.mp4` (H.264 BT.709 faststart + AAC); re-mide LUFS y true peak de las salidas.
5. `qa.mjs --delivery --platform <p>` por cada plataforma y sobre el ARCHIVE.
6. Reporte `delivery/<slug>_v###_ENTREGA.md` + línea en `review/CHANGELOG.md`.

Opciones: `--allow-silent` (pieza muda a propósito, registrado en el brief), `--rebrand` (solo con aprobación: la marca cambió desde el lock), `--docker` (render determinista entre máquinas), `--allow-check-warnings` (queda registrado).
Overlays con transparencia para el editor: `npm run render -- <p> --alpha --formats landscape` (ProRes 4444, QA "overlay").
`npm run loudnorm` es solo para archivos externos (stems, material de terceros), no para el entregable.

## 3. Captions (G11)
`npx hyperframes transcribe` sobre la VO final → revisión humana contra `research/glosario.md` → `captions.srt` en la raíz del proyecto (build:roots los quema en los formatos verticales configurados en la marca) y SRT/VTT en `delivery/` para las plataformas que lo aceptan. Si se queman, volvé a correr `deliver` (la imagen cambió).

## 4. QA final (G14)
- `delivery/<slug>_v###_ENTREGA.md` sin FAIL (los `qa/*_<plataforma>_qa.md` tienen el detalle).
- Subagente `qa-director`: veredicto APROBADO.
- Humanos: visionado completo en teléfono real, escucha en parlante de teléfono, `qa/qa-checklist.md` y `qa/legal-checklist.md` firmados. Disclosure de IA aplicado si corresponde (toggle de la plataforma + nota).

## 5. Entrega y archivo (G15)
`delivery/`: ARCHIVE, DELIVERY por plataforma, captions, miniatura, reporte de entrega, specs medidas. Archivo reproducible: el proyecto completo (scenes.json con brandLock, compositions, brand sincronizado, package-lock.json, PROVENANCE.md) con tag de versión. Completá `delivery/delivery-checklist.md`. **No publiques vos:** publicar es una acción humana.

## Como fase de `/pieza`
Si te llamó el orquestador, este archivo es la receta del checkpoint `lock` y `entrega` (modo express: `entrega-express`). Al terminar corré `npm run pipeline -- check <p> <checkpoint>` y devolvé el resultado. El gate lo registra el orquestador con la respuesta de una persona (`npm run pipeline -- approve|reject <p> <checkpoint> --by "<nombre>"`), que además tilda los gates en el README del proyecto y deja la línea en `review/CHANGELOG.md`. Si usás esta skill suelta, registrá igual la decisión humana con esos comandos, así `/pieza continuar` sabe dónde está la pieza.
