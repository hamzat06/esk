"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import {
  Eye,
  Mail,
  MapPin,
  Phone,
  Search,
  ShoppingBag,
  User,
  DollarSign,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle,
  Crown,
  Edit,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: "customer" | "admin";
  created_at: string;
  default_address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  } | null;
  order_count?: number;
  total_spent?: number;
}

interface CustomersManagerProps {
  initialCustomers: Customer[];
  promoteToAdmin: (
    customerId: string,
    role: "customer" | "admin",
    permissions: string[] | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) => Promise<{ success: boolean; data: any }>;
  updateCustomerDetails: (
    customerId: string,
    details: { full_name: string; email: string; phone: string | null },
  ) => Promise<{ success: boolean }>;
}

// Available permissions
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

export default function CustomersManager({
  initialCustomers,
  promoteToAdmin,
  updateCustomerDetails,
}: CustomersManagerProps) {
  const [customers, setCustomers] = useState<Customer[]>(
    initialCustomers.filter((c) => c.role === "customer"),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Promotion dialog state
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [customerToPromote, setCustomerToPromote] = useState<Customer | null>(
    null,
  );
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery);

    return matchesSearch;
  });

  const openPromoteDialog = (customer: Customer) => {
    setCustomerToPromote(customer);
    setSelectedPermissions([]);
    setIsSuperAdmin(false);
    setIsPromoteDialogOpen(true);
  };

  const closePromoteDialog = () => {
    setIsPromoteDialogOpen(false);
    setCustomerToPromote(null);
    setSelectedPermissions([]);
    setIsSuperAdmin(false);
  };

  const handlePermissionToggle = (permission: string) => {
    if (isSuperAdmin) return;

    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission],
    );
  };

  const handleConfirmPromote = async () => {
    const customer = customerToPromote;
    if (!customer) return;

    closePromoteDialog();
    setPromotingId(customer.id);

    try {
      // Determine permissions: null for super admin, selected array for normal admin
      const permissions = isSuperAdmin ? null : selectedPermissions;

      await promoteToAdmin(customer.id, "admin", permissions);

      // Remove from customers list
      setCustomers((prev) => prev.filter((c) => c.id !== customer.id));

      const permissionText = isSuperAdmin
        ? "as Super Admin with full access"
        : selectedPermissions.length > 0
          ? `with ${selectedPermissions.length} permission(s)`
          : "with no permissions yet";

      toast.success(
        `${customer.full_name} has been promoted to admin ${permissionText}!`,
      );
    } catch (error) {
      console.error("Error promoting customer:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to promote customer. Please try again.",
      );
    } finally {
      setPromotingId(null);
    }
  };

  const openEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditForm({
      full_name: customer.full_name,
      email: customer.email,
      phone: customer.phone || "",
    });
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingCustomer(null);
    setEditForm({ full_name: "", email: "", phone: "" });
  };

  const handleSaveEdit = async () => {
    if (!editingCustomer) return;

    setIsSaving(true);

    try {
      await updateCustomerDetails(editingCustomer.id, {
        full_name: editForm.full_name,
        email: editForm.email,
        phone: editForm.phone || null,
      });

      // Update local state
      setCustomers((prev) =>
        prev.map((customer) =>
          customer.id === editingCustomer.id
            ? { ...customer, ...editForm, phone: editForm.phone || null }
            : customer,
        ),
      );

      toast.success("Customer details updated successfully!");
      closeEditDialog();
    } catch (error) {
      console.error("Error updating customer:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update customer details",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-5 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold font-playfair mb-2">
          Customers
        </h1>
        <p className="text-gray-600">
          Manage customer profiles, edit details, and promote to admin
        </p>
      </div>

      {/* Info Banner */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Promote Customer to Admin</p>
              <p className="text-blue-800">
                You can promote any customer to admin and choose their
                permissions immediately. They&apos;ll keep their order history
                and gain access based on the permissions you grant.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                <User className="size-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Customers</p>
                <p className="text-2xl font-bold font-playfair">
                  {customers.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <ShoppingBag className="size-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold font-playfair">
                  {customers.reduce((sum, c) => sum + (c.order_count || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <DollarSign className="size-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold font-playfair">
                  $
                  {customers
                    .reduce((sum, c) => sum + (c.total_spent || 0), 0)
                    .toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers List */}
      {filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No customers found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredCustomers.map((customer) => (
            <Card
              key={customer.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Customer Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold font-playfair">
                          {customer.full_name}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {customer.role}
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
                        <span className="truncate">{customer.email}</span>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Phone className="size-3.5 text-gray-400" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Stats */}
                  <div>
                    <p className="text-sm text-gray-500">Activity</p>
                    <div className="mt-1">
                      <p className="text-lg font-bold text-primary">
                        {customer.order_count || 0} orders
                      </p>
                      {customer.total_spent !== undefined && (
                        <p className="text-sm text-gray-600">
                          ${Number(customer.total_spent).toFixed(2)} total
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-gray-500">
                      Joined{" "}
                      {format(new Date(customer.created_at), "MMM d, yyyy")}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <Eye className="size-4" />
                      View Details
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openEditDialog(customer)}
                    >
                      <Edit className="size-4" />
                      Edit Details
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => openPromoteDialog(customer)}
                      disabled={promotingId === customer.id}
                    >
                      {promotingId === customer.id ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Promoting...
                        </>
                      ) : (
                        <>
                          <Shield className="size-4" />
                          Promote to Admin
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Address Preview */}
                {customer.default_address && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-start gap-1.5 text-sm text-gray-600">
                      <MapPin className="size-3.5 mt-0.5 shrink-0" />
                      <span>
                        {customer.default_address.street &&
                          `${customer.default_address.street}, `}
                        {customer.default_address.city &&
                          `${customer.default_address.city}, `}
                        {customer.default_address.state}{" "}
                        {customer.default_address.zipCode}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <Dialog
          open={!!selectedCustomer}
          onOpenChange={() => setSelectedCustomer(null)}
        >
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-playfair flex items-center gap-3">
                <div className="size-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="size-6 text-primary" />
                </div>
                <div>
                  <div>{selectedCustomer.full_name}</div>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {selectedCustomer.role}
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
                    <span>{selectedCustomer.email}</span>
                  </div>
                  {selectedCustomer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="size-4 text-gray-400" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedCustomer.default_address && (
                <div>
                  <h3 className="font-semibold mb-2">Default Address</h3>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="size-4 mt-0.5 shrink-0" />
                    <div>
                      {selectedCustomer.default_address.street && (
                        <p>{selectedCustomer.default_address.street}</p>
                      )}
                      <p>
                        {selectedCustomer.default_address.city},{" "}
                        {selectedCustomer.default_address.state}{" "}
                        {selectedCustomer.default_address.zipCode}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Account Details</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-gray-500">Member since:</span>{" "}
                    {format(
                      new Date(selectedCustomer.created_at),
                      "MMMM d, yyyy",
                    )}
                  </p>
                  <p>
                    <span className="text-gray-500">Total orders:</span>{" "}
                    {selectedCustomer.order_count || 0}
                  </p>
                  {selectedCustomer.total_spent !== undefined && (
                    <p>
                      <span className="text-gray-500">Total spent:</span> $
                      {Number(selectedCustomer.total_spent).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  openEditDialog(selectedCustomer);
                  setSelectedCustomer(null);
                }}
              >
                <Edit className="size-4 mr-2" />
                Edit Details
              </Button>
              <Button
                onClick={() => {
                  openPromoteDialog(selectedCustomer);
                  setSelectedCustomer(null);
                }}
                disabled={promotingId === selectedCustomer.id}
              >
                {promotingId === selectedCustomer.id ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Promoting...
                  </>
                ) : (
                  <>
                    <Shield className="size-4 mr-2" />
                    Promote to Admin
                  </>
                )}
              </Button>
              <Button
                onClick={() => setSelectedCustomer(null)}
                variant="outline"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={closeEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="size-5 text-primary" />
              Edit Customer Details
            </DialogTitle>
            <DialogDescription>
              Update contact information for{" "}
              <span className="font-semibold text-foreground">
                {editingCustomer?.full_name}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={editForm.full_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, full_name: e.target.value })
                }
                placeholder="John Doe"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                placeholder="john@example.com"
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                ⚠️ Changing email will require the customer to verify the new
                address
              </p>
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
                placeholder="+1 (555) 000-0000"
                className="mt-1.5"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? (
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

      {/* Promote with Permissions Dialog - NOW USING REGULAR DIALOG */}
      <Dialog open={isPromoteDialogOpen} onOpenChange={closePromoteDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="size-5 text-primary" />
              Promote to Admin & Set Permissions
            </DialogTitle>
            <DialogDescription>
              Promote{" "}
              <span className="font-semibold text-foreground">
                {customerToPromote?.full_name}
              </span>{" "}
              to admin and choose their permissions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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
                    Make Super Administrator
                  </Label>
                  <p className="text-sm text-amber-800 mt-1">
                    Grant full access to all features. Super admins cannot have
                    restricted permissions.
                  </p>
                </div>
              </div>
            </div>

            {/* Individual Permissions */}
            {!isSuperAdmin && (
              <div>
                <p className="font-semibold text-sm mb-3">
                  Or select specific permissions:
                </p>
                <div className="space-y-2 max-h-64 overflow-y-scroll pr-2">
                  {AVAILABLE_PERMISSIONS.map((permission) => (
                    <div
                      key={permission.value}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <Checkbox
                        id={`perm-${permission.value}`}
                        checked={selectedPermissions.includes(permission.value)}
                        onCheckedChange={() =>
                          handlePermissionToggle(permission.value)
                        }
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={`perm-${permission.value}`}
                          className="font-medium cursor-pointer"
                        >
                          {permission.label}
                        </Label>
                        <p className="text-xs text-gray-600">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedPermissions.length === 0 && !isSuperAdmin && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-800">
                      ⚠️ No permissions selected - this admin will have no
                      access until permissions are granted
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Info Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-semibold text-blue-900 text-sm mb-2">
                They will:
              </p>
              <ul className="space-y-1.5 text-sm text-blue-800">
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-blue-600 shrink-0" />
                  Keep all their order history
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-blue-600 shrink-0" />
                  Gain access to admin dashboard
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="size-4 text-blue-600 shrink-0" />
                  {isSuperAdmin
                    ? "Have full access to all features"
                    : selectedPermissions.length > 0
                      ? `Have access to: ${selectedPermissions.join(", ")}`
                      : "Have no permissions (can be granted later)"}
                </li>
              </ul>
            </div>

            <p className="text-xs text-muted-foreground">
              Permissions can be changed later from the Admins page.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closePromoteDialog}>
              Cancel
            </Button>
            <Button onClick={handleConfirmPromote}>
              <Shield className="size-4 mr-2" />
              Yes, Promote to Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
