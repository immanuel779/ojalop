import Link from "next/link";
import { Shield, FileText, Scale, AlertTriangle, ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Terms of Service | OjaLoop",
  description: "Read the terms and conditions for using the OjaLoop marketplace.",
};

export default function TermsOfServicePage() {
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      
      {/* HEADER */}
      <div className="bg-gray-900 text-white pt-16 pb-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white mb-6 transition">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center">
              <Scale size={24} />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Terms of Service</h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl">
            Please read these terms carefully before using OjaLoop. By accessing our platform, you agree to be bound by these rules.
          </p>
          <p className="text-sm font-medium text-orange-500 mt-4">Last Updated: November 2026</p>
        </div>
      </div>

      {/* CONTENT LAYOUT */}
      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20 flex flex-col lg:flex-row gap-8">
        
        {/* STICKY SIDEBAR (Desktop) */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4 uppercase text-xs tracking-wider">Contents</h3>
            <nav className="space-y-2 text-sm font-medium text-gray-500">
              <a href="#introduction" className="block hover:text-orange-600 transition">1. Introduction</a>
              <a href="#escrow" className="block hover:text-orange-600 transition">2. OjaLoop Escrow & Fees</a>
              <a href="#seller-obligations" className="block hover:text-orange-600 transition">3. Seller Obligations</a>
              <a href="#prohibited" className="block hover:text-orange-600 transition">4. Prohibited Items</a>
              <a href="#disputes" className="block hover:text-orange-600 transition">5. Disputes & Refunds</a>
              <a href="#liability" className="block hover:text-orange-600 transition">6. Limitation of Liability</a>
            </nav>
          </div>
        </aside>

        {/* MAIN LEGAL TEXT */}
        <div className="flex-1 bg-white p-6 md:p-10 rounded-3xl border border-gray-200 shadow-sm space-y-12">
          
          {/* Section 1 */}
          <section id="introduction" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-orange-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">1. Introduction</h2>
            </div>
            <div className="text-gray-600 space-y-4 leading-relaxed text-sm md:text-base">
              <p>
                Welcome to OjaLoop. OjaLoop is a multi-vendor marketplace owned and operated by <strong>CodeCraft Technologies</strong> (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), registered in Nigeria. 
              </p>
              <p>
                By creating an account, browsing listings, or using our services, you agree to comply with and be legally bound by these Terms of Service. If you do not agree to these terms, please do not use the platform.
              </p>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 2 */}
          <section id="escrow" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-green-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">2. OjaLoop Escrow & Fees</h2>
            </div>
            <div className="text-gray-600 space-y-4 leading-relaxed text-sm md:text-base">
              <p>
                OjaLoop provides an Escrow payment system to protect both buyers and sellers. When a buyer pays for an item using Escrow:
              </p>
              <ul className="list-disc pl-5 space-y-2 font-medium text-gray-700">
                <li>The funds are securely held by OjaLoop&apos;s payment partners (e.g., Paystack).</li>
                <li>The seller is notified to dispatch the item.</li>
                <li>The funds are <strong>only released</strong> to the seller after the buyer confirms receipt and satisfaction with the item.</li>
              </ul>
              <p>
                <strong>Platform Fees:</strong> OjaLoop charges a standard Escrow fee of <strong>5%</strong> on every successful transaction. This fee covers payment processing, dispute resolution, and platform maintenance. 
              </p>
              <p>
                <strong>Affiliate Commissions:</strong> If a buyer was referred to the platform via an Affiliate tracking link, OjaLoop will pay the Affiliate a commission of <strong>2.5%</strong> out of the 5% platform fee. The seller&apos;s payout is not affected by this; the seller still receives 95% of the listing price.
              </p>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 3 */}
          <section id="seller-obligations" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="text-blue-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">3. Seller Obligations</h2>
            </div>
            <div className="text-gray-600 space-y-4 leading-relaxed text-sm md:text-base">
              <p>If you register as a seller on OjaLoop, you agree to the following:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>You must provide accurate descriptions, images, and prices for all listings.</li>
                <li>You must ship items promptly once an order is accepted and paid for.</li>
                <li>You must adhere to your stated shipping and return policies.</li>
                <li>You cannot manipulate reviews, pricing, or order statuses.</li>
              </ul>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 4 */}
          <section id="prohibited" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">4. Prohibited Items & Activities</h2>
            </div>
            <div className="text-gray-600 space-y-4 leading-relaxed text-sm md:text-base">
              <p>
                OjaLoop strictly prohibits the sale of illegal goods, counterfeit products, stolen items, weapons, drugs, and any content that violates Nigerian law or our community guidelines.
              </p>
              <p>
                Accounts found violating this policy will be immediately suspended, funds may be frozen pending investigation, and the matter may be reported to law enforcement.
              </p>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 5 */}
          <section id="disputes" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="text-purple-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">5. Disputes & Refunds</h2>
            </div>
            <div className="text-gray-600 space-y-4 leading-relaxed text-sm md:text-base">
              <p>
                If a buyer receives an item that is not as described, they must raise a dispute through the OjaLoop platform within <strong>48 hours</strong> of delivery.
              </p>
              <p>
                Our support team will investigate the claim. If the dispute is valid, OjaLoop will initiate a refund from the Escrow wallet back to the buyer. OjaLoop&apos;s decision in dispute resolution is final.
              </p>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 6 */}
          <section id="liability" className="scroll-mt-24">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
            <div className="text-gray-600 space-y-4 leading-relaxed text-sm md:text-base">
              <p>
                While we provide Escrow services, OjaLoop is a platform that connects independent buyers and sellers. We do not manufacture, inspect, or guarantee the quality of items sold by third-party sellers. 
              </p>
              <p>
                To the maximum extent permitted by law, CodeCraft Technologies shall not be liable for any indirect, incidental, or consequential damages resulting from the use of our platform.
              </p>
            </div>
          </section>

          {/* CONTACT BOX */}
          <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">Have questions about our Terms?</h3>
            <p className="text-sm text-gray-600 mb-4">If you need clarification on any of these terms, our legal and support team is here to help.</p>
            <Link href="/contact" className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 transition">
              Contact Legal Support
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}