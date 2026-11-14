"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Save, Loader2, ShieldAlert, DollarSign, Settings, ToggleLeft, ToggleRight } from "lucide-react";
import { updateSettingsAction } from "./actions";
import { toast } from "sonner";

// Define strict type for settings
type SettingsData = {
  site_name: string;
  support_email: string;
  support_phone: string;
  escrow_fee_percent: number;
  affiliate_commission_percent: number;
  min_withdrawal: number;
  maintenance_mode: boolean;
  allow_registrations: boolean;
  auto_approve_listings: boolean;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full md:w-auto bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-70 flex items-center justify-center gap-2"
    >
      {pending ? <><Loader2 className="animate-spin" size={20} /> Saving...</> : <><Save size={20} /> Save All Settings</>}
    </button>
  );
}

export default function SettingsForm({ settings }: { settings: SettingsData }) {
  const [maintenance, setMaintenance] = useState(settings.maintenance_mode);
  const [registrations, setRegistrations] = useState(settings.allow_registrations);
  const [autoApprove, setAutoApprove] = useState(settings.auto_approve_listings);

  async function handleSubmit(formData: FormData) {
    const res = await updateSettingsAction(formData);
    if (res?.error) toast.error(res.error);
    else toast.success("Platform settings updated successfully!");
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      
      <input type="hidden" name="maintenance_mode" value={String(maintenance)} />
      <input type="hidden" name="allow_registrations" value={String(registrations)} />
      <input type="hidden" name="auto_approve_listings" value={String(autoApprove)} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: General Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Settings className="text-blue-500" /> General Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Platform Name</label>
                <input name="site_name" defaultValue={settings.site_name} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 focus:bg-white transition" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Support Email</label>
                <input name="support_email" type="email" defaultValue={settings.support_email} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 focus:bg-white transition" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Support Phone Number</label>
                <input name="support_phone" defaultValue={settings.support_phone} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 focus:bg-white transition" />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 p-6 md:p-8 rounded-3xl border border-red-200 shadow-sm">
            <h2 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2">
              <ShieldAlert className="text-red-500" /> System Status
            </h2>
            <p className="text-sm text-red-700 mb-6">These settings control the core availability of the platform.</p>
            
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-red-100">
              <div>
                <p className="font-bold text-gray-900 text-sm">Maintenance Mode</p>
                <p className="text-xs text-gray-500">Takes the platform offline for everyone except admins.</p>
              </div>
              <button type="button" onClick={() => setMaintenance(!maintenance)}>
                {maintenance ? <ToggleRight size={40} className="text-red-500" /> : <ToggleLeft size={40} className="text-gray-300" />}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Financials & Features */}
        <div className="space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <DollarSign className="text-green-500" /> Fees & Commissions
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Escrow Fee (%)</label>
                <div className="relative">
                  <input name="escrow_fee_percent" type="number" step="0.1" defaultValue={settings.escrow_fee_percent} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-3 outline-none focus:border-orange-500 focus:bg-white transition" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Percentage taken from every successful sale.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Affiliate Commission (%)</label>
                <div className="relative">
                  <input name="affiliate_commission_percent" type="number" step="0.1" defaultValue={settings.affiliate_commission_percent} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-3 outline-none focus:border-orange-500 focus:bg-white transition" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Percentage paid to affiliates from the Escrow fee.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Minimum Withdrawal (₦)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">₦</span>
                  <input name="min_withdrawal" type="number" defaultValue={settings.min_withdrawal} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-orange-500 focus:bg-white transition" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Feature Toggles</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="font-bold text-gray-900 text-sm">Allow Registrations</p>
                  <p className="text-xs text-gray-500">Turn off to stop new users from signing up.</p>
                </div>
                <button type="button" onClick={() => setRegistrations(!registrations)}>
                  {registrations ? <ToggleRight size={40} className="text-green-500" /> : <ToggleLeft size={40} className="text-gray-300" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <p className="font-bold text-gray-900 text-sm">Auto-Approve Listings</p>
                  <p className="text-xs text-gray-500">Bypass moderation and make new ads live instantly.</p>
                </div>
                <button type="button" onClick={() => setAutoApprove(!autoApprove)}>
                  {autoApprove ? <ToggleRight size={40} className="text-green-500" /> : <ToggleLeft size={40} className="text-gray-300" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SAVE BAR */}
      <div className="sticky bottom-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-gray-200 shadow-xl flex justify-between items-center z-50">
        <span className="hidden md:block text-sm text-gray-500 font-medium">
          Changes will immediately affect the entire platform.
        </span>
        <SubmitButton />
      </div>

    </form>
  );
}