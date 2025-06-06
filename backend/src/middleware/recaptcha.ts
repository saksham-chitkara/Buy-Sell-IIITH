import { Request, Response, NextFunction } from "express";
import axios from "axios";

interface RecaptchaVerification {
  token: string;
}

const verifyRecaptchaToken = async ({ token }: RecaptchaVerification) => {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      return false;
    }

    // Make a POST request to the Google reCAPTCHA API
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: secretKey,
          response: token,
        },
      }
    );

    const data = response.data;

    // Check if the token is valid
    if (!data.success) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return false;
  }
};

export const verifyRecaptcha = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Only apply recaptcha to auth routes
    const isAuthRoute = req.path.includes('/login') || 
                       req.path.includes('/register') || 
                       req.path.includes('/cas/complete');
                       
    if (!isAuthRoute) {
      // Skip verification for non-auth routes
      return next();
    }
    
    const { recaptchaToken } = req.body;

    if (!recaptchaToken) {
      res.status(400).json({ message: "reCAPTCHA token is required" });
      return;
    }

    const isValid = await verifyRecaptchaToken({
      token: recaptchaToken,
    });

    if (!isValid) {
      res.status(400).json({ message: "reCAPTCHA verification failed" });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "reCAPTCHA verification error" });
    return;
  }
};
