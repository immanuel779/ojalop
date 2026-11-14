"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, Store, Settings, LogOut, ChevronDown, 
  MessageSquare, Heart, ShieldCheck, HelpCircle, PlusCircle, ArrowRight, ShieldAlert 
} from "lucide-react";

export default function UserDropdown({ 
  userName = "User", // Default fallback
  userEmail = "", 
  isSeller = false, 
  avatarUrl = null,
  isAdmin = false
}: { 
  userName?: string; 
  userEmail?: string; 
  isSeller?: boolean; 
  avatarUrl?: string | null;
  isAdmin?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 md:border-l md:border-gray-200 md:pl-4 group focus:outline-none py-1"
      >
        <div className="w-9 h-9 bg-orange-50 border border-orange-100 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 group-hover:ring-2 ring-orange-500 transition-all">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-orange-600">{userName.charAt(0).toUpperCase()}</span>
          )}
        </div>
        
        <div className="hidden lg:flex flex-col items-start">
          <span className="text-sm font-bold text-gray-700 group-hover:text-orange-600 transition line-clamp-1 max-w-[100px]">{userName}</span>
          <span className="text-[10px] text-gray-500 font-medium">Manage Account</span>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="p-5 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldCheck size={80} />
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 rounded-full border-2 border-white/20 overflow-hidden bg-white/10 shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold bg-orange-500 text-white">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-lg truncate">{userName}</p>
                <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                <span className="inline-block mt-2 bg-white/10 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  {isAdmin ? "Administrator" : isSeller ? "Seller Account" : "Buyer Account"}
                </span>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="p-3 bg-red-50 border-b border-red-100">
              <Link href="/admin" onClick={() => setIsOpen(false)} className="flex items-center justify-between w-full px-4 py-3 bg-red-600 text-white rounded-xl shadow-md hover:bg-red-700 transition group">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldAlert size={18} /> Admin Dashboard
                </div>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}

          <div className="p-2 space-y-1 bg-white">
            <Link href="/buyer/dashboard" onClick={() => setIsOpen(false)} className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition group">
              <div className="flex items-center gap-3">
                <LayoutDashboard size={18} className="text-gray-400 group-hover:text-orange-500" /> Buyer Dashboard
              </div>
            </Link>
            <Link href="/buyer/messages" onClick={() => setIsOpen(false)} className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition group">
              <div className="flex items-center gap-3">
                <MessageSquare size={18} className="text-gray-400 group-hover:text-orange-500" /> Messages
              </div>
            </Link>
            <Link href="/buyer/favourites" onClick={() => setIsOpen(false)} className="flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition group">
              <div className="flex items-center gap-3">
                <Heart size={18} className="text-gray-400 group-hover:text-orange-500" /> Saved Items
              </div>
            </Link>
          </div>

          <div className="h-px bg-gray-100 mx-4"></div>

          <div className="p-2 space-y-1 bg-white">
            <div className="px-3 pt-2 pb-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Seller Tools</p>
            </div>
            {isSeller ? (
              <>
                <Link href="/seller/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-green-50 hover:text-green-700 transition group">
                  <Store size={18} className="text-gray-400 group-hover:text-green-600" /> Seller Dashboard
                </Link>
                <Link href="/seller/products/new" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-green-50 hover:text-green-700 transition group">
                  <PlusCircle size={18} className="text-gray-400 group-hover:text-green-600" /> Post New Ad
                </Link>
              </>
            ) : (
              <Link href="/seller/onboarding" onClick={() => setIsOpen(false)} className="flex items-center justify-between px-3 py-3 mx-1 mt-1 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl shadow-md hover:shadow-lg transition group">
                <div className="flex items-center gap-2">
                  <Store size={18} /> Start Selling
                </div>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>

          <div className="h-px bg-gray-100 mx-4"></div>

          <div className="p-2 space-y-1 bg-white">
            <Link href="/buyer/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-100 transition group">
              <Settings size={18} className="text-gray-400 group-hover:text-gray-900" /> Account Settings
            </Link>
            <Link href="/contact" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-100 transition group">
              <HelpCircle size={18} className="text-gray-400 group-hover:text-gray-900" /> Help & Support
            </Link>
          </div>

          <div className="p-2 border-t border-gray-100 bg-gray-50">
            <form action="/auth/signout" method="post">
              <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-600 rounded-xl hover:bg-red-100 transition">
                <LogOut size={18} /> Sign Out
              </button>
            </form>
          </div>
          
        </div>
      )}
    </div>
  );
}