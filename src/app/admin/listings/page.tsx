/* eslint-disable @next/next/no-img-element */
import { createClient } from "@/lib/supabase/server";
import ListingActions from "./ListingActions";
import Link from "next/link";
import { Clock, ShieldCheck } from "lucide-react"; // <-- FIXED: Added these imports

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const resolvedParams = await searchParams;
  const supabase = await createClient();

  // 1. Base Query
  let query = supabase
    .from("products")
    .select("*, stores(name), categories(name)")
    .order("created_at", { ascending: false });

  // 2. Apply Filters
  if (resolvedParams.status && resolvedParams.status !== "all") {
    query = query.eq("status", resolvedParams.status);
  }
  if (resolvedParams.q) {
    query = query.ilike("title", `%${resolvedParams.q}%`);
  }

  // 3. Execute Query
  const { data: products } = await query;

  // 4. Get Stats for tabs
  const { count: pendingCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'pending_review');
  const { count: approvedCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'approved');
  const { count: rejectedCount } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'rejected');
  const { count: totalCount } = await supabase.from('products').select('*', { count: 'exact', head: true });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Listings</h1>
          <p className="text-gray-500 mt-1">Review, approve, and moderate all platform products.</p>
        </div>
        
        {/* SEARCH BAR */}
        <form action="/admin/listings" method="GET" className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm w-full md:w-72">
          <input 
            type="text" 
            name="q"
            defaultValue={resolvedParams.q || ""}
            placeholder="Search listings..." 
            className="flex-1 bg-transparent outline-none text-sm" 
          />
          <button type="submit" className="text-gray-400 hover:text-orange-500">
            Search
          </button>
        </form>
      </div>

      {/* FILTER TABS */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide border-b border-gray-200">
        <Link href="/admin/listings" className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${!resolvedParams.status ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          All Listings ({totalCount || 0})
        </Link>
        <Link href="/admin/listings?status=pending_review" className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition flex items-center gap-2 ${resolvedParams.status === 'pending_review' ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          Pending Review ({pendingCount || 0})
        </Link>
        <Link href="/admin/listings?status=approved" className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${resolvedParams.status === 'approved' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          Approved ({approvedCount || 0})
        </Link>
        <Link href="/admin/listings?status=rejected" className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${resolvedParams.status === 'rejected' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          Rejected ({rejectedCount || 0})
        </Link>
        <Link href="/admin/listings?status=suspended" className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${resolvedParams.status === 'suspended' ? 'bg-gray-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          Suspended
        </Link>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-bold">Product</th>
                <th className="p-4 font-bold">Store</th>
                <th className="p-4 font-bold">Price</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    No listings found matching your filters.
                  </td>
                </tr>
              ) : (
                products?.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                          {product.image_url && <img src={product.image_url} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{product.title}</p>
                          <p className="text-xs text-gray-500">{product.categories?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-700">{product.stores?.name}</td>
                    <td className="p-4 font-bold text-gray-900">₦ {Number(product.price).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                        product.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                        product.status === 'pending_review' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                        product.status === 'suspended' ? 'bg-gray-100 text-gray-700 border-gray-300' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {product.status === 'pending_review' && <Clock size={12} />}
                        {product.status === 'approved' && <ShieldCheck size={12} />}
                        {product.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right relative">
                      {/* THIS IS THE CORRECT PROP PASSING */}
                      <ListingActions product={product} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}