"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function activatePromotionAction(
  productId: string, 
  packageType: string, 
  amount: number, 
  reference: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Calculate duration based on package
  let durationDays = 7;
  if (packageType === "standard") durationDays = 14;
  if (packageType === "premium") durationDays = 30;

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + durationDays);

  const { error } = await supabase.from("promotions").insert({
    seller_id: user.id,
    product_id: productId,
    package_type: packageType,
    amount: amount,
    status: "active", // Auto-active since payment succeeded
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    payment_reference: reference,
  });

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/seller/dashboard");
  revalidatePath("/seller/promotions");

  return { success: true };
}