import { ShieldCheck, ArrowLeft, ShoppingBag, Wallet } from "lucide-react";
import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 min-h-screen">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-orange-600 mb-6 transition">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Buy and Sell Safely with OjaLoop Escrow</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">Your money is held securely until you receive, inspect, and confirm your purchase. No risk. No release until you are satisfied.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <ShoppingBag className="text-orange-500" /> For Buyers
          </h2>
          <ol className="space-y-6">
            <li className="flex gap-4">
              <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
              <div>
                <h3 className="font-bold text-gray-900">Find an item</h3>
                <p className="text-sm text-gray-500 mt-1">Browse our marketplace and find a verified listing you love.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
              <div>
                <h3 className="font-bold text-gray-900">Request Order</h3>
                <p className="text-sm text-gray-500 mt-1">Click &quot;Request Order&quot; or contact the seller directly via WhatsApp or In-App Chat.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold shrink-0">3</div>
              <div>
                <h3 className="font-bold text-gray-900">Pay Securely (Coming Soon)</h3>
                <p className="text-sm text-gray-500 mt-1">OjaLoop holds your money in Escrow. The seller is notified to dispatch the item.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold shrink-0">4</div>
              <div>
                <h3 className="font-bold text-gray-900">Confirm Delivery</h3>
                <p className="text-sm text-gray-500 mt-1">Inspect the item. If you are happy, confirm the release. The seller gets paid!</p>
              </div>
            </li>
          </ol>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Wallet className="text-green-500" /> For Sellers
          </h2>
          <ol className="space-y-6">
            <li className="flex gap-4">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
              <div>
                <h3 className="font-bold text-gray-900">Post a listing</h3>
                <p className="text-sm text-gray-500 mt-1">Upload your product with clear photos and accurate descriptions.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
              <div>
                <h3 className="font-bold text-gray-900">Accept Orders</h3>
                <p className="text-sm text-gray-500 mt-1">Get notified when a buyer requests your item. Accept the order.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold shrink-0">3</div>
              <div>
                <h3 className="font-bold text-gray-900">Deliver the item</h3>
                <p className="text-sm text-gray-500 mt-1">Ship or arrange pickup. The buyer&apos;s payment is secured in Escrow.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold shrink-0">4</div>
              <div>
                <h3 className="font-bold text-gray-900">Get Paid</h3>
                <p className="text-sm text-gray-500 mt-1">Once the buyer confirms they are happy, the funds are released to your wallet.</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
      
      <div className="bg-gray-900 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-10"></div>
        <ShieldCheck className="text-orange-500 mx-auto mb-4 relative z-10" size={48} />
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 relative z-10">Ready to start trading safely?</h2>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto relative z-10">Join thousands of verified sellers and buyers on Nigeria&apos;s most trusted marketplace.</p>
        <div className="flex justify-center gap-4 relative z-10">
          <Link href="/register" className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-700 transition">Create Account</Link>
        </div>
      </div>
    </div>
  );
}