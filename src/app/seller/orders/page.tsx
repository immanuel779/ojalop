/* eslint-disable @next/next/no-img-element */
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Package, Clock, CheckCircle2, XCircle, Truck, 
  ArrowLeft, Wallet, User, MapPin, ShieldCheck
} from "lucide-react";
import OrderStatusButton from "@/components/seller/OrderStatusButton";

export default async function SellerOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 1. Fetch Orders WITHOUT the broken profile join
  const { data: ordersData, error } = await supabase
    .from("orders")
    .select("*, products(title, price, image_url, condition)")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
  }

  const orders = ordersData || [];

  // 2. Fetch Buyer Profiles separately
  const buyerIds = orders.map(o => o.buyer_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, phone, avatar_url")
    .in("id", buyerIds);
    
  // 3. Create a lookup map for fast access
  const profileMap = new Map();
  profiles?.forEach(p => profileMap.set(p.id, p));

  // 4. Calculate real-time stats
  const totalOrders = orders.length;
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  
  const revenue = orders
    .filter(o => o.payment_status === 'released')
    .reduce((sum, o) => {
      const product = Array.isArray(o.products) ? o.products[0] : o.products;
      return sum + Number(product?.price || 0);
    }, 0);

  const escrowHeld = orders
    .filter(o => o.payment_status === 'held_in_escrow')
    .reduce((sum, o) => {
      const product = Array.isArray(o.products) ? o.products[0] : o.products;
      return sum + Number(product?.price || 0);
    }, 0);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 min-h-screen bg-gray-50/50">
      
      <Link href="/seller/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-orange-600 mb-6 transition">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      {/* HEADER & STATS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Manage Orders</h1>
          <p className="text-gray-500 mt-1">Accept, ship, and track your customer orders.</p>
        </div>
        <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <div className="bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center"><Clock size={20} /></div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase">Pending</p>
              <p className="text-xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
          <div className="bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><ShieldCheck size={20} /></div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase">In Escrow</p>
              <p className="text-xl font-bold text-blue-600">₦ {escrowHeld.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center"><Wallet size={20} /></div>
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase">Revenue</p>
              <p className="text-xl font-bold text-gray-900">₦ {revenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap shadow-sm">All Orders ({totalOrders})</button>
        <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap hover:bg-gray-50">Pending ({pendingCount})</button>
        <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap hover:bg-gray-50">Shipped</button>
        <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap hover:bg-gray-50">Completed</button>
      </div>

      {/* ORDERS LIST */}
      {orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="text-gray-400" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500">When a buyer requests one of your items, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const product = Array.isArray(order.products) ? order.products[0] : order.products;
            const buyer = profileMap.get(order.buyer_id);
            
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:shadow-md transition">
                
                {/* LEFT: Product Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gray-100 overflow-hidden border shrink-0">
                    {product?.image_url ? (
                      <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400"><Package size={24} /></div>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Order #{order.id.split('-')[0].toUpperCase()}</span>
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2 leading-tight">{product?.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{product?.condition}</p>
                    <p className="text-orange-600 font-bold text-lg mt-2">₦ {Number(product?.price).toLocaleString()}</p>
                  </div>
                </div>

                {/* MIDDLE: Buyer Info */}
                <div className="flex flex-col md:flex-row lg:flex-col gap-4 lg:w-64 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><User size={12} /> Buyer Details</p>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-100 overflow-hidden">
                        {buyer?.avatar_url ? (
                          <img src={buyer.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-orange-100 text-orange-600 text-xs font-bold">
                            {buyer?.display_name?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      <p className="font-bold text-gray-900">{buyer?.display_name || 'OjaLoop User'}</p>
                    </div>
                    {buyer?.phone && <p className="text-sm text-gray-500 mt-1">{buyer.phone}</p>}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><MapPin size={12} /> Delivery</p>
                    <p className="text-sm text-gray-600">Contact buyer for address</p>
                  </div>
                </div>

                {/* RIGHT: Status & Actions */}
                <div className="flex flex-col items-start lg:items-end gap-3 w-full lg:w-48 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
                  
                  {/* Status Badges */}
                  <div className="w-full flex justify-between lg:justify-end flex-wrap gap-2">
                    {order.status === 'pending' && <span className="inline-flex items-center gap-1.5 text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-1 rounded-full text-xs font-bold"><Clock size={14} /> Pending</span>}
                    
                    {order.status === 'accepted' && order.payment_status === 'unpaid' && (
                      <span className="inline-flex items-center gap-1.5 text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full text-xs font-bold">Awaiting Buyer Payment</span>
                    )}
                    
                    {order.status === 'accepted' && order.payment_status === 'held_in_escrow' && (
                      <span className="inline-flex items-center gap-1.5 text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold"><ShieldCheck size={14} /> Payment Secured</span>
                    )}

                    {order.status === 'shipped' && <span className="inline-flex items-center gap-1.5 text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold"><Truck size={14} /> Shipped</span>}
                    
                    {order.status === 'fulfilled' && <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full text-xs font-bold"><CheckCircle2 size={14} /> Completed</span>}
                    
                    {order.status === 'declined' && <span className="inline-flex items-center gap-1.5 text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full text-xs font-bold"><XCircle size={14} /> Declined</span>}
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="w-full flex flex-col gap-2 mt-2">
                    {order.status === 'pending' && (
                      <>
                        <OrderStatusButton orderId={order.id} newStatus="accepted" label="Accept Order" colorClass="bg-gray-900 text-white hover:bg-gray-800 w-full" />
                        <OrderStatusButton orderId={order.id} newStatus="declined" label="Decline" colorClass="bg-red-50 text-red-600 hover:bg-red-100 w-full" />
                      </>
                    )}
                    
                    {/* Seller can ONLY ship if money is in Escrow */}
                    {order.status === 'accepted' && order.payment_status === 'held_in_escrow' && (
                      <OrderStatusButton orderId={order.id} newStatus="shipped" label="Mark as Shipped" colorClass="bg-purple-600 text-white hover:bg-purple-700 w-full" />
                    )}
                    {order.status === 'accepted' && order.payment_status === 'unpaid' && (
                      <p className="text-xs text-center text-orange-600 font-medium bg-orange-50 p-2 rounded-lg">Waiting for Buyer to pay into Escrow.</p>
                    )}

                    {order.status === 'shipped' && (
                      <p className="text-xs text-center text-gray-500 font-medium bg-gray-50 p-2 rounded-lg">Waiting for buyer to confirm receipt.</p>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}