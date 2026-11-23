/**
 * Formats a duration in seconds as m:ss (e.g. 125 -> "2:05").
 * Used anywhere a song's length is displayed.
 */
// export const formatDuration = (totalSeconds = 0) => {
//   const seconds = Math.max(0, Math.floor(totalSeconds));
//   const minutes = Math.floor(seconds / 60);
//   const remaining = seconds % 60;
//   return `${minutes}:${String(remaining).padStart(2, '0')}`;
// };

// /**
//  * Song audio/cover URLs are stored as relative paths (e.g. "/uploads/covers/x.jpg")
//  * returned by the API. They're served from the API's origin, not the frontend's,
//  * so this resolves them to a full URL using VITE_API_URL.
//  */
// export const getMediaUrl = (relativePath) => {
//   if (!relativePath) return null;
//   const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
//   const origin = apiBase.replace(/\/api\/?$/, '');
//   return `${origin}${relativePath}`;
// };


/**
 * Format duration in m:ss
 */
export const formatDuration = (totalSeconds = 0) => {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return `${minutes}:${String(remaining).padStart(2, "0")}`;
};

/**
 * Returns media URL.
 * Supports both Cloudinary URLs and local uploads.
 */
export const getMediaUrl = (url) => {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const apiBase =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const origin = apiBase.replace(/\/api\/?$/, "");

  return `${origin}${url}`;
};

// 3725 -> "1h 2m", 150 -> "2m 30s", 45 -> "45s"
export const formatListening = (seconds = 0) => {
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return s % 60 ? `${m}m ${s % 60}s` : `${m}m`;
  return `${s}s`;
};

// Cloudinary resizes + picks the best format (WebP/AVIF) and quality; other URLs pass through unchanged.
export const getCoverUrl = (url, width = 400) => {
  const full = getMediaUrl(url);
  return full.includes("res.cloudinary.com") && full.includes("/image/upload/")
    ? full.replace("/image/upload/", `/image/upload/f_auto,q_auto,c_fill,w_${width},h_${width}/`)
    : full;
};
