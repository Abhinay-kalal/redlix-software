"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Lock, 
  Mail, 
  User, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  PlusCircle, 
  KeyRound 
} from "lucide-react";
import { OtpInput } from "@/components/ui/otp-input";

export default function OrganizerAuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup form state (3-step OTP flow)
  const [signupStep, setSignupStep] = useState<"email" | "otp" | "profile">("email");
  const [signupEmail, setSignupEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [organization, setOrganization] = useState("");

  const [sendOtpLoading, setSendOtpLoading] = useState(false);
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Handle Login Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/organizer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const json = await res.json();
      if (json.success) {
        router.push(json.redirectUrl || "/admin/hackathons");
      } else {
        setErrorMsg(json.error || "Failed to sign in. Check your credentials.");
      }
    } catch {
      setErrorMsg("Network error occurred. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Step 1: Send OTP to Email via Resend
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail.trim()) return;

    setErrorMsg("");
    setSuccessMsg("");
    setSendOtpLoading(true);

    try {
      const res = await fetch("/api/organizer/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupEmail.trim() }),
      });
      const json = await res.json();

      if (json.success) {
        setSuccessMsg(`Verification OTP sent to ${signupEmail.trim()}`);
        setSignupStep("otp");
      } else {
        setErrorMsg(json.error || "Failed to send OTP to email.");
      }
    } catch {
      setErrorMsg("Network error occurred. Failed to send OTP.");
    } finally {
      setSendOtpLoading(false);
    }
  };

  // Step 2: Verify Entered 6-Digit OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) return;

    setErrorMsg("");
    setSuccessMsg("");
    setVerifyOtpLoading(true);

    try {
      const res = await fetch("/api/organizer/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupEmail.trim(), otp: otpCode.trim() }),
      });
      const json = await res.json();

      if (json.success) {
        setSuccessMsg("Email verified! Enter name & password to complete account.");
        setSignupStep("profile");
      } else {
        setErrorMsg(json.error || "Invalid or expired OTP code.");
      }
    } catch {
      setErrorMsg("Network error occurred during verification.");
    } finally {
      setVerifyOtpLoading(false);
    }
  };

  // Step 3: Complete Organizer Registration & Redirect
  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !password.trim()) return;

    setErrorMsg("");
    setSignupLoading(true);

    try {
      const res = await fetch("/api/organizer/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: signupEmail.trim(),
          password: password.trim(),
          organization: organization.trim(),
          otp: otpCode.trim(),
        }),
      });
      const json = await res.json();

      if (json.success) {
        router.push(json.redirectUrl || "/admin/hackathons");
      } else {
        setErrorMsg(json.error || "Failed to create organizer account.");
      }
    } catch {
      setErrorMsg("Network error occurred. Please try again.");
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 font-sans text-zinc-900 flex flex-col justify-between">
      
      {/* TOP RED NAVBAR HEADER */}
      <header className="sticky top-0 z-50 bg-[#E61E32] border-b border-[#d01729] py-2.5 px-6 md:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/hackathons" className="flex items-center gap-3">
            <img
              src="https://ik.imagekit.io/dypkhqxip/redlix%20new?updatedAt=1781042212493"
              alt="Redlix Logo"
              className="h-7 md:h-7.5 w-auto object-contain shrink-0 brightness-0 invert"
            />
            <div className="flex items-center gap-2 border-l border-white/20 pl-3">
              <span className="font-semibold text-xs text-white font-inter">Organizer Portal</span>
            </div>
          </Link>

          <Link
            href="/hackathons"
            className="text-xs font-semibold text-white/90 hover:text-white transition-colors"
          >
            ← Back to Hackathons
          </Link>
        </div>
      </header>

      {/* COMPACT MAIN FORM CONTENT */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-6 my-auto">
        <div className="w-full max-w-3xl flex flex-col md:flex-row shadow-md border border-zinc-200 bg-white rounded-md overflow-hidden">
          
          {/* Left Side Banner */}
          <div className="bg-zinc-50 p-6 md:p-8 md:w-5/12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-200">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-red-50 border border-red-100 rounded-md text-[10px] font-bold text-[#E61E32] uppercase tracking-wider">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Host Sprint</span>
              </div>
              
              <h1 className="text-xl font-bold text-zinc-900 tracking-tight font-inter leading-snug">
                {mode === "login" ? "Organizer Sign In" : "Host Registration"}
              </h1>
              
              <p className="text-xs text-zinc-500 font-normal leading-relaxed">
                {mode === "login" 
                  ? "Sign in with your email & password to manage hackathon challenges." 
                  : "Verify your email with OTP to register as a hackathon organizer."}
              </p>

              <div className="flex justify-center pt-1">
                <iframe
                  src="https://lottie.host/embed/e9948351-dd15-427f-bde1-b547486d6c83/atd20DWZjT.lottie"
                  style={{ width: "160px", height: "160px", border: "none", overflow: "hidden" }}
                  title="Organizer Animation"
                />
              </div>
            </div>

            <p className="text-[10px] text-zinc-400 font-normal border-t border-zinc-200/80 pt-3">
              Official Redlix Hackathon Platform Registry
            </p>
          </div>

          {/* Right Side Compact Form */}
          <div className="p-6 md:p-8 md:w-7/12 flex flex-col justify-center bg-white">
            
            {/* Feedback Banners */}
            {errorMsg && (
              <div className="p-2.5 mb-4 bg-red-50 border border-red-200 text-[#E61E32] text-xs font-medium rounded-md">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-2.5 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-md flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            {mode === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
                    Email address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="organizer@university.edu"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="text-xs w-full py-2 pl-9 pr-3 border border-zinc-300 rounded-md bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#E61E32] focus:ring-1 focus:ring-[#E61E32] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="text-xs w-full py-2 pl-9 pr-3 border border-zinc-300 rounded-md bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#E61E32] focus:ring-1 focus:ring-[#E61E32] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-2.5 bg-[#E61E32] hover:bg-[#d01729] disabled:bg-red-300 text-white font-bold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs mt-1"
                >
                  {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  <span>Sign In to Dashboard</span>
                </button>

                {/* Sub-text Link: Not Having Account */}
                <div className="text-center pt-2 border-t border-zinc-100">
                  <p className="text-xs text-zinc-500 font-normal">
                    Not having an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signup");
                        setSignupStep("email");
                        setErrorMsg("");
                        setSuccessMsg("");
                      }}
                      className="text-[#E61E32] font-semibold hover:underline cursor-pointer ml-1"
                    >
                      Create Host Account
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* SIGN UP FORM (3-STEP OTP FLOW) */}
            {mode === "signup" && (
              <div className="space-y-4">
                
                {/* STEP 1: Enter Email & Send OTP */}
                {signupStep === "email" && (
                  <form onSubmit={handleSendOtp} className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
                        Work / Official Email
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input
                          type="email"
                          required
                          placeholder="organizer@university.edu"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className="text-xs w-full py-2 pl-9 pr-3 border border-zinc-300 rounded-md bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#E61E32] focus:ring-1 focus:ring-[#E61E32] transition-all"
                        />
                      </div>
                      <p className="text-[10px] text-zinc-500 font-normal">
                        A 6-digit verification code will be sent via Resend API.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={sendOtpLoading}
                      className="w-full py-2.5 bg-[#E61E32] hover:bg-[#d01729] disabled:bg-red-300 text-white font-bold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                    >
                      {sendOtpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      <span>Send Verification OTP</span>
                    </button>
                  </form>
                )}

                {/* STEP 2: Enter & Verify 6-Digit OTP */}
                {signupStep === "otp" && (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-2 flex flex-col items-center">
                      <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider text-center">
                        Enter 6-Digit Verification Code
                      </label>
                      
                      <OtpInput
                        length={6}
                        mode="numeric"
                        defaultValue={otpCode}
                        autoFocus
                        onChange={(val) => setOtpCode(val)}
                        onComplete={(val) => setOtpCode(val)}
                        label="Organizer Verification Code"
                        hint="Check your inbox for the OTP code"
                      />

                      <div className="flex justify-between items-center w-full text-[10px] text-zinc-500 pt-1">
                        <span>Didn't receive email?</span>
                        <button
                          type="button"
                          onClick={() => setSignupStep("email")}
                          className="text-[#E61E32] hover:underline cursor-pointer font-semibold"
                        >
                          Change Email
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={verifyOtpLoading}
                      className="w-full py-2.5 bg-[#E61E32] hover:bg-[#d01729] disabled:bg-red-300 text-white font-bold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                    >
                      {verifyOtpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      <span>Verify OTP Code</span>
                    </button>
                  </form>
                )}

                {/* STEP 3: Enter Full Name, Password & Organization */}
                {signupStep === "profile" && (
                  <form onSubmit={handleCompleteSignup} className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
                        Full Name
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                          <User className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Alex Mercer"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="text-xs w-full py-2 pl-9 pr-3 border border-zinc-300 rounded-md bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#E61E32] focus:ring-1 focus:ring-[#E61E32] transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
                        Organization / College Name
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                          <Building2 className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          placeholder="e.g. MIT Tech Club"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          className="text-xs w-full py-2 pl-9 pr-3 border border-zinc-300 rounded-md bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#E61E32] focus:ring-1 focus:ring-[#E61E32] transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
                        Account Password
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input
                          type="password"
                          required
                          placeholder="••••••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="text-xs w-full py-2 pl-9 pr-3 border border-zinc-300 rounded-md bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#E61E32] focus:ring-1 focus:ring-[#E61E32] transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={signupLoading}
                      className="w-full py-2.5 bg-[#E61E32] hover:bg-[#d01729] disabled:bg-red-300 text-white font-bold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                    >
                      {signupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      <span>Create Account &amp; Launch</span>
                    </button>
                  </form>
                )}

                {/* Sub-text Link: Already Have Account */}
                <div className="text-center pt-2 border-t border-zinc-100">
                  <p className="text-xs text-zinc-500 font-normal">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        setErrorMsg("");
                        setSuccessMsg("");
                      }}
                      className="text-[#E61E32] font-semibold hover:underline cursor-pointer ml-1"
                    >
                      Sign In
                    </button>
                  </p>
                </div>

              </div>
            )}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-zinc-400 font-medium py-3 border-t border-zinc-200 bg-white">
        © 2026 Redlix Secure. Hackathon Organizer Portal. All rights reserved.
      </footer>
    </div>
  );
}
