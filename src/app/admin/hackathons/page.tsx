"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Trophy, 
  Plus, 
  Trash2, 
  Edit, 
  Calendar, 
  Users, 
  Loader2, 
  AlertCircle,
  X,
  ArrowLeft
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

export default function AdminHackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState<Hackathon | null>(null);

  // Form fields
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

  const fetchHackathons = async () => {
    try {
      const res = await fetch("/api/hackathons");
      const json = await res.json();
      if (json.success) {
        setHackathons(json.data);
      }
    } catch (err) {
      console.error("Error loading hackathons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  const openCreateModal = () => {
    setEditingHackathon(null);
    setTitle("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setTeamSize(4);
    setType("Online");
    setPhases("");
    setImage("");
    setPrizeFirst("");
    setPrizeSecond("");
    setPrizeThird("");
    setPerks("");
    setRegistrationFee(0);
    setHasFee(false);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (h: Hackathon) => {
    setEditingHackathon(h);
    setTitle(h.title);
    setDescription(h.description || "");
    // Format dates to YYYY-MM-DD
    setStartDate(new Date(h.startDate).toISOString().split("T")[0]);
    setEndDate(new Date(h.endDate).toISOString().split("T")[0]);
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
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");

    const payload = {
      title,
      description: description.trim() || null,
      startDate,
      endDate,
      teamSize,
      type,
      phases: phases.trim() || null,
      image: image.trim() || null,
      prizeFirst: prizeFirst.trim() || null,
      prizeSecond: prizeSecond.trim() || null,
      prizeThird: prizeThird.trim() || null,
      perks: perks.trim() || null,
      registrationFee: Number(registrationFee),
      hasFee,
    };

    try {
      const url = editingHackathon 
        ? `/api/hackathons/${editingHackathon.id}` 
        : "/api/hackathons";
      const method = editingHackathon ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        fetchHackathons();
      } else {
        setErrorMsg(json.error || "Failed to save hackathon");
      }
    } catch (err) {
      setErrorMsg("Network error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hackathon? This will remove it from the system.")) {
      return;
    }

    try {
      const res = await fetch(`/api/hackathons/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        fetchHackathons();
      } else {
        alert(json.error || "Failed to delete hackathon");
      }
    } catch (err) {
      alert("Network error occurred. Please try again.");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-zinc-100 font-sans text-zinc-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-orange-500 border-b border-orange-600 py-3.5 px-6 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/hackathons" className="text-white hover:text-orange-100 transition-colors">
              <ArrowLeft className="h-4.5 w-4.5" />
            </Link>
            <nav className="text-xs text-orange-100 font-semibold flex items-center gap-1.5">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="text-orange-200">/</span>
              <Link href="/hackathons" className="hover:text-white transition-colors">Hackathons</Link>
              <span className="text-orange-200">/</span>
              <span className="text-white">Admin Portal</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
        
        {/* Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-zinc-950 uppercase tracking-tight flex items-center gap-2">
              <Trophy className="text-orange-500 h-7 w-7" />
              Manage Hackathons
            </h1>
            <p className="text-xs text-zinc-500 font-medium">
              Create, modify, or delete hackathon evaluations and set constraints on team parameters.
            </p>
          </div>
          <div>
            <button
              onClick={openCreateModal}
              className="w-full sm:w-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-none shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Create Hackathon
            </button>
          </div>
        </div>

        {/* Catalog Table */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
            <p className="text-zinc-500 text-xs">Loading admin records...</p>
          </div>
        ) : hackathons.length === 0 ? (
          <div className="py-20 text-center bg-white border border-zinc-200 shadow-sm p-8 flex flex-col items-center justify-center space-y-3">
            <AlertCircle className="h-8 w-8 text-zinc-400" />
            <p className="text-zinc-500 text-sm font-semibold">No hackathons recorded yet.</p>
            <button
              onClick={openCreateModal}
              className="text-xs font-bold text-orange-500 hover:text-orange-600 underline cursor-pointer"
            >
              Add the first one now
            </button>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 shadow-xs overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-left text-xs">
              <thead className="bg-zinc-50 font-bold uppercase text-zinc-500 tracking-wider text-[10px] border-b border-zinc-200">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Title</th>
                  <th scope="col" className="px-6 py-3.5">Timeline</th>
                  <th scope="col" className="px-6 py-3.5">Team Size</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white font-normal text-zinc-800">
                {hackathons.map((h) => (
                  <tr key={h.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-zinc-950 text-sm leading-snug">{h.title}</p>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{h.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                        <span className="font-semibold">{formatDate(h.startDate)} - {formatDate(h.endDate)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                        <span className="font-semibold">{h.teamSize} member{h.teamSize > 1 ? "s" : ""}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(h)}
                          title="Edit"
                          className="p-1.5 text-zinc-500 hover:text-orange-500 hover:bg-orange-50 border border-transparent hover:border-orange-200/50 transition-colors cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(h.id)}
                          title="Delete"
                          className="p-1.5 text-zinc-500 hover:text-red-650 hover:bg-red-50 border border-transparent hover:border-red-200/50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-200 bg-white mt-12 text-center text-xs text-zinc-400">
        © 2026 Redlix Secure. Hackathon Platform Registry.
      </footer>

      {/* MODAL: Create/Edit Hackathon */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-zinc-300 w-full max-w-2xl shadow-2xl relative overflow-hidden">
            <div className="h-1 bg-orange-500" />
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-650 p-1"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="p-6 space-y-6">
              
              <div className="space-y-1">
                <h3 className="text-lg font-black uppercase tracking-tight text-zinc-950">
                  {editingHackathon ? "Edit Hackathon" : "Create Hackathon"}
                </h3>
                <p className="text-xs text-zinc-500 font-medium">
                  {editingHackathon ? "Modify details of the selected evaluation." : "Define parameters for a new software design evaluation."}
                </p>
              </div>

              <form onSubmit={handleSave} className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spring AI Challenge"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full px-3 py-2 bg-white border border-zinc-300 text-xs text-zinc-900 rounded-none focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Write a brief overview of the hackathon rules, objectives, and formats..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="block w-full px-3 py-2 bg-white border border-zinc-300 text-xs text-zinc-900 rounded-none focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Start Date</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="block w-full px-3 py-2 bg-white border border-zinc-300 text-xs text-zinc-900 rounded-none focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">End Date</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="block w-full px-3 py-2 bg-white border border-zinc-300 text-xs text-zinc-900 rounded-none focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Hackathon Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="block w-full px-3 py-2 bg-white border border-zinc-300 text-xs text-zinc-900 rounded-none focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
                    >
                      <option value="Online">Online</option>
                      <option value="In-person">In-person</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Max Team Size</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      required
                      value={teamSize}
                      onChange={(e) => setTeamSize(parseInt(e.target.value, 10))}
                      className="block w-full px-3 py-2 bg-white border border-zinc-300 text-xs text-zinc-900 rounded-none focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Cover Image URL</label>
                  <input
                    type="url"
                    placeholder="e.g. https://images.unsplash.com/photo-..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="block w-full px-3 py-2 bg-white border border-zinc-300 text-xs text-zinc-900 rounded-none focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Phases (Comma separated or new line)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Registration, Ideation, Prototype Submission, Grand Finale"
                    value={phases}
                    onChange={(e) => setPhases(e.target.value)}
                    className="block w-full px-3 py-2 bg-white border border-zinc-300 text-xs text-zinc-900 rounded-none focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">1st Prize</label>
                    <input
                      type="text"
                      placeholder="e.g. $5,000"
                      value={prizeFirst}
                      onChange={(e) => setPrizeFirst(e.target.value)}
                      className="block w-full px-3 py-2 bg-white border border-zinc-300 text-xs text-zinc-900 rounded-none focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">2nd Prize</label>
                    <input
                      type="text"
                      placeholder="e.g. $3,000"
                      value={prizeSecond}
                      onChange={(e) => setPrizeSecond(e.target.value)}
                      className="block w-full px-3 py-2 bg-white border border-zinc-300 text-xs text-zinc-900 rounded-none focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">3rd Prize</label>
                    <input
                      type="text"
                      placeholder="e.g. $1,000"
                      value={prizeThird}
                      onChange={(e) => setPrizeThird(e.target.value)}
                      className="block w-full px-3 py-2 bg-white border border-zinc-300 text-xs text-zinc-900 rounded-none focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">What You Gain / Perks (Comma separated or new line)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Global Exposure, Mentorship, Exclusive Swags"
                    value={perks}
                    onChange={(e) => setPerks(e.target.value)}
                    className="block w-full px-3 py-2 bg-white border border-zinc-300 text-xs text-zinc-900 rounded-none focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
                  />
                </div>

                <div className="space-y-3 p-3 bg-zinc-50 border border-zinc-200">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="block text-[10px] font-bold uppercase text-zinc-700 tracking-wider">Requires Registration Fee</label>
                      <span className="text-[10px] text-zinc-500">Enable this if participants must pay to join.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={hasFee}
                      onChange={(e) => setHasFee(e.target.checked)}
                      className="h-4.5 w-4.5 rounded border-zinc-300 text-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  {hasFee && (
                    <div className="space-y-1 pt-2 border-t border-zinc-200">
                      <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Registration Fee (USD/INR)</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        required={hasFee}
                        value={registrationFee}
                        onChange={(e) => setRegistrationFee(parseFloat(e.target.value) || 0)}
                        className="block w-40 px-3 py-2 bg-white border border-zinc-300 text-xs text-zinc-900 rounded-none focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
                      />
                    </div>
                  )}
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-650 font-semibold">{errorMsg}</p>
                )}

                <div className="flex gap-2 justify-end pt-2 border-t border-zinc-150">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-zinc-300 text-zinc-700 hover:bg-zinc-50 text-xs font-bold rounded-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-xs font-bold rounded-none shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                    {editingHackathon ? "Save Changes" : "Create Hackathon"}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
