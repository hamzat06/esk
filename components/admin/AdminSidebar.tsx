"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  Menu,
  LogOut,
  FolderKanban,
  Users,
  BarChart3,
  Shield,
  PartyPopper,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import { useUserProfile } from "@/lib/UseProfileProvider";

// Map navigation items to required permissions
const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    permission: null,
  }, // All admins
  {
    name: "Categories",
    href: "/admin/categories",
    icon: FolderKanban,
    permission: "categories",
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: Package,
    permission: "products",
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
    permission: "orders",
  },
  {
    name: "Catering",
    href: "/admin/catering",
    icon: PartyPopper,
    permission: "catering",
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: Users,
    permission: "customers",
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    permission: "analytics",
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    permission: "settings",
  },
];

const superAdminNav = {
  name: "Admins",
  href: "/admin/admins",
  icon: Shield,
  permission: "super_admin_only",
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPermissionError, setShowPermissionError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { profile, loading } = useUserProfile();

  // Check for permission errors in URL
  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "permission-denied") {
      setErrorMessage("You don't have permission to access that page");
      setShowPermissionError(true);
      setTimeout(() => setShowPermissionError(false), 5000);
    } else if (error === "super-admin-required") {
      setErrorMessage("Only super administrators can access that page");
      setShowPermissionError(true);
      setTimeout(() => setShowPermissionError(false), 5000);
    }
  }, [searchParams]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  // Check if user is super admin (permissions === null)
  const isSuperAdmin = profile?.permissions === null;

  // Check if user has a specific permission
  const hasPermission = (permission: string | null): boolean => {
    if (!permission) return true; // No permission required (like dashboard)
    if (isSuperAdmin) return true; // Super admins have all permissions
    if (permission === "super_admin_only") return isSuperAdmin; // Only super admins
    return profile?.permissions?.includes(permission) || false;
  };

  // Filter navigation based on permissions
  const filteredNavigation = navigation.filter((item) =>
    hasPermission(item.permission),
  );

  // Add super admin nav if user is super admin
  const finalNavigation = isSuperAdmin
    ? [...filteredNavigation.slice(0, 7), superAdminNav, filteredNavigation[7]]
    : filteredNavigation;

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b bg-card">
        <Link href="/admin" className="block">
          <h1 className="text-2xl font-bold font-playfair text-primary">
            Admin Panel
          </h1>
        </Link>
      </div>

      {/* Permission Error Alert */}
      {showPermissionError && (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {loading ? (
          // Skeleton loader while loading
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 rounded-xl animate-pulse"
              >
                <div className="size-5 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded flex-1" />
              </div>
            ))}
          </>
        ) : (
          <>
            {finalNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => mobile && setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="size-5" />
                  <span className="font-semibold">{item.name}</span>
                </Link>
              );
            })}

            {/* Show message if admin has no permissions - ONLY after loading */}
            {profile &&
              profile.role === "admin" &&
              !isSuperAdmin &&
              (!profile.permissions || profile.permissions.length === 0) && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-800">
                    <AlertCircle className="size-3 inline mr-1" />
                    You have no permissions assigned yet. Contact a super admin.
                  </p>
                </div>
              )}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t space-y-3">
        {/* Admin Profile Info */}
        {profile && (
          <div className="space-y-2">
            {/* Admin Name & Email */}
            <div>
              <p className="font-semibold text-foreground truncate text-sm">
                {profile.fullName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {profile.email}
              </p>
            </div>

            {/* Admin Type Badge */}
            <div>
              {isSuperAdmin ? (
                <div className="flex items-center gap-1.5 text-xs text-amber-600">
                  <Shield className="size-3" />
                  <span className="font-semibold">Super Admin</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-blue-600">
                  <Shield className="size-3" />
                  <span className="font-semibold">
                    Admin{" "}
                    {profile.permissions && profile.permissions.length > 0
                      ? `(${profile.permissions.length} permissions)`
                      : "(No permissions)"}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="size-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold font-playfair text-primary">
          Admin Panel
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="size-6" />
        </Button>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent mobile />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-white border-r">
        <SidebarContent />
      </aside>

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-14" />
    </>
  );
}
