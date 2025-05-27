import { Request, Response, NextFunction } from "express";
import axios from "axios";

export const verifyRecaptcha = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { recaptchaToken } = req.body;

    if (!recaptchaToken) {
      res.status(400).json({ 
        status: "error",
        message: "reCAPTCHA verification failed",
        details: "Token is required" 
      });
      return;
    }

    const verificationURL = "https://www.google.com/recaptcha/api/siteverify";
    const secret = process.env.RECAPTCHA_SECRET_KEY;

    if (!secret) {
      res.status(500).json({ 
        status: "error",
        message: "Server configuration error" 
      });
      return;
    }

    const { data } = await axios.post(verificationURL, null, {
      params: {
        secret: secret,
        response: recaptchaToken,
      },
    });

    if (!data.success) {
      res.status(400).json({
        status: "error",
        message: "reCAPTCHA verification failed",
        details: data["error-codes"]
      });
      return;
    }

    // Verify the score for v3 or the presence of success for v2
    if ((data.score !== undefined && data.score < 0.5) || !data.success) {
      res.status(400).json({
        status: "error",
        message: "reCAPTCHA verification failed",
        details: "Score too low or verification unsuccessful"
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ 
      status: "error",
      message: "reCAPTCHA verification failed",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
};
