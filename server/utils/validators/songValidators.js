import { body, query } from 'express-validator';
import { GENRES } from '../../config/constants.js';

export const uploadSongValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }),
  body('artist').trim().notEmpty().withMessage('Artist is required').isLength({ max: 100 }),
  body('album').optional().trim().isLength({ max: 100 }),
  body('genre').optional().isIn(GENRES).withMessage(`Genre must be one of: ${GENRES.join(', ')}`),
];

export const updateSongValidation = [
  body('title').optional().trim().notEmpty().isLength({ max: 100 }),
  body('artist').optional().trim().notEmpty().isLength({ max: 100 }),
  body('album').optional().trim().isLength({ max: 100 }),
  body('genre').optional().isIn(GENRES).withMessage(`Genre must be one of: ${GENRES.join(', ')}`),
];

export const listSongsValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1-100'),
  query('genre').optional().isIn(GENRES).withMessage(`genre must be one of: ${GENRES.join(', ')}`),
];
