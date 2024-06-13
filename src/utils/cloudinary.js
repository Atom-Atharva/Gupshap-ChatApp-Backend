import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath, subfolder) => {
    try {
        if (!localFilePath) {
            return null;
        }

        const response = await cloudinary.uploader.upload(localFilePath, {
            folder: `ChatApp/${subfolder}`,
            resource_type: "auto",
        });

        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        console.log("File Failed to Upload: ", error);
        return null;
    }
};
const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) {
            return null;
        }
        const result = await cloudinary.uploader.destroy(publicId);

        return result;
    } catch (error) {
        console.error("Error deleting file:", error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };
