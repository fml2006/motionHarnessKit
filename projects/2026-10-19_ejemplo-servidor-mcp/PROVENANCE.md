# Ledger de procedencia de assets — 2026-10-19_ejemplo-servidor-mcp

> Registro de todo lo que entró a la pieza, con licencia. Completado con lo que realmente se usó en los renders v001–v003.
> Estado: **sin firmas** (el ejemplo no pasó por Legal ni por SME). Ver `templates/provenance.yaml.md` para el formato completo.

```yaml
proyecto: "2026-10-19_ejemplo-servidor-mcp"
estado: no_publicable            # claims C-002 y C-004 dudosas; todas PENDIENTE SME
nivel_riesgo: N1                 # pieza interna de ejemplo, sin personas, sin voz, sin logos de terceros
asistencia_ia:
  herramienta: "Claude Code (Anthropic)"
  modelo_id: "<registrar el id exacto del modelo desde la sesión>"
  uso: ["investigación de claims", "guion", "plan de escenas", "composición HTML/GSAP", "QA automático"]
framework:
  - { nombre: hyperframes, version: 0.8.174, licencia: Apache-2.0 }
  - { nombre: gsap, version: 3.14.2, licencia: "Standard 'no charge' license (https://gsap.com/standard-license) — revisar con Legal antes de uso comercial" }
aporte_humano: []                # ninguno registrado: el ejemplo lo armó el agente sin dirección humana firmada
assets:
  - id: font_space_grotesk
    tipo: fuente
    origen: tercero
    proveedor: "@fontsource/space-grotesk 5.3.0 (Google Fonts)"
    licencia: OFL-1.1
    uso: display
  - id: font_inter
    tipo: fuente
    origen: tercero
    proveedor: "@fontsource/inter 5.3.0 (Google Fonts)"
    licencia: OFL-1.1
    uso: texto
  - id: font_jetbrains_mono
    tipo: fuente
    origen: tercero
    proveedor: "@fontsource/jetbrains-mono 5.3.0 (Google Fonts)"
    licencia: OFL-1.1
    uso: código, kickers
  - id: logo_tumarca
    tipo: logo_propio
    origen: generado_por_script
    proveedor: "scripts/placeholder-logo.mjs (marca placeholder del kit)"
    licencia: "propio del kit"
audio: []                        # sin VO, sin música, sin SFX
imagenes_footage: []             # ninguno
logos_terceros: []               # ninguno (MCP y Anthropic se nombran en texto, uso nominativo)
datos_mostrados:
  - { escena: s03-problema, claim: C-002, estado: dudoso, verificado_por: "PENDIENTE SME" }
  - { escena: s04-como,     claim: C-003, estado: ok,     verificado_por: "PENDIENTE SME" }
  - { escena: s05-config,   claim: C-004, estado: dudoso, verificado_por: "PENDIENTE SME" }
  - { escena: s06-origen,   claim: C-001, estado: ok,     verificado_por: "PENDIENTE SME" }
divulgacion_ia: { requerida: false, motivo: "sin voz sintética ni personas/lugares realistas generados; igual se incluye nota en s07-cta" }
c2pa: { firmado: false }
firmas: { creativo: null, sme: null, legal: null, fecha: null }
```
