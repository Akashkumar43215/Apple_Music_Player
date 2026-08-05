import mongoose from 'mongoose';
import { GENRES } from '../config/constants.js';

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    artist: {
      type: String,
      required: [true, 'Artist is required'],
      trim: true,
      maxlength: [100, 'Artist cannot exceed 100 characters'],
    },
    album: {
      type: String,
      trim: true,
      default: 'Single',
      maxlength: [100, 'Album cannot exceed 100 characters'],
    },
    genre: {
      type: String,
      enum: GENRES,
      default: 'Other',
    },
    duration: {
      type: Number, // seconds, extracted server-side from the audio file
      default: 0,
    },
    audioUrl: {
      type: String,
      required: [true, 'Audio file is required'],
    },
    coverUrl: {
      type: String,
      default: '', // falls back to a generated placeholder on the frontend
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    playCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Supports the search endpoint (title/artist/album partial match)
songSchema.index({ title: 'text', artist: 'text', album: 'text' });
// Supports filter-by-artist/genre queries
songSchema.index({ artist: 1 });
songSchema.index({ genre: 1 });

const Song = mongoose.model('Song', songSchema);

export default Song;
