import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/profile/ProfileForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signin?redirect=/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, default_address")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/signin");
  }

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-5 py-6 sm:py-10 max-w-2xl">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-4"
          >
            <ChevronLeft className="size-4" />
            Back to menu
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold font-playfair text-gray-900">
            My Profile
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Update your personal details and delivery address.
          </p>
        </div>

        <ProfileForm profile={profile} />
      </div>
    </main>
  );
}
