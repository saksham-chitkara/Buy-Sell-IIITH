import { useState } from 'react';
import { cloudinaryConfig } from '@/lib/cloudinary';

interface UploadOptions {
  folder?: string;
  transformation?: string;
}

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File, options: UploadOptions = {}) => {
    try {
      setIsUploading(true);
      setError(null);

      if (!cloudinaryConfig.uploadPreset) {
        throw new Error('Cloudinary upload preset is not configured');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cloudinaryConfig.uploadPreset);
      if (options.folder) {
        formData.append('folder', options.folder);
      }

      const response = await fetch(`${cloudinaryConfig.apiUrl}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return {
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading,
    error,
  };
};

export const useMultiImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadImages = async (files: File[], options: UploadOptions = {}) => {
    try {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      const results = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        formData.append('upload_preset', cloudinaryConfig.uploadPreset);
        if (options.folder) {
          formData.append('folder', options.folder);
        }

        const response = await fetch(`${cloudinaryConfig.apiUrl}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload image ${i + 1}`);
        }

        const data = await response.json();
        results.push({
          url: data.secure_url,
          publicId: data.public_id,
          width: data.width,
          height: data.height,
        });

        setProgress(((i + 1) / files.length) * 100);
      }

      return results;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images');
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImages,
    isUploading,
    error,
    progress,
  };
};
