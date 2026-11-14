/* eslint-disable @next/next/no-img-element */
import { createClient } from "@/lib/supabase/server";
import WithdrawalActions from "./WithdrawalActions";
import Link from "next/link";
import { Users, Wallet, TrendingUp, AlertCircle, ArrowRight } from "lucide-react";

export default async function AdminAffiliatesPage() {
  const supabase = await createClient();

  // 1. Fetch Pending Withdrawals
  const { data: pendingWithdrawals } = await supabase
    .from("wallet_transactions")
    .select(`
      *,
      affiliates (
        referral_code,
        user_id,
        profiles (display_name, email)
      )
    `)
    .eq("type", "withdrawal")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  // 2. Fetch All Affiliates
  const { data: affiliatesData } = await supabase
    .from("affiliates")
    .select(`
      *,
      profiles (display_name, email)
    `)
    .order("total_earned", { ascending: false });

  // 3. Calculate Admin Stats
  const totalAffiliates = affiliatesData?.length || 0;
  const totalPaidOut = affiliatesData?.reduce((sum, a) => sum + (Number(a.total_earned) - Number(a.wallet_balance)), 0) || 0;
  const totalUnpaid = affiliatesData?.reduce((sum, a) => sum + Number(a.wallet_balance), 0) || 0;
  const pendingRequestsCount = pendingWithdrawals?.length || 0;

  return (
    <div className="space-y-8 pb-10">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Affiliate Management</h1>
        <p className="text-gray-500 mt-1">Track affiliate performance, process payouts, and monitor commissions.</p>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase">Total Affiliates</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalAffiliates}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase">Total Paid Out</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">₦ {totalPaidOut.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase">Owed in Wallets</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">₦ {totalUnpaid.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-orange-200 shadow-sm bg-orange-50">
          <p className="text-xs font-bold text-orange-700 uppercase flex items-center gap-1">
            <AlertCircle size={14} /> Pending Payouts
          </p>
          <p className="text-2xl font-bold text-orange-700 mt-1">{pendingRequestsCount}</p>
        </div>
      </div>

      {/* 1. PENDING WITHDRAWALS (ACTION REQUIRED) */}
      {pendingWithdrawals && pendingWithdrawals.length > 0 && (
        <div className="bg-white rounded-2xl border border-orange-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-orange-200 bg-orange-50 flex items-center gap-2">
            <AlertCircle className="text-orange-600" size={20} />
            <h2 className="font-bold text-orange-900">Pending Withdrawal Requests</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingWithdrawals.map((tx) => {
              const affiliate = Array.isArray(tx.affiliates) ? tx.affiliates[0] : tx.affiliates;
              const profile = Array.isArray(affiliate?.profiles) ? affiliate.profiles[0] : affiliate?.profiles;
              
              return (
                <div key={tx.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                      {profile?.display_name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{profile?.display_name || 'Unknown Affiliate'}</p>
                      <p className="text-xs text-gray-500">{profile?.email} • Code: {affiliate?.referral_code}</p>
                      <p className="text-xs text-gray-400">Requested on {new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-500 uppercase">Amount</p>
                      <p className="text-lg font-bold text-gray-900">₦ {Number(tx.amount).toLocaleString()}</p>
                    </div>
                    <WithdrawalActions tx={tx} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. ALL AFFILIATES DIRECTORY */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <Users size={18} className="text-orange-500" /> All Affiliates
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-bold">Affiliate</th>
                <th className="p-4 font-bold">Referral Code</th>
                <th className="p-4 font-bold">Wallet Balance</th>
                <th className="p-4 font-bold">Total Earned</th>
                <th className="p-4 font-bold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {affiliatesData?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">No affiliates registered yet.</td>
                </tr>
              ) : (
                affiliatesData?.map((aff) => {
                  const profile = Array.isArray(aff.profiles) ? aff.profiles[0] : aff.profiles;
                  return (
                    <tr key={aff.id} className="hover:bg-gray-50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs border border-gray-200">
                            {profile?.display_name?.charAt(0)?.toUpperCase() || 'A'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{profile?.display_name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{profile?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono font-bold">
                          {aff.referral_code}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-orange-600">
                        ₦ {Number(aff.wallet_balance).toLocaleString()}
                      </td>
                      <td className="p-4 font-bold text-green-600">
                        ₦ {Number(aff.total_earned).toLocaleString()}
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {new Date(aff.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}