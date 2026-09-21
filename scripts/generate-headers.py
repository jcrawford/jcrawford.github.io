#!/usr/bin/env python3
"""Generate 3 distinct header images for Total TypeScript Pro Complete review."""

from PIL import Image, ImageDraw, ImageFont
import os

# Ensure output directory exists
output_dir = "/home/jcrawford/Projects/jcrawford.github.io/static/images/content"
os.makedirs(output_dir, exist_ok=True)

# Dimensions
WIDTH, HEIGHT = 1600, 900

# Colors from Total TypeScript branding
TS_BLUE = "#3178c6"
DEEP_PURPLE = "#4a1c7c"
DARK_BG = "#0f0f1a"
LIGHT_TEXT = "#ffffff"
SUBTLE_GRAY = "#6b7280"

def get_font(size):
    """Get a font, falling back to default if needed."""
    try:
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)
    except:
        try:
            return ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", size)
        except:
            return ImageFont.load_default()

def get_mono_font(size):
    """Get a monospace font for code."""
    try:
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", size)
    except:
        try:
            return ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf", size)
        except:
            return ImageFont.load_default()

# Version 1: Clean, modern, minimal
print("Creating Version 1: Clean, modern, minimal...")
img1 = Image.new('RGB', (WIDTH, HEIGHT), DARK_BG)
draw1 = ImageDraw.Draw(img1)

# Subtle code elements in background
mono_font = get_mono_font(14)
code_lines = [
    "interface User { id: string; name: string }",
    "type Result<T> = Success<T> | Error",
    "const transform = <T>(data: T[]): T[] => data.map(x => x)",
    "function generic<T extends Constraint>(arg: T): T { return arg }",
]
for i, line in enumerate(code_lines):
    y = 100 + i * 180
    alpha = int(40 - i * 8)  # Fade effect
    draw1.text((50, y), line, fill=(100, 100, 120, alpha), font=mono_font)

# Gradient overlay at bottom
for y in range(HEIGHT - 200, HEIGHT):
    alpha = (y - (HEIGHT - 200)) / 200
    overlay = Image.new('RGBA', (WIDTH, 1), (15, 15, 26, int(255 * alpha)))
    img1.paste(overlay, (0, y), overlay)

# Main title
title_font = get_font(72)
subtitle_font = get_font(36)
title_text = "Total TypeScript Pro Complete"
subtitle_text = "A Review"

# Center text
title_bbox = draw1.textbbox((0, 0), title_text, font=title_font)
title_width = title_bbox[2] - title_bbox[0]
title_x = (WIDTH - title_width) // 2
title_y = HEIGHT // 2 - 40

# Draw title with subtle shadow
draw1.text((title_x + 3, title_y + 3), title_text, fill=(0, 0, 0, 100), font=title_font)
draw1.text((title_x, title_y), title_text, fill=LIGHT_TEXT, font=title_font)

# TypeScript blue accent line
accent_width = title_width + 40
accent_x = (WIDTH - accent_width) // 2
draw1.rectangle([accent_x, title_y + 90, accent_x + accent_width, title_y + 96], fill=TS_BLUE)

# Subtitle
subtitle_bbox = draw1.textbbox((0, 0), subtitle_text, font=subtitle_font)
subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
subtitle_x = (WIDTH - subtitle_width) // 2
draw1.text((subtitle_x, title_y + 120), subtitle_text, fill=SUBTLE_GRAY, font=subtitle_font)

img1.save(f"{output_dir}/total-typescript-review-v1.jpg", "JPEG", quality=95)
print("  ✓ Saved v1")

# Version 2: Bold and energetic with gradient
print("Creating Version 2: Bold and energetic...")
img2 = Image.new('RGB', (WIDTH, HEIGHT), DEEP_PURPLE)
draw2 = ImageDraw.Draw(img2)

# Create diagonal gradient from purple to TS blue
for x in range(WIDTH):
    ratio = x / WIDTH
    r = int(74 * (1 - ratio) + 49 * ratio)
    g = int(28 * (1 - ratio) + 120 * ratio)
    b = int(124 * (1 - ratio) + 198 * ratio)
    for y in range(HEIGHT):
        img2.putpixel((x, y), (r, g, b))

# Add diagonal arrow/progress element
arrow_points = [
    (WIDTH * 0.1, HEIGHT * 0.8),
    (WIDTH * 0.5, HEIGHT * 0.8),
    (WIDTH * 0.5, HEIGHT * 0.75),
    (WIDTH * 0.7, HEIGHT * 0.75),
    (WIDTH * 0.7, HEIGHT * 0.5),
    (WIDTH * 0.75, HEIGHT * 0.5),
    (WIDTH * 0.75, HEIGHT * 0.2),
    (WIDTH * 0.7, HEIGHT * 0.2),
    (WIDTH * 0.7, HEIGHT * 0.45),
    (WIDTH * 0.5, HEIGHT * 0.45),
    (WIDTH * 0.5, HEIGHT * 0.7),
    (WIDTH * 0.1, HEIGHT * 0.7),
]
draw2.polygon(arrow_points, fill=(255, 255, 255, 30))

# Add glow effect around arrow
for offset in range(1, 4):
    offset_points = [(x + offset, y + offset) for x, y in arrow_points]
    draw2.polygon(offset_points, fill=(255, 255, 255, 15))

# Diagonal light streak
draw2.line([(0, HEIGHT), (WIDTH * 0.4, 0)], fill=(255, 255, 255, 20), width=3)
draw2.line([(WIDTH * 0.3, HEIGHT), (WIDTH * 0.7, 0)], fill=(255, 255, 255, 15), width=2)

# Main title - bold and centered
title_font = get_font(68)
subtitle_font = get_font(32)
title_text = "Total TypeScript Pro Complete"
subtitle_text = "From Beginner to Expert"

# Text with strong contrast
title_bbox = draw2.textbbox((0, 0), title_text, font=title_font)
title_width = title_bbox[2] - title_bbox[0]
title_x = (WIDTH - title_width) // 2
title_y = HEIGHT // 2 - 60

# White text with dark outline for contrast
for dx in [-2, -1, 0, 1, 2]:
    for dy in [-2, -1, 0, 1, 2]:
        if dx != 0 or dy != 0:
            draw2.text((title_x + dx, title_y + dy), title_text, fill=(0, 0, 0, 150), font=title_font)

draw2.text((title_x, title_y), title_text, fill=LIGHT_TEXT, font=title_font)

# Accent underline with gradient feel
accent_width = title_width + 60
accent_x = (WIDTH - accent_width) // 2
draw2.rectangle([accent_x, title_y + 85, accent_x + accent_width, title_y + 92], fill=TS_BLUE)

# Subtitle
subtitle_bbox = draw2.textbbox((0, 0), subtitle_text, font=subtitle_font)
subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
subtitle_x = (WIDTH - subtitle_width) // 2
draw2.text((subtitle_x, title_y + 115), subtitle_text, fill=(200, 220, 255), font=subtitle_font)

# Progress indicators (beginner → expert)
progress_y = HEIGHT - 80
draw2.text((80, progress_y), "BEGINNER", fill=(255, 255, 255, 150), font=get_font(18))
draw2.text((WIDTH - 180, progress_y), "EXPERT", fill=LIGHT_TEXT, font=get_font(18))

# Progress bar
bar_start = 200
bar_end = WIDTH - 200
bar_y = progress_y + 25
draw2.rounded_rectangle([bar_start, bar_y, bar_end, bar_y + 12], radius=6, fill=(255, 255, 255, 50))
# Filled portion (suggesting progress)
fill_width = int((bar_end - bar_start) * 0.65)
draw2.rounded_rectangle([bar_start, bar_y, bar_start + fill_width, bar_y + 12], radius=6, fill=TS_BLUE)

img2.save(f"{output_dir}/total-typescript-review-v2.jpg", "JPEG", quality=95)
print("  ✓ Saved v2")

# Version 3: Professional and techy with code editor feel
print("Creating Version 3: Professional and techy...")
img3 = Image.new('RGB', (WIDTH, HEIGHT), "#1e1e2e")
draw3 = ImageDraw.Draw(img3)

# Code editor window background
editor_bg = "#2a2a3e"
margin = 60
draw3.rounded_rectangle([margin, margin, WIDTH - margin, HEIGHT - margin], radius=12, fill=editor_bg)

# Editor header bar
header_height = 40
draw3.rounded_rectangle([margin, margin, WIDTH - margin, margin + header_height], radius=12, fill="#3a3a4e")

# Window controls (circles)
for i, color in enumerate(["#ff5f56", "#ffbd2e", "#27c93f"]):
    draw3.ellipse([margin + 15 + i * 20, margin + 12, margin + 27 + i * 20, margin + 24], fill=color)

# Line numbers
line_num_font = get_mono_font(16)
for i in range(1, 15):
    draw3.text((margin + 20, margin + 60 + i * 32), f"{i:2d}", fill="#4a4a5e", font=line_num_font)

# Syntax-highlighted code snippets as decoration
code_font = get_mono_font(18)

def draw_code_line(draw, x_start, y_pos, parts):
    """Draw a line of syntax-highlighted code.
    parts is a list of (text, color) tuples.
    """
    x = x_start
    for text, color in parts:
        if text:
            draw.text((x, y_pos), text, fill=color, font=code_font)
            bbox = code_font.getbbox(text)
            x += bbox[2] - bbox[0]

y_offset = margin + 60
x_offset = margin + 60

# Line 1: Comment
draw_code_line(draw3, x_offset, y_offset, [("// Total TypeScript Pro Complete", "#6b7280")])
y_offset += 32

# Line 2: Comment
draw_code_line(draw3, x_offset, y_offset, [("// A comprehensive review", "#6b7280")])
y_offset += 32

# Line 3: Blank
y_offset += 32

# Line 4: type definition
draw_code_line(draw3, x_offset, y_offset, [("type CourseReview =", "#c678dd")])
y_offset += 32

# Line 5: Union type member
draw_code_line(draw3, x_offset, y_offset, [
    ("  | { rating: ", "#e5c07b"),
    ("number", "#61afef"),
    ("; verified: ", "#e5c07b"),
    ("true", "#98c379"),
    (" }", "#e0e0e0")
])
y_offset += 32

# Line 6: Union type member
draw_code_line(draw3, x_offset, y_offset, [
    ("  | { rating: ", "#e5c07b"),
    ("number", "#61afef"),
    ("; completed: ", "#e5c07b"),
    ("boolean", "#98c379"),
    (" }", "#e0e0e0")
])
y_offset += 32

# Line 7: Blank
y_offset += 32

# Line 8: const declaration
draw_code_line(draw3, x_offset, y_offset, [
    ("const review", "#e0e0e0"),
    (": ", "#e0e0e0"),
    ("CourseReview", "#61afef"),
    (" = ", "#e0e0e0"),
    ("{", "#e0e0e0")
])
y_offset += 32

# Line 9: rating property
draw_code_line(draw3, x_offset, y_offset, [
    ("  rating: ", "#e0e0e0"),
    ("5", "#d19a66"),
    (",", "#e0e0e0")
])
y_offset += 32

# Line 10: verified property
draw_code_line(draw3, x_offset, y_offset, [
    ("  verified: ", "#e0e0e0"),
    ("true", "#98c379"),
    (",", "#e0e0e0")
])
y_offset += 32

# Line 11: title property
draw_code_line(draw3, x_offset, y_offset, [
    ("  title: ", "#e0e0e0"),
    ('"Outstanding"', "#98c379"),
    (",", "#e0e0e0")
])
y_offset += 32

# Line 12: closing brace
draw_code_line(draw3, x_offset, y_offset, [("}", "#e0e0e0")])

# Main title as if it's a type definition
title_font = get_font(56)
title_text = "Total TypeScript Pro Complete"
subtitle_font = get_mono_font(28)
subtitle_text = "// A Review"

# Position title prominently
title_bbox = draw3.textbbox((0, 0), title_text, font=title_font)
title_width = title_bbox[2] - title_bbox[0]
title_x = (WIDTH - title_width) // 2
title_y = HEIGHT - 180

# Draw title with code-comment styling
draw3.text((title_x - 10, title_y), "// ", fill="#6b7280", font=subtitle_font)
draw3.text((title_x + 50, title_y), title_text, fill="#61afef", font=title_font)

# Subtitle below
subtitle_bbox = draw3.textbbox((0, 0), "A Comprehensive Review", font=get_font(24))
subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
subtitle_x = (WIDTH - subtitle_width) // 2
draw3.text((subtitle_x, title_y + 65), "A Comprehensive Review", fill="#abb2bf", font=get_font(24))

# Decorative geometric shapes
# Top-right corner accent
draw3.polygon([
    (WIDTH - 150, margin),
    (WIDTH - margin, margin),
    (WIDTH - margin, margin + 100),
], fill=(49, 120, 198, 40))

# Bottom-left corner accent
draw3.polygon([
    (margin, HEIGHT - margin),
    (margin + 120, HEIGHT - margin),
    (margin, HEIGHT - margin - 80),
], fill=(49, 120, 198, 30))

# Small decorative code brackets
bracket_font = get_mono_font(48)
draw3.text((WIDTH - 100, HEIGHT - 120), "}", fill="#4a4a5e", font=bracket_font)
draw3.text((margin + 20, margin + 20), "{", fill="#4a4a5e", font=bracket_font)

img3.save(f"{output_dir}/total-typescript-review-v3.jpg", "JPEG", quality=95)
print("  ✓ Saved v3")

print("\n✅ All three header images generated successfully!")
print(f"Output directory: {output_dir}")
print("  - total-typescript-review-v1.jpg (Clean, modern, minimal)")
print("  - total-typescript-review-v2.jpg (Bold and energetic)")
print("  - total-typescript-review-v3.jpg (Professional and techy)")
