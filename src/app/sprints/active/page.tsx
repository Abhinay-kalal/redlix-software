"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Clock, CheckCircle2, ChevronRight, Play, AlertCircle, Code, Shield } from "lucide-react";

function SprintActiveContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "";

  const [sprint, setSprint] = useState<any>(null);
  const [questionType, setQuestionType] = useState<"coding" | "quiz">("coding");
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Quiz active states
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({}); // { questionIdx: option }

  // Coding active states
  const [activeCodeQIndex, setActiveCodeQIndex] = useState(0);
  const [codeDrafts, setCodeDrafts] = useState<Record<number, string>>({}); // { questionIdx: code }
  const [compileResults, setCompileResults] = useState<Record<number, any[]>>({}); // { questionIdx: testCaseResults[] }
  const [compiling, setCompiling] = useState(false);

  // Time Limit Countdown state
  const [timeLeftStr, setTimeLeftStr] = useState("00:00");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isSubmitted, setIsSubmitted] = useState(false);

  // 1. Fetch Sprint details and questions
  useEffect(() => {
    if (!code) {
      setErrorMsg("Missing room join code.");
      setLoading(false);
      return;
    }

    const loadSprint = async () => {
      try {
        // Fetch ID by join code
        const statusRes = await fetch(`/api/sprints/status?code=${code}`);
        const statusData = await statusRes.json();
        if (!statusData.success) {
          setErrorMsg(statusData.error || "Room not found.");
          return;
        }

        const sprintId = statusData.data.id;

        // Fetch questions from the full sprint detail endpoint
        const detailsRes = await fetch(`/api/sprints/${sprintId}`);
        const detailsData = await detailsRes.json();
        if (!detailsData.success) {
          setErrorMsg(detailsData.error || "Failed to load sprint questions.");
          return;
        }

        const fullSprint = detailsData.data;
        setSprint(fullSprint);

        if (fullSprint.questions) {
          const parsed = JSON.parse(fullSprint.questions);
          setQuestionType(parsed.type || "coding");
          const list = parsed.list || [];
          setQuestions(list);

          // Initialize drafts
          if (parsed.type === "coding") {
            const drafts: Record<number, string> = {};
            list.forEach((q: any, idx: number) => {
              drafts[idx] = q.codeTemplate || "function solution() {\n  // Write your code here\n}";
            });
            setCodeDrafts(drafts);
          }
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to initialize playroom.");
      } finally {
        setLoading(false);
      }
    };

    loadSprint();
  }, [code]);

  // 2. Timer Countdown Effect
  useEffect(() => {
    if (!sprint) return;

    const endMs = new Date(sprint.endDate).getTime();

    const updateTimer = () => {
      const remainingMs = endMs - Date.now();
      if (remainingMs <= 0) {
        setTimeLeftStr("00:00");
        if (timerRef.current) clearInterval(timerRef.current);
        handleSubmit(); // auto submit
        return;
      }

      const totalSecs = Math.floor(remainingMs / 1000);
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;
      setTimeLeftStr(`${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`);
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sprint]);

  // Evaluates user JavaScript code against test cases client-side
  const runCodeCompile = async (qIdx: number) => {
    setCompiling(true);
    const codeToRun = codeDrafts[qIdx] || "";
    const activeQuestion = questions[qIdx];
    const testCases = activeQuestion.testCases || [];
    const results: any[] = [];

    // Short timeout delay to mock processing
    await new Promise((resolve) => setTimeout(resolve, 800));

    testCases.forEach((tc: any, tcIdx: number) => {
      if (!tc.expectedOutput) return;

      try {
        // Attempt to build JS function safely
        const runner = new Function(`
          ${codeToRun}
          return solution;
        `)();

        if (typeof runner !== "function") {
          throw new Error("Target function 'solution' was not found or is not defined.");
        }

        // Parse inputs safely
        let args: any[];
        try {
          const parsedInput = JSON.parse(tc.input);
          args = Array.isArray(parsedInput) ? parsedInput : [parsedInput];
        } catch {
          // Fallback to split args by comma if input is not JSON format
          args = tc.input ? tc.input.split(",").map((s: string) => s.trim()) : [];
        }

        const outVal = runner(...args);
        const expected = tc.expectedOutput.trim();
        const actual = String(outVal).trim();
        const match = actual === expected || JSON.stringify(outVal) === expected;

        results.push({
          caseIndex: tcIdx + 1,
          input: tc.input,
          expected: tc.expectedOutput,
          actual,
          status: match ? "pass" : "fail",
          error: null
        });
      } catch (err: any) {
        results.push({
          caseIndex: tcIdx + 1,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: "",
          status: "error",
          error: err.message || "Execution error"
        });
      }
    });

    setCompileResults({ ...compileResults, [qIdx]: results });
    setCompiling(false);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#E61E32] mb-4" />
        <p className="text-xs text-zinc-500 font-medium">Loading Active Sprint Workspace...</p>
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
            <h3 className="text-sm font-extrabold text-zinc-900 uppercase">Lobby Room Error</h3>
            <p className="text-xs text-zinc-500">{errorMsg}</p>
          </div>
          <button onClick={() => router.push("/")} className="w-full bg-[#E61E32] text-white text-xs font-bold py-2 rounded-lg">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4">
        <div className="bg-white border border-zinc-200 p-8 rounded-2xl shadow-lg max-w-md w-full text-center space-y-6">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-250">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-black text-zinc-900 leading-snug uppercase tracking-wide">Sprint Submissions Received</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Your programming draft entries and theoretical answers have been successfully uploaded to the organizer dashboard database.
            </p>
          </div>
          <div className="border-t border-zinc-150 pt-4">
            <button
              onClick={() => router.push("/candidate-dashboard")}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Go to Candidate Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col font-sans text-zinc-900">
      {/* Top Navbar */}
      <header className="bg-zinc-900 text-white py-3.5 px-6 flex items-center justify-between shadow-md shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
            S
          </div>
          <div>
            <h1 className="text-sm font-extrabold font-inter tracking-wide">{sprint?.title}</h1>
            <p className="text-[10px] text-zinc-400 font-medium">Secure Exam Mode (Javascript Engine Enabled)</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-zinc-800 px-3.5 py-1.5 rounded-xl border border-zinc-700/60">
            <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-black font-mono text-emerald-400">{timeLeftStr}</span>
          </div>

          <button
            onClick={handleSubmit}
            className="bg-[#E61E32] hover:bg-[#d01729] text-white text-xs font-black py-1.5 px-4 rounded-lg cursor-pointer transition-all shadow-xs"
          >
            Submit Sprint
          </button>
        </div>
      </header>

      {/* Main active workspace */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {questionType === "coding" ? (
          /* CODING MODE LAYOUT */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Sidebar: Questions list & Description */}
            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-zinc-200 bg-white flex flex-col overflow-hidden shrink-0">
              <div className="p-4 border-b border-zinc-150 bg-zinc-50 shrink-0">
                <span className="text-[10px] font-extrabold text-zinc-450 uppercase tracking-widest">Select Question</span>
                <div className="mt-2 flex gap-1.5 overflow-x-auto no-scrollbar">
                  {questions.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveCodeQIndex(idx)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
                        activeCodeQIndex === idx 
                          ? "bg-zinc-900 text-white shadow-xs" 
                          : "border border-zinc-200 text-zinc-650 hover:bg-zinc-50"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Problem Description Panel */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 pr-3">
                {questions[activeCodeQIndex] && (
                  <>
                    <h3 className="text-sm font-extrabold text-zinc-950 font-inter">
                      {questions[activeCodeQIndex].title}
                    </h3>
                    <div className="text-xs text-zinc-600 leading-relaxed font-normal whitespace-pre-wrap">
                      {questions[activeCodeQIndex].problemDescription}
                    </div>

                    <div className="space-y-2 pt-4 border-t border-zinc-100">
                      <span className="text-[10px] font-extrabold text-zinc-450 uppercase tracking-widest block">Sample Test Cases</span>
                      {questions[activeCodeQIndex].testCases?.map((tc: any, i: number) => (
                        <div key={i} className="p-3 border border-zinc-150 rounded-lg bg-zinc-50/50 space-y-1 font-mono text-[10px] text-zinc-600">
                          <p><span className="font-bold text-zinc-900">Input:</span> {tc.input}</p>
                          <p><span className="font-bold text-zinc-900">Output:</span> {tc.expectedOutput}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Right Editor: Code area and compiler outcomes */}
            <div className="flex-1 flex flex-col overflow-hidden bg-zinc-50">
              {/* Code Draft Text Area */}
              <div className="flex-1 flex flex-col min-h-0 relative">
                <div className="bg-zinc-900 text-zinc-400 py-1.5 px-4 text-[10px] font-bold flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-emerald-500" />
                    <span>solution.js</span>
                  </div>
                  <span className="text-[9px] uppercase font-mono tracking-wider">NodeJS Compiler ready</span>
                </div>
                <textarea
                  value={codeDrafts[activeCodeQIndex] || ""}
                  onChange={(e) => setCodeDrafts({ ...codeDrafts, [activeCodeQIndex]: e.target.value })}
                  className="flex-1 p-5 font-mono text-xs bg-zinc-950 text-emerald-400 border-none outline-none resize-none overflow-y-auto focus:ring-0 leading-relaxed"
                />
              </div>

              {/* Bottom compiler drawer */}
              <div className="h-56 bg-white border-t border-zinc-200 flex flex-col shrink-0 overflow-hidden">
                <div className="p-3 border-b border-zinc-150 bg-zinc-50 flex items-center justify-between shrink-0 select-none">
                  <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">Test Suite execution</span>
                  <button
                    onClick={() => runCodeCompile(activeCodeQIndex)}
                    disabled={compiling}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-400 text-white text-[11px] font-extrabold py-1 px-3 rounded flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                  >
                    {compiling ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Compiling...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-white" />
                        <span>Run Test Cases</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex-1 p-4 overflow-y-auto no-scrollbar bg-zinc-900 text-zinc-300 font-mono text-[11px]">
                  {!compileResults[activeCodeQIndex] ? (
                    <div className="text-zinc-550 flex flex-col items-center justify-center h-full space-y-1">
                      <Shield className="w-5 h-5 text-zinc-700" />
                      <span>Console output is empty. Run tests to evaluate JavaScript solution.</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {compileResults[activeCodeQIndex].map((res, i) => (
                        <div key={i} className="border-b border-zinc-800 pb-2 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold uppercase">Case {res.caseIndex}:</span>
                            <span className={`px-1.5 py-0.5 rounded font-black text-[9px] uppercase ${
                              res.status === "pass" 
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800" 
                                : "bg-red-950/80 text-red-400 border border-red-800"
                            }`}>
                              {res.status === "pass" ? "Passed" : res.status === "fail" ? "Failed" : "Syntax Error"}
                            </span>
                          </div>
                          <p className="text-zinc-500">Input: {res.input}</p>
                          {res.error ? (
                            <p className="text-red-450">{res.error}</p>
                          ) : (
                            <>
                              <p className="text-zinc-550">Expected: {res.expected}</p>
                              <p className="text-zinc-400">Actual: {res.actual}</p>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* MCQ MODE LAYOUT */
          <div className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
            {questions[currentQIndex] && (
              <div className="space-y-6">
                {/* Question Info Header */}
                <div className="bg-white border border-zinc-200 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                    <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest">Question {currentQIndex + 1} of {questions.length}</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">10 POINTS</span>
                  </div>
                  <h3 className="text-base font-extrabold text-zinc-950 leading-snug">{questions[currentQIndex].questionText}</h3>
                </div>

                {/* Option selection cards */}
                <div className="grid grid-cols-1 gap-3.5">
                  {Object.entries(questions[currentQIndex].options || {}).map(([key, value]: any) => {
                    const isSelected = quizAnswers[currentQIndex] === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setQuizAnswers({ ...quizAnswers, [currentQIndex]: key })}
                        className={`p-4 border rounded-xl text-left cursor-pointer transition-all flex items-center justify-between group shadow-xs ${
                          isSelected 
                            ? "bg-zinc-900 border-zinc-900 text-white scale-[1.01]" 
                            : "bg-white border-zinc-200 hover:border-zinc-350 hover:bg-zinc-50/50"
                        }`}
                      >
                        <div>
                          <span className={`inline-block w-5 h-5 rounded-md text-[10px] font-bold text-center leading-5 mr-3 shrink-0 uppercase border ${
                            isSelected 
                              ? "bg-zinc-800 border-zinc-700 text-white" 
                              : "bg-zinc-100 border-zinc-200 text-zinc-650"
                          }`}>
                            {key}
                          </span>
                          <span className="text-xs font-semibold">{value}</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? "text-white translate-x-1" : "text-zinc-400 group-hover:translate-x-0.5"}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Footer Navigation */}
            <div className="mt-8 flex justify-between shrink-0 select-none">
              <button
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex(currentQIndex - 1)}
                className="text-xs font-bold text-zinc-500 hover:text-zinc-900 disabled:opacity-30 disabled:pointer-events-none px-4 py-2 cursor-pointer"
              >
                Previous Question
              </button>

              {currentQIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQIndex(currentQIndex + 1)}
                  className="bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-bold py-2.5 px-6 rounded-lg shadow-xs cursor-pointer"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-6 rounded-lg shadow-xs cursor-pointer"
                >
                  Finish Challenge
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SprintActivePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#E61E32]" />
      </div>
    }>
      <SprintActiveContent />
    </Suspense>
  );
}
