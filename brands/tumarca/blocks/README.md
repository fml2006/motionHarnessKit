# Bloques firma de TuMarca

Sub-composiciones HyperFrames con el mismo contrato que `engine/blocks/` (copiá uno como base; `__ID__` se reemplaza por el id de la escena).

- Mismo nombre que un bloque del engine (`logo-sting.html`, `end-card.html`…) → lo reemplaza SOLO para esta marca.
- Nombre propio (`tumarca-<algo>.html`) → bloque exclusivo: otra marca que lo pida falla en el build con un error claro.

Después de agregar uno: `node scripts/blocks-catalog.mjs` (catálogo) y `npm run brand:compare -- _galeria-bloques`.
