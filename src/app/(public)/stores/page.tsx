/* eslint-disable @next/next/no-img-element */
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Store as StoreIcon, MapPin, CheckCircle2, ArrowRight } from "lucide-react";

export default async function StoresDirectoryPage() {
  const supabase = await createClient();

  const { data: stores } = await supabase
    .from("stores")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Official Stores Directory</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">Shop directly from verified Nigerian businesses and dealerships.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores?.map((store) => (
          <Link href={`/stores/${store.slug}`} key={store.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                {store.logo_url ? (
                  <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <StoreIcon className="text-gray-400" size={28} />
                )}
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition flex items-center gap-1">
                  {store.name}
                  {store.verification_status === 'verified' && <CheckCircle2 size={16} className="text-green-500" />}
                </h2>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <MapPin size={12} /> {store.location_state || 'Nigeria'}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2 mb-4 h-10">{store.description}</p>
            <div className="flex items-center justify-between text-orange-600 text-sm font-bold">
              <span>Visit Store</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}