/* eslint-disable @next/next/no-img-element */
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, CheckCircle2, Star, ShieldCheck } from "lucide-react";

export default async function StoreProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();

  // Fetch store details
  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", resolvedParams.slug)
    .eq("is_active", true)
    .single();

  if (!store) notFound();

  // Fetch store products
  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("store_id", store.id)
    .eq("status", "approved")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Store Header Banner */}
      <div className="h-48 md:h-64 bg-gray-900 relative w-full overflow-hidden">
        {store.cover_url ? (
          <img src={store.cover_url} alt="Cover" className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-900 opacity-80"></div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Store Info Card (Overlaps banner) */}
        <div className="relative -mt-16 sm:-mt-20 bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            
            {/* Logo */}
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-2xl border-4 border-white shadow-lg overflow-hidden flex-shrink-0 -mt-12 md:-mt-16">
              {store.logo_url ? (
                <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-3xl">
                  {store.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center justify-center md:justify-start gap-2">
                {store.name}
                {store.verification_status === 'verified' && (
                  <CheckCircle2 className="text-green-500" size={24} />
                )}
              </h1>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1"><MapPin size={16} /> {store.location_state || 'Nigeria'}</span>
                <span className="flex items-center gap-1"><Star size={16} className="text-yellow-500" /> 5.0 (0 reviews)</span>
                <span className="flex items-center gap-1 text-green-600 font-medium"><ShieldCheck size={16} /> Escrow Protected</span>
              </div>

              <p className="mt-4 text-gray-600 max-w-3xl mx-auto md:mx-0">
                {store.description || "Welcome to our official OjaLoop store."}
              </p>
            </div>
          </div>
        </div>

        {/* Store Products Grid */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">All Listings ({products?.length || 0})</h2>
          
          {products?.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
              <p className="text-gray-500">This store has not posted any products yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products?.map((product) => (
                <Link href={`/products/${product.slug}`} key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition">
                  <div className="relative h-40 md:h-48 bg-gray-100">
                    <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <p className="text-[10px] text-orange-600 font-bold uppercase truncate">{product.categories?.name}</p>
                    <h4 className="font-bold text-sm text-gray-900 mt-1 line-clamp-2 leading-tight">{product.title}</h4>
                    <p className="text-gray-900 font-bold mt-1.5 text-base">₦ {Number(product.price).toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-2">
                      <MapPin size={12} /> {product.location_state}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}