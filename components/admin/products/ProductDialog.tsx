"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { createProduct, updateProduct } from "@/lib/queries/admin/products";
import ImageUpload from "./ImageUpload";
import { Product } from "@/components/products/types/product";
import { Category } from "@/lib/queries/categories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  categories: Category[];
  onSuccess: () => void;
}

export default function ProductDialog({
  open,
  onOpenChange,
  product,
  categories,
  onSuccess,
}: ProductDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null as string | null,
    amount: "",
    category_id: "",
    in_stock: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        description: product.description,
        image: product.image || null,
        amount: product.amount.toString(),
        category_id: product.category.id,
        in_stock: product.in_stock,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        image: null,
        amount: "",
        category_id: categories[0]?.id || "",
        in_stock: true,
      });
    }
  }, [product, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a product name");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (!formData.category_id) {
      toast.error("Please select a category");
      return;
    }

    setIsLoading(true);

    try {
      const productData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        image: formData.image,
        amount: parseFloat(formData.amount),
        category_id: formData.category_id,
        in_stock: formData.in_stock,
        options: null, // Simplified for MVP
      };

      if (product) {
        await updateProduct(product.id, productData);
        toast.success("Product updated successfully");
      } else {
        await createProduct(productData);
        toast.success("Product created successfully");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Product save error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save product",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-playfair">
            {product ? "Edit Product" : "Add Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="title">Product Name</FieldLabel>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g., Margherita Pizza"
              disabled={isLoading}
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe your product..."
              disabled={isLoading}
              required
              className="w-full min-h-24 px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-primary focus:ring-primary/20 focus:ring-[3px] outline-none transition-all resize-none"
            />
          </Field>

          <Field>
            <FieldLabel>Product Image</FieldLabel>
            <ImageUpload
              value={formData.image}
              onChange={(publicId) =>
                setFormData((prev) => ({ ...prev, image: publicId }))
              }
              disabled={isLoading}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="amount">Price ($)</FieldLabel>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, amount: e.target.value }))
                }
                placeholder="0.00"
                disabled={isLoading}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="category">Category</FieldLabel>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category_id: value }))
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="in_stock">In Stock</FieldLabel>
              <Switch
                id="in_stock"
                checked={formData.in_stock}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, in_stock: checked }))
                }
                disabled={isLoading}
              />
            </div>
          </Field>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : product ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
