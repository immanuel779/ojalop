"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function withdrawFundsAction(affiliateId: string, amount: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 1. Verify the affiliate exists and belongs to the user
  const { data: affiliate } = await supabase
    .from("affiliates")
    .select("wallet_balance")
    .eq("id", affiliateId)
    .eq("user_id", user.id)
    .single();

  if (!affiliate) return { error: "Affiliate account not found." };

  // 2. Check minimum withdrawal and balance
  if (amount < 5000) return { error: "Minimum withdrawal is ₦5,000." };
  if (amount > Number(affiliate.wallet_balance)) return { error: "Insufficient balance." };

  // 3. Deduct the balance
  const newBalance = Number(affiliate.wallet_balance) - amount;
  const { error: updateError } = await supabase
    .from("affiliates")
    .update({ wallet_balance: newBalance })
    .eq("id", affiliateId);

  if (updateError) return { error: updateError.message };

  // 4. Log the transaction
  const { error: txError } = await supabase
    .from("wallet_transactions")
    .insert({
      affiliate_id: affiliateId,
      amount: amount,
      type: "withdrawal",
      status: "completed",
      description: "Bank transfer withdrawal"
    });

  if (txError) return { error: txError.message };

  revalidatePath("/affiliate/dashboard");
  return { success: true };
}