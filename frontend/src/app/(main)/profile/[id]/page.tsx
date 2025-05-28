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
  ShoppingBag,
  CheckCircle,
  Package,
  ClipboardList,
  UserCheck,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { useProfile } from "@/hooks/useProfile";
import { getAvatarUrl, DEFAULT_AVATAR_URL, handleImageError } from "@/utils/image-helpers";
import { useRouter } from "next/navigation";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Item {
  _id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  categories: string[];
  quantity: number;
  isAvailable: boolean;
  createdAt: string;
}

interface UserProfile {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  age?: number;
  contactNumber?: string;
  avatar?: string;
  createdAt: string;
  itemsCount: number;
  soldItemsCount: number;
  overallRating: number;
  ratingCount: number;
  items?: Item[];
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
  const [activeTab, setActiveTab] = useState("reviews");
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

  // Effect for fetching profile data
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

    // Validate file size (5MB limit)
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
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                avatar: result.user.avatar,
              }
            : null
        );

        toast({
          title: "Success",
          description: "Profile picture updated successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description:
          "Failed to update profile picture. Please try again. " +
          (error instanceof Error ? error.message : String(error)),
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

  // Use Cloudinary URL with fallback
  const avatarUrl = getAvatarUrl(profile.avatar) || DEFAULT_AVATAR_URL;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* User Information Section - Full Width */}
      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="pt-6">
          <div className="text-center">
            {/* Avatar */}
            <div className="relative w-32 h-32 mx-auto mb-4">
              <Image
                src={getAvatarUrl(profile?.avatar)}
                alt={profile?.firstName + " " + profile?.lastName}
                fill
                className="rounded-full object-cover border-2 border-black dark:border-white"
                onError={handleImageError}
              />
              {isOwnProfile && (
                <div className="absolute -bottom-2 -right-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Camera className="h-4 w-4 text-black dark:text-white" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Change profile picture</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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

            {/* Name and Actions */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold dark:text-white">
                {profile?.firstName} {profile?.lastName}
              </h1>
              <div className="mt-4 flex justify-center gap-4">
                {isOwnProfile ? (
                  <>
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsChangingPassword(true)}
                    >
                      Change Password
                    </Button>
                  </>
                ) : null}
              </div>
            </div>

            {/* Contact and Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-white dark:bg-gray-800 border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Listings</p>
                      <h3 className="text-2xl font-bold dark:text-white">{profile?.itemsCount || 0}</h3>
                    </div>
                    <Package className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Items Sold</p>
                      <h3 className="text-2xl font-bold dark:text-white">{profile?.soldItemsCount || 0}</h3>
                    </div>
                    <ClipboardList className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                      <h3 className="text-base font-medium dark:text-white">
                        {profile?.createdAt ? format(new Date(profile.createdAt), "MMMM yyyy") : "-"}
                      </h3>
                    </div>
                    <UserCheck className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Details - Now more centered */}
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto text-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <div className="font-medium flex items-center justify-center gap-2 mt-1 dark:text-white">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span>{profile?.email}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Contact Number</p>
                <div className="font-medium flex items-center justify-center gap-2 mt-1 dark:text-white">
                  <Phone className="h-4 w-4 text-green-500" />
                  <span>{profile?.contactNumber || "Not provided"}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Age</p>
                <div className="font-medium flex items-center justify-center gap-2 mt-1 dark:text-white">
                  <UserCheck className="h-4 w-4 text-purple-500" />
                  <span>{profile?.age || "Not provided"}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rating</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(profile?.overallRating || 0)
                            ? "text-yellow-500 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    ({profile?.ratingCount || 0} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Reviews and Listings */}
      <Tabs defaultValue="reviews" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="reviews">
            Reviews ({profile?.ratingCount || 0})
          </TabsTrigger>
          <TabsTrigger value="listings">
            Active Listings ({profile?.items?.filter(item => item.isAvailable)?.length || 0})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="reviews" className="mt-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Reviews</h2>
              {!isOwnProfile && currentUser && (
                <Button onClick={() => setReviewDialogOpen(true)}>
                  Write a Review
                </Button>
              )}
            </div>

            {reviews.length > 0 ? (
              <div className="grid gap-4">
                {reviews.map((review) => (
                  <ReviewCard key={review._id} review={review} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8">
                  <p className="text-gray-500 text-center">No reviews yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="listings" className="mt-2">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Active Listings</h2>
              {isOwnProfile && (
                <Button onClick={() => router.push('/seller/create-listing')}>
                  Create New Listing
                </Button>
              )}
            </div>

            {profile?.items && profile.items.filter(item => item.isAvailable).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.items
                  .filter(item => item.isAvailable)
                  .map(item => (
                    <ItemCard key={item._id} item={item} />
                  ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8">
                  <p className="text-gray-500 text-center">
                    {isOwnProfile 
                      ? "You haven't listed any items for sale yet."
                      : "No active listings available."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
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

      {/* Change Password Dialog */}
      <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
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

      <ReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        onSubmit={async (rating, comment) => {
          const result = await createReview(userId, rating, comment);
          if (result) {
            setReviewDialogOpen(false);
            // Refresh reviews
            const data = await getProfile(userId);
            if (data) {
              setReviews(data.reviews);
            }
          }
        }}
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
    <Card className="bg-white dark:bg-gray-800">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
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
            <p className="text-gray-500 mt-2">{review.comment}</p>
            <p className="text-gray-400 text-sm mt-2">
              {format(new Date(review.createdAt), "MMMM d, yyyy")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ProfileSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Profile Info Skeleton */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            {/* Avatar Skeleton */}
            <div className="relative w-32 h-32 mx-auto mb-4">
              <div className="w-full h-full rounded-full bg-gray-200 animate-pulse border-2 border-black dark:border-white" />
            </div>

            {/* Name and Actions Skeleton */}
            <div className="mb-6">
              <div className="h-8 bg-gray-200 rounded w-48 mx-auto animate-pulse" />
              <div className="mt-4 flex justify-center gap-4">
                <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white dark:bg-black border-white/10">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="h-4 bg-gray-200 w-20 rounded animate-pulse" />
                        <div className="h-6 bg-gray-200 w-12 rounded animate-pulse mt-2" />
                      </div>
                      <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* User Details Skeleton */}
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto text-center">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 w-24 mx-auto rounded animate-pulse" />
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 w-32 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Skeleton */}
      <div className="w-full">
        <div className="grid w-full grid-cols-2 mb-6">
          <div className="h-10 bg-gray-200 rounded-tl animate-pulse" />
          <div className="h-10 bg-gray-200 rounded-tr animate-pulse" />
        </div>

        {/* Tab Content Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-8 bg-gray-200 w-32 rounded animate-pulse" />
            <div className="h-10 bg-gray-200 w-28 rounded animate-pulse" />
          </div>

          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-gray-200 w-32 rounded animate-pulse" />
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((j) => (
                            <div key={j} className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                          ))}
                        </div>
                      </div>
                      <div className="h-16 bg-gray-200 rounded w-full mt-2 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-24 mt-2 animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (rating: number, comment: string) => void;
}

function ReviewDialog({ open, onOpenChange, onSubmit }: ReviewDialogProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>Share your experience with this seller.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-8 h-8 cursor-pointer transition-colors ${
                  i < rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
                onClick={() => setRating(i + 1)}
              />
            ))}
          </div>
          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Review Comment
            </label>
            <textarea
              id="comment"
              className="w-full min-h-[100px] p-3 rounded-md border border-gray-300"
              placeholder="Write your review here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSubmit(rating, comment);
              setRating(5);
              setComment("");
              onOpenChange(false);
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

interface ItemCardProps {
  item: Item;
}

const ItemCard = ({ item }: ItemCardProps) => {
  const router = useRouter();

  return (
    <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-gray-800" onClick={() => router.push(`/explore/item/${item._id}`)}>
      <div className="relative aspect-square">
        <Image
          src={item.images[0]}
          alt={item.name}
          fill
          className="object-cover"
          onError={handleImageError}
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold line-clamp-1">{item.name}</h3>
          <span className="text-primary font-bold">₹{item.price}</span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {item.categories.slice(0, 2).map((category: string, index: number) => (
            <span key={index} className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full">
              {category}
            </span>
          ))}
          {item.categories.length > 2 && (
            <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full">
              +{item.categories.length - 2}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
