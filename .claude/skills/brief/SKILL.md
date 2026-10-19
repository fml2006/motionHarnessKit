---
name: brief
description: Gates G0-G1. Crea el proyecto de una pieza nueva y arma el brief y la base de claims verificables. Usar cuando digan "nuevo video", "arranquemos una pieza", "tengo este pedido del cliente", o pasen notas/un PRD/un link para convertir en video.
---

# /brief — de pedido a brief firmable

## 1. Crear el proyecto
Elegí el tipo según el pedido: `explainer` (concepto), `launch` (producto/feature), `social` (vertical corto), `tutorial` (paso a paso), `data` (un hallazgo con datos), `overlay` (lower thirds / gráficos para editor).
```bash
npm run new -- <slug> --title "<título de trabajo>" --type <tipo> [--formats landscape,portrait]
```

## 2. Brief (`00_brief.md`, plantilla ya copiada)
Usá el subagente `productor`. Completá desde el material del usuario y preguntá lo que falte, en UNA tanda:
- Objetivo de negocio y de comunicación (saber / creer / hacer).
- Audiencia primaria con nivel técnico 1-5 y contexto de visionado (¿con sonido?).
- **Mensaje único en una oración** (si no se puede escribir, el proyecto no está listo).
- Hasta 3 pruebas → cada una será un claim con fuente.
- CTA exacto (URL/handle), formatos y plataformas, duración objetivo, fecha, presupuesto, aprobador final con nombre, rondas de revisión incluidas.
- Restricciones: legales y de marca.
- **Confidencialidad y procesamiento (§11b del brief), ANTES de cargar material del cliente:** clasificación del material; que todo lo que se abre en Claude Code viaja a Anthropic (plan comercial, DPA, ZDR si aplica, consentimiento escrito del cliente); qué proveedores recibirían texto o assets (TTS, música/imagen IA, transcripción externa); si el investigador puede buscar en la web con términos del cliente o solo usar fuentes entregadas. Sin esa sección firmada, trabajá solo con material público.

## 3. Investigación (`research/`)
Usá el subagente `investigador`: `research/digest.md`, `research/claims.csv` (cada número con fuente y estado; el SME firma `verificado_por`), `research/glosario.md`. Respetá lo que diga §11b del brief sobre búsquedas web.

## 4. Salida
Resumí: mensaje único, audiencia, formatos, duración, claims OK vs dudosos, preguntas abiertas, y el próximo gate (G2-G3 con `/guion`). Marcá G0/G1 en el README del proyecto solo cuando el humano apruebe. Registrá las horas de la fase en `review/HORAS.csv`.
