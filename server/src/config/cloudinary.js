import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a buffer to Cloudinary.
 * Uses base64 data URI — works with multer.memoryStorage() and cloudinary v1/v2.
 */
export const uploadToCloudinary = (buffer, options = {}) => {
  const b64 = Buffer.from(buffer).toString('base64');
  const dataUri = `data:application/octet-stream;base64,${b64}`;
  return cloudinary.uploader.upload(dataUri, { resource_type: 'auto', ...options });
};

export default cloudinary;
