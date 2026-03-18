import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';
import { AppError } from '../utils/errorHandler.js';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_DOC_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

const profilePhotoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'maidproject/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  },
});

const aadhaarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'maidproject/aadhaar',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
    // Restricted access - never returned in public APIs
    type: 'private',
  },
});

const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new AppError(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`, 400), false);
  }
  cb(null, true);
};

export const uploadProfilePhoto = multer({
  storage: profilePhotoStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: fileFilter(ALLOWED_IMAGE_TYPES),
}).single('profilePhoto');

export const uploadAadhaar = multer({
  storage: aadhaarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter(ALLOWED_DOC_TYPES),
}).single('aadhaar');
