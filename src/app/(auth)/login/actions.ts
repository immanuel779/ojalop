"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, type ActionResult } from "@/lib/validation/auth";

export async function loginAction(formData: FormData): Promise<ActionResult> {
  try {
    const parsed = loginSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      return { error: error.message };
    }

    // If we reach here, login was successful. 
    // Redirect must be outside the try/catch block so it doesn't get caught as an error.
    const redirectTo = (formData.get("redirectTo") as string) || "/";
    redirect(redirectTo);

  } catch (err) {
    // If the redirect happens, Next.js throws a special error. We must let it pass.
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err;
    }
    
    // If it's a real error (like bad env keys), return a friendly message instead of crashing
    console.error("Login Crash:", err);
    return { error: "Server error. Please check your internet or contact support." };
  }
}