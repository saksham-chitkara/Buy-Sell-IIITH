import mongoose from "mongoose";
import bcrypt from "bcryptjs";

interface IUser extends Document {
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

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[a-zA-Z0-9._%+-]+(@[^\s@]+\.iiit\.ac\.in|@iiit\.ac\.in)$/,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    age: {
      type: Number,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "default-avatar.png",
    },
    overallRating: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", userSchema);
