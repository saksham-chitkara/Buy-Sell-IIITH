import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import morgan from "morgan"; // Uncommented now that it's installed
import multer from "multer";

// Import routes
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import itemRoutes from "./routes/items"; // Make sure this is correct
import cartRoutes from "./routes/cart";
import chatRoutes from "./routes/chat";
import orderRoutes from "./routes/orders";
import sellerRoutes from "./routes/seller";
// import aiRoutes from "./routes/ai"; // Comment out until created

// Import middleware
import { handleImageUpload as imageMiddleware } from "./middleware/image";
import { upload } from "./middleware/upload";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // Uncommented now that it's installed

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000"];
  
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Configure routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/items", itemRoutes); // Multer is configured in the route file
app.use("/cart", cartRoutes);
app.use("/chat", chatRoutes);
app.use("/orders", orderRoutes);
app.use("/seller", sellerRoutes);
// app.use("/ai", aiRoutes); // Comment out until created

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Error handling middleware (should be last)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    // Handle different types of Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: "error",
        message: "File is too large. Maximum size is 5MB"
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        status: "error",
        message: "Too many files. Maximum is 5 files"
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        status: "error",
        message: "Wrong field name. Please use 'images' for uploading files"
      });
    }
    // Generic multer error
    return res.status(400).json({
      status: "error",
      message: `Upload error: ${err.message}`,
    });
  }
  
  console.error(err);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;