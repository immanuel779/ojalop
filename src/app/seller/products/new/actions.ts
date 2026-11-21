"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// TYPES
// ============================================================
export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string; field?: string };

export interface ProductOwnershipRow {
  id: string;
  store_id: string;
  image_url: string | null;
  status: string;
  stores:
    | { owner_id: string }
    | { owner_id: string }[]
    | null;
}

// ============================================================
// CONSTANTS
// ============================================================
const BUCKET = "product-images";
const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const RATE_LIMIT_COUNT = 15;
const RATE_LIMIT_WINDOW_MS = 60_000;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/jpg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
};

const OPTIONAL_PRODUCT_COLUMNS = [
  "tags",
  "negotiable",
  "delivery_pickup",
  "delivery_shipping",
  "boost",
  "video_url",
] as const;

function stripOptionalColumns(
  payload: Record<string, unknown>
): Record<string, unknown> {
  const copy: Record<string, unknown> = { ...payload };
  for (const key of OPTIONAL_PRODUCT_COLUMNS) {
    delete copy[key];
  }
  return copy;
}

// ============================================================
// SANITIZATION
// ============================================================
function sanitizeText(input: unknown, maxLen = 200): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

function sanitizeMultiline(input: unknown, maxLen = 5000): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLen);
}

// ============================================================
// IMAGE UTILITIES
// ============================================================
async function isValidImageFile(file: File): Promise<boolean> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) return false;
  if (file.size === 0 || file.size > MAX_IMAGE_BYTES) return false;

  try {
    const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const expected = MAGIC_BYTES[file.type];
    if (!expected) return false;
    return expected.some(seq => seq.every((byte, i) => head[i] === byte));
  } catch {
    return false;
  }
}

function collectImageFiles(formData: FormData): File[] {
  const singles = formData.getAll("image") as unknown[];
  const multiples = formData.getAll("images") as unknown[];
  return [...singles, ...multiples].filter(
    (f): f is File => f instanceof File && f.size > 0
  );
}

function extractStoragePath(url: string): string {
  const parts = url.split(`/${BUCKET}/`);
  return parts[1] || url.split("/").pop() || "";
}

async function uploadImages(
  supabase: SupabaseClient,
  userId: string,
  files: File[]
): Promise<{ urls: string[]; error?: string }> {
  if (files.length > MAX_IMAGES) {
    return { urls: [], error: `Maximum ${MAX_IMAGES} images allowed.` };
  }

  for (const file of files) {
    if (!(await isValidImageFile(file))) {
      return { urls: [], error: `Invalid or oversized image: ${file.name}` };
    }
  }

  const urls: string[] = [];

  for (const file of files) {
    const ext = (file.name.split(".").pop() || "jpg")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const fileName = `${userId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
        cacheControl: "31536000",
      });

    if (error) {
      if (urls.length > 0) {
        await supabase.storage
          .from(BUCKET)
          .remove(urls.map(extractStoragePath));
      }
      return { urls: [], error: `Upload failed: ${error.message}` };
    }

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
    urls.push(publicUrl);
  }

  return { urls };
}

async function removeStorageUrls(supabase: SupabaseClient, urls: string[]) {
  const paths = urls.map(extractStoragePath).filter(Boolean);
  if (paths.length > 0) {
    await supabase.storage.from(BUCKET).remove(paths);
  }
}

// ============================================================
// SCHEMAS
// ============================================================
const baseProductFields = {
  title: z.string()
    .min(5, "Title must be at least 5 characters")
    .max(120, "Title is too long (max 120)"),
  condition: z.string().min(1, "Please select a condition"),
  description: z.string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description is too long (max 5000)"),
  price: z.coerce.number()
    .min(100, "Minimum price is ₦100")
    .max(1_000_000_000, "Price is too high"),
  location_state: z.string().min(2, "State is required"),
  location_city: z.string().min(2, "LGA/City is required"),
  escrow_enabled: z.boolean(),
};

const optionalFields = {
  negotiable: z.boolean().optional(),
  delivery_pickup: z.boolean().optional(),
  delivery_shipping: z.boolean().optional(),
  boost: z.boolean().optional(),
  video_url: z.string().url("Invalid video URL").optional().or(z.literal("")),
  tags: z.string().optional(),
};

const productSchema = z.object({
  ...baseProductFields,
  category_id: z.string().uuid("Please select a valid category"),
  ...optionalFields,
});

const updateProductSchema = z.object({
  ...baseProductFields,
  category_id: z.string().uuid().optional(),
  ...optionalFields,
});

// ============================================================
// HELPERS
// ============================================================
async function getAuthUser(supabase: SupabaseClient) {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

async function verifyProductOwnership(
  supabase: SupabaseClient,
  userId: string,
  productId: string
): Promise<{ product: ProductOwnershipRow } | { error: string }> {
  const { data: product, error } = await supabase
    .from("products")
    .select("id, store_id, image_url, status, stores!inner(owner_id)")
    .eq("id", productId)
    .single();

  if (error || !product) return { error: "Product not found." };

  // Supabase returns untyped data without a generated schema — narrow once.
  const row = product as unknown as ProductOwnershipRow;

  const store = Array.isArray(row.stores) ? row.stores[0] : row.stores;
  if (store?.owner_id !== userId) {
    return { error: "Unauthorized: You do not own this product." };
  }

  return { product: row };
}

async function verifyCategoryExists(supabase: SupabaseClient, categoryId: string) {
  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("id", categoryId)
    .eq("is_active", true)
    .maybeSingle();
  return !error && !!data;
}

async function isRateLimited(supabase: SupabaseClient, storeId: string): Promise<boolean> {
  try {
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("store_id", storeId)
      .gte("created_at", since);
    return (count ?? 0) >= RATE_LIMIT_COUNT;
  } catch {
    return false;
  }
}

function parseTags(csv: string | undefined): string[] {
  if (!csv) return [];
  return csv
    .split(",")
    .map(t => t.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""))
    .filter(t => t.length > 0 && t.length <= 30)
    .slice(0, 10);
}

async function generateUniqueSlug(supabase: SupabaseClient, title: string): Promise<string> {
  const base =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .slice(0, 60) || "listing";

  for (let i = 0; i < 4; i++) {
    const slug = `${base}-${Math.floor(Math.random() * 1_000_000)}`;
    const { data } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!data) return slug;
  }

  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

async function insertProductSafe(
  supabase: SupabaseClient,
  payload: Record<string, unknown>
) {
  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select()
    .single();

  if (
    error &&
    (error.code === "42703" || /column .* does not exist/i.test(error.message))
  ) {
    const retry = await supabase
      .from("products")
      .insert(stripOptionalColumns(payload))
      .select()
      .single();
    if (retry.error) return { error: retry.error.message };
    return { data: retry.data };
  }

  if (error) return { error: error.message };
  return { data };
}

async function updateProductSafe(
  supabase: SupabaseClient,
  id: string,
  payload: Record<string, unknown>
) {
  const { error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", id);

  if (
    error &&
    (error.code === "42703" || /column .* does not exist/i.test(error.message))
  ) {
    const retry = await supabase
      .from("products")
      .update(stripOptionalColumns(payload))
      .eq("id", id);
    if (retry.error) return { error: retry.error.message };
    return {};
  }

  if (error) return { error: error.message };
  return {};
}

function buildOptionalPayload(parsed: {
  negotiable?: boolean;
  delivery_pickup?: boolean;
  delivery_shipping?: boolean;
  boost?: boolean;
  video_url?: string;
  tags?: string;
}) {
  return {
    ...(parsed.negotiable !== undefined ? { negotiable: parsed.negotiable } : {}),
    ...(parsed.delivery_pickup !== undefined ? { delivery_pickup: parsed.delivery_pickup } : {}),
    ...(parsed.delivery_shipping !== undefined ? { delivery_shipping: parsed.delivery_shipping } : {}),
    ...(parsed.boost !== undefined ? { boost: parsed.boost } : {}),
    ...(parsed.video_url ? { video_url: parsed.video_url } : {}),
    ...(parsed.tags ? { tags: parseTags(parsed.tags) } : {}),
  };
}

// ============================================================
// 1. CREATE PRODUCT
// ============================================================
export async function createProductAction(formData: FormData): Promise<ActionResult> {
  let redirectUrl = "";

  try {
    const supabase = await createClient();
    const user = await getAuthUser(supabase);
    if (!user) return { success: false, error: "You must be logged in." };

    const { data: store } = await supabase
      .from("stores")
      .select("id")
      .eq("owner_id", user.id)
      .single();
    if (!store) return { success: false, error: "You must create a store first." };

    if (await isRateLimited(supabase, store.id)) {
      return {
        success: false,
        error: "Too many listings created recently. Please wait a minute.",
      };
    }

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
      negotiable: formData.get("negotiable") === "true" || undefined,
      delivery_pickup: formData.get("delivery_pickup") === "true" || undefined,
      delivery_shipping: formData.get("delivery_shipping") === "true" || undefined,
      boost: formData.get("boost") === "true" || undefined,
      video_url: String(formData.get("video_url") ?? "") || undefined,
      tags: String(formData.get("tags") ?? "") || undefined,
    });

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return { success: false, error: issue.message, field: String(issue.path[0] ?? "") };
    }

    if (!(await verifyCategoryExists(supabase, parsed.data.category_id))) {
      return { success: false, error: "Selected category is not available.", field: "category_id" };
    }

    const imageFiles = collectImageFiles(formData);

    if (imageFiles.length === 0 && status !== "draft") {
      return {
        success: false,
        error: "Please upload at least one image before publishing.",
        field: "images",
      };
    }

    let uploadedImageUrls: string[] = [];
    if (imageFiles.length > 0) {
      const upload = await uploadImages(supabase, user.id, imageFiles);
      if (upload.error) return { success: false, error: upload.error, field: "images" };
      uploadedImageUrls = upload.urls;
    }

    const slug = await generateUniqueSlug(supabase, parsed.data.title);

    const payload = {
      store_id: store.id,
      title: sanitizeText(parsed.data.title, 120),
      slug,
      description: sanitizeMultiline(parsed.data.description, 5000),
      price: parsed.data.price,
      category_id: parsed.data.category_id,
      condition: sanitizeText(parsed.data.condition, 40),
      location_state: sanitizeText(parsed.data.location_state, 100),
      location_city: sanitizeText(parsed.data.location_city, 100),
      image_url: uploadedImageUrls[0] || "",
      escrow_enabled: parsed.data.escrow_enabled,
      status,
      is_active: true,
      ...buildOptionalPayload(parsed.data),
    };

    const inserted = await insertProductSafe(supabase, payload);
    if ("error" in inserted && inserted.error) {
      await removeStorageUrls(supabase, uploadedImageUrls);
      return { success: false, error: `Database error: ${inserted.error}` };
    }

    const productData = inserted.data;

    if (productData && uploadedImageUrls.length > 0) {
      const galleryRows = uploadedImageUrls.map((url, index) => ({
        product_id: productData.id,
        storage_path: url,
        is_cover: index === 0,
        sort_order: index,
      }));

      const { error: galleryError } = await supabase
        .from("product_images")
        .insert(galleryRows);

      if (galleryError) {
        await supabase.from("products").delete().eq("id", productData.id);
        await removeStorageUrls(supabase, uploadedImageUrls);
        return { success: false, error: `Gallery save failed: ${galleryError.message}` };
      }
    }

    redirectUrl = `/seller/dashboard?success=${
      status === "draft" ? "Saved as Draft" : "Published Successfully"
    }`;
  } catch (err) {
    console.error("Create Product Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }

  revalidatePath("/");
  revalidatePath("/seller/dashboard");
  redirect(redirectUrl);
}

// ============================================================
// 2. UPDATE PRODUCT
// ============================================================
export async function updateProductAction(id: string, formData: FormData): Promise<ActionResult> {
  let redirectUrl = "";

  try {
    const supabase = await createClient();
    const user = await getAuthUser(supabase);
    if (!user) return { success: false, error: "Unauthorized" };

    const auth = await verifyProductOwnership(supabase, user.id, id);
    if ("error" in auth) return { success: false, error: auth.error };

    const parsed = updateProductSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      price: formData.get("price"),
      condition: formData.get("condition"),
      location_state: formData.get("location_state"),
      location_city: formData.get("location_city"),
      escrow_enabled: formData.get("escrow_enabled") === "true",
      negotiable: formData.get("negotiable") === "true" || undefined,
      delivery_pickup: formData.get("delivery_pickup") === "true" || undefined,
      delivery_shipping: formData.get("delivery_shipping") === "true" || undefined,
      boost: formData.get("boost") === "true" || undefined,
      video_url: String(formData.get("video_url") ?? "") || undefined,
      tags: String(formData.get("tags") ?? "") || undefined,
    });

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return { success: false, error: issue.message, field: String(issue.path[0] ?? "") };
    }

    let coverImageUrl = String(formData.get("current_image") ?? "");
    const newFiles = collectImageFiles(formData);
    let newlyUploadedUrls: string[] = [];

    if (newFiles.length > 0) {
      const upload = await uploadImages(supabase, user.id, newFiles);
      if (upload.error) return { success: false, error: upload.error, field: "images" };
      newlyUploadedUrls = upload.urls;
      coverImageUrl = newlyUploadedUrls[0];
    }

    if (!coverImageUrl) {
      await removeStorageUrls(supabase, newlyUploadedUrls);
      return {
        success: false,
        error: "Please upload at least one image before publishing.",
        field: "images",
      };
    }

    const updatePayload = {
      title: sanitizeText(parsed.data.title, 120),
      description: sanitizeMultiline(parsed.data.description, 5000),
      price: parsed.data.price,
      condition: sanitizeText(parsed.data.condition, 40),
      location_state: sanitizeText(parsed.data.location_state, 100),
      location_city: sanitizeText(parsed.data.location_city, 100),
      escrow_enabled: parsed.data.escrow_enabled,
      image_url: coverImageUrl,
      ...buildOptionalPayload(parsed.data),
    };

    const updated = await updateProductSafe(supabase, id, updatePayload);
    if ("error" in updated && updated.error) {
      await removeStorageUrls(supabase, newlyUploadedUrls);
      return { success: false, error: updated.error };
    }

    if (newlyUploadedUrls.length > 0) {
      await supabase
        .from("product_images")
        .update({ is_cover: false })
        .eq("product_id", id);

      const galleryRows = newlyUploadedUrls.map((url, index) => ({
        product_id: id,
        storage_path: url,
        is_cover: index === 0,
        sort_order: index,
      }));

      const { error: galleryError } = await supabase
        .from("product_images")
        .insert(galleryRows);

      if (galleryError) {
        console.warn("Gallery insert failed:", galleryError.message);
      }
    }

    redirectUrl = "/seller/dashboard?success=Listing updated successfully";
  } catch (err) {
    console.error("Update Product Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred while updating.",
    };
  }

  revalidatePath("/seller/dashboard");
  revalidatePath("/");
  redirect(redirectUrl);
}

// ============================================================
// 3. PUBLISH DRAFT
// ============================================================
export async function publishDraftAction(productId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const user = await getAuthUser(supabase);
    if (!user) return { success: false, error: "Unauthorized" };

    const auth = await verifyProductOwnership(supabase, user.id, productId);
    if ("error" in auth) return { success: false, error: auth.error };

    if (!auth.product.image_url) {
      return { success: false, error: "Add at least one image before publishing." };
    }

    const { error } = await supabase
      .from("products")
      .update({ status: "approved", is_active: true })
      .eq("id", productId);
    if (error) return { success: false, error: error.message };

    revalidatePath("/seller/dashboard");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Publish Draft Error:", err);
    return { success: false, error: "Failed to publish draft." };
  }
}

// ============================================================
// 4. DELETE PRODUCT
// ============================================================
export async function deleteProductAction(productId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const user = await getAuthUser(supabase);
    if (!user) return { success: false, error: "Unauthorized" };

    const auth = await verifyProductOwnership(supabase, user.id, productId);
    if ("error" in auth) return { success: false, error: auth.error };

    const { data: gallery } = await supabase
      .from("product_images")
      .select("storage_path")
      .eq("product_id", productId);

    const urls = (gallery ?? []).map(g => g.storage_path).filter(Boolean);

    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) return { success: false, error: error.message };

    if (urls.length > 0) {
      await removeStorageUrls(supabase, urls);
    }

    revalidatePath("/seller/dashboard");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Delete Product Error:", err);
    return { success: false, error: "Failed to delete the product." };
  }
}

// ============================================================
// 5. ARCHIVE PRODUCT
// ============================================================
export async function archiveProductAction(productId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const user = await getAuthUser(supabase);
    if (!user) return { success: false, error: "Unauthorized" };

    const auth = await verifyProductOwnership(supabase, user.id, productId);
    if ("error" in auth) return { success: false, error: auth.error };

    const { error } = await supabase
      .from("products")
      .update({ status: "archived", is_active: false })
      .eq("id", productId);
    if (error) return { success: false, error: error.message };

    revalidatePath("/seller/dashboard");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Archive Product Error:", err);
    return { success: false, error: "Failed to archive product." };
  }
}

// ============================================================
// 6. TOGGLE VISIBILITY
// ============================================================
export async function toggleProductVisibilityAction(
  productId: string,
  currentStatus: boolean
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const user = await getAuthUser(supabase);
    if (!user) return { success: false, error: "Unauthorized" };

    const auth = await verifyProductOwnership(supabase, user.id, productId);
    if ("error" in auth) return { success: false, error: auth.error };

    const { error } = await supabase
      .from("products")
      .update({ is_active: !currentStatus })
      .eq("id", productId);
    if (error) return { success: false, error: error.message };

    revalidatePath("/seller/dashboard");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Toggle Visibility Error:", err);
    return { success: false, error: "Failed to update visibility." };
  }
}

// ============================================================
// 7. DUPLICATE PRODUCT
// ============================================================
export async function duplicateProductAction(productId: string): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createClient();
    const user = await getAuthUser(supabase);
    if (!user) return { success: false, error: "Unauthorized" };

    const { data: original, error: fetchError } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();
    if (fetchError || !original) return { success: false, error: "Product not found." };

    const auth = await verifyProductOwnership(supabase, user.id, productId);
    if ("error" in auth) return { success: false, error: auth.error };

    const newSlug = await generateUniqueSlug(supabase, `${original.title}-copy`);

    const { id: _id, created_at: _createdAt, slug: _slug, ...rest } = original;
    void { _id, _createdAt, _slug };

    const { data: clone, error: insertError } = await supabase
      .from("products")
      .insert({
        ...rest,
        title: `${original.title} (Copy)`,
        slug: newSlug,
        status: "draft",
        is_active: false,
      })
      .select("id")
      .single();

    if (insertError || !clone) {
      return { success: false, error: insertError?.message ?? "Failed to duplicate." };
    }

    const { data: gallery } = await supabase
      .from("product_images")
      .select("storage_path, is_cover, sort_order")
      .eq("product_id", productId);

    if (gallery && gallery.length > 0) {
      await supabase.from("product_images").insert(
        gallery.map(g => ({
          product_id: clone.id,
          storage_path: g.storage_path,
          is_cover: g.is_cover,
          sort_order: g.sort_order,
        }))
      );
    }

    revalidatePath("/seller/dashboard");
    return { success: true, data: { id: clone.id } };
  } catch (err) {
    console.error("Duplicate Product Error:", err);
    return { success: false, error: "Failed to duplicate product." };
  }
}

// ============================================================
// 8. BULK DELETE
// ============================================================
export async function bulkDeleteProductsAction(
  productIds: string[]
): Promise<ActionResult<{ deleted: number; failed: number }>> {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return { success: false, error: "No products selected." };
  }
  if (productIds.length > 100) {
    return { success: false, error: "Max 100 products per bulk operation." };
  }

  let deleted = 0;
  let failed = 0;

  await Promise.all(
    productIds.map(async (id) => {
      const result = await deleteProductAction(id);
      if (result.success) deleted++;
      else failed++;
    })
  );

  revalidatePath("/seller/dashboard");
  revalidatePath("/");
  return { success: true, data: { deleted, failed } };
}

// ============================================================
// 9. BULK TOGGLE
// ============================================================
export async function bulkToggleVisibilityAction(
  productIds: string[],
  enable: boolean
): Promise<ActionResult<{ updated: number; failed: number }>> {
  if (!Array.isArray(productIds) || productIds.length === 0) {
    return { success: false, error: "No products selected." };
  }

  try {
    const supabase = await createClient();
    const user = await getAuthUser(supabase);
    if (!user) return { success: false, error: "Unauthorized" };

    for (const id of productIds) {
      const auth = await verifyProductOwnership(supabase, user.id, id);
      if ("error" in auth) {
        return { success: false, error: `Cannot update ${id}: ${auth.error}` };
      }
    }

    const { error } = await supabase
      .from("products")
      .update({ is_active: enable })
      .in("id", productIds);

    if (error) return { success: false, error: error.message };

    revalidatePath("/seller/dashboard");
    revalidatePath("/");
    return { success: true, data: { updated: productIds.length, failed: 0 } };
  } catch (err) {
    console.error("Bulk Toggle Error:", err);
    return { success: false, error: "Failed to update products." };
  }
}