/* eslint-disable @next/next/no-img-element */
import { createClient } from "@/lib/supabase/server";
import AdActions from "./AdActions";
import Link from "next/link";
import { Megaphone, TrendingUp, DollarSign, Clock, CheckCircle2, XCircle, Search, Calendar } from "lucide-react";

export default async function AdminPromotionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const resolvedParams = await searchParams;
  const supabase = await createClient();

  // 1. Fetch Promotions
  let query = supabase
    .from("promotions")
    .select(`
      *,
      products (title, slug, image_url, price),
      profiles (display_name, email)
    `)
    .order("created_at", { ascending: false });

  if (resolvedParams.status && resolvedParams.status !== "all") {
    query = query.eq("status", resolvedParams.status);
  }

  const { data: promotionsData } = await query;

  // 2. Filter logic (for search)
  let promotions = promotionsData || [];
  if (resolvedParams.q) {
    const q = resolvedParams.q.toLowerCase();
    promotions = promotions.filter(p => {
      const product = Array.isArray(p.products) ? p.products[0] : p.products;
      const seller = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
      return product?.title?.toLowerCase().includes(q) || seller?.display_name?.toLowerCase().includes(q);
    });
  }

  // 3. Calculate Stats
  const activeAds = promotions.filter(p => p.status === 'active');
  const expiredAds = promotions.filter(p => p.status === 'expired');
  const totalRevenue = activeAds.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Promotions & Ads</h1>
          <p className="text-gray-500 mt-1">Monitor ad revenue and control which products appear on the homepage.</p>
        </div>
        
        <form action="/admin/promotions" method="GET" className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm w-full md:w-72">
          <input 
            type="text" 
            name="q"
            defaultValue={resolvedParams.q || ""}
            placeholder="Search ads or sellers..." 
            className="flex-1 bg-transparent outline-none text-sm" 
          />
          <button type="submit" className="text-gray-400 hover:text-orange-500">Search</button>
        </form>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-3xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><DollarSign size={20} /></div>
            <span className="text-xs font-bold text-gray-400 uppercase">Ad Revenue</span>
          </div>
          <p className="text-3xl font-bold">₦ {totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-green-400 mt-2 flex items-center gap-1"><TrendingUp size={12} /> From active campaigns</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><CheckCircle2 size={20} /></div>
            <span className="text-xs font-bold text-gray-400 uppercase">Active Ads</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{activeAds.length}</p>
          <p className="text-xs text-gray-500 mt-2">Currently showing on homepage</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-gray-100 text-gray-500 rounded-xl flex items-center justify-center"><Clock size={20} /></div>
            <span className="text-xs font-bold text-gray-400 uppercase">Expired Ads</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{expiredAds.length}</p>
          <p className="text-xs text-gray-500 mt-2">Past campaigns</p>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide border-b border-gray-200">
        <Link href="/admin/promotions" className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${!resolvedParams.status ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          All Ads ({promotions.length})
        </Link>
        <Link href="/admin/promotions?status=active" className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${resolvedParams.status === 'active' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          Active ({activeAds.length})
        </Link>
        <Link href="/admin/promotions?status=expired" className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${resolvedParams.status === 'expired' ? 'bg-gray-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          Expired ({expiredAds.length})
        </Link>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-bold">Ad Product</th>
                <th className="p-4 font-bold">Paid By</th>
                <th className="p-4 font-bold">Package</th>
                <th className="p-4 font-bold">Duration</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {promotions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">No promotions found.</td>
                </tr>
              ) : (
                promotions.map((promo) => {
                  const product = Array.isArray(promo.products) ? promo.products[0] : promo.products;
                  const seller = Array.isArray(promo.profiles) ? promo.profiles[0] : promo.profiles;
                  
                  const isExpired = new Date(promo.end_date) < new Date();
                  const displayStatus = isExpired && promo.status === 'active' ? 'expired' : promo.status;

                  return (
                    <tr key={promo.id} className="hover:bg-gray-50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                            {product?.image_url && <img src={product.image_url} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 line-clamp-1">{product?.title}</p>
                            <p className="text-xs text-gray-500">₦ {Number(product?.price).toLocaleString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-gray-900 text-sm">{seller?.display_name || 'Unknown Seller'}</p>
                        <p className="text-xs text-gray-500">{seller?.email}</p>
                      </td>
                      <td className="p-4">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase border border-blue-200">
                          {promo.package_type}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-gray-500">
                        <p className="flex items-center gap-1"><Calendar size={12} /> Start: {new Date(promo.start_date).toLocaleDateString()}</p>
                        <p className="flex items-center gap-1 mt-1 text-gray-700 font-medium"><Calendar size={12} /> End: {new Date(promo.end_date).toLocaleDateString()}</p>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase ${
                          displayStatus === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                          'bg-gray-100 text-gray-600 border-gray-200'
                        }`}>
                          {displayStatus === 'active' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {displayStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right relative">
                        <AdActions promo={{ ...promo, product, status: displayStatus }} />
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