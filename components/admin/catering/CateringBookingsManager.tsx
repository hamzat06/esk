/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ContentTabs, { TabItem } from "@/components/ContentTabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase/client";
import { format } from "date-fns";
import {
  Eye,
  Search,
  PartyPopper,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  DollarSign,
} from "lucide-react";

interface CateringBooking {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  event_type: string;
  event_date: string;
  event_time: string | null;
  guest_count: number;
  venue_address: string;
  service_type: string;
  menu_preferences: string | null;
  budget_range: string | null;
  special_requests: string | null;
  heard_from: string | null;
  status: string;
  admin_notes: string | null;
  quote_amount: number | null;
  created_at: string;
  updated_at: string;
}

interface CateringBookingsManagerProps {
  initialBookings: CateringBooking[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewing: "bg-blue-100 text-blue-800",
  quoted: "bg-purple-100 text-purple-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  reviewing: FileText,
  quoted: DollarSign,
  confirmed: CheckCircle,
  completed: CheckCircle,
  cancelled: XCircle,
};

export default function CateringBookingsManager({
  initialBookings,
}: CateringBookingsManagerProps) {
  const [bookings, setBookings] = useState<CateringBooking[]>(initialBookings);
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedBooking, setSelectedBooking] =
    useState<CateringBooking | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Update form state
  const [updateForm, setUpdateForm] = useState({
    status: "",
    quote_amount: "",
    admin_notes: "",
  });

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("catering_bookings")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", bookingId);

      if (error) throw error;

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? { ...booking, status: newStatus }
            : booking,
        ),
      );
      toast.success("Status updated");
    } catch (error: any) {
      console.error("Status update error:", error);
      toast.error("Failed to update status");
    }
  };

  const handleUpdateBooking = async () => {
    if (!selectedBooking) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("catering_bookings")
        .update({
          status: updateForm.status || selectedBooking.status,
          quote_amount: updateForm.quote_amount
            ? parseFloat(updateForm.quote_amount)
            : selectedBooking.quote_amount,
          admin_notes: updateForm.admin_notes || selectedBooking.admin_notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedBooking.id);

      if (error) throw error;

      // Update local state
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === selectedBooking.id
            ? {
                ...booking,
                status: updateForm.status || booking.status,
                quote_amount: updateForm.quote_amount
                  ? parseFloat(updateForm.quote_amount)
                  : booking.quote_amount,
                admin_notes: updateForm.admin_notes || booking.admin_notes,
              }
            : booking,
        ),
      );

      toast.success("Booking updated");
      setSelectedBooking(null);
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error("Failed to update booking");
    } finally {
      setIsUpdating(false);
    }
  };

  // Calculate stats
  const statusStats = {
    pending: bookings.filter((b) => b.status === "pending").length,
    reviewing: bookings.filter((b) => b.status === "reviewing").length,
    quoted: bookings.filter((b) => b.status === "quoted").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const bookingTabs: TabItem[] = [
    { value: "all", label: `All (${bookings.length})` },
    { value: "pending", label: `Pending (${statusStats.pending})` },
    { value: "reviewing", label: `Reviewing (${statusStats.reviewing})` },
    { value: "quoted", label: `Quoted (${statusStats.quoted})` },
    { value: "confirmed", label: `Confirmed (${statusStats.confirmed})` },
    { value: "completed", label: `Completed (${statusStats.completed})` },
    { value: "cancelled", label: `Cancelled (${statusStats.cancelled})` },
  ];

  const filteredBookings = bookings.filter((booking) => {
    const matchesStatus =
      selectedTab === "all" || booking.status === selectedTab;
    const matchesSearch =
      searchQuery === "" ||
      booking.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.phone.includes(searchQuery);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 sm:px-5 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold font-playfair mb-2">
          Catering Bookings
        </h1>
        <p className="text-gray-600">Manage catering event requests</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <PartyPopper className="size-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="text-2xl font-bold font-playfair">
                  {bookings.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="size-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Review</p>
                <p className="text-2xl font-bold font-playfair">
                  {statusStats.pending}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="size-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Confirmed</p>
                <p className="text-2xl font-bold font-playfair">
                  {statusStats.confirmed}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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

      {/* Tabs */}
      <ContentTabs
        tabs={bookingTabs}
        value={selectedTab}
        onValueChange={setSelectedTab}
        wrapperClassName="mb-6"
      />

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <PartyPopper className="size-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No bookings found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredBookings.map((booking) => {
            const Icon = statusIcons[booking.status] || Clock;

            return (
              <Card
                key={booking.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Customer Info */}
                    <div>
                      <p className="text-sm text-gray-500">Customer</p>
                      <p className="font-semibold">{booking.full_name}</p>
                      <p className="text-xs text-gray-600">{booking.email}</p>
                      <p className="text-xs text-gray-600">{booking.phone}</p>
                    </div>

                    {/* Event Info */}
                    <div>
                      <p className="text-sm text-gray-500">Event</p>
                      <p className="font-semibold capitalize">
                        {booking.event_type.replace("_", " ")}
                      </p>
                      <p className="text-xs text-gray-600">
                        {format(new Date(booking.event_date), "MMM d, yyyy")}
                        {booking.event_time && ` at ${booking.event_time}`}
                      </p>
                      <p className="text-xs text-gray-600">
                        {booking.guest_count} guests
                      </p>
                    </div>

                    {/* Service Info */}
                    <div>
                      <p className="text-sm text-gray-500">Service</p>
                      <p className="font-semibold capitalize">
                        {booking.service_type.replace("_", " ")}
                      </p>
                      {booking.budget_range && (
                        <p className="text-xs text-gray-600">
                          Budget: {booking.budget_range}
                        </p>
                      )}
                      {booking.quote_amount && (
                        <p className="text-xs font-semibold text-primary">
                          Quote: ${booking.quote_amount}
                        </p>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col gap-2">
                      <Badge className={statusColors[booking.status]}>
                        <Icon className="size-3 mr-1" />
                        {booking.status}
                      </Badge>
                      <Select
                        value={booking.status}
                        onValueChange={(value) =>
                          handleStatusChange(booking.id, value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="reviewing">Reviewing</SelectItem>
                          <SelectItem value="quoted">Quoted</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setUpdateForm({
                            status: booking.status,
                            quote_amount:
                              booking.quote_amount?.toString() || "",
                            admin_notes: booking.admin_notes || "",
                          });
                        }}
                      >
                        <Eye className="size-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedBooking(null)}
        >
          <Card
            className="max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle className="font-playfair flex items-center justify-between">
                <span>Booking Details</span>
                <Badge className={statusColors[selectedBooking.status]}>
                  {selectedBooking.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer */}
              <div>
                <h3 className="font-semibold mb-2">Customer Information</h3>
                <div className="grid gap-2 text-sm">
                  <p>
                    <span className="text-gray-500">Name:</span>{" "}
                    {selectedBooking.full_name}
                  </p>
                  <p>
                    <span className="text-gray-500">Email:</span>{" "}
                    {selectedBooking.email}
                  </p>
                  <p>
                    <span className="text-gray-500">Phone:</span>{" "}
                    {selectedBooking.phone}
                  </p>
                </div>
              </div>

              {/* Event */}
              <div>
                <h3 className="font-semibold mb-2">Event Details</h3>
                <div className="grid gap-2 text-sm">
                  <p>
                    <span className="text-gray-500">Type:</span>{" "}
                    <span className="capitalize">
                      {selectedBooking.event_type.replace("_", " ")}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500">Date:</span>{" "}
                    {format(
                      new Date(selectedBooking.event_date),
                      "MMMM d, yyyy",
                    )}
                  </p>
                  {selectedBooking.event_time && (
                    <p>
                      <span className="text-gray-500">Time:</span>{" "}
                      {selectedBooking.event_time}
                    </p>
                  )}
                  <p>
                    <span className="text-gray-500">Guests:</span>{" "}
                    {selectedBooking.guest_count}
                  </p>
                  <p>
                    <span className="text-gray-500">Venue:</span>{" "}
                    {selectedBooking.venue_address}
                  </p>
                </div>
              </div>

              {/* Service */}
              <div>
                <h3 className="font-semibold mb-2">Service Details</h3>
                <div className="grid gap-2 text-sm">
                  <p>
                    <span className="text-gray-500">Type:</span>{" "}
                    <span className="capitalize">
                      {selectedBooking.service_type.replace("_", " ")}
                    </span>
                  </p>
                  {selectedBooking.budget_range && (
                    <p>
                      <span className="text-gray-500">Budget:</span>{" "}
                      {selectedBooking.budget_range}
                    </p>
                  )}
                  {selectedBooking.menu_preferences && (
                    <div>
                      <p className="text-gray-500">Menu Preferences:</p>
                      <p className="pl-4">{selectedBooking.menu_preferences}</p>
                    </div>
                  )}
                  {selectedBooking.special_requests && (
                    <div>
                      <p className="text-gray-500">Special Requests:</p>
                      <p className="pl-4">{selectedBooking.special_requests}</p>
                    </div>
                  )}
                  {selectedBooking.heard_from && (
                    <p>
                      <span className="text-gray-500">Heard from:</span>{" "}
                      {selectedBooking.heard_from}
                    </p>
                  )}
                </div>
              </div>

              {/* Admin Update */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Admin Update</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Status
                    </label>
                    <Select
                      value={updateForm.status}
                      onValueChange={(value) =>
                        setUpdateForm({ ...updateForm, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewing">Reviewing</SelectItem>
                        <SelectItem value="quoted">Quoted</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Quote Amount ($)
                    </label>
                    <Input
                      type="number"
                      value={updateForm.quote_amount}
                      onChange={(e) =>
                        setUpdateForm({
                          ...updateForm,
                          quote_amount: e.target.value,
                        })
                      }
                      placeholder="Enter quote amount"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">
                      Admin Notes
                    </label>
                    <Textarea
                      value={updateForm.admin_notes}
                      onChange={(e) =>
                        setUpdateForm({
                          ...updateForm,
                          admin_notes: e.target.value,
                        })
                      }
                      placeholder="Internal notes about this booking..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedBooking(null)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={handleUpdateBooking}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  {isUpdating ? "Updating..." : "Update Booking"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
