import { MOODS } from "../config/constants.js";

/** The mood an old song's `genre` already expresses, or null (Dance, Rap, "Other", ... say nothing about mood). */
export const moodFromGenre = (genre) => (MOODS.includes(genre) && genre !== "🎼 Other" ? genre : null);
