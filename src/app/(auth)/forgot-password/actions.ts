"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export async function forgotPasswordAction(formData: FormData) {
  const parsed = forgotSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  });

  if (error) return { error: error.message };

  return { success: "Password reset link sent! Check your email." };
}