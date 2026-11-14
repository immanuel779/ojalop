"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function AffiliateTracker() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  useEffect(() => {
    if (ref) {
      // Save the referral code in a cookie for 30 days
      document.cookie = `ojaloop_ref=${ref}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      console.log("Affiliate tracked:", ref);
    }
  }, [ref]);

  return null; // It renders nothing on screen
}