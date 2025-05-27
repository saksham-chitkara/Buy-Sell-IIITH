import { Request, Response } from "express";
import Item from "../models/Item";
import Order from "../models/Order";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const createItem = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, quantity, categories } = req.body;
    const images = (req.files as Express.Multer.File[]).map((file: any) => ({
      public_id: file.filename,
      url: file.path
    }));

    const item = new Item({
      name,
      description,
      price,
      quantity,
      categories: categories.split(","),
      images,
      seller: req.user!.id,
    });

    await item.save();

    res.status(201).json({
      message: "Item created successfully",
      item,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getItems = async (req: Request, res: Response) => {
  try {
    const { search, categories, minPrice, maxPrice } = req.query;

    let query: any = { isAvailable: true };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (categories) {
      query.categories = { $in: (categories as string).split(",") };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const items = await Item.find(query)
      .populate("seller", "firstName lastName email overallRating")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id).populate(
      "seller",
      "firstName lastName email overallRating avatar"
    );

    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      seller: req.user!.id,
    });

    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    const updates = req.body;
    if (req.files?.length) {
      updates.images = (req.files as Express.Multer.File[]).map(
        (file) => file.filename
      );
    }

    Object.assign(item, updates);
    await item.save();

    res.json({
      message: "Item updated successfully",
      item,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // const item = await Item.findOneAndDelete({
    //   _id: req.params.id,
    //   seller: req.user!.id,
    // });

    // Instead of deleting the item, we will mark it as unavailable and reduce the quantity to 0
    // This fixes several issues with the current implementation, and allows us to keep the item in the database

    const item = await Item.findOneAndUpdate(
      {
        _id: req.params.id,
        seller: req.user!.id,
      },
      {
        isAvailable: false,
        quantity: 0,
      },
      { new: true }
    );

    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    // Then, update all orders containing this item to be cancelled
    await Order.updateMany(
      { item: req.params.id, status: "PENDING" },
      { status: "CANCELLED" }
    );

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
