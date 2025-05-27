import { Request, Response } from "express";
import User from "../models/User";
import Review from "../models/Review";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
  file?: Express.Multer.File;
}
export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select("-password").lean();

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Get user's reviews
    const reviews = await Review.find({ reviewee: req.params.id })
      .populate("reviewer", "firstName lastName avatar")
      .sort({ createdAt: -1 });

    res.json({
      user,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const updates = req.body;

    // Don't allow email update if user is verified
    const user = await User.findById(req.user!.id);
    if (user?.isVerified && updates.email) {
      delete updates.email;
    }

    // Handle avatar upload
    if (req.file) {
      updates.avatar = req.file.filename;
    }

    // Check if email id is already in use by another user
    if (updates.email) {
      const existingUser = await User.findOne({ email: updates.email });
      // check if existing user is not the same user
      if (existingUser && existingUser._id.toString() !== req.user!.id) {
        res.status(400).json({ message: "Email ID already in use" });
        return;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user!.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updatePassword = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user!.id);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(400).json({ message: "Current password is incorrect" });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const createReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { rating, comment } = req.body;
    const revieweeId = req.params.id;
    const reviewerId = req.user!.id;

    // Check if user is reviewing themselves
    if (revieweeId === reviewerId) {
      res.status(400).json({ message: "Cannot review yourself" });
      return;
    }

    // Check if user has already reviewed this person
    const existingReview = await Review.findOne({
      reviewer: reviewerId,
      reviewee: revieweeId,
    });

    if (existingReview) {
      // Delete existing review and update user's overall rating
      const deletedRating = existingReview.rating;
      const oldOverallRating =
        (await User.findById(revieweeId).select("overallRating"))
          ?.overallRating ?? 0;
      const oldNumRatings =
        (await User.findById(revieweeId).select("ratingCount"))?.ratingCount ??
        0;
      const newOverallRating =
        oldNumRatings > 1
          ? (oldOverallRating * oldNumRatings - deletedRating) /
            (oldNumRatings - 1)
          : 0;

      await Review.findByIdAndDelete(existingReview._id);

      await User.findByIdAndUpdate(revieweeId, {
        $set: { overallRating: newOverallRating },
        $inc: { ratingCount: -1 },
      });
    }

    const review = new Review({
      reviewer: reviewerId,
      reviewee: revieweeId,
      rating,
      comment,
    });

    await review.save();

    // Update user's overall rating
    const reviews = await Review.find({ reviewee: revieweeId });
    const avgRating =
      reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

    await User.findByIdAndUpdate(revieweeId, {
      $set: { overallRating: avgRating },
      $inc: { ratingCount: 1 },
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
