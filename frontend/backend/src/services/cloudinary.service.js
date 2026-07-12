import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// Configure Multer to buffer files in memory before cloud transfer
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

/**
 * Uploads a file buffer directly to Cloudinary using upload streams.
 * Automatically handles local mock fallbacks if Cloudinary is not configured.
 */
export const uploadToCloudinary = (fileBuffer, folder = 'only_for_us') => {
  return new Promise((resolve, reject) => {
    // Fallback Mock URL in development if cloud properties are unset
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      console.warn('⚠️ Cloudinary cloud name unset. Returning mock upload attachment URL...');
      resolve(`https://res.cloudinary.com/demo/image/upload/v1600000000/mock_attachment.png`);
      return;
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary stream upload error:', error.message);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    stream.end(fileBuffer);
  });
};

/**
 * Deletes an asset from Cloudinary given its secure URL.
 */
export const deleteFromCloudinary = async (imageUrl) => {
  if (!imageUrl || !process.env.CLOUDINARY_CLOUD_NAME) return;

  try {
    // Extract publicId path from the URL
    // Format: .../upload/vXXXXXXXXXX/folderName/fileName.ext
    const urlParts = imageUrl.split('/');
    const fileWithExtension = urlParts[urlParts.length - 1];
    const folderName = urlParts[urlParts.length - 2];
    const publicIdWithoutExt = fileWithExtension.split('.')[0];
    
    // Construct full path identifier
    const fullPublicId = `${folderName}/${publicIdWithoutExt}`;

    await cloudinary.uploader.destroy(fullPublicId);
    console.log(`☁️ Successfully deleted asset from Cloudinary: ${fullPublicId}`);
  } catch (error) {
    console.error(`❌ Cloudinary deletion failure: ${error.message}`);
  }
};
