import mongoose, { Document } from "mongoose";

interface IItem extends Document {
  name: string;
  description: string;
  price: number;
  quantity: number;
  images: string[]; // These will now be Cloudinary URLs
  categories: string[];
  seller: mongoose.Schema.Types.ObjectId;
  isAvailable: boolean;
  createdAt: Date;  // Add this for sorting by newest
  updatedAt: Date;  // Add this for completeness
}

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    categories: [
      {
        type: String,
        required: true,
      },
    ],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IItem>("Item", itemSchema);
