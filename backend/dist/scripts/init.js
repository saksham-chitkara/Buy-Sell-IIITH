"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const createUploadDirs = () => {
    const dirs = ["uploads/users", "uploads/items"];
    dirs.forEach((dir) => {
        const fullPath = path_1.default.join(__dirname, "..", "..", dir);
        if (!fs_1.default.existsSync(fullPath)) {
            fs_1.default.mkdirSync(fullPath, { recursive: true });
            console.log(`Created directory: ${fullPath}`);
        }
    });
};
createUploadDirs();
