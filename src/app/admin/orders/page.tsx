/* eslint-disable @next/next/no-img-element */
import { createClient } from "@/lib/supabase/server";
import OrderActions from "./OrderActions";
import Link from "next/link";
import { ShoppingBag, Clock, ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const resolvedParams = await searchParams;
  const supabase = await createClient();

  // 1. Fetch Orders
  let query = supabase
    .from("orders")
    .select("*, products(title, price, image_url)")
    .order("created_at", { ascending: false });

  if (resolvedParams.status && resolvedParams.status !== "all") {
    query = query.eq("payment_status", resolvedParams.status);
  }

  const { data: ordersData } = await query;

  // 2. Fetch Profiles separately (Bulletproof)
  const userIds = new Set<string>();
  ordersData?.forEach(o => { userIds.add(o.buyer_id); userIds.add(o.seller_id); });
  const { data: profiles } = await supabase.from("profiles").select("id, display_name").in("id", Array.from(userIds));
  const profileMap = new Map(profiles?.map(p => [p.id, p.display_name]));

  // 3. Format orders with names
  let orders = ordersData?.map(o => ({
    ...o,
    product: Array.isArray(o.products) ? o.products[0] : o.products,
    buyerName: profileMap.get(o.buyer_id) || "Unknown",
    sellerName: profileMap.get(o.seller_id) || "Unknown",
  })) || [];

  // 4. Apply Search Filter
  if (resolvedParams.q) {
    const q = resolvedParams.q.toLowerCase();
    orders = orders.filter(o => 
      o.product?.title?.toLowerCase().includes(q) || 
      o.buyerName.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q)
    );
  }

  // 5. Stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const shippedOrders = orders.filter(o => o.status === 'shipped').length;
  const heldEscrow = orders.filter(o => o.payment_status === 'held_in_escrow').length;
  const disputedOrders = orders.filter(o => o.payment_status === 'disputed').length;

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Order Management</h1>
          <p className="text-gray-500 mt-1">Monitor escrow, track shipments, and resolve disputes.</p>
        </div>
        
        <form action="/admin/orders" method="GET" className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm w-full md:w-72">
          <input 
            type="text" 
            name="q"
            defaultValue={resolvedParams.q || ""}
            placeholder="Search by order ID, buyer..." 
            className="flex-1 bg-transparent outline-none text-sm" 
          />
          <button type="submit" className="text-gray-400 hover:text-orange-500">Search</button>
        </form>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Pending Orders</p>
            <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
          </div>
          <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center"><Clock size={20} /></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">In Escrow</p>
            <p className="text-2xl font-bold text-blue-600">{heldEscrow}</p>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><ShieldCheck size={20} /></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Shipped</p>
            <p className="text-2xl font-bold text-purple-600">{shippedOrders}</p>
          </div>
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><ShoppingBag size={20} /></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-red-200 shadow-sm flex items-center justify-between bg-red-50">
          <div>
            <p className="text-xs font-medium text-red-600">Disputed</p>
            <p className="text-2xl font-bold text-red-700">{disputedOrders}</p>
          </div>
          <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center"><AlertTriangle size={20} /></div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide border-b border-gray-200">
        <Link href="/admin/orders" className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${!resolvedParams.status ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          All Orders ({totalOrders})
        </Link>
        <Link href="/admin/orders?status=held_in_escrow" className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${resolvedParams.status === 'held_in_escrow' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          In Escrow
        </Link>
        <Link href="/admin/orders?status=released" className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${resolvedParams.status === 'released' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          Released
        </Link>
        <Link href="/admin/orders?status=disputed" className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${resolvedParams.status === 'disputed' ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          Disputed ({disputedOrders})
        </Link>
        <Link href="/admin/orders?status=refunded" className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${resolvedParams.status === 'refunded' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          Refunded
        </Link>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-bold">Order</th>
                <th className="p-4 font-bold">Buyer / Seller</th>
                <th className="p-4 font-bold">Amount</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">No orders found matching your filters.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                          {order.product?.image_url && <img src={order.product.image_url} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{order.product?.title}</p>
                          <p className="text-xs text-gray-500">#{order.id.split('-')[0].toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-xs text-gray-500"><span className="font-bold text-gray-700">B:</span> {order.buyerName}</p>
                      <p className="text-xs text-gray-500"><span className="font-bold text-gray-700">S:</span> {order.sellerName}</p>
                    </td>
                    <td className="p-4 font-bold text-gray-900">₦ {Number(order.product?.price).toLocaleString()}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                          order.status === 'fulfilled' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>{order.status}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          order.payment_status === 'released' ? 'bg-green-50 text-green-700 border-green-200' :
                          order.payment_status === 'held_in_escrow' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          order.payment_status === 'disputed' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>{order.payment_status.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right relative">
                      <OrderActions order={order} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}