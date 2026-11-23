import { artistTokens } from "./artists.js";

// --- deterministic randomness: the same seed always gives the same numbers ---
const hashString = (str) => {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return (h ^ (h >>> 16)) >>> 0;
};
const mulberry32 = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const similarity = (a, b) => {
  const at = new Set(artistTokens(a.artist));
  let s = 0;
  if (artistTokens(b.artist).some((t) => at.has(t))) s += 3;
  if (a.genre && a.genre === b.genre) s += 2;
  if (a.album && a.album !== "Single" && a.album === b.album) s += 2;
  return s;
};

/**
 * Daily Mix: ~40% similar to what you listen to, ~30% by your favourite artists,
 * ~20% in your favourite moods, ~10% discovery (songs you haven't played).
 *
 * @param songs    all candidate songs ({_id, artist, genre, album, playCount})
 * @param weights  Map(songId -> how much the user likes it); empty for new users
 * @param seed     string; same seed => same mix (user + calendar day)
 * Returns up to `size` distinct songs. A bucket that can't be filled (e.g. no
 * artist data) hands its slots to the others, so the mix is always full.
 */
export const buildDailyMix = ({ songs, weights, seed, size = 20 }) => {
  const rand = mulberry32(hashString(seed));
  const byId = new Map(songs.map((s) => [String(s._id), s]));
  const liked = [...weights.entries()].filter(([id]) => byId.has(id)).sort((a, b) => b[1] - a[1]);
  const seeds = liked.slice(0, 5).map(([id]) => byId.get(id));
  const played = new Set(liked.map(([id]) => id));

  const artistW = new Map();
  const genreW = new Map();
  for (const [id, w] of liked) {
    const s = byId.get(id);
    artistTokens(s.artist).forEach((t) => artistW.set(t, (artistW.get(t) || 0) + w));
    if (s.genre) genreW.set(s.genre, (genreW.get(s.genre) || 0) + w);
  }
  const top = (m, n) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);
  const topArtists = new Set(top(artistW, 3));
  const topGenres = new Set(top(genreW, 2));

  const maxPlay = Math.max(1, ...songs.map((s) => s.playCount || 0));
  const picked = new Map();
  const take = (candidates, score, n) => {
    // de-duplicate by id: a song listed twice in `candidates` must not eat two slots
    const pool = [...new Map(candidates.filter((s) => !picked.has(String(s._id))).map((s) => [String(s._id), s])).values()];
    const max = Math.max(1, ...pool.map(score));
    // score decides mostly; the seeded jitter makes each day's pick different but stable within the day
    pool
      .map((s) => ({ s, k: score(s) / max + rand() * 0.6 }))
      .sort((a, b) => b.k - a.k)
      .slice(0, n)
      .forEach(({ s }) => picked.set(String(s._id), s));
  };

  const quota = (share) => Math.round(size * share);
  const notSeed = (s) => !seeds.includes(s);

  take(songs.filter(notSeed), (s) => seeds.reduce((sum, sd) => sum + similarity(sd, s), 0), quota(0.4));
  take(
    songs.filter((s) => artistTokens(s.artist).some((t) => topArtists.has(t))),
    (s) => artistTokens(s.artist).reduce((sum, t) => sum + (artistW.get(t) || 0), 0),
    quota(0.3)
  );
  take(songs.filter((s) => topGenres.has(s.genre)), (s) => genreW.get(s.genre) || 0, quota(0.2));
  const unplayed = songs.filter((s) => !played.has(String(s._id)));
  take(unplayed.filter((s) => !topGenres.has(s.genre)).concat(unplayed), () => 1, quota(0.1));

  // Top up (new user, thin data, empty buckets) with popular + a little randomness
  if (picked.size < size) take(songs, (s) => (s.playCount || 0) / maxPlay + 0.1, size - picked.size);

  // Seeded Fisher-Yates so the playlist order isn't grouped by bucket
  const mix = [...picked.values()].slice(0, size);
  for (let i = mix.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [mix[i], mix[j]] = [mix[j], mix[i]];
  }
  return mix;
};

export const dayKey = (tz = "UTC", now = new Date()) => {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(now); // YYYY-MM-DD
  } catch {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "UTC" }).format(now);
  }
};
