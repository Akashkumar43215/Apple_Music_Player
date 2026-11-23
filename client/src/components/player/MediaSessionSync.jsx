import { useEffect, useRef } from 'react';
import { usePlayer } from '../../hooks/usePlayer';
import { getMediaUrl } from '../../utils/format';

/**
 * Mirrors playback to the browser's Media Session (media keys, lock screen,
 * notification controls). Renders nothing; silently does nothing where the API
 * isn't supported.
 */
const MediaSessionSync = () => {
  const player = usePlayer();
  const latest = useRef(player);
  useEffect(() => {
    latest.current = player;
  });

  const { currentSong, isPlaying, duration } = player;
  const supported = typeof navigator !== 'undefined' && 'mediaSession' in navigator;

  // Now-playing info
  useEffect(() => {
    if (!supported) return;
    if (!currentSong) {
      navigator.mediaSession.metadata = null;
      return;
    }
    const cover = getMediaUrl(currentSong.coverUrl);
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: currentSong.artist,
      album: currentSong.album || '',
      artwork: cover ? [{ src: cover, sizes: '512x512' }] : [],
    });
  }, [supported, currentSong]);

  useEffect(() => {
    if (!supported) return;
    navigator.mediaSession.playbackState = currentSong ? (isPlaying ? 'playing' : 'paused') : 'none';
  }, [supported, currentSong, isPlaying]);

  // Position (the browser extrapolates it while playing, so only update on change of song/duration/state)
  useEffect(() => {
    if (!supported || !currentSong || !Number.isFinite(duration) || duration <= 0) return;
    try {
      navigator.mediaSession.setPositionState({
        duration,
        position: Math.min(latest.current.currentTime, duration),
        playbackRate: 1,
      });
    } catch { /* some browsers reject odd values */ }
  }, [supported, currentSong, duration, isPlaying]);

  // Button handlers (registered once; they read the latest player state)
  useEffect(() => {
    if (!supported) return;
    const handlers = {
      play: () => !latest.current.isPlaying && latest.current.togglePlay(),
      pause: () => latest.current.isPlaying && latest.current.togglePlay(),
      previoustrack: () => latest.current.playPrevious(),
      nexttrack: () => latest.current.playNext(),
      seekbackward: (d) => latest.current.seek(Math.max(0, latest.current.currentTime - (d.seekOffset || 10))),
      seekforward: (d) => latest.current.seek(Math.min(latest.current.duration, latest.current.currentTime + (d.seekOffset || 10))),
      seekto: (d) => latest.current.seek(d.seekTime),
    };
    for (const [action, fn] of Object.entries(handlers)) {
      try { navigator.mediaSession.setActionHandler(action, fn); } catch { /* unsupported action */ }
    }
    return () => {
      for (const action of Object.keys(handlers)) {
        try { navigator.mediaSession.setActionHandler(action, null); } catch { /* ignore */ }
      }
    };
  }, [supported]);

  return null;
};

export default MediaSessionSync;
