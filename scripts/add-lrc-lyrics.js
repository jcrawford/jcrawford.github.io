#!/usr/bin/env node

/**
 * Add timed lyrics for a track from a standard LRC file.
 *
 * Usage:
 *   node scripts/add-lrc-lyrics.js <file.lrc> <track-slug>
 *
 * Parses [mm:ss.xx] lines (see src/utils/lrc.ts for accepted forms), stores the
 * RAW LRC text in src/data/music-lyrics.json, and strips ID3 lyrics-tag
 * fallback for that slug only if the LRC parses to something.
 *
 * Note: word-level timings (music-word-lyrics.json) always win over LRC when
 * both exist for a slug. Delete the slug's entry there if you want the LRC
 * file to drive the karaoke highlight instead.
 */

const fs = require('fs');
const path = require('path');

const OUTPUT = path.resolve(__dirname, '../src/data/music-lyrics.json');

const [, , inputPath, slug] = process.argv;

if (!inputPath || !slug) {
  console.error('Usage: node scripts/add-lrc-lyrics.js <file.lrc> <track-slug>');
  process.exit(1);
}

const text = fs.readFileSync(inputPath, 'utf8');
const stamps = (text.match(/\[\d{1,3}:\d{2}(?:[.:]\d{1,3})?\]/g) || []).length;
if (stamps === 0) {
  console.error('No [mm:ss.xx] timestamps found — is this an LRC file?');
  process.exit(1);
}

let index = { _readme: 'Timed (karaoke) lyrics keyed by track slug. Value is LRC text: [mm:ss.xx]line. Rendered by src/components/SyncedLyrics.tsx. Tracks without an entry fall back to the plain lyrics tag on the song page.', tracks: {} };
if (fs.existsSync(OUTPUT)) {
  index = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
  index.tracks = index.tracks || {};
}

index.tracks[slug] = text;

fs.writeFileSync(OUTPUT, `${JSON.stringify(index, null, 2)}\n`);
console.log(`Stored ${stamps} timestamped lines for ${slug}`);
console.log('Note: word-level timings in music-word-lyrics.json take priority over LRC for the same slug.');
