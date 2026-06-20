"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SunIcon as Sunburst, ArrowLeft, CheckCircle, Camera, Lock, User, RefreshCw } from "lucide-react";
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

  // URL prefill helper
  const urlRegNum = searchParams.get("regNum") || "";
  const urlHtNum = searchParams.get("htNum") || "";

  // State
  const [step, setStep] = useState<"login" | "edit" | "success">("login");
  const [regNum, setRegNum] = useState(urlRegNum);
  const [htNum, setHtNum] = useState(urlHtNum);

  // Loaded Details
  const [registration, setRegistration] = useState<RegistrationDetails | null>(null);
  const [exam, setExam] = useState<ExamInfo | null>(null);

  // Editable Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("1st Year");
  const [photo, setPhoto] = useState("");

  // Declarations & Verification
  const [decl1, setDecl1] = useState(false);
  const [decl2, setDecl2] = useState(false);
  const [decl3, setDecl3] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  // UI Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Run lookup if values are prefilled from URL
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

        // Populate form fields
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

  // State 1: Login Form (matches exam-login layout)
  if (step === "login") {
    return (
      <FloatingPathsBackground position={-1} className="min-h-screen bg-zinc-100 flex items-center justify-center p-4 font-sans text-zinc-900 overflow-hidden">
        <div className="w-full max-w-4xl flex flex-col md:flex-row shadow-lg border border-zinc-200 bg-white relative z-10">

          {/* Left Column */}
          <div className="bg-zinc-50 p-8 md:p-12 md:w-1/2 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-200">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <img
                  src="https://ik.imagekit.io/dypkhqxip/redlix%20new?updatedAt=1781042212493"
                  alt="Redlix Secure Logo"
                  className="w-8 h-8 object-contain shrink-0"
                />
                <span className="font-bold text-sm tracking-wide text-zinc-800">Redlix Secure</span>
              </div>

              <h1 className="text-2xl md:text-3xl font-medium leading-snug tracking-tight mt-6 text-zinc-900">
                Registration Editor
              </h1>
              <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
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

            <p className="text-[10px] text-zinc-400 mt-8">
              For support, contact your examination controller
            </p>
          </div>

          {/* Right Column */}
          <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center bg-white min-h-[400px]">
            {isSubmitting ? (
              <div className="py-8 flex flex-col items-center justify-center text-center gap-6">
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 rounded-full border-2 border-t-orange-500 border-r-zinc-200 border-b-zinc-200 border-l-zinc-200 animate-spin" />
                </div>
                <p className="text-zinc-700 font-medium text-sm">Verifying credentials...</p>
              </div>
            ) : (
              <div className="w-full max-w-sm mx-auto">
                <div className="mb-6">
                  <h2 className="text-xl font-medium tracking-tight text-zinc-900">Sign In to Editor</h2>
                  <p className="text-xs text-zinc-500 mt-1">Credentials can be found on your hall ticket / admit card</p>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold mb-4">
                    {errorMsg}
                  </div>
                )}

                <form className="flex flex-col gap-4" onSubmit={(e) => handleLookup(e)} noValidate>
                  <div>
                    <label htmlFor="lookup-reg" className="block text-xs font-medium text-zinc-700 mb-1.5">
                      Registration Number
                    </label>
                    <input
                      id="lookup-reg"
                      type="text"
                      placeholder="6-digit registration code"
                      value={regNum}
                      onChange={(e) => { setRegNum(e.target.value); if (errorMsg) setErrorMsg(""); }}
                      className="text-sm w-full py-2 px-3 border border-zinc-300 rounded-none bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all font-mono"
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label htmlFor="lookup-ht" className="block text-xs font-medium text-zinc-700 mb-1.5">
                      Hall Ticket Number
                    </label>
                    <input
                      id="lookup-ht"
                      type="text"
                      placeholder="e.g. 26AI123456"
                      value={htNum}
                      onChange={(e) => { setHtNum(e.target.value.toUpperCase()); if (errorMsg) setErrorMsg(""); }}
                      className="text-sm w-full py-2 px-3 border border-zinc-300 rounded-none bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all font-mono"
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
                      className="flex-1 py-2 px-4 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-medium text-xs rounded-none shadow-sm transition-colors text-center cursor-pointer flex items-center justify-center bg-white"
                    >
                      Back to Exams
                    </Link>
                    <button
                      type="submit"
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-4 rounded-none transition-colors cursor-pointer shadow-sm text-xs"
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

  // State 2: Edit Form
  if (step === "edit" && registration && exam) {
    return (
      <div className="min-h-screen bg-zinc-100 font-sans text-zinc-900 flex flex-col font-normal">
        <header className="bg-orange-500 border-b border-orange-600 py-3.5 px-6 shrink-0 shadow-xs">
          <div className="max-w-5xl mx-auto flex items-center justify-start">
            <nav className="text-xs text-orange-100 font-semibold flex items-center gap-1.5">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="text-orange-200">/</span>
              <Link href="/scheduled-exams" className="hover:text-white transition-colors">Scheduled Exams</Link>
              <span className="text-orange-200">/</span>
              <span className="text-white">Edit Registration</span>
            </nav>
          </div>
        </header>

        <main className="flex-1 w-full max-w-5xl mx-auto p-6 flex flex-col justify-center">
          <div className="max-w-2xl w-full mx-auto bg-white border border-zinc-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="border-b border-zinc-100 pb-4 flex justify-between items-start flex-wrap gap-4">
              <div>
                <span className="text-[9px] font-bold tracking-wider uppercase bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-none">
                  {exam.company_name}
                </span>
                <h1 className="text-xl font-bold text-zinc-900 mt-2 tracking-tight">Edit Candidate Details</h1>
                <p className="text-xs text-zinc-500 mt-1">
                  Registered subject: <span className="font-semibold text-zinc-800">{exam.name}</span>
                </p>
              </div>
              <div className="text-right font-mono text-[10px] text-zinc-500 border border-zinc-200 p-2 bg-zinc-50">
                <p>Reg No: <span className="font-bold text-zinc-800">{registration.registration_number}</span></p>
                <p>Ticket: <span className="font-bold text-zinc-800">{registration.hall_ticket_number}</span></p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-6 font-normal">
              {/* Photo */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">Candidate Verification Photo *</label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-zinc-50 border border-zinc-200">
                  <div className="w-24 h-28 bg-zinc-200 flex items-center justify-center overflow-hidden border border-zinc-300 relative shrink-0">
                    {photo ? (
                      <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-zinc-400" />
                    )}
                  </div>
                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <p className="text-[10px] text-zinc-500">Upload a new photograph to update candidate identity records.</p>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-red-650 flex items-center gap-1 justify-center sm:justify-start">
                        <span>⚠</span> Strictly passport-size photo required
                      </p>
                      <p className="text-[10px] font-semibold text-red-500">
                        Maximum file size: <span className="font-bold">2 MB</span> — larger files will be rejected
                      </p>
                    </div>
                    <input
                      id="photo-upload-input"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-none file:border file:border-zinc-300 file:text-xs file:font-semibold file:bg-white file:text-zinc-700 hover:file:bg-zinc-50 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-name" className="block text-xs font-semibold text-zinc-700 mb-1">Full Name *</label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    placeholder="e.g. Jean Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-xs w-full py-2 px-3 border border-zinc-300 rounded-none bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-xs font-semibold text-zinc-700 mb-1">Email Address *</label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="e.g. jean.doe@edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-xs w-full py-2 px-3 border border-zinc-300 rounded-none bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="reg-phone" className="block text-xs font-semibold text-zinc-700 mb-1">Phone Number *</label>
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="text-xs w-full py-2 px-3 border border-zinc-300 rounded-none bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="reg-year" className="block text-xs font-semibold text-zinc-700 mb-1">Year of Study *</label>
                  <select
                    id="reg-year"
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value)}
                    className="text-xs w-full py-2 px-3 border border-zinc-300 rounded-none bg-white focus:outline-none focus:border-orange-500"
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
                  <label htmlFor="reg-college" className="block text-xs font-semibold text-zinc-700 mb-1">College/Institution Name *</label>
                  <input
                    id="reg-college"
                    type="text"
                    required
                    placeholder="e.g. IIT Madras"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="text-xs w-full py-2 px-3 border border-zinc-300 rounded-none bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="reg-department" className="block text-xs font-semibold text-zinc-700 mb-1">Department / Branch Name *</label>
                  <input
                    id="reg-department"
                    type="text"
                    required
                    placeholder="e.g. Computer Science & Eng"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="text-xs w-full py-2 px-3 border border-zinc-300 rounded-none bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Declarations */}
              <div className="border-t border-zinc-100 pt-4 space-y-3">
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">Candidate Declarations *</label>
                
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="decl1"
                    checked={decl1}
                    onChange={(e) => setDecl1(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-orange-500 cursor-pointer shrink-0"
                  />
                  <label htmlFor="decl1" className="text-xs text-zinc-600 select-none cursor-pointer leading-normal">
                    I confirm that the new photo is a clear, recent portrait of myself and matches my appearance.
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="decl2"
                    checked={decl2}
                    onChange={(e) => setDecl2(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-orange-500 cursor-pointer shrink-0"
                  />
                  <label htmlFor="decl2" className="text-xs text-zinc-600 select-none cursor-pointer leading-normal">
                    I declare that all updated information matches official college documentation.
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="decl3"
                    checked={decl3}
                    onChange={(e) => setDecl3(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-orange-500 cursor-pointer shrink-0"
                  />
                  <label htmlFor="decl3" className="text-xs text-zinc-600 select-none cursor-pointer leading-normal">
                    I agree to the proctoring protocols including webcam verification during live examination.
                  </label>
                </div>
              </div>

              {/* Turnstile */}
              <div className="border-t border-zinc-200 pt-4 flex flex-col items-start">
                <Turnstile
                  onSuccess={(token) => {
                    setTurnstileToken(token);
                    setErrorMsg("");
                  }}
                  onError={() => setErrorMsg("Security verification encountered an error.")}
                  onExpire={() => setTurnstileToken("")}
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep("login")}
                  className="flex-1 py-2.5 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-semibold text-xs rounded-none shadow-sm transition-colors text-center cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white font-semibold text-xs rounded-none shadow-sm transition-colors cursor-pointer border-none flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </main>

        <footer className="py-6 border-t border-zinc-200 bg-white mt-12 text-center text-xs text-zinc-400 shrink-0">
          © 2026 Redlix Secure. Secure Examinations Registry.
        </footer>
      </div>
    );
  }

  // State 3: Success Screen (Print Hall Ticket)
  if (step === "success" && registration && exam) {
    return (
      <div className="min-h-screen bg-zinc-100 font-sans text-zinc-900 flex flex-col font-normal">
        <header className="bg-orange-500 border-b border-orange-600 py-3.5 px-6 shrink-0 shadow-xs no-print">
          <div className="max-w-5xl mx-auto flex items-center justify-start">
            <nav className="text-xs text-orange-100 font-semibold flex items-center gap-1.5">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="text-orange-200">/</span>
              <Link href="/scheduled-exams" className="hover:text-white transition-colors">Scheduled Exams</Link>
              <span className="text-orange-200">/</span>
              <span className="text-white">Edit Registration</span>
            </nav>
          </div>
        </header>

        <main className="flex-1 w-full max-w-5xl mx-auto p-6 flex flex-col justify-center space-y-6">
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              body {
                background-color: white !important;
                color: black !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              header, footer, .no-print {
                display: none !important;
              }
              main {
                padding: 0 !important;
                margin: 0 !important;
                max-width: 100% !important;
                width: 100% !important;
              }
              .space-y-6 > :not([hidden]) ~ :not([hidden]) {
                margin-top: 0 !important;
              }
              #hall-ticket-print-area {
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                page-break-inside: avoid !important;
              }
              @page {
                size: A4 portrait;
                margin: 15mm;
              }
            }
          `}} />

          <div className="no-print bg-white border border-zinc-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 rounded-none">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-none bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Updates Confirmed</h3>
                <p className="text-[10px] text-zinc-500">Your details are updated. Reprint your entry ticket below.</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => window.print()}
                className="flex-1 sm:flex-initial px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-none shadow-sm transition-colors cursor-pointer border-none"
              >
                Print / Save PDF
              </button>
              <Link
                href="/scheduled-exams"
                className="flex-1 sm:flex-initial px-4 py-2 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-bold text-xs rounded-none shadow-sm transition-colors text-center cursor-pointer"
              >
                Exams Directory
              </Link>
            </div>
          </div>

          {/* Hall Ticket Area */}
          <div id="hall-ticket-print-area" className="bg-white border border-zinc-200 p-8 shadow-xs font-sans text-zinc-700 text-left space-y-6 relative rounded-none print:border-none print:shadow-none print:p-0 w-full font-normal">
            <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500" />

            <div className="border-b border-zinc-200 pb-5 pt-2 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left w-full md:w-auto justify-center sm:justify-start">
                <div className="w-12 h-12 bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-zinc-500 uppercase tracking-wider text-sm select-none">
                  {exam.company_name.charAt(0)}
                </div>
                <div className="flex flex-col items-center sm:items-start">
                  <h1 className="text-xl font-semibold text-zinc-900 leading-snug">{exam.company_name}</h1>
                  <p className="text-[10px] font-medium text-orange-600 mt-0.5">Online Examination Portal</p>
                  <div className="mt-1.5 bg-zinc-100 text-zinc-700 font-medium text-[9px] py-0.5 px-2.5 border border-zinc-200 inline-block rounded-none">
                    Official Hall Ticket & Entry Permit (Updated)
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-center gap-1.5 border-t md:border-t-0 pt-4 md:pt-0 w-full md:w-auto md:items-end justify-center">
                <div className="w-16 h-16 bg-white border border-zinc-200 flex items-center justify-center p-1 shadow-xs relative">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                      `Candidate: ${name}\nHall Ticket: ${registration.hall_ticket_number}\nReg No: ${registration.registration_number}\nExam: ${exam.name}`
                    )}`}
                    alt="Scan to Verify"
                    className="w-full h-full"
                  />
                </div>
                <span className="text-[8px] text-zinc-400 font-medium">Verification QR</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pt-2">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <p className="text-[10px] text-zinc-400 font-medium">Hall Ticket Number</p>
                  <p className="text-xl font-semibold text-zinc-900 tracking-wide font-mono mt-1">{registration.hall_ticket_number}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-100">
                  <div>
                    <p className="text-[9px] text-zinc-400 font-medium">Candidate Name</p>
                    <p className="text-sm font-semibold text-zinc-800 mt-0.5">{name}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-zinc-400 font-medium">Registration Number</p>
                    <p className="text-sm font-semibold text-zinc-800 font-mono mt-0.5">{registration.registration_number}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-none shrink-0" />
                  <p className="text-[10px] text-emerald-700 font-medium">Status: Active (Modified)</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-1 border-t md:border-t-0 md:border-l border-zinc-200 pt-4 md:pt-0 md:pl-6 shrink-0">
                <div className="w-24 h-28 bg-zinc-50 border border-zinc-200 overflow-hidden shrink-0 shadow-xs relative">
                  <img src={photo} alt="Student Portrait" className="w-full h-full object-cover" />
                </div>
                <span className="text-[8px] text-zinc-400 font-medium">Candidate Photo</span>
              </div>
            </div>

            {/* Exam Info */}
            <div className="space-y-3 pt-4 border-t border-zinc-200">
              <h4 className="text-xs font-semibold text-zinc-800">{exam.name} Subject Details</h4>
              <div className="border border-zinc-200 divide-y divide-zinc-200 text-xs">
                <div className="grid grid-cols-12 bg-zinc-50 font-medium py-2 px-3 text-[10px] text-zinc-500 border-b border-zinc-200">
                  <div className="col-span-1">No.</div>
                  <div className="col-span-7">Registered Subject / Evaluation Paper</div>
                  <div className="col-span-4 text-right">Status</div>
                </div>
                <div className="grid grid-cols-12 py-3 px-3 font-medium text-zinc-700 items-center bg-white">
                  <div className="col-span-1 font-mono text-zinc-400">01</div>
                  <div className="col-span-7 pr-3">
                    <p className="text-zinc-800 font-semibold text-sm">{exam.name}</p>
                  </div>
                  <div className="col-span-4 text-right leading-tight">
                    <span className="text-xs font-semibold text-emerald-600">Verified & Ready</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Profile */}
            <div className="space-y-3 pt-5 border-t border-zinc-200">
              <h4 className="text-xs font-semibold text-zinc-800">Candidate Registration Profile</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 bg-zinc-50/50 p-4 border border-zinc-200 text-xs font-normal">
                <div>
                  <p className="text-[9px] text-zinc-400 font-medium">Candidate Email</p>
                  <p className="font-medium text-zinc-700 truncate mt-0.5">{email}</p>
                </div>
                <div>
                  <p className="text-[9px] text-zinc-400 font-medium">Contact Phone</p>
                  <p className="font-medium text-zinc-700 mt-0.5">{phone}</p>
                </div>
                <div>
                  <p className="text-[9px] text-zinc-400 font-medium">College / Institution</p>
                  <p className="font-medium text-zinc-700 truncate mt-0.5">{college}</p>
                </div>
                <div>
                  <p className="text-[9px] text-zinc-400 font-medium">Department / Branch</p>
                  <p className="font-medium text-zinc-700 mt-0.5">{department}</p>
                </div>
                <div>
                  <p className="text-[9px] text-zinc-400 font-medium">Year of Study</p>
                  <p className="font-medium text-zinc-700 mt-0.5">{yearOfStudy}</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="py-6 border-t border-zinc-200 bg-white mt-12 text-center text-xs text-zinc-400 shrink-0 no-print">
          © 2026 Redlix Secure. Secure Examinations Registry.
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
        <div className="w-10 h-10 rounded-full border-2 border-t-orange-500 border-r-zinc-200 border-b-zinc-200 border-l-zinc-200 animate-spin" />
      </div>
    }>
      <EditRegistrationContent />
    </Suspense>
  );
}
