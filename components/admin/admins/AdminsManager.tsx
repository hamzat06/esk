"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import {
  Eye,
  Mail,
  Phone,
  Search,
  Shield,
  User,
  Settings,
  Loader2,
  CheckCircle,
  XCircle,
  Crown,
  Lock,
  Unlock,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Admin {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: "admin";
  created_at: string;
  permissions: string[] | null;
}

interface AdminsManagerProps {
  initialAdmins: Admin[];
  currentUserId: string;
  updatePermissions: (
    adminId: string,
    permissions: string[] | null,
  ) => Promise<{ success: boolean }>;
  demoteToCustomer: (adminId: string) => Promise<{ success: boolean }>;
}

// Available permissions in the system
const AVAILABLE_PERMISSIONS = [
  {
    value: "products",
    label: "Products",
    description: "Manage products and inventory",
  },
  { value: "orders", label: "Orders", description: "View and manage orders" },
  {
    value: "customers",
    label: "Customers",
    description: "View customer information",
  },
  {
    value: "categories",
    label: "Categories",
    description: "Manage product categories",
  },
  {
    value: "catering",
    label: "Catering",
    description: "Manage catering bookings",
  },
  { value: "settings", label: "Settings", description: "Manage shop settings" },
  {
    value: "analytics",
    label: "Analytics",
    description: "View analytics dashboard",
  },
];

export default function AdminsManager({
  initialAdmins,
  currentUserId,
  updatePermissions,
  demoteToCustomer,
}: AdminsManagerProps) {
  const [admins, setAdmins] = useState<Admin[]>(initialAdmins);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [isDemoteDialogOpen, setIsDemoteDialogOpen] = useState(false);
  const [adminToDemote, setAdminToDemote] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Permission editing state
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admin.phone?.includes(searchQuery);

    return matchesSearch;
  });

  const checkIsSuperAdmin = (admin: Admin) => {
    return admin.permissions === null;
  };

  const openPermissionDialog = (admin: Admin) => {
    setEditingAdmin(admin);
    const superAdmin = checkIsSuperAdmin(admin);
    setIsSuperAdmin(superAdmin);
    setSelectedPermissions(superAdmin ? [] : admin.permissions || []);
    setIsPermissionDialogOpen(true);
  };

  const closePermissionDialog = () => {
    setIsPermissionDialogOpen(false);
    setEditingAdmin(null);
    setSelectedPermissions([]);
    setIsSuperAdmin(false);
  };

  const handlePermissionToggle = (permission: string) => {
    if (isSuperAdmin) return; // Can't toggle individual permissions for super admin

    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission],
    );
  };

  const handleSavePermissions = async () => {
    if (!editingAdmin) return;

    setIsLoading(true);

    try {
      // If super admin, set permissions to null
      // Otherwise, use the selected permissions array
      const newPermissions = isSuperAdmin ? null : selectedPermissions;

      await updatePermissions(editingAdmin.id, newPermissions);

      // Update local state
      setAdmins((prev) =>
        prev.map((admin) =>
          admin.id === editingAdmin.id
            ? { ...admin, permissions: newPermissions }
            : admin,
        ),
      );

      toast.success("Permissions updated successfully!");
      closePermissionDialog();
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update permissions",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openDemoteDialog = (admin: Admin) => {
    setAdminToDemote(admin);
    setIsDemoteDialogOpen(true);
  };

  const closeDemoteDialog = () => {
    setIsDemoteDialogOpen(false);
    setAdminToDemote(null);
  };

  const handleDemoteToCustomer = async () => {
    if (!adminToDemote) return;

    closeDemoteDialog();
    setIsLoading(true);

    try {
      await demoteToCustomer(adminToDemote.id);

      // Remove from admins list
      setAdmins((prev) =>
        prev.filter((admin) => admin.id !== adminToDemote.id),
      );

      toast.success(`${adminToDemote.full_name} has been demoted to customer`);
    } catch (error) {
      console.error("Error demoting admin:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to demote admin",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-5 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold font-playfair mb-2">
          Administrators
        </h1>
        <p className="text-gray-600">
          Manage admin users, permissions, and access levels
        </p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Shield className="size-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Admins</p>
                <p className="text-2xl font-bold font-playfair">
                  {admins.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Crown className="size-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Super Admins</p>
                <p className="text-2xl font-bold font-playfair">
                  {admins.filter((a) => checkIsSuperAdmin(a)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <User className="size-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Limited Admins</p>
                <p className="text-2xl font-bold font-playfair">
                  {admins.filter((a) => !checkIsSuperAdmin(a)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admins List */}
      {filteredAdmins.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No administrators found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAdmins.map((admin) => {
            const isCurrentUser = admin.id === currentUserId;
            const superAdmin = checkIsSuperAdmin(admin);

            return (
              <Card
                key={admin.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Admin Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center">
                          {superAdmin ? (
                            <Crown className="size-5 text-amber-600" />
                          ) : (
                            <Shield className="size-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold font-playfair">
                              {admin.full_name}
                            </p>
                            {isCurrentUser && (
                              <Badge variant="default" className="text-xs">
                                You
                              </Badge>
                            )}
                          </div>
                          <Badge
                            variant={superAdmin ? "default" : "secondary"}
                            className="text-xs mt-1"
                          >
                            {superAdmin ? (
                              <span className="flex items-center gap-1">
                                <Crown className="size-3" />
                                Super Admin
                              </span>
                            ) : (
                              "Admin"
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Contact</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Mail className="size-3.5 text-gray-400" />
                          <span className="truncate">{admin.email}</span>
                        </div>
                        {admin.phone && (
                          <div className="flex items-center gap-1.5 text-sm">
                            <Phone className="size-3.5 text-gray-400" />
                            <span>{admin.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Permissions Preview */}
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Access Level</p>
                      {superAdmin ? (
                        <Badge variant="default" className="gap-1">
                          <Unlock className="size-3" />
                          Full Access
                        </Badge>
                      ) : admin.permissions && admin.permissions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {admin.permissions.slice(0, 2).map((perm, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs"
                            >
                              {perm}
                            </Badge>
                          ))}
                          {admin.permissions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{admin.permissions.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Lock className="size-3" />
                          No Permissions
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <p className="text-xs text-gray-500">
                        Added{" "}
                        {format(new Date(admin.created_at), "MMM d, yyyy")}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAdmin(admin)}
                      >
                        <Eye className="size-4" />
                        View Details
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => openPermissionDialog(admin)}
                        disabled={isCurrentUser} // Can't edit own permissions
                      >
                        <Settings className="size-4" />
                        Manage Permissions
                      </Button>
                      {!isCurrentUser && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDemoteDialog(admin)}
                        >
                          <XCircle className="size-4" />
                          Demote to Customer
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Admin Details Modal */}
      {selectedAdmin && (
        <Dialog
          open={!!selectedAdmin}
          onOpenChange={() => setSelectedAdmin(null)}
        >
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-playfair flex items-center gap-3">
                <div className="size-12 bg-primary/10 rounded-full flex items-center justify-center">
                  {checkIsSuperAdmin(selectedAdmin) ? (
                    <Crown className="size-6 text-amber-600" />
                  ) : (
                    <Shield className="size-6 text-primary" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div>{selectedAdmin.full_name}</div>
                    {selectedAdmin.id === currentUserId && (
                      <Badge variant="default" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <Badge
                    variant={
                      checkIsSuperAdmin(selectedAdmin) ? "default" : "secondary"
                    }
                    className="text-xs mt-1"
                  >
                    {checkIsSuperAdmin(selectedAdmin) ? (
                      <span className="flex items-center gap-1">
                        <Crown className="size-3" />
                        Super Admin
                      </span>
                    ) : (
                      "Admin"
                    )}
                  </Badge>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-gray-400" />
                    <span>{selectedAdmin.email}</span>
                  </div>
                  {selectedAdmin.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="size-4 text-gray-400" />
                      <span>{selectedAdmin.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Permissions</h3>
                {checkIsSuperAdmin(selectedAdmin) ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="size-5 text-amber-600" />
                      <span className="font-semibold text-amber-900">
                        Super Administrator
                      </span>
                    </div>
                    <p className="text-sm text-amber-800">
                      Has full access to all features and settings
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedAdmin.permissions &&
                    selectedAdmin.permissions.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedAdmin.permissions.map((permission, idx) => (
                          <Badge key={idx} variant="outline" className="gap-1">
                            <CheckCircle className="size-3 text-green-600" />
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Lock className="size-4 text-gray-500" />
                          <span className="font-semibold text-gray-700">
                            No Permissions Granted
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          This admin has no access to any features yet
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Account Details</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-gray-500">Added on:</span>{" "}
                    {format(new Date(selectedAdmin.created_at), "MMMM d, yyyy")}
                  </p>
                  <p>
                    <span className="text-gray-500">User ID:</span>{" "}
                    <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                      {selectedAdmin.id}
                    </code>
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setSelectedAdmin(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Permission Management Dialog */}
      <Dialog
        open={isPermissionDialogOpen}
        onOpenChange={closePermissionDialog}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="size-5 text-primary" />
              Manage Permissions
            </DialogTitle>
            <DialogDescription>
              Configure access level and permissions for{" "}
              <span className="font-semibold text-foreground">
                {editingAdmin?.full_name}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Super Admin Toggle */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="superAdmin"
                  checked={isSuperAdmin}
                  onCheckedChange={(checked) =>
                    setIsSuperAdmin(checked as boolean)
                  }
                />
                <div className="flex-1">
                  <Label
                    htmlFor="superAdmin"
                    className="font-semibold text-amber-900 flex items-center gap-2 cursor-pointer"
                  >
                    <Crown className="size-4" />
                    Super Administrator
                  </Label>
                  <p className="text-sm text-amber-800 mt-1">
                    Grant full access to all features and settings. Super admins
                    cannot have their permissions restricted.
                  </p>
                </div>
              </div>
            </div>

            {/* Individual Permissions */}
            {!isSuperAdmin && (
              <div>
                <h4 className="font-semibold mb-3">Select Permissions</h4>
                <div className="space-y-3">
                  {AVAILABLE_PERMISSIONS.map((permission) => (
                    <div
                      key={permission.value}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <Checkbox
                        id={permission.value}
                        checked={selectedPermissions.includes(permission.value)}
                        onCheckedChange={() =>
                          handlePermissionToggle(permission.value)
                        }
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={permission.value}
                          className="font-medium cursor-pointer"
                        >
                          {permission.label}
                        </Label>
                        <p className="text-sm text-gray-600">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedPermissions.length === 0 && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">
                      ⚠️ This admin will have no access if no permissions are
                      selected
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closePermissionDialog}>
              Cancel
            </Button>
            <Button onClick={handleSavePermissions} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Demote Confirmation Dialog */}
      <AlertDialog open={isDemoteDialogOpen} onOpenChange={closeDemoteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="size-5 text-destructive" />
              Demote to Customer
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-2">
              <p>
                Are you sure you want to demote{" "}
                <span className="font-semibold text-foreground">
                  {adminToDemote?.full_name}
                </span>{" "}
                back to customer?
              </p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-red-900 text-sm">This will:</p>
                <ul className="space-y-1.5 text-sm text-red-800">
                  <li className="flex items-center gap-2">
                    <XCircle className="size-4 text-red-600" />
                    Remove all admin permissions
                  </li>
                  <li className="flex items-center gap-2">
                    <XCircle className="size-4 text-red-600" />
                    Revoke access to admin dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="size-4 text-green-600" />
                    Keep their order history intact
                  </li>
                </ul>
              </div>

              <p className="text-xs text-muted-foreground">
                They can be promoted back to admin at any time from the
                Customers page.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDemoteToCustomer}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Demote to Customer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
