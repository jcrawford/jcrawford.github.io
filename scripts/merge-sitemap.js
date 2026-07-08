/**
 * Merges gatsby-plugin-sitemap's chunked output (sitemap-index.xml + sitemap-0.xml, etc.)
 * into a single classic sitemap.xml file.
 *
 * Run after `gatsby build`.
 */
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

const indexFile = path.join(publicDir, 'sitemap-index.xml');
const sitemapFile = path.join(publicDir, 'sitemap.xml');

if (!fs.existsSync(indexFile)) {
  console.log('merge-sitemap: no sitemap-index.xml found, skipping');
  process.exit(0);
}

// Collect all <url> entries from every sitemap-N.xml chunk
const urlEntries = [];

const chunkFiles = fs
  .readdirSync(publicDir)
  .filter((f) => /^sitemap-\d+\.xml$/.test(f))
  .sort();

for (const chunk of chunkFiles) {
  const content = fs.readFileSync(path.join(publicDir, chunk), 'utf8');
  const matches = content.matchAll(/<url>.*?<\/url>/gs);
  for (const m of matches) {
    urlEntries.push(m[0]);
  }
}

if (urlEntries.length === 0) {
  console.log('merge-sitemap: no <url> entries found in sitemap chunks');
  process.exit(0);
}

const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">${urlEntries.join(
  ''
)}</urlset>`;

fs.writeFileSync(sitemapFile, xml);
console.log(`merge-sitemap: wrote ${sitemapFile} with ${urlEntries.length} URLs`);