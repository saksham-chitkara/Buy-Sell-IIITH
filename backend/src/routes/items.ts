import express from "express";
import multer from "multer";
import {
  createItem,
  getItems,
  getItem,
  updateItem,
  deleteItem,
} from "../controllers/itemController";
import { auth } from "../middleware/auth";
// We're using our custom upload approach with memory storage
// This means we handle Cloudinary uploads in the controller, not the middleware
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

console.log("[DEBUG] Items routes: Using memory storage for file uploads");

const router = express.Router();

// Add debug middleware to see what's happening with the request
const debugMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log("[DEBUG ROUTE] Request received:", {
    method: req.method,
    path: req.path,
    headers: req.headers,
    hasFiles: !!(req as any).files,
    fileCount: (req as any).files ? (Array.isArray((req as any).files) ? (req as any).files.length : 'not an array') : 'none'
  });
  next();
};

router.post("/", debugMiddleware, auth, upload.array("itemImages", 5), createItem);
router.get("/", getItems);
router.get("/:id", getItem);
router.patch("/:id", auth, upload.array("itemImages", 5), updateItem);
router.delete("/:id", auth, deleteItem);

export default router;
