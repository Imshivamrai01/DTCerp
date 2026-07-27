import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (fileBuffer, folder, currentPublicId = null) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (currentPublicId) {
        await cloudinary.uploader.destroy(currentPublicId);
      }
      
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: folder },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            public_id: result.public_id,
            secure_url: result.secure_url,
          });
        }
      );

      uploadStream.end(fileBuffer);
    } catch (err) {
      reject(err);
    }
  });
};

export default cloudinary;
