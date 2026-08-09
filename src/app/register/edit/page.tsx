"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Camera, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Turnstile } from "@/components/ui/turnstile";
import { FloatingPathsBackground } from "@/components/ui/floating-paths";

interface RegistrationDetails {
  id: number;
  exam_id: number;
  candidate_name: string;
  email: string;
  phone: string;
  college: string;
  department: string;
  year_of_study: string;
  photo_url: string;
  registration_number: string;
  hall_ticket_number: string;
}

interface ExamInfo {
  name: string;
  company_name: string;
}

function EditRegistrationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlRegNum = searchParams.get("regNum") || "";
  const urlHtNum = searchParams.get("htNum") || "";

  const [step, setStep] = useState<"login" | "edit" | "success">("login");
  const [regNum, setRegNum] = useState(urlRegNum);
  const [htNum, setHtNum] = useState(urlHtNum);

  const [registration, setRegistration] = useState<RegistrationDetails | null>(null);
  const [exam, setExam] = useState<ExamInfo | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("1st Year");
  const [photo, setPhoto] = useState("");

  const [decl1, setDecl1] = useState(false);
  const [decl2, setDecl2] = useState(false);
  const [decl3, setDecl3] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (urlRegNum && urlHtNum) {
      handleLookup(null, urlRegNum, urlHtNum);
    }
  }, [urlRegNum, urlHtNum]);

  const handleLookup = async (e: React.FormEvent | null, rNum = regNum, hNum = htNum) => {
    if (e) e.preventDefault();
    if (!rNum || !hNum) {
      setErrorMsg("Please fill in both Registration Number and Hall Ticket Number.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/register/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "lookup",
          registrationNumber: rNum,
          hallTicketNumber: hNum,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || "Lookup failed. Please verify your credentials.");
      } else {
        const r = data.registration as RegistrationDetails;
        setRegistration(r);
        setExam(data.exam as ExamInfo);

        setName(r.candidate_name);
        setEmail(r.email);
        setPhone(r.phone);
        setCollege(r.college);
        setDepartment(r.department);
        setYearOfStudy(r.year_of_study);
        setPhoto(r.photo_url);

        setStep("edit");
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred during database lookup.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("Candidate photo must be under 2MB in size.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
      setErrorMsg("");
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registration) return;

    if (!photo) {
      setErrorMsg("Please upload your candidate verification photo.");
      return;
    }
    if (!decl1 || !decl2 || !decl3) {
      setErrorMsg("Please accept all three declaration checkboxes to proceed.");
      return;
    }
    if (!turnstileToken) {
      setErrorMsg("Please complete the security check.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/register/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: registration.id,
          candidate_name: name,
          email,
          phone,
          college,
          department,
          year_of_study: yearOfStudy,
          photo_url: photo,
          turnstileToken,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || "Failed to update registration details.");
      } else {
        setSuccessMsg("Your registration details have been updated successfully!");
        setStep("success");
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred while updating the registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "login") {
    return (
      <FloatingPathsBackground position={-1} className="min-h-screen bg-zinc-100 flex items-center justify-center p-4 font-sans text-zinc-900 overflow-hidden">
        <div className="w-full max-w-4xl flex flex-col md:flex-row shadow-lg border border-zinc-200/90 rounded-2xl bg-white relative z-10 overflow-hidden">

          {/* Left Column */}
          <div className="bg-zinc-50/80 p-8 md:p-12 md:w-1/2 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-200/90">
            <div className="space-y-6">
              <div className="flex items-center">
                <img
                  src="https://ik.imagekit.io/dypkhqxip/logotraining?updatedAt=1783099023149"
                  alt="Redlix Logo"
                  className="h-8 w-auto object-contain shrink-0"
                />
              </div>

              <h1 className="text-2xl md:text-3xl font-bold leading-snug tracking-tight mt-6 text-zinc-900">
                Registration Editor
              </h1>
              <p className="text-zinc-500 text-xs md:text-sm max-w-xs leading-relaxed font-medium">
                Enter your registration number and hall ticket number to access and modify your submitted application.
              </p>
              <div className="flex justify-center pt-2">
                <img
                  src="https://ik.imagekit.io/dypkhqxip/Online%20test-bro.svg"
                  alt="Online Test Illustration"
                  className="w-full max-w-[220px] h-auto object-contain select-none pointer-events-none"
                />
              </div>
            </div>

            <p className="text-[10px] text-zinc-400 mt-8 font-medium">
              For assistance, contact your examination administrator.
            </p>
          </div>

          {/* Right Column */}
          <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center bg-white min-h-[400px]">
            {isSubmitting ? (
              <div className="py-8 flex flex-col items-center justify-center text-center gap-6">
                <div className="w-9 h-9 rounded-full border-2 border-t-[#E61E32] border-r-zinc-200 border-b-zinc-200 border-l-zinc-200 animate-spin mb-2" />
                <p className="text-zinc-700 font-semibold text-xs">Verifying candidate credentials...</p>
              </div>
            ) : (
              <div className="w-full max-w-sm mx-auto space-y-4">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-zinc-900">Authenticate Application</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Credentials are available on your hall ticket</p>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200/80 rounded-xl text-red-800 text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <form className="flex flex-col gap-4" onSubmit={(e) => handleLookup(e)} noValidate>
                  <div>
                    <label htmlFor="lookup-reg" className="block text-xs font-bold text-zinc-700 mb-1.5">
                      Registration Number *
                    </label>
                    <input
                      id="lookup-reg"
                      type="text"
                      placeholder="6-digit registration code"
                      value={regNum}
                      onChange={(e) => { setRegNum(e.target.value); if (errorMsg) setErrorMsg(""); }}
                      className="text-xs w-full py-2.5 px-3.5 border border-zinc-200/90 rounded-xl bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#E61E32]/20 focus:border-[#E61E32] transition-all font-mono"
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label htmlFor="lookup-ht" className="block text-xs font-bold text-zinc-700 mb-1.5">
                      Hall Ticket Number *
                    </label>
                    <input
                      id="lookup-ht"
                      type="text"
                      placeholder="e.g. 26AI123456"
                      value={htNum}
                      onChange={(e) => { setHtNum(e.target.value.toUpperCase()); if (errorMsg) setErrorMsg(""); }}
                      className="text-xs w-full py-2.5 px-3.5 border border-zinc-200/90 rounded-xl bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#E61E32]/20 focus:border-[#E61E32] transition-all font-mono"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>

                  <Turnstile
                    onSuccess={(token) => {
                      setTurnstileToken(token);
                      setErrorMsg("");
                    }}
                    onError={() => setErrorMsg("Security verification encountered an error.")}
                    onExpire={() => setTurnstileToken("")}
                  />

                  <div className="pt-2 flex gap-3">
                    <Link
                      href="/scheduled-exams"
                      className="flex-1 py-2.5 px-4 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-semibold text-xs rounded-xl shadow-xs transition-colors text-center cursor-pointer flex items-center justify-center bg-white"
                    >
                      Back to Directory
                    </Link>
                    <button
                      type="submit"
                      className="flex-1 bg-[#E61E32] hover:bg-[#d01729] text-white font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-xs text-xs border-none"
                    >
                      Verify Credentials →
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </FloatingPathsBackground>
    );
  }

  if (step === "edit" && registration && exam) {
    return (
      <div className="min-h-screen bg-zinc-100 font-sans text-zinc-900 flex flex-col selection:bg-[#E61E32]/10 selection:text-[#E61E32]">
        <header className="sticky top-0 z-50 bg-[#E61E32] border-b border-[#d01729] py-3 px-6 md:px-8 shadow-xs">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="https://ik.imagekit.io/dypkhqxip/logotraining?updatedAt=1783099023149"
                alt="Redlix Logo"
                className="h-7.5 md:h-8 w-auto object-contain shrink-0 transition-transform group-hover:scale-[1.02]"
              />
              <div className="flex items-center gap-2 border-l border-white/20 pl-3">
                <span className="font-semibold text-xs text-white font-inter tracking-wide">Edit Registration</span>
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto p-6 md:p-8 flex flex-col justify-center">
          <div className="max-w-3xl w-full mx-auto bg-white border border-zinc-200/90 rounded-2xl shadow-xs p-6 md:p-8 space-y-6">
            <div className="border-b border-zinc-100 pb-5 flex justify-between items-start flex-wrap gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E61E32] bg-red-50 border border-red-200/80 px-2.5 py-0.5 rounded-md inline-block">
                  {exam.company_name}
                </span>
                <h1 className="text-xl md:text-2xl font-bold text-zinc-900 mt-2 tracking-tight">Edit Candidate Details</h1>
                <p className="text-xs text-zinc-500 font-medium">
                  Registered subject: <span className="font-bold text-zinc-900">{exam.name}</span>
                </p>
              </div>
              <div className="text-right font-mono text-[10px] text-zinc-500 border border-zinc-200/80 rounded-xl p-2.5 bg-zinc-50">
                <p>Reg No: <span className="font-bold text-zinc-800">{registration.registration_number}</span></p>
                <p>Ticket: <span className="font-bold text-zinc-800">{registration.hall_ticket_number}</span></p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-red-50 border border-red-200/80 rounded-xl text-red-800 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Candidate Verification Photo *</label>
                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-zinc-50/70 border border-zinc-200/80 rounded-xl">
                  <div className="w-24 h-28 bg-white border border-zinc-200 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-xs relative">
                    {photo ? (
                      <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-zinc-300" />
                    )}
                  </div>
                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <p className="text-xs text-zinc-600 font-medium">Upload a new photograph to update candidate identity records.</p>
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-bold text-[#E61E32] flex items-center justify-center sm:justify-start gap-1">
                        <span>⚠</span> Strictly passport-size photo required
                      </p>
                      <p className="text-[10px] font-semibold text-zinc-500">
                        Maximum file size: <span className="font-bold text-zinc-700">2 MB</span> — larger files will be rejected
                      </p>
                    </div>
                    <input
                      id="photo-upload-input"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="text-xs file:mr-4 file:py-1.5 file:px-3.5 file:rounded-lg file:border file:border-zinc-200 file:text-xs file:font-semibold file:bg-white file:text-zinc-800 hover:file:bg-zinc-100 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-name" className="block text-xs font-bold text-zinc-700 mb-1.5">Full Name *</label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    placeholder="e.g. Jean Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-xs w-full py-2.5 px-3.5 border border-zinc-200/90 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#E61E32]/20 focus:border-[#E61E32] transition-all font-medium placeholder:text-zinc-400"
                  />
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-xs font-bold text-zinc-700 mb-1.5">Email Address *</label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="e.g. jean.doe@edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-xs w-full py-2.5 px-3.5 border border-zinc-200/90 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#E61E32]/20 focus:border-[#E61E32] transition-all font-medium placeholder:text-zinc-400"
                  />
                </div>

                <div>
                  <label htmlFor="reg-phone" className="block text-xs font-bold text-zinc-700 mb-1.5">Phone Number *</label>
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="text-xs w-full py-2.5 px-3.5 border border-zinc-200/90 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#E61E32]/20 focus:border-[#E61E32] transition-all font-medium placeholder:text-zinc-400"
                  />
                </div>

                <div>
                  <label htmlFor="reg-year" className="block text-xs font-bold text-zinc-700 mb-1.5">Year of Study *</label>
                  <select
                    id="reg-year"
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value)}
                    className="text-xs w-full py-2.5 px-3.5 border border-zinc-200/90 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#E61E32]/20 focus:border-[#E61E32] transition-all font-medium text-zinc-800"
                  >
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                    <option>Postgraduate</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-college" className="block text-xs font-bold text-zinc-700 mb-1.5">College/Institution Name *</label>
                  <input
                    id="reg-college"
                    type="text"
                    required
                    placeholder="e.g. IIT Madras"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="text-xs w-full py-2.5 px-3.5 border border-zinc-200/90 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#E61E32]/20 focus:border-[#E61E32] transition-all font-medium placeholder:text-zinc-400"
                  />
                </div>

                <div>
                  <label htmlFor="reg-department" className="block text-xs font-bold text-zinc-700 mb-1.5">Department / Branch Name *</label>
                  <input
                    id="reg-department"
                    type="text"
                    required
                    placeholder="e.g. Computer Science & Eng"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="text-xs w-full py-2.5 px-3.5 border border-zinc-200/90 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#E61E32]/20 focus:border-[#E61E32] transition-all font-medium placeholder:text-zinc-400"
                  />
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-5 space-y-3">
                <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Candidate Declarations *</label>
                
                <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-zinc-50 transition-colors">
                  <input
                    type="checkbox"
                    id="decl1"
                    checked={decl1}
                    onChange={(e) => setDecl1(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#E61E32] cursor-pointer shrink-0"
                  />
                  <label htmlFor="decl1" className="text-xs text-zinc-700 select-none cursor-pointer leading-relaxed font-medium">
                    I confirm that the new photo is a clear, recent portrait of myself and matches my appearance.
                  </label>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-zinc-50 transition-colors">
                  <input
                    type="checkbox"
                    id="decl2"
                    checked={decl2}
                    onChange={(e) => setDecl2(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#E61E32] cursor-pointer shrink-0"
                  />
                  <label htmlFor="decl2" className="text-xs text-zinc-700 select-none cursor-pointer leading-relaxed font-medium">
                    I declare that all updated information matches official college documentation.
                  </label>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-zinc-50 transition-colors">
                  <input
                    type="checkbox"
                    id="decl3"
                    checked={decl3}
                    onChange={(e) => setDecl3(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#E61E32] cursor-pointer shrink-0"
                  />
                  <label htmlFor="decl3" className="text-xs text-zinc-700 select-none cursor-pointer leading-relaxed font-medium">
                    I agree to the proctoring protocols including webcam verification during live examination.
                  </label>
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-4 flex flex-col items-start">
                <Turnstile
                  onSuccess={(token) => {
                    setTurnstileToken(token);
                    setErrorMsg("");
                  }}
                  onError={() => setErrorMsg("Security verification encountered an error.")}
                  onExpire={() => setTurnstileToken("")}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("login")}
                  className="flex-1 py-3 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-semibold text-xs rounded-xl shadow-xs transition-all text-center cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#E61E32] hover:bg-[#d01729] disabled:bg-[#E61E32]/60 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer border-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </main>

        <footer className="py-6 border-t border-zinc-200/80 bg-white mt-12 text-center text-xs text-zinc-500 font-medium shrink-0">
          © 2026 Redlix Secure. Secure Candidate Examinations Registry.
        </footer>
      </div>
    );
  }

  if (step === "success" && registration && exam) {
    return (
      <div className="min-h-screen bg-zinc-100 font-sans text-zinc-900 flex flex-col selection:bg-[#E61E32]/10 selection:text-[#E61E32]">
        <header className="sticky top-0 z-50 bg-[#E61E32] border-b border-[#d01729] py-3 px-6 md:px-8 shadow-xs no-print">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="https://ik.imagekit.io/dypkhqxip/logotraining?updatedAt=1783099023149"
                alt="Redlix Logo"
                className="h-7.5 md:h-8 w-auto object-contain shrink-0 transition-transform group-hover:scale-[1.02]"
              />
              <div className="flex items-center gap-2 border-l border-white/20 pl-3">
                <span className="font-semibold text-xs text-white font-inter tracking-wide">Edit Registration</span>
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto p-6 md:p-8 flex flex-col justify-center space-y-6">
          <div className="no-print bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80 shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Updates Confirmed</h3>
                <p className="text-[11px] text-zinc-500">Your details are updated. Reprint your entry ticket below.</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => window.print()}
                className="flex-1 sm:flex-initial px-4 py-2 bg-[#E61E32] hover:bg-[#d01729] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Print / Save PDF
              </button>
              <Link
                href="/scheduled-exams"
                className="flex-1 sm:flex-initial px-4 py-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-bold text-xs rounded-xl shadow-xs transition-colors text-center cursor-pointer"
              >
                Exams Directory
              </Link>
            </div>
          </div>

          <div id="hall-ticket-print-area" className="bg-white border border-zinc-200/90 rounded-2xl p-5 sm:p-8 shadow-xs font-sans text-zinc-700 text-left space-y-6 relative overflow-hidden print:border-none print:shadow-none print:p-0 w-full">
            <div className="border-b border-zinc-200/80 pb-5 pt-1 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left w-full md:w-auto justify-center sm:justify-start">
                <div className="w-12 h-12 bg-zinc-100 border border-zinc-200 rounded-xl flex items-center justify-center font-bold text-zinc-500 uppercase tracking-wider text-sm select-none">
                  {exam.company_name.charAt(0)}
                </div>
                <div className="flex flex-col items-center sm:items-start">
                  <h1 className="text-xl font-bold text-zinc-900 leading-snug">{exam.company_name}</h1>
                  <p className="text-[11px] font-semibold text-[#E61E32] mt-0.5">Redlix Proctored Examination Portal</p>
                  <div className="mt-1.5 bg-zinc-100 text-zinc-700 font-semibold text-[9px] py-0.5 px-2.5 border border-zinc-200 inline-block rounded-md">
                    Official Hall Ticket &amp; Entry Permit (Updated)
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-center gap-1.5 border-t md:border-t-0 pt-4 md:pt-0 w-full md:w-auto md:items-end justify-center">
                <div className="w-16 h-16 bg-white border border-zinc-200 rounded-xl flex items-center justify-center p-1 shadow-xs relative">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                      `Candidate: ${name}\nHall Ticket: ${registration.hall_ticket_number}\nReg No: ${registration.registration_number}\nExam: ${exam.name}`
                    )}`}
                    alt="Scan to Verify"
                    className="w-full h-full"
                  />
                </div>
                <span className="text-[9px] text-zinc-400 font-medium">Verification QR</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pt-1">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Hall Ticket Number</p>
                  <p className="text-xl font-extrabold text-zinc-900 tracking-wide font-mono mt-0.5">{registration.hall_ticket_number}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-100">
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Candidate Name</p>
                    <p className="text-xs font-bold text-zinc-800 mt-0.5">{name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Registration Number</p>
                    <p className="text-xs font-bold text-zinc-800 font-mono mt-0.5">{registration.registration_number}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0" />
                  <p className="text-[11px] text-emerald-700 font-semibold">Status: Active (Modified)</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-1 border-t md:border-t-0 md:border-l border-zinc-200 pt-4 md:pt-0 md:pl-6 shrink-0">
                <div className="w-24 h-28 bg-zinc-50 border border-zinc-200/90 rounded-xl overflow-hidden shrink-0 shadow-xs relative">
                  <img src={photo} alt="Candidate Portrait" className="w-full h-full object-cover" />
                </div>
                <span className="text-[9px] text-zinc-400 font-medium">Candidate Photo</span>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-zinc-200/80">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">{exam.name} Subject Details</h4>
              <div className="border border-zinc-200/80 rounded-xl overflow-hidden divide-y divide-zinc-100 text-xs">
                <div className="grid grid-cols-12 bg-zinc-50/80 font-semibold py-2 px-3.5 text-[10px] text-zinc-400 uppercase tracking-wider border-b border-zinc-200/80">
                  <div className="col-span-1">No.</div>
                  <div className="col-span-7">Registered Subject / Paper</div>
                  <div className="col-span-4 text-right">Status</div>
                </div>
                <div className="grid grid-cols-12 py-3 px-3.5 font-medium text-zinc-700 items-center bg-white">
                  <div className="col-span-1 font-mono text-zinc-400 text-xs">01</div>
                  <div className="col-span-7 pr-3">
                    <p className="text-zinc-900 font-bold text-xs">{exam.name}</p>
                  </div>
                  <div className="col-span-4 text-right leading-tight">
                    <span className="text-xs font-bold text-emerald-600">Verified &amp; Ready</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-zinc-200/80">
              <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Candidate Profile Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 bg-zinc-50/60 p-4 border border-zinc-200/80 rounded-xl text-xs">
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Email Address</p>
                  <p className="font-semibold text-zinc-800 truncate mt-0.5">{email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Contact Phone</p>
                  <p className="font-semibold text-zinc-800 mt-0.5">{phone}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">College / Institution</p>
                  <p className="font-semibold text-zinc-800 truncate mt-0.5">{college}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Department / Branch</p>
                  <p className="font-semibold text-zinc-800 mt-0.5">{department}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Year of Study</p>
                  <p className="font-semibold text-zinc-800 mt-0.5">{yearOfStudy}</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="py-6 border-t border-zinc-200/80 bg-white mt-12 text-center text-xs text-zinc-500 font-medium shrink-0 no-print">
          © 2026 Redlix Secure. Secure Candidate Examinations Registry.
        </footer>
      </div>
    );
  }

  return null;
}

export default function EditRegistrationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <div className="w-9 h-9 rounded-full border-2 border-t-[#E61E32] border-r-zinc-200 border-b-zinc-200 border-l-zinc-200 animate-spin" />
      </div>
    }>
      <EditRegistrationContent />
    </Suspense>
  );
}
