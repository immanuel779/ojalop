import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Clock, CheckCircle2, XCircle } from "lucide-react";
import VerificationForm from "./VerificationForm";

export default async function SellerVerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const resolvedParams = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch existing verification request
  const { data: verification } = await supabase
    .from("seller_verifications")
    .select("*")
    .eq("seller_id", user.id)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 min-h-screen">
      <Link href="/seller/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-orange-600 mb-6 transition">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shadow-inner">
          <ShieldCheck size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Get Verified</h1>
          <p className="text-gray-500 mt-1">Build trust with buyers by verifying your business.</p>
        </div>
      </div>

      {resolvedParams.success || verification?.status === 'pending' ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center shadow-sm">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock size={32} className="text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Pending</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Your documents have been submitted successfully. Our team will review them and update your status within 24-48 hours.
          </p>
          <Link href="/seller/dashboard" className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition">
            Return to Dashboard
          </Link>
        </div>
      ) : verification?.status === 'approved' ? (
        <div className="bg-white p-12 rounded-3xl border border-green-200 text-center shadow-sm bg-green-50/30">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">You are Verified!</h2>
          <p className="text-green-700 mb-6 max-w-md mx-auto">
            Congratulations! Your store is officially verified. You now have a verified badge on all your listings.
          </p>
          <Link href="/seller/dashboard" className="inline-block bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition">
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {verification?.status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3">
              <XCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold text-red-900">Previous Verification Rejected</p>
                <p className="text-sm text-red-700 mt-1">Reason: {verification.admin_notes || "Documents were unclear or invalid."}</p>
                <p className="text-sm text-red-700 mt-2">Please try submitting again with clearer documents.</p>
              </div>
            </div>
          )}
          <VerificationForm />
        </div>
      )}
    </div>
  );
}