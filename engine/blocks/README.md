# Catálogo de bloques de marca

> GENERADO por `node scripts/blocks-catalog.mjs`. Cada bloque es una sub-composición HyperFrames parametrizable que lee los tokens Y EL LOOK de la marca de la pieza (`brands/<marca>/dist`: fondo, alineación, caja, acento, reveal, kicker, tarjetas, densidad) y se adapta sola a 16:9, 9:16, 4:5 y 1:1. Por eso la MISMA escena se ve distinta en cada marca (`npm run brand:compare -- _galeria-bloques`).
> Uso: en `scenes.json` → `{ "id": "s03-dato", "block": "stat-hit", "duration": 5, "vars": { ... } }`. La primera vez se copia a `comp/compositions/<id>.html` y desde ahí se puede personalizar.
> Convenciones de texto: separá líneas con `|`, marcá UNA palabra de acento con `*asteriscos*`, listas con `\n`. Todos aceptan `exit` (none/fade/up) y reciben `dur` automáticamente.
> **Los bloques no traen contenido, traen estructura.** Todo default es un placeholder visible (`⟦COMPLETAR…⟧`, `⟦A⟧ ficticio`, `⟦—⟧`): si no lo pisás en `scenes.json`, se ve en pantalla y `npm run build:roots -- <proyecto> --strict` frena el render final. Los bloques con cifras (`stat-hit`, `bar-chart`) exigen `"claims": ["C-…"]` con estado `ok` y firma del SME en `research/claims.csv`.

| Bloque | Para qué | Duración sugerida |
|---|---|---|
| [`bar-chart`](#bar-chart) | comparar 2-6 valores. Barras horizontales desde CERO (nunca truncar el eje), valores con conteo. | 6-8 s. |
| [`chapter`](#chapter) | separador de capítulo/sección en piezas de 2+ minutos (bumper). Corto y consistente en toda la serie. | BRAND.hold(kicker + título) + 0,6 s (≈ 3-3,5 s con 5-6 palabras). |
| [`code-reveal`](#code-reveal) | mostrar código real (≤ 12 líneas) con reveal por línea y resaltado de las líneas clave. | 1 s + 0.35 s por línea + BRAND.hold(caption). |
| [`end-card`](#end-card) | cierre con UN llamado a la acción + dónde ir. Un solo CTA (no tres). | 4-6 s (en YouTube, 5-20 s si vas a usar pantallas finales nativas: dejá zona libre). |
| [`kinetic-statement`](#kinetic-statement) | una afirmación clave, palabra por palabra (hook, tesis, transición de argumento). | BRAND.hold(texto) + 1.5 s (≈ 3.5-6 s). |
| [`logo-sting`](#logo-sting) | firma de marca (apertura corta o cierre). Usa los SVG de brand/ inline (BRAND.logo). | 2-3 s. |
| [`lower-third`](#lower-third) | identificar a una persona/fuente sobre video (talking head, entrevista, demo). | 4-6 s (nunca menos de BRAND.hold(nombre + rol)). |
| [`quote`](#quote) | cita textual con atribución (cliente, experto, documentación oficial). | BRAND.hold(cita) + 2 s. |
| [`split-compare`](#split-compare) | A vs B, antes/después, mito/realidad. 2-4 ítems por lado, paralelos en estructura. | 7-9 s. |
| [`stat-hit`](#stat-hit) | UN dato duro con conteo. El número es el momento de acento del frame. | 4-6 s. |
| [`steps-flow`](#steps-flow) | proceso o arquitectura simple en 2-5 pasos (pipeline, flujo de datos, cómo funciona X). | 1.5 s + 1.6 s por paso. |
| [`terminal`](#terminal) | un comando real tipeándose + su salida. Ideal para CLIs, instalaciones, demos de dev tools. | 1.2 s + largo del comando/28 + 0.25 s por línea de salida + 1.5 s. |
| [`title-card`](#title-card) | apertura de la pieza o de una sección. Kicker + titular (1-3 líneas) + bajada. | 3.5-5 s. |

Para ver todos con la marca actual: `npm run frames -- _galeria-bloques` (y `--format portrait` / `--format feed`). La galería es `"purpose": "demo"`: sus escenas con cifras están rotuladas como ficticias y marcadas `"demo": true`, lo único que las exceptúa del gate estricto.

## Bloques firma por marca

Una marca puede tener bloques propios en `brands/<marca>/blocks/`: con el nombre de un bloque del engine lo **reemplaza solo para esa marca** (p. ej. su `logo-sting`); con nombre propio es **exclusivo** (otra marca que lo pida falla en el build con un error claro).

### Northline (`northline`)

| Bloque | Tipo | Para qué | Duración sugerida |
|---|---|---|---|
| `logo-sting` | reemplaza al del engine | FIRMA de Northline (reemplaza al logo-sting del engine solo para esta marca). "Folio": dos filetes se abren desde el centro, el logo aparece por fundido lento y la bajada entra en itálica, todo centrado. | 3-3.6 s (Northline respira: no lo apures). |
| `northline-folio` | exclusivo de la marca | FIRMA EXCLUSIVA de Northline: portada de folio editorial para abrir una pieza o un capítulo. Cabecera con número y fecha entre filetes, titular serif centrado (acento en itálica) y sección al pie. | 4.5-6 s. |

### Pulso (`pulso`)

| Bloque | Tipo | Para qué | Duración sugerida |
|---|---|---|---|
| `logo-sting` | reemplaza al del engine | FIRMA de Pulso (reemplaza al logo-sting del engine solo para esta marca). "Pop": el isotipo entra con un golpe seco (sin rebote), una banda lima barre detrás del wordmark y la bajada sube en mayúsculas. | 1.8-2.4 s (Pulso es rápida). |
| `pulso-impacto` | exclusivo de la marca | FIRMA EXCLUSIVA de Pulso: hook de social a pantalla llena. 2-4 palabras gigantes en mayúsculas, una por línea, que suben de a una; la palabra de acento queda resaltada en lima. | 2.5-3.5 s (es un golpe, no un párrafo). |

### TuMarca (`tumarca`)

| Bloque | Tipo | Para qué | Duración sugerida |
|---|---|---|---|
| `logo-sting` | reemplaza al del engine | FIRMA de TuMarca (reemplaza al logo-sting del engine solo para esta marca). "Escaneo": dos líneas de la grilla barren el cuadro, el isotipo se revela con una línea de escaneo y el wordmark entra desde la izquierda; la bajada se tipea en mono. | 2.4-3 s. |

## Transiciones entre escenas

En `scenes.json`: `"defaultTransition"` o `"transition"` por escena (la transición con la que ENTRA esa escena). Implementadas: `cut`, `crossfade` (solapa `crossfade` s, 0,4 por defecto), `push` (lo nuevo entra desde la derecha; dura `BRAND.dur("scene")`, ease `move`) y `mask-wipe` (revelado de derecha a izquierda). Cualquier otra hace fallar el build; `zoom-through` y `match-cut` se resuelven en el editor.

## Captions quemados

Si el proyecto tiene `captions.srt` (o `.vtt`), build:roots genera `compositions/_captions.html` y lo monta en los formatos de `captions.burnIn` (por defecto 9:16 y 4:5), dentro de la zona segura. Avisa si un cue pasa de 38 caracteres por línea, 2 líneas, 17 caracteres/s o dura menos de 1 s.

## Detalle

### bar-chart

comparar 2-6 valores. Barras horizontales desde CERO (nunca truncar el eje), valores con conteo.

- "items": "Etiqueta: valor" por línea. "highlight": etiqueta que lleva el acento (1 sola).
- REGLA: "source" obligatoria; mismo período/unidad para todas las barras; la escena declara "claims": ["C-…"].
- Los defaults son ficticios y rotulados (⟦A⟧ ficticio…): build:roots --strict no deja renderizarlos como final.

| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `title` | string | "⟦COMPLETAR: qué se compara (unidad)⟧" | Título |
| `items` | string | "⟦A⟧ ficticio: 3\n⟦B⟧ ficticio: 2\n⟦C⟧ ficticio: 1" | Items (Etiqueta: valor, \n entre items) |
| `unit` | string | "" | Unidad/sufijo |
| `decimals` | number | 0 | Decimales |
| `highlight` | string | "⟦C⟧ ficticio" | Etiqueta destacada |
| `source` | string | "⟦COMPLETAR: Fuente · claim C-…⟧" | Fuente (obligatoria) |
| `exit` | enum (none / fade / up) | "fade" | Salida |
| `dur` | number | 7 | Duración de la escena (s) |

### chapter

separador de capítulo/sección en piezas de 2+ minutos (bumper). Corto y consistente en toda la serie.



| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `number` | string | "01" | Número |
| `title` | string | "⟦COMPLETAR: título del capítulo⟧" | Título del capítulo |
| `kicker` | string | "Capítulo" | Kicker (opcional) |
| `exit` | enum (none / fade / up) | "up" | Salida |
| `dur` | number | 2.6 | Duración de la escena (s) |

### code-reveal

mostrar código real (≤ 12 líneas) con reveal por línea y resaltado de las líneas clave.

- REGLA: el código mostrado tiene que compilar/ejecutar o estar marcado como pseudocódigo. Nada inventado.
- "code": líneas separadas por \n. "highlight": números de línea separados por coma (ej. "3,4").
- Los defaults son placeholders visibles (⟦…⟧): si no los reemplazás, se ven en pantalla y --strict frena el final.

| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `filename` | string | "⟦archivo⟧" | Archivo |
| `code` | string | "// ⟦COMPLETAR⟧ pegá código real y probado\n// (copiado del repo o de la doc ofi | Código (\n entre líneas) |
| `highlight` | string | "" | Líneas a resaltar |
| `caption` | string | "⟦COMPLETAR: qué tiene que mirar\|la audiencia⟧" | Explicación (líneas con |) |
| `exit` | enum (none / fade / up) | "fade" | Salida |
| `dur` | number | 7 | Duración de la escena (s) |

### end-card

cierre con UN llamado a la acción + dónde ir. Un solo CTA (no tres).



| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `cta` | string | "⟦COMPLETAR: un único\|*llamado* a la acción⟧" | CTA (líneas con |, acento con *) |
| `link` | string | "⟦COMPLETAR: link⟧" | Link / handle |
| `note` | string | "" | Nota legal / disclosure (opcional) |
| `exit` | enum (none / fade / up) | "none" | Salida |
| `dur` | number | 5 | Duración de la escena (s) |

### kinetic-statement

una afirmación clave, palabra por palabra (hook, tesis, transición de argumento).

- Marcá la palabra de acento con *asteriscos* o en la variable "accent". Máximo ~12 palabras.

| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `text` | string | "⟦COMPLETAR: una *idea* por pantalla⟧" | Afirmación (acento con *) |
| `align` | enum (auto / center / left) | "auto" | Alineación |
| `size` | enum (auto / h1 / hero) | "auto" | Tamaño |
| `exit` | enum (none / fade / up) | "fade" | Salida |
| `dur` | number | 4.5 | Duración de la escena (s) |

### logo-sting

firma de marca (apertura corta o cierre). Usa los SVG de brand/ inline (BRAND.logo).

- Reglas de logo: sin deformar, sin rotar, sin glow. El isotipo escala; el wordmark se revela con máscara.

| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `tagline` | string | "" | Tagline (opcional) |
| `exit` | enum (none / fade / up) | "none" | Salida |
| `dur` | number | 2.6 | Duración de la escena (s) |

### lower-third

identificar a una persona/fuente sobre video (talking head, entrevista, demo).

- Fondo TRANSPARENTE por defecto: renderizá con `--format mov` (ProRes 4444 + alpha) o `--format webm`
- para usarlo como overlay en Premiere / DaVinci / CapCut, o montalo sobre un <video> en la composición.

| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `name` | string | "⟦Nombre Apellido⟧" | Nombre |
| `role` | string | "⟦Rol · organización⟧" | Rol |
| `side` | enum (left / right) | "left" | Lado |
| `transparent` | boolean | true | Fondo transparente |
| `exit` | enum (none / fade / up) | "fade" | Salida |
| `dur` | number | 5 | Duración de la escena (s) |

### quote

cita textual con atribución (cliente, experto, documentación oficial).

- REGLA: cita literal y verificable; si es paráfrasis, no uses comillas. Pedí permiso para citar personas.
- Declará la cita como claim ("claims": ["C-…"]) para que --strict verifique que está firmada.
- Los defaults son placeholders visibles (⟦…⟧).

| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `quote` | string | "⟦COMPLETAR: cita textual\|con fuente verificable⟧" | Cita (líneas con |) |
| `author` | string | "⟦Nombre Apellido⟧" | Autor |
| `role` | string | "⟦Rol, organización⟧" | Rol / organización |
| `exit` | enum (none / fade / up) | "fade" | Salida |
| `dur` | number | 6 | Duración de la escena (s) |

### split-compare

A vs B, antes/después, mito/realidad. 2-4 ítems por lado, paralelos en estructura.

- Lado derecho = la conclusión (lleva el color primario). En 9:16 se apila automáticamente.

| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `title` | string | "" | Título (opcional) |
| `leftTitle` | string | "⟦Antes⟧" | Título izquierda |
| `leftItems` | string | "⟦COMPLETAR⟧\n⟦COMPLETAR⟧" | Items izquierda (\n entre items) |
| `rightTitle` | string | "⟦Después⟧" | Título derecha |
| `rightItems` | string | "⟦COMPLETAR⟧\n⟦COMPLETAR⟧" | Items derecha (\n entre items) |
| `exit` | enum (none / fade / up) | "fade" | Salida |
| `dur` | number | 8 | Duración de la escena (s) |

### stat-hit

UN dato duro con conteo. El número es el momento de acento del frame.

- REGLA: "source" es obligatoria y la escena declara "claims": ["C-…"] en scenes.json (claim con estado=ok y
- verificado_por firmado en research/claims.csv). Sin eso, build:roots --strict frena el render final.
- Los defaults son placeholders visibles (⟦…⟧): el bloque no trae datos, trae estructura.

| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `value` | number | null | Valor (sin default: tiene que venir de una claim verificada) |
| `decimals` | number | 0 | Decimales |
| `prefix` | string | "" | Prefijo |
| `suffix` | string | "" | Sufijo |
| `label` | string | "⟦COMPLETAR: qué mide el dato⟧" | Qué mide (≤8 palabras) |
| `context` | string | "" | Contexto (opcional) |
| `source` | string | "⟦COMPLETAR: Fuente · claim C-…⟧" | Fuente (obligatoria) |
| `exit` | enum (none / fade / up) | "fade" | Salida |
| `dur` | number | 5 | Duración de la escena (s) |

### steps-flow

proceso o arquitectura simple en 2-5 pasos (pipeline, flujo de datos, cómo funciona X).

- "steps": "Título — descripción corta" por línea. Horizontal en 16:9, vertical en 9:16 (automático).

| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `title` | string | "⟦COMPLETAR: título⟧" | Título |
| `steps` | string | "⟦Paso 1⟧ — ⟦qué pasa⟧\n⟦Paso 2⟧ — ⟦qué pasa⟧\n⟦Paso 3⟧ — ⟦qué pasa⟧" | Pasos (Título — descripción, \n entre pasos) |
| `exit` | enum (none / fade / up) | "fade" | Salida |
| `dur` | number | 8 | Duración de la escena (s) |

### terminal

un comando real tipeándose + su salida. Ideal para CLIs, instalaciones, demos de dev tools.

- REGLA: comando y salida reales (copiados de una corrida). Ocultá tokens, paths personales y datos de clientes.
- "output": líneas separadas por \n; una línea que empieza con "✓" se pinta como éxito.
- Los defaults son placeholders visibles (⟦…⟧): si no los reemplazás, se ven en pantalla y --strict frena el final.

| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `title` | string | "terminal" | Título de la ventana |
| `prompt` | string | "$" | Prompt |
| `command` | string | "echo \"reemplazar por una corrida real\"" | Comando |
| `output` | string | "⟦COMPLETAR: pegá la salida real de esa corrida⟧" | Salida (\n entre líneas) |
| `caption` | string | "" | Leyenda (opcional) |
| `exit` | enum (none / fade / up) | "fade" | Salida |
| `dur` | number | 6 | Duración de la escena (s) |

### title-card

apertura de la pieza o de una sección. Kicker + titular (1-3 líneas) + bajada.

- Texto: separá líneas con "|" y marcá UNA palabra de acento con *asteriscos*.

| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `kicker` | string | "Explainer" | Kicker (1-4 palabras) |
| `headline` | string | "⟦COMPLETAR: titular\|con *acento*⟧" | Titular (líneas con |, acento con *) |
| `subtitle` | string | "⟦COMPLETAR: bajada⟧" | Bajada |
| `showMark` | boolean | true | Mostrar isotipo |
| `bg` | enum (brand / hero / plain) | "brand" | Fondo |
| `exit` | enum (none / fade / up) | "fade" | Salida |
| `dur` | number | 4.5 | Duración de la escena (s) |
