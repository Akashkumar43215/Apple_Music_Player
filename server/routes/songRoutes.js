import express from 'express';
import {
  uploadSong,
  getSongs,
  getSongById,
  getFilterOptions,
  updateSong,
  deleteSong,
} from '../controllers/songController.js';
import { protect } from '../middleware/authMiddleware.js';
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
router.get('/:id', getSongById);

// Private — upload/edit/delete require auth; ownership is checked in the controller
router.post('/', protect, uploadSongFiles, uploadSongValidation, validate, uploadSong);
router.put('/:id', protect, uploadSongFiles, updateSongValidation, validate, updateSong);
router.delete('/:id', protect, deleteSong);

export default router;
