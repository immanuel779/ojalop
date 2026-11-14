import Link from "next/link";
import { FaXTwitter, FaInstagram, FaFacebookF, FaWhatsapp, FaGooglePlay, FaApple } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-[#1a1124] text-gray-300 pt-12 pb-24 md:pb-12 mt-10">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Dark Footer Logo */}
        <Link href="/" className="font-bold text-2xl text-white tracking-tight flex items-center gap-1 mb-4">
          <span className="bg-orange-600 text-white p-1 rounded-md text-lg leading-none">O</span>
          jaLoop
        </Link>
        <p className="text-sm text-gray-400 mb-8 max-w-sm">
          Nigeria&apos;s premier high-trust online marketplace with OjaLoop Escrow protection for cars, property, gadgets, and services.
        </p>

        {/* REAL Social Icons */}
        <div className="mb-10">
          <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Follow Our Community</h3>
          <div className="flex gap-3">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition text-white">
              <FaXTwitter size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition text-white">
              <FaInstagram size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition text-white">
              <FaFacebookF size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:bg-[#20bd5a] transition">
              <FaWhatsapp size={22} />
            </a>
          </div>
        </div>

        {/* Links Columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Company</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-orange-500">About OjaLoop</Link></li>
              <li><Link href="/affiliate" className="hover:text-orange-500">Affiliate Program</Link></li>
              <li><Link href="/advertise" className="hover:text-orange-500">Advertise on OjaLoop</Link></li>
              <li><Link href="/how-it-works" className="hover:text-orange-500">How It Works</Link></li>
              <li><Link href="/pricing" className="hover:text-orange-500">Pricing</Link></li>
              <li><Link href="/contact" className="hover:text-orange-500">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Marketplace</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/search" className="hover:text-orange-500">Browse All Listings</Link></li>
              <li><Link href="/stores" className="hover:text-orange-500 text-orange-500 font-bold">Official Stores Directory</Link></li>
              <li><Link href="/seller/onboarding" className="hover:text-orange-500">Post an Ad Free</Link></li>
              {/* FIXED LINK BELOW */}
              <li><Link href="/seller/promotions" className="hover:text-orange-500">Promote with Premium Ad</Link></li>
              <li><Link href="/seller/dashboard" className="hover:text-orange-500">Seller Dashboard</Link></li>
            </ul>
          </div>
          
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Download OjaLoop App</h3>
            <p className="text-sm text-gray-400 mb-4">Instant chat alerts, Escrow wallet, and seamless listing management on your mobile device.</p>
            <div className="flex flex-col gap-3">
              
              {/* Google Play Button with COMING SOON */}
              <button className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3 w-full md:w-52 hover:bg-white/10 transition text-left relative overflow-hidden">
                <FaGooglePlay size={24} className="text-white" />
                <div>
                  <div className="text-[10px] text-gray-400 uppercase leading-tight">Get it on</div>
                  <div className="text-white font-bold text-lg leading-tight">Google Play</div>
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-600 text-white text-[9px] font-bold px-2 py-1 rounded">
                  COMING SOON
                </div>
              </button>
              
              {/* Apple App Store Button with COMING SOON */}
              <button className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3 w-full md:w-52 hover:bg-white/10 transition text-left relative overflow-hidden">
                <FaApple size={28} className="text-white" />
                <div>
                  <div className="text-[10px] text-gray-400 uppercase leading-tight">Download on the</div>
                  <div className="text-white font-bold text-lg leading-tight">App Store</div>
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-600 text-white text-[9px] font-bold px-2 py-1 rounded">
                  COMING SOON
                </div>
              </button>

            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} OjaLoop Online Marketplace. Licensed & Registered in Nigeria.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-white transition">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link href="/refund" className="hover:text-white transition">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}