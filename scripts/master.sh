#!/usr/bin/env bash
# master: genera el paquete de entrega desde un render aprobado (picture lock).
#   bash scripts/master.sh <render.mp4|render.mov> <carpeta-delivery> [youtube|vertical]
# Produce: master de archivo ProRes 422 HQ + entregable H.264 BT.709 faststart + reporte de specs.
set -euo pipefail
IN="${1:?Uso: bash scripts/master.sh <render> <carpeta-delivery> [youtube|vertical]}"
DST="${2:?Indicá la carpeta de delivery}"
KIND="${3:-youtube}"
mkdir -p "$DST"
BASE=$(basename "${IN%.*}")
FPS=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$IN" | awk -F/ '{ printf "%d", ($2 ? $1/$2 : $1) + 0.5 }')
GOP=$(( FPS / 2 ))
HAS_AUDIO=$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$IN" | head -1)

echo "▶ Master de archivo ProRes 422 HQ (10 bit)"
if [ -n "$HAS_AUDIO" ]; then AUD=(-c:a pcm_s24le -ar 48000); else AUD=(-an); fi
ffmpeg -hide_banner -y -i "$IN" -c:v prores_ks -profile:v 3 -vendor apl0 -pix_fmt yuv422p10le "${AUD[@]}" "$DST/${BASE}_MASTER_422HQ.mov"

echo "▶ Entregable H.264 (${KIND}) · ${FPS} fps · GOP ${GOP} · BT.709 · faststart"
if [ "$KIND" = "vertical" ]; then MAXR=10M; else MAXR=12M; fi
if [ -n "$HAS_AUDIO" ]; then AUD=(-c:a aac -b:a 384k -ar 48000); else AUD=(-an); fi
ffmpeg -hide_banner -y -i "$IN" -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -crf 16 -maxrate "$MAXR" -bufsize 24M \
  -g "$GOP" -bf 2 -color_primaries bt709 -color_trc bt709 -colorspace bt709 "${AUD[@]}" -movflags +faststart "$DST/${BASE}_DELIVERY.mp4"

ffprobe -v error -show_entries stream=codec_name,profile,width,height,r_frame_rate,pix_fmt,color_primaries,sample_rate,channels -of compact "$DST/${BASE}_DELIVERY.mp4" > "$DST/${BASE}_specs.txt"
echo "✓ Entrega en ${DST}/ (master + delivery + specs). Corré: node scripts/qa.mjs ${DST}/${BASE}_DELIVERY.mp4"
