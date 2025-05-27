// frontend/src/hooks/useImage.ts
import { useState, useEffect } from "react";
import { getUploadsUrl } from "@/utils/env-helpers";

export interface CloudinaryImage {
  public_id: string;
  url: string;
}

// Get the base URL with proper fallback
const BASE_URL = getUploadsUrl();

export const useImage = (path: string | CloudinaryImage | null | undefined) => {
  const [imageUrl, setImageUrl] = useState<string>("/images/test.png");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!path) {
      setImageUrl("/images/test.png");
      setError(false);
      return;
    }

    let finalUrl = "/placeholder.png";

    if (typeof path === "object" && path.url) {
      // Handle Cloudinary URL (already absolute URL)
      finalUrl = path.url;
    } else if (typeof path === "string") {
      // Handle legacy paths and direct URLs
      if (path.startsWith("http")) {
        // Already absolute URL
        finalUrl = path;
      } else if (path.startsWith("/")) {
        // Path starts with slash - this should be an absolute path from root
        finalUrl = path; // Keep as absolute path from domain root
      } else {
        // Relative path that needs the API base URL
        finalUrl = `${BASE_URL}/${path}`;
      }
    }

    // Set image URL with proper error handling
    setImageUrl(finalUrl);
    
    // Pre-check if the image exists to avoid 404 errors
    const img = new Image();
    img.onload = () => {
      setImageUrl(finalUrl);
      setError(false);
    };
    img.onerror = () => {
      // Choose appropriate fallback based on path type
      if (finalUrl.includes('/users/') || finalUrl.includes('avatar')) {
        setImageUrl("/default-avatar.png");
      } else {
        setImageUrl("/default-item.jpg");
      }
      setError(true);
      console.log(`Failed to load image: ${finalUrl}, using fallback`);
    };
    img.src = finalUrl;
  }, [path]);

  return {
    src: imageUrl,
    error,
    isPlaceholder: !path || error,
  };
};
