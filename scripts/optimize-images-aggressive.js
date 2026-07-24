#!/usr/bin/env node
/**
 * AGGRESSIVE Image Optimization Script
 * 
 * Strategy:
 * 1. Remove 1920w JPGs (use WebP only at that size - 50% smaller)
 * 2. Cap gallery originals at 1200w max
 * 3. Delete PNG variants entirely (JPG+WebP sufficient)
 * 4. Remove unused large originals from galleries
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CONFIG = {
  // Remove these entirely (WebP is better at these sizes)
  removeJpgVariants: ['_1920w.jpg'],
  
  // Remove all PNG variants (JPG is sufficient)
  removePngVariants: true,
  
  // Cap gallery originals
  maxGalleryOriginalWidth: 1200,
  galleryQuality: 70,
  
  // Content images quality
  contentQuality: 80,
};

function log(message) {
  console.log(`[aggressive-opt] ${message}`);
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
    const output = execSync(`identify -format "%w %h" "${filePath}" 2>/dev/null`, { encoding: 'utf-8' });
    const [width, height] = output.trim().split(' ').map(Number);
    return { width, height };
  } catch {
    return { width: 0, height: 0 };
  }
}

// Phase 1: Remove bloated variants
function removeBloatedVariants(baseDir) {
  log('Phase 1: Removing bloated variants...');
  let removed = 0;
  let savedBytes = 0;

  const files = execSync(`find "${baseDir}" -type f 2>/dev/null`)
    .toString()
    .split('\n')
    .filter(Boolean);

  for (const file of files) {
    const basename = path.basename(file);
    let shouldDelete = false;

    // Remove 1920w JPGs (WebP is 50% smaller at this size)
    if (basename.endsWith('_1920w.jpg')) {
      shouldDelete = true;
      log(`Removing bloated: ${basename}`);
    }

    // Remove ALL PNG variants (keep only JPG/WebP)
    if (CONFIG.removePngVariants && basename.match(/_\d+w\.png$/)) {
      shouldDelete = true;
    }

    // Remove original PNGs over 1MB that have JPG versions
    if (basename.endsWith('.png') && !basename.includes('_')) {
      const jpgVersion = file.replace(/\.png$/, '.jpg');
      if (fs.existsSync(jpgVersion) && getFileSize(file) > 1024 * 1024) {
        shouldDelete = true;
        log(`Removing redundant PNG: ${basename} (has JPG)`);
      }
    }

    if (shouldDelete) {
      const size = getFileSize(file);
      try {
        fs.unlinkSync(file);
        savedBytes += size;
        removed++;
      } catch (e) {
        // ignore
      }
    }
  }

  log(`Removed ${removed} bloated files, saved ${(savedBytes / 1024 / 1024).toFixed(1)} MB`);
  return { removed, savedBytes };
}

// Phase 2: Aggressive gallery optimization
function optimizeGalleries(galleriesDir) {
  log('');
  log('Phase 2: Aggressive gallery optimization...');
  
  if (!fs.existsSync(galleriesDir)) return { processed: 0, savedBytes: 0 };

  const originals = execSync(`find "${galleriesDir}" -name "*.jpg" -o -name "*.jpeg" | grep -v "_" | head -300`)
    .toString()
    .split('\n')
    .filter(f => f && !path.basename(f).includes('_'));

  let processed = 0;
  let savedBytes = 0;

  for (const original of originals) {
    const { width, height } = getDimensions(original);
    if (width === 0) continue;

    const size = getFileSize(original);
    const dir = path.dirname(original);
    const base = path.basename(original, '.jpg');

    // Cap gallery originals at 1200w
    if (width > CONFIG.maxGalleryOriginalWidth || size > 800 * 1024) {
      const targetWidth = Math.min(width, CONFIG.maxGalleryOriginalWidth);
      const targetHeight = Math.round((height / width) * targetWidth);
      const tempFile = `${original}.optimized`;

      try {
        execSync(
          `convert "${original}" -resize "${targetWidth}x${targetHeight}>" -quality ${CONFIG.galleryQuality} -strip "${tempFile}" 2>/dev/null`,
          { stdio: 'ignore' }
        );

        const newSize = getFileSize(tempFile);
        if (newSize < size * 0.9) { // Only replace if saves >10%
          fs.renameSync(tempFile, original);
          savedBytes += (size - newSize);
          log(`Capped ${path.basename(original)}: ${(size / 1024).toFixed(0)}KB → ${(newSize / 1024).toFixed(0)}KB (${width}w → ${targetWidth}w)`);
        } else {
          fs.unlinkSync(tempFile);
        }
        processed++;
      } catch (e) {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
      }
    }
  }

  log(`Processed ${processed} gallery originals`);
  return { processed, savedBytes };
}

// Phase 3: Ensure WebP exists for all key sizes
function ensureWebPVariants(baseDir) {
  log('');
  log('Phase 3: Generating WebP variants...');
  
  const jpgFiles = execSync(`find "${baseDir}" -name "*.jpg" | grep -E "_(480|768|1200)w\\.jpg$"`)
    .toString()
    .split('\n')
    .filter(Boolean);

  let generated = 0;

  for (const jpgFile of jpgFiles) {
    const webpFile = jpgFile.replace(/\.jpg$/, '.webp');
    if (!fs.existsSync(webpFile)) {
      try {
        execSync(`convert "${jpgFile}" -quality 75 -strip "${webpFile}" 2>/dev/null`, { stdio: 'ignore' });
        generated++;
      } catch (e) {
        // ignore
      }
    }
  }

  log(`Generated ${generated} WebP variants`);
  return generated;
}

// Main execution
function main() {
  const staticDir = path.join(__dirname, '..', 'static', 'images');
  const galleriesDir = path.join(staticDir, 'galleries');
  const contentDir = path.join(staticDir, 'content');

  log('=== AGGRESSIVE Image Optimization ===');
  log('');

  const startSize = execSync(`du -sb "${staticDir}" 2>/dev/null`, { encoding: 'utf-8' }).split('\t')[0];
  log(`Starting size: ${(startSize / 1024 / 1024).toFixed(0)} MB`);
  log('');

  // Phase 1: Remove bloated variants from both content and galleries
  const contentRemoved = removeBloatedVariants(contentDir);
  const galleryRemoved = removeBloatedVariants(galleriesDir);

  // Phase 2: Optimize gallery originals
  const galleryOptimized = optimizeGalleries(galleriesDir);

  // Phase 3: Ensure WebP coverage
  const webpContent = ensureWebPVariants(contentDir);
  const webpGalleries = ensureWebPVariants(galleriesDir);

  // Final stats
  const endSize = execSync(`du -sb "${staticDir}" 2>/dev/null`, { encoding: 'utf-8' }).split('\t')[0];
  const totalSaved = parseInt(startSize) - parseInt(endSize);

  log('');
  log('=== Results ===');
  log(`Removed ${contentRemoved.removed + galleryRemoved.removed} bloated files`);
  log(`Optimized ${galleryOptimized.processed} gallery originals`);
  log(`Generated ${webpContent + webpGalleries} WebP variants`);
  log(`Total saved: ${(totalSaved / 1024 / 1024).toFixed(1)} MB`);
  log(`New size: ${(endSize / 1024 / 1024).toFixed(0)} MB`);
  log('');
  log('Next build will copy only optimized images to public/');
}

if (require.main === module) {
  main();
}

module.exports = { main };
