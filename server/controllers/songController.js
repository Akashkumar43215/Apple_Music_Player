import fs from 'fs';
import path from 'path';
import asyncHandler from 'express-async-handler';
import { parseFile } from 'music-metadata';
import Song from '../models/Song.js';
import ApiError from '../utils/ApiError.js';
import { songsDir, coversDir } from '../config/multerConfig.js';
import { MAX_AUDIO_SIZE_BYTES, MAX_IMAGE_SIZE_BYTES } from '../config/constants.js';

// Deletes a file from disk if it exists — used both on upload validation
// failure (cleanup) and when a song is deleted or its files are replaced.
const removeFileIfExists = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlink(filePath, () => {});
  }
};

const audioPathFor = (filename) => path.join(songsDir, filename);
const coverPathFor = (filename) => path.join(coversDir, filename);

/**
 * @desc    Upload a new song (audio required, cover optional)
 * @route   POST /api/songs
 * @access  Private
 */
export const uploadSong = asyncHandler(async (req, res) => {
  const audioFile = req.files?.audio?.[0];
  const coverFile = req.files?.cover?.[0];

  if (!audioFile) {
    if (coverFile) removeFileIfExists(coverFile.path);
    throw new ApiError(400, 'An audio file is required');
  }

  // Multer's shared limit covers the max of the two; re-check the specific
  // limit per file type here and reject with a clear message if exceeded.
  if (audioFile.size > MAX_AUDIO_SIZE_BYTES) {
    removeFileIfExists(audioFile.path);
    if (coverFile) removeFileIfExists(coverFile.path);
    throw new ApiError(400, `Audio file exceeds the ${MAX_AUDIO_SIZE_BYTES / 1024 / 1024}MB limit`);
  }
  if (coverFile && coverFile.size > MAX_IMAGE_SIZE_BYTES) {
    removeFileIfExists(audioFile.path);
    removeFileIfExists(coverFile.path);
    throw new ApiError(400, `Cover image exceeds the ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB limit`);
  }

  // Extract duration server-side so the client never has to be trusted for it
  let duration = 0;
  try {
    const metadata = await parseFile(audioFile.path);
    duration = Math.round(metadata.format.duration || 0);
  } catch {
    // Non-fatal — malformed/unusual MP3 headers shouldn't block the upload
    duration = 0;
  }

  const { title, artist, album, genre } = req.body;

  const song = await Song.create({
    title,
    artist,
    album,
    genre,
    duration,
    audioUrl: `/uploads/songs/${audioFile.filename}`,
    coverUrl: coverFile ? `/uploads/covers/${coverFile.filename}` : '',
    uploadedBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Song uploaded successfully',
    song,
  });
});

/**
 * @desc    List songs with pagination, search, and filters
 * @route   GET /api/songs?search=&artist=&album=&genre=&page=&limit=
 * @access  Public
 */
export const getSongs = asyncHandler(async (req, res) => {
  const { search, artist, album, genre, uploadedBy } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const filter = {};
  if (artist) filter.artist = new RegExp(artist, 'i');
  if (album) filter.album = new RegExp(album, 'i');
  if (genre) filter.genre = genre;
  if (uploadedBy) filter.uploadedBy = uploadedBy;

  if (search) {
    // Regex OR-search across title/artist/album — more forgiving than
    // $text for partial/substring matches on short queries
    const re = new RegExp(search, 'i');
    filter.$or = [{ title: re }, { artist: re }, { album: re }];
  }

  const [songs, total] = await Promise.all([
    Song.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('uploadedBy', 'name avatar'),
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
 * @desc    Get a single song by id
 * @route   GET /api/songs/:id
 * @access  Public
 */
export const getSongById = asyncHandler(async (req, res) => {
  const song = await Song.findById(req.params.id).populate('uploadedBy', 'name avatar');
  if (!song) {
    throw new ApiError(404, 'Song not found');
  }
  res.status(200).json({ success: true, song });
});

/**
 * @desc    Get distinct artists, albums, and genres currently in use
 *          (powers filter dropdowns on the frontend)
 * @route   GET /api/songs/meta/filters
 * @access  Public
 */
export const getFilterOptions = asyncHandler(async (req, res) => {
  const [artists, albums, genres] = await Promise.all([
    Song.distinct('artist'),
    Song.distinct('album'),
    Song.distinct('genre'),
  ]);
  res.status(200).json({ success: true, artists, albums, genres });
});

/**
 * @desc    Update a song's metadata, and optionally replace its cover image
 * @route   PUT /api/songs/:id
 * @access  Private (uploader only)
 */
export const updateSong = asyncHandler(async (req, res) => {
  const song = await Song.findById(req.params.id);
  if (!song) {
    throw new ApiError(404, 'Song not found');
  }
  if (song.uploadedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only edit songs you uploaded');
  }

  const { title, artist, album, genre } = req.body;
  if (title !== undefined) song.title = title;
  if (artist !== undefined) song.artist = artist;
  if (album !== undefined) song.album = album;
  if (genre !== undefined) song.genre = genre;

  const newCover = req.files?.cover?.[0];
  if (newCover) {
    if (newCover.size > MAX_IMAGE_SIZE_BYTES) {
      removeFileIfExists(newCover.path);
      throw new ApiError(400, `Cover image exceeds the ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB limit`);
    }
    // Remove the old cover file before pointing to the new one
    if (song.coverUrl) {
      removeFileIfExists(coverPathFor(path.basename(song.coverUrl)));
    }
    song.coverUrl = `/uploads/covers/${newCover.filename}`;
  }

  await song.save();

  res.status(200).json({
    success: true,
    message: 'Song updated',
    song,
  });
});

/**
 * @desc    Delete a song and its associated files
 * @route   DELETE /api/songs/:id
 * @access  Private (uploader only)
 */
export const deleteSong = asyncHandler(async (req, res) => {
  const song = await Song.findById(req.params.id);
  if (!song) {
    throw new ApiError(404, 'Song not found');
  }
  if (song.uploadedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only delete songs you uploaded');
  }

  removeFileIfExists(audioPathFor(path.basename(song.audioUrl)));
  if (song.coverUrl) {
    removeFileIfExists(coverPathFor(path.basename(song.coverUrl)));
  }

  await song.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Song deleted',
  });
});
