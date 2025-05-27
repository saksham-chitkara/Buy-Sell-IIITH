"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const recaptcha_1 = require("../middleware/recaptcha");
const router = express_1.default.Router();
router.post("/register", recaptcha_1.verifyRecaptcha, authController_1.register);
router.post("/login", recaptcha_1.verifyRecaptcha, authController_1.login);
router.post("/cas/verify", authController_1.verifyCASTicket);
router.post("/cas/complete", recaptcha_1.verifyRecaptcha, authController_1.completeCASRegistration);
exports.default = router;
