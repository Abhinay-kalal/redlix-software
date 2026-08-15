"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";

function SprintJoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "";
  
  const [statusMsg, setStatusMsg] = useState("Checking credentials...");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!code) {
      setErrorMsg("Missing room join code. Please scan a valid QR code.");
      return;
    }

    const joinRoom = async () => {
      // 1. Check client-side authentication
      const isAuth = localStorage.getItem("candidate_authenticated") === "true";
      const candidateEmail = localStorage.getItem("candidate_email") || "";

      if (!isAuth || !candidateEmail) {
        setStatusMsg("Redirecting to event portal...");
        const target = `/sprints/auth?code=${code}`;
        router.push(target);
        return;
      }

      try {
        setStatusMsg("Validating sprint room...");
        // 2. Fetch sprint details to confirm it exists
        const statusRes = await fetch(`/api/sprints/status?code=${code}`);
        const statusData = await statusRes.json();
        if (!statusData.success) {
          setErrorMsg(statusData.error || "Failed to find active sprint room.");
          return;
        }

        const sprint = statusData.data;

        // 3. Register candidate in the lobby
        setStatusMsg("Joining room lobby...");
        const registerRes = await fetch("/api/sprints/participants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sprintId: sprint.id,
            name: localStorage.getItem("candidate_name") || "Candidate",
            email: candidateEmail
          })
        });

        const registerData = await registerRes.json();
        if (!registerData.success) {
          setErrorMsg(registerData.error || "Failed to enter waiting room.");
          return;
        }

        // 4. Redirect to candidate waiting room
        setStatusMsg("Entering waiting room...");
        router.push(`/sprints/waiting?code=${code}`);
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to connect to the server. Please try again.");
      }
    };

    joinRoom();
  }, [code, router]);

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4">
        <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-md max-w-sm w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-50 text-[#E61E32] flex items-center justify-center mx-auto border border-red-100">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-zinc-900 uppercase">Join Failed</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">{errorMsg}</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-[#E61E32] hover:bg-[#d01729] text-white text-xs font-bold py-2 rounded-lg"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center p-4">
      <div className="space-y-4 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#E61E32] mx-auto" />
        <div className="space-y-1">
          <h3 className="text-xs font-extrabold text-zinc-900 uppercase tracking-widest">Sprint Controller</h3>
          <p className="text-xs text-zinc-500 font-medium">{statusMsg}</p>
        </div>
      </div>
    </div>
  );
}

export default function SprintJoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#E61E32]" />
      </div>
    }>
      <SprintJoinContent />
    </Suspense>
  );
}
