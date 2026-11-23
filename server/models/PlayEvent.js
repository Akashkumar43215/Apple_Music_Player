import mongoose from "mongoose";

// One row per chunk of listening (the player reports it on pause / song change / every 30s).
// Summing `seconds` gives real listening time; skipped songs never reach here (min 5s).
const playEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    song: { type: mongoose.Schema.Types.ObjectId, ref: "Song", required: true },
    seconds: { type: Number, required: true, min: 5, max: 3600 },
    playedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Weekly activity / recent listening: filter by user, newest first.
playEventSchema.index({ user: 1, playedAt: -1 });
// Per-song totals for a user.
playEventSchema.index({ user: 1, song: 1 });

export default mongoose.model("PlayEvent", playEventSchema);
