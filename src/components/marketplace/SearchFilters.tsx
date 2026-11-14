"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown, Check } from "lucide-react";

const NIGERIAN_STATES = ["Lagos", "Abuja", "Ogun", "Rivers", "Kano", "Oyo", "Enugu", "Kaduna"];
const CONDITIONS = ["Brand New", "Like New", "Foreign Used", "Nigerian Used", "Refurbished"];

export default function SearchFilters({ categories }: { categories: { id: string, name: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  // Helper to update URL params
  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/search?${params.toString()}`);
  }

  // Clear all filters
  function clearFilters() {
    const q = searchParams.get("q");
    router.push(q ? `/search?q=${q}` : "/search");
  }

  const activeCategory = searchParams.get("category");
  const activeState = searchParams.get("state");
  const activeCondition = searchParams.get("condition");
  const activeSort = searchParams.get("sort") || "newest";
  const activeMin = searchParams.get("min_price") || "";
  const activeMax = searchParams.get("max_price") || "";

  const hasActiveFilters = activeCategory || activeState || activeCondition || activeMin || activeMax;

  // The actual filter UI (reused for desktop and mobile)
  // Notice we use a function instead of a React component here
  const renderFilterContent = () => (
    <div className="space-y-8">
      
      {/* Sort */}
      <div>
        <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Sort By</h4>
        <div className="space-y-2">
          {[
            { id: "newest", label: "Newest Arrivals" },
            { id: "price_asc", label: "Price: Low to High" },
            { id: "price_desc", label: "Price: High to Low" }
          ].map(sort => (
            <button 
              key={sort.id}
              onClick={() => updateParam("sort", sort.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${activeSort === sort.id ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50 text-gray-700'}`}
            >
              {sort.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Categories</h4>
        <div className="space-y-1">
          <button 
            onClick={() => updateParam("category", null)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${!activeCategory ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50 text-gray-700'}`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => updateParam("category", cat.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${activeCategory === cat.id ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50 text-gray-700'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div>
        <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Condition</h4>
        <div className="space-y-1">
          {CONDITIONS.map(cond => (
            <button 
              key={cond}
              onClick={() => updateParam("condition", activeCondition === cond ? null : cond)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${activeCondition === cond ? 'bg-orange-50 text-orange-600' : 'hover:bg-gray-50 text-gray-700'}`}
            >
              {cond}
              {activeCondition === cond && <Check size={14} />}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Location (State)</h4>
        <div className="relative">
          <select 
            value={activeState || ""} 
            onChange={(e) => updateParam("state", e.target.value || null)}
            className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="">All Nigeria</option>
            {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Price Range (₦)</h4>
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            placeholder="Min" 
            defaultValue={activeMin}
            onBlur={(e) => updateParam("min_price", e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-500" 
          />
          <span className="text-gray-400">-</span>
          <input 
            type="number" 
            placeholder="Max" 
            defaultValue={activeMax}
            onBlur={(e) => updateParam("max_price", e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-500" 
          />
        </div>
      </div>

      {hasActiveFilters && (
        <button onClick={clearFilters} className="w-full py-3 bg-red-50 text-red-600 font-bold text-sm rounded-xl hover:bg-red-100 transition">
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* MOBILE TRIGGER BUTTON */}
      <div className="md:hidden flex items-center justify-between mb-4">
        <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl font-bold text-sm shadow-sm">
          <SlidersHorizontal size={16} /> Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-orange-500"></span>}
        </button>
        <span className="text-sm text-gray-500 font-medium">Sort: {activeSort.replace('_', ' ')}</span>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:block w-64 flex-shrink-0">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
            <SlidersHorizontal size={18} className="text-orange-500" />
            <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
          </div>
          {renderFilterContent()}
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          <div className="relative w-4/5 max-w-sm h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900">Filters</h3>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {renderFilterContent()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}