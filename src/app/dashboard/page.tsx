"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { QUESTIONS } from "@/app/exam-session/questions";
import { TRAINING01_QUESTIONS } from "@/app/exam-session/training01Questions";
import { gradeTraining01Full } from "@/app/exam-session/training01AnswerKey";

interface Session {
  id: string;
  student: string;
  email: string;
  exam: string;
  flagsCount: number;
  integrityScore: number;
  lastFlagType: string;
  severity: "Critical" | "Warning" | "Normal";
  timestamp: string;
  avatar: string;
  liveFeed?: string;
}

interface Exam {
  id: number;
  name: string;
  date: string;
  time: string;
  description: string;
  total_qns: number;
  types_of_qns: string;
  company_name: string;
  company_logo?: string;
  custom_fields: Record<string, string>;
  is_started?: boolean;
  show_login?: boolean;
  submit_code?: string | null;
}

interface Registration {
  id: number;
  exam_id: number;
  candidate_name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  year_of_study: string;
  photo_url: string;
  created_at: string;
  registration_number?: string;
  hall_ticket_number?: string;
  answers?: Record<string | number, string>;
  blocked?: boolean;
}

interface SecurityLog {
  id: number;
  session_id: string;
  visitor_id: string;
  event_type: string;
  details: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
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

export default function Dashboard() {
  const router = useRouter();

  const ADMIN_TOKEN = process.env.NEXT_PUBLIC_ADMIN_SUPABASE_TOKEN ?? "redlix-secure-admin-token-2026";

  const adminFetch = async (method: "GET" | "POST", params?: Record<string, string>, body?: object) => {
    const url = method === "GET"
      ? `/api/admin?${new URLSearchParams(params ?? {}).toString()}`
      : "/api/admin";
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": ADMIN_TOKEN,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return res.json();
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineStudents, setOnlineStudents] = useState<Set<string>>(new Set());
  const [selectedSeverity, setSelectedSeverity] = useState<string>("All");
  const [activeTab, setActiveTab] = useState("overview");

  
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStreamSession, setActiveStreamSession] = useState<Session | null>(null);

  
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [examTime, setExamTime] = useState("");
  const [examDescription, setExamDescription] = useState("");
  const [totalQns, setTotalQns] = useState("");
  const [typesOfQns, setTypesOfQns] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const [examDuration, setExamDuration] = useState("");
  const [typesOfQnsList, setTypesOfQnsList] = useState<string[]>([""]);
  const [descriptionsList, setDescriptionsList] = useState<string[]>([""]);
  
  
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [clockTime, setClockTime] = useState("2026-06-05 20:15 IST");

  
  const [exams, setExams] = useState<Exam[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedExamForCandidates, setSelectedExamForCandidates] = useState<Exam | null>(null);
  const [selectedCandidateForAnswers, setSelectedCandidateForAnswers] = useState<Registration | null>(null);
  const [loadingExamsTab, setLoadingExamsTab] = useState(false);

  const fetchExamsAndRegistrations = async () => {
    setLoadingExamsTab(true);
    try {
      const [examsRes, regsRes] = await Promise.all([
        adminFetch("GET", { resource: "exams" }),
        adminFetch("GET", { resource: "registrations" }),
      ]);
      if (examsRes.success) setExams(examsRes.data);
      if (regsRes.success) setRegistrations(regsRes.data);
    } catch (err) {
      console.error("Error loading exams and registrations:", err);
    } finally {
      setLoadingExamsTab(false);
    }
  };

  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [loadingSecurityLogs, setLoadingSecurityLogs] = useState(false);
  const [reEnablingId, setReEnablingId] = useState<string | null>(null);

  const fetchSecurityLogs = async () => {
    setLoadingSecurityLogs(true);
    try {
      const res = await adminFetch("GET", { resource: "security_logs" });
      if (res.success) {
        setSecurityLogs(res.data);
      }
    } catch (err) {
      console.error("Error loading security logs:", err);
    } finally {
      setLoadingSecurityLogs(false);
    }
  };

  const handleReEnableExam = async (hallTicketNumber: string) => {
    setReEnablingId(hallTicketNumber);
    try {
      const res = await adminFetch("POST", undefined, {
        action: "re_enable_exam",
        hallTicketNumber,
      });
      if (res.success) {
        await Promise.all([fetchSecurityLogs(), fetchExamsAndRegistrations()]);
        alert(`Successfully re-enabled exam for candidate with Hall Ticket: ${hallTicketNumber}`);
      } else {
        alert("Failed to re-enable the exam: " + (res.error || "Unknown error"));
      }
    } catch (err: any) {
      console.error("Failed to re-enable exam:", err);
      alert("Unexpected error occurred while re-enabling exam.");
    } finally {
      setReEnablingId(null);
    }
  };


  const toggleExamStarted = async (exam: Exam) => {
    const newValue = !exam.is_started;
    // Optimistic update
    setExams((prev) => prev.map((e) => (e.id === exam.id ? { ...e, is_started: newValue } : e)));
    const res = await adminFetch("POST", undefined, { action: "toggle_started", examId: exam.id, value: newValue });
    if (!res.success) {
      // Revert on failure
      setExams((prev) => prev.map((e) => (e.id === exam.id ? { ...e, is_started: !newValue } : e)));
      console.error("Failed to toggle exam started:", res.error);
    }
  };

  const toggleExamShowLogin = async (exam: Exam) => {
    const newValue = !exam.show_login;
    // Optimistic update
    setExams((prev) => prev.map((e) => (e.id === exam.id ? { ...e, show_login: newValue } : e)));
    const res = await adminFetch("POST", undefined, { action: "toggle_show_login", examId: exam.id, value: newValue });
    if (!res.success) {
      // Revert on failure
      setExams((prev) => prev.map((e) => (e.id === exam.id ? { ...e, show_login: !newValue } : e)));
      console.error("Failed to toggle show login:", res.error);
    }
  };

  const [generatingCodeId, setGeneratingCodeId] = useState<number | null>(null);

  const handleGenerateCode = async (exam: Exam) => {
    setGeneratingCodeId(exam.id);
    try {
      const res = await adminFetch("POST", undefined, { action: "generate_submit_code", examId: exam.id });
      if (res.success) {
        setExams((prev) => prev.map((e) => (e.id === exam.id ? { ...e, submit_code: res.code } : e)));
      } else {
        alert("Failed to generate code: " + (res.error || "Unknown error"));
      }
    } catch (err) {
      alert("Unexpected error generating code.");
    } finally {
      setGeneratingCodeId(null);
    }
  };

  const handleClearCode = async (exam: Exam) => {
    if (!confirm("Remove the submit code? Candidates will be able to submit without a code.")) return;
    try {
      const res = await adminFetch("POST", undefined, { action: "clear_submit_code", examId: exam.id });
      if (res.success) {
        setExams((prev) => prev.map((e) => (e.id === exam.id ? { ...e, submit_code: null } : e)));
      } else {
        alert("Failed to clear code: " + (res.error || "Unknown error"));
      }
    } catch (err) {
      alert("Unexpected error clearing code.");
    }
  };


  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await adminFetch("GET", { resource: "exams" });
        if (!res.success && res.error === "Unauthorized") {
          localStorage.removeItem("is_authenticated");
          router.push("/admin");
        } else {
          setIsAuthenticated(true);
          const email = localStorage.getItem("user_email") || "admin@redlixsecure.com";
          setUserEmail(email);
        }
      } catch (err) {
        localStorage.removeItem("is_authenticated");
        router.push("/admin");
      }
    };
    checkAuth();
  }, [router]);

  
  useEffect(() => {
    const updateClock = () => {
      const d = new Date();
      const formatted = d.toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
      try {
        const [datePart, timePart] = formatted.split(", ");
        const [month, day, year] = datePart.split("/");
        setClockTime(`${year}-${month}-${day} ${timePart} IST`);
      } catch (e) {
        setClockTime("2026-06-05 20:15 IST");
      }
    };
    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, []);

  
  const fetchSessions = async () => {
    try {
      const res = await adminFetch("GET", { resource: "sessions" });
      if (res.success && res.data) {
        const mapped: Session[] = res.data.map((item: any) => ({
          id: item.id,
          student: item.student,
          email: item.email,
          exam: item.exam,
          flagsCount: item.flags_count,
          integrityScore: item.integrity_score,
          lastFlagType: item.last_flag_type,
          severity: item.severity as Session["severity"],
          timestamp: item.timestamp,
          avatar: item.avatar,
          liveFeed: item.live_feed,
        }));
        setSessions(mapped);
      }
    } catch (err) {
      console.error("Error loading proctoring sessions:", err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (!isAuthenticated) return;
    fetchSessions();

    const supabase = createClient();
    const channel = supabase
      .channel("sessions-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        (payload: any) => {
          if (payload.eventType === "INSERT") {
            const newItem = payload.new;
            const mappedNew: Session = {
              id: newItem.id,
              student: newItem.student,
              email: newItem.email,
              exam: newItem.exam,
              flagsCount: newItem.flags_count,
              integrityScore: newItem.integrity_score,
              lastFlagType: newItem.last_flag_type,
              severity: newItem.severity as Session["severity"],
              timestamp: newItem.timestamp,
              avatar: newItem.avatar,
              liveFeed: newItem.live_feed,
            };
            setSessions((prev) => {
              if (prev.some((s) => s.id === mappedNew.id)) return prev;
              return [...prev, mappedNew];
            });
          } else if (payload.eventType === "UPDATE") {
            const updatedItem = payload.new;
            const mappedUpdated: Partial<Session> = {
              id: updatedItem.id,
              student: updatedItem.student,
              email: updatedItem.email,
              exam: updatedItem.exam,
              flagsCount: updatedItem.flags_count,
              integrityScore: updatedItem.integrity_score,
              lastFlagType: updatedItem.last_flag_type,
              severity: updatedItem.severity as Session["severity"],
              timestamp: updatedItem.timestamp,
              avatar: updatedItem.avatar,
              liveFeed: updatedItem.live_feed,
            };
            setSessions((prev) =>
              prev.map((s) => (s.id === mappedUpdated.id ? { ...s, ...mappedUpdated } : s))
            );
            setActiveStreamSession((prev) => {
              if (prev && prev.id === updatedItem.id) {
                return { ...prev, ...mappedUpdated };
              }
              return prev;
            });
          } else if (payload.eventType === "DELETE") {
            const deletedId = payload.old.id;
            setSessions((prev) => prev.filter((s) => s.id !== deletedId));
            setActiveStreamSession((prev) => (prev && prev.id === deletedId ? null : prev));
          }
        }
      )
      .subscribe();

    const presenceChannel = supabase.channel("exam-presence-global");
    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const onlineIds = new Set<string>();
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.student_id) {
              onlineIds.add(presence.student_id);
            }
          });
        });
        setOnlineStudents(onlineIds);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(presenceChannel);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if ((activeTab === "exams-list" || activeTab === "overview" || activeTab === "settings") && isAuthenticated) {
      fetchExamsAndRegistrations();
      setSelectedExamForCandidates(null);
    }
    if (activeTab === "security-logs" && isAuthenticated) {
      fetchSecurityLogs();
      fetchExamsAndRegistrations();
    }
  }, [activeTab, isAuthenticated]);

  const handleLogout = async () => {
    try {
      await adminFetch("POST", undefined, { action: "logout" });
    } catch (err) {
      console.error("Failed to logout on server:", err);
    }
    localStorage.removeItem("is_authenticated");
    localStorage.removeItem("user_email");
    router.push("/admin");
  };

  const handleResolve = async (id: string) => {
    // Optimistic update
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, flagsCount: 0, integrityScore: 100, severity: "Normal", lastFlagType: "None (Resolved)" } : s
      )
    );
    await adminFetch("POST", undefined, { action: "resolve_session", sessionId: id });
    if (activeStreamSession?.id === id) setActiveStreamSession(null);
  };

  const handleDismiss = async (id: string) => {
    // Optimistic update
    setSessions((prev) => prev.filter((s) => s.id !== id));
    await adminFetch("POST", undefined, { action: "dismiss_session", sessionId: id });
    if (activeStreamSession?.id === id) setActiveStreamSession(null);
  };


  
  const addCustomField = () => {
    setCustomFields([...customFields, { key: "", value: "" }]);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, idx) => idx !== index));
  };

  const updateCustomField = (index: number, field: "key" | "value", value: string) => {
    setCustomFields(
      customFields.map((cf, idx) => (idx === index ? { ...cf, [field]: value } : cf))
    );
  };

  const handlePublishExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTypes = typesOfQnsList.filter(t => t.trim()).join(", ");
    const finalDescription = descriptionsList.filter(d => d.trim()).join("\n\n");

    if (!examName || !examDate || !examTime || !totalQns || !finalTypes || !companyName) {
      setPublishError("Please fill out all required fields.");
      return;
    }

    setIsPublishing(true);
    setPublishError("");
    setPublishSuccess(false);

    try {
      const customFieldsObj: Record<string, string> = {};
      customFields.forEach((cf) => {
        if (cf.key.trim()) customFieldsObj[cf.key.trim()] = cf.value;
      });
      if (examDuration.trim()) customFieldsObj["Duration"] = `${examDuration.trim()} minutes`;

      const res = await adminFetch("POST", undefined, {
        action: "create_exam",
        examData: {
          name: examName,
          date: examDate,
          time: examTime,
          description: finalDescription,
          total_qns: Number(totalQns),
          types_of_qns: finalTypes,
          company_name: companyName,
          company_logo: companyLogo,
          custom_fields: customFieldsObj,
        },
      });

      if (!res.success) {
        setPublishError(res.error || "Failed to publish exam.");
      } else {
        setPublishSuccess(true);
        setExamName(""); setExamDate(""); setExamTime(""); setExamDescription("");
        setTotalQns(""); setTypesOfQns(""); setCompanyName(""); setCompanyLogo("");
        setExamDuration(""); setTypesOfQnsList([""]); setDescriptionsList([""]); setCustomFields([]);
      }
    } catch (err: any) {
      setPublishError(err.message || "An unexpected error occurred.");
    } finally {
      setIsPublishing(false);
    }
  };


  
  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.exam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.lastFlagType.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (selectedSeverity === "All") return matchesSearch;
    return matchesSearch && s.severity === selectedSeverity;
  });

  const totalFlags = sessions.reduce((sum, s) => sum + s.flagsCount, 0);

  const getPercentage = (keyword: string) => {
    if (totalFlags === 0) return 0;
    const count = sessions
      .filter((s) => s.lastFlagType.toLowerCase().includes(keyword.toLowerCase()))
      .reduce((sum, s) => sum + s.flagsCount, 0);
    return Math.round((count / totalFlags) * 100);
  };

  const tabPct = getPercentage("tab");
  const gazePct = getPercentage("gaze");
  const facePct = getPercentage("face") + getPercentage("absent");
  const audioPct = getPercentage("audio");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center font-sans text-zinc-900">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-full border-2 border-t-orange-500 border-r-zinc-300 border-b-zinc-300 border-l-zinc-300 animate-spin mb-4" />
          <p className="text-zinc-500 text-xs">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-800 flex flex-col lg:flex-row font-sans">
      
      {}
      <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-zinc-200 flex flex-col shrink-0">
        
        {}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-zinc-200">
          <img
            src="https://ik.imagekit.io/dypkhqxip/redlix%20new?updatedAt=1781042212493"
            alt="Logo"
            className="w-8 h-8 object-contain shrink-0"
          />
          <div>
            <span className="font-bold text-sm text-zinc-900">Redlix</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-none bg-orange-100 text-orange-700 font-semibold normal-case">Secure</span>
          </div>
        </div>

        {}
        <nav className="flex-1 px-4 py-6 space-y-1">

          <button 
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "overview" 
                ? "bg-zinc-100 text-zinc-900 shadow-sm border-l-2 border-orange-500" 
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <span className="material-symbols-outlined text-sm text-zinc-500 shrink-0">dashboard</span>
            Overview
          </button>

          <button 
            onClick={() => setActiveTab("create-exam")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "create-exam" 
                ? "bg-zinc-100 text-zinc-900 shadow-sm border-l-2 border-orange-500" 
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <span className="material-symbols-outlined text-sm text-zinc-500 shrink-0">add_circle</span>
            Create Exam
          </button>

          <button 
            onClick={() => setActiveTab("exams-list")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "exams-list" 
                ? "bg-zinc-100 text-zinc-900 shadow-sm border-l-2 border-orange-500" 
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <span className="material-symbols-outlined text-sm text-zinc-500 shrink-0">folder</span>
            Exams Directory
          </button>

          <button 
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "settings" 
                ? "bg-zinc-100 text-zinc-900 shadow-sm border-l-2 border-orange-500" 
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <span className="material-symbols-outlined text-sm text-zinc-500 shrink-0">settings</span>
            Settings
          </button>

          <button 
            onClick={() => setActiveTab("security-logs")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "security-logs" 
                ? "bg-zinc-100 text-zinc-900 shadow-sm border-l-2 border-orange-500" 
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <span className="material-symbols-outlined text-sm text-zinc-500 shrink-0">policy</span>
            IP Security Logs
          </button>
        </nav>

        {}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-none bg-white flex items-center justify-center font-bold text-xs text-orange-600 border border-zinc-200">
              AD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-zinc-900 truncate">{userEmail}</p>
              <p className="text-[10px] text-zinc-500 normal-case font-semibold">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-none bg-white hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900 text-xs font-medium transition-all border border-zinc-200 cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-xs text-zinc-500 shrink-0">logout</span>
            Sign Out
          </button>
        </div>

      </aside>

      {}
      <main className="flex-1 flex flex-col min-w-0">
        
        {}
        <header className="h-16 border-b border-zinc-200 flex items-center justify-between px-6 bg-white">
          <div className="flex items-center gap-4">
            <h1 className="text-md font-bold text-zinc-900 normal-case">
              {activeTab === "overview"
                ? "System Overview"
                : activeTab === "settings"
                ? "Settings & Diagnostics"
                : activeTab === "exams-list"
                ? "Exams Directory"
                : activeTab === "security-logs"
                ? "IP Security Logs"
                : "Create Exam"}
            </h1>
            <div className="flex items-center gap-2 bg-emerald-50 px-2 py-0.5 rounded-none text-[10px] text-emerald-700 font-semibold border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              Connected
            </div>
          </div>
          
          <div className="text-xs text-zinc-500 font-mono hidden md:block">
            Clock: <span className="text-zinc-800">{clockTime}</span>
          </div>
        </header>

        {loading ? (
          
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-t-orange-500 border-r-zinc-200 border-b-zinc-200 border-l-zinc-200 animate-spin mb-4" />
            <p className="text-zinc-500 text-xs">Loading database records...</p>
          </div>
        ) : activeTab === "overview" ? (
          <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-zinc-50">
            {/* Top row: 4 Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Total Exams */}
              <div className="bg-white py-3 px-4 border border-zinc-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold normal-case text-zinc-500">Exams Directory</span>
                  <div className="p-1 bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center rounded-none shrink-0"><span className="material-symbols-outlined text-md">folder</span></div>
                </div>
                <div className="text-2xl font-bold text-zinc-900">{exams.length}</div>
                <p className="text-[10px] text-zinc-500 mt-1 font-semibold font-sans">
                  {exams.filter(e => e.is_started).length} currently active & open
                </p>
              </div>

              {/* Card 2: Candidate Registrations */}
              <div className="bg-white py-3 px-4 border border-zinc-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold normal-case text-zinc-500">Registrations</span>
                  <div className="p-1 bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center rounded-none shrink-0"><span className="material-symbols-outlined text-md">group</span></div>
                </div>
                <div className="text-2xl font-bold text-zinc-900">{registrations.length}</div>
                <p className="text-[10px] text-zinc-500 mt-1 font-semibold font-sans">
                  Total candidates verified and registered
                </p>
              </div>

              {/* Card 3: Live Session Room Connections */}
              <div className="bg-white py-3 px-4 border border-zinc-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold normal-case text-zinc-500">Active Sessions</span>
                  <div className="p-1 flex items-center justify-center bg-green-50 text-green-700 border border-green-150 rounded-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-650 animate-pulse inline-block mr-1" />
                    <span className="text-[9px] font-bold normal-case">Live</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-zinc-900">{sessions.length}</div>
                <p className="text-[10px] text-zinc-500 mt-1 font-semibold font-sans">
                  Candidates currently sitting exams
                </p>
              </div>

              {/* Card 4: System Average Integrity */}
              <div className="bg-white py-3 px-4 border border-zinc-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-bold normal-case text-zinc-500">Avg Integrity</span>
                  <div className="p-1 bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center rounded-none shrink-0"><span className="material-symbols-outlined text-md">verified_user</span></div>
                </div>
                <div className="text-2xl font-bold text-zinc-900">
                  {sessions.length > 0
                    ? `${Math.round(sessions.reduce((acc, curr) => acc + curr.integrityScore, 0) / sessions.length)}%`
                    : "100%"
                  }
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 font-semibold font-sans">
                  {sessions.filter(s => s.severity === "Critical").length} critical warnings active
                </p>
              </div>

            </div>

            {/* Bottom Row: Quick Live Candidate Feed (only if sessions.length > 0) */}
            <div className="bg-white border border-zinc-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold normal-case text-zinc-800">Active Live Proctoring Room</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">Real-time listing of active candidate security index status</p>
                </div>
                {sessions.length > 0 && (
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-none animate-pulse" />
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 text-[10px] font-bold text-zinc-500 normal-case">
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Exam</th>
                      <th className="px-6 py-4 text-center">Anomalies</th>
                      <th className="px-6 py-4 text-center">Integrity</th>
                      <th className="px-6 py-4">Last Violation Log</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-xs">
                    {sessions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-zinc-400 font-semibold italic">
                          No candidate currently taking an exam. Real-time proctor stream idle.
                        </td>
                      </tr>
                    ) : (
                      sessions.map((session) => (
                        <tr key={session.id} className="hover:bg-zinc-50/50 text-zinc-700">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-none bg-zinc-100 flex items-center justify-center font-bold text-xs text-zinc-650 border border-zinc-200">
                                {session.avatar}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-zinc-900">{session.student}</p>
                                  {onlineStudents.has(session.id) ? (
                                    <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-50 text-emerald-700 px-1 border border-emerald-250 font-bold uppercase rounded-none shrink-0 scale-90">
                                      <span className="w-1 h-1 rounded-full bg-emerald-600 animate-pulse" />
                                      Online
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[9px] bg-red-50 text-red-650 px-1 border border-red-150 font-bold uppercase rounded-none shrink-0 scale-90">
                                      <span className="w-1 h-1 rounded-full bg-red-500" />
                                      Offline
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-zinc-400">{session.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <p className="font-medium text-zinc-800">{session.exam}</p>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-none font-bold text-[9px] ${
                              session.flagsCount > 3 
                                ? "bg-red-50 text-red-650 border border-red-100" 
                                : session.flagsCount > 0 
                                ? "bg-amber-50 text-amber-650 border border-amber-100"
                                : "bg-zinc-100 text-zinc-500 border border-zinc-200"
                            }`}>
                              {session.flagsCount} flags
                            </span>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className={`font-mono font-bold ${
                              session.integrityScore > 85 
                                ? "text-emerald-600" 
                                : session.integrityScore > 60 
                                ? "text-amber-600" 
                                : "text-red-600"
                            }`}>
                              {session.integrityScore}%
                            </span>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-1.5">
                              {session.severity === "Critical" ? (
                                <span className="w-1.5 h-1.5 rounded-none bg-red-500" />
                              ) : session.severity === "Warning" ? (
                                <span className="w-1.5 h-1.5 rounded-none bg-amber-500" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-none bg-emerald-500" />
                              )}
                              <span className="text-zinc-800 font-medium">{session.lastFlagType}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <button
                              onClick={() => {
                                setActiveStreamSession(session);
                              }}
                              className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-[10px] rounded-none cursor-pointer shadow-sm transition-all border-none"
                            >
                              Watch Live Stream
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Real-time Webcam Stream Grid */}
            <div className="bg-white border border-zinc-200 shadow-sm overflow-hidden mt-6">
              <div className="p-5 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold normal-case text-zinc-800">Simultaneous Live Webcam Feeds</h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">Real-time simultaneous view of all active candidate screens/webcams</p>
                </div>
                {sessions.length > 0 && (
                  <span className="text-[10px] font-bold text-orange-600 uppercase bg-orange-50 border border-orange-200 px-2 py-0.5">
                    {sessions.length} Active Stream{sessions.length === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              
              {sessions.length === 0 ? (
                <div className="p-10 text-center text-zinc-400 font-semibold italic text-xs">
                  No active streams to show.
                </div>
              ) : (
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {sessions.map((session) => (
                    <div key={session.id} className="border border-zinc-200 bg-white shadow-sm flex flex-col">
                      <div className="bg-zinc-800 px-3 py-2 text-white flex items-center justify-between">
                        <div className="truncate pr-2">
                          <span className="font-semibold text-xs">{session.student}</span>
                          <span className="text-[9px] text-zinc-400 block font-mono leading-none mt-0.5 truncate">{session.id}</span>
                        </div>
                        {onlineStudents.has(session.id) ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Online" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" title="Offline" />
                        )}
                      </div>
                      
                      <div className="relative aspect-video bg-zinc-950 flex items-center justify-center overflow-hidden border-b border-zinc-200">
                        {session.liveFeed ? (
                          <img 
                            src={session.liveFeed} 
                            alt={session.student} 
                            className="w-full h-full object-cover scale-x-[-1]" 
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 p-2 text-center bg-zinc-900">
                            <span className="material-symbols-outlined text-lg mb-1 animate-pulse">videocam_off</span>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Waiting for feed...</span>
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 text-[9px] text-zinc-350 font-mono rounded">
                          Integrity: {session.integrityScore}%
                        </div>
                      </div>
                      
                      <div className="p-3 bg-zinc-50 text-[10px] flex justify-between items-center text-zinc-650">
                        <span>Anomalies: <span className="font-semibold">{session.flagsCount}</span></span>
                        <button
                          onClick={() => {
                            setActiveStreamSession(session);
                          }}
                          className="text-[9px] font-bold text-orange-600 hover:text-orange-700 bg-transparent border-none cursor-pointer uppercase tracking-wider"
                        >
                          View Detail & Resolve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : activeTab === "settings" ? (
          <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-zinc-50">
              {/* Mid Section: Page stats and system checklist */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Box: System Pages Status & Info */}
                <div className="lg:col-span-2 bg-white border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-5 border-b border-zinc-200 bg-zinc-50">
                    <h3 className="text-xs font-bold normal-case text-zinc-800">System & Page Status Directory</h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">Real-time status check and paths of active proctoring web pages</p>
                  </div>
                  
                  <div className="divide-y divide-zinc-200 font-sans">
                    
                    {/* Row 1: Login Portal */}
                    <div className="p-5 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                      <div className="space-y-1 pr-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-zinc-900">Candidate Login Portal</span>
                          <span className="font-mono text-[9px] bg-zinc-100 text-zinc-650 px-1.5 py-0.5 border border-zinc-200">/exam-login</span>
                        </div>
                        <p className="text-[11px] text-zinc-550">Secure entry point for candidates. Validates hall ticket number against registration database records.</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-2 py-0.5 text-[9px] font-bold normal-case bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Online
                        </span>
                        <p className="text-[9px] text-zinc-400 mt-1">{exams.filter(e => e.show_login).length} entry doors open</p>
                      </div>
                    </div>
  
                    {/* Row 2: Verification Portal */}
                    <div className="p-5 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                      <div className="space-y-1 pr-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-zinc-900">Verification & Lobby</span>
                          <span className="font-mono text-[9px] bg-zinc-100 text-zinc-650 px-1.5 py-0.5 border border-zinc-200">/exam-ready</span>
                        </div>
                        <p className="text-[11px] text-zinc-550">Guidelines screen. Prompts candidate to review proctoring rules, verifies camera/mic access, and requests fullscreen permissions.</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-2 py-0.5 text-[9px] font-bold normal-case bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Operational
                        </span>
                        <p className="text-[9px] text-zinc-400 mt-1">Webcam check active</p>
                      </div>
                    </div>
  
                    {/* Row 3: Exam Room Portal */}
                    <div className="p-5 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                      <div className="space-y-1 pr-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-zinc-900">Secure Examination Room</span>
                          <span className="font-mono text-[9px] bg-zinc-100 text-zinc-650 px-1.5 py-0.5 border border-zinc-200">/exam-session</span>
                        </div>
                        <p className="text-[11px] text-zinc-550">Live test-taking screen. Tracks face detection, eye gaze deviation, tab switching, and fullscreen bypasses in real-time.</p>
                      </div>
                      <div className="text-right shrink-0">
                        {sessions.length > 0 ? (
                          <>
                            <span className="px-2 py-0.5 text-[9px] font-bold normal-case bg-green-500 text-white animate-pulse">
                              Monitoring
                            </span>
                            <p className="text-[9px] text-zinc-500 mt-1 font-semibold">{sessions.length} streams active</p>
                          </>
                        ) : (
                          <>
                            <span className="px-2 py-0.5 text-[9px] font-bold normal-case bg-zinc-100 text-zinc-500 border border-zinc-200">
                              No Active Tests
                            </span>
                            <p className="text-[9px] text-zinc-400 mt-1">Ready for sessions</p>
                          </>
                        )}
                      </div>
                    </div>
  
                    {/* Row 4: Admin Console */}
                    <div className="p-5 flex items-center justify-between hover:bg-zinc-50/50 transition-colors">
                      <div className="space-y-1 pr-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-zinc-900">Administrator Console</span>
                          <span className="font-mono text-[9px] bg-zinc-100 text-zinc-650 px-1.5 py-0.5 border border-zinc-200">/dashboard</span>
                        </div>
                        <p className="text-[11px] text-zinc-550">Central manager for publishing exams, reviewing candidate logs, resolving anomalies, and viewing proctor status.</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="px-2 py-0.5 text-[9px] font-bold normal-case bg-orange-50 text-orange-700 border border-orange-200">
                          Operational
                        </span>
                        <p className="text-[9px] text-zinc-400 mt-1">Admin session verified</p>
                      </div>
                    </div>
  
                  </div>
                </div>
  
                {/* Right Box: System Status & Diagnostic Checks */}
                <div className="bg-white border border-zinc-200 shadow-sm p-6 space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs font-bold normal-case text-zinc-800">Diagnostic & Health Checks</h3>
                      <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">Localhost and database connectivity index</p>
                    </div>
  
                    <div className="space-y-3 pt-2 font-sans">
                      
                      {/* Database Health */}
                      <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-none shrink-0" />
                          <div>
                            <p className="font-bold text-zinc-800">Database Engine</p>
                            <p className="text-[10px] text-zinc-400">PostgreSQL (Supabase transaction pooler)</p>
                          </div>
                        </div>
                        <span className="font-mono text-[10px] text-emerald-600 font-bold normal-case">Connected</span>
                      </div>
  
                      {/* RLS Policies */}
                      <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-none shrink-0" />
                          <div>
                            <p className="font-bold text-zinc-800">Row Level Security</p>
                            <p className="text-[10px] text-zinc-400">12 table policies active & verified</p>
                          </div>
                        </div>
                        <span className="font-mono text-[10px] text-emerald-600 font-bold normal-case">Enforced</span>
                      </div>
  
                      {/* Localhost cloudflare Turnstile bypass */}
                      <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 bg-amber-500 rounded-none shrink-0" />
                          <div>
                            <p className="font-bold text-zinc-800">Cloudflare Turnstile</p>
                            <p className="text-[10px] text-zinc-400">Bypass rule active on localhost</p>
                          </div>
                        </div>
                        <span className="font-mono text-[10px] text-amber-600 font-bold normal-case">Local Dev</span>
                      </div>
  
                      {/* Media streaming pipe */}
                      <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-none shrink-0" />
                          <div>
                            <p className="font-bold text-zinc-800">Media Pipeline</p>
                            <p className="text-[10px] text-zinc-400">WebRTC frame-based canvas capture</p>
                          </div>
                        </div>
                        <span className="font-mono text-[10px] text-emerald-600 font-bold normal-case">Online</span>
                      </div>
  
                    </div>
                  </div>
  
                  <div className="border-t border-zinc-200 pt-4 text-center font-sans">
                    <span className="text-[10px] text-zinc-400 font-mono">
                      System clock synced: {clockTime}
                    </span>
                  </div>
                </div>
  
              </div>
  
          </div>
        ) : activeTab === "create-exam" ? (
          
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="max-w-2xl bg-white rounded-none border border-zinc-200 shadow-sm p-6 space-y-6">
              
              <div>
                <h3 className="text-xs font-bold normal-case text-zinc-500 mb-1">Create Exam</h3>
                <p className="text-xs text-zinc-400">Configure and publish a new exam card to the public directory</p>
              </div>

              {publishSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  Exam published successfully! It is now visible on the scheduled exams page.
                </div>
              )}

              {publishError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
                  {publishError}
                </div>
              )}

              <form onSubmit={handlePublishExam} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1.5">Exam Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., CS-101: Midterm"
                      value={examName}
                      onChange={(e) => setExamName(e.target.value)}
                      className="text-sm w-full py-2 px-3 border border-zinc-300 rounded-none bg-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1.5">Conducting Company Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Redlix Secure"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="text-sm w-full py-2 px-3 border border-zinc-300 rounded-none bg-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1.5">Company Logo (Image File or URL)</label>
                  <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-zinc-50 border border-zinc-200">
                    <div className="w-12 h-12 bg-zinc-100 flex items-center justify-center overflow-hidden border border-zinc-300 shrink-0 relative">
                      {companyLogo ? (
                        <img src={companyLogo} alt="Logo Preview" className="w-full h-full object-contain" />
                      ) : (
                        <span className="material-symbols-outlined text-zinc-400">image</span>
                      )}
                    </div>
                    <div className="space-y-1 flex-1 w-full">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setCompanyLogo(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="text-xs file:mr-3 file:py-1 file:px-2 file:border file:border-zinc-300 file:text-[10px] file:font-semibold file:bg-white file:text-zinc-700 hover:file:bg-zinc-50 cursor-pointer"
                      />
                      <input
                        type="text"
                        placeholder="Or paste image URL"
                        value={companyLogo}
                        onChange={(e) => setCompanyLogo(e.target.value)}
                        className="text-xs w-full py-1.5 px-2.5 border border-zinc-300 rounded-none bg-white focus:outline-none focus:border-orange-500 mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1.5">Date *</label>
                    <input
                      type="date"
                      required
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      className="text-sm w-full py-2 px-3 border border-zinc-300 rounded-none bg-white focus:outline-none focus:border-orange-500 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1.5">Time *</label>
                    <input
                      type="time"
                      required
                      value={examTime}
                      onChange={(e) => setExamTime(e.target.value)}
                      className="text-sm w-full py-2 px-3 border border-zinc-300 rounded-none bg-white focus:outline-none focus:border-orange-500 font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1.5">Total Questions *</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g., 50"
                      value={totalQns}
                      onChange={(e) => setTotalQns(e.target.value)}
                      className="text-sm w-full py-2 px-3 border border-zinc-300 rounded-none bg-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1.5">Exam Duration (Minutes)</label>
                    <input
                      type="number"
                      placeholder="e.g., 120"
                      value={examDuration}
                      onChange={(e) => setExamDuration(e.target.value)}
                      className="text-sm w-full py-2 px-3 border border-zinc-300 rounded-none bg-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold normal-case text-zinc-500">Question Types *</label>
                    <button
                      type="button"
                      onClick={() => setTypesOfQnsList([...typesOfQnsList, ""])}
                      className="px-2 py-1 bg-zinc-800 text-white text-[10px] font-bold normal-case rounded-none hover:bg-zinc-700 cursor-pointer transition-all border-none"
                    >
                      + Add Type
                    </button>
                  </div>
                  <div className="space-y-2">
                    {typesOfQnsList.map((tq, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          required
                          placeholder="e.g., Multiple Choice, Coding, Essay"
                          value={tq}
                          onChange={(e) => {
                            const updated = [...typesOfQnsList];
                            updated[idx] = e.target.value;
                            setTypesOfQnsList(updated);
                          }}
                          className="text-xs flex-1 py-1.5 px-2.5 border border-zinc-300 rounded-none bg-white focus:outline-none focus:border-orange-500"
                        />
                        {typesOfQnsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setTypesOfQnsList(typesOfQnsList.filter((_, i) => i !== idx))}
                            className="px-2 py-1.5 text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold normal-case text-zinc-500">Description Sections *</label>
                    <button
                      type="button"
                      onClick={() => setDescriptionsList([...descriptionsList, ""])}
                      className="px-2 py-1 bg-zinc-800 text-white text-[10px] font-bold normal-case rounded-none hover:bg-zinc-700 cursor-pointer transition-all border-none"
                    >
                      + Add Section
                    </button>
                  </div>
                  <div className="space-y-2">
                    {descriptionsList.map((desc, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                        <textarea
                          rows={2}
                          required
                          placeholder="Provide a section of exam guidelines or rules..."
                          value={desc}
                          onChange={(e) => {
                            const updated = [...descriptionsList];
                            updated[idx] = e.target.value;
                            setDescriptionsList(updated);
                          }}
                          className="text-xs flex-1 py-1.5 px-2.5 border border-zinc-300 rounded-none bg-white focus:outline-none focus:border-orange-500"
                        />
                        {descriptionsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setDescriptionsList(descriptionsList.filter((_, i) => i !== idx))}
                            className="px-2 py-1.5 text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer pt-2"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold normal-case text-zinc-500">Custom Fields</span>
                    <button
                      type="button"
                      onClick={addCustomField}
                      className="px-2 py-1 bg-zinc-800 text-white text-[10px] font-bold normal-case rounded-none hover:bg-zinc-700 cursor-pointer transition-all border-none"
                    >
                      + Add Field
                    </button>
                  </div>

                  {customFields.length > 0 && (
                    <div className="space-y-2">
                      {customFields.map((cf, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Field Label (e.g. Duration)"
                            required
                            value={cf.key}
                            onChange={(e) => updateCustomField(idx, "key", e.target.value)}
                            className="text-xs w-1/3 py-1.5 px-2.5 border border-zinc-300 rounded-none bg-white focus:outline-none focus:border-orange-500"
                          />
                          <input
                            type="text"
                            placeholder="Field Value (e.g. 120 mins)"
                            required
                            value={cf.value}
                            onChange={(e) => updateCustomField(idx, "value", e.target.value)}
                            className="text-xs w-1/2 py-1.5 px-2.5 border border-zinc-300 rounded-none bg-white focus:outline-none focus:border-orange-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeCustomField(idx)}
                            className="px-2 py-1.5 text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-200">
                  <button
                    type="submit"
                    disabled={isPublishing}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs rounded-none shadow-sm transition-all cursor-pointer disabled:bg-zinc-300 disabled:cursor-not-allowed border-none"
                  >
                    {isPublishing ? "Publishing..." : "Publish Exam"}
                  </button>
                </div>
              </form>

            </div>
          </div>
        ) : activeTab === "exams-list" ? (
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {loadingExamsTab ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-t-orange-500 border-r-zinc-200 border-b-zinc-200 border-l-zinc-200 animate-spin mb-4" />
                <p className="text-zinc-500 text-xs">Loading directory...</p>
              </div>
            ) : selectedExamForCandidates ? (
              
              <div className="space-y-6">
                {}
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedExamForCandidates(null)} className="flex items-center justify-center p-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900 cursor-pointer shadow-sm"><span className="material-symbols-outlined text-sm leading-none">arrow_back</span></button>
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900 tracking-tight">{selectedExamForCandidates.name}</h2>
                    <p className="text-xs text-zinc-500">Registered Candidates for <span className="font-semibold text-zinc-700">{selectedExamForCandidates.company_name}</span> Evaluation</p>
                  </div>
                </div>

                {}
                {registrations.filter((r) => r.exam_id === selectedExamForCandidates.id).length === 0 ? (
                  <div className="py-16 text-center bg-white border border-zinc-200 shadow-sm p-8">
                    <p className="text-zinc-500 text-sm font-medium">No candidates registered for this exam yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {registrations
                      .filter((r) => r.exam_id === selectedExamForCandidates.id)
                      .map((candidate) => (
                        <div key={candidate.id} className="bg-white border border-zinc-200 shadow-sm p-5 flex flex-col sm:flex-row gap-4">
                          <div className="w-20 h-20 bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0">
                            {candidate.photo_url ? (
                              <img src={candidate.photo_url} alt={candidate.candidate_name} className="w-full h-full object-cover animate-fade-in" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-zinc-200 text-zinc-400"><span className="material-symbols-outlined text-xl text-zinc-400">person</span></div>
                            )}
                          </div>
                          <div className="space-y-2 flex-1 min-w-0">
                            <div>
                              <h4 className="text-sm font-bold text-zinc-955 truncate leading-snug">{candidate.candidate_name}</h4>
                              <p className="text-[10px] text-zinc-400 font-semibold normal-case leading-tight mt-0.5">{candidate.year_of_study} • {candidate.department}</p>
                            </div>
                            
                            <div className="text-xs text-zinc-600 space-y-1 pt-1 border-t border-zinc-100 font-normal">
                              {candidate.registration_number && (
                                <p className="font-mono"><span className="text-zinc-400 font-sans">Reg No:</span> {candidate.registration_number}</p>
                              )}
                              {candidate.hall_ticket_number && (
                                <p className="font-mono"><span className="text-zinc-400 font-sans">Hall Ticket:</span> {candidate.hall_ticket_number}</p>
                              )}
                              <p className="truncate"><span className="text-zinc-400">Email:</span> {candidate.email}</p>
                              <p className="truncate"><span className="text-zinc-400">Phone:</span> {candidate.phone}</p>
                              <p className="truncate"><span className="text-zinc-400">College:</span> {candidate.college}</p>
                            </div>
                            <div className="pt-2 border-t border-zinc-100 flex justify-between items-center">
                              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider font-mono">
                                {Object.keys(candidate.answers ?? {}).length} Saved
                              </span>
                              <button
                                onClick={() => setSelectedCandidateForAnswers(candidate)}
                                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] uppercase tracking-wider rounded-none cursor-pointer border-none transition-colors flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-xs leading-none">visibility</span>
                                Show
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ) : (
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold normal-case text-zinc-500 mb-1">Exams Listing</h3>
                  <p className="text-xs text-zinc-400">Manage exam instances and view registered student profiles</p>
                </div>

                {exams.length === 0 ? (
                  <div className="py-16 text-center bg-white border border-zinc-200 shadow-sm p-8">
                    <p className="text-zinc-500 text-sm font-medium">No published exams found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {exams.map((exam) => {
                      const regsCount = registrations.filter((r) => r.exam_id === exam.id).length;
                      return (
                        <div 
                          key={exam.id} 
                          className="bg-white border border-zinc-200 shadow-sm p-6 flex flex-col justify-between hover:border-orange-500/30 transition-all duration-200"
                        >
                          <div className="space-y-4">
                            <div>
                              <span className="text-[9px] font-bold normal-case bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-none">
                                {exam.company_name}
                              </span>
                              <h3 className="text-lg font-bold text-zinc-900 mt-2 tracking-tight leading-snug">
                                {exam.name}
                              </h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-3 border-y border-zinc-100 text-xs font-medium text-zinc-600">
                              <div>
                                <p className="text-[10px] text-zinc-400 normal-case mb-0.5">Schedule</p>
                                <p className="text-zinc-800 font-semibold">{exam.date}</p>
                                <p className="text-zinc-500 font-normal">{exam.time} IST</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-zinc-400 normal-case mb-0.5">Details</p>
                                <p className="text-zinc-800 font-semibold">{exam.total_qns} Qns • {exam.types_of_qns}</p>
                                <p className="text-zinc-500 font-bold text-orange-600 normal-case mt-0.5 text-[9px]">
                                  {regsCount} {regsCount === 1 ? "Registrant" : "Registrants"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 mt-4 border-t border-zinc-100 space-y-3">
                            {/* Submit Code Section */}
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Submit Code</span>
                                {exam.submit_code ? (
                                  <span className="font-mono text-base font-bold tracking-[0.3em] text-orange-600 bg-orange-50 border border-orange-200 px-3 py-0.5">
                                    {exam.submit_code}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-zinc-400 italic">No code set</span>
                                )}
                              </div>
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleGenerateCode(exam)}
                                  disabled={generatingCodeId === exam.id}
                                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-[10px] uppercase tracking-wider rounded-none cursor-pointer border-none transition-colors"
                                >
                                  {generatingCodeId === exam.id ? "..." : exam.submit_code ? "Regenerate" : "Generate Code"}
                                </button>
                                {exam.submit_code && (
                                  <button
                                    onClick={() => handleClearCode(exam)}
                                    className="px-3 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-bold text-[10px] uppercase tracking-wider rounded-none cursor-pointer border-none transition-colors"
                                  >
                                    Clear
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Status badges + action buttons */}
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              {}
                              <div className="flex gap-1.5">
                                <span className={`text-[9px] font-bold normal-case px-2 py-1 border ${
                                  exam.is_started
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-zinc-50 text-zinc-500 border-zinc-200"
                                }`}>
                                  {exam.is_started ? "Exam Active" : "Not Started"}
                                </span>
                                <span className={`text-[9px] font-bold normal-case px-2 py-1 border ${
                                  exam.show_login
                                    ? "bg-orange-50 text-orange-700 border-orange-200"
                                    : "bg-zinc-50 text-zinc-500 border-zinc-200"
                                }`}>
                                  {exam.show_login ? "Entry Open" : "Entry Closed"}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => toggleExamShowLogin(exam)}
                                  className={`px-3 py-1.5 font-semibold text-xs rounded-none shadow-sm transition-colors cursor-pointer border-none ${
                                    exam.show_login
                                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                                      : "bg-orange-500 hover:bg-orange-600 text-white"
                                  }`}
                                >
                                  {exam.show_login ? "Hide Entry Button" : "Show Entry Button"}
                                </button>
                                <button
                                  onClick={() => toggleExamStarted(exam)}
                                  className={`px-3 py-1.5 font-semibold text-xs rounded-none shadow-sm transition-colors cursor-pointer border-none ${
                                    exam.is_started
                                      ? "bg-red-500 hover:bg-red-600 text-white"
                                      : "bg-green-600 hover:bg-green-700 text-white"
                                  }`}
                                >
                                  {exam.is_started ? "Disable Exam" : "Enable Exam"}
                                </button>
                                <button
                                  onClick={() => setSelectedExamForCandidates(exam)}
                                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-900 text-white font-semibold text-xs rounded-none shadow-sm transition-colors cursor-pointer border-none"
                                >
                                  Candidates ({regsCount})
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : activeTab === "security-logs" ? (
          <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-sm font-bold normal-case text-zinc-800">IP & Proctoring Security Logs</h3>
                <p className="text-xs text-zinc-400">Review real-time proctoring violations, user agents, IP logs, and manage exam locks</p>
              </div>
              <button
                onClick={fetchSecurityLogs}
                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase rounded-none cursor-pointer transition-all border-none"
              >
                Refresh Logs
              </button>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white border border-zinc-200 p-5 shadow-sm">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Total Security Events</p>
                <p className="text-lg font-bold text-zinc-800 mt-1">{securityLogs.length}</p>
              </div>
              <div className="bg-white border border-zinc-200 p-5 shadow-sm">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Active Lockouts / Blocks</p>
                <p className="text-lg font-bold text-red-650 mt-1">
                  {registrations.filter((r) => r.blocked).length} Candidates Blocked
                </p>
              </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white border border-zinc-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 font-bold text-zinc-650">
                      <th className="px-6 py-3">Timestamp</th>
                      <th className="px-6 py-3">Candidate Details</th>
                      <th className="px-6 py-3">IP & User Agent</th>
                      <th className="px-6 py-3">Event Type</th>
                      <th className="px-6 py-3">Violation Details</th>
                      <th className="px-6 py-3 text-right">Status / Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {loadingSecurityLogs ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 italic">
                          Querying security logs database records, please wait...
                        </td>
                      </tr>
                    ) : securityLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 italic">
                          No security events or violations logged in the database.
                        </td>
                      </tr>
                    ) : (
                      securityLogs.map((log) => {
                        const candidate = registrations.find(
                          (r) => r.hall_ticket_number?.toLowerCase() === log.session_id?.toLowerCase()
                        );
                        const isCandidateBlocked = candidate?.blocked ?? false;

                        return (
                          <tr key={log.id} className="hover:bg-zinc-50/50">
                            <td className="px-6 py-3.5 whitespace-nowrap text-zinc-500 font-mono text-[10px]">
                              {new Date(log.created_at).toLocaleString()}
                            </td>
                            <td className="px-6 py-3.5">
                              {candidate ? (
                                <div>
                                  <p className="font-semibold text-zinc-900">{candidate.candidate_name}</p>
                                  <p className="text-[10px] text-zinc-400 font-mono leading-tight">{log.session_id}</p>
                                </div>
                              ) : (
                                <p className="font-mono text-zinc-750">{log.session_id}</p>
                              )}
                            </td>
                            <td className="px-6 py-3.5">
                              <p className="font-mono text-zinc-805">{log.ip_address}</p>
                              <p className="text-[9px] text-zinc-400 truncate max-w-[180px]" title={log.user_agent}>
                                {log.user_agent}
                              </p>
                            </td>
                            <td className="px-6 py-3.5">
                              <span className={`px-2 py-0.5 font-bold tracking-wider text-[9px] border uppercase rounded-none ${
                                log.event_type === "PROCTORING_VIOLATION"
                                  ? "bg-red-50 text-red-700 border-red-200"
                                  : "bg-orange-50 text-orange-700 border-orange-200"
                              }`}>
                                {log.event_type}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-zinc-700 max-w-[200px] truncate" title={log.details}>
                              {log.details || "None"}
                            </td>
                            <td className="px-6 py-3.5 text-right whitespace-nowrap">
                              {isCandidateBlocked ? (
                                <div className="flex items-center justify-end gap-2">
                                  <span className="px-1.5 py-0.5 bg-red-105 text-red-800 text-[9px] font-bold border border-red-200 uppercase rounded-none">
                                    Locked
                                  </span>
                                  <button
                                    onClick={() => handleReEnableExam(log.session_id)}
                                    disabled={reEnablingId === log.session_id}
                                    className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] rounded-none cursor-pointer border-none transition-all uppercase tracking-wider disabled:opacity-50"
                                  >
                                    {reEnablingId === log.session_id ? "Re-enabling..." : "Re-enable Exam"}
                                  </button>
                                </div>
                              ) : (
                                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-250 uppercase rounded-none">
                                  Allowed
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}

      </main>

      {}
  {activeStreamSession && (() => {
    const currentStream = sessions.find((s) => s.id === activeStreamSession.id) || activeStreamSession;
    return (
      <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        
        <div className="relative w-full max-w-lg bg-white border border-zinc-200 rounded-none overflow-hidden shadow-2xl">
          
          {}
          <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
            <div>
              <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                {onlineStudents.has(currentStream.id) ? (
                  <>
                    <span className="w-2 h-2 rounded-none bg-emerald-600 animate-pulse" />
                    Active Stream: {currentStream.student} (Online)
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-none bg-red-600 animate-pulse" />
                    Active Stream: {currentStream.student} (Offline)
                  </>
                )}
              </h3>
              <p className="text-[10px] text-zinc-500">{currentStream.exam} • ID: {currentStream.id}</p>
            </div>
            <button onClick={() => setActiveStreamSession(null)} className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"><span className="material-symbols-outlined text-md">close</span></button>
          </div>

          {}
          <div className="relative aspect-video bg-zinc-950 flex items-center justify-center overflow-hidden border-b border-zinc-200">
            {currentStream.liveFeed ? (
              <img 
                src={currentStream.liveFeed} 
                alt="Candidate webcam stream" 
                className="w-full h-full object-cover scale-x-[-1]" 
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
                
                {}
                <div className="absolute top-1/4 left-1/4 right-1/4 bottom-1/4 border border-orange-500/30 rounded-none flex items-center justify-center">
                  <div className="absolute inset-0 bg-orange-500/5 animate-pulse" />
                  
                  {}
                  <div className="w-4 h-4 border-t border-l border-orange-400 absolute top-0 left-0" />
                  <div className="w-4 h-4 border-t border-r border-orange-400 absolute top-0 right-0" />
                  <div className="w-4 h-4 border-b border-l border-orange-400 absolute bottom-0 left-0" />
                  <div className="w-4 h-4 border-b border-r border-orange-400 absolute bottom-0 right-0" />
                  
                  <span className="text-[10px] font-mono text-orange-400 normal-case font-semibold animate-pulse">
                    Waiting for Feed...
                  </span>
                </div>

                {}
                <svg className="absolute inset-0 w-full h-full text-orange-500/30" viewBox="0 0 400 225">
                  <path d="M 200,80 L 175,110 L 185,150 L 200,165 L 215,150 L 225,110 Z" fill="none" stroke="currentColor" strokeWidth={1.5} className="animate-pulse" />
                  <circle cx={185} cy={105} r={3} fill="currentColor" />
                  <circle cx={215} cy={105} r={3} fill="currentColor" />
                  <path d="M 180,135 Q 200,145 220,135" fill="none" stroke="currentColor" strokeWidth={1.5} />
                </svg>
              </>
            )}

            <div className="absolute bottom-4 left-4 p-2 bg-black/70 rounded-none border border-zinc-700 text-[10px] font-mono space-y-1 z-10">
              <p className="text-zinc-300">Status: <span className={currentStream.liveFeed ? "text-emerald-400 font-bold" : "text-amber-400 font-bold animate-pulse"}>{currentStream.liveFeed ? "Live streaming" : "Waiting for feed"}</span></p>
              <p className="text-zinc-300">Gaze state: <span className="text-emerald-400 font-bold">Stable</span></p>
            </div>

            <div className="absolute bottom-4 right-4 p-2 bg-black/70 rounded-none border border-zinc-700 text-[10px] font-mono z-10">
              <span className={`px-1.5 py-0.5 rounded-none font-bold normal-case ${
                currentStream.severity === "Critical"
                  ? "bg-red-500/20 text-red-400"
                  : "bg-amber-500/20 text-amber-400"
              }`}>
                {currentStream.lastFlagType}
              </span>
            </div>

          </div>

            {}
            <div className="p-4 bg-zinc-50 flex justify-between gap-3 border-t border-zinc-200">
              <span className="text-xs text-zinc-500 flex items-center">
                Total flags: {currentStream.flagsCount}
              </span>
              
              <div className="flex gap-2">
                <button
                  onClick={() => handleResolve(currentStream.id)}
                  disabled={currentStream.severity === "Normal"}
                  className={`px-3 py-1.5 rounded-none text-xs font-semibold border transition-all ${
                    currentStream.severity === "Normal"
                      ? "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 border-transparent text-white cursor-pointer"
                  }`}
                >
                  Mark Resolved
                </button>
                <button
                  onClick={() => handleDismiss(currentStream.id)}
                  className="px-3 py-1.5 rounded-none bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-zinc-900 text-xs font-semibold transition-all cursor-pointer"
                >
                  Dismiss Alert
                </button>
              </div>
            </div>

          </div>
        </div>
      );
    })()}

    {selectedCandidateForAnswers && (() => {
      const candidate = selectedCandidateForAnswers;
      const exam = exams.find((e) => e.id === candidate.exam_id);
      
      let candidateQuestions = QUESTIONS.map((q) => ({ ...q }));

      // ── Redlix Training Exam 01 ─────────────────────────────────────────
      const isTraining01Exam = exam && exam.name.toLowerCase().includes("redlix training exam 01");
      let training01Grade: ReturnType<typeof gradeTraining01Full> | null = null;

      if (isTraining01Exam) {
        candidateQuestions = TRAINING01_QUESTIONS.map((q) => ({ ...q }));
        if (candidate.answers) {
          training01Grade = gradeTraining01Full(candidate.answers as Record<string | number, string>);
        }
      } else if (candidate.exam_id === 4 || (exam && exam.name.toLowerCase().includes("student forge"))) {
        const sectionA = candidateQuestions.filter((q) => q.section === "A");
        const sectionB = candidateQuestions.filter((q) => q.section === "B");
        if (candidate.hall_ticket_number) {
          const shuffledA = shuffleQuestions(sectionA, candidate.hall_ticket_number).slice(0, 30);
          const shuffledB = shuffleQuestions(sectionB, candidate.hall_ticket_number + "-B");
          shuffledA.forEach((q, idx) => {
            q.number = idx + 1;
          });
          shuffledB.forEach((q, idx) => {
            q.number = idx + 1;
          });
          candidateQuestions = [...shuffledA, ...shuffledB];
        }
      }

      const mcqQuestions = candidateQuestions.filter(q => q.type === "mcq");
      const codingQuestions = candidateQuestions.filter(q => q.type === "coding");

      const isQuestionAttempted = (q: typeof QUESTIONS[0]) => {
        const ans = candidate.answers?.[q.id];
        if (!ans || ans.trim() === "") return false;
        if (q.type === "coding" && q.starterCode) {
          return ans.trim() !== q.starterCode.trim();
        }
        return true;
      };

      const mcqAttempted = mcqQuestions.filter(isQuestionAttempted).length;
      const codingAttempted = codingQuestions.filter(isQuestionAttempted).length;

      return (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in select-text">
          <div className="relative w-full max-w-4xl bg-white border border-zinc-250 rounded-none overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {}
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-zinc-950 flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-600 leading-none">assignment_ind</span>
                  Answers Review: {candidate.candidate_name}
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Hall Ticket: <span className="font-mono font-bold text-zinc-700">{candidate.hall_ticket_number}</span> • Exam: <span className="font-semibold text-zinc-700">{exam?.name || "Technical Assessment"}</span>
                </p>
              </div>
              <button 
                onClick={() => setSelectedCandidateForAnswers(null)} 
                className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-md">close</span>
              </button>
            </div>

            {}
            <div className="grid grid-cols-3 border-b border-zinc-200 bg-zinc-50/50 shrink-0 divide-x divide-zinc-200 text-center py-2.5">
              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-bold">Total Progress</p>
                <p className="text-sm font-bold text-zinc-800 mt-0.5">
                  {mcqAttempted + codingAttempted} / {candidateQuestions.length} Attempted
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-bold">Section A: MCQs</p>
                <p className="text-sm font-bold text-emerald-600 mt-0.5">
                  {mcqAttempted} / {mcqQuestions.length} Answered
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-bold">Section B: Coding</p>
                <p className="text-sm font-bold text-indigo-600 mt-0.5">
                  {codingAttempted} / {codingQuestions.length} Attempted
                </p>
              </div>
            </div>

            {/* Training Exam 01 — Auto-Grade Score Banner (Admin Only, NEVER shown to candidate) */}
            {isTraining01Exam && training01Grade && (
              <div className="px-5 py-3 border-b border-zinc-200 bg-orange-50/60 shrink-0">
                <p className="text-[9px] font-bold uppercase tracking-widest text-orange-700 mb-2">
                  🔒 Auto-Graded Score — Redlix Training Exam 01 (Admin View Only — Not Shown to Candidate)
                </p>
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-white border border-orange-200 p-2 text-center">
                    <p className="text-[9px] text-zinc-500 uppercase font-bold">Sec A MCQ</p>
                    <p className="text-sm font-bold text-emerald-700 mt-0.5">
                      {training01Grade.mcq.marksObtained} / 15
                    </p>
                    <p className="text-[9px] text-zinc-400">{training01Grade.mcq.correct} correct</p>
                  </div>
                  <div className="bg-white border border-orange-200 p-2 text-center">
                    <p className="text-[9px] text-zinc-500 uppercase font-bold">Sec B Scenario</p>
                    <p className="text-sm font-bold text-blue-700 mt-0.5">
                      {training01Grade.scenario.marksObtained} / 10
                    </p>
                    <p className="text-[9px] text-zinc-400">MCQ auto-score</p>
                  </div>
                  <div className="bg-white border border-orange-200 p-2 text-center">
                    <p className="text-[9px] text-zinc-500 uppercase font-bold">Sec C Coding</p>
                    <p className="text-sm font-bold text-indigo-700 mt-0.5">
                      {training01Grade.coding.marksObtained} / 40
                    </p>
                    <p className="text-[9px] text-zinc-400">{training01Grade.coding.attempted}/4 submitted</p>
                  </div>
                  <div className="bg-orange-500 border border-orange-600 p-2 text-center">
                    <p className="text-[9px] text-orange-100 uppercase font-bold">Total Auto</p>
                    <p className="text-sm font-bold text-white mt-0.5">
                      {training01Grade.totalAutoMarks} / 65
                    </p>
                    <p className="text-[9px] text-orange-200">Manual review needed</p>
                  </div>
                </div>
              </div>
            )}

            {}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-orange-600 border-b border-zinc-200 pb-1 flex items-center justify-between">
                  <span>Section A: Multiple Choice Questions ({mcqQuestions.length})</span>
                  <span className="text-[10px] text-zinc-400 normal-case font-normal">{isTraining01Exam ? "(Fixed order — Redlix Training Exam 01)" : "(Shuffled in student's view)"}</span>
                </h4>
                <div className="space-y-3">
                  {mcqQuestions.map((q) => {
                    const selectedLetter = candidate.answers?.[q.id];
                    const attempted = isQuestionAttempted(q);

                    return (
                      <div key={q.id} className="p-3.5 border border-zinc-200 bg-white space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <h5 className="text-xs font-bold text-zinc-800 leading-relaxed">
                            Question {q.number}: <span className="font-normal text-zinc-650 whitespace-pre-wrap">{q.questionText}</span>
                          </h5>
                          <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 border ${
                            attempted 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-250" 
                              : "bg-red-50 text-red-700 border-red-250"
                          }`}>
                            {attempted ? "Attempted" : "Not Attempted"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-3">
                          {q.options?.map((opt) => {
                            const letter = opt.substring(0, 1);
                            const isSelected = selectedLetter === letter;
                            return (
                              <div 
                                key={opt}
                                className={`p-2 border text-xs flex items-center gap-2 ${
                                  isSelected 
                                    ? "bg-orange-50/30 border-orange-400 font-semibold text-orange-950" 
                                    : "bg-zinc-50 border-zinc-200 text-zinc-600"
                                }`}
                              >
                                <span className={`w-4 h-4 flex items-center justify-center text-[9px] font-bold border rounded-full ${
                                  isSelected 
                                    ? "bg-orange-500 border-orange-500 text-white" 
                                    : "border-zinc-300 text-zinc-400 bg-white"
                                }`}>
                                  {letter}
                                </span>
                                <span className="font-sans leading-none">{opt.substring(3)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 border-b border-zinc-200 pb-1 flex items-center justify-between">
                  <span>Section B: Coding Challenges ({codingQuestions.length})</span>
                  <span className="text-[10px] text-zinc-400 normal-case font-normal">(Shuffled in student's view)</span>
                </h4>
                <div className="space-y-4">
                  {codingQuestions.map((q) => {
                    const solutionCode = candidate.answers?.[q.id];
                    const attempted = isQuestionAttempted(q);

                    return (
                      <div key={q.id} className="p-3.5 border border-zinc-200 bg-white space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <h5 className="text-xs font-bold text-zinc-800 leading-relaxed">
                            Coding Challenge {q.number}: <span className="font-normal text-zinc-600">{q.questionText.split("\n")[0]}</span>
                          </h5>
                          <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 border ${
                            attempted 
                              ? "bg-indigo-50 text-indigo-700 border-indigo-250" 
                              : "bg-red-50 text-red-700 border-red-250"
                          }`}>
                            {attempted ? "Attempted" : "Not Attempted"}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-450 font-mono">Candidate Submission</p>
                          {attempted && solutionCode ? (
                            <pre className="bg-zinc-950 text-zinc-300 font-mono text-[11px] p-3.5 border border-zinc-800 overflow-x-auto whitespace-pre rounded-none max-h-72">
                              {solutionCode}
                            </pre>
                          ) : (
                            <div className="p-3 bg-zinc-50 border border-zinc-200 text-zinc-400 text-xs italic font-sans">
                              No solution submitted for this challenge.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {}
            <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedCandidateForAnswers(null)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-none cursor-pointer border-none transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      );
    })()}

    </div>
  );
}
