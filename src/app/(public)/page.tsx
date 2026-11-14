/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { 
  Search, MapPin, ShieldCheck, ArrowRight, Heart, Share2, 
  SlidersHorizontal, LayoutGrid, List, Flame, CheckCircle2, 
  ChevronDown, Sparkles, TrendingUp 
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import SafeImage from "@/components/marketplace/SafeImage";

// THIS FORCES THE PAGE TO FETCH FRESH DATA ON EVERY SINGLE VISIT
export const dynamic = 'force-dynamic';

const FALLBACK_IMAGES: Record<string, string> = {
  "vehicles": "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&q=80",
  "phones-tablets": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80",
  "fashion-beauty": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&q=80",
  "home-furniture": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80",
  "animals-pets": "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=500&q=80",
  "baby-kids": "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&q=80",
  "commercial-equipment": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&q=80",
  "events-entertainment": "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&q=80",
  "professional-services": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&q=80",
  "electronics": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&q=80",
  "jobs": "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=500&q=80",
  "property": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&q=80",
  "services": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80",
  "repair-construction": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&q=80",
  "health-wellness": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=500&q=80",
  "default": "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=500&q=80"
};

export default async function HomePage() {
  const supabase = await createClient();
  
  // 1. Fetch Real-Time Categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("name");
  
  // 2. Fetch Real-Time Products (Only Approved, Active, and with an Image)
  const { data: products } = await supabase
    .from("products")
    .select("*, stores(name, verification_status, logo_url), categories(name)")
    .eq("status", "approved")
    .eq("is_active", true)
    .not("image_url", "is", null)
    .order("created_at", { ascending: false })
    .limit(30);

  // 3. Fetch Real-Time Product Count for the "Explore All" button
  const { count: totalProducts } = await supabase
    .from("products")
    .select("*", { count: 'exact', head: true })
    .eq("status", "approved")
    .eq("is_active", true);

  // 4. Fetch Real-Time Featured Stores
  const { data: stores } = await supabase
    .from("stores")
    .select("id, name, slug, logo_url, verification_status, location_state")
    .eq("is_active", true)
    .limit(4);

  // BULLETPROOF SLICING: Filter out any products with broken data
  const validProducts = products?.filter(p => p.image_url && p.image_url.startsWith('http')) || [];

  // Dynamic Sections
  const dealOfTheDay = validProducts[0];
  const promotedAds = validProducts.slice(1, 3);
  const trendingListings = validProducts.slice(3, 11);
  const nearYouListings = validProducts.slice(11, 15);

  // Dynamic Top Markets Calculation
  const stateCounts: Record<string, number> = {};
  validProducts.forEach((p) => {
    if (p.location_state) {
      stateCounts[p.location_state] = (stateCounts[p.location_state] || 0) + 1;
    }
  });
  const topMarkets = Object.entries(stateCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <div className="pb-10 bg-gray-50">
      
      {/* MOBILE SEARCH */}
      <div className="px-4 pt-4 md:hidden">
        <form action="/search" method="GET" className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
          <Search size={18} className="text-gray-400" />
          <input type="text" name="q" placeholder="Search products, services..." className="flex-1 ml-2 bg-transparent outline-none text-sm" />
        </form>
      </div>

      {/* 1. HERO BANNER */}
      <div className="px-4 mt-4">
        <div className="bg-gradient-to-r from-orange-600 to-orange-800 rounded-3xl overflow-hidden relative shadow-lg">
          <div className="p-6 md:p-10 relative z-10 w-full md:w-2/3">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-2 text-white">
              Buy & Sell Safely Across Nigeria
            </h1>
            <p className="text-orange-100 text-sm md:text-lg mb-6">
              Direct deals and secure payments with OjaLoop Escrow.
            </p>
            <div className="flex gap-3">
              <Link href="/seller/onboarding" className="bg-white text-orange-600 px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 flex items-center gap-2 transition">
                <span className="text-lg leading-none">+</span> Post Ad
              </Link>
              <Link href="/search" className="bg-orange-800/50 text-white px-5 py-2.5 rounded-lg text-sm font-bold backdrop-blur-sm border border-orange-500/30 flex items-center gap-2 hover:bg-orange-800/70 transition">
                <Search size={16} /> Browse Listings
              </Link>
            </div>
          </div>
          <div className="hidden md:block absolute right-0 bottom-0 w-1/3 h-full bg-[url('https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=600&q=80')] bg-cover bg-center opacity-80 mix-blend-overlay"></div>
        </div>
      </div>

      {/* 2. DEAL OF THE DAY */}
      {dealOfTheDay ? (
        <div className="px-4 mt-6">
          <Link href={`/products/${dealOfTheDay.slug}`} className="bg-orange-50 border border-orange-100 rounded-2xl p-3 flex gap-4 items-center hover:shadow-md transition block">
            <div className="w-24 h-24 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-orange-100">
              <SafeImage src={dealOfTheDay.image_url} alt={dealOfTheDay.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1 bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded-full mb-1">
                <Flame size={12} /> DEAL OF THE DAY
              </div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight truncate">{dealOfTheDay.title}</h3>
              <p className="text-orange-600 font-bold text-xl">₦ {Number(dealOfTheDay.price).toLocaleString()}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <MapPin size={12} /> {dealOfTheDay.location_state || 'Nigeria'}
              </div>
            </div>
          </Link>
        </div>
      ) : (
        <div className="px-4 mt-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center text-gray-500 text-sm">
            No active listings today. Check back later!
          </div>
        </div>
      )}

      {/* 3. POPULAR CATEGORIES */}
      {categories && categories.length > 0 && (
        <div className="mt-8">
          <div className="px-4 flex items-center justify-between mb-4">
            <div>
              <h2 className="text-orange-600 font-bold text-xs uppercase tracking-wider mb-1">Browse Sectors</h2>
              <h3 className="font-bold text-2xl text-gray-900">Explore Categories</h3>
            </div>
            <Link href="/search" className="text-orange-600 text-sm font-semibold flex items-center gap-1 hover:underline">
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div className="flex overflow-x-auto gap-4 px-4 pb-4 scrollbar-hide snap-x">
            {categories.map((cat) => {
              const imageUrl = cat.image_url || FALLBACK_IMAGES[cat.slug] || FALLBACK_IMAGES["default"];
              return (
                <Link key={cat.id} href={`/search?category=${cat.id}`} className="relative min-w-[150px] md:min-w-[180px] h-[200px] rounded-2xl overflow-hidden snap-start group">
                  <SafeImage src={imageUrl} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h4 className="font-bold text-lg leading-tight mb-1">{cat.name}</h4>
                    <p className="text-xs text-gray-300">Explore ads</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. AFFILIATE BANNER */}
      <div className="px-4 mt-6">
        <div className="bg-gray-900 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 bg-orange-500/20 text-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <Flame size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold">Earn with OjaLoop Affiliates</h3>
              <p className="text-gray-400 text-xs mt-1">Get your referral link and earn when people you refer spend on OjaLoop.</p>
            </div>
          </div>
          <Link href="/affiliate/dashboard" className="hidden md:block bg-orange-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-orange-600 transition">
            Join Program
          </Link>
        </div>
      </div>

      {/* 5. PREMIUM STORES / PROMOTED ADS */}
      {promotedAds.length > 0 && (
        <div className="mt-8 bg-gray-100 py-8">
          <div className="px-4 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-orange-600" size={24} />
              <h3 className="font-bold text-xl text-gray-900">Promoted Ads</h3>
            </div>
            <span className="bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded">SPONSORED</span>
          </div>
          <div className="flex overflow-x-auto gap-4 px-4 pb-4 scrollbar-hide snap-x">
            {promotedAds.map((product) => {
              const category = Array.isArray(product.categories) ? product.categories[0] : product.categories;
              return (
                <Link href={`/products/${product.slug}`} key={product.id} className="min-w-[240px] bg-white rounded-2xl border border-gray-200 overflow-hidden snap-start relative block hover:shadow-lg transition">
                  <div className="absolute top-3 left-3 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded z-10 flex items-center gap-1">
                    <Sparkles size={10} className="text-orange-500"/> PREMIUM
                  </div>
                  <SafeImage src={product.image_url} alt={product.title} className="w-full h-40 object-cover" />
                  <div className="p-3">
                    <p className="text-[10px] text-orange-600 font-bold uppercase mb-1">{category?.name}</p>
                    <h4 className="font-bold text-sm text-gray-900 truncate">{product.title}</h4>
                    <p className="text-gray-900 font-bold mt-1">₦ {Number(product.price).toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-2">
                      <MapPin size={12} /> {product.location_state}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. FEATURED STORES */}
      {stores && stores.length > 0 && (
        <div className="px-4 mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-orange-600 font-bold text-xs uppercase tracking-wider mb-1">Official Stores</h2>
              <h3 className="font-bold text-2xl text-gray-900">Featured Dealerships</h3>
            </div>
            <Link href="/stores" className="border border-orange-200 text-orange-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 hover:bg-orange-50">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stores.map((store) => (
              <Link href={`/stores/${store.slug}`} key={store.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col items-center text-center hover:shadow-md transition group">
                <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 overflow-hidden mb-3">
                  {store.logo_url ? (
                    <SafeImage src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-gray-400 bg-gray-50">{store.name.charAt(0)}</div>
                  )}
                </div>
                <h4 className="font-bold text-gray-900 group-hover:text-orange-600 line-clamp-1">{store.name}</h4>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin size={10} /> {store.location_state || 'Nigeria'}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 7. TOP MARKETS */}
      {topMarkets.length > 0 && (
        <div className="px-4 mt-8">
          <div className="bg-white rounded-2xl p-4 border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="text-orange-600" size={18} /> Top Markets:
            </h3>
            
            <Link href="/search" className="w-full bg-orange-600 text-white rounded-xl p-3 flex justify-between items-center mb-3 hover:bg-orange-700 transition">
              <span className="font-bold text-sm">All Nigeria</span>
              <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">{totalProducts || 0}+</span>
            </Link>
            
            <div className="grid grid-cols-2 gap-2">
              {topMarkets.map(([state, count]) => (
                <Link href={`/search?state=${state}`} key={state} className="border border-gray-100 rounded-xl p-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition">
                  <span className="font-medium text-sm text-gray-800">{state}</span>
                  <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[10px] font-bold">{count}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. TRENDING LISTINGS */}
      {trendingListings.length > 0 && (
        <div className="px-4 mt-8">
          <h2 className="text-orange-600 font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
            <TrendingUp size={14} /> Handpicked Deals
          </h2>
          <h3 className="font-bold text-2xl text-gray-900 mb-4">Trending in Nigeria</h3>
          
          <div className="flex items-center gap-2 mb-4">
            <Link href="/search" className="flex-1 border border-gray-200 bg-white rounded-xl py-2 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <SlidersHorizontal size={16} /> Apply Filters
            </Link>
            <button className="w-10 h-10 border border-orange-200 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
              <LayoutGrid size={18} />
            </button>
            <button className="w-10 h-10 border border-gray-200 bg-white text-gray-400 rounded-xl flex items-center justify-center">
              <List size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {trendingListings.map((product) => {
              const store = Array.isArray(product.stores) ? product.stores[0] : product.stores;
              const category = Array.isArray(product.categories) ? product.categories[0] : product.categories;
              
              return (
                <Link href={`/products/${product.slug}`} key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition group">
                  <div className="relative h-40 md:h-56 bg-gray-100 overflow-hidden">
                    <SafeImage src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {store?.verification_status === 'verified' && (
                      <div className="absolute top-2 left-2 bg-green-700/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                        <CheckCircle2 size={10} /> Verified
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      <button className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center"><Share2 size={12} /></button>
                      <button className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center"><Heart size={12} /></button>
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <p className="text-[10px] text-orange-600 font-bold uppercase truncate">{category?.name || 'Uncategorized'}</p>
                    <h4 className="font-bold text-sm text-gray-900 mt-1 line-clamp-2 leading-tight group-hover:text-orange-600 transition">{product.title}</h4>
                    <p className="text-gray-900 font-bold mt-1.5 text-base">₦ {Number(product.price).toLocaleString()}</p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-2">
                      <MapPin size={12} /> {product.location_state} <span className="mx-1">•</span> {product.condition}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 bg-gray-200 rounded-full overflow-hidden">
                          {store?.logo_url && <SafeImage src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />}
                        </div>
                        <span className="text-[10px] font-medium text-gray-600 truncate max-w-[80px]">{store?.name}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 9. EXPLORE ALL BUTTON */}
      <div className="px-4 mt-8">
        <Link href="/search" className="w-full bg-orange-600 text-white rounded-xl py-4 flex items-center justify-center gap-2 font-bold shadow-sm shadow-orange-600/20 hover:bg-orange-700 transition">
          Explore All {totalProducts || 0}+ Listings <ArrowRight size={18} />
        </Link>
      </div>

      {/* 10. ESCROW BANNER */}
      <div className="px-4 mt-8">
        <div className="bg-gray-100 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-24 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
               <ShieldCheck className="text-orange-500" size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Safe payment with OjaLoop Escrow</h3>
              <p className="text-gray-600 text-sm mb-4">When you buy an item on OjaLoop, your money is held safely in Escrow until you receive it and confirm it matches the description.</p>
              <button className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                How OjaLoop works <ChevronDown size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 11. LISTINGS NEAR YOU */}
      {nearYouListings.length > 0 && (
        <div className="px-4 mt-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="border border-orange-200 text-orange-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <MapPin size={12} /> LOCAL MARKETPLACE
            </span>
          </div>
          <h3 className="font-bold text-2xl text-gray-900">Listings Near You</h3>
          <p className="text-gray-500 text-sm mb-4">Verified items available for immediate inspection, pickup, or same-day dispatch.</p>
          
          <div className="bg-gray-100 p-2 rounded-xl flex items-center gap-2 overflow-x-auto scrollbar-hide mb-4">
            <div className="bg-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 flex-shrink-0 shadow-sm">
              Your Location <ChevronDown size={14} />
            </div>
            <span className="text-xs font-bold text-gray-500 px-2">Radius:</span>
            {['5 km', '10 km', '25 km', '50 km'].map(r => (
              <button key={r} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 ${r === '10 km' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600'}`}>
                {r}
              </button>
            ))}
          </div>

          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x">
            {nearYouListings.map((product) => (
               <Link href={`/products/${product.slug}`} key={product.id} className="min-w-[200px] bg-white rounded-2xl border border-gray-100 overflow-hidden snap-start flex flex-col hover:shadow-md transition">
                <div className="relative h-40 bg-gray-100">
                  <SafeImage src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-gray-900/80 text-white text-[10px] px-2 py-1 rounded"> {product.location_city || product.location_state}</div>
                  <div className="absolute bottom-2 left-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                    <ShieldCheck size={10} /> Escrow Protected
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{product.title}</h4>
                  <p className="text-gray-900 font-bold text-lg mt-1">₦ {Number(product.price).toLocaleString()}</p>
                  <p className="text-xs text-gray-500 mt-1">{product.condition} • {product.location_city || product.location_state}</p>
                  <button className="w-full mt-3 bg-orange-600 text-white py-2 rounded-lg text-sm font-bold">Contact Seller</button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 12. BOTTOM DARK TRUST BANNER */}
      <div className="px-4 mt-6">
        <div className="bg-gray-900 rounded-3xl p-6 relative overflow-hidden">
          <ShieldCheck className="text-orange-500 mb-4" size={32} />
          <h3 className="text-white font-bold text-xl mb-2">Buy and Sell Safely with OjaLoop</h3>
          <p className="text-gray-400 text-sm mb-6">Your payment is held securely until you receive, inspect, and confirm your purchase.</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck size={14} /> No risk. No release until you are satisfied.
          </div>
        </div>
      </div>

    </div>
  );
}