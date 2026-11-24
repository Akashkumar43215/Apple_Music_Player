// Finds lyrics on LRCLIB (free, no key). A wrong song's lyrics are worse than none,
// so a result must match the title exactly (ignoring brackets/case) AND the duration.
const BASE = "https://lrclib.net/api/search";
const WRONG_VERSION = /remix|lo-?fi|slowed|reverb|instrumental|karaoke|cover|mashup|sped|8d|acoustic|reprise|unplugged/i;

export const norm = (s) =>
  String(s ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[(\[][^)\]]*[)\]]/g, " ") // (From "..."), (Official Video)
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

// A song title may carry an artist/movie after " - " or ":"; try the title as stored and its first part
const variants = (title) =>
  [...new Set([title, title.split(/\s[-–]\s|:\s/)[0]].map(norm).filter((v) => v.length > 1))];

/** Picks the best LRCLIB result for the song, or null. Pure: easy to test. */
export const pickLyrics = (song, results) => {
  const want = variants(song.title);
  const ok = (r) =>
    (r.syncedLyrics || r.plainLyrics) &&
    Math.abs(r.duration - song.duration) <= 3 &&
    want.includes(norm(r.trackName)) &&
    (!WRONG_VERSION.test(r.trackName) || WRONG_VERSION.test(song.title));
  const good = (Array.isArray(results) ? results : []).filter(ok);
  return good.find((r) => r.syncedLyrics) || good[0] || null;
};

const cache = new Map(); // songId -> { at, value }; shortcut: per-process memory, move to the DB if Render restarts make it slow
const DAY = 24 * 60 * 60 * 1000;

const search = async (q) => {
  const res = await fetch(`${BASE}?q=${encodeURIComponent(q)}`, {
    headers: { "User-Agent": "MusicPlayerApp/1.0" },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) throw new Error(`LRCLIB ${res.status}`);
  return res.json();
};

/** { found, synced, plain, trackName, artistName } or { found:false }; throws when LRCLIB is unreachable. */
export const findLyrics = async (song) => {
  const key = String(song._id);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < DAY) return hit.value;

  let pick = null;
  for (const q of variants(song.title)) {
    pick = pickLyrics(song, await search(q));
    if (pick) break;
  }
  const value = pick
    ? { found: true, synced: pick.syncedLyrics || null, plain: pick.plainLyrics || null, trackName: pick.trackName, artistName: pick.artistName }
    : { found: false };
  cache.set(key, { at: Date.now(), value }); // a failed lookup (throw) is never cached
  return value;
};
