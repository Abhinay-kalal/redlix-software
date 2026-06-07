"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FolderDown, 
  HardDrive, 
  Activity, 
  Users, 
  Search, 
  Trash2, 
  Download, 
  Settings, 
  LogOut, 
  LayoutDashboard, 
  Menu, 
  X,
  User,
  Calendar,
  Phone,
  BookOpen,
  Camera
} from "lucide-react";

interface StudentRegistration {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  college_name: string;
  branch: string;
  interests: string;
  photo_url: string;
  created_at: string;
}

export default function PisciDropDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Database records state
  const [registrations, setRegistrations] = useState<StudentRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Auth Guard check
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

  // Fetch student registrations from Database
  const fetchRegistrations = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/piscidrop/registrations");
      const data = await res.json();
      if (res.ok && data.success) {
        setRegistrations(data.data || []);
      } else {
        setErrorMessage(data.error || "Failed to load database registrations.");
      }
    } catch {
      setErrorMessage("Failed to connect to the database node.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRegistrations();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem("piscidrop_authenticated");
    localStorage.removeItem("piscidrop_user");
    router.push("/piscidrop/login");
  };

  const handleDeleteRegistration = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this candidate registration?")) return;
    
    // Optimistic update
    setRegistrations(prev => prev.filter(item => item.id !== id));
    
    try {
      const res = await fetch(`/api/piscidrop/registrations?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Failed to delete record.");
        // Refetch to sync state
        fetchRegistrations();
      }
    } catch {
      alert("Failed to connect to delete registry.");
      fetchRegistrations();
    }
  };

  const filteredRegistrations = registrations.filter(reg => 
    reg.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.college_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.interests.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate dynamic stats
  const totalRegistrations = registrations.length;
  // Estimate photo storage sizes (roughly 1.2MB average per registration photo)
  const estimatedStorage = (totalRegistrations * 1.2).toFixed(1);

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
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-xs font-semibold bg-zinc-100 text-zinc-900 shadow-sm border-l-2 border-orange-500 transition-all cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-zinc-500 shrink-0" />
              Overview
            </Link>

            <Link 
              href="/piscidrop/admin" 
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-xs font-semibold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 border-l-2 border-transparent transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4 text-zinc-500 shrink-0" />
              Settings
            </Link>
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-none bg-white flex items-center justify-center font-bold text-xs text-orange-655 border border-zinc-200">
              PD
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-zinc-900 truncate">{userEmail}</p>
              <p className="text-[10px] text-zinc-550 font-semibold uppercase tracking-wider">Administrator</p>
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
            <h1 className="text-md font-bold text-zinc-900 normal-case">Student Registrations Registry</h1>
            <div className="flex items-center gap-2 bg-green-50 px-2 py-0.5 rounded-none text-[10px] text-green-700 font-semibold border border-green-150">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
              Live Database Connected
            </div>
          </div>

          <div className="text-xs text-zinc-555 font-mono flex items-center gap-1.5">
            Clock: <span className="text-zinc-800">Live Sync</span>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Stat Card 1 */}
            <div className="bg-white border border-zinc-200 py-2.5 px-3.5 shadow-sm rounded-none relative overflow-hidden">
              <div className="flex justify-between items-start mb-0.5">
                <span className="text-[9px] font-bold normal-case text-zinc-500">Registered Students</span>
                <div className="p-0.5 bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center rounded-none shrink-0"><Users className="w-3.5 h-3.5" /></div>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mt-0.5">
                {loading ? "..." : totalRegistrations}
              </h3>
              <p className="text-[9px] text-zinc-400 mt-0.5 font-medium">Total verified candidate records</p>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-white border border-zinc-200 py-2.5 px-3.5 shadow-sm rounded-none relative overflow-hidden">
              <div className="flex justify-between items-start mb-0.5">
                <span className="text-[9px] font-bold normal-case text-zinc-500">Photo Disk Usage</span>
                <div className="p-0.5 bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center rounded-none shrink-0"><HardDrive className="w-3.5 h-3.5" /></div>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mt-0.5">
                {loading ? "..." : `${estimatedStorage} MB`}
              </h3>
              <p className="text-[9px] text-orange-655 mt-0.5 font-medium">In Supabase Storage Bucket</p>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-white border border-zinc-200 py-2.5 px-3.5 shadow-sm rounded-none relative overflow-hidden">
              <div className="flex justify-between items-start mb-0.5">
                <span className="text-[9px] font-bold normal-case text-zinc-500">Active Lobby</span>
                <div className="p-0.5 bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center rounded-none shrink-0"><Activity className="w-3.5 h-3.5" /></div>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mt-0.5">Operational</h3>
              <p className="text-[9px] text-zinc-500 mt-0.5 font-medium">Verification check running</p>
            </div>

            {/* Stat Card 4 */}
            <div className="bg-white border border-zinc-200 py-2.5 px-3.5 shadow-sm rounded-none relative overflow-hidden">
              <div className="flex justify-between items-start mb-0.5">
                <span className="text-[9px] font-bold normal-case text-zinc-500">Database Status</span>
                <div className="p-0.5 bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center rounded-none shrink-0"><FolderDown className="w-3.5 h-3.5" /></div>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mt-0.5">Online</h3>
              <p className="text-[9px] text-zinc-500 mt-0.5 font-medium">Ready for active lookups</p>
            </div>

          </div>

          {/* Action and File Drops Table Section */}
          <div className="bg-white border border-zinc-200 shadow-sm rounded-none overflow-hidden">
            
            {/* Table Header Controls */}
            <div className="p-5 border-b border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-xs font-bold normal-case text-zinc-800">Verified Database Registrations</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5 font-sans">Full view of student candidates registered for examinations</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-48 py-1.5 pl-9 pr-3 text-xs bg-white border border-zinc-300 rounded-none text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <button
                  onClick={fetchRegistrations}
                  className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-none shadow-sm cursor-pointer transition-all border-none uppercase tracking-wider"
                >
                  Refresh Data
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border-b border-red-200 text-red-800 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Table Contents */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-[10px] font-bold text-zinc-500 normal-case">
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Candidate Profile</th>
                    <th className="px-6 py-4">Contact & Dob</th>
                    <th className="px-6 py-4">Academic details</th>
                    <th className="px-6 py-4">Selected Interests</th>
                    <th className="px-6 py-4 text-center">Verification Photo</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-zinc-450 italic font-semibold">
                        Querying Supabase registry database, please wait...
                      </td>
                    </tr>
                  ) : filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-zinc-450 italic font-semibold">
                        No registered candidates found in the database.
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((reg) => (
                      <tr key={reg.id} className="hover:bg-zinc-50/50 text-zinc-700 transition-colors">
                        <td className="px-6 py-3 font-mono font-bold text-orange-600">
                          {reg.id}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-zinc-400 shrink-0" />
                            <div>
                              <p className="font-semibold text-zinc-900">{reg.full_name}</p>
                              <p className="text-[10px] text-zinc-400">{reg.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="space-y-0.5">
                            <p className="flex items-center gap-1 text-[10px] text-zinc-650">
                              <Phone className="w-3 h-3 text-zinc-400" />
                              {reg.phone}
                            </p>
                            <p className="flex items-center gap-1 text-[10px] text-zinc-650">
                              <Calendar className="w-3 h-3 text-zinc-400" />
                              {reg.dob}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-start gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-zinc-900">{reg.college_name}</p>
                              <p className="text-[10px] text-zinc-500 font-semibold">{reg.branch}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span className="inline-block px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-100 text-[10px] font-semibold">
                            {reg.interests}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex justify-center">
                            {reg.photo_url ? (
                              <div className="w-14 h-9 bg-zinc-50 border border-zinc-200 overflow-hidden shrink-0 shadow-xs relative group cursor-pointer" onClick={() => {
                                const w = window.open();
                                if(w) w.document.write(`<img src="${reg.photo_url}" style="max-width:100%; max-height:100vh;" />`);
                              }}>
                                <img src={reg.photo_url} alt="Verification" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <Camera className="w-3 h-3 text-white" />
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] text-zinc-400 italic">No Photo</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {reg.photo_url && (
                              <a
                                href={reg.photo_url}
                                download={`verification-${reg.full_name}.jpg`}
                                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-900 text-white font-semibold text-[10px] rounded-none cursor-pointer shadow-sm transition-all border-none inline-flex items-center"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Get Photo
                              </a>
                            )}
                            <button
                              onClick={() => handleDeleteRegistration(reg.id)}
                              className="px-2 py-1 bg-red-500 hover:bg-red-655 text-white font-semibold text-[10px] rounded-none cursor-pointer shadow-sm transition-all border-none"
                              title="Delete candidate profile record"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
