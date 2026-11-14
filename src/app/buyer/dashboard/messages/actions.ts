"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function startChatAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return redirect("/login");

  const sellerId = formData.get("seller_id") as string;
  const productId = formData.get("product_id") as string;

  // Check if conversation already exists
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("buyer_id", user.id)
    .eq("seller_id", sellerId)
    .eq("product_id", productId)
    .single();

  if (existing) {
    redirect(`/buyer/messages/${existing.id}`);
  }

  // Create new conversation
  const { data: newChat, error } = await supabase
    .from("conversations")
    .insert({
      buyer_id: user.id,
      seller_id: sellerId,
      product_id: productId,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return;
  }

  redirect(`/buyer/messages/${newChat.id}`);
}

export async function sendMessageAction(conversationId: string, content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: content,
  });

  if (error) return { error: error.message };
  return { success: true };
}