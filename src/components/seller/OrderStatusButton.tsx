"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { updateOrderStatusAction } from "@/app/seller/orders/actions";
import { toast } from "sonner";

export default function OrderStatusButton({ 
  orderId, 
  newStatus, 
  label, 
  colorClass 
}: { 
  orderId: string; 
  newStatus: string; 
  label: string; 
  colorClass: string; 
}) {
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    setLoading(true);
    const result = await updateOrderStatusAction(orderId, newStatus);
    setLoading(false);

    if (result?.error) {
      toast.error("Failed to update order", { description: result.error });
    } else {
      toast.success(`Order marked as ${newStatus.toUpperCase()}`);
    }
  }

  return (
    <button 
      onClick={handleUpdate} 
      disabled={loading}
      className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 ${colorClass} disabled:opacity-50`}
    >
      {loading ? <Loader2 className="animate-spin" size={16} /> : label}
    </button>
  );
}