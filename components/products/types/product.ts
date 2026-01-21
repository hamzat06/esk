export type ProductOptionItem = {
  label: string;
  price: number;
};

export type ProductOptionGroup = {
  key: string;
  label: string;
  type: "single" | "multiple";
  required: boolean;
  options: ProductOptionItem[];
};

export type ProductOptions = {
  groups: ProductOptionGroup[];
};

export type Product = {
  id: string;
  title: string;
  description: string;
  image: string | null;
  amount: number;
  in_stock: boolean;
  category: {
    id: string;
    title: string;
  };
  options?: ProductOptions | null;
};