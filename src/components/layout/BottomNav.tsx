import Link from "next/link";
import { Home, Search, PlusCircle, Store, MessageCircle } from "lucide-react";

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        <Link href="/" className="flex flex-col items-center text-orange-600">
          <Home size={24} />
          <span className="text-[10px] mt-1 font-medium">Home</span>
        </Link>
        <Link href="/search" className="flex flex-col items-center text-gray-500 hover:text-orange-600">
          <Search size={24} />
          <span className="text-[10px] mt-1 font-medium">Browse</span>
        </Link>
        <Link href="/seller/dashboard" className="flex flex-col items-center -mt-6">
          <div className="bg-orange-600 text-white p-3 rounded-full shadow-lg">
            <PlusCircle size={24} />
          </div>
          <span className="text-[10px] mt-1 font-medium text-orange-600">Sell</span>
        </Link>
        <Link href="/stores" className="flex flex-col items-center text-gray-500 hover:text-orange-600">
          <Store size={24} />
          <span className="text-[10px] mt-1 font-medium">Stores</span>
        </Link>
        <Link href="/buyer/messages" className="flex flex-col items-center text-gray-500 hover:text-orange-600">
          <MessageCircle size={24} />
          <span className="text-[10px] mt-1 font-medium">Messages</span>
        </Link>
      </div>
    </nav>
  );
}