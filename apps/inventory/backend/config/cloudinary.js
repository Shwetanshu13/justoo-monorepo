import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to Cloudinary
export const uploadImage = async (fileBuffer, folder = 'justoo/items') => {
    try {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: 'image',
                    transformation: [
                        { width: 800, height: 800, crop: 'limit' }, // Resize to max 800x800
                        { quality: 'auto' }, // Auto quality optimization
                        { fetch_format: 'auto' } // Auto format optimization
                    ]
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve({
                            url: result.secure_url,
                            publicId: result.public_id,
                            width: result.width,
                            height: result.height,
                            format: result.format,
                            bytes: result.bytes
                        });
                    }
                }
            );

            uploadStream.end(fileBuffer);
        });
    } catch (error) {
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
};

// Delete image from Cloudinary
export const deleteImage = async (publicId) => {
    try {
        if (!publicId) return;

        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        throw new Error(`Cloudinary delete failed: ${error.message}`);
    }
};

// Generate optimized image URL with transformations
export const getOptimizedImageUrl = (publicId, options = {}) => {
    const {
        width = 400,
        height = 400,
        quality = 'auto',
        format = 'auto',
        crop = 'fill'
    } = options;

    return cloudinary.url(publicId, {
        width,
        height,
        quality,
        format,
        crop,
        secure: true
    });
};

export default cloudinary;