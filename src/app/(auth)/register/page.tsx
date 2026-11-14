"use client";

import { useState } from "react";
import Link from "next/link";
import { registerAction } from "./actions";
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom"; // <-- IMPORT THIS

// 1. Create a dedicated Submit Button component
function SubmitButton() {
  const { pending } = useFormStatus(); // Automatically detects form submission

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-orange-600 text-white py-3.5 rounded-xl font-bold hover:bg-orange-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center h-14 mt-2"
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin mr-2" size={20} /> Creating Account...
        </>
      ) : (
        "Create Account"
      )}
    </button>
  );
}

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(null);
    const result = await registerAction(formData);
    
    if (result?.error) setError(result.error);
    if (result?.success) setSuccess(result.success);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create an account</h1>
        <p className="text-gray-500">Join OjaLoop to start buying and selling safely.</p>
      </div>

      <form action={handleSubmit} className="space-y-5">
        {/* Hidden Input for Redirect */}
        <input type="hidden" name="redirectTo" value={redirectTo} />

        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <User size={18} />
            </div>
            <input
              name="display_name"
              type="text"
              required
              placeholder="John Doe"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition text-gray-900"
            />
          </div>
        </div>

        {/* Email Input */}
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

        {/* Password Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Lock size={18} />
            </div>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              placeholder="Create a strong password"
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

        {/* Terms Checkbox */}
        <div className="flex items-start">
          <input
            type="checkbox"
            required
            className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
          />
          <label className="ml-2 block text-sm text-gray-600">
            I agree to OjaLoop&apos;s{" "}
            <Link href="/terms" className="text-orange-600 hover:underline">Terms of Service</Link> and{" "}
            <Link href="/privacy" className="text-orange-600 hover:underline">Privacy Policy</Link>.
          </label>
        </div>

        {/* Alerts */}
        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
        {success && <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100">{success}</div>}

        {/* 2. USE THE NEW SUBMIT BUTTON HERE */}
        <SubmitButton />
      </form>

      <div className="mt-8 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href={`/login?redirectTo=${redirectTo}`} className="text-orange-600 font-bold hover:underline">
          Sign in here
        </Link>
      </div>
    </div>
  );
}