"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AutoRegisterPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!id) return;

    const processRegistration = async () => {
      // 1. Check if logged in
      if (!document.cookie.includes("candidate_logged_in=true")) {
        router.push(`/candidate-signup?redirect=/hackathons/${id}/register`);
        return;
      }

      // 2. Auto register the user
      try {
        // We simulate individual registration by creating a solo team
        // with the candidate's own email/name
        const candidateName = localStorage.getItem("candidate_name") || "Solo Participant";
        
        const res = await fetch("/api/teams", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `${candidateName}'s Registration`,
            hackathonId: id,
          }),
        });

        const json = await res.json();
        if (json.success || json.error === "You have already registered a team for this hackathon.") {
          setStatus("success");
          setTimeout(() => {
            router.push("/candidate-dashboard");
          }, 1500);
        } else {
          setStatus("error");
          setErrorMsg(json.error || "Failed to process registration.");
        }
      } catch (err) {
        setStatus("error");
        setErrorMsg("Network error occurred.");
      }
    };

    processRegistration();
  }, [id, router]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center font-sans p-6">
      {status === "loading" && (
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-[#E61E32] animate-spin" />
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">Enrolling you...</h2>
          <p className="text-sm text-zinc-500">Please wait while we secure your spot.</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center space-y-4 text-center bg-white p-8 rounded-2xl shadow-xl border border-zinc-100 max-w-sm w-full">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">Successfully Registered!</h2>
          <p className="text-sm text-zinc-500">Redirecting to your dashboard...</p>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center space-y-4 text-center bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-sm w-full">
          <div className="w-16 h-16 bg-red-50 text-[#E61E32] rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">Registration Failed</h2>
          <p className="text-sm text-zinc-500">{errorMsg}</p>
          <Link
            href={`/hackathons/${id}`}
            className="mt-4 px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
          >
            Go Back
          </Link>
        </div>
      )}
    </div>
  );
}
