import React, { useEffect, useRef } from 'react';
import type { LyricLine } from '../utils/lrc';

interface SyncedLyricsProps {
  lines: LyricLine[];
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

const SyncedLyrics: React.FC<SyncedLyricsProps> = ({
  lines,
  activeIndex,
  currentTime,
  isActive,
  onSeek,
  onPlay,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Keep the highlighted line centered as the song plays, scrolling only the
  // lyric panel — never the page.
  useEffect(() => {
    const container = containerRef.current;
    const active = activeIndex >= 0 ? lineRefs.current[activeIndex] : null;
    if (!container || !active) return;
    const target = active.offsetTop - container.clientHeight / 2 + active.offsetHeight / 2;
    container.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
  }, [activeIndex]);

  return (
    <div className={`hm-lyrics-panel${isActive ? ' is-live' : ''}`} ref={containerRef}>
      {lines.map((line, index) => {
        const isCurrent = index === activeIndex;
        const isPast = activeIndex >= 0 && index < activeIndex;
        return (
          <button
            key={`${line.time}-${index}`}
            type="button"
            ref={(element) => {
              lineRefs.current[index] = element;
            }}
            className={`hm-lyric-line${isCurrent ? ' is-current' : ''}${
              isPast ? ' is-past' : ''
            }${line.text.trim() === '' ? ' is-break' : ''}`}
            onClick={() => {
              onSeek(line.time);
              onPlay();
            }}
            title="Jump to this line"
          >
            {line.words && line.words.length > 0 ? (
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
            ) : line.text.trim() === '' ? (
              '♪'
            ) : (
              line.text
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SyncedLyrics;
