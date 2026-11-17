/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { ArrowLeft, UploadCloud, ShieldAlert, ShieldCheck, Loader2, CheckCircle2, X, Image as ImageIcon } from "lucide-react";
import { createProductAction } from "./actions";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", 
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", 
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", 
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", 
  "Taraba", "Yobe", "Zamfara"
];

function SubmitButton({ intent, defaultText, pendingText, icon, variant }: { intent: "draft" | "publish", defaultText: string, pendingText: string, icon: React.ReactNode, variant: "draft" | "publish" }) {
  const { pending, data } = useFormStatus();
  const isThisButtonPending = pending && data?.get("intent") === intent;

  const base = "flex-1 py-4 rounded-2xl font-bold text-lg transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed";
  const styles = variant === "publish" 
    ? "bg-orange-600 text-white hover:bg-orange-700 shadow-xl shadow-orange-600/20" 
    : "bg-gray-100 text-gray-700 hover:bg-gray-200";

  return (
    <button type="submit" name="intent" value={intent} disabled={pending} className={`${base} ${styles}`}>
      {isThisButtonPending ? <><Loader2 className="animate-spin" size={24} /> {pendingText}</> : <>{icon} {defaultText}</>}
    </button>
  );
}

export default function PostAdForm({ categories }: { categories: {id: string, name: string, type: string}[] }) {
  const [error, setError] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<{ file: File, url: string }[]>([]);
  const [escrowEnabled, setEscrowEnabled] = useState(true);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await createProductAction(formData);
    if (result?.error) setError(result.error);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files) {
      const newPreviews = Array.from(files).map(file => {
        if (file.size > 5 * 1024 * 1024) {
          setError("One or more images exceed 5MB.");
          return null;
        }
        return { file, url: URL.createObjectURL(file) };
      }).filter(Boolean) as { file: File, url: string }[];

      setImagePreviews(prev => [...prev, ...newPreviews]);
      e.target.value = ""; // Reset input so the same file can be selected again if removed
    }
  }

  function removeImage(index: number) {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  }

  // Filter out categories that are ONLY for services (Jobs, etc.)
  const productCategories = categories.filter(cat => cat.type === "product" || cat.type === "both");

  return (
    <div className="bg-gray-50 min-h-screen pb-24 md:pb-12">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/seller/dashboard" className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full hover:bg-gray-100 transition">
              <ArrowLeft size={20} className="text-gray-700" />
            </Link>
            <h1 className="font-bold text-lg text-gray-900 hidden sm:block">Post a New Listing</h1>
          </div>
          <div className="text-sm font-medium text-gray-500">Seller Studio</div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        <form action={handleSubmit} className="space-y-6 md:space-y-8">
          
          {/* SECTION 1: PHOTOS */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">1</div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Photos (Up to 5)</h3>
                <p className="text-sm text-gray-500">Clear, well-lit photos sell faster. The first one is your cover.</p>
              </div>
            </div>
            
            <input type="file" name="images" id="image-upload" accept="image/*" multiple onChange={handleImageChange} className="hidden" />

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {imagePreviews.map((img, index) => (
                <div key={index} className="relative border-2 border-gray-200 rounded-2xl overflow-hidden aspect-square group">
                  <img src={img.url} alt="Preview" className="w-full h-full object-cover" />
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md">
                      COVER PHOTO
                    </div>
                  )}
                  <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full shadow-lg hover:bg-red-700 transition opacity-0 group-hover:opacity-100">
                    <X size={16} />
                  </button>
                </div>
              ))}

              {imagePreviews.length < 5 && (
                <label htmlFor="image-upload" className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-2xl aspect-square flex flex-col items-center justify-center text-center hover:bg-orange-50 hover:border-orange-400 transition cursor-pointer group">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-2 group-hover:scale-110 transition-all">
                    <UploadCloud className="text-orange-500" size={24} />
                  </div>
                  <span className="text-sm font-bold text-gray-900">Add Photo</span>
                  <span className="text-xs text-gray-500 mt-1">{5 - imagePreviews.length} slots left</span>
                </label>
              )}
            </div>
          </div>

          {/* SECTION 2: ITEM DETAILS */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">2</div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Item Details</h3>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Listing Title <span className="text-red-500">*</span></label>
                <input name="title" required placeholder="e.g. Toyota Camry 2020 XLE or iPhone 14 Pro Max" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base outline-none focus:bg-white focus:border-orange-500 transition" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Category <span className="text-red-500">*</span></label>
                  <select name="category_id" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base outline-none focus:bg-white focus:border-orange-500 transition text-gray-700">
                    <option value="">Select a Category</option>
                    {productCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Condition <span className="text-red-500">*</span></label>
                  <select name="condition" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base outline-none focus:bg-white focus:border-orange-500 transition text-gray-700">
                    <option value="">Select Condition</option>
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

          {/* SECTION 3: PRICE & LOCATION */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">3</div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Price & Location</h3>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Price <span className="text-red-500">*</span></label>
                <div className="relative max-w-md">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-900 text-lg">₦</span>
                  <input name="price" type="number" required min="100" placeholder="e.g. 750000" className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3.5 text-lg font-bold outline-none focus:bg-white focus:border-orange-500 transition" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">State <span className="text-red-500">*</span></label>
                  <select name="location_state" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base outline-none focus:bg-white focus:border-orange-500 transition text-gray-700">
                    <option value="">Select a State</option>
                    {NIGERIAN_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">LGA / City / Area <span className="text-red-500">*</span></label>
                  <input name="location_city" required placeholder="e.g. Ikeja, Computer Village" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base outline-none focus:bg-white focus:border-orange-500 transition" />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: DESCRIPTION */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">4</div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Description</h3>
              </div>
            </div>
            <div>
              <textarea name="description" required rows={8} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base outline-none focus:bg-white focus:border-orange-500 transition resize-y" placeholder="Describe your item in detail..."></textarea>
            </div>
          </div>

          {/* SECTION 5: SELLING OPTIONS */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">5</div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Selling Options</h3>
              </div>
            </div>

            <input type="hidden" name="escrow_enabled" value={String(escrowEnabled)} />

            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2.5 rounded-xl text-orange-600 shadow-sm shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">Enable OjaLoop Escrow</h4>
                  <p className="text-sm text-gray-600 mt-0.5">Buyers can pay safely through Escrow protection.</p>
                </div>
              </div>
              <button type="button" onClick={() => setEscrowEnabled(!escrowEnabled)} className={`w-14 h-8 rounded-full relative cursor-pointer shadow-inner shrink-0 self-end sm:self-auto transition-colors duration-300 ${escrowEnabled ? 'bg-orange-600' : 'bg-gray-300'}`}>
                <div className={`w-6 h-6 bg-white rounded-full absolute top-1 shadow-sm transition-transform duration-300 ${escrowEnabled ? 'translate-x-7' : 'translate-x-1'}`}></div>
              </button>
            </div>

            <div className="bg-[#FFF9E6] border border-yellow-200 rounded-2xl p-5 flex gap-4 mb-8">
              <ShieldAlert size={24} className="text-yellow-600 shrink-0" />
              <p className="text-sm text-yellow-800 leading-relaxed">
                <strong>Safety Warning:</strong> Never share your bank PIN, OTP, or card details with a buyer.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100 font-bold flex items-center gap-2">
                <X size={18} /> {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <SubmitButton intent="draft" defaultText="Save as Draft" pendingText="Saving Draft..." icon={null} variant="draft" />
              <SubmitButton intent="publish" defaultText="Publish Listing" pendingText="Publishing..." icon={<CheckCircle2 size={20} />} variant="publish" />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}