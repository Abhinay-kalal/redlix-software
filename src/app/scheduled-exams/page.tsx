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

import { encodeExamId } from "@/utils/secureId";

export default function ScheduledExams() {
  const supabase = createClient();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [regCounts, setRegCounts] = useState<Record<number, number>>({});
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopyLink = (examId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const link = window.location.origin + "/scheduled-exams/" + encodeExamId(examId);
    navigator.clipboard.writeText(link);
    setCopiedId(examId);
    setTimeout(() => setCopiedId(null), 3000);
  };

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
      
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#E61E32] border-b border-[#d01729] py-3 px-6 md:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {/* Logo directly on red navbar with a soft white shade glow */}
            <img
              src="https://ik.imagekit.io/dypkhqxip/logotraining?updatedAt=1783099023149"
              alt="Redlix Official Logo"
              className="h-7.5 md:h-8 w-auto object-contain shrink-0"
            />
            <div className="flex items-center gap-2 border-l border-white/20 pl-3">
              <span className="font-semibold text-xs text-white font-inter">Scheduled Exams</span>
              <span className="hidden sm:inline-block px-2.5 py-0.5 bg-white/20 text-white rounded-md text-[10px] font-semibold border border-white/30 backdrop-blur-xs shadow-xs">Directory</span>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
        
        {/* Page Title */}
        <div className="space-y-1 text-left">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 font-inter">Scheduled Exams</h1>
          <p className="text-xs text-zinc-500 max-w-xl leading-relaxed">
            Public directory of upcoming and active exams. Review dates, rules, and register for assessments below.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <span className="material-symbols-rounded text-lg">search</span>
          </div>
          <input
            type="text"
            placeholder="Search by exam title or organization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-md text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#E61E32]/20 focus:border-[#E61E32] transition-all shadow-xs"
          />
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-t-[#E61E32] border-r-zinc-200 border-b-zinc-200 border-l-zinc-200 animate-spin mb-4" />
            <p className="text-zinc-500 text-xs font-semibold">Loading scheduled exams...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="py-16 text-center bg-white border border-zinc-200/90 rounded-md shadow-xs p-8">
            <p className="text-zinc-500 text-sm font-medium">No scheduled exams found matching your search.</p>
          </div>
        ) : (
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white border border-zinc-200/90 rounded-md shadow-xs hover:shadow-md hover:border-[#E61E32]/25 transition-all duration-200 overflow-hidden flex flex-col"
              >
                {/* Cover Image (1200x1200px 1:1 Square Frame) */}
                <div className="w-full aspect-square relative overflow-hidden bg-zinc-900 shrink-0">
                  <img
                    src={
                      (exam as any).company_logo && (exam as any).company_logo.startsWith("http")
                        ? (exam as any).company_logo
                        : exam.name.toLowerCase().includes("technical")
                        ? "https://ik.imagekit.io/dypkhqxip/technical%20Wing.png"
                        : exam.name.toLowerCase().includes("marketing")
                        ? "https://ik.imagekit.io/dypkhqxip/marketing%20Wing.png"
                        : exam.name.toLowerCase().includes("analytics")
                        ? "https://ik.imagekit.io/dypkhqxip/Data%20Analytics%20Wing.png"
                        : exam.name.toLowerCase().includes("ui") || exam.name.toLowerCase().includes("ux")
                        ? "https://ik.imagekit.io/dypkhqxip/UI%20and%20UX%20Wing.png"
                        : "/exam-cover.png"
                    }
                    alt={exam.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://ik.imagekit.io/dypkhqxip/technical%20Wing.png";
                    }}
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="text-[11px] font-semibold bg-white/95 text-zinc-800 px-2.5 py-1 rounded-md border border-zinc-200/90 shadow-xs">
                      {exam.company_name}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col flex-1 gap-3">
                  <h3 className="text-xs md:text-sm font-bold text-zinc-900 font-inter leading-snug">
                    {(() => {
                      const parts = exam.name.split(" ");
                      const wingIdx = parts.findIndex((p) => p.toLowerCase() === "wing");
                      if (wingIdx > 0) {
                        const mainWord = parts.slice(0, wingIdx).join(" ");
                        const rest = parts.slice(wingIdx).join(" ");
                        return (
                          <>
                            <span className="text-[#E61E32]">{mainWord}</span> {rest}
                          </>
                        );
                      }
                      return (
                        <>
                          <span className="text-[#E61E32]">{parts[0]}</span> {parts.slice(1).join(" ")}
                        </>
                      );
                    })()}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-500 w-fit">
                    <span className="material-symbols-rounded text-xs text-zinc-400">calendar_today</span>
                    {exam.date} · {exam.time}
                  </span>

                  <div className="flex-1" />

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={(e) => handleCopyLink(exam.id, e)}
                      title="Copy Exam Link"
                      className="px-3 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 border border-zinc-200"
                    >
                      <svg className="w-3.5 h-3.5 text-[#E61E32]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>{copiedId === exam.id ? "Copied!" : "Copy"}</span>
                    </button>

                    <Link
                      href={`/scheduled-exams/${encodeExamId(exam.id)}`}
                      className="flex-1 px-4 py-2.5 bg-[#E61E32] hover:bg-[#d01729] text-white font-bold text-xs rounded-md shadow-xs transition-all cursor-pointer text-center block"
                    >
                      View Exam →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-200/80 bg-white mt-12 text-center text-xs text-zinc-500 font-medium">
        © 2026 Redlix Secure. Smart Proctored Examination System.
      </footer>

    </div>
  );
}
