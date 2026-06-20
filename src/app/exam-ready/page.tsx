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
    try {
      const parsed = JSON.parse(raw);
      if (parsed.hallTicketNumber && localStorage.getItem(`exam_violated_${parsed.hallTicketNumber}`)) {
        router.replace("/exam-session");
        return;
      }
      setSession(parsed);
    }
    catch { router.replace("/exam-login"); }
    finally { setLoading(false); }
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
      <div className="w-10 h-10 rounded-full border-2 border-t-orange-500 border-r-zinc-200 border-b-zinc-200 border-l-zinc-200 animate-spin" />
    </div>
  );

  if (!session) return null;

  const { exam, candidateName, hallTicketNumber } = session;

  return (
    <div className="min-h-screen bg-zinc-100 font-sans text-zinc-900 flex flex-col">

      {}
      <header className="bg-orange-500 border-b border-orange-600 shadow-sm shrink-0">
        <div className="max-w-3xl mx-auto px-8 py-5 flex items-center gap-4">
          {exam.company_logo
            ? <img src={exam.company_logo} alt={exam.company_name} className="w-10 h-10 object-contain shrink-0" />
            : <img src="https://ik.imagekit.io/dypkhqxip/redlix%20new?updatedAt=1781042212493" alt="Redlix Secure" className="w-10 h-10 object-contain shrink-0" />
          }
          <div>
            <p className="text-white font-bold text-base">{exam.name}</p>
            <p className="text-orange-100 text-xs">{exam.company_name}</p>
          </div>
        </div>
      </header>

      {}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-8 flex flex-col gap-5">

        {}
        <div className="bg-white border border-zinc-200 shadow-sm px-5 py-3 flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs font-semibold text-zinc-800">{candidateName}</p>
            <p className="text-[10px] font-mono text-orange-600">{hallTicketNumber}</p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5">
            Candidate Verified
          </span>
        </div>

        {}
        <div className="bg-white border border-zinc-200 shadow-sm p-5 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Instructions &amp; Guidelines</p>
          <ul className="space-y-2">
            {INSTRUCTIONS.map((pt, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-zinc-700">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 mt-1.5" />
                {pt}
              </li>
            ))}
          </ul>
        </div>

        {}
        <div className="bg-white border border-zinc-200 shadow-sm p-5 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-orange-500 cursor-pointer shrink-0"
            />
            <p className="text-xs text-zinc-700 leading-relaxed">
              I have read and understood all the instructions above. I agree to the exam rules and confirm that I am the registered candidate.
            </p>
          </label>

          <div className="flex items-center gap-4">
            {starting ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-t-orange-500 border-r-zinc-200 border-b-zinc-200 border-l-zinc-200 animate-spin" />
                <p className="text-sm text-zinc-600 font-medium">Starting your session...</p>
              </div>
            ) : (
              <>
                <button
                  onClick={handleBeginExam}
                  disabled={!agreed}
                  className={`px-7 py-2.5 text-sm font-bold rounded-none shadow-sm transition-all border-none cursor-pointer ${
                    agreed ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                  }`}
                >
                  I&apos;m Ready — Begin Exam
                </button>
                <button onClick={() => router.back()} className="text-xs text-zinc-400 hover:text-zinc-600 underline cursor-pointer">
                  Go back
                </button>
              </>
            )}
          </div>
          {!agreed && (
            <p className="text-[10px] text-orange-600">Accept the declaration above to enable the Begin button.</p>
          )}
        </div>

      </main>

      {}
      <footer className="border-t border-zinc-200 bg-white py-3 px-6 shrink-0">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <p className="text-[10px] text-zinc-400">Powered by <span className="font-semibold text-zinc-600">Redlix Secure</span></p>
          <p className="text-[10px] text-zinc-400 font-mono">{hallTicketNumber}</p>
        </div>
      </footer>
    </div>
  );
}
