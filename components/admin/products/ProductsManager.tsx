"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { deleteProduct, toggleProductStock } from "@/lib/queries/admin/products";
import ProductDialog from "./ProductDialog";
import { Product } from "@/components/products/types/product";
import { Category } from "@/lib/queries/categories";
import { CldImage } from "next-cloudinary";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";

interface ProductsManagerProps {
  initialProducts: Product[];
  categories: Category[];
}

export default function ProductsManager({
  initialProducts,
  categories,
}: ProductsManagerProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAdd = () => {
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);

    try {
      await deleteProduct(productToDelete.id);
      setProducts((prev) =>
        prev.filter((prod) => prod.id !== productToDelete.id),
      );
      toast.success("Product deleted successfully");
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete product",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStockToggle = async (productId: string, currentStock: boolean) => {
    try {
      await toggleProductStock(productId, !currentStock);
      setProducts((prev) =>
        prev.map((prod) =>
          prod.id === productId
            ? { ...prod, in_stock: !currentStock }
            : prod,
        ),
      );
      toast.success(
        `Product ${!currentStock ? "marked as in stock" : "marked as out of stock"}`,
      );
    } catch (error) {
      console.error("Stock toggle error:", error);
      toast.error("Failed to update stock status");
    }
  };

  const refreshProducts = async () => {
    const { fetchProducts } = await import("@/lib/queries/products");
    const updated = await fetchProducts();
    setProducts(updated);
  };

  return (
    <>
      <div className="container mx-auto px-4 sm:px-5 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold font-playfair mb-2">
              Products
            </h1>
            <p className="text-gray-600">Manage your menu items</p>
          </div>
          <Button onClick={handleAdd} size="lg">
            <Plus className="size-4" />
            Add Product
          </Button>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">No products yet</p>
              <Button onClick={handleAdd} variant="outline">
                <Plus className="size-4" />
                Add Your First Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative aspect-video w-full bg-gray-100">
                  {product.image ? (
                    <CldImage
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-cover"
                      crop={{
                        type: "auto",
                        source: true,
                      }}
                    />
                  ) : (
                    <Image
                      src="/assets/mustard-back.jpg"
                      alt="Placeholder"
                      fill
                      className="object-cover"
                    />
                  )}
                  {!product.in_stock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg line-clamp-1">
                      {product.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {product.description}
                    </p>
                    <p className="text-sm text-primary mt-1">
                      {product.category.title}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold font-playfair text-primary">
                      ${product.amount.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={product.in_stock}
                        onCheckedChange={() =>
                          handleStockToggle(product.id, product.in_stock)
                        }
                      />
                      <span className="text-xs text-gray-600">
                        {product.in_stock ? "In Stock" : "Out"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEdit(product)}
                    >
                      <Pencil className="size-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteClick(product)}
                    >
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={selectedProduct}
        categories={categories}
        onSuccess={refreshProducts}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{productToDelete?.title}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
