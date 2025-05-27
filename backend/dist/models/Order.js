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
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const orderSchema = new mongoose_1.default.Schema({
    item: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Item",
        required: true,
    },
    buyer: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    seller: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    price: {
        type: Number,
        required: true,
    },
    bargainedPrice: {
        type: Number,
    },
    status: {
        type: String,
        enum: ["PENDING", "DELIVERED", "CANCELLED"],
        default: "PENDING",
    },
    otp: {
        type: String,
        required: true,
    },
    otpExpiry: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true,
});
// Hash OTP before saving
orderSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("otp"))
            return next();
        try {
            const salt = yield bcryptjs_1.default.genSalt(10);
            this.otp = yield bcryptjs_1.default.hash(this.otp, salt);
            next();
        }
        catch (error) {
            next(error);
        }
    });
});
// Compare OTP method
orderSchema.methods.compareOTP = function (candidateOTP) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcryptjs_1.default.compare(candidateOTP, this.otp);
    });
};
exports.default = mongoose_1.default.model("Order", orderSchema);
