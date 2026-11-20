import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import manifest from '../data/music-manifest.json';

/** True when a track's release time is still in the future. */
export const isTrackLocked = (track: MusicTrack): boolean =>
  Boolean(track.releaseAt && new Date(track.releaseAt).getTime() > Date.now());

export interface MusicCoverVariant {
  jpg: string;
  webp: string;
}

export interface MusicTrack {
  slug: string;
  title: string;
  artist: string;
  album: string;
  albumSlug: string;
  year: number | null;
  trackNumber: number | null;
  /** ISO timestamp from the file's creation comment (Suno), if present. */
  createdAt?: string | null;
  duration: number;
  /** Technical metadata for the track details section. */
  format?: {
    codec: string | null;
    bitrateKbps: number | null;
    sampleRate: number | null;
    lossless: boolean;
  };
  lyrics?: string | null;
  /** ISO datetime the track goes public, from music-release-schedule.json. */
  releaseAt?: string | null;
  src: string;
  file: string;
  covers: Record<string, MusicCoverVariant>;
}

export interface MusicAlbum {
  slug: string;
  title: string;
  artist: string;
  year: number | null;
  cover: Record<string, MusicCoverVariant>;
  trackSlugs: string[];
}

const MANIFEST = manifest as unknown as {
  generatedAt: string;
  baseUrl: string;
  tracks: MusicTrack[];
  albums: MusicAlbum[];
};

export const musicTracks: MusicTrack[] = MANIFEST.tracks || [];
export const musicAlbums: MusicAlbum[] = MANIFEST.albums || [];

export const trackBySlug = (slug: string): MusicTrack | undefined =>
  musicTracks.find((track) => track.slug === slug);

export const coverFor = (track: MusicTrack, size: 160 | 400 | 800 = 400): string => {
  const variant = track.covers?.[String(size)] || track.covers?.['400'];
  return variant ? variant.jpg : '';
};

const LAST_TRACK_KEY = 'hm-music-last';
const LAST_POS_KEY = 'hm-music-pos';
const VOLUME_KEY = 'hm-music-volume';
const MUTE_KEY = 'hm-music-muted';
const SHUFFLE_KEY = 'hm-music-shuffle';
const REPEAT_KEY = 'hm-music-repeat';

export type RepeatMode = 'off' | 'all' | 'one';

/** Where a play() came from, for analytics attribution. */
export type PlaySource = 'song-page' | 'bar' | 'list' | 'deep-link' | 'auto';

interface MusicPlayerContextValue {
  tracks: MusicTrack[];
  /** Queue in play order (slugs). */
  queue: string[];
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  /** Play a track now, queueing the full catalog around it. */
  play: (slug: string, source?: PlaySource) => void;
  /** Play a track now with an explicit queue (album, playlist). */
  playFromList: (listSlugs: string[], slug: string) => void;
  /** Load a track paused. Never makes a sound on its own. */
  cue: (slug: string) => void;
  toggle: () => void;
  /** Manual skip: always advances, wraps at the ends. */
  next: () => void;
  /** If >3s into the track, restart instead of skipping. */
  previous: () => void;
  seek: (seconds: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  close: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null);

export const useMusicPlayer = (): MusicPlayerContextValue => {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) throw new Error('useMusicPlayer must be used inside MusicPlayerProvider');
  return ctx;
};

/**
 * True when this tab may start audible playback without a click: either the
 * browser reports autonomous autoplay allowed, or the reader has already
 * interacted with the page (click/keydown anywhere unlocks audio).
 */
export const canAutoplay = async (): Promise<boolean> => {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { userActivation?: { isActive: boolean } };
  if (nav.userActivation?.isActive) return true;
  const mediaNav = nav as Navigator & {
    getAutoplayPolicy?: (policy: string) => boolean | Promise<boolean>;
  };
  if (typeof mediaNav.getAutoplayPolicy === 'function') {
    try {
      return Boolean(await mediaNav.getAutoplayPolicy('audiocontext'));
    } catch {
      // Fall through to the probe.
    }
  }
  return new Promise((resolve) => {
    const probe = document.createElement('audio');
    probe.muted = false;
    probe.volume = 0;
    probe.preload = 'none';
    const done = (allowed: boolean) => {
      probe.removeAttribute('src');
      resolve(allowed);
    };
    probe.addEventListener('playing', () => done(true), { once: true });
    probe.addEventListener('error', () => done(false), { once: true });
    // A data URI plays locally with zero network and (usually) zero policy cost.
    probe.src =
      'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABIADATGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB8AAAAKgAAAAA//tQxAEB';
    const playPromise = probe.play();
    if (playPromise) playPromise.catch(() => done(false));
  });
};

/**
 * Single shared <audio> element that survives Gatsby client-side navigation,
 * because the provider is mounted through wrapRootElement in gatsby-browser and
 * gatsby-ssr.
 *
 * Playback never starts on its own by default: `cue()` and page loads stay
 * paused. The exception is the music deep-link flow — track pages read
 * `canAutoplay` and may call `play()` immediately, matching a direct visitor's
 * intent; the browser may still hold the sound until the reader interacts with
 * the tab, at which point audio resumes (see the audio unlock effect below).
 */
export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [queue, setQueue] = useState<string[]>(() => musicTracks.map((track) => track.slug));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMutedState] = useState(false);
  const [shuffle, setShuffleState] = useState(false);
  const [repeat, setRepeatState] = useState<RepeatMode>('off');

  // Refs so event handlers (ended, loadedmetadata) always read fresh state
  // without re-binding the audio element.
  const queueRef = useRef(queue);
  const currentSlugRef = useRef(currentSlug);
  const repeatRef = useRef(repeat);
  const pendingSeekRef = useRef<number | null>(null);
  const lastSavedPosRef = useRef(0);
  // Set when a page cue()s an explicit track this session; a localStorage
  // restore must never override a deep-linked song.
  const didCueRef = useRef(false);

  // Lyric/karaoke smoothness: `timeupdate` fires only ~4x/second, which makes
  // word-fill paint in 250ms jumps. While playing, a rAF loop samples the
  // audio element's clock directly (60fps) and pushes it into state. The
  // `timeupdate` handler below stays as the fallback that also persists
  // listening position.
  useEffect(() => {
    if (!isPlaying) return;
    let frame = 0;
    const tick = () => {
      const audio = audioRef.current;
      if (audio && !audio.paused) {
        setCurrentTime(audio.currentTime);
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying]);

  const currentTrack = useMemo(
    () => (currentSlug ? musicTracks.find((track) => track.slug === currentSlug) || null : null),
    [currentSlug]
  );

  // Fire a GA4 track_play event via gtag when a track actually starts playing
  // (silently no-ops when GA is absent, e.g. dev, DNT, local).
  const currentTrackRef = useRef(currentTrack);
  currentTrackRef.current = currentTrack;
  const firePlayEvent = useCallback((source: PlaySource) => {
    if (typeof window === 'undefined' || !window.gtag) return;
    const track = currentTrackRef.current;
    if (!track) return;
    window.gtag('event', 'track_play', {
      track_slug: track.slug,
      track_title: track.title,
      artist: track.artist,
      play_source: source,
      value: 1,
    });
  }, []);

  // Keep refs in sync during render (cheap, avoids effect ordering issues).
  queueRef.current = queue;
  currentSlugRef.current = currentSlug;
  repeatRef.current = repeat;

  const naturalOrder = useMemo(() => musicTracks.map((track) => track.slug), []);

  const buildQueue = useCallback((current: string | null, shuffleOn: boolean): string[] => {
    if (!shuffleOn || naturalOrder.length < 2) return naturalOrder;
    const rest = naturalOrder.filter((slug) => slug !== current);
    for (let i = rest.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    return current ? [current, ...rest] : rest;
  }, [naturalOrder]);

  // Restore persisted player state once, after hydration (paused).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedVolume = window.localStorage.getItem(VOLUME_KEY);
    if (savedVolume !== null) {
      const parsed = Number(savedVolume);
      if (!Number.isNaN(parsed)) {
        const clamped = Math.min(1, Math.max(0, savedVolume === '' ? 1 : parsed));
        setVolumeState(clamped);
        if (audioRef.current) audioRef.current.volume = clamped;
      }
    }
    const savedMuted = window.localStorage.getItem(MUTE_KEY);
    if (savedMuted === '1') {
      setMutedState(true);
      if (audioRef.current) audioRef.current.muted = true;
    }
    const savedShuffle = window.localStorage.getItem(SHUFFLE_KEY);
    const savedRepeat = window.localStorage.getItem(REPEAT_KEY);
    const restoredShuffle = savedShuffle === '1';
    const restoredRepeat: RepeatMode =
      savedRepeat === 'all' || savedRepeat === 'one' || savedRepeat === 'off' ? savedRepeat : 'off';
    setShuffleState(restoredShuffle);
    setRepeatState(restoredRepeat);

    const savedTrack = window.localStorage.getItem(LAST_TRACK_KEY);
    if (!didCueRef.current && savedTrack && trackBySlug(savedTrack)) {
      setCurrentSlug(savedTrack);
      const savedPos = Number(window.localStorage.getItem(LAST_POS_KEY));
      if (Number.isFinite(savedPos) && savedPos > 0) pendingSeekRef.current = savedPos;
      // Queue is rebuilt in the source-attach effect; the track stays paused.
    } else {
      setQueue(buildQueue(null, restoredShuffle));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Attach the source whenever the selected track changes. preload="none" means
  // no bytes move until the user presses play.
  const playSourceRef = useRef<PlaySource>('bar');

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!currentTrack) {
      audio.removeAttribute('src');
      audio.load();
      setDuration(0);
      setCurrentTime(0);
      return;
    }
    if (audio.getAttribute('src') !== currentTrack.src) {
      // Fresh selection: drop any stale position unless we just restored it.
      if (pendingSeekRef.current !== null && window.localStorage.getItem(LAST_TRACK_KEY) === currentTrack.slug) {
        // keep pendingSeek — it belongs to this restored track
      } else {
        pendingSeekRef.current = null;
      }
      audio.setAttribute('src', currentTrack.src);
      audio.load();
      // Clear the ended coalescing guard from the previous track so the new
      // track's 'ended' event is handled normally.
      delete (audio as HTMLAudioElement & { dataset: { hmEndedHandled?: string } }).dataset.hmEndedHandled;
      setDuration(currentTrack.duration || 0);
      setCurrentTime(pendingSeekRef.current || 0);
      window.localStorage.setItem(LAST_TRACK_KEY, currentTrack.slug);
    }
  }, [currentTrack]);

  // Whenever the current track changes, place it inside a shuffled or natural queue.
  useEffect(() => {
    setQueue(buildQueue(currentSlug, shuffle));
  }, [currentSlug, shuffle, buildQueue]);

  // Media Session so the OS, lockscreen, and car controls show cover art + title
  // and expose transport buttons.
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    const session = navigator.mediaSession;
    if (!currentTrack) {
      session.metadata = null;
      return;
    }
    const art = currentTrack.covers?.['800'] || currentTrack.covers?.['400'];
    session.metadata = new window.MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: currentTrack.album,
      artwork: art
        ? [
            { src: art.jpg, sizes: '800x800', type: 'image/jpeg' },
            {
              src: currentTrack.covers?.['400']?.jpg || art.jpg,
              sizes: '400x400',
              type: 'image/jpeg',
            },
          ]
        : [],
    });
  }, [currentTrack]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    const audio = audioRef.current;
    if (!audio) return;
    const session = navigator.mediaSession;
    try {
      session.setActionHandler('play', () => audio.play());
      session.setActionHandler('pause', () => audio.pause());
      session.setActionHandler('previoustrack', () => {
        if (audio.currentTime > 3) {
          audio.currentTime = 0;
        } else {
          const q = queueRef.current;
          const idx = q.indexOf(currentSlugRef.current || '');
          const prevSlug = q[(idx - 1 + q.length) % q.length];
          if (prevSlug) playRef.current(prevSlug);
        }
      });
      session.setActionHandler('nexttrack', () => {
        const q = queueRef.current;
        const idx = q.indexOf(currentSlugRef.current || '');
        playRef.current(q[(idx + 1) % q.length]);
      });
    } catch {
      // Older browsers with partial Media Session support.
    }
  }, []);

  // Stable play() that handlers below can call without re-binding.
  const playRef = useRef<(slug: string) => void>(() => undefined);

  const loadTrack = useCallback((track: MusicTrack) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.getAttribute('src') !== track.src) {
      audio.setAttribute('src', track.src);
      audio.load();
      setDuration(track.duration || 0);
      setCurrentTime(0);
      pendingSeekRef.current = null;
      window.localStorage.setItem(LAST_TRACK_KEY, track.slug);
    }
  }, []);

  const play = useCallback(
    (slug: string, source: PlaySource = 'bar') => {
      const track = musicTracks.find((item) => item.slug === slug);
      // Scheduled releases never start from the player, even on dev previews.
      if (!track || isTrackLocked(track)) return;
      const audio = audioRef.current;
      if (!audio) return;
      playSourceRef.current = source;
      setCurrentSlug(slug);
      loadTrack(track);
      audio.play().then(
        () => setIsPlaying(true),
        () => setIsPlaying(false)
      );
    },
    [loadTrack]
  );

  const playFromList = useCallback(
    (listSlugs: string[], slug: string) => {
      if (!listSlugs.includes(slug)) return;
      setQueue(listSlugs);
      setShuffleState(false);
      window.localStorage.setItem(SHUFFLE_KEY, '0');
      play(slug);
    },
    [play]
  );

  playRef.current = play;

  const cue = useCallback(
    (slug: string) => {
      const track = musicTracks.find((item) => item.slug === slug);
      // Locked tracks cue nothing — the song page only shows its lock card.
      if (!track || isTrackLocked(track)) return;
      const audio = audioRef.current;
      if (!audio) return;
      didCueRef.current = true;
      setCurrentSlug(slug);
      loadTrack(track);
      setIsPlaying(false);
    },
    [loadTrack]
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.getAttribute('src')) return;
    if (audio.paused) {
      audio.play().then(
        () => setIsPlaying(true),
        () => setIsPlaying(false)
      );
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  // Auto-advance when a track ends, honoring repeat mode.
  const handleEnded = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // Guard against double 'ended' dispatches (see onEnded handler): the
    // browser can emit the event twice in quick succession when decoding the
    // final MP3 frames — Xing/LAME gapless metadata, trailing ID3v1, or VBR
    // tail padding can make the demuxer reach EOS more than once. Without
    // this, each dispatch fires handleEnded and 'repeat one' restarts the
    // track twice, producing overlapping audio.
    audio.dataset.hmEndedHandled = '1';
    if (repeatRef.current === 'one') {
      audio.currentTime = 0;
      playSourceRef.current = 'auto';
      audio.play().catch(() => setIsPlaying(false));
      return;
    }
    const q = queueRef.current;
    const idx = q.indexOf(currentSlugRef.current || '');
    const nextSlug = idx !== -1 ? q[idx + 1] : q[0];
    if (nextSlug && nextSlug !== currentSlugRef.current) {
      playRef.current(nextSlug);
      return;
    }
    if (repeatRef.current === 'all' && q.length > 0 && q[0]) {
      playRef.current(q[0]);
      return;
    }
    setIsPlaying(false);
    audio.currentTime = 0;
    setCurrentTime(0);
  }, []);

  const next = useCallback(() => {
    const q = queueRef.current;
    if (q.length === 0) return;
    const idx = q.indexOf(currentSlugRef.current || '');
    playRef.current(q[(idx + 1) % q.length]);
  }, []);

  const previous = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || currentSlugRef.current === null) return;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    const q = queueRef.current;
    if (q.length === 0) return;
    const idx = q.indexOf(currentSlugRef.current || '');
    playRef.current(q[(idx - 1 + q.length) % q.length]);
  }, []);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
    setCurrentTime(seconds);
  }, []);

  const setVolume = useCallback((value: number) => {
    const audio = audioRef.current;
    const clamped = Math.min(1, Math.max(0, Number.isFinite(value) ? value : 1));
    setVolumeState(clamped);
    if (audio) {
      audio.volume = clamped;
      if (clamped > 0 && audio.muted) {
        audio.muted = false;
        setMutedState(false);
        window.localStorage.setItem(MUTE_KEY, '0');
      }
    }
    if (typeof window !== 'undefined') window.localStorage.setItem(VOLUME_KEY, String(clamped));
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextMuted = !audio.muted;
    audio.muted = nextMuted;
    setMutedState(nextMuted);
    window.localStorage.setItem(MUTE_KEY, nextMuted ? '1' : '0');
  }, []);

  const toggleShuffle = useCallback(() => {
    const nextShuffle = !shuffle;
    setShuffleState(nextShuffle);
    setQueue(buildQueue(currentSlugRef.current, nextShuffle));
    window.localStorage.setItem(SHUFFLE_KEY, nextShuffle ? '1' : '0');
  }, [shuffle, buildQueue]);

  const cycleRepeat = useCallback(() => {
    setRepeatState((prev) => {
      const mode: RepeatMode = prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off';
      window.localStorage.setItem(REPEAT_KEY, mode);
      return mode;
    });
  }, []);

  const close = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    setIsPlaying(false);
    setCurrentSlug(null);
    setCurrentTime(0);
    setDuration(0);
    pendingSeekRef.current = null;
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(LAST_TRACK_KEY);
      window.localStorage.removeItem(LAST_POS_KEY);
    }
  }, []);

  const value = useMemo<MusicPlayerContextValue>(
    () => ({
      tracks: musicTracks,
      queue,
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volume,
      muted,
      shuffle,
      repeat,
      play,
      playFromList,
      cue,
      toggle,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      close,
    }),
    [
      queue,
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volume,
      muted,
      shuffle,
      repeat,
      play,
      playFromList,
      cue,
      toggle,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      close,
    ]
  );

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="none"
        onTimeUpdate={(event) => {
          const time = event.currentTarget.currentTime;
          setCurrentTime(time);
          // Persist listening position at most every 5 seconds.
          if (Math.abs(time - lastSavedPosRef.current) >= 5) {
            lastSavedPosRef.current = time;
            window.localStorage.setItem(LAST_POS_KEY, String(Math.floor(time)));
          }
        }}
        onLoadedMetadata={(event) => {
          const audio = event.currentTarget;
          setDuration(audio.duration || 0);
          if (pendingSeekRef.current !== null) {
            const target = pendingSeekRef.current;
            pendingSeekRef.current = null;
            if (Number.isFinite(audio.duration) && target <= audio.duration) {
              audio.currentTime = target;
              setCurrentTime(target);
            }
          }
        }}
        onPlay={(event) => {
          setIsPlaying(true);
          // Fires only when sound actually starts — autoplay-blocked cues stay
          // paused and never count. Debounced so pause→resume on the same track
          // doesn't double-count.
          const audio = event.currentTarget;
          if (audio.dataset.hmPlayCounted !== currentTrackRef.current?.slug) {
            audio.dataset.hmPlayCounted = currentTrackRef.current?.slug || '';
            firePlayEvent(playSourceRef.current);
          }
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={(event) => {
          const audio = event.currentTarget as HTMLAudioElement & { dataset: { hmPlayCounted?: string; hmEndedHandled?: string } };
          delete audio.dataset.hmPlayCounted;
          // Browsers occasionally dispatch 'ended' twice per playback
          // (double-EOS while draining the last MP3 frames). Coalesce them:
          // the second dispatch is only allowed through once a new load has
          // cleared the guard below.
          if (audio.dataset.hmEndedHandled) return;
          audio.dataset.hmEndedHandled = '1';
          handleEnded();
        }}
      />
    </MusicPlayerContext.Provider>
  );
};

export default MusicPlayerProvider;
