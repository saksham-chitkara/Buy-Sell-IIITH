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
exports.checkItemInCart = exports.getCartCount = exports.bargainItem = exports.removeFromCart = exports.updateCartItem = exports.getCart = exports.addToCart = void 0;
const CartItem_1 = __importDefault(require("../models/CartItem"));
const Item_1 = __importDefault(require("../models/Item"));
const addToCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { itemId, quantity } = req.body;
        // Check if item exists and is available
        const item = yield Item_1.default.findOne({ _id: itemId, isAvailable: true });
        if (!item) {
            res.status(404).json({ message: "Item not found or unavailable" });
            return;
        }
        // Check if user is not buying their own item
        if (item.seller.toString() === req.user.id) {
            res.status(400).json({ message: "Cannot buy your own item" });
            return;
        }
        // Check if item is already in cart
        let cartItem = yield CartItem_1.default.findOne({
            user: req.user.id,
            item: itemId,
        });
        if (cartItem) {
            cartItem.quantity = quantity;
            yield cartItem.save();
        }
        else {
            cartItem = new CartItem_1.default({
                user: req.user.id,
                item: itemId,
                quantity,
            });
            yield cartItem.save();
        }
        res.status(201).json({
            message: "Item added to cart successfully",
            cartItem,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.addToCart = addToCart;
const getCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cartItems = yield CartItem_1.default.find({ user: req.user.id })
            .populate("item")
            .populate("item.seller", "firstName lastName email");
        res.json(cartItems);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getCart = getCart;
const updateCartItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { quantity, savedForLater } = req.body;
        const cartItem = yield CartItem_1.default.findOne({
            _id: req.params.id,
            user: req.user.id,
        });
        if (!cartItem) {
            res.status(404).json({ message: "Cart item not found" });
            return;
        }
        if (quantity !== undefined)
            cartItem.quantity = quantity;
        if (savedForLater !== undefined)
            cartItem.savedForLater = savedForLater;
        yield cartItem.save();
        res.json({
            message: "Cart item updated successfully",
            cartItem,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.updateCartItem = updateCartItem;
const removeFromCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cartItem = yield CartItem_1.default.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id,
        });
        if (!cartItem) {
            res.status(404).json({ message: "Cart item not found" });
            return;
        }
        res.json({ message: "Item removed from cart successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.removeFromCart = removeFromCart;
const bargainItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { price, message } = req.body;
        const cartItem = yield CartItem_1.default.findOne({
            _id: req.params.id,
            user: req.user.id,
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
        yield cartItem.save();
        res.json({
            message: "Bargain request sent successfully",
            cartItem,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.bargainItem = bargainItem;
const getCartCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const count = yield CartItem_1.default.countDocuments({ user: req.user.id });
        res.json({ count });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getCartCount = getCartCount;
const checkItemInCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const itemId = req.params.itemId;
        const inCart = yield CartItem_1.default.exists({ user: req.user.id, item: itemId });
        res.json({ inCart });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.checkItemInCart = checkItemInCart;
