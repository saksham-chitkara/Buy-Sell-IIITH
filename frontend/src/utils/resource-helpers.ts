/**
 * API and Resource Management Utilities
 * This file provides centralized functions for handling API URLs and resources
 */
import { CloudinaryImage } from "@/hooks/useImage";

/**
 * Gets the API URL with the proper prefix
 */
export function getApiUrl(endpoint: string): string {
  let baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  // Remove trailing slash for consistency
  baseUrl = baseUrl.replace(/\/$/, "");
  // Remove any trailing '/api' or '/api/'
  baseUrl = baseUrl.replace(/\/api$/, "").replace(/\/api\/$/, "");
  // Remove leading slash from endpoint
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint.substring(1) : endpoint;
  // Always add '/api/' before the endpoint
  return `${baseUrl}/api/${normalizedEndpoint}`;
}

/**
 * Gets a properly formatted URL for an avatar image with fallback
 */
export function getAvatarImageUrl(avatar?: string | CloudinaryImage | null): string {
  if (!avatar) return "/default-avatar.png";
  
  if (typeof avatar === "object" && avatar.url) {
    // Handle Cloudinary avatar image
    return avatar.url;
  }
  
  if (typeof avatar === "string") {
    if (avatar.startsWith("http")) {
      return avatar;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${baseUrl}/uploads/users/${avatar}`;
  }
  
  return "/default-avatar.png";
}

/**
 * Gets a properly formatted URL for an item image with fallback
 */
export function getItemImageUrl(image?: string | CloudinaryImage | null): string {
  if (!image) return "/default-item.jpg";
  
  if (typeof image === "object" && image.url) {
    // Handle Cloudinary item image
    return image.url;
  }
  
  if (typeof image === "string") {
    if (image.startsWith("http")) {
      return image;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${baseUrl}/uploads/items/${image}`;
  }
  
  return "/default-item.jpg";
}

/**
 * Helper to handle image errors by setting appropriate fallback
 */
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement, Event>): void {
  const img = event.currentTarget;
  img.onerror = null; // Prevent infinite loop
  
  // Choose appropriate fallback
  if (img.src.includes('avatar') || img.src.includes('users')) {
    img.src = "/default-avatar.png";
  } else {
    img.src = "/default-item.jpg";
  }
}
