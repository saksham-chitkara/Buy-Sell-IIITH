import { Request, Response } from "express";
import CartItem from "../models/CartItem";
import Item from "../models/Item";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const addToCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { itemId, quantity } = req.body;

    // Check if item exists and is available
    const item = await Item.findOne({ _id: itemId, isAvailable: true });
    if (!item) {
      res.status(404).json({ message: "Item not found or unavailable" });
      return;
    }

    // Check if user is not buying their own item
    if (item.seller.toString() === req.user!.id) {
      res.status(400).json({ message: "Cannot buy your own item" });
      return;
    }

    // Check if item is already in cart
    let cartItem = await CartItem.findOne({
      user: req.user!.id,
      item: itemId,
    });

    if (cartItem) {
      cartItem.quantity = quantity;
      await cartItem.save();
    } else {
      cartItem = new CartItem({
        user: req.user!.id,
        item: itemId,
        quantity,
      });
      await cartItem.save();
    }

    res.status(201).json({
      message: "Item added to cart successfully",
      cartItem,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const cartItems = await CartItem.find({ user: req.user!.id })
      .populate("item")
      .populate("item.seller", "firstName lastName email");

    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateCartItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { quantity, savedForLater } = req.body;
    const cartItem = await CartItem.findOne({
      _id: req.params.id,
      user: req.user!.id,
    });

    if (!cartItem) {
      res.status(404).json({ message: "Cart item not found" });
      return;
    }

    if (quantity !== undefined) cartItem.quantity = quantity;
    if (savedForLater !== undefined) cartItem.savedForLater = savedForLater;

    await cartItem.save();

    res.json({
      message: "Cart item updated successfully",
      cartItem,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const removeFromCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const cartItem = await CartItem.findOneAndDelete({
      _id: req.params.id,
      user: req.user!.id,
    });

    if (!cartItem) {
      res.status(404).json({ message: "Cart item not found" });
      return;
    }

    res.json({ message: "Item removed from cart successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const bargainItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { price, message } = req.body;
    const cartItem = await CartItem.findOne({
      _id: req.params.id,
      user: req.user!.id,
    });

    if (!cartItem) {
      res.status(404).json({ message: "Cart item not found" });
      return;
    }

    cartItem.bargainRequest = {
      price,
      message,
      status: "PENDING",
    };

    await cartItem.save();

    res.json({
      message: "Bargain request sent successfully",
      cartItem,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getCartCount = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const count = await CartItem.countDocuments({ user: req.user!.id });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const checkItemInCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const itemId = req.params.itemId;
    const inCart = await CartItem.exists({ user: req.user!.id, item: itemId });
    res.json({ inCart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
