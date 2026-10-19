# QA técnico — galeria-bloques_landscape_v005.mp4

Generado: 2026-10-19T15:51:54.565Z · Veredicto: **PASS con advertencias** (0 fail, 4 warn)

| Estado | Chequeo | Detalle |
|---|---|---|
| INFO | Archivo | galeria-bloques_landscape_v005.mp4 · 1920×1080 · 30.00 fps · 78.50 s · 2.4 MB · h264 High/yuv420p · sin audio |
| INFO | Modo | DRAFT (audio y loudness solo avisan: se normaliza en npm run deliver) |
| WARN | Plataforma | YouTube (largo) — INFERIDA por aspecto/códec: pasá --platform (Reels, TikTok y Shorts tienen specs distintas) |
| PASS | Resolución | 1920×1080 (esperado 1920×1080) |
| PASS | fps | 30.00 (rango 24–60) |
| PASS | Códec de video | h264 (esperado h264) |
| PASS | Pixel format | yuv420p (esperado yuv420p) |
| PASS | Color | bt709 / bt709 (esperado BT.709) |
| PASS | Duración | 78.5 s ≤ 900 s (hasta 43200 s solo con cuenta verificada) |
| PASS | Peso | 2.4 MB ≤ 262144 MB |
| PASS | Fast start (moov al inicio) | sí |
| WARN | Audio | sin pista de audio y YouTube (largo) la requiere (pieza muda a propósito: --allow-silent y registrarlo en el brief) |
| WARN | Negros a mitad de pieza | 70.00–70.70 s |
| WARN | Congelados ≥ 4 s | 4.0 s (5.3 s) — ¿hold intencional o escena muerta?; 33.3 s (5.5 s) — ¿hold intencional o escena muerta?; 50.6 s (7.1 s) — ¿hold intencional o escena muerta?; 59.2 s (5.8 s) — ¿hold intencional o escena muerta?; 65.6 s (4.4 s) — ¿hold intencional o escena muerta? |
| PASS | Fotosensibilidad (heurística WCAG 2.3.1) | máx 0 destellos/s — heurística de frame completo; para entregas sensibles correr EA IRIS o PEAT |
| INFO | Contact sheet | /home/user/motion-harness-kit/projects/_galeria-bloques/qa/galeria-bloques_landscape_v005_contact.jpg |

> El QA automático no reemplaza: visionado completo en teléfono real, escucha en parlante de teléfono, verificación de claims y del checklist legal (templates/qa-checklist.md).
