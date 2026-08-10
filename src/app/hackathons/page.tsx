"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Calendar, 
  Users, 
  Search, 
  Code, 
  ExternalLink, 
  Plus, 
  CheckCircle2, 
  Info,
  Trophy,
  ArrowRight,
  Loader2,
  MapPin
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

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "past">("all");

  // Registration modal state
  const [selectedHackathon, setSelectedHackathon] = useState<Hackathon | null>(null);
  const [teamName, setTeamName] = useState("");
  const [registering, setRegistering] = useState(false);
  const [registeredTeamId, setRegisteredTeamId] = useState<string | null>(null);

  // Submission modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitTeamId, setSubmitTeamId] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Select your location");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal"
  ];

  const handleSelectState = (state: string) => {
    setSelectedLocation(state);
    setShowLocationDropdown(false);
  };

  const fetchHackathons = async () => {
    try {
      const res = await fetch("/api/hackathons");
      const json = await res.json();
      if (json.success) {
        setHackathons(json.data);
      }
    } catch (err) {
      console.error("Error fetching hackathons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Redlix Hackathons & Engineering Sprints";
    fetchHackathons();
  }, []);

  const handleRegisterTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHackathon || !teamName.trim()) return;

    setRegistering(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teamName.trim(),
          hackathonId: selectedHackathon.id,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setRegisteredTeamId(json.data.id);
      } else {
        setErrorMsg(json.error || "Failed to register team");
      }
    } catch (err) {
      setErrorMsg("Network error occurred. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitTeamId.trim()) return;

    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: submitTeamId.trim(),
          githubUrl: githubUrl.trim() || null,
          demoUrl: demoUrl.trim() || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSubmissionSuccess(true);
      } else {
        setErrorMsg(json.error || "Failed to submit project");
      }
    } catch (err) {
      setErrorMsg("Network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const closeRegisterModal = () => {
    setSelectedHackathon(null);
    setTeamName("");
    setRegisteredTeamId(null);
    setErrorMsg("");
  };

  const closeSubmitModal = () => {
    setShowSubmitModal(false);
    setSubmitTeamId("");
    setGithubUrl("");
    setDemoUrl("");
    setSubmissionSuccess(false);
    setErrorMsg("");
  };

  // Filter hackathons
  const filteredHackathons = hackathons.filter((h) => {
    const matchesSearch = 
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.description && h.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    const now = new Date();
    const end = new Date(h.endDate);

    if (filter === "active") {
      return end >= now;
    } else if (filter === "past") {
      return end < now;
    }
    return true;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isHackathonActive = (endDateStr: string) => {
    return new Date(endDateStr) >= new Date();
  };

  return (
    <div className="min-h-screen bg-zinc-100 font-sans text-zinc-900 flex flex-col">
      
      {/* HERO BANNER SECTION */}
      <div className="relative w-full bg-zinc-950 py-12 md:py-16 px-6 md:px-12 flex flex-col justify-between overflow-hidden border-b border-zinc-900">
        {/* Background Image Layer with Dark Gradient Overlay */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80" 
            alt="Background Audience" 
            className="w-full h-full object-cover opacity-20 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/95 to-zinc-950/80" />
        </div>

        {/* Inner Hero Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto flex-1 flex flex-col justify-between space-y-8 md:space-y-10">
          {/* Top Navbar */}
          <div className="flex justify-between items-center w-full">
            {/* Logo directly on hero header */}
            <Link href="/hackathons" className="flex items-center gap-3">
              <img 
                src="https://ik.imagekit.io/dypkhqxip/redlix%20new?updatedAt=1781042212493"
                alt="Logo"
                className="h-7 md:h-8.5 w-auto object-contain select-none"
              />
              <div className="flex items-center gap-2 border-l border-white/20 pl-3">
                <span className="font-medium text-xs md:text-sm text-zinc-200 font-inter tracking-wide">Hackathons &amp; Sprints</span>
              </div>
            </Link>
            
            {/* Actions: Host Button + Location Selector */}
            <div className="flex items-center gap-2.5">
              <Link 
                href="/organizer-login"
                className="bg-[#E61E32] hover:bg-[#d01729] active:scale-98 text-white text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Plus className="h-4 w-4 text-white stroke-[2.5]" />
                <span>Host</span>
              </Link>

              <div className="relative">
                <button 
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  className="border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-medium px-4 py-2 rounded-md flex items-center gap-2 transition-all cursor-pointer shadow-xs backdrop-blur-md"
                >
                  <MapPin className="h-3.5 w-3.5 text-[#E61E32]" />
                  <span>{selectedLocation}</span>
                  <span className="text-[9px] text-zinc-400">▼</span>
                </button>

                {showLocationDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 bg-transparent" 
                      onClick={() => setShowLocationDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 max-h-60 overflow-y-auto bg-zinc-900 border border-zinc-800 shadow-2xl z-50 rounded-md py-1 text-left text-zinc-100">
                      <button
                        onClick={() => handleSelectState("Select your location")}
                        className="w-full text-left px-3.5 py-2 hover:bg-zinc-800 text-zinc-400 font-medium text-xs border-b border-zinc-800 transition-colors"
                      >
                        All Locations
                      </button>
                      {indianStates.map((state) => (
                        <button
                          key={state}
                          onClick={() => handleSelectState(state)}
                          className="w-full text-left px-3.5 py-1.5 hover:bg-zinc-800 text-zinc-200 text-xs font-medium transition-colors"
                        >
                          {state}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Hero Typography & Text */}
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-2xl md:text-3xl font-medium text-white leading-snug tracking-tight font-inter">
              Build &amp; Compete in <span className="text-[#E61E32]">Global Developer Sprints</span>
            </h1>
            <p className="text-sm md:text-base text-zinc-300 font-normal leading-relaxed max-w-2xl">
              Solve real engineering challenges, collaborate with developer teams, and build industry-grade projects.
            </p>
          </div>

          {/* State-of-the-Art Search & Category Filter Bar */}
          <div className="bg-zinc-900/95 backdrop-blur-xl p-2 rounded-lg flex flex-col md:flex-row gap-2 items-center max-w-4xl w-full border border-zinc-800/90 shadow-2xl transition-all duration-300 focus-within:border-[#E61E32]/60 focus-within:ring-1 focus-within:ring-[#E61E32]/30">
            
            {/* Category Dropdown */}
            <div className="w-full md:w-52 px-3.5 py-2 text-left border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col justify-center">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-inter">
                Category
              </label>
              <div className="relative mt-1 flex items-center">
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="w-full bg-transparent text-sm text-white font-medium focus:outline-none appearance-none pr-6 py-0.5 cursor-pointer font-inter"
                >
                  <option value="all" className="bg-zinc-900 text-white">All Events</option>
                  <option value="active" className="bg-zinc-900 text-white">Active Events</option>
                  <option value="past" className="bg-zinc-900 text-white">Concluded Events</option>
                </select>
                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 pointer-events-none">
                  ▼
                </span>
              </div>
            </div>
            
            {/* Search Query Input */}
            <div className="w-full md:flex-1 px-3.5 py-2 text-left flex flex-col justify-center">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-inter">
                Search
              </label>
              <div className="relative mt-1 flex items-center gap-2.5">
                <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                <input 
                  type="text"
                  placeholder="Search by title, technology, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-white font-medium focus:outline-none placeholder-zinc-500 py-0.5 font-inter"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="text-zinc-400 hover:text-white text-xs font-bold px-1 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Redlix Red Search Button */}
            <button className="w-full md:w-auto px-8 py-3 bg-[#E61E32] hover:bg-[#d01729] active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer shrink-0 shadow-[0_4px_16px_rgba(230,30,50,0.35)] hover:shadow-[0_6px_24px_rgba(230,30,50,0.5)] flex items-center justify-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#E61E32] animate-spin mb-4" />
            <p className="text-zinc-500 text-xs font-semibold">Loading hackathon catalog...</p>
          </div>
        ) : filteredHackathons.length === 0 ? (
          <div className="py-20 text-center bg-white border border-zinc-200/90 rounded-md shadow-xs p-8 flex flex-col items-center justify-center space-y-3">
            <Info className="h-8 w-8 text-zinc-400" />
            <p className="text-zinc-600 text-sm font-semibold">No hackathons found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 max-w-7xl mx-auto w-full">
            {filteredHackathons.map((h) => {
              const active = isHackathonActive(h.endDate);
              const CardContent = (
                <div className="bg-white border border-zinc-200/90 rounded-md shadow-xs hover:shadow-md hover:border-[#E61E32]/30 flex flex-col md:flex-row justify-between transition-all duration-200 overflow-hidden group h-full">
                  {/* Card Image Cover Frame */}
                  <div className="relative h-52 md:h-auto md:w-80 overflow-hidden bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-200/80 shrink-0">
                    {h.image ? (
                      <img 
                        src={h.image} 
                        alt={h.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-zinc-950 flex flex-col items-center justify-center p-6 text-center">
                        <Code className="w-8 h-8 text-[#E61E32] mb-2" />
                        <span className="text-xs text-white font-bold tracking-wider uppercase">Redlix Hackathon</span>
                      </div>
                    )}
                    
                    {/* Status badge absolute */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-xs ${
                        active 
                          ? "bg-emerald-600 text-white" 
                          : "bg-zinc-800 text-zinc-300"
                      }`}>
                        {active ? "Active" : "Closed"}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 flex gap-2">
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 bg-zinc-950/90 text-white backdrop-blur-xs rounded-md border border-white/10">
                        {h.type}
                      </span>
                      <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md ${
                        h.hasFee ? "bg-[#E61E32] text-white" : "bg-emerald-600 text-white"
                      }`}>
                        {h.hasFee ? `$${h.registrationFee.toFixed(2)} Fee` : "Free Entry"}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Details */}
                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Title & Description */}
                      <div className="space-y-1.5 pb-3 border-b border-zinc-100">
                        <h3 className="text-base md:text-lg font-bold text-zinc-900 tracking-tight leading-snug group-hover:text-[#E61E32] transition-colors">
                          {h.title}
                        </h3>
                        {h.description && (
                          <p className="text-xs text-zinc-600 leading-relaxed font-normal line-clamp-2">
                            {h.description}
                          </p>
                        )}
                      </div>

                      {/* Timeline & Team size */}
                      <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-zinc-700 bg-zinc-50 border border-zinc-200/70 p-3 rounded-md">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="h-4 w-4 text-[#E61E32] shrink-0" />
                          <div>
                            <p className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider">Timeline</p>
                            <p className="text-zinc-900 font-bold">{formatDate(h.startDate)} - {formatDate(h.endDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Users className="h-4 w-4 text-[#E61E32] shrink-0" />
                          <div>
                            <p className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider">Team Size</p>
                            <p className="text-zinc-900 font-bold">Max {h.teamSize} Member{h.teamSize > 1 ? "s" : ""}</p>
                          </div>
                        </div>
                      </div>

                      {/* Prize Pool Display */}
                      {(h.prizeFirst || h.prizeSecond || h.prizeThird) && (
                        <div className="bg-zinc-50 border border-zinc-200/70 p-3 rounded-md space-y-2">
                          <p className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider">
                            Prize Pool
                          </p>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            {h.prizeFirst && (
                              <div className="bg-white p-2 text-center rounded-md border border-zinc-200/80 shadow-2xs">
                                <span className="block font-semibold text-zinc-400 uppercase text-[8px] tracking-wider">1st Prize</span>
                                <span className="font-black text-[#E61E32] text-xs">{h.prizeFirst}</span>
                              </div>
                            )}
                            {h.prizeSecond && (
                              <div className="bg-white p-2 text-center rounded-md border border-zinc-200/80 shadow-2xs">
                                <span className="block font-semibold text-zinc-400 uppercase text-[8px] tracking-wider">2nd Prize</span>
                                <span className="font-bold text-zinc-800 text-xs">{h.prizeSecond}</span>
                              </div>
                            )}
                            {h.prizeThird && (
                              <div className="bg-white p-2 text-center rounded-md border border-zinc-200/80 shadow-2xs">
                                <span className="block font-semibold text-zinc-400 uppercase text-[8px] tracking-wider">3rd Prize</span>
                                <span className="font-bold text-zinc-700 text-xs">{h.prizeThird}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Perks display */}
                      {h.perks && (
                        <div className="space-y-1.5">
                          <p className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider">What You Gain</p>
                          <div className="flex flex-wrap gap-1.5">
                            {h.perks.split(/[,\n]/).map((perk, idx) => {
                              const cleanPerk = perk.trim();
                              if (!cleanPerk) return null;
                              return (
                                <span key={idx} className="bg-red-50 text-[#E61E32] text-[11px] px-2.5 py-1 font-semibold rounded-md border border-red-100">
                                  ✓ {cleanPerk}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Phases display */}
                      {h.phases && (
                        <div className="space-y-1.5">
                          <p className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider">Evaluation Phases</p>
                          <div className="flex flex-wrap gap-1.5">
                            {h.phases.split(/[,\n]/).map((phase, idx) => {
                              const cleanPhase = phase.trim();
                              if (!cleanPhase) return null;
                              return (
                                <span key={idx} className="bg-zinc-100 text-zinc-700 text-[11px] px-3 py-1 font-semibold rounded-md border border-zinc-200/60">
                                  {cleanPhase}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions footer */}
                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between mt-2">
                      <span className="text-[10px] text-zinc-400 font-mono">ID: {h.id.substring(0, 8)}...</span>
                      {active ? (
                        <span className="text-xs text-[#E61E32] font-bold group-hover:underline flex items-center gap-1">
                          Register for Hackathon <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <span className="text-zinc-400 font-semibold italic text-xs">Event Concluded</span>
                      )}
                    </div>
                  </div>
                </div>
              );

              if (active) {
                return (
                  <Link
                    key={h.id}
                    href={`/hackathons/${h.id}/register`}
                    target="_blank"
                    className="block hover:no-underline"
                  >
                    {CardContent}
                  </Link>
                );
              }
              return <div key={h.id}>{CardContent}</div>;
            })}
          </div>
        )}

        {/* Community Banner Block */}
        <div className="bg-white border border-zinc-200/90 p-8 rounded-md space-y-4 shadow-xs mt-12">
          <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider text-[#E61E32]">
            Connect &amp; Collaborate
          </p>
          <h2 className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight font-inter">
            Join the Redlix Global Community!
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-600 leading-relaxed font-normal pt-2">
            <div className="bg-zinc-50 p-4 rounded-md border border-zinc-200/80 space-y-1">
              <span className="font-bold text-zinc-900 block">Dive Deeper!</span>
              <p className="text-zinc-500">Connect with us on LinkedIn and Instagram for the latest event announcements and technical tips.</p>
            </div>
            <div className="bg-zinc-50 p-4 rounded-md border border-zinc-200/80 space-y-1">
              <span className="font-bold text-zinc-900 block">Join the Crew!</span>
              <p className="text-zinc-500">Engage, ask questions, and share project updates on our platform community network.</p>
            </div>
            <div className="bg-zinc-50 p-4 rounded-md border border-zinc-200/80 space-y-1">
              <span className="font-bold text-zinc-900 block">Be in the Know!</span>
              <p className="text-zinc-500">Receive priority notifications for upcoming hackathons, tech sprints, and prize pools.</p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-200 bg-white mt-12 text-center text-xs text-zinc-500 font-medium">
        © 2026 Redlix Secure. Hackathon Platform Registry. All rights reserved.
      </footer>

      {/* MODAL: Submit Project */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200 rounded-md w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="h-1 bg-[#E61E32]" />
            <div className="p-6 space-y-6">
              
              <div className="space-y-1">
                <h3 className="text-lg font-bold tracking-tight text-zinc-900 font-inter">Project Submission</h3>
                <p className="text-xs text-zinc-500 font-normal">
                  Submit links for your team's completed hackathon project.
                </p>
              </div>

              {submissionSuccess ? (
                <div className="space-y-4 text-center py-4">
                  <div className="mx-auto bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-md flex flex-col items-center space-y-2">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    <p className="text-sm font-bold">Submission Received!</p>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                    Your codebase links have been saved. Our assessment pipeline will analyze the submissions shortly.
                  </p>
                  <button
                    onClick={closeSubmitModal}
                    className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-md transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmission} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Team ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. cly... (paste your registered Team ID)"
                      value={submitTeamId}
                      onChange={(e) => setSubmitTeamId(e.target.value)}
                      className="block w-full px-3 py-2 bg-white border border-zinc-300 text-xs text-zinc-900 font-mono rounded-md focus:outline-none focus:border-[#E61E32] transition-colors shadow-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">GitHub Repository URL</label>
                    <input
                      type="url"
                      placeholder="https://github.com/username/project"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="block w-full px-3 py-2 bg-white border border-zinc-300 text-xs text-zinc-900 rounded-md focus:outline-none focus:border-[#E61E32] transition-colors shadow-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Deployment/Demo URL</label>
                    <input
                      type="url"
                      placeholder="https://my-demo-app.vercel.app"
                      value={demoUrl}
                      onChange={(e) => setDemoUrl(e.target.value)}
                      className="block w-full px-3 py-2 bg-white border border-zinc-300 text-xs text-zinc-900 rounded-md focus:outline-none focus:border-[#E61E32] transition-colors shadow-xs"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-xs text-[#E61E32] font-semibold">{errorMsg}</p>
                  )}

                  <div className="flex gap-2 justify-end pt-2 border-t border-zinc-150">
                    <button
                      type="button"
                      onClick={closeSubmitModal}
                      className="px-4 py-2 border border-zinc-300 text-zinc-700 hover:bg-zinc-50 text-xs font-bold rounded-md cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-[#E61E32] hover:bg-[#d01729] disabled:bg-red-300 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
                      Submit Code
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
