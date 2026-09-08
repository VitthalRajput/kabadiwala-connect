// utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (fileOrPath) => {
    try {
        if (!fileOrPath) return null;

        // Case 1: Multer memory storage (file object with buffer)
        if (typeof fileOrPath === "object" && fileOrPath.buffer) {
            const b64 = Buffer.from(fileOrPath.buffer).toString("base64");
            const dataURI = `data:${fileOrPath.mimetype || "image/jpeg"};base64,${b64}`;
            const response = await cloudinary.uploader.upload(dataURI, {
                resource_type: "auto",
            });
            console.log("✅ File uploaded on Cloudinary:", response.url);
            return response;
        }

        // Case 2: Multer disk storage (file object with path)
        const filePath = typeof fileOrPath === "object" ? fileOrPath.path : fileOrPath;
        if (typeof filePath === "string" && filePath.length > 0) {
            const response = await cloudinary.uploader.upload(filePath, {
                resource_type: "auto",
            });
            console.log("✅ File uploaded on Cloudinary:", response.url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            return response;
        }

        return null;
    } catch (error) {
        console.error("❌ Cloudinary upload error:", error?.message || error);
        // Clean up temporary local file if it exists
        const filePath = typeof fileOrPath === "object" ? fileOrPath.path : fileOrPath;
        if (typeof filePath === "string" && fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch {}
        }
        // Fallback so lot creation succeeds even if Cloudinary network or quota has issues
        if (typeof fileOrPath === "object" && fileOrPath.buffer) {
            const b64 = Buffer.from(fileOrPath.buffer).toString("base64");
            return { url: `data:${fileOrPath.mimetype || "image/jpeg"};base64,${b64}` };
        }
        return { url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80" };
    }
};

export { uploadOnCloudinary };