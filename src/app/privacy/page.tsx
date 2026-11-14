import Link from "next/link";
import { Shield, Lock, Eye, UserX, ArrowLeft, Mail, Database, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | OjaLoop",
  description: "Learn how OjaLoop collects, uses, and protects your personal data.",
};

export default function PrivacyPolicyPage() {
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
              <Shield size={24} />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Privacy Policy</h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl">
            Your privacy matters to us. This policy explains how we collect, use, and protect your personal information on OjaLoop.
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
              <a href="#collect" className="block hover:text-orange-600 transition">1. Data We Collect</a>
              <a href="#use" className="block hover:text-orange-600 transition">2. How We Use Data</a>
              <a href="#share" className="block hover:text-orange-600 transition">3. Sharing Your Data</a>
              <a href="#security" className="block hover:text-orange-600 transition">4. Data Security</a>
              <a href="#rights" className="block hover:text-orange-600 transition">5. Your Rights</a>
              <a href="#cookies" className="block hover:text-orange-600 transition">6. Cookies</a>
            </nav>
          </div>
        </aside>

        {/* MAIN LEGAL TEXT */}
        <div className="flex-1 bg-white p-6 md:p-10 rounded-3xl border border-gray-200 shadow-sm space-y-12">
          
          {/* Section 1 */}
          <section id="collect" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <Database className="text-orange-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">1. Information We Collect</h2>
            </div>
            <div className="text-gray-600 space-y-4 leading-relaxed text-sm md:text-base">
              <p>
                To provide a safe and functional marketplace, OjaLoop collects the following types of information:
              </p>
              <ul className="list-disc pl-5 space-y-2 font-medium text-gray-700">
                <li><strong>Account Data:</strong> Your name, email address, phone number, and profile picture.</li>
                <li><strong>Transaction Data:</strong> Details of products you buy or sell, and messages sent between buyers and sellers.</li>
                <li><strong>Payment Data:</strong> When you make a payment, it is processed securely by Paystack. <strong>OjaLoop does not store your card details.</strong></li>
                <li><strong>Device Data:</strong> IP address, browser type, and operating system, used to prevent fraud and secure your account.</li>
              </ul>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 2 */}
          <section id="use" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="text-blue-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">2. How We Use Your Information</h2>
            </div>
            <div className="text-gray-600 space-y-4 leading-relaxed text-sm md:text-base">
              <p>We use your data for the following purposes:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>To create and manage your OjaLoop account.</li>
                <li>To process Escrow payments and securely release funds to sellers.</li>
                <li>To enable In-App chat and WhatsApp messaging between buyers and sellers.</li>
                <li>To verify seller identities and prevent fraudulent activity.</li>
                <li>To send you important order updates, security alerts, and (if you opt-in) promotional offers.</li>
              </ul>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 3 */}
          <section id="share" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <ShieldAlert className="text-purple-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">3. Sharing Your Information</h2>
            </div>
            <div className="text-gray-600 space-y-4 leading-relaxed text-sm md:text-base">
              <p>
                We <strong>never</strong> sell your personal data to third parties. We only share data with trusted partners to make the marketplace work:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Payment Processors:</strong> Paystack processes your payments securely.</li>
                <li><strong>Logistics Partners:</strong> If applicable, we may share delivery details with courier services to ship your items.</li>
                <li><strong>Law Enforcement:</strong> We may disclose information if required by Nigerian law or to investigate illegal activities on the platform.</li>
              </ul>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 4 */}
          <section id="security" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="text-green-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">4. Data Security</h2>
            </div>
            <div className="text-gray-600 space-y-4 leading-relaxed text-sm md:text-base">
              <p>
                We take the security of your data extremely seriously. OjaLoop is built using enterprise-grade technology (Next.js and Supabase). 
              </p>
              <p>
                Your data is protected using Row Level Security (RLS) and encrypted connections (SSL). Access to sensitive information, such as admin dashboards, is strictly limited to authorized CodeCraft Technologies personnel.
              </p>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 5 */}
          <section id="rights" className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-4">
              <UserX className="text-red-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">5. Your Rights</h2>
            </div>
            <div className="text-gray-600 space-y-4 leading-relaxed text-sm md:text-base">
              <p>You have full control over your personal data on OjaLoop:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Right to Access:</strong> You can view your profile information in the Account Settings page.</li>
                <li><strong>Right to Edit:</strong> You can update your name, phone number, and location at any time.</li>
                <li><strong>Right to Delete:</strong> You can permanently delete your account from the Settings page. Once deleted, your data and order history will be removed from our active databases.</li>
              </ul>
              <div className="mt-4">
                <Link href="/buyer/settings" className="text-orange-600 font-bold hover:underline">
                  Go to Account Settings &rarr;
                </Link>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 6 */}
          <section id="cookies" className="scroll-mt-24">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies & Tracking</h2>
            <div className="text-gray-600 space-y-4 leading-relaxed text-sm md:text-base">
              <p>
                OjaLoop uses essential cookies to keep you logged in and secure your session. We do not use intrusive third-party tracking cookies for advertising purposes.
              </p>
            </div>
          </section>

          {/* CONTACT BOX */}
          <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><Mail size={18} /> Data Protection Officer</h3>
            <p className="text-sm text-gray-600 mb-4">If you have questions about this Privacy Policy or how your data is handled, please contact us.</p>
            <Link href="/contact" className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-800 transition">
              Contact Support
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}