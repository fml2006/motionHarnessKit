# QA técnico — galeria-bloques_portrait_v004.mp4

Generado: 2026-10-19T06:54:09.323Z · Veredicto: **PASS con advertencias** (0 fail, 4 warn)

| Estado | Chequeo | Detalle |
|---|---|---|
| INFO | Archivo | galeria-bloques_portrait_v004.mp4 · 1080×1920 · 30.00 fps · 78.50 s · 2.5 MB · h264 High/yuv420p · sin audio |
| INFO | Modo | DRAFT (audio y loudness solo avisan: se normaliza en npm run deliver) |
| WARN | Plataforma | YouTube Shorts — INFERIDA por aspecto/códec: pasá --platform (Reels, TikTok y Shorts tienen specs distintas) |
| PASS | Resolución | 1080×1920 (esperado 1080×1920) |
| PASS | fps | 30.00 (rango 24–60) |
| PASS | Códec de video | h264 (esperado h264) |
| PASS | Pixel format | yuv420p (esperado yuv420p) |
| PASS | Color | bt709 / bt709 (esperado BT.709) |
| PASS | Duración | 78.5 s ≤ 180 s |
| PASS | Fast start (moov al inicio) | sí |
| WARN | Audio | sin pista de audio y YouTube Shorts la requiere (pieza muda a propósito: --allow-silent y registrarlo en el brief) |
| WARN | Negros a mitad de pieza | 70.00–70.50 s |
| WARN | Congelados ≥ 4 s | 4.1 s (5.2 s) — ¿hold intencional o escena muerta?; 21.6 s (4.2 s) — ¿hold intencional o escena muerta?; 50.6 s (7.1 s) — ¿hold intencional o escena muerta?; 59.5 s (5.5 s) — ¿hold intencional o escena muerta?; 65.6 s (4.4 s) — ¿hold intencional o escena muerta? |
| PASS | Fotosensibilidad (heurística WCAG 2.3.1) | máx 0 destellos/s — heurística de frame completo; para entregas sensibles correr EA IRIS o PEAT |
| INFO | Contact sheet | /home/user/motion-harness-kit/projects/_galeria-bloques/qa/galeria-bloques_portrait_v004_contact.jpg |

> El QA automático no reemplaza: visionado completo en teléfono real, escucha en parlante de teléfono, verificación de claims y del checklist legal (templates/qa-checklist.md).
