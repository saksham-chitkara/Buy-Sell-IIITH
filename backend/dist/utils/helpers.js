"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateError = exports.formatPrice = exports.generateOTP = void 0;
const generateOTP = (length = 6) => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateOTP = generateOTP;
const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    }).format(price);
};
exports.formatPrice = formatPrice;
const generateError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};
exports.generateError = generateError;
