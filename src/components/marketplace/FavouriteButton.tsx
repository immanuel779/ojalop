"use client";

import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { toggleFavouriteAction } from "@/app/buyer/actions";

export default function FavouriteButton({ productId, initialIsFavourite }: { productId: string, initialIsFavourite: boolean }) {
  const [isFav, setIsFav] = useState(initialIsFavourite);
  const [loading, setLoading] = useState(false);

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault(); // Prevent navigating to product page if inside a Link
    setLoading(true);
    setIsFav(!isFav); // Optimistic UI update
    await toggleFavouriteAction(productId, isFav);
    setLoading(false);
  }

  return (
    <button 
      onClick={handleToggle} 
      disabled={loading}
      className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition shadow-sm"
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin text-gray-500" />
      ) : (
        <Heart size={14} className={isFav ? "fill-red-500 text-red-500" : "text-gray-600"} />
      )}
    </button>
  );
}