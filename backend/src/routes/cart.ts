import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  bargainItem,
  getCartCount,
  checkItemInCart
} from "../controllers/cartController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/", auth, addToCart);
router.get("/", auth, getCart);
router.patch("/:id", auth, updateCartItem);
router.delete("/:id", auth, removeFromCart);
router.post("/:id/bargain", auth, bargainItem);
router.get("/count", auth, getCartCount);
router.get("/check/:itemId", auth, checkItemInCart);

export default router;
