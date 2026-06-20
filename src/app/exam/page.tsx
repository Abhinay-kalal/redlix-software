"use client";

import { useState, useEffect, useRef } from "react";
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


function parseExamDateTime(date: string, time: string): Date | null {
  try {
    const dateStr = date.split("T")[0];
    const combined = `${dateStr}T${to24h(time)}:00`;
    const d = new Date(combined);
    return isNaN(d.getTime()) ? null : d;
  } catch { return null; }
}

function to24h(t: string): string {
  const match = t.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return t;
  let h = parseInt(match[1]);
  const m = match[2];
  const period = match[3]?.toUpperCase();
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "00")}:${m}`;
}

function formatCountdown(ms: number) {
  if (ms <= 0) return { h: "00", m: "00", s: "00", total: 0 };
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return {
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
    total,
  };
}

const POLL_INTERVAL = 5; // seconds

export default function ExamPage() {
  const router = useRouter();
  const [session, setSession] = useState<ExamSession | null>(null);
  const [loading, setLoading] = useState(true);

  const [countdown, setCountdown] = useState({ h: "00", m: "00", s: "00", total: -1 });
  const examTarget = useRef<Date | null>(null);

  const [isStarted, setIsStarted] = useState(false);
  const [nextCheck, setNextCheck] = useState(POLL_INTERVAL);
  const [isChecking, setIsChecking] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load session from storage
  useEffect(() => {
    const raw = sessionStorage.getItem("exam_session");
    if (!raw) { router.replace("/exam-login"); return; }
    try {
      const parsed: ExamSession = JSON.parse(raw);
      if (parsed.hallTicketNumber && localStorage.getItem(`exam_violated_${parsed.hallTicketNumber}`)) {
        router.replace("/exam-session");
        return;
      }
      setSession(parsed);
      examTarget.current = parseExamDateTime(parsed.exam.date, parsed.exam.time);
    } catch { router.replace("/exam-login"); }
    finally { setLoading(false); }
  }, [router]);

  // Countdown to exam scheduled time
  useEffect(() => {
    if (!session) return;
    const tick = () => {
      if (!examTarget.current) return;
      const diff = examTarget.current.getTime() - Date.now();
      setCountdown(formatCountdown(diff));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session]);

  // Poll /api/exam/status every 5 seconds
  useEffect(() => {
    if (!session) return;

    const checkStatus = async () => {
      setIsChecking(true);
      try {
        const res = await fetch(`/api/exam/status?examId=${session.exam.id}`);
        const data = await res.json();
        if (data.success) {
          setIsStarted(data.isStarted ?? false);
        }
      } catch {
        // Network error — silently retry next cycle
      } finally {
        setIsChecking(false);
        setNextCheck(POLL_INTERVAL);
      }
    };

    // Run immediately on mount
    checkStatus();

    // Poll every 5 seconds
    pollRef.current = setInterval(checkStatus, POLL_INTERVAL * 1000);

    // Tick down the "next check in Xs" counter every second
    tickRef.current = setInterval(() => {
      setNextCheck((prev) => (prev <= 1 ? POLL_INTERVAL : prev - 1));
    }, 1000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [session]);

  if (loading) return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-sans">
      <div className="w-10 h-10 rounded-full border-2 border-t-orange-500 border-r-zinc-200 border-b-zinc-200 border-l-zinc-200 animate-spin" />
    </div>
  );
  if (!session) return null;

  const { exam, candidateName, hallTicketNumber, registrationNumber, photoUrl } = session;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 flex flex-col">

      {}
      <header className="bg-orange-500 border-b border-orange-600 shadow-sm shrink-0">
        <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between gap-4">
          {}
          <div className="flex items-center gap-4 min-w-0">
            {exam.company_logo
              ? <img src={exam.company_logo} alt={exam.company_name} className="w-10 h-10 object-contain rounded-none shrink-0" />
              : <img src="https://ik.imagekit.io/dypkhqxip/redlix%20new?updatedAt=1781042212493" alt="Redlix Secure" className="w-10 h-10 object-contain shrink-0" />
            }
            <div className="min-w-0">
              <p className="text-white font-bold text-base leading-tight truncate">{exam.name}</p>
              <p className="text-orange-100 text-xs font-medium truncate mt-0.5">{exam.company_name}</p>
            </div>
          </div>

          {}
          <div className="shrink-0 text-right">
            {isStarted ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-white text-xs font-bold">Exam Open</p>
              </div>
            ) : !isStarted && countdown.total > 0 ? (
              <div>
                <p className="text-orange-200 text-[9px] font-bold uppercase tracking-widest mb-1">Starts in</p>
                <p className="text-white font-bold text-xl tabular-nums tracking-tight">
                  {countdown.h}<span className="text-orange-200 mx-0.5">:</span>{countdown.m}<span className="text-orange-200 mx-0.5">:</span>{countdown.s}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isChecking ? "bg-yellow-300 animate-ping" : "bg-orange-300 animate-pulse"}`} />
                  <p className="text-orange-100 text-xs font-medium">Waiting for admin</p>
                </div>
                <p className="text-orange-200 text-[10px] tabular-nums">
                  {isChecking ? "Checking..." : `Next check in ${nextCheck}s`}
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      {}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 flex flex-col gap-8">

        {}
        <div className="bg-white border border-zinc-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-5">
          {photoUrl && (
            <img src={photoUrl} alt={candidateName} className="w-16 h-20 object-cover border border-zinc-300 shrink-0" />
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-3 flex-1">
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Candidate Name</p>
              <p className="text-sm font-semibold text-zinc-800 mt-0.5">{candidateName}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Hall Ticket No.</p>
              <p className="text-sm font-mono font-semibold text-zinc-800 mt-0.5">{hallTicketNumber}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Registration No.</p>
              <p className="text-sm font-mono font-semibold text-zinc-800 mt-0.5">{registrationNumber}</p>
            </div>
          </div>
        </div>

        {}
        {isStarted && (
          <div className="bg-orange-50 border border-orange-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
              <div>
                <p className="text-sm font-bold text-zinc-900">Exam is now open</p>
                <p className="text-xs text-zinc-500 mt-0.5">The administrator has enabled access. You may begin.</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/exam-ready")}
              className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-none shadow-sm transition-colors cursor-pointer shrink-0"
            >
              Start Exam →
            </button>
          </div>
        )}

      </main>

      {}
      <footer className="border-t border-zinc-200 bg-white py-3 px-6 shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <p className="text-[10px] text-zinc-400">Powered by <span className="font-semibold text-zinc-600">Redlix Secure</span></p>
          <p className="text-[10px] text-zinc-400 font-mono">{hallTicketNumber}</p>
        </div>
      </footer>
    </div>
  );
}
