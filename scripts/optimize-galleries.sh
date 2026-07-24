#!/bin/bash
# Gallery-specific optimization script
# Compresses gallery images and creates proper thumbnails

set -e

STATIC_DIR="${1:-./static/images/galleries}"
JPG_QUALITY=75
WEBP_QUALITY=75
THUMB_MAX=320

if [[ ! -d "$STATIC_DIR" ]]; then
    echo "Error: Directory not found: $STATIC_DIR"
    exit 1
fi

echo "=== Gallery Image Optimization ==="
echo "Target: $STATIC_DIR"
echo "JPG Quality: $JPG_QUALITY"
echo "WebP Quality: $WEBP_QUALITY"
echo ""

# Track stats
total_original=0
total_optimized=0
files_processed=0

# Function to optimize a single gallery image
optimize_gallery_image() {
    local src="$1"
    local filename=$(basename "$src")
    local dir=$(dirname "$src")
    local base="${filename%.*}"
    local ext="${filename##*.}"
    local ext_lower=$(echo "$ext" | tr '[:upper:]' '[:lower:]')

    # Skip non-image files
    if [[ ! "$ext_lower" =~ ^(jpg|jpeg|png|webp)$ ]]; then
        return 0
    fi

    # Skip already optimized thumbnails
    if [[ "$base" =~ _thumb$ ]] || [[ "$base" =~ _thumb_ ]]; then
        return 0
    fi

    # Skip WebP files (we'll generate those from JPGs)
    if [[ "$ext_lower" == "webp" ]]; then
        return 0
    fi

    # Skip responsive variants (we'll optimize the originals and regenerate variants)
    if [[ "$base" =~ _[0-9]+w$ ]]; then
        return 0
    fi

    # Get file size
    local size=$(stat -f%z "$src" 2>/dev/null || stat -c%s "$src" 2>/dev/null || echo "0")
    local size_kb=$((size / 1024))

    if [[ "$size_kb" -lt 100 ]]; then
        # Skip small files
        return 0
    fi

    echo "Processing: $filename (${size_kb}KB)"

    # Get dimensions
    local dims=$(identify -format "%w %h" "$src" 2>/dev/null || echo "0 0")
    local orig_width=$(echo "$dims" | cut -d' ' -f1)
    local orig_height=$(echo "$dims" | cut -d' ' -f2)

    if [[ "$orig_width" -eq 0 ]]; then
        echo "  Warning: Could not read dimensions"
        return 0
    fi

    # Convert PNG to JPG if needed
    local working_src="$src"
    if [[ "$ext_lower" == "png" ]]; then
        local jpg_path="${dir}/${base}.jpg"
        if [[ ! -f "$jpg_path" ]]; then
            echo "  Converting PNG → JPG..."
            convert "$src" -quality $JPG_QUALITY -strip "$jpg_path"
            working_src="$jpg_path"
        fi
    fi

    # Create optimized original (cap at 1920w max)
    local target_width=$orig_width
    if [[ "$orig_width" -gt 1920 ]]; then
        target_width=1920
        local target_height=$((orig_height * 1920 / orig_width))
        echo "  Resizing to ${target_width}x${target_height}..."
        convert "$working_src" -resize "${target_width}x${target_height}>" -quality $JPG_QUALITY -strip "$src.optimized"
        mv "$src.optimized" "$src"
    else
        # Just re-optimize in place
        convert "$working_src" -quality $JPG_QUALITY -strip "$src.optimized"
        mv "$src.optimized" "$src"
    fi

    # Generate responsive variants with proper compression
    echo "  Generating variants..."
    for width in 480 768 1200 1920; do
        if [[ "$orig_width" -le "$width" ]]; then
            continue
        fi

        local height=$((orig_height * width / orig_width))
        local variant_jpg="${dir}/${base}_${width}w.jpg"
        local variant_webp="${dir}/${base}_${width}w.webp"

        # JPG variant
        convert "$src" -resize "${width}x${height}>" -quality $JPG_QUALITY -strip "$variant_jpg"

        # WebP variant (better compression)
        convert "$src" -resize "${width}x${height}>" -quality $WEBP_QUALITY -strip -define webp:method=6 "$variant_webp"
    done

    # Generate thumbnail for grid view
    local thumb_width=$((orig_width > orig_height ? $THUMB_MAX : $((THUMB_MAX * orig_width / orig_height))))
    local thumb_height=$((orig_height > orig_width ? $THUMB_MAX : $((THUMB_MAX * orig_height / orig_width))))
    local thumb_jpg="${dir}/${base}_thumb.jpg"
    local thumb_webp="${dir}/${base}_thumb.webp"

    convert "$src" -resize "${THUMB_MAX}x${THUMB_MAX}>" -quality 70 -strip "$thumb_jpg"
    convert "$src" -resize "${THUMB_MAX}x${THUMB_MAX}>" -quality 70 -strip -define webp:method=6 "$thumb_webp"

    echo "  ✓ Done"
}

export -f optimize_gallery_image
export JPG_QUALITY WEBP_QUALITY THUMB_MAX

# Process all gallery images
find "$STATIC_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) -print0 | \
    xargs -0 -I {} bash -c 'optimize_gallery_image "$@"' _ {}

echo ""
echo "=== Optimization Complete ==="
echo "Gallery images optimized with proper compression"
