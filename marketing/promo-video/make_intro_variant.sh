#!/usr/bin/env bash
# Varian: promo animasi 10 s (video_promo.mp4) penuh dahulu, kemudian phone showcase.
# Guna: ./make_intro_variant.sh video_promo.mp4 out/promo-90s.mp4 out/promo-intro10-90s.mp4
set -euo pipefail
INTRO="$1"; MAIN="$2"; OUT="$3"; XF=0.4
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$INTRO")
OFF=$(python3 -c "print(round($D-$XF,3))")
ffmpeg -v error -y -i "$INTRO" -i "$MAIN" -filter_complex "\
[0:v]fps=30,scale=1080:1920,setsar=1,format=yuv420p[v0];[1:v]fps=30,setsar=1,format=yuv420p[v1];\
[v0][v1]xfade=transition=fade:duration=$XF:offset=$OFF[v];\
[0:a]aformat=sample_rates=48000:channel_layouts=stereo[a0];[1:a]aformat=sample_rates=48000:channel_layouts=stereo[a1];\
[a0][a1]acrossfade=d=$XF,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]" \
  -map "[v]" -map "[a]" -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "$OUT"
