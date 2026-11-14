/* eslint-disable @next/next/no-img-element */
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, Clock, CheckCircle2, ArrowLeft, ShieldCheck } from "lucide-react";
import BuyerOrderActions from "./BuyerOrderActions";

export default async function BuyerOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("*, products(title, price, image_url, slug, condition)")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 min-h-screen">
      <Link href="/buyer/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-orange-600 mb-6 transition">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Orders</h1>
          <p className="text-gray-500 mt-1">Track and manage all your order requests.</p>
        </div>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm">
          <Package className="text-gray-400 mx-auto mb-4" size={32} />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-6">You haven&apos;t requested any orders yet.</p>
          <Link href="/search" className="inline-block bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const product = Array.isArray(order.products) ? order.products[0] : order.products;
            
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition">
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden border shrink-0">
                    {product?.image_url ? (
                      <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400"><Package size={24} /></div>
                    )}
                  </div>
                  <div>
                    <Link href={`/products/${product?.slug}`} className="font-bold text-lg text-gray-900 hover:text-orange-600 line-clamp-2 leading-tight">
                      {product?.title}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">Order #{order.id.split('-')[0].toUpperCase()}</p>
                    <p className="text-orange-600 font-bold text-lg mt-1">₦ {Number(product?.price).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-3 w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                  
                  {/* STATUS BADGES */}
                  <div className="flex flex-wrap gap-2 justify-end">
                    {order.status === 'pending' && <span className="inline-flex items-center gap-1.5 text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-full text-xs font-bold"><Clock size={14} /> Awaiting Seller</span>}
                    {order.status === 'accepted' && order.payment_status === 'unpaid' && <span className="inline-flex items-center gap-1.5 text-orange-700 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full text-xs font-bold">Awaiting Payment</span>}
                    {order.payment_status === 'held_in_escrow' && <span className="inline-flex items-center gap-1.5 text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full text-xs font-bold"><ShieldCheck size={14} /> In Escrow</span>}
                    {order.payment_status === 'released' && <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full text-xs font-bold"><CheckCircle2 size={14} /> Completed</span>}
                  </div>

                  <BuyerOrderActions 
                    orderId={order.id} 
                    orderStatus={order.status} 
                    paymentStatus={order.payment_status} 
                    buyerEmail={user.email || ""} 
                    amount={Number(product?.price || 0)} 
                    productTitle={product?.title || "Item"} 
                  />

                  <p className="text-xs text-gray-400 font-medium">
                    {new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}