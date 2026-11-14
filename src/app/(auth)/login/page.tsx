"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react"; // Add Loader2 for the fallback
import LoginForm from "./LoginForm"; // We'll create this in a second

// This is the new default export that provides the required Suspense boundary.
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-orange-500" size={32} />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}