import OrdersList from "@/components/orders/OrdersList";

export default function OrdersPage() {
  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-5 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-playfair mb-2">
            My Orders
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Track and manage your orders
          </p>
        </div>

        {/* Orders List */}
        <OrdersList />
      </div>
    </main>
  );
}