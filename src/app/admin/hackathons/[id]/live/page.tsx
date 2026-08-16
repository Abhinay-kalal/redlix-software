"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { Loader2, Users, AlertTriangle, ShieldCheck, Trophy, Activity, BarChart2, Eye, FileText } from "lucide-react";

type Tab = "feed" | "analytics" | "plagiarism";

function LiveDashboardContent() {
  const { id } = useParams<{ id: string }>();

  const [sprint, setSprint] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("feed");

  useEffect(() => {
    if (!id) return;
    const fetch_ = async () => {
      try {
        const [sprintRes, partsRes] = await Promise.all([
          fetch(`/api/sprints/${id}`),
          fetch(`/api/sprints/participants?sprintId=${id}`)
        ]);
        const [sprintData, partsData] = await Promise.all([sprintRes.json(), partsRes.json()]);
        if (sprintData.success) setSprint(sprintData.data);
        if (partsData.success) setParticipants(partsData.data || []);
      } catch (err) {
        console.error("Dashboard poll error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
    // Only keep polling while the sprint is still active
    const interval = setInterval(async () => {
      // Re-check if sprint has ended after fetching
      const sprintRes = await fetch(`/api/sprints/${id}`);
      const sprintData = await sprintRes.json();
      if (sprintData.success) {
        const s = sprintData.data;
        setSprint(s);
        // Stop polling once sprint has ended — data is archived
        if (s && new Date(s.endDate) < new Date()) {
          clearInterval(interval);
          return;
        }
      }
      const partsRes = await fetch(`/api/sprints/participants?sprintId=${id}`);
      const partsData = await partsRes.json();
      if (partsData.success) setParticipants(partsData.data || []);
    }, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const handleUnlock = async (participantId: string) => {
    const res = await fetch("/api/sprints/participants/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantId })
    });
    const data = await res.json();
    if (data.success) {
      setParticipants(prev => prev.map(p => p.id === participantId ? { ...p, isLocked: false, warningsCount: 0 } : p));
    }
  };

  const handleStrike = async (participantId: string, currentWarnings: number) => {
    const newWarnings = currentWarnings + 1;
    const res = await fetch("/api/sprints/participants", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        id: participantId, 
        warningsCount: newWarnings, 
        isLocked: newWarnings >= 3,
        cheatingLogs: {
           time: new Date().toISOString(),
           reason: "Proctor flagged: Candidate not visible on camera / Suspicious behavior",
           strike: newWarnings
        }
      })
    });
    const data = await res.json();
    if (data.success) {
      setParticipants(prev => prev.map(p => p.id === participantId ? { ...p, warningsCount: newWarnings, isLocked: newWarnings >= 3 } : p));
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
      <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
      <p className="text-sm font-medium text-zinc-400">Initializing Live Monitor...</p>
    </div>
  );

  const total = participants.length;
  const locked = participants.filter(p => p.isLocked).length;
  const flagged = participants.filter(p => p.warningsCount > 0 && !p.isLocked).length;
  const clean = total - locked - flagged;
  const avgScore = total > 0 ? Math.round(participants.reduce((a, p) => a + (p.score || 0), 0) / total) : 0;

  // Detect if sprint has ended
  const sprintEnded = sprint ? new Date(sprint.endDate) < new Date() : false;

  // Collect all plagiarism logs
  const allLogs: { name: string; email: string; log: any }[] = [];
  participants.forEach(p => {
    let logs: any[] = [];
    try { if (p.cheatingLogs) logs = JSON.parse(p.cheatingLogs); } catch {}
    logs.forEach(l => allLogs.push({ name: p.name, email: p.email, log: l }));
  });
  allLogs.sort((a, b) => new Date(b.log.time).getTime() - new Date(a.log.time).getTime());

  const sorted = [...participants].sort((a, b) => (b.score || 0) - (a.score || 0));

  const TABS: { key: Tab; label: string; icon: any }[] = [
    { key: "feed", label: "Proctoring Feed", icon: Eye },
    { key: "analytics", label: "Analytics", icon: BarChart2 },
    { key: "plagiarism", label: "Plagiarism Logs", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 font-sans flex flex-col">

      {/* Sprint Ended archived banner */}
      {sprintEnded && (
        <div className="bg-amber-950/40 border-b border-amber-800/50 px-6 py-2.5 flex items-center justify-center gap-3">
          <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest">
            📦 Sprint Ended — You are viewing archived data. All results and plagiarism logs are preserved.
          </span>
        </div>
      )}

      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-lg font-black text-white tracking-wide flex items-center gap-2">
            <Activity className={`w-5 h-5 ${sprintEnded ? "text-amber-500" : "text-emerald-500"}`} />
            {sprintEnded ? "Sprint Analytics (Archived)" : "Live Sprint Monitor"}
          </h1>
          <p className="text-xs text-zinc-500 font-bold mt-0.5">{sprint?.title} · Room {sprint?.joinCode}</p>
        </div>

        {/* Stat pills */}
        <div className="flex gap-3 flex-wrap">
          {[
            { label: "Total", value: total, color: "bg-zinc-800 border-zinc-700 text-white" },
            { label: "Clean", value: clean, color: "bg-emerald-950/50 border-emerald-800 text-emerald-400" },
            { label: "Flagged", value: flagged, color: "bg-amber-950/50 border-amber-800 text-amber-400" },
            { label: "Terminated", value: locked, color: "bg-red-950/50 border-red-800 text-red-400" },
          ].map(s => (
            <div key={s.label} className={`flex flex-col items-center px-4 py-1.5 rounded-xl border ${s.color}`}>
              <span className="text-xl font-black tabular-nums">{s.value}</span>
              <span className="text-[9px] uppercase tracking-widest opacity-70">{s.label}</span>
            </div>
          ))}
        </div>
      </header>

      {/* Tab bar */}
      <nav className="bg-zinc-900 border-b border-zinc-800 px-6 flex gap-1 shrink-0">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
                tab === t.key
                  ? "border-emerald-500 text-emerald-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
              {t.key === "plagiarism" && allLogs.length > 0 && (
                <span className="ml-1 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{allLogs.length}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">

        {/* -------- FEED TAB -------- */}
        {tab === "feed" && (
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            {/* Grid */}
            <div className="flex-1 min-h-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  Candidate Webcam Grid
                </h2>
                {sprintEnded ? (
                  <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest bg-amber-950/30 border border-amber-800/50 px-2.5 py-1 rounded-full">
                    📦 Archived Snapshots
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Live · 5s refresh
                  </div>
                )}
              </div>

              {participants.length === 0 ? (
                <div className="h-40 flex items-center justify-center text-zinc-600 text-sm">
                  No candidates active yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {participants.map(p => (
                    <div
                      key={p.id}
                      className={`relative overflow-hidden rounded-2xl border ${
                        p.isLocked ? "border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)]" :
                        p.warningsCount > 0 ? "border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]" :
                        "border-zinc-800 hover:border-zinc-700"
                      } bg-zinc-950 aspect-[4/3] flex flex-col transition-all`}
                    >
                      {/* Snapshot */}
                      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden group">
                        {p.latestSnapshot ? (
                          <img
                            src={p.latestSnapshot}
                            alt={p.name}
                            className={`w-full h-full object-cover ${p.isLocked ? "grayscale brightness-40" : ""}`}
                          />
                        ) : (
                          <span className="text-zinc-700 text-[9px] uppercase font-black tracking-widest">No Signal</span>
                        )}
                        
                        {!p.isLocked && !sprintEnded && (
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onClick={() => handleStrike(p.id, p.warningsCount || 0)} className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded shadow-lg hover:bg-red-500 transition-colors">
                              Issue Strike
                            </button>
                          </div>
                        )}

                        {p.isLocked && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/70 backdrop-blur-sm z-10">
                            <ShieldCheck className="w-8 h-8 text-red-500 mb-1" />
                            <span className="text-red-400 font-black text-xs uppercase tracking-widest">Terminated</span>
                            <button onClick={() => handleUnlock(p.id)}
                              className="mt-2 px-3 py-1 bg-white text-red-700 text-[9px] font-black uppercase tracking-widest rounded hover:bg-zinc-200 transition-colors cursor-pointer">
                              Unlock
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="bg-zinc-900 border-t border-zinc-800 px-2.5 py-2 flex items-center justify-between">
                        <div className="truncate max-w-[60%]">
                          <p className="text-[10px] font-bold text-white truncate">{p.name}</p>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          {p.warningsCount > 0 && !p.isLocked && (
                            <span className="text-[8px] font-black text-amber-500 flex items-center gap-0.5">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              {p.warningsCount}/3
                            </span>
                          )}
                          <span className="text-[9px] font-mono font-bold text-emerald-400">{p.score || 0}pt</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Leaderboard sidebar */}
            <div className="w-full lg:w-72 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col shrink-0 max-h-[600px]">
              <div className="flex items-center gap-2 mb-4 shrink-0">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Live Leaderboard</h2>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {sorted.map((p, idx) => (
                  <div key={p.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                        idx === 0 ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/50" :
                        idx === 1 ? "bg-zinc-400/20 text-zinc-300 border border-zinc-400/50" :
                        idx === 2 ? "bg-amber-700/20 text-amber-600 border border-amber-700/50" :
                        "bg-zinc-800 text-zinc-500"
                      }`}>{idx + 1}</div>
                      <p className="text-[10px] font-bold text-white truncate max-w-[120px]">{p.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {p.warningsCount > 0 && (
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                      )}
                      <span className="text-[10px] font-mono font-black text-emerald-400">{p.score || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* -------- ANALYTICS TAB -------- */}
        {tab === "analytics" && (
          <div className="space-y-6">
            {/* Top stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Candidates", value: total, sub: "registered in this sprint", color: "text-white" },
                { label: "Average Score", value: `${avgScore} pts`, sub: "across all active candidates", color: "text-emerald-400" },
                { label: "Violations Logged", value: allLogs.length, sub: "total cheating events", color: "text-amber-400" },
                { label: "Termination Rate", value: `${total > 0 ? Math.round((locked / total) * 100) : 0}%`, sub: "of candidates locked out", color: "text-red-400" },
              ].map(s => (
                <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs font-bold text-white mt-1">{s.label}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Per-candidate analytics */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800">
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Per-Candidate Breakdown</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950">
                      <th className="text-left px-5 py-3 font-black text-zinc-400 uppercase tracking-widest text-[9px]">Candidate</th>
                      <th className="text-left px-5 py-3 font-black text-zinc-400 uppercase tracking-widest text-[9px]">Score</th>
                      <th className="text-left px-5 py-3 font-black text-zinc-400 uppercase tracking-widest text-[9px]">Strikes</th>
                      <th className="text-left px-5 py-3 font-black text-zinc-400 uppercase tracking-widest text-[9px]">Status</th>
                      <th className="text-left px-5 py-3 font-black text-zinc-400 uppercase tracking-widest text-[9px]">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((p, idx) => (
                      <tr key={p.id} className={`border-b border-zinc-800/50 ${idx % 2 === 0 ? "bg-zinc-900" : "bg-zinc-950"}`}>
                        <td className="px-5 py-3">
                          <p className="font-bold text-white">{p.name}</p>
                          <p className="text-zinc-500 font-mono text-[9px]">{p.email}</p>
                        </td>
                        <td className="px-5 py-3 font-mono font-black text-emerald-400">{p.score || 0}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            {[1,2,3].map(n => (
                              <div key={n} className={`w-2 h-2 rounded-full ${p.warningsCount >= n ? "bg-red-500" : "bg-zinc-700"}`} />
                            ))}
                            <span className="text-zinc-400 ml-1">{p.warningsCount}/3</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                            p.isLocked ? "bg-red-950/50 text-red-400 border-red-800" :
                            p.warningsCount > 0 ? "bg-amber-950/50 text-amber-400 border-amber-800" :
                            "bg-emerald-950/50 text-emerald-400 border-emerald-800"
                          }`}>
                            {p.isLocked ? "Terminated" : p.warningsCount > 0 ? "Flagged" : "Active"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {p.isLocked && (
                            <button onClick={() => handleUnlock(p.id)}
                              className="px-3 py-1 bg-white text-red-700 text-[9px] font-black uppercase rounded hover:bg-zinc-200 transition-colors cursor-pointer">
                              Unlock
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* -------- PLAGIARISM LOG TAB -------- */}
        {tab === "plagiarism" && (
          <div className="space-y-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-500" />
                  Security Violation Log
                </h2>
                <span className="text-[9px] font-black text-red-500 bg-red-950/50 border border-red-800 px-2 py-0.5 rounded-full">
                  {allLogs.length} events
                </span>
              </div>

              {allLogs.length === 0 ? (
                <div className="px-5 py-16 text-center text-zinc-600 text-sm">
                  No security violations detected. All candidates are behaving normally.
                </div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {allLogs.map((entry, i) => (
                    <div key={i} className="px-5 py-4 flex items-start gap-4 hover:bg-zinc-800/30 transition-colors">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        entry.log.strike >= 3 ? "bg-red-500" :
                        entry.log.strike === 2 ? "bg-amber-500" : "bg-yellow-500"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-white">{entry.name}</span>
                          <span className="text-[9px] font-mono text-zinc-500">{entry.email}</span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${
                            entry.log.strike >= 3 ? "bg-red-950/50 text-red-400 border-red-800" :
                            entry.log.strike === 2 ? "bg-amber-950/50 text-amber-400 border-amber-800" :
                            "bg-yellow-950/50 text-yellow-400 border-yellow-800"
                          }`}>
                            Strike {entry.log.strike}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">{entry.log.reason}</p>
                        <p className="text-[9px] text-zinc-600 mt-0.5 font-mono">
                          {new Date(entry.log.time).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function LiveDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
      <LiveDashboardContent />
    </Suspense>
  );
}
