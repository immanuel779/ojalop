/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function CallRoom() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    // Load the Jitsi Meet external script dynamically
    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => {
      if (jitsiContainerRef.current) {
        const domain = "meet.jit.si";
        const options = {
          roomName: `OjaLoop-Secure-Call-${roomId}`,
          width: "100%",
          height: "100%",
          parentNode: jitsiContainerRef.current,
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DEFAULT_BACKGROUND: "#111827",
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
          },
        };
        // @ts-expect-error - Jitsi is loaded globally
        apiRef.current = new window.JitsiMeetExternalAPI(domain, options);
        
        // When the user hangs up, redirect them back to the chat
        apiRef.current.addEventListener("readyToClose", () => {
          router.back();
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [roomId, router]);

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900 flex flex-col">
      {/* Top Bar for Mobile */}
      <div className="bg-gray-900 text-white p-4 flex items-center gap-4 shrink-0">
        <button onClick={() => router.back()} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-bold text-lg leading-tight">OjaLoop Secure Call</h1>
          <p className="text-xs text-gray-400">Encrypted End-to-End</p>
        </div>
      </div>

      {/* Jitsi Video Container */}
      <div ref={jitsiContainerRef} className="flex-1 w-full bg-black relative">
        <div className="absolute inset-0 flex items-center justify-center text-white">
          Connecting to secure call...
        </div>
      </div>
    </div>
  );
}