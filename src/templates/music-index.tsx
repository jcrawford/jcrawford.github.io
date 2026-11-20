import React from 'react';
import { Link } from 'gatsby';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { useMusicPlayer, type MusicTrack } from '../components/MusicPlayerProvider';
import { musicAlbums, musicTracks } from '../utils/releaseGate';
import '../styles/music.css';

const formatDuration = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const TrackRow: React.FC<{ track: MusicTrack; index: number }> = ({ track, index }) => {
  const { play, currentTrack, isPlaying } = useMusicPlayer();
  const isCurrent = currentTrack?.slug === track.slug;
  const isLocked = Boolean(track.releaseAt && new Date(track.releaseAt).getTime() > Date.now());

  const playCell = isLocked ? (
    <span
      className="hm-music-track-play is-locked"
      title="Scheduled release — not on production yet"
      aria-label={`${track.title} — scheduled release`}
      onClick={() => track && play(track.slug, 'list')}
    >
      🔒
    </span>
  ) : (
    <button
      type="button"
      className="hm-music-track-play"
      onClick={() => play(track.slug, 'list')}
      aria-label={`Play ${track.title}`}
    >
      {isCurrent && isPlaying ? '❚❚' : '▶'}
    </button>
  );

  return (
    <li className={`hm-music-track${isCurrent ? ' is-current' : ''}${isLocked ? ' is-locked' : ''}`}>
      {playCell}
      <span className="hm-music-track-index">{String(index + 1).padStart(2, '0')}</span>
      <Link to={`/music/${track.slug}/`} className="hm-music-track-title">
        {track.title}
      </Link>
      {isLocked && track.releaseAt ? (
        <span className="hm-music-track-lockdate">
          {new Date(track.releaseAt).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </span>
      ) : (
        <span className="hm-music-track-duration">{formatDuration(track.duration)}</span>
      )}
    </li>
  );
};

const MusicIndexPage: React.FC = () => {
  const totalTracks = musicTracks.length;
  const totalMinutes = Math.round(musicTracks.reduce((sum, track) => sum + (track.duration || 0), 0) / 60);

  return (
    <Layout>
      <div className="hm-container hm-music">
        <header className="hm-music-header">
          <h1 className="hm-music-title">Music</h1>
          <p className="hm-music-intro">
            {totalTracks} {totalTracks === 1 ? 'track' : 'tracks'}
            {totalMinutes > 0 ? ` · about ${totalMinutes} minutes` : ''}. Press play on anything — nothing
            starts on its own, and the player keeps going while you browse the rest of the site.
          </p>
        </header>

        {totalTracks === 0 && (
          <p className="hm-music-empty">No tracks published yet.</p>
        )}

        {musicAlbums.map((album) => {
          const albumTracks = album.trackSlugs
            .map((slug) => musicTracks.find((track) => track.slug === slug))
            .filter((track): track is MusicTrack => Boolean(track));

          return (
            <section key={album.slug} className="hm-music-album">
              <div className="hm-music-album-head">
                <div className="hm-music-album-meta">
                  <h2 className="hm-music-album-title">{album.title}</h2>
                  <p className="hm-music-album-sub">
                    {album.artist}
                    {album.year ? ` · ${album.year}` : ''} · {albumTracks.length}{' '}
                    {albumTracks.length === 1 ? 'track' : 'tracks'}
                  </p>
                </div>
              </div>
              <ol className="hm-music-tracklist">
                {albumTracks.map((track, index) => (
                  <TrackRow key={track.slug} track={track} index={index} />
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </Layout>
  );
};

export default MusicIndexPage;

import { HeadFC } from 'gatsby';

export const Head: HeadFC = () => (
  <SEO
    title="Music"
    description="Songs written by Joseph Crawford, created and produced with Suno AI. Stream them here — nothing autoplays."
    pathname="/music/"
    siteMetadata={{
      title: 'Joseph Crawford',
      description:
        'Software engineering, AI tools, and homebrewing — written by Joseph Crawford, a developer building web applications and making mead in Vermont.',
      siteUrl: 'https://josephcrawford.com',
    }}
  />
);
