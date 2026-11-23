// Many songs were imported from YouTube, so their "artist" is a label/channel, not a singer.
// Those names say nothing about similarity or taste, so they are not treated as artists.
// shortcut: name-based guess, replace once artist metadata is cleaned (metadata-cleaning phase).
const LABEL_RE = /music|records|vevo|t-series|\byrf\b|\btips\b|saregama|ishtar|lyric|official|entertainment|films|studios?|\bdmf\b|\bdrj\b/i;

// "Arijit Singh, Sunidhi Chauhan" / "A & B" / "A feat. B"  ->  ["Arijit Singh", "Sunidhi Chauhan"]
export const artistNames = (artist = "") =>
  String(artist)
    .split(/,|&|\bfeat\.?|\bft\.?|\bx\b|\band\b/i)
    .map((t) => t.trim())
    .filter((t) => t && !LABEL_RE.test(t));

// Lower-cased keys, for comparing artists.
export const artistTokens = (artist = "") => artistNames(artist).map((t) => t.toLowerCase());
