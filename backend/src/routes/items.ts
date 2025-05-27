import express from "express";
import {
  createItem,
  getItem,
  getAllItems,
  updateItem,
  deleteItem,
} from "../controllers/itemController";
import { auth } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { handleImageUpload } from "../middleware/image";

const router = express.Router();

router.post(
  "/",
  auth,
  upload.array("images", 5), // Allow up to 5 images
  handleImageUpload,
  createItem
);

// Add the missing getAllItems route
router.get("/", getAllItems);

router.get("/:id", getItem);

router.patch(
  "/:id",
  auth,
  upload.array("images", 5),
  handleImageUpload,
  updateItem
);

router.delete("/:id", auth, deleteItem);

export default router;