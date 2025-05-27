import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database";
import chatRoutes from "./routes/chat";
import cartRoutes from "./routes/cart";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import itemRoutes from "./routes/items";
import orderRoutes from "./routes/orders";
import sellerRoutes from "./routes/seller";
import { errorHandler } from "./utils/errorHandler";
import { imageMiddleware } from "./middleware/image";

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["https://bs-iiith.vercel.app", "http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
  })
);

// Other Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", imageMiddleware, express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/seller", sellerRoutes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
