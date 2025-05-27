import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

console.log("AUTH MODULE LOADED AT:", new Date().toISOString());

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {    
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("Auth token:", token);
    
    if (!token) {
      console.log("No auth token found");
      res.status(401).json({ message: "No auth token found" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
