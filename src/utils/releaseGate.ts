/**
 * Scheduled-release gate for the music section.
 *
 * Tracks whose `releaseAt` (from src/data/music-release-schedule.json, merged
 * into the manifest at generation time) is still in the future are:
 *   - production (gatsby build / NODE_ENV=production): removed entirely —
 *     not in musicTracks, no album entry, no page, invisible everywhere.
 *   - development (gatsby develop / zrok preview): kept, so Joseph can
 *     preview the locked song — the index shows a lock icon + release date
 *     and the song page renders a locked placeholder instead of the player.
 *
 * A track is only considered "gated" while its time is in the future; once
 * `releaseAt` passes, every build (dev and prod) treats it as public and the
 * schedule entry can be deleted afterwards.
 */
import { musicTracks as allTracks, musicAlbums as allAlbums, type MusicTrack, type MusicAlbum } from '../components/MusicPlayerProvider';

const isProd = process.env.NODE_ENV === 'production';

const now = Date.now();

export interface GatedTrack {
  track: MusicTrack;
  releaseAt: string;
}

/** All tracks whose release time is still in the future. */
export const gatedTracks: GatedTrack[] = allTracks
  .filter((t) => Boolean(t.releaseAt))
  .filter((t) => new Date(t.releaseAt as string).getTime() > now)
  .map((t) => ({ track: t, releaseAt: t.releaseAt as string }));

const gatedSlugs = new Set(gatedTracks.map((g) => g.track.slug));

/** Tracks currently playable — gated ones drop out only in production. */
export const musicTracks: MusicTrack[] = isProd
  ? allTracks.filter((t) => !gatedSlugs.has(t.slug))
  : allTracks;

/** Albums rebuilt from the filtered track list so prod never shows a ghost album. */
export const musicAlbums: MusicAlbum[] = (() => {
  const visible = new Set(musicTracks.map((t) => t.slug));
  return allAlbums
    .map((album) => ({ ...album, trackSlugs: album.trackSlugs.filter((s) => visible.has(s)) }))
    .filter((album) => album.trackSlugs.length > 0);
})();

/**
 * Page-level gate for gatsby-node + templates: 'public' | 'preview' | 'hidden'.
 * gatsby-node never creates a route for 'hidden'; the song template renders a
 * locked placeholder for 'preview'.
 */
export type GateState = 'public' | 'preview' | 'hidden';

export function gateStateFor(slug: string): GateState {
  const g = gatedTracks.find((item) => item.track.slug === slug);
  if (!g) return 'public';
  return isProd ? 'hidden' : 'preview';
}

/** True when the runtime is a production build (used to guard imports). */
export const isProductionBuild = isProd;
