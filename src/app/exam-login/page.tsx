"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FloatingPathsBackground } from "@/components/ui/floating-paths";
import { Turnstile } from "@/components/ui/turnstile";
import { SmoothInput } from "@/components/ui/smooth-input";
import { getVisitorId } from "@/utils/fingerprint";
import { createClient } from "@/utils/supabase/client";
import Script from "next/script";

function ExamLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const examIdParam = searchParams.get("examId");

  const [name, setName] = useState("");
  const [hallTicket, setHallTicket] = useState("");
  const [nameError, setNameError] = useState("");
  const [htError, setHtError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Verifying credentials...");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [securityError, setSecurityError] = useState("");
  const visitorIdRef = useRef<string>("");

  const [isUnsupportedDevice, setIsUnsupportedDevice] = useState(false);

  // Join with Code state variables
  const [isJoinWithCode, setIsJoinWithCode] = useState(false);
  const [quickExamCode, setQuickExamCode] = useState("");
  const [availableExams, setAvailableExams] = useState<any[]>([]);
  const [quickPhoto, setQuickPhoto] = useState<string>("");
  const [quickName, setQuickName] = useState("");
  const [quickEmail, setQuickEmail] = useState("");
  const [quickError, setQuickError] = useState("");
  const [isQuickSubmitting, setIsQuickSubmitting] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data } = await supabase
          .from("exams")
          .select("id, name, company_name, date, time")
          .order("id", { ascending: true });
        if (data && data.length > 0) {
          setAvailableExams(data);
          setQuickExamCode(String(data[0].id));
        }
      } catch (err) {
        console.error("Failed to fetch exams:", err);
      }
    };
    fetchExams();
  }, []);

  const handleQuickPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setQuickError("Candidate photo must be under 2MB in size.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setQuickPhoto(reader.result as string);
      setQuickError("");
    };
    reader.readAsDataURL(file);
  };

  const handleQuickJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) {
      setQuickError("Please enter your full name.");
      return;
    }
    if (!quickEmail.trim()) {
      setQuickError("Please enter your email address.");
      return;
    }
    if (!quickPhoto) {
      setQuickError("Please upload your candidate verification photo.");
      return;
    }

    setIsQuickSubmitting(true);
    setQuickError("");

    try {
      const selectedExamId = Number(quickExamCode);
      const { data: targetExam, error: examErr } = await supabase
        .from("exams")
        .select("*")
        .eq("id", selectedExamId)
        .single();

      if (examErr || !targetExam) {
        setQuickError("Selected examination reference was not found.");
        setIsQuickSubmitting(false);
        return;
      }

      const regNum = String(Math.floor(100000 + Math.random() * 900000));
      const htNum = "26AI" + String(Math.floor(100000 + Math.random() * 900000));

      const { data: existingReg } = await supabase
        .from("registrations")
        .select("*")
        .eq("exam_id", selectedExamId)
        .eq("email", quickEmail.trim())
        .maybeSingle();

      let candidateData;
      if (existingReg) {
        candidateData = existingReg;
      } else {
        const { data: newReg, error: insertErr } = await supabase
          .from("registrations")
          .insert({
            exam_id: selectedExamId,
            candidate_name: quickName.trim(),
            email: quickEmail.trim(),
            phone: "+91 9876543210",
            college: "Student Forge Portal",
            department: "General",
            year_of_study: "1st Year",
            photo_url: quickPhoto,
            registration_number: regNum,
            hall_ticket_number: htNum,
          })
          .select()
          .single();

        if (insertErr) {
          setQuickError(insertErr.message);
          setIsQuickSubmitting(false);
          return;
        }
        candidateData = newReg;
      }

      sessionStorage.setItem(
        "exam_session",
        JSON.stringify({
          candidateName: candidateData.candidate_name,
          hallTicketNumber: candidateData.hall_ticket_number,
          registrationNumber: candidateData.registration_number,
          photoUrl: candidateData.photo_url || quickPhoto,
          visitorId: visitorIdRef.current,
          exam: targetExam,
        })
      );

      router.push("/exam");
    } catch (err: any) {
      setQuickError(err.message || "Quick registration failed. Please try again.");
      setIsQuickSubmitting(false);
    }
  };

  // Eagerly collect fingerprint in the background so it's ready when the form submits
  useEffect(() => {
    getVisitorId()
      .then((id) => { visitorIdRef.current = id; })
      .catch(() => { /* non-fatal */ });
  }, []);

  // Block mobile and tablet devices
  useEffect(() => {
    const checkDevice = () => {
      const ua = navigator.userAgent.toLowerCase();
      const isMobileUA = /mobile|android|iphone|ipad|phone|tablet|kindle|silk|opera mini/i.test(ua);
      const isSmallScreen = window.innerWidth < 1024;
      if (isMobileUA || isSmallScreen) {
        setIsUnsupportedDevice(true);
      }
    };
    checkDevice();
    window.addEventListener("resize", checkDevice);
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  const loadingSteps = [
    "Verifying credentials...",
    "Fetching exam details...",
    "Preparing your exam session...",
  ];

  useEffect(() => {
    let i = 0;
    if (!isLoading) return;
    const interval = setInterval(() => {
      i = (i + 1) % loadingSteps.length;
      setLoadingMsg(loadingSteps[i]);
    }, 900);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    if (!name.trim()) {
      setNameError("Please enter your full name.");
      valid = false;
    } else {
      setNameError("");
    }

    if (!hallTicket.trim()) {
      setHtError("Please enter your hall ticket number.");
      valid = false;
    } else {
      setHtError("");
    }

    if (!acceptedTerms) {
      setTermsError("Please accept the terms and conditions to proceed.");
      valid = false;
    } else {
      setTermsError("");
    }

    if (!valid) return;

    setIsLoading(true);
    setLoadingMsg(loadingSteps[0]);

    try {
      // Verify credentials server-side (service role bypasses RLS safely)
      const verifyCredRes = await fetch("/api/exam/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hallTicketNumber: hallTicket.trim(),
          candidateName: name.trim(),
          examId: examIdParam ? Number(examIdParam) : null,
        }),
      });
      const verifyCredData = await verifyCredRes.json();

      if (!verifyCredData.success) {
        if (verifyCredData.error === "not_found") {
          setHtError("Hall ticket number not found. Please check and try again.");
        } else if (verifyCredData.error === "name_mismatch") {
          setNameError("Name does not match our records for this hall ticket.");
        } else if (verifyCredData.error === "exam_not_found") {
          setHtError("Could not fetch exam details. Please contact the exam administrator.");
        } else if (verifyCredData.error === "not_registered_for_this_exam") {
          setHtError("Your hall ticket number is not registered for this exam.");
        } else if (verifyCredData.error === "blocked") {
          setHtError("Your exam session has been locked due to a proctoring violation. Please contact the administrator.");
        } else {
          setHtError("Verification failed. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      const { candidate, exam } = verifyCredData;

      // Clear client-side violation lock on successful validation (re-enabled candidates)
      try {
        localStorage.removeItem(`exam_violated_${candidate.hallTicketNumber}`);
      } catch (err) {
        console.error("Failed to clear localStorage lockout:", err);
      }

      // Ensure fingerprint is collected (may already be set from background effect)
      if (!visitorIdRef.current) {
        try {
          visitorIdRef.current = await getVisitorId();
        } catch {
          // non-fatal – proceed without fingerprint if collection fails
        }
      }

      // Register device fingerprint & check for concurrent sessions
      try {
        const startRes = await fetch("/api/exam/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hallTicketNumber: candidate.hallTicketNumber,
            visitorId: visitorIdRef.current,
          }),
        });
        const startData = await startRes.json();
        if (!startData.success) {
          if (startData.error === "concurrent_device") {
            setHtError(
              "This exam is already active on another device. Only one device is allowed per session."
            );
          } else {
            setHtError("Security check failed. Please try again.");
          }
          setIsLoading(false);
          return;
        }
      } catch {
        // Non-blocking – proceed if the network call fails
        console.warn("Device fingerprint registration failed; proceeding anyway.");
      }

      sessionStorage.setItem(
        "exam_session",
        JSON.stringify({
          candidateName: candidate.candidateName,
          hallTicketNumber: candidate.hallTicketNumber,
          registrationNumber: candidate.registrationNumber,
          photoUrl: candidate.photoUrl,
          visitorId: visitorIdRef.current,
          exam,

        })
      );

      router.push("/exam");
    } catch (err) {
      setHtError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (isUnsupportedDevice) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4 font-sans text-zinc-900">
        <div className="w-full max-w-md bg-white border border-zinc-200 p-8 text-center space-y-6 shadow-lg rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-[#E61E32]/10 border border-[#E61E32]/20 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-[#E61E32]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-zinc-800 uppercase">Desktop Access Only</h1>
            <p className="text-xs text-zinc-500 leading-relaxed">
              This exam is proctored and must be taken on a laptop or desktop computer. Access from mobile phones and tablets is blocked.
            </p>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 p-4 space-y-2 text-left rounded-xl">
            <p className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Restricted Devices:</p>
            <ul className="text-xs text-zinc-650 space-y-1 list-disc pl-4">
              <li>Mobile Smart Phones (iOS, Android)</li>
              <li>Tablet Devices (iPad, Android Tablets)</li>
              <li>Devices with screen width below 1024px</li>
            </ul>
          </div>

          <p className="text-xs text-zinc-500 leading-relaxed pt-2 border-t border-zinc-150">
            Please log in from a laptop or desktop computer to take this exam.
          </p>
        </div>
      </div>
    );
  }

  return (
    <FloatingPathsBackground position={-1} className="min-h-screen bg-zinc-100 flex items-center justify-center p-4 md:p-6 font-sans text-zinc-900 overflow-hidden relative">
      <div className="w-full max-w-5xl flex flex-col md:flex-row shadow-md border border-zinc-200/80 bg-white relative z-10 rounded-2xl overflow-hidden">

        {/* Left Info Panel */}
        <div className="bg-zinc-50/80 p-8 md:p-12 md:w-1/2 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-200/80">
          <div className="space-y-6">
            <div className="flex items-center -ml-1">
              <img
                src="https://ik.imagekit.io/dypkhqxip/redlix%20new?updatedAt=1781042212493"
                alt="Redlix Logo"
                className="h-12 md:h-14 w-auto object-contain object-left shrink-0"
              />
            </div>

            <div className="space-y-2 mt-4">
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-900 font-inter font-['Inter',sans-serif]">
                Candidate Exam Portal
              </h1>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Enter your full name and hall ticket number to access your assigned examination.
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <iframe
                src="https://lottie.host/embed/e9948351-dd15-427f-bde1-b547486d6c83/atd20DWZjT.lottie"
                style={{ width: "280px", height: "280px", border: "none", overflow: "hidden" }}
                title="Candidate Proctored Exam Animation"
              />
            </div>
          </div>

          <p className="text-xs text-zinc-500 mt-6">
            Facing issues? Contact <span className="text-[#E61E32] font-semibold underline underline-offset-2 decoration-[#E61E32] cursor-pointer">Exam Administration</span>.
          </p>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center bg-white min-h-[400px]">

          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center text-center gap-6">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-t-[#E61E32] border-r-zinc-200 border-b-zinc-200 border-l-zinc-200 animate-spin" />
              </div>
              <p className="text-zinc-700 font-medium text-sm">{loadingMsg}</p>
            </div>
          ) : isJoinWithCode ? (
            <div className="w-full max-w-sm mx-auto">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-zinc-900 font-inter">Join with Code</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Quick candidate registration &amp; hall ticket entry</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsJoinWithCode(false)}
                  className="text-xs text-[#E61E32] hover:underline font-semibold cursor-pointer flex items-center gap-1"
                >
                  ← Sign In
                </button>
              </div>

              {quickError && (
                <div className="p-3 bg-red-50 border border-red-200/80 rounded-xl text-red-800 text-xs font-semibold flex items-center gap-2 mb-4">
                  <span className="material-symbols-rounded text-sm shrink-0">error</span>
                  <span>{quickError}</span>
                </div>
              )}

              <form onSubmit={handleQuickJoinSubmit} className="flex flex-col gap-3.5" noValidate>
                <div>
                  <label htmlFor="quick-exam-select" className="block text-xs font-medium text-zinc-700 mb-1">
                    Select Examination / Paper *
                  </label>
                  <select
                    id="quick-exam-select"
                    value={quickExamCode}
                    onChange={(e) => setQuickExamCode(e.target.value)}
                    className="w-full text-xs py-2.5 px-3 border border-zinc-200 rounded-lg bg-white font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#E61E32]/20 focus:border-[#E61E32]"
                  >
                    {availableExams.map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name} ({ex.company_name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="quick-photo-input" className="block text-xs font-medium text-zinc-700 mb-1">
                    Candidate Verification Photo *
                  </label>
                  <div className="flex items-center gap-3 p-2.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                    <div className="w-10 h-12 bg-white border border-zinc-200 rounded-md overflow-hidden shrink-0 flex items-center justify-center relative shadow-xs">
                      {quickPhoto ? (
                        <img src={quickPhoto} alt="Photo Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] text-zinc-400 font-medium">Photo</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <input
                        id="quick-photo-input"
                        type="file"
                        accept="image/*"
                        onChange={handleQuickPhotoUpload}
                        className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border file:border-zinc-200 file:text-[11px] file:font-semibold file:bg-white file:text-zinc-800 hover:file:bg-zinc-100 cursor-pointer w-full"
                      />
                      <p className="text-[10px] text-zinc-400">Passport photo (Max 2MB)</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="quick-name" className="block text-xs font-medium text-zinc-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    id="quick-name"
                    type="text"
                    required
                    placeholder="e.g. Jean Doe"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    className="w-full text-xs py-2.5 px-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E61E32]/20 focus:border-[#E61E32] font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="quick-email" className="block text-xs font-medium text-zinc-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    id="quick-email"
                    type="email"
                    required
                    placeholder="e.g. jean.doe@edu.in"
                    value={quickEmail}
                    onChange={(e) => setQuickEmail(e.target.value)}
                    className="w-full text-xs py-2.5 px-3 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E61E32]/20 focus:border-[#E61E32] font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isQuickSubmitting}
                  className="group w-full bg-[#E61E32] hover:bg-[#d01729] active:bg-[#b81223] text-white font-semibold py-2.5 px-4 rounded-lg transition-all cursor-pointer mt-2 text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  {isQuickSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent border-white animate-spin" />
                      <span>Generating Hall Ticket &amp; Joining...</span>
                    </>
                  ) : (
                    <>
                      <span>Join &amp; Start Exam</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="w-full max-w-sm mx-auto">
              <div className="mb-6">
                <h2 className="text-xl font-semibold tracking-tight text-zinc-900 font-inter font-['Inter',sans-serif]">Sign In to Exam</h2>
                <p className="text-xs text-zinc-500 mt-1">Find your hall ticket number on your admit card.</p>
              </div>

              <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>

                <div>
                  <label htmlFor="candidate-name" className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Full Name
                  </label>
                  <SmoothInput
                    id="candidate-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => { setName(e.target.value); if (nameError) setNameError(""); }}
                    error={!!nameError}
                    autoComplete="name"
                  />
                  {nameError && (
                    <p className="text-[#E61E32] text-xs mt-1 font-medium">{nameError}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="hall-ticket" className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Hall Ticket Number
                  </label>
                  <SmoothInput
                    id="hall-ticket"
                    type="text"
                    placeholder="e.g. 26AI123456"
                    value={hallTicket}
                    onChange={(e) => { setHallTicket(e.target.value.toUpperCase()); if (htError) setHtError(""); }}
                    error={!!htError}
                    className="font-mono tracking-widest"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {htError && (
                    <p className="text-[#E61E32] text-xs mt-1 font-medium">{htError}</p>
                  )}
                </div>

                <div className="pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => {
                        setAcceptedTerms(e.target.checked);
                        if (termsError) setTermsError("");
                      }}
                      className="w-4 h-4 rounded border-zinc-300 text-[#E61E32] focus:ring-[#E61E32] accent-[#E61E32] cursor-pointer shrink-0"
                    />
                    <span className="text-xs text-zinc-600 leading-tight">
                      I accept the <span className="text-[#E61E32] font-semibold underline underline-offset-2 decoration-[#E61E32]">terms and conditions</span>
                    </span>
                  </label>
                  {termsError && (
                    <p className="text-[#E61E32] text-xs mt-1 font-medium">{termsError}</p>
                  )}
                </div>



                <button
                  type="submit"
                  className="group w-full bg-[#E61E32] hover:bg-[#d01729] active:bg-[#b81223] text-white font-semibold py-2.5 px-4 rounded-lg transition-all cursor-pointer mt-2 shadow-sm text-sm flex items-center justify-center gap-2"
                >
                  <span>Start Exam</span>
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.2}
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </button>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs mt-1">
                  <span className="text-zinc-500 font-medium">Don&apos;t have a Hall Ticket?</span>
                  <button
                    type="button"
                    onClick={() => setIsJoinWithCode(true)}
                    className="text-[#E61E32] font-bold hover:underline cursor-pointer flex items-center gap-1 bg-red-50 hover:bg-red-100 border border-red-200/80 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-rounded text-sm">key</span>
                    <span>Join with Code</span>
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

export default function ExamLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-t-orange-500 border-r-zinc-200 border-b-zinc-200 border-l-zinc-200 animate-spin" />
      </div>
    }>
      <ExamLoginContent />
    </Suspense>
  );
}

