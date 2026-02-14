"use client";

import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { UserProfile, UserRole } from "@/components/auth/types/auth";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user (validated server-side)
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

// Hook to get user profile with role
export function useUserProfile() {
  const { user, loading: userLoading } = useUser();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile(null);
      setLoading(false);
      return;
    }

    // Fetch user profile
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching profile:", error);
          setProfile(null);
        } else {
          setProfile({
            id: data.id,
            fullName: data.full_name,
            email: data.email,
            phone: data.phone,
            role: data.role as UserRole,
            defaultAddress: data.default_address,
            permissions: data.permissions,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          });
        }
        setLoading(false);
      });
  }, [user]);

  return { user, profile, loading: userLoading || loading };
}

// Hook to check if current user is admin
export function useIsAdmin() {
  const { profile, loading } = useUserProfile();

  return {
    isAdmin: profile?.role === "admin",
    loading,
  };
}

// Hook to check if user has specific permission
export function useHasPermission(permission: string) {
  const { profile, loading } = useUserProfile();

  const hasPermission =
    profile?.role === "admin" &&
    (profile.permissions?.includes(permission) ?? false);

  return {
    hasPermission,
    loading,
  };
}
