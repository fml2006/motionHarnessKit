# Marcas del estudio (GENERADO por `npm run brand` — no editar)

Cada pieza usa UNA marca: `scenes.json → "brand"`. Antes de diseñar o animar, leé de ESA marca:
`brands/<marca>/LOOK.md` (dirección de arte: qué la hace distinta), `brands/<marca>/dist/MOTION.md` (tokens y timing) y
`brands/<marca>/dist/brand-rules.md` (reglas). Nunca mezcles tokens, bloques firma ni referencias de dos marcas en una pieza.

| Marca | Nombre | Versión | Look | Bloques firma (`brands/<marca>/blocks/`) |
|---|---|---|---|---|
| `cybergoat3d` (default) | CyberGoat3D | 0.1.0 | Producto al frente sobre blanco: badge rojo y negro, titulares cortos en MAYÚSCULAS gruesas y redondeadas (la letra del logotipo), el dato clave en rojo, todo centrado y con aire. | `logo-sting` |
| `northline` | Northline | 1.1.0 | Editorial clara: papel con filete de página, composición centrada y simétrica, serif con acento en itálica terracota, texto que aparece por fundido lento. | `logo-sting`, `northline-folio` |
| `pulso` | Pulso | 1.0.0 | Energética para social: gradiente rosa-violeta, titulares enormes en MAYÚSCULAS, el dato resaltado en lima y texto que sube con fuerza. | `logo-sting`, `pulso-impacto` |
| `tumarca` | TuMarca | 1.2.0 | Oscuro técnico: grilla de ingeniería, todo alineado a la izquierda, titulares que suben por máscara y un solo acento ámbar por color. | `logo-sting` |

- Default para piezas nuevas: `cybergoat3d` (`brands/brands.json`). Pieza con otra marca: `npm run new -- <slug> --brand <marca>`.
- Un bloque firma con el nombre de un bloque del engine (p. ej. `logo-sting`) lo reemplaza SOLO para esa marca; un bloque firma con nombre propio existe solo para su marca (otra marca que lo pida → error de build).
- Comparar marcas sobre la misma pieza: `npm run brand:compare -- <proyecto> --brands cybergoat3d,northline,pulso,tumarca`.
