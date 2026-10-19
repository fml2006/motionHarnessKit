---
name: entregar
description: Gates G9-G15. Picture lock → mezcla/loudness → captions → render final por formato → masters (ProRes 422 HQ) y entregables H.264 → QA técnico y legal → paquete de entrega y archivo reproducible. Usar cuando la versión está aprobada y piden "final", "exportá para YouTube/Reels/LinkedIn", "entrega".
---

# /entregar — cerrar sin sorpresas

Prerrequisito: aprobación explícita de la versión (G9 picture lock) con nombre y fecha en `review/CHANGELOG.md`. Sin eso, no se renderiza en calidad final.

## 1. Sonido (G10)
Subagente `editor-sonido`: VO y música finales con licencias registradas en `PROVENANCE.md`; ducking; render y `npm run loudnorm -- <video>` → −14 LUFS / −1 dBTP (verificá con `npm run qa`).

## 2. Captions (G11)
`npx hyperframes transcribe` sobre la VO final → revisión humana contra `research/glosario.md` → SRT/VTT en `delivery/`. Vertical: quemados dentro de la safe zone.

## 3. Render final + masters (G12-G13)
```bash
npm run render -- <p> --quality high                  # todos los formatos de scenes.json
npm run master -- projects/<p>/renders/<archivo> projects/<p>/delivery youtube   # o vertical
npm run render -- <p> --alpha --formats landscape      # overlays con transparencia (ProRes 4444), si aplica
```

## 4. QA (G14)
- `npm run qa -- projects/<p>/delivery/<archivo>_DELIVERY.mp4 --platform <youtube|shorts|reels|tiktok|linkedin|x>` por cada entregable: 0 FAIL.
- Subagente `qa-director`: veredicto APROBADO.
- Humanos: visionado completo en teléfono real, escucha en parlante de teléfono, `qa/qa-checklist.md` y `qa/legal-checklist.md` firmados. Disclosure de IA aplicado si corresponde (toggle de la plataforma + nota).

## 5. Entrega y archivo (G15)
`delivery/`: master, entregables por plataforma, captions, miniatura, reporte de QA, specs. Archivo reproducible: el proyecto completo (scenes.json, compositions, brand/dist sincronizado, package-lock.json, PROVENANCE.md) con tag de versión. Completá `delivery/delivery-checklist.md`. **No publiques vos:** publicar es una acción humana.
