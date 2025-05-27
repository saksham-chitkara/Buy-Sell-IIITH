"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePhoneNumber = exports.validatePassword = exports.validateEmail = void 0;
const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+(@[^\s@]+\.iiit\.ac\.in|@iiit\.ac\.in)$/;
    return regex.test(email);
};
exports.validateEmail = validateEmail;
const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return regex.test(password);
};
exports.validatePassword = validatePassword;
const validatePhoneNumber = (phone) => {
    const regex = /^[6-9]\d{9}$/; // Indian phone numbers
    return regex.test(phone);
};
exports.validatePhoneNumber = validatePhoneNumber;
