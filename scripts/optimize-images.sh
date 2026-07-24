#!/bin/bash
# Image optimization script for Gatsby blog
# Run before build to compress oversized images

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
STATIC_DIR="$ROOT_DIR/static/images"

echo "=== Image Optimization Script ==="
echo "Root: $ROOT_DIR"
echo "Static images: $STATIC_DIR"
echo ""

# Configuration
JPG_QUALITY=80
WEBP_QUALITY=80
PNG_QUALITY=85
MAX_WIDTH_GALLERY=1920
MAX_WIDTH_CONTENT=1920

# Function to optimize a single image
optimize_image() {
    local src="$1"
    local is_gallery="$2"
    local filename=$(basename "$src")
    local dir=$(dirname "$src")
    local base="${filename%.*}"
    local ext="${filename##*.}"
    local ext_lower=$(echo "$ext" | tr '[:upper:]' '[:lower:]')

    # Skip already optimized variants
    if [[ "$base" =~ _${MAX_WIDTH_GALLERY}w$ ]] || [[ "$base" =~ _1200w$ ]] || [[ "$base" =~ _768w$ ]] || [[ "$base" =~ _480w$ ]]; then
        return 0
    fi

    # Skip WebP files (already optimized)
    if [[ "$ext_lower" == "webp" ]]; then
        return 0
    fi

    echo "Processing: $src"

    # Get image dimensions
    local dims=$(identify -format "%w %h" "$src" 2>/dev/null || echo "0 0")
    local width=$(echo "$dims" | cut -d' ' -f1)
    local height=$(echo "$dims" | cut -d' ' -f2)

    if [[ "$width" -eq 0 ]]; then
        echo "  Warning: Could not read dimensions for $src"
        return 0
    fi

    # Convert PNGs over 500KB to JPG (huge savings)
    local size=$(stat -f%z "$src" 2>/dev/null || stat -c%s "$src" 2>/dev/null || echo "0")
    local size_kb=$((size / 1024))

    if [[ "$ext_lower" == "png" && "$size_kb" -gt 500 ]]; then
        local jpg_path="${dir}/${base}.jpg"
        echo "  Converting PNG (${size_kb}KB) → JPG..."
        convert "$src" -quality $JPG_QUALITY "$jpg_path"
        local new_size=$(stat -f%z "$jpg_path" 2>/dev/null || stat -c%s "$jpg_path" 2>/dev/null || echo "0")
        local new_size_kb=$((new_size / 1024))
        echo "  Saved: ${size_kb}KB → ${new_size_kb}KB"

        # Also create WebP version
        local webp_path="${dir}/${base}.webp"
        convert "$src" -quality $WEBP_QUALITY -define webp:target-size=300kb "$webp_path" 2>/dev/null || \
            convert "$src" -quality $WEBP_QUALITY "$webp_path"
        echo "  Created WebP: $webp_path"
    fi
}

# Function to regenerate responsive variants
regenerate_variants() {
    local src="$1"
    local filename=$(basename "$src")
    local dir=$(dirname "$src")
    local base="${filename%.*}"
    local ext="${filename##*.}"
    local ext_lower=$(echo "$ext" | tr '[:upper:]' '[:lower:]')

    # Skip variants
    if [[ "$base" =~ _[0-9]+w$ ]]; then
        return 0
    fi

    # Get dimensions
    local dims=$(identify -format "%w %h" "$src" 2>/dev/null || echo "0 0")
    local orig_width=$(echo "$dims" | cut -d' ' -f1)
    local orig_height=$(echo "$dims" | cut -d' ' -f2)

    if [[ "$orig_width" -eq 0 ]]; then
        return 0
    fi

    echo "  Generating variants for: $filename (${orig_width}x${orig_height})"

    # Generate responsive variants
    for width in 480 768 1200 1920; do
        if [[ "$orig_width" -le "$width" ]]; then
            continue
        fi

        local height=$((orig_height * width / orig_width))
        local variant_jpg="${dir}/${base}_${width}w.jpg"
        local variant_webp="${dir}/${base}_${width}w.webp"

        # JPG variant
        if [[ "$ext_lower" == "jpg" || "$ext_lower" == "jpeg" || "$ext_lower" == "png" ]]; then
            convert "$src" -resize "${width}x${height}>" -quality $JPG_QUALITY -strip "$variant_jpg"
        fi

        # WebP variant (from source for best quality)
        convert "$src" -resize "${width}x${height}>" -quality $WEBP_QUALITY -strip "$variant_webp"
    done
}

# Main execution
echo "Phase 1: Optimizing oversized images..."
echo ""

# Find and optimize large PNGs in content
find "$STATIC_DIR/content" -name "*.png" -size +500k | while read -r file; do
    optimize_image "$file" false
done

echo ""
echo "Phase 2: Regenerating responsive variants..."
echo ""

# Regenerate variants for content images
find "$STATIC_DIR/content" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) | while read -r file; do
    regenerate_variants "$file"
done

# Regenerate variants for gallery images (only first 50 to save time, or use --full flag)
if [[ "$1" == "--full" ]]; then
    echo "Full gallery optimization enabled (this will take a while)..."
    find "$STATIC_DIR/galleries" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" \) | while read -r file; do
        regenerate_variants "$file"
    done
else
    echo "Skipping full gallery optimization (use --full to process all galleries)"
    echo "Processing featured galleries only..."
    # Process just the most recent/first gallery album
    find "$STATIC_DIR/galleries" -maxdepth 3 -type f \( -name "*.jpg" -o -name "*.jpeg" \) | head -50 | while read -r file; do
        regenerate_variants "$file"
    done
fi

echo ""
echo "=== Optimization Complete ==="
echo ""
echo "Next steps:"
echo "  1. Review the optimized images"
echo "  2. Run 'npm run build' to test"
echo "  3. Check that variants are being served correctly"
