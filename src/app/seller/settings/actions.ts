"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const storeSettingsSchema = z.object({
  name: z.string().min(2, "Store name is required"),
  description: z.string().min(10, "Please provide a brief description"),
  location_state: z.string().min(2, "State is required"),
  whatsapp: z.string().optional(),
  return_policy: z.string().optional(),
  shipping_policy: z.string().optional(),
});

export async function updateStoreAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = storeSettingsSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    location_state: formData.get("location_state"),
    whatsapp: formData.get("whatsapp"),
    return_policy: formData.get("return_policy"),
    shipping_policy: formData.get("shipping_policy"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  let logoUrl = formData.get("current_logo") as string;
  let coverUrl = formData.get("current_cover") as string;

  // Handle Logo Upload
  const logoFile = formData.get("logo") as File;
  if (logoFile && logoFile.size > 0) {
    const fileName = `${user.id}-logo-${Date.now()}.${logoFile.name.split('.').pop()}`;
    const { error } = await supabase.storage.from("store-assets").upload(fileName, logoFile);
    if (!error) {
      const { data } = supabase.storage.from("store-assets").getPublicUrl(fileName);
      logoUrl = data.publicUrl;
    }
  }

  // Handle Cover Upload
  const coverFile = formData.get("cover") as File;
  if (coverFile && coverFile.size > 0) {
    const fileName = `${user.id}-cover-${Date.now()}.${coverFile.name.split('.').pop()}`;
    const { error } = await supabase.storage.from("store-assets").upload(fileName, coverFile);
    if (!error) {
      const { data } = supabase.storage.from("store-assets").getPublicUrl(fileName);
      coverUrl = data.publicUrl;
    }
  }

  const { error } = await supabase
    .from("stores")
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
      location_state: parsed.data.location_state,
      whatsapp: parsed.data.whatsapp,
      return_policy: parsed.data.return_policy,
      shipping_policy: parsed.data.shipping_policy,
      logo_url: logoUrl,
      cover_url: coverUrl,
    })
    .eq("owner_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/seller/settings?success=Store updated successfully");
}