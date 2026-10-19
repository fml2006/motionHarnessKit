# Empezar: qué tenés que hacer vos

Esta página es la versión corta. La guía completa explica el porqué (`docs/GUIA.md`). El orquestador está detallado en `docs/ORQUESTADOR.md`.

## Qué es cada cosa

| Pieza | Qué es | Quién la usa |
|---|---|---|
| **Guía** | El método: conceptos de motion, roles, pipeline, guion, storyboard, entrega, legal y costos | Todo el equipo, para entender y formarse |
| **Kit** (`motion-harness-kit`) | El repo donde se produce: marcas, bloques animados, scripts de render y QA, plantillas | Se abre con Claude Code |
| **Marcas** (`brands/<marca>/`) | Cada marca con sus colores, fuentes, logo, motion, *look* y escenas propias | Se configuran una vez con `/marca` |
| **Orquestador** (`/pieza`) | El "productor" dentro de Claude Code. Crea la pieza, llama a cada subagente en orden, corre los chequeos y frena para que una persona apruebe | Lo usás para cada video |
| **Subagentes** (`.claude/agents/`) | Los roles: productor, investigador, guionista, director de arte, storyboarder, motion designer, editor de sonido y QA | Los llama el orquestador; no hace falta llamarlos a mano |

## Paso 0 · Llevar el kit a tu máquina (una vez)

1. Bajá el zip desde la página del kit, o cloná el repo si lo subimos a GitHub (recomendado: así queda versionado).
2. Instalá los prerrequisitos:
   - Node 22 o superior.
   - ffmpeg (`brew install ffmpeg` en Mac).
   - git.
   - Claude Code.
   - Docker es opcional.
3. En la carpeta del kit:
   ```bash
   git init && git add -A && git commit -m "kit inicial"   # solo si vino en zip
   npm install
   npm run setup      # apaga la telemetría de HyperFrames y baja el Chrome fijado
   npm run doctor     # tiene que decir "Listo para producir"
   npm run selftest   # prueba render → loudness → master → QA (unos minutos)
   ```

## Paso 1 · Crear tus marcas (una vez por marca)

Abrí Claude Code en la carpeta del kit (`claude`) y escribí `/marca`. Te va a entrevistar en dos tandas. Tené a mano, por marca:

- [ ] **Nombre y un slug corto** (`acme`, `acme-latam`).
- [ ] **Logo en SVG**: el isotipo y el logo completo, en versión clara y oscura. Si querés animarlo por partes, marcá con `data-part="mark"` y `data-part="wordmark"`.
- [ ] **Paleta en hex reales**: fondo, superficie, texto, primario, secundario, acento y colores de error y éxito.
- [ ] **Fuentes con licencia para video**: display, texto y mono. Si son de Google Fonts, el kit las vendoriza.
- [ ] **3 a 5 referencias de motion**: videos o frames que te gustan, y qué te gusta de cada uno.
- [ ] **Tono, audiencia y lo que NO querés**: "nada de neón", "nada de rebote", "nunca mayúsculas"…

`/marca` crea `brands/<marca>/` con todo esto:

- `brand.config.json`: los tokens.
- `LOOK.md`: la dirección de arte en prosa, lo que hace distinta a la marca.
- Los bloques firma, si los pide la marca.
- El brand board y el reporte de contraste.

Además corre `npm run brand:compare` para que veas la misma galería con tu marca al lado de las otras. **Lo aprueba el director de arte.**

Las marcas `northline` y `pulso` son ejemplos y `tumarca` es la marca placeholder. Cuando tengas las tuyas:

- Borrá las de ejemplo (`rm -r brands/northline brands/pulso`).
- Poné la tuya como default en `brands/brands.json`.
- Antes de borrar `tumarca`, pasá a tu marca los dos proyectos que la usan: el ejemplo y la galería. Se hace con `npm run build:roots -- <proyecto> --brand <tu-marca> --rebrand`.

## Paso 2 · Producir un video con el orquestador

En Claude Code:

```
/pieza nueva "Explainer de 60 s sobre cómo funciona nuestra API de pagos, para LinkedIn y Reels" --marca acme
```

El orquestador va checkpoint por checkpoint. En cada uno te muestra qué hizo y qué mirar, y te pregunta **Aprobar / Pedir cambios / Pausar**:

| Checkpoint | Qué hace Claude (con qué subagente) | Qué decidís vos |
|---|---|---|
| Brief y claims | `productor` arma el brief; `investigador` arma el registro de claims con fuentes | Mensaje único, audiencia, CTA. El experto (SME) firma cada cifra |
| Guion | `guionista` propone hooks y escribe el guion a dos columnas dentro del presupuesto de palabras | Qué hook va y si el guion entra en la duración |
| Storyboard | `storyboarder` baja el guion a escenas y bloques; se generan frames reales en cada formato; `director-de-arte` los critica | El look, mirando frames de verdad |
| Animatic | Varios `motion-designer` en paralelo, uno por escena; render draft; `qa-director` lo revisa antes de mostrártelo | Timing y ritmo |
| Revisión (las rondas que haga falta) | Traduce tu feedback ("se siente lento") a cambios concretos y saca una versión nueva | Si está lista |
| Lock | Corre el gate estricto: nada de placeholders ni cifras sin firma | Congelar la imagen |
| Entrega | `editor-sonido` prepara audio y captions; `npm run deliver` saca master y entregables por plataforma con QA | Firmas de QA y Legal. La publicación la hace una persona |

- **Pausar y seguir otro día:** `/pieza continuar <proyecto>`. El estado vive en `projects/<p>/pipeline.json`, no en el chat.
- **Ver todas las piezas:** `/pieza estado`.
- **Modo express:** para piezas internas o de redes de bajo riesgo, son 4 checkpoints en vez de 7. Se pide con `--modo express`.

## Varias marcas: cómo queda cada una consistente y distinta

- **Consistente dentro de una marca:** todas sus piezas usan los mismos tokens (color, tipografía, duraciones, curvas), el mismo *look* y sus bloques firma.
  - El *look* es el fondo, la alineación, cómo se marca el acento, cómo entra el texto, las tarjetas y la densidad.
  - Las reglas del kit prohíben valores sueltos, y el build avisa y frena.
- **Distinta entre marcas:** la misma escena cambia de composición y de comportamiento, no solo de color. Para comprobarlo:
  ```bash
  npm run brand:compare -- _galeria-bloques --brands acme,otra-marca
  ```
- **Protegida:** cada pieza guarda la marca y la versión con las que se aprobó (`brandLock`). Si después cambiás la marca, las piezas viejas no cambian en silencio. Para pasar una a la marca nueva hay que pedirlo: `--rebrand`.
- **Una marca por pieza:** el orquestador nunca mezcla marcas. Para la misma pieza en otra marca, se crea otra pieza.
- **¿Un repo o varios?**
  - Tus propias marcas pueden convivir en un repo.
  - Las marcas de clientes con confidencialidad estricta van en un repo por cliente: el material de uno no tiene que ser visible para los otros.

## Qué hace Claude y qué hace siempre una persona

| Claude | Una persona |
|---|---|
| Redacta brief, guion y storyboard; construye escenas; renderiza; corre QA; traduce feedback a cambios | Aprueba cada checkpoint; firma las cifras (SME); elige el hook y el look; escucha la mezcla; firma QA y Legal; publica |

Claude nunca aprueba un checkpoint por su cuenta, ni firma claims, ni publica. Tampoco renderiza el final antes del lock.

## Un primer piloto que funciona

1. Configurá **una** marca y aprobá su brand board.
2. Produzcan **3 piezas cortas** (30 a 60 s) con `/pieza`. Una de ellas se hace también en el flujo tradicional, para comparar.
3. Carguen horas en `review/HORAS.csv` y comparen horas por minuto terminado, rondas y errores.
4. Recién ahí sumen la segunda marca.
