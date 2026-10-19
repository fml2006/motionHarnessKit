---
name: revisar
description: Gate G8. Ronda de revisión - crítica adversarial (anti-slop 28 puntos + QA técnico + claims + legal), consolidación de feedback humano, traducción de adjetivos a cambios con tokens, changelog y nueva versión. Usar cuando llega feedback ("el cliente dice que...", "ronda 2") o antes de mandar cualquier versión.
---

# /revisar — feedback accionable y trazable

## 1. Crítica propia (antes de mostrar nada)
Subagente `qa-director` sobre el último render: veredicto + bloqueantes con timecode. Bloqueantes se corrigen antes de enviar.

## 2. Consolidar feedback humano en `review/R<n>.md` (plantilla `templates/review-feedback.md`)
Cada nota: **timecode · qué · por qué · referencia · prioridad · quién lo pidió**. Si llega vago ("más dinámico", "se ve barato"), traducilo con la sección 2 ("Traducción de feedback vago a dirección concreta") de `templates/anti-slop-review.md` y confirmá la traducción con quien lo pidió si cambia el alcance. Notas contradictorias → las resuelve el productor/aprobador único, no vos.

Detectá change orders: cambios de guion, orden o mensaje después del animatic.

## 3. Aplicar
Subagente `motion-designer`, una nota por vez, con el loop de calidad (lint → check → frames → qa-director). No toques escenas con lock salvo pedido explícito.

## 4. Versionar
```bash
npm run render -- <p> --quality draft
```
Anotá en `review/CHANGELOG.md` **bajo la versión nueva** (`_v###` que acaba de escribir el render): qué notas se resolvieron (ids de R<n>), cuáles no y por qué. Cuando esa versión se envía al cliente, agregá la equivalencia con la versión al cliente y el tag (`v007 = RVW v02 · rvw-v02`), según `templates/naming-convention.md` §1.1. Registrá las horas de la ronda en `review/HORAS.csv`.

## 5. Salida
Versión nueva + tabla nota→estado + reporte de QA. Al llegar al límite de rondas del brief, avisá al productor.
