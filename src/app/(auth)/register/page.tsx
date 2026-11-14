"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-orange-500" size={32} />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}