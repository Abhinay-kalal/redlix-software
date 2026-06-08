"use client";

import { useState, useEffect } from "react";
import { QUESTIONS } from "@/app/exam-session/questions";
import { ANSWER_KEY, gradeMCQ } from "@/app/exam-session/answerKey";
import { TEST_SUITE } from "@/app/exam-session/testCases";

// Seedable random number generator for deterministic shuffling
function seedRandom(seedStr: string) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function shuffleQuestions<T>(array: T[], seed: string): T[] {
  const rng = seedRandom(seed);
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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
  answers?: Record<string | number, string>;
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

  const [codingTestResults, setCodingTestResults] = useState<Record<number, { name: string; success: boolean; message: string }[] | null>>({});
  const [isEvaluatingCode, setIsEvaluatingCode] = useState(false);

  // Candidate lookup state variables
  const [lookupHallTicket, setLookupHallTicket] = useState("");
  const [searchedCandidate, setSearchedCandidate] = useState<Candidate | null>(null);
  const [searchedError, setSearchedError] = useState("");

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
    setLookupHallTicket("");
    setSearchedCandidate(null);
    setSearchedError("");
    setLoading(true);
    const res = await fetch(`/api/results?resource=candidates&examId=${exam.id}`);
    const d = await res.json();
    if (d.success) setCandidates(d.data);
    setLoading(false);
  };

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchedError("");
    setSearchedCandidate(null);

    const code = lookupHallTicket.trim().toUpperCase();
    if (!code) {
      setSearchedError("Please enter a hall ticket number.");
      return;
    }

    const found = candidates.find((c) => c.hall_ticket_number.trim().toUpperCase() === code);
    if (!found) {
      setSearchedError(`No candidate found with Hall Ticket Number: "${lookupHallTicket}" for this exam.`);
      return;
    }

    setSearchedCandidate(found);
  };

  const evaluateAllCodingChallenges = async (answers: Record<string | number, string>) => {
    setIsEvaluatingCode(true);
    const CODING_IDS = [101, 102, 103, 104, 105, 106, 107, 108, 109, 110];
    const resultsMap: Record<number, { name: string; success: boolean; message: string }[]> = {};

    // Mock Buffer for base64 / base64url encoding & decoding
    const BufferMock = {
      from: (data: any, encoding?: string) => {
        let internalStr = "";
        if (typeof data === "string") {
          if (encoding === "base64url" || encoding === "base64") {
            let b64 = data.replace(/-/g, "+").replace(/_/g, "/");
            while (b64.length % 4) b64 += "=";
            try {
              internalStr = decodeURIComponent(escape(atob(b64)));
            } catch {
              internalStr = data; // fallback
            }
          } else {
            internalStr = data;
          }
        } else {
          internalStr = String(data);
        }
        return {
          toString: (enc?: string) => {
            if (enc === "base64url" || enc === "base64") {
              const b64 = btoa(unescape(encodeURIComponent(internalStr)));
              if (enc === "base64url") {
                return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
              }
              return b64;
            }
            return internalStr;
          },
        };
      },
    };

    // Mock require('crypto') for JWT signing/verification
    const requireMock = (moduleName: string) => {
      if (moduleName === "crypto") {
        return {
          createHmac: (algorithm: string, key: string) => {
            let buffer = "";
            return {
              update: (data: string) => {
                buffer += data;
                return {
                  digest: (encoding?: string) => {
                    let hash = 0;
                    const combined = key + ":" + buffer;
                    for (let i = 0; i < combined.length; i++) {
                      hash = (hash << 5) - hash + combined.charCodeAt(i);
                      hash |= 0;
                    }
                    const signature = Math.abs(hash).toString(36);
                    if (encoding === "base64url" || encoding === "base64") {
                      const b64 = btoa(signature);
                      if (encoding === "base64url") {
                        return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
                      }
                      return b64;
                    }
                    return signature;
                  },
                };
              },
            };
          },
        };
      }
      throw new Error("Module not found: " + moduleName);
    };

    for (const qid of CODING_IDS) {
      const userCode = answers[qid] || "";
      if (!userCode.trim()) {
        resultsMap[qid] = [];
        continue;
      }

      try {
        const userFunc = new Function(
          "Buffer",
          "require",
          `
          ${userCode}
          return {
            debounce: typeof debounce !== 'undefined' ? debounce : null,
            deepDiff: typeof deepDiff !== 'undefined' ? deepDiff : null,
            promisePool: typeof promisePool !== 'undefined' ? promisePool : null,
            LRUCache: typeof LRUCache !== 'undefined' ? LRUCache : null,
            findBuildOrder: typeof findBuildOrder !== 'undefined' ? findBuildOrder : null,
            buildWhereClause: typeof buildWhereClause !== 'undefined' ? buildWhereClause : null,
            createStore: typeof createStore !== 'undefined' ? createStore : null,
            EventEmitter: typeof EventEmitter !== 'undefined' ? EventEmitter : null,
            signJWT: typeof signJWT !== 'undefined' ? signJWT : null,
            verifyJWT: typeof verifyJWT !== 'undefined' ? verifyJWT : null,
            validateSchema: typeof validateSchema !== 'undefined' ? validateSchema : null
          };
          `
        );

        const exports = userFunc(BufferMock, requireMock);
        const testCases = TEST_SUITE[qid] || [];
        const results: { name: string; success: boolean; message: string }[] = [];

        for (const tc of testCases) {
          try {
            const res = await tc.run(exports);
            results.push({
              name: tc.name,
              success: res.success,
              message: res.message,
            });
          } catch (err: any) {
            results.push({
              name: tc.name,
              success: false,
              message: err.message || "Runtime Error",
            });
          }
        }
        resultsMap[qid] = results;
      } catch (err: any) {
        resultsMap[qid] = [
          {
            name: "Compilation check",
            success: false,
            message: err.message || "Syntax Error",
          },
        ];
      }
    }

    setCodingTestResults(resultsMap);
    setIsEvaluatingCode(false);
  };

  const openCandidate = async (hallTicket: string) => {
    setView("answers");
    setLoading(true);
    setCodingTestResults({});
    const res = await fetch(`/api/results?resource=answers&hallTicket=${hallTicket}`);
    const d = await res.json();
    if (d.success) {
      setAnswerData(d.data);
      setLoading(false);
      // Run coding tests asynchronously in background
      await evaluateAllCodingChallenges(d.data.answers || {});
    } else {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (view === "answers") {
      setView("candidates");
      setAnswerData(null);
      setCodingTestResults({});
    }
    else if (view === "candidates") {
      setView("exams");
      setSelectedExam(null);
      setCandidates([]);
      setLookupHallTicket("");
      setSearchedCandidate(null);
      setSearchedError("");
    }
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
            ) : exams.filter((e) => e.total_attempted > 0).length === 0 ? (
              <p className="text-center text-zinc-400 py-20">No completed exams found.</p>
            ) : (
              <div className="grid gap-4">
                {exams.filter((e) => e.total_attempted > 0).map((exam) => (
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
                Enter a candidate&apos;s valid hall ticket number to show their result and paper they have attempted.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Candidate Result Lookup</h3>
              
              <form onSubmit={handleLookupSubmit} className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Enter Hall Ticket Number (e.g., 26AI123456)..."
                  value={lookupHallTicket}
                  onChange={(e) => setLookupHallTicket(e.target.value)}
                  className="flex-grow py-2.5 px-4 border border-zinc-200 bg-white text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 font-mono transition-all"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold tracking-wide transition-colors cursor-pointer"
                >
                  Verify & Show
                </button>
              </form>

              {searchedError && (
                <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 p-3 rounded animate-pulse">
                  {searchedError}
                </p>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-10">
                <div className="w-8 h-8 rounded-full border-2 border-t-orange-500 border-zinc-200 animate-spin" />
              </div>
            ) : searchedCandidate ? (
              (() => {
                const mcqScore = searchedCandidate.answers ? gradeMCQ(searchedCandidate.answers) : null;
                return (
                  <div className="bg-white border border-zinc-200 p-6 shadow-sm space-y-4">
                    <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
                      <div>
                        <h4 className="text-base font-bold text-zinc-900">{searchedCandidate.candidate_name}</h4>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">{searchedCandidate.hall_ticket_number} · {searchedCandidate.email}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 border ${
                        searchedCandidate.attempted
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-zinc-50 text-zinc-400 border-zinc-200"
                      }`}>
                        {searchedCandidate.attempted ? "Attempted" : "Not Attempted"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-zinc-50 border border-zinc-100 p-4 rounded text-center">
                        <p className="text-lg font-bold text-green-700 font-mono font-bold">
                          {searchedCandidate.attempted && mcqScore ? `${mcqScore.marksObtained} / 90 pts` : "0 / 90 pts"}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">MCQ Score</p>
                      </div>

                      <div className="bg-zinc-50 border border-zinc-100 p-4 rounded text-center">
                        <p className="text-lg font-bold text-purple-700 font-mono font-bold">
                          {searchedCandidate.attempted ? `${searchedCandidate.coding_answered} / 10` : "0 / 10"}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Coding Attempted</p>
                      </div>
                    </div>

                    {searchedCandidate.attempted ? (
                      <button
                        onClick={() => openCandidate(searchedCandidate.hall_ticket_number)}
                        className="w-full py-3 bg-zinc-900 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        View Full Response Sheet & Code Evaluator
                      </button>
                    ) : (
                      <p className="text-xs text-zinc-400 italic text-center py-2">
                        This candidate registered but did not save or submit any answers.
                      </p>
                    )}
                  </div>
                );
              })()
            ) : null}
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
              (() => {
                const mcqGraded = gradeMCQ(answerData.answers || {});
                
                // Shuffle MCQs using the candidate's hall ticket number
                const assignedMCQs = shuffleQuestions(
                  QUESTIONS.filter((q) => q.type === "mcq"),
                  answerData.hall_ticket_number
                ).slice(0, 30);

                // Shuffle Coding using candidate's hall ticket number + "-B"
                const assignedCoding = shuffleQuestions(
                  QUESTIONS.filter((q) => q.type === "coding"),
                  answerData.hall_ticket_number + "-B"
                );

                // Calculate Coding marks dynamically based on codingTestResults state
                let codingMarks = 0;
                let codingPassedCount = 0;
                let codingTotalTestCases = 0;
                let codingAttemptedQns = 0;

                for (const q of assignedCoding) {
                  const code = answerData.answers[q.id] || "";
                  if (code.trim()) {
                    codingAttemptedQns++;
                    const results = codingTestResults[q.id];
                    if (results && results.length > 0) {
                      const passed = results.filter((r) => r.success).length;
                      const total = results.length;
                      codingPassedCount += passed;
                      codingTotalTestCases += total;
                      codingMarks += (passed / total) * 10;
                    }
                  }
                }

                const roundedCodingMarks = Math.round(codingMarks * 10) / 10;
                const mcqMarks = mcqGraded.marksObtained;
                const totalMarks = mcqMarks + roundedCodingMarks;
                
                // Determine Grade
                let gradeName = "Fail";
                let gradeColor = "bg-red-50 text-red-700 border-red-200";
                if (totalMarks >= 150) {
                  gradeName = "Distinction";
                  gradeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                } else if (totalMarks >= 114) {
                  gradeName = "First Class";
                  gradeColor = "bg-blue-50 text-blue-700 border-blue-200";
                } else if (totalMarks >= 75) {
                  gradeName = "Pass";
                  gradeColor = "bg-amber-50 text-amber-700 border-amber-200";
                }

                return (
                  <>
                    {/* Candidate header & Score Card */}
                    <div className="bg-white border border-zinc-200 p-6 shadow-sm">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-1">Candidate Result</p>
                          <h2 className="text-xl font-bold text-zinc-900">{answerData.candidate_name}</h2>
                          <p className="text-xs text-zinc-500 mt-1 font-mono">{answerData.hall_ticket_number} · {answerData.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-extrabold uppercase px-3 py-1 border rounded-full ${gradeColor}`}>
                            {gradeName}
                          </span>
                        </div>
                      </div>

                      {/* Score summary grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-zinc-100">
                        <div className="bg-zinc-50 border border-zinc-100 p-4 text-center">
                          <p className="text-2xl font-black text-orange-600 font-mono font-bold">
                            {isEvaluatingCode ? (
                              <span className="animate-pulse">Evaluating...</span>
                            ) : (
                              `${totalMarks} / 190`
                            )}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">Overall Score</p>
                        </div>

                        <div className="bg-zinc-50 border border-zinc-100 p-4 text-center">
                          <p className="text-2xl font-black text-blue-700 font-mono font-bold">
                            {mcqMarks} / 90
                          </p>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">MCQ Score ({mcqGraded.correct} / 30 Correct)</p>
                        </div>

                        <div className="bg-zinc-50 border border-zinc-100 p-4 text-center">
                          <p className="text-2xl font-black text-purple-700 font-mono font-bold">
                            {isEvaluatingCode ? (
                              <span className="text-xs text-zinc-400 font-normal">Running Sandbox...</span>
                            ) : (
                              `${roundedCodingMarks} / 100`
                            )}
                          </p>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">
                            Coding Score ({codingPassedCount} / {codingTotalTestCases} Tests)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Section A — MCQ Answers */}
                    <div className="bg-white border border-zinc-200 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">Section A — MCQ Answers (30 Assigned Questions)</h3>
                        </div>
                        <span className="text-[10px] font-semibold text-zinc-500">Marks: +3 for Correct, 0 for Wrong/Unattempted</span>
                      </div>
                      
                      <div className="divide-y divide-zinc-100">
                        {assignedMCQs.map((q, idx) => {
                          const selected = answerData.answers[q.id]?.toString().trim().charAt(0).toUpperCase() || "";
                          const correct = ANSWER_KEY[q.id];
                          const isCorrect = selected === correct;
                          const isAttempted = selected !== "";

                          return (
                            <div key={q.id} className="p-5 hover:bg-zinc-50/30 transition-colors">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 font-mono">
                                      Q{idx + 1} (ID: {q.id})
                                    </span>
                                    {isAttempted ? (
                                      isCorrect ? (
                                        <span className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5">
                                          Correct (+3 pts)
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-bold bg-red-50 text-red-700 border border-red-200 px-2 py-0.5">
                                          Incorrect (0 pts)
                                        </span>
                                      )
                                    ) : (
                                      <span className="text-[10px] font-bold bg-zinc-100 text-zinc-500 border border-zinc-200 px-2 py-0.5">
                                        Unattempted (0 pts)
                                      </span>
                                    )}
                                  </div>
                                  <pre className="text-sm font-semibold text-zinc-800 whitespace-pre-wrap font-sans mt-2">{q.questionText}</pre>
                                </div>
                              </div>

                              {/* Options */}
                              {q.options && (
                                <div className="grid grid-cols-1 gap-2 mt-3 pl-2">
                                  {q.options.map((opt) => {
                                    const optLetter = opt.trim().charAt(0).toUpperCase();
                                    const isOptCorrect = optLetter === correct;
                                    const isOptSelected = optLetter === selected;

                                    let optClass = "border-zinc-200 bg-white text-zinc-700";
                                    let badge = null;

                                    if (isOptCorrect) {
                                      optClass = "border-green-300 bg-green-50 text-green-800 font-medium";
                                    }
                                    if (isOptSelected) {
                                      if (isCorrect) {
                                        optClass = "border-green-500 bg-green-50 text-green-800 font-bold shadow-sm";
                                        badge = (
                                          <span className="ml-auto text-xs font-bold text-green-600 flex items-center gap-1">
                                            ✅ Candidate Selected
                                          </span>
                                        );
                                      } else {
                                        optClass = "border-red-400 bg-red-50 text-red-800 font-bold shadow-sm";
                                        badge = (
                                          <span className="ml-auto text-xs font-bold text-red-600 flex items-center gap-1">
                                            ❌ Candidate Selected
                                          </span>
                                        );
                                      }
                                    }

                                    return (
                                      <div
                                        key={opt}
                                        className={`flex items-center px-4 py-2.5 border text-xs transition-colors rounded ${optClass}`}
                                      >
                                        <span>{opt}</span>
                                        {badge}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Section B — Coding Answers */}
                    <div className="bg-white border border-zinc-200 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">Section B — Coding Answers (10 Challenges)</h3>
                        </div>
                        <span className="text-[10px] font-semibold text-zinc-500">Marks: up to 10 per question based on unit tests</span>
                      </div>

                      <div className="divide-y divide-zinc-100">
                        {assignedCoding.map((q, idx) => {
                          const code = answerData.answers[q.id] || "";
                          const isAttempted = code.trim().length > 0;
                          const tests = codingTestResults[q.id];

                          let qMarks = 0;
                          let passed = 0;
                          let total = 0;
                          if (isAttempted && tests && tests.length > 0) {
                            passed = tests.filter((r) => r.success).length;
                            total = tests.length;
                            qMarks = Math.round((passed / total) * 100) / 10;
                          }

                          return (
                            <div key={q.id} className="p-6">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 font-mono">
                                      Challenge {idx + 1} (ID: {q.id})
                                    </span>
                                    {isAttempted ? (
                                      <span className={`text-[10px] font-bold px-2 py-0.5 border ${
                                        qMarks === 10
                                          ? "bg-green-50 text-green-700 border-green-200"
                                          : qMarks > 0
                                          ? "bg-amber-50 text-amber-700 border-amber-200"
                                          : "bg-red-50 text-red-700 border-red-200"
                                      }`}>
                                        {isEvaluatingCode ? "Evaluating..." : `${qMarks} / 10 Marks`}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-bold bg-zinc-100 text-zinc-400 border border-zinc-200 px-2 py-0.5">
                                        Not Attempted
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-sm font-bold text-zinc-800 mt-2">{q.questionText.split("\n")[0]}</h4>
                                </div>
                              </div>

                              {isAttempted ? (
                                <div className="space-y-4">
                                  {/* Code block view */}
                                  <div className="border border-zinc-200 rounded overflow-hidden">
                                    <div className="bg-zinc-800 px-4 py-2 border-b border-zinc-700 flex items-center justify-between">
                                      <span className="text-[10px] text-zinc-400 font-mono font-bold">submitted_solution.js</span>
                                      <span className="text-[10px] text-zinc-500 font-mono">{code.length} chars</span>
                                    </div>
                                    <pre className="text-xs bg-zinc-950 text-green-400 p-4 overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap">
                                      {code.trim()}
                                    </pre>
                                  </div>

                                  {/* Test suite panel */}
                                  <div className="bg-zinc-50 border border-zinc-200 rounded p-4">
                                    <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Test Suite Results</h5>
                                    
                                    {isEvaluatingCode ? (
                                      <div className="space-y-2 py-2">
                                        <div className="h-4 bg-zinc-200 animate-pulse w-3/4 rounded" />
                                        <div className="h-4 bg-zinc-200 animate-pulse w-1/2 rounded" />
                                      </div>
                                    ) : tests && tests.length > 0 ? (
                                      <div className="space-y-3">
                                        {tests.map((t, tIdx) => (
                                          <div key={tIdx} className="flex items-start gap-2 text-xs">
                                            {t.success ? (
                                              <span className="text-green-600 shrink-0 font-bold font-semibold">✅</span>
                                            ) : (
                                              <span className="text-red-500 shrink-0 font-bold font-semibold">❌</span>
                                            )}
                                            <div className="space-y-0.5">
                                              <p className="font-semibold text-zinc-800">{t.name}</p>
                                              <p className={`text-[10px] ${t.success ? "text-green-600" : "text-red-500 font-mono bg-red-50/50 px-2 py-0.5 border border-red-100 rounded inline-block"}`}>
                                                {t.message}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-zinc-400 italic">No tests executed.</p>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="border border-dashed border-zinc-200 bg-zinc-50 p-4 text-center rounded text-xs text-zinc-400">
                                  No code submitted.
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                );
              })()
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
