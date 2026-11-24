import { MOODS } from "../config/constants.js";

/** The mood an old song's `genre` already expresses, or null (Dance, Rap, "Other", ... say nothing about mood). */
export const moodFromGenre = (genre) => (MOODS.includes(genre) && genre !== "🎼 Other" ? genre : null);

const OTHER = "🎼 Other";

/** A song's mood: its own `mood`, else the one an old-style `genre` implies. null when it has none. */
export const moodOf = (song) => {
  const m = song?.mood || moodFromGenre(song?.genre);
  return m && m !== OTHER ? m : null;
};

/** A song's real genre (Dance, Rap, ...). Old mood-style genres and "Other" count as none, so a mood is never matched twice. */
export const genreOf = (song) => (song?.genre && !moodFromGenre(song.genre) && song.genre !== OTHER ? song.genre : null);
