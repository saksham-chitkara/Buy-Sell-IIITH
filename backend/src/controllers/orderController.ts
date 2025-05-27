import { Request, Response } from "express";
import Order from "../models/Order";
import Item from "../models/Item";
import CartItem from "../models/CartItem";
import { generateOTP } from "../utils/helpers";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { cartItemIds } = req.body;
    const orders = [];

    // Start a transaction
    const session = await Order.startSession();
    session.startTransaction();

    try {
      for (const cartItemId of cartItemIds) {
        const cartItem = await CartItem.findById(cartItemId)
          .populate("item")
          .populate("item.seller");

        if (!cartItem) {
          throw new Error(`Cart item ${cartItemId} not found`);
        }

        // Check if item is still available and has enough quantity
        const item = await Item.findById(cartItem.item);
        if (!item || !item.isAvailable || item.quantity < cartItem.quantity) {
          throw new Error(
            `Item ${item?.name} is not available in requested quantity`
          );
        }

        // Generate OTP and set expiry (5 minutes from now)
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

        const order = new Order({
          item: cartItem.item,
          buyer: req.user!.id,
          seller: item.seller,
          quantity: cartItem.quantity,
          price: item.price,
          bargainedPrice:
            cartItem.bargainRequest?.status === "ACCEPTED"
              ? cartItem.bargainRequest.price
              : item.price,
          otp,
          otpExpiry,
        });

        await order.save({ session });

        // Update item quantity
        item.quantity -= cartItem.quantity;
        if (item.quantity === 0) {
          item.isAvailable = false;
        }
        await item.save({ session });

        // Remove item from cart
        await CartItem.findByIdAndDelete(cartItemId, { session });

        orders.push(order);
      }

      await session.commitTransaction();
      res.status(201).json({
        message: "Orders created successfully",
        orders,
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { type = "all", status } = req.query;
    let query: any = {};

    // Filter by user role (buyer/seller)
    if (type === "bought") {
      query.buyer = req.user!.id;
    } else if (type === "sold") {
      query.seller = req.user!.id;
    } else {
      query.$or = [{ buyer: req.user!.id }, { seller: req.user!.id }];
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("item")
      .populate("buyer", "firstName lastName email")
      .populate("seller", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const regenerateOTP = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      buyer: req.user!.id,
      status: "PENDING",
    });

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    // Generate new OTP and set expiry
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    order.otp = otp;
    order.otpExpiry = otpExpiry;
    await order.save();

    res.json({
      message: "OTP regenerated successfully",
      otp, // This will be sent to user's email in production
      otpExpiry,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const cancelOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      buyer: req.user!.id,
      status: "PENDING",
    });

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    // Update item quantity
    const item = await Item.findById(order.item);
    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }
    item.quantity += order.quantity;
    item.isAvailable = true;
    await item.save();

    order.status = "CANCELLED";
    await order.save();

    res.json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
