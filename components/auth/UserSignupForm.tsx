import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Mail, Lock, User } from "lucide-react";

export default function UserSignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
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

        {/* Email Field */}
        <Field>
          <FieldLabel htmlFor="email" className="text-base font-semibold">
            Email
          </FieldLabel>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="pl-10 bg-gray-50 border-gray-300 focus:bg-white"
              required
            />
          </div>
        </Field>

        {/* Username Field */}
        <Field>
          <FieldLabel htmlFor="username" className="text-base font-semibold">
            Username
          </FieldLabel>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              className="pl-10 bg-gray-50 border-gray-300 focus:bg-white"
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
              type="password"
              placeholder="Create a strong password"
              className="pl-10 bg-gray-50 border-gray-300 focus:bg-white"
              required
            />
          </div>
          <FieldDescription className="text-gray-500 text-sm">
            Must be at least 8 characters long
          </FieldDescription>
        </Field>

        {/* Confirm Password Field */}
        <Field>
          <FieldLabel
            htmlFor="confirm-password"
            className="text-base font-semibold"
          >
            Confirm Password
          </FieldLabel>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm your password"
              className="pl-10 bg-gray-50 border-gray-300 focus:bg-white"
              required
            />
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
          >
            Create account
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
          >
            <Link href="/signin">Sign in instead</Link>
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
