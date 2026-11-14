"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// ==========================================
// SECURITY HELPERS
// ==========================================

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { isAdmin: false, userId: null, isSuperAdmin: false };
  
  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const isSuper = roles?.some(r => r.role === 'super_admin') || false;
  const isMod = roles?.some(r => r.role === 'moderator') || false;
  
  return { 
    isAdmin: isSuper || isMod, 
    userId: user.id,
    isSuperAdmin: isSuper 
  };
}

// ==========================================
// 1. LISTING MANAGEMENT
// ==========================================

export async function updateListingStatus(productId: string, newStatus: string) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) return { error: "Unauthorized" };
  
  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ status: newStatus }).eq("id", productId);
  
  if (error) return { error: error.message };

  revalidatePath("/admin/listings");
  revalidatePath("/"); // Update main marketplace
  return { success: true };
}

export async function deleteListing(productId: string) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) return { error: "Unauthorized" };
  
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", productId);
  
  if (error) return { error: error.message };

  revalidatePath("/admin/listings");
  revalidatePath("/");
  return { success: true };
}

// ==========================================
// 2. USER & SELLER MANAGEMENT
// ==========================================

export async function suspendUser(userId: string, currentStatus: string) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) return { error: "Unauthorized" };
  
  const supabase = await createClient();
  const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
  
  const { error } = await supabase.from("profiles").update({ account_status: newStatus }).eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { success: true };
}

export async function deleteUserAccount(userId: string) {
  const { isSuperAdmin } = await verifyAdmin();
  if (!isSuperAdmin) return { error: "Only Super Admins can delete accounts." };
  
  const adminAuthClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error } = await adminAuthClient.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateSellerVerification(storeId: string, newStatus: string) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) return { error: "Unauthorized" };
  
  const supabase = await createClient();
  const { error } = await supabase
    .from("stores")
    .update({ verification_status: newStatus })
    .eq("id", storeId);
    
  if (error) return { error: error.message };

  revalidatePath("/admin/sellers");
  revalidatePath("/stores");
  return { success: true };
}

export async function updateUserRole(userId: string, roleToAdd: string, action: 'add' | 'remove') {
  const { isSuperAdmin } = await verifyAdmin();
  if (!isSuperAdmin) return { error: "Only Super Admins can manage roles." };
  
  const supabase = await createClient();
  
  if (action === 'add') {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: roleToAdd });
    if (error && error.code !== '23505') return { error: error.message }; 
  } else {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", roleToAdd);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

// ==========================================
// 3. ORDERS & ESCROW (FINANCIAL CONTROL)
// ==========================================

export async function forceRefundOrder(orderId: string) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) return { error: "Unauthorized" };
  
  const supabase = await createClient();
  
  const { data: order } = await supabase
    .from("orders")
    .select("affiliate_code, payment_status, seller_payout")
    .eq("id", orderId)
    .single();

  if (!order) return { error: "Order not found" };
  if (order.payment_status === 'refunded') return { error: "Order is already refunded." };

  const { error } = await supabase
    .from("orders")
    .update({ 
      payment_status: "refunded", 
      status: "declined",
      escrow_released_at: new Date().toISOString()
    })
    .eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath("/buyer/orders");
  revalidatePath("/seller/orders");
  return { success: true };
}

export async function forceCompleteOrder(orderId: string) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) return { error: "Unauthorized" };
  
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("orders")
    .update({ 
      payment_status: "released", 
      status: "fulfilled",
      escrow_released_at: new Date().toISOString()
    })
    .eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath("/buyer/orders");
  revalidatePath("/seller/orders");
  return { success: true };
}

// THIS WAS THE MISSING FUNCTION
export async function markOrderAsDisputed(orderId: string) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) return { error: "Unauthorized" };
  
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("orders")
    .update({ 
      payment_status: "disputed",
      status: "disputed" 
    })
    .eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath("/buyer/orders");
  revalidatePath("/seller/orders");
  return { success: true };
}

// ==========================================
// 4. AFFILIATE & PROMOTIONS
// ==========================================

export async function approveAffiliateWithdrawal(transactionId: string) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) return { error: "Unauthorized" };

  const supabase = await createClient();

  const { error } = await supabase
    .from("wallet_transactions")
    .update({ status: "completed" })
    .eq("id", transactionId);

  if (error) return { error: error.message };

  revalidatePath("/admin/affiliates");
  return { success: true };
}

export async function rejectAffiliateWithdrawal(transactionId: string, affiliateId: string, amount: number) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) return { error: "Unauthorized" };

  const supabase = await createClient();

  const { error: txError } = await supabase
    .from("wallet_transactions")
    .update({ status: "failed" })
    .eq("id", transactionId);

  if (txError) return { error: txError.message };

  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("wallet_balance")
    .eq("id", affiliateId)
    .single();

  if (affiliate) {
    await supabase
      .from("affiliates")
      .update({ wallet_balance: Number(affiliate.wallet_balance) + amount })
      .eq("id", affiliateId);
  }

  revalidatePath("/admin/affiliates");
  return { success: true };
}

export async function cancelPromotion(promotionId: string) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) return { error: "Unauthorized" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("promotions")
    .update({ status: "expired" })
    .eq("id", promotionId);

  if (error) return { error: error.message };

  revalidatePath("/admin/promotions");
  revalidatePath("/"); 
  return { success: true };
}

// ==========================================
// 5. DISPUTES & REPORTS
// ==========================================

export async function resolveReport(reportId: string, action: 'dismissed' | 'resolved') {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) return { error: "Unauthorized" };

  const supabase = await createClient();

  const { error } = await supabase
    .from("reports")
    .update({ 
      status: action,
      resolved_at: new Date().toISOString()
    })
    .eq("id", reportId);

  if (error) return { error: error.message };

  revalidatePath("/admin/reports");
  return { success: true };
}

export async function deleteReportedContent(targetType: string, targetId: string) {
  const { isAdmin } = await verifyAdmin();
  if (!isAdmin) return { error: "Unauthorized" };

  const supabase = await createClient();
  let errorMsg = null;

  if (targetType === 'product') {
    const { error } = await supabase.from("products").delete().eq("id", targetId);
    if (error) errorMsg = error.message;
  } else if (targetType === 'store') {
    const { error } = await supabase.from("stores").update({ is_active: false }).eq("id", targetId);
    if (error) errorMsg = error.message;
  } else if (targetType === 'user') {
    const { error } = await supabase.from("profiles").update({ account_status: 'suspended' }).eq("id", targetId);
    if (error) errorMsg = error.message;
  }

  if (errorMsg) return { error: errorMsg };

  revalidatePath("/admin/reports");
  revalidatePath("/");
  return { success: true };
}