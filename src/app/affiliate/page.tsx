import Link from "next/link";
import { 
  Link as LinkIcon, Share2, Wallet, TrendingUp, 
  CheckCircle2, ArrowRight, DollarSign, Users, Zap, HelpCircle
} from "lucide-react";

export const metadata = {
  title: "Affiliate Program | Earn with OjaLoop",
  description: "Join the OjaLoop Affiliate Program and earn commissions by referring buyers and sellers.",
};

export default function AffiliatePage() {
  return (
    <div className="bg-white min-h-screen">
      
      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white pt-20 pb-28 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-orange-400 px-4 py-2 rounded-full font-bold text-sm mb-6 border border-white/10 backdrop-blur-sm">
            <Zap size={16} /> OjaLoop Affiliates
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
            Turn Your Network into <span className="text-orange-500">Income.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Share products and stores you love on WhatsApp, Twitter, or Instagram. When people buy through your link, you earn a commission. It is that simple.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register?role=affiliate" className="bg-orange-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-600/30 flex items-center gap-2">
              Join Program <ArrowRight size={20} />
            </Link>
            <a href="#how-it-works" className="bg-white/10 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition border border-white/10">
              How It Works
            </a>
          </div>
        </div>
      </section>

      {/* OVERLAPPING CARDS (The 3 Steps) */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 -mt-12 relative z-20 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center relative">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <LinkIcon size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">1. Get Your Link</h3>
            <p className="text-sm text-gray-500">Sign up and get a unique tracking link to your favorite products or stores.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center relative">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Share2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">2. Share Everywhere</h3>
            <p className="text-sm text-gray-500">Post it on your WhatsApp status, Twitter, or send it to friends who need it.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center relative">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Wallet size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">3. Earn Money</h3>
            <p className="text-sm text-gray-500">When someone buys through your link, your commission is instantly credited to your wallet.</p>
          </div>
        </div>
      </section>

      {/* COMMISSION & CALCULATOR SECTION */}
      <section className="py-20 bg-gray-50 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 w-full">
            <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-200 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="text-orange-500" /> Earning Potential
              </h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Product Sold Value</span>
                  <span className="font-bold text-gray-900">₦100,000</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Your Commission (2.5%)</span>
                  <span className="font-bold text-green-600">₦2,500</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">10 Sales / Month</span>
                  <span className="font-bold text-gray-900">₦25,000</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg text-gray-900 font-bold">Your Monthly Income</span>
                  <span className="text-2xl font-bold text-orange-600">₦25,000+</span>
                </div>
              </div>
              
              <Link href="/register?role=affiliate" className="w-full block text-center bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-900/20">
                Start Earning Today
              </Link>
            </div>
          </div>

          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why join the <span className="text-orange-600">OjaLoop Affiliates</span>?</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">High Commissions</h3>
                  <p className="text-sm text-gray-600 mt-1">Earn 2.5% on every single transaction made through your unique link. No limits on how much you can make.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Dedicated Dashboard</h3>
                  <p className="text-sm text-gray-600 mt-1">Track your clicks, conversions, and earnings in real-time from a beautiful analytics dashboard.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
                  <Wallet size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Fast Payouts</h3>
                  <p className="text-sm text-gray-600 mt-1">Withdraw your earnings directly to your Nigerian bank account as soon as you hit ₦5,000.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center flex items-center justify-center gap-2">
          <HelpCircle className="text-orange-500" /> Affiliate FAQs
        </h2>
        <div className="space-y-4">
          {[
            {
              q: "How do I get paid?",
              a: "All commissions are paid directly to your Nigerian bank account. Once your dashboard shows a balance of ₦5,000 or more, you can request a withdrawal."
            },
            {
              q: "How long does the tracking cookie last?",
              a: "Our tracking links last for 30 days. If your friend clicks your link today but buys the item next week, you still get the commission!"
            },
            {
              q: "Can I refer sellers to open a store?",
              a: "Yes! If a seller opens a store and makes sales using your referral link, you get a commission from their first month's sales."
            }
          ].map((faq, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="bg-orange-600 py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Start sharing. Start earning.</h2>
          <p className="text-orange-100 mb-8">Join thousands of Nigerians who are monetizing their social media influence on OjaLoop.</p>
          <Link href="/register?role=affiliate" className="inline-block bg-white text-orange-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 transition shadow-xl">
            Create Affiliate Account
          </Link>
        </div>
      </section>

    </div>
  );
}