import React, { useEffect } from 'react';
import { Link, PageProps } from 'gatsby';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { trackBySlug, useMusicPlayer, type MusicTrack } from '../components/MusicPlayerProvider';
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
  const { cue, play, currentTrack, isPlaying } = useMusicPlayer();

  // Load the track into the player without starting it. Opening a song page —
  // including via a direct URL — should cue it, never auto-play.
  useEffect(() => {
    if (track) cue(track.slug);
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
                onClick={() => (isCurrent ? play(track.slug) : play(track.slug))}
              >
                {isCurrent && isPlaying ? '❚❚ Pause' : '▶ Play'}
              </button>
            </div>
            <p className="hm-music-single-hint">
              Loads paused — nothing starts until you press play. The player dock stays at the bottom of every
              page while the song keeps playing.
            </p>
          </div>
        </header>

        <p className="hm-music-single-note">
          Streaming from <a href={track.src}>the music host</a>.
        </p>

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
