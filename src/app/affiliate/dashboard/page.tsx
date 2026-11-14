import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { randomUUID } from "crypto";
import { ArrowLeft } from "lucide-react";
import AffiliateClient from "./AffiliateClient";

export default async function AffiliateDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let { data: affiliate } = await supabase
    .from("affiliates")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle(); 

  if (!affiliate) {
    const randomCode = `OJ-${randomUUID().slice(0, 6).toUpperCase()}`;
    
    const { data: newAffiliate, error } = await supabase
      .from("affiliates")
      .insert({ user_id: user.id, referral_code: randomCode })
      .select()
      .single();
      
    if (error) {
       if (error.code === '23505') {
         const { data: refetched } = await supabase.from("affiliates").select("*").eq("user_id", user.id).single();
         affiliate = refetched;
       } else {
         return (
           <div className="p-8 text-center text-red-600 bg-red-50 border border-red-200 rounded-xl max-w-lg mx-auto mt-20">
             <h2 className="font-bold text-lg mb-2">Database Error</h2>
             <p className="text-sm">{error.message}</p>
           </div>
         );
       }
    } else {
      affiliate = newAffiliate;
    }
  }

  if (!affiliate) {
    return <div className="p-8 text-center text-red-500 mt-20">Failed to load affiliate profile.</div>;
  }

  const { data: transactions } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("affiliate_id", affiliate.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="max-w-5xl mx-auto px-4 pt-8">
        <Link href="/buyer/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-orange-600 mb-6 transition">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
      </div>
      <AffiliateClient affiliate={affiliate} initialTransactions={transactions || []} />
    </div>
  );
}