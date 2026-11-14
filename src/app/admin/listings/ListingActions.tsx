/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Trash2, Loader2, ShieldBan, Eye, X, ShieldCheck, Clock, AlertTriangle } from "lucide-react";
import { updateListingStatus, deleteListing } from "../actions";
import { toast } from "sonner";

// 1. Define the strict type for the product
type ProductData = {
  id: string;
  title: string;
  price: number;
  image_url: string | null;
  status: string;
  description: string | null;
  condition: string | null;
  location_state: string | null;
  created_at: string;
  categories: { name: string } | { name: string }[] | null;
  stores: { name: string } | { name: string }[] | null;
};

// 2. Replace `any` with `ProductData`
export default function ListingActions({ product }: { product: ProductData }) {
  const [loading, setLoading] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [showReasonInput, setShowReasonInput] = useState(false);

  // Helper to handle Supabase relational arrays safely
  const categoryName = Array.isArray(product.categories) ? product.categories[0]?.name : product.categories?.name;
  const storeName = Array.isArray(product.stores) ? product.stores[0]?.name : product.stores?.name;

  async function handleStatusChange(newStatus: string) {
    setLoading(true);
    const res = await updateListingStatus(product.id, newStatus);
    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(`Listing marked as ${newStatus.replace('_', ' ').toUpperCase()}`);
      setShowReasonInput(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure? This will permanently delete this listing and it cannot be undone.")) return;
    
    setLoading(true);
    const res = await deleteListing(product.id);
    setLoading(false);
    
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Listing permanently deleted.");
    }
  }

  if (loading) return <Loader2 className="animate-spin text-orange-500 mx-auto" size={20} />;

  return (
    <>
      <div className="flex items-center justify-end gap-1.5">
        <button 
          onClick={() => setIsViewOpen(true)} 
          className="p-2 text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition" 
          title="View Full Details"
        >
          <Eye size={18} />
        </button>

        {product.status !== 'approved' && (
          <button 
            onClick={() => handleStatusChange('approved')} 
            className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition" 
            title="Approve Listing"
          >
            <CheckCircle2 size={18} />
          </button>
        )}
        
        {product.status !== 'rejected' && (
          <button 
            onClick={() => setShowReasonInput(!showReasonInput)} 
            className="p-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition" 
            title="Reject Listing"
          >
            <XCircle size={18} />
          </button>
        )}

        {product.status !== 'suspended' && (
          <button 
            onClick={() => handleStatusChange('suspended')} 
            className="p-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition" 
            title="Suspend Listing"
          >
            <ShieldBan size={18} />
          </button>
        )}

        <button 
          onClick={handleDelete} 
          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition" 
          title="Delete Permanently"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* REJECTION REASON POPOVER */}
      {showReasonInput && (
        <div className="absolute right-4 mt-2 w-72 bg-white p-4 rounded-xl shadow-2xl border border-gray-200 z-20 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 mb-2 text-orange-600">
            <AlertTriangle size={16} />
            <h4 className="font-bold text-sm">Reason for Rejection</h4>
          </div>
          <input 
            type="text" 
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Prohibited item, blurry photo..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500 mb-3"
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={() => handleStatusChange('rejected')} className="flex-1 bg-orange-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-orange-700 transition">
              Confirm Reject
            </button>
            <button onClick={() => setShowReasonInput(false)} className="flex-1 bg-gray-100 text-gray-600 text-xs font-bold py-2 rounded-lg hover:bg-gray-200 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {isViewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Listing Moderation</h3>
              <button onClick={() => setIsViewOpen(false)} className="p-2 bg-white rounded-full hover:bg-gray-200 shadow-sm transition">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="flex flex-col md:flex-row gap-6">
                
                <div className="w-full md:w-1/2 aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wider bg-orange-50 px-2 py-1 rounded">
                      {categoryName || 'Uncategorized'}
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900 leading-tight mt-2">{product.title}</h2>
                  </div>
                  
                  <div className="text-3xl font-bold text-gray-900">₦ {Number(product.price).toLocaleString()}</div>
                  
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-sm border border-gray-100">
                    <div>
                      <p className="text-gray-500 text-[10px] font-bold uppercase">Store</p>
                      <p className="font-medium text-gray-900">{storeName || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[10px] font-bold uppercase">Condition</p>
                      <p className="font-medium text-gray-900">{product.condition || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[10px] font-bold uppercase">Location</p>
                      <p className="font-medium text-gray-900">{product.location_state}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[10px] font-bold uppercase">Date Submitted</p>
                      <p className="font-medium text-gray-900">{new Date(product.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Current Status</p>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${
                      product.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                      product.status === 'pending_review' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                      product.status === 'suspended' ? 'bg-gray-100 text-gray-700 border-gray-300' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      {product.status === 'pending_review' && <Clock size={14} />}
                      {product.status === 'approved' && <ShieldCheck size={14} />}
                      {product.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-bold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-xl border border-gray-100 max-h-40 overflow-y-auto">
                  {product.description}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setIsViewOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition">
                Close
              </button>
              {product.status !== 'approved' && (
                <button 
                  onClick={() => { handleStatusChange('approved'); setIsViewOpen(false); }} 
                  className="px-6 py-2.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition flex items-center gap-2 shadow-md shadow-green-600/20"
                >
                  <CheckCircle2 size={18} /> Approve Listing
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}