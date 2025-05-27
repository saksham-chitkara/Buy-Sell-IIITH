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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeCASRegistration = exports.verifyCASTicket = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const xml2js_1 = require("xml2js");
const validators_1 = require("../utils/validators");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, email, password, age, contactNumber, recaptchaToken, } = req.body;
        req.body.recaptchaAction = "register";
        if (!(0, validators_1.validateEmail)(email)) {
            res.status(400).json({
                message: "Invalid email domain. Please use your IIIT email.",
            });
            return;
        }
        const existingUser = yield User_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        const user = new User_1.default({
            firstName,
            lastName,
            email,
            password,
            age,
            contactNumber,
        });
        yield user.save();
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "24h" });
        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isVerified: user.isVerified,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, recaptchaToken } = req.body;
        req.body.recaptchaAction = "login";
        const user = yield User_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }
        const isMatch = yield user.comparePassword(password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "24h" });
        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isVerified: user.isVerified,
                avatar: user.avatar,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.login = login;
const verifyCASTicket = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    try {
        const { ticket } = req.body;
        if (!ticket) {
            res.status(400).json({ error: "Ticket is required" });
            return;
        }
        const serviceUrl = encodeURIComponent(`${process.env.FRONTEND_URL}/auth/cas/callback`);
        const validationUrl = `https://login.iiit.ac.in/cas/serviceValidate?ticket=${ticket}&service=${serviceUrl}`;
        const response = yield fetch(validationUrl);
        const xmlResponse = yield response.text();
        const result = (yield (0, xml2js_1.parseStringPromise)(xmlResponse));
        const authSuccess = (_b = (_a = result["cas:serviceResponse"]) === null || _a === void 0 ? void 0 : _a["cas:authenticationSuccess"]) === null || _b === void 0 ? void 0 : _b[0];
        if (!authSuccess) {
            console.error("CAS authentication failed:", result);
            res.status(401).json({ error: "CAS authentication failed" });
            return;
        }
        const email = (_e = (_d = (_c = authSuccess["cas:attributes"]) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d["cas:E-Mail"]) === null || _e === void 0 ? void 0 : _e[0];
        const fName = (_h = (_g = (_f = authSuccess["cas:attributes"]) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g["cas:FirstName"]) === null || _h === void 0 ? void 0 : _h[0];
        const lName = (_l = (_k = (_j = authSuccess["cas:attributes"]) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k["cas:LastName"]) === null || _l === void 0 ? void 0 : _l[0];
        if (!email) {
            res.status(401).json({ error: "Email not found in CAS response" });
            return;
        }
        //TODO: updated the expiries everywhere
        // Find existing user
        let user = yield User_1.default.findOne({ email });
        if (user) {
            user.isVerified = true;
            yield user.save();
            const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "24h" });
            res.json({
                token,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    isVerified: user.isVerified,
                    avatar: user.avatar,
                },
                requiresAdditionalDetails: false,
            });
        }
        else {
            const tempToken = jsonwebtoken_1.default.sign({
                email,
                firstName: fName,
                lastName: lName,
                casVerified: true,
            }, process.env.JWT_SECRET, { expiresIn: "1h" });
            res.json({
                tempToken,
                requiresAdditionalDetails: true,
                userData: {
                    email,
                    firstName: fName,
                    lastName: lName,
                },
            });
        }
    }
    catch (error) {
        console.error("CAS verification error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.verifyCASTicket = verifyCASTicket;
const completeCASRegistration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { tempToken, age, contactNumber } = _a, additionalFields = __rest(_a, ["tempToken", "age", "contactNumber"]);
        // Verify temp token
        const decoded = jsonwebtoken_1.default.verify(tempToken, process.env.JWT_SECRET);
        if (!decoded.casVerified) {
            res.status(401).json({ error: "Invalid registration token" });
            return;
        }
        // Create the user with all details
        const user = yield User_1.default.create(Object.assign(Object.assign({ email: decoded.email, firstName: decoded.firstName, lastName: decoded.lastName, age,
            contactNumber }, additionalFields), { isVerified: true }));
        // Generate final authentication token
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "24h" });
        res.json({
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isVerified: user.isVerified,
                avatar: user.avatar,
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.completeCASRegistration = completeCASRegistration;
