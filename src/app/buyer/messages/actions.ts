"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function startChatAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return redirect("/login");

  const sellerId = formData.get("seller_id") as string;
  const productId = formData.get("product_id") as string;

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("buyer_id", user.id)
    .eq("seller_id", sellerId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    redirect(`/buyer/messages/${existing.id}`);
  }

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
    console.error("Chat creation error:", error);
    return;
  }

  redirect(`/buyer/messages/${newChat.id}`);
}

// --- NEW CALL ACTIONS ---

export async function initiateCallAction(conversationId: string, receiverId: string, type: "voice" | "video") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: call, error } = await supabase
    .from("calls")
    .insert({
      caller_id: user.id,
      receiver_id: receiverId,
      conversation_id: conversationId,
      type,
      status: "ringing"
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { success: true, callId: call.id };
}

export async function updateCallStatusAction(callId: string, status: "accepted" | "declined" | "ended") {
  const supabase = await createClient();
  const { error } = await supabase.from("calls").update({ status }).eq("id", callId);
  if (error) return { error: error.message };
  return { success: true };
}