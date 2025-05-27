import Image from 'next/image';
import { getCloudinaryUrl, cloudinaryImageOptimization } from '@/lib/cloudinary';

interface CloudinaryImageProps {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  optimization?: keyof typeof cloudinaryImageOptimization | string;
  priority?: boolean;
}

export const CloudinaryImage = ({
  publicId,
  alt,
  width,
  height,
  className = '',
  optimization,
  priority = false,
}: CloudinaryImageProps) => {
  const transformations = optimization ? 
    (cloudinaryImageOptimization[optimization as keyof typeof cloudinaryImageOptimization] || optimization) 
    : '';

  // Only try to generate a URL if publicId is provided
  const imageUrl = publicId ? getCloudinaryUrl(publicId, transformations) : '';
  
  // If no valid URL could be generated, return a placeholder or null
  if (!imageUrl) {
    // Return a div with the same dimensions or a placeholder image
    return (
      <div 
        className={`bg-gray-200 ${className}`} 
        style={{ width: width ? `${width}px` : '100%', height: height ? `${height}px` : 'auto' }}
      />
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
};

export const UserAvatar = ({
  publicId,
  className = '',
  size = 40,
}: {
  publicId: string;
  className?: string;
  size?: number;
}) => {
  return (
    <CloudinaryImage
      publicId={publicId}
      alt="User avatar"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      optimization="avatar"
    />
  );
};

export const ItemImage = ({
  publicId,
  alt,
  className = '',
  isPreview = false,
}: {
  publicId: string;
  alt: string;
  className?: string;
  isPreview?: boolean;
}) => {
  return (
    <CloudinaryImage
      publicId={publicId}
      alt={alt}
      className={`object-cover ${className}`}
      optimization={isPreview ? 'preview' : 'thumbnail'}
    />
  );
};
