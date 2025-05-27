import multer from "multer";
import { Request } from "express";

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter function to accept only image files
export const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  console.log("Multer processing file:", {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  });

  // Check if field name is correct
  if (file.fieldname !== "images") {
    console.log("File rejected - wrong field name:", file.fieldname);
    cb(new Error("Wrong field name. Please use 'images'"));
    return;
  }

  // Check file type
  if (!file.mimetype.startsWith("image/")) {
    console.log("File rejected - not an image:", file.mimetype);
    cb(new Error("Not an image! Please upload an image file."));
    return;
  }

  // Accept common image formats
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    console.log("File rejected - unsupported image type:", file.mimetype);
    cb(new Error("Unsupported image format. Please use JPEG, PNG, GIF or WebP."));
    return;
  }

  console.log("File accepted as valid image");
  cb(null, true);
};

// Export multer configuration
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
    files: 5,                  // 5 files limit
  },
  fileFilter,
});
