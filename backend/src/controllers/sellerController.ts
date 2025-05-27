import { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../models/Order";
import Item from "../models/Item";
import CartItem from "../models/CartItem";
import { AuthRequest } from "../types";

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Get all completed orders for revenue calculation
    const orders = await Order.find({
      seller: userId,
      status: "DELIVERED",
    }).sort({ createdAt: 1 });

    // Calculate monthly revenue
    const salesData = orders.reduce(
      (acc: any[], order: typeof Order.prototype) => {
        const date = new Date(order.createdAt);
        const monthYear = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });

        const existingMonth = acc.find((item) => item.date === monthYear);
        if (existingMonth) {
          existingMonth.revenue += order.price;
          existingMonth.bargainedRevenue += order.bargainedPrice || order.price;
        } else {
          acc.push({
            date: monthYear,
            revenue: order.price,
            bargainedRevenue: order.bargainedPrice || order.price,
          });
        }
        return acc;
      },
      []
    );

    // Calculate total earnings
    const totalEarnings = orders.reduce(
      (total, order) => total + (order.bargainedPrice || order.price),
      0
    );

    // Get counts
    const pendingOrdersCount = await Order.countDocuments({
      seller: userId,
      status: "PENDING",
    });

    const completedOrdersCount = await Order.countDocuments({
      seller: userId,
      status: "DELIVERED",
    });

    res.json({
      salesData,
      totalEarnings,
      pendingOrdersCount,
      completedOrdersCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getSellerItems = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const items = await Item.find({ seller: userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const handleBargainRequest = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { action, counterPrice } = req.body;
    const userId = req.user!.id;

    const cartItem = await CartItem.findOne({
      _id: orderId,
      "item.seller": userId,
    }).populate("item");

    if (!cartItem) {
      res.status(404).json({ message: "Bargain request not found" });
      return;
    }

    if (action === "accept") {
      cartItem.bargainRequest!.status = "ACCEPTED";
      await cartItem.save();
    } else if (action === "reject") {
      cartItem.bargainRequest!.status = "REJECTED";
      await cartItem.save();
    } else if (action === "counter") {
      if (!counterPrice) {
        res.status(400).json({ message: "Counter price is required" });
        return;
      }

      cartItem.bargainRequest = {
        price: counterPrice,
        status: "PENDING",
        message: "Counter offer from seller",
      };
      await cartItem.save();
    }

    res.json({ message: "Bargain request handled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const completeDelivery = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const { otp } = req.body;
    const userId = req.user!.id;

    const order = await Order.findOne({
      _id: orderId,
      seller: userId,
      status: "PENDING",
    });

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    // Verify OTP
    const isValidOTP = await order.compareOTP(otp);
    if (!isValidOTP) {
      res.status(400).json({ message: "Incorrect OTP" });
      return;
    }

    // Check OTP expiry
    if (new Date() > order.otpExpiry) {
      res.status(400).json({ message: "OTP has expired" });
      return;
    }

    // Update order status
    order.status = "DELIVERED";
    await order.save();

    res.json({ message: "Delivery completed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getBargainRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Find all cart items with pending bargain requests for items sold by this seller
    const cartItems = await CartItem.find({
      "bargainRequest.status": "PENDING",
    })
      .populate({
        path: "item",
        match: { seller: userId },
      })
      .populate("user", "firstName lastName email");

    // Filter out any cart items where item population failed (not seller's items)
    const validCartItems = cartItems.filter((cartItem) => cartItem.item);

    const bargainRequests = validCartItems.map((cartItem) => ({
      id: cartItem._id,
      itemId: (cartItem.item as any)._id,
      itemName: (cartItem.item as any).name,
      itemImage: (cartItem.item as any).images[0],
      buyer: {
        id: (cartItem.user as any)._id,
        name: `${(cartItem.user as any).firstName} ${
          (cartItem.user as any).lastName
        }`,
        email: (cartItem.user as any).email,
      },
      originalPrice: (cartItem.item as any).price,
      requestedPrice: cartItem.bargainRequest!.price,
      message: cartItem.bargainRequest!.message,
      cartItemId: cartItem._id,
    }));

    res.json(bargainRequests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const respondToBargain = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { cartItemId } = req.params;
    const { accept } = req.body;
    const userId = req.user!.id;

    const cartItem = await CartItem.findById(cartItemId).populate("item");

    if (!cartItem) {
      res.status(404).json({ message: "Bargain request not found" });
      return;
    }

    // Verify the item belongs to the seller
    if ((cartItem.item as any).seller.toString() !== userId) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    cartItem.bargainRequest!.status = accept ? "ACCEPTED" : "REJECTED";
    await cartItem.save();

    res.json({
      message: `Bargain request ${
        accept ? "accepted" : "rejected"
      } successfully`,
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
    const { orderId } = req.params;
    const userId = req.user!.id;

    const order = await Order.findOne({
      _id: orderId,
      seller: userId,
      status: "PENDING",
    });

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    // Update order status
    order.status = "CANCELLED";
    await order.save();

    // Update item quantity (add back the cancelled quantity)
    await Item.findByIdAndUpdate(order.item, {
      $inc: { quantity: order.quantity },
      $set: { isAvailable: true },
    });

    res.json({ message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const userId = req.user!.id;

    const query: any = { seller: userId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("item", "name images price")
      .populate("buyer", "firstName lastName email")
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map((order) => ({
      id: order._id,
      itemId: (order.item as any)._id,
      itemName: (order.item as any).name,
      itemImage: (order.item as any).images[0],
      buyer: {
        name: `${(order.buyer as any).firstName} ${
          (order.buyer as any).lastName
        }`,
        email: (order.buyer as any).email,
        id: (order.buyer as any)._id,
      },
      originalPrice: order.price,
      bargainedPrice: order.bargainedPrice,
      status: order.status,
      date: (order as any).createdAt,
      quantity: order.quantity,
    }));

    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
