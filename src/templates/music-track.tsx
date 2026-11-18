import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, PageProps } from 'gatsby';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { trackBySlug, useMusicPlayer, type MusicTrack } from '../components/MusicPlayerProvider';
import SyncedLyrics from '../components/SyncedLyrics';
import lyricsIndex from '../data/music-lyrics.json';
import { activeLineIndex, parseLrc } from '../utils/lrc';
import '../styles/music.css';

interface MusicTrackContext {
  slug: string;
}

const formatDuration = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const MusicTrackPage: React.FC<PageProps<Record<string, never>, MusicTrackContext>> = ({ pageContext }) => {
  const track: MusicTrack | undefined = trackBySlug(pageContext.slug);
  const { cue, play, toggle, seek, currentTime, currentTrack, isPlaying } = useMusicPlayer();
  const [linkCopied, setLinkCopied] = useState(false);

  const lrcTracks = (lyricsIndex as { tracks?: Record<string, string> }).tracks || {};
  const timedLines = useMemo(
    () => parseLrc(track ? lrcTracks[track.slug] : undefined),
    [track, lrcTracks]
  );

  // Song pages load the track paused. The page's Play/Pause button and the
  // persistent player bar take it from there — no autonomous playback.
  const startedRef = useRef(false);
  useEffect(() => {
    if (!track || startedRef.current) return;
    startedRef.current = true;
    cue(track.slug);
  }, [track, cue]);

  if (!track) {
    return (
      <Layout>
        <div className="hm-container hm-music">
          <h1 className="hm-music-title">Track not found</h1>
          <p>
            <Link to="/music/">Back to all music</Link>
          </p>
        </div>
      </Layout>
    );
  }

  const isCurrent = currentTrack?.slug === track.slug;
  const activeIndex = isCurrent ? activeLineIndex(timedLines, currentTime) : -1;

  return (
    <Layout>
      <div className="hm-container hm-music hm-music-single">
        <nav className="hm-gallery-breadcrumb" aria-label="Breadcrumb">
          <Link to="/music/">Music</Link>
          <span className="hm-breadcrumb-separator">›</span>
          <span>{track.title}</span>
        </nav>

        <header className="hm-music-single-head">
          <img
            className="hm-music-single-cover"
            src={track.covers?.['800']?.jpg || track.covers?.['400']?.jpg || ''}
            alt={`${track.title} cover art`}
            width={320}
            height={320}
            loading="lazy"
          />
          <div className="hm-music-single-meta">
            <p className="hm-music-eyebrow">Song</p>
            <h1 className="hm-music-title">{track.title}</h1>
            <p className="hm-music-single-sub">
              {track.artist}
              {track.album ? ` · ${track.album}` : ''}
              {track.year ? ` · ${track.year}` : ''}
              {track.duration ? ` · ${formatDuration(track.duration)}` : ''}
            </p>
            <div className="hm-music-single-actions">
              <button
                type="button"
                className="hm-cta-btn hm-music-single-play"
                onClick={() => {
                  if (isCurrent) toggle();
                  else play(track.slug, 'song-page');
                }}
              >
                {isCurrent && isPlaying ? '❚❚ Pause' : '▶ Play'}
              </button>
              <button
                type="button"
                className="hm-music-single-share"
                onClick={() => {
                  const url = `${window.location.origin}/music/${track.slug}/`;
                  if (navigator.share) {
                    navigator.share({ title: track.title, url }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(url);
                  }
                  setLinkCopied(true);
                  window.setTimeout(() => setLinkCopied(false), 2000);
                }}
              >
                {linkCopied ? 'Link copied ✓' : 'Copy link'}
              </button>
            </div>
          </div>
        </header>

        <section className="hm-music-single-details" aria-label="Track details">
          <h2 className="hm-music-details-title">Track details</h2>
          <dl className="hm-music-details-grid">
            {track.createdAt && (
              <>
                <dt>Created</dt>
                <dd>
                  {new Date(track.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'UTC',
                  })}
                </dd>
              </>
            )}
            <dt>Artist</dt>
            <dd>{track.artist}</dd>
            <dt>Album</dt>
            <dd>{track.album}</dd>
            {track.year && (
              <>
                <dt>Year</dt>
                <dd>{track.year}</dd>
              </>
            )}
            <dt>Length</dt>
            <dd>{formatDuration(track.duration)}</dd>
            {track.format?.codec && (
              <>
                <dt>Format</dt>
                <dd>
                  {track.format.codec}
                  {track.format.sampleRate ? ` · ${track.format.sampleRate.toLocaleString('en-US')} Hz` : ''}
                </dd>
              </>
            )}
            {track.format?.bitrateKbps ? (
              <>
                <dt>Bitrate</dt>
                <dd>{track.format.bitrateKbps.toLocaleString('en-US')} kbps</dd>
              </>
            ) : null}
            {track.format?.lossless && (
              <>
                <dt>Quality</dt>
                <dd>Lossless</dd>
              </>
            )}
          </dl>
        </section>

        {timedLines.length > 0 ? (
          <section className="hm-music-single-lyrics" aria-label="Lyrics">
            <h2 className="hm-music-details-title">Lyrics</h2>
            <SyncedLyrics
              lines={timedLines}
              activeIndex={isCurrent ? activeIndex : -1}
              isActive={isCurrent}
              onSeek={seek}
              onPlay={() => {
                if (!isCurrent) play(track.slug, 'song-page');
                else if (!isPlaying) toggle();
              }}
            />
          </section>
        ) : (
          track.lyrics && (
            <section className="hm-music-single-lyrics" aria-label="Lyrics">
              <h2 className="hm-music-details-title">Lyrics</h2>
              <pre className="hm-music-lyrics-text">{track.lyrics}</pre>
            </section>
          )
        )}

        <p className="hm-music-back">
          <Link to="/music/">← All music</Link>
        </p>
      </div>
    </Layout>
  );
};

export default MusicTrackPage;

import { HeadFC } from 'gatsby';

export const Head: HeadFC<Record<string, never>, MusicTrackContext> = ({ pageContext }) => {
  const track = trackBySlug(pageContext.slug);
  const cover = track?.covers?.['800']?.jpg;

  return (
    <SEO
      title={track ? `${track.title} — Music` : 'Music'}
      description={
        track
          ? `Listen to ${track.title} by ${track.artist}${track.album ? ` from ${track.album}` : ''}.`
          : 'Songs by Joseph Crawford.'
      }
      image={cover}
      pathname={track ? `/music/${track.slug}/` : '/music/'}
      siteMetadata={{
        title: 'Joseph Crawford',
        description:
          'Software engineering, AI tools, and homebrewing — written by Joseph Crawford, a developer building web applications and making mead in Vermont.',
        siteUrl: 'https://josephcrawford.com',
      }}
    />
  );
};
