import { ImageProps } from 'next/image';
import { getUploadsUrl } from './env-helpers';

interface CloudinaryImage {
  url: string;
  public_id?: string;
}

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.target as HTMLImageElement;
  target.onerror = null; // Prevent infinite loop
  
  // Check if the image is an avatar or item image based on URL patterns
  if (target.src.includes('avatar') || target.src.includes('/users/')) {
    target.src = '/default-avatar.png';
  } else {
    target.src = '/default-item.jpg';
  }
  
  // Add a fallback for the fallback
  target.onerror = () => {
    target.onerror = null;
    target.src = '/images/test.png';
  };
};

export const getAvatarUrl = (avatar: string | CloudinaryImage | undefined): string => {
  // Use local fallback if no avatar
  if (!avatar) return "/default-avatar.png";
  
  if (typeof avatar === "object" && "url" in avatar) {
    // Cloudinary image already has full URL
    return avatar.url;
  }
  
  // For string paths, check if it's already a URL
  if (avatar.startsWith("http")) return avatar;
  
  // Otherwise, it's a relative path that needs the base URL
  const baseUrl = getUploadsUrl();
  
  return `${baseUrl}/users/${avatar}`;
};

export const getItemImageUrl = (image: string | CloudinaryImage | undefined): string => {
  // Use local fallback if no image
  if (!image) return "/default-item.jpg";
  
  if (typeof image === "object" && "url" in image) {
    // Cloudinary image already has full URL
    return image.url;
  }
  
  // For string paths, check if it's already a URL
  if (image.startsWith("http")) return image;
  
  // Otherwise, it's a relative path that needs the base URL
  const baseUrl = getUploadsUrl();
  
  return `${baseUrl}/items/${image}`;
};

export const getImageProps = (
  image: string | CloudinaryImage | undefined,
  defaultProps?: Partial<ImageProps>,
  isAvatar: boolean = false
): Partial<ImageProps> => {
  return {
    src: isAvatar ? getAvatarUrl(image) : getItemImageUrl(image),
    onError: handleImageError,
    alt: defaultProps?.alt || 'Image',
    ...defaultProps,
  };
};
