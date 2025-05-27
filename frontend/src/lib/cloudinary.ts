export interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  apiUrl: string;
}

export const cloudinaryConfig: CloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dzuw1wuki',
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'buy_sell_iiith',
  apiUrl: `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dzuw1wuki'}`,
};

export const getCloudinaryUrl = (publicId: string, transformations: string = '') => {
  // Handle empty/null/undefined publicId
  if (!publicId) {
    // Return default avatar image path
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dzuw1wuki';
    return `https://res.cloudinary.com/${cloudName}/image/upload/users/default-avatar`;
  }
  
  // Check if publicId is already a full URL (starts with http:// or https://)
  if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
    return publicId; // Return as is if it's already a URL
  }
  
  // Handle case where there's no file extension in the publicId
  // This ensures Cloudinary delivers the image even without an extension
  const publicIdWithoutExtension = publicId.split('.')[0];
  
  // Ensure we have a cloud name
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dzuw1wuki';
  
  // Construct the Cloudinary URL
  return `https://res.cloudinary.com/${cloudName}/image/upload${transformations ? '/' + transformations : ''}/${publicIdWithoutExtension}`;
};

export const cloudinaryImageOptimization = {
  avatar: 'c_fill,g_face,w_200,h_200,q_auto:best,f_auto',
  thumbnail: 'c_fill,w_300,h_300,q_auto:good,f_auto',
  preview: 'c_limit,w_1000,q_auto:good,f_auto',
};
