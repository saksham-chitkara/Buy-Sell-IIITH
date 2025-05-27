import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

// Load environment variables - be sure this runs first
dotenv.config();

// Log the values to debug (we'll remove these later)
console.log("Cloudinary Config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "not set",
  api_key: process.env.CLOUDINARY_API_KEY || "not set",
  api_secret: process.env.CLOUDINARY_API_SECRET || "not set",
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  secure: true,
});

export default cloudinary;
