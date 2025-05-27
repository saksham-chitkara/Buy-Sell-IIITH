import { Request } from "express";
import { Document } from "mongoose";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export interface UserDocument extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  age: number;
  contactNumber: string;
  password: string;
  avatar: string;
  overallRating: number;
  ratingCount: number;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface ItemDocument extends Document {
  name: string;
  description: string;
  price: number;
  quantity: number;
  images: string[];
  categories: string[];
  seller: UserDocument["_id"];
  isAvailable: boolean;
}

export interface OrderDocument extends Document {
  item: ItemDocument["_id"];
  buyer: UserDocument["_id"];
  seller: UserDocument["_id"];
  quantity: number;
  price: number;
  bargainedPrice?: number;
  status: "PENDING" | "DELIVERED" | "CANCELLED";
  otp: string;
  otpExpiry: Date;
  compareOTP(candidateOTP: string): Promise<boolean>;
}

export interface CartItemDocument extends Document {
  user: UserDocument["_id"];
  item: ItemDocument["_id"];
  quantity: number;
  bargainRequest?: {
    price: number;
    message: string;
    status: "PENDING" | "ACCEPTED" | "REJECTED";
  };
  savedForLater: boolean;
}

export interface ReviewDocument extends Document {
  reviewer: UserDocument["_id"];
  reviewee: UserDocument["_id"];
  rating: number;
  comment: string;
}
