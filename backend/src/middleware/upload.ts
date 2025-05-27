import multer from "multer";
import { cloudinary } from "../config/cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { Request } from "express";

console.log("[DEBUG] UPLOAD MIDDLEWARE LOADED:", new Date().toISOString());

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: (req: Request, file: MulterFile) => {
      const folderName = file.fieldname === "avatar" ? "users" : "items";
      console.log(`[DEBUG] CloudinaryStorage: using folder '${folderName}' for file '${file.originalname}'`);
      return folderName;
    },
    public_id: (req: Request, file: MulterFile) => {
      // Generate a unique public ID for Cloudinary
      const publicId = `${file.fieldname}-${Date.now()}-${Math.floor(Math.random() * 1000000000)}`;
      console.log(`[DEBUG] CloudinaryStorage: generated public_id '${publicId}' for file '${file.originalname}'`);
      return publicId;
    },
    allowed_formats: ["jpg", "jpeg", "png", "gif"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  } as any,
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file: MulterFile, cb) => {
    console.log(`[DEBUG] Multer: checking file '${file.originalname}', mimetype: ${file.mimetype}`);
    if (file.mimetype.startsWith("image/")) {
      console.log(`[DEBUG] Multer: accepted file '${file.originalname}'`);
      cb(null, true);
    } else {
      console.log(`[DEBUG] Multer: rejected file '${file.originalname}' - not an image`);
      cb(new Error("Not an image! Please upload an image."));
    }
  },
});
