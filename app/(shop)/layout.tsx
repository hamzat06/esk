import Banner from "@/components/Banner";
import HolidayBanner from "@/components/HolidayBanner";
import CateringServiceModal from "@/components/CateringServiceModal";
import Navbar from "@/components/Navbar";
import React from "react";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import PageViewTracker from "@/components/analytics/PageViewerTracker";

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

      {/* Google Analytics (Optional - if you want Google Analytics too) */}
      {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
        <GoogleAnalytics
          GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
        />
      )}

      {/* Custom Page View Tracker */}
      <PageViewTracker />
    </div>
  );
}
