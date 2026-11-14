import Link from "next/link";
import { 
  ShieldCheck, Target, Users, Rocket, Zap, Store, 
  ArrowRight, CheckCircle2, TrendingUp, Globe
} from "lucide-react";

export const metadata = {
  title: "About OjaLoop | Our Mission",
  description: "Learn about OjaLoop, Nigeria's most trusted marketplace. Built by CodeCraft Technologies.",
};

export default function AboutPage() {
  return (
    <div className="bg-white min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="bg-gray-900 text-white py-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-orange-400 px-4 py-2 rounded-full font-bold text-sm mb-6 border border-white/10 backdrop-blur-sm">
            <Globe size={16} /> Built for Nigeria, by CodeCraft Technologies
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
            We are building the most <span className="text-orange-500">trusted</span> marketplace in Africa.
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            OjaLoop was created to solve a simple problem: buying and selling online in Nigeria is too risky. We are changing that through verified sellers, secure Escrow payments, and a world-class user experience.
          </p>
        </div>
      </section>

      {/* 2. MISSION & VISION (Overlapping the Hero) */}
      <section className="max-w-6xl mx-auto px-4 -mt-10 relative z-20 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
            <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
              <Target size={28} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To empower every Nigerian—from the local street vendor to the largest dealership—with the digital tools, trust, and reach they need to succeed in the modern economy.
            </p>
          </div>
          
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Zap size={28} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed">
              To become the default operating system for commerce in Africa, where anyone can buy or sell anything, anywhere, without fear of scams or fraud.
            </p>
          </div>
        </div>
      </section>

      {/* 3. THE OJALOOP PROMISE (Core Values) */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">The OjaLoop Promise</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">We do not just connect buyers and sellers; we protect them.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Escrow Protection</h3>
              <p className="text-gray-500 text-sm">Your money is held securely by OjaLoop. We do not release funds to the seller until you receive and confirm your item is exactly as described.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Verified Sellers</h3>
              <p className="text-gray-500 text-sm">We actively review stores and issue verified badges to legitimate businesses. You always know who you are buying from.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Human Support</h3>
              <p className="text-gray-500 text-sm">Our support team is based in Nigeria and available 24/7 via WhatsApp and In-App chat to resolve any disputes quickly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY WE BUILT THIS */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Built by <span className="text-orange-600">CodeCraft Technologies</span></h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                OjaLoop is not just another e-commerce site. It is a product born out of frustration with the current state of online trading in Nigeria.
              </p>
              <p>
                We saw people losing money to fake vendors, sellers getting scammed by fake payment alerts, and honest businesses struggling to gain the trust of new customers.
              </p>
              <p>
                As a team of engineers, designers, and problem-solvers at CodeCraft Technologies, we decided to build a platform that takes trust seriously. By combining secure escrow technology with strict seller verification, we are creating a safer digital economy for everyone.
              </p>
            </div>
            
            <div className="mt-8 flex gap-4">
              <Link href="/seller/onboarding" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg">
                Start Selling
              </Link>
              <Link href="/search" className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition">
                Explore Marketplace
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full relative">
            <div className="aspect-square bg-gray-100 rounded-3xl overflow-hidden border border-gray-200 relative">
              {/* A visually striking image placeholder */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white font-bold text-lg">Nigeria High-Trust Marketplace.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BOTTOM CTA */}
      <section className="bg-orange-600 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Rocket className="text-white/20 mx-auto mb-6" size={64} />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to join the revolution?</h2>
          <p className="text-orange-100 mb-8 text-lg max-w-xl mx-auto">Whether you are looking to sell your products or find exactly what you need, OjaLoop is built for you.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="bg-white text-orange-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition shadow-xl">
              Create a Free Account
            </Link>
            <Link href="/contact" className="bg-orange-700 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-800 transition">
              Contact Our Team
            </Link>
          </div>
        </div>
      </section>
      
    </div>
  );
}