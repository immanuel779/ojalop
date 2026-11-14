"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { UploadCloud, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { submitVerificationAction } from "./actions";
import { toast } from "sonner";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-70 flex items-center justify-center gap-2"
    >
      {pending ? <><Loader2 className="animate-spin" size={20} /> Submitting...</> : "Submit for Verification"}
    </button>
  );
}

export default function VerificationForm() {
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const res = await submitVerificationAction(formData);
    if (res?.error) toast.error(res.error);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="text-orange-500" /> Business Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Registered Business Name</label>
            <input name="business_name" required placeholder="e.g. Tech Hub Ltd" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 focus:bg-white transition" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">CAC Registration Number</label>
            <input name="cac_number" placeholder="e.g. RC-1234567" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 focus:bg-white transition" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Identification Type</label>
          <select name="id_type" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 focus:bg-white transition text-gray-700">
            <option value="">Select ID Type...</option>
            <option value="NIN">National Identification Number (NIN)</option>
            <option value="Drivers License">Drivers License</option>
            <option value="International Passport">International Passport</option>
            <option value="CAC Certificate">CAC Certificate (For Businesses)</option>
          </select>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
        <p className="text-sm text-gray-500">Please upload a clear photo or PDF of your selected ID.</p>
        
        <label className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-orange-50 hover:border-orange-400 transition cursor-pointer group">
          <input type="file" name="document" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" required />
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
            <UploadCloud className="text-orange-500" size={28} />
          </div>
          <span className="text-base font-bold text-gray-900 mb-1">
            {fileName ? fileName : "Click to upload document"}
          </span>
          <span className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (Max 10MB)</span>
        </label>
      </div>

      <SubmitButton />
    </form>
  );
}