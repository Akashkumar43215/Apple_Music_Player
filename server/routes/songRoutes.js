import express from 'express';
import {
  uploadSong,
  getSongs,
  getSongById,
  getFilterOptions,
  getSuggestions,
  getBrowseList,
  updateSong,
  deleteSong,
} from '../controllers/songController.js';
import { getSimilarSongs, getLyrics } from '../controllers/smartController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import validate from '../middleware/validateMiddleware.js';
import { uploadSongFiles } from '../config/multerConfig.js';
import {
  uploadSongValidation,
  updateSongValidation,
  listSongsValidation,
} from '../utils/validators/songValidators.js';

const router = express.Router();

// Public — anyone can browse/search the library
router.get('/', listSongsValidation, validate, getSongs);
router.get('/meta/filters', getFilterOptions);
router.get('/meta/suggest', getSuggestions);
router.get('/meta/browse', getBrowseList);
router.get('/:id/similar', getSimilarSongs);
router.get('/:id/lyrics', protect, getLyrics);
router.get('/:id', getSongById);

// Private — upload/edit/delete require auth; ownership is checked in the controller
router.post('/', protect, authorize('admin'), uploadSongFiles, uploadSongValidation, validate, uploadSong);
router.put('/:id', protect, uploadSongFiles, updateSongValidation, validate, updateSong);
router.delete('/:id', protect, deleteSong);

export default router;
