import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Rocket, PlusCircle, PackageOpen } from "lucide-react";
import PromoteForm from "./PromoteForm";

export default async function PromotePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 1. Check if the user has a store
  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!store) {
    redirect("/seller/onboarding");
  }

  // 2. Fetch only active/approved products to promote
  const { data: products } = await supabase
    .from("products")
    .select("id, title, price")
    .eq("store_id", store.id)
    .eq("status", "approved")
    .eq("is_active", true);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen">
      <Link href="/seller/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-orange-600 mb-6 transition">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shadow-inner">
          <Rocket size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Promote Your Ad</h1>
          <p className="text-gray-500 mt-1">Boost your listing to the top of the homepage and sell faster.</p>
        </div>
      </div>

      {/* 3. Handle the case where they have a store but NO products */}
      {!products || products.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <PackageOpen size={32} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No active listings found</h2>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">You need to post a product before you can promote it. Create your first ad now and start reaching thousands of buyers.</p>
          <Link href="/seller/products/new" className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-600/20">
            <PlusCircle size={20} /> Post an Ad
          </Link>
        </div>
      ) : (
        // 4. Show the form if they have products
        <PromoteForm products={products} userEmail={user.email || ""} />
      )}
    </div>
  );
}