"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateSettingsAction(formData: FormData) {
  const supabase = await createClient();
  
  // Verify Admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const isAdmin = roles?.some(r => r.role === 'super_admin' || r.role === 'moderator');
  if (!isAdmin) return { error: "Unauthorized" };

  // Extract Data
  const siteName = formData.get("site_name") as string;
  const supportEmail = formData.get("support_email") as string;
  const supportPhone = formData.get("support_phone") as string;
  const escrowFee = Number(formData.get("escrow_fee_percent"));
  const affiliateCommission = Number(formData.get("affiliate_commission_percent"));
  const minWithdrawal = Number(formData.get("min_withdrawal"));
  const maintenanceMode = formData.get("maintenance_mode") === "true";
  const allowRegistrations = formData.get("allow_registrations") === "true";
  const autoApprove = formData.get("auto_approve_listings") === "true";

  const { error } = await supabase
    .from("platform_settings")
    .update({
      site_name: siteName,
      support_email: supportEmail,
      support_phone: supportPhone,
      escrow_fee_percent: escrowFee,
      affiliate_commission_percent: affiliateCommission,
      min_withdrawal: minWithdrawal,
      maintenance_mode: maintenanceMode,
      allow_registrations: allowRegistrations,
      auto_approve_listings: autoApprove,
      updated_at: new Date().toISOString()
    })
    .eq("id", 1);

  if (error) return { error: error.message };

  revalidatePath("/", "layout"); 
  return { success: true };
}