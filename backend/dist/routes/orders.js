"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post("/", auth_1.auth, orderController_1.createOrder);
router.get("/", auth_1.auth, orderController_1.getOrders);
router.post("/:id/regenerate-otp", auth_1.auth, orderController_1.regenerateOTP);
router.post("/:id/cancel", auth_1.auth, orderController_1.cancelOrder);
exports.default = router;
