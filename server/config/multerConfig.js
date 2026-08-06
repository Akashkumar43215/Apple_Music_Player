import multer from "multer";
import {
  MAX_AUDIO_SIZE_BYTES,
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_AUDIO_TYPES,
  ALLOWED_IMAGE_TYPES,
} from "../config/constants.js";
import ApiError from "../utils/ApiError.js";

// Store files in memory instead of saving to uploads/
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "audio") {
    if (!ALLOWED_AUDIO_TYPES.includes(file.mimetype)) {
      return cb(new ApiError(400, "Audio file must be MP3 or WAV"), false);
    }
  }

  if (file.fieldname === "cover") {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return cb(
        new ApiError(400, "Cover image must be JPEG, PNG, or WebP"),
        false
      );
    }
  }

  cb(null, true);
};

export const uploadSongFiles = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Math.max(MAX_AUDIO_SIZE_BYTES, MAX_IMAGE_SIZE_BYTES),
  },
}).fields([
  { name: "audio", maxCount: 1 },
  { name: "cover", maxCount: 1 },
]);