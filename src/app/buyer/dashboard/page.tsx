/* eslint-disable @next/next/no-img-element */
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Package, Heart, Clock, CheckCircle2, XCircle, Search, 
  MessageSquare, ShieldCheck, HelpCircle, ArrowRight, 
  TrendingUp, ShoppingBag, MapPin, 
} from "lucide-react";
import FavouriteButton from "@/components/marketplace/FavouriteButton";

export default async function BuyerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 1. Fetch Orders
  const { data: orders } = await supabase
    .from("orders")
    .select("*, products(title, price, image_url, slug)")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  // 2. Fetch Favourites
  const { data: favourites } = await supabase
    .from("favourites")
    .select("*, products(id, title, price, image_url, slug, location_state)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // 3. Fetch Unread Messages Count
  const { count: unreadMessages } = await supabase
    .from("messages")
    .select("*", { count: 'exact', head: true })
    .eq("is_read", false)
    .neq("sender_id", user.id)
    .in("conversation_id", (
      await supabase.from("conversations").select("id").or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    ).data?.map(c => c.id) || []);

  const activeOrders = orders?.filter(o => o.status === 'pending' || o.status === 'accepted') || [];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 bg-gray-50/50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here is what is happening with your account today.</p>
        </div>
        <Link href="/search" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 shadow-lg transition w-full md:w-auto">
          <Search size={20} /> Continue Shopping
        </Link>
      </div>

      {/* 1. KPI STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/buyer/orders" className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition block">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Package size={20} /></div>
            <span className="text-xs font-bold text-gray-400">ALL TIME</span>
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{orders?.length || 0}</p>
          </div>
        </Link>

        <Link href="/buyer/orders?status=active" className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition block">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center"><Clock size={20} /></div>
            <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded">ACTIVE</span>
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">Active Orders</p>
            <p className="text-2xl font-bold text-gray-900">{activeOrders.length}</p>
          </div>
        </Link>

        <Link href="/buyer/favourites" className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition block">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center"><Heart size={20} /></div>
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">Saved Items</p>
            <p className="text-2xl font-bold text-gray-900">{favourites?.length || 0}</p>
          </div>
        </Link>

        <Link href="/buyer/messages" className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition block">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><MessageSquare size={20} /></div>
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">Unread Messages</p>
            <p className="text-2xl font-bold text-gray-900">{unreadMessages || 0}</p>
          </div>
        </Link>
      </div>

      {/* 2. BUYER PREMIUM TOOLS */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-orange-500" /> Quick Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/buyer/orders" className="bg-gradient-to-r from-gray-900 to-gray-800 p-5 rounded-2xl text-left relative overflow-hidden group hover:shadow-lg transition block">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
              <ShoppingBag size={80} />
            </div>
            <h3 className="text-white font-bold mb-1 relative z-10">Track Your Orders</h3>
            <p className="text-gray-400 text-sm relative z-10 mb-4">See the real-time status of all your pending and accepted requests.</p>
            <span className="text-orange-500 text-sm font-bold flex items-center gap-1 relative z-10">
              View Orders <ArrowRight size={16} />
            </span>
          </Link>

          <Link href="/how-it-works" className="bg-white border border-gray-200 p-5 rounded-2xl text-left group hover:border-orange-200 hover:shadow-md transition block">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-gray-900 font-bold mb-1">How Escrow Works</h3>
            <p className="text-gray-500 text-sm mb-4">Learn how OjaLoop protects your money until you confirm delivery.</p>
            <span className="text-orange-600 text-sm font-bold flex items-center gap-1">
              Learn More <ArrowRight size={16} />
            </span>
          </Link>

          <Link href="/contact" className="bg-white border border-gray-200 p-5 rounded-2xl text-left group hover:border-orange-200 hover:shadow-md transition block">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
              <HelpCircle size={20} />
            </div>
            <h3 className="text-gray-900 font-bold mb-1">Need Help?</h3>
            <p className="text-gray-500 text-sm mb-4">Our support team is available 24/7 to resolve any disputes.</p>
            <span className="text-orange-600 text-sm font-bold flex items-center gap-1">
              Contact Support <ArrowRight size={16} />
            </span>
          </Link>
        </div>
      </div>

      {/* 3. RECENT ORDERS */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <h2 className="font-bold text-gray-900 text-lg">Recent Orders</h2>
          <Link href="/buyer/orders" className="text-sm text-orange-600 font-bold hover:underline">View All</Link>
        </div>
        
        {!orders || orders.length === 0 ? (
          <div className="p-12 text-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <ShoppingBag className="text-gray-400" size={28} />
             </div>
             <h3 className="text-lg font-bold text-gray-900 mb-1">No orders yet</h3>
             <p className="text-gray-500 mb-4">Start exploring to find amazing deals.</p>
             <Link href="/search" className="text-orange-600 font-bold hover:underline">Browse Marketplace</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.slice(0, 5).map((order) => {
              const product = Array.isArray(order.products) ? order.products[0] : order.products;
              
              return (
                <div key={order.id} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden border shrink-0">
                      {product?.image_url ? (
                        <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><Package size={20} /></div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 line-clamp-1">{product?.title}</p>
                      <p className="text-sm text-gray-500">Order #{order.id.split('-')[0].toUpperCase()}</p>
                      <p className="text-orange-600 font-bold mt-1">₦ {Number(product?.price).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:items-end gap-2">
                    {order.status === 'pending' && <span className="inline-flex items-center gap-1.5 text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-full text-xs font-bold"><Clock size={14} /> Awaiting Seller</span>}
                    {order.status === 'accepted' && <span className="inline-flex items-center gap-1.5 text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold"><CheckCircle2 size={14} /> Accepted</span>}
                    {order.status === 'fulfilled' && <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full text-xs font-bold"><CheckCircle2 size={14} /> Completed</span>}
                    {order.status === 'declined' && <span className="inline-flex items-center gap-1.5 text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full text-xs font-bold"><XCircle size={14} /> Declined</span>}
                    
                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. FAVOURITES */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <h2 className="font-bold text-gray-900 text-lg">Saved Items</h2>
          <Link href="/buyer/favourites" className="text-sm text-orange-600 font-bold hover:underline">View All</Link>
        </div>
        
        {!favourites || favourites.length === 0 ? (
          <div className="p-12 text-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <Heart className="text-gray-400" size={28} />
             </div>
             <h3 className="text-lg font-bold text-gray-900 mb-1">No saved items</h3>
             <p className="text-gray-500">Tap the heart icon on any product to save it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 md:p-5">
            {favourites.slice(0, 4).map((fav) => {
               const product = Array.isArray(fav.products) ? fav.products[0] : fav.products;
               return (
              <div key={fav.id} className="relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition group flex flex-col">
                <div className="relative h-40 md:h-48 bg-gray-100">
                  {product?.image_url ? (
                    <img src={product.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><Package size={24} /></div>
                  )}
                  <div className="absolute top-2 right-2 z-10">
                     <FavouriteButton productId={product?.id} initialIsFavourite={true} />
                  </div>
                </div>
                <Link href={`/products/${product?.slug}`} className="p-3 md:p-4 flex-1 flex flex-col">
                  <h4 className="font-bold text-sm text-gray-900 line-clamp-2 leading-tight">{product?.title}</h4>
                  <p className="text-orange-600 font-bold mt-1.5 text-base">₦ {Number(product?.price).toLocaleString()}</p>
                  
                  <div className="mt-auto pt-3 flex items-center gap-1 text-[10px] text-gray-500">
                     <MapPin size={12} /> {product?.location_state || 'Nigeria'}
                  </div>
                </Link>
              </div>
            )})}
          </div>
        )}
      </div>

    </div>
  );
}