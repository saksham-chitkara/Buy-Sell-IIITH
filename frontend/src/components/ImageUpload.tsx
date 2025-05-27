"use client";

import Image from "next/image";
import { Upload, X } from "lucide-react";
import { useDropzone } from "react-dropzone";

interface ImageUploadProps {
  imagePreviews: string[];
  onDrop: (files: File[]) => void;
  onRemove: (index: number) => void;
  maxImages?: number;
}

export function ImageUpload({
  imagePreviews,
  onDrop,
  onRemove,
  maxImages = 5,
}: ImageUploadProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxFiles: maxImages - imagePreviews.length,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white">Images</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {imagePreviews.map((preview, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden border border-white/10"
          >
            <Image
              src={preview}
              alt={`Preview ${index + 1}`}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-2 right-2 p-1 bg-white/50 rounded-full hover:bg-white/75 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ))}
        {imagePreviews.length < maxImages && (
          <div
            {...getRootProps()}
            className={`aspect-square rounded-lg border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2 text-white cursor-pointer
              ${
                isDragActive
                  ? "border-white/50 bg-white/10"
                  : "border-white/10 hover:border-white/20"
              }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-6 h-6" />
            <span className="text-sm text-center">
              {isDragActive ? "Drop images here" : "Add more images"}
            </span>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400">
        Upload up to {maxImages} images (PNG, JPG, WEBP), max 5 MB each
      </p>
    </div>
  );
}
