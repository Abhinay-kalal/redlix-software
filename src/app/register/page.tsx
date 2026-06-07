"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { SunIcon as Sunburst, ArrowLeft, CheckCircle, Camera } from "lucide-react";
import Link from "next/link";
import { Turnstile } from "@/components/ui/turnstile";

interface ExamDetails {
  id: number;
  name: string;
  company_name: string;
  company_logo?: string;
  date: string;
  time: string;
  total_qns: number;
  types_of_qns: string;
}

function RegisterFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const examId = searchParams.get("examId");

  const [exam, setExam] = useState<ExamDetails | null>(null);
  const [loadingExam, setLoadingExam] = useState(true);
  
  
  const [photo, setPhoto] = useState<string>(""); 
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("1st Year");
  
  
  const [decl1, setDecl1] = useState(false);
  const [decl2, setDecl2] = useState(false);
  const [decl3, setDecl3] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [generatedRegNum, setGeneratedRegNum] = useState("");
  const [generatedHtNum, setGeneratedHtNum] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  useEffect(() => {
    if (!examId) {
      setLoadingExam(false);
      return;
    }
    const fetchExamDetails = async () => {
      try {
        const { data, error } = await supabase
          .from("exams")
          .select("id, name, company_name, date, time, total_qns, types_of_qns, company_logo")
          .eq("id", Number(examId))
          .single();
        
        if (!error && data) {
          setExam(data);
        } else {
          console.error("Exam not found:", error);
        }
      } catch (err) {
        console.error("Error fetching exam:", err);
      } finally {
        setLoadingExam(false);
      }
    };

    fetchExamDetails();
  }, [examId]);

  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examId) {
      setErrorMsg("Invalid or missing examination reference ID.");
      return;
    }
    if (!photo) {
      setErrorMsg("Please upload your candidate verification photo.");
      return;
    }
    if (!decl1 || !decl2 || !decl3) {
      setErrorMsg("Please accept all three declaration checkboxes to register.");
      return;
    }
    if (!turnstileToken) {
      setErrorMsg("Please complete the security check.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const verifyRes = await fetch("/api/verify-turnstile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: turnstileToken }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        setErrorMsg("Security verification failed. Please try again.");
        setIsSubmitting(false);
        return;
      }
    } catch {
      setErrorMsg("Failed to verify security token. Please try again.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Check for existing registration for this exam
      const { data: existingReg, error: checkError } = await supabase
        .from("registrations")
        .select("id")
        .eq("exam_id", Number(examId))
        .eq("email", email.trim())
        .maybeSingle();

      if (existingReg) {
        setErrorMsg("You have already registered for this examination.");
        setIsSubmitting(false);
        return;
      }

      const regNum = String(Math.floor(100000 + Math.random() * 900000));
      const htNum = "26AI" + String(Math.floor(100000 + Math.random() * 900000));

      const { error } = await supabase.from("registrations").insert({
        exam_id: Number(examId),
        candidate_name: name,
        email: email.trim(),
        phone,
        college,
        department,
        year_of_study: yearOfStudy,
        photo_url: photo,
        registration_number: regNum,
        hall_ticket_number: htNum
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setGeneratedRegNum(regNum);
        setGeneratedHtNum(htNum);
        setSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected registration error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingExam) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-t-orange-500 border-r-zinc-300 border-b-zinc-300 border-l-zinc-300 animate-spin mb-4" />
        <p className="text-zinc-500 text-xs">Retrieving examination information...</p>
      </div>
    );
  }

  if (!examId || (!loadingExam && !exam)) {
    return (
      <div className="py-16 text-center max-w-md mx-auto bg-white border border-zinc-200 p-8 shadow-sm">
        <p className="text-red-600 text-sm font-bold mb-4">Invalid Examination ID</p>
        <p className="text-zinc-500 text-xs mb-6">The exam publication reference is missing or invalid. Please check the public schedule list again.</p>
        <Link 
          href="/scheduled-exams"
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-900 text-white font-semibold text-xs rounded-none shadow-sm transition-colors cursor-pointer border-none"
        >
          Back to Directory
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-6 w-full max-w-2xl mx-auto">
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

        {}
        <div className="no-print bg-white border border-zinc-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 rounded-none">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-none bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Registration Confirmed</h3>
              <p className="text-[10px] text-zinc-500">Your Hall Ticket is generated below. Click Print to save it as a PDF document.</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => window.print()}
              className="flex-1 sm:flex-initial px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-none shadow-sm transition-colors cursor-pointer border-none font-semibold"
            >
              Print / Save PDF
            </button>
            <Link
              href="/scheduled-exams"
              className="flex-1 sm:flex-initial px-4 py-2 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-bold text-xs rounded-none shadow-sm transition-colors text-center cursor-pointer font-semibold"
            >
              Exams Directory
            </Link>
          </div>
        </div>

        {}
        <div id="hall-ticket-print-area" className="bg-white border border-zinc-200 p-8 shadow-xs font-sans text-zinc-700 text-left space-y-6 relative rounded-none print:border-none print:shadow-none print:p-0">
          
          {}
          <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500" />

          {}
          <div className="border-b border-zinc-200 pb-5 pt-2 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left w-full md:w-auto justify-center sm:justify-start">
              {}
              <div className="shrink-0">
                {exam?.company_logo ? (
                  <img src={exam.company_logo} alt="Company Logo" className="h-12 w-12 object-contain" />
                ) : (
                  <div className="w-12 h-12 bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-zinc-500 uppercase tracking-wider text-sm select-none">
                    {exam?.company_name?.charAt(0) || "C"}
                  </div>
                )}
              </div>
              
              {}
              <div className="flex flex-col items-center sm:items-start">
                <h1 className="text-xl font-semibold text-zinc-900 leading-snug">{exam?.company_name || "CMR Institute of Technology"}</h1>
                <p className="text-[10px] font-medium text-orange-600 mt-0.5">Online Examination Portal</p>
                <div className="mt-1.5 bg-zinc-100 text-zinc-700 font-medium text-[9px] py-0.5 px-2.5 border border-zinc-200 inline-block rounded-none">
                  Official Hall Ticket & Entry Permit
                </div>
              </div>
            </div>

            {}
            <div className="shrink-0 flex flex-col items-center gap-1.5 border-t md:border-t-0 pt-4 md:pt-0 w-full md:w-auto md:items-end justify-center">
              <div className="w-16 h-16 bg-white border border-zinc-200 flex items-center justify-center p-1 shadow-xs relative">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                    `Candidate: ${name}\nHall Ticket: ${generatedHtNum}\nReg No: ${generatedRegNum}\nExam: ${exam?.name || ""}`
                  )}`}
                  alt="Scan to Verify"
                  className="w-full h-full"
                />
              </div>
              <span className="text-[8px] text-zinc-400 font-medium">Verification QR</span>
            </div>

          </div>

          {}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pt-2">
            <div className="md:col-span-2 space-y-4">
              <div>
                <p className="text-[10px] text-zinc-400 font-medium">Hall Ticket Number</p>
                <p className="text-xl font-semibold text-zinc-900 tracking-wide font-mono mt-1">{generatedHtNum}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-100">
                <div>
                  <p className="text-[9px] text-zinc-400 font-medium">Candidate Name</p>
                  <p className="text-sm font-semibold text-zinc-800 mt-0.5">{name}</p>
                </div>
                <div>
                  <p className="text-[9px] text-zinc-400 font-medium">Registration Number</p>
                  <p className="text-sm font-semibold text-zinc-800 font-mono mt-0.5">{generatedRegNum}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-none shrink-0" />
                <p className="text-[10px] text-emerald-700 font-medium">Status: Confirmed</p>
              </div>
            </div>

            {}
            <div className="flex flex-col items-center justify-center gap-1 border-t md:border-t-0 md:border-l border-zinc-200 pt-4 md:pt-0 md:pl-6 shrink-0">
              <div className="w-24 h-28 bg-zinc-50 border border-zinc-200 overflow-hidden shrink-0 shadow-xs relative">
                {photo ? (
                  <img src={photo} alt="Student Portrait" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300 font-semibold text-xs bg-zinc-55">Photo</div>
                )}
              </div>
              <span className="text-[8px] text-zinc-400 font-medium">Candidate Photo</span>
            </div>
          </div>

          {}
          <div className="space-y-3 pt-4 border-t border-zinc-200">
            <h4 className="text-xs font-semibold text-zinc-800">{exam?.name} Schedule</h4>
            
            {}
            <div className="border border-zinc-200 divide-y divide-zinc-200 text-xs">
              <div className="grid grid-cols-12 bg-zinc-50 font-medium py-2 px-3 text-[10px] text-zinc-500 border-b border-zinc-200">
                <div className="col-span-1">No.</div>
                <div className="col-span-7">Registered Subject / Evaluation Paper</div>
                <div className="col-span-4 text-right">Scheduled Time (IST)</div>
              </div>
              <div className="grid grid-cols-12 py-3 px-3 font-medium text-zinc-700 items-center bg-white">
                <div className="col-span-1 font-mono text-zinc-400">01</div>
                <div className="col-span-7 pr-3">
                  <p className="text-zinc-800 font-semibold text-sm">{exam?.name}</p>
                  <p className="text-[10px] text-zinc-400 font-normal mt-1">Format: {exam?.total_qns} Questions</p>
                </div>
                <div className="col-span-4 text-right leading-tight">
                  <p className="font-semibold text-zinc-800 text-sm">{exam?.date}</p>
                  <p className="text-[10px] text-zinc-400 font-normal mt-1">{exam?.time} IST</p>
                </div>
              </div>
            </div>
          </div>

          {}
          <div className="space-y-3 pt-5 border-t border-zinc-200">
            <h4 className="text-xs font-semibold text-zinc-800">Candidate Registration Profile</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6 bg-zinc-50/50 p-4 border border-zinc-200 text-xs">
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

          {}
          <div className="space-y-2 pt-2 text-[10px] text-zinc-450 leading-relaxed font-normal">
            <p className="font-semibold text-zinc-700 text-[10px]">Important Instructions:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Candidates must prepare their workspace and be present at least 15 minutes before the exam starts.</li>
              <li>Identity check verification requires a valid matching college ID card along with this ticket.</li>
            </ul>
          </div>

          {}
          <div className="text-[9px] text-zinc-400 font-mono text-center pt-4 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>Downloaded on: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white border border-zinc-200 shadow-sm p-6 sm:p-8 space-y-6">
      <div className="border-b border-zinc-100 pb-4">
        <span className="text-[9px] font-bold tracking-wider uppercase bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-none">
          {exam?.company_name}
        </span>
        <h1 className="text-xl font-bold text-zinc-900 mt-2 tracking-tight">Candidate Registration</h1>
        <p className="text-xs text-zinc-500 mt-1">Registering for: <span className="font-semibold text-zinc-800">{exam?.name}</span></p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 font-normal">
        
        {}
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
            <div className="space-y-2 text-center sm:text-left">
              <p className="text-[10px] text-zinc-500">Upload your photograph for candidate identity verification.</p>
              {}
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-red-600 flex items-center gap-1">
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

        {}
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

        {}
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
              I confirm that the uploaded photo is a clear, recent portrait of myself and matches my appearance.
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
              I declare that all information provided in this registration form is correct and matches my college records.
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
              I agree to the Redlix Secure evaluation terms, which include webcam and screen monitoring protocol during the exam.
            </label>
          </div>
        </div>

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

        <div className="pt-4 flex gap-4">
          <Link
            href="/scheduled-exams"
            className="flex-1 py-2.5 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-semibold text-xs rounded-none shadow-sm transition-colors text-center cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white font-semibold text-xs rounded-none shadow-sm transition-colors cursor-pointer border-none"
          >
            {isSubmitting ? "Submitting..." : "Submit Registration"}
          </button>
        </div>

      </form>
    </div>
  );
}

export default function RegisterForExamPage() {
  return (
    <div className="min-h-screen bg-zinc-100 font-sans text-zinc-900 flex flex-col">
      {}
      <header className="bg-orange-500 border-b border-orange-600 py-3.5 px-6 shrink-0 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-start">
          {}
          <nav className="text-xs text-orange-100 font-semibold flex items-center gap-1.5">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-orange-200">/</span>
            <Link href="/scheduled-exams" className="hover:text-white transition-colors">Scheduled Exams</Link>
            <span className="text-orange-200">/</span>
            <span className="text-white">Register</span>
          </nav>
        </div>
      </header>

      {}
      <main className="flex-1 w-full max-w-5xl mx-auto p-6 flex flex-col justify-center">
        <Suspense fallback={
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-t-orange-500 border-r-zinc-300 border-b-zinc-300 border-l-zinc-300 animate-spin mb-4" />
            <p className="text-zinc-500 text-xs">Loading registration desk...</p>
          </div>
        }>
          <RegisterFormContent />
        </Suspense>
      </main>

      {}
      <footer className="py-6 border-t border-zinc-200 bg-white mt-12 text-center text-xs text-zinc-400 shrink-0">
        © 2026 Redlix Secure. Secure Examinations Registry.
      </footer>
    </div>
  );
}
