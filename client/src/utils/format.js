/**
 * Formats a duration in seconds as m:ss (e.g. 125 -> "2:05").
 * Used anywhere a song's length is displayed.
 */
export const formatDuration = (totalSeconds = 0) => {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${String(remaining).padStart(2, '0')}`;
};

/**
 * Song audio/cover URLs are stored as relative paths (e.g. "/uploads/covers/x.jpg")
 * returned by the API. They're served from the API's origin, not the frontend's,
 * so this resolves them to a full URL using VITE_API_URL.
 */
export const getMediaUrl = (relativePath) => {
  if (!relativePath) return null;
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const origin = apiBase.replace(/\/api\/?$/, '');
  return `${origin}${relativePath}`;
};
