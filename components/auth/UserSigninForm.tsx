import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";

export default function UserSigninForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
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
              type="password"
              placeholder="Enter your password"
              className="pl-10 bg-gray-50 border-gray-300 focus:bg-white"
              required
            />
          </div>
        </Field>

        {/* Submit Button */}
        <Field className="mt-2">
          <Button type="submit" size="lg" className="w-full shadow-md hover:shadow-lg">
            Sign in
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
          >
            <Link href="/signup">
              Create an account
            </Link>
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}