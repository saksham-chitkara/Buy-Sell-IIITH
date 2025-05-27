import { Request, Response } from "express";
import Item from "../models/Item";

// Use Express's built-in types for file uploads
interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    [key: string]: any;
  };
}

export const getAllItems = async (req: Request, res: Response) => {
  try {
    const items = await Item.find({ isAvailable: true })
      .populate('seller', 'firstName lastName email rating')
      .sort({ createdAt: -1 });
    
    res.status(200).json(items);
  } catch (error) {
    console.error('Error getting items:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createItem = async (req: Request, res: Response) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user?._id) {
      return res.status(401).json({
        status: "error",
        message: "Not authenticated",
      });
    }

    const itemData = {
      ...req.body,
      seller: user._id,
    };

    // Handle images from Cloudinary upload middleware
    if (req.body.images && Array.isArray(req.body.images)) {
      itemData.images = req.body.images;
    }

    const item = new Item(itemData);
    await item.save();

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

export const getItem = async (req: Request, res: Response) => {
  try {
    const item = await Item.findById(req.params.id).populate("seller", "firstName lastName email");
    
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
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error instanceof Error ? error.message : "Failed to fetch item",
    });
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user?._id) {
      return res.status(401).json({
        status: "error",
        message: "Not authenticated",
      });
    }

    const updates = { ...req.body };
    
    // Handle images from Cloudinary upload middleware
    if (req.body.images && Array.isArray(req.body.images)) {
      updates.images = req.body.images;
    }

    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, seller: user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Item not found or you're not the seller",
      });
    }

    res.status(200).json({
      status: "success",
      data: item,
    });
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(400).json({
      status: "error",
      message: error instanceof Error ? error.message : "Failed to update item",
    });
  }
};

export const deleteItem = async (req: Request, res: Response) => {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user?._id) {
      return res.status(401).json({
        status: "error",
        message: "Not authenticated",
      });
    }

    const item = await Item.findOneAndDelete({
      _id: req.params.id,
      seller: user._id,
    });

    if (!item) {
      return res.status(404).json({
        status: "error",
        message: "Item not found or you're not the seller",
      });
    }

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
