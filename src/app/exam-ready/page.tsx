"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ExamData {
  id: number;
  name: string;
  company_name: string;
  company_logo?: string;
  date: string;
  time: string;
  description: string;
  total_qns: number;
  types_of_qns: string;
}

interface ExamSession {
  candidateName: string;
  hallTicketNumber: string;
  registrationNumber: string;
  photoUrl: string;
  exam: ExamData;
}

const INSTRUCTIONS = [
  "Do not switch tabs, minimize, or open any other application during the exam.",
  "Your camera and microphone must remain active throughout the session.",
  "Do not refer to books, notes, or any other digital devices.",
  "The exam is time-bound — auto-submission will occur when the timer ends.",
  "Your session is monitored by AI proctoring; suspicious activity will be flagged.",
  "Once submitted, you cannot re-enter or change your answers.",
  "Ensure a stable internet connection before you begin.",
  "Sit alone in a quiet, well-lit room for the duration of the exam.",
  "Answer all questions carefully — each question has only one correct answer unless stated.",
  "Do not refresh the browser page during the exam.",
  "Contact your exam controller only in case of a genuine technical emergency.",
];

export default function ExamReadyPage() {
  const router = useRouter();
  const [session, setSession] = useState<ExamSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("exam_session");
    if (!raw) { router.replace("/exam-login"); return; }
    
    let isMounted = true;
    
    const verifySession = async () => {
      try {
        const parsed = JSON.parse(raw);
        if (!parsed.hallTicketNumber) throw new Error("Invalid session");

        // Verify with the server to check if candidate is blocked
        const res = await fetch("/api/exam/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hallTicketNumber: parsed.hallTicketNumber,
            candidateName: parsed.candidateName,
            examId: parsed.exam?.id,
          }),
        });
        
        const data = await res.json();
        
        if (!isMounted) return;
        
        if (!data.success && data.error === "blocked") {
          // If the server says they are blocked, redirect to session which handles lockout
          router.replace("/exam-session");
          return;
        }

        setSession(parsed);
      } catch {
        if (isMounted) router.replace("/exam-login");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    verifySession();
    
    return () => { isMounted = false; };
  }, [router]);

  const handleBeginExam = async () => {
    if (!agreed) return;
    setStarting(true);

    // Request fullscreen NOW — must be inside a user gesture (button click)
    // Browsers reject fullscreen requests that originate from useEffect/async after navigation
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if ((el as any).webkitRequestFullscreen) {
        await (el as any).webkitRequestFullscreen(); // Safari
      }
    } catch {
      // Fullscreen denied (e.g. permissions policy) — still allow exam entry
      // exam-session will detect non-fullscreen and flag it
    }

    router.push("/exam-session");
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-sans">
      <div className="w-8 h-8 rounded-full border-2 border-t-[#E61E32] border-r-zinc-200 border-b-zinc-200 border-l-zinc-200 animate-spin" />
    </div>
  );

  if (!session) return null;

  const { exam, candidateName, hallTicketNumber } = session;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 flex flex-col">

      {/* Top Header */}
      <header className="bg-[#E61E32] border-b border-[#d01729] shadow-xs shrink-0">
        <div className="max-w-3xl mx-auto px-6 md:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <img
              src="https://ik.imagekit.io/dypkhqxip/logotraining?updatedAt=1783099023149"
              alt="Redlix Secure"
              className="h-8 w-auto object-contain shrink-0"
            />
            <div className="min-w-0 border-l border-white/20 pl-3">
              <p className="text-white font-semibold text-sm font-inter leading-tight truncate">{exam.name}</p>
              <p className="text-white/75 text-xs truncate mt-0.5">{exam.company_name}</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xs border border-white/30 px-3 py-1 rounded-full text-white text-xs font-semibold shadow-xs shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Exam Open</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-7 flex flex-col gap-5">

        {/* Candidate Verified Card */}
        <div className="bg-white border border-zinc-200/90 rounded-xl shadow-xs px-5 py-3.5 flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-sm font-semibold text-zinc-900 font-inter">{candidateName}</p>
            <p className="text-[11px] font-mono text-zinc-500 mt-0.5">{hallTicketNumber}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Candidate Verified
          </span>
        </div>

        {/* Instructions Card */}
        <div className="bg-white border border-zinc-200/90 rounded-xl shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-[#E61E32]" />
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Instructions &amp; Guidelines</p>
          </div>
          <ul className="space-y-2.5">
            {INSTRUCTIONS.map((pt, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E61E32] shrink-0 mt-1.5" />
                {pt}
              </li>
            ))}
          </ul>
        </div>

        {/* Declaration & Begin Card */}
        <div className="bg-white border border-zinc-200/90 rounded-xl shadow-xs p-6 space-y-5">
          <label className="flex items-start gap-3 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#E61E32] cursor-pointer shrink-0 rounded"
            />
            <p className="text-xs text-zinc-700 leading-relaxed group-hover:text-zinc-900 transition-colors">
              I have read and understood all the instructions above. I agree to the exam rules and confirm that I am the registered candidate.
            </p>
          </label>

          <div className="flex items-center gap-4">
            {starting ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-t-[#E61E32] border-r-zinc-200 border-b-zinc-200 border-l-zinc-200 animate-spin" />
                <p className="text-xs text-zinc-600 font-medium">Starting your session...</p>
              </div>
            ) : (
              <>
                <button
                  onClick={handleBeginExam}
                  disabled={!agreed}
                  className={`px-6 py-2.5 text-xs font-semibold rounded-lg shadow-xs transition-all border-none ${
                    agreed
                      ? "bg-[#E61E32] hover:bg-[#d01729] text-white cursor-pointer"
                      : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                  }`}
                >
                  I&apos;m Ready — Begin Exam
                </button>
                <button onClick={() => router.back()} className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer underline underline-offset-2">
                  Go back
                </button>
              </>
            )}
          </div>
          {!agreed && (
            <p className="text-[11px] text-[#E61E32] font-medium">Accept the declaration above to enable the Begin button.</p>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200/90 bg-zinc-100 py-3.5 px-6 shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between text-xs text-zinc-500">
          <p className="font-medium">Powered by <span className="font-semibold text-zinc-800">Redlix Secure</span></p>
          <p className="font-mono text-zinc-400">{hallTicketNumber}</p>
        </div>
      </footer>
    </div>
  );
}
