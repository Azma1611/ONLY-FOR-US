import { v2 as cloudinary } from 'cloudinary';

/**
 * Configure and register Cloudinary media storage configurations.
 */
const configureCloudinary = () => {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
    console.log('☁️ Cloudinary config initialized successfully.');
  } else {
    console.warn('⚠️ Cloudinary environment credentials missing. File uploads to cloud storage will be disabled.');
  }
};

export default configureCloudinary;
export { cloudinary };
