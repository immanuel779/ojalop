import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Search } from "lucide-react"; 
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminNotificationBell from "@/components/admin/AdminNotificationBell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Auth Check
  if (!user) redirect("/login");

  // 2. Role Check (Only Super Admin & Moderator can access)
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  const isAdmin = roles?.some(r => r.role === 'super_admin' || r.role === 'moderator');

  if (!isAdmin) {
    redirect("/"); // Kick them out if they aren't an admin
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* The Advanced Sidebar */}
      <AdminSidebar userEmail={user.email || "admin@ojaloop.com"} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* Top Header (Desktop only) */}
        <header className="hidden md:flex bg-white border-b border-gray-200 h-16 items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4 w-96">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search users, orders, or listings..." 
              className="w-full bg-transparent outline-none text-sm text-gray-700"
            />
          </div>
          <div className="flex items-center gap-4">
            
            {/* REAL-TIME ADMIN BELL */}
            <AdminNotificationBell />
            
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
      </div>
    </div>
  );
}