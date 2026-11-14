"use client";

import { useState } from "react";
import { XCircle, Loader2, Eye } from "lucide-react";
import { cancelPromotion } from "../actions";
import { toast } from "sonner";
import Link from "next/link";

// 1. Define the strict type for the promotion
interface PromotionData {
  id: string;
  status: string;
  product: {
    slug: string;
  } | null;
}

// 2. Replace `any` with `PromotionData`
export default function AdActions({ promo }: { promo: PromotionData }) {
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm("Are you sure? This will instantly remove the ad from the homepage and expire the promotion.")) return;
    
    setLoading(true);
    const res = await cancelPromotion(promo.id);
    setLoading(false);
    
    if (res?.error) toast.error(res.error);
    else toast.success("Promotion cancelled and removed from homepage.");
  }

  if (loading) return <Loader2 className="animate-spin text-orange-500 mx-auto" size={20} />;

  return (
    <div className="flex items-center justify-end gap-2">
      {/* View Product */}
      {promo.product?.slug && (
        <Link 
          href={`/products/${promo.product.slug}`} 
          target="_blank"
          className="p-2 text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition" 
          title="View Product Live"
        >
          <Eye size={18} />
        </Link>
      )}

      {/* Cancel Promotion */}
      {promo.status === 'active' && (
        <button 
          onClick={handleCancel} 
          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition" 
          title="Force Cancel Ad"
        >
          <XCircle size={18} />
        </button>
      )}
    </div>
  );
}