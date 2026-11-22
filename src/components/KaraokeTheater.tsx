import React, { useEffect, useMemo, useRef } from 'react';
import { useMusicPlayer } from './MusicPlayerProvider';
import { activeLineIndex, type LyricLine } from '../utils/lrc';

/**
 * KaraokeTheater — fullscreen "karaoke video" overlay for mobile.
 *
 * Fills the viewport (100dvh fake-fullscreen: works identically on iOS Safari
 * and Android Chrome), paints a black stage with a blurred cover backdrop,
 * and shows the timed lyrics in huge type with the same clip-path word fill
 * as the inline panel. The shared <audio> element keeps playing underneath;
 * the persistent bar, support bar and hint are suppressed via the body class
 * `hm-theater-open`.
 *
 * Rendered by the song page when `theater` mode is enabled. Auto-opens on
 * coarse-pointer (mobile) layouts when the user taps the page Play button —
 * an explicit user gesture, close() unwraps back to the normal page.
 */

interface KaraokeTheaterProps {
  lines: LyricLine[];
  /** Cover art URL (largest available) for the blurred backdrop. */
  coverUrl: string;
  /** Track title / artist shown in the header. */
  title: string;
  artist: string;
  /** Unwrap the overlay back to the normal page. */
  onClose: () => void;
}

const formatTime = (seconds: number): string => {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
};

/**
 * Interlude countdown: when a lyric line is followed by a long instrumental
 * gap (dead air measured from where the vocal actually ends, via the A2ext
 * hold stamps, to the next line's stamp), count the singer in 3-2-1 over the
 * final seconds of the gap. Short gaps between lines stay silent.
 */
const INTERLUDE_GAP_MIN = 5; // seconds of dead air before a countdown is warranted
const INTERLUDE_LEAD = 3; // seconds ahead of the next line the countdown covers

const KaraokeTheater: React.FC<KaraokeTheaterProps> = ({ lines, coverUrl, title, artist, onClose }) => {
  const { currentTime, isPlaying, toggle, seek, duration } = useMusicPlayer();

  const activeIndex = useMemo(() => activeLineIndex(lines, currentTime), [lines, currentTime]);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Interlude countdown: find a long instrumental gap whose 3-2-1 window the
  // playhead is currently inside. Dead air = next line's stamp minus where the
  // previous line's vocal actually ends (its hold stamp), so a sung line that
  // trails into the gap doesn't shorten the interlude.
  const interlude = useMemo(() => {
    if (lines.length === 0) return null;
    let threshold: number | null = null;
    let nextIndex = -1;
    for (let i = 0; i < lines.length - 1; i += 1) {
      const wordEnd = lines[i].words?.length
        ? lines[i].words![lines[i].words!.length - 1].end
        : lines[i].time;
      const deadAir = lines[i + 1].time - wordEnd;
      if (deadAir >= INTERLUDE_GAP_MIN) {
        if (currentTime < lines[i].time) break; // gap is still ahead of the playhead
        if (currentTime < lines[i + 1].time) {
          const nextStart = lines[i + 1].time;
          threshold = nextStart - INTERLUDE_LEAD;
          nextIndex = i + 1;
          break;
        }
      }
    }
    const counting = threshold !== null && currentTime >= threshold && isPlaying;
    return {
      counting,
      threshold,
      nextIndex,
      // Where the quiet stretch begins: the previous line's true vocal end.
      gapStart: nextIndex > 0 && lines[nextIndex - 1].words?.length
        ? lines[nextIndex - 1].words![lines[nextIndex - 1].words!.length - 1].end
        : null,
    };
  }, [lines, currentTime, isPlaying]);


  // Keep the active line pinned in the middle third of the stage. During an
  // interlude countdown, pin the upcoming line instead so the singer can see
  // what they are queuing into.
  const pinnedIndex = interlude?.counting && interlude.nextIndex >= 0 ? interlude.nextIndex : activeIndex;
  useEffect(() => {
    const container = panelRef.current;
    const active = pinnedIndex >= 0 ? rowRefs.current[pinnedIndex] : null;
    if (!container || !active) return;
    const target = active.offsetTop - container.clientHeight * 0.4;
    container.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
  }, [pinnedIndex]);

  // 3-2-1 number for the current countdown tick (each digit holds ~1 s).
  const countdown =
    interlude?.counting && interlude.nextIndex >= 0
      ? Math.min(3, Math.max(1, Math.ceil(lines[interlude.nextIndex].time - currentTime)))
      : null;

  // Phase banner: "brief timeout" over the whole quiet stretch, replaced by
  // the 3-2-1 during the final seconds before the vocal returns.
  const inGap = (() => {
    if (!interlude || interlude.nextIndex < 0 || !isPlaying) return false;
    const nextStart = lines[interlude.nextIndex].time;
    const gapStart =
      interlude.gapStart !== null
        ? interlude.gapStart
        : Math.max(0, nextStart - INTERLUDE_GAP_MIN);
    return currentTime >= gapStart && currentTime < nextStart - INTERLUDE_LEAD;
  })();
  const showTimeout = inGap && countdown === null;

  // Lock page scroll + suppress site chrome while the theater is open.
  useEffect(() => {
    document.body.classList.add('hm-theater-open');
    return () => document.body.classList.remove('hm-theater-open');
  }, []);

  // Esc closes the theater (desktop keyboards / phone keyboards with Esc).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const renderLine = (line: LyricLine, isCurrent: boolean) => {
    if (line.text.trim() === '') return <span className="hm-theater-break">♪</span>;
    if (!isCurrent || !line.words || line.words.length === 0) return line.text;
    // Active line with word timings: reuse the clip-path fill look at large size.
    let activeWordIndex = -1;
    for (let i = 0; i < line.words.length; i += 1) {
      if (currentTime >= line.words[i].start) activeWordIndex = i;
      else break;
    }
    return line.words.map((word, wordIndex) => {
      const isSung = wordIndex < activeWordIndex;
      const isSpeaking = wordIndex === activeWordIndex;
      let fillProgress = 0;
      if (isSpeaking) {
        const span = Math.max(word.end - word.start, 0.001);
        fillProgress = Math.min(1, Math.max(0, (currentTime - word.start) / span));
      }
      return (
        <React.Fragment key={`${line.time}-${wordIndex}`}>
          {wordIndex > 0 ? ' ' : null}
          <span
            className={`hm-theater-word${isSung || (isSpeaking && fillProgress >= 1) ? ' is-sung' : ''}`}
          >
            {word.w}
            {isSpeaking && fillProgress > 0 && (
              <span
                aria-hidden="true"
                className="hm-theater-word-fill"
                style={{ clipPath: `inset(0 ${(100 - fillProgress * 100).toFixed(1)}% 0 0)` }}
              >
                {word.w}
              </span>
            )}
          </span>
        </React.Fragment>
      );
    });
  };

  return (
    <div className="hm-theater" role="dialog" aria-label={`Now playing: ${title}`}>
      <div className="hm-theater-backdrop" style={{ backgroundImage: `url(${coverUrl})` }} aria-hidden="true" />
      <div className="hm-theater-stage">
        <header className="hm-theater-head">
          <img className="hm-theater-cover" src={coverUrl} alt="" width={48} height={48} />
          <div className="hm-theater-meta">
            <span className="hm-theater-title">{title}</span>
            <span className="hm-theater-artist">{artist}</span>
          </div>
          <button
            type="button"
            className="hm-theater-close"
            onClick={onClose}
            aria-label="Close karaoke view"
          >
            ✕
          </button>
        </header>

        <div className="hm-theater-lyrics" ref={panelRef}>
          {lines.map((line, index) => {
            const isCurrent = index === activeIndex;
            const isPast = activeIndex >= 0 && index < activeIndex;
            const isUpcoming = countdown !== null && index === interlude?.nextIndex;
            return (
              <div
                key={`th-${line.time}-${index}`}
                ref={(el) => {
                  rowRefs.current[index] = el;
                }}
                className={`hm-theater-line${isCurrent ? ' is-current' : ''}${isPast ? ' is-past' : ''}${isUpcoming ? ' is-upcoming' : ''}`}
                onClick={() => {
                  seek(line.time);
                }}
              >
                {renderLine(line, isCurrent)}
              </div>
            );
          })}
        </div>

        {(showTimeout || countdown !== null) && (
          <div
            className={`hm-theater-interlude${countdown !== null ? ' is-counting' : ''}`}
            aria-hidden="true"
          >
            <div className="hm-theater-interlude-card">
              <span className="hm-theater-interlude-title">musical interlude</span>
              {countdown !== null && (
                <span key={countdown} className="hm-theater-count-num">
                  {countdown}
                </span>
              )}
            </div>
          </div>
        )}

        <footer className="hm-theater-controls">
          <button type="button" className="hm-theater-ctl" onClick={() => seek(Math.max(0, currentTime - 10))} aria-label="Back 10 seconds">
            ↺10
          </button>
          <button type="button" className="hm-theater-ctl hm-theater-play" onClick={toggle} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button type="button" className="hm-theater-ctl" onClick={() => seek(Math.min(duration, currentTime + 10))} aria-label="Forward 10 seconds">
            10↻
          </button>
          <div className="hm-theater-seek">
            <span className="hm-theater-time">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="Seek"
              style={{ '--hm-theater-progress': `${progress}%` } as React.CSSProperties}
            />
            <span className="hm-theater-time">{formatTime(duration)}</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default KaraokeTheater;
