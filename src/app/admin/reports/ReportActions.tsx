"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Trash2, Loader2 } from "lucide-react";
import { resolveReport, deleteReportedContent } from "../actions";
import { toast } from "sonner";

// 1. Define the strict type for the report
interface ReportData {
  id: string;
  target_type: string;
  target_id: string;
}

// 2. Replace `any` with `ReportData`
export default function ReportActions({ report }: { report: ReportData }) {
  const [loading, setLoading] = useState(false);

  async function handleResolve(action: 'dismissed' | 'resolved') {
    setLoading(true);
    const res = await resolveReport(report.id, action);
    setLoading(false);
    if (res?.error) toast.error(res.error);
    else toast.success(`Report ${action}.`);
  }

  async function handleDeleteContent() {
    if (!confirm(`Are you sure you want to remove this ${report.target_type}? This action is permanent.`)) return;
    
    setLoading(true);
    const res = await deleteReportedContent(report.target_type, report.target_id);
    if (res?.error) {
      toast.error(res.error);
    } else {
      await resolveReport(report.id, 'resolved');
      toast.success(`Reported ${report.target_type} has been removed.`);
    }
    setLoading(false);
  }

  if (loading) return <Loader2 className="animate-spin text-orange-500 mx-auto" size={20} />;

  return (
    <div className="flex items-center justify-end gap-2">
      <button 
        onClick={() => handleDeleteContent()} 
        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-bold rounded-lg hover:bg-red-100 transition"
        title="Delete Content & Suspend User"
      >
        <Trash2 size={14} /> Remove Content
      </button>
      
      <button 
        onClick={() => handleResolve('dismissed')} 
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition"
        title="Dismiss Report (No Action)"
      >
        <XCircle size={14} /> Dismiss
      </button>
      
      <button 
        onClick={() => handleResolve('resolved')} 
        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg hover:bg-green-100 transition"
        title="Mark as Resolved"
      >
        <CheckCircle2 size={14} /> Resolve
      </button>
    </div>
  );
}