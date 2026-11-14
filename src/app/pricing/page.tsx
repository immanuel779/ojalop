import Link from "next/link";
import { Check, X, ShieldCheck, Zap, Rocket, Building2, ArrowRight, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Pricing & Plans | OjaLoop",
  description: "Choose the perfect plan for your business. Start selling for free on OjaLoop.",
};

export default function PricingPage() {
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      
      {/* HERO SECTION */}
      <div className="bg-gray-900 text-white pt-20 pb-28 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
            Simple, transparent pricing.
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Start selling for free. Upgrade when you are ready to grow your business, get verified, and boost your sales.
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 text-orange-400 px-4 py-2 rounded-full font-bold text-sm border border-white/10">
            <ShieldCheck size={16} /> No hidden fees. Cancel anytime.
          </div>
        </div>
      </div>

      {/* PRICING CARDS (Overlapping the Hero) */}
      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* STARTER TIER */}
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Starter</h2>
              <p className="text-gray-500 text-sm">Perfect for casual sellers testing the waters.</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">₦0</span>
              <span className="text-gray-500 font-medium">/month</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <Check size={18} className="text-green-500 shrink-0" /> Up to 5 active listings
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <Check size={18} className="text-green-500 shrink-0" /> Basic store profile
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <Check size={18} className="text-green-500 shrink-0" /> Standard Escrow protection (2.5% fee)
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <X size={18} className="text-gray-300 shrink-0" /> No Verified Badge
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <X size={18} className="text-gray-300 shrink-0" /> No Homepage Promotion
              </li>
            </ul>
            <Link href="/register" className="w-full bg-gray-100 text-gray-900 py-3 rounded-xl font-bold text-center hover:bg-gray-200 transition">
              Start for Free
            </Link>
          </div>

          {/* PRO TIER (Highlighted) */}
          <div className="bg-gray-900 p-8 rounded-3xl border-2 border-orange-500 shadow-2xl flex flex-col relative transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Most Popular
            </div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Pro Seller</h2>
              <p className="text-gray-400 text-sm">For serious businesses ready to scale fast.</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">₦5,000</span>
              <span className="text-gray-400 font-medium">/month</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <Check size={18} className="text-orange-500 shrink-0" /> Up to 50 active listings
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <Check size={18} className="text-orange-500 shrink-0" /> <span className="text-white font-bold">Verified Blue Badge</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <Check size={18} className="text-orange-500 shrink-0" /> 3 Boosted Ads per month
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <Check size={18} className="text-orange-500 shrink-0" /> Discounted Escrow fee (1.5%)
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <Check size={18} className="text-orange-500 shrink-0" /> Priority WhatsApp Support
              </li>
            </ul>
            <Link href="/register" className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold text-center hover:bg-orange-700 transition shadow-lg shadow-orange-600/30">
              Upgrade to Pro
            </Link>
          </div>

          {/* ENTERPRISE TIER */}
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h2>
              <p className="text-gray-500 text-sm">For dealerships, brands, and high-volume sellers.</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">₦20,000</span>
              <span className="text-gray-500 font-medium">/month</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <Check size={18} className="text-green-500 shrink-0" /> <span className="font-bold">Unlimited</span> active listings
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <Check size={18} className="text-green-500 shrink-0" /> Verified Badge + Custom Branding
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <Check size={18} className="text-green-500 shrink-0" /> 10 Boosted Ads per month
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <Check size={18} className="text-green-500 shrink-0" /> Lowest Escrow fee (1.0%)
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <Check size={18} className="text-green-500 shrink-0" /> Dedicated Account Manager
              </li>
            </ul>
            <Link href="/contact" className="w-full bg-gray-100 text-gray-900 py-3 rounded-xl font-bold text-center hover:bg-gray-200 transition">
              Contact Sales
            </Link>
          </div>

        </div>
      </div>

      {/* HOW WE MAKE MONEY / FAQ */}
      <div className="max-w-4xl mx-auto px-4 mt-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
            <HelpCircle className="text-orange-500" /> Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Why do you charge an Escrow fee?",
              a: "Our Escrow system uses secure payment gateways like Paystack to hold buyer funds. The small percentage fee (2.5% for free users) covers the transaction costs, secures the platform, and allows us to provide 24/7 dispute resolution."
            },
            {
              q: "Can I cancel my Pro subscription anytime?",
              a: "Yes! There are no long-term contracts. You can cancel your subscription from your Seller Dashboard at any time. Your store will simply revert to the Starter tier at the end of the billing cycle."
            },
            {
              q: "How do I pay for my subscription?",
              a: "We use Paystack for all subscriptions. You can pay securely using your debit card, bank transfer, or USSD."
            },
            {
              q: "What happens if I exceed my 5 free listings?",
              a: "You will be prompted to either archive old listings or upgrade to the Pro plan to publish new ones. You will never be charged automatically without your consent."
            }
          ].map((faq, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM CTA */}
      <div className="max-w-4xl mx-auto px-4 mt-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to grow your business?</h2>
        <p className="text-gray-500 mb-8">Join thousands of Nigerian sellers making money on OjaLoop.</p>
        <Link href="/seller/onboarding" className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition shadow-xl">
          Create a Store <ArrowRight size={20} />
        </Link>
      </div>

    </div>
  );
}