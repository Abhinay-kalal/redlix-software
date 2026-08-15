"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutGrid,
  User,
  LogOut,
  Menu,
  X,
  BookOpen,
  Mail,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  MessageCircle,
  Bell,
  CheckCircle2,
  Loader2,
  Zap,
  Users
} from "lucide-react";

interface Candidate {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  college: string | null;
  department: string | null;
  created_at: string;
}

export default function InvitationsPage() {
  const router = useRouter();

  // Sidebar controls
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Invitations tab state
  const [invitations, setInvitations] = useState<{ sent: any[]; received: any[] }>({ sent: [], received: [] });
  const [invitationsLoading, setInvitationsLoading] = useState(false);

  // Chat window state
  const [openChatConnectionId, setOpenChatConnectionId] = useState<string | null>(null);
  const [openChatFriendName, setOpenChatFriendName] = useState<string>("");
  const [openChatMessages, setOpenChatMessages] = useState<any[]>([]);
  const [openChatInput, setOpenChatInput] = useState("");
  const [openChatSending, setOpenChatSending] = useState(false);

  const fetchProfile = async () => {
    try {
      setErrorMsg("");
      const res = await fetch("/api/candidate/profile");
      const data = await res.json();

      if (!res.ok || !data.success) {
        localStorage.removeItem("candidate_authenticated");
        localStorage.removeItem("candidate_email");
        router.push("/sprints/auth");
        return;
      }

      setCandidate(data.candidate);
    } catch (err) {
      setErrorMsg("Failed to connect to profile server.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    setInvitationsLoading(true);
    try {
      const res = await fetch("/api/candidate/connections");
      const data = await res.json();
      if (data.success) {
        setInvitations({ sent: data.sent || [], received: data.received || [] });
      }
    } catch (_) {}
    finally {
      setInvitationsLoading(false);
    }
  };

  useEffect(() => {
    const auth = localStorage.getItem("candidate_authenticated");
    if (auth !== "true") {
      router.push("/sprints/auth");
      return;
    }
    fetchProfile();
    fetchInvitations();
  }, [router]);

  // Poll for new chat messages when a chat is open
  useEffect(() => {
    if (!openChatConnectionId) return;

    const interval = setInterval(() => {
      fetch(`/api/candidate/chat?connection=${openChatConnectionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setOpenChatMessages(data.messages || []);
          }
        })
        .catch(() => {});
    }, 3000);

    return () => clearInterval(interval);
  }, [openChatConnectionId]);

  const handleSignOut = async () => {
    document.cookie = "candidate_session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    localStorage.removeItem("candidate_authenticated");
    localStorage.removeItem("candidate_email");
    localStorage.removeItem("candidate_name");
    router.push("/sprints/auth");
  };

  const handleAcceptRequest = async (connectionId: string) => {
    try {
      await fetch("/api/candidate/connection", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connection_id: connectionId, action: "accepted", my_name: candidate?.full_name }),
      });
      fetchInvitations();
    } catch (err) {}
  };

  const handleDeclineRequest = async (connectionId: string) => {
    try {
      await fetch("/api/candidate/connection", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connection_id: connectionId, action: "rejected", my_name: candidate?.full_name }),
      });
      fetchInvitations();
    } catch (err) {}
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openChatInput.trim() || !openChatConnectionId) return;

    setOpenChatSending(true);
    try {
      const res = await fetch("/api/candidate/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connection_id: openChatConnectionId,
          message: openChatInput,
          sender_name: candidate?.full_name
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setOpenChatMessages(prev => [...prev, data.message]);
        setOpenChatInput("");
      }
    } catch (_) {}
    finally {
      setOpenChatSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#E61E32]" />
        <p className="text-xs text-zinc-400 font-semibold tracking-wider uppercase">Loading Dashboard Settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex overflow-hidden font-inter text-zinc-800">
      
      {/* Mobile Toggle Header */}
      <header className="md:hidden bg-zinc-900 border-b border-zinc-800 text-white p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-40 h-16">
        <div className="flex items-center gap-2">
          <img
            src="https://ik.imagekit.io/dypkhqxip/redlix%20new?updatedAt=1781042212493"
            alt="Redlix Logo"
            className="w-16 h-16 object-contain"
          />
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1 hover:bg-zinc-800 rounded-lg focus:outline-none"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`bg-zinc-900 border-r border-zinc-800 text-white w-64 shrink-0 flex flex-col fixed md:sticky inset-y-0 left-0 z-30 transition-transform duration-300 md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-3 pb-1 space-y-0 flex-1 flex flex-col min-h-0">
          {/* Logo Brand */}
          <div className="flex items-center justify-center border-b border-zinc-800 pb-0 pt-0">
            <img
              src="https://ik.imagekit.io/dypkhqxip/redlix%20new?updatedAt=1781042212493"
              alt="Redlix Logo"
              className="w-24 h-24 object-contain -mt-3 -mb-3"
            />
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 pt-0 -mt-1.5">
            <button
              onClick={() => { router.push("/candidate-dashboard?tab=overview"); }}
              className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer text-zinc-400 hover:bg-zinc-800/50 hover:text-white border-none"
            >
              <LayoutGrid className="w-4 h-4 shrink-0" strokeWidth={1.8} />
              Overview
            </button>
            <button
              onClick={() => { router.push("/candidate-dashboard?tab=exams"); }}
              className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer text-zinc-400 hover:bg-zinc-800/50 hover:text-white border-none"
            >
              <BookOpen className="w-4 h-4 shrink-0" strokeWidth={1.8} />
              Registered Exams
            </button>
            <button
              onClick={() => { router.push("/candidate-dashboard?tab=sprints"); }}
              className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer text-zinc-400 hover:bg-zinc-800/50 hover:text-white border-none"
            >
              <Zap className="w-4 h-4 shrink-0" strokeWidth={1.8} />
              Sprints Lobby
            </button>
            <button
              onClick={() => { router.push("/candidate-dashboard?tab=messages"); }}
              className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer text-zinc-400 hover:bg-zinc-800/50 hover:text-white border-none"
            >
              <MessageCircle className="w-4 h-4 shrink-0" strokeWidth={1.8} />
              Community
            </button>
            <button
              onClick={() => {}}
              className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer bg-zinc-800 text-white border-none"
            >
              <Bell className="w-4 h-4 shrink-0" strokeWidth={1.8} />
              Invitations
              {invitations.received.filter(r => r.status === "pending").length > 0 && (
                <span className="ml-auto bg-[#E61E32] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {invitations.received.filter(r => r.status === "pending").length}
                </span>
              )}
            </button>
            <button
              onClick={() => { router.push("/candidate-dashboard?tab=profile"); }}
              className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer text-zinc-400 hover:bg-zinc-800/50 hover:text-white border-none"
            >
              <User className="w-4 h-4 shrink-0" strokeWidth={1.8} />
              Profile Details
            </button>
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-zinc-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-[#E61E32] uppercase rounded-full">
              {candidate?.full_name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-zinc-200 truncate leading-none mb-1">{candidate?.full_name}</span>
              <span className="text-[10px] text-zinc-500 truncate">{candidate?.email}</span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#E61E32] hover:bg-[#d01729] active:bg-[#b81223] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer border-none shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col md:pt-0 pt-16">
        
        {/* Active Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 max-w-4xl w-full mx-auto">
          
          <div className="space-y-8">
            {invitationsLoading ? (
              <div className="flex items-center justify-center h-40 text-xs text-zinc-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading invitations...
              </div>
            ) : (
              <>
                {/* Received Pending Invitations */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-200 pb-2">
                    Received ({invitations.received.filter(r => r.status === "pending").length})
                  </h3>
                  {invitations.received.filter(r => r.status === "pending").length === 0 ? (
                    <p className="text-xs text-zinc-400 py-4 bg-white border border-zinc-150 rounded-xl px-4 text-center">No pending invitations.</p>
                  ) : invitations.received.filter(r => r.status === "pending").map((inv) => (
                    <div key={inv.id} className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 flex items-center justify-center text-sm font-bold text-zinc-600 uppercase">
                          {inv.from_name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">{inv.from_name}</p>
                          <p className="text-[10px] text-zinc-400">Wants to connect with you</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(inv.id)}
                          className="px-4 py-2 bg-[#E61E32] hover:bg-[#d01729] text-white text-xs font-semibold rounded-lg cursor-pointer transition-all border-none"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(inv.id)}
                          className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-xs font-semibold rounded-lg cursor-pointer transition-all border-none"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Accepted Connections — Friends */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-200 pb-2">
                    Friends ({[...invitations.sent, ...invitations.received].filter(r => r.status === "accepted").length})
                  </h3>
                  {[...invitations.sent, ...invitations.received].filter(r => r.status === "accepted").length === 0 ? (
                    <p className="text-xs text-zinc-400 py-4 bg-white border border-zinc-150 rounded-xl px-4 text-center">No friends connected yet.</p>
                  ) : [...invitations.sent, ...invitations.received].filter(r => r.status === "accepted").map((inv) => {
                    const friendName = inv.from_email === candidate?.email ? inv.to_name : inv.from_name;
                    const isChatOpen = openChatConnectionId === inv.id;
                    return (
                      <div key={inv.id} className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-sm font-bold text-emerald-700 uppercase">
                              {friendName?.charAt(0) || "?"}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-zinc-900">{friendName}</p>
                              <p className="text-[10px] text-emerald-600 font-semibold">Connected</p>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              if (isChatOpen) {
                                setOpenChatConnectionId(null);
                              } else {
                                setOpenChatConnectionId(inv.id);
                                setOpenChatFriendName(friendName);
                                setOpenChatMessages([]);
                                const r = await fetch(`/api/candidate/chat?connection=${inv.id}`);
                                const d = await r.json();
                                if (d.success) setOpenChatMessages(d.messages || []);
                              }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-all border-none"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            {isChatOpen ? "Close Chat" : "Chat"}
                          </button>
                        </div>
                        
                        {/* Inline chat panel */}
                        {isChatOpen && (
                          <div className="border-t border-zinc-200 flex flex-col h-72 bg-zinc-50">
                            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                              {openChatMessages.length === 0 ? (
                                <div className="flex items-center justify-center h-full text-xs text-zinc-400">No messages yet. Say hi!</div>
                              ) : openChatMessages.map((m) => (
                                <div key={m.id} className={`flex ${m.sender_email === candidate?.email ? "justify-end" : "justify-start"}`}>
                                  <div className={`max-w-[70%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                                    m.sender_email === candidate?.email
                                      ? "bg-[#E61E32] text-white rounded-br-none"
                                      : "bg-white border border-zinc-200 text-zinc-800 rounded-bl-none"
                                  }`}>
                                    {m.message}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <form
                              onSubmit={handleSendChatMessage}
                              className="flex items-center gap-2 px-4 py-3 border-t border-zinc-200 bg-white"
                            >
                              <input
                                type="text"
                                value={openChatInput}
                                onChange={e => setOpenChatInput(e.target.value)}
                                placeholder={`Message ${friendName}...`}
                                className="flex-1 text-xs px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:border-[#E61E32] bg-zinc-50"
                              />
                              <button
                                type="submit"
                                disabled={openChatSending || !openChatInput.trim()}
                                className="px-4 py-2 bg-[#E61E32] hover:bg-[#d01729] disabled:bg-zinc-250 text-white text-xs font-semibold rounded-lg cursor-pointer transition-all border-none"
                              >
                                {openChatSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Sent Pending Requests */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-200 pb-2">
                    Sent Requests ({invitations.sent.filter(r => r.status === "pending").length})
                  </h3>
                  {invitations.sent.filter(r => r.status === "pending").length === 0 ? (
                    <p className="text-xs text-zinc-400 py-4 bg-white border border-zinc-150 rounded-xl px-4 text-center">No pending sent requests.</p>
                  ) : invitations.sent.filter(r => r.status === "pending").map((inv) => (
                    <div key={inv.id} className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-sm font-bold text-zinc-500 uppercase">
                          {inv.to_name?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">{inv.to_name || "Candidate"}</p>
                          <p className="text-[10px] text-zinc-400">Request pending</p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400 bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg">
                        <Clock className="w-3.5 h-3.5" /> Awaiting response
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>

      </main>

    </div>
  );
}
