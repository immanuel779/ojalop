"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const productSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  category_id: z.string().uuid("Please select a valid category"),
  condition: z.string().min(1, "Please select a condition"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.coerce.number().min(100, "Minimum price is ₦100"),
  location_state: z.string().min(2, "State is required"),
  location_city: z.string().min(2, "LGA/City is required"),
  escrow_enabled: z.boolean(),
});

export async function createProductAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { data: store } = await supabase.from("stores").select("id").eq("owner_id", user.id).single();
  if (!store) return { error: "You must create a store first." };

  const intent = formData.get("intent") as string; // "draft" or "publish"
  const status = intent === "draft" ? "draft" : "approved";

  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    category_id: formData.get("category_id"),
    condition: formData.get("condition"),
    description: formData.get("description"),
    price: formData.get("price"),
    location_state: formData.get("location_state"),
    location_city: formData.get("location_city"),
    escrow_enabled: formData.get("escrow_enabled") === "true",
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const imageFile = formData.get("image") as File;
  let publicImageUrl = "";

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from("product-images").upload(fileName, imageFile);
    if (uploadError) return { error: `Failed to upload image: ${uploadError.message}` };
    const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(fileName);
    publicImageUrl = publicUrl;
  } else if (status !== "draft") {
    return { error: "Please upload an image for the product." };
  }

  const slug = parsed.data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") + "-" + Math.floor(Math.random() * 10000);

  const { error } = await supabase.from("products").insert({
    store_id: store.id,
    title: parsed.data.title,
    slug: slug,
    description: parsed.data.description,
    price: parsed.data.price,
    category_id: parsed.data.category_id,
    condition: parsed.data.condition,
    location_state: parsed.data.location_state,
    location_city: parsed.data.location_city,
    image_url: publicImageUrl,
    escrow_enabled: parsed.data.escrow_enabled,
    status: status, 
    is_active: true,
  });

  if (error) return { error: `Database error: ${error.message}` };

  revalidatePath("/");
  revalidatePath("/seller/dashboard");
  redirect(`/seller/dashboard?success=${status === 'draft' ? 'Saved as Draft' : 'Published Successfully'}`);
}

export async function deleteProductAction(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) return { error: error.message };
  
  revalidatePath("/seller/dashboard");
  revalidatePath("/");
  return { success: true };
}

export async function toggleProductVisibilityAction(productId: string, currentStatus: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("products").update({ is_active: !currentStatus }).eq("id", productId);
  if (error) return { error: error.message };
  
  revalidatePath("/seller/dashboard");
  revalidatePath("/");
  return { success: true };
}

// REPLACED WITH YOUR NEW FUNCTION
export async function updateProductAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  let publicImageUrl = formData.get("current_image") as string;

  // Handle new image upload if provided
  const imageFile = formData.get("image") as File;
  if (imageFile && imageFile.size > 0) {
    if (imageFile.size > 5 * 1024 * 1024) return { error: "Image must be less than 5MB." };
    
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage.from("product-images").upload(fileName, imageFile);
    if (uploadError) return { error: "Failed to upload new image." };
    
    const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(fileName);
    publicImageUrl = publicUrl;
  }

  // Update Database
  const { error } = await supabase.from("products").update({
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    price: Number(formData.get("price")),
    condition: formData.get("condition") as string,
    location_state: formData.get("location_state") as string,
    location_city: formData.get("location_city") as string,
    escrow_enabled: formData.get("escrow_enabled") === "true",
    image_url: publicImageUrl,
  }).eq("id", id);

  if (error) return { error: error.message };
  
  revalidatePath("/seller/dashboard");
  revalidatePath("/");
  redirect("/seller/dashboard?success=Listing updated successfully");
}