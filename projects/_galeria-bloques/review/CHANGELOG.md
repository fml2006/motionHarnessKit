# Changelog de renders

Anotá debajo de cada versión qué cambió y por qué (feedback de qué ronda).

- 2026-10-19 05:45 · v001 · landscape · calidad standard · 13 escenas
- 2026-10-19 05:56 · v002 · landscape, portrait · calidad standard · 13 escenas
- 2026-10-19 06:33 · v003 · landscape · calidad draft · 13 escenas · marca TuMarca v1.1.0 #361204c4d0e15797 · chrome fijado por hyperframes · ffmpeg 6.1.1-3ubuntu5 · QA ok
  - Render draft de verificación de los gates nuevos de render (solo landscape).
- 2026-10-19 06:54 · v004 · landscape, portrait · calidad standard · 13 escenas · marca TuMarca v1.1.0 #361204c4d0e15797 · chrome fijado por hyperframes · ffmpeg 6.1.1-3ubuntu5 · QA ok
  - Galería de referencia para la página del kit: vars explícitas con las cifras de demo rotuladas "ficticio · demo", defaults de bloques sin datos creíbles, marca v1.1. Aviso de QA aceptado: 0,7 s casi vacíos a los 70 s son la entrada del cartel de capítulo tras el corte.
- 2026-10-19 15:15 · REBRAND · TuMarca v1.1.0 #361204c4d0e15797 → tumarca · TuMarca v1.2.0 #7676135603c43ec2 (build:roots --rebrand)
  - Estudio multimarca: la pieza declara `"brand": "tumarca"` (brands/tumarca/) y se re-copiaron sus escenas desde los bloques nuevos, que leen el look de la marca (fondo, alineación, acento, reveal, kicker, tarjetas, densidad) y usan el `logo-sting` firma de TuMarca si lo tiene. Sin cambios de contenido.
- 2026-10-19 15:52 · v005 · landscape, portrait · calidad standard · 13 escenas · marca TuMarca v1.2.0 #7676135603c43ec2 · chrome fijado por hyperframes · ffmpeg 6.1.1-3ubuntu5 · QA ok
  - Render con tumarca v1.2 tras pasar al estudio multimarca: look propio (tarjetas en pasos y comparación, borde en el lower third) y bloque firma de logo "Escaneo".
