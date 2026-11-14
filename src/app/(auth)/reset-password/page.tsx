"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;

    // Supabase updates the password using the active session from the email link
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      setSuccess(true);
      toast.success("Password updated successfully!");
      setTimeout(() => router.push("/login"), 2000);
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Updated</h1>
        <p className="text-gray-500">Redirecting you to login...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Set new password</h1>
        <p className="text-gray-500">Enter a strong new password for your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock size={18} />
            </div>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              placeholder="Enter new password"
              className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition text-gray-900"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 text-white py-3.5 rounded-xl font-bold hover:bg-orange-700 transition disabled:opacity-70 flex justify-center items-center h-14"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : "Update Password"}
        </button>
      </form>
    </div>
  );
}