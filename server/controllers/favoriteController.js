import asyncHandler from "express-async-handler";
import Favorite from "../models/Favorite.js";
import Song from "../models/Song.js";
import ApiError from "../utils/ApiError.js";

/**
 * @desc    Add song to favorites
 * @route   POST /api/favorites/:songId
 * @access  Private
 */
export const addFavorite = asyncHandler(async (req, res) => {
  const { songId } = req.params;

  const song = await Song.findById(songId);

  if (!song) {
    throw new ApiError(404, "Song not found");
  }

  const alreadyExists = await Favorite.findOne({
    user: req.user._id,
    song: songId,
  });

  if (alreadyExists) {
    return res.status(200).json({
      success: true,
      message: "Already in favorites",
    });
  }

  const favorite = await Favorite.create({
    user: req.user._id,
    song: songId,
  });

  res.status(201).json({
    success: true,
    message: "Added to favorites",
    favorite,
  });
});

/**
 * @desc    Remove favorite
 * @route   DELETE /api/favorites/:songId
 * @access  Private
 */
export const removeFavorite = asyncHandler(async (req, res) => {
  const favorite = await Favorite.findOne({
    user: req.user._id,
    song: req.params.songId,
  });

  if (!favorite) {
    throw new ApiError(404, "Favorite not found");
  }

  await favorite.deleteOne();

  res.status(200).json({
    success: true,
    message: "Removed from favorites",
  });
});

/**
 * @desc    Get all favorite songs
 * @route   GET /api/favorites
 * @access  Private
 */
export const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({
    user: req.user._id,
  })
    .sort({ createdAt: -1 })
    .populate({
      path: "song",
      populate: {
        path: "uploadedBy",
        select: "name avatar",
      },
    });

  const songs = favorites
    .map((fav) => fav.song)
    .filter(Boolean);

  res.status(200).json({
    success: true,
    count: songs.length,
    songs,
  });
});

/**
 * @desc    Check if song is favorite
 * @route   GET /api/favorites/check/:songId
 * @access  Private
 */
export const checkFavorite = asyncHandler(async (req, res) => {
  const exists = await Favorite.exists({
    user: req.user._id,
    song: req.params.songId,
  });

  res.status(200).json({
    success: true,
    favorite: !!exists,
  });
});