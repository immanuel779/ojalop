/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Save, Loader2, Camera, Store, MapPin, Phone, ShieldAlert, FileText, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { updateStoreAction } from "./actions";
import { toast } from "sonner";
import { useFormStatus } from "react-dom";

const NIGERIAN_STATES = ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"];

// 1. Define the strict type for the store data
type StoreData = {
  id: string;
  name: string;
  logo_url: string | null;
  cover_url: string | null;
  description: string | null;
  whatsapp: string | null;
  location_state: string | null;
  return_policy: string | null;
  shipping_policy: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button 
      type="submit" 
      disabled={pending} 
      className="w-full md:w-auto bg-gray-900 text-white px-10 py-4 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {pending ? (
        <><Loader2 className="animate-spin" size={20} /> Saving Changes...</>
      ) : (
        <><Save size={20} /> Save Store Settings</>
      )}
    </button>
  );
}

// 2. Replace `any` with `StoreData` here
export default function SettingsForm({ store }: { store: StoreData }) {
  const [logoPreview, setLogoPreview] = useState<string | null>(store.logo_url || null);
  const [coverPreview, setCoverPreview] = useState<string | null>(store.cover_url || null);

  async function handleSubmit(formData: FormData) {
    const result = await updateStoreAction(formData);
    
    if (result?.error) {
      toast.error("Failed to update store", { description: result.error });
    } else {
      toast.success("Store updated successfully!");
    }
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setLogoPreview(URL.createObjectURL(file));
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setCoverPreview(URL.createObjectURL(file));
  }

  return (
    <form action={handleSubmit} className="space-y-10">
      
      {/* Hidden inputs to retain existing image URLs if not changed */}
      <input type="hidden" name="current_logo" value={store.logo_url || ""} />
      <input type="hidden" name="current_cover" value={store.cover_url || ""} />

      {/* 1. BRAND IDENTITY (COVER & LOGO) */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
          <ImageIcon size={18} className="text-orange-500" /> Brand Identity
        </h3>
        
        {/* Cover Photo */}
        <div className="relative w-full h-40 md:h-56 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 group">
          {coverPreview ? (
            <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <ImageIcon size={32} className="mb-2 opacity-50" />
              <span className="text-sm font-medium">Upload a Cover Photo</span>
            </div>
          )}
          <label className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-gray-900 px-4 py-2 rounded-xl font-bold text-sm cursor-pointer hover:bg-white transition shadow-sm flex items-center gap-2">
            <Camera size={16} /> Change Cover
            <input type="file" name="cover" accept="image/*" onChange={handleCoverChange} className="hidden" />
          </label>
        </div>

        {/* Logo */}
        <div className="flex items-center gap-6 px-4">
          <div className="relative -mt-12 md:-mt-16 shrink-0">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white shadow-xl bg-white overflow-hidden flex items-center justify-center">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-orange-200">{store.name.charAt(0)}</span>
              )}
            </div>
            <label className="absolute bottom-2 right-2 bg-gray-900 text-white p-2 rounded-xl cursor-pointer hover:bg-orange-600 transition shadow-lg">
              <Camera size={16} />
              <input type="file" name="logo" accept="image/*" onChange={handleLogoChange} className="hidden" />
            </label>
          </div>
          <div className="pt-4">
            <h4 className="font-bold text-gray-900">Store Logo</h4>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">Square image. Recommended 500x500px. This appears on your products.</p>
          </div>
        </div>
      </div>

      {/* 2. STORE DETAILS */}
      <div className="space-y-5">
        <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
          <Store size={18} className="text-orange-500" /> Store Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Store Name</label>
            <input name="name" defaultValue={store.name} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 transition" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">WhatsApp Number</label>
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input name="whatsapp" type="tel" defaultValue={store.whatsapp || ""} placeholder="e.g. 08012345678" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 transition" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Store Description (Bio)</label>
          <textarea name="description" defaultValue={store.description || ""} required rows={4} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 transition"></textarea>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Location (State)</label>
          <div className="relative">
            <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select name="location_state" defaultValue={store.location_state || ""} required className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 transition text-gray-700">
              <option value="">Select State</option>
              {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* 3. STORE POLICIES */}
      <div className="space-y-5">
        <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
          <FileText size={18} className="text-orange-500" /> Store Policies
        </h3>
        
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Return Policy</label>
          <textarea name="return_policy" defaultValue={store.return_policy || ""} rows={2} placeholder="e.g. 7 days return policy if item is defective..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 transition"></textarea>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Shipping / Delivery Policy</label>
          <textarea name="shipping_policy" defaultValue={store.shipping_policy || ""} rows={2} placeholder="e.g. We deliver nationwide within 3-5 business days via GIG Logistics..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 transition"></textarea>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="sticky bottom-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-gray-200 shadow-xl flex justify-between items-center">
        <span className="hidden md:flex text-sm text-gray-500 font-medium items-center gap-1">
          <CheckCircle2 size={16} className="text-green-500" /> All changes are saved instantly.
        </span>
        <SubmitButton />
      </div>

      {/* 4. DANGER ZONE */}
      <div className="space-y-5 pt-8">
        <h3 className="font-bold text-red-600 border-b border-red-100 pb-2 flex items-center gap-2">
          <ShieldAlert size={18} /> Danger Zone
        </h3>
        <div className="p-5 border border-red-200 bg-red-50 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-red-900 text-sm">Deactivate Store</p>
            <p className="text-xs text-red-700 mt-1">Hiding your store will remove all your products from the marketplace. Buyers will not be able to find you.</p>
          </div>
          <button type="button" className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition whitespace-nowrap">
            Deactivate Store
          </button>
        </div>
      </div>

    </form>
  );
}