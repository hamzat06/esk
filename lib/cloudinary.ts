const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export const isVideoAsset = (asset: string | null | undefined): boolean =>
  typeof asset === "string" && asset.startsWith("video:");

export const getPublicId = (asset: string): string =>
  asset.startsWith("video:") ? asset.slice(6) : asset;

export const getVideoUrl = (publicId: string): string =>
  `https://res.cloudinary.com/${CLOUD}/video/upload/${publicId}`;

// First-frame thumbnail from a Cloudinary video — usable with next/image
export const getVideoThumbnailUrl = (publicId: string): string =>
  `https://res.cloudinary.com/${CLOUD}/video/upload/${publicId}.jpg`;
