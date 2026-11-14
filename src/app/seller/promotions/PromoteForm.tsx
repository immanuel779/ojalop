"use client";

import { useState, useEffect } from "react";
import { Check, Zap, Rocket, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { activatePromotionAction } from "./actions";
import { PaystackSetupConfig } from "@/types/paystack"; // <-- Import shared types

// Define strict type for products
type Product = { id: string; title: string; price: number; };

export default function PromoteForm({ products, userEmail }: { products: Product[], userEmail: string }) {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("standard");
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (window.PaystackPop) {
      const timer = setTimeout(() => setScriptLoaded(true), 0);
      return () => clearTimeout(timer);
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  const packages = [
    { id: "basic", name: "Basic Boost", price: 2500, days: 7, icon: <Zap size={20} />, desc: "7 days of visibility" },
    { id: "standard", name: "Standard Pro", price: 5000, days: 14, icon: <Rocket size={20} />, desc: "14 days + top of search" },
    { id: "premium", name: "Premium Elite", price: 10000, days: 30, icon: <Star size={20} />, desc: "30 days + Homepage Hero" },
  ];

  const currentPackage = packages.find(p => p.id === selectedPackage)!;

  const handlePromote = () => {
    if (!selectedProduct) {
      toast.error("Please select a product to promote.");
      return;
    }
    if (!scriptLoaded || !window.PaystackPop) {
      toast.error("Payment gateway loading. Please try again.");
      return;
    }

    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!paystackKey) return toast.error("Paystack key missing.");

    setLoading(true);

    const config: PaystackSetupConfig = {
      key: paystackKey,
      email: userEmail || "seller@ojaloop.com",
      amount: currentPackage.price * 100,
      currency: "NGN",
      ref: `PROMO-${selectedProduct.slice(0, 6)}-${new Date().getTime()}`,
      metadata: {
        product_id: selectedProduct,
        package: currentPackage.id
      },
      callback: function(response) {
        activatePromotionAction(selectedProduct, currentPackage.id, currentPackage.price, response.reference)
          .then((res) => {
            setLoading(false);
            if (res.error) toast.error(res.error);
            else toast.success("Product successfully promoted!");
          });
      },
      onClose: function() {
        setLoading(false);
        toast.error("Payment cancelled.");
      }
    };

    const handler = window.PaystackPop.setup(config);
    handler.openIframe();
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">1. Select a Product</h2>
        <select 
          value={selectedProduct} 
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:border-orange-500 focus:bg-white transition text-gray-700"
        >
          <option value="">Choose a listing...</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.title} (₦{Number(p.price).toLocaleString()})</option>
          ))}
        </select>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">2. Choose a Package</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg.id)}
              className={`text-left p-5 rounded-2xl border-2 transition-all relative ${
                selectedPackage === pkg.id 
                  ? "border-orange-500 bg-orange-50" 
                  : "border-gray-200 hover:border-orange-200 bg-white"
              }`}
            >
              {selectedPackage === pkg.id && (
                <div className="absolute top-3 right-3 text-orange-500"><Check size={20} /></div>
              )}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${selectedPackage === pkg.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {pkg.icon}
              </div>
              <h3 className="font-bold text-gray-900">{pkg.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{pkg.desc}</p>
              <p className="text-lg font-bold text-gray-900">₦{pkg.price.toLocaleString()}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handlePromote}
          disabled={loading || !selectedProduct}
          className="w-full md:w-auto bg-gray-900 text-white px-10 py-4 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
        >
          {loading ? <><Loader2 className="animate-spin" size={20} /> Processing...</> : `Pay ₦${currentPackage.price.toLocaleString()} & Promote`}
        </button>
      </div>
    </div>
  );
}