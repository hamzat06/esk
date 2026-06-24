"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Loader2, User, Mail, Phone, MapPin, Plus, Trash2, Star } from "lucide-react";

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  phone: string;
  is_default: boolean;
}

interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
}

export default function ProfileForm({
  profile,
  savedAddresses: initial,
}: {
  profile: ProfileData;
  savedAddresses: SavedAddress[];
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");

  const [addresses, setAddresses] = useState<SavedAddress[]>(initial);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "Home", address: "", phone: "" });
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.address.trim() || !newAddress.phone.trim()) {
      toast.error("Address and phone are required");
      return;
    }
    setIsAddingAddress(true);
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: newAddress.label,
          address: newAddress.address.trim(),
          phone: newAddress.phone.trim(),
          is_default: addresses.length === 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAddresses((prev) => [data, ...prev]);
      setNewAddress({ label: "Home", address: "", phone: "" });
      setShowAddForm(false);
      toast.success("Address saved!");
    } catch {
      toast.error("Failed to save address.");
    } finally {
      setIsAddingAddress(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success("Address removed.");
    } catch {
      toast.error("Failed to remove address.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    setSettingDefaultId(id);
    try {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_default: true }),
      });
      if (!res.ok) throw new Error();
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, is_default: a.id === id }))
      );
      toast.success("Default address updated.");
    } catch {
      toast.error("Failed to update default.");
    } finally {
      setSettingDefaultId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Personal Info */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Personal Information</h2>
          <FieldGroup className="space-y-4">
            <Field>
              <FieldLabel className="font-semibold">Full Name</FieldLabel>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="pl-10"
                  required
                />
              </div>
            </Field>

            <Field>
              <FieldLabel className="font-semibold">Email</FieldLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input value={profile.email} className="pl-10 bg-gray-50 text-gray-500" disabled />
              </div>
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
            </Field>

            <Field>
              <FieldLabel className="font-semibold">Phone Number</FieldLabel>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="pl-10"
                  type="tel"
                />
              </div>
            </Field>
          </FieldGroup>
        </div>

        <Button type="submit" size="lg" className="w-full rounded-xl shadow-md" disabled={isSaving}>
          {isSaving ? (
            <><Loader2 className="size-4 animate-spin mr-2" />Saving...</>
          ) : (
            "Save Profile"
          )}
        </Button>
      </form>

      {/* Saved Addresses */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <MapPin className="size-5 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900">Saved Addresses</h2>
          </div>
          {!showAddForm && (
            <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
              <Plus className="size-4 mr-1" />
              Add
            </Button>
          )}
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="mb-4 p-4 rounded-xl border-2 border-primary/30 bg-primary/5 space-y-3">
            <div className="flex gap-2">
              {["Home", "Work", "Other"].map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setNewAddress((a) => ({ ...a, label: l }))}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${
                    newAddress.label === l
                      ? "border-primary bg-primary text-white"
                      : "border-gray-300 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <Input
              placeholder="Full address (e.g. 255 South 60th Street, Philadelphia, PA 19139)"
              value={newAddress.address}
              onChange={(e) => setNewAddress((a) => ({ ...a, address: e.target.value }))}
            />
            <Input
              placeholder="Phone number"
              type="tel"
              value={newAddress.phone}
              onChange={(e) => setNewAddress((a) => ({ ...a, phone: e.target.value }))}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddAddress} disabled={isAddingAddress}>
                {isAddingAddress ? <Loader2 className="size-4 animate-spin" /> : "Save"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {addresses.length === 0 && !showAddForm ? (
          <p className="text-sm text-gray-500 text-center py-6">
            No saved addresses yet. Add one to speed up checkout.
          </p>
        ) : (
          <div className="space-y-3">
            {addresses.map((a) => (
              <div
                key={a.id}
                className={`flex items-start justify-between gap-3 p-4 rounded-xl border-2 transition-all ${
                  a.is_default ? "border-primary bg-primary/5" : "border-gray-200"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-gray-800">{a.label}</p>
                    {a.is_default && (
                      <span className="text-xs text-primary font-medium flex items-center gap-0.5">
                        <Star className="size-3 fill-primary" /> Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{a.address}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.phone}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!a.is_default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-gray-500"
                      onClick={() => handleSetDefault(a.id)}
                      disabled={settingDefaultId === a.id}
                    >
                      {settingDefaultId === a.id ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        "Set default"
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(a.id)}
                    disabled={deletingId === a.id}
                  >
                    {deletingId === a.id ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Trash2 className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
