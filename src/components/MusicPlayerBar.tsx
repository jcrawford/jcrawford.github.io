import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'gatsby';
import { trackBySlug, useMusicPlayer, type MusicTrack } from './MusicPlayerProvider';
import { onCoverError } from '../utils/coverFallback';
import KaraokeTheater from './KaraokeTheater';
import { parseLrc, type LyricLine } from '../utils/lrc';
import lyricsIndex from '../data/music-lyrics.json';
import wordLyricsIndex from '../data/music-word-lyrics.json';

/** localStorage flag so the "player is here" callout appears on first visit only. */
const HINT_SEEN_KEY = 'hm-music-hint-seen';

/**
 * Trochoid coil: x = r·sin(t), y = c·t − r·cos(t) + r. When the vertical pitch is
 * shorter than the hoop circumference the curve genuinely loops back on itself,
 * which is what makes the trail read as a swirl rather than a wavy line.
 */
const buildSwirl = (w: number, h: number): string => {
  if (w < 20 || h < 80) return '';
  const arrowSpace = 30;
  const cx = w / 2;
  const loops = Math.max(2, Math.min(4, Math.round((h - arrowSpace) / 165)));
  const pitch = (h - arrowSpace) / loops;
  const trend = pitch / (Math.PI * 2); // vertical advance per radian
  const rx = Math.min(w * 0.4, 130);
  // Hoop height must exceed the per-radian advance or the curve never crosses
  // itself and stops reading as a loop.
  let ry = Math.min(Math.max(trend * 1.75, 10), 46);
  const step = 0.08;
  const total = loops * Math.PI * 2;

  const sample = (ryValue: number) => {
    const points: Array<[number, number]> = [];
    let peak = 0;
    for (let t = 0; t <= total + 1e-6; t += step) {
      const x = cx + rx * Math.sin(t);
      const y = trend * t - ryValue * Math.cos(t) + ryValue;
      points.push([x, y]);
      if (y > peak) peak = y;
    }
    return { points, peak };
  };

  // Shrink the hoop if the last bulge would collide with the arrowhead.
  let sampled = sample(ry);
  while (sampled.peak > h - 8 && ry > 5) {
    ry *= 0.85;
    sampled = sample(ry);
  }

  return sampled.points
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ');
};

const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const REPEAT_LABEL: Record<string, string> = {
  off: 'Repeat off',
  all: 'Repeat all',
  one: 'Repeat one',
};

/**
 * Persistent playback dock. The callout renders on music pages as soon as the
 * page loads; the transport row appears once a track is cued or playing.
 */
const MusicPlayerBar: React.FC = () => {
  const {
    queue,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    muted,
    shuffle,
    repeat,
    toggle,
    next,
    previous,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    close,
  } = useMusicPlayer();
  const [panelOpen, setPanelOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [theaterOpen, setTheaterOpen] = useState(false);
  const trailRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);
  const [trailSize, setTrailSize] = useState({ w: 0, h: 0 });

  // Timed lyrics for the currently cued track — the footer karaoke button only
  // renders when a karaoke view is actually available. Same precedence as the
  // song page: word-JSON export beats enhanced LRC; no data → no button.
  const lrcTracks = (lyricsIndex as { tracks?: Record<string, string> }).tracks || {};
  const wordTracks = (wordLyricsIndex as { tracks?: Record<string, LyricLine[]> }).tracks || {};
  const theaterLines = useMemo<LyricLine[]>(() => {
    if (!currentTrack) return [];
    const wordLines = wordTracks[currentTrack.slug];
    if (wordLines && wordLines.length > 0) return wordLines;
    return parseLrc(lrcTracks[currentTrack.slug]);
  }, [currentTrack, lrcTracks, wordTracks]);
  const hasTheater = theaterLines.length > 0;

  // Measure the trail so the coil spans exactly from the card edge to the dock.
  useEffect(() => {
    if (!showHint) return;
    const el = trailRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setTrailSize({ w: Math.round(rect.width), h: Math.round(rect.height) });
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [showHint]);

  const swirlPath = useMemo(() => buildSwirl(trailSize.w, trailSize.h), [trailSize.w, trailSize.h]);

  // Callout on the music pages, once per browser. The seen flag is written the
  // moment the callout is shown, so a reload never shoves it at the reader
  // again — first visit only, as a cookie-equivalent in localStorage.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.location.pathname.startsWith('/music')) return;
    let seen = false;
    try {
      seen = window.localStorage.getItem(HINT_SEEN_KEY) === '1';
    } catch {
      seen = false; // storage blocked: treat as first visit rather than hide forever
    }
    if (seen) return;
    setShowHint(true);
    try {
      window.localStorage.setItem(HINT_SEEN_KEY, '1');
    } catch {
      // Non-fatal: the callout just re-appears next visit.
    }
    const timer = window.setTimeout(() => setShowHint(false), 12000);
    return () => window.clearTimeout(timer);
  }, []);

  // The support banner and header scroll with the page, but this fixed callout
  // does not — so on load, push the callout below whatever page chrome is
  // currently pinned over it, then never move it again.
  useEffect(() => {
    if (!showHint) return;
    const hint = hintRef.current;
    if (!hint) return;
    const clamp = () => {
      // The sticky support banner rides on top of everything; the header only
      // occupies the top while the page is unscrolled. Take whichever is lower.
      const chrome = [document.getElementById('masthead'), document.querySelector('.support-bar')]
        .filter((el): el is HTMLElement => Boolean(el));
      let chromeBottom = 0;
      for (const el of chrome) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom > chromeBottom) chromeBottom = rect.bottom;
      }
      if (hint.getBoundingClientRect().top < chromeBottom) {
        hint.style.setProperty('--hm-hint-top', `${Math.round(chromeBottom)}px`);
      }
    };
    const raf = requestAnimationFrame(() => requestAnimationFrame(clamp));
    const timer = window.setTimeout(clamp, 250); // after SupportBar's fade-in
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [showHint]);

  // Chrome covers the callout only while the page is unscrolled. Once the
  // reader scrolls, the banner scrolls away — relax to the base offset.
  useEffect(() => {
    if (!showHint) return;
    const hint = hintRef.current;
    if (!hint) return;
    const onScroll = () => {
      if (window.scrollY > 4) {
        hint.style.setProperty('--hm-hint-top', '');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true, once: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [showHint]);

  const dismissHint = () => setShowHint(false);

  // Keyboard shortcuts, skipped while the reader is typing in a field.
  useEffect(() => {
    if (!currentTrack) return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (target && target.isContentEditable) return;
      if (event.code === 'Space') {
        event.preventDefault();
        toggle();
      } else if (event.code === 'ArrowRight' && event.shiftKey) {
        next();
      } else if (event.code === 'ArrowLeft' && event.shiftKey) {
        previous();
      } else if (event.code === 'KeyM' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
        toggleMute();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentTrack, toggle, next, previous, toggleMute]);

  if (!currentTrack && !showHint) return null;

  const cover = currentTrack?.covers?.['160']?.jpg || currentTrack?.covers?.['400']?.jpg || '';
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const queueTracks: MusicTrack[] = queue
    .map((slug) => trackBySlug(slug))
    .filter((t): t is MusicTrack => Boolean(t));
  const activeIndex = currentTrack ? queueTracks.findIndex((t) => t.slug === currentTrack.slug) : -1;

  return (
    <>
      {showHint && (
        <div className="hm-music-hint" role="status" ref={hintRef}>
          <div className="hm-music-hint-card">
            <p className="hm-music-hint-eyebrow">{currentTrack ? 'Now playing' : 'Music player'}</p>
            <p className="hm-music-hint-title">The player is here</p>
            <p className="hm-music-hint-sub">
              {currentTrack
                ? 'It stays at the bottom of the page and keeps playing while you browse.'
                : 'Press play on any song above. The dock sits at the bottom of the page and keeps playing while you browse.'}
            </p>
            <button type="button" className="hm-music-hint-cta" onClick={dismissHint}>
              Got it
            </button>
          </div>
          <div className="hm-music-hint-trail" aria-hidden="true" ref={trailRef}>
            {trailSize.w > 0 && trailSize.h > 0 && (
              <svg
                className="hm-music-hint-swirl"
                viewBox={`0 0 ${trailSize.w} ${trailSize.h}`}
                preserveAspectRatio="none"
                focusable="false"
              >
                <path
                  className="hm-music-hint-swirl-path"
                  d={swirlPath}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  className="hm-music-hint-arrowhead"
                  d={`M ${trailSize.w / 2} ${trailSize.h} L ${trailSize.w / 2 - 15} ${
                    trailSize.h - 30
                  } L ${trailSize.w / 2 + 15} ${trailSize.h - 30} Z`}
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            )}
          </div>
        </div>
      )}

      <div className={`hm-music-bar${currentTrack ? ' is-active' : ''}`} role="region" aria-label="Music player">
        {currentTrack && (
        <>
          <div className="hm-music-bar-inner">
            <div className="hm-music-bar-track">
              <button
                type="button"
                className="hm-music-bar-expand"
                onClick={() => {
                  dismissHint();
                  setPanelOpen((open) => !open);
                }}
                aria-expanded={panelOpen}
                aria-label={panelOpen ? 'Hide queue' : 'Show queue'}
              >
                <img
                  className="hm-music-bar-cover"
                  src={cover}
                  alt=""
                  width={48}
                  height={48}
                  loading="lazy"
                  onError={onCoverError}
                />
                <span className="hm-music-bar-expand-hint">{panelOpen ? '▾' : '▸'}</span>
              </button>
              <Link to={`/music/${currentTrack.slug}/`} className="hm-music-bar-meta">
                <span className="hm-music-bar-title">{currentTrack.title}</span>
                <span className="hm-music-bar-artist">
                  {currentTrack.artist}
                  {currentTrack.album ? ` · ${currentTrack.album}` : ''}
                </span>
              </Link>
            </div>

            <div className="hm-music-bar-controls">
              <button
                type="button"
                className={`hm-music-btn hm-music-btn-toggle${shuffle ? ' is-active' : ''}`}
                onClick={() => {
                  dismissHint();
                  toggleShuffle();
                }}
                aria-pressed={shuffle}
                aria-label={shuffle ? 'Shuffle on' : 'Shuffle off'}
                title="Shuffle"
              >
                ⇄
              </button>
              <button
                type="button"
                className="hm-music-btn"
                onClick={() => {
                  dismissHint();
                  previous();
                }}
                aria-label="Previous track"
              >
                ⏮
              </button>
              <button
                type="button"
                className="hm-music-btn hm-music-btn-play"
                onClick={() => {
                  dismissHint();
                  toggle();
                }}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? '❚❚' : '▶'}
              </button>
              <button
                type="button"
                className="hm-music-btn"
                onClick={() => {
                  dismissHint();
                  next();
                }}
                aria-label="Next track"
              >
                ⏭
              </button>
              <button
                type="button"
                className={`hm-music-btn hm-music-btn-toggle${repeat !== 'off' ? ' is-active' : ''}`}
                onClick={cycleRepeat}
                aria-pressed={repeat !== 'off'}
                aria-label={REPEAT_LABEL[repeat]}
                title={REPEAT_LABEL[repeat]}
              >
                {repeat === 'one' ? '🔂' : '🔁'}
              </button>
            </div>

            <div className="hm-music-bar-progress">
              <span className="hm-music-time">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || currentTrack.duration || 0}
                step={1}
                value={Math.min(currentTime, duration || currentTrack.duration || 0)}
                onChange={(event) => seek(Number(event.target.value))}
                aria-label="Seek"
                style={{ ['--hm-music-progress' as string]: `${progress}%` }}
              />
              <span className="hm-music-time">{formatTime(duration || currentTrack.duration || 0)}</span>
            </div>

            <div className="hm-music-bar-side">
              {hasTheater && (
                <button
                  type="button"
                  className="hm-music-btn hm-music-btn-karaoke"
                  onClick={() => {
                    dismissHint();
                    setTheaterOpen(true);
                  }}
                  aria-label="Open karaoke view for the current song"
                  aria-haspopup="dialog"
                >
                  <span className="hm-music-btn-karaoke-icon" aria-hidden="true">
                    🎤
                  </span>
                  <span className="hm-music-btn-karaoke-label">Karaoke</span>
                </button>
              )}
              <button
                type="button"
                className={`hm-music-btn hm-music-btn-toggle${muted ? ' is-active' : ''}`}
                onClick={toggleMute}
                aria-pressed={muted}
                aria-label={muted ? 'Unmute' : 'Mute'}
                title={muted ? 'Unmute (M)' : 'Mute (M)'}
              >
                {muted || volume === 0 ? '🔇' : '🔊'}
              </button>
              <input
                className="hm-music-volume"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                aria-label="Volume"
              />
              <button type="button" className="hm-music-btn hm-music-btn-close" onClick={close} aria-label="Close player">
                ✕
              </button>
            </div>
          </div>

          {panelOpen && (
            <div className="hm-music-queue" role="list" aria-label="Up next">
              <div className="hm-music-queue-head">
                <span>Up next</span>
                <span className="hm-music-queue-count">
                  {activeIndex >= 0
                    ? `${queueTracks.length - activeIndex - 1} remaining`
                    : `${queueTracks.length} tracks`}
                </span>
              </div>
              <ol className="hm-music-queue-list">
                {queueTracks.map((track, index) => (
                  <li
                    key={track.slug}
                    className={`hm-music-queue-item${track.slug === currentTrack.slug ? ' is-current' : ''}`}
                  >
                    <span className="hm-music-queue-pos">
                      {track.slug === currentTrack.slug ? '▶' : String(index + 1).padStart(2, '0')}
                    </span>
                    <img
                      className="hm-music-queue-cover"
                      src={track.covers?.['160']?.jpg || track.covers?.['400']?.jpg || ''}
                      alt=""
                      width={32}
                      height={32}
                      loading="lazy"
                      onError={onCoverError}
                    />
                    <Link
                      to={`/music/${track.slug}/`}
                      className="hm-music-queue-title"
                      onClick={() => setPanelOpen(false)}
                    >
                      {track.title}
                    </Link>
                    <span className="hm-music-queue-duration">{formatTime(track.duration)}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </>
        )}
      </div>

      {theaterOpen && currentTrack && hasTheater && (
        <KaraokeTheater
          key={currentTrack.slug}
          lines={theaterLines}
          coverUrl={currentTrack.covers?.['800']?.jpg || currentTrack.covers?.['400']?.jpg || ''}
          title={currentTrack.title}
          artist={currentTrack.artist}
          onClose={() => setTheaterOpen(false)}
        />
      )}
    </>
  );
};

export default MusicPlayerBar;
