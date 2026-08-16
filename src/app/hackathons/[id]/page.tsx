import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Users, Trophy, Play, ArrowLeft, Code2 } from "lucide-react";
import SprintListClient from "./SprintListClient";

export default async function HackathonDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const hackathon = await prisma.hackathon.findUnique({
    where: { id },
    include: {
      sprints: {
        where: { joinCode: { not: null } },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!hackathon) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans text-zinc-900">
      {/* Navigation Bar */}
      <header className="bg-white border-b border-zinc-200 py-4 px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <Link href="/candidate-dashboard" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">Candidate Portal</span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-8">
        
        {/* Hero Section */}
        <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row relative">
          <div className="md:w-2/5 shrink-0 bg-zinc-100 relative h-48 md:h-auto">
            {hackathon.image ? (
              <img src={hackathon.image} alt={hackathon.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#E61E32] text-white">
                <Code2 className="w-16 h-16 text-white mb-4" />
                <span className="text-xs font-bold text-white/90 uppercase tracking-widest">Hackathon</span>
              </div>
            )}
          </div>
          
          <div className="p-8 md:p-10 flex-1 flex flex-col justify-center space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-red-50 text-[#E61E32] text-[10px] font-bold rounded-md border border-red-100 uppercase tracking-wider">
                  {hackathon.type || "Online Event"}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-zinc-950 tracking-tight leading-tight">{hackathon.title}</h1>
              <p className="text-sm text-zinc-500 leading-relaxed max-w-xl">
                {hackathon.description || "No description provided for this hackathon."}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-zinc-100">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Start Date</span>
                </div>
                <p className="text-xs font-semibold text-zinc-900">{new Date(hackathon.startDate).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Users className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Team Size</span>
                </div>
                <p className="text-xs font-semibold text-zinc-900">Up to {hackathon.teamSize} members</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Trophy className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Top Prize</span>
                </div>
                <p className="text-xs font-semibold text-zinc-900">{hackathon.prizeFirst || "TBA"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sprints Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">Hackathon Sprints</h2>
              <p className="text-xs text-zinc-500 mt-1">Join active sprint lobbies to participate in coding challenges.</p>
            </div>
            <div className="bg-zinc-100 text-zinc-600 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-zinc-200">
              {hackathon.sprints.length} Total Sprints
            </div>
          </div>

          {hackathon.sprints.length === 0 ? (
            <div className="bg-white border border-zinc-200 p-12 text-center rounded-2xl shadow-sm">
              <Code2 className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
              <h3 className="text-sm font-bold text-zinc-900">No Sprints Available</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                The organizer has not published any sprints for this hackathon yet. Please check back later.
              </p>
            </div>
          ) : (
            <SprintListClient sprints={hackathon.sprints} />
          )}
        </div>
      </main>
    </div>
  );
}
