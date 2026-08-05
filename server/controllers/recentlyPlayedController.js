import asyncHandler from 'express-async-handler';
import RecentlyPlayed from '../models/RecentlyPlayed.js';
import Song from '../models/Song.js';
import ApiError from '../utils/ApiError.js';

/**
 * @desc    Log that the current user played a song. Called by the player
 *          when a track starts (after a few seconds, to avoid counting
 *          accidental clicks). Upserts so replaying just bumps playedAt,
 *          and increments the song's global play count.
 * @route   POST /api/recently-played/:songId
 * @access  Private
 */
export const recordPlay = asyncHandler(async (req, res) => {
  const { songId } = req.params;

  const song = await Song.findById(songId);
  if (!song) {
    throw new ApiError(404, 'Song not found');
  }

  await RecentlyPlayed.findOneAndUpdate(
    { user: req.user._id, song: songId },
    { playedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  song.playCount += 1;
  await song.save();

  res.status(200).json({ success: true, message: 'Play recorded' });
});

/**
 * @desc    Get the current user's recently played songs, most recent first
 * @route   GET /api/recently-played?limit=20
 * @access  Private
 */
export const getRecentlyPlayed = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);

  const entries = await RecentlyPlayed.find({ user: req.user._id })
    .sort({ playedAt: -1 })
    .limit(limit)
    .populate({
      path: 'song',
      populate: { path: 'uploadedBy', select: 'name avatar' },
    });

  // Filter out entries whose song was since deleted
  const songs = entries.filter((e) => e.song).map((e) => e.song);

  res.status(200).json({ success: true, songs });
});

/**
 * @desc    Clear the current user's recently played history
 * @route   DELETE /api/recently-played
 * @access  Private
 */
export const clearRecentlyPlayed = asyncHandler(async (req, res) => {
  await RecentlyPlayed.deleteMany({ user: req.user._id });
  res.status(200).json({ success: true, message: 'Recently played history cleared' });
});
