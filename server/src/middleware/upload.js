import multer from 'multer';
import { AppError } from '../utils/errorHandler.js';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_DOC_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

const fileFilter = (allowedTypes) => (_req, file, cb) => {
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new AppError(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`, 400), false);
  }
  cb(null, true);
};

// Wrap multer to convert errors into clean AppErrors instead of raw 500s
const wrapMulter = (handler) => (req, res, next) => {
  handler(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 5 MB).' : err.message;
      return next(new AppError(msg, 400));
    }
    if (err.isOperational) return next(err);
    console.error('[Multer error]', err.message);
    return next(new AppError('File upload failed.', 500));
  });
};

// Files are stored in memory as req.file.buffer.
// Controllers upload the buffer to Cloudinary via uploadToCloudinary() from config/cloudinary.js.
export const uploadProfilePhoto = wrapMulter(
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter(ALLOWED_IMAGE_TYPES),
  }).single('profilePhoto')
);

export const uploadAadhaar = wrapMulter(
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter(ALLOWED_DOC_TYPES),
  }).single('aadhaar')
);

export const uploadPassbook = wrapMulter(
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter(ALLOWED_DOC_TYPES),
  }).single('passbook')
);
