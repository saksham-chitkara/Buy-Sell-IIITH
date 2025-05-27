"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const itemController_1 = require("../controllers/itemController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = express_1.default.Router();
router.post("/", auth_1.auth, upload_1.upload.array("itemImages", 5), itemController_1.createItem);
router.get("/", itemController_1.getItems);
router.get("/:id", itemController_1.getItem);
router.patch("/:id", auth_1.auth, upload_1.upload.array("itemImages", 5), itemController_1.updateItem);
router.delete("/:id", auth_1.auth, itemController_1.deleteItem);
exports.default = router;
