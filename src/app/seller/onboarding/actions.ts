"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const onboardingSchema = z.object({
  store_name: z.string().min(2, "Store name is required"),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase, numbers, and hyphens only (no spaces)"),
  description: z.string().min(10, "Please provide a brief description"),
  location_state: z.string().min(2, "State is required"),
});

export async function createStoreAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "You must be logged in to create a store." };

  const parsed = onboardingSchema.safeParse({
    store_name: formData.get("store_name"),
    slug: formData.get("slug").toString().toLowerCase().replace(/\s+/g, '-'), // Auto-fix spaces to hyphens
    description: formData.get("description"),
    location_state: formData.get("location_state"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // 1. Create the Store
  const { error: storeError } = await supabase.from("stores").insert({
    owner_id: user.id,
    name: parsed.data.store_name,
    slug: parsed.data.slug,
    description: parsed.data.description,
    location_state: parsed.data.location_state,
  });

  if (storeError) {
    // If the error is literally a duplicate slug
    if (storeError.code === '23505' && storeError.message.includes('slug')) {
      return { error: "This Store URL is already taken by another seller. Please try a different URL." };
    }
    // If the user already has a store
    if (storeError.code === '23505' && storeError.message.includes('owner_id')) {
      return { error: "You already own a store. Redirecting to your dashboard..." };
    }
    // Any other database error
    return { error: `Database error: ${storeError.message}` };
  }

  // 2. Upgrade the user to 'seller'
  const { error: roleError } = await supabase.from("user_roles").insert({ 
    user_id: user.id, 
    role: "seller" 
  });
  
  // If they were already a seller, ignore the duplicate error
  if (roleError && roleError.code !== '23505') {
    console.error("Role upgrade error:", roleError);
  }

  // 3. Success! Redirect to dashboard
  redirect("/seller/dashboard");
}