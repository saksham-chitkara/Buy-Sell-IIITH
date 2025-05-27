"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./config/database"));
const chat_1 = __importDefault(require("./routes/chat"));
const cart_1 = __importDefault(require("./routes/cart"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const items_1 = __importDefault(require("./routes/items"));
const orders_1 = __importDefault(require("./routes/orders"));
const seller_1 = __importDefault(require("./routes/seller"));
const errorHandler_1 = require("./utils/errorHandler");
const image_1 = require("./middleware/image");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Connect to MongoDB
(0, database_1.default)();
// CORS Configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["https://bs-iiith.vercel.app", "http://localhost:3000"];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = "The CORS policy for this site does not allow access from the specified Origin.";
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
}));
// Other Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/uploads", image_1.imageMiddleware, express_1.default.static("uploads"));
// Routes
app.use("/api/auth", auth_1.default);
app.use("/api/chat", chat_1.default);
app.use("/api/cart", cart_1.default);
app.use("/api/users", users_1.default);
app.use("/api/items", items_1.default);
app.use("/api/orders", orders_1.default);
app.use("/api/seller", seller_1.default);
// Error handling
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
