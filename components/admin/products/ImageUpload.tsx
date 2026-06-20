"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, Image as ImageIcon, Video } from "lucide-react";
import { CldImage } from "next-cloudinary";
import { toast } from "react-hot-toast";
import {
  isVideoAsset,
  getPublicId,
  getVideoUrl,
} from "@/lib/cloudinary";

interface ImageUploadProps {
  value: string | null;
  onChange: (publicId: string | null) => void;
  disabled?: boolean;
}

const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function ImageUpload({
  value,
  onChange,
  disabled,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isImage && !isVideo) {
      toast.error("Please select an image or video file");
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      toast.error(`File must be less than ${MAX_SIZE_MB}MB`);
      return;
    }

    setIsUploading(true);

    try {
      const resourceType = isVideo ? "video" : "image";

      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ecommerce-products",
      );

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
        { method: "POST", body: formData },
      );

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      const publicId = isVideo ? `video:${data.public_id}` : data.public_id;
      onChange(publicId);
      toast.success(`${isVideo ? "Video" : "Image"} uploaded successfully`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isVideo = value ? isVideoAsset(value) : false;
  const publicId = value ? getPublicId(value) : null;

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/mp4,video/quicktime,video/webm"
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {value && publicId ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-100">
          {isVideo ? (
            <video
              src={getVideoUrl(publicId)}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <CldImage
              src={publicId}
              alt="Product media"
              fill
              className="object-cover"
              crop={{ type: "auto", source: true }}
            />
          )}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={disabled || isUploading}
          >
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <div
          className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="size-10 text-gray-400 animate-spin mb-3" />
              <p className="text-sm text-gray-500">Uploading...</p>
            </>
          ) : (
            <>
              <div className="flex gap-3 mb-3">
                <ImageIcon className="size-8 text-gray-400" />
                <Video className="size-8 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Click to upload image or video
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, MP4, MOV, WEBM — max {MAX_SIZE_MB}MB
              </p>
            </>
          )}
        </div>
      )}

      {!value && !isUploading && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="w-full"
        >
          <Upload className="size-4" />
          Choose Image or Video
        </Button>
      )}
    </div>
  );
}
