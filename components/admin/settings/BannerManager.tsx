"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CldUploadWidget } from "next-cloudinary";
import { toast } from "react-hot-toast";
import {
  ImagePlus,
  Trash2,
  Edit,
  GripVertical,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";

export type BannerImage = {
  id: string;
  image: string;
  alt: string;
  order: number;
};

type BannerManagerProps = {
  initialBanners: BannerImage[];
  updateBanners: (banners: BannerImage[]) => Promise<{ success: boolean }>;
};

export default function BannerManager({
  initialBanners,
  updateBanners,
}: BannerManagerProps) {
  const [banners, setBanners] = useState<BannerImage[]>(initialBanners);
  const [isSaving, setIsSaving] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerImage | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editAlt, setEditAlt] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUploadSuccess = (result: any) => {
    const newBanner: BannerImage = {
      id: crypto.randomUUID(),
      image: result.info.secure_url,
      alt: "Banner image",
      order: banners.length,
    };

    const updatedBanners = [...banners, newBanner];
    setBanners(updatedBanners);
    saveBanners(updatedBanners);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    const updatedBanners = banners
      .filter((b) => b.id !== id)
      .map((b, index) => ({ ...b, order: index }));

    setBanners(updatedBanners);
    saveBanners(updatedBanners);
  };

  const openEditDialog = (banner: BannerImage) => {
    setEditingBanner(banner);
    setEditAlt(banner.alt);
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingBanner(null);
    setEditAlt("");
  };

  const handleSaveEdit = async () => {
    if (!editingBanner) return;

    const updatedBanners = banners.map((b) =>
      b.id === editingBanner.id ? { ...b, alt: editAlt } : b,
    );

    setBanners(updatedBanners);
    saveBanners(updatedBanners);
    closeEditDialog();
  };

  const moveUp = (index: number) => {
    if (index === 0) return;

    const updatedBanners = [...banners];
    [updatedBanners[index], updatedBanners[index - 1]] = [
      updatedBanners[index - 1],
      updatedBanners[index],
    ];

    // Update order numbers
    const reorderedBanners = updatedBanners.map((b, i) => ({ ...b, order: i }));
    setBanners(reorderedBanners);
    saveBanners(reorderedBanners);
  };

  const moveDown = (index: number) => {
    if (index === banners.length - 1) return;

    const updatedBanners = [...banners];
    [updatedBanners[index], updatedBanners[index + 1]] = [
      updatedBanners[index + 1],
      updatedBanners[index],
    ];

    // Update order numbers
    const reorderedBanners = updatedBanners.map((b, i) => ({ ...b, order: i }));
    setBanners(reorderedBanners);
    saveBanners(reorderedBanners);
  };

  const saveBanners = async (bannersToSave: BannerImage[]) => {
    setIsSaving(true);

    try {
      await updateBanners(bannersToSave);
      toast.success("Banners updated successfully!");
    } catch (error) {
      console.error("Error updating banners:", error);
      toast.error("Failed to update banners. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="size-5 text-primary" />
          Shop Banner Images
        </CardTitle>
        <p className="text-sm text-gray-600">
          Manage the carousel images displayed on the shop homepage
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Banner Guidelines</p>
              <ul className="text-blue-800 space-y-1 list-disc list-inside">
                <li>Recommended size: 1920x600 pixels (16:5 aspect ratio)</li>
                <li>Images will auto-rotate every 3 seconds</li>
                <li>Use high-quality images (JPG or PNG)</li>
                <li>Keep text/logos clear and visible</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <CldUploadWidget
          uploadPreset="esk_preset" // Replace with your Cloudinary upload preset
          onSuccess={handleUploadSuccess}
          options={{
            maxFiles: 1,
            resourceType: "image",
            clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
            maxFileSize: 5000000, // 5MB
          }}
        >
          {({ open }) => (
            <Button
              onClick={() => open()}
              className="w-full"
              disabled={isSaving}
            >
              <ImagePlus className="size-4 mr-2" />
              Add New Banner
            </Button>
          )}
        </CldUploadWidget>

        {/* Banners List */}
        {banners.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <ImageIcon className="size-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No banners yet</h3>
            <p className="text-gray-600 mb-4">
              Upload your first banner image to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {banners.map((banner, index) => (
              <Card key={banner.id} className="overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  {/* Reorder Buttons */}
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveUp(index)}
                      disabled={index === 0 || isSaving}
                      className="h-6 px-2"
                    >
                      ▲
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveDown(index)}
                      disabled={index === banners.length - 1 || isSaving}
                      className="h-6 px-2"
                    >
                      ▼
                    </Button>
                  </div>

                  {/* Drag Handle Visual */}
                  <GripVertical className="size-5 text-gray-400" />

                  {/* Banner Preview */}
                  <div className="relative w-32 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={banner.image}
                      alt={banner.alt}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Banner Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{banner.alt}</p>
                    <p className="text-xs text-gray-500">Order: {index + 1}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(banner)}
                      disabled={isSaving}
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(banner.id)}
                      disabled={isSaving}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Saving Indicator */}
        {isSaving && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 py-2">
            <Loader2 className="size-4 animate-spin" />
            <span>Saving changes...</span>
          </div>
        )}
      </CardContent>

      {/* Edit Banner Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={closeEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="size-5 text-primary" />
              Edit Banner
            </DialogTitle>
            <DialogDescription>
              Update the alt text for this banner image
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Banner Preview */}
            {editingBanner && (
              <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={editingBanner.image}
                  alt={editingBanner.alt}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Alt Text Input */}
            <div>
              <Label htmlFor="alt">Alt Text / Description *</Label>
              <Input
                id="alt"
                value={editAlt}
                onChange={(e) => setEditAlt(e.target.value)}
                placeholder="E.g., Special holiday menu banner"
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Describe what&apos;s in the image for accessibility
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editAlt.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
