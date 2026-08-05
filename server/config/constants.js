// Centralized app-wide constants so magic numbers/strings don't get scattered across files.

export const MAX_AUDIO_SIZE_BYTES = (Number(process.env.MAX_AUDIO_SIZE_MB) || 15) * 1024 * 1024;
export const MAX_IMAGE_SIZE_BYTES = (Number(process.env.MAX_IMAGE_SIZE_MB) || 5) * 1024 * 1024;

export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav'];
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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
