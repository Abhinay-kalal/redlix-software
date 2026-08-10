"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SmoothInput } from "@/components/ui/smooth-input";
import { OtpInput } from "@/components/ui/otp-input";
import { 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  Mail, 
  ArrowRight 
} from "lucide-react";

export default function OrganizerLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");

  // Sign In State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginEmailError, setLoginEmailError] = useState("");
  const [loginPasswordError, setLoginPasswordError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Sign Up (Resend OTP Flow) State
  const [signupStep, setSignupStep] = useState<"email" | "otp" | "profile">("email");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupEmailError, setSignupEmailError] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [organization, setOrganization] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadingMessages = [
    "Verifying organizer credentials...",
    "Authorizing session token...",
    "Redirecting to organizer dashboard..."
  ];

  // Handle Login Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    if (!loginEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail.trim())) {
      setLoginEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setLoginEmailError("");
    }

    if (!loginPassword) {
      setLoginPasswordError("Password is required.");
      valid = false;
    } else {
      setLoginPasswordError("");
    }

    if (!valid) return;

    setIsLoading(true);
    setLoadingStep(0);
    setErrorMsg("");

    try {
      const res = await fetch("/api/organizer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setLoadingStep(1);
        setTimeout(() => setLoadingStep(2), 500);
        setTimeout(() => {
          router.push(json.redirectUrl || "/admin/hackathons");
        }, 1000);
      } else {
        setIsLoading(false);
        setErrorMsg(json.error || "Incorrect email or password.");
      }
    } catch {
      setIsLoading(false);
      setErrorMsg("Failed to connect to authentication server.");
    }
  };

  // Step 1: Send Verification OTP via Resend
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail.trim())) {
      setSignupEmailError("Please enter a valid email address.");
      return;
    }

    setSignupEmailError("");
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/organizer/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupEmail.trim() }),
      });
      const json = await res.json();

      setIsLoading(false);
      if (json.success) {
        setSuccessMsg(`Verification OTP sent to ${signupEmail.trim()}`);
        setSignupStep("otp");
      } else {
        setErrorMsg(json.error || "Failed to send OTP to email.");
      }
    } catch {
      setIsLoading(false);
      setErrorMsg("Network error. Failed to send OTP.");
    }
  };

  // Step 2: Verify Entered OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 6) {
      setErrorMsg("Please enter the 6-digit OTP code.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/organizer/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupEmail.trim(), otp: otpCode.trim() }),
      });
      const json = await res.json();

      setIsLoading(false);
      if (json.success) {
        setSuccessMsg("Email verified! Complete account details to launch.");
        setSignupStep("profile");
      } else {
        setErrorMsg(json.error || "Invalid or expired OTP code.");
      }
    } catch {
      setIsLoading(false);
      setErrorMsg("Network error occurred during verification.");
    }
  };

  // Step 3: Complete Organizer Registration
  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !password) return;

    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/organizer/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: signupEmail.trim(),
          password,
          organization: organization.trim(),
          otp: otpCode.trim(),
        }),
      });
      const json = await res.json();

      if (json.success) {
        setTimeout(() => {
          router.push(json.redirectUrl || "/admin/hackathons");
        }, 600);
      } else {
        setIsLoading(false);
        setErrorMsg(json.error || "Failed to create organizer account.");
      }
    } catch {
      setIsLoading(false);
      setErrorMsg("Network error occurred.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4 md:p-6 font-sans text-zinc-900 relative overflow-hidden">
      
      {/* Right half window solid red background circle (Exact Admin Page styling) */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 h-full flex items-center justify-center pointer-events-none overflow-hidden z-0">
        <div className="w-[1400px] h-[1400px] md:w-[1600px] md:h-[1600px] rounded-full bg-[#E61E32] opacity-35 translate-x-1/3 shrink-0" />
      </div>

      {/* Main Two-Column Card Container (Exact Admin Page styling) */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row shadow-md border border-zinc-200/80 bg-white relative z-10 rounded-2xl overflow-hidden">
        
        {/* Left Info Panel */}
        <div className="bg-zinc-50/80 p-8 md:p-12 md:w-1/2 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-200/80">
          <div className="space-y-6">
            <Link href="/hackathons" className="flex items-center -ml-1">
              <img
                src="https://ik.imagekit.io/dypkhqxip/redlix%20new?updatedAt=1781042212493"
                alt="Redlix Logo"
                className="h-12 md:h-14 w-auto object-contain object-left shrink-0"
              />
            </Link>

            <div className="space-y-2 mt-4">
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-900 font-inter">
                {mode === "login" ? "Organizer Console" : "Host Registration"}
              </h1>
              <p className="text-zinc-600 text-sm leading-relaxed">
                {mode === "login"
                  ? "Sign in to manage hackathons, evaluate submissions, and configure team parameters."
                  : "Verify your email via OTP to create a verified Host account for running hackathons."}
              </p>
            </div>
          </div>

          <div className="space-y-2 mt-6">
            <Link
              href="/hackathons"
              className="text-xs text-[#E61E32] font-semibold hover:underline inline-flex items-center gap-1"
            >
              ← Back to Public Hackathons Catalog
            </Link>
            <p className="text-xs text-zinc-500">
              Need assistance? Contact <span className="text-[#E61E32] font-semibold underline underline-offset-2 cursor-pointer">System Administration</span>.
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center bg-white min-h-[420px]">
          
          {isLoading ? (
            /* Loading State Animation */
            <div className="py-8 flex flex-col items-center justify-center text-center gap-6">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-t-[#E61E32] border-r-zinc-200 border-b-zinc-200 border-l-zinc-200 animate-spin" />
              </div>
              <p className="text-zinc-700 font-medium text-sm transition-all duration-300">
                {loadingMessages[loadingStep] || "Processing..."}
              </p>
            </div>
          ) : (
            <div className="w-full max-w-sm mx-auto">
              
              {/* Form Title & Subtitle */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold tracking-tight text-zinc-900 font-inter">
                  {mode === "login" ? "Organizer Sign In" : "Host Account Sign Up"}
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  {mode === "login" 
                    ? "Enter your organizer credentials to access the console." 
                    : "Complete 3-step verification to register as a hackathon host."}
                </p>
              </div>

              {/* Banners */}
              {errorMsg && (
                <div className="p-3 mb-4 bg-red-50 border border-red-200 text-[#E61E32] text-xs font-medium rounded-lg">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* MODE 1: ORGANIZER SIGN IN */}
              {mode === "login" && (
                <form className="flex flex-col gap-4" onSubmit={handleLoginSubmit} noValidate>
                  <div>
                    <label htmlFor="login-email" className="block text-xs font-medium text-zinc-700 mb-1.5">
                      Email Address
                    </label>
                    <SmoothInput
                      id="login-email"
                      type="email"
                      placeholder="organizer@university.edu"
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value);
                        if (loginEmailError) setLoginEmailError("");
                      }}
                      error={!!loginEmailError}
                      autoComplete="email"
                    />
                    {loginEmailError && (
                      <p className="text-[#E61E32] text-xs mt-1 font-medium">{loginEmailError}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="login-password" className="block text-xs font-medium text-zinc-700 mb-1.5">
                      Password
                    </label>
                    <SmoothInput
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (loginPasswordError) setLoginPasswordError("");
                      }}
                      error={!!loginPasswordError}
                      autoComplete="current-password"
                    />
                    {loginPasswordError && (
                      <p className="text-[#E61E32] text-xs mt-1 font-medium">{loginPasswordError}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me-org"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-300 text-[#E61E32] focus:ring-[#E61E32] accent-[#E61E32] cursor-pointer"
                      />
                      <label htmlFor="remember-me-org" className="ml-2 block text-xs text-zinc-600 cursor-pointer select-none">
                        Remember this device
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="group w-full bg-[#E61E32] hover:bg-[#d01729] active:bg-[#b81223] text-white font-semibold py-2.5 px-4 rounded-lg transition-all cursor-pointer mt-2 shadow-sm text-sm flex items-center justify-center gap-2"
                  >
                    <span>Sign In to Console</span>
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

                  <div className="text-center pt-3 border-t border-zinc-200/80 mt-2">
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

              {/* MODE 2: ORGANIZER SIGN UP (3-STEP OTP FLOW) */}
              {mode === "signup" && (
                <div className="space-y-4">
                  
                  {/* STEP 1: Email Input */}
                  {signupStep === "email" && (
                    <form onSubmit={handleSendOtp} className="flex flex-col gap-4" noValidate>
                      <div>
                        <label htmlFor="signup-email" className="block text-xs font-medium text-zinc-700 mb-1.5">
                          Work / Official Email Address
                        </label>
                        <SmoothInput
                          id="signup-email"
                          type="email"
                          placeholder="organizer@university.edu"
                          value={signupEmail}
                          onChange={(e) => {
                            setSignupEmail(e.target.value);
                            if (signupEmailError) setSignupEmailError("");
                          }}
                          error={!!signupEmailError}
                          autoComplete="email"
                        />
                        {signupEmailError ? (
                          <p className="text-[#E61E32] text-xs mt-1 font-medium">{signupEmailError}</p>
                        ) : (
                          <p className="text-[11px] text-zinc-400 mt-1">A 6-digit OTP code will be sent via Resend API.</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="group w-full bg-[#E61E32] hover:bg-[#d01729] active:bg-[#b81223] text-white font-semibold py-2.5 px-4 rounded-lg transition-all cursor-pointer mt-1 shadow-sm text-sm flex items-center justify-center gap-2"
                      >
                        <span>Send Verification OTP</span>
                        <Mail className="w-4 h-4" />
                      </button>
                    </form>
                  )}

                  {/* STEP 2: 6-Digit OTP */}
                  {signupStep === "otp" && (
                    <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4" noValidate>
                      <div className="space-y-2 flex flex-col items-center">
                        <label className="block text-xs font-medium text-zinc-700 text-center">
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
                        />

                        <div className="flex justify-between items-center w-full text-[11px] text-zinc-500 pt-1">
                          <span>Check inbox or spam folder</span>
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
                        className="group w-full bg-[#E61E32] hover:bg-[#d01729] active:bg-[#b81223] text-white font-semibold py-2.5 px-4 rounded-lg transition-all cursor-pointer shadow-sm text-sm flex items-center justify-center gap-2"
                      >
                        <span>Verify OTP Code</span>
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    </form>
                  )}

                  {/* STEP 3: Complete Profile */}
                  {signupStep === "profile" && (
                    <form onSubmit={handleCompleteSignup} className="flex flex-col gap-4" noValidate>
                      <div>
                        <label htmlFor="full-name" className="block text-xs font-medium text-zinc-700 mb-1.5">
                          Full Name
                        </label>
                        <SmoothInput
                          id="full-name"
                          type="text"
                          placeholder="e.g. Alex Mercer"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                        />
                      </div>

                      <div>
                        <label htmlFor="organization" className="block text-xs font-medium text-zinc-700 mb-1.5">
                          Organization / College Name
                        </label>
                        <SmoothInput
                          id="organization"
                          type="text"
                          placeholder="e.g. MIT Tech Club"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                        />
                      </div>

                      <div>
                        <label htmlFor="create-password" className="block text-xs font-medium text-zinc-700 mb-1.5">
                          Create Account Password
                        </label>
                        <SmoothInput
                          id="create-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        className="group w-full bg-[#E61E32] hover:bg-[#d01729] active:bg-[#b81223] text-white font-semibold py-2.5 px-4 rounded-lg transition-all cursor-pointer mt-1 shadow-sm text-sm flex items-center justify-center gap-2"
                      >
                        <span>Create Account &amp; Launch</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}

                  {/* Sub-text Link: Already Have Account */}
                  <div className="text-center pt-3 border-t border-zinc-200/80 mt-2">
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
          )}

        </div>
      </div>
    </div>
  );
}
