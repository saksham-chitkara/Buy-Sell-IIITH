import express from "express";
import {
  getProfile,
  updateProfile,
  updatePassword,
  createReview,
} from "../controllers/userController";
import { auth } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = express.Router();

router.get("/:id", auth, getProfile);
router.patch("/profile", auth, upload.single("avatar"), updateProfile);
router.patch("/password", auth, updatePassword);
router.post("/:id/reviews", auth, createReview);

export default router;
