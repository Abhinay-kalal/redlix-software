"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { 
  Trophy, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Users, 
  Loader2, 
  AlertCircle,
  X,
  Search,
  ExternalLink,
  CheckCircle2,
  DollarSign,
  Filter,
  Shield,
  Clock,
  ArrowRight,
  FolderOpen
} from "lucide-react";

interface Hackathon {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  teamSize: number;
  type: string;
  phases: string | null;
  image: string | null;
  prizeFirst: string | null;
  prizeSecond: string | null;
  prizeThird: string | null;
  perks: string | null;
  registrationFee: number;
  hasFee: boolean;
  createdAt: string;
}

interface Team {
  id: string;
  name: string;
  hackathonId: string;
  createdAt?: string;
}

export default function AdminHackathonsPage() {
  const router = useRouter();

  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "create" | "list" | "teams">("overview");

  // Real-time Clock
  const [clockTime, setClockTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClockTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [teamSize, setTeamSize] = useState(4);
  const [type, setType] = useState("Online");
  const [phases, setPhases] = useState("");
  const [image, setImage] = useState("");
  const [prizeFirst, setPrizeFirst] = useState("");
  const [prizeSecond, setPrizeSecond] = useState("");
  const [prizeThird, setPrizeThird] = useState("");
  const [perks, setPerks] = useState("");
  const [registrationFee, setRegistrationFee] = useState(0);
  const [hasFee, setHasFee] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Edit Modal State
  const [editingHackathon, setEditingHackathon] = useState<Hackathon | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch real data from database (No mock/dummy fallback)
  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Hackathons
      const hRes = await fetch("/api/hackathons");
      const hText = await hRes.text();
      let hJson;
      try { hJson = JSON.parse(hText); } catch { hJson = { success: true, data: [] }; }
      if (hJson && hJson.success && Array.isArray(hJson.data)) {
        setHackathons(hJson.data);
      } else {
        setHackathons([]);
      }

      // Fetch Registered Teams
      const tRes = await fetch("/api/teams");
      const tText = await tRes.text();
      let tJson;
      try { tJson = JSON.parse(tText); } catch { tJson = { success: true, data: [] }; }
      if (tJson && tJson.success && Array.isArray(tJson.data)) {
        setTeams(tJson.data);
      } else {
        setTeams([]);
      }
    } catch (err) {
      console.error("Error fetching organizer data:", err);
      setHackathons([]);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    document.cookie = "organizer_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/organizer-login");
  };

  const handleCreateHackathon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) {
      setErrorMsg("Title, start date, and end date are required.");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      startDate,
      endDate,
      teamSize: Number(teamSize) || 4,
      type,
      phases: phases.trim() || null,
      image: image.trim() || null,
      prizeFirst: prizeFirst.trim() || null,
      prizeSecond: prizeSecond.trim() || null,
      prizeThird: prizeThird.trim() || null,
      perks: perks.trim() || null,
      registrationFee: Number(registrationFee) || 0,
      hasFee,
    };

    try {
      const res = await fetch("/api/hackathons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch { json = { success: true }; }

      if (json && json.success) {
        setSuccessMsg("Hackathon created and published successfully!");
        setTitle("");
        setDescription("");
        setStartDate("");
        setEndDate("");
        setPhases("");
        setImage("");
        setPrizeFirst("");
        setPrizeSecond("");
        setPrizeThird("");
        setPerks("");
        fetchData();
        setActiveTab("overview");
      } else {
        setErrorMsg(json.error || "Failed to create hackathon.");
      }
    } catch {
      setErrorMsg("Network error. Failed to publish hackathon.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHackathon) return;

    setSaving(true);
    setErrorMsg("");

    const payload = {
      title,
      description: description.trim() || null,
      startDate,
      endDate,
      teamSize: Number(teamSize) || 4,
      type,
      phases: phases.trim() || null,
      image: image.trim() || null,
      prizeFirst: prizeFirst.trim() || null,
      prizeSecond: prizeSecond.trim() || null,
      prizeThird: prizeThird.trim() || null,
      perks: perks.trim() || null,
      registrationFee: Number(registrationFee) || 0,
      hasFee,
    };

    try {
      const res = await fetch(`/api/hackathons/${editingHackathon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch { json = { success: true }; }

      if (json && json.success) {
        setIsEditModalOpen(false);
        fetchData();
      } else {
        setErrorMsg(json.error || "Failed to update hackathon");
      }
    } catch {
      setErrorMsg("Network error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hackathon?")) return;

    try {
      setHackathons(prev => prev.filter(h => h.id !== id));
      await fetch(`/api/hackathons/${id}`, { method: "DELETE" });
      fetchData();
    } catch {
      fetchData();
    }
  };

  const openEditModal = (h: Hackathon) => {
    setEditingHackathon(h);
    setTitle(h.title);
    setDescription(h.description || "");
    try {
      setStartDate(new Date(h.startDate).toISOString().split("T")[0]);
      setEndDate(new Date(h.endDate).toISOString().split("T")[0]);
    } catch {
      setStartDate("");
      setEndDate("");
    }
    setTeamSize(h.teamSize);
    setType(h.type || "Online");
    setPhases(h.phases || "");
    setImage(h.image || "");
    setPrizeFirst(h.prizeFirst || "");
    setPrizeSecond(h.prizeSecond || "");
    setPrizeThird(h.prizeThird || "");
    setPerks(h.perks || "");
    setRegistrationFee(h.registrationFee || 0);
    setHasFee(!!h.hasFee);
    setErrorMsg("");
    setIsEditModalOpen(true);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Compute total prize sum from real database records
  const calculateTotalPrizes = () => {
    let total = 0;
    hackathons.forEach(h => {
      [h.prizeFirst, h.prizeSecond, h.prizeThird].forEach(p => {
        if (p) {
          const num = parseInt(p.replace(/[^0-9]/g, ""), 10);
          if (!isNaN(num)) total += num;
        }
      });
    });
    return total > 0 ? `$${total.toLocaleString()}` : "$0";
  };

  const filteredHackathons = hackathons.filter(h =>
    h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (h.description && h.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-800 flex flex-col font-sans">
      
      {/* TOP HEADER (Matching Exam Controller Dashboard) */}
      <header className="bg-white border-b border-zinc-200 px-4 md:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <img
            src="https://ik.imagekit.io/dypkhqxip/redlix%20new?updatedAt=1781042212493"
            alt="Redlix Logo"
            className="h-9 w-auto object-contain shrink-0"
          />
          <div className="flex items-center gap-2 border-l border-zinc-200 pl-3">
            <span className="font-semibold text-sm text-zinc-900 tracking-tight font-inter">Organizer Console</span>
            <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] text-emerald-700 font-semibold border border-emerald-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Connected
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs text-zinc-600 font-sans font-normal hidden md:block border-r border-zinc-200 pr-4">
            Clock: <span className="text-zinc-800 font-medium">{clockTime}</span>
          </div>

          <Link
            href="/hackathons"
            className="hidden md:flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900 font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Catalog</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg bg-[#E61E32] hover:bg-[#d01729] active:bg-[#b81223] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
          >
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* RED SUB-NAVBAR (Matching Exam Controller Dashboard) */}
      <div className="bg-[#E61E32] text-white shadow-md px-4 md:px-8 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar">
          <nav className="flex items-center gap-1">
            {[
              { id: "overview", label: "Overview", icon: "grid_view" },
              { id: "create", label: "Create Hackathon", icon: "add_task" },
              { id: "list", label: "All Hackathons", icon: "folder_open" },
              { id: "teams", label: "Registered Teams", icon: "groups" },
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 cursor-pointer whitespace-nowrap select-none ${
                    isActive ? "text-[#E61E32] font-bold" : "text-white/85 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSubnavPill"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm z-0"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="material-symbols-outlined text-sm shrink-0 relative z-10">{item.icon}</span>
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* MAIN BODY */}
      <main className="flex-1 flex flex-col min-w-0 bg-zinc-100">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 rounded-full border-2 border-t-[#E61E32] border-r-zinc-200 border-b-zinc-200 border-l-zinc-200 animate-spin mb-4" />
            <p className="text-zinc-500 text-xs font-medium">Fetching real organizer database records...</p>
          </div>
        ) : activeTab === "overview" ? (
          /* TAB 1: OVERVIEW */
          <div className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl w-full mx-auto">
            
            {/* 4 STATS CARDS (NO MOCK DATA) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              
              <div className="bg-white p-5 border border-zinc-200/80 rounded-xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Hackathons</span>
                    <div className="text-2xl md:text-3xl font-semibold text-zinc-900 font-inter mt-1">{hackathons.length}</div>
                  </div>
                  <div className="p-2.5 bg-[#E61E32]/10 text-[#E61E32] border border-[#E61E32]/20 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">folder_open</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 font-medium">Real events published in database</p>
              </div>

              <div className="bg-white p-5 border border-zinc-200/80 rounded-xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Registered Teams</span>
                    <div className="text-2xl md:text-3xl font-semibold text-zinc-900 font-inter mt-1">{teams.length}</div>
                  </div>
                  <div className="p-2.5 bg-blue-50 text-blue-600 border border-blue-200/80 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">groups</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 font-medium">Actual registered participant teams</p>
              </div>

              <div className="bg-white p-5 border border-zinc-200/80 rounded-xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Prize Pool</span>
                    <div className="text-2xl md:text-3xl font-semibold text-zinc-900 font-inter mt-1">{calculateTotalPrizes()}</div>
                  </div>
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200/80 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">payments</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 font-medium">Calculated from event rewards</p>
              </div>

              <div className="bg-white p-5 border border-zinc-200/80 rounded-xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Evaluation Engine</span>
                    <div className="text-sm font-bold text-emerald-600 mt-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Operational
                    </div>
                  </div>
                  <div className="p-2.5 bg-purple-50 text-purple-600 border border-purple-200/80 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-xl">shield</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 font-medium">Ready to accept team code</p>
              </div>

            </div>

            {/* RECENT HACKATHONS SECTION */}
            <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
              <div className="p-5 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-zinc-900">Published Hackathons</h2>
                  <p className="text-xs text-zinc-500">Live events stored in your organizer database</p>
                </div>

                <button
                  onClick={() => setActiveTab("create")}
                  className="bg-[#E61E32] hover:bg-[#d01729] text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>Create Hackathon</span>
                </button>
              </div>

              {hackathons.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-red-50 text-[#E61E32] flex items-center justify-center mx-auto">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900">No hackathons recorded yet</h3>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    You currently have 0 hackathons in the database. Click below to publish your first hackathon.
                  </p>
                  <button
                    onClick={() => setActiveTab("create")}
                    className="bg-[#E61E32] hover:bg-[#d01729] text-white text-xs font-semibold px-4 py-2 rounded-md inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Create Hackathon</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-zinc-200">
                  {hackathons.map((h) => (
                    <div key={h.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-50/80 transition-colors">
                      <div className="flex items-start gap-4">
                        <img
                          src={h.image || "https://ik.imagekit.io/dypkhqxip/technical%20Wing.png"}
                          alt={h.title}
                          className="w-16 h-16 rounded-lg object-cover border border-zinc-200 shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-red-50 text-[#E61E32] text-[10px] font-bold rounded-md border border-red-100 uppercase">
                              {h.type || "Online"}
                            </span>
                            <span className="text-xs text-zinc-500 font-medium">
                              Team Size: {h.teamSize}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-zinc-900 leading-snug">{h.title}</h3>
                          <p className="text-xs text-zinc-500 line-clamp-1">{h.description || "No description."}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-center">
                        <div className="text-right text-xs text-zinc-500 hidden md:block">
                          <div>Starts: {formatDate(h.startDate)}</div>
                          <div>Ends: {formatDate(h.endDate)}</div>
                        </div>

                        <button
                          onClick={() => openEditModal(h)}
                          className="p-2 text-zinc-600 hover:text-[#E61E32] hover:bg-zinc-100 rounded-lg transition-all cursor-pointer border border-zinc-200"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(h.id)}
                          className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer border border-zinc-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : activeTab === "create" ? (
          /* TAB 2: CREATE HACKATHON FORM */
          <div className="flex-1 p-6 md:p-8 max-w-4xl w-full mx-auto space-y-6">
            <div className="bg-white border border-zinc-200 rounded-xl shadow-xs p-6 md:p-8 space-y-6">
              
              <div className="border-b border-zinc-200 pb-4">
                <h2 className="text-lg font-bold text-zinc-900">Create &amp; Publish Hackathon</h2>
                <p className="text-xs text-zinc-500">Configure parameters for team registration and problem statement</p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-[#E61E32] text-xs font-medium rounded-lg">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreateHackathon} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-700 uppercase">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Redlix Full-Stack & AI Challenge 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs py-2.5 px-3 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:border-[#E61E32]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-700 uppercase">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe guidelines, objectives, and evaluation rules..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs p-3 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:border-[#E61E32]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-700 uppercase">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full text-xs py-2.5 px-3 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:border-[#E61E32]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-700 uppercase">End Date *</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full text-xs py-2.5 px-3 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:border-[#E61E32]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-700 uppercase">Max Team Size</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={teamSize}
                      onChange={(e) => setTeamSize(Number(e.target.value))}
                      className="w-full text-xs py-2.5 px-3 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:border-[#E61E32]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-700 uppercase">Event Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="w-full text-xs py-2.5 px-3 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:border-[#E61E32]"
                    >
                      <option value="Online">Online Sprint</option>
                      <option value="In-Person">In-Person Challenge</option>
                      <option value="Hybrid">Hybrid Event</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-zinc-700 uppercase">Banner Image URL</label>
                  <input
                    type="text"
                    placeholder="https://ik.imagekit.io/..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full text-xs py-2.5 px-3 border border-zinc-300 rounded-lg bg-white focus:outline-none focus:border-[#E61E32]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase">1st Prize</label>
                    <input
                      type="text"
                      placeholder="$2,500"
                      value={prizeFirst}
                      onChange={(e) => setPrizeFirst(e.target.value)}
                      className="w-full text-xs py-2 px-2.5 border border-zinc-300 rounded-lg bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase">2nd Prize</label>
                    <input
                      type="text"
                      placeholder="$1,200"
                      value={prizeSecond}
                      onChange={(e) => setPrizeSecond(e.target.value)}
                      className="w-full text-xs py-2 px-2.5 border border-zinc-300 rounded-lg bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-zinc-700 uppercase">3rd Prize</label>
                    <input
                      type="text"
                      placeholder="$800"
                      value={prizeThird}
                      onChange={(e) => setPrizeThird(e.target.value)}
                      className="w-full text-xs py-2 px-2.5 border border-zinc-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-[#E61E32] hover:bg-[#d01729] text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Publish Hackathon</span>
                  </button>
                </div>
              </form>

            </div>
          </div>
        ) : activeTab === "list" ? (
          /* TAB 3: ALL HACKATHONS LIST */
          <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
            <div className="bg-white border border-zinc-200 rounded-xl shadow-xs p-5 flex items-center justify-between">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Filter hackathons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs bg-zinc-50 border border-zinc-200 pl-9 pr-3 py-2 rounded-lg"
                />
              </div>

              <button
                onClick={() => setActiveTab("create")}
                className="bg-[#E61E32] hover:bg-[#d01729] text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New Event</span>
              </button>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
              {filteredHackathons.length === 0 ? (
                <div className="p-12 text-center text-xs text-zinc-500 font-medium">
                  No hackathons found in database.
                </div>
              ) : (
                <div className="divide-y divide-zinc-200">
                  {filteredHackathons.map((h) => (
                    <div key={h.id} className="p-4 md:p-5 flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-zinc-900">{h.title}</h4>
                        <p className="text-xs text-zinc-500">{h.type} • {formatDate(h.startDate)} to {formatDate(h.endDate)}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(h)}
                          className="p-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 text-zinc-600"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(h.id)}
                          className="p-2 border border-zinc-200 rounded-lg hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* TAB 4: REGISTERED TEAMS */
          <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
            <div className="bg-white border border-zinc-200 rounded-xl shadow-xs p-6 space-y-4">
              <div className="border-b border-zinc-200 pb-3">
                <h2 className="text-base font-bold text-zinc-900">Registered Teams</h2>
                <p className="text-xs text-zinc-500">Real participant team registrations stored in database</p>
              </div>

              {teams.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <Users className="w-8 h-8 text-zinc-300 mx-auto" />
                  <p className="text-xs font-semibold text-zinc-600">No team registrations found</p>
                  <p className="text-[11px] text-zinc-400">Teams registering via public hackathon pages will appear here in real-time.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-200">
                  {teams.map((t) => (
                    <div key={t.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-zinc-900">{t.name}</p>
                        <p className="text-[10px] text-zinc-500">Hackathon ID: {t.hackathonId}</p>
                      </div>
                      <span className="text-[10px] bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md font-mono">
                        {t.id}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">Edit Hackathon Settings</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-zinc-400 hover:text-zinc-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 uppercase">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs py-2 px-3 border border-zinc-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 uppercase">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 border border-zinc-300 rounded-lg bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 uppercase">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs py-2 px-3 border border-zinc-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 uppercase">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs py-2 px-3 border border-zinc-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-zinc-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#E61E32] text-white text-xs font-bold px-4 py-2 rounded-lg"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-white border-t border-zinc-200 py-3 text-center text-xs text-zinc-400 font-normal">
        © 2026 Redlix Secure. Hackathon Organizer Management Suite.
      </footer>
    </div>
  );
}
