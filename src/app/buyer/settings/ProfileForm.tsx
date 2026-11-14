/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Save, Loader2, Camera, User, MapPin, Shield, Bell } from "lucide-react";
import { updateProfileAction, deleteAccountAction } from "./actions";
import { toast } from "sonner";
import { useFormStatus } from "react-dom"; // <-- IMPORT THIS

const NIGERIAN_STATES = ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"];

// 1. Define a strict type for the profile to fix the 'any' error
type Profile = {
  display_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  location_state?: string | null;
  location_city?: string | null;
  email_alerts?: boolean | null;
  sms_alerts?: boolean | null;
};

// 2. Create the dedicated Submit Button for the spinner
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
        <><Save size={20} /> Save Profile Changes</>
      )}
    </button>
  );
}

export default function ProfileForm({ profile, email }: { profile: Profile | null, email?: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);
  
  // State for the real-time toggles
  const [emailAlerts, setEmailAlerts] = useState<boolean>(profile?.email_alerts ?? true);
  const [smsAlerts, setSmsAlerts] = useState<boolean>(profile?.sms_alerts ?? false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await updateProfileAction(formData);
    
    if (result?.error) {
      setError(result.error);
      toast.error("Failed to update profile", { description: result.error });
    } else {
      toast.success("Profile updated successfully!");
    }
  }

  async function handleDeleteAccount() {
    if (!confirm("Are you absolutely sure? This will permanently delete your account, listings, and messages. This action cannot be undone.")) return;
    
    setIsDeleting(true);
    const result = await deleteAccountAction();
    if (result?.error) {
      toast.error("Failed to delete account", { description: result.error });
      setIsDeleting(false);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  }

  return (
    <form action={handleSubmit} className="space-y-8">
      
      {/* Hidden Inputs */}
      <input type="hidden" name="current_avatar" value={profile?.avatar_url || ""} />
      {/* These hidden inputs pass the real-time toggle state to the Server Action */}
      <input type="hidden" name="email_alerts" value={String(emailAlerts)} />
      <input type="hidden" name="sms_alerts" value={String(smsAlerts)} />

      {/* 1. AVATAR SECTION */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="relative group">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-white border-4 border-white shadow-lg flex items-center justify-center">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-orange-200">{profile?.display_name?.[0]?.toUpperCase() || 'U'}</span>
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-gray-900 text-white p-2 rounded-full cursor-pointer hover:bg-orange-600 transition shadow-md">
            <Camera size={16} />
            <input type="file" name="avatar" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>
        <div className="text-center sm:text-left">
          <h3 className="font-bold text-gray-900 text-lg">Profile Picture</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-xs">Upload a clear photo. It helps build trust with sellers and buyers.</p>
        </div>
      </div>

      {/* 2. PERSONAL INFO */}
      <div className="space-y-5">
        <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
          <User size={18} className="text-orange-500" /> Personal Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Full Name</label>
            <input name="display_name" defaultValue={profile?.display_name || ""} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 transition" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Email Address (Locked)</label>
            <input disabled defaultValue={email} className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-500 cursor-not-allowed" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Bio / About You</label>
          <textarea name="bio" defaultValue={profile?.bio || ""} rows={3} placeholder="Tell us a little about yourself..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 transition resize-none"></textarea>
        </div>
      </div>

      {/* 3. CONTACT & LOCATION */}
      <div className="space-y-5">
        <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
          <MapPin size={18} className="text-orange-500" /> Contact & Location
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Phone Number</label>
            <input name="phone" type="tel" defaultValue={profile?.phone || ""} placeholder="e.g. 08012345678" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 transition" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">WhatsApp Number</label>
            <input name="whatsapp" type="tel" defaultValue={profile?.whatsapp || ""} placeholder="e.g. 08012345678" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 transition" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">State</label>
            <select name="location_state" defaultValue={profile?.location_state || ""} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 transition text-gray-700">
              <option value="">Select State</option>
              {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">City / Area</label>
            <input name="location_city" defaultValue={profile?.location_city || ""} placeholder="e.g. Ikeja" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-orange-500 transition" />
          </div>
        </div>
      </div>

      {/* 4. NOTIFICATIONS (REAL-TIME TOGGLES) */}
      <div className="space-y-5">
        <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-2">
          <Bell size={18} className="text-orange-500" /> Notification Preferences
        </h3>
        
        <div className="space-y-3">
          {/* Email Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="font-bold text-gray-900 text-sm">Email Alerts</p>
              <p className="text-xs text-gray-500">Get emails about orders, messages, and promotions.</p>
            </div>
            <button
              type="button"
              onClick={() => setEmailAlerts(!emailAlerts)}
              className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${emailAlerts ? 'bg-orange-600' : 'bg-gray-300'}`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${emailAlerts ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>

          {/* SMS Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="font-bold text-gray-900 text-sm">SMS Alerts</p>
              <p className="text-xs text-gray-500">Receive text messages for urgent order updates.</p>
            </div>
            <button
              type="button"
              onClick={() => setSmsAlerts(!smsAlerts)}
              className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${smsAlerts ? 'bg-orange-600' : 'bg-gray-300'}`}
            >
              <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${smsAlerts ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100 flex items-center gap-2"><Shield size={18} /> {error}</div>}

      {/* SAVE BUTTON (Uses the new SubmitButton) */}
      <div className="sticky bottom-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-gray-200 shadow-xl flex justify-end">
        <SubmitButton />
      </div>

      {/* 5. DANGER ZONE */}
      <div className="space-y-5 pt-8">
        <h3 className="font-bold text-red-600 border-b border-red-100 pb-2 flex items-center gap-2">
          <Shield size={18} /> Security & Account
        </h3>
        
        <div className="p-5 border border-red-200 bg-red-50 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="font-bold text-red-900 text-sm">Delete Account</p>
            <p className="text-xs text-red-700 mt-1">Once deleted, your profile, orders, and messages will be permanently removed.</p>
          </div>
          <button 
            type="button" 
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition whitespace-nowrap flex items-center justify-center min-w-[140px]"
          >
            {isDeleting ? <Loader2 className="animate-spin" size={18} /> : "Delete My Account"}
          </button>
        </div>
      </div>

    </form>
  );
}