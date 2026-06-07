"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Settings, 
  LayoutDashboard, 
  LogOut, 
  ShieldAlert, 
  Save, 
  CheckCircle2, 
  Clock, 
  Menu, 
  X,
  Sliders,
  Terminal
} from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  category: "Security" | "Storage" | "Config";
  operator: string;
  timestamp: string;
}

export default function PisciDropAdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Configuration settings state
  const [allowedTypes, setAllowedTypes] = useState(".webm, .mp4, .png, .jpg, .pdf, .json");
  const [maxSize, setMaxSize] = useState("50");
  const [retention, setRetention] = useState("7");
  const [supervisorEmail, setSupervisorEmail] = useState("admin@piscidrop.com");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Company Profile state
  const [profileName, setProfileName] = useState("Pisci Drop Pvt Ltd");
  const [profileDescription, setProfileDescription] = useState("");
  const [profileFounder, setProfileFounder] = useState("");
  const [profileDateStarted, setProfileDateStarted] = useState("");
  const [profileWebsite, setProfileWebsite] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileLogoUrl, setProfileLogoUrl] = useState("");
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: "log-501",
      action: "Storage retention rule altered from 30 days to 7 days",
      category: "Storage",
      operator: "admin@piscidrop.com",
      timestamp: "2026-06-07 17:30"
    },
    {
      id: "log-502",
      action: "Turnstile bypass rules whitelisted for local hostnames",
      category: "Security",
      operator: "System Orchestrator",
      timestamp: "2026-06-07 15:15"
    },
    {
      id: "log-503",
      action: "Maximum upload size limit updated to 50 MB",
      category: "Config",
      operator: "admin@piscidrop.com",
      timestamp: "2026-06-07 12:44"
    },
    {
      id: "log-504",
      action: "Database credentials refreshed on AWS node",
      category: "Security",
      operator: "System Orchestrator",
      timestamp: "2026-06-07 09:12"
    }
  ]);

  // Auth Guard
  useEffect(() => {
    const auth = localStorage.getItem("piscidrop_authenticated");
    const email = localStorage.getItem("piscidrop_user");
    if (auth !== "true" || !email) {
      router.push("/piscidrop/login");
    } else {
      setIsAuthenticated(true);
      setUserEmail(email);
    }
  }, [router]);

  // Fetch company profile on load
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/piscidrop/company-profile");
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          setProfileName(d.name || "");
          setProfileDescription(d.description || "");
          setProfileFounder(d.founder || "");
          setProfileDateStarted(d.date_started || "");
          setProfileWebsite(d.website || "");
          setProfilePhone(d.phone || "");
          setProfileEmail(d.email || "");
          setProfileAddress(d.address || "");
          setProfileLogoUrl(d.logo_url || "");
        }
      } catch (err) {
        console.error("Failed to load company profile:", err);
      }
    }
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem("piscidrop_authenticated");
    localStorage.removeItem("piscidrop_user");
    router.push("/piscidrop/login");
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    // Simulate saving changes
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      
      const newLog: AuditLog = {
        id: `log-${Math.floor(Math.random() * 900) + 500}`,
        action: `Configuration variables updated (Size Limit: ${maxSize}MB, Retention: ${retention}d)`,
        category: "Config",
        operator: userEmail,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 16)
      };
      
      setAuditLogs(prev => [newLog, ...prev]);

      // Clear success alert after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileError("");
    setProfileSuccess(false);

    try {
      const res = await fetch("/api/piscidrop/company-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profileName,
          description: profileDescription,
          founder: profileFounder,
          date_started: profileDateStarted,
          website: profileWebsite,
          phone: profilePhone,
          email: profileEmail,
          address: profileAddress,
          logo_url: profileLogoUrl,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setProfileSuccess(true);
        setIsEditingProfile(false);
        // Clear success message after 3 seconds
        setTimeout(() => setProfileSuccess(false), 3000);
      } else {
        setProfileError(json.error || "Failed to update profile.");
      }
    } catch (err: any) {
      setProfileError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center text-zinc-500 font-sans">
        <div className="w-10 h-10 rounded-full border-2 border-t-orange-500 border-zinc-300 animate-spin mb-4" />
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Authenticating Session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-800 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Header */}
      <header className="md:hidden h-16 bg-white border-b border-zinc-200 px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <img 
            src="https://ik.imagekit.io/dypkhqxip/picsihoriz?updatedAt=1778919009480" 
            alt="Pisci Drop Logo" 
            className="h-10 w-auto object-contain"
          />
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 text-zinc-500 hover:text-zinc-900 focus:outline-none"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`fixed md:sticky top-0 left-0 bottom-0 w-64 bg-white border-r border-zinc-200 p-0 flex flex-col justify-between shrink-0 transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transition-transform duration-300 ease-in-out z-30 h-full`}>
        
        <div className="flex flex-col flex-1">
          {/* Logo Area */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-zinc-200">
            <img 
              src="https://ik.imagekit.io/dypkhqxip/picsihoriz?updatedAt=1778919009480" 
              alt="Pisci Drop Logo" 
              className="h-12 w-auto object-contain"
            />
          </div>

          {/* Navigation Links */}
          <nav className="px-4 py-6 space-y-1">
            <Link 
              href="/piscidrop/dashboard" 
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-xs font-semibold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border-l-2 border-transparent transition-all cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-zinc-500 shrink-0" />
              Overview
            </Link>

            <Link 
              href="/piscidrop/admin" 
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-xs font-semibold bg-zinc-100 text-zinc-900 shadow-sm border-l-2 border-orange-500 transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4 text-zinc-500 shrink-0" />
              Settings
            </Link>
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-none bg-white flex items-center justify-center font-bold text-xs text-orange-650 border border-zinc-200">
              PD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-zinc-900 truncate">{userEmail}</p>
              <p className="text-[10px] text-zinc-555 font-semibold uppercase tracking-wider">Administrator</p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-none bg-red-600 hover:bg-red-700 text-white text-xs font-bold border-none cursor-pointer shadow-sm uppercase tracking-wider transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-white shrink-0" />
            Sign Out
          </button>
        </div>

      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Content Header */}
        <header className="h-16 border-b border-zinc-200 bg-white px-6 flex items-center justify-between hidden md:flex shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-md font-bold text-zinc-900 normal-case">Pisci Drop Settings</h1>
            <div className="flex items-center gap-2 bg-green-50 px-2 py-0.5 rounded-none text-[10px] text-green-700 font-semibold border border-green-150">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
              Connected
            </div>
          </div>

          <div className="text-xs text-zinc-555 font-mono flex items-center gap-1.5">
            Clock: <span className="text-zinc-800">Live Sync</span>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Configuration Form: 7 cols */}
            <div className="lg:col-span-7 bg-white border border-zinc-200 shadow-sm rounded-none p-6 space-y-6">
              <div>
                <h3 className="text-xs font-bold normal-case text-zinc-800 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-orange-600" />
                  Configuration Parameters
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1 font-sans">Adjust system restrictions and data retention logic for candidate file dropping</p>
              </div>

              {saveSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-250 rounded-none flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Pisci Drop settings recorded successfully!
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4">
                
                {/* Setting 1: Allowed file extensions */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-700">
                    Allowed Extensions
                  </label>
                  <input
                    type="text"
                    required
                    value={allowedTypes}
                    onChange={(e) => setAllowedTypes(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-white border border-zinc-300 rounded-none text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                  <p className="text-[10px] text-zinc-450">Comma-separated list of formats allowed for upload.</p>
                </div>

                {/* Grid setting fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Setting 2: Size limit */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-700">
                      Max Size Limit (MB)
                    </label>
                    <select
                      value={maxSize}
                      onChange={(e) => setMaxSize(e.target.value)}
                      className="w-full py-2 px-3 text-xs bg-white border border-zinc-300 rounded-none text-zinc-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 cursor-pointer font-semibold"
                    >
                      <option value="10">10 MB</option>
                      <option value="20">20 MB</option>
                      <option value="50">50 MB</option>
                      <option value="100">100 MB</option>
                      <option value="250">250 MB</option>
                    </select>
                  </div>

                  {/* Setting 3: Retention rule */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-700">
                      Storage Retention
                    </label>
                    <select
                      value={retention}
                      onChange={(e) => setRetention(e.target.value)}
                      className="w-full py-2 px-3 text-xs bg-white border border-zinc-300 rounded-none text-zinc-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 cursor-pointer font-semibold"
                    >
                      <option value="1">24 Hours</option>
                      <option value="7">7 Days</option>
                      <option value="30">30 Days</option>
                      <option value="90">90 Days</option>
                      <option value="0">Indefinite</option>
                    </select>
                  </div>

                </div>

                {/* Setting 4: Supervisor email */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-700">
                    Alert Contact Email
                  </label>
                  <input
                    type="email"
                    required
                    value={supervisorEmail}
                    onChange={(e) => setSupervisorEmail(e.target.value)}
                    className="w-full py-2 px-3 text-xs bg-white border border-zinc-300 rounded-none text-zinc-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                  <p className="text-[10px] text-zinc-450">Destination address for suspicious proctor drops or abnormal logs.</p>
                </div>

                <div className="pt-4 border-t border-zinc-200 flex justify-end gap-3">
                  <Link
                    href="/piscidrop/dashboard"
                    className="py-2 px-4 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold rounded-none text-center cursor-pointer transition-all uppercase tracking-wider"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="py-2 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white font-bold text-xs rounded-none shadow-sm cursor-pointer transition-all border-none flex items-center gap-1.5 uppercase tracking-wider"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSaving ? "Saving..." : "Save Config"}
                  </button>
                </div>

              </form>
            </div>

            {/* Company Profile Container: 5 cols */}
            <div className="lg:col-span-5 bg-white border border-zinc-200 shadow-sm rounded-none p-6 space-y-6 flex flex-col justify-between min-h-[440px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold normal-case text-zinc-800 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-orange-600">domain</span>
                    Company Profile
                  </h3>
                  {!isEditingProfile && (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="py-1 px-2.5 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-[10px] font-bold rounded-none uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                {profileSuccess && (
                  <div className="mb-4 p-2.5 bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-250 rounded-none flex items-center gap-1.5 animate-fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    Profile updated successfully!
                  </div>
                )}

                {profileError && (
                  <div className="mb-4 p-2.5 bg-red-50 text-red-800 text-[11px] font-semibold border border-red-250 rounded-none flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    {profileError}
                  </div>
                )}

                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="space-y-3 font-sans">
                    
                    {/* Company Name */}
                    <div className="space-y-0.5">
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Company Name</label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full py-1.5 px-2 text-xs bg-white border border-zinc-300 rounded-none text-zinc-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* Logo URL */}
                    <div className="space-y-0.5">
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Logo URL</label>
                      <input
                        type="text"
                        value={profileLogoUrl}
                        onChange={(e) => setProfileLogoUrl(e.target.value)}
                        className="w-full py-1.5 px-2 text-xs bg-white border border-zinc-300 rounded-none text-zinc-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-0.5">
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">About / Description</label>
                      <textarea
                        rows={2}
                        value={profileDescription}
                        onChange={(e) => setProfileDescription(e.target.value)}
                        className="w-full py-1.5 px-2 text-xs bg-white border border-zinc-300 rounded-none text-zinc-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
                      />
                    </div>

                    {/* Founder */}
                    <div className="space-y-0.5">
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Founder</label>
                      <input
                        type="text"
                        value={profileFounder}
                        onChange={(e) => setProfileFounder(e.target.value)}
                        className="w-full py-1.5 px-2 text-xs bg-white border border-zinc-300 rounded-none text-zinc-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* Date Started */}
                    <div className="space-y-0.5">
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Date Started</label>
                      <input
                        type="text"
                        value={profileDateStarted}
                        onChange={(e) => setProfileDateStarted(e.target.value)}
                        className="w-full py-1.5 px-2 text-xs bg-white border border-zinc-300 rounded-none text-zinc-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* Website */}
                    <div className="space-y-0.5">
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Website</label>
                      <input
                        type="text"
                        value={profileWebsite}
                        onChange={(e) => setProfileWebsite(e.target.value)}
                        className="w-full py-1.5 px-2 text-xs bg-white border border-zinc-300 rounded-none text-zinc-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-0.5">
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Phone</label>
                      <input
                        type="text"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        className="w-full py-1.5 px-2 text-xs bg-white border border-zinc-300 rounded-none text-zinc-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-0.5">
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Email Contact</label>
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="w-full py-1.5 px-2 text-xs bg-white border border-zinc-300 rounded-none text-zinc-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* Address */}
                    <div className="space-y-0.5">
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Address</label>
                      <textarea
                        rows={2}
                        value={profileAddress}
                        onChange={(e) => setProfileAddress(e.target.value)}
                        className="w-full py-1.5 px-2 text-xs bg-white border border-zinc-300 rounded-none text-zinc-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="py-1.5 px-3 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold rounded-none cursor-pointer transition-all uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="py-1.5 px-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white font-bold text-xs rounded-none cursor-pointer border-none transition-all uppercase tracking-wider flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        {isSavingProfile ? "Saving..." : "Save"}
                      </button>
                    </div>

                  </form>
                ) : (
                  <>
                    {/* Logo and About */}
                    <div className="flex flex-col items-center text-center p-4 bg-zinc-50 border border-zinc-200 mb-4 space-y-3">
                      {profileLogoUrl && (
                        <img 
                          src={profileLogoUrl} 
                          alt="Company Logo" 
                          className="h-12 w-auto object-contain"
                        />
                      )}
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-zinc-900">{profileName}</h4>
                        {profileDescription && (
                          <p className="text-[11px] text-zinc-500 leading-relaxed max-w-xs font-sans">
                            {profileDescription}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Profile Key Values */}
                    <div className="space-y-3 font-sans">
                      
                      {/* Founder */}
                      <div className="flex justify-between items-center py-1.5 border-b border-zinc-150">
                        <span className="text-[10px] text-zinc-450 font-bold uppercase tracking-wider">Founder</span>
                        <span className="text-xs font-semibold text-zinc-800">{profileFounder}</span>
                      </div>

                      {/* Date Started */}
                      <div className="flex justify-between items-center py-1.5 border-b border-zinc-150">
                        <span className="text-[10px] text-zinc-450 font-bold uppercase tracking-wider">Date Started</span>
                        <span className="text-xs font-semibold text-zinc-800">{profileDateStarted}</span>
                      </div>

                      {/* Website */}
                      <div className="flex justify-between items-center py-1.5 border-b border-zinc-150">
                        <span className="text-[10px] text-zinc-450 font-bold uppercase tracking-wider">Website</span>
                        {profileWebsite ? (
                          <a 
                            href={profileWebsite.startsWith("http") ? profileWebsite : `https://${profileWebsite}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1"
                          >
                            {profileWebsite}
                            <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                          </a>
                        ) : (
                          <span className="text-xs text-zinc-400 font-semibold">—</span>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="flex justify-between items-center py-1.5 border-b border-zinc-150">
                        <span className="text-[10px] text-zinc-450 font-bold uppercase tracking-wider">Phone</span>
                        <span className="text-xs font-semibold text-zinc-800">{profilePhone || "—"}</span>
                      </div>

                      {/* Email */}
                      <div className="flex justify-between items-center py-1.5 border-b border-zinc-150">
                        <span className="text-[10px] text-zinc-450 font-bold uppercase tracking-wider">Email Contact</span>
                        {profileEmail ? (
                          <a 
                            href={`mailto:${profileEmail}`} 
                            className="text-xs font-semibold text-zinc-800 hover:text-orange-600 hover:underline"
                          >
                            {profileEmail}
                          </a>
                        ) : (
                          <span className="text-xs text-zinc-400 font-semibold">—</span>
                        )}
                      </div>

                      {/* Address */}
                      <div className="pt-1.5 flex justify-between items-start gap-4">
                        <span className="text-[10px] text-zinc-450 font-bold uppercase tracking-wider shrink-0 mt-0.5">Address</span>
                        <p className="text-xs font-semibold text-zinc-750 text-right leading-relaxed whitespace-pre-line">
                          {profileAddress || "—"}
                        </p>
                      </div>

                    </div>
                  </>
                )}

              </div>

              {/* Bottom security assurance */}
              <div className="pt-4 border-t border-zinc-200 flex items-center gap-2 text-[10px] text-zinc-450 font-semibold">
                <span className="material-symbols-outlined text-sm text-zinc-400">verified</span>
                Registry profile verified & active
              </div>
            </div>

          </div>

          </div>

        {/* Footer */}
        <footer className="py-6 border-t border-zinc-200 bg-white text-center text-xs text-zinc-400 shrink-0">
          © 2026 Pisci Drop. Connected to Redlix Secure Network Node.
        </footer>

      </main>

    </div>
  );
}
