"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, UploadCloud, X, ShieldCheck, ShieldAlert,
  Package, Send, Save, AlertCircle, Eye, Image as ImageIcon,
  Star, Trash2, Tag, Truck, Store, Zap, Video, ChevronLeft,
  ChevronRight, CheckCircle2,
} from "lucide-react";
import { createProductAction } from "./actions";
import { toast } from "sonner";

// ============================================================
// CONSTANTS
// ============================================================
const NIGERIAN_STATES = ["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT - Abuja","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"];
const CONDITIONS = ["Brand New","Like New","Foreign Used","Nigerian Used","Refurbished"];
const MAX_IMAGES = 5;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_TAGS = 10;
const ALLOWED_TYPES = ["image/jpeg","image/jpg","image/png","image/webp"];

interface Category { id: string; name: string; type: string | null; }
interface Props {
  categories: Category[];
  hasStore?: boolean;
  isAuthenticated?: boolean;
}

export default function PostAdForm({ categories, hasStore = true, isAuthenticated = true }: Props) {
  const [loading, setLoading] = useState<"draft" | "publish" | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [escrowEnabled, setEscrowEnabled] = useState(true);
  const [negotiable, setNegotiable] = useState(false);
  const [deliveryPickup, setDeliveryPickup] = useState(true);
  const [deliveryShipping, setDeliveryShipping] = useState(false);
  const [boost, setBoost] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [titleLen, setTitleLen] = useState(0);
  const [descLen, setDescLen] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const categoriesByType = useMemo(() => {
    const groups: Record<string, Category[]> = {};
    for (const cat of categories) {
      const key = cat.type || "Other";
      (groups[key] ??= []).push(cat);
    }
    return groups;
  }, [categories]);

  // ---------- PROGRESS (useCallback so useEffect dep is stable) ----------
  const updateProgress = useCallback(() => {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    let p = 0;
    if (images.length > 0) p += 20;
    if (String(fd.get("title") ?? "").length >= 5) p += 10;
    if (String(fd.get("category_id") ?? "")) p += 10;
    if (String(fd.get("condition") ?? "")) p += 10;
    if (Number(fd.get("price")) >= 100) p += 10;
    if (String(fd.get("location_state") ?? "")) p += 10;
    if (String(fd.get("location_city") ?? "").length >= 2) p += 10;
    if (String(fd.get("description") ?? "").length >= 20) p += 10;
    if (deliveryPickup || deliveryShipping) p += 10;
    setProgress(p);
    setTitleLen(String(fd.get("title") ?? "").length);
    setDescLen(String(fd.get("description") ?? "").length);
  }, [images.length, deliveryPickup, deliveryShipping]);

  useEffect(() => {
    updateProgress();
  }, [updateProgress]);

  // ---------- IMAGES ----------
  function addImages(files: FileList | File[]) {
    const incoming = Array.from(files);
    const accepted: File[] = [];
    const newPreviews: string[] = [];
    for (const file of incoming) {
      if (images.length + accepted.length >= MAX_IMAGES) {
        toast.error("Too many images", { description: `Max ${MAX_IMAGES}.` });
        break;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error("Invalid file", { description: `${file.name} is not JPG/PNG/WEBP.` });
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error("File too large", { description: `${file.name} exceeds 5MB.` });
        continue;
      }
      accepted.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }
    if (accepted.length) {
      setImages(prev => [...prev, ...accepted]);
      setPreviews(prev => [...prev, ...newPreviews]);
      requestAnimationFrame(updateProgress);
    }
  }

  function removeImage(index: number) {
    URL.revokeObjectURL(previews[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    requestAnimationFrame(updateProgress);
  }

  function makeCover(index: number) {
    if (index === 0) return;
    setImages(prev => {
      const copy = [...prev];
      const [picked] = copy.splice(index, 1);
      return [picked, ...copy];
    });
    setPreviews(prev => {
      const copy = [...prev];
      const [picked] = copy.splice(index, 1);
      return [picked, ...copy];
    });
  }

  function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    setImages(prev => {
      const copy = [...prev];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
    setPreviews(prev => {
      const copy = [...prev];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) addImages(e.target.files);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (e.dataTransfer.files?.length) addImages(e.dataTransfer.files);
  }

  // ---------- TAGS ----------
  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (!t) return;
    if (tags.includes(t)) { setTagInput(""); return; }
    if (tags.length >= MAX_TAGS) { toast.error(`Max ${MAX_TAGS} tags.`); return; }
    setTags([...tags, t]);
    setTagInput("");
  }
  function removeTag(t: string) { setTags(tags.filter(x => x !== t)); }

  // ---------- PREVIEW ----------
  function openPreview() {
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    setPreviewData({
      title: String(fd.get("title") ?? ""),
      price: String(fd.get("price") ?? ""),
      condition: String(fd.get("condition") ?? ""),
      state: String(fd.get("location_state") ?? ""),
      city: String(fd.get("location_city") ?? ""),
      description: String(fd.get("description") ?? ""),
    });
    setShowPreview(true);
  }

  // ---------- SUBMIT ----------
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;

    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const intent: "draft" | "publish" = submitter?.value === "draft" ? "draft" : "publish";

    const formData = new FormData(formRef.current);
    formData.set("intent", intent);

    if (images.length === 0) {
      toast.error("Image required", { description: "Please upload at least one image before publishing." });
      return;
    }

    formData.delete("images");
    for (const file of images) formData.append("images", file, file.name);

    formData.set("tags", tags.join(","));
    formData.set("negotiable", String(negotiable));
    formData.set("delivery_pickup", String(deliveryPickup));
    formData.set("delivery_shipping", String(deliveryShipping));
    formData.set("boost", String(boost));
    formData.set("video_url", videoUrl);
    formData.set("escrow_enabled", String(escrowEnabled));

    setLoading(intent);
    try {
      const result = await createProductAction(formData);
      if (!result.success) {
        toast.error("Could not save", { description: result.error });
        setLoading(null);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("NEXT_REDIRECT") || msg.includes("NEXT_NOT_FOUND")) return;
      toast.error("Something went wrong", { description: "Please try again." });
      setLoading(null);
    }
  }

  // ---------- KEYBOARD SHORTCUTS ----------
  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "s") {
        ev.preventDefault();
        document.getElementById("btn-draft")?.click();
      }
      if ((ev.ctrlKey || ev.metaKey) && ev.key === "Enter") {
        ev.preventDefault();
        document.getElementById("btn-publish")?.click();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ---------- GATES ----------
  if (!isAuthenticated) {
    return <Gate icon={<AlertCircle size={48} />} title="Please sign in" body="You need an account to post an ad." cta={{ label: "Sign In", href: "/login" }} />;
  }
  if (!hasStore) {
    return <Gate icon={<Package size={48} />} title="Set up your store first" body="Create a store before posting products." cta={{ label: "Create Store", href: "/seller/onboarding" }} />;
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-32">
      <style>{`
        @keyframes wave { 0%,60%,100% { transform: translateY(0); opacity:.6 } 30% { transform: translateY(-4px); opacity:1 } }
        @keyframes shimmer { 0% { transform: translateX(-100%) } 100% { transform: translateX(100%) } }
        @keyframes rollbar { 0% { transform: translateX(-100%) } 100% { transform: translateX(300%) } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
      `}</style>

      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/seller/dashboard" className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition">
              <ArrowLeft size={20} className="text-gray-700" />
            </Link>
            <h1 className="font-bold text-lg text-gray-900">Post New Ad</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden sm:block">{images.length}/{MAX_IMAGES} photos</span>
            <button
              type="button"
              onClick={openPreview}
              className="flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-700 px-3 py-2 rounded-lg hover:bg-orange-50 transition"
            >
              <Eye size={16} /> Preview
            </button>
          </div>
        </div>
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        onInput={updateProgress}
        onChange={updateProgress}
        className="max-w-4xl mx-auto px-4 mt-8 space-y-6"
      >
        <section className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
          <SectionHeader n={1} title="Product Photos" subtitle={`Up to ${MAX_IMAGES}. First image is your cover.`} />

          <div
            onDragOver={e => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-orange-500 hover:bg-orange-50/30 transition cursor-pointer"
          >
            <UploadCloud className="mx-auto text-orange-500 mb-3" size={40} />
            <p className="font-bold text-gray-900">Click or drag images here</p>
            <p className="text-sm text-gray-500 mt-1">JPG, PNG, WEBP · Max 5MB each · Up to {MAX_IMAGES}</p>
            <input
              ref={fileInputRef}
              type="file"
              name="images"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={onFileChange}
              className="sr-only"
            />
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border bg-gray-100 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                  {i === 0 && (
                    <div className="absolute top-2 left-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <Star size={10} fill="currentColor" /> COVER
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5">
                    {i > 0 && (
                      <button type="button" onClick={() => makeCover(i)} title="Make cover"
                        className="bg-white text-orange-600 p-1.5 rounded-full hover:bg-orange-50">
                        <Star size={12} />
                      </button>
                    )}
                    {i > 0 && (
                      <button type="button" onClick={() => moveImage(i, -1)} title="Move left"
                        className="bg-white text-gray-700 p-1.5 rounded-full hover:bg-gray-50">
                        <ChevronLeft size={12} />
                      </button>
                    )}
                    {i < images.length - 1 && (
                      <button type="button" onClick={() => moveImage(i, 1)} title="Move right"
                        className="bg-white text-gray-700 p-1.5 rounded-full hover:bg-gray-50">
                        <ChevronRight size={12} />
                      </button>
                    )}
                    <button type="button" onClick={() => removeImage(i)} title="Remove"
                      className="bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
          <SectionHeader n={2} title="Item Details" subtitle="Tell buyers what you're selling." />
          <div className="space-y-5">
            <div>
              <label className="flex items-center justify-between text-sm font-bold text-gray-900 mb-2">
                <span>Listing Title *</span>
                <span className={`text-xs font-normal ${titleLen < 5 ? "text-red-500" : "text-gray-400"}`}>{titleLen}/80</span>
              </label>
              <input
                name="title"
                required
                minLength={5}
                maxLength={80}
                placeholder="e.g. iPhone 13 Pro Max 256GB - Sierra Blue"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Category *</label>
                <select name="category_id" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 transition">
                  <option value="">Select a category</option>
                  {Object.entries(categoriesByType).map(([type, cats]) => (
                    <optgroup key={type} label={type}>
                      {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Condition *</label>
                <select name="condition" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 transition">
                  <option value="">Select condition</option>
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Price (₦) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-900 text-lg">₦</span>
                  <input
                    name="price"
                    type="number"
                    min={100}
                    required
                    placeholder="0"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3.5 text-lg font-bold outline-none focus:bg-white focus:border-orange-500 transition"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setNegotiable(v => !v)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border font-bold text-sm transition ${negotiable ? "bg-green-50 border-green-300 text-green-700" : "bg-gray-50 border-gray-200 text-gray-600"}`}
                >
                  <span className="flex items-center gap-2"><Tag size={16} /> Price negotiable</span>
                  <span className={`w-10 h-5 rounded-full relative ${negotiable ? "bg-green-600" : "bg-gray-300"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${negotiable ? "left-[22px]" : "left-0.5"}`} />
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Tags (optional · max {MAX_TAGS})</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(t => (
                  <span key={t} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    #{t}
                    <button type="button" onClick={() => removeTag(t)} className="hover:text-red-600"><X size={12} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  placeholder="e.g. iphone, apple, 256gb"
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-orange-500 transition text-sm"
                />
                <button type="button" onClick={addTag} className="px-4 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition">
                  Add
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
          <SectionHeader n={3} title="Location & Delivery" subtitle="Where can buyers find this item?" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">State *</label>
              <select name="location_state" required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 transition">
                <option value="">Select a state</option>
                {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">City / LGA / Area *</label>
              <input
                name="location_city"
                required
                minLength={2}
                placeholder="e.g. Ikeja"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button type="button" onClick={() => setDeliveryPickup(v => !v)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border font-bold text-sm transition ${deliveryPickup ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
              <Store size={18} /> <span className="flex-1 text-left">Buyer pickup</span>
              {deliveryPickup && <CheckCircle2 size={18} />}
            </button>
            <button type="button" onClick={() => setDeliveryShipping(v => !v)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border font-bold text-sm transition ${deliveryShipping ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
              <Truck size={18} /> <span className="flex-1 text-left">Nationwide shipping</span>
              {deliveryShipping && <CheckCircle2 size={18} />}
            </button>
          </div>
        </section>

        <section className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-5">
          <SectionHeader n={4} title="Description & Settings" subtitle="Add details and choose how buyers pay." />

          <div>
            <label className="flex items-center justify-between text-sm font-bold text-gray-900 mb-2">
              <span>Full Description *</span>
              <span className={`text-xs font-normal ${descLen < 20 ? "text-red-500" : "text-gray-400"}`}>{descLen}/1000</span>
            </label>
            <textarea
              name="description"
              required
              minLength={20}
              maxLength={1000}
              rows={6}
              placeholder="Describe the item, its features, condition, and any other relevant details..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2"><Video size={16} /> Video URL (optional)</label>
            <input
              type="url"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="YouTube or TikTok link showing the item in action"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-orange-500 transition text-sm"
            />
          </div>

          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2.5 rounded-xl text-orange-600 shadow-sm"><ShieldCheck size={24} /></div>
              <div>
                <h4 className="font-bold text-gray-900">Enable OjaLoop Escrow</h4>
                <p className="text-sm text-gray-600 mt-0.5">Buyers can pay safely through Escrow protection.</p>
              </div>
            </div>
            <button type="button" onClick={() => setEscrowEnabled(v => !v)}
              className={`w-14 h-8 rounded-full relative cursor-pointer shadow-inner transition-colors ${escrowEnabled ? "bg-orange-600" : "bg-gray-300"}`}>
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${escrowEnabled ? "right-1" : "left-1"}`} />
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2.5 rounded-xl text-yellow-600 shadow-sm"><Zap size={24} /></div>
              <div>
                <h4 className="font-bold text-gray-900">Boost listing</h4>
                <p className="text-sm text-gray-600 mt-0.5">Feature at top of category for more views.</p>
              </div>
            </div>
            <button type="button" onClick={() => setBoost(v => !v)}
              className={`w-14 h-8 rounded-full relative cursor-pointer shadow-inner transition-colors ${boost ? "bg-yellow-500" : "bg-gray-300"}`}>
              <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${boost ? "right-1" : "left-1"}`} />
            </button>
          </div>

          <div className="bg-[#FFF9E6] border border-yellow-200 rounded-2xl p-4 flex gap-3">
            <ShieldAlert size={20} className="text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800 leading-relaxed">
              <strong>Safety Tip:</strong> Never share your bank PIN, OTP, or card details. Only communicate through OjaLoop.
            </p>
          </div>
        </section>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-3 flex-row-reverse">
            <button
              id="btn-publish"
              type="submit"
              name="intent"
              value="publish"
              disabled={loading !== null}
              className="relative overflow-hidden flex-1 sm:flex-none sm:px-8 py-3.5 rounded-xl font-bold bg-orange-600 text-white hover:bg-orange-700 transition flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-wait"
            >
              {loading === "publish" && (
                <span className="absolute inset-0 pointer-events-none">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    style={{ animation: "shimmer 1.5s linear infinite" }} />
                </span>
              )}
              <span className="relative flex items-center justify-center gap-2">
                {loading === "publish" ? (
                  <>
                    <RollingDots />
                    <span>Publishing</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Publish Listing</span>
                  </>
                )}
              </span>
              {loading === "publish" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden bg-white/20">
                  <span className="block h-full w-1/3 bg-white"
                    style={{ animation: "rollbar 1.4s linear infinite" }} />
                </span>
              )}
            </button>

            <button
              id="btn-draft"
              type="submit"
              name="intent"
              value="draft"
              disabled={loading !== null}
              className="relative overflow-hidden flex-1 sm:flex-none sm:px-6 py-3.5 rounded-xl font-bold border-2 border-gray-900 text-gray-900 hover:bg-gray-50 transition flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-wait"
            >
              {loading === "draft" && (
                <span className="absolute inset-0 pointer-events-none">
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/40 to-transparent"
                    style={{ animation: "shimmer 1.5s linear infinite" }} />
                </span>
              )}
              <span className="relative flex items-center justify-center gap-2">
                {loading === "draft" ? (
                  <>
                    <RollingDots />
                    <span>Saving draft</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Save as Draft</span>
                  </>
                )}
              </span>
              {loading === "draft" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden bg-gray-900/20">
                  <span className="block h-full w-1/3 bg-gray-900"
                    style={{ animation: "rollbar 1.4s linear infinite" }} />
                </span>
              )}
            </button>
          </div>
          <div className="max-w-4xl mx-auto px-4 pb-2">
            <p className="text-[10px] text-gray-400 text-center">
              Shortcuts: <kbd className="px-1 bg-gray-100 rounded">Ctrl+S</kbd> draft · <kbd className="px-1 bg-gray-100 rounded">Ctrl+Enter</kbd> publish · Completion: {progress}%
            </p>
          </div>
        </div>
      </form>

      {showPreview && (
        <PreviewModal
          data={previewData}
          previewSrc={previews[0]}
          condition={previewData.condition}
          tags={tags}
          escrow={escrowEnabled}
          negotiable={negotiable}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

function RollingDots() {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="inline-block w-1.5 h-1.5 rounded-full bg-current"
          style={{ animation: "wave 1.2s ease-in-out infinite", animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </span>
  );
}

function SectionHeader({ n, title, subtitle }: { n: number; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">{n}</div>
      <div>
        <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

function Gate({ icon, title, body, cta }: { icon: React.ReactNode; title: string; body: string; cta: { label: string; href: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md text-center bg-white rounded-3xl border p-8">
        <div className="text-orange-600 mx-auto mb-4 flex justify-center">{icon}</div>
        <h1 className="text-xl font-bold mb-2">{title}</h1>
        <p className="text-gray-600 mb-6">{body}</p>
        <Link href={cta.href} className="inline-block bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition">
          {cta.label}
        </Link>
      </div>
    </div>
  );
}

function PreviewModal({
  data, previewSrc, condition, tags, escrow, negotiable, onClose,
}: {
  data: Record<string, string>;
  previewSrc?: string;
  condition: string;
  tags: string[];
  escrow: boolean;
  negotiable: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      style={{ animation: "fadeIn 0.2s ease-out" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative aspect-square bg-gray-100">
          {previewSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewSrc} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ImageIcon size={40} />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
          >
            <X size={18} />
          </button>
          {escrow && (
            <div className="absolute bottom-3 left-3 bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
              <ShieldCheck size={14} /> Escrow protected
            </div>
          )}
        </div>
        <div className="p-5 space-y-3">
          <h2 className="text-lg font-bold text-gray-900">{data.title || "Untitled listing"}</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-orange-600">
              ₦{Number(data.price || 0).toLocaleString()}
            </span>
            {negotiable && <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">Negotiable</span>}
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {condition && <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">{condition}</span>}
            {(data.state || data.city) && (
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
                📍 {[data.city, data.state].filter(Boolean).join(", ")}
              </span>
            )}
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map(t => (
                <span key={t} className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">#{t}</span>
              ))}
            </div>
          )}
          <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
            {data.description || "No description yet."}
          </p>
        </div>
      </div>
    </div>
  );
}