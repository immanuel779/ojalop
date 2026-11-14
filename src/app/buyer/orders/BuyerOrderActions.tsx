"use client";

import { useState, useEffect } from "react";
import { Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { payToEscrowAction, confirmDeliveryAction } from "./actions";
import { toast } from "sonner";
import { PaystackSetupConfig } from "@/types/paystack"; // <-- Import from central file

export default function BuyerOrderActions({ 
  orderId, 
  orderStatus, 
  paymentStatus,
  buyerEmail,
  amount,
  productTitle
}: { 
  orderId: string; 
  orderStatus: string; 
  paymentStatus: string;
  buyerEmail: string;
  amount: number;
  productTitle: string;
}) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // 1. Dynamically load the Paystack Script
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

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Helper function to handle the async DB call AFTER payment
  const handleSuccess = (reference: string) => {
    setLoading(true);
    payToEscrowAction(orderId).then((res) => {
      setLoading(false);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Payment successful! Ref: ${reference}`);
      }
    });
  };

  // 2. Trigger the Payment Modal
  const handlePayment = () => {
    if (!scriptLoaded || !window.PaystackPop) {
      toast.error("Payment gateway is still loading. Please wait a moment.");
      return;
    }

    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!paystackKey) {
      toast.error("Paystack public key is missing. Check your .env.local file.");
      return;
    }

    setLoading(true); // Start spinner immediately

    const config: PaystackSetupConfig = {
      key: paystackKey,
      email: buyerEmail || "buyer@ojaloop.com",
      amount: amount * 100, // Paystack uses Kobo
      currency: "NGN",
      ref: `OJALOOP-${orderId.split('-')[0].toUpperCase()}-${new Date().getTime()}`,
      metadata: {
        order_id: orderId,
        product_name: productTitle
      },
      
      // Kept as a standard function to prevent Paystack crash
      callback: function(response) {
        handleSuccess(response.reference);
      },
      
      onClose: function() {
        setLoading(false); // Stop spinner if user cancels
        toast.error("Payment window closed.");
      }
    };

    const handler = window.PaystackPop.setup(config);
    handler.openIframe();
  };

  async function handleConfirm() {
    if(!confirm("Are you sure you have received the item and it matches the description? This will release the funds to the seller.")) return;
    
    setLoading(true);
    const res = await confirmDeliveryAction(orderId);
    setLoading(false);
    
    if (res.error) toast.error(res.error);
    else toast.success("Delivery confirmed! Funds released to seller.");
  }

  // --- RENDER BUTTONS ---

  if (orderStatus === 'accepted' && paymentStatus === 'unpaid') {
    return (
      <button 
        onClick={handlePayment} 
        disabled={loading || !scriptLoaded} 
        className="w-full md:w-auto bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-700 transition flex items-center justify-center gap-2 shadow-md disabled:opacity-70 min-w-[180px]"
      >
        {loading ? (
          <><Loader2 className="animate-spin" size={18} /> Opening Payment...</>
        ) : (
          <><ShieldCheck size={18} /> Pay ₦{amount.toLocaleString()} to Escrow</>
        )}
      </button>
    );
  }

  if (orderStatus === 'shipped' && paymentStatus === 'held_in_escrow') {
    return (
      <button 
        onClick={handleConfirm} 
        disabled={loading} 
        className="w-full md:w-auto bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-md disabled:opacity-70 min-w-[180px]"
      >
        {loading ? (
          <><Loader2 className="animate-spin" size={18} /> Releasing Funds...</>
        ) : (
          <><CheckCircle2 size={18} /> Confirm Delivery & Release</>
        )}
      </button>
    );
  }

  return null;
}