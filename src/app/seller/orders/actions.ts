"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateOrderStatusAction(orderId: string, newStatus: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // 1. Fetch the order to verify ownership and payment status
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("seller_id, payment_status")
    .eq("id", orderId)
    .single();

  if (fetchError || !order || order.seller_id !== user.id) {
    return { error: "Order not found or unauthorized" };
  }

  // 2. SECURITY CHECK: Prevent seller from shipping if buyer hasn't paid into Escrow
  if (newStatus === 'shipped' && order.payment_status !== 'held_in_escrow') {
    return { error: "Cannot ship order. Buyer has not paid into Escrow yet." };
  }

  // 3. Update the status
  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) return { error: error.message };

  // 4. Refresh both the seller and buyer dashboards instantly
  revalidatePath("/seller/orders");
  revalidatePath("/seller/dashboard");
  revalidatePath("/buyer/orders"); 
  
  return { success: true };
}