# Catálogo de bloques de marca

> GENERADO por `node scripts/blocks-catalog.mjs`. Cada bloque es una sub-composición HyperFrames parametrizable que lee los tokens de marca (`brand/dist`) y se adapta sola a 16:9, 9:16 y 1:1.
> Uso: en `scenes.json` → `{ "id": "s03-dato", "block": "stat-hit", "duration": 5, "vars": { ... } }`. La primera vez se copia a `comp/compositions/<id>.html` y desde ahí se puede personalizar.
> Convenciones de texto: separá líneas con `|`, marcá UNA palabra de acento con `*asteriscos*`, listas con `\n`. Todos aceptan `exit` (none/fade/up) y reciben `dur` automáticamente.

| Bloque | Para qué | Duración sugerida |
|---|---|---|
| [`bar-chart`](#bar-chart) | comparar 2-6 valores. Barras horizontales desde CERO (nunca truncar el eje), valores con conteo. | 6-8 s. |
| [`chapter`](#chapter) | separador de capítulo/sección en piezas de 2+ minutos (bumper). Corto y consistente en toda la serie. | 2-3 s. |
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

Para ver todos con la marca actual: `npm run frames -- _galeria-bloques` (y `--format portrait`).

## Detalle

### bar-chart

comparar 2-6 valores. Barras horizontales desde CERO (nunca truncar el eje), valores con conteo.

- "items": "Etiqueta: valor" por línea. "highlight": etiqueta que lleva el acento (1 sola).
- REGLA: "source" obligatoria; mismo período/unidad para todas las barras.

| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `title` | string | "Tiempo de primer corte (horas)" | Título |
| `items` | string | "Tradicional: 32\nPlantillas: 14\nIA + harness: 6" | Items (Etiqueta: valor, \n entre items) |
| `unit` | string | " h" | Unidad/sufijo |
| `decimals` | number | 0 | Decimales |
| `highlight` | string | "IA + harness" | Etiqueta destacada |
| `source` | string | "Fuente: datos internos de ejemplo — reemplazar" | Fuente (obligatoria) |
| `exit` | enum (none / fade / up) | "fade" | Salida |
| `dur` | number | 7 | Duración de la escena (s) |

### chapter

separador de capítulo/sección en piezas de 2+ minutos (bumper). Corto y consistente en toda la serie.



| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `number` | string | "02" | Número |
| `title` | string | "Cómo se arma el pipeline" | Título del capítulo |
| `kicker` | string | "Capítulo" | Kicker (opcional) |
| `exit` | enum (none / fade / up) | "up" | Salida |
| `dur` | number | 2.6 | Duración de la escena (s) |

### code-reveal

mostrar código real (≤ 12 líneas) con reveal por línea y resaltado de las líneas clave.

- REGLA: el código mostrado tiene que compilar/ejecutar o estar marcado como pseudocódigo. Nada inventado.
- "code": líneas separadas por \n. "highlight": números de línea separados por coma (ej. "3,4").

| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `filename` | string | "agent.ts" | Archivo |
| `code` | string | "const tools = [search, readFile];\nconst agent = new Agent({ model, tools });\n | Código (\n entre líneas) |
| `highlight` | string | "5" | Líneas a resaltar |
| `caption` | string | "Un agente es un *loop*:\|decide, usa una herramienta\|y vuelve a decidir." | Explicación (líneas con |) |
| `exit` | enum (none / fade / up) | "fade" | Salida |
| `dur` | number | 7 | Duración de la escena (s) |

### end-card

cierre con UN llamado a la acción + dónde ir. Un solo CTA (no tres).



| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `cta` | string | "Bajá el kit y\|*probalo* con tu marca" | CTA (líneas con |, acento con *) |
| `link` | string | "tumarca.com/kit" | Link / handle |
| `note` | string | "" | Nota legal / disclosure (opcional) |
| `exit` | enum (none / fade / up) | "none" | Salida |
| `dur` | number | 5 | Duración de la escena (s) |

### kinetic-statement

una afirmación clave, palabra por palabra (hook, tesis, transición de argumento).

- Marcá la palabra de acento con *asteriscos* o en la variable "accent". Máximo ~12 palabras.

| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `text` | string | "El modelo no *recuerda*: lee todo de nuevo cada vez." | Afirmación (acento con *) |
| `align` | enum (center / left) | "center" | Alineación |
| `size` | enum (h1 / hero) | "h1" | Tamaño |
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
| `name` | string | "Nombre Apellido" | Nombre |
| `role` | string | "Staff Engineer · Plataforma" | Rol |
| `side` | enum (left / right) | "left" | Lado |
| `transparent` | boolean | true | Fondo transparente |
| `exit` | enum (none / fade / up) | "fade" | Salida |
| `dur` | number | 5 | Duración de la escena (s) |

### quote

cita textual con atribución (cliente, experto, documentación oficial).

- REGLA: cita literal y verificable; si es paráfrasis, no uses comillas. Pedí permiso para citar personas.

| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `quote` | string | "La herramienta no reemplaza el criterio:\|lo *multiplica*." | Cita (líneas con |) |
| `author` | string | "Nombre Apellido" | Autor |
| `role` | string | "Directora creativa, Empresa" | Rol / organización |
| `exit` | enum (none / fade / up) | "fade" | Salida |
| `dur` | number | 6 | Duración de la escena (s) |

### split-compare

A vs B, antes/después, mito/realidad. 2-4 ítems por lado, paralelos en estructura.

- Lado derecho = la conclusión (lleva el color primario). En 9:16 se apila automáticamente.

| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `title` | string | "" | Título (opcional) |
| `leftTitle` | string | "Sin harness" | Título izquierda |
| `leftItems` | string | "Prompt distinto cada vez\nColores y fuentes a ojo\nRevisión al final" | Items izquierda (\n entre items) |
| `rightTitle` | string | "Con harness" | Título derecha |
| `rightItems` | string | "Brief y storyboard versionados\nTokens de marca obligatorios\nQA automático en  | Items derecha (\n entre items) |
| `exit` | enum (none / fade / up) | "fade" | Salida |
| `dur` | number | 8 | Duración de la escena (s) |

### stat-hit

UN dato duro con conteo. El número es el momento de acento del frame.

- REGLA: "source" es obligatoria. Si el dato no tiene fuente verificable, no va en pantalla.

| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `value` | number | 73 | Valor |
| `decimals` | number | 0 | Decimales |
| `prefix` | string | "" | Prefijo |
| `suffix` | string | "%" | Sufijo |
| `label` | string | "de los equipos ya usa agentes" | Qué mide (≤8 palabras) |
| `context` | string | "" | Contexto (opcional) |
| `source` | string | "Fuente: completar antes de publicar" | Fuente (obligatoria) |
| `exit` | enum (none / fade / up) | "fade" | Salida |
| `dur` | number | 5 | Duración de la escena (s) |

### steps-flow

proceso o arquitectura simple en 2-5 pasos (pipeline, flujo de datos, cómo funciona X).

- "steps": "Título — descripción corta" por línea. Horizontal en 16:9, vertical en 9:16 (automático).

| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `title` | string | "Cómo trabaja un agente" | Título |
| `steps` | string | "Pedido — vos describís el objetivo\nPlan — el modelo decide el próximo paso\nHe | Pasos (Título — descripción, \n entre pasos) |
| `exit` | enum (none / fade / up) | "fade" | Salida |
| `dur` | number | 8 | Duración de la escena (s) |

### terminal

un comando real tipeándose + su salida. Ideal para CLIs, instalaciones, demos de dev tools.

- REGLA: comando y salida reales (copiados de una corrida). Ocultá tokens, paths personales y datos de clientes.
- "output": líneas separadas por \n; una línea que empieza con "✓" se pinta como éxito.

| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `title` | string | "zsh — demo" | Título de la ventana |
| `prompt` | string | "$" | Prompt |
| `command` | string | "npx hyperframes render --output intro.mp4" | Comando |
| `output` | string | "Compilando composición…\nCapturando 135 frames (2 workers)\nCodificando H.264\n | Salida (\n entre líneas) |
| `caption` | string | "" | Leyenda (opcional) |
| `exit` | enum (none / fade / up) | "fade" | Salida |
| `dur` | number | 6 | Duración de la escena (s) |

### title-card

apertura de la pieza o de una sección. Kicker + titular (1-3 líneas) + bajada.

- Texto: separá líneas con "|" y marcá UNA palabra de acento con *asteriscos*.

| Variable | Tipo | Default | Descripción |
|---|---|---|---|
| `kicker` | string | "Explainer" | Kicker (1-4 palabras) |
| `headline` | string | "Qué es un *agente*\|y por qué importa" | Titular (líneas con |, acento con *) |
| `subtitle` | string | "En 60 segundos, sin jerga." | Bajada |
| `showMark` | boolean | true | Mostrar isotipo |
| `bg` | enum (grid / glow / solid) | "grid" | Fondo |
| `exit` | enum (none / fade / up) | "fade" | Salida |
| `dur` | number | 4.5 | Duración de la escena (s) |
