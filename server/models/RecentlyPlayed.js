import mongoose from 'mongoose';

const recentlyPlayedSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Song',
      required: true,
    },
    playedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// One entry per (user, song) — replaying a song bumps playedAt rather than
// creating duplicate rows, which keeps the "recently played" list clean.
recentlyPlayedSchema.index({ user: 1, song: 1 }, { unique: true });
// Supports the "most recent first" query efficiently
recentlyPlayedSchema.index({ user: 1, playedAt: -1 });

const RecentlyPlayed = mongoose.model('RecentlyPlayed', recentlyPlayedSchema);

export default RecentlyPlayed;
