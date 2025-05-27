"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrders = exports.cancelOrder = exports.respondToBargain = exports.getBargainRequests = exports.completeDelivery = exports.handleBargainRequest = exports.getSellerItems = exports.getDashboardStats = void 0;
const Order_1 = __importDefault(require("../models/Order"));
const Item_1 = __importDefault(require("../models/Item"));
const CartItem_1 = __importDefault(require("../models/CartItem"));
const getDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Get all completed orders for revenue calculation
        const orders = yield Order_1.default.find({
            seller: userId,
            status: "DELIVERED",
        }).sort({ createdAt: 1 });
        // Calculate monthly revenue
        const salesData = orders.reduce((acc, order) => {
            const date = new Date(order.createdAt);
            const monthYear = date.toLocaleString("default", {
                month: "short",
                year: "numeric",
            });
            const existingMonth = acc.find((item) => item.date === monthYear);
            if (existingMonth) {
                existingMonth.revenue += order.price;
                existingMonth.bargainedRevenue += order.bargainedPrice || order.price;
            }
            else {
                acc.push({
                    date: monthYear,
                    revenue: order.price,
                    bargainedRevenue: order.bargainedPrice || order.price,
                });
            }
            return acc;
        }, []);
        // Calculate total earnings
        const totalEarnings = orders.reduce((total, order) => total + (order.bargainedPrice || order.price), 0);
        // Get counts
        const pendingOrdersCount = yield Order_1.default.countDocuments({
            seller: userId,
            status: "PENDING",
        });
        const completedOrdersCount = yield Order_1.default.countDocuments({
            seller: userId,
            status: "DELIVERED",
        });
        res.json({
            salesData,
            totalEarnings,
            pendingOrdersCount,
            completedOrdersCount,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getDashboardStats = getDashboardStats;
const getSellerItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const items = yield Item_1.default.find({ seller: userId }).sort({ createdAt: -1 });
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getSellerItems = getSellerItems;
const handleBargainRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        const { action, counterPrice } = req.body;
        const userId = req.user.id;
        const cartItem = yield CartItem_1.default.findOne({
            _id: orderId,
            "item.seller": userId,
        }).populate("item");
        if (!cartItem) {
            res.status(404).json({ message: "Bargain request not found" });
            return;
        }
        if (action === "accept") {
            cartItem.bargainRequest.status = "ACCEPTED";
            yield cartItem.save();
        }
        else if (action === "reject") {
            cartItem.bargainRequest.status = "REJECTED";
            yield cartItem.save();
        }
        else if (action === "counter") {
            if (!counterPrice) {
                res.status(400).json({ message: "Counter price is required" });
                return;
            }
            cartItem.bargainRequest = {
                price: counterPrice,
                status: "PENDING",
                message: "Counter offer from seller",
            };
            yield cartItem.save();
        }
        res.json({ message: "Bargain request handled successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.handleBargainRequest = handleBargainRequest;
const completeDelivery = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        const { otp } = req.body;
        const userId = req.user.id;
        const order = yield Order_1.default.findOne({
            _id: orderId,
            seller: userId,
            status: "PENDING",
        });
        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        // Verify OTP
        const isValidOTP = yield order.compareOTP(otp);
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
        yield order.save();
        res.json({ message: "Delivery completed successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.completeDelivery = completeDelivery;
const getBargainRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Find all cart items with pending bargain requests for items sold by this seller
        const cartItems = yield CartItem_1.default.find({
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
            itemId: cartItem.item._id,
            itemName: cartItem.item.name,
            itemImage: cartItem.item.images[0],
            buyer: {
                id: cartItem.user._id,
                name: `${cartItem.user.firstName} ${cartItem.user.lastName}`,
                email: cartItem.user.email,
            },
            originalPrice: cartItem.item.price,
            requestedPrice: cartItem.bargainRequest.price,
            message: cartItem.bargainRequest.message,
            cartItemId: cartItem._id,
        }));
        res.json(bargainRequests);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getBargainRequests = getBargainRequests;
const respondToBargain = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cartItemId } = req.params;
        const { accept } = req.body;
        const userId = req.user.id;
        const cartItem = yield CartItem_1.default.findById(cartItemId).populate("item");
        if (!cartItem) {
            res.status(404).json({ message: "Bargain request not found" });
            return;
        }
        // Verify the item belongs to the seller
        if (cartItem.item.seller.toString() !== userId) {
            res.status(403).json({ message: "Unauthorized" });
            return;
        }
        cartItem.bargainRequest.status = accept ? "ACCEPTED" : "REJECTED";
        yield cartItem.save();
        res.json({
            message: `Bargain request ${accept ? "accepted" : "rejected"} successfully`,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.respondToBargain = respondToBargain;
const cancelOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;
        const order = yield Order_1.default.findOne({
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
        yield order.save();
        // Update item quantity (add back the cancelled quantity)
        yield Item_1.default.findByIdAndUpdate(order.item, {
            $inc: { quantity: order.quantity },
            $set: { isAvailable: true },
        });
        res.json({ message: "Order cancelled successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.cancelOrder = cancelOrder;
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.query;
        const userId = req.user.id;
        const query = { seller: userId };
        if (status) {
            query.status = status;
        }
        const orders = yield Order_1.default.find(query)
            .populate("item", "name images price")
            .populate("buyer", "firstName lastName email")
            .sort({ createdAt: -1 });
        const formattedOrders = orders.map((order) => ({
            id: order._id,
            itemId: order.item._id,
            itemName: order.item.name,
            itemImage: order.item.images[0],
            buyer: {
                name: `${order.buyer.firstName} ${order.buyer.lastName}`,
                email: order.buyer.email,
                id: order.buyer._id,
            },
            originalPrice: order.price,
            bargainedPrice: order.bargainedPrice,
            status: order.status,
            date: order.createdAt,
            quantity: order.quantity,
        }));
        res.json(formattedOrders);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getOrders = getOrders;
