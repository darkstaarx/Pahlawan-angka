#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CANVAS=1254
FILES=(
  "assets/heroes/bunga/frames/attack-stance-aura-v4.webp"
  "assets/heroes/bunga/frames/attack-movement-portal-v4.webp"
  "assets/heroes/bunga/frames/attack-addition-v4.webp"
  "assets/heroes/bunga/frames/attack-subtraction-v4.webp"
  "assets/heroes/bunga/frames/attack-division-v4.webp"
)

command -v identify >/dev/null || { echo "FAIL: ImageMagick identify is required"; exit 1; }

for relative in "${FILES[@]}"; do
  file="$ROOT/$relative"
  [[ -f "$file" ]] || { echo "FAIL: missing $relative"; exit 1; }

  dimensions="$(identify -format '%wx%h' "$file")"
  [[ "$dimensions" == "${CANVAS}x${CANVAS}" ]] || {
    echo "FAIL: $relative is $dimensions, expected ${CANVAS}x${CANVAS}"
    exit 1
  }

  bbox="$(identify -format '%[bounding-box]' "$file" | xargs)"
  [[ "$bbox" =~ ^([0-9]+),([0-9]+)[[:space:]]*([0-9]+),([0-9]+)$ ]] || {
    echo "FAIL: cannot parse alpha bounding box for $relative: $bbox"
    exit 1
  }
  bottom="${BASH_REMATCH[4]}"
  [[ "$bottom" -eq "$CANVAS" ]] || {
    echo "FAIL: $relative has $((CANVAS - bottom))px transparent floor gap"
    exit 1
  }
  echo "PASS: $relative floor gap 0px"
done

echo "PASS: all Bunga portal frames share the 1254px floor baseline"
