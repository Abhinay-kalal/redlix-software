"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

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
}

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("All");
  const [activeTab, setActiveTab] = useState("live");
  
  
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
  const [loadingExamsTab, setLoadingExamsTab] = useState(false);

  const fetchExamsAndRegistrations = async () => {
    setLoadingExamsTab(true);
    try {
      const { data: examsData, error: examsError } = await supabase
        .from("exams")
        .select()
        .order("id", { ascending: false });
      
      const { data: regsData, error: regsError } = await supabase
        .from("registrations")
        .select()
        .order("id", { ascending: false });

      if (!examsError && examsData) {
        setExams(examsData);
      }
      if (!regsError && regsData) {
        setRegistrations(regsData);
      }
    } catch (err) {
      console.error("Error loading exams and registrations:", err);
    } finally {
      setLoadingExamsTab(false);
    }
  };

  const toggleExamStarted = async (exam: Exam) => {
    const newValue = !exam.is_started;
    const { error } = await supabase
      .from("exams")
      .update({ is_started: newValue })
      .eq("id", exam.id);
    if (!error) {
      setExams((prev) =>
        prev.map((e) => (e.id === exam.id ? { ...e, is_started: newValue } : e))
      );
    }
  };

  
  useEffect(() => {
    const auth = localStorage.getItem("is_authenticated");
    const email = localStorage.getItem("user_email") || "admin@redlixsecure.com";
    if (auth !== "true") {
      router.push("/admin");
    } else {
      setIsAuthenticated(true);
      setUserEmail(email);
    }
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
      const { data, error } = await supabase.from("sessions").select().order("timestamp", { ascending: true });
      if (!error && data) {
        const mapped: Session[] = data.map((item: any) => ({
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
    const interval = setInterval(() => {
      fetchSessions();
    }, 3000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeTab === "exams-list" && isAuthenticated) {
      fetchExamsAndRegistrations();
      setSelectedExamForCandidates(null);
    }
  }, [activeTab, isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem("is_authenticated");
    localStorage.removeItem("user_email");
    router.push("/admin");
  };

  const handleResolve = async (id: string) => {
    
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, flagsCount: 0, integrityScore: 100, severity: "Normal", lastFlagType: "None (Resolved)" } : s
      )
    );
    
    
    await supabase
      .from("sessions")
      .update({
        flags_count: 0,
        integrity_score: 100,
        severity: "Normal",
        last_flag_type: "None (Resolved)"
      })
      .eq("id", id);

    if (activeStreamSession?.id === id) {
      setActiveStreamSession(null);
    }
  };

  const handleDismiss = async (id: string) => {
    
    setSessions((prev) => prev.filter((s) => s.id !== id));
    
    
    await supabase.from("sessions").delete().eq("id", id);

    if (activeStreamSession?.id === id) {
      setActiveStreamSession(null);
    }
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
        if (cf.key.trim()) {
          customFieldsObj[cf.key.trim()] = cf.value;
        }
      });

      
      if (examDuration.trim()) {
        customFieldsObj["Duration"] = `${examDuration.trim()} minutes`;
      }

      const { error } = await supabase.from("exams").insert({
        name: examName,
        date: examDate,
        time: examTime,
        description: finalDescription,
        total_qns: Number(totalQns),
        types_of_qns: finalTypes,
        company_name: companyName,
        company_logo: companyLogo,
        custom_fields: customFieldsObj
      });

      if (error) {
        setPublishError(error.message);
      } else {
        setPublishSuccess(true);
        
        setExamName("");
        setExamDate("");
        setExamTime("");
        setExamDescription("");
        setTotalQns("");
        setTypesOfQns("");
        setCompanyName("");
        setCompanyLogo("");
        setExamDuration("");
        setTypesOfQnsList([""]);
        setDescriptionsList([""]);
        setCustomFields([]);
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
            src="https://ik.imagekit.io/dypkhqxip/logo.png?updatedAt=1777320313623"
            alt="Logo"
            className="w-8 h-8 object-contain shrink-0"
          />
          <div>
            <span className="font-bold text-sm text-zinc-900 tracking-wide">Redlix</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-none bg-orange-100 text-orange-700 font-semibold uppercase">Secure</span>
          </div>
        </div>

        {}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <button 
            onClick={() => setActiveTab("live")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer ${
              activeTab === "live" 
                ? "bg-zinc-100 text-zinc-900 shadow-sm border-l-2 border-orange-500" 
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Live Monitor
          </button>
          
          <button 
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer ${
              activeTab === "analytics" 
                ? "bg-zinc-100 text-zinc-900 shadow-sm border-l-2 border-orange-500" 
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </button>

          <button 
            onClick={() => setActiveTab("configs")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer ${
              activeTab === "configs" 
                ? "bg-zinc-100 text-zinc-900 shadow-sm border-l-2 border-orange-500" 
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            AI Settings
          </button>

          <button 
            onClick={() => setActiveTab("create-exam")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer ${
              activeTab === "create-exam" 
                ? "bg-zinc-100 text-zinc-900 shadow-sm border-l-2 border-orange-500" 
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Create Exam
          </button>

          <button 
            onClick={() => setActiveTab("exams-list")}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer ${
              activeTab === "exams-list" 
                ? "bg-zinc-100 text-zinc-900 shadow-sm border-l-2 border-orange-500" 
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Exams Directory
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
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-none bg-white hover:bg-zinc-100 text-zinc-700 hover:text-zinc-900 text-xs font-medium transition-all border border-zinc-200 cursor-pointer shadow-sm"
          >
            <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>

      </aside>

      {}
      <main className="flex-1 flex flex-col min-w-0">
        
        {}
        <header className="h-16 border-b border-zinc-200 flex items-center justify-between px-6 bg-white">
          <div className="flex items-center gap-4">
            <h1 className="text-md font-bold text-zinc-900 tracking-wide uppercase">
              {activeTab === "live" 
                ? "Live Monitor" 
                : activeTab === "analytics" 
                ? "Analytics" 
                : activeTab === "configs" 
                ? "AI Settings" 
                : activeTab === "exams-list"
                ? "Exams Directory"
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
        ) : activeTab === "live" ? (
          
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            
            {}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="p-5 bg-white rounded-none border border-zinc-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Active Exams</span>
                  <div className="p-1.5 bg-orange-50 rounded-none text-orange-600 border border-orange-100">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl font-bold text-zinc-900">{sessions.length}</div>
                <p className="text-[10px] text-zinc-500 mt-1 font-semibold">
                  Total student connections
                </p>
              </div>

              <div className="p-5 bg-white rounded-none border border-zinc-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Flagged Logs</span>
                  <div className="p-1.5 bg-red-50 rounded-none text-red-600 border border-red-100">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl font-bold text-zinc-900">
                  {sessions.filter(s => s.severity === "Critical").length}
                </div>
                <p className="text-[10px] text-red-600 mt-1 font-semibold">
                  Immediate review required
                </p>
              </div>

              <div className="p-5 bg-white rounded-none border border-zinc-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Integrity Average</span>
                  <div className="p-1.5 bg-zinc-50 rounded-none text-zinc-600 border border-zinc-200">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl font-bold text-zinc-900">
                  {sessions.length > 0 
                    ? `${Math.round(sessions.reduce((acc, curr) => acc + curr.integrityScore, 0) / sessions.length)}%`
                    : "100%"
                  }
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 font-semibold">
                  Average score index
                </p>
              </div>

              <div className="p-5 bg-white rounded-none border border-zinc-200 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">System Load</span>
                  <div className="p-1.5 bg-emerald-50 rounded-none text-emerald-600 border border-emerald-100">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl font-bold text-zinc-900">
                  {sessions.length > 0 ? "Active" : "Idle"}
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 font-semibold">
                  {sessions.length} model pipelines active
                </p>
              </div>

            </div>

            {}
            <div className="bg-white rounded-none border border-zinc-200 shadow-sm overflow-hidden">
              
              {}
              <div className="p-5 border-b border-zinc-200 flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-50">
                
                {}
                <div className="relative w-full md:w-80">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search student, exam, anomaly..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 bg-white border border-zinc-300 rounded-none text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-orange-500 transition-all"
                  />
                </div>

                {}
                <div className="flex gap-1 bg-white p-1 rounded-none border border-zinc-200">
                  {["All", "Critical", "Warning", "Normal"].map((severity) => (
                    <button
                      key={severity}
                      onClick={() => setSelectedSeverity(severity)}
                      className={`px-3 py-1 rounded-none text-xs font-semibold transition-all cursor-pointer ${
                        selectedSeverity === severity
                          ? "bg-zinc-800 text-white shadow-sm"
                          : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
                      }`}
                    >
                      {severity}
                    </button>
                  ))}
                </div>

              </div>

              {}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Student Name</th>
                      <th className="px-6 py-4">Exam Name</th>
                      <th className="px-6 py-4 text-center">Flags</th>
                      <th className="px-6 py-4 text-center">Integrity</th>
                      <th className="px-6 py-4">Last Event</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-xs">
                    {filteredSessions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 font-medium">
                          No active sessions found.
                        </td>
                      </tr>
                    ) : (
                      filteredSessions.map((session) => (
                        <tr 
                          key={session.id} 
                          className="hover:bg-zinc-50/50 transition-all duration-150 text-zinc-700"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-none bg-zinc-100 flex items-center justify-center font-bold text-xs text-zinc-600 border border-zinc-200">
                                {session.avatar}
                              </div>
                              <div>
                                <p className="font-semibold text-zinc-900">{session.student}</p>
                                <p className="text-[10px] text-zinc-400">{session.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-zinc-800">{session.exam}</p>
                              <p className="text-[10px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                                ID: {session.id} • Registered {session.timestamp}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-0.5 rounded-none font-bold text-[10px] ${
                              session.flagsCount > 3 
                                ? "bg-red-50 text-red-600 border border-red-100" 
                                : session.flagsCount > 0 
                                ? "bg-amber-50 text-amber-600 border border-amber-100"
                                : "bg-zinc-100 text-zinc-500 border border-zinc-200"
                            }`}>
                              {session.flagsCount} flags
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`font-mono font-bold ${
                                session.integrityScore > 85 
                                  ? "text-emerald-600" 
                                  : session.integrityScore > 60 
                                  ? "text-amber-600" 
                                  : "text-red-600"
                              }`}>
                                {session.integrityScore}%
                              </span>
                              <div className="w-16 bg-zinc-200 h-1 rounded-none overflow-hidden">
                                <div 
                                  className={`h-full ${
                                    session.integrityScore > 85 
                                      ? "bg-emerald-500" 
                                      : session.integrityScore > 60 
                                      ? "bg-amber-500" 
                                      : "bg-red-500"
                                  }`} 
                                  style={{ width: `${session.integrityScore}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {session.severity === "Critical" ? (
                                <span className="w-2 h-2 rounded-none bg-red-500" />
                              ) : session.severity === "Warning" ? (
                                <span className="w-2 h-2 rounded-none bg-amber-500" />
                              ) : (
                                <span className="w-2 h-2 rounded-none bg-emerald-500" />
                              )}
                              <span className="text-zinc-800 font-medium">{session.lastFlagType}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setActiveStreamSession(session)}
                                className="px-2.5 py-1 rounded-none bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 font-medium transition-all cursor-pointer text-xs"
                              >
                                View Stream
                              </button>
                              
                              <button
                                onClick={() => handleResolve(session.id)}
                                disabled={session.severity === "Normal"}
                                className={`px-2 py-1 rounded-none font-medium border text-xs transition-all ${
                                  session.severity === "Normal"
                                    ? "bg-zinc-50 border-zinc-200 text-zinc-400 cursor-not-allowed"
                                    : "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700 cursor-pointer"
                                }`}
                              >
                                Resolve
                              </button>

                              <button
                                onClick={() => handleDismiss(session.id)}
                                className="px-2 py-1 rounded-none bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-medium transition-all cursor-pointer text-xs"
                              >
                                Dismiss
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        ) : activeTab === "analytics" ? (
          
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {}
              <div className="lg:col-span-2 p-6 bg-white rounded-none border border-zinc-200 shadow-sm flex flex-col justify-between h-[380px]">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Integrity Trend Log</h3>
                  <p className="text-xs text-zinc-400">Hourly system integrity metrics analysis</p>
                </div>
                
                {}
                <div className="flex-1 flex items-end gap-2.5 mt-8 h-48 border-b border-l border-zinc-200 pb-2 pl-2">
                  {(sessions.length > 0 ? sessions.map(s => s.integrityScore) : [100, 100, 100]).map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                      <div className="opacity-0 group-hover:opacity-100 bg-zinc-800 text-[9px] text-zinc-100 px-1 py-0.5 rounded-none transition-opacity pointer-events-none mb-1">
                        {val}%
                      </div>
                      <div 
                        className="w-full bg-linear-to-t from-orange-400 to-orange-500 rounded-none group-hover:from-orange-500 group-hover:to-orange-600 transition-all duration-300"
                        style={{ height: `${val}%` }}
                      />
                      <span className="text-[9px] text-zinc-400 font-mono">
                        {sessions.length > 0 ? (sessions[idx]?.avatar || `S${idx+1}`) : `S${idx+1}`}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center mt-4 text-[10px] text-zinc-500">
                  <span>Data range: Past 12 hours</span>
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span className="w-2.5 h-2.5 bg-orange-500 rounded-none" /> Average score: 94%
                  </span>
                </div>
              </div>

              {}
              <div className="p-6 bg-white rounded-none border border-zinc-200 shadow-sm flex flex-col justify-between h-[380px]">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Incident Breakdown</h3>
                  <p className="text-xs text-zinc-400">Distribution of flag triggers</p>
                </div>

                <div className="space-y-4 my-6">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-zinc-700">Tab Switching</span>
                      <span className="text-zinc-500 font-mono">{tabPct}%</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-2 rounded-none overflow-hidden">
                      <div className="bg-orange-500 h-full rounded-none" style={{ width: `${tabPct}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-zinc-700">Eye Gaze Deviation</span>
                      <span className="text-zinc-500 font-mono">{gazePct}%</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-2 rounded-none overflow-hidden">
                      <div className="bg-zinc-600 h-full rounded-none" style={{ width: `${gazePct}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-zinc-700">Multiple Faces</span>
                      <span className="text-zinc-500 font-mono">{facePct}%</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-2 rounded-none overflow-hidden">
                      <div className="bg-zinc-500 h-full rounded-none" style={{ width: `${facePct}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-zinc-700">Audio Anomalies</span>
                      <span className="text-zinc-500 font-mono">{audioPct}%</span>
                    </div>
                    <div className="w-full bg-zinc-100 h-2 rounded-none overflow-hidden">
                      <div className="bg-zinc-400 h-full rounded-none" style={{ width: `${audioPct}%` }} />
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-orange-600 font-semibold cursor-pointer hover:underline">
                    Export analytics data
                  </span>
                </div>
              </div>

            </div>
          </div>
        ) : activeTab === "configs" ? (
          
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="max-w-2xl bg-white rounded-none border border-zinc-200 shadow-sm p-6 space-y-6">
              
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Configurations</h3>
                <p className="text-xs text-zinc-400">Modify model thresholds and options</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-none border border-zinc-200">
                  <div>
                    <p className="text-xs font-semibold text-zinc-900">Gaze Deviation</p>
                    <p className="text-[10px] text-zinc-500">Flag if eye gaze deviates &gt; 4s</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-500">Sensitive</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-orange-500 cursor-pointer" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-none border border-zinc-200">
                  <div>
                    <p className="text-xs font-semibold text-zinc-900">Multiple Faces</p>
                    <p className="text-[10px] text-zinc-500">Flag if more than 1 face detected</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-500">Immediate</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-orange-500 cursor-pointer" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-none border border-zinc-200">
                  <div>
                    <p className="text-xs font-semibold text-zinc-900">Tab Switches</p>
                    <p className="text-[10px] text-zinc-500">Flag if tab switches &gt; 3</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-zinc-500">Strict</span>
                    <input type="checkbox" className="w-4 h-4 accent-orange-500 cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium text-xs rounded-none shadow-sm transition-all cursor-pointer">
                  Save Settings
                </button>
              </div>

            </div>
          </div>
        ) : activeTab === "create-exam" ? (
          
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="max-w-2xl bg-white rounded-none border border-zinc-200 shadow-sm p-6 space-y-6">
              
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Create Exam</h3>
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
                        <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">Question Types *</label>
                    <button
                      type="button"
                      onClick={() => setTypesOfQnsList([...typesOfQnsList, ""])}
                      className="px-2 py-1 bg-zinc-800 text-white text-[10px] font-bold uppercase rounded-none hover:bg-zinc-700 cursor-pointer transition-all border-none"
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500">Description Sections *</label>
                    <button
                      type="button"
                      onClick={() => setDescriptionsList([...descriptionsList, ""])}
                      className="px-2 py-1 bg-zinc-800 text-white text-[10px] font-bold uppercase rounded-none hover:bg-zinc-700 cursor-pointer transition-all border-none"
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
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Custom Fields</span>
                    <button
                      type="button"
                      onClick={addCustomField}
                      className="px-2 py-1 bg-zinc-800 text-white text-[10px] font-bold uppercase rounded-none hover:bg-zinc-700 cursor-pointer transition-all border-none"
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
                  <button 
                    onClick={() => setSelectedExamForCandidates(null)}
                    className="flex items-center justify-center p-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900 cursor-pointer shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>
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
                              <div className="w-full h-full flex items-center justify-center bg-zinc-200 text-zinc-400">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2 flex-1 min-w-0">
                            <div>
                              <h4 className="text-sm font-bold text-zinc-955 truncate leading-snug">{candidate.candidate_name}</h4>
                              <p className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase leading-tight mt-0.5">{candidate.year_of_study} • {candidate.department}</p>
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
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ) : (
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Exams Listing</h3>
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
                              <span className="text-[9px] font-bold tracking-wider uppercase bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-none">
                                {exam.company_name}
                              </span>
                              <h3 className="text-lg font-bold text-zinc-900 mt-2 tracking-tight leading-snug">
                                {exam.name}
                              </h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-3 border-y border-zinc-100 text-xs font-medium text-zinc-600">
                              <div>
                                <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-0.5">Schedule</p>
                                <p className="text-zinc-800 font-semibold">{exam.date}</p>
                                <p className="text-zinc-500 font-normal">{exam.time} IST</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-0.5">Details</p>
                                <p className="text-zinc-800 font-semibold">{exam.total_qns} Qns • {exam.types_of_qns}</p>
                                <p className="text-zinc-500 font-bold text-orange-600 uppercase tracking-wider mt-0.5 text-[9px]">
                                  {regsCount} {regsCount === 1 ? "Registrant" : "Registrants"}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between gap-3 flex-wrap">
                            {}
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 border ${
                              exam.is_started
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-zinc-50 text-zinc-500 border-zinc-200"
                            }`}>
                              {exam.is_started ? "Exam Active" : "Not Started"}
                            </span>
                            <div className="flex gap-2">
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
                      );
                    })}
                  </div>
                )}
              </div>
            )}
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
                <span className="w-2 h-2 rounded-none bg-red-600 animate-pulse" />
                Active Stream: {currentStream.student}
              </h3>
              <p className="text-[10px] text-zinc-500">{currentStream.exam} • ID: {currentStream.id}</p>
            </div>
            <button 
              onClick={() => setActiveStreamSession(null)}
              className="text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
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
                  
                  <span className="text-[10px] font-mono tracking-widest text-orange-400 uppercase font-semibold animate-pulse">
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
              <p className="text-zinc-300">STATUS: <span className={currentStream.liveFeed ? "text-emerald-400 font-bold" : "text-amber-400 font-bold animate-pulse"}>{currentStream.liveFeed ? "LIVE STREAMING" : "WAITING FOR FEED"}</span></p>
              <p className="text-zinc-300">GAZE STATE: <span className="text-emerald-400 font-bold">STABLE</span></p>
            </div>

            <div className="absolute bottom-4 right-4 p-2 bg-black/70 rounded-none border border-zinc-700 text-[10px] font-mono z-10">
              <span className={`px-1.5 py-0.5 rounded-none font-bold uppercase ${
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

    </div>
  );
}
