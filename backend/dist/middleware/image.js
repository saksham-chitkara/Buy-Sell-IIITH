"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageMiddleware = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const DEFAULT_IMAGES = {
    items: path_1.default.join(__dirname, "../../uploads/items", "default-item.jpg"),
    users: path_1.default.join(__dirname, "../../uploads/users", "default-avatar.png"),
};
const imageMiddleware = (req, res, next) => {
    const filePath = path_1.default.join(__dirname, "../../uploads/", req.path);
    fs_1.default.access(filePath, fs_1.default.constants.F_OK, (err) => {
        if (err) {
            const pathSegments = req.path.split("/");
            const category = pathSegments[1];
            if (category === "items" || category === "users") {
                const defaultPath = DEFAULT_IMAGES[category];
                fs_1.default.access(defaultPath, fs_1.default.constants.F_OK, (defaultErr) => {
                    if (defaultErr) {
                        res.status(404).send("Image not found");
                    }
                    else {
                        res.sendFile(defaultPath);
                    }
                });
            }
            else {
                res.status(404).send("Image not found");
            }
        }
        else {
            next();
        }
    });
};
exports.imageMiddleware = imageMiddleware;
