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

## Paso 0 · Instalar el kit (sesión 1, una vez por máquina)

Copiá el **prompt de instalación** del `README.md` (Paso 1) y pegalo en una sesión de Claude Code abierta en la carpeta donde querés el kit. El prompt:

- clona el repo;
- revisa Node, ffmpeg y git, y pide permiso antes de instalar lo que falte;
- corre `npm ci`, `npm run setup`, `npm run doctor` y `npm run selftest`;
- te devuelve la ruta de la carpeta y una tabla con cada paso.

Si el kit vino en zip y no lo clonaste: descomprimilo, entrá a la carpeta y pedile a Claude que siga el mismo prompt desde el paso 2.

## Paso 1 · Crear tus marcas con un brandkit (sesión 2, una vez por marca)

1. `npm run brandkit:new -- <slug> --name "Nombre"` crea `brandkit/<slug>/` con el formulario `BRANDKIT.md` y las carpetas `logo/`, `fonts/` y `references/`.
2. Completá el formulario. Tené a mano, por marca:
   - [ ] **Nombre y slug** (`acme`, `acme-latam`) y quién aprueba la marca.
   - [ ] **Logo en SVG**: completo para fondo claro y para fondo oscuro, y el isotipo. Para animarlo por partes: `data-part="mark"` y `data-part="wordmark"`.
   - [ ] **Paleta en hex reales**: fondo, texto, primario y acento como mínimo.
   - [ ] **Fuentes con licencia para video** (Google Fonts o archivos propios con su licencia).
   - [ ] **3 a 5 referencias de motion**, con qué tomar y qué no de cada una.
   - [ ] **Tono, audiencia, plataformas y lo que NO querés.**
   - [ ] **El look y el motion**, o `que decida el DA`.
3. `npm run brandkit:check -- <slug>` hasta que no quede ningún ✗.
4. Abrí una sesión **nueva** de Claude Code en la carpeta del kit y pegá `/marca desde brandkit/<slug>` (la versión larga del pedido está en el `README.md`, Paso 3).

`/marca` crea `brands/<slug>/` con todo esto:

- `brand.config.json`: los tokens.
- `LOOK.md`: la dirección de arte en prosa.
- Al menos un bloque firma.
- El brand board y el reporte de contraste.

Además te muestra la galería con tu marca al lado de las otras. **Lo aprueba el director de arte.** El ejemplo completo está en `brandkit/_ejemplo-northline/`.

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
