# Referencias de motion de la marca

Acá van los **3 a 5 frames (o clips cortos) de referencia** del motion que la marca quiere y **una cosa que su motion nunca debe hacer**. Los usan `/marca` y el subagente `director-de-arte` para calibrar `brand/brand.config.json` (easings, duraciones, personalidad) y para revisar styleframes.

## Qué guardar

| Archivo | Qué es |
|---|---|
| `ref-01-<tema>.png` / `.mp4` | Frame o clip de ≤ 10 s que muestra algo concreto: un reveal, un ritmo, una tipografía en movimiento |
| `ref-0N-….` | Hasta 5 referencias. Más que eso diluye la dirección |
| `REFERENCIAS.md` | Una línea por referencia: **qué** tomamos de ella (el timing, la entrada del texto, el color) y **qué no** |
| `NUNCA.md` | La una cosa que el motion de la marca no hace nunca (ej.: "rebotes en texto") |

## Reglas

- **Licencia y procedencia.** Las referencias son material de trabajo interno: no se publican ni se meten en una pieza. Si vienen de un tercero, anotá la URL de origen en `REFERENCIAS.md`. Nada de material de clientes de otros proyectos.
- **Referencia ≠ copia.** Se toma el principio (ritmo, jerarquía, curva), no la composición literal ni assets ajenos.
- **Traducir a tokens.** Cada referencia tiene que terminar en un valor de `brand.config.json` (p. ej. "entradas como la ref-02" → `motion.durations.enter: 450` + `easings.enter`). Si no se puede traducir a un token, es gusto, no sistema: discutilo en la revisión de marca.
- Archivos pesados (video) conviene guardarlos en el DAM o con Git LFS y dejar acá solo el link en `REFERENCIAS.md`.
