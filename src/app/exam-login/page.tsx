"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { FloatingPathsBackground } from "@/components/ui/floating-paths";
import { Turnstile } from "@/components/ui/turnstile";
import { getVisitorId } from "@/utils/fingerprint";

function ExamLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

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

  // Eagerly collect fingerprint in the background so it's ready when the form submits
  useEffect(() => {
    getVisitorId()
      .then((id) => { visitorIdRef.current = id; })
      .catch(() => { /* non-fatal */ });
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
      const { data: reg, error: regError } = await supabase
        .from("registrations")
        .select("id, candidate_name, exam_id, photo_url, registration_number, hall_ticket_number")
        .ilike("hall_ticket_number", hallTicket.trim())
        .single();

      if (regError || !reg) {
        setHtError("Hall ticket number not found. Please check and try again.");
        setIsLoading(false);
        return;
      }

      if (reg.candidate_name.toLowerCase().trim() !== name.toLowerCase().trim()) {
        setNameError("Name does not match our records for this hall ticket.");
        setIsLoading(false);
        return;
      }

      const { data: exam, error: examError } = await supabase
        .from("exams")
        .select("id, name, company_name, company_logo, date, time, description, total_qns, types_of_qns")
        .eq("id", reg.exam_id)
        .single();

      if (examError || !exam) {
        setHtError("Could not fetch exam details. Please contact the exam administrator.");
        setIsLoading(false);
        return;
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
            hallTicketNumber: reg.hall_ticket_number,
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
          candidateName: reg.candidate_name,
          hallTicketNumber: reg.hall_ticket_number,
          registrationNumber: reg.registration_number,
          photoUrl: reg.photo_url,
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

