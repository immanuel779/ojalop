"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const profileSchema = z.object({
  display_name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  location_state: z.string().optional(),
  location_city: z.string().optional(),
  bio: z.string().max(200, "Bio cannot exceed 200 characters").optional(),
  email_alerts: z.coerce.boolean(),
  sms_alerts: z.coerce.boolean(),
});

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = profileSchema.safeParse({
    display_name: formData.get("display_name"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
    location_state: formData.get("location_state"),
    location_city: formData.get("location_city"),
    bio: formData.get("bio"),
    email_alerts: formData.get("email_alerts") === "true",
    sms_alerts: formData.get("sms_alerts") === "true",
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // Handle Avatar Upload
  const avatarFile = formData.get("avatar") as File;
  let avatarUrl = formData.get("current_avatar") as string;

  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, avatarFile);
    if (uploadError) return { error: "Failed to upload avatar." };
    
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(fileName);
    avatarUrl = publicUrl;
  }

  // Update Database
  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.display_name,
      phone: parsed.data.phone,
      whatsapp: parsed.data.whatsapp,
      location_state: parsed.data.location_state,
      location_city: parsed.data.location_city,
      bio: parsed.data.bio,
      avatar_url: avatarUrl,
      email_alerts: parsed.data.email_alerts,
      sms_alerts: parsed.data.sms_alerts,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/buyer/settings?success=true");
}

export async function deleteAccountAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Initialize Admin Client to delete from auth.users
  const adminAuthClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // This deletes the user from auth.users, which cascades to profiles, stores, products, etc.
  const { error } = await adminAuthClient.auth.admin.deleteUser(user.id);
  
  if (error) return { error: error.message };

  // Sign out and redirect
  await supabase.auth.signOut();
  redirect("/");
}