/* eslint-disable @next/next/no-img-element */
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Calendar, 
  ShieldAlert, ShieldCheck, ShoppingBag, Package, 
  Wallet, Store, AlertTriangle, MessageSquare
} from "lucide-react";

export default async function UserInvestigationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();

  // 1. Fetch the User Profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", resolvedParams.id)
    .single();

  if (profileError || !profile) notFound();

  // 2. Fetch User Roles
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", profile.id);

  const userRoles = roles?.map(r => r.role) || [];

  // 3. Fetch Store (if they are a seller)
  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_id", profile.id)
    .maybeSingle();

  // 4. Fetch Orders (As Buyer)
  const { data: buyerOrders } = await supabase
    .from("orders")
    .select("*, products(title, price)")
    .eq("buyer_id", profile.id)
    .order("created_at", { ascending: false });

  // 5. Fetch Orders (As Seller)
  const { data: sellerOrders } = await supabase
    .from("orders")
    .select("*, products(title, price)")
    .eq("seller_id", profile.id)
    .order("created_at", { ascending: false });

  // 6. Fetch Their Listings
  const { data: listings } = await supabase
    .from("products")
    .select("id, title, price, status, created_at")
    .eq("store_id", store?.id || "none")
    .order("created_at", { ascending: false });

  // --- FINANCIAL CALCULATIONS ---
  const totalSpent = buyerOrders
    ?.filter(o => o.payment_status === 'released' || o.payment_status === 'held_in_escrow')
    .reduce((sum, o) => {
      const product = Array.isArray(o.products) ? o.products[0] : o.products;
      return sum + Number(product?.price || 0);
    }, 0) || 0;

  const totalEarned = sellerOrders
    ?.filter(o => o.payment_status === 'released')
    .reduce((sum, o) => {
      const product = Array.isArray(o.products) ? o.products[0] : o.products;
      return sum + Number(product?.price || 0);
    }, 0) || 0;

  return (
    <div className="space-y-6 pb-20">
      
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-orange-600 transition">
        <ArrowLeft size={16} /> Back to Users
      </Link>

      {/* HEADER PROFILE */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-gray-900 to-gray-800"></div>
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-12">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-100 shadow-lg overflow-hidden shrink-0 flex items-center justify-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-gray-400">{profile.display_name?.charAt(0)?.toUpperCase() || 'U'}</span>
              )}
            </div>
            <div className="flex-1 text-center md:text-left pt-2 md:pt-0">
              <h1 className="text-3xl font-bold text-gray-900">{profile.display_name || "Unnamed User"}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Mail size={14} /> {profile.email || 'No email'}</span>
                <span className="flex items-center gap-1"><Phone size={14} /> {profile.phone || 'No phone'}</span>
                <span className="flex items-center gap-1"><Calendar size={14} /> Joined {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="shrink-0">
              <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border uppercase ${
                profile.account_status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {profile.account_status === 'active' ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                {profile.account_status} Account
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-6">
            {userRoles.map(role => (
              <span key={role} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold uppercase">
                {role.replace('_', ' ')}
              </span>
            ))}
            {store && (
              <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-bold uppercase flex items-center gap-1">
                <Store size={12} /> Seller: {store.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* FINANCIAL TRACKING */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2"><ShoppingBag size={16} /> Total Money Spent</p>
          <p className="text-3xl font-bold text-gray-900">₦ {totalSpent.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Across {buyerOrders?.length || 0} orders</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2"><Wallet size={16} /> Total Money Earned</p>
          <p className="text-3xl font-bold text-green-600">₦ {totalEarned.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">From {sellerOrders?.length || 0} fulfilled orders</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1 flex items-center gap-2"><Package size={16} /> Total Listings</p>
          <p className="text-3xl font-bold text-gray-900">{listings?.length || 0}</p>
          <p className="text-xs text-gray-400 mt-1">Products posted by this user</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* RECENT ACTIVITY: ORDERS */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag size={18} /> Recent Orders
          </div>
          <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
            {buyerOrders?.length === 0 && sellerOrders?.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No orders found.</div>
            ) : (
              [...(buyerOrders || []), ...(sellerOrders || [])].slice(0, 10).map((order) => {
                const product = Array.isArray(order.products) ? order.products[0] : order.products;
                const isBuyer = order.buyer_id === profile.id;
                
                return (
                  <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <p className="font-bold text-sm text-gray-900 line-clamp-1">{product?.title}</p>
                      <p className="text-xs text-gray-500">{isBuyer ? "Bought as Buyer" : "Sold as Seller"} • {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">₦ {Number(product?.price).toLocaleString()}</p>
                      <span className={`text-[10px] font-bold uppercase ${
                        order.payment_status === 'released' ? 'text-green-600' :
                        order.payment_status === 'held_in_escrow' ? 'text-blue-600' : 'text-orange-600'
                      }`}>{order.payment_status}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RECENT ACTIVITY: LISTINGS */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 font-bold text-gray-900 flex items-center gap-2">
            <Package size={18} /> Listings & Content
          </div>
          <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
            {listings?.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No listings found.</div>
            ) : (
              listings?.slice(0, 10).map((listing) => (
                <div key={listing.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-bold text-sm text-gray-900 line-clamp-1">{listing.title}</p>
                    <p className="text-xs text-gray-500">{new Date(listing.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">₦ {Number(listing.price).toLocaleString()}</p>
                    <span className={`text-[10px] font-bold uppercase ${
                      listing.status === 'approved' ? 'text-green-600' : 'text-orange-600'
                    }`}>{listing.status.replace('_', ' ')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}