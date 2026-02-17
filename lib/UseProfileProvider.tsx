"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { UserProfile, UserRole } from "@/components/auth/types/auth";

interface UserProfileContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refetch: () => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(
  undefined,
);

export function UserProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

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
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    }
  };

  const refetch = () => {
    if (user) {
      fetchProfile(user.id);
    }
  };

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null);
      if (user) {
        fetchProfile(user.id).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserProfileContext.Provider value={{ user, profile, loading, refetch }}>
      {children}
    </UserProfileContext.Provider>
  );
}

// Hook to use the user profile context
export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }
  return context;
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

  // Super admin (permissions === null) has all permissions
  const isSuperAdmin = profile?.permissions === null;

  const hasPermission =
    profile?.role === "admin" &&
    (isSuperAdmin || profile.permissions?.includes(permission) || false);

  return {
    hasPermission,
    isSuperAdmin,
    loading,
  };
}
