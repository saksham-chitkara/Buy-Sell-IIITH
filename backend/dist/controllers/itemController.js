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
exports.deleteItem = exports.updateItem = exports.getItem = exports.getItems = exports.createItem = void 0;
const Item_1 = __importDefault(require("../models/Item"));
const Order_1 = __importDefault(require("../models/Order"));
const createItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, price, quantity, categories } = req.body;
        const images = req.files.map((file) => file.filename);
        const item = new Item_1.default({
            name,
            description,
            price,
            quantity,
            categories: categories.split(","),
            images,
            seller: req.user.id,
        });
        yield item.save();
        res.status(201).json({
            message: "Item created successfully",
            item,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.createItem = createItem;
const getItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, categories, minPrice, maxPrice } = req.query;
        let query = { isAvailable: true };
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }
        if (categories) {
            query.categories = { $in: categories.split(",") };
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice)
                query.price.$gte = Number(minPrice);
            if (maxPrice)
                query.price.$lte = Number(maxPrice);
        }
        const items = yield Item_1.default.find(query)
            .populate("seller", "firstName lastName email overallRating")
            .sort({ createdAt: -1 });
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getItems = getItems;
const getItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield Item_1.default.findById(req.params.id).populate("seller", "firstName lastName email overallRating avatar");
        if (!item) {
            res.status(404).json({ message: "Item not found" });
            return;
        }
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getItem = getItem;
const updateItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const item = yield Item_1.default.findOne({
            _id: req.params.id,
            seller: req.user.id,
        });
        if (!item) {
            res.status(404).json({ message: "Item not found" });
            return;
        }
        const updates = req.body;
        if ((_a = req.files) === null || _a === void 0 ? void 0 : _a.length) {
            updates.images = req.files.map((file) => file.filename);
        }
        Object.assign(item, updates);
        yield item.save();
        res.json({
            message: "Item updated successfully",
            item,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.updateItem = updateItem;
const deleteItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const item = await Item.findOneAndDelete({
        //   _id: req.params.id,
        //   seller: req.user!.id,
        // });
        // Instead of deleting the item, we will mark it as unavailable and reduce the quantity to 0
        // This fixes several issues with the current implementation, and allows us to keep the item in the database
        const item = yield Item_1.default.findOneAndUpdate({
            _id: req.params.id,
            seller: req.user.id,
        }, {
            isAvailable: false,
            quantity: 0,
        }, { new: true });
        if (!item) {
            res.status(404).json({ message: "Item not found" });
            return;
        }
        // Then, update all orders containing this item to be cancelled
        yield Order_1.default.updateMany({ item: req.params.id, status: "PENDING" }, { status: "CANCELLED" });
        res.json({ message: "Item deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.deleteItem = deleteItem;
