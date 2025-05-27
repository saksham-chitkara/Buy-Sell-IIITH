"use client";

import { use, useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { UserAvatar } from "@/components/ui/CloudinaryImage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Lock, User } from "lucide-react";
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
import { useRouter } from "next/navigation";

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  age: number;
  contactNumber: string;
  avatar: string;
  overallRating: number;
  sellerReviews: Review[];
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
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    contactNumber: "",
    email: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [reviews, setReviews] = useState<Review[]>([]);

  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const {
    getProfile,
    updateProfile,
    updatePassword,
    createReview,
    currentUser,
    isLoading,
  } = useProfile();

  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const data = await getProfile(userId);
      if (data) {
        setProfile(data.user as UserProfile);
        setReviews(data.reviews);
        setIsOwnProfile(currentUser?.id === data.user._id);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!profile) return;

    const result = await createReview(profile._id, rating, comment);
    if (result) {
      setShowReviewDialog(false);
      // Refresh profile to get updated reviews
      const data = await getProfile(userId);
      if (data) {
        setProfile(data.user);
        setReviews(data.reviews);
      }
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirm password must match.",
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
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditSubmit = async () => {
    // Validate email domain
    if (
      !editForm.email.endsWith("@iiit.ac.in") &&
      (!editForm.email.includes("@") || !editForm.email.endsWith(".iiit.ac.in"))
    ) {
      toast({
        title: "Invalid email",
        description: "Please use your IIIT email address.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    Object.entries(editForm).forEach(([key, value]) => {
      formData.append(key, value);
    });

    console.log(formData);

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
          prev ? { ...prev, avatar: result.user.avatar } : null
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

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  {profile.avatar ? (
                    profile.avatar.includes('cloudinary.com') ? (
                      <UserAvatar 
                        publicId={profile.avatar}
                        className="w-full h-full"
                        size={128}
                      />
                    ) : (
                      <Image
                        src={profile.avatar}
                        alt={`${profile.firstName}'s avatar`}
                        fill
                        className="rounded-full object-cover"
                      />
                    )
                  ) : (
                    <Image
                      src="/images/default-avatar.png"
                      alt="Default avatar"
                      fill
                      className="rounded-full object-cover"
                    />
                  )}
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
                </h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < profile.overallRating
                          ? "text-yellow-500 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                {isOwnProfile && (
                  <div className="flex gap-2 mt-4 flex-wrap overflow-scroll justify-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditForm({
                          firstName: profile.firstName,
                          lastName: profile.lastName,
                          age: profile.age.toString(),
                          contactNumber: profile.contactNumber,
                          email: profile.email,
                        });
                        setIsEditing(true);
                      }}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsChangingPassword(true)}
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <div className="space-y-4 overflow-x-auto ">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(profile.email);
                    toast({
                      title: "Copied",
                      description: "Email ID copied to clipboard",
                    });
                  }}
                >
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{profile.email}</p>
                    {profile.isVerified && (
                      <span className="text-xs text-green-600">Verified</span>
                    )}
                  </div>
                </div>

                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => {
                    navigator.clipboard.writeText(profile.contactNumber);
                    toast({
                      title: "Copied",
                      description: "Contact number copied to clipboard",
                    });
                  }}
                >
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium">{profile.contactNumber}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="font-medium">{profile.age} years</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Reviews */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between mb-2">
              <div>
                <CardTitle>Reviews</CardTitle>
                <CardDescription className="mt-1">
                  What others are saying about {profile.firstName}
                </CardDescription>
              </div>
              {!isOwnProfile && (
                <div className="mb-6">
                  <Button onClick={() => setShowReviewDialog(true)}>
                    Write a Review
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {reviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">First Name</label>
                <Input
                  value={editForm.firstName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, firstName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  value={editForm.lastName}
                  onChange={(e) =>
                    setEditForm({ ...editForm, lastName: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Age</label>
              <Input
                type="number"
                value={editForm.age}
                onChange={(e) =>
                  setEditForm({ ...editForm, age: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Contact Number</label>
              <Input
                type="number"
                value={editForm.contactNumber}
                onChange={(e) =>
                  setEditForm({ ...editForm, contactNumber: e.target.value })
                }
              />
            </div>

            {!profile.isVerified && (
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Current Password</label>
              <div className="relative">
                <Input
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({
                      ...showPasswords,
                      current: !showPasswords.current,
                    })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">New Password</label>
              <div className="relative">
                <Input
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({
                      ...showPasswords,
                      new: !showPasswords.new,
                    })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters long
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({
                      ...showPasswords,
                      confirm: !showPasswords.confirm,
                    })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsChangingPassword(false);
                setPasswordForm({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
                setShowPasswords({
                  current: false,
                  new: false,
                  confirm: false,
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordChange}
              disabled={
                !passwordForm.currentPassword ||
                !passwordForm.newPassword ||
                !passwordForm.confirmPassword
              }
            >
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <ReviewDialog
        isOpen={showReviewDialog}
        onClose={() => setShowReviewDialog(false)}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}

interface ReviewCardProps {
  review: Review;
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  const router = useRouter();
  return (
    <div className="flex gap-4 w-full overflow-scroll">
      <div 
        className="relative w-10 h-10 flex-shrink-0 cursor-pointer flex items-center justify-center"
        onClick={() => {
          router.push("/profile/" + review.reviewer._id);
        }}
      >
        {review.reviewer.avatar ? (
          review.reviewer.avatar.includes('cloudinary.com') ? (
            <UserAvatar 
              publicId={review.reviewer.avatar}
              className="w-full h-full"
              size={40}
            />
          ) : (
            <Image
              src={review.reviewer.avatar}
              alt={review.reviewer.firstName + " " + review.reviewer.lastName}
              className="w-full h-full object-cover rounded-full"
              width={40}
              height={40}
            />
          )
        ) : (
          <div className="bg-muted rounded-full w-10 h-10 flex items-center justify-center">
            <User className="text-muted-foreground" size={20} />
          </div>
        )}
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
