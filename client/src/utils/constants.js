// Must mirror server/config/constants.js GENRES — kept in sync manually
// since frontend and backend are separate deployables.
export const GENRES = [
  "💕 Romantic",
  "💔 Heartbreak",
  "🥺 Emotional",
  "😌 Chill",
  "🌙 Night",
  "☀️ Morning",
  "🎉 Party",
  "💃 Dance",
  "🚗 Road Trip",
  "🏋️ Workout",
  "😴 Sleep",
  "🎧 Lo-Fi",
  "🎤 Rap",
  "🎙️ Hip-Hop",
  "🎵 Bollywood",
  "🌍 English",
  "📚 Podcast",
  "🎼 Other",
];

// Must mirror MOODS in server/config/constants.js.
export const MOODS = [
  "💕 Romantic",
  "💔 Heartbreak",
  "🥺 Emotional",
  "😌 Chill",
  "🌙 Night",
  "☀️ Morning",
  "🎉 Party",
  "🚗 Road Trip",
  "🏋️ Workout",
  "😴 Sleep",
  "🎼 Other",
];

// Real genres only: GENRES also lists the moods (old data kept them in `genre`), "Other" stays as the neutral choice.
export const GENRE_CHOICES = GENRES.filter((g) => !MOODS.includes(g) || g === "🎼 Other");

/** The mood an old-style `genre` value stands for, or null. Mirrors server/utils/mood.js. */
export const moodFromGenre = (genre) => (MOODS.includes(genre) && genre !== "🎼 Other" ? genre : null);
