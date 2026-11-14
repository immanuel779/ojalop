"use client";

import { useState, useEffect } from "react";
import { Wallet, Link as LinkIcon, Copy, TrendingUp, ArrowUpRight, ArrowDownLeft, Loader2, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { withdrawFundsAction } from "./actions";

type Transaction = {
  id: string;
  amount: number;
  type: string;
  status: string;
  created_at: string;
};

// FIX: Define a strict type for affiliate
type Affiliate = {
  id: string;
  wallet_balance: number;
  total_earned: number;
  referral_code: string;
};

export default function AffiliateClient({ 
  affiliate, 
  initialTransactions 
}: { 
  affiliate: Affiliate; // <-- Replaced any
  initialTransactions: Transaction[] 
}) {
  const supabase = createClient();
  
  const [balance, setBalance] = useState(Number(affiliate.wallet_balance));
  const [totalEarned, setTotalEarned] = useState(Number(affiliate.total_earned));
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const trackingLink = `${siteUrl}?ref=${affiliate.referral_code}`;

  useEffect(() => {
    const channel = supabase
      .channel(`affiliate_${affiliate.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'affiliates', filter: `id=eq.${affiliate.id}` }, (payload) => {
        setBalance(Number(payload.new.wallet_balance));
        setTotalEarned(Number(payload.new.total_earned));
        toast.success("Wallet updated in real-time!");
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'wallet_transactions', filter: `affiliate_id=eq.${affiliate.id}` }, (payload) => {
        setTransactions((current) => [payload.new as Transaction, ...current]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [affiliate.id, supabase]);

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingLink);
    toast.success("Tracking link copied to clipboard!");
  };

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setLoading(true);
    const res = await withdrawFundsAction(affiliate.id, amount);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`₦${amount.toLocaleString()} withdrawal successful!`);
      setIsWithdrawOpen(false);
      setWithdrawAmount("");
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 min-h-screen bg-gray-50/50">
      {/* ... (The rest of the component stays exactly the same) ... */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Affiliate Dashboard</h1>
          <p className="text-gray-500 mt-1">Share your link, track your earnings, and withdraw to your bank.</p>
        </div>
        <div className="bg-orange-100 text-orange-600 px-4 py-2 rounded-xl font-bold border border-orange-200 flex items-center gap-2">
          <CheckCircle2 size={18} /> Active Affiliate
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-3xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><Wallet size={20} /></div>
            <span className="text-xs font-bold text-gray-400 uppercase">Available Balance</span>
          </div>
          <p className="text-3xl font-bold">₦ {balance.toLocaleString()}</p>
          <button 
            onClick={() => setIsWithdrawOpen(true)}
            disabled={balance < 5000}
            className="w-full mt-4 bg-orange-600 text-white py-2 rounded-lg font-bold hover:bg-orange-700 transition text-sm disabled:opacity-50"
          >
            Withdraw Funds
          </button>
          {balance < 5000 && <p className="text-[10px] text-center text-gray-400 mt-2">Minimum withdrawal: ₦5,000</p>}
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><TrendingUp size={20} /></div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Lifetime Earnings</p>
            <p className="text-2xl font-bold text-gray-900">₦ {totalEarned.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><LinkIcon size={20} /></div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Your Unique Code</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-center font-mono font-bold text-lg text-gray-800">
              {affiliate.referral_code}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Your Tracking Link</h2>
        <p className="text-sm text-gray-500 mb-4">Share this link on WhatsApp, Twitter, or with friends. When they buy, you earn 2.5%.</p>
        <div className="flex flex-col md:flex-row gap-2">
          <input 
            type="text" 
            readOnly 
            value={trackingLink} 
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none text-sm font-medium text-gray-700"
          />
          <button 
            onClick={handleCopy}
            className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2"
          >
            <Copy size={18} /> Copy Link
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gray-50/50">
          <h2 className="font-bold text-gray-900 text-lg">Wallet History</h2>
        </div>
        
        {transactions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Wallet className="mx-auto mb-4 text-gray-300" size={32} />
            <p>No transactions yet. Start sharing your link to earn!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'commission' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {tx.type === 'commission' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 capitalize">{tx.type}</p>
                    <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.type === 'commission' ? 'text-green-600' : 'text-gray-900'}`}>
                    {tx.type === 'commission' ? '+' : '-'} ₦{Number(tx.amount).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isWithdrawOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Withdraw Funds</h3>
              <button onClick={() => setIsWithdrawOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="bg-blue-50 text-blue-800 p-3 rounded-xl text-sm mb-4">
                Your available balance is <strong>₦{balance.toLocaleString()}</strong>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Amount to Withdraw (₦)</label>
                <input 
                  type="number" 
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  min="5000"
                  max={balance}
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 focus:bg-white transition text-lg font-bold"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-md disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : "Confirm Withdrawal"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}