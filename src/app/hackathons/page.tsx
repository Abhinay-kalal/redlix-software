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
    <div className="min-h-screen bg-zinc-50 font-poppins text-zinc-900 flex flex-col">
      {/* HERO BANNER SECTION (Matches User Screenshot) */}
      <div className="relative w-full bg-zinc-100 py-16 px-6 md:px-16 flex flex-col justify-between overflow-hidden min-h-[460px] border-b border-zinc-200">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80" 
            alt="Background Audience" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Inner Hero Content Container */}
        <div className="relative z-10 w-full max-w-6xl mx-auto flex-1 flex flex-col justify-between">
          {/* Top Bar */}
          <div className="flex justify-between items-center w-full mb-6">
            {/* Logo Redlix Image */}
            <img 
              src="https://ik.imagekit.io/dypkhqxip/redlix%20new?updatedAt=1781042212493"
              alt="Redlix Logo"
              className="h-10 md:h-14 w-auto object-contain select-none"
            />
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <button 
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  className="border border-white/20 bg-black/40 hover:bg-black/60 text-white text-[10px] md:text-xs font-semibold px-4.5 py-2 rounded flex items-center gap-1.5 transition-all cursor-pointer shadow-md backdrop-blur-xs"
                >
                  <MapPin className="h-3.5 w-3.5 text-white/80" />
                  <span>{selectedLocation}</span>
                  <span className="text-[8px] text-white/60">▼</span>
                </button>

                {showLocationDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 bg-transparent" 
                      onClick={() => setShowLocationDropdown(false)}
                    />
                    <div className="absolute right-0 mt-1.5 w-48 max-h-56 overflow-y-auto bg-white border border-zinc-200 shadow-md z-50 rounded py-1 text-left">
                      <button
                        onClick={() => handleSelectState("Select your location")}
                        className="w-full text-left px-3 py-1.5 hover:bg-zinc-50 text-zinc-500 font-medium text-[11px] border-b border-zinc-100 transition-colors"
                      >
                        All Locations
                      </button>
                      {indianStates.map((state) => (
                        <button
                          key={state}
                          onClick={() => handleSelectState(state)}
                          className="w-full text-left px-3 py-1.5 hover:bg-zinc-50 text-zinc-700 text-[11px] transition-colors"
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
          <div className="space-y-2 max-w-3xl mb-5">
            <p className="text-white/80 font-semibold text-[9px] md:text-xs tracking-wider uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
              Unleash the Possibilities!
            </p>
            <h1 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              Elevate Your Experience with <span className="text-red-500">Redlix Events</span>
            </h1>
            <p className="text-[11px] md:text-xs text-white/90 font-medium leading-relaxed max-w-md drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
              Discover high-impact hackathons and workshops. Join the Redlix community to expand your skills and build future-ready projects.
            </p>
          </div>          {/* Search & Category Widget Bar */}
          <div className="bg-red-650 p-3 md:p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center max-w-3xl w-full border border-red-700/20">
            {/* Category Dropdown */}
            <div className="w-full md:w-56 px-4 py-1.5 text-left border-b md:border-b-0 md:border-r border-white/20">
              <label className="block text-[9px] font-semibold text-red-100/80 uppercase tracking-wider">Category</label>
              <div className="relative mt-1 flex items-center">
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="w-full bg-transparent text-xs md:text-sm text-white font-semibold focus:outline-none appearance-none pr-8 py-1 cursor-pointer"
                >
                  <option value="all" className="bg-white text-zinc-800">Browse all</option>
                  <option value="active" className="bg-white text-zinc-800">Active</option>
                  <option value="past" className="bg-white text-zinc-800">Past</option>
                </select>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white/80 pointer-events-none">▼</span>
              </div>
            </div>
            
            {/* Search Query Input */}
            <div className="w-full md:flex-1 px-4 py-1.5 text-left">
              <label className="block text-[9px] font-semibold text-red-100/80 uppercase tracking-wider">Query</label>
              <div className="relative mt-1 flex items-center">
                <input 
                  type="text"
                  placeholder="Search for interest, location, date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs md:text-sm text-white font-medium focus:outline-none placeholder-red-100/50 py-1"
                />
              </div>
            </div>

            {/* White Search Button */}
            <button className="w-full md:w-auto px-8 py-3.5 bg-white hover:bg-zinc-50 text-red-650 font-bold text-xs uppercase tracking-wider rounded-lg transition-all cursor-pointer shrink-0">
              Search
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
            <p className="text-zinc-500 text-xs">Retrieving hackathon catalog...</p>
          </div>
        ) : filteredHackathons.length === 0 ? (
          <div className="py-20 text-center bg-white border border-zinc-200 shadow-sm p-8 flex flex-col items-center justify-center space-y-3">
            <Info className="h-8 w-8 text-zinc-400" />
            <p className="text-zinc-500 text-sm font-semibold">No hackathons match the criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 max-w-6xl mx-auto w-full">
            {filteredHackathons.map((h) => {
              const active = isHackathonActive(h.endDate);
              const CardContent = (
                <div className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] flex flex-col md:flex-row justify-between transition-all duration-300 relative overflow-hidden group rounded-2xl h-full">
                  {/* Card Image */}
                  <div className="relative h-48 md:h-auto md:w-80 overflow-hidden bg-zinc-100 border-b md:border-b-0 md:border-r border-zinc-100 shrink-0">
                    {h.image ? (
                      <img 
                        src={h.image} 
                        alt={h.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-50 to-zinc-100 flex items-center justify-center min-h-[160px]">
                        <div className="text-[10px] text-red-650/70 font-semibold tracking-wider uppercase">Redlix Sprint</div>
                      </div>
                    )}
                    
                    {/* Status badge absolute */}
                    <div className="absolute top-2.5 right-2.5 flex gap-1.5">
                      <span className={`text-[8px] font-bold tracking-wider uppercase px-2 py-1 bg-white rounded-md shadow-xs ${
                        active 
                          ? "text-emerald-700" 
                          : "text-zinc-550"
                      }`}>
                        {active ? "Active" : "Closed"}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 flex gap-1.5">
                      <span className="text-[8px] font-bold tracking-wider uppercase px-2 py-1 bg-zinc-900/80 text-white backdrop-blur-xs rounded-md">
                        {h.type}
                      </span>
                      <span className={`text-[8px] font-bold tracking-wider uppercase px-2 py-1 rounded-md ${
                        h.hasFee ? "bg-red-650 text-white" : "bg-emerald-600 text-white"
                      }`}>
                        {h.hasFee ? `$${h.registrationFee.toFixed(2)} Fee` : "Free Entry"}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Title & Description */}
                      <div className="space-y-1.5 pb-4 border-b border-zinc-100/80">
                        <h3 className="text-base md:text-lg font-extrabold text-zinc-955 tracking-tight leading-snug group-hover:text-red-650 transition-colors">
                          {h.title}
                        </h3>
                        {h.description && (
                          <p className="text-sm text-zinc-650 leading-relaxed font-normal line-clamp-2">
                            {h.description}
                          </p>
                        )}
                      </div>

                      {/* Timeline & Team size */}
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-zinc-600 bg-zinc-50/70 p-3.5 rounded-xl">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-red-650 shrink-0" />
                          <div>
                            <p className="text-[9px] text-zinc-450 uppercase font-bold tracking-wider">Timeline</p>
                            <p className="text-zinc-800 font-bold">{formatDate(h.startDate)} - {formatDate(h.endDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-red-650 shrink-0" />
                          <div>
                            <p className="text-[9px] text-zinc-450 uppercase font-bold tracking-wider">Team Limit</p>
                            <p className="text-zinc-800 font-bold">Max {h.teamSize} Member{h.teamSize > 1 ? "s" : ""}</p>
                          </div>
                        </div>
                      </div>

                      {/* Prize Pool Display */}
                      {(h.prizeFirst || h.prizeSecond || h.prizeThird) && (
                        <div className="bg-zinc-50/70 p-3.5 rounded-xl space-y-2">
                          <p className="text-[9px] text-zinc-455 uppercase font-bold tracking-wider">
                            Prize Pool
                          </p>
                          <div className="grid grid-cols-3 gap-2 text-10px md:text-xs">
                            {h.prizeFirst && (
                              <div className="bg-white p-2 text-center rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                                <span className="block font-semibold text-zinc-400 uppercase text-[8px] tracking-wider">1st</span>
                                <span className="font-black text-red-650">{h.prizeFirst}</span>
                              </div>
                            )}
                            {h.prizeSecond && (
                              <div className="bg-white p-2 text-center rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                                <span className="block font-semibold text-zinc-400 uppercase text-[8px] tracking-wider">2nd</span>
                                <span className="font-black text-zinc-750">{h.prizeSecond}</span>
                              </div>
                            )}
                            {h.prizeThird && (
                              <div className="bg-white p-2 text-center rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                                <span className="block font-semibold text-zinc-400 uppercase text-[8px] tracking-wider">3rd</span>
                                <span className="font-black text-zinc-650">{h.prizeThird}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Perks display */}
                      {h.perks && (
                        <div className="space-y-1.5">
                          <p className="text-[9px] text-zinc-455 uppercase font-bold tracking-wider">What You Gain</p>
                          <div className="flex flex-wrap gap-1.5">
                            {h.perks.split(/[,\n]/).map((perk, idx) => {
                              const cleanPerk = perk.trim();
                              if (!cleanPerk) return null;
                              return (
                                <span key={idx} className="bg-red-50/60 text-red-750 text-[10px] px-2.5 py-1 font-semibold rounded-md">
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
                          <p className="text-[9px] text-zinc-455 uppercase font-bold tracking-wider">Evaluation Phases</p>
                          <div className="flex flex-wrap gap-1.5">
                            {h.phases.split(/[,\n]/).map((phase, idx) => {
                              const cleanPhase = phase.trim();
                              if (!cleanPhase) return null;
                              return (
                                <span key={idx} className="bg-zinc-100/80 text-zinc-650 text-[10px] px-3 py-1 font-semibold rounded-md">
                                  {cleanPhase}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions footer */}
                    <div className="pt-3.5 border-t border-zinc-100/80 flex items-center justify-between mt-2">
                      <span className="text-[10px] text-zinc-450 font-mono">ID: {h.id.substring(0, 8)}...</span>
                      {active ? (
                        <span className="text-xs md:text-sm text-red-650 font-bold group-hover:underline flex items-center gap-1">
                          Register now <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <span className="text-zinc-400 font-medium italic text-xs">Closed</span>
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

        {/* Community Banner Block (Matches User Screenshot) */}
        <div className="bg-white border border-zinc-200 p-8 rounded-xl space-y-4 shadow-xs mt-12">
          <p className="text-[11px] text-zinc-500 font-medium">
            Follow us on your favorite platforms for the latest updates, tips, and inspiration.
          </p>
          <h2 className="text-xl md:text-2xl font-black text-zinc-950 tracking-tight">
            Join the Redlix Community!
          </h2>
          <div className="space-y-3.5 text-xs text-zinc-600 leading-relaxed font-normal">
            <p>
              <span className="font-semibold text-zinc-900">Dive Deeper!</span> Connect with us on Linkedin, Instagram and Facebook for the latest buzz, insider tips & more.
            </p>
            <p>
              <span className="font-semibold text-zinc-900">Join the Crew!</span> Engage, ask, share on our Redlix platform. Be part of our vibrant community.
            </p>
            <p>
              <span className="font-semibold text-zinc-900">Be in the Know!</span> New Opportunities? Exclusive events? Follow us and be the first.
            </p>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-200 bg-white mt-12 text-center text-xs text-zinc-400">
        © 2026 Redlix Secure. Hackathon Platform Registry. All rights reserved.
      </footer>

      {/* MODAL: Submit Project */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-zinc-300 w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="h-1 bg-orange-500" />
            <div className="p-6 space-y-6">
              
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold tracking-tight text-zinc-950">Project Submission</h3>
                <p className="text-xs text-zinc-500 font-normal">
                  Submit links for your team's completed hackathon project.
                </p>
              </div>

              {submissionSuccess ? (
                <div className="space-y-4 text-center py-4">
                  <div className="mx-auto bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-none flex flex-col items-center space-y-2">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    <p className="text-sm font-bold">Submission Received!</p>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                    Your codebase links have been saved. Our assessment pipeline will analyze the submissions shortly.
                  </p>
                  <button
                    onClick={closeSubmitModal}
                    className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-none transition-colors cursor-pointer"
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
                      className="block w-full px-3 py-2 bg-white border border-zinc-300 text-xs text-zinc-900 font-mono rounded-none focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">GitHub Repository URL</label>
                    <input
                      type="url"
                      placeholder="https://github.com/username/project"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="block w-full px-3 py-2 bg-white border border-zinc-300 text-xs text-zinc-900 rounded-none focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Deployment/Demo URL</label>
                    <input
                      type="url"
                      placeholder="https://my-demo-app.vercel.app"
                      value={demoUrl}
                      onChange={(e) => setDemoUrl(e.target.value)}
                      className="block w-full px-3 py-2 bg-white border border-zinc-300 text-xs text-zinc-900 rounded-none focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
                    />
                  </div>

                  {errorMsg && (
                    <p className="text-xs text-red-650 font-semibold">{errorMsg}</p>
                  )}

                  <div className="flex gap-2 justify-end pt-2 border-t border-zinc-150">
                    <button
                      type="button"
                      onClick={closeSubmitModal}
                      className="px-4 py-2 border border-zinc-300 text-zinc-700 hover:bg-zinc-50 text-xs font-bold rounded-none cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-xs font-semibold rounded-none shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
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
