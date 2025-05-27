import express from "express";
import {
  register,
  login,
  verifyCASTicket,
  completeCASRegistration,
} from "../controllers/authController";
import { verifyRecaptcha } from "../middleware/recaptcha";

const router = express.Router();

router.post("/register", verifyRecaptcha, register);
router.post("/login", verifyRecaptcha, login);
router.post("/cas/verify", verifyCASTicket);
router.post("/cas/complete", verifyRecaptcha, completeCASRegistration);

export default router;
