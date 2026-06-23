import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-md">
          <p className="text-8xl font-bold font-playfair text-primary mb-4">404</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
          <p className="text-gray-500 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <Button asChild size="lg" className="rounded-full shadow-md">
            <Link href="/">
              <ShoppingBag className="size-4 mr-2" />
              Back to menu
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
