import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  MAX_AUDIO_SIZE_BYTES,
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_AUDIO_TYPES,
  ALLOWED_IMAGE_TYPES,
} from '../config/constants.js';
import ApiError from '../utils/ApiError.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const songsDir = path.join(__dirname, '..', 'uploads', 'songs');
const coversDir = path.join(__dirname, '..', 'uploads', 'covers');

// Ensure upload directories exist (they're gitkept but a fresh clone/deploy
// might not have them if .gitignore stripped the contents)
[songsDir, coversDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'audio') return cb(null, songsDir);
    if (file.fieldname === 'cover') return cb(null, coversDir);
    cb(new ApiError(400, 'Unexpected file field'), null);
  },
  filename: (req, file, cb) => {
    // uniqueSuffix avoids collisions between two uploads with the same original name
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'audio') {
    if (!ALLOWED_AUDIO_TYPES.includes(file.mimetype)) {
      return cb(new ApiError(400, 'Audio file must be MP3 or WAV'), false);
    }
  }
  if (file.fieldname === 'cover') {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return cb(new ApiError(400, 'Cover image must be JPEG, PNG, or WebP'), false);
    }
  }
  cb(null, true);
};

// Single multer instance handles both fields; size limit uses the larger
// of the two (audio) — filename-specific limits aren't supported natively,
// so per-file-type size is re-validated in the controller if needed.
export const uploadSongFiles = multer({
  storage,
  fileFilter,
  limits: { fileSize: Math.max(MAX_AUDIO_SIZE_BYTES, MAX_IMAGE_SIZE_BYTES) },
}).fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 },
]);

export { songsDir, coversDir };
