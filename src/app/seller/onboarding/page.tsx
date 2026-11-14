"use client";

import { useState } from "react";
import { createStoreAction } from "./actions";
import { Store, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    const result = await createStoreAction(formData);
    setLoading(false);
    if (result?.error) setError(result.error);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* Left side: Brand & Value Prop (Desktop only) */}
      <div className="hidden lg:flex w-1/2 bg-[#1a1124] p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <span className="bg-orange-600 text-white p-2 rounded-xl text-2xl font-bold leading-none">O</span>
            <span className="text-white font-bold text-2xl tracking-tight">jaLoop</span>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            Start selling to <br />
            <span className="text-orange-500">millions of buyers</span> <br />
            across Nigeria.
          </h1>
          
          <ul className="space-y-6 mt-12">
            {[
              { title: "Free Storefront", desc: "Get a custom link to your store to share on social media." },
              { title: "Secure Escrow", desc: "We hold payments safely until you deliver the item." },
              { title: "Verified Badge", desc: "Build trust with buyers by verifying your business." }
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="bg-orange-500/20 p-2 rounded-lg text-orange-500 mt-1">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-white font-bold">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right side: The Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-lg bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
          
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
            <Store size={28} />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Open your store</h2>
          <p className="text-gray-500 text-sm mb-8">Set up your storefront details to start publishing your products.</p>

          <form action={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">Store Name</label>
              <input name="store_name" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition" placeholder="e.g. Tech Hub Lagos" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">Store URL (Slug)</label>
              <div className="flex items-center">
                <span className="bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl px-4 py-3.5 text-gray-500 text-sm hidden sm:block">ojaloop.com/</span>
                <input name="slug" required className="w-full bg-gray-50 border border-gray-200 rounded-xl sm:rounded-l-none px-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition" placeholder="tech-hub-lagos" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">State</label>
                <input name="location_state" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition" placeholder="Lagos" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">Phone Number</label>
                <input name="phone" type="tel" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition" placeholder="08012345678" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">What do you sell?</label>
              <textarea name="description" required rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition" placeholder="Describe your business to buyers..."></textarea>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}

            <button type="submit" disabled={loading} className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-600/30 flex justify-center items-center gap-2 mt-4">
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>Create Store <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}