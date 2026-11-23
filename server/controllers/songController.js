
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import { parseBuffer } from "music-metadata";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

import Song from "../models/Song.js";

// Escape user input so it is matched literally (prevents ReDoS / invalid-regex errors)
const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
import ApiError from "../utils/ApiError.js";

import {
  MAX_AUDIO_SIZE_BYTES,
  MAX_IMAGE_SIZE_BYTES,
} from "../config/constants.js";

/**
 * Upload a buffer to Cloudinary
 */
const uploadToCloudinary = (buffer, folder, resourceType) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * @desc Upload a new song
 * @route POST /api/songs
 * @access Private
 */
export const uploadSong = asyncHandler(async (req, res) => {
  const audioFile = req.files?.audio?.[0];
  const coverFile = req.files?.cover?.[0];

  if (!audioFile) {
    throw new ApiError(400, "An audio file is required");
  }

  if (audioFile.size > MAX_AUDIO_SIZE_BYTES) {
    throw new ApiError(
      400,
      `Audio file exceeds the ${MAX_AUDIO_SIZE_BYTES / 1024 / 1024}MB limit`
    );
  }
if (coverFile && coverFile.size > MAX_IMAGE_SIZE_BYTES) {
  throw new ApiError(
    400,
    `Cover image exceeds the ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB limit`
  );
}

const { title, artist, album, genre } = req.body;

if (!title || !artist) {
  throw new ApiError(400, "Title and artist are required");
}

let duration = 0;

  try {
    const metadata = await parseBuffer(audioFile.buffer, {
      mimeType: audioFile.mimetype,
    });

    duration = Math.round(metadata.format.duration || 0);
  } catch (error) {
    duration = 0;
  }

  const audioUpload = await uploadToCloudinary(
    audioFile.buffer,
    "music-player/songs",
    "video"
  );

  let coverUpload = null;

  if (coverFile) {
    coverUpload = await uploadToCloudinary(
      coverFile.buffer,
      "music-player/covers",
      "image"
    );
  }

  const song = await Song.create({
    title,
    artist,
    album,
    genre,
    duration,

    audioUrl: audioUpload.secure_url,
    audioPublicId: audioUpload.public_id,

    coverUrl: coverUpload?.secure_url || "",
    coverPublicId: coverUpload?.public_id || "",

    uploadedBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Song uploaded successfully",
    song,
  });
});

/**
 * @desc Get all songs
 * @route GET /api/songs
 * @access Public
 */
export const getSongs = asyncHandler(async (req, res) => {
  const { search, artist, album, genre, uploadedBy } = req.query;

  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);

  const filter = {};

  if (artist) filter.artist = new RegExp(escapeRegex(artist), "i");
  if (album) filter.album = new RegExp(escapeRegex(album), "i");
  if (genre) filter.genre = genre;
  if (uploadedBy && mongoose.isValidObjectId(uploadedBy)) filter.uploadedBy = uploadedBy;

  if (search) {
    const re = new RegExp(escapeRegex(search), "i");

    filter.$or = [
      { title: re },
      { artist: re },
      { album: re },
    ];
  }

  const [songs, total] = await Promise.all([
    Song.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("uploadedBy", "name avatar"),

    Song.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    count: songs.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    songs,
  });
});



/**
 * @desc Get a single song
 * @route GET /api/songs/:id
 * @access Public
 */
export const getSongById = asyncHandler(async (req, res) => {
  const song = await Song.findById(req.params.id).populate(
    "uploadedBy",
    "name avatar"
  );

  if (!song) {
    throw new ApiError(404, "Song not found");
  }

  res.status(200).json({
    success: true,
    song,
  });
});

/**
 * @desc Get filter options
 * @route GET /api/songs/meta/filters
 * @access Public
 */
export const getFilterOptions = asyncHandler(async (req, res) => {
  const [artists, albums, genres] = await Promise.all([
    Song.distinct("artist"),
    Song.distinct("album"),
    Song.distinct("genre"),
  ]);

  res.status(200).json({
    success: true,
    artists,
    albums,
    genres,
  });
});

/**
 * @desc Update song details
 * @route PUT /api/songs/:id
 * @access Private
 */
export const updateSong = asyncHandler(async (req, res) => {
  const song = await Song.findById(req.params.id);

  if (!song) {
    throw new ApiError(404, "Song not found");
  }

  if (song.uploadedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only edit songs you uploaded");
  }

  const { title, artist, album, genre } = req.body;

  if (title !== undefined) song.title = title;
  if (artist !== undefined) song.artist = artist;
  if (album !== undefined) song.album = album;
  if (genre !== undefined) song.genre = genre;

  const coverFile = req.files?.cover?.[0];
  if (coverFile) {
    if (coverFile.size > MAX_IMAGE_SIZE_BYTES) {
      throw new ApiError(400, `Cover image exceeds the ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB limit`);
    }
    const coverUpload = await uploadToCloudinary(coverFile.buffer, "music-player/covers", "image");
    const oldCoverId = song.coverPublicId;
    song.coverUrl = coverUpload.secure_url;
    song.coverPublicId = coverUpload.public_id;
    if (oldCoverId) {
      await cloudinary.uploader.destroy(oldCoverId).catch((e) => console.error("Old cover cleanup failed:", e));
    }
  }

  await song.save();

  res.status(200).json({
    success: true,
    message: "Song updated successfully",
    song,
  });
});

/**
 * @desc Delete song
 * @route DELETE /api/songs/:id
 * @access Private
 */
export const deleteSong = asyncHandler(async (req, res) => {
  const song = await Song.findById(req.params.id);

  if (!song) {
    throw new ApiError(404, "Song not found");
  }

  if (song.uploadedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete songs you uploaded");
  }

  // Delete audio from Cloudinary
  try {
  if (song.audioPublicId) {
    await cloudinary.uploader.destroy(song.audioPublicId, {
      resource_type: "video",
    });
  }

  if (song.coverPublicId) {
    await cloudinary.uploader.destroy(song.coverPublicId);
  }
} catch (error) {
  console.error("Cloudinary deletion error:", error);
}

  await song.deleteOne();

  res.status(200).json({
    success: true,
    message: "Song deleted successfully",
  });
});