"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FloatingPathsBackground } from "@/components/ui/floating-paths";
import { Turnstile } from "@/components/ui/turnstile";
import { getVisitorId } from "@/utils/fingerprint";

function ExamLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const examIdParam = searchParams.get("examId");

  const [name, setName] = useState("");
  const [hallTicket, setHallTicket] = useState("");
  const [nameError, setNameError] = useState("");
  const [htError, setHtError] = useState("");
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
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-6 text-white font-sans selection:bg-orange-500 selection:text-white">
        <div className="max-w-md w-full border border-zinc-800 bg-zinc-950 p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
          {/* Top glowing accent line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 animate-pulse" />

          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center animate-bounce">
              <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">Desktop Access Only</h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              This examination environment requires professional AI proctoring features that are unsupported on handheld or mobile systems.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800/80 p-4 space-y-3 text-left">
            <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider">Restricted Devices:</p>
            <ul className="text-xs text-zinc-400 space-y-1.5 list-disc pl-4">
              <li>Mobile Smart Phones (iOS, Android, etc.)</li>
              <li>Handheld Tablet Devices (iPad, Galaxy Tab, Kindle, etc.)</li>
              <li>Devices with screens smaller than 1024px</li>
            </ul>
          </div>

          <div className="pt-2">
            <p className="text-xs text-zinc-500 leading-relaxed">
              Please switch to a laptop or desktop computer to register and start your examination session.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FloatingPathsBackground position={-1} className="min-h-screen bg-zinc-100 flex items-center justify-center p-4 font-sans text-zinc-900 overflow-hidden">
      <div className="w-full max-w-4xl flex flex-col md:flex-row shadow-lg border border-zinc-200 bg-white relative z-10">

        <div className="bg-zinc-50 p-8 md:p-12 md:w-1/2 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-200">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <img
                src="https://ik.imagekit.io/dypkhqxip/logo.png?updatedAt=1777320313623"
                alt="Redlix Secure Logo"
                className="w-8 h-8 object-contain shrink-0"
              />
              <span className="font-bold text-sm tracking-wide text-zinc-800">Redlix Secure</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-medium leading-snug tracking-tight mt-6 text-zinc-900">
              Candidate Exam Portal
            </h1>
            <p className="text-zinc-500 text-sm max-w-xs leading-relaxed">
              Enter your registered name and hall ticket number to access your assigned examination.
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

        <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center bg-white min-h-[400px]">

          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center text-center gap-6">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-t-orange-500 border-r-zinc-200 border-b-zinc-200 border-l-zinc-200 animate-spin" />
              </div>
              <p className="text-zinc-700 font-medium text-sm">{loadingMsg}</p>
            </div>
          ) : (
            <div className="w-full max-w-sm mx-auto">
              <div className="mb-6">
                <h2 className="text-xl font-medium tracking-tight text-zinc-900">Sign In to Exam</h2>
                <p className="text-xs text-zinc-500 mt-1">Your credentials are on your hall ticket / admit card</p>
              </div>

              <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>

                <div>
                  <label htmlFor="candidate-name" className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="candidate-name"
                    type="text"
                    placeholder="As registered (e.g. Jean Doe)"
                    value={name}
                    onChange={(e) => { setName(e.target.value); if (nameError) setNameError(""); }}
                    className={`text-sm w-full py-2 px-3 border rounded-none bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                      nameError ? "border-red-500 focus:ring-red-500" : "border-zinc-300 focus:border-orange-500"
                    } transition-all`}
                    autoComplete="name"
                  />
                  {nameError && (
                    <p className="text-red-500 text-xs mt-1">{nameError}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="hall-ticket" className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Hall Ticket Number
                  </label>
                  <input
                    id="hall-ticket"
                    type="text"
                    placeholder="e.g. 26AI123456"
                    value={hallTicket}
                    onChange={(e) => { setHallTicket(e.target.value.toUpperCase()); if (htError) setHtError(""); }}
                    className={`text-sm w-full py-2 px-3 border rounded-none bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono tracking-widest ${
                      htError ? "border-red-500 focus:ring-red-500" : "border-zinc-300 focus:border-orange-500"
                    } transition-all`}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {htError && (
                    <p className="text-red-500 text-xs mt-1">{htError}</p>
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
                  <p className="text-red-500 text-xs mt-1">{securityError}</p>
                )}

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-4 rounded-none transition-colors cursor-pointer mt-2 shadow-sm text-sm"
                >
                  Enter Exam →
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

