/* eslint-disable @next/next/no-img-element */
import { createClient } from "@/lib/supabase/server";
import UserActions from "./UserActions";
import Link from "next/link";
import { Users, Store, ShieldBan, ShieldCheck } from "lucide-react";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const resolvedParams = await searchParams;
  const supabase = await createClient();

  // 1. Base Query for Profiles
  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (resolvedParams.filter === 'suspended') {
    query = query.eq('account_status', 'suspended');
  } else if (resolvedParams.filter === 'active') {
    query = query.eq('account_status', 'active');
  }

  if (resolvedParams.q) {
    query = query.ilike('display_name', `%${resolvedParams.q}%`);
  }

  const { data: profiles, error: profileError } = await query;

  // If there's an error, show it on screen so you know what's wrong
  if (profileError) {
    return (
      <div className="p-8 bg-red-50 text-red-600 rounded-xl border border-red-200">
        <h2 className="font-bold text-lg">Error Fetching Users</h2>
        <p>{profileError.message}</p>
        <p className="text-sm mt-2">Did you run the SQL to fix the RLS policies?</p>
      </div>
    );
  }

  // 2. Fetch User Roles and Stores separately (Bulletproof)
  const userIds = profiles?.map(p => p.id) || [];
  
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("user_id, role")
    .in("user_id", userIds);

  const { data: stores } = await supabase
    .from("stores")
    .select("owner_id, name")
    .in("owner_id", userIds);

  // 3. Map them together
  const usersWithData = profiles?.map((user) => {
    const roles = userRoles?.filter(r => r.user_id === user.id).map(r => r.role) || [];
    const store = stores?.find(s => s.owner_id === user.id);
    return { ...user, roles, store };
  });

  // 4. Get Real-time Stats
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: suspendedUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('account_status', 'suspended');
  const { count: totalSellers } = await supabase.from('stores').select('*', { count: 'exact', head: true });

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Users & Sellers</h1>
          <p className="text-gray-500 mt-1">Manage accounts, roles, and platform access.</p>
        </div>
        
        <form action="/admin/users" method="GET" className="flex items-center bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm w-full md:w-72">
          <input 
            type="text" 
            name="q"
            defaultValue={resolvedParams.q || ""}
            placeholder="Search by name..." 
            className="flex-1 bg-transparent outline-none text-sm" 
          />
          <button type="submit" className="text-gray-400 hover:text-orange-500">Search</button>
        </form>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{totalUsers || 0}</p>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Users size={20} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Active Sellers</p>
            <p className="text-2xl font-bold text-gray-900">{totalSellers || 0}</p>
          </div>
          <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center"><Store size={20} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Suspended Accounts</p>
            <p className="text-2xl font-bold text-red-600">{suspendedUsers || 0}</p>
          </div>
          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center"><ShieldBan size={20} /></div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide border-b border-gray-200">
        <Link href="/admin/users" className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${!resolvedParams.filter ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          All Users ({totalUsers || 0})
        </Link>
        <Link href="/admin/users?filter=active" className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${resolvedParams.filter === 'active' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          Active
        </Link>
        <Link href="/admin/users?filter=suspended" className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${resolvedParams.filter === 'suspended' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          Suspended ({suspendedUsers || 0})
        </Link>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-bold">User</th>
                <th className="p-4 font-bold">Roles</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Joined</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!usersWithData || usersWithData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">No users found.</td>
                </tr>
              ) : (
                usersWithData.map((user) => {
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-gray-400">
                                {user.display_name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{user.display_name || "Unnamed User"}</p>
                            <p className="text-xs text-gray-500">{user.phone || 'No phone'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.length > 0 ? user.roles.map((role: string) => (
                            <span key={role} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                              role === 'seller' ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {role.replace('_', ' ')}
                            </span>
                          )) : (
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Buyer</span>
                          )}
                          {user.store && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex items-center gap-1">
                              <Store size={10} /> {user.store.name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase ${
                          user.account_status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {user.account_status === 'active' ? <ShieldCheck size={12} /> : <ShieldBan size={12} />}
                          {user.account_status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right relative">
                        <UserActions user={user} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}