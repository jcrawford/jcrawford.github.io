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

export interface LyricLine {
  /** Seconds from the start of the track. */
  time: number;
  text: string;
}

const TIMESTAMP = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

export const parseLrc = (raw: string | null | undefined): LyricLine[] => {
  if (!raw) return [];

  const offsetMatch = raw.match(/\[offset:\s*([+-]?\d+)\s*\]/i);
  const offset = offsetMatch ? Number(offsetMatch[1]) / 1000 : 0;

  const lines: LyricLine[] = [];

  raw.split(/\r?\n/).forEach((line) => {
    const stamps = Array.from(line.matchAll(TIMESTAMP));
    if (stamps.length === 0) return;

    const text = line.replace(TIMESTAMP, '').trim();
    stamps.forEach((stamp) => {
      const minutes = Number(stamp[1]);
      const seconds = Number(stamp[2]);
      const fraction = stamp[3] ? Number(stamp[3].padEnd(3, '0')) / 1000 : 0;
      const time = minutes * 60 + seconds + fraction + offset;
      if (Number.isFinite(time) && time >= 0) {
        lines.push({ time, text });
      }
    });
  });

  return lines.sort((a, b) => a.time - b.time);
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
