"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cartController_1 = require("../controllers/cartController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post("/", auth_1.auth, cartController_1.addToCart);
router.get("/", auth_1.auth, cartController_1.getCart);
router.patch("/:id", auth_1.auth, cartController_1.updateCartItem);
router.delete("/:id", auth_1.auth, cartController_1.removeFromCart);
router.post("/:id/bargain", auth_1.auth, cartController_1.bargainItem);
router.get("/count", auth_1.auth, cartController_1.getCartCount);
router.get("/check/:itemId", auth_1.auth, cartController_1.checkItemInCart);
exports.default = router;
