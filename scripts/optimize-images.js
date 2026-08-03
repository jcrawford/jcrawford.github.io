#!/usr/bin/env node
/**
 * Pre-build image optimization script
 * Runs before Gatsby build to compress and generate responsive variants
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  jpgQuality: 80,
  webpQuality: 80,
  pngToJpgThreshold: 500 * 1024, // 500KB
  maxWidth: 1920,
  // Full responsive set for featured/hero and gallery images
  responsiveVariants: [64, 80, 160, 280, 320, 400, 600, 768, 850, 1200, 1920],
  // Single size for post body / step media
  postMediaWidth: 760,
  postMediaMaxHeight: 600,
};

function isFeaturedImage(imagePath) {
  const base = path.basename(imagePath, path.extname(imagePath)).toLowerCase();
  return base === 'featured' || base === 'hero';
}

function isGalleryImage(imagePath) {
  return imagePath.includes(path.sep + 'galleries' + path.sep);
}

const STATIC_DIR = path.join(__dirname, '..', 'static', 'images');

// Track stats
const stats = {
  processed: 0,
  skipped: 0,
  errors: 0,
  savedBytes: 0,
};

function log(message) {
  console.log(`[optimize-images] ${message}`);
}

function getFileSize(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}

function getDimensions(filePath) {
  try {
    const output = execSync(`identify -format "%w %h" "${filePath}"`, { encoding: 'utf-8' });
    const [width, height] = output.trim().split(' ').map(Number);
    return { width, height };
  } catch {
    return { width: 0, height: 0 };
  }
}

function isImageFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
}

function isVariantFile(filename) {
  // Skip already processed variants
  const base = path.basename(filename, path.extname(filename));
  return /_\d+w$/.test(base) || base.endsWith('_thumb');
}

function convertPngToJpg(pngPath) {
  const dir = path.dirname(pngPath);
  const base = path.basename(pngPath, '.png');
  const jpgPath = path.join(dir, `${base}.jpg`);
  const webpPath = path.join(dir, `${base}.webp`);

  try {
    const originalSize = getFileSize(pngPath);

    // Convert to JPG
    execSync(`convert "${pngPath}" -quality ${CONFIG.jpgQuality} -strip "${jpgPath}"`, { stdio: 'ignore' });
    const jpgSize = getFileSize(jpgPath);

    // Create WebP version
    execSync(`convert "${pngPath}" -quality ${CONFIG.webpQuality} -strip "${webpPath}"`, { stdio: 'ignore' });

    const saved = originalSize - jpgSize;
    stats.savedBytes += saved;

    log(`Converted: ${path.basename(pngPath)} (${(originalSize / 1024).toFixed(0)}KB → ${(jpgSize / 1024).toFixed(0)}KB)`);

    return { jpgPath, webpPath, saved };
  } catch (error) {
    log(`Error converting ${pngPath}: ${error.message}`);
    stats.errors++;
    return null;
  }
}

function generateVariants(imagePath) {
  const dir = path.dirname(imagePath);
  const base = path.basename(imagePath, path.extname(imagePath));
  const ext = path.extname(imagePath).toLowerCase().slice(1);

  if (isVariantFile(imagePath)) {
    return;
  }

  const { width: origWidth, height: origHeight } = getDimensions(imagePath);
  if (origWidth === 0) {
    stats.errors++;
    return;
  }

  // First: Optimize the original if it's oversized
  const originalSize = getFileSize(imagePath);
  if (origWidth > CONFIG.maxWidth || originalSize > 500 * 1024) {
    const tempPath = `${imagePath}.optimized`;
    try {
      // Resize if too large, recompress either way
      const targetWidth = Math.min(origWidth, CONFIG.maxWidth);
      const targetHeight = Math.round((origHeight / origWidth) * targetWidth);
      
      execSync(
        `convert "${imagePath}" -resize "${targetWidth}x${targetHeight}>" -quality ${CONFIG.jpgQuality} -strip "${tempPath}"`,
        { stdio: 'ignore' }
      );
      
      const newSize = getFileSize(tempPath);
      if (newSize < originalSize) {
        fs.renameSync(tempPath, imagePath);
        stats.savedBytes += (originalSize - newSize);
        log(`Optimized original: ${path.basename(imagePath)} (${(originalSize / 1024).toFixed(0)}KB → ${(newSize / 1024).toFixed(0)}KB)`);
      } else {
        fs.unlinkSync(tempPath);
      }
    } catch (error) {
      log(`Error optimizing original ${imagePath}: ${error.message}`);
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  }

  // Get potentially updated dimensions
  const { width: finalWidth, height: finalHeight } = getDimensions(imagePath);

  // Determine variant widths based on image type
  const useResponsive = isFeaturedImage(imagePath) || isGalleryImage(imagePath);
  const variantWidths = useResponsive ? CONFIG.responsiveVariants : [CONFIG.postMediaWidth];
  const maxVariantWidth = Math.max(...variantWidths);

  // Generate variants for each width
  for (const width of variantWidths) {
    if (width >= finalWidth) continue;

    const height = Math.round((finalHeight / finalWidth) * width);
    const variantJpg = path.join(dir, `${base}_${width}w.jpg`);
    const variantWebp = path.join(dir, `${base}_${width}w.webp`);

    try {
      // Skip if already exists and is newer
      if (fs.existsSync(variantJpg)) {
        const originalMtime = fs.statSync(imagePath).mtime;
        const variantMtime = fs.statSync(variantJpg).mtime;
        if (variantMtime >= originalMtime) {
          continue;
        }
      }

      // JPG variant
      execSync(
        `convert "${imagePath}" -resize "${width}x${height}>" -quality ${CONFIG.jpgQuality} -strip "${variantJpg}"`,
        { stdio: 'ignore' }
      );

      // WebP variant
      execSync(
        `convert "${imagePath}" -resize "${width}x${height}>" -quality ${CONFIG.webpQuality} -strip "${variantWebp}"`,
        { stdio: 'ignore' }
      );
    } catch (error) {
      log(`Error generating variants for ${imagePath}: ${error.message}`);
      stats.errors++;
    }
  }
  // For post media, also cap the source file at 760px width so that any
  // direct reference to the source does not serve an oversized image.
  if (!useResponsive && finalWidth > CONFIG.postMediaWidth) {
    const targetHeight = Math.round((finalHeight / finalWidth) * CONFIG.postMediaWidth);
    try {
      const tempPath = `${imagePath}.resized`;
      execSync(
        `convert "${imagePath}" -resize "${CONFIG.postMediaWidth}x${targetHeight}>" -quality ${CONFIG.jpgQuality} -strip "${tempPath}"`,
        { stdio: 'ignore' }
      );
      fs.renameSync(tempPath, imagePath);
    } catch (error) {
      log(`Error resizing post media ${imagePath}: ${error.message}`);
      if (fs.existsSync(`${imagePath}.resized`)) fs.unlinkSync(`${imagePath}.resized`);
    }
  }
}

function pruneOrphanVariants() {
  log('Pruning orphaned / stale variants...');
  let removed = 0;

  // Allowed widths: responsive set plus the post media width
  const allowedWidths = new Set([...CONFIG.responsiveVariants, CONFIG.postMediaWidth]);

  const files = execSync(`find "${STATIC_DIR}" -type f`)
    .toString()
    .split('\n')
    .filter(Boolean);

  for (const file of files) {
    const basename = path.basename(file);
    const match = basename.match(/^(.*)_(\d+)w\.(jpg|jpeg|png|webp)$/);
    if (!match) continue;

    const width = Number(match[2]);
    if (!allowedWidths.has(width)) {
      try {
        fs.unlinkSync(file);
        removed++;
        continue;
      } catch (error) {
        log(`Error deleting stale variant ${file}: ${error.message}`);
        stats.errors++;
      }
    }

    const dir = path.dirname(file);
    const base = match[1];
    const exts = ['.jpg', '.jpeg', '.png', '.webp'];
    const originalExists = exts.some(ext => fs.existsSync(path.join(dir, base + ext)));
    if (!originalExists) {
      try {
        fs.unlinkSync(file);
        removed++;
      } catch (error) {
        log(`Error deleting orphan variant ${file}: ${error.message}`);
        stats.errors++;
      }
    }
  }

  log(`Removed ${removed} stale/orphan variants`);
}

function writeVariantManifest() {
  log('Writing variant manifest...');
  const manifestDir = path.join(__dirname, '..', 'src', 'data');
  if (!fs.existsSync(manifestDir)) {
    fs.mkdirSync(manifestDir, { recursive: true });
  }

  const manifestPath = path.join(manifestDir, 'image-variants.json');
  const staticRoot = path.join(__dirname, '..', 'static');
  const manifest = [];

  const files = execSync(`find "${STATIC_DIR}" -type f \\( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" \\)`)
    .toString()
    .split('\n')
    .filter(Boolean);

  for (const file of files) {
    if (isVariantFile(file)) continue;

    const publicPath = '/' + path.relative(staticRoot, file).replace(/\\\\/g, '/');
    const dir = path.dirname(file);
    const baseName = path.basename(file, path.extname(file));
    const escapedBaseName = baseName.replace(/([.*+?^${}()|[\]\\\\])/g, '\\\\$1');
    const regex = new RegExp(`^${escapedBaseName}_(\\d+)w\\.(jpg|jpeg|png|webp)$`);
    const widths = new Set();

    try {
      for (const entry of fs.readdirSync(dir)) {
        const match = entry.match(regex);
        if (match) widths.add(Number(match[1]));
      }
    } catch (error) {
      log(`Error reading directory ${dir}: ${error.message}`);
      stats.errors++;
      continue;
    }

    if (widths.size > 0) {
      manifest.push({
        src: publicPath,
        widths: Array.from(widths).sort((a, b) => a - b),
      });
    }
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  log(`Wrote ${manifest.length} entries to ${manifestPath}`);
}

function processContentImages() {
  const contentDir = path.join(STATIC_DIR, 'content');
  if (!fs.existsSync(contentDir)) return;

  log('Processing content images...');

  const files = execSync(`find "${contentDir}" -type f \\( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" \\)`)
    .toString()
    .split('\n')
    .filter(Boolean);

  for (const file of files) {
    const filename = path.basename(file);
    const ext = path.extname(file).toLowerCase();

    // Skip variants
    if (isVariantFile(file)) {
      stats.skipped++;
      continue;
    }

    // Convert large PNGs to JPG
    if (ext === '.png') {
      const size = getFileSize(file);
      if (size > CONFIG.pngToJpgThreshold) {
        convertPngToJpg(file);
      }
    }

    // Generate variants
    generateVariants(file);
    stats.processed++;
  }
}

function processGalleryImages() {
  const galleriesDir = path.join(STATIC_DIR, 'galleries');
  if (!fs.existsSync(galleriesDir)) return;

  log('Processing gallery images (this may take a while)...');

  // Get list of galleries
  const galleries = fs.readdirSync(galleriesDir).filter(f => {
    return fs.statSync(path.join(galleriesDir, f)).isDirectory();
  });

  let galleryCount = 0;
  for (const gallery of galleries) {
    const galleryPath = path.join(galleriesDir, gallery);
    const files = execSync(`find "${galleryPath}" -type f \\( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" \\)`)
      .toString()
      .split('\n')
      .filter(f => f && !isVariantFile(f));

    for (const file of files) {
      generateVariants(file);
      stats.processed++;
    }

    galleryCount++;
    if (galleryCount % 5 === 0) {
      log(`  Processed ${galleryCount}/${galleries.length} galleries...`);
    }
  }
}

// Main execution
function main() {
  log('Starting image optimization...');
  log(`Configuration: JPG quality ${CONFIG.jpgQuality}, WebP quality ${CONFIG.webpQuality}`);
  log('');

  // Check for ImageMagick
  try {
    execSync('which convert', { stdio: 'ignore' });
  } catch {
    log('Error: ImageMagick not found. Please install ImageMagick.');
    process.exit(1);
  }

  const startTime = Date.now();

  pruneOrphanVariants();
  processContentImages();
  processGalleryImages();
  writeVariantManifest();

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  log('');
  log('=== Optimization Complete ===');
  log(`Processed: ${stats.processed} images`);
  log(`Skipped: ${stats.skipped} existing variants`);
  log(`Errors: ${stats.errors}`);
  log(`Saved: ${(stats.savedBytes / 1024 / 1024).toFixed(2)} MB (PNG → JPG conversions)`);
  log(`Duration: ${duration}s`);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, stats };
