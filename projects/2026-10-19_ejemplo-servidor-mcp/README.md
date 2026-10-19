# Qué es un servidor MCP

Tipo: **explainer** · Formatos: landscape, portrait · Creado: 2026-10-19 · Marca: TuMarca v1.0.0

## Estado del pipeline (marcar al aprobar cada gate)

- [ ] G0 Brief firmado → `00_brief.md`
- [ ] G1 Investigación y claims → `research/` (claims.csv con fuente por cada número)
- [ ] G3 Guion a dos columnas aprobado → `01_guion.md`
- [ ] G4 Styleframes aprobados → `review/frames-*/` (npm run frames)
- [ ] G5 Storyboard = spec ejecutable → `02_storyboard.md` + `scenes.json`
- [ ] G6 Animatic aprobado (render draft + VO scratch)
- [ ] G7 Build v01 (npm run render) + QA automático sin FAIL
- [ ] G8 Revisión R1 / R2 → `review/R*.md` + `review/CHANGELOG.md`
- [ ] G9 Picture lock
- [ ] G10 Mezcla a −14 LUFS / −1 dBTP (npm run loudnorm)
- [ ] G11 Captions revisados por humano
- [ ] G12-G13 Master + versiones (scripts/master.sh)
- [ ] G14 QA final + checklist legal → `qa/`
- [ ] G15 Entrega + archivo (tag de versión del proyecto)

## Comandos

```bash
npm run build:roots -- 2026-10-19_ejemplo-servidor-mcp     # scenes.json → comp/ + formats/
npm run frames -- 2026-10-19_ejemplo-servidor-mcp          # un frame clave por escena (styleframes / review)
npm run render -- 2026-10-19_ejemplo-servidor-mcp --quality draft   # animatic / revisión
npm run render -- 2026-10-19_ejemplo-servidor-mcp --quality high    # final
npm run qa -- 2026-10-19_ejemplo-servidor-mcp
cd projects/2026-10-19_ejemplo-servidor-mcp/comp && npx hyperframes preview   # Studio para ajustes finos
```
