"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { registerSchema, type ActionResult } from "@/lib/validation/auth";

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    display_name: formData.get("display_name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.display_name },
    },
  });

  if (error) return { error: error.message };
  
  if (!data.session) {
    return { success: "Check your email to confirm your account, then sign in." };
  }

  // Redirect to original destination, or homepage
  const redirectTo = (formData.get("redirectTo") as string) || "/";
  redirect(redirectTo);
}