#!/usr/bin/env node
/**
 * Prune image variants that are no longer in the configured set.
 * Removes any *_<width>w.jpg or *_<width>w.webp where <width> is not in CONFIG.variants.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ALLOWED_WIDTHS = new Set([64, 80, 160, 280, 320, 400, 600, 768, 850, 1200, 1920]);
const STATIC_DIR = path.join(__dirname, '..', 'static', 'images');

function isVariantToPrune(filename) {
  const match = filename.match(/_(\d+)w\.(jpg|jpeg|webp)$/);
  if (!match) return false;
  const width = parseInt(match[1], 10);
  return !ALLOWED_WIDTHS.has(width);
}

function pruneDirectory(dir) {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      count += pruneDirectory(fullPath);
    } else if (entry.isFile() && isVariantToPrune(entry.name)) {
      fs.unlinkSync(fullPath);
      count++;
    }
  }
  return count;
}

function main() {
  if (!fs.existsSync(STATIC_DIR)) {
    console.log('[prune-image-variants] static/images not found');
    return;
  }
  const count = pruneDirectory(STATIC_DIR);
  console.log(`[prune-image-variants] Removed ${count} unused variants`);
}

main();
