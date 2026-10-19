#!/usr/bin/env bash
# master: genera ARCHIVE + DELIVERY desde un intermedio SIN compresión con pérdida (lo llama `npm run deliver`).
#   bash scripts/master.sh <intermedio.mov> <carpeta-delivery> [--audio mezcla.wav] [--name base]
#                          [--lufs -14] [--tp -1] [--delivery-only] [--suffix _L16]
#
# Entrada esperada: el MOV ProRes 4444 de `npm run render -- <p> --master` y la mezcla PCM (WAV) que arma deliver.
# Nunca le pases un MP4/H.264: el master saldría de un archivo comprimido (el script lo rechaza).
#
# Pasos:
#   1. Loudness en dos pasadas (EBU R128 / BS.1770) sobre la mezcla PCM → WAV normalizado 48 kHz / 24 bit:
#      mide y aplica ganancia lineal; si esa ganancia pasaría el true peak, cae a loudnorm dinámico y avisa.
#      El true peak se apunta 0,5 dB por debajo del objetivo: el encode AAC puede subir picos.
#   2. ARCHIVE: ProRes 422 HQ 10 bit + PCM 24 bit (salvo --delivery-only).
#   3. DELIVERY: H.264 High BT.709 · GOP = fps/2 · faststart · AAC 384k 48 kHz.
#   4. Re-mide loudness y true peak de los archivos de salida: sale con código 1 si no cumplen.
set -euo pipefail

IN="${1:?Uso: bash scripts/master.sh <intermedio.mov> <carpeta-delivery> [--audio mezcla.wav] [--name base] [--lufs -14] [--tp -1]}"
DST="${2:?Indicá la carpeta de delivery}"
shift 2
AUDIO=""; NAME=""; I=-14; TP=-1; DELIVERY_ONLY=0; SUFFIX=""; TOL=1
while [ $# -gt 0 ]; do
  case "$1" in
    --audio) AUDIO="$2"; shift 2 ;;
    --name) NAME="$2"; shift 2 ;;
    --lufs) I="$2"; shift 2 ;;
    --tp) TP="$2"; shift 2 ;;
    --tolerance) TOL="$2"; shift 2 ;;
    --suffix) SUFFIX="$2"; shift 2 ;;
    --delivery-only) DELIVERY_ONLY=1; shift ;;
    *) echo "✗ Opción desconocida: $1" >&2; exit 2 ;;
  esac
done

mkdir -p "$DST"
BASE="${NAME:-$(basename "${IN%.*}")}"
VCODEC=$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 "$IN")
case "$VCODEC" in
  prores|png|qtrle|ffv1|rawvideo|v210) ;;
  *) echo "✗ El intermedio es ${VCODEC}: el master no se genera desde un archivo comprimido con pérdida. Usá: npm run deliver -- <proyecto>" >&2; exit 1 ;;
esac
FPS=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$IN" | awk -F/ '{ printf "%d", ($2 ? $1/$2 : $1) + 0.5 }')
GOP=$(( FPS / 2 ))
HEIGHT=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of csv=p=0 "$IN")
WIDTH=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$IN")
if [ "$HEIGHT" -gt "$WIDTH" ]; then MAXR=10M; else MAXR=12M; fi

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

# --- 1) audio -------------------------------------------------------------------------------------------
SRC_A=""
if [ -n "$AUDIO" ]; then
  SRC_A="$AUDIO"
else
  ACODEC=$(ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of csv=p=0 "$IN" | head -1)
  if [ -n "$ACODEC" ]; then
    SRC_A="$IN"
    case "$ACODEC" in pcm_*) ;; *) echo "⚠ Audio del intermedio en ${ACODEC} (con pérdida): pasá --audio con la mezcla PCM para evitar doble codificación." ;; esac
  fi
fi

NORM=""
LOUD_NOTE="sin audio"
if [ -n "$SRC_A" ]; then
  TPI=$(awk -v t="$TP" 'BEGIN { printf "%.1f", t - 0.5 }')
  echo "▶ Loudness pasada 1 (objetivo ${I} LUFS · true peak ${TP} dBTP, interno ${TPI})"
  STATS=$(ffmpeg -hide_banner -nostats -i "$SRC_A" -map 0:a:0 -af "loudnorm=I=${I}:TP=${TPI}:LRA=11:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
  get() { echo "$1" | sed -n "s/.*\"$2\" : \"\(.*\)\".*/\1/p"; }
  MI=$(get "$STATS" input_i); MTP=$(get "$STATS" input_tp); MLRA=$(get "$STATS" input_lra); MTH=$(get "$STATS" input_thresh); OFF=$(get "$STATS" target_offset)
  echo "  medido: I=${MI} LUFS · TP=${MTP} dBTP · LRA=${MLRA} LU"
  NORM="$TMP/norm.wav"
  if [ "$MI" = "-inf" ] || [ -z "$MI" ]; then
    echo "⚠ La mezcla es silencio: no se normaliza."
    ffmpeg -hide_banner -loglevel error -y -i "$SRC_A" -map 0:a:0 -ar 48000 -ac 2 -c:a pcm_s24le "$NORM"
    LOUD_NOTE="silencio (sin normalizar)"
  else
    GAIN=$(awk -v t="$I" -v m="$MI" 'BEGIN { printf "%.2f", t - m }')
    FITS=$(awk -v p="$MTP" -v g="$GAIN" -v tp="$TPI" 'BEGIN { print (p + g <= tp) ? 1 : 0 }')
    if [ "$FITS" = "1" ]; then
      # ganancia lineal pura: no toca la dinámica de la mezcla (es lo que hace loudnorm linear, sin sus casos borde)
      echo "▶ Loudness pasada 2: ganancia lineal ${GAIN} dB"
      ffmpeg -hide_banner -loglevel error -y -i "$SRC_A" -map 0:a:0 -af "volume=${GAIN}dB" -ar 48000 -c:a pcm_s24le "$NORM"
      LOUD_NOTE="normalizado de ${MI} LUFS / ${MTP} dBTP con ganancia lineal ${GAIN} dB"
    else
      echo "⚠ Subir ${GAIN} dB llevaría el true peak a $(awk -v p="$MTP" -v g="$GAIN" 'BEGIN { printf "%.1f", p + g }') dBTP: se usa loudnorm dinámico (comprime). Mejor: limitador en la sesión de audio y volver a correr."
      echo "▶ Loudness pasada 2: loudnorm dinámico"
      ffmpeg -hide_banner -nostats -y -i "$SRC_A" -map 0:a:0 \
        -af "loudnorm=I=${I}:TP=${TPI}:LRA=11:measured_I=${MI}:measured_TP=${MTP}:measured_LRA=${MLRA}:measured_thresh=${MTH}:offset=${OFF}:linear=true" \
        -ar 48000 -c:a pcm_s24le "$NORM" 2>/dev/null
      LOUD_NOTE="normalizado de ${MI} LUFS / ${MTP} dBTP con loudnorm dinámico (revisar mezcla)"
    fi
  fi
fi

# --- 2) ARCHIVE -----------------------------------------------------------------------------------------
ARCH="$DST/${BASE}_ARCHIVE.mov"
if [ "$DELIVERY_ONLY" -eq 0 ]; then
  echo "▶ ARCHIVE ProRes 422 HQ 10 bit${NORM:+ + PCM 24 bit}"
  if [ -n "$NORM" ]; then AMAP=(-i "$NORM" -map 0:v:0 -map 1:a:0 -c:a pcm_s24le -ar 48000); else AMAP=(-map 0:v:0 -an); fi
  ffmpeg -hide_banner -loglevel error -y -i "$IN" "${AMAP[@]}" -c:v prores_ks -profile:v 3 -vendor apl0 -pix_fmt yuv422p10le \
    -color_primaries bt709 -color_trc bt709 -colorspace bt709 "$ARCH"
fi

# --- 3) DELIVERY ----------------------------------------------------------------------------------------
DLV="$DST/${BASE}_DELIVERY${SUFFIX}.mp4"
echo "▶ DELIVERY H.264 · ${WIDTH}×${HEIGHT} · ${FPS} fps · GOP ${GOP} · BT.709 · faststart · maxrate ${MAXR}"
if [ -n "$NORM" ]; then AMAP=(-i "$NORM" -map 0:v:0 -map 1:a:0 -c:a aac -b:a 384k -ar 48000); else AMAP=(-map 0:v:0 -an); fi
ffmpeg -hide_banner -loglevel error -y -i "$IN" "${AMAP[@]}" -vf "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p" \
  -c:v libx264 -preset slow -profile:v high -crf 16 -maxrate "$MAXR" -bufsize 24M -g "$GOP" -bf 2 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv -movflags +faststart "$DLV"

# --- 4) re-medición sobre las salidas -------------------------------------------------------------------
measure() {
  ffmpeg -hide_banner -nostats -i "$1" -af ebur128=peak=true -f null - 2>&1 | awk '/Summary:/{s=1} s&&/I:/{i=$2} s&&/Peak:/{p=$2} END{print i" "p}'
}
FAIL=0
SPECS="$DST/${BASE}${SUFFIX}_specs.txt"
{
  echo "# ${BASE}${SUFFIX} — specs de entrega ($(date -u +%Y-%m-%dT%H:%MZ))"
  echo "intermedio: $(basename "$IN") (${VCODEC})"
  echo "audio: ${LOUD_NOTE}"
  echo "objetivo: ${I} LUFS ±${TOL} · true peak ≤ ${TP} dBTP"
  echo "ffmpeg: $(ffmpeg -hide_banner -version | head -1 | awk '{print $3}')"
} > "$SPECS"
for F in $([ "$DELIVERY_ONLY" -eq 0 ] && echo "$ARCH") "$DLV"; do
  ffprobe -v error -show_entries stream=codec_name,profile,width,height,r_frame_rate,pix_fmt,color_primaries,sample_rate,channels,sample_fmt,bits_per_raw_sample -of compact "$F" | sed "s|^|$(basename "$F") |" >> "$SPECS"
  if [ -n "$NORM" ] && [ "$LOUD_NOTE" != "silencio (sin normalizar)" ]; then
    read -r MI2 MTP2 <<< "$(measure "$F")"
    OK=$(awk -v i="$MI2" -v p="$MTP2" -v t="$I" -v tp="$TP" -v tol="$TOL" 'BEGIN { d = i - t; if (d < 0) d = -d; print (d <= tol && p <= tp) ? "ok" : "fail" }')
    echo "$(basename "$F") loudness: ${MI2} LUFS · true peak ${MTP2} dBTP → ${OK}" | tee -a "$SPECS"
    [ "$OK" = "ok" ] || FAIL=1
  fi
done

if [ "$FAIL" -ne 0 ]; then
  echo "✗ Loudness fuera de especificación en la salida (ver ${SPECS})." >&2
  exit 1
fi
echo "✓ ${DST}/: $([ "$DELIVERY_ONLY" -eq 0 ] && echo "$(basename "$ARCH") + ")$(basename "$DLV") + $(basename "$SPECS")"
