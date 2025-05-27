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
exports.cancelOrder = exports.regenerateOTP = exports.getOrders = exports.createOrder = void 0;
const Order_1 = __importDefault(require("../models/Order"));
const Item_1 = __importDefault(require("../models/Item"));
const CartItem_1 = __importDefault(require("../models/CartItem"));
const helpers_1 = require("../utils/helpers");
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { cartItemIds } = req.body;
        const orders = [];
        // Start a transaction
        const session = yield Order_1.default.startSession();
        session.startTransaction();
        try {
            for (const cartItemId of cartItemIds) {
                const cartItem = yield CartItem_1.default.findById(cartItemId)
                    .populate("item")
                    .populate("item.seller");
                if (!cartItem) {
                    throw new Error(`Cart item ${cartItemId} not found`);
                }
                // Check if item is still available and has enough quantity
                const item = yield Item_1.default.findById(cartItem.item);
                if (!item || !item.isAvailable || item.quantity < cartItem.quantity) {
                    throw new Error(`Item ${item === null || item === void 0 ? void 0 : item.name} is not available in requested quantity`);
                }
                // Generate OTP and set expiry (5 minutes from now)
                const otp = (0, helpers_1.generateOTP)();
                const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
                const order = new Order_1.default({
                    item: cartItem.item,
                    buyer: req.user.id,
                    seller: item.seller,
                    quantity: cartItem.quantity,
                    price: item.price,
                    bargainedPrice: ((_a = cartItem.bargainRequest) === null || _a === void 0 ? void 0 : _a.status) === "ACCEPTED"
                        ? cartItem.bargainRequest.price
                        : item.price,
                    otp,
                    otpExpiry,
                });
                yield order.save({ session });
                // Update item quantity
                item.quantity -= cartItem.quantity;
                if (item.quantity === 0) {
                    item.isAvailable = false;
                }
                yield item.save({ session });
                // Remove item from cart
                yield CartItem_1.default.findByIdAndDelete(cartItemId, { session });
                orders.push(order);
            }
            yield session.commitTransaction();
            res.status(201).json({
                message: "Orders created successfully",
                orders,
            });
        }
        catch (error) {
            yield session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.createOrder = createOrder;
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type = "all", status } = req.query;
        let query = {};
        // Filter by user role (buyer/seller)
        if (type === "bought") {
            query.buyer = req.user.id;
        }
        else if (type === "sold") {
            query.seller = req.user.id;
        }
        else {
            query.$or = [{ buyer: req.user.id }, { seller: req.user.id }];
        }
        // Filter by status if provided
        if (status) {
            query.status = status;
        }
        const orders = yield Order_1.default.find(query)
            .populate("item")
            .populate("buyer", "firstName lastName email")
            .populate("seller", "firstName lastName email")
            .sort({ createdAt: -1 });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getOrders = getOrders;
const regenerateOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield Order_1.default.findOne({
            _id: req.params.id,
            buyer: req.user.id,
            status: "PENDING",
        });
        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        // Generate new OTP and set expiry
        const otp = (0, helpers_1.generateOTP)();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
        order.otp = otp;
        order.otpExpiry = otpExpiry;
        yield order.save();
        res.json({
            message: "OTP regenerated successfully",
            otp, // This will be sent to user's email in production
            otpExpiry,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.regenerateOTP = regenerateOTP;
const cancelOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield Order_1.default.findOne({
            _id: req.params.id,
            buyer: req.user.id,
            status: "PENDING",
        });
        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        // Update item quantity
        const item = yield Item_1.default.findById(order.item);
        if (!item) {
            res.status(404).json({ message: "Item not found" });
            return;
        }
        item.quantity += order.quantity;
        item.isAvailable = true;
        yield item.save();
        order.status = "CANCELLED";
        yield order.save();
        res.json({ message: "Order cancelled successfully", order });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.cancelOrder = cancelOrder;
