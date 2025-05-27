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

// CREATE
router.post(
  "/",
  auth,
  upload.array("images", 5), // Allow up to 5 images
  handleImageUpload,
  createItem
);

// READ ALL
router.get("/", getAllItems);

// READ ONE
router.get("/:id", getItem);

// UPDATE (replace with new image if provided)
router.patch(
  "/:id",
  auth,
  upload.array("images", 5),
  handleImageUpload,
  updateItem
);

// DELETE
router.delete("/:id", auth, deleteItem);

export default router;
