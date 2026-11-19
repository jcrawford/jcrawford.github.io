import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, PageProps } from 'gatsby';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { trackBySlug, useMusicPlayer, type MusicTrack } from '../components/MusicPlayerProvider';
import Lyrics from '../components/Lyrics';
import KaraokeTheater from '../components/KaraokeTheater';
import lyricsIndex from '../data/music-lyrics.json';
import wordLyricsIndex from '../data/music-word-lyrics.json';
import { activeLineIndex, parseLrc, type LyricLine } from '../utils/lrc';
import { onCoverError } from '../utils/coverFallback';
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

/**
 * /music-2/<slug>/ — karaoke-theater test bed.
 *
 * Same manifest data and same page chrome as /music/<slug>/; the difference is
 * the extra "Open karaoke view" button on every form factor. Opening is always
 * an explicit user action — playback never auto-opens the theater.
 */
const MusicTrackTheaterPage: React.FC<PageProps<Record<string, never>, MusicTrackContext>> = ({ pageContext }) => {
  const track: MusicTrack | undefined = trackBySlug(pageContext.slug);
  const { cue, play, toggle, seek, currentTime, currentTrack, isPlaying } = useMusicPlayer();
  const [linkCopied, setLinkCopied] = useState(false);
  const [theaterOpen, setTheaterOpen] = useState(false);

  const lrcTracks = (lyricsIndex as { tracks?: Record<string, string> }).tracks || {};
  const wordTracks = (wordLyricsIndex as { tracks?: Record<string, LyricLine[]> }).tracks || {};
  // Word-level timings win; plain LRC is the fallback; the ID3 lyrics tag is last.
  const timedLines = useMemo<LyricLine[]>(() => {
    if (!track) return [];
    const wordLines = wordTracks[track.slug];
    if (wordLines && wordLines.length > 0) return wordLines;
    return parseLrc(lrcTracks[track.slug]);
  }, [track, lrcTracks, wordTracks]);

  // Song pages load the track paused. The Play button (which also opens the
  // theater on mobile) takes it from there — no autonomous playback.
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
            <Link to="/music-2/">Back to all music</Link>
          </p>
        </div>
      </Layout>
    );
  }

  const isCurrent = currentTrack?.slug === track.slug;
  const activeIndex = isCurrent ? activeLineIndex(timedLines, currentTime) : -1;
  const theaterCover = track.covers?.['800']?.jpg || track.covers?.['400']?.jpg || '';

  return (
    <Layout>
      <div className="hm-container hm-music hm-music-single">
        <nav className="hm-gallery-breadcrumb" aria-label="Breadcrumb">
          <Link to="/music-2/">Music</Link>
          <span className="hm-breadcrumb-separator">›</span>
          <span>{track.title}</span>
          <span className="hm-music-beta-tag" title="Karaoke theater test bed">
            KARAOKE BETA
          </span>
        </nav>

        <header className="hm-music-single-head">
          <img
            className="hm-music-single-cover"
            src={track.covers?.['800']?.jpg || track.covers?.['400']?.jpg || ''}
            alt={`${track.title} cover art`}
            width={320}
            height={320}
            loading="lazy"
            onError={onCoverError}
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
                  const url = `${window.location.origin}/music-2/${track.slug}/`;
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
              {/* Always available: explicit open (auto-open stays a mobile behavior) */}
              <button
                type="button"
                className="hm-music-single-share"
                onClick={() => setTheaterOpen(true)}
              >
                Open karaoke view
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
          </dl>
        </section>

        {(timedLines.length > 0 || track.lyrics) && (
          <section className="hm-music-single-lyrics" aria-label="Lyrics">
            <h2 className="hm-music-details-title">Lyrics</h2>
            <Lyrics
              lines={timedLines}
              staticText={track.lyrics ?? ''}
              activeIndex={isCurrent ? activeIndex : -1}
              currentTime={isCurrent ? currentTime : -1}
              isActive={isCurrent}
              onSeek={seek}
              onPlay={() => {
                if (!isCurrent) play(track.slug, 'song-page');
                else if (!isPlaying) toggle();
              }}
            />
          </section>
        )}

        <p className="hm-music-back">
          <Link to="/music-2/">← All music</Link>
        </p>
      </div>

      {theaterOpen && timedLines.length > 0 && (
        <KaraokeTheater
          lines={timedLines}
          coverUrl={theaterCover}
          title={track.title}
          artist={track.artist}
          onClose={() => setTheaterOpen(false)}
        />
      )}
    </Layout>
  );
};

export default MusicTrackTheaterPage;

import { HeadFC } from 'gatsby';

export const Head: HeadFC<Record<string, never>, MusicTrackContext> = ({ pageContext }) => {
  const track = trackBySlug(pageContext.slug);
  const cover = track?.covers?.['800']?.jpg;

  return (
    <SEO
      title={track ? `${track.title} — Music (Karaoke Beta)` : 'Music'}
      description={
        track
          ? `Listen to ${track.title} by ${track.artist}${track.album ? ` from ${track.album}` : ''}.`
          : 'Songs by Joseph Crawford.'
      }
      image={cover}
      pathname={track ? `/music-2/${track.slug}/` : '/music-2/'}
      siteMetadata={{
        title: 'Joseph Crawford',
        description:
          'Software engineering, AI tools, and homebrewing — written by Joseph Crawford, a developer building web applications and making mead in Vermont.',
        siteUrl: 'https://josephcrawford.com',
      }}
    />
  );
};
