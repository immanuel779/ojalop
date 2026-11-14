import Link from "next/link";
import { ArrowLeft, RotateCcw, ShieldCheck, Clock, AlertTriangle, HelpCircle, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Refund Policy | OjaLoop",
  description: "Learn how the OjaLoop Escrow Refund Policy protects buyers and sellers.",
};

export default function RefundPolicyPage() {
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
              <RotateCcw size={24} />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Refund Policy</h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl">
            Shop with confidence. Our Escrow system ensures your money is protected until you are 100% satisfied with your purchase.
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
              <a href="#escrow-protection" className="block hover:text-orange-600 transition">1. Escrow Protection</a>
              <a href="#eligible" className="block hover:text-orange-600 transition">2. Refund Eligibility</a>
              <a href="#not-eligible" className="block hover:text-orange-600 transition">3. Non-Refundable Items</a>
              <a href="#how-to-dispute" className="block hover:text-orange-600 transition">4. How to Request</a>
              <a href="#timelines" className="block hover:text-orange-600 transition">5. Timelines</a>
            </nav>
          </div>
        </aside>

        {/* MAIN LEGAL TEXT */}
        <div className="flex-1 bg-white p-6 md:p-10 rounded-3xl border border-gray-200 shadow-sm space-y-12">
          
          {/* Section 1 */}
          <section id="escrow-protection" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="text-green-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">1. How Escrow Protects You</h2>
            </div>
            <div className="text-gray-600 space-y-4 leading-relaxed text-sm md:text-base">
              <p>
                When you buy an item on OjaLoop using the Escrow payment method, your money does <strong>not</strong> go directly to the seller. It is securely held by OjaLoop.
              </p>
              <p>
                This gives you the safety to inspect the item upon delivery. If the item is exactly as described, you click Confirm Delivery and the seller gets paid. If there is a problem, you are covered by this Refund Policy.
              </p>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 2 */}
          <section id="eligible" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="text-blue-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">2. When Are You Eligible for a Refund?</h2>
            </div>
            <div className="text-gray-600 space-y-4 leading-relaxed text-sm md:text-base">
              <p>You may request a full refund if any of the following apply:</p>
              <ul className="list-disc pl-5 space-y-2 font-medium text-gray-700">
                <li><strong>Item Not Received:</strong> The seller failed to ship the item within the agreed timeframe.</li>
                <li><strong>Significantly Not as Described:</strong> The item is a completely different model, color, or size than what was advertised.</li>
                <li><strong>Damaged on Arrival:</strong> The item arrived broken or defective (and was not sold as a faulty item).</li>
                <li><strong>Counterfeit:</strong> The item is a fake or replica when it was advertised as original.</li>
              </ul>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 3 */}
          <section id="not-eligible" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-red-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">3. When Are Refunds NOT Allowed?</h2>
            </div>
            <div className="text-gray-600 space-y-4 leading-relaxed text-sm md:text-base">
              <p>As a marketplace, we must also protect our sellers. We do not issue refunds for:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Buyers Remorse:</strong> You simply changed your mind after the item was delivered.</li>
                <li><strong>Minor Cosmetic Differences:</strong> Slight variations in lighting or color that are unavoidable in online photography.</li>
                <li><strong>Fitting Issues:</strong> Buying the wrong size for clothing or shoes (unless the sizing chart provided by the seller was incorrect).</li>
                <li><strong>Items Modified by Buyer:</strong> If you alter, wash, or damage the item after receiving it.</li>
              </ul>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 4 */}
          <section id="how-to-dispute" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <HelpCircle className="text-purple-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">4. How to Request a Refund</h2>
            </div>
            <div className="text-gray-600 space-y-4 leading-relaxed text-sm md:text-base">
              <p>
                You must <strong>NOT</strong> click Confirm Delivery if you are unhappy with the item. Once you click confirm, the funds are released to the seller, and we can no longer refund you from Escrow.
              </p>
              <p>To request a refund:</p>
              <ol className="list-decimal pl-5 space-y-2 font-medium text-gray-700">
                <li>Go to your <strong>My Orders</strong> page.</li>
                <li>Locate the order and click <strong>Report Problem</strong> or open a <strong>Dispute</strong>.</li>
                <li>Provide clear evidence (photos or videos of the damaged/wrong item).</li>
                <li>Our support team will intervene, review the evidence, and mediate between you and the seller.</li>
              </ol>
              <div className="mt-4">
                <Link href="/buyer/orders" className="text-orange-600 font-bold hover:underline">
                  Go to My Orders &rarr;
                </Link>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 5 */}
          <section id="timelines" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-orange-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">5. Refund Timelines</h2>
            </div>
            <div className="text-gray-600 space-y-4 leading-relaxed text-sm md:text-base">
              <p>
                Once a refund is approved by our support team, the money will be released from Escrow and returned to your original payment method.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Card Payments:</strong> 3 - 5 business days depending on your bank.</li>
                <li><strong>Bank Transfer:</strong> 24 - 48 hours.</li>
                <li><strong>OjaLoop Wallet:</strong> Instant (you can use it to shop immediately).</li>
              </ul>
            </div>
          </section>

          {/* CONTACT BOX */}
          <div className="mt-12 p-6 bg-orange-50 rounded-2xl border border-orange-100">
            <h3 className="font-bold text-orange-900 mb-2">Need to open a dispute?</h3>
            <p className="text-sm text-orange-800 mb-4">If a seller is refusing to cooperate or you feel you have been scammed, contact our dispute resolution team immediately.</p>
            <Link href="/contact" className="inline-block bg-orange-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-orange-700 transition">
              Contact Support
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}