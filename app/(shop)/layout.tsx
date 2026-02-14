import Banner from "@/components/Banner";
import HolidayBanner from "@/components/HolidayBanner";
import CateringServiceModal from "@/components/CateringServiceModal";
import Navbar from "@/components/Navbar";
import React from "react";

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <HolidayBanner />
      <Banner />
      <Navbar />
      <CateringServiceModal />
      {children}
    </div>
  );
}
