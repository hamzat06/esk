import AdminLoading from "@/components/admin/AdminLoading";
import AdminSidebar from "@/components/admin/AdminSidebar";
import SoundUnlockBanner from "@/components/admin/SoundUnlockBanner";
import { Suspense } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SoundUnlockBanner />
      <Suspense fallback={<div />}>
        <AdminSidebar />
      </Suspense>
      <main className="flex-1 lg:ml-64 pt-14 sm:pt-0 min-w-0 overflow-hidden">
        <Suspense fallback={<AdminLoading />}>{children}</Suspense>
      </main>
    </div>
  );
}
