import express from "express";
import { handleChat } from "../controllers/chatController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/", auth, handleChat);

export default router;
