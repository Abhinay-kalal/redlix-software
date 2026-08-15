"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Users, Clock, MapPin, CheckCircle2, AlertCircle } from "lucide-react";

function SprintWaitingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "";

  const [sprint, setSprint] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

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
          // If already started, direct straight to active workspace
          if (data.data.isStarted) {
            router.push(`/sprints/active?code=${code}`);
          }
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
  }, [code, router]);

  // 2. Poll sprint status (isStarted) and participants list every 3 seconds
  useEffect(() => {
    if (!code || !sprint) return;

    const pollStatusAndParticipants = async () => {
      try {
        // Poll status
        const statusRes = await fetch(`/api/sprints/status?code=${code}`);
        const statusData = await statusRes.json();
        if (statusData.success) {
          if (statusData.data.isStarted) {
            router.push(`/sprints/active?code=${code}`);
            return;
          }
        }

        // Poll participants
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
  }, [code, sprint, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#E61E32] mb-4" />
        <p className="text-xs text-zinc-500 font-medium">Entering Room Lobby...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4">
        <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-md max-w-sm w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-[#E61E32] flex items-center justify-center mx-auto border border-red-100">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-zinc-900 uppercase">Room Error</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">{errorMsg}</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-[#E61E32] hover:bg-[#d01729] text-white text-xs font-bold py-2 rounded-lg cursor-pointer"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900">
      {/* Header Bar */}
      <header className="bg-zinc-900 text-white py-3.5 px-6 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          {sprint?.logoUrl ? (
            <img src={sprint.logoUrl} alt="Logo" className="w-9 h-9 object-cover rounded-lg border border-white/10 shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
              S
            </div>
          )}
          <div>
            <h1 className="text-sm font-extrabold font-inter tracking-wide">{sprint?.title}</h1>
            <p className="text-[10px] text-zinc-400 font-medium">Sprint Room Join Code: {code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">Connected</span>
        </div>
      </header>

      {/* Main Grid split */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Sprint parameters and waiting status */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-xs flex flex-col justify-between h-[340px]">
            <div className="space-y-4">
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-100 uppercase inline-block">
                Lobby Waiting Area
              </span>
              <h2 className="text-xl font-black text-zinc-950 leading-snug">{sprint?.title}</h2>
              <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                {sprint?.description || "No specific guidelines provided. Wait for the organizer to kick off the sprint."}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-zinc-655 font-medium">
                  <Clock className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>Duration: {sprint?.endDate ? Math.ceil((new Date(sprint.endDate).getTime() - new Date(sprint.startDate).getTime()) / 60000) : 60} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-655 font-medium">
                  <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>Location: {sprint?.location || "Online Room"} ({sprint?.type})</span>
                </div>
              </div>
            </div>

            {/* Pulsing access banner */}
            <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-4 flex items-center gap-4">
              <div className="relative shrink-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-t-red-600 border-zinc-250 animate-spin absolute" />
                <Users className="w-4 h-4 text-zinc-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900">Waiting for organizer to unlock the exam...</p>
                <p className="text-[10px] text-zinc-550 mt-0.5">Please do not close this browser window. You will auto-redirect immediately upon start.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Active candidates lobby feed */}
        <div className="border border-zinc-200 bg-white rounded-2xl p-6 shadow-xs flex flex-col h-[340px]">
          <div className="border-b border-zinc-150 pb-3 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-zinc-550" />
              <h3 className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider">Lobby Room ({participants.length})</h3>
            </div>
            <span className="text-[9px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded uppercase">Live Feed</span>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-2.5">
            {participants.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs italic">
                Only you are in the room. Wait for others...
              </div>
            ) : (
              participants.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 border border-zinc-100 rounded-xl bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
                  <div>
                    <p className="text-xs font-bold text-zinc-900">{p.name || "Candidate"}</p>
                    <p className="text-[9px] text-zinc-400 font-mono leading-none mt-0.5">{p.email}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SprintWaitingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#E61E32]" />
      </div>
    }>
      <SprintWaitingContent />
    </Suspense>
  );
}
