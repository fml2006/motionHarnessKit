# Northline — LOOK (dirección de arte)

> Marca de EJEMPLO editorial. Lo leen todos los agentes antes de diseñar una pieza de esta marca. Los valores están en
> `brand.config.json → look`; acá va el criterio.

## En una frase
Editorial clara: una revista de ingeniería impresa. Papel crema con filete de página, composición centrada y
simétrica, serif (Newsreader) con el acento en itálica terracota, y todo entra por fundido lento.

## Qué la hace distinta de las otras marcas del estudio
- Frente a **TuMarca**: claro (no oscuro), centrado (no a la izquierda), serif con itálica (no sans geométrica), fundido (no máscara), tarjetas con contorno fino y más aire (`density: airy`).
- Frente a **Pulso**: calma en vez de energía; caja normal, sin resaltados, motion "balanced" (entradas de 650 ms, stagger amplio).

## Movimientos firma
- **Apertura** (`blocks/logo-sting.html`, "Folio"): dos filetes se abren desde el centro y el logo aparece por fundido.
- **Portada** (`blocks/northline-folio.html`, exclusivo): cabecera con número y fecha entre filetes dobles, titular serif centrado, sección al pie. Para abrir piezas y capítulos.
- **Texto**: fundido sin desplazamiento; el acento ya está en itálica y vira a terracota.
- **Transición por defecto**: crossfade (continuidad, como pasar de página).

## Referencias
- Revistas técnicas impresas y ensayos largos: tomamos jerarquía tipográfica, filetes y márgenes; NO tomamos texturas sucias ni "papel viejo".

## Sí
- Mucho aire; una idea por página.
- Filetes finos en tinta (`text`) como estructura.
- Itálica solo para la palabra clave.

## Nunca
- Fondos oscuros, glow, gradientes.
- Mayúsculas en titulares; más de una itálica de acento por frame.
- Movimientos rápidos: si algo "pega", no es Northline.

## Bloques firma (`blocks/`)
- `logo-sting` (reemplaza al del engine): "Folio".
- `northline-folio` (exclusivo): portada editorial.
