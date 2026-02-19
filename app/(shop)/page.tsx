import BusinessHours from "@/components/BusinessHours";
import ProductListClient from "@/components/products/ProductListClient";
import ProductsGridSkeleton from "@/components/products/ProductsGridSkeleton";
import SearchHeader from "@/components/products/SearchHeader";
import ShopCarousel from "@/components/ShopCarousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchCategories } from "@/lib/queries/categories";
import { fetchProducts } from "@/lib/queries/products";
import { createClient } from "@/lib/supabase/server";
import { Clock3, Info, MapPin, Star } from "lucide-react";
import { Suspense } from "react";

export default async function Page() {
  const supabase = await createClient();

  // Fetch shop info
  const { data: shopInfoData } = await supabase
    .from("shop_settings")
    .select("value")
    .eq("key", "shop_info")
    .single();

  const shopInfo = shopInfoData?.value || {
    name: "EddySylva Kitchen",
    cuisine: "African Cuisine",
    address: "255 South 60th Street",
    city: "Philadelphia",
    state: "PA",
    zipCode: "19139",
    deliveryTimeMin: 30,
    deliveryTimeMax: 45,
    deliveryFee: 2.99,
  };

  const [products, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ]);

  return (
    <main className="bg-gray-50">
      <ShopCarousel />

      {/* Restaurant Info Section */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 sm:px-5 py-6 sm:py-8">
          {/* Header */}
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-4xl font-bold font-playfair mb-2">
                  {shopInfo.name}
                </h1>
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <MapPin className="size-4 sm:size-5 shrink-0" />
                  <p className="text-sm sm:text-base">
                    {shopInfo.city} • {shopInfo.address}, {shopInfo.state}{" "}
                    {shopInfo.zipCode}
                  </p>
                </div>
              </div>

              {/* Rating Badge */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <div className="flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-full">
                  <Star className="size-4 fill-current" />
                  <span className="font-semibold text-sm">4.8</span>
                </div>
                <span className="text-xs text-gray-500">500+ ratings</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="px-3 py-1 text-sm border-gray-300 bg-white"
              >
                {shopInfo.cuisine}
              </Badge>
              <Badge
                variant="outline"
                className="px-3 py-1 text-sm border-gray-300 bg-white"
              >
                {shopInfo.deliveryTimeMin}-{shopInfo.deliveryTimeMax} min
              </Badge>
              <Badge
                variant="outline"
                className="px-3 py-1 text-sm border-gray-300 bg-white"
              >
                ${shopInfo.deliveryFee.toFixed(2)} delivery
              </Badge>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            {/* Business Hours */}
            <BusinessHours>
              <Button
                variant="ghost"
                className="justify-start gap-2 px-4 py-3 h-auto border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                size="lg"
              >
                <Clock3 className="size-5 text-gray-600" />
                <Badge className="bg-green-50 text-green-700 font-semibold border border-green-200 px-2.5 py-0.5">
                  Open
                </Badge>
                <span className="text-sm text-gray-700">Opens at 11:00 AM</span>
                <Info className="size-4 text-gray-400 ml-auto" />
              </Button>
            </BusinessHours>

            {/* Search */}
            <div className="sm:ml-auto">
              <SearchHeader />
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={<ProductsGridSkeleton />}>
        <ProductListClient initialProducts={products}
          initialCategories={categories} />
      </Suspense>
    </main>
  );
}
