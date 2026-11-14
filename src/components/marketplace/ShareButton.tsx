"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

export default function ShareButton({ title }: { title: string }) {
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!", {
        description: `Share "${title}" with your friends.`,
      });
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition"
    >
      <Share2 size={18} /> Share
    </button>
  );
}