/* eslint-disable @next/next/no-img-element */
import { createClient } from "@/lib/supabase/server";
import ReportActions from "./ReportActions";
import Link from "next/link";
import { ShieldAlert, CheckCircle2, XCircle, Clock, Search, User, Package, Store } from "lucide-react";

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const resolvedParams = await searchParams;
  const supabase = await createClient();

  // 1. Fetch Reports
  let query = supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (resolvedParams.status && resolvedParams.status !== "all") {
    query = query.eq("status", resolvedParams.status);
  }

  const { data: reportsData } = await query;

  // 2. Fetch Reporter Profiles
  const reporterIds = [...new Set(reportsData?.map(r => r.reporter_id) || [])];
  const { data: profiles } = await supabase.from("profiles").select("id, display_name, email").in("id", reporterIds);
  const profileMap = new Map(profiles?.map(p => [p.id, p]));

  // 3. Fetch Target Details (Products)
  const productIds = reportsData?.filter(r => r.target_type === 'product').map(r => r.target_id) || [];
  const { data: products } = await supabase.from("products").select("id, title, image_url").in("id", productIds);
  const productMap = new Map(products?.map(p => [p.id, p]));

  // 4. Combine Data
  const reports = reportsData?.map(report => ({
    ...report,
    reporter: profileMap.get(report.reporter_id),
    product: report.target_type === 'product' ? productMap.get(report.target_id) : null
  })) || [];

  // 5. Stats
  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;
  const dismissedCount = reports.filter(r => r.status === 'dismissed').length;

  return (
    <div className="space-y-6 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="text-red-500" size={32} /> Trust & Safety
          </h1>
          <p className="text-gray-500 mt-1">Investigate reports, remove fraudulent listings, and ban bad actors.</p>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-orange-200 shadow-sm flex items-center justify-between bg-orange-50">
          <div>
            <p className="text-xs font-bold text-orange-700 uppercase">Pending Reports</p>
            <p className="text-2xl font-bold text-orange-700">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center"><Clock size={20} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Resolved</p>
            <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
          </div>
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><CheckCircle2 size={20} /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Dismissed</p>
            <p className="text-2xl font-bold text-gray-700">{dismissedCount}</p>
          </div>
          <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center"><XCircle size={20} /></div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide border-b border-gray-200">
        <Link href="/admin/reports" className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${!resolvedParams.status ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          All Reports
        </Link>
        <Link href="/admin/reports?status=pending" className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${resolvedParams.status === 'pending' ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          Pending ({pendingCount})
        </Link>
        <Link href="/admin/reports?status=resolved" className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${resolvedParams.status === 'resolved' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          Resolved
        </Link>
        <Link href="/admin/reports?status=dismissed" className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition ${resolvedParams.status === 'dismissed' ? 'bg-gray-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
          Dismissed
        </Link>
      </div>

      {/* REPORTS LIST */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center text-gray-500">
            <ShieldAlert className="mx-auto mb-4 text-gray-300" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No reports found</h3>
            <p>The platform is safe and clean.</p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col md:flex-row gap-6">
              
              {/* TARGET INFO */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${
                    report.target_type === 'product' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    report.target_type === 'store' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    'bg-gray-50 text-gray-700 border-gray-200'
                  }`}>
                    {report.target_type === 'product' ? <Package size={12} /> : <Store size={12} />}
                    Reported {report.target_type}
                  </span>
                  <span className="text-xs text-gray-400">Report ID: {report.id.split('-')[0].toUpperCase()}</span>
                </div>

                <div className="flex items-center gap-4 mt-3">
                  {report.product?.image_url && (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden border shrink-0">
                      <img src={report.product.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {report.product ? report.product.title : `Target ID: ${report.target_id.split('-')[0].toUpperCase()}`}
                    </h3>
                    <p className="text-sm text-red-600 font-medium mt-1">Reason: {report.reason}</p>
                    {report.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">&quot;{report.description}&quot;</p>
                    )}
                  </div>
                </div>
              </div>

              {/* REPORTER INFO */}
              <div className="md:w-64 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center gap-1"><User size={12} /> Reported By</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 text-xs">
                    {report.reporter?.display_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{report.reporter?.display_name || 'Unknown User'}</p>
                    <p className="text-xs text-gray-500">{report.reporter?.email}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">Submitted: {new Date(report.created_at).toLocaleDateString()}</p>
              </div>

              {/* ACTIONS */}
              <div className="md:w-64 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center items-end gap-3">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border ${
                  report.status === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                  report.status === 'resolved' ? 'bg-green-50 text-green-700 border-green-200' : 
                  'bg-gray-50 text-gray-700 border-gray-200'
                }`}>
                  {report.status}
                </span>
                
                {report.status === 'pending' && (
                  <ReportActions report={report} />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}