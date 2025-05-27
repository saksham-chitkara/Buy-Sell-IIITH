"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = express_1.default.Router();
router.get("/:id", auth_1.auth, userController_1.getProfile);
router.patch("/profile", auth_1.auth, upload_1.upload.single("avatar"), userController_1.updateProfile);
router.patch("/password", auth_1.auth, userController_1.updatePassword);
router.post("/:id/reviews", auth_1.auth, userController_1.createReview);
exports.default = router;
