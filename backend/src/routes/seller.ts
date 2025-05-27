// src/routes/seller.ts
import express from "express";
import { auth } from "../middleware/auth";
import {
  getDashboardStats,
  getOrders,
  getSellerItems,
  handleBargainRequest,
  completeDelivery,
  getBargainRequests,
  respondToBargain,
  cancelOrder,
} from "../controllers/sellerController";

const router = express.Router();

router.use(auth);

router.get("/stats", getDashboardStats);
router.get("/orders", getOrders);
router.get("/items", getSellerItems);
router.get("/bargain-requests", getBargainRequests);
router.post("/bargain-requests/:cartItemId", respondToBargain);
router.post("/orders/:orderId/bargain", handleBargainRequest);
router.post("/orders/:orderId/complete", completeDelivery);
router.post("/orders/:orderId/cancel", cancelOrder);

export default router;
