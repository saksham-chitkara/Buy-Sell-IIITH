"use client";

import { use, useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, BadgeCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Mail,
  Phone,
  Calendar,
  Star,
  Edit2,
  Loader2,
  Camera,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useProfile } from "@/hooks/useProfile";
import { getAvatarUrl, handleImageError } from "@/utils/image-helpers";
import { useRouter } from "next/navigation";

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber?: string;
  age?: number;
  avatar?: string | { url: string };
  isVerified: boolean;
  createdAt: string;
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  reviewer: {
    _id: string;
    avatar: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = decodeURIComponent(use(params).id);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    contactNumber: "", // Ensures this is always a string
    email: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const { toast } = useToast();
  const router = useRouter();

  const {
    getProfile,
    updateProfile,
    updatePassword,
    createReview,
    currentUser,
    isLoading,
  } = useProfile();

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await getProfile(userId);
      if (data) {
        setProfile(data.user);
        setReviews(data.reviews);
        setIsOwnProfile(currentUser?.id === data.user._id);
      }
    };
    fetchProfile();
  }, [userId]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure required fields are filled
    if (!editForm.firstName || !editForm.lastName || !editForm.email) {
      toast({
        title: "Required fields missing",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(editForm.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    // Age validation
    if (
      editForm.age &&
      (isNaN(Number(editForm.age)) || Number(editForm.age) < 0)
    ) {
      toast({
        title: "Invalid age",
        description: "Please enter a valid age.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    Object.entries(editForm).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const result = await updateProfile(formData);
    if (result) {
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      // Refresh profile
      const data = await getProfile(userId);
      if (data) {
        setProfile(data.user);
      }
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "New password and confirm password must be the same.",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    const result = await updatePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword
    );
    if (result) {
      setIsChangingPassword(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const result = await updateProfile(formData);
      if (result) {
        // Update the profile state with the new avatar URL
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                avatar: result.user.avatar,
              }
            : null
        );
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description:
          "Failed to update profile picture. Please try again. (" + error + ")",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Using the utility function from image-helpers.ts instead of local implementation

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <Image
                    src={getAvatarUrl(profile.avatar)}
                    alt={`${profile.firstName}'s avatar`}
                    fill
                    className="rounded-full object-cover"
                    onError={handleImageError}
                  />
                  {isOwnProfile && (
                    <div className="absolute bottom-0 right-0">
                      <Button
                        size="icon"
                        className="rounded-full"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                      />
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-bold">
                  {profile.firstName} {profile.lastName}
                  {profile.isVerified && (
                    <span className="ml-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <BadgeCheck className="w-5 h-5 text-emerald-500 inline" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Verified User</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-500">
                  {profile.email.split("@")[0] +
                    (profile.email.split("@")[1] === "iiit.ac.in"
                      ? ""
                      : "@" + profile.email.split("@")[1].split(".")[0])}
                </p>
                {isOwnProfile && (
                  <div className="mt-4 space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditForm({
                          firstName: profile.firstName,
                          lastName: profile.lastName,
                          age: profile.age ? String(profile.age) : "",
                          contactNumber: profile.contactNumber ? String(profile.contactNumber) : "",
                          email: profile.email,
                        });
                        setIsEditing(true);
                      }}
                    >
                      Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsChangingPassword(true)}
                    >
                      Change Password
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="space-y-2">
                  {profile.age && (
                    <p className="text-sm">
                      <span className="font-medium">Age:</span> {profile.age}
                    </p>
                  )}
                  {profile.contactNumber && (
                    <p className="text-sm">
                      <span className="font-medium">Contact:</span>{" "}
                      {profile.contactNumber}
                    </p>
                  )}
                  <p className="text-sm">
                    <span className="font-medium">Member since:</span>{" "}
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Update your profile information.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleEditSubmit}>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label
                            htmlFor="firstName"
                            className="text-sm font-medium"
                          >
                            First Name
                          </label>
                          <Input
                            id="firstName"
                            value={editForm.firstName}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                firstName: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="lastName"
                            className="text-sm font-medium"
                          >
                            Last Name
                          </label>
                          <Input
                            id="lastName"
                            value={editForm.lastName}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                lastName: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email
                        </label>
                        <Input
                          id="email"
                          type="email"
                          value={editForm.email}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label htmlFor="age" className="text-sm font-medium">
                            Age
                          </label>
                          <Input
                            id="age"
                            type="number"
                            value={editForm.age}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                age: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="contactNumber"
                            className="text-sm font-medium"
                          >
                            Contact Number
                          </label>
                          <Input
                            id="contactNumber"
                            value={editForm.contactNumber}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                contactNumber: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog
                open={isChangingPassword}
                onOpenChange={setIsChangingPassword}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and a new password.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="currentPassword"
                          className="text-sm font-medium"
                        >
                          Current Password
                        </label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="newPassword"
                          className="text-sm font-medium"
                        >
                          New Password
                        </label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="confirmPassword"
                          className="text-sm font-medium"
                        >
                          Confirm New Password
                        </label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setPasswordForm({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Update Password</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Reviews */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold mb-4">Reviews</h2>
          {currentUser && currentUser.id !== userId && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                <div className="space-y-4">
                  <Button onClick={() => setReviewDialogOpen(true)}>
                    Write a Review
                  </Button>
                  <ReviewDialog 
                    isOpen={reviewDialogOpen} 
                    onClose={() => setReviewDialogOpen(false)} 
                    onSubmit={(rating, comment) => {
                      createReview(userId, rating, comment);
                      setReviewDialogOpen(false);
                    }} 
                  />
                </div>
              </CardContent>
            </Card>
          )}
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No reviews yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  const router = useRouter();

  // Using the utility function from image-helpers.ts instead

  return (
    <div className="flex gap-4 w-full overflow-scroll">
      <div className="relative w-10 h-10 flex-shrink-0">
        <Image
          src={getAvatarUrl(review.reviewer.avatar)}
          alt={review.reviewer.firstName + " " + review.reviewer.lastName}
          fill
          className="rounded-full object-cover cursor-pointer"
          onError={handleImageError}
          onClick={() => {
            router.push("/profile/" + review.reviewer._id);
          }}
        />
      </div>
      <div className="flex-1 w-[calc(100%-4rem)]">
        <div className="flex items-center justify-between">
          <h4
            className="font-medium cursor-pointer"
            onClick={() => {
              router.push("/profile/" + review.reviewer._id);
            }}
          >
            {review.reviewer.firstName + " " + review.reviewer.lastName}
          </h4>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating
                    ? "text-yellow-500 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
        <p className="text-gray-600 mt-1 break-words text-wrap w-full">
          {review.comment}
        </p>
        <p className="text-sm text-gray-400 mt-1">
          {format(new Date(review.createdAt), "PPP")}
        </p>
      </div>
    </div>
  );
};

const ProfileSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Info Skeleton */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-gray-200 animate-pulse mx-auto mb-4" />
                <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mt-2 animate-pulse" />
                <div className="h-10 bg-gray-200 rounded w-1/2 mx-auto mt-4 animate-pulse" />
              </div>

              <div className="my-6 h-px bg-gray-200 animate-pulse" />

              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-3/4 mt-1 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews Skeleton */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <div
                              key={j}
                              className="w-4 h-4 bg-gray-200 rounded animate-pulse"
                            />
                          ))}
                        </div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-full mt-2 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-1/4 mt-2 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

const ReviewDialog = ({ isOpen, onClose, onSubmit }: ReviewDialogProps) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Rating</label>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setRating(i + 1)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      i < rating
                        ? "text-yellow-500 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              rows={4}
              placeholder="Write your review..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSubmit(rating, comment);
              setRating(5);
              setComment("");
            }}
            disabled={!comment.trim()}
          >
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
