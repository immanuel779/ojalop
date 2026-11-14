"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const onboardingSchema = z.object({
  store_name: z.string().min(2, "Store name is required"),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase, alphanumeric, and can contain hyphens"),
  description: z.string().min(10, "Please provide a brief description"),
  location_state: z.string().min(2, "State is required"),
});

export async function createStoreAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to create a store." };
  }

  // FIX: Safely convert formData to strings
  const parsed = onboardingSchema.safeParse({
    store_name: formData.get("store_name")?.toString() || "",
    slug: formData.get("slug")?.toString() || "",
    description: formData.get("description")?.toString() || "",
    location_state: formData.get("location_state")?.toString() || "",
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // Check if user already has a store
  const { data: existingStore } = await supabase
    .from("stores")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (existingStore) {
    redirect("/seller/dashboard");
  }

  const { error: storeError } = await supabase.from("stores").insert({
    owner_id: user.id,
    name: parsed.data.store_name,
    slug: parsed.data.slug,
    description: parsed.data.description,
    location_state: parsed.data.location_state,
  });

  if (storeError) {
    if (storeError.code === '23505') return { error: "This store URL is already taken." };
    return { error: storeError.message };
  }

  await supabase.from("user_roles").insert({ user_id: user.id, role: "seller" });
  redirect("/seller/dashboard");
}