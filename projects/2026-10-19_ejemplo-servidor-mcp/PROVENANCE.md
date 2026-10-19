# Ledger de procedencia de assets — [PROYECTO]

> Registro obligatorio de todo asset que entra al proyecto (música, SFX, voz, imágenes, footage, logos de terceros, datos). Sin registro, el asset no se publica. Fuente: research/07 §6.3.

```yaml
proyecto: "2026-11-launch-feature-x"
nivel_riesgo: N2
modelo: { id: claude-opus-5-5, plan: enterprise, fecha_uso: 2026-10-19 }
framework: { nombre: hyperframes, version: 0.8.174, lockfile_sha256: "<hash>" }
skills: [{ nombre: hyperframes-core, hash: "66fc3e623a910923", fuente: heygen-com/hyperframes }]
aporte_humano: ["guion", "storyboard", "seleccion y arreglo de escenas", "ajuste de timing", "color final"]
assets:
  - id: bgm_001
    tipo: musica
    origen: libreria_licenciada   # humano | ia | stock | tercero | captura
    proveedor: "<nombre>"
    licencia: "<tipo>", licencia_url: "<url>", archivo_licencia: licenses/bgm_001.pdf
    restricciones: { canales: [youtube, linkedin, paid], territorios: [mundial], vence: 2027-12-31 }
    atribucion_requerida: false
    content_id_whitelist: "<si aplica>"
  - id: logo_aws
    tipo: logo_tercero
    origen: tercero
    justificacion_uso_nominativo: "integracion mencionada; logo secundario; sin aval implicito"
    aprobado_por: legal@...
  - id: vo_main
    tipo: voz
    origen: ia_tts
    proveedor: "<nombre>", voz: "generica_no_clonada"
    consentimiento: null          # o ruta al contrato si es clon
    divulgacion: { youtube_toggle: false, motivo: "voz generica no realista de persona real" }
datos_mostrados: [{ grafico: escena_3, fuente: data/q3-metrics.csv, verificado_por: sme@... }]
c2pa: { firmado: true, herramienta: "<c2patool/otra + version>" }
firmas: { creativo: "...", sme: "...", legal: "...", fecha: "..." }
```

