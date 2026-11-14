"use client";

import { useState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center h-14"
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin mr-2" size={20} /> Signing In...
        </>
      ) : (
        "Sign In"
      )}
    </button>
  );
}

export default function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await loginAction(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
        <p className="text-gray-500">Sign in to your OjaLoop account.</p>
      </div>

      <form action={handleSubmit} className="space-y-5">
        <input type="hidden" name="redirectTo" value={redirectTo} />

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

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <Link href="/forgot-password" className="text-sm text-orange-600 hover:underline font-medium">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock size={18} />
            </div>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Enter your password"
              className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition text-gray-900"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}

        <SubmitButton />
      </form>

      <div className="mt-8 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link href={`/register?redirectTo=${redirectTo}`} className="text-orange-600 font-bold hover:underline">
          Create one now
        </Link>
      </div>
    </div>
  );
}