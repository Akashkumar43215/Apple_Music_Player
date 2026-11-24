// Pure helpers for crossfade/gapless playback. No audio or React in here, so they are easy to test.

/**
 * Position in the play order that follows `current`, or null when the queue is over.
 * repeat 'all' wraps around; 'one' stays on the same song (the caller restarts it).
 */
export const nextPosition = (length, current, repeatMode) => {
  if (length === 0) return null;
  if (repeatMode === 'one') return current;
  const next = current + 1;
  if (next < length) return next;
  return repeatMode === 'all' ? 0 : null;
};

/** True once the song is close enough to its end for a fade of `fadeSec` to begin. */
export const shouldStartFade = ({ currentTime, duration, fadeSec }) =>
  fadeSec > 0 &&
  Number.isFinite(duration) &&
  duration >= fadeSec * 2 && // never fade on very short songs
  duration - currentTime <= fadeSec;

/** Equal-power curves for progress 0..1: constant loudness through the fade (no dip in the middle). */
export const fadeGains = (progress) => {
  const p = Math.min(1, Math.max(0, progress));
  return { out: Math.cos((p * Math.PI) / 2), in: Math.sin((p * Math.PI) / 2) };
};
