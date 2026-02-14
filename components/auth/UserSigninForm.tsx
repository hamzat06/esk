"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { Mail, Lock, Loader2 } from "lucide-react";

export default function UserSigninForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      if (!data.session) {
        throw new Error("Failed to create session");
      }

      // Success! Redirect to home
      router.push("/");
      router.refresh();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Sign in error:", err);
      
      // User-friendly error messages
      if (err.message?.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please try again.");
      } else if (err.message?.includes("Email not confirmed")) {
        setError("Please confirm your email address before signing in.");
      } else {
        setError(err.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center mb-2">
          <h1 className="text-2xl sm:text-3xl font-bold font-playfair">
            Welcome back
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Sign in to your account to continue
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Email Field */}
        <Field>
          <FieldLabel htmlFor="email" className="text-base font-semibold">
            Email
          </FieldLabel>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              className="pl-10 bg-gray-50 border-gray-300 focus:bg-white"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>
        </Field>

        {/* Password Field */}
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password" className="text-base font-semibold">
              Password
            </FieldLabel>
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              className="pl-10 bg-gray-50 border-gray-300 focus:bg-white"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>
        </Field>

        {/* Submit Button */}
        <Field className="mt-2">
          <Button
            type="submit"
            size="lg"
            className="w-full shadow-md hover:shadow-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </Field>

        {/* Divider */}
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-500 font-medium">
              New to EddySylva Kitchen?
            </span>
          </div>
        </div>

        {/* Sign Up Link */}
        <Field>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            asChild
            disabled={isLoading}
          >
            <Link href="/signup">Create an account</Link>
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}