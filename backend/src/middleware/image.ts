import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";

interface AuthRequest extends Request {
  user?: {
    _id: string;
    [key: string]: any;
  };
  files?: Express.Multer.File[];
  file?: Express.Multer.File;
}

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: "users" | "items"
): Promise<{ public_id: string; url: string }> => {
  try {
    console.log("Starting Cloudinary upload for file:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      folder,
    });

    // Convert buffer → base64
    const b64 = Buffer.from(file.buffer).toString("base64");
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    console.log("Uploading to Cloudinary with options:", {
      folder,
      resource_type: "auto",
    });

    // Use the configured cloudinary instance
    const result = await cloudinary.uploader.upload(dataURI, {
      folder,
      resource_type: "auto",
      transformation: [
        { width: 1000, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    console.log("Upload successful:", {
      public_id: result.public_id,
      url: result.secure_url,
    });

    return {
      public_id: result.public_id,
      url: result.secure_url.startsWith("https://")
        ? result.secure_url
        : `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${result.public_id}`,
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    throw new Error("Failed to upload image");
  }
};

export const handleImageUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("handleImageUpload middleware called");
  const authRequest = req as AuthRequest;

  if (!authRequest.files && !authRequest.file) {
    console.log("No files found in request");
    return next();
  }

  try {
    const folder = req.baseUrl.includes("users") ? "users" : "items";
    console.log("Determined upload folder:", folder);

    if (authRequest.files && Array.isArray(authRequest.files)) {
      console.log("Processing multiple files:", authRequest.files.length);
      const uploadPromises = authRequest.files.map((file) =>
        uploadToCloudinary(file, folder)
      );
      const uploadResults = await Promise.all(uploadPromises);

      req.body.images = uploadResults.map((result) => ({
        public_id: result.public_id,
        url: result.url,
      }));

      console.log("Multiple files uploaded:", req.body.images);
    } else if (authRequest.file) {
      console.log("Processing single file");
      const result = await uploadToCloudinary(authRequest.file, folder);
      req.body.image = {
        public_id: result.public_id,
        url: result.url,
      };
      console.log("Single file uploaded:", req.body.image);
    }

    next();
  } catch (error) {
    console.error("Error in handleImageUpload middleware:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to upload image",
    });
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted Cloudinary image: ${publicId}`);
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw new Error("Failed to delete image from Cloudinary");
  }
};

