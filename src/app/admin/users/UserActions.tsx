"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldBan, ShieldCheck, Loader2, Eye, Trash2 } from "lucide-react";
import { suspendUser, deleteUserAccount } from "../actions";
import { toast } from "sonner";

// 1. Define the strict type for the user
interface UserActionData {
  id: string;
  account_status: string;
}

// 2. Replace `any` with `UserActionData`
export default function UserActions({ user }: { user: UserActionData }) {
  const [loading, setLoading] = useState(false);

  async function handleToggleSuspend() {
    setLoading(true);
    const res = await suspendUser(user.id, user.account_status);
    setLoading(false);
    if (res?.error) toast.error(res.error);
    else toast.success(user.account_status === 'active' ? "User suspended." : "User reactivated.");
  }

  async function handleDelete() {
    if (!confirm("CRITICAL WARNING: This will permanently delete the user. They will never be able to log in again. Are you sure?")) return;
    setLoading(true);
    const res = await deleteUserAccount(user.id);
    setLoading(false);
    if (res?.error) toast.error(res.error);
    else toast.success("User permanently deleted.");
  }

  if (loading) return <Loader2 className="animate-spin text-orange-500 mx-auto" size={20} />;

  return (
    <div className="flex items-center justify-end gap-1.5">
      {/* Link to the investigation page */}
      <Link 
        href={`/admin/users/${user.id}`} 
        className="p-2 text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition" 
        title="Investigate / Track User"
      >
        <Eye size={18} />
      </Link>
      
      <button onClick={handleToggleSuspend} className={`p-2 rounded-lg transition ${user.account_status === 'active' ? 'text-orange-600 bg-orange-50 hover:bg-orange-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`} title={user.account_status === 'active' ? "Suspend User" : "Reactivate User"}>
        {user.account_status === 'active' ? <ShieldBan size={18} /> : <ShieldCheck size={18} />}
      </button>
      
      <button onClick={handleDelete} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition" title="Delete Account Permanently">
        <Trash2 size={18} />
      </button>
    </div>
  );
}