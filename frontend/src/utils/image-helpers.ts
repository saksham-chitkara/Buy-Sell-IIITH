import { ImageProps } from 'next/image';
import { getUploadsUrl } from './env-helpers';

export interface CloudinaryImage {
  url: string;
  public_id?: string;
}

export const DEFAULT_AVATAR_URL = 'https://res.cloudinary.com/dzuw1wuki/image/upload/v1748308567/default.jpg';
export const DEFAULT_ITEM_URL = 'https://res.cloudinary.com/dzuw1wuki/image/upload/v1748308567/default-item.jpg';

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.target as HTMLImageElement;
  target.onerror = null; // Prevent infinite loop
  
  // Check if the image is an avatar or item image based on URL patterns
  if (target.src.includes('avatar') || target.src.includes('/users/')) {
    target.src = DEFAULT_AVATAR_URL;
  } else {
    target.src = DEFAULT_ITEM_URL;
  }
};

export const getAvatarUrl = (avatar: string | CloudinaryImage | undefined): string => {
  // Use Cloudinary fallback if no avatar
  if (!avatar) return DEFAULT_AVATAR_URL;
  
  if (typeof avatar === "object" && "url" in avatar) {
    // Cloudinary image already has full URL
    return avatar.url;
  }
  
  // For string paths, check if it's already a URL
  if (avatar.startsWith("http")) return avatar;
    // Otherwise, just use the default Cloudinary URL
  return DEFAULT_AVATAR_URL;
};

export const getItemImageUrl = (image: string | CloudinaryImage | undefined): string => {
  // Use Cloudinary fallback if no image
  if (!image) return DEFAULT_ITEM_URL;
  
  if (typeof image === "object" && "url" in image) {
    // Cloudinary image already has full URL
    return image.url;
  }
  
  // For string paths, check if it's already a URL
  if (image.startsWith("http")) return image;
    // Otherwise, just use the default Cloudinary URL
  return DEFAULT_ITEM_URL;
};

export const getImageProps = (
  image: string | CloudinaryImage | undefined,
  defaultProps?: Partial<ImageProps>,
  isAvatar: boolean = false
): Partial<ImageProps> => {
  // Get the appropriate URL based on the image type
  const src = isAvatar ? getAvatarUrl(image) : getItemImageUrl(image);

  // Get appropriate fallback based on the image type
  const fallback = isAvatar ? DEFAULT_AVATAR_URL : DEFAULT_ITEM_URL;

  return {
    src,
    onError: handleImageError,
    alt: defaultProps?.alt || 'Image',
    ...defaultProps,
    // Ensure these props aren't overridden
    loading: 'lazy',
    quality: 75, // Good balance of quality and performance
    placeholder: 'blur',
    blurDataURL: fallback,
  };
};
