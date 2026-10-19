# QA técnico — ejemplo-servidor-mcp_landscape_v003.mp4

Generado: 2026-10-19T05:51:40.752Z · Veredicto: **PASS con advertencias** (0 fail, 2 warn)

| Estado | Chequeo | Detalle |
|---|---|---|
| INFO | Archivo | ejemplo-servidor-mcp_landscape_v003.mp4 · 1920×1080 · 30.00 fps · 46.00 s · 1.5 MB · h264/yuv420p · sin audio |
| INFO | Plataforma | YouTube (largo) — inferida por aspecto; usá --platform para otra |
| PASS | Resolución | 1920×1080 (esperado 1920×1080) |
| PASS | fps | 30.00 (rango 24–60) |
| PASS | Codec de video | h264 (esperado h264) |
| PASS | Pixel format | yuv420p |
| PASS | Duración | 46.0 s ≤ 43200 s |
| PASS | Peso | 1.5 MB ≤ 262144 MB |
| PASS | Fast start (moov al inicio) | sí |
| WARN | Audio | El render no tiene pista de audio (OK para overlays o piezas mudas; no para entregables con sonido). |
| PASS | Negros a mitad de pieza | ninguno |
| WARN | Congelados ≥ 4 s | 5.5 s (5.0 s) — ¿hold intencional o escena muerta?; 12.9 s (5.6 s) — ¿hold intencional o escena muerta?; 31.3 s (4.7 s) — ¿hold intencional o escena muerta? |
| PASS | Fotosensibilidad (heurística WCAG 2.3.1) | máx 0 destellos/s — heurística de frame completo; para entregas sensibles correr EA IRIS o PEAT |
| INFO | Contact sheet | /home/user/motion-harness-kit/projects/2026-10-19_ejemplo-servidor-mcp/qa/ejemplo-servidor-mcp_landscape_v003_contact.jpg |

> El QA automático no reemplaza: visionado completo en teléfono real, escucha en parlante de teléfono, verificación de claims y del checklist legal (templates/qa-checklist.md).
