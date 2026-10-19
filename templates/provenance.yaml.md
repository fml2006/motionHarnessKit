# Ledger de procedencia de assets — [PROYECTO]

> **No es asesoramiento legal.** Las políticas de abajo son las del kit (más estrictas que el mínimo de las plataformas); validalas con Legal para cada cliente y jurisdicción.
>
> Registro obligatorio de todo asset que entra al proyecto (música, SFX, voz, imágenes, footage, logos de terceros, datos). Sin registro, el asset no se publica. Fuente: `docs/research/07-critica-legal-riesgos.md` §6.3.
>
> **Política de divulgación de la marca** (`brands/<marca>/brand.config.json` → `legal.requireDisclosureFor`): se divulga **siempre** que haya voz sintética (TTS o clon, aunque sea genérica), personas o lugares realistas generados, o imágenes de producto simuladas. Es más estricta que el mínimo de YouTube/Meta/TikTok (que solo exigen el toggle para contenido realista): en plataforma se activa el toggle cuando aplica, y el texto `legal.aiDisclosure` va en la descripción o en el end card en todos los casos de la lista.
>
> **C2PA:** se firma cada `*_DELIVERY.mp4` (y el master si se archiva firmado). El re-encode a H.264 elimina el manifiesto del master, así que firmar solo el master no alcanza.

El bloque YAML es válido (una clave por línea): copialo a `PROVENANCE.md` del proyecto y completá los `<...>`.

```yaml
proyecto: "2026-11-launch-feature-x"
nivel_riesgo: N2                     # N1 interno · N2 público/marca · N3 cliente, pauta paga, personas reales o voz clonada
modelo:
  id: "<modelo usado en Claude Code>"
  plan: enterprise                   # team-premium | enterprise | api-commercial (nunca Pro/Max para clientes)
  dpa: true
  zdr: false
  fecha_uso: 2026-10-19
framework:
  nombre: hyperframes
  version: 0.8.174
  lockfile_sha256: "<sha256 de package-lock.json>"
  ffmpeg: "<ffmpeg -version | head -1>"
  chrome: "<versión del navegador de render (npx hyperframes doctor)>"
skills:
  - nombre: hyperframes-core
    hash: "66fc3e623a910923"
    fuente: heygen-com/hyperframes@cea0bad7931122bd93680006978c0d9007daa3d4
    parche_local: "MHK patch (scripts/patch-hf-skills.mjs)"
aporte_humano:
  - guion
  - storyboard
  - seleccion y arreglo de escenas
  - ajuste de timing
  - color final
assets:
  - id: bgm_001
    tipo: musica
    origen: libreria_licenciada      # humano | ia | stock | tercero | captura | libreria_licenciada
    proveedor: "<nombre>"
    licencia: "<tipo>"
    licencia_url: "<url>"
    archivo_licencia: licenses/bgm_001.pdf
    restricciones:
      canales: [youtube, linkedin, paid]
      territorios: [mundial]
      vence: 2027-12-31
    atribucion_requerida: false
    content_id_whitelist: "<si aplica>"
  - id: logo_aws
    tipo: logo_tercero
    origen: tercero
    justificacion_uso_nominativo: "integracion mencionada; logo secundario; sin aval implicito"
    aprobado_por: "legal@<dominio>"
  - id: vo_main
    tipo: voz
    origen: ia_tts                   # locutor | ia_tts | ia_clon
    proveedor: "<nombre>"
    voz: "generica_no_clonada"
    licencia_comercial: "<plan / términos del proveedor>"
    consentimiento: null             # ruta al contrato si es locutor o clon (obligatorio en clon)
    divulgacion:
      requerida: true                # política de la marca: TODA voz sintética se divulga
      texto: "Este video incluye elementos generados o asistidos por IA."
      donde: [descripcion, end_card]
      youtube_toggle: false          # true solo si la voz imita a una persona real o el contenido es realista
datos_mostrados:
  - grafico: s04-dato
    claim: C-004
    fuente: research/data/q3-metrics.csv
    verificado_por: "sme@<dominio>"
c2pa:
  firmado: true
  archivos: ["delivery/<slug>_<fmt>_v###_DELIVERY.mp4"]
  herramienta: "<c2patool u otra + versión>"
firmas:
  creativo: "<nombre>"
  sme: "<nombre>"
  legal: "<nombre>"
  fecha: "<AAAA-MM-DD>"
```
