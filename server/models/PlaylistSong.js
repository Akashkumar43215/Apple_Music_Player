import mongoose from "mongoose";

const playlistSongSchema = new mongoose.Schema(
  {
    playlist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlist",
      required: true,
    },

    song: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
      required: true,
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

playlistSongSchema.index(
  {
    playlist: 1,
    song: 1,
  },
  {
    unique: true,
  }
);

const PlaylistSong = mongoose.model(
  "PlaylistSong",
  playlistSongSchema
);

export default PlaylistSong;