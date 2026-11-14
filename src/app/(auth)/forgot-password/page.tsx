"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { forgotPasswordAction } from "./actions";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const res = await forgotPasswordAction(formData);
    setLoading(false);

    if (res?.error) toast.error(res.error);
    if (res?.success) setSuccess(true);
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail size={40} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
        <p className="text-gray-500 mb-8">We sent a password reset link to your email address.</p>
        <Link href="/login" className="inline-flex items-center gap-2 text-orange-600 font-bold hover:underline">
          <ArrowLeft size={16} /> Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-orange-600 mb-6 transition">
        <ArrowLeft size={16} /> Back to Login
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot password?</h1>
        <p className="text-gray-500">Enter your email and we will send you a reset link.</p>
      </div>

      <form action={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Mail size={18} />
            </div>
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition text-gray-900"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-70 flex justify-center items-center h-14"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}