"use client";

import { useState, useEffect, useRef, useCallback } from "react"; // <-- Import useCallback
import { Bell, Package, ShieldAlert, AlertTriangle, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Counts = {
  pendingListings: number;
  pendingReports: number;
  disputedOrders: number;
};

export default function AdminNotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [counts, setCounts] = useState<Counts>({
    pendingListings: 0,
    pendingReports: 0,
    disputedOrders: 0,
  });
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const totalAlerts = counts.pendingListings + counts.pendingReports + counts.disputedOrders;

  // 1. Wrap fetchCounts in useCallback so it can be safely used as a dependency
  const fetchCounts = useCallback(async () => {
    const [
      { count: listings },
      { count: reports },
      { count: orders },
    ] = await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }).eq("status", "pending_review"),
      supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "disputed"),
    ]);

    setCounts({
      pendingListings: listings || 0,
      pendingReports: reports || 0,
      disputedOrders: orders || 0,
    });
  }, [supabase]);

  // 2. Add fetchCounts to the dependency array
  useEffect(() => {
    fetchCounts();

    // Listen for Real-Time Changes
    const channel = supabase
      .channel("admin_notifications")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => fetchCounts())
      .on("postgres_changes", { event: "*", schema: "public", table: "reports" }, () => fetchCounts())
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchCounts())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchCounts]); // <-- Added fetchCounts here

  // Close on click outside
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
        className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
      >
        <Bell size={20} />
        {totalAlerts > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
            {totalAlerts > 9 ? "9+" : totalAlerts}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Action Center</h3>
          </div>

          <div className="divide-y divide-gray-50">
            {/* Pending Listings */}
            <Link
              href="/admin/listings?status=pending_review"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-4 hover:bg-orange-50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                  <Package size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900 group-hover:text-orange-600">Pending Listings</p>
                  <p className="text-xs text-gray-500">Requires moderation</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {counts.pendingListings > 0 && (
                  <span className="bg-orange-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {counts.pendingListings}
                  </span>
                )}
                <ArrowRight size={16} className="text-gray-300 group-hover:text-orange-500" />
              </div>
            </Link>

            {/* Pending Reports */}
            <Link
              href="/admin/reports"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-4 hover:bg-red-50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900 group-hover:text-red-600">Pending Reports</p>
                  <p className="text-xs text-gray-500">New fraud/scam reports</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {counts.pendingReports > 0 && (
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {counts.pendingReports}
                  </span>
                )}
                <ArrowRight size={16} className="text-gray-300 group-hover:text-red-500" />
              </div>
            </Link>

            {/* Disputed Orders */}
            <Link
              href="/admin/orders?status=disputed"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between p-4 hover:bg-purple-50 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900 group-hover:text-purple-600">Disputed Orders</p>
                  <p className="text-xs text-gray-500">Escrow disputes to resolve</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {counts.disputedOrders > 0 && (
                  <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {counts.disputedOrders}
                  </span>
                )}
                <ArrowRight size={16} className="text-gray-300 group-hover:text-purple-500" />
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}