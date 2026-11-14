"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Trash2, Edit, Loader2 } from "lucide-react";
import { deleteProductAction, toggleProductVisibilityAction } from "../products/new/actions";
import { toast } from "sonner";

export default function ProductActions({ id, slug, isActive }: { id: string, slug: string, isActive: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Are you sure you want to permanently delete this listing? This cannot be undone.")) return;
    setLoading(true);
    const res = await deleteProductAction(id);
    setLoading(false);
    if (res?.error) toast.error(res.error);
    else toast.success("Listing deleted.");
  }

  async function handleToggleVisibility() {
    setLoading(true);
    const res = await toggleProductVisibilityAction(id, isActive);
    setLoading(false);
    if (res?.error) toast.error(res.error);
    else toast.success(isActive ? "Listing Closed (Hidden from public)" : "Listing Opened (Visible to public)");
  }

  if (loading) return <Loader2 className="animate-spin text-gray-400" size={18} />;

  return (
    <div className="flex items-center justify-end gap-2">
      <Link href={`/products/${slug}`} target="_blank" className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition" title="View Public Page">
        <Eye size={18} />
      </Link>
      <Link href={`/seller/products/${id}/edit`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
        <Edit size={18} />
      </Link>
      <button onClick={handleToggleVisibility} className={`p-2 rounded-lg transition ${isActive ? 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50' : 'text-yellow-600 bg-yellow-50'}`} title={isActive ? "Close Listing (Hide)" : "Open Listing (Show)"}>
        {isActive ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
      <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
        <Trash2 size={18} />
      </button>
    </div>
  );
}