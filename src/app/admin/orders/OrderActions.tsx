/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { 
  Eye, CheckCircle2, RotateCcw, AlertOctagon, 
  Loader2, X, Package, ShieldCheck 
} from "lucide-react";
import { forceCompleteOrder, forceRefundOrder, markOrderAsDisputed } from "../actions";
import { toast } from "sonner";

// 1. Define strict type for the order
interface AdminOrder {
  id: string;
  status: string;
  payment_status: string;
  buyerName: string;
  sellerName: string;
  product: {
    title: string;
    price: number;
    image_url: string | null;
  } | null;
}

// 2. Replace `any` with `AdminOrder`
export default function OrderActions({ order }: { order: AdminOrder }) {
  const [loading, setLoading] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  async function handleComplete() {
    if (!confirm("Release funds to the seller? This means the buyer has received the item.")) return;
    setLoading(true);
    const res = await forceCompleteOrder(order.id);
    setLoading(false);
    if (res?.error) toast.error(res.error);
    else toast.success("Funds released to seller.");
  }

  async function handleRefund() {
    if (!confirm("Refund the buyer? This will cancel the order and return the money.")) return;
    setLoading(true);
    const res = await forceRefundOrder(order.id);
    setLoading(false);
    if (res?.error) toast.error(res.error);
    else toast.success("Order refunded to buyer.");
  }

  async function handleDispute() {
    if (!confirm("Flag this order as disputed? This will freeze the funds.")) return;
    setLoading(true);
    const res = await markOrderAsDisputed(order.id);
    setLoading(false);
    if (res?.error) toast.error(res.error);
    else toast.success("Order marked as disputed.");
  }

  if (loading) return <Loader2 className="animate-spin text-orange-500 mx-auto" size={20} />;

  return (
    <>
      <div className="flex items-center justify-end gap-1.5">
        <button onClick={() => setIsViewOpen(true)} className="p-2 text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition" title="View Details">
          <Eye size={18} />
        </button>

        {/* Only show refund if money is held */}
        {(order.payment_status === 'held_in_escrow' || order.payment_status === 'disputed') && (
          <button onClick={handleRefund} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition" title="Force Refund">
            <RotateCcw size={18} />
          </button>
        )}

        {/* Only show complete if money is held */}
        {(order.payment_status === 'held_in_escrow' || order.payment_status === 'disputed') && (
          <button onClick={handleComplete} className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition" title="Force Complete & Release">
            <CheckCircle2 size={18} />
          </button>
        )}

        {order.payment_status !== 'disputed' && order.payment_status !== 'refunded' && (
          <button onClick={handleDispute} className="p-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition" title="Mark as Disputed">
            <AlertOctagon size={18} />
          </button>
        )}
      </div>

      {/* DETAILS MODAL */}
      {isViewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Order Details</h3>
              <button onClick={() => setIsViewOpen(false)} className="p-2 bg-white rounded-full hover:bg-gray-200 shadow-sm">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                  {order.product?.image_url ? (
                    <img src={order.product.image_url} alt={order.product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400"><Package size={32} /></div>
                  )}
                </div>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Order #{order.id.split('-')[0].toUpperCase()}</span>
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">{order.product?.title}</h2>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">₦ {Number(order.product?.price).toLocaleString()}</div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Buyer</p>
                      <p className="font-medium truncate">{order.buyerName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Seller</p>
                      <p className="font-medium truncate">{order.sellerName}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border ${
                      order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      order.status === 'accepted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      order.status === 'shipped' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      order.status === 'fulfilled' ? 'bg-green-50 text-green-700 border-green-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      Status: {order.status}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border flex items-center gap-1 ${
                      order.payment_status === 'released' ? 'bg-green-50 text-green-700 border-green-200' :
                      order.payment_status === 'held_in_escrow' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      order.payment_status === 'disputed' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      <ShieldCheck size={14} /> Payment: {order.payment_status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button onClick={() => setIsViewOpen(false)} className="px-6 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}