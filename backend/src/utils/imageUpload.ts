import cloudinary from "../config/cloudinary";

export const uploadToCloudinary = async (file: Express.Multer.File) => {
  try {
    // Convert file buffer to base64
    const b64 = Buffer.from(file.buffer).toString("base64");
    const dataURI = "data:" + file.mimetype + ";base64," + b64;
    
    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: "auto",
      folder: file.fieldname === "avatar" ? "users" : "items",
      transformation: [
        { width: 1000, crop: "limit" }, // Basic resize
        { quality: "auto" }, // Automatic quality optimization
        { fetch_format: "auto" } // Automatic format optimization
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};
