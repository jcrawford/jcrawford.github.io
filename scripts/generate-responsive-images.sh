#!/bin/bash
# Generate responsive image variants for featured images
# Creates mobile (480w), tablet (768w), and desktop (1200w) variants
# Also converts to WebP for smaller file sizes

set -e

IMAGE_DIR="/home/jcrawford/Projects/jcrawford.github.io/static/images/content"
SIZES=(480 768 1200 1920)

find "$IMAGE_DIR" -type f \( -name '*.jpg' -o -name '*.png' -o -name '*.jpeg' \) | while read -r img; do
  # Skip if already has a size suffix (already processed)
  if echo "$img" | grep -qP '_\d+w\.'; then
    continue
  fi

  dir=$(dirname "$img")
  base=$(basename "$img")
  ext="${base##*.}"
  name="${base%.*}"

  for size in "${SIZES[@]}"; do
    out_jpg="${dir}/${name}_${size}w.jpg"
    out_webp="${dir}/${name}_${size}w.webp"

    # Skip if already exists and is newer than source
    if [ -f "$out_webp" ] && [ "$out_webp" -nt "$img" ]; then
      continue
    fi

    # Generate WebP (much smaller, supported by all modern browsers)
    convert "$img" -resize "${size}x" -quality 80 "$out_webp" 2>/dev/null || true

    # Generate JPG fallback
    convert "$img" -resize "${size}x" -quality 80 "$out_jpg" 2>/dev/null || true
  done
done

echo "Done generating responsive images"