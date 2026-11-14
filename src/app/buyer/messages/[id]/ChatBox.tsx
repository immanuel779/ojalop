/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Send, Loader2, Check, CheckCheck, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

type Message = {
  id: string;
  sender_id: string;
  content: string | null;
  image_url?: string | null;
  created_at: string;
  is_read: boolean;
};

export default function ChatBox({ 
  conversationId, 
  currentUserId, 
  initialMessages,
}: { 
  conversationId: string; 
  currentUserId: string; 
  initialMessages: Message[];
  otherPersonName: string;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, imagePreview]);

  // REAL-TIME LISTENER (Handles both new messages and read receipts)
  useEffect(() => {
    const channel = supabase
      .channel('chat_changes')
      // 1. Listen for NEW messages
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
        setMessages((current) => {
          if (current.find(m => m.id === payload.new.id)) return current;
          return [...current, payload.new as Message];
        });
      })
      // 2. Listen for READ receipts (UPDATE events)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, (payload) => {
        setMessages((current) => 
          current.map(msg => msg.id === payload.new.id ? { ...msg, is_read: payload.new.is_read } : msg)
        );
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, supabase]);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if ((!input.trim() && !imageFile) || loading) return;
    
    setLoading(true);
    let uploadedImageUrl = null;

    if (imageFile) {
      const fileName = `${currentUserId}-${Date.now()}.${imageFile.name.split('.').pop()}`;
      const { error: uploadError } = await supabase.storage.from("message-attachments").upload(fileName, imageFile);
      
      if (!uploadError) {
        const { data } = supabase.storage.from("message-attachments").getPublicUrl(fileName);
        uploadedImageUrl = data.publicUrl;
      } else {
        toast.error("Failed to upload image");
        setLoading(false);
        return;
      }
    }

    const content = input;
    setInput("");
    removeImage();

    const { data: newMessage, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: content || null,
        image_url: uploadedImageUrl,
      })
      .select()
      .single();
    
    if (error) {
      toast.error("Failed to send message", { description: error.message });
    } else if (newMessage) {
      setMessages((current) => {
        if (current.find(m => m.id === newMessage.id)) return current;
        return [...current, newMessage as Message];
      });
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] md:h-[calc(100vh-200px)] bg-[#efeae2] rounded-b-3xl overflow-hidden border border-gray-200 shadow-sm relative">
      
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        <div className="flex justify-center mb-6">
          <span className="bg-white/80 text-gray-500 text-xs font-medium px-3 py-1 rounded-full shadow-sm">Today</span>
        </div>

        {messages.map((msg, i) => {
          const isMe = msg.sender_id === currentUserId;
          const time = new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

          return (
            <div key={msg.id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`relative max-w-[85%] md:max-w-[70%] p-1.5 rounded-2xl shadow-sm ${isMe ? "bg-[#d9fdd3] rounded-tr-sm" : "bg-white rounded-tl-sm"}`}>
                
                {msg.image_url && (
                  <img src={msg.image_url} alt="Attachment" className="rounded-xl max-h-64 w-full object-cover mb-1" />
                )}
                
                {msg.content && (
                  <div className="px-2.5 py-1 text-[15px] text-gray-900">
                    {msg.content}
                  </div>
                )}

                {/* WHATSAPP TICK LOGIC */}
                <div className={`flex items-center justify-end gap-1 px-2 pb-1 mt-0.5 ${isMe ? 'text-green-700/60' : 'text-gray-400'}`}>
                  <span className="text-[10px]">{time}</span>
                  {isMe && (
                    msg.is_read ? (
                      <CheckCheck size={16} className="text-blue-500" /> // BLUE TICKS
                    ) : (
                      <Check size={16} className="text-gray-400" /> // SINGLE GREY TICK
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      
      {/* INPUT AREA */}
      <div className="bg-white border-t border-gray-200">
        {imagePreview && (
          <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-300">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button onClick={removeImage} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg">
                <X size={12} />
              </button>
            </div>
            <span className="text-sm text-gray-500 font-medium">Image ready to send</span>
          </div>
        )}

        <form onSubmit={handleSend} className="p-3 md:p-4 flex gap-2 items-center">
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
          
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition shrink-0"
          >
            <ImageIcon size={22} />
          </button>

          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Type a message..." 
            className="flex-1 bg-gray-100 rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-orange-500/20 transition-all text-sm"
          />
          
          <button 
            type="submit" 
            disabled={loading || (!input.trim() && !imageFile)} 
            className="bg-orange-600 text-white p-3.5 rounded-full hover:bg-orange-700 disabled:opacity-50 transition shadow-md shrink-0"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="-ml-0.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}