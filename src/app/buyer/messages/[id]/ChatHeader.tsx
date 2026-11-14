"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Phone, Video, MoreVertical, User, Flag, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { initiateCallAction, updateCallStatusAction } from "@/app/buyer/messages/actions";
import { createClient } from "@/lib/supabase/client";

export default function ChatHeader({ 
  otherPersonId, 
  otherPersonName,
  conversationId
}: { 
  otherPersonId: string; 
  otherPersonName: string; 
  conversationId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCall, setActiveCall] = useState<{ id: string, type: "voice" | "video" } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Listen for the receiver accepting the call
  useEffect(() => {
    if (!activeCall) return;

    const channel = supabase
      .channel(`call_${activeCall.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'calls', filter: `id=eq.${activeCall.id}` }, (payload) => {
        if (payload.new.status === 'accepted') {
          toast.success("Call Accepted! Joining room...");
          window.open(`/call/${conversationId}`, "_blank");
          setActiveCall(null);
        } else if (payload.new.status === 'declined') {
          toast.error("Call Declined");
          setActiveCall(null);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeCall, conversationId, supabase]);

  async function startCall(type: "voice" | "video") {
    toast.info(`Calling ${otherPersonName}...`);
    const result = await initiateCallAction(conversationId, otherPersonId, type);
    if (result?.success && result.callId) {
      setActiveCall({ id: result.callId, type });
    }
  }

  async function cancelCall() {
    if (activeCall) {
      await updateCallStatusAction(activeCall.id, 'ended');
      setActiveCall(null);
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className="flex items-center gap-1 text-gray-500">
        <button onClick={() => startCall("voice")} className="p-2 hover:bg-gray-100 rounded-full transition">
          <Phone size={18} />
        </button>
        
        <button onClick={() => startCall("video")} className="p-2 hover:bg-gray-100 rounded-full transition">
          <Video size={18} />
        </button>
        
        {/* 3 Dots Menu */}
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-gray-100 rounded-full transition">
            <MoreVertical size={18} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <div className="p-1">
                <Link 
                  href={`/buyer/messages`}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition"
                  onClick={() => setIsOpen(false)}
                >
                  <User size={16} /> View Profile
                </Link>
                <button 
                  onClick={() => { setIsOpen(false); toast.success(`Reported ${otherPersonName}.`); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition"
                >
                  <Flag size={16} /> Report {otherPersonName}
                </button>
                <button 
                  onClick={() => { setIsOpen(false); toast.success("Chat cleared from your view."); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={16} /> Clear Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CALLING MODAL (For the Caller) */}
      {activeCall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4">
            <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-6 relative">
              <span className="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-20"></span>
              {activeCall.type === "video" ? <Video size={40} /> : <Phone size={40} />}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Calling...</h2>
            <p className="text-gray-500 mb-8">{otherPersonName}</p>
            
            <button onClick={cancelCall} className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition shadow-lg">
              <X size={32} />
            </button>
            <p className="text-xs text-gray-400 mt-4">Tap to cancel</p>
          </div>
        </div>
      )}
    </>
  );
}