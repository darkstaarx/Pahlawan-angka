#!/usr/bin/env sh
set -eu
files="
assets/heroes/wira/frames/attack-pulse-v2.webp
assets/heroes/bunga/frames/attack-sweep-v2.webp
assets/heroes/bunga/frames/attack-spiral-v2.webp
assets/heroes/bunga/frames/attack-thorn-v2.webp
"
for file in $files; do
  canvas_h=$(identify -format '%h' "$file")
  trim=$(convert "$file" -trim -format '%h %Y' info:)
  trim_h=$(printf '%s' "$trim" | awk '{print $1}')
  trim_y=$(printf '%s' "$trim" | awk '{print $2}')
  bottom=$((canvas_h-trim_y-trim_h))
  if [ "$bottom" -ne 0 ]; then
    echo "FAIL: $file has transparent space below the visible sprite"
    exit 1
  fi
done
echo "PASS: attack assets share a zero-offset floor baseline"
