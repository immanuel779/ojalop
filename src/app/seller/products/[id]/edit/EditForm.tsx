/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, UploadCloud, ShieldCheck, ShieldAlert, Image as ImageIcon, Save } from "lucide-react";
import { updateProductAction } from "@/app/seller/products/new/actions";
import { toast } from "sonner";

const NIGERIAN_STATES = ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"];

export default function EditForm({ product }: { product: any }) {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(product.image_url);
  const [escrowEnabled, setEscrowEnabled] = useState<boolean>(product.escrow_enabled ?? true);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await updateProductAction(product.id, formData);
    
    if (result?.error) {
      toast.error("Update Failed", { description: result.error });
      setLoading(false);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/seller/dashboard" className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition">
              <ArrowLeft size={20} className="text-gray-700" />
            </Link>
            <h1 className="font-bold text-lg text-gray-900 hidden sm:block">Edit Listing</h1>
          </div>
          <button form="edit-form" type="submit" disabled={loading} className="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-gray-800 transition flex items-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Changes</>}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <form id="edit-form" action={handleSubmit} className="space-y-6">
          
          <input type="hidden" name="current_image" value={product.image_url || ""} />
          <input type="hidden" name="escrow_enabled" value={String(escrowEnabled)} />

          {/* SECTION 1: PHOTOS */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">1</div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Product Photo</h3>
                <p className="text-sm text-gray-500">Upload a new photo to replace the current one.</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative w-full md:w-1/2 aspect-video md:aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 group">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon size={32} className="mb-2 opacity-50" />
                    <span className="text-sm font-medium">No Image</span>
                  </div>
                )}
                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <div className="bg-white text-gray-900 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                    <UploadCloud size={18} /> Change Photo
                  </div>
                  <input type="file" name="image" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h4 className="font-bold text-gray-900 mb-2">High-Quality Images Sell Faster</h4>
                <p className="text-sm text-gray-500 mb-4">Click the image on the left to upload a new photo. JPG, PNG, or WEBP up to 5MB.</p>
              </div>
            </div>
          </div>

          {/* SECTION 2: ITEM DETAILS */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">2</div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Item Details</h3>
                <p className="text-sm text-gray-500">Update your listing title and condition.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Listing Title</label>
                <input name="title" defaultValue={product.title} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition text-lg font-bold" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Price (₦)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-900 text-lg">₦</span>
                    <input name="price" type="number" defaultValue={product.price} required className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3.5 text-lg font-bold outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Condition</label>
                  <select name="condition" defaultValue={product.condition} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 transition text-gray-700">
                    <option value="Brand New">Brand New</option>
                    <option value="Like New">Like New (Open Box)</option>
                    <option value="Foreign Used">Foreign Used (Tokunbo)</option>
                    <option value="Nigerian Used">Nigerian Used</option>
                    <option value="Refurbished">Refurbished</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: LOCATION */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">3</div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Location</h3>
                <p className="text-sm text-gray-500">Where can buyers find this item?</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">State</label>
                <select name="location_state" defaultValue={product.location_state} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 transition text-gray-700">
                  <option value="">Select a State</option>
                  {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">City / LGA / Area</label>
                <input name="location_city" defaultValue={product.location_city} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 transition" />
              </div>
            </div>
          </div>

          {/* SECTION 4: DESCRIPTION & ESCROW */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">4</div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Description & Settings</h3>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Full Description</label>
              <textarea name="description" defaultValue={product.description} required rows={6} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition"></textarea>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2.5 rounded-xl text-orange-600 shadow-sm shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">Enable OjaLoop Escrow</h4>
                  <p className="text-sm text-gray-600 mt-0.5">Buyers can pay safely through Escrow protection.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEscrowEnabled(!escrowEnabled)}
                className={`w-14 h-8 rounded-full relative cursor-pointer shadow-inner shrink-0 self-end sm:self-auto transition-colors duration-300 ${escrowEnabled ? 'bg-orange-600' : 'bg-gray-300'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full absolute top-1 shadow-sm transition-transform duration-300 ${escrowEnabled ? 'right-1' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="bg-[#FFF9E6] border border-yellow-200 rounded-2xl p-4 flex gap-3">
              <ShieldAlert size={20} className="text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800 leading-relaxed">
                <strong>Safety Warning:</strong> Never share your bank PIN, OTP, or card details with a buyer.
              </p>
            </div>
          </div>

          {/* MOBILE STICKY SAVE BUTTON */}
          <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t md:hidden z-40">
             <button type="submit" disabled={loading} className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-700 transition flex justify-center items-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={24} /> : <><CheckCircle2 size={20} /> Save Changes</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}