import { Request, Response } from "express";
import Item from "../models/Item";
import { uploadToCloudinary, deleteFromCloudinary } from "../middleware/image";

interface AuthRequest extends Request {
  user?: {
    _id: string;
    id: string;
    email: string;
    [key: string]: any;
  };
  files?: Express.Multer.File[];
  file?: Express.Multer.File;
}

/**
 * GET /items
 * Returns all available items (isAvailable: true), sorted by newest first.
 */
export const getAllItems = async (req: Request, res: Response) => {
  try {
    const items = await Item.find({ isAvailable: true })
      .populate("seller", "firstName lastName email rating")
      .sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    console.error("Error getting items:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /items
 * Requires auth middleware → req.user._id
 * Expects req.body to include name, description, price, quantity, categories, and
 * req.body.image set by handleImageUpload middleware (if a file was provided).
 */
export const createItem = async (req: Request, res: Response) => {
  try {
    console.log("Creating item with auth:", req.headers.authorization); // Debug auth
    const user = (req as AuthRequest).user;
    console.log("Authenticated user:", user); // Debug user
    if (!user?.id) {
      console.log("Authentication failed - no user"); // Debug auth
      return res.status(401).json({
        status: "error",
        message: "Not authenticated",
      });
    }

    const itemData = {
      ...req.body,
      seller: user.id,
    };

    // Handle images from Cloudinary upload middleware
    const files = (req as AuthRequest).files;
    console.log("Files received:", files?.length); // Debug files

    if (files && Array.isArray(files) && files.length > 0) {
      const uploadPromises = files.map((file) => uploadToCloudinary(file, "items"));
      const uploadResults = await Promise.all(uploadPromises);
      console.log("Upload results:", uploadResults); // Debug uploads

      itemData.images = uploadResults.map((result) => ({
        public_id: result.public_id,
        url: result.url,
      }));
    }

    console.log("Creating item with data:", itemData); // Debug item data
    const item = new Item(itemData);
    await item.save();
    console.log("Item saved successfully:", item); // Debug save

    res.status(201).json({
      status: "success",
      data: item,
    });
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(400).json({
      status: "error",
      message: error instanceof Error ? error.message : "Failed to create item",
    });
  }
};

/**
 * GET /items/:id
 * Returns a single item by ID (populating seller info).
 */
export const getItem = async (req: Request, res: Response) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      "seller",
      "firstName lastName email"
    );
    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Item not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: item,
    });
  } catch (error: any) {
    console.error("Error fetching item:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to fetch item",
    });
  }
};

/**
 * PATCH /items/:id
 * Requires auth. Only the seller who owns the item may update it.
 * If req.body.image was set by handleImageUpload (new image), we delete the old one from Cloudinary.
 */
export const updateItem = async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user?._id) {
      return res.status(401).json({
        status: "error",
        message: "Not authenticated",
      });
    }

    // Get the existing item to handle image deletion
    const existingItem = await Item.findOne({ _id: req.params.id, seller: user._id });
    if (!existingItem) {
      return res.status(404).json({
        status: "error",
        message: "Item not found or you're not the seller",
      });
    }

    const updates = { ...req.body };
    const files = (req as AuthRequest).files;

    // Handle new image upload
    if (files && Array.isArray(files) && files.length > 0) {
      // Delete old images from Cloudinary
      if (existingItem.images && Array.isArray(existingItem.images)) {
        const deletePromises = existingItem.images.map((image) =>
          deleteFromCloudinary(image.public_id)
        );
        await Promise.all(deletePromises);
      }

      // Upload new images
      const uploadPromises = files.map((file) => uploadToCloudinary(file, "items"));
      const uploadResults = await Promise.all(uploadPromises);
      updates.images = uploadResults.map((result) => ({
        public_id: result.public_id,
        url: result.url,
      }));
    }

    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, seller: user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      data: item,
    });
  } catch (error: any) {
    console.error("Error updating item:", error);
    res.status(400).json({
      status: "error",
      message: error.message || "Failed to update item",
    });
  }
};

/**
 * DELETE /items/:id
 * Requires auth. Only the seller who owns the item may delete it.
 * Also deletes the associated Cloudinary image if it exists.
 */
export const deleteItem = async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user?._id) {
      return res.status(401).json({
        status: "error",
        message: "Not authenticated",
      });
    }

    const item = await Item.findOne({
      _id: req.params.id,
      seller: user._id,
    });

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Item not found or you're not the seller",
      });
    }

    // Delete all images from Cloudinary
    if (item.images && Array.isArray(item.images)) {
      const deletePromises = item.images.map((image) =>
        deleteFromCloudinary(image.public_id)
      );
      await Promise.all(deletePromises);
    }

    // Delete the item from database
    await Item.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: "success",
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({
      status: "error",
      message: error instanceof Error ? error.message : "Failed to delete item",
    });
  }
};
