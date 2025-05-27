import { Request, Response, NextFunction } from "express";
import { v2 as cloudinary } from "cloudinary";

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: "users" | "items"
): Promise<string> => {
  try {
    const b64 = Buffer.from(file.buffer).toString("base64");
    const dataURI = "data:" + file.mimetype + ";base64," + b64;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder,
      resource_type: "auto",
      transformation: [
        { width: 1000, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    // Make sure we return the full secure URL
    if (!result.secure_url.startsWith('https://')) {
      return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${result.public_id}`;
    }
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error("Failed to upload image");
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw new Error("Failed to delete image from Cloudinary");
  }
};

export const handleImageUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file && !req.files) {
    return next();
  }

  try {
    const folder = req.baseUrl.includes("users") ? "users" : "items";

    if (req.file) {
      // Single file upload
      const imageUrl = await uploadToCloudinary(req.file, folder);
      req.body.imageUrl = imageUrl;
    } else if (req.files && Array.isArray(req.files)) {
      // Multiple files upload
      const uploadPromises = req.files.map((file) => uploadToCloudinary(file, folder));
      const imageUrls = await Promise.all(uploadPromises);
      req.body.images = imageUrls;
    }

    next();
  } catch (error) {
    next(error);
  }
};
