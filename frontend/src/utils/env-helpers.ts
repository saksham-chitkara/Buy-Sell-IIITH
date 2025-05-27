/**
 * This utility file centralizes environment variable access and provides 
 * fallbacks for missing values in development environments
 */

/**
 * Gets the uploads URL with proper fallback logic
 */
export const getUploadsUrl = (): string => {
  // First try to get the environment variable
  const envUrl = process.env.NEXT_PUBLIC_UPLOADS_URL;
  if (envUrl) return envUrl;
  
  // If not set, try to construct it from API URL and port
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl) return apiUrl;
  
  // Last resort fallback for development
  return 'http://localhost:4000';
};
