# CyberGoat3D — LOOK (dirección de arte)

> Lo escribe /marca y lo leen todos los agentes antes de diseñar una pieza de esta marca. Es la parte del estilo que
> no entra en un token: por qué la marca se ve así, qué la hace distinta de las otras marcas del estudio y qué nunca hace.
> Los valores van en `brand.config.json → look` (y `npm run brand -- cybergoat3d`); acá va el criterio.
>
> Estado: **v0.1.0, propuesta derivada del logo** (brandkit `brandkit/cybergoat3d/`). La confirma el dueño, Facundo Lemos, sobre el brand board y la comparación.

## En una frase
El producto impreso al frente sobre blanco, firmado por el badge rojo y negro de la cabra: pocas palabras, en mayúsculas gruesas y redondeadas, con el dato clave en rojo.

## Qué la hace distinta de las otras marcas del estudio
- **Contra TuMarca** (oscura técnica): fondo blanco liso y composición centrada; nada de grilla, glow ni alineación a la izquierda.
- **Contra Northline** (editorial clara): sans gruesa y lúdica en mayúsculas, no serif; acento rojo por color, no itálica; blanco puro, no papel crema.
- **Contra Pulso** (social energética): motion calmo (balanced) y fondo limpio, sin gradiente ni resaltado; mucho menos texto.
- **Lo propio:** el badge circular (anillo rojo grueso con la cabra negra) y la letra del logotipo (Luckiest Guy) usada solo en titulares cortos.

## Movimientos firma
- **Apertura "Sello"** (`blocks/logo-sting.html`): el anillo rojo se dibuja desde arriba en sentido horario, la cabra sube dentro del disco y el logotipo entra letra por letra. Unos 3 s y sin rebote.
- **Texto:** entra con `rise` suave, con las duraciones calmas de balanced. Una idea por pantalla y como mucho 5 palabras de titular.
- **Dato clave:** una sola palabra o cifra en rojo (`--c-accent`), como CYBER y 3D en el logo. Medidas y materiales en mono (`.bm-code`/`.bm-label`), chicas y sutiles.
- **Cierre:** el CTA en mayúsculas, centrado, con el link en una píldora negra.
- **Entre escenas:** crossfade por defecto.

## Referencias (`references/`)
- `01-isologo.png`
  - Qué tomamos: badge circular, contraste rojo, negro y blanco, figura plana sin degradés, formas redondeadas.
  - Qué no: nada (es la marca).
- `02-logotipo.png`
  - Qué tomamos: mayúsculas gruesas con un baile irregular; el rojo marca lo importante (CYBER, 3D) y el negro el resto.
  - Qué no: esa letra en textos largos (solo titulares cortos).
- PENDIENTE: 3 videos o cuentas de producto que le gusten a la marca (pedírselos al dueño) para afinar el ritmo y el uso de las fotos.

## Sí
- El producto es el protagonista: el texto acompaña, no explica.
- Fondo blanco o gris muy claro, para que las fotos con fondo limpio se integren sin cajas.
- Un solo momento rojo por pantalla.
- Consultar con la marca cada texto en pantalla antes de ponerlo (nombre, medida, material, precio).
- Efectos de sonido que llaman la atención solo en los momentos clave (aparece el producto, cambio de escena), sobre música sutil.

## Nunca
- Muros de texto o frases largas.
- Look "tech" genérico: fondo oscuro con neón, partículas, glitch o lens flares.
- Rebote u overshoot en textos y en el logo; girar o deformar el logo; separar la cabra del anillo.
- Datos del producto (medidas, material, precio, tiempos) que la marca no haya confirmado.

## Bloques firma (`blocks/`)
- `logo-sting.html` ("Sello"): reemplaza al logo-sting del engine solo para esta marca.
- **Pendiente:** un bloque de producto destacado (foto del producto con movimiento de cámara suave y, como mucho, nombre y un dato). Es el tipo de video principal de la marca y hoy el engine no tiene un bloque de foto.
