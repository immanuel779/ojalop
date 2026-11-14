import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Store, ArrowLeft } from "lucide-react";
import SettingsForm from "./SettingsForm";

export default async function StoreSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: store } = await supabase.from("stores").select("*").eq("owner_id", user.id).single();
  if (!store) redirect("/seller/onboarding");

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pb-32">
      <Link href="/seller/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-orange-600 mb-6 transition">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shadow-inner">
          <Store size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Store Settings</h1>
          <p className="text-gray-500 mt-1">Manage your public business profile, branding, and policies.</p>
        </div>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-3xl border border-gray-200 shadow-sm">
        <SettingsForm store={store} />
      </div>
    </div>
  );
}