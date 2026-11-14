"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function payToEscrowAction(orderId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: "held_in_escrow" })
    .eq("id", orderId);

  if (error) return { error: error.message };
  
  revalidatePath("/buyer/orders");
  revalidatePath("/seller/orders");
  return { success: true };
}

export async function confirmDeliveryAction(orderId: string) {
  const supabase = await createClient();
  
  // 1. Fetch order details
  const { data: order } = await supabase
    .from("orders")
    .select("affiliate_code, products(price)")
    .eq("id", orderId)
    .single();

  if (!order) return { error: "Order not found" };

  const product = Array.isArray(order.products) ? order.products[0] : order.products;
  const orderAmount = Number(product?.price || 0);
  
  // --- THE MATH ---
  const platformFee = orderAmount * 0.05; // OjaLoop keeps 5%
  const affiliateCommission = orderAmount * 0.025; // Affiliate gets 2.5%
  const sellerPayout = orderAmount - platformFee; // Seller gets 95%

  // 2. Mark order as fulfilled and save the math
  const { error } = await supabase
    .from("orders")
    .update({ 
      payment_status: "released", 
      status: "fulfilled",
      escrow_released_at: new Date().toISOString(),
      platform_fee: platformFee,
      seller_payout: sellerPayout
    })
    .eq("id", orderId);

  if (error) return { error: error.message };
  
  // 3. PAY THE AFFILIATE (If there is one)
  if (order.affiliate_code && affiliateCommission > 0) {
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("id, wallet_balance, total_earned")
      .eq("referral_code", order.affiliate_code)
      .single();

    if (affiliate) {
      await supabase.from("affiliates").update({
        wallet_balance: Number(affiliate.wallet_balance) + affiliateCommission,
        total_earned: Number(affiliate.total_earned) + affiliateCommission,
      }).eq("id", affiliate.id);

      await supabase.from("wallet_transactions").insert({
        affiliate_id: affiliate.id,
        amount: affiliateCommission,
        type: "commission",
        description: `Commission from Order #${orderId.split('-')[0].toUpperCase()}`,
      });
    }
  }

  // 4. (Optional) Credit the Seller's Wallet
  // Currently, we don't have a seller wallet table. But you would add `sellerPayout` 
  // to the seller's balance here.

  revalidatePath("/buyer/orders");
  revalidatePath("/seller/orders");
  return { success: true };
}