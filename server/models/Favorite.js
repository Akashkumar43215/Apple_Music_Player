import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// One user can favorite one song only once
favoriteSchema.index({ user: 1, song: 1 }, { unique: true });

export default mongoose.model("Favorite", favoriteSchema);