#!/usr/bin/env node
/**
 * Build the music manifest for the /music player.
 *
 * Reads audio files (mp3/m4a/flac/ogg/wav/aac) from a local directory, extracts
 * tags and embedded cover art, writes responsive cover images, and emits
 * src/data/music-manifest.json.
 *
 * The audio itself is NOT copied into the site. Files are uploaded to Cloudflare
 * R2 and streamed from there, so the manifest stores absolute URLs.
 *
 * Usage:
 *   MUSIC_BASE_URL=https://pub-xxxx.r2.dev node scripts/build-music-manifest.js
 *   node scripts/build-music-manifest.js --src ~/Music/blog-music
 *
 * Env:
 *
 *   MUSIC_BASE_URL  Public base URL of the R2 bucket (no trailing slash).
 *                   Falls back to src/data/music-config.json -> baseUrl.
 *   MUSIC_SRC_DIR   Local directory holding the audio files.
 *                   Defaults to ~/Music/blog-music
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const sharp = require('sharp');

const REPO_ROOT = path.resolve(__dirname, '..');
const STATIC_MUSIC_DIR = path.join(REPO_ROOT, 'static', 'images', 'music');
const MANIFEST_PATH = path.join(REPO_ROOT, 'src', 'data', 'music-manifest.json');
const CONFIG_PATH = path.join(REPO_ROOT, 'src', 'data', 'music-config.json');

/**
 * Remove song-structure markers that lyric generators embed in the lyrics tag,
 * e.g. "**[Chorus]**", "[Verse 2]", "(Bridge)", "**Outro**".
 * Only whole-line markers are removed — a lyric that merely mentions a word is kept.
 */
const STRUCTURE_LABEL =
  /^\s*[*([]*\s*(intro|verse|chorus|pre[- ]?chorus|post[- ]?chorus|bridge|hook|refrain|outro|instrumental|solo|breakdown|interlude)\b[^\n]*?[)\]]\s*[)*]*\s*$/i;

function stripStructureLabels(text) {
  return text
    .split(/\r?\n/)
    .filter((line) => !STRUCTURE_LABEL.test(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const AUDIO_EXTENSIONS = new Set(['.mp3', '.m4a', '.aac', '.flac', '.ogg', '.oga', '.wav']);
const COVER_WIDTHS = [160, 400, 800];

function argValue(flag) {
  const i = process.argv.indexOf(flag);
  return i > -1 ? process.argv[i + 1] : null;
}

function slugify(input) {
  return String(input)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function resolveBaseUrl() {
  if (process.env.MUSIC_BASE_URL) return process.env.MUSIC_BASE_URL.replace(/\/+$/, '');
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      if (cfg.baseUrl) return String(cfg.baseUrl).replace(/\/+$/, '');
    } catch (err) {
      console.warn(`[music] could not read ${CONFIG_PATH}: ${err.message}`);
    }
  }
  return null;
}

function resolveSourceDir() {
  const fromArg = argValue('--src');
  if (fromArg) return path.resolve(fromArg.replace(/^~/, os.homedir()));
  if (process.env.MUSIC_SRC_DIR) return path.resolve(process.env.MUSIC_SRC_DIR.replace(/^~/, os.homedir()));
  return path.join(os.homedir(), 'Music', 'blog-music');
}

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (AUDIO_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) out.push(full);
  }
  return out.sort();
}

async function writeCovers(slug, picture) {
  const outDir = path.join(STATIC_MUSIC_DIR, slug);
  fs.mkdirSync(outDir, { recursive: true });

  let sourceBuffer;
  if (picture && picture.data && picture.data.length) {
    sourceBuffer = Buffer.from(picture.data);
  } else {
    // Fallback: neutral gradient so a missing embedded cover never renders a broken image.
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#2a2f3a"/>
        <stop offset="100%" stop-color="#161a21"/>
      </linearGradient></defs>
      <rect width="800" height="800" fill="url(#g)"/>
      <circle cx="400" cy="400" r="150" fill="none" stroke="#4b5563" stroke-width="6"/>
      <circle cx="400" cy="400" r="28" fill="#4b5563"/>
    </svg>`;
    sourceBuffer = Buffer.from(svg);
  }

  const variants = {};
  for (const width of COVER_WIDTHS) {
    const jpgName = `cover_${width}w.jpg`;
    const webpName = `cover_${width}w.webp`;
    await sharp(sourceBuffer)
      .resize(width, width, { fit: 'cover' })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(path.join(outDir, jpgName));
    await sharp(sourceBuffer)
      .resize(width, width, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(path.join(outDir, webpName));
    variants[width] = { jpg: `/images/music/${slug}/${jpgName}`, webp: `/images/music/${slug}/${webpName}` };
  }
  return variants;
}

async function main() {
  const mm = await import('music-metadata');
  const srcDir = resolveSourceDir();
  const baseUrl = resolveBaseUrl();

  if (!baseUrl) {
    console.error('[music] No base URL. Set MUSIC_BASE_URL or create src/data/music-config.json with {"baseUrl": "https://pub-xxxx.r2.dev"}');
    process.exit(1);
  }

  if (!fs.existsSync(srcDir)) {
    console.warn(`[music] source directory not found: ${srcDir} — writing empty manifest`);
    fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl, tracks: [], albums: [] }, null, 2));
    return;
  }

  const files = walk(srcDir);
  console.log(`[music] ${files.length} audio file(s) in ${srcDir}`);

  const tracks = [];
  const seenSlugs = new Set();

  for (const file of files) {
    const relKey = path.relative(srcDir, file).split(path.sep).join('/');
    let metadata;
    try {
      metadata = await mm.parseFile(file, { duration: true });
    } catch (err) {
      console.warn(`[music] skipping ${relKey}: ${err.message}`);
      continue;
    }

    const common = metadata.common || {};
    const title = (common.title || path.basename(file, path.extname(file))).trim();
    const artist = (common.artist || common.albumartist || 'Joseph Crawford').trim();
    const album = (common.album || 'Singles').trim();
    const year = common.year || null;
    const trackNo = common.track && common.track.no ? common.track.no : null;

    // The creation date lives in the comment tag. Suno writes
    // "created=<ISO timestamp>"; retagged files may use
    // "created on <YYYY-MM-DD>" or a bare date. Comment content is internal
    // and never surfaces on the site.
    let createdAt = null;
    let derivedYear = year;
    const commentEntry = Array.isArray(common.comment) ? common.comment[0] : common.comment;
    const commentText =
      commentEntry && typeof commentEntry === 'object' ? commentEntry.text || '' : String(commentEntry || '');
    const createdMatch =
      commentText.match(/created=([^\s;]+)/i) ||
      commentText.match(/created on\s*:?\s*(\d{4}-\d{2}-\d{2})/i) ||
      commentText.match(/\b(\d{4}-\d{2}-\d{2})\b/);
    if (createdMatch) {
      const parsed = new Date(createdMatch[1]);
      if (!Number.isNaN(parsed.getTime())) {
        createdAt = parsed.toISOString();
        if (!derivedYear) derivedYear = parsed.getUTCFullYear();
      }
    }

    // Everything shown on the site, except the comment (internal).
    const codec = metadata.format && metadata.format.codec ? String(metadata.format.codec) : null;
    const bitrate = metadata.format && metadata.format.bitrate ? Math.round(metadata.format.bitrate / 1000) : null;
    const sampleRate = metadata.format && metadata.format.sampleRate ? metadata.format.sampleRate : null;
    const lossless = metadata.format ? Boolean(metadata.format.lossless) : false;
    const rawLyrics = Array.isArray(common.lyrics) && common.lyrics[0] ? String(common.lyrics[0].text || '') : null;
    // Suno (and other generators) embed structure markers like "**[Chorus]**"
    // in the lyrics tag. Those are production notes, not lyrics — strip them.
    const lyrics = rawLyrics ? stripStructureLabels(rawLyrics) : null;

    let slug = slugify(`${artist}-${title}`);
    if (!slug) slug = slugify(path.basename(file, path.extname(file)));
    let unique = slug;
    let n = 2;
    while (seenSlugs.has(unique)) unique = `${slug}-${n++}`;
    seenSlugs.add(unique);

    const picture = common.picture && common.picture[0] ? common.picture[0] : null;
    const covers = await writeCovers(unique, picture);

    tracks.push({
      slug: unique,
      title,
      artist,
      album,
      albumSlug: slugify(album) || 'singles',
      year: derivedYear,
      trackNumber: trackNo,
      createdAt,
      duration: Math.round(metadata.format && metadata.format.duration ? metadata.format.duration : 0),
      format: { codec, bitrateKbps: bitrate, sampleRate, lossless },
      lyrics,
      src: `${baseUrl}/${relKey.split('/').map(encodeURIComponent).join('/')}`,
      file: relKey,
      covers,
    });
    console.log(`[music]   + ${title} (${artist}) -> /music/${unique}/`);
  }

  tracks.sort((a, b) => {
    if (a.album !== b.album) return a.album.localeCompare(b.album);
    const at = a.trackNumber || 999;
    const bt = b.trackNumber || 999;
    if (at !== bt) return at - bt;
    return a.title.localeCompare(b.title);
  });

  const albumMap = new Map();
  for (const track of tracks) {
    if (!albumMap.has(track.albumSlug)) {
      albumMap.set(track.albumSlug, {
        slug: track.albumSlug,
        title: track.album,
        artist: track.artist,
        year: track.year,
        cover: track.covers,
        trackSlugs: [],
      });
    }
    albumMap.get(track.albumSlug).trackSlugs.push(track.slug);
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    tracks,
    albums: Array.from(albumMap.values()),
  };

  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`[music] wrote ${tracks.length} track(s) to ${path.relative(REPO_ROOT, MANIFEST_PATH)}`);
}

main().catch((err) => {
  console.error('[music] failed:', err);
  process.exit(1);
});
