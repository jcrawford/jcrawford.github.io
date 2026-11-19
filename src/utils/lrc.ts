/**
 * Minimal LRC (timed lyrics) parser.
 *
 * Accepts standard LRC lines such as:
 *   [00:12.30]First line of the song
 *   [00:16.80][01:04.10]A repeated chorus line
 *
 * Supported metadata: [offset:+/-milliseconds] applied to every timestamp.
 * Non-numeric tags ([ti:], [ar:], [al:]) are ignored.
 */

export interface LyricWord {
  /** The word as sung, punctuation attached. */
  w: string;
  /** Start time in seconds. */
  start: number;
  /** End time in seconds. */
  end: number;
}

export interface LyricLine {
  /** Seconds from the start of the track. */
  time: number;
  text: string;
  /** Word-level timings when available (karaoke highlight within the line). */
  words?: LyricWord[];
}

const TIMESTAMP = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;
/** A word-level timestamp inside the line text (enhanced LRC / A2 extension): `<mm:ss.xx>word`. */
const WORD_STAMP = /<(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?>/g;

const stampToSeconds = (minutesRaw: string, secondsRaw: string, fractionRaw?: string): number => {
  const minutes = Number(minutesRaw);
  const seconds = Number(secondsRaw);
  const fraction = fractionRaw ? Number(fractionRaw.padEnd(3, '0')) / 1000 : 0;
  return minutes * 60 + seconds + fraction;
};

export const parseLrc = (raw: string | null | undefined): LyricLine[] => {
  if (!raw) return [];

  const offsetMatch = raw.match(/\[offset:\s*([+-]?\d+)\s*\]/i);
  const offset = offsetMatch ? Number(offsetMatch[1]) / 1000 : 0;

  const lines: LyricLine[] = [];

  raw.split(/\r?\n/).forEach((line) => {
    const stamps = Array.from(line.matchAll(TIMESTAMP));
    if (stamps.length === 0) return;

    const body = line.replace(TIMESTAMP, '').trim();
    const wordStamps = Array.from(body.matchAll(WORD_STAMP));

    let text = body.replace(WORD_STAMP, '').trim();
    let words: LyricWord[] | undefined;

    if (wordStamps.length > 0) {
      // Enhanced LRC: every word is preceded by its start time. Each word runs
      // until the next word's stamp; the final word's end is patched after the
      // lines are sorted (next line's start).
      words = [];
      wordStamps.forEach((match, index) => {
        const next = wordStamps[index + 1];
        const wordText = body
          .slice(match.index + match[0].length, next ? next.index : undefined)
          .replace(WORD_STAMP, '')
          .trim();
        if (!wordText) return;
        words!.push({
          w: wordText,
          start: stampToSeconds(match[1], match[2], match[3]) + offset,
          end: next ? stampToSeconds(next[1], next[2], next[3]) + offset : Number.NaN,
        });
      });
      if (words.length === 0) words = undefined;
    }

    stamps.forEach((stamp) => {
      const time = stampToSeconds(stamp[1], stamp[2], stamp[3]) + offset;
      if (Number.isFinite(time) && time >= 0) {
        lines.push({ time, text: text || '', words });
      }
    });
  });

  const sorted = lines.sort((a, b) => a.time - b.time);

  // Patch each line's final word: it ends where the next line starts.
  sorted.forEach((line, index) => {
    if (!line.words || line.words.length === 0) return;
    const nextLine = sorted[index + 1];
    const last = line.words[line.words.length - 1];
    if (!Number.isFinite(last.end)) last.end = nextLine ? nextLine.time : last.start + 1;
    // Also correct any word whose end NaN slipped through empty inter-stamp gaps.
    line.words.forEach((word, wordIndex) => {
      if (!Number.isFinite(word.end)) {
        word.end = line.words![wordIndex + 1]?.start ?? last.end;
      }
    });
    // Words must never extend past the line's own window or before their start.
    line.words.forEach((word) => {
      if (word.end > line.time + 60) word.end = last.end;
      if (word.end < word.start) word.end = word.start;
    });
  });

  return sorted;
};

/**
 * Index of the line that should be highlighted for a given playhead position.
 * Returns -1 before the first line.
 */
export const activeLineIndex = (lines: LyricLine[], currentTime: number): number => {
  if (lines.length === 0) return -1;
  let index = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].time <= currentTime + 0.15) index = i;
    else break;
  }
  return index;
};
