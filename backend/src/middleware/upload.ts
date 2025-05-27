import multer from "multer";
import { cloudinary } from "../config/cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { Request } from "express";

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
      return file.fieldname === "avatar" ? "users" : "items";
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
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload an image."));
    }
  },
});
