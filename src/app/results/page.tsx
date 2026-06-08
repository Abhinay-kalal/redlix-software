"use client";

import { useState, useEffect } from "react";
import { QUESTIONS } from "@/app/exam-session/questions";

interface Exam {
  id: number;
  name: string;
  date: string;
  time: string;
  company_name: string;
  company_logo?: string;
  total_registered: number;
  total_attempted: number;
}

interface Candidate {
  id: number;
  candidate_name: string;
  hall_ticket_number: string;
  email: string;
  mcq_answered: number;
  coding_answered: number;
  attempted: boolean;
}

interface AnswerData {
  candidate_name: string;
  hall_ticket_number: string;
  email: string;
  exam_id: number;
  answers: Record<string | number, string>;
}

type View = "exams" | "candidates" | "answers";

export default function ResultsPage() {
  const [view, setView] = useState<View>("exams");
  const [exams, setExams] = useState<Exam[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [answerData, setAnswerData] = useState<AnswerData | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch exams on mount
  useEffect(() => {
    setLoading(true);
    fetch("/api/results?resource=exams")
      .then((r) => r.json())
      .then((d) => { if (d.success) setExams(d.data); })
      .finally(() => setLoading(false));
  }, []);

  const openExam = async (exam: Exam) => {
    setSelectedExam(exam);
    setView("candidates");
    setSearchQuery("");
    setLoading(true);
    const res = await fetch(`/api/results?resource=candidates&examId=${exam.id}`);
    const d = await res.json();
    if (d.success) setCandidates(d.data);
    setLoading(false);
  };

  const openCandidate = async (hallTicket: string) => {
    setView("answers");
    setLoading(true);
    const res = await fetch(`/api/results?resource=answers&hallTicket=${hallTicket}`);
    const d = await res.json();
    if (d.success) setAnswerData(d.data);
    setLoading(false);
  };

  const goBack = () => {
    if (view === "answers") { setView("candidates"); setAnswerData(null); }
    else if (view === "candidates") { setView("exams"); setSelectedExam(null); setCandidates([]); }
  };

  // MCQ and coding split from questions
  const MCQ_IDS    = QUESTIONS.filter((q) => q.type === "mcq").map((q) => q.id);
  const CODING_IDS = QUESTIONS.filter((q) => q.type === "coding").map((q) => q.id);

  const filteredCandidates = candidates.filter((c) =>
    c.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.hall_ticket_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900">

      {/* Top bar */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        {view !== "exams" && (
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-orange-600 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}
        <div className="flex items-center gap-2 ml-auto mr-auto">
          <img
            src="https://ik.imagekit.io/dypkhqxip/logo.png?updatedAt=1777320313623"
            alt="Redlix Secure"
            className="w-7 h-7 object-contain"
          />
          <span className="font-bold text-sm text-zinc-800 tracking-wide">Redlix Secure</span>
          <span className="text-zinc-300 mx-2">|</span>
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Results Portal</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">

        {/* ─── EXAMS VIEW ─────────────────────────────────── */}
        {view === "exams" && (
          <div className="space-y-8">
            {/* Hero logo */}
            <div className="flex flex-col items-center gap-4 mb-10">
              <img
                src="https://ik.imagekit.io/dypkhqxip/logo.png?updatedAt=1777320313623"
                alt="Redlix Secure"
                className="w-20 h-20 object-contain"
              />
              <div className="text-center">
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Examination Results</h1>
                <p className="text-sm text-zinc-500 mt-1">Select an exam to view candidate results</p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 rounded-full border-2 border-t-orange-500 border-zinc-200 animate-spin" />
              </div>
            ) : exams.length === 0 ? (
              <p className="text-center text-zinc-400 py-20">No exams found.</p>
            ) : (
              <div className="grid gap-4">
                {exams.map((exam) => (
                  <button
                    key={exam.id}
                    onClick={() => openExam(exam)}
                    className="w-full text-left bg-white border border-zinc-200 hover:border-orange-400 hover:shadow-md p-6 transition-all duration-200 group cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {exam.company_logo ? (
                          <img src={exam.company_logo} alt="" className="w-10 h-10 object-contain shrink-0" />
                        ) : (
                          <div className="w-10 h-10 bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 font-bold text-lg shrink-0">
                            {exam.company_name?.[0] ?? "E"}
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-0.5">{exam.company_name}</p>
                          <h2 className="text-base font-bold text-zinc-900 group-hover:text-orange-600 transition-colors">{exam.name}</h2>
                          <p className="text-xs text-zinc-500 mt-0.5">{exam.date} · {exam.time} IST</p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right space-y-1">
                        <div className="text-xs font-bold text-zinc-800">{exam.total_attempted} <span className="font-normal text-zinc-400">submitted</span></div>
                        <div className="text-xs text-zinc-400">{exam.total_registered} registered</div>
                        <div className={`text-[10px] font-bold px-2 py-0.5 border inline-block ${
                          exam.total_attempted > 0
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-zinc-50 text-zinc-400 border-zinc-200"
                        }`}>
                          {exam.total_attempted > 0 ? "Results Available" : "No Submissions"}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── CANDIDATES VIEW ────────────────────────────── */}
        {view === "candidates" && selectedExam && (
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">{selectedExam.company_name}</p>
              <h2 className="text-xl font-bold text-zinc-900 mt-0.5">{selectedExam.name}</h2>
              <p className="text-xs text-zinc-500 mt-1">
                Click a hall ticket number to view that candidate&apos;s answers
              </p>
            </div>

            {/* Search */}
            <input
              type="text"
              placeholder="Search by name or hall ticket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2.5 px-4 border border-zinc-200 bg-white text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 transition-all"
            />

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 rounded-full border-2 border-t-orange-500 border-zinc-200 animate-spin" />
              </div>
            ) : (
              <div className="bg-white border border-zinc-200 overflow-hidden">
                {/* Stats bar */}
                <div className="flex items-center gap-6 px-5 py-3 bg-zinc-50 border-b border-zinc-200 text-xs font-semibold text-zinc-500">
                  <span>Total: <strong className="text-zinc-800">{candidates.length}</strong></span>
                  <span>Submitted: <strong className="text-green-700">{candidates.filter(c => c.attempted).length}</strong></span>
                  <span>No Attempt: <strong className="text-red-600">{candidates.filter(c => !c.attempted).length}</strong></span>
                </div>

                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                      <th className="px-5 py-3 text-left">#</th>
                      <th className="px-5 py-3 text-left">Name</th>
                      <th className="px-5 py-3 text-left">Hall Ticket</th>
                      <th className="px-5 py-3 text-center">MCQ</th>
                      <th className="px-5 py-3 text-center">Coding</th>
                      <th className="px-5 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {filteredCandidates.map((c, i) => (
                      <tr
                        key={c.id}
                        className={`transition-colors ${c.attempted ? "hover:bg-orange-50/50 cursor-pointer" : "opacity-50"}`}
                        onClick={() => c.attempted && openCandidate(c.hall_ticket_number)}
                      >
                        <td className="px-5 py-3.5 text-xs text-zinc-400">{i + 1}</td>
                        <td className="px-5 py-3.5 font-semibold text-zinc-800 text-xs">{c.candidate_name}</td>
                        <td className="px-5 py-3.5">
                          {c.attempted ? (
                            <span className="font-mono text-xs font-bold text-orange-600 hover:underline cursor-pointer">
                              {c.hall_ticket_number}
                            </span>
                          ) : (
                            <span className="font-mono text-xs text-zinc-400">{c.hall_ticket_number}</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center text-xs font-mono">{c.mcq_answered}/30</td>
                        <td className="px-5 py-3.5 text-center text-xs font-mono">{c.coding_answered}/10</td>
                        <td className="px-5 py-3.5 text-right">
                          <span className={`text-[9px] font-bold px-2 py-0.5 border ${
                            c.attempted
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-zinc-50 text-zinc-400 border-zinc-200"
                          }`}>
                            {c.attempted ? "Submitted" : "Not Attempted"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredCandidates.length === 0 && (
                  <p className="text-center text-zinc-400 text-sm py-10">No candidates match your search.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── ANSWERS VIEW ───────────────────────────────── */}
        {view === "answers" && (
          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 rounded-full border-2 border-t-orange-500 border-zinc-200 animate-spin" />
              </div>
            ) : answerData ? (
              <>
                {/* Candidate header */}
                <div className="bg-white border border-zinc-200 p-6">
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Candidate Result</p>
                  <h2 className="text-xl font-bold text-zinc-900">{answerData.candidate_name}</h2>
                  <p className="text-xs text-zinc-500 mt-1 font-mono">{answerData.hall_ticket_number} · {answerData.email}</p>

                  {/* Score summary */}
                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-zinc-100">
                    {[
                      {
                        label: "MCQ Answered",
                        value: Object.entries(answerData.answers || {}).filter(([k, v]) =>
                          MCQ_IDS.includes(Number(k)) && v?.toString().trim()
                        ).length + " / " + MCQ_IDS.length,
                        color: "text-blue-700",
                      },
                      {
                        label: "Coding Answered",
                        value: Object.entries(answerData.answers || {}).filter(([k, v]) =>
                          CODING_IDS.includes(Number(k)) && v?.toString().trim()
                        ).length + " / " + CODING_IDS.length,
                        color: "text-purple-700",
                      },
                      {
                        label: "Total Attempted",
                        value: Object.entries(answerData.answers || {}).filter(([, v]) =>
                          v?.toString().trim()
                        ).length + " / " + (MCQ_IDS.length + CODING_IDS.length),
                        color: "text-orange-600",
                      },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MCQ Answers */}
                <div className="bg-white border border-zinc-200">
                  <div className="px-5 py-3 border-b border-zinc-100 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">Section A — MCQ Answers</h3>
                  </div>
                  <div className="p-5">
                    {(() => {
                      const mcqEntries = Object.entries(answerData.answers || {})
                        .filter(([k, v]) => MCQ_IDS.includes(Number(k)) && v?.toString().trim())
                        .sort((a, b) => Number(a[0]) - Number(b[0]));

                      if (mcqEntries.length === 0) {
                        return <p className="text-zinc-400 text-sm">No MCQ answers submitted.</p>;
                      }

                      return (
                        <div className="flex flex-wrap gap-2">
                          {mcqEntries.map(([id, val]) => {
                            const q = QUESTIONS.find((q) => q.id === Number(id));
                            return (
                              <div
                                key={id}
                                className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-3 py-1.5 text-xs"
                                title={q?.questionText?.slice(0, 120)}
                              >
                                <span className="text-zinc-400 font-mono">Q{id}</span>
                                <span className="font-bold text-zinc-800">{val.toString().trim().charAt(0)}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Coding Answers */}
                <div className="bg-white border border-zinc-200">
                  <div className="px-5 py-3 border-b border-zinc-100 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">Section B — Coding Answers</h3>
                  </div>
                  <div className="divide-y divide-zinc-100">
                    {(() => {
                      const codingEntries = Object.entries(answerData.answers || {})
                        .filter(([k, v]) => CODING_IDS.includes(Number(k)) && v?.toString().trim())
                        .sort((a, b) => Number(a[0]) - Number(b[0]));

                      if (codingEntries.length === 0) {
                        return <p className="text-zinc-400 text-sm p-5">No coding answers submitted.</p>;
                      }

                      return codingEntries.map(([id, val]) => {
                        const q = QUESTIONS.find((q) => q.id === Number(id));
                        return (
                          <div key={id} className="p-5">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5">Q{id}</span>
                              <p className="text-xs font-semibold text-zinc-700 truncate">{q?.questionText?.slice(0, 80)}...</p>
                            </div>
                            <pre className="text-xs bg-zinc-950 text-green-400 p-4 overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap">
                              {val.toString().trim()}
                            </pre>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-zinc-400 py-20">Failed to load answers.</p>
            )}
          </div>
        )}
      </main>

      <footer className="text-center text-[10px] text-zinc-400 py-6 border-t border-zinc-100 mt-10">
        © 2026 Redlix Secure · Examination Results Portal
      </footer>
    </div>
  );
}
