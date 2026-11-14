import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-white">
      
      {/* LEFT SIDE - Desktop Brand Image */}
      <div className="hidden lg:flex w-1/2 bg-gray-900 relative items-center justify-center overflow-hidden">
        {/* Background Image with Orange Overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/80 to-black/50 mix-blend-multiply"></div>
        
        {/* Content on top of image */}
        <div className="relative z-10 p-12 max-w-lg text-white">
          <Link href="/" className="font-bold text-3xl tracking-tight flex items-center gap-2 mb-12">
            <span className="bg-orange-600 text-white p-2 rounded-xl text-2xl leading-none shadow-lg">O</span>
            jaLoop
          </Link>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Buy & Sell Safely Across Nigeria.
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Join thousands of verified sellers and buyers. Secure payments, trusted stores, and millions of products.
          </p>
          <div className="flex items-center gap-4 text-sm font-medium">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-400 border-2 border-orange-600 flex items-center justify-center text-xs">T</div>
              <div className="w-10 h-10 rounded-full bg-gray-500 border-2 border-orange-600 flex items-center justify-center text-xs">A</div>
              <div className="w-10 h-10 rounded-full bg-gray-600 border-2 border-orange-600 flex items-center justify-center text-xs">J</div>
            </div>
            <span>Join 10,000+ active users</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo (Only shows on mobile) */}
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="font-bold text-2xl text-orange-600 tracking-tight inline-flex items-center gap-1">
              <span className="bg-orange-600 text-white p-1 rounded-md text-lg leading-none">O</span>
              jaLoop
            </Link>
          </div>
          
          {children}
          
        </div>
      </div>
      
    </div>
  );
}