#!/bin/bash
# Generate responsive image variants for featured images
# Creates all variants: 64w, 80w, 160w, 280w, 320w, 400w, 600w, 768w, 850w, 1200w, 1920w
# Also converts to WebP for smaller file sizes

set -e

IMAGE_DIR="/home/jcrawford/Projects/jcrawford.github.io/static/images/content"
SIZES=(64 80 160 280 320 400 600 768 850 1200 1920)

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

# Copy generated variants to public directory (Gatsby dev server serves from public/)
echo "Copying variants to public/..."
find "$IMAGE_DIR" -type d | while read -r dir; do
  rel_path="${dir#$IMAGE_DIR/}"
  target_dir="/home/jcrawford/Projects/jcrawford.github.io/public/images/content/$rel_path"
  mkdir -p "$target_dir"
  cp "$dir"/*_64w.jpg "$target_dir/" 2>/dev/null || true
  cp "$dir"/*_80w.jpg "$target_dir/" 2>/dev/null || true
  cp "$dir"/*_160w.jpg "$target_dir/" 2>/dev/null || true
  cp "$dir"/*_280w.jpg "$target_dir/" 2>/dev/null || true
  cp "$dir"/*_320w.jpg "$target_dir/" 2>/dev/null || true
  cp "$dir"/*_400w.jpg "$target_dir/" 2>/dev/null || true
  cp "$dir"/*_600w.jpg "$target_dir/" 2>/dev/null || true
  cp "$dir"/*_768w.jpg "$target_dir/" 2>/dev/null || true
  cp "$dir"/*_850w.jpg "$target_dir/" 2>/dev/null || true
  cp "$dir"/*_1200w.jpg "$target_dir/" 2>/dev/null || true
  cp "$dir"/*_1920w.jpg "$target_dir/" 2>/dev/null || true
  cp "$dir"/*.webp "$target_dir/" 2>/dev/null || true
done

echo "Done generating responsive images"