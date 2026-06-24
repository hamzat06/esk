"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/notifications/email";

export async function signUpAction(data: {
  email: string;
  password: string;
  fullName: string;
}) {
  const supabaseAdmin = createAdminClient();

  // Create user pre-confirmed so no email verification step
  const { data: created, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.fullName },
    });

  if (createError) {
    return { error: createError.message };
  }

  if (!created.user) {
    return { error: "Failed to create account" };
  }

  // Sign the user in immediately
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (signInError) {
    return { error: signInError.message };
  }

  // Fire and forget — don't block signup if email fails
  sendWelcomeEmail(data.fullName, data.email).catch(console.error);

  return { success: true };
}
