"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    // Format the message beautifully for WhatsApp
    const rawText = `*New Support Request*\n\n*Name:* ${name}\n*Email:* ${email}\n*Subject:* ${subject}\n\n*Message:*\n${message}`;
    const encodedText = encodeURIComponent(rawText);

    // Your primary WhatsApp number
    const whatsappNumber = "2347089584607";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;

    // Open WhatsApp in a new tab
    window.open(whatsappUrl, "_blank");

    // Simulate a brief loading state for the UI
    setTimeout(() => {
      setLoading(false);
      toast.success("WhatsApp opened!", {
        description: "Please send the pre-filled message to complete your request.",
      });
      (e.target as HTMLFormElement).reset();
    }, 1500);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
          <input 
            type="text" 
            name="name" 
            required 
            placeholder="John Doe" 
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 focus:bg-white transition" 
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</label>
          <input 
            type="email" 
            name="email" 
            required 
            placeholder="you@example.com" 
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 focus:bg-white transition" 
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">Subject</label>
        <input 
          type="text" 
          name="subject" 
          required 
          placeholder="How can we help?" 
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 focus:bg-white transition" 
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1.5">Message</label>
        <textarea 
          name="message" 
          required 
          rows={4} 
          placeholder="Type your message here..." 
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 focus:bg-white transition resize-none"
        ></textarea>
      </div>
      
      <button 
        type="submit" 
        disabled={loading} 
        className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
      >
        {loading ? (
          <><Loader2 className="animate-spin" size={20} /> Opening WhatsApp...</>
        ) : (
          <><Send size={20} /> Submit Message via WhatsApp</>
        )}
      </button>
    </form>
  );
}