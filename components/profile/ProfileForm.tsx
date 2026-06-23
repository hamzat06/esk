"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { supabase } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Loader2, User, Mail, Phone, MapPin } from "lucide-react";

interface ProfileData {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  default_address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  } | null;
}

export default function ProfileForm({ profile }: { profile: ProfileData }) {
  const [isSaving, setIsSaving] = useState(false);
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [address, setAddress] = useState({
    street: profile.default_address?.street ?? "",
    city: profile.default_address?.city ?? "",
    state: profile.default_address?.state ?? "",
    zipCode: profile.default_address?.zipCode ?? "",
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          default_address: address.street.trim()
            ? {
                street: address.street.trim(),
                city: address.city.trim(),
                state: address.state.trim(),
                zipCode: address.zipCode.trim(),
              }
            : null,
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

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Personal Info */}
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
              <Input
                value={profile.email}
                className="pl-10 bg-gray-50 text-gray-500"
                disabled
              />
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

      {/* Default Address */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <MapPin className="size-5 text-gray-600" />
          <h2 className="text-lg font-bold text-gray-900">Default Delivery Address</h2>
        </div>
        <FieldGroup className="space-y-4">
          <Field>
            <FieldLabel className="font-semibold">Street Address</FieldLabel>
            <Input
              value={address.street}
              onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
              placeholder="123 Main St"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel className="font-semibold">City</FieldLabel>
              <Input
                value={address.city}
                onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                placeholder="Philadelphia"
              />
            </Field>
            <Field>
              <FieldLabel className="font-semibold">State</FieldLabel>
              <Input
                value={address.state}
                onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                placeholder="PA"
              />
            </Field>
          </div>
          <Field>
            <FieldLabel className="font-semibold">ZIP Code</FieldLabel>
            <Input
              value={address.zipCode}
              onChange={(e) => setAddress((a) => ({ ...a, zipCode: e.target.value }))}
              placeholder="19139"
              className="max-w-xs"
            />
          </Field>
        </FieldGroup>
      </div>

      <Button type="submit" size="lg" className="w-full rounded-xl shadow-md" disabled={isSaving}>
        {isSaving ? (
          <>
            <Loader2 className="size-4 animate-spin mr-2" />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
}
