export function calculateCartPricing(
  basePrice: number,
  selectedOptions: Record<string, { price: number }>,
  quantity: number,
) {
  const optionsTotal = Object.values(selectedOptions).reduce(
    (sum, opt) => sum + opt.price,
    0,
  );

  const unitPrice = basePrice + optionsTotal;
  const totalPrice = unitPrice * quantity;

  return { unitPrice, totalPrice };
}
