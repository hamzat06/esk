/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  DollarSign,
  Utensils,
  Loader2,
} from "lucide-react";

interface CateringBookingFormProps {
  onSuccess?: () => void;
}

export default function CateringBookingForm({
  onSuccess,
}: CateringBookingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    event_type: "",
    event_date: "",
    event_time: "",
    guest_count: "",
    venue_address: "",
    service_type: "",
    menu_preferences: "",
    budget_range: "",
    special_requests: "",
    heard_from: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get current user (if logged in)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Insert booking
      const { error } = await supabase.from("catering_bookings").insert({
        user_id: user?.id || null,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        event_type: formData.event_type,
        event_date: formData.event_date,
        event_time: formData.event_time || null,
        guest_count: parseInt(formData.guest_count),
        venue_address: formData.venue_address,
        service_type: formData.service_type,
        menu_preferences: formData.menu_preferences || null,
        budget_range: formData.budget_range || null,
        special_requests: formData.special_requests || null,
        heard_from: formData.heard_from || null,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Booking request submitted! We'll contact you soon.");

      if (onSuccess) {
        onSuccess();
      } else {
        // Reset form
        setFormData({
          full_name: "",
          email: "",
          phone: "",
          event_type: "",
          event_date: "",
          event_time: "",
          guest_count: "",
          venue_address: "",
          service_type: "",
          menu_preferences: "",
          budget_range: "",
          special_requests: "",
          heard_from: "",
        });
      }
    } catch (error: any) {
      console.error("Booking error:", error);
      toast.error(error.message || "Failed to submit booking");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold font-playfair">
          Contact Information
        </h3>

        <div>
          <label
            htmlFor="full_name"
            className="text-sm font-medium mb-1.5 block"
          >
            Full Name *
          </label>
          <Input
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
            placeholder="John Doe"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="text-sm font-medium mb-1.5 block">
              Email *
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="text-sm font-medium mb-1.5 block">
              Phone Number *
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold font-playfair">Event Details</h3>

        <div>
          <label
            htmlFor="event_type"
            className="text-sm font-medium mb-1.5 block"
          >
            Event Type *
          </label>
          <Select
            value={formData.event_type}
            onValueChange={(value) => handleSelectChange("event_type", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wedding">Wedding</SelectItem>
              <SelectItem value="corporate">Corporate Event</SelectItem>
              <SelectItem value="birthday">Birthday Party</SelectItem>
              <SelectItem value="anniversary">Anniversary</SelectItem>
              <SelectItem value="graduation">Graduation</SelectItem>
              <SelectItem value="religious">Religious Ceremony</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="event_date"
              className="text-sm font-medium mb-1.5 block"
            >
              <Calendar className="size-4 inline mr-1" />
              Event Date *
            </label>
            <Input
              id="event_date"
              name="event_date"
              type="date"
              value={formData.event_date}
              onChange={handleChange}
              required
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div>
            <label
              htmlFor="event_time"
              className="text-sm font-medium mb-1.5 block"
            >
              <Clock className="size-4 inline mr-1" />
              Event Time (Optional)
            </label>
            <Input
              id="event_time"
              name="event_time"
              type="time"
              value={formData.event_time}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="guest_count"
            className="text-sm font-medium mb-1.5 block"
          >
            <Users className="size-4 inline mr-1" />
            Number of Guests *
          </label>
          <Input
            id="guest_count"
            name="guest_count"
            type="number"
            value={formData.guest_count}
            onChange={handleChange}
            required
            min="1"
            placeholder="50"
          />
        </div>

        <div>
          <label
            htmlFor="venue_address"
            className="text-sm font-medium mb-1.5 block"
          >
            <MapPin className="size-4 inline mr-1" />
            Venue Address *
          </label>
          <Textarea
            id="venue_address"
            name="venue_address"
            value={formData.venue_address}
            onChange={handleChange}
            required
            placeholder="123 Main St, Philadelphia, PA 19139"
            rows={2}
          />
        </div>
      </div>

      {/* Service Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold font-playfair">
          Service Preferences
        </h3>

        <div>
          <label
            htmlFor="service_type"
            className="text-sm font-medium mb-1.5 block"
          >
            <Utensils className="size-4 inline mr-1" />
            Service Type *
          </label>
          <Select
            value={formData.service_type}
            onValueChange={(value) => handleSelectChange("service_type", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select service type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full_service">
                Full Service (Staff + Setup)
              </SelectItem>
              <SelectItem value="buffet">Buffet Style</SelectItem>
              <SelectItem value="plated">Plated Service</SelectItem>
              <SelectItem value="drop_off">Drop-off Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label
            htmlFor="budget_range"
            className="text-sm font-medium mb-1.5 block"
          >
            <DollarSign className="size-4 inline mr-1" />
            Budget Range (Optional)
          </label>
          <Select
            value={formData.budget_range}
            onValueChange={(value) => handleSelectChange("budget_range", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select budget range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under_1000">Under $1,000</SelectItem>
              <SelectItem value="1000_2500">$1,000 - $2,500</SelectItem>
              <SelectItem value="2500_5000">$2,500 - $5,000</SelectItem>
              <SelectItem value="5000_10000">$5,000 - $10,000</SelectItem>
              <SelectItem value="over_10000">Over $10,000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label
            htmlFor="menu_preferences"
            className="text-sm font-medium mb-1.5 block"
          >
            Menu Preferences (Optional)
          </label>
          <Textarea
            id="menu_preferences"
            name="menu_preferences"
            value={formData.menu_preferences}
            onChange={handleChange}
            placeholder="e.g., Jollof rice, grilled chicken, vegetarian options, no pork..."
            rows={3}
          />
        </div>

        <div>
          <label
            htmlFor="special_requests"
            className="text-sm font-medium mb-1.5 block"
          >
            Special Requests (Optional)
          </label>
          <Textarea
            id="special_requests"
            name="special_requests"
            value={formData.special_requests}
            onChange={handleChange}
            placeholder="Any dietary restrictions, setup requirements, or special accommodations..."
            rows={3}
          />
        </div>

        <div>
          <label
            htmlFor="heard_from"
            className="text-sm font-medium mb-1.5 block"
          >
            How did you hear about us? (Optional)
          </label>
          <Select
            value={formData.heard_from}
            onValueChange={(value) => handleSelectChange("heard_from", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select one" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="google">Google Search</SelectItem>
              <SelectItem value="social_media">Social Media</SelectItem>
              <SelectItem value="friend">Friend/Family Referral</SelectItem>
              <SelectItem value="previous_customer">
                Previous Customer
              </SelectItem>
              <SelectItem value="event_planner">Event Planner</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            "Submit Booking Request"
          )}
        </Button>
        <p className="text-xs text-gray-500 text-center mt-3">
          We&apos;ll review your request and contact you within 24 hours with a
          custom quote.
        </p>
      </div>
    </form>
  );
}
