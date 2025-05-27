import express from "express";
import {
  createItem,
  getItems,
  getItem,
  updateItem,
  deleteItem,
} from "../controllers/itemController";
import { auth } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = express.Router();

router.post("/", auth, upload.array("itemImages", 5), createItem);
router.get("/", getItems);
router.get("/:id", getItem);
router.patch("/:id", auth, upload.array("itemImages", 5), updateItem);
router.delete("/:id", auth, deleteItem);

export default router;
