# Changelog de renders

Anotá debajo de cada versión qué cambió y por qué (feedback de qué ronda).

- 2026-10-19 05:38 · v001 · landscape, portrait · calidad standard · 7 escenas
  - R1 (dirección, sobre v001): QA marcó 3 holds de 4-5 s sin movimiento (título, comparación, código): en esta pieza muda son "escenas muertas". Decisión: se aceptan para el ejemplo porque la versión final lleva VO; en pieza muda, acortar o revelar en la segunda mitad.
  - R1 (dirección, sobre v001): cada escena se desvanecía antes del corte y dejaba frames vacíos (síntoma anti-slop "salidas animadas antes de cada transición"). Cambio: exit "none" por defecto en build:roots; la transición es la salida.
- 2026-10-19 05:42 · v002 · landscape, portrait · calidad standard · 7 escenas
  - R2 (técnica, sobre v002): ventana de código con chrome derivado de la paleta de código (legible en marcas claras y oscuras); escenas re-sincronizadas con los bloques actualizados.
- 2026-10-19 05:51 · v003 · landscape, portrait · calidad standard · 7 escenas
  - R3 (documentación, sin render nuevo, tras la revisión adversarial del kit): README con el estado real de los gates (solo G7 hecho; no publicable por claims); `01_guion.md` con conteo real (82 palabras netas) y desvío de duración (46 s vs ~42 s); `PROVENANCE.md` completado con lo usado; checklists, `R1.md` y `02_storyboard.md` rotulados como no ejecutados; `scenes.json` declara `claims` por escena, `purpose: example` y `brandLock`. Las escenas se re-copiaron desde los bloques actualizados (no tenían personalizaciones): el próximo render (v004) incluye el resaltado de código atenuado al 80 % y la ventana apilada sin hueco en 9:16.
- 2026-10-19 06:57 · v004 · landscape, portrait · calidad standard · 7 escenas · marca TuMarca v1.1.0 #361204c4d0e15797 · chrome fijado por hyperframes · ffmpeg 6.1.1-3ubuntu5 · QA ok
  - R4 (técnica, sobre v003): render con el kit corregido tras la revisión adversarial: marca v1.1 (stagger de ítems 60 ms, hold con caracteres/15, código no resaltado al 80 %) y gates de lint/check por código de salida. Sigue sin ser publicable: `build:roots --strict` falla por C-001…C-004 (dudosos o sin firma del SME).
- 2026-10-19 15:26 · REBRAND · TuMarca v1.1.0 #361204c4d0e15797 → tumarca · TuMarca v1.2.0 #7676135603c43ec2 (build:roots --rebrand)
  - Estudio multimarca: la pieza declara `"brand": "tumarca"` (brands/tumarca/) y se re-copiaron sus escenas desde los bloques nuevos, que leen el look de la marca (fondo, alineación, acento, reveal, kicker, tarjetas, densidad) y usan el `logo-sting` firma de TuMarca si lo tiene. Sin cambios de contenido.
