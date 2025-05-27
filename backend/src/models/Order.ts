import mongoose from "mongoose";
import bcrypt from "bcryptjs";

interface IOrder extends Document {
  item: mongoose.Schema.Types.ObjectId;
  buyer: mongoose.Schema.Types.ObjectId;
  seller: mongoose.Schema.Types.ObjectId;
  quantity: number;
  price: number;
  bargainedPrice?: number;
  status: "PENDING" | "DELIVERED" | "CANCELLED";
  otp: string;
  otpExpiry: Date;
  compareOTP(candidateOTP: string): Promise<boolean>;
}

const orderSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    bargainedPrice: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["PENDING", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },
    otp: {
      type: String,
      required: true,
    },
    otpExpiry: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash OTP before saving
orderSchema.pre("save", async function (next) {
  if (!this.isModified("otp")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.otp = await bcrypt.hash(this.otp, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare OTP method
orderSchema.methods.compareOTP = async function (candidateOTP: string) {
  return bcrypt.compare(candidateOTP, this.otp);
};

export default mongoose.model<IOrder>("Order", orderSchema);
