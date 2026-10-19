# QA técnico — ejemplo-servidor-mcp_portrait_v005.mp4

Generado: 2026-10-19T15:54:58.231Z · Veredicto: **PASS con advertencias** (0 fail, 3 warn)

| Estado | Chequeo | Detalle |
|---|---|---|
| INFO | Archivo | ejemplo-servidor-mcp_portrait_v005.mp4 · 1080×1920 · 30.00 fps · 46.00 s · 1.7 MB · h264 High/yuv420p · sin audio |
| INFO | Modo | DRAFT (audio y loudness solo avisan: se normaliza en npm run deliver) |
| WARN | Plataforma | YouTube Shorts — INFERIDA por aspecto/códec: pasá --platform (Reels, TikTok y Shorts tienen specs distintas) |
| PASS | Resolución | 1080×1920 (esperado 1080×1920) |
| PASS | fps | 30.00 (rango 24–60) |
| PASS | Códec de video | h264 (esperado h264) |
| PASS | Pixel format | yuv420p (esperado yuv420p) |
| PASS | Color | bt709 / bt709 (esperado BT.709) |
| PASS | Duración | 46.0 s ≤ 180 s |
| PASS | Fast start (moov al inicio) | sí |
| WARN | Audio | sin pista de audio y YouTube Shorts la requiere (pieza muda a propósito: --allow-silent y registrarlo en el brief) |
| PASS | Negros a mitad de pieza | ninguno |
| WARN | Congelados ≥ 4 s | 5.8 s (4.7 s) — ¿hold intencional o escena muerta?; 12.8 s (5.7 s) — ¿hold intencional o escena muerta?; 31.4 s (4.6 s) — ¿hold intencional o escena muerta? |
| PASS | Fotosensibilidad (heurística WCAG 2.3.1) | máx 0 destellos/s — heurística de frame completo; para entregas sensibles correr EA IRIS o PEAT |
| INFO | Contact sheet | /home/user/motion-harness-kit/projects/2026-10-19_ejemplo-servidor-mcp/qa/ejemplo-servidor-mcp_portrait_v005_contact.jpg |

> El QA automático no reemplaza: visionado completo en teléfono real, escucha en parlante de teléfono, verificación de claims y del checklist legal (templates/qa-checklist.md).
