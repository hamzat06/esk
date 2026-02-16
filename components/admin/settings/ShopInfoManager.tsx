"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import {
  Store,
  Loader2,
  MapPin,
  Clock,
  DollarSign,
  Phone,
} from "lucide-react";

export type ShopInfo = {
  name: string;
  cuisine: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  deliveryFee: number;
  minimumOrder: number;
  description?: string;
};

type ShopInfoManagerProps = {
  initialInfo: ShopInfo;
  updateShopInfo: (info: ShopInfo) => Promise<{ success: boolean }>;
};

export default function ShopInfoManager({
  initialInfo,
  updateShopInfo,
}: ShopInfoManagerProps) {
  const [shopInfo, setShopInfo] = useState<ShopInfo>(initialInfo);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setShopInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (name: keyof ShopInfo, value: string) => {
    const numValue = parseFloat(value) || 0;
    setShopInfo((prev) => ({ ...prev, [name]: numValue }));
  };

  const handleSave = async () => {
    // Validation
    if (!shopInfo.name.trim()) {
      toast.error("Shop name is required");
      return;
    }

    if (!shopInfo.address.trim()) {
      toast.error("Address is required");
      return;
    }

    if (shopInfo.deliveryTimeMin >= shopInfo.deliveryTimeMax) {
      toast.error("Minimum delivery time must be less than maximum");
      return;
    }

    if (shopInfo.deliveryFee < 0) {
      toast.error("Delivery fee cannot be negative");
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateShopInfo(shopInfo);

      if (result.success) {
        toast.success("Shop information updated successfully!");
      } else {
        toast.error("Failed to update shop information");
      }
    } catch (error) {
      console.error("Error updating shop info:", error);
      toast.error("An error occurred while updating");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="size-5 text-primary" />
          Shop Information
        </CardTitle>
        <p className="text-sm text-gray-600">
          Manage your business details, delivery settings, and contact
          information
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Store className="size-4" />
            Basic Information
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Shop Name *</Label>
              <Input
                id="name"
                name="name"
                value={shopInfo.name}
                onChange={handleInputChange}
                placeholder="EddySylva Kitchen"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="cuisine">Cuisine Type *</Label>
              <Input
                id="cuisine"
                name="cuisine"
                value={shopInfo.cuisine}
                onChange={handleInputChange}
                placeholder="African Cuisine"
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              value={shopInfo.description || ""}
              onChange={handleInputChange}
              placeholder="Brief description of your restaurant..."
              className="mt-1.5"
              rows={3}
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <MapPin className="size-4" />
            Location
          </h3>

          <div>
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              name="address"
              value={shopInfo.address}
              onChange={handleInputChange}
              placeholder="255 South 60th Street"
              className="mt-1.5"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                name="city"
                value={shopInfo.city}
                onChange={handleInputChange}
                placeholder="Philadelphia"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                name="state"
                value={shopInfo.state}
                onChange={handleInputChange}
                placeholder="PA"
                className="mt-1.5"
                maxLength={2}
              />
            </div>

            <div>
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                name="zipCode"
                value={shopInfo.zipCode}
                onChange={handleInputChange}
                placeholder="19139"
                className="mt-1.5"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Phone className="size-4" />
            Contact Information
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={shopInfo.phone}
                onChange={handleInputChange}
                placeholder="+1 (555) 000-0000"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={shopInfo.email}
                onChange={handleInputChange}
                placeholder="contact@eddysylvakitchen.com"
                className="mt-1.5"
              />
            </div>
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Clock className="size-4" />
            Delivery Settings
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="deliveryTimeMin">
                Minimum Delivery Time (minutes) *
              </Label>
              <Input
                id="deliveryTimeMin"
                name="deliveryTimeMin"
                type="number"
                min="0"
                value={shopInfo.deliveryTimeMin}
                onChange={(e) =>
                  handleNumberChange("deliveryTimeMin", e.target.value)
                }
                placeholder="30"
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Fastest estimated delivery time
              </p>
            </div>

            <div>
              <Label htmlFor="deliveryTimeMax">
                Maximum Delivery Time (minutes) *
              </Label>
              <Input
                id="deliveryTimeMax"
                name="deliveryTimeMax"
                type="number"
                min="0"
                value={shopInfo.deliveryTimeMax}
                onChange={(e) =>
                  handleNumberChange("deliveryTimeMax", e.target.value)
                }
                placeholder="45"
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Longest estimated delivery time
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              <strong>Preview:</strong> Delivery time will show as{" "}
              <span className="font-semibold">
                {shopInfo.deliveryTimeMin}-{shopInfo.deliveryTimeMax} min
              </span>
            </p>
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <DollarSign className="size-4" />
            Pricing
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="deliveryFee">Delivery Fee ($) *</Label>
              <Input
                id="deliveryFee"
                name="deliveryFee"
                type="number"
                min="0"
                step="0.01"
                value={shopInfo.deliveryFee}
                onChange={(e) =>
                  handleNumberChange("deliveryFee", e.target.value)
                }
                placeholder="2.99"
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Standard delivery charge
              </p>
            </div>

            <div>
              <Label htmlFor="minimumOrder">Minimum Order ($) *</Label>
              <Input
                id="minimumOrder"
                name="minimumOrder"
                type="number"
                min="0"
                step="0.01"
                value={shopInfo.minimumOrder}
                onChange={(e) =>
                  handleNumberChange("minimumOrder", e.target.value)
                }
                placeholder="10.00"
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum order value for delivery
              </p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-900">
              <strong>Preview:</strong> Delivery fee will show as{" "}
              <span className="font-semibold">
                ${shopInfo.deliveryFee.toFixed(2)} delivery
              </span>
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Store className="size-4 mr-2" />
                Save Shop Information
              </>
            )}
          </Button>
        </div>

        {/* Preview Card */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase">
            Preview - How customers will see it:
          </p>
          <div>
            <h2 className="text-3xl font-bold font-playfair mb-2">
              {shopInfo.name || "Your Shop Name"}
            </h2>
            <div className="flex items-center gap-2 text-gray-600 mb-4">
              <MapPin className="size-4" />
              <span>
                {shopInfo.city || "City"} • {shopInfo.address || "Address"},{" "}
                {shopInfo.state || "ST"} {shopInfo.zipCode || "00000"}
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 bg-white rounded-full border border-gray-200 text-sm">
                {shopInfo.cuisine || "Cuisine Type"}
              </span>
              <span className="px-4 py-2 bg-white rounded-full border border-gray-200 text-sm">
                {shopInfo.deliveryTimeMin}-{shopInfo.deliveryTimeMax} min
              </span>
              <span className="px-4 py-2 bg-white rounded-full border border-gray-200 text-sm">
                ${shopInfo.deliveryFee.toFixed(2)} delivery
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
