import { Mail, MessageCircle, Phone, ArrowLeft, ShieldCheck, Clock, HelpCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      
      {/* HERO SECTION */}
      <div className="bg-gray-900 text-white pt-16 pb-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white mb-8 transition">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="w-20 h-20 bg-orange-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/30 transform -rotate-6">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">How can we help you?</h1>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">Our dedicated support team is available 24/7 to resolve any issues with orders, payments, or your account.</p>
        </div>
      </div>

      {/* CONTACT CARDS (Overlapping the Hero) */}
      <div className="max-w-6xl mx-auto px-4 -mt-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* WhatsApp Card */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 text-center hover:-translate-y-2 transition-transform duration-300 group">
            <div className="w-16 h-16 bg-[#25D366]/10 text-[#25D366] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <MessageCircle size={32} />
            </div>
            <h3 className="font-bold text-gray-900 text-xl mb-2">WhatsApp Support</h3>
            <p className="text-sm text-gray-500 mb-6">Fastest response for urgent matters and live chat.</p>
            <div className="space-y-3">
              <a href="https://wa.me/2347089584607" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-3 rounded-xl font-bold hover:bg-[#20bd5a] transition shadow-md shadow-[#25D366]/30">
                Chat 0708 958 4607
              </a>
              <a href="https://wa.me/2347056922460" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full bg-gray-100 text-[#25D366] py-3 rounded-xl font-bold hover:bg-[#25D366]/10 transition">
                Chat 0705 692 2460
              </a>
            </div>
          </div>

          {/* Email Card */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 text-center hover:-translate-y-2 transition-transform duration-300 group">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Mail size={32} />
            </div>
            <h3 className="font-bold text-gray-900 text-xl mb-2">Email Support</h3>
            <p className="text-sm text-gray-500 mb-6">Send us a detailed message and we will reply within 24 hours.</p>
            <a href="mailto:support@ojaloop.com" className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-md shadow-gray-900/20">
              support@ojaloop.com
            </a>
          </div>

          {/* Call Center Card */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 text-center hover:-translate-y-2 transition-transform duration-300 group">
            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Phone size={32} />
            </div>
            <h3 className="font-bold text-gray-900 text-xl mb-2">Call Center</h3>
            <p className="text-sm text-gray-500 mb-6">Speak directly to a human agent from 8am to 8pm daily.</p>
            <div className="space-y-3">
              <a href="tel:07089584607" className="flex items-center justify-center gap-2 w-full bg-orange-50 text-orange-600 py-3 rounded-xl font-bold hover:bg-orange-100 transition">
                <Phone size={16} /> 0708 958 4607
              </a>
              <a href="tel:07056922460" className="flex items-center justify-center gap-2 w-full bg-orange-50 text-orange-600 py-3 rounded-xl font-bold hover:bg-orange-100 transition">
                <Phone size={16} /> 0705 692 2460
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* MESSAGE FORM & FAQ SECTION */}
      <div className="max-w-6xl mx-auto px-4 mt-20 grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Form */}
        <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <MessageCircle className="text-orange-500" size={24} /> Send us a Message
          </h2>
          <p className="text-gray-500 text-sm mb-6">Fill out the form below and it will redirect you to our support WhatsApp instantly.</p>
          
          <ContactForm />
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <HelpCircle className="text-orange-500" size={24} /> Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              { q: "How does OjaLoop Escrow work?", a: "Your payment is held securely by OjaLoop until you receive and confirm the item is exactly as described." },
              { q: "How long does delivery take?", a: "Delivery times depend on the seller and your location. Most items arrive within 2-5 business days." },
              { q: "Can I return an item?", a: "Yes, our return policy allows you to return items within 7 days of delivery if they are defective." },
              { q: "How do I become a verified seller?", a: "Go to your Seller Dashboard, click on 'Get Verified', and upload your business documents." }
            ].map((faq, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                  <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" /> {faq.q}
                </h3>
                <p className="text-sm text-gray-600 pl-7">{faq.a}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 bg-orange-50 border border-orange-100 rounded-2xl p-5 flex items-start gap-4">
            <Clock className="text-orange-600 shrink-0" size={24} />
            <div>
              <h3 className="font-bold text-orange-900">Average Response Time</h3>
              <p className="text-sm text-orange-700 mt-1">Our agents typically reply to WhatsApp messages in under 5 minutes.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}