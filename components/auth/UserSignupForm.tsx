"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signUpAction } from "@/app/actions/auth";
import Link from "next/link";
import { Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
// import GoogleButton from "./GoogleButton";

export default function UserSignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    // Validation
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.fullName.trim()) {
      setError("Please enter your full name");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUpAction({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName.trim(),
      });

      if (result.error) throw new Error(result.error);

      // Success — signed in immediately, no email verification needed
      router.push("/");
      router.refresh();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to create account. Please try again.");
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
            Create your account
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Join us to start ordering delicious meals
          </p>
        </div>

        {/* Google — uncomment once Google Cloud Console OAuth is configured
        <GoogleButton />
        */}

        {/* Divider — uncomment once Google OAuth is configured
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-500">or sign up with email</span>
          </div>
        </div>
        */}

        {/* Error Message */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Full Name Field */}
        <Field>
          <FieldLabel htmlFor="fullName" className="text-base font-semibold">
            Full Name
          </FieldLabel>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="John Doe"
              className="pl-10 bg-gray-50 border-gray-300 focus:bg-white"
              value={formData.fullName}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>
          <FieldDescription className="text-gray-500 text-sm">
            This will be used for delivery
          </FieldDescription>
        </Field>

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
          <FieldLabel htmlFor="password" className="text-base font-semibold">
            Password
          </FieldLabel>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              className="pl-10 pr-10 bg-gray-50 border-gray-300 focus:bg-white"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
          <FieldDescription className="text-gray-500 text-sm">
            Must be at least 8 characters long
          </FieldDescription>
        </Field>

        {/* Confirm Password Field */}
        <Field>
          <FieldLabel
            htmlFor="confirmPassword"
            className="text-base font-semibold"
          >
            Confirm Password
          </FieldLabel>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              className="pl-10 pr-10 bg-gray-50 border-gray-300 focus:bg-white"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
        </Field>

        {/* Terms */}
        <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
          <p className="text-xs text-gray-600 text-center leading-relaxed">
            By creating an account, you agree to our{" "}
            <Link
              href="/terms"
              className="text-primary hover:underline font-medium"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-primary hover:underline font-medium"
            >
              Privacy Policy
            </Link>
          </p>
        </div>

        {/* Submit Button */}
        <Field>
          <Button
            type="submit"
            size="lg"
            className="w-full shadow-md hover:shadow-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
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
              Already have an account?
            </span>
          </div>
        </div>

        {/* Sign In Link */}
        <Field>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            asChild
            disabled={isLoading}
          >
            <Link href="/signin">Sign in instead</Link>
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}