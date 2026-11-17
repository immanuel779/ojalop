"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

// ==========================================
// SCHEMAS & VALIDATION
// ==========================================

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

// ==========================================
// HELPERS
// ==========================================

async function verifyProductOwnership(supabase: SupabaseClient, userId: string, productId: string) {
  const { data: product, error } = await supabase
    .from("products")
    .select("id, store_id, image_url, stores(owner_id)")
    .eq("id", productId)
    .single();

  if (error || !product) return { error: "Product not found." };

  const store = Array.isArray(product.stores) ? product.stores[0] : product.stores;

  if (store?.owner_id !== userId) {
    return { error: "Unauthorized: You do not own this product." };
  }

  return { product };
}

async function uploadImages(supabase: SupabaseClient, userId: string, imageFiles: File[]) {
  const uploadedUrls: string[] = [];

  for (const file of imageFiles) {
    if (file && file.size > 0) {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("One or more images exceed the 5MB limit.");
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from("product-images").upload(fileName, file);
      
      if (uploadError) {
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }
      
      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(fileName);
      uploadedUrls.push(publicUrl);
    }
  }

  return uploadedUrls;
}

// ==========================================
// 1. CREATE PRODUCT (With Multiple Images)
// ==========================================

export async function createProductAction(formData: FormData) {
  let isSuccess = false;
  let redirectUrl = "";

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "You must be logged in." };

    const { data: store } = await supabase.from("stores").select("id").eq("owner_id", user.id).single();
    if (!store) return { error: "You must create a store first." };

    const intent = formData.get("intent") as string;
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

    const imageFiles = formData.getAll("images") as File[];
    let uploadedImageUrls: string[] = [];

    if (imageFiles.length > 0 && imageFiles[0].size > 0) {
      uploadedImageUrls = await uploadImages(supabase, user.id, imageFiles);
    } else if (status !== "draft") {
      return { error: "Please upload at least one image before publishing." };
    }

    const coverImageUrl = uploadedImageUrls[0] || "";

    const slug = parsed.data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "") + "-" + Math.floor(Math.random() * 10000);

    const { data: productData, error } = await supabase.from("products").insert({
      store_id: store.id,
      title: parsed.data.title,
      slug: slug,
      description: parsed.data.description,
      price: parsed.data.price,
      category_id: parsed.data.category_id,
      condition: parsed.data.condition,
      location_state: parsed.data.location_state,
      location_city: parsed.data.location_city,
      image_url: coverImageUrl,
      escrow_enabled: parsed.data.escrow_enabled,
      status: status, 
      is_active: true,
    }).select().single();

    if (error) return { error: `Database error: ${error.message}` };

    if (productData && uploadedImageUrls.length > 0) {
      const galleryImages = uploadedImageUrls.map((url, index) => ({
        product_id: productData.id,
        storage_path: url,
        is_cover: index === 0,
        sort_order: index
      }));
      
      await supabase.from("product_images").insert(galleryImages);
    }

    isSuccess = true;
    redirectUrl = `/seller/dashboard?success=${status === 'draft' ? 'Saved as Draft' : 'Published Successfully'}`;

  } catch (err) {
    // FIX 1: Handle unknown error type
    console.error("Create Product Error:", err);
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return { error: message };
  }

  if (isSuccess) {
    revalidatePath("/");
    revalidatePath("/seller/dashboard");
    redirect(redirectUrl);
  }
}

// ==========================================
// 2. DELETE PRODUCT
// ==========================================

export async function deleteProductAction(productId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { error: authError } = await verifyProductOwnership(supabase, user.id, productId);
    if (authError) return { error: authError };

    const { data: gallery } = await supabase
      .from("product_images")
      .select("storage_path")
      .eq("product_id", productId);

    const pathsToRemove: string[] = [];
    
    gallery?.forEach(img => {
      const path = img.storage_path.split('/').pop();
      if (path) pathsToRemove.push(path);
    });

    if (pathsToRemove.length > 0) {
      await supabase.storage.from("product-images").remove(pathsToRemove);
    }

    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) return { error: error.message };
    
    revalidatePath("/seller/dashboard");
    revalidatePath("/");
    return { success: true };

  } catch (err) {
    console.error("Delete Product Error:", err);
    return { error: "Failed to delete the product." };
  }
}

// ==========================================
// 3. TOGGLE VISIBILITY
// ==========================================

export async function toggleProductVisibilityAction(productId: string, currentStatus: boolean) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { error: authError } = await verifyProductOwnership(supabase, user.id, productId);
    if (authError) return { error: authError };

    const { error } = await supabase
      .from("products")
      .update({ is_active: !currentStatus })
      .eq("id", productId);

    if (error) return { error: error.message };
    
    revalidatePath("/seller/dashboard");
    revalidatePath("/");
    return { success: true };

  } catch (err) {
    console.error("Toggle Visibility Error:", err);
    return { error: "Failed to update visibility." };
  }
}

// ==========================================
// 4. UPDATE PRODUCT (Edit)
// ==========================================

export async function updateProductAction(id: string, formData: FormData) {
  let isSuccess = false;
  let redirectUrl = "";

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { error: authError } = await verifyProductOwnership(supabase, user.id, id);
    if (authError) return { error: authError };

    const parsed = productSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      price: formData.get("price"),
      condition: formData.get("condition"),
      location_state: formData.get("location_state"),
      location_city: formData.get("location_city"),
      escrow_enabled: formData.get("escrow_enabled") === "true",
      category_id: formData.get("category_id"), 
    });

    if (!parsed.success) return { error: parsed.error.issues[0].message };

    let coverImageUrl = formData.get("current_image") as string;

    const newImageFiles = formData.getAll("images") as File[];
    if (newImageFiles.length > 0 && newImageFiles[0].size > 0) {
      const uploadedImageUrls = await uploadImages(supabase, user.id, newImageFiles);
      if (uploadedImageUrls.length > 0) {
        coverImageUrl = uploadedImageUrls[0];
        
        const galleryImages = uploadedImageUrls.map((url, index) => ({
          product_id: id,
          storage_path: url,
          is_cover: index === 0,
          sort_order: index
        }));
        await supabase.from("product_images").insert(galleryImages);
      }
    }

    const { error } = await supabase.from("products").update({
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      condition: parsed.data.condition,
      location_state: parsed.data.location_state,
      location_city: parsed.data.location_city,
      escrow_enabled: parsed.data.escrow_enabled,
      image_url: coverImageUrl,
    }).eq("id", id);

    if (error) return { error: error.message };
    
    isSuccess = true;
    redirectUrl = "/seller/dashboard?success=Listing updated successfully";

  } catch (err) {
    // FIX 2: Handle unknown error type
    console.error("Update Product Error:", err);
    const message = err instanceof Error ? err.message : "An unexpected error occurred while updating.";
    return { error: message };
  }

  if (isSuccess) {
    revalidatePath("/seller/dashboard");
    revalidatePath("/");
    redirect(redirectUrl);
  }
}