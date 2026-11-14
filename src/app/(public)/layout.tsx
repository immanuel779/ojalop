import GlobalCallListener from "@/components/GlobalCallListener";
import NotificationBell from "@/components/layout/NotificationBell";
import Link from "next/link";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import { Search, MapPin, MessageSquare, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import UserDropdown from "@/components/layout/UserDropdown";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profileName = "";
  let avatarUrl = null;
  let isSeller = false;
  let isAdmin = false;
  
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .single();
      
    profileName = profile?.display_name || user.email || "User";
    avatarUrl = profile?.avatar_url || null;

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
      
    isSeller = roles?.some(r => r.role === 'seller') || false;
    isAdmin = roles?.some(r => r.role === 'super_admin' || r.role === 'moderator') || false;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0 font-sans">
      
      {/* GLOBAL CALL LISTENER */}
      <GlobalCallListener />

      {/* HEADER */}
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-16 gap-2">
          
          {/* Left: Search & Location (flex-1 pushes the logo to the center) */}
          <div className="flex-1 flex items-center justify-start gap-2 lg:gap-3">
            <Link href="/search" className="md:hidden p-2 bg-gray-100 rounded-full text-gray-600 hover:text-orange-600 transition">
              <Search size={18} />
            </Link>

            <form action="/search" method="GET" className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-48 lg:w-72 xl:w-96 border border-transparent focus-within:border-orange-500 focus-within:bg-white transition-all">
              <Search size={18} className="text-gray-400" />
              <input type="text" name="q" placeholder="Search marketplace..." className="bg-transparent outline-none ml-2 text-sm w-full text-gray-700 placeholder-gray-400" />
            </form>

            <div className="hidden xl:flex items-center text-sm font-medium text-gray-600 cursor-pointer hover:text-orange-600 transition">
              <MapPin size={16} className="text-orange-500 mr-1.5" />
              <span>All Nigeria</span>
            </div>
          </div>
          
          {/* Center: Logo (flex-shrink-0 ensures it never gets squished) */}
          <Link href="/" className="flex-shrink-0 font-bold text-xl md:text-2xl text-orange-600 tracking-tight flex items-center gap-1.5">
            <span className="bg-orange-600 text-white p-1 rounded-lg text-lg leading-none flex items-center justify-center shadow-sm">O</span>
            jaLoop
          </Link>

          {/* Right: User Actions (flex-1 pushes the logo to the center) */}
          <div className="flex-1 flex items-center justify-end gap-1 sm:gap-2 md:gap-3">
            {user ? (
              <>
                <NotificationBell userId={user.id} />
                <Link href="/buyer/messages" className="p-2 text-gray-600 hover:text-orange-600 transition hidden sm:block relative">
                  <MessageSquare size={20} />
                </Link>
                <UserDropdown 
                  userName={profileName} 
                  userEmail={user.email || ""} 
                  isSeller={isSeller} 
                  avatarUrl={avatarUrl}
                  isAdmin={isAdmin}
                />
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-bold text-gray-700 hover:text-orange-600 transition px-2 hidden sm:block">
                  Sign In
                </Link>
                <Link href="/register" className="bg-orange-600 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-orange-700 shadow-sm shadow-orange-600/20 transition flex items-center gap-1">
                  <User size={14} className="sm:hidden" />
                  <span className="hidden sm:inline">Register</span>
                  <span className="sm:hidden">Join</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full min-h-screen">
        {children}
      </main>

      <BottomNav />
      <Footer />
    </div>
  );
}