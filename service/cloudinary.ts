import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

interface UploadResult {
  url: string;
  publicId: string;
}

// Upload function accepting buffer
const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folder: string = "Simple-Image-Uploader"
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: "auto" }, (error, result) => {
        if (error) {
          return reject(error);
        }
        // Check if result is defined before accessing properties
        if (!result) {
          return reject(new Error("Upload failed: no result returned"));
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      })
      .end(fileBuffer);
  });
};

const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted image with public ID: ${publicId}`);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export { uploadToCloudinary, deleteFromCloudinary };
