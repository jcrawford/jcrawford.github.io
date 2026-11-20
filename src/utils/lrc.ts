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
  /**
   * Line-end hold (enhanced LRC A2ext: a trailing `<mm:ss.xx>` stamp followed
   * by no word). The vocal for this line ends at this time — the last word
   * fills to it and then sits fully lit, instead of crawling to the next
   * line's stamp.
   */
  hold?: number;
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
    let lineHold: number | undefined;

    if (wordStamps.length > 0) {
      // Enhanced LRC A2ext (Suno's site export): the FIRST stamp may be the
      // line-end HOLD for the PREVIOUS lyric segment — a bare `<mm:ss.xx>`
      // with only whitespace after it (often an nbsp), out of order (start >
      // the line's own stamps). A TRAILING bare stamp is also a hold. Either
      // way it marks where the vocal truly ends; it is not a word.
      words = [];
      let hold: number | undefined;
      wordStamps.forEach((match, index) => {
        const next = wordStamps[index + 1];
        const wordText = body
          .slice(match.index + match[0].length, next ? next.index : undefined)
          .replace(WORD_STAMP, '')
          // Nbsp between the hold stamp and the next stamp is not a word.
          .replace(/\u00a0/g, ' ')
          .trim();
        const start = stampToSeconds(match[1], match[2], match[3]) + offset;
        if (!wordText) {
          if (hold === undefined) hold = start;
          if (next) return; // interior gap stamp — not a word, keep scanning
          return;
        }
        words!.push({
          w: wordText,
          start,
          end: next ? stampToSeconds(next[1], next[2], next[3]) + offset : Number.NaN,
        });
      });
      if (words.length === 0) {
        words = undefined;
        hold = undefined;
      } else if (hold !== undefined) {
        // A hold must sit AFTER the final word — otherwise it's just a stray
        // interior out-of-order stamp (Suno writes the previous line's hold at
        // the head of the next block). Apply it only when it clears the line.
        const lastWord = words![words!.length - 1];
        if (hold <= lastWord.start) hold = undefined;
      }
      if (words === undefined || words.length === 0) words = undefined;
      lineHold = words ? hold : undefined;
    }

    stamps.forEach((stamp) => {
      const time = stampToSeconds(stamp[1], stamp[2], stamp[3]) + offset;
      if (Number.isFinite(time) && time >= 0) {
        lines.push({ time, text: text || '', words, hold: lineHold });
      }
    });
  });

  const sorted = lines.sort((a, b) => a.time - b.time);

  // Patch each line's final word: it ends at the line's hold stamp when the
  // file supplies one (the vocal's true end), otherwise at the next line's
  // start (plain enhanced LRC without a hold).
  sorted.forEach((line, index) => {
    if (!line.words || line.words.length === 0) return;
    const nextLine = sorted[index + 1];
    const last = line.words[line.words.length - 1];
    const naturalEnd = nextLine ? nextLine.time : last.start + 1;
    const effectiveEnd = line.hold !== undefined ? Math.min(line.hold, naturalEnd) : naturalEnd;
    if (!Number.isFinite(last.end)) last.end = effectiveEnd;
    // Also correct any word whose end NaN slipped through empty inter-stamp gaps.
    line.words.forEach((word, wordIndex) => {
      if (!Number.isFinite(word.end)) {
        word.end = line.words![wordIndex + 1]?.start ?? effectiveEnd;
      }
    });
    // The hold must never push a word past the next line's start.
    line.words.forEach((word) => {
      if (word.end > naturalEnd) word.end = Math.max(word.start, naturalEnd === last.end ? word.end : naturalEnd);
      if (word.end < word.start) word.end = word.start;
    });
    // Final gate: last word cannot outlive the effective end of the line.
    if (last.end > effectiveEnd) last.end = Math.max(last.start, effectiveEnd);
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
