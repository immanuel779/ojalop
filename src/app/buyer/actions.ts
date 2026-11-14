"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers"; // <-- Import cookies

export async function toggleFavouriteAction(productId: string, isCurrentlyFavourite: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to save items." };

  if (isCurrentlyFavourite) {
    await supabase.from("favourites").delete().eq("user_id", user.id).eq("product_id", productId);
  } else {
    await supabase.from("favourites").insert({ user_id: user.id, product_id: productId });
  }

  revalidatePath("/buyer/dashboard");
  revalidatePath("/buyer/favourites");
  return { success: true };
}

export async function requestOrderAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 1. READ THE AFFILIATE COOKIE
  const cookieStore = await cookies();
  const affiliateCode = cookieStore.get("ojaloop_ref")?.value;

  const productId = formData.get("product_id") as string;
  const sellerId = formData.get("seller_id") as string;

  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("buyer_id", user.id)
    .eq("product_id", productId)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) {
    redirect("/buyer/dashboard?message=Order already pending");
  }

  // 2. ATTACH THE AFFILIATE CODE TO THE ORDER
  const { error } = await supabase.from("orders").insert({
    buyer_id: user.id,
    seller_id: sellerId,
    product_id: productId,
    affiliate_code: affiliateCode || null, // Save it here!
  });

  if (error) {
    redirect("/buyer/dashboard?error=" + encodeURIComponent(error.message));
  }

  redirect("/buyer/dashboard?message=Order requested successfully");
}