import React, { useEffect, useRef } from 'react';
import type { LyricLine } from '../utils/lrc';

/**
 * Single lyrics renderer for every song page.
 *
 * Two modes, one visual format:
 * -timed (lines.length > 0): LRC/word-timed rows that highlight and follow
 *  the playhead; each row is a button that seeks to its timestamp.
 * -static (lines empty): plain lyrics text (e.g. ID3 lyrics tag) split into
 *  rows with identical spacing — no highlight, no seek, rendered as spans.
 *
 * Full-line bracketed section labels ([Chorus], [Beat Drops], **[Verse 2]**…)
 * are stripped on display so structure markers never reach the reader.
 */

interface LyricsProps {
  /** Timed lines when available; empty array means "no timestamps — use staticText". */
  lines: LyricLine[];
  /** Plain lyrics fallback rendered when no timed lines exist. */
  staticText?: string;
  /** Index of the line to highlight, or -1 when the track isn't the one playing. */
  activeIndex: number;
  /** Playhead position in seconds, used for word-level fill. */
  currentTime: number;
  /** True when this song is loaded in the player (highlighting is live). */
  isActive: boolean;
  /** Jump the player to a timestamp in seconds. */
  onSeek: (seconds: number) => void;
  /** Start playback if paused. */
  onPlay: () => void;
}

/** Full-line section markers: "[Chorus]", "**[Verse 2]**", "[Beat Drops]", "(Bridge)". */
const SECTION_LABEL = /^\s*(?:\*{0,2})?[[(【](?:\*{0,2})?[^\])】]*(?:\*{0,2})?[\])】]\s*(?:\*{0,2})?\s*$/;

export const isSectionLabel = (text: string): boolean => SECTION_LABEL.test(text);

const rowClass = (text: string, isCurrent: boolean, isPast: boolean, isStatic: boolean): string =>
  `hm-lyric-line${isCurrent ? ' is-current' : ''}${isPast ? ' is-past' : ''}${
    text.trim() === '' ? ' is-break' : ''
  }${isStatic ? ' is-static' : ''}`;

const Lyrics: React.FC<LyricsProps> = ({
  lines,
  staticText,
  activeIndex,
  currentTime,
  isActive,
  onSeek,
  onPlay,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<Array<HTMLElement | null>>([]);

  const timed = lines.length > 0;

  // Keep the highlighted line centered as the song plays, scrolling only the
  // lyric panel — never the page.
  useEffect(() => {
    if (!timed) return;
    const container = containerRef.current;
    const active = activeIndex >= 0 ? lineRefs.current[activeIndex] : null;
    if (!container || !active) return;
    const target = active.offsetTop - container.clientHeight / 2 + active.offsetHeight / 2;
    container.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
  }, [activeIndex, timed]);

  const renderWords = (line: LyricLine, isCurrent: boolean) =>
    line.words && line.words.length > 0 ? (
      // Word-level timings: each word fills in as it is sung.
      line.words.map((word, wordIndex) => {
        const isSung = isCurrent && currentTime >= word.start;
        return (
          <React.Fragment key={`${word.start}-${wordIndex}`}>
            {wordIndex > 0 ? ' ' : null}
            <span className={`hm-lyric-word${isSung ? ' is-sung' : ''}`}>{word.w}</span>
          </React.Fragment>
        );
      })
    ) : (
      // Plain timed line: the whole line highlights once its time passes.
      line.text
    );

  return (
    <div className={`hm-lyrics-panel${isActive ? ' is-live' : ''}`} ref={containerRef}>
      {timed
        ? lines.map((line, index) => {
            const isCurrent = index === activeIndex;
            const isPast = activeIndex >= 0 && index < activeIndex;
            const isBreak = line.text.trim() === '';
            return (
              <button
                key={`t-${line.time}-${index}`}
                type="button"
                ref={(element) => {
                  lineRefs.current[index] = element;
                }}
                className={rowClass(line.text, isCurrent, isPast, false)}
                onClick={() => {
                  onSeek(line.time);
                  onPlay();
                }}
                title="Jump to this line"
              >
                {isBreak ? '♪' : renderWords(line, isCurrent)}
              </button>
            );
          })
        : (staticText || '')
            .split(/\r?\n/)
            .map((raw, index) => {
              const text = raw.replace(/(\*\*)/g, '');
              if (isSectionLabel(raw)) return null;
              const isBreak = text.trim() === '';
              return (
                <span
                  key={`s-${index}`}
                  ref={(element) => {
                    lineRefs.current[index] = element;
                  }}
                  className={rowClass(text, false, false, true)}
                >
                  {isBreak ? '♪' : text.trim()}
                </span>
              );
            })}
    </div>
  );
};

export default Lyrics;
