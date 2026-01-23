import ProductCardSkeleton from "./ProductCardSkeleton";

const ProductsGridSkeleton = () => {
  return (
    <div className="container mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default ProductsGridSkeleton;
