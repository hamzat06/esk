import BusinessHours from "@/components/BusinessHours";
import ProductList from "@/components/products/ProductList";
import { Product } from "@/components/products/types/product";
import SearchField from "@/components/SearchField";
import ShopCarousel from "@/components/ShopCarousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock3, Info } from "lucide-react";

const products: Product[] = [
  {
    id: "1",
    image: "/assets/jollof-rice-chicken.jpg",
    title: "Jollof rice & Chicken",
    description:
      "Smoky, flavorful Jollof Rice cooked in tomato-pepper sauce, served with juicy seasoned chicken.",
    amount: 10,
    in_stock: true,
    category: {
      title: "Meals",
      id: "1",
    },
  },
  {
    id: "2",
    image: "/assets/amala.jpg",
    title: "Egusi Soup & Swallow",
    description:
      "Traditional melon seed soup with spinach and assorted meats, served with your choice of swallow (eba, fufu, or pounded yam).",
    amount: 10,
    in_stock: false,
    category: {
      title: "Meals",
      id: "1",
    },
  },
];

export default function Page() {
  return (
    <main>
      <ShopCarousel />
      <div className="border-b">
        <div className="container mx-auto p-4 sm:p-5">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-xl sm:text-3xl font-semibold">
              EddySylva Kitchen -{" "}
              <span className="text-gray-500">Philadelphia</span>
            </h1>
            <h3 className="text-gray-500 text-base sm:text-lg font-medium mb-4">
              255 South 60th Street Philadelphia, PA 19139
            </h3>
          </div>

          <div className="mt-1.5 flex sm:flex-row flex-col justify-between sm:items-center gap-y-4">
            <div className="flex sm:flex-row flex-col sm:items-center gap-x-2.5 gap-y-3">
              <BusinessHours>
                <Button
                  variant="ghost"
                  className="text-gray-500 -ml-3 w-fit"
                  size="lg"
                >
                  <Clock3 className="size-4 sm:size-5" />
                  <Badge className="bg-green-100 text-green-600 font-semibold border border-green-200 rounded-sm">
                    Open
                  </Badge>
                  <p>Opens today at 11:00 AM</p>
                  <Info className="size-4 sm:size-5 ml-1" />
                </Button>
              </BusinessHours>

              {/* <Button variant="outline" size="lg">
                <SendHorizontal />
                Schedule delivery
              </Button> */}
            </div>

            <div>
              <SearchField
                wrapperClassName="sm:w-[400px] w-full rounded-full bg-gray-200 h-10 sm:h-12"
                inputClassName="placeholder:font-medium sm:text-lg!"
                placeholder="Search menu"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <ProductList products={products} />
    </main>
  );
}
