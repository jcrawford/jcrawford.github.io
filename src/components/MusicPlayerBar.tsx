import React, { useEffect, useState } from 'react';
import { Link } from 'gatsby';
import { trackBySlug, useMusicPlayer, type MusicTrack } from './MusicPlayerProvider';

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

  // Callout on the music pages, every visit for now.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.location.pathname.startsWith('/music')) return;
    setShowHint(true);
    const timer = window.setTimeout(() => setShowHint(false), 12000);
    return () => window.clearTimeout(timer);
  }, []);

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
    <div className={`hm-music-bar${currentTrack ? ' is-active' : ''}`} role="region" aria-label="Music player">
      {showHint && (
        <div className="hm-music-hint" role="status">
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
          <div className="hm-music-hint-trail" aria-hidden="true">
            <span className="hm-music-hint-line" />
            <svg className="hm-music-hint-chevron" viewBox="0 0 32 18" focusable="false">
              <path d="M2 2 L16 15 L30 2" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <svg
              className="hm-music-hint-chevron"
              viewBox="0 0 32 18"
              focusable="false"
              style={{ animationDelay: '0.22s' }}
            >
              <path d="M2 2 L16 15 L30 2" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <svg
              className="hm-music-hint-chevron"
              viewBox="0 0 32 18"
              focusable="false"
              style={{ animationDelay: '0.44s' }}
            >
              <path d="M2 2 L16 15 L30 2" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      )}

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
                <img className="hm-music-bar-cover" src={cover} alt="" width={48} height={48} loading="lazy" />
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
  );
};

export default MusicPlayerBar;
