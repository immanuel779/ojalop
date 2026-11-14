import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, ArrowLeft, CheckCircle2 } from "lucide-react";
import ProfileForm from "./ProfileForm";

export default async function BuyerSettingsPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const resolvedParams = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <Link href="/buyer/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-orange-600 mb-6 transition">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      {resolvedParams.success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 text-sm font-bold rounded-xl border border-green-200 flex items-center gap-2">
          <CheckCircle2 size={18} /> Profile updated successfully!
        </div>
      )}

      <div className="bg-white p-6 md:p-10 rounded-3xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
            <User size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your personal info, security, and preferences.</p>
          </div>
        </div>

        <ProfileForm profile={profile} email={user.email} />
      </div>
    </div>
  );
}