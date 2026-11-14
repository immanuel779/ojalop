"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Package, Users, Settings, ArrowLeft, 
  ShieldAlert, ShoppingBag, Megaphone, 
  ShieldCheck, Menu, X 
} from "lucide-react";

export default function AdminSidebar({ userEmail }: { userEmail: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { name: "Overview", href: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Manage Listings", href: "/admin/listings", icon: <Package size={20} /> },
    { name: "Orders & Escrow", href: "/admin/orders", icon: <ShoppingBag size={20} /> },
    { name: "Users & Sellers", href: "/admin/users", icon: <Users size={20} /> },
    { name: "Affiliates", href: "/admin/affiliates", icon: <Users size={20} /> },
    { name: "Promotions & Ads", href: "/admin/promotions", icon: <Megaphone size={20} /> },
    { name: "Reports & Trust", href: "/admin/reports", icon: <ShieldCheck size={20} /> },
    { name: "Platform Settings", href: "/admin/settings", icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-gray-950 text-white p-4 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-orange-500" size={24} />
          <span className="font-bold text-xl">OjaLoop Admin</span>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 bg-gray-800 rounded-lg">
          <Menu size={24} />
        </button>
      </div>

      {/* Desktop Sidebar & Mobile Drawer */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-950 text-white flex flex-col transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0
      `}>
        
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-orange-500" size={24} />
            <span className="font-bold text-xl tracking-tight">Admin Panel</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-1 bg-gray-800 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Monitoring</p>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name}
                href={item.href} 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                  isActive 
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20" 
                    : "text-gray-400 hover:bg-gray-900 hover:text-white"
                }`}
              >
                {item.icon} {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <div className="px-4 py-2 bg-gray-900 rounded-xl">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Logged in as</p>
            <p className="text-sm font-medium text-white truncate">{userEmail}</p>
          </div>
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-900 transition text-orange-400 hover:text-orange-300 font-bold">
            <ArrowLeft size={20} /> Back to App
          </Link>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}