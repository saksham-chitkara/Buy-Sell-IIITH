import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import User from "../models/User";
import Item from "../models/Item";
import { config } from "dotenv";

// Load environment variables
config();

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

// Connect to MongoDB
console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/buy-sell-iiith")
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const uploadsPath = path.join(__dirname, "..", "..", "uploads");

// Configure Cloudinary
console.log('Configuring Cloudinary...');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(filePath: string, folder: string) {
  try {
    console.log(`Uploading ${filePath} to Cloudinary/${folder}...`);
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto",
      transformation: [
        { width: 1000, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" }
      ]
    });
    console.log(`Successfully uploaded to ${result.secure_url}`);
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error(`Failed to upload ${filePath}:`, error);
    throw error;
  }
}

async function migrateAvatars() {
  console.log("Migrating user avatars...");
  const usersPath = path.join(uploadsPath, "users");
  const users = await User.find({ avatar: { $ne: "default-avatar.png" } });

  for (const user of users) {
    try {
      const avatarFilename = user.avatar;
      const oldAvatarPath = path.join(usersPath, avatarFilename);
      
      if (fs.existsSync(oldAvatarPath)) {
        console.log(`Uploading avatar for user ${user._id}: ${avatarFilename}`);
        const result = await uploadToCloudinary(oldAvatarPath, "users");
        await User.findByIdAndUpdate(user._id, {
          avatar: result.url,
          avatarPublicId: result.publicId,
        });
        console.log(`Successfully migrated avatar for user ${user._id}`);
      } else {
        console.log(`Avatar file not found: ${oldAvatarPath}`);
      }
    } catch (error) {
      console.error(`Failed to migrate avatar for user ${user._id}:`, error);
    }
  }
}

async function migrateItemImages() {
  console.log("Migrating item images...");
  const itemsPath = path.join(uploadsPath, "items");
  const items = await Item.find();

  for (const item of items) {
    try {
      const newImages = [];
      console.log(`Processing item ${item._id} with ${item.images.length} images:`, item.images);
      
      // Handle each image filename in the array
      for (const imageFilename of item.images) {
        const oldImagePath = path.join(itemsPath, imageFilename);
        
        if (fs.existsSync(oldImagePath)) {
          console.log(`Uploading image for item ${item._id}: ${imageFilename}`);
          const result = await uploadToCloudinary(oldImagePath, "items");
          newImages.push({
            url: result.url,
            publicId: result.publicId,
          });
          console.log(`Successfully uploaded image ${imageFilename}`);
        } else {
          console.log(`Image file not found: ${oldImagePath}`);
        }
      }

      if (newImages.length > 0) {
        await Item.findByIdAndUpdate(item._id, { images: newImages });
        console.log(`Successfully migrated ${newImages.length} images for item ${item._id}`);
      } else {
        console.log(`No images were migrated for item ${item._id}`);
      }
    } catch (error) {
      console.error(`Failed to migrate images for item ${item._id}:`, error);
    }
  }
}

async function main() {
  try {
    console.log("Starting migration to Cloudinary...");
    
    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      throw new Error("Missing Cloudinary environment variables");
    }
    
    // Verify folders exist
    const userUploadsPath = path.join(uploadsPath, "users");
    const itemUploadsPath = path.join(uploadsPath, "items");
    
    if (!fs.existsSync(userUploadsPath)) {
      console.log(`Creating users upload directory: ${userUploadsPath}`);
      fs.mkdirSync(userUploadsPath, { recursive: true });
    }
    
    if (!fs.existsSync(itemUploadsPath)) {
      console.log(`Creating items upload directory: ${itemUploadsPath}`);
      fs.mkdirSync(itemUploadsPath, { recursive: true });
    }

    await migrateAvatars();
    await migrateItemImages();
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

main();
