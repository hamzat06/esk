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

export default function UserSigninForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-4 sm:gap-6 py-5 pb-10", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Sign in your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Fill in the form below to sign in to your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email" className="sm:text-lg">
            Email
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="Enter email"
            className="bg-gray-200 h-10 sm:h-12 placeholder:font-medium sm:text-lg!"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password" className="sm:text-lg">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            placeholder="Enter password"
            className="bg-gray-200 h-10 sm:h-12 placeholder:font-medium sm:text-lg!"
            required
          />
        </Field>
        <Field>
          <Button type="submit" className="h-10 sm:h-12 mt-5" size="lg">
            Sign in
          </Button>
        </Field>
        <Field>
          <FieldDescription className="px-6 text-center sm:text-lg">
            Don&apos;t have an account? <Link href="/signup">Sign up</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
