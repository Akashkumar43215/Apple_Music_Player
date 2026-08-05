import asyncHandler from "express-async-handler";
import Playlist from "../models/Playlist.js";
import PlaylistSong from "../models/PlaylistSong.js";
import Song from "../models/Song.js";
import ApiError from "../utils/ApiError.js";

/**
 * Create Playlist
 */
export const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name?.trim()) {
    throw new ApiError(400, "Playlist name is required");
  }

  const playlist = await Playlist.create({
    name: name.trim(),
    description,
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    playlist,
  });
});

/**
 * Get My Playlists
 */
export const getPlaylists = asyncHandler(async (req, res) => {
  const playlists = await Playlist.find({
    user: req.user._id,
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    playlists,
  });
});

/**
 * Get Single Playlist
 */
export const getPlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  const songs = await PlaylistSong.find({
    playlist: playlist._id,
  })
    .sort({ order: 1 })
    .populate("song");

  res.json({
    success: true,
    playlist,
    songs,
  });
});

/**
 * Update Playlist
 */
export const updatePlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (req.body.name !== undefined) {
    if (!req.body.name.trim()) {
      throw new ApiError(400, "Playlist name is required");
    }
    playlist.name = req.body.name.trim();
  }

  if (req.body.description !== undefined) {
    playlist.description = req.body.description;
  }

  await playlist.save();

  res.json({
    success: true,
    playlist,
  });
});

/**
 * Delete Playlist
 */
export const deletePlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  await PlaylistSong.deleteMany({
    playlist: playlist._id,
  });

  await playlist.deleteOne();

  res.json({
    success: true,
    message: "Playlist deleted successfully",
  });
});

/**
 * Add Song To Playlist
 */
export const addSongToPlaylist = asyncHandler(async (req, res) => {
  const { songId } = req.body;

  if (!songId) {
    throw new ApiError(400, "Song ID is required");
  }

  const playlist = await Playlist.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  const song = await Song.findById(songId);

  if (!song) {
    throw new ApiError(404, "Song not found");
  }

  const alreadyExists = await PlaylistSong.findOne({
    playlist: playlist._id,
    song: song._id,
  });

  if (alreadyExists) {
    throw new ApiError(400, "Song already exists in playlist");
  }

  const totalSongs = await PlaylistSong.countDocuments({
    playlist: playlist._id,
  });

  await PlaylistSong.create({
    playlist: playlist._id,
    song: song._id,
    order: totalSongs,
  });

  res.json({
    success: true,
    message: "Song added successfully",
  });
});

/**
 * Remove Song From Playlist
 */
export const removeSongFromPlaylist = asyncHandler(async (req, res) => {
  const playlist = await Playlist.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  const removedSong = await PlaylistSong.findOneAndDelete({
    playlist: playlist._id,
    song: req.params.songId,
  });

  if (!removedSong) {
    throw new ApiError(404, "Song not found in playlist");
  }

  // Reorder remaining songs
  const remainingSongs = await PlaylistSong.find({
    playlist: playlist._id,
  }).sort({ order: 1 });

  for (let i = 0; i < remainingSongs.length; i++) {
    if (remainingSongs[i].order !== i) {
      remainingSongs[i].order = i;
      await remainingSongs[i].save();
    }
  }

  res.json({
    success: true,
    message: "Song removed successfully",
  });
});