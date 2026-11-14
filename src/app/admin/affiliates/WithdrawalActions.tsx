"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { approveAffiliateWithdrawal, rejectAffiliateWithdrawal } from "../actions";
import { toast } from "sonner";

// 1. Define the strict type for the transaction
interface WithdrawalTransaction {
  id: string;
  affiliate_id: string;
  amount: number;
}

// 2. Use the type instead of 'any'
export default function WithdrawalActions({ tx }: { tx: WithdrawalTransaction }) {
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    if (!confirm("Confirm that you have transferred this amount to the affiliate's bank account.")) return;
    setLoading(true);
    const res = await approveAffiliateWithdrawal(tx.id);
    setLoading(false);
    if (res?.error) toast.error(res.error);
    else toast.success("Withdrawal approved and marked as paid.");
  }

  async function handleReject() {
    if (!confirm("Reject this withdrawal? The funds will be returned to the affiliate's wallet.")) return;
    setLoading(true);
    const res = await rejectAffiliateWithdrawal(tx.id, tx.affiliate_id, tx.amount);
    setLoading(false);
    if (res?.error) toast.error(res.error);
    else toast.success("Withdrawal rejected. Funds returned to wallet.");
  }

  if (loading) return <Loader2 className="animate-spin text-orange-500 mx-auto" size={20} />;

  return (
    <div className="flex items-center justify-end gap-2">
      <button onClick={handleApprove} className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg hover:bg-green-100 transition">
        <CheckCircle2 size={14} /> Approve
      </button>
      <button onClick={handleReject} className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-bold rounded-lg hover:bg-red-100 transition">
        <XCircle size={14} /> Reject
      </button>
    </div>
  );
}