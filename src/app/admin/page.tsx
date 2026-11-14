/* eslint-disable @next/next/no-img-element */
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { 
  Users, Package, Clock, ShieldCheck, Wallet, 
  TrendingUp, ArrowRight, Megaphone, AlertTriangle, 
  CheckCircle2, ArrowUpRight, ShieldAlert, UserCheck
} from "lucide-react";

export const dynamic = 'force-dynamic'; // Real-time data on every load

export default async function AdminOverview() {
  const supabase = await createClient();

  // --- FETCH ALL REAL-TIME STATS IN PARALLEL ---
  const [
    { count: totalUsers },
    { count: totalStores },
    { count: totalListings },
    { count: pendingListings },
    { count: pendingOrders },
    { count: totalAffiliates },
    { data: ordersData },
    { data: promotionsData },
    { data: recentOrders }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('stores').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('affiliates').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('payment_status, platform_fee, products(price)'), // For math
    supabase.from('promotions').select('amount').eq('status', 'active'),
    supabase.from('orders').select('*, products(title, price), buyer:buyer_id(display_name)').order('created_at', { ascending: false }).limit(5)
  ]);

  // --- CALCULATE FINANCIALS ---
  let totalRevenue = 0;
  let heldInEscrow = 0;
  
  ordersData?.forEach((order) => {
    const product = Array.isArray(order.products) ? order.products[0] : order.products;
    const price = Number(product?.price || 0);
    
    if (order.payment_status === 'released') {
      // Use platform_fee if available, otherwise fallback to 5% math
      const fee = order.platform_fee ? Number(order.platform_fee) : price * 0.05;
      totalRevenue += fee;
    } else if (order.payment_status === 'held_in_escrow') {
      heldInEscrow += price;
    }
  });

  const adRevenue = promotionsData?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const totalPlatformRevenue = totalRevenue + adRevenue;

  return (
    <div className="space-y-8 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Command Center</h1>
          <p className="text-gray-500 mt-1">Platform overview and real-time analytics.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/listings" className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-50 transition">
            Review Listings
          </Link>
          <Link href="/admin/orders" className="bg-gray-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-800 transition">
            Manage Orders
          </Link>
        </div>
      </div>

      {/* 1. FINANCIAL HIGHLIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-3xl shadow-lg text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center"><Wallet size={20} /></div>
            <span className="text-xs font-bold text-gray-400 uppercase">Platform Revenue</span>
          </div>
          <p className="text-3xl font-bold">₦ {totalPlatformRevenue.toLocaleString()}</p>
          <p className="text-xs text-green-400 mt-2 flex items-center gap-1"><ArrowUpRight size={12} /> Escrow Fees + Ad Sales</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><ShieldCheck size={20} /></div>
            <span className="text-xs font-bold text-gray-400 uppercase">Held in Escrow</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">₦ {heldInEscrow.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">Funds waiting for buyer confirmation</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center"><Megaphone size={20} /></div>
            <span className="text-xs font-bold text-gray-400 uppercase">Ad Revenue</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">₦ {adRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">From active promoted listings</p>
        </div>
      </div>

      {/* 2. PLATFORM HEALTH */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-orange-500" /> Platform Health
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-center">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2"><Users size={18} /></div>
            <p className="text-2xl font-bold text-gray-900">{totalUsers || 0}</p>
            <p className="text-xs font-medium text-gray-500">Total Users</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-center">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2"><UserCheck size={18} /></div>
            <p className="text-2xl font-bold text-gray-900">{totalStores || 0}</p>
            <p className="text-xs font-medium text-gray-500">Active Stores</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-center">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-2"><Package size={18} /></div>
            <p className="text-2xl font-bold text-gray-900">{totalListings || 0}</p>
            <p className="text-xs font-medium text-gray-500">Listings</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm text-center">
            <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-2"><Users size={18} /></div>
            <p className="text-2xl font-bold text-gray-900">{totalAffiliates || 0}</p>
            <p className="text-xs font-medium text-gray-500">Affiliates</p>
          </div>
          
          {/* Action Required Items */}
          <Link href="/admin/listings?status=pending" className="bg-orange-50 p-4 rounded-2xl border border-orange-200 shadow-sm text-center hover:bg-orange-100 transition">
            <div className="w-10 h-10 bg-orange-200 text-orange-700 rounded-full flex items-center justify-center mx-auto mb-2"><Clock size={18} /></div>
            <p className="text-2xl font-bold text-orange-700">{pendingListings || 0}</p>
            <p className="text-xs font-medium text-orange-600">Pending Listings</p>
          </Link>

          <Link href="/admin/orders?status=pending" className="bg-red-50 p-4 rounded-2xl border border-red-200 shadow-sm text-center hover:bg-red-100 transition">
            <div className="w-10 h-10 bg-red-200 text-red-700 rounded-full flex items-center justify-center mx-auto mb-2"><AlertTriangle size={18} /></div>
            <p className="text-2xl font-bold text-red-700">{pendingOrders || 0}</p>
            <p className="text-xs font-medium text-red-600">Pending Orders</p>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 3. RECENT ACTIVITY (Orders) */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
            <h2 className="font-bold text-gray-900 text-lg">Recent Platform Activity</h2>
            <Link href="/admin/orders" className="text-sm text-orange-600 font-bold hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentOrders?.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No recent activity.</div>
            ) : (
              recentOrders?.map((order) => {
                const product = Array.isArray(order.products) ? order.products[0] : order.products;
                const buyer = Array.isArray(order.buyer) ? order.buyer[0] : order.buyer;
                
                return (
                  <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                        <Package size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm line-clamp-1">{product?.title}</p>
                        <p className="text-xs text-gray-500">Buyer: {buyer?.display_name || 'User'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">₦{Number(product?.price).toLocaleString()}</p>
                      <p className={`text-[10px] font-bold uppercase ${
                        order.status === 'pending' ? 'text-yellow-600' :
                        order.status === 'accepted' ? 'text-blue-600' :
                        order.status === 'shipped' ? 'text-purple-600' :
                        'text-green-600'
                      }`}>{order.status}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 4. QUICK MANAGEMENT LINKS */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Platform Management</h2>
          
          <Link href="/admin/users" className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Users size={24} /></div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-orange-600">Users & Sellers</h3>
                <p className="text-xs text-gray-500">Suspend users, verify sellers, and manage roles.</p>
              </div>
            </div>
            <ArrowRight className="text-gray-400 group-hover:text-orange-600 transition" size={20} />
          </Link>

          <Link href="/admin/listings" className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center"><Package size={24} /></div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-orange-600">Moderation Queue</h3>
                <p className="text-xs text-gray-500">Approve, reject, or delete pending listings.</p>
              </div>
            </div>
            <ArrowRight className="text-gray-400 group-hover:text-orange-600 transition" size={20} />
          </Link>

          <Link href="/admin/affiliates" className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><Wallet size={24} /></div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-orange-600">Affiliate Payouts</h3>
                <p className="text-xs text-gray-500">Monitor affiliate earnings and process withdrawals.</p>
              </div>
            </div>
            <ArrowRight className="text-gray-400 group-hover:text-orange-600 transition" size={20} />
          </Link>

          <Link href="/admin/reports" className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center"><ShieldAlert size={24} /></div>
              <div>
                <h3 className="font-bold text-gray-900 group-hover:text-orange-600">Disputes & Reports</h3>
                <p className="text-xs text-gray-500">Handle reported listings and buyer complaints.</p>
              </div>
            </div>
            <ArrowRight className="text-gray-400 group-hover:text-orange-600 transition" size={20} />
          </Link>
        </div>

      </div>
    </div>
  );
}