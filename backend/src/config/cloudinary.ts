import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

// Debug: Print Cloudinary config values (masking secrets)
console.log("[DEBUG] Cloudinary Configuration:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "Set (masked)" : "Missing!",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "Set (masked)" : "Missing!"
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };
