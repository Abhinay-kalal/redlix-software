"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FloatingPathsBackground } from "@/components/ui/floating-paths";
import { Turnstile } from "@/components/ui/turnstile";
import { SmoothInput } from "@/components/ui/smooth-input";
import { getVisitorId } from "@/utils/fingerprint";
import Script from "next/script";

function ExamLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

    if (!turnstileToken) {
      setSecurityError("Please complete the security check.");
      valid = false;
    } else {
      setSecurityError("");
    }

    if (!valid) return;

    setIsLoading(true);
    setLoadingMsg(loadingSteps[0]);

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
        setSecurityError("Security verification failed. Please try again.");
        setIsLoading(false);
        return;
      }
    } catch {
      setSecurityError("Failed to verify security token. Please try again.");
      setIsLoading(false);
      return;
    }

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

                <Turnstile
                  onSuccess={(token) => {
                    setTurnstileToken(token);
                    setSecurityError("");
                  }}
                  onError={() => setSecurityError("Security verification encountered an error.")}
                  onExpire={() => setTurnstileToken("")}
                />
                {securityError && (
                  <p className="text-[#E61E32] text-xs mt-1 font-medium">{securityError}</p>
                )}

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

