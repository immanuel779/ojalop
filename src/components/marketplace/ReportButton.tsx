"use client";

import { useState } from "react";
import { Flag, X, Loader2, AlertTriangle } from "lucide-react";
import { submitReportAction } from "@/app/buyer/reports/actions";
import { toast } from "sonner";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition disabled:opacity-70 flex justify-center items-center gap-2"
    >
      {pending ? <><Loader2 className="animate-spin" size={18} /> Submitting...</> : "Submit Report"}
    </button>
  );
}

export default function ReportButton({ targetId, targetType }: { targetId: string, targetType: string }) {
  const [isOpen, setIsOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    const res = await submitReportAction(formData);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Report submitted. Our Trust & Safety team will review it shortly.");
      setIsOpen(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 font-medium transition"
      >
        <Flag size={12} /> Report this {targetType}
      </button>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle size={20} />
                <h3 className="font-bold text-lg">Report {targetType}</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-white rounded-full hover:bg-gray-200 shadow-sm transition">
                <X size={20} />
              </button>
            </div>

            <form action={handleSubmit} className="p-6 space-y-4">
              <input type="hidden" name="target_id" value={targetId} />
              <input type="hidden" name="target_type" value={targetType} />

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Why are you reporting this?</label>
                <select name="reason" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-red-500 focus:bg-white transition text-gray-700">
                  <option value="">Select a reason...</option>
                  <option value="Scam or Fraud">Scam or Fraud</option>
                  <option value="Counterfeit / Fake Product">Counterfeit / Fake Product</option>
                  <option value="Prohibited Item">Prohibited Item</option>
                  <option value="Misleading Description">Misleading Description</option>
                  <option value="Wrong Category">Wrong Category</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Additional Details (Optional)</label>
                <textarea 
                  name="description" 
                  rows={3} 
                  placeholder="Please provide more context..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-red-500 focus:bg-white transition resize-none"
                ></textarea>
              </div>

              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs flex gap-2 items-start">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <p>False reports can lead to account suspension. Please ensure you are reporting a genuine issue.</p>
              </div>

              <SubmitButton />
            </form>
          </div>
        </div>
      )}
    </>
  );
}