"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function submitVerificationAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 1. Fetch user's store
  const { data: store } = await supabase.from("stores").select("id").eq("owner_id", user.id).single();
  if (!store) return { error: "Store not found." };

  // 2. Extract Data
  const businessName = formData.get("business_name") as string;
  const cacNumber = formData.get("cac_number") as string;
  const idType = formData.get("id_type") as string;
  const documentFile = formData.get("document") as File;

  if (!documentFile || documentFile.size === 0) {
    return { error: "Please upload a verification document." };
  }

  // 3. Upload to Private Storage
  const fileExt = documentFile.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("verification-documents")
    .upload(fileName, documentFile);

  if (uploadError) {
    return { error: `Failed to upload document: ${uploadError.message}` };
  }

  // 4. Save Request to Database
  const { error: dbError } = await supabase.from("seller_verifications").insert({
    store_id: store.id,
    seller_id: user.id,
    business_name: businessName,
    cac_number: cacNumber,
    id_type: idType,
    status: "pending"
  });

  if (dbError) return { error: dbError.message };

  revalidatePath("/seller/verification");
  redirect("/seller/verification?success=true");
}