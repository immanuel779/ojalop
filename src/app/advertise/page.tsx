import Link from "next/link";
import { 
  Megaphone, BarChart3, Target, Flame, CheckCircle2, 
  ArrowRight, Eye, MousePointerClick, ShieldCheck, Mail 
} from "lucide-react";

export const metadata = {
  title: "Advertise on OjaLoop | Reach Millions of Buyers",
  description: "Promote your brand, products, and deals to thousands of high-intent buyers across Nigeria.",
};

export default function AdvertisePage() {
  return (
    <div className="bg-white min-h-screen">
      
      {/* HERO SECTION */}
      <section className="bg-gray-900 text-white pt-20 pb-28 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-orange-400 px-4 py-2 rounded-full font-bold text-sm mb-6 border border-white/10 backdrop-blur-sm">
            <Megaphone size={16} /> OjaLoop Ads Manager
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-tight">
            Put Your Brand in Front of <span className="text-orange-500">Thousands</span> of Buyers.
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Stop wasting money on random ads. Promote your products on OjaLoop and reach high-intent shoppers who are ready to buy right now.
          </p>
          <div className="flex justify-center gap-4">
            <a href="#contact-sales" className="bg-orange-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg shadow-orange-600/30">
              Start a Campaign
            </a>
            <a href="#placements" className="bg-white/10 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 transition border border-white/10">
              View Ad Placements
            </a>
          </div>
        </div>
      </section>

      {/* FLOATING STATS CARDS */}
      <section className="max-w-6xl mx-auto px-4 -mt-12 relative z-20 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 text-center">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Eye size={24} />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">100K+</h3>
            <p className="text-sm font-medium text-gray-500">Monthly Page Views</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 text-center">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MousePointerClick size={24} />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">8.5%</h3>
            <p className="text-sm font-medium text-gray-500">Average Click-Through Rate</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 text-center">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Target size={24} />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">85%</h3>
            <p className="text-sm font-medium text-gray-500">Mobile Users (Ready to Buy)</p>
          </div>
        </div>
      </section>

      {/* AD PLACEMENTS */}
      <section id="placements" className="py-20 bg-gray-50 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Premium Ad Placements</h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">Choose where you want your brand to appear. From homepage takeovers to top search results.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Placement 1 */}
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="h-40 bg-gray-900 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=600&q=80')] bg-cover bg-center opacity-40"></div>
                <h3 className="text-white font-bold text-xl relative z-10">Homepage Hero Banner</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4">The first thing every visitor sees. Massive visibility for your brand or biggest sales.</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle2 size={16} className="text-green-500" /> 100% Share of Voice</li>
                  <li className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle2 size={16} className="text-green-500" /> Direct link to your store</li>
                  <li className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle2 size={16} className="text-green-500" /> Weekly performance report</li>
                </ul>
                <p className="text-2xl font-bold text-gray-900">₦150,000 <span className="text-sm font-normal text-gray-500">/ week</span></p>
              </div>
            </div>

            {/* Placement 2 */}
            <div className="bg-white rounded-3xl border-2 border-orange-500 overflow-hidden shadow-lg relative transform md:-translate-y-2">
              <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-20">BEST VALUE</div>
              <div className="h-40 bg-orange-600 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80')] bg-cover bg-center opacity-20"></div>
                <Flame className="text-white relative z-10 mb-2" size={32} />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl text-gray-900 mb-2">Deal of the Day</h3>
                <p className="text-gray-600 text-sm mb-4">Feature one specific product with a massive discount. Drives instant sales and traffic.</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle2 size={16} className="text-green-500" /> Featured in Deal section</li>
                  <li className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle2 size={16} className="text-green-500" /> Push notification to buyers</li>
                  <li className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle2 size={16} className="text-green-500" /> Social media shoutout</li>
                </ul>
                <p className="text-2xl font-bold text-gray-900">₦50,000 <span className="text-sm font-normal text-gray-500">/ day</span></p>
              </div>
            </div>

            {/* Placement 3 */}
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
              <div className="h-40 bg-gray-100 flex items-center justify-center relative">
                <BarChart3 className="text-orange-500 mb-2" size={32} />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl text-gray-900 mb-2">Sponsored Search</h3>
                <p className="text-gray-600 text-sm mb-4">Appear at the very top of the search results when buyers search for your category.</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle2 size={16} className="text-green-500" /> Keyword targeting</li>
                  <li className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle2 size={16} className="text-green-500" /> Premium Badge on listing</li>
                  <li className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle2 size={16} className="text-green-500" /> 30 days visibility</li>
                </ul>
                <p className="text-2xl font-bold text-gray-900">₦25,000 <span className="text-sm font-normal text-gray-500">/ month</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY ADVERTISE WITH US */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Advertise on <span className="text-orange-600">OjaLoop</span>?</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                  <Target size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">High-Intent Buyers</h3>
                  <p className="text-sm text-gray-600 mt-1">People on OjaLoop are not just browsing; they are looking to purchase. Your ads reach people ready to spend.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Premium Trust Environment</h3>
                  <p className="text-sm text-gray-600 mt-1">Because we use Escrow and verify sellers, our users trust the platform. Your brand inherits that trust.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Real-Time Analytics</h3>
                  <p className="text-sm text-gray-600 mt-1">You get a dedicated dashboard showing exactly how many people saw your ad, clicked it, and bought the product.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <div className="bg-gray-900 rounded-3xl p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl"></div>
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Scale?</h3>
              <p className="text-gray-400 text-sm mb-6">Our team will help you design the perfect campaign to hit your sales targets.</p>
              <a href="#contact-sales" className="inline-block bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition w-full">
                Talk to Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SALES FORM */}
      <section id="contact-sales" className="py-20 bg-gray-50 px-4">
        <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl border border-gray-200 shadow-xl">
          <div className="text-center mb-8">
            <Mail className="text-orange-500 mx-auto mb-4" size={32} />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Speak to our Ads Team</h2>
            <p className="text-gray-500 text-sm">Fill out this form and our team will reach out within 24 hours to set up your campaign.</p>
          </div>

          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Company / Brand Name</label>
                <input type="text" placeholder="e.g. Tech Hub Lagos" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 focus:bg-white transition" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Contact Email</label>
                <input type="email" placeholder="you@company.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 focus:bg-white transition" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Ad Placement of Interest</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 focus:bg-white transition text-gray-700">
                <option>Homepage Hero Banner (₦150,000/week)</option>
                <option>Deal of the Day (₦50,000/day)</option>
                <option>Sponsored Search (₦25,000/month)</option>
                <option>Custom Enterprise Package</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Estimated Monthly Budget</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 focus:bg-white transition text-gray-700">
                <option>Under ₦100,000</option>
                <option>₦100,000 - ₦500,000</option>
                <option>₦500,000 - ₦1,000,000</option>
                <option>Over ₦1,000,000</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Message (Optional)</label>
              <textarea rows={3} placeholder="Tell us about your products..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 focus:bg-white transition resize-none"></textarea>
            </div>

            <button type="button" className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-900/20 flex items-center justify-center gap-2 mt-4">
              Submit Ad Request <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </section>

    </div>
  );
}