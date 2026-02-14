export type CartItem = {
  id: string;
  productId: string;
  title: string;
  image?: string | null;

  quantity: number;

  basePrice: number;
  options: Record<
    string,
    {
      label: string;
      price: number;
    }
  >;

  unitPrice: number;
  totalPrice: number;
};

