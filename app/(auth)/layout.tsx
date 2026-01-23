import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Form Section */}
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-linear-to-br from-gray-50 to-white">
        {/* Logo - Mobile */}
        <div className="lg:hidden flex justify-center gap-2 md:justify-start">
          <Link href="/" className="transition-transform hover:scale-105">
            <Image
              width={100}
              height={100}
              alt="eddysylva logo"
              src="/assets/esk-logo.png"
              className="size-14 sm:size-16"
              priority
            />
          </Link>
        </div>

        {/* Logo - Desktop */}
        <div className="hidden lg:block">
          <Link href="/" className="transition-transform hover:scale-105 inline-block">
            <Image
              width={100}
              height={100}
              alt="eddysylva logo"
              src="/assets/esk-logo.png"
              className="size-16"
              priority
            />
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8">
              {children}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>
            © 2024 EddySylva Kitchen. All rights reserved.
          </p>
        </div>
      </div>

      {/* Image Section */}
      <div className="relative hidden lg:block bg-gray-900">
        <Image
          width={1024}
          height={1024}
          src="/assets/mockup.jpg"
          alt="Delicious food from EddySylva Kitchen"
          className="absolute inset-0 h-full w-full object-cover"
          priority
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/30 to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
          <h2 className="text-3xl font-bold font-playfair mb-3">
            Authentic African Cuisine
          </h2>
          <p className="text-lg text-gray-200 max-w-md">
            Experience the rich flavors and traditions of African cooking, 
            delivered fresh to your door.
          </p>
        </div>
      </div>
    </div>
  );
}