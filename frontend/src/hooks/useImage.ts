// frontend/src/hooks/useImage.ts
import { useState, useEffect } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const useImage = (path: string | null | undefined) => {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!path) {
      setImageUrl("/placeholder.png"); // Your default placeholder image
      return;
    }

    // If path is already a full URL, use it directly
    if (path.startsWith("http")) {
      setImageUrl(path);
      return;
    }

    // If path is relative, construct the full URL
    const fullUrl = `${BASE_URL}/${
      path.startsWith("/") ? path.slice(1) : path
    }`;
    setImageUrl(fullUrl);

    // Optionally verify if image exists
    const img = new Image();
    img.onload = () => {
      setError(false);
    };
    img.onerror = () => {
      setError(true);
      setImageUrl("/placeholder.png"); // Fallback to placeholder on error
    };
    img.src = fullUrl;
  }, [path]);

  return {
    src: imageUrl,
    error,
    isPlaceholder: !path || error,
  };
};
