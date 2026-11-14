"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const reportSchema = z.object({
  target_id: z.string().uuid(),
  target_type: z.enum(["product", "store", "user"]),
  reason: z.string().min(1, "Please select a reason"),
  description: z.string().optional(),
});

export async function submitReportAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "You must be logged in to submit a report." };

  const parsed = reportSchema.safeParse({
    target_id: formData.get("target_id"),
    target_type: formData.get("target_type"),
    reason: formData.get("reason"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_id: parsed.data.target_id,
    target_type: parsed.data.target_type,
    reason: parsed.data.reason,
    description: parsed.data.description,
  });

  if (error) {
    if (error.code === "23505") return { error: "You have already reported this item." };
    return { error: error.message };
  }

  revalidatePath("/admin/reports");
  return { success: true };
}