# TuMarca — LOOK (dirección de arte)

> Lo leen todos los agentes antes de diseñar una pieza de esta marca. Los valores están en `brand.config.json → look`
> (y en `dist/MOTION.md`); acá va el criterio que no entra en un token. Marca placeholder: reemplazala con /marca.

## En una frase
Oscuro técnico: una consola de ingeniería bien iluminada. Grilla quieta de fondo, todo alineado a la izquierda,
titulares que suben por máscara y UN acento ámbar por frame.

## Qué la hace distinta de las otras marcas del estudio
- Frente a **Northline** (editorial clara): fondo oscuro con grilla, composición asimétrica a la izquierda, sans geométrica, acento por color (no itálica), motion "productive": corto y preciso.
- Frente a **Pulso** (social): caja normal (no mayúsculas), sin resaltados ni gradientes intensos; el glow solo aparece en aperturas y cierres.

## Movimientos firma
- **Apertura** (`blocks/logo-sting.html`, "Escaneo"): dos líneas de la grilla barren el cuadro, el logo se revela con una línea de escaneo y la bajada se tipea en mono.
- **Texto**: reveal por máscara de abajo hacia arriba (`emphasized`), línea por línea; el kicker con línea primaria que se dibuja.
- **Dato clave**: número grande en ámbar con conteo y una barra que se dibuja debajo.
- **Cierre**: end-card con glow suave (`.bm-bg.is-hero`).

## Referencias
- Interfaces de herramientas de desarrollo (terminales, editores) con grilla sutil: tomamos la sobriedad y la jerarquía mono/sans; NO tomamos neón ni efectos "hacker".

## Sí
- Grilla al 6 % quieta; nada se mueve detrás del texto que se lee.
- Código y terminal reales, con la paleta de código de la marca.
- Alinear a la izquierda en todos los formatos (en 9:16 también).

## Nunca
- Rebote, glow de relleno, partículas, gradientes violeta-azul genéricos.
- Más de un acento ámbar por frame.

## Bloques firma (`blocks/`)
- `logo-sting` (reemplaza al del engine): "Escaneo".
