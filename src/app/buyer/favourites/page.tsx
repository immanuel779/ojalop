/* eslint-disable @next/next/no-img-element */
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
// Change line 5 to this:
import { Heart, MapPin, Search } from "lucide-react";
import FavouriteButton from "@/components/marketplace/FavouriteButton";

export default async function BuyerFavouritesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch real-time favourites
  const { data: favourites } = await supabase
    .from("favourites")
    .select("*, products(id, title, price, image_url, slug, location_state, condition)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Heart className="text-red-500 fill-red-500" size={28} /> Saved Items
          </h1>
          <p className="text-gray-500 mt-2">Keep track of products you love and want to buy later.</p>
        </div>
        <Link href="/search" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition w-full md:w-auto">
          <Search size={20} /> Find More Items
        </Link>
      </div>

      {/* Grid */}
      {!favourites || favourites.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="text-gray-300" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No saved items yet</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">When you see a product you like, click the heart icon to save it here for later.</p>
          <Link href="/search" className="inline-block bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition">
            Explore Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {favourites.map((fav) => {
            const product = Array.isArray(fav.products) ? fav.products[0] : fav.products;
            if (!product) return null;

            return (
              <div key={fav.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition group flex flex-col">
                
                <div className="relative h-40 md:h-56 bg-gray-100 overflow-hidden">
                  <Link href={`/products/${product.slug}`}>
                    <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </Link>
                  <div className="absolute top-3 right-3 z-10 scale-110">
                    {/* The favourite button removes it from this list in real-time */}
                    <FavouriteButton productId={product.id} initialIsFavourite={true} />
                  </div>
                </div>

                <Link href={`/products/${product.slug}`} className="p-4 flex-1 flex flex-col">
                  <h4 className="font-bold text-sm md:text-base text-gray-900 line-clamp-2 leading-tight group-hover:text-orange-600 transition">
                    {product.title}
                  </h4>
                  <p className="text-orange-600 font-bold mt-2 text-lg">
                    ₦ {Number(product.price).toLocaleString()}
                  </p>
                  
                  <div className="mt-auto pt-3 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <MapPin size={12} /> {product.location_state || 'Nigeria'}
                    </div>
                    <span className="bg-gray-50 px-2 py-1 rounded font-medium">{product.condition}</span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}