"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Script from "next/script";

interface ExamSession {
  candidateName: string;
  hallTicketNumber: string;
  registrationNumber: string;
  photoUrl: string;
  visitorId?: string;
  exam: {
    id: number;
    name: string;
    company_name: string;
    company_logo?: string;
    date: string;
    time: string;
    description: string;
    total_qns: number;
    types_of_qns: string;
  };
}

import { QUESTIONS, Question } from "./questions";
import { TEST_SUITE } from "./testCases";

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const highlightJavaScript = (code: string) => {
  if (!code) return "";

  let html = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  
  const tokenRegex = /(\/\/.*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b\d+\b)|(\b(?:function|const|let|var|return|async|await|if|else|for|while|import|export|default|new|class|extends|from|try|catch|finally|throw|break|continue|switch|case|typeof|instanceof|in|of)\b)|(\b(?:console|log|fetch|response|require|mongoose|Schema|express|app|jwt|jsonwebtoken|React|useState|useEffect|useRef|JSON|stringify|parse|map|filter|reduce|split|join|reverse|push|pop|shift|unshift)\b)|(\b\w+(?=\())/g;

  html = html.replace(tokenRegex, (match, comment, string, number, keyword, builtin, funcName) => {
    if (comment) return `<span class="text-zinc-500 font-normal italic">${match}</span>`;
    if (string) return `<span class="text-amber-300 font-medium">${match}</span>`;
    if (number) return `<span class="text-emerald-400 font-semibold">${match}</span>`;
    if (keyword) return `<span class="text-blue-400 font-bold">${match}</span>`;
    if (builtin) return `<span class="text-cyan-400 font-bold">${match}</span>`;
    if (funcName) return `<span class="text-yellow-200 font-semibold">${match}</span>`;
    return match;
  });

  
  if (code.endsWith("\n")) {
    html += " ";
  }

  return html;
};

function CodeEditor({ value, onChange, placeholder }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const [lineCount, setLineCount] = useState(1);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  
  useEffect(() => {
    const lines = value.split("\n").length;
    setLineCount(Math.max(lines, 1));
  }, [value]);

  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      onChange(newValue);

      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = scrollTop;
    }
    if (highlightRef.current) {
      highlightRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollLeft = scrollLeft;
    }
  };

  
  const handleCursorMove = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, start);
    const lines = textBeforeCursor.split("\n");
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1
    });
  };

  return (
    <div className="w-full border border-zinc-700 bg-[#1e1e1e] text-zinc-300 font-mono text-xs flex flex-col relative rounded-none shadow-md overflow-hidden">
      {}
      <div className="bg-[#2d2d2d] px-4 py-2 border-b border-zinc-800 flex items-center justify-between shrink-0 select-none text-[11px] text-zinc-400 font-sans">
        <div className="flex items-center gap-2">
          <span className="text-[#e37933] font-bold font-mono">JS</span>
          <span className="font-semibold text-zinc-300">solution.js</span>
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" title="Unsaved changes" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-500">JavaScript (Node.js)</span>
        </div>
      </div>

      {}
      <div className="flex flex-1 min-h-[320px] relative">
        {}
        <div
          ref={lineNumbersRef}
          className="w-10 bg-[#1e1e1e] text-[#858585] border-r border-[#2d2d2d] py-3 text-right pr-2.5 select-none overflow-hidden font-mono text-[11px] leading-6"
        >
          {Array.from({ length: lineCount }).map((_, idx) => (
            <div key={idx} className="h-6">
              {idx + 1}
            </div>
          ))}
        </div>

        {}
        <div className="flex-1 min-h-[320px] relative overflow-hidden">
          {}
          <pre
            ref={highlightRef}
            className="absolute inset-0 pointer-events-none select-none text-[#d4d4d4] overflow-hidden whitespace-pre z-0"
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '13px',
              lineHeight: '24px',
              padding: '12px',
              margin: '0',
            }}
            dangerouslySetInnerHTML={{ __html: highlightJavaScript(value) }}
          />

          {}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            onKeyUp={handleCursorMove}
            onSelect={handleCursorMove}
            onClick={handleCursorMove}
            placeholder={placeholder}
            className="absolute inset-0 w-full h-full border-none focus:outline-none resize-none overflow-auto whitespace-pre focus:ring-0 focus:ring-offset-0 z-10"
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '13px',
              lineHeight: '24px',
              padding: '12px',
              margin: '0',
              color: 'transparent',
              caretColor: '#d4d4d4',
              background: 'transparent',
            }}
            spellCheck={false}
          />
        </div>
      </div>

      {}
      <div className="bg-[#007acc] text-white px-4 py-1 flex items-center justify-between shrink-0 text-[10px] font-sans font-medium select-none">
        <div className="flex items-center gap-3">
          <span className="bg-[#1f8ad2] px-1.5 py-0.5 uppercase font-bold tracking-wider">Editor</span>
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Spaces: 2</span>
          <span>UTF-8</span>
          <span>JavaScript</span>
        </div>
      </div>
    </div>
  );
}

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

export default function ExamSessionPage() {
  const router = useRouter();
  const supabase = createClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [questions, setQuestions] = useState<Question[]>(QUESTIONS);
  const [session, setSession] = useState<ExamSession | null>(null);
  const [loading, setLoading] = useState(true);

  
  const [camGranted, setCamGranted] = useState(false);
  const [micGranted, setMicGranted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [permError, setPermError] = useState("");
  const [setupDone, setSetupDone] = useState(false);

  
  const [flags, setFlags] = useState<string[]>([]);

  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [questionStatuses, setQuestionStatuses] = useState<
    Record<number, "not_visited" | "not_answered" | "answered" | "marked">
  >({});
  const [timeLeft, setTimeLeft] = useState(7200); 
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFullySubmitted, setIsFullySubmitted] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isViolated, setIsViolated] = useState(false);
  const [violationReason, setViolationReason] = useState("");

  const [testResults, setTestResults] = useState<Record<number, { name: string; success: boolean; message: string }[] | null>>({});
  const [isRunningTests, setIsRunningTests] = useState(false);

  const handleRunCode = async () => {
    setIsRunningTests(true);
    const currentQuestion = questions[currentIndex];
    const qid = currentQuestion.id;
    const userCode = answers[qid] || "";

    // Reset previous results for this question
    setTestResults((prev) => ({ ...prev, [qid]: null }));

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

    try {
      // Create execution sandbox
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

      setTestResults((prev) => ({ ...prev, [qid]: results }));
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [qid]: [
          {
            name: "Compilation check",
            success: false,
            message: err.message || "Syntax Error",
          },
        ],
      }));
    } finally {
      setIsRunningTests(false);
    }
  };

  const triggerViolation = useCallback((reason: string) => {
    setIsViolated(true);
    setViolationReason(reason);
    setIsSubmitted(true);

    try {
      const raw = sessionStorage.getItem("exam_session");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.hallTicketNumber) {
          localStorage.setItem(`exam_violated_${parsed.hallTicketNumber}`, "true");

          // Log the violation to security_logs (fire-and-forget)
          fetch("/api/exam/log-event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            keepalive: true,
            body: JSON.stringify({
              sessionId: parsed.hallTicketNumber,
              visitorId: parsed.visitorId ?? "",
              eventType: "PROCTORING_VIOLATION",
              details: reason,
            }),
          }).catch(() => {});
        }
      }
    } catch (e) {
      console.error("Failed to save violation status:", e);
    }

    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    try {
      window.close();
      if (!window.closed) {
        window.open('about:blank', '_self')?.close();
      }
    } catch (e) {}
  }, []);


  
  useEffect(() => {
    const raw = sessionStorage.getItem("exam_session");
    if (!raw) {
      router.replace("/exam-login");
      return;
    }
    const loadSession = async () => {
      try {
        const parsed = JSON.parse(raw);

        let dbAnswers: Record<number, string> = {};
        let dbBlocked = false;
        try {
          const res = await fetch(`/api/exam/save-answers?hallTicketNumber=${encodeURIComponent(parsed.hallTicketNumber)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              if (data.answers) {
                dbAnswers = data.answers;
              }
              dbBlocked = !!data.blocked;
            }
          }
        } catch (e) {
          console.error("Failed to fetch initial saved answers:", e);
        }

        if (dbBlocked) {
          setIsViolated(true);
          setViolationReason("Proctoring violation detected. The exam has been locked.");
          setIsSubmitted(true);
          setSession(parsed);
          setLoading(false);
          return;
        }

        // Clear local storage lock since the database says it's active and allowed
        localStorage.removeItem(`exam_violated_${parsed.hallTicketNumber}`);

        setSession(parsed);

        let loadedQuestions = QUESTIONS.map((q) => ({ ...q }));
        if (parsed.exam.id === 4 || parsed.exam.name.toLowerCase().includes("student forge")) {
          const sectionA = loadedQuestions.filter((q) => q.section === "A");
          const sectionB = loadedQuestions.filter((q) => q.section === "B");
          const shuffledA = shuffleQuestions(sectionA, parsed.hallTicketNumber).slice(0, 30);
          const shuffledB = shuffleQuestions(sectionB, parsed.hallTicketNumber + "-B");
          shuffledA.forEach((q, idx) => {
            q.number = idx + 1;
          });
          shuffledB.forEach((q, idx) => {
            q.number = idx + 1;
          });
          loadedQuestions = [...shuffledA, ...shuffledB];
        }
        setQuestions(loadedQuestions);

        setAnswers((prev) => {
          const initialAnswers = { ...prev, ...dbAnswers };
          loadedQuestions.forEach((q) => {
            if (q.type === "coding" && q.starterCode && !initialAnswers[q.id]) {
              initialAnswers[q.id] = q.starterCode;
            }
          });
          return initialAnswers;
        });

        setQuestionStatuses((prev) => {
          const statuses = { ...prev };
          loadedQuestions.forEach((q) => {
            const ans = dbAnswers[q.id];
            if (ans && ans.trim() !== "") {
              if (q.type === "coding" && q.starterCode) {
                statuses[q.id] = ans.trim() !== q.starterCode.trim() ? "answered" : "not_answered";
              } else {
                statuses[q.id] = "answered";
              }
            } else {
              statuses[q.id] = "not_visited";
            }
          });
          if (loadedQuestions.length > 0) {
            const firstQId = loadedQuestions[0].id;
            if (!statuses[firstQId] || statuses[firstQId] === "not_visited") {
              statuses[firstQId] = "not_answered";
            }
          }
          return statuses;
        });
      } catch {
        router.replace("/exam-login");
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [router]);

  
  const requestMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setCamGranted(true);
      setMicGranted(true);
      return true;
    } catch (err: any) {
      setPermError("Camera and microphone access is required to proceed. Please allow access and refresh.");
      return false;
    }
  }, []);

  
  const requestFullscreen = useCallback(async () => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) await el.requestFullscreen();
      else if ((el as any).webkitRequestFullscreen) await (el as any).webkitRequestFullscreen();
      setFullscreen(true);
      return true;
    } catch {
      setFullscreen(false);
      return false;
    }
  }, []);

  // Setup: request media then ensure fullscreen
  useEffect(() => {
    if (!session) return;
    (async () => {
      const mediaOk = await requestMedia();
      if (!mediaOk) return;

      // Fullscreen should already be active (entered on exam-ready page during button click).
      // Only request again if not already in fullscreen — avoids the browser rejecting
      // a programmatic (non-user-gesture) fullscreen call.
      const alreadyFullscreen =
        !!document.fullscreenElement || !!(document as any).webkitFullscreenElement;
      if (!alreadyFullscreen) {
        await requestFullscreen();
      } else {
        setFullscreen(true);
      }

      setSetupDone(true);
    })();
  }, [session, requestMedia, requestFullscreen]);


  
  useEffect(() => {
    if (!setupDone || !session) return;

    const initDBSession = async () => {
      try {
        await supabase.from("sessions").upsert({
          id: session.hallTicketNumber,
          student: session.candidateName,
          email: `${session.candidateName.replace(/\s+/g, "").toLowerCase()}@redlix.com`,
          exam: session.exam.name,
          flags_count: 0,
          integrity_score: 100,
          last_flag_type: "None",
          severity: "Normal",
          timestamp: "Just started",
          avatar: session.candidateName.substring(0, 2).toUpperCase(),
          visitor_id: session.visitorId ?? null,
        });
      } catch (e) {
        console.error("Failed to initialize session in DB:", e);
      }
    };

    initDBSession();
  }, [setupDone, session]);

  
  useEffect(() => {
    if (isSubmitted && session?.hallTicketNumber) {
      supabase
        .from("sessions")
        .delete()
        .eq("id", session.hallTicketNumber)
        .then(() => {});
    }
  }, [isSubmitted, session]);

  
  useEffect(() => {
    if (!session?.hallTicketNumber) return;

    const cleanup = () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!supabaseUrl || !supabaseKey) return;

      const url = `${supabaseUrl}/rest/v1/sessions?id=eq.${session.hallTicketNumber}`;
      fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Prefer": "return=minimal",
          "x-candidate-hall-ticket": session.hallTicketNumber
        },
        keepalive: true
      }).catch(() => {});
    };

    window.addEventListener("unload", cleanup);
    return () => window.removeEventListener("unload", cleanup);
  }, [session]);

  
  useEffect(() => {
    if (!setupDone || isSubmitted || !session || !videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 180;
    const ctx = canvas.getContext("2d");

    const uploadFrame = async () => {
      if (!videoRef.current || !ctx) return;
      try {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.5);

        await fetch("/api/exam/upload-feed", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: session.hallTicketNumber,
            image: dataUrl,
          }),
        });
      } catch (err) {
        console.error("Error uploading camera snapshot:", err);
      }
    };

    const interval = setInterval(uploadFrame, 2500);
    return () => clearInterval(interval);
  }, [setupDone, isSubmitted, session]);

  useEffect(() => {
    if (!setupDone || isSubmitted || !session) return;

    const presenceChannel = supabase.channel("exam-presence-global");

    presenceChannel
      .subscribe(async (status: any) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            online_at: new Date().toISOString(),
            student_id: session.hallTicketNumber,
            student_name: session.candidateName,
          });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [setupDone, isSubmitted, session]);

  
  useEffect(() => {
    if (!setupDone || !streamRef.current || !videoRef.current) return;
    videoRef.current.srcObject = streamRef.current;
  }, [setupDone, fullscreen]);

  useEffect(() => {
    if (!setupDone || !streamRef.current) return;

    let audioContext: AudioContext | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let analyser: AnalyserNode | null = null;
    let animationId: number;
    let resizeTimer: NodeJS.Timeout;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioContext = new AudioCtx();
      source = audioContext.createMediaStreamSource(streamRef.current!);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
    } catch (err) {
      console.error("Failed to initialize AudioContext:", err);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth || 320;
      canvas.height = canvas.clientHeight || 48;
    };
    resizeCanvas();

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 100);
    };
    window.addEventListener("resize", handleResize);

    const bufferLength = analyser ? analyser.fftSize : 0;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationId = requestAnimationFrame(draw);

      if (!analyser || !ctx || !canvas) return;

      analyser.getByteTimeDomainData(dataArray);

      let maxDeviation = 0;
      for (let i = 0; i < bufferLength; i++) {
        const dev = Math.abs(dataArray[i] - 128);
        if (dev > maxDeviation) {
          maxDeviation = dev;
        }
      }

      if (maxDeviation > 6) {
        setIsSpeaking(true);
      } else {
        setIsSpeaking(false);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(249, 115, 22, 0.12)";
      ctx.beginPath();
      let sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.stroke();

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(249, 115, 22, 0.85)";
      ctx.beginPath();
      x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.stroke();
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
      if (audioContext) {
        audioContext.close().catch(() => {});
      }
    };
  }, [setupDone]);

  
  useEffect(() => {
    if (setupDone && questions.length > 0) {
      const firstQId = questions[0].id;
      setQuestionStatuses((prev) => {
        if (prev[firstQId] === "answered" || prev[firstQId] === "marked") {
          return prev;
        }
        return {
          ...prev,
          [firstQId]: "not_answered",
        };
      });
    }
  }, [setupDone, questions]);

  
  useEffect(() => {
    const onFsChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement
      );
      if (!isFs && setupDone && !isSubmitted) {
        triggerViolation("Exited fullscreen");
      }
      setFullscreen(isFs);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    };
  }, [setupDone, isSubmitted, triggerViolation]);

  
  useEffect(() => {
    if (!setupDone || isSubmitted) return;

    
    const onVisibility = () => {
      if (document.hidden && !isSubmitted) {
        triggerViolation("Tab switch detected");
      }
    };

    
    const onBlur = () => {
      
      setTimeout(() => {
        if (!document.hasFocus() && !isSubmitted) {
          triggerViolation("Window focus lost (navigated away)");
        }
      }, 150);
    };

    // Only block copy/paste/cut outside of legitimate input elements (e.g. code editor)
    const preventAction = (e: Event) => {
      const target = e.target as HTMLElement;
      const isInputField =
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLInputElement;
      if (isInputField) return; // allow normal editing inside code editor / input fields

      e.preventDefault();
      if (!isSubmitted) {
        triggerViolation(`Prohibited action detected: ${e.type}`);
      }
    };

    
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputField =
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLInputElement;

      const isF12 = e.key === "F12";
      const isCtrlShiftDev = e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase());
      const isMacDev = e.metaKey && e.altKey && e.key.toLowerCase() === "i";
      
      if (isF12 || isCtrlShiftDev || isMacDev) {
        e.preventDefault();
        triggerViolation("Developer Tools keyboard shortcut detected");
        return;
      }

      // Allow Ctrl/Cmd+C/V/X inside the code editor textarea, block everywhere else
      if ((e.ctrlKey || e.metaKey) && ["c", "v", "x", "u"].includes(e.key.toLowerCase())) {
        if (isInputField && e.key.toLowerCase() !== "u") return; // allow copy/paste/cut in editor
        e.preventDefault();
        triggerViolation(`Prohibited shortcut combination: ${e.key.toUpperCase()}`);
        return;
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("copy", preventAction);
    document.addEventListener("paste", preventAction);
    document.addEventListener("cut", preventAction);
    document.addEventListener("contextmenu", preventAction);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("copy", preventAction);
      document.removeEventListener("paste", preventAction);
      document.removeEventListener("cut", preventAction);
      document.removeEventListener("contextmenu", preventAction);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setupDone, isSubmitted, triggerViolation]);

  const saveAnswersToDb = useCallback(async (currentAnswers: Record<number, string>) => {
    if (!session?.hallTicketNumber) return;
    try {
      const res = await fetch("/api/exam/save-answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hallTicketNumber: session.hallTicketNumber,
          answers: currentAnswers,
        }),
      });
      if (!res.ok) {
        console.error("Failed to auto-save answers");
      }
    } catch (err) {
      console.error("Error in auto-saving answers:", err);
    }
  }, [session?.hallTicketNumber]);

  useEffect(() => {
    if (!setupDone || isSubmitted || !session?.hallTicketNumber) return;

    const timer = setTimeout(() => {
      saveAnswersToDb(answers);
    }, 2000);

    return () => clearTimeout(timer);
  }, [answers, setupDone, isSubmitted, session?.hallTicketNumber, saveAnswersToDb]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const triggerAutoSubmit = useCallback(() => {
    if (session?.hallTicketNumber) {
      saveAnswersToDb(answers);
    }
    setIsSubmitted(true);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }, [answers, session?.hallTicketNumber, saveAnswersToDb]);

  useEffect(() => {
    if (!setupDone || isSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          triggerAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [setupDone, isSubmitted, triggerAutoSubmit]);

  const handleQuestionSelect = (index: number) => {
    const prevQ = questions[currentIndex];
    const prevAns = answers[prevQ.id];

    setQuestionStatuses((prev) => {
      const currentStatus = prev[prevQ.id] || "not_visited";
      let nextStatus = currentStatus;

      if (currentStatus !== "marked") {
        let hasValue = false;
        if (prevAns && prevAns.trim() !== "") {
          if (prevQ.type === "coding" && prevQ.starterCode) {
            hasValue = prevAns.trim() !== prevQ.starterCode.trim();
          } else {
            hasValue = true;
          }
        }

        if (hasValue) {
          nextStatus = "answered";
        } else {
          nextStatus = "not_answered";
        }
      }

      const nextQId = questions[index].id;
      const nextQStatus = prev[nextQId] || "not_visited";
      let updatedNextQStatus = nextQStatus;
      if (nextQStatus === "not_visited") {
        updatedNextQStatus = "not_answered";
      }

      return {
        ...prev,
        [prevQ.id]: nextStatus,
        [nextQId]: updatedNextQStatus,
      };
    });

    setCurrentIndex(index);
  };

  const handleAnswerChange = (val: string) => {
    setAnswers((prev) => ({ ...prev, [questions[currentIndex].id]: val }));
  };

  const handleClearResponse = () => {
    setAnswers((prev) => {
      const next = { ...prev };
      const currentQ = questions[currentIndex];
      if (currentQ.type === "coding" && currentQ.starterCode) {
        next[currentQ.id] = currentQ.starterCode;
      } else {
        delete next[currentQ.id];
      }
      return next;
    });
    setQuestionStatuses((prev) => ({
      ...prev,
      [questions[currentIndex].id]: "not_answered",
    }));
  };

  const handleMarkForReview = () => {
    setQuestionStatuses((prev) => ({
      ...prev,
      [questions[currentIndex].id]: "marked",
    }));
    if (currentIndex < questions.length - 1) {
      handleQuestionSelect(currentIndex + 1);
    }
  };

  const handleSaveAndNext = () => {
    const qId = questions[currentIndex].id;
    const currentQ = questions[currentIndex];
    const currentAns = answers[qId];
    
    let hasValue = false;
    if (currentAns && currentAns.trim() !== "") {
      if (currentQ.type === "coding" && currentQ.starterCode) {
        hasValue = currentAns.trim() !== currentQ.starterCode.trim();
      } else {
        hasValue = true;
      }
    }

    setQuestionStatuses((prev) => ({
      ...prev,
      [qId]: hasValue ? "answered" : "not_answered",
    }));

    if (currentIndex < questions.length - 1) {
      handleQuestionSelect(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      handleQuestionSelect(currentIndex - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getPaletteButtonClass = (status: string, isActive: boolean) => {
    let base = "border rounded-none ";
    if (isActive) {
      base += "ring-2 ring-orange-500 ring-offset-1 z-10 ";
    }

    if (status === "answered") {
      base += "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700";
    } else if (status === "marked") {
      base += "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700";
    } else if (status === "not_answered") {
      base += "bg-red-50 border-red-300 text-red-600 hover:bg-red-100";
    } else {
      base += "bg-white border-zinc-300 text-zinc-500 hover:bg-zinc-50";
    }
    return base;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center font-sans">
        <div className="w-10 h-10 rounded-full border-2 border-t-orange-500 border-r-zinc-700 border-b-zinc-700 border-l-zinc-700 animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  const { exam, candidateName, hallTicketNumber } = session;

  
  if (permError) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center font-sans p-6">
        <div className="bg-zinc-800 border border-zinc-700 p-8 max-w-md text-center space-y-4">
          <p className="text-2xl">🚫</p>
          <p className="text-white font-bold text-base">Permission Required</p>
          <p className="text-zinc-400 text-sm leading-relaxed">{permError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-none cursor-pointer border-none transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  
  if (!setupDone) {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center font-sans gap-6 p-6">
        <div className="w-10 h-10 rounded-full border-2 border-t-orange-500 border-r-zinc-700 border-b-zinc-700 border-l-zinc-700 animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-white font-semibold text-sm">Initialising exam session...</p>
          <p className="text-zinc-500 text-xs">
            {!camGranted ? "Requesting camera and microphone..." : "Entering fullscreen..."}
          </p>
        </div>
      </div>
    );
  }

  
  if (isViolated) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-sans p-6 select-none text-zinc-900">
        <div className="bg-white border border-zinc-200 p-8 max-w-lg w-full text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-zinc-100 border border-zinc-200 text-zinc-400 rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-lg font-bold text-zinc-950">Exam session terminated</h1>
            <p className="text-xs text-zinc-500 leading-relaxed font-sans">
              Your exam session has been locked and automatically submitted due to a proctoring security violation.
            </p>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 p-4 text-left space-y-2.5 font-mono text-xs text-zinc-700">
            <div className="flex justify-between border-b border-zinc-250 pb-1.5">
              <span className="text-zinc-450">Candidate:</span>
              <span className="font-bold text-zinc-800">{candidateName}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-250 pb-1.5">
              <span className="text-zinc-450">Hall Ticket:</span>
              <span className="font-bold text-zinc-800">{hallTicketNumber}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-250 pb-1.5">
              <span className="text-zinc-450">Violation details:</span>
              <span className="font-bold text-zinc-800">{violationReason}</span>
            </div>
            <div className="flex justify-between text-[10px] text-zinc-400 pt-1 font-sans italic">
              * This event has been logged with your IP, timestamp, and video frames.
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => {
                sessionStorage.removeItem("exam_session");
                try {
                  window.close();
                  window.open('about:blank', '_self')?.close();
                } catch(e) {}
              }}
              className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-none cursor-pointer transition-colors w-full"
            >
              Close exam window
            </button>
            <p className="text-[10px] text-zinc-400 font-sans">
              If the window does not close automatically, please close this browser tab manually.
            </p>
          </div>
        </div>
      </div>
    );
  }  if (isSubmitted) {
    if (isFullySubmitted) {
      return (
        <div className="min-h-screen bg-zinc-100 flex items-center justify-center font-sans p-6 select-none text-zinc-900">
          <div className="bg-white border border-zinc-200 p-10 max-w-md w-full text-center space-y-6 shadow-sm">
            {/* Lottie animation */}
            <Script
              src="https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.14/dist/dotlottie-wc.js"
              type="module"
              strategy="afterInteractive"
            />
            <div className="flex justify-center">
              {/* @ts-ignore */}
              <dotlottie-wc
                src="https://lottie.host/41df1d4a-e726-48b9-8c63-95896d087232/he0C1Dd3Ne.lottie"
                style={{ width: "180px", height: "180px" }}
                autoplay
                loop
              />
            </div>
            <div className="space-y-1">
              <h1 className="text-lg font-bold text-zinc-900">Thank You!</h1>
              <p className="text-xs text-zinc-500">Your exam has been submitted successfully. You may close this window.</p>
            </div>
            <button
              onClick={() => { window.location.href = "/exam-login"; }}
              className="px-6 py-2 border border-zinc-300 text-zinc-700 bg-white hover:bg-zinc-50 text-xs font-bold uppercase tracking-wider rounded-none cursor-pointer transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-zinc-100 flex flex-col justify-between font-sans p-6 text-zinc-900">
        <main className="max-w-2xl w-full mx-auto bg-white border border-zinc-200 p-8 shadow-sm space-y-6 mt-6">
          <div className="border-b border-zinc-200 pb-4 text-center">
            <h1 className="text-base font-bold text-zinc-900 font-sans">Review Your Answers</h1>
            <p className="text-xs text-zinc-500 mt-1 font-sans">Confirm your submission by clicking Submit below.</p>
          </div>

          {/* Horizontal question number grid */}
          <div className="flex flex-wrap gap-2 justify-center">
            {questions.map((q) => {
              const ans = answers[q.id];
              let isAttempted = false;
              if (ans && ans.trim() !== "") {
                if (q.type === "coding" && q.starterCode) {
                  isAttempted = ans.trim() !== q.starterCode.trim();
                } else {
                  isAttempted = true;
                }
              }
              return (
                <span
                  key={q.id}
                  title={isAttempted ? "Answered" : "Not Answered"}
                  className={`w-9 h-9 flex items-center justify-center text-xs font-bold border ${
                    isAttempted
                      ? "bg-emerald-500 text-white border-emerald-600"
                      : "bg-zinc-100 text-zinc-500 border-zinc-300"
                  }`}
                >
                  {q.number}
                </span>
              );
            })}
          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={async () => {
                if (session?.hallTicketNumber) {
                  await saveAnswersToDb(answers);
                }
                sessionStorage.removeItem("exam_session");
                setIsFullySubmitted(true);
              }}
              className="px-8 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider rounded-none cursor-pointer border-none transition-colors"
            >
              Submit
            </button>
          </div>
        </main>
        <footer className="text-center text-[10px] text-zinc-400 py-4 font-sans">
          © 2026 Redlix Secure. Secure Examination System.
        </footer>
      </div>
    );
  }

  if (setupDone && !fullscreen) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center font-sans gap-6 p-6 select-none">
        <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
          </svg>
        </div>
        <div className="text-center space-y-2 max-w-md">
          <h1 className="text-white font-bold text-lg">Full Screen Mode Required</h1>
          <p className="text-zinc-400 text-xs leading-relaxed">
            This examination must be conducted in full screen mode to ensure security and prevent unauthorized access.
          </p>
        </div>
        <button
          onClick={requestFullscreen}
          className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-none shadow-sm transition-colors cursor-pointer border-none"
        >
          Enter Full Screen Mode
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const activeAnswer = answers[currentQuestion.id] || "";

  
  return (
    <div className="h-screen w-screen overflow-hidden bg-zinc-50 font-sans text-zinc-900 flex flex-col select-none">
      {}
      <header className="bg-orange-500 px-6 py-3 flex items-center justify-between shrink-0 border-b border-orange-600 shadow-sm">
        <div className="flex items-center gap-3">
          {exam.company_logo ? (
            <img src={exam.company_logo} alt="" className="w-7 h-7 object-contain" />
          ) : (
            <img
              src="https://ik.imagekit.io/dypkhqxip/logo.png?updatedAt=1777320313623"
              alt=""
              className="w-7 h-7 object-contain"
            />
          )}
          <div>
            <p className="text-white font-bold text-sm leading-tight">{exam.name}</p>
            <p className="text-orange-100 text-[10px]">{exam.company_name}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-white text-xs font-semibold">{candidateName}</p>
            <p className="text-orange-100 text-[10px] font-mono">{hallTicketNumber}</p>
          </div>
        </div>
      </header>

      {}
      <div className="flex flex-1 overflow-hidden">
        {}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col justify-between relative bg-zinc-50">
          {}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 flex flex-col justify-between opacity-[0.12] p-12">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="text-zinc-950 font-extrabold text-sm tracking-widest whitespace-nowrap font-mono flex justify-between"
                style={{ transform: `rotate(-18deg) translateX(${i % 2 === 0 ? '-10%' : '10%'})` }}
              >
                <span className="px-4">{candidateName} • {hallTicketNumber}</span>
                <span className="px-4">{candidateName} • {hallTicketNumber}</span>
                <span className="px-4">{candidateName} • {hallTicketNumber}</span>
              </div>
            ))}
          </div>

          <div className="relative z-10 w-full max-w-3xl mx-auto space-y-6">
            {}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600 font-mono">
                  {currentQuestion.section === "A"
                    ? "Section A: Multiple Choice Questions"
                    : "Section B: Coding Challenges"}
                </span>
                <h2 className="text-lg font-bold text-zinc-900 mt-0.5">
                  Question {currentQuestion.number} of {questions.filter(q => q.section === currentQuestion.section).length} ({currentQuestion.type === "mcq" ? "MCQ" : "Coding"})
                </h2>
              </div>
              <span className="text-xs bg-zinc-100 text-zinc-700 px-2.5 py-1 border border-zinc-200 font-mono font-bold">
                {currentQuestion.marks} Marks
              </span>
            </div>

            {}
            <div className="bg-white border border-zinc-200 p-6 shadow-sm">
              <p className="text-sm text-zinc-800 leading-relaxed font-medium whitespace-pre-wrap font-sans">
                {currentQuestion.questionText}
              </p>
            </div>

            {}
            {currentQuestion.type === "mcq" ? (
              <div className="space-y-2.5">
                {currentQuestion.options?.map((opt) => {
                  const letter = opt.substring(0, 1);
                  const isSelected = activeAnswer === letter;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleAnswerChange(letter)}
                      className={`w-full text-left px-5 py-4 border transition-all cursor-pointer flex items-center gap-4 rounded-none ${
                        isSelected
                          ? "bg-orange-50/50 border-orange-500 text-orange-950 font-semibold"
                          : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 flex items-center justify-center text-xs font-mono font-bold border rounded-full ${
                          isSelected
                            ? "bg-orange-500 border-orange-500 text-white"
                            : "border-zinc-300 text-zinc-400 bg-white"
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="text-sm font-sans">{opt.substring(3)}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                    Write your solution code below
                  </label>
                  <CodeEditor
                    value={activeAnswer}
                    onChange={handleAnswerChange}
                    placeholder="// Write your code or explanation here..."
                  />
                </div>

                {/* Run Code Button */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleRunCode}
                    disabled={isRunningTests}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs uppercase tracking-wider rounded-none cursor-pointer border border-zinc-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {isRunningTests ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border border-t-orange-500 border-r-zinc-450 border-b-zinc-450 border-l-zinc-450 animate-spin" />
                        <span>Running Tests...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Run Code &amp; Test</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Test Results Output */}
                {testResults[currentQuestion.id] && (
                  <div className="bg-[#18181b] border border-zinc-800/80 p-4 font-mono text-xs text-zinc-300 space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">
                      Test Suite Output
                    </span>
                    <div className="space-y-2 mt-2">
                      {testResults[currentQuestion.id]?.map((res, idx) => (
                        <div key={idx} className="flex flex-col gap-1 border-b border-zinc-900 pb-2 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2">
                            {res.success ? (
                              <span className="text-emerald-500 font-bold">✓ PASSED</span>
                            ) : (
                              <span className="text-red-500 font-bold">✗ FAILED</span>
                            )}
                            <span className="font-semibold text-zinc-200">{res.name}</span>
                          </div>
                          <span className={`text-[11px] ${res.success ? "text-zinc-500" : "text-red-400 font-medium"}`}>
                            {res.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-100 border border-zinc-200 p-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">
                      Sample Input
                    </span>
                    <pre className="text-xs font-mono text-zinc-800 whitespace-pre-wrap mt-1">
                      {currentQuestion.sampleInput}
                    </pre>
                  </div>
                  <div className="bg-zinc-100 border border-zinc-200 p-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">
                      Expected Output
                    </span>
                    <pre className="text-xs font-mono text-zinc-800 whitespace-pre-wrap mt-1">
                      {currentQuestion.sampleOutput}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {}
            {flags.length > 0 && (
              <div className="bg-red-50 border border-red-200 p-4 space-y-1 font-mono text-xs">
                <p className="font-bold text-red-700 uppercase">Proctor Violations Detected</p>
                {flags.map((f, i) => (
                  <p key={i} className="text-red-600 flex items-start gap-1.5">
                    <span>•</span> {f}
                  </p>
                ))}
              </div>
            )}
          </div>

          {}
          <div className="relative z-10 w-full max-w-3xl mx-auto border-t border-zinc-200 pt-6 mt-8 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={handleClearResponse}
                className="px-4 py-2 border border-zinc-300 text-zinc-700 bg-white hover:bg-zinc-50 text-xs font-bold uppercase tracking-wider rounded-none cursor-pointer transition-colors"
              >
                Clear Response
              </button>
              <button
                onClick={handleMarkForReview}
                className="px-4 py-2 border border-indigo-600 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 text-xs font-bold uppercase tracking-wider rounded-none cursor-pointer transition-colors"
              >
                Mark for Review & Next
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`px-4 py-2 border border-zinc-300 text-zinc-700 bg-white text-xs font-bold uppercase tracking-wider rounded-none transition-colors ${
                  currentIndex === 0 ? "opacity-40 cursor-not-allowed" : "hover:bg-zinc-50 cursor-pointer"
                }`}
              >
                Previous
              </button>
              <button
                onClick={handleSaveAndNext}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider rounded-none cursor-pointer border-none transition-colors"
              >
                {currentIndex === questions.length - 1 ? "Save Response" : "Save & Next"}
              </button>
            </div>
          </div>
        </main>

        {}
        <aside className="w-80 shrink-0 bg-white border-l border-zinc-200 flex flex-col h-full overflow-hidden select-none">
          {/* Sticky Top: Camera feed + Candidate Profile + Timer */}
          <div className="shrink-0 flex flex-col">
            {/* Live Proctoring Feed */}
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 relative">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Live Proctoring Feed
              </p>
              <div className="w-full aspect-video bg-zinc-900 border border-zinc-300 relative overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover scale-x-[-1]"
                  autoPlay
                  muted
                  playsInline
                />
                {/* Audio Wave Visualizer Overlay */}
                <canvas
                  ref={canvasRef}
                  className="absolute bottom-0 left-0 w-full h-12 pointer-events-none z-10"
                />
                <span className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 text-[9px] text-white font-mono uppercase z-20">
                  CAM 01
                </span>
                {/* Visual Speaking Indicator */}
                <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-none text-[8px] font-mono text-white tracking-wider uppercase z-20">
                  <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? "bg-orange-500 animate-pulse" : "bg-zinc-500"}`} />
                  {isSpeaking ? "Speaking" : "Silent"}
                </div>
              </div>
            </div>

            {/* Candidate Profile */}
            <div className="p-4 border-b border-zinc-200 bg-white space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 font-mono">
                Candidate Profile
              </p>
              <div className="flex items-center gap-4">
                {session.photoUrl ? (
                  <img
                    src={session.photoUrl}
                    alt="Candidate Profile"
                    className="w-16 h-16 object-cover border border-zinc-300 shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 bg-zinc-100 flex items-center justify-center border border-zinc-300 text-zinc-400 font-bold text-xs shrink-0">
                    PHOTO
                  </div>
                )}
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-extrabold text-zinc-900 leading-tight">{candidateName}</p>
                  <p className="text-[11px] font-mono text-zinc-500 font-semibold">{hallTicketNumber}</p>
                  <div className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    Verified
                  </div>
                </div>
              </div>
            </div>

            {/* Time Remaining */}
            <div className="px-4 py-3 bg-zinc-900 text-white flex items-center justify-between border-b border-zinc-800">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Time Remaining</span>
              <span
                className={`font-mono text-base font-bold ${
                  timeLeft < 300 ? "text-red-400 animate-pulse" : "text-orange-400"
                }`}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Scrollable Middle: Questions Grid */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 font-mono">
                Section A: MCQs
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {questions.filter(q => q.type === "mcq").map((q) => {
                  const idx = questions.findIndex(x => x.id === q.id);
                  const status = questionStatuses[q.id] || "not_visited";
                  const isActive = currentIndex === idx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => handleQuestionSelect(idx)}
                      className={`h-9 w-9 text-xs font-mono font-bold flex items-center justify-center cursor-pointer transition-colors ${getPaletteButtonClass(
                        status,
                        isActive
                      )}`}
                    >
                      {q.number}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2 font-mono">
                Section B: Coding
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {questions.filter(q => q.type === "coding").map((q) => {
                  const idx = questions.findIndex(x => x.id === q.id);
                  const status = questionStatuses[q.id] || "not_visited";
                  const isActive = currentIndex === idx;
                  return (
                    <button
                      key={q.id}
                      onClick={() => handleQuestionSelect(idx)}
                      className={`h-9 w-9 text-xs font-mono font-bold flex items-center justify-center cursor-pointer transition-colors ${getPaletteButtonClass(
                        status,
                        isActive
                      )}`}
                    >
                      Q{q.number}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Locked Bottom: Question Legend + Submit button */}
          <div className="shrink-0 border-t border-zinc-200 bg-zinc-50">
            {/* Question Legend */}
            <div className="p-4 border-b border-zinc-200 space-y-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Question Legend</p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] font-medium text-zinc-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border border-zinc-300 bg-white" />
                  <span>Not Visited</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border border-red-300 bg-red-50 text-red-700 flex items-center justify-center text-[8px] font-bold">
                    ●
                  </span>
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 bg-emerald-600 border border-emerald-600" />
                  <span className="text-emerald-700">Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 bg-indigo-600 border border-indigo-600" />
                  <span className="text-indigo-700">Marked</span>
                </div>
              </div>
            </div>

            {/* Submit button container */}
            <div className="p-4 bg-white">
              <button
                onClick={() => triggerAutoSubmit()}
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs tracking-wider uppercase rounded-none cursor-pointer border-none transition-colors"
              >
                Submit Exam
              </button>
            </div>
          </div>
        </aside>
      </div>

      {}
    </div>
  );
}
