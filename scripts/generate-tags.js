const fs = require('fs');
const path = require('path');
const glob = require('glob');

const TAGS_JSON_PATH = path.resolve(__dirname, '../src/data/tags.json');
const CONTENT_DIR = path.resolve(__dirname, '../content');

function normalizeTagSlug(tag) {
  return tag
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function titleCase(str) {
  return str
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function extractTags(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return [];

  const frontmatter = frontmatterMatch[1];
  const tagsMatch = frontmatter.match(/^tags:\s*\n((?:\s+-\s*[^\n]*\n?)+)/m);
  if (!tagsMatch) return [];

  return tagsMatch[1]
    .split('\n')
    .map(line => line.match(/^\s+-\s*(.+)/)?.[1])
    .filter((tag) => !!tag);
}

function loadExistingTags() {
  if (!fs.existsSync(TAGS_JSON_PATH)) return [];
  return JSON.parse(fs.readFileSync(TAGS_JSON_PATH, 'utf-8'));
}

function main() {
  const existingTags = loadExistingTags();
  const existingBySlug = new Map(existingTags.map(tag => [tag.slug, tag]));
  const existingById = new Map(existingTags.map(tag => [tag.id, tag]));

  const files = glob.sync(`${CONTENT_DIR}/**/*.md`);
  const discoveredTags = new Set();

  for (const file of files) {
    const tags = extractTags(file);
    for (const tag of tags) {
      const slug = normalizeTagSlug(tag);
      if (slug) discoveredTags.add({ slug, name: titleCase(tag) });
    }
  }

  let nextId = existingTags.length > 0
    ? Math.max(...existingTags.map(tag => Number(tag.id))) + 1
    : 1;

  const mergedTags = [...existingTags];

  for (const { slug, name } of discoveredTags) {
    if (existingBySlug.has(slug)) continue;

    let id = nextId.toString();
    while (existingById.has(id)) {
      nextId++;
      id = nextId.toString();
    }

    mergedTags.push({
      id,
      slug,
      name,
      description: `Posts tagged with ${name}.`,
      featured: false,
    });

    existingById.set(id, true);
    nextId++;
  }

  mergedTags.sort((a, b) => Number(a.id) - Number(b.id));

  fs.writeFileSync(TAGS_JSON_PATH, JSON.stringify(mergedTags, null, 2) + '\n', 'utf-8');

  const newCount = mergedTags.length - existingTags.length;
  console.log(`[generate-tags] ${mergedTags.length} total tags (${newCount} new) written to src/data/tags.json`);
}

main();
