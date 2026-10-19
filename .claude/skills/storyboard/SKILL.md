---
name: storyboard
description: Gates G4-G5. Convierte el guion aprobado en storyboard ejecutable (02_storyboard.md) + scenes.json, construye y genera los styleframes reales (un frame clave por escena en 16:9 y 9:16) para aprobación. Usar cuando digan "storyboard", "bajalo a escenas", "quiero ver frames antes de animar".
---

# /storyboard — aprobar el look antes de animar

Prerrequisito: `01_guion.md` aprobado.

## 1. Escenas
Delegá al subagente `storyboarder`. Para cada beat: id estable, bloque de `engine/blocks/README.md`, duración (≥ hold de lectura + entrada + salida), variables con texto literal, transición, notas (VO, acceptance, do_not). Vertical: densidad a la mitad vía `formats.portrait.vars`.

## 2. Archivos
- `02_storyboard.md` (plantilla `templates/storyboard.md`: ficha A + bloque B compatible con el parser de HyperFrames).
- `scenes.json` (sección C de la plantilla). El hook de edición corre `build:roots` solo; si no, `npm run build:roots -- <p>`.

## 3. Styleframes reales
```bash
npm run frames -- <proyecto>
npm run frames -- <proyecto> --format portrait
```
Abrí cada PNG en `review/frames-*`. Antes de mostrar, autocrítica con el subagente `director-de-arte` (jerarquía, un acento, safe areas, tamaños, anti-slop sección E). Corregí vars/duraciones/escenas y regenerá.

## 4. Salida
Contact sheets de 16:9 y 9:16 + tabla de escenas (id · bloque · duración · texto) + duración total vs objetivo (±5 %). Pedí aprobación de look (G4) y de storyboard (G5). Lo aprobado se marca con `"lock": true` en notas o en el storyboard.
