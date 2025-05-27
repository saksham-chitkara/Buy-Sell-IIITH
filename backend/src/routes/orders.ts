import express from "express";
import {
  createOrder,
  getOrders,
  regenerateOTP,
  cancelOrder,
} from "../controllers/orderController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/", auth, createOrder);
router.get("/", auth, getOrders);
router.post("/:id/regenerate-otp", auth, regenerateOTP);
router.post("/:id/cancel", auth, cancelOrder);

export default router;
