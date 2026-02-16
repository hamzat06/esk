/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast.success("Password reset email sent!");
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="size-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="size-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold font-playfair">Check Your Email</h1>
          <p className="text-gray-600">
            We&apos;ve sent a password reset link to
          </p>
          <p className="font-semibold text-primary">{email}</p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Next steps:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
              <li>Check your email inbox</li>
              <li>Click the reset password link</li>
              <li>Create your new password</li>
            </ul>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <button
              onClick={() => {
                setEmailSent(false);
                handleSubmit(new Event("submit") as any);
              }}
              className="text-primary hover:underline"
            >
              try again
            </button>
          </p>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/signin")}
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold font-playfair">Forgot Password?</h1>
        <p className="text-gray-600">
          No worries! Enter your email and we&apos;ll send you reset
          instructions.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="text-sm font-medium mb-1.5 block">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="pl-10"
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>

      {/* Back to Sign In */}
      <div className="text-center">
        <Link
          href="/signin"
          className="text-sm text-gray-600 hover:text-primary transition-colors inline-flex items-center gap-1"
        >
          <ArrowLeft className="size-4" />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
