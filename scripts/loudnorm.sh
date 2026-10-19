#!/usr/bin/env bash
# loudnorm: normaliza el audio de un archivo EXTERNO (un WAV de VO o música, o un video que llegó de afuera)
# a -14 LUFS integrados / -1 dBTP en dos pasadas (EBU R128 / BS.1770).
#   bash scripts/loudnorm.sh entrada.(wav|mp4|mov) [salida] [I=-14] [TP=-1]
# NO es parte de la entrega de un proyecto: `npm run deliver` normaliza la mezcla PCM dentro del master
# (una sola codificación con pérdida). Usalo para preparar stems o revisar material de terceros.
# WAV → WAV PCM 24 bit. Video → el video se copia sin recomprimir y el audio se re-codifica a AAC 384k 48 kHz
# (si la entrada ya era AAC, eso es una segunda codificación con pérdida: evitalo en entregables).
set -euo pipefail
IN="${1:?Uso: bash scripts/loudnorm.sh entrada.mp4 [salida.mp4] [I] [TP]}"
OUT="${2:-${IN%.*}_norm.${IN##*.}}"
I="${3:--14}"
TP="${4:--1}"
LRA=11

echo "▶ Pasada 1: midiendo ${IN}"
STATS=$(ffmpeg -hide_banner -nostats -i "$IN" -af "loudnorm=I=${I}:TP=${TP}:LRA=${LRA}:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { echo "$STATS" | sed -n "s/.*\"$1\" : \"\(.*\)\".*/\1/p"; }
MI=$(get input_i); MTP=$(get input_tp); MLRA=$(get input_lra); MTH=$(get input_thresh); OFF=$(get target_offset)
echo "  medido: I=${MI} LUFS · TP=${MTP} dBTP · LRA=${MLRA}"

echo "▶ Pasada 2: aplicando objetivo I=${I} TP=${TP}"
FILTER="loudnorm=I=${I}:TP=${TP}:LRA=${LRA}:measured_I=${MI}:measured_TP=${MTP}:measured_LRA=${MLRA}:measured_thresh=${MTH}:offset=${OFF}:linear=true"
case "${IN,,}" in
  *.wav) ffmpeg -hide_banner -y -i "$IN" -af "$FILTER" -ar 48000 -c:a pcm_s24le "$OUT" ;;
  *) ffmpeg -hide_banner -y -i "$IN" -map 0 -c:v copy -af "$FILTER" -ar 48000 -c:a aac -b:a 384k -movflags +faststart "$OUT" ;;
esac
echo "▶ Verificación"
ffmpeg -hide_banner -nostats -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | sed -n '/Summary:/,$p' | grep -E "I:|Peak:" || true
echo "✓ ${OUT}"
