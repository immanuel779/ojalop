"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Phone, Video, PhoneOff, PhoneCall } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// 1. Define a proper type for the Call object
type Call = {
  id: string;
  caller_id: string;
  receiver_id: string;
  conversation_id: string;
  type: "voice" | "video";
  status: "ringing" | "accepted" | "declined" | "ended";
  created_at: string;
};

export default function GlobalCallListener() {
  const [incomingCall, setIncomingCall] = useState<Call | null>(null);
  const [callerName, setCallerName] = useState("Someone");
  const router = useRouter();
  const supabase = createClient();
  
  // 2. Use a ref for the audio instead of window.any
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Listen for ANY new incoming call where we are the receiver
    const channel = supabase
      .channel('incoming_calls')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'calls' }, async (payload) => {
        const { data: { user } } = await supabase.auth.getUser();
        const newCall = payload.new as Call; // Cast to our type

        if (newCall.receiver_id === user?.id && newCall.status === 'ringing') {
          
          // Fetch caller name
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', newCall.caller_id)
            .single();
          
          const name = profile?.display_name || "OjaLoop User";
          setCallerName(name);
          setIncomingCall(newCall);
          
          // Show a toast notification
          toast.info(`Incoming ${newCall.type} call`, {
            description: `${name} is calling you...`,
            duration: 5000,
          });

          // Play ringing sound
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
          audio.loop = true;
          audio.play().catch(() => {
            console.log("Audio autoplay was blocked by the browser.");
          });
          audioRef.current = audio;
        }
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [supabase]);

  async function acceptCall() {
    if (!incomingCall) return;
    
    if (audioRef.current) audioRef.current.pause();
    
    await supabase.from('calls').update({ status: 'accepted' }).eq('id', incomingCall.id);
    toast.success("Joining call...");
    router.push(`/call/${incomingCall.conversation_id}`);
    setIncomingCall(null);
  }

  async function declineCall() {
    if (!incomingCall) return;

    if (audioRef.current) audioRef.current.pause();
    
    await supabase.from('calls').update({ status: 'declined' }).eq('id', incomingCall.id);
    toast.error("Call declined");
    setIncomingCall(null);
  }

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 animate-in slide-in-from-bottom-10">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 relative">
          <span className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></span>
          {incomingCall.type === "video" ? <Video size={40} /> : <Phone size={40} />}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Incoming {incomingCall.type} call
        </h2>
        <p className="text-gray-500 mb-8">{callerName}</p>
        
        <div className="flex gap-6">
          <button onClick={declineCall} className="w-16 h-16 bg-red-600 text-white rounded-full flex flex-col items-center justify-center hover:bg-red-700 transition shadow-lg">
            <PhoneOff size={24} />
          </button>
          <button onClick={acceptCall} className="w-16 h-16 bg-green-600 text-white rounded-full flex flex-col items-center justify-center hover:bg-green-700 transition shadow-lg animate-bounce">
            <PhoneCall size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}