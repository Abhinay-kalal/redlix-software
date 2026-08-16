"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Users, Clock, MapPin, CheckCircle2, AlertCircle } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

function SprintWaitingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "";

  const [sprint, setSprint] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [hardwareChecked, setHardwareChecked] = useState(false);
  const [hardwareChecking, setHardwareChecking] = useState(false);
  const [hardwareError, setHardwareError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Floating Emojis State
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: string, emoji: string, left: number }[]>([]);

  const triggerEmoji = (emoji: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const left = 5 + Math.random() * 90; // Random horizontal position 5% to 95%
    setFloatingEmojis(prev => [...prev, { id, emoji, left }]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 3000); // 3 second animation
  };

  // 1. Fetch Sprint Details initially
  useEffect(() => {
    if (!code) {
      setErrorMsg("Missing room join code.");
      setLoading(false);
      return;
    }

    const fetchSprintDetails = async () => {
      try {
        const res = await fetch(`/api/sprints/status?code=${code}`);
        const data = await res.json();
        if (data.success) {
          setSprint(data.data);
          // Don't auto-redirect if hardware not checked yet! We will redirect after check.
        } else {
          setErrorMsg(data.error || "Sprint room not found.");
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to fetch sprint details.");
      } finally {
        setLoading(false);
      }
    };

    fetchSprintDetails();
  }, [code]);

  // Handle hardware validation and device ID generation
  const performHardwareCheck = async () => {
    setHardwareChecking(true);
    setHardwareError("");
    try {
      // Request Camera and Mic
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Load FingerprintJS
      const fpPromise = import('@fingerprintjs/fingerprintjs').then(FingerprintJS => FingerprintJS.load());
      const fp = await fpPromise;
      const result = await fp.get();
      const deviceId = result.visitorId;
      localStorage.setItem("candidate_device_id", deviceId);

      // Verify 1-Device Login with Server
      const email = localStorage.getItem("candidate_email") || "";
      const syncRes = await fetch("/api/sprints/participants/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sprintCode: code, email, deviceId })
      });
      const syncData = await syncRes.json();

      if (!syncData.success) {
        throw new Error(syncData.message || "Failed to sync device signature.");
      }
      
      // Keep stream active for a few seconds to preview
      setTimeout(() => {
        setHardwareChecked(true);
        setHardwareChecking(false);
        // If sprint is already started, we push to active
        if (sprint?.isStarted) {
          router.push(`/sprints/active?code=${code}`);
        }
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setHardwareError("Please allow Camera and Microphone permissions to proceed. " + (err.message || ""));
      setHardwareChecking(false);
    }
  };

  // 2. Poll sprint status (isStarted) and participants list every 3 seconds
  useEffect(() => {
    // Only poll if hardware check passed
    if (!code || !sprint || !hardwareChecked) return;

    const pollStatusAndParticipants = async () => {
      try {
        const statusRes = await fetch(`/api/sprints/status?code=${code}`);
        const statusData = await statusRes.json();
        if (statusData.success && statusData.data.isStarted) {
          router.push(`/sprints/active?code=${code}`);
          return;
        }

        const participantsRes = await fetch(`/api/sprints/participants?code=${code}`);
        const participantsData = await participantsRes.json();
        if (participantsData.success && Array.isArray(participantsData.data)) {
          setParticipants(participantsData.data);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    const interval = setInterval(pollStatusAndParticipants, 3000);
    return () => clearInterval(interval);
  }, [code, sprint, hardwareChecked, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#E61E32] mb-4" />
        <p className="text-xs text-zinc-500 font-medium">Authenticating & Entering Lobby...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="bg-white border border-zinc-200 p-8 rounded-3xl shadow-lg max-w-sm w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-50 text-[#E61E32] flex items-center justify-center mx-auto border border-red-100">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Access Denied</h3>
            <p className="text-sm text-zinc-500 leading-relaxed font-medium">{errorMsg}</p>
          </div>
          <button
            onClick={() => router.push("/candidate-dashboard")}
            className="w-full bg-[#E61E32] hover:bg-[#c8102e] text-white text-sm font-bold py-3 rounded-xl cursor-pointer transition-colors shadow-sm"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // HARDWARE CHECK SCREEN
  if (!hardwareChecked) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white border border-zinc-200 p-8 rounded-3xl shadow-lg max-w-lg w-full space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-black text-zinc-900 tracking-tight uppercase">System Verification</h2>
            <p className="text-xs text-zinc-500 font-medium">
              This is a proctored exam. Your camera, microphone, and device signature must be verified before entering the lobby.
            </p>
          </div>
          
          <div className="relative w-full aspect-video bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-300">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
            {!videoRef.current?.srcObject && (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-xs font-bold uppercase">
                Camera Feed Offline
              </div>
            )}
          </div>

          {hardwareError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-bold text-center">
              {hardwareError}
            </div>
          )}

          <button
            onClick={performHardwareCheck}
            disabled={hardwareChecking}
            className="w-full bg-[#E61E32] hover:bg-[#c8102e] active:bg-[#b81223] text-white text-xs font-black uppercase py-4 rounded-xl cursor-pointer transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {hardwareChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Enable Camera"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900 relative overflow-hidden">
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.5) rotate(0deg); opacity: 0; }
          15% { transform: translateY(-10vh) scale(1.2) rotate(-15deg); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-70vh) scale(1) rotate(20deg); opacity: 0; }
        }
        .animate-float-up {
          animation: floatUp 2.5s ease-out forwards;
        }
      `}} />

      {/* Header Bar */}
      <header className="bg-white border-b border-zinc-200 py-4 px-6 md:px-10 flex items-center justify-between shrink-0 shadow-sm relative z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            {sprint?.logoUrl && (
              <img src={sprint.logoUrl} alt="Logo" className="w-10 h-10 object-cover rounded-xl border border-zinc-200 shrink-0" />
            )}
            <div className="hidden sm:block">
              <h1 className="text-sm font-black tracking-wide text-zinc-900">{sprint?.title}</h1>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Code: {code}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 shrink-0">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">Secured Connection</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-hidden w-full max-w-7xl mx-auto p-6 md:p-8 flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* Left Column: Lottie Animation & Waiting Message */}
        <div className="flex-1 flex flex-col items-center justify-center lg:pr-10 h-full">
          
          <div className="w-full max-w-[32rem] mx-auto aspect-square relative flex items-center justify-center shrink-0">
            {/* Pulsing ring behind lottie (subtle in light mode) */}
            <div className="absolute inset-0 rounded-full border border-[#E61E32]/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
            <div className="absolute inset-4 rounded-full border border-[#E61E32]/5 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]" />
            
            <DotLottieReact
              src="https://lottie.host/e0dd072f-5bb2-4541-8017-b420acfebcdf/XJJFzaG5mH.lottie"
              loop
              autoplay
              style={{ width: '100%', height: '100%' }}
            />
          </div>

          <div className="text-center -mt-8 space-y-4 max-w-lg relative z-10">
            <h2 className="text-2xl md:text-4xl font-black text-zinc-900 tracking-tight leading-tight">
              Awaiting Organizer <br/>
              <span className="text-[#E61E32]">Initialization</span>
            </h2>
            <p className="text-sm md:text-base text-zinc-500 font-medium leading-relaxed">
              Your connection is verified and secured. Do not close this browser window. 
              You will automatically teleport into the coding environment the moment the sprint goes live.
            </p>
          </div>
        </div>

        {/* Right Column: Sprint details & participants */}
        <div className="w-full lg:w-[420px] flex flex-col gap-6 shrink-0 h-full">
          
          {/* Details Card */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden group hover:border-[#E61E32]/30 transition-colors duration-500">
            {/* Subtle red gradient top border inside */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#E61E32]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <span className="px-3 py-1 bg-zinc-100 text-zinc-600 text-[10px] font-black rounded-lg border border-zinc-200 uppercase tracking-widest inline-block mb-6">
              Sprint Intelligence
            </span>
            
            <h3 className="text-xl font-black text-zinc-900 leading-snug mb-3">{sprint?.title}</h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium mb-8">
              {sprint?.description || "No specific guidelines provided. Wait for the organizer to kick off the sprint."}
            </p>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-100 shrink-0">
                  <Clock className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Strict Time Limit</p>
                  <p className="text-sm font-bold text-zinc-900">
                    {sprint?.endDate ? Math.ceil((new Date(sprint.endDate).getTime() - new Date(sprint.startDate).getTime()) / 60000) : 60} Minutes
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-100 shrink-0">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5">Environment</p>
                  <p className="text-sm font-bold text-zinc-900">
                    {sprint?.location || "Online"} ({sprint?.type})
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Lobby Feed */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col flex-1 min-h-[300px]">
            <div className="border-b border-zinc-100 pb-4 mb-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-zinc-500" />
                <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider">Lobby Feed</h3>
              </div>
              <span className="text-[9px] font-black text-zinc-500 bg-zinc-50 px-2.5 py-1 rounded-md uppercase tracking-widest border border-zinc-200">
                {participants.length} Ready
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 
              [&::-webkit-scrollbar]:w-1.5 
              [&::-webkit-scrollbar-track]:bg-transparent 
              [&::-webkit-scrollbar-thumb]:bg-zinc-200 
              [&::-webkit-scrollbar-thumb]:rounded-full 
              hover:[&::-webkit-scrollbar-thumb]:bg-zinc-300">
              
              {participants.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-xs italic font-medium">
                  It's just you here right now...
                </div>
              ) : (
                participants.map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 border border-zinc-100 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-zinc-900 mb-1">{p.name || "Candidate"}</p>
                      <p className="text-[10px] text-zinc-500 font-medium tracking-wide">{p.email}</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 shadow-sm" />
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-between items-center bg-zinc-50 rounded-xl p-2 border relative">
               {/* Floating Emojis Overlay */}
               <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 w-32 h-0 z-50 flex justify-center mb-2">
                 {floatingEmojis.map((e) => (
                   <div
                     key={e.id}
                     className="absolute bottom-0"
                     style={{ left: `calc(50% + ${e.left}px)` }}
                   >
                     <div className="text-4xl animate-float-up drop-shadow-md">
                       {e.emoji}
                     </div>
                   </div>
                 ))}
               </div>

               {['❤️', '👍', '😂', '😮', '😢', '🎉'].map(emoji => (
                 <button 
                   key={emoji} 
                   onClick={() => triggerEmoji(emoji)}
                   title="React"
                   className="text-2xl hover:scale-125 transition-transform cursor-pointer active:scale-95 px-2 select-none drop-shadow-sm relative z-10"
                 >
                   {emoji}
                 </button>
               ))}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}

export default function SprintWaitingRoom() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#E61E32] mb-4" />
        <p className="text-xs text-zinc-500 font-medium">Loading Lobby Framework...</p>
      </div>
    }>
      <SprintWaitingContent />
    </Suspense>
  );
}
