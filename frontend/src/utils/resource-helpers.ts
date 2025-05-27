/**
 * API and Resource Management Utilities
 * This file provides centralized functions for handling API URLs and resources
 */
import { CloudinaryImage } from "@/hooks/useImage";

const DEFAULT_AVATAR_URL = 'https://res.cloudinary.com/dzuw1wuki/image/upload/v1748308567/default.jpg';
const DEFAULT_ITEM_URL = 'https://res.cloudinary.com/dzuw1wuki/image/upload/v1748308567/default-item.jpg';

/**
 * Gets the API URL with the proper prefix
 */
export function getApiUrl(endpoint: string): string {  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/+$/, '');
  endpoint = endpoint.replace(/^\/+/, '');
  return `${baseUrl}/${endpoint}`;
}

/**
 * Gets a properly formatted URL for an avatar image with fallback
 */
export function getAvatarImageUrl(avatar?: string | CloudinaryImage | null): string {
  if (!avatar) return DEFAULT_AVATAR_URL;
  
  if (typeof avatar === "object" && avatar.url) {
    // Handle Cloudinary avatar image
    return avatar.url;
  }
  
  if (typeof avatar === "string") {
    if (avatar.startsWith("http")) {
      return avatar;
    }
    // For other avatar strings, use API to fetch avatar URL
    return DEFAULT_AVATAR_URL;
  }
  
  return DEFAULT_AVATAR_URL;
}

/**
 * Gets a properly formatted URL for an item image with fallback
 */
export function getItemImageUrl(image?: string | CloudinaryImage | null): string {
  if (!image) return DEFAULT_ITEM_URL;
  
  if (typeof image === "object" && image.url) {
    // Handle Cloudinary item image
    return image.url;
  }
  
  if (typeof image === "string") {
    if (image.startsWith("http")) {
      return image;
    }
    // For other image strings, use default Cloudinary URL
    return DEFAULT_ITEM_URL;
  }
  
  return DEFAULT_ITEM_URL;
}

/**
 * Helper to handle image errors by setting appropriate fallback
 */
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement, Event>): void {
  const img = event.currentTarget;
  img.onerror = null; // Prevent infinite loop
  
  // Choose appropriate fallback based on context
  if (img.src.includes('avatar') || img.src.includes('users')) {
    img.src = DEFAULT_AVATAR_URL;
  } else {
    img.src = DEFAULT_ITEM_URL;
  }
}
