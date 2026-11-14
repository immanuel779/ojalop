/* eslint-disable @next/next/no-img-element */
import ProductActions from "./ProductActions";
import OrderStatusButton from "@/components/seller/OrderStatusButton"; // Importing the Accept button
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  PlusCircle, Store, Clock, CheckCircle2, XCircle, 
  Search, Rocket, ShieldCheck, Settings, 
  ChevronRight, Package, Wallet, MessageSquare, 
  ShoppingBag, ArrowRight, EyeOff, User, TrendingUp, 
} from "lucide-react";

// WhatsApp Icon SVG
const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.098-.069-.256-.081-1.416-.548-2.435-1.565-1.019-1.017-1.463-2.181-1.543-2.435-.081-.255-.063-.634.014-.933.081-.298.428-.956.783-1.108.169-.072.34-.062.482-.062.143 0 .285.011.41.011.126 0 .297-.048.465.311.169.359.576 1.409.625 1.509.049.099.081.216.011.348-.069.132-.13.213-.249.348-.119.135-.253.281-.359.389-.12.12-.248.253-.119.479.13.226.575.941 1.229 1.523.841.748 1.542.974 1.766 1.083.226.108.359.088.493-.062.134-.151.575-.669.729-.897.153-.228.307-.187.507-.118.2.068 1.262.595 1.478.704.216.108.359.163.412.254.052.091.052.523-.092.928z"></path>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.658 1.432 5.162L2 22l4.977-1.396A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.25c-1.636 0-3.153-.475-4.435-1.292l-.318-.204-3.295.865.879-3.216-.22-.351A8.203 8.203 0 0 1 3.75 12c0-4.549 3.701-8.25 8.25-8.25 4.55 0 8.25 3.701 8.25 8.25 0 4.549-3.7 8.25-8.25 8.25z"></path>
  </svg>
);

export const dynamic = 'force-dynamic'; // Ensures real-time data on every load

export default async function SellerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 1. Fetch Store
  const { data: store } = await supabase.from("stores").select("*").eq("owner_id", user.id).single();
  if (!store) redirect("/seller/onboarding");

  // 2. Fetch Products
  const { data: products } = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  // 3. Fetch Orders
  const { data: orders } = await supabase
    .from("orders")
    .select("*, products(title, price, image_url)")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  // 4. Fetch Buyer Profiles separately (Bulletproof way to get names)
  const buyerIds = orders?.map(o => o.buyer_id) || [];
  const { data: buyerProfiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, whatsapp, phone")
    .in("id", buyerIds);

  const profileMap = new Map();
  buyerProfiles?.forEach(p => profileMap.set(p.id, p));

  // 5. Fetch Unread Messages
  const { count: unreadMessages } = await supabase
    .from("messages")
    .select("*", { count: 'exact', head: true })
    .eq("is_read", false)
    .neq("sender_id", user.id)
    .in("conversation_id", (
      await supabase.from("conversations").select("id").eq("seller_id", user.id)
    ).data?.map(c => c.id) || []);

  // --- REAL CALCULATIONS ---
  const totalListings = products?.length || 0;
  
  // Revenue only counts if payment is released!
  const revenue = orders
    ?.filter(o => o.payment_status === 'released')
    .reduce((sum, o) => {
      const product = Array.isArray(o.products) ? o.products[0] : o.products;
      return sum + Number(product?.price || 0);
    }, 0) || 0;

  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
  const escrowHeld = orders
    ?.filter(o => o.payment_status === 'held_in_escrow')
    .reduce((sum, o) => {
      const product = Array.isArray(o.products) ? o.products[0] : o.products;
      return sum + Number(product?.price || 0);
    }, 0) || 0;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 bg-gray-50/50 min-h-screen">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Seller Dashboard</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 border border-orange-200">
              <Store size={14} /> {store.name}
            </span>
            {store.verification_status === 'verified' && (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 border border-green-200">
                <ShieldCheck size={14} /> Verified
              </span>
            )}
          </div>
        </div>
        <Link href="/seller/products/new" className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-700 shadow-lg shadow-orange-600/20 transition w-full md:w-auto">
          <PlusCircle size={20} /> Post New Ad
        </Link>
      </div>

      {/* 4-CARD PREMIUM STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/seller/orders" className="bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center"><Clock size={20} /></div>
            {pendingOrders > 0 && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span></span>}
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">Pending Orders</p>
            <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
          </div>
        </Link>

        <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><ShieldCheck size={20} /></div>
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">Held in Escrow</p>
            <p className="text-lg md:text-2xl font-bold text-blue-600 truncate">₦ {escrowHeld.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center"><Wallet size={20} /></div>
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">Total Revenue</p>
            <p className="text-lg md:text-2xl font-bold text-gray-900 truncate">₦ {revenue.toLocaleString()}</p>
          </div>
        </div>

        <Link href="/buyer/messages" className="bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center"><MessageSquare size={20} /></div>
          </div>
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">Unread Messages</p>
            <p className="text-2xl font-bold text-gray-900">{unreadMessages || 0}</p>
          </div>
        </Link>
      </div>

      {/* NEW PREMIUM TOOLS */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-orange-500" /> Premium Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/seller/promotions" className="bg-gradient-to-r from-gray-900 to-gray-800 p-5 rounded-2xl text-left relative overflow-hidden group hover:shadow-lg transition block">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition"><Rocket size={80} /></div>
            <h3 className="text-white font-bold mb-1 relative z-10">Promote an Ad</h3>
            <p className="text-gray-400 text-sm relative z-10 mb-4">Feature your listing on the homepage.</p>
            <span className="text-orange-500 text-sm font-bold flex items-center gap-1 relative z-10">Boost Now <ChevronRight size={16} /></span>
          </Link>
          
          <Link href="/seller/verification" className="bg-white border border-gray-200 p-5 rounded-2xl text-left group hover:border-orange-200 hover:shadow-md transition block">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4"><ShieldCheck size={20} /></div>
            <h3 className="text-gray-900 font-bold mb-1">Get Verified</h3>
            <p className="text-gray-500 text-sm mb-4">Build trust with buyers.</p>
            <span className="text-orange-600 text-sm font-bold flex items-center gap-1">Apply Now <ChevronRight size={16} /></span>
          </Link>

          <Link href="/seller/settings" className="bg-white border border-gray-200 p-5 rounded-2xl text-left group hover:border-orange-200 hover:shadow-md transition block">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4"><Settings size={20} /></div>
            <h3 className="text-gray-900 font-bold mb-1">Store Settings</h3>
            <p className="text-gray-500 text-sm mb-4">Manage logo & policies.</p>
            <span className="text-orange-600 text-sm font-bold flex items-center gap-1">Manage <ChevronRight size={16} /></span>
          </Link>

          <Link href="/seller/orders" className="bg-white border border-gray-200 p-5 rounded-2xl text-left group hover:border-orange-200 hover:shadow-md transition block">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mb-4"><ShoppingBag size={20} /></div>
            <h3 className="text-gray-900 font-bold mb-1">Manage Orders</h3>
            <p className="text-gray-500 text-sm mb-4">Accept, ship, and track orders.</p>
            <span className="text-orange-600 text-sm font-bold flex items-center gap-1">View All <ChevronRight size={16} /></span>
          </Link>
        </div>
      </div>

      {/* RECENT ORDERS PREVIEW (Upgraded with Actions) */}
      {orders && orders.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
            <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <ShoppingBag size={18} className="text-orange-500" /> Recent Orders
            </h2>
            <Link href="/seller/orders" className="text-sm text-orange-600 font-bold hover:underline flex items-center gap-1">
              Manage All <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="divide-y divide-gray-100">
            {orders.slice(0, 4).map((order) => {
              const product = Array.isArray(order.products) ? order.products[0] : order.products;
              const buyer = profileMap.get(order.buyer_id);
              
              // Format WhatsApp
              const rawPhone = buyer?.whatsapp || buyer?.phone;
              const cleanPhone = rawPhone?.replace(/\D/g, '');
              const whatsappLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=Hello%20${buyer?.display_name},%20I%20am%20reaching%20out%20about%20your%20order%20for%20"${product?.title}"%20on%20OjaLoop.` : null;

              return (
                <div key={order.id} className="p-4 md:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-gray-50 transition">
                  
                  {/* Product & Buyer Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden border shrink-0">
                      {product?.image_url && <img src={product.image_url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 line-clamp-1">{product?.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden shrink-0">
                          {buyer?.avatar_url ? (
                            <img src={buyer.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User size={12} className="m-auto text-gray-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 font-medium">Buyer: {buyer?.display_name || 'OjaLoop User'}</p>
                      </div>
                      <p className="text-orange-600 font-bold text-sm mt-1">₦ {Number(product?.price).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex flex-col md:flex-row items-center gap-3 shrink-0 border-t lg:border-t-0 border-gray-100 pt-3 lg:pt-0">
                    
                    {/* Contact Buttons */}
                    <div className="flex gap-2 w-full md:w-auto">
                      <Link href={`/buyer/messages`} title="Message In-App" className="flex-1 md:flex-none flex items-center justify-center p-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition">
                        <MessageSquare size={18} />
                      </Link>
                      {whatsappLink && (
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" title="Message on WhatsApp" className="flex-1 md:flex-none flex items-center justify-center p-2.5 bg-[#25D366]/10 text-[#25D366] rounded-xl hover:bg-[#25D366] hover:text-white transition">
                          <WhatsAppIcon />
                        </a>
                      )}
                    </div>

                    {/* Status / Accept Button */}
                    <div className="w-full md:w-auto flex justify-end">
                      {order.status === 'pending' ? (
                        <div className="w-full md:w-32">
                          <OrderStatusButton 
                            orderId={order.id} 
                            newStatus="accepted" 
                            label="Accept Order" 
                            colorClass="bg-gray-900 text-white hover:bg-gray-800 w-full shadow-md" 
                          />
                        </div>
                      ) : (
                        <div className="w-full md:w-auto flex justify-end">
                          {order.status === 'accepted' && <span className="inline-flex items-center gap-1.5 text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full text-xs font-bold"><CheckCircle2 size={14} /> Accepted</span>}
                          {order.status === 'shipped' && <span className="inline-flex items-center gap-1.5 text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full text-xs font-bold"><Package size={14} /> Shipped</span>}
                          {order.status === 'fulfilled' && <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full text-xs font-bold"><CheckCircle2 size={14} /> Completed</span>}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* YOUR LISTINGS TABLE (Kept as it was) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
          <h2 className="font-bold text-gray-900 text-lg">Your Listings ({totalListings})</h2>
          <div className="relative w-full md:w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search your ads..." className="pl-9 pr-4 py-2 w-full bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-orange-500" />
          </div>
        </div>
        
        {products?.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4"><Store size={32} className="text-gray-400" /></div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No listings yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">Create your first product to start reaching thousands of buyers.</p>
            <Link href="/seller/products/new" className="inline-block bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition">Create Your First Ad</Link>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold">Product</th>
                    <th className="p-4 font-bold">Price</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products?.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition group">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                             {product.image_url ? (
                               <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">No img</div>
                             )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition">{product.title}</p>
                            <p className="text-xs text-gray-500">{product.categories?.name || 'Uncategorized'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-gray-900">₦ {Number(product.price).toLocaleString()}</td>
                      <td className="p-4">
                        {product.status === 'draft' && <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">Draft</span>}
                        {product.status === 'pending_review' && <span className="inline-flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">Pending</span>}
                        {product.status === 'approved' && product.is_active && <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200"><CheckCircle2 size={12} /> Live</span>}
                        {product.status === 'approved' && !product.is_active && <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200"><EyeOff size={12} /> Closed</span>}
                        {product.status === 'rejected' && <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200"><XCircle size={12} /> Rejected</span>}
                      </td>
                      <td className="p-4 text-right">
                        <ProductActions id={product.id} slug={product.slug} isActive={product.is_active} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-gray-100">
              {products?.map((product) => (
                <div key={product.id} className="p-4 flex flex-col gap-3">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                      {product.image_url ? (
                        <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">No img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 line-clamp-1">{product.title}</p>
                      <p className="text-sm font-bold text-orange-600 mt-1">₦ {Number(product.price).toLocaleString()}</p>
                      <div className="mt-2 flex items-center gap-2">
                        {product.status === 'draft' && <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold">Draft</span>}
                        {product.status === 'approved' && product.is_active && <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">Live</span>}
                        {product.status === 'approved' && !product.is_active && <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">Closed</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end border-t border-gray-50 pt-2">
                    <ProductActions id={product.id} slug={product.slug} isActive={product.is_active} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}