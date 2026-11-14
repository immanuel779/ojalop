import { createClient } from "@/lib/supabase/server";
import SettingsForm from "./SettingsForm";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  // Fetch the settings row
  const { data: settings } = await supabase
    .from("platform_settings")
    .select("*")
    .eq("id", 1)
    .single();

  // Fallback if row doesn't exist yet
  if (!settings) {
    return <div className="p-8 text-red-500">Database error: Settings row not found. Did you run the SQL?</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Platform Settings</h1>
        <p className="text-gray-500 mt-1">Configure global fees, feature toggles, and support information.</p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}