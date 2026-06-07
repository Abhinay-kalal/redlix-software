"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { SunIcon as Sunburst } from "lucide-react";

interface Exam {
  id: number;
  name: string;
  date: string;
  time: string;
  description: string;
  total_qns: number;
  types_of_qns: string;
  company_name: string;
  custom_fields: Record<string, string>;
  show_login?: boolean;
  registration_closed?: boolean;
}

export default function ScheduledExams() {
  const supabase = createClient();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [regCounts, setRegCounts] = useState<Record<number, number>>({});

  const fetchExams = async () => {
    try {
      const [examsRes, countsRes] = await Promise.all([
        supabase.from("exams").select().order("id", { ascending: false }),
        fetch("/api/exam/registrations-count").then(res => res.json())
      ]);

      if (!examsRes.error && examsRes.data) {
        setExams(examsRes.data);
      }
      if (countsRes.success && countsRes.counts) {
        setRegCounts(countsRes.counts);
      }
    } catch (err) {
      console.error("Error loading exams and counts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const filteredExams = exams.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-100 font-sans text-zinc-900 flex flex-col">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-orange-500 border-b border-orange-600 py-3.5 px-6 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <nav className="text-xs text-orange-100 font-semibold flex items-center gap-1.5">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-orange-200">/</span>
            <span className="text-white">Scheduled Exams</span>
          </nav>
        </div>
      </header>

      {}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
        
        {}
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Scheduled Examinations</h1>
          <p className="text-sm text-zinc-500 max-w-md leading-relaxed">
            Public registry of upcoming and active proctored evaluations. Find scheduled dates, guidelines, and formats below.
          </p>
        </div>

        {}
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search exam or conducting company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 bg-white border border-zinc-300 rounded-none text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-orange-500 transition-all shadow-sm"
          />
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-t-orange-500 border-r-zinc-300 border-b-zinc-300 border-l-zinc-300 animate-spin mb-4" />
            <p className="text-zinc-500 text-xs">Retrieving scheduled directory...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="py-16 text-center bg-white border border-zinc-200 shadow-sm p-8">
            <p className="text-zinc-500 text-sm font-medium">No scheduled examinations found.</p>
          </div>
        ) : (
          
          <div className="space-y-6">
            {filteredExams.map((exam) => (
              <div 
                key={exam.id} 
                className="bg-white border border-zinc-200 shadow-sm rounded-none flex flex-col md:flex-row hover:border-orange-500/30 transition-all duration-200 overflow-hidden"
              >
                {}
                <div className="w-full md:w-56 h-48 md:h-auto bg-zinc-100 shrink-0 relative overflow-hidden border-b md:border-b-0 md:border-r border-zinc-200">
                  <img 
                    src={exam.name.toLowerCase().includes("data analytics") ? "/analytics-cover.png" : "/exam-cover.png"} 
                    alt="Exam Cover" 
                    className="w-full h-full object-cover" 
                  />
                </div>

                {}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    {}
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold tracking-wider uppercase bg-orange-100 text-orange-800 border border-orange-200 px-2.5 py-0.5 rounded-none">
                          {exam.company_name}
                        </span>
                        <span className="text-[10px] font-bold tracking-wider uppercase bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-0.5 rounded-none flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px] leading-none">group</span>
                          {regCounts[exam.id] || 0} {(regCounts[exam.id] || 0) === 1 ? "Registration" : "Registrations"}
                        </span>
                      </div>
                      <h3 className="text-xl font-extrabold text-zinc-955 mt-2.5 tracking-tight leading-snug">
                        {exam.name}
                      </h3>
                    </div>

                    {}
                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-zinc-200 text-xs font-semibold text-zinc-700">
                      <div>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1 font-bold">Schedule</p>
                        <p className="text-zinc-900 font-bold">{exam.date}</p>
                        <p className="text-zinc-650 font-normal">{exam.time} IST</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1 font-bold">Format</p>
                        <p className="text-zinc-900 font-bold">{exam.total_qns} Questions</p>
                        <p className="text-zinc-650 font-normal leading-relaxed">{exam.types_of_qns}</p>
                        <p className="text-orange-600 font-bold text-[10px] normal-case mt-1.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px] leading-none">group</span>
                          {regCounts[exam.id] || 0} {(regCounts[exam.id] || 0) === 1 ? "Candidate" : "Candidates"} Registered
                        </p>
                      </div>
                    </div>

                    {}
                    {exam.description && (
                      <div className="text-xs text-zinc-800 leading-relaxed bg-zinc-50 p-4 border border-zinc-200 font-normal whitespace-pre-line">
                        {exam.description}
                      </div>
                    )}

                    {}
                    {Object.keys(exam.custom_fields || {}).length > 0 && (
                      <div className="space-y-2.5 pt-1">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Guidelines & Details</p>
                        <div className="divide-y divide-zinc-200 text-xs">
                          {Object.entries(exam.custom_fields).map(([key, val]) => (
                            <div key={key} className="flex justify-between py-2 font-medium">
                              <span className="text-zinc-600 font-medium">{key}</span>
                              <span className="text-zinc-900 font-bold text-right">{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {}
                  <div className="pt-4 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-[10px] text-zinc-400 hidden sm:block">
                      {exam.show_login ? "Already registered? Enter your hall ticket to start." : "Registration is open. Entry opens closer to scheduled time."}
                    </p>
                    <div className="flex gap-2">
                      <Link 
                        href="/register/edit"
                        className="px-4 py-2 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-bold text-xs rounded-none shadow-sm transition-colors cursor-pointer text-center inline-block"
                      >
                        Edit Details
                      </Link>
                      {exam.show_login && (
                        <Link 
                          href={`/exam-login?examId=${exam.id}`}
                          className="px-4 py-2 border border-orange-500 text-orange-600 hover:bg-orange-50 font-bold text-xs rounded-none shadow-sm transition-colors cursor-pointer text-center inline-block"
                        >
                          Enter Exam →
                        </Link>
                      )}
                      {exam.registration_closed ? (
                        <span className="px-4 py-2 bg-zinc-300 text-zinc-500 font-bold text-xs rounded-none cursor-not-allowed text-center inline-block">
                          Registration Closed
                        </span>
                      ) : (
                        <Link 
                          href={`/register?examId=${exam.id}`}
                          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-none shadow-sm transition-colors cursor-pointer text-center inline-block"
                        >
                          Register for Exam
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </main>

      {}
      <footer className="py-8 border-t border-zinc-200 bg-white mt-12 text-center text-xs text-zinc-400">
        © 2026 Redlix Secure. Secure Examinations Registry.
      </footer>

    </div>
  );
}
