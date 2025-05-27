"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/seller.ts
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const sellerController_1 = require("../controllers/sellerController");
const router = express_1.default.Router();
router.use(auth_1.auth);
router.get("/stats", sellerController_1.getDashboardStats);
router.get("/orders", sellerController_1.getOrders);
router.get("/items", sellerController_1.getSellerItems);
router.get("/bargain-requests", sellerController_1.getBargainRequests);
router.post("/bargain-requests/:cartItemId", sellerController_1.respondToBargain);
router.post("/orders/:orderId/bargain", sellerController_1.handleBargainRequest);
router.post("/orders/:orderId/complete", sellerController_1.completeDelivery);
router.post("/orders/:orderId/cancel", sellerController_1.cancelOrder);
exports.default = router;
