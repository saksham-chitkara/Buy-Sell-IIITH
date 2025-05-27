/**
 * This utility file centralizes environment variable access and provides 
 * fallbacks for missing values in development environments
 */

/**
 * Gets the uploads URL with proper fallback logic
 * @deprecated - Use resource-helpers.ts getAvatarImageUrl and getItemImageUrl instead
 * which handle Cloudinary URLs properly
 */
export const getUploadsUrl = (): string => {
  // Use the API URL since we're now accessing images through API endpoints
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) {
    // Remove trailing slash for consistency
    const baseUrl = apiUrl.replace(/\/$/, "");
    // Remove any trailing '/api' or '/api/'
    return baseUrl.replace(/\/api$/, "").replace(/\/api\/$/, "");
  }
  
  // Last resort fallback for development
  return 'http://localhost:5000';
};
