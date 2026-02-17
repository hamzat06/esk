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
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "react-hot-toast";
import { createProduct, updateProduct } from "@/lib/queries/admin/products";
import ImageUpload from "./ImageUpload";
import { Product } from "@/components/products/types/product";
import { ProductOptions } from "@/components/products/types/product";
import { Category } from "@/lib/queries/categories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  categories: Category[];
  onSuccess: () => void;
}

interface Option {
  id: string;
  key: string;
  label: string;
  type: "single" | "multiple";
  required: boolean;
  choices: OptionChoice[];
}

interface OptionChoice {
  id: string;
  label: string;
  price: number;
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
  const [options, setOptions] = useState<Option[]>([]);
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
      // Parse options from product
      if (product.options && product.options.groups) {
        const parsedOptions: Option[] = product.options.groups.map((group) => ({
          id: Math.random().toString(36).substr(2, 9),
          key: group.key,
          label: group.label,
          type: group.type,
          required: group.required,
          choices: group.options.map((option) => ({
            id: Math.random().toString(36).substr(2, 9),
            label: option.label,
            price: option.price,
          })),
        }));
        setOptions(parsedOptions);
      } else {
        setOptions([]);
      }
    } else {
      setFormData({
        title: "",
        description: "",
        image: null,
        amount: "",
        category_id: categories[0]?.id || "",
        in_stock: true,
      });
      setOptions([]);
    }
  }, [product, categories, open]);

  const addOption = () => {
    setOptions([
      ...options,
      {
        id: Math.random().toString(36).substr(2, 9),
        key: "",
        label: "",
        type: "single",
        required: false,
        choices: [],
      },
    ]);
  };

  const removeOption = (optionId: string) => {
    setOptions(options.filter((opt) => opt.id !== optionId));
  };

  const updateOption = (
    optionId: string,
    field: keyof Omit<Option, "id" | "choices">,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
  ) => {
    setOptions(
      options.map((opt) =>
        opt.id === optionId ? { ...opt, [field]: value } : opt,
      ),
    );
  };

  const addChoice = (optionId: string) => {
    setOptions(
      options.map((opt) =>
        opt.id === optionId
          ? {
              ...opt,
              choices: [
                ...opt.choices,
                {
                  id: Math.random().toString(36).substr(2, 9),
                  label: "",
                  price: 0,
                },
              ],
            }
          : opt,
      ),
    );
  };

  const removeChoice = (optionId: string, choiceId: string) => {
    setOptions(
      options.map((opt) =>
        opt.id === optionId
          ? {
              ...opt,
              choices: opt.choices.filter((choice) => choice.id !== choiceId),
            }
          : opt,
      ),
    );
  };

  const updateChoice = (
    optionId: string,
    choiceId: string,
    field: "label" | "price",
    value: string | number,
  ) => {
    setOptions(
      options.map((opt) =>
        opt.id === optionId
          ? {
              ...opt,
              choices: opt.choices.map((choice) =>
                choice.id === choiceId ? { ...choice, [field]: value } : choice,
              ),
            }
          : opt,
      ),
    );
  };

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

    // Validate options
    for (const option of options) {
      if (!option.label.trim()) {
        toast.error("Please name all option groups");
        return;
      }
      if (!option.key.trim()) {
        toast.error("Please provide a key for all option groups");
        return;
      }
      if (option.choices.length === 0) {
        toast.error(`Please add at least one choice for "${option.label}"`);
        return;
      }
      for (const choice of option.choices) {
        if (!choice.label.trim()) {
          toast.error(`Please name all choices in "${option.label}"`);
          return;
        }
      }
    }

    setIsLoading(true);

    try {
      // Format options for database (matching ProductOptions type)
      const formattedOptions: ProductOptions | null =
        options.length > 0
          ? {
              groups: options.map((option) => ({
                key: option.key,
                label: option.label,
                type: option.type,
                required: option.required,
                options: option.choices.map((choice) => ({
                  label: choice.label,
                  price: choice.price,
                })),
              })),
            }
          : null;

      const productData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        image: formData.image,
        amount: parseFloat(formData.amount),
        category_id: formData.category_id,
        in_stock: formData.in_stock,
        options: formattedOptions,
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
      console.error("Error saving product:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save product",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="font-playfair">
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="space-y-6 py-4 px-1">
            {/* Basic Info */}
            <div className="space-y-4">
              <Field>
                <FieldLabel>Product Name *</FieldLabel>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Jollof Rice"
                />
              </Field>

              <Field>
                <FieldLabel>Description *</FieldLabel>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe your product"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel>Price (₦) *</FieldLabel>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </Field>

                <Field>
                  <FieldLabel>Category *</FieldLabel>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category_id: value })
                    }
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
                <FieldLabel>Product Image</FieldLabel>
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                />
              </Field>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.in_stock}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, in_stock: checked })
                  }
                />
                <Label>In Stock</Label>
              </div>
            </div>

            {/* Options/Add-ons Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Options & Add-ons</h3>
                  <p className="text-sm text-gray-600">
                    Add customizable options like protein, extras, etc.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                >
                  <Plus className="size-4 mr-2" />
                  Add Option Group
                </Button>
              </div>

              {options.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                  <p className="text-gray-500 text-sm">
                    No options added yet. Click &quot;Add Option Group&quot; to
                    start.
                  </p>
                </div>
              )}

              {options.map((option) => (
                <div
                  key={option.id}
                  className="border rounded-lg p-4 space-y-4 mb-4"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm font-semibold">
                            Display Name *
                          </Label>
                          <Input
                            value={option.label}
                            onChange={(e) =>
                              updateOption(option.id, "label", e.target.value)
                            }
                            placeholder="e.g., Protein, Extras"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold">
                            Key (Internal) *
                          </Label>
                          <Input
                            value={option.key}
                            onChange={(e) =>
                              updateOption(
                                option.id,
                                "key",
                                e.target.value
                                  .toLowerCase()
                                  .replace(/\s+/g, "_"),
                              )
                            }
                            placeholder="e.g., protein, extras"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm font-semibold">
                            Selection Type
                          </Label>
                          <Select
                            value={option.type}
                            onValueChange={(value: "single" | "multiple") =>
                              updateOption(option.id, "type", value)
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single">
                                Single Choice
                              </SelectItem>
                              <SelectItem value="multiple">
                                Multiple Choice
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={option.required}
                              onCheckedChange={(checked) =>
                                updateOption(option.id, "required", checked)
                              }
                            />
                            <Label>Required</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOption(option.id)}
                      className="mt-6"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>

                  <div className="pl-4 border-l-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Choices</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addChoice(option.id)}
                      >
                        <Plus className="size-3 mr-1" />
                        Add Choice
                      </Button>
                    </div>

                    {option.choices.length === 0 && (
                      <p className="text-xs text-gray-500 italic">
                        No choices added yet
                      </p>
                    )}

                    {option.choices.map((choice) => (
                      <div key={choice.id} className="flex items-center gap-2">
                        <Input
                          value={choice.label}
                          onChange={(e) =>
                            updateChoice(
                              option.id,
                              choice.id,
                              "label",
                              e.target.value,
                            )
                          }
                          placeholder="Choice name"
                          className="flex-1"
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-600">₦</span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={choice.price}
                            onChange={(e) =>
                              updateChoice(
                                option.id,
                                choice.id,
                                "price",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            placeholder="0"
                            className="w-24"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeChoice(option.id, choice.id)}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="shrink-0 mt-6">
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
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : product ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
