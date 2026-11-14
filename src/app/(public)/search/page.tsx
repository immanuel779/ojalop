/* eslint-disable @next/next/no-img-element */
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MapPin, Search as SearchIcon, CheckCircle2, Heart } from "lucide-react";
import SearchFilters from "@/components/marketplace/SearchFilters";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    q?: string; 
    category?: string; 
    state?: string; 
    condition?: string;
    min_price?: string;
    max_price?: string;
    sort?: string;
  }>;
}) {
  const resolvedParams = await searchParams;
  const supabase = await createClient();

  // 1. Start building the query
  let query = supabase
    .from("products")
    .select("*, stores(name, verification_status), categories(name)")
    .eq("status", "approved")
    .eq("is_active", true);

  // 2. Apply Filters
  if (resolvedParams.q) {
    query = query.ilike("title", `%${resolvedParams.q}%`);
  }
  if (resolvedParams.category) {
    query = query.eq("category_id", resolvedParams.category);
  }
  if (resolvedParams.state) {
    query = query.eq("location_state", resolvedParams.state);
  }
  if (resolvedParams.condition) {
    query = query.eq("condition", resolvedParams.condition);
  }
  if (resolvedParams.min_price) {
    query = query.gte("price", Number(resolvedParams.min_price));
  }
  if (resolvedParams.max_price) {
    query = query.lte("price", Number(resolvedParams.max_price));
  }

  // 3. Apply Sorting
  if (resolvedParams.sort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (resolvedParams.sort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false }); // Default to newest
  }

  // 4. Execute query
  const { data: products } = await query;

  // 5. Fetch categories for the filter sidebar
  const { data: categories } = await supabase.from("categories").select("id, name").eq("is_active", true).order("name");

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
      
      {/* Mobile Search Bar (In case they didn't use the header one) */}
      <form action="/search" method="GET" className="md:hidden flex items-center bg-white border border-gray-200 rounded-xl px-4 py-3 mb-6 shadow-sm">
        <SearchIcon size={18} className="text-gray-400" />
        <input type="text" name="q" defaultValue={resolvedParams.q || ""} placeholder="Search marketplace..." className="flex-1 ml-2 bg-transparent outline-none text-sm" />
      </form>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* COMPONENT: The advanced filters */}
        <SearchFilters categories={categories || []} />

        {/* MAIN RESULTS */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {resolvedParams.q ? `Results for "${resolvedParams.q}"` : 
               resolvedParams.category && categories?.find(c => c.id === resolvedParams.category)?.name ? 
               categories.find(c => c.id === resolvedParams.category)?.name : 
               "All Listings"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">{products?.length || 0} items found</p>
          </div>

          {products?.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500">Try adjusting your search, clearing filters, or looking in a different category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products?.map((product) => (
                <Link href={`/products/${product.slug}`} key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition group">
                  
                  {/* Image Section */}
                  <div className="relative h-40 md:h-48 bg-gray-100 overflow-hidden">
                    <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    
                    {product.stores?.verification_status === 'verified' && (
                      <div className="absolute top-2 left-2 bg-green-700/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                        <CheckCircle2 size={10} /> Verified
                      </div>
                    )}
                    
                    <button className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition shadow-sm text-gray-400 hover:text-red-500">
                      <Heart size={14} />
                    </button>
                  </div>

                  {/* Details Section */}
                  <div className="p-3 md:p-4 flex-1 flex flex-col">
                    <p className="text-[10px] text-orange-600 font-bold uppercase truncate mb-1">{product.categories?.name}</p>
                    <h4 className="font-bold text-sm text-gray-900 line-clamp-2 leading-tight group-hover:text-orange-600 transition">{product.title}</h4>
                    
                    <p className="text-gray-900 font-bold mt-2 text-lg">₦ {Number(product.price).toLocaleString()}</p>
                    
                    <div className="flex items-center justify-between text-[11px] text-gray-500 mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-orange-500" /> {product.location_state}
                      </div>
                      <span className="bg-gray-50 px-2 py-0.5 rounded text-gray-600 font-medium">{product.condition}</span>
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