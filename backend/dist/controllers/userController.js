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
exports.createReview = exports.updatePassword = exports.updateProfile = exports.getProfile = void 0;
const User_1 = __importDefault(require("../models/User"));
const Review_1 = __importDefault(require("../models/Review"));
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.default.findById(req.params.id).select("-password").lean();
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Get user's reviews
        const reviews = yield Review_1.default.find({ reviewee: req.params.id })
            .populate("reviewer", "firstName lastName avatar")
            .sort({ createdAt: -1 });
        res.json({
            user,
            reviews,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getProfile = getProfile;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updates = req.body;
        // Don't allow email update if user is verified
        const user = yield User_1.default.findById(req.user.id);
        if ((user === null || user === void 0 ? void 0 : user.isVerified) && updates.email) {
            delete updates.email;
        }
        // Handle avatar upload
        if (req.file) {
            updates.avatar = req.file.filename;
        }
        // Check if email id is already in use by another user
        if (updates.email) {
            const existingUser = yield User_1.default.findOne({ email: updates.email });
            // check if existing user is not the same user
            if (existingUser && existingUser._id.toString() !== req.user.id) {
                res.status(400).json({ message: "Email ID already in use" });
                return;
            }
        }
        const updatedUser = yield User_1.default.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true, runValidators: true }).select("-password");
        if (!updatedUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json({
            message: "Profile updated successfully",
            user: updatedUser,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.updateProfile = updateProfile;
const updatePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = yield User_1.default.findById(req.user.id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Verify current password
        const isMatch = yield user.comparePassword(currentPassword);
        if (!isMatch) {
            res.status(400).json({ message: "Current password is incorrect" });
            return;
        }
        user.password = newPassword;
        yield user.save();
        res.json({ message: "Password updated successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.updatePassword = updatePassword;
const createReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { rating, comment } = req.body;
        const revieweeId = req.params.id;
        const reviewerId = req.user.id;
        // Check if user is reviewing themselves
        if (revieweeId === reviewerId) {
            res.status(400).json({ message: "Cannot review yourself" });
            return;
        }
        // Check if user has already reviewed this person
        const existingReview = yield Review_1.default.findOne({
            reviewer: reviewerId,
            reviewee: revieweeId,
        });
        if (existingReview) {
            // Delete existing review and update user's overall rating
            const deletedRating = existingReview.rating;
            const oldOverallRating = (_b = (_a = (yield User_1.default.findById(revieweeId).select("overallRating"))) === null || _a === void 0 ? void 0 : _a.overallRating) !== null && _b !== void 0 ? _b : 0;
            const oldNumRatings = (_d = (_c = (yield User_1.default.findById(revieweeId).select("ratingCount"))) === null || _c === void 0 ? void 0 : _c.ratingCount) !== null && _d !== void 0 ? _d : 0;
            const newOverallRating = oldNumRatings > 1
                ? (oldOverallRating * oldNumRatings - deletedRating) /
                    (oldNumRatings - 1)
                : 0;
            yield Review_1.default.findByIdAndDelete(existingReview._id);
            yield User_1.default.findByIdAndUpdate(revieweeId, {
                $set: { overallRating: newOverallRating },
                $inc: { ratingCount: -1 },
            });
        }
        const review = new Review_1.default({
            reviewer: reviewerId,
            reviewee: revieweeId,
            rating,
            comment,
        });
        yield review.save();
        // Update user's overall rating
        const reviews = yield Review_1.default.find({ reviewee: revieweeId });
        const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
        yield User_1.default.findByIdAndUpdate(revieweeId, {
            $set: { overallRating: avgRating },
            $inc: { ratingCount: 1 },
        });
        res.status(201).json(review);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.createReview = createReview;
