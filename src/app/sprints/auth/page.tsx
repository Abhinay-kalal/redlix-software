"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { FloatingPathsBackground } from "@/components/ui/floating-paths";
import { SmoothInput } from "@/components/ui/smooth-input";
import { Loader2 } from "lucide-react";

function SprintAuthContent() {
  const router = useRouter();

  // Tab State: "register" (Sign Up) or "login" (Sign In)
  const [authTab, setAuthTab] = useState<"register" | "login">("register");

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passError, setPassError] = useState("");

  // Forgot Password flow states
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: Send OTP, 2: Verify OTP, 3: Reset Password
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpError, setOtpError] = useState("");
  const [newPassError, setNewPassError] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Verifying credentials...");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  const loadingSteps = [
    "Verifying credentials...",
    "Connecting to portal...",
    "Registering session token...",
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

  // Handle Login Submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    if (!email.trim()) {
      setEmailError("Please enter your email address.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!password.trim()) {
      setPassError("Please enter your password.");
      valid = false;
    } else {
      setPassError("");
    }

    if (!valid) return;

    setIsLoading(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      const loginRes = await fetch("/api/candidate/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const loginData = await loginRes.json();
      if (!loginData.success) {
        setAuthError(loginData.error || "Invalid email address or password.");
        setIsLoading(false);
        return;
      }

      // Store credentials locally
      localStorage.setItem("candidate_authenticated", "true");
      localStorage.setItem("candidate_email", loginData.candidate.email);
      localStorage.setItem("candidate_name", loginData.candidate.fullName || "Candidate");

      setAuthSuccess("Successfully logged in! Directing to dashboard...");

      setTimeout(() => {
        router.push("/candidate-dashboard");
      }, 800);
    } catch (err) {
      setAuthError("Failed to complete login request.");
      setIsLoading(false);
    }
  };

  // Handle Registration Submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    if (!fullName.trim()) {
      setNameError("Please enter your full name.");
      valid = false;
    } else {
      setNameError("");
    }

    if (!email.trim()) {
      setEmailError("Please enter your email address.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!password.trim()) {
      setPassError("Please enter your password.");
      valid = false;
    } else {
      setPassError("");
    }

    if (!valid) return;

    setIsLoading(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      // Step A: Registration
      const regRes = await fetch("/api/candidate/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password })
      });

      const regData = await regRes.json();
      if (!regRes.ok || !regData.success) {
        setAuthError(regData.error || "Registration failed. Check details and try again.");
        setIsLoading(false);
        return;
      }

      // Step B: Auto-Login
      const loginRes = await fetch("/api/candidate/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const loginData = await loginRes.json();
      if (!loginData.success) {
        setAuthError("Account created, but automatic login failed. Please sign in manually.");
        setAuthTab("login");
        setIsLoading(false);
        return;
      }

      // Store credentials locally
      localStorage.setItem("candidate_authenticated", "true");
      localStorage.setItem("candidate_email", loginData.candidate.email);
      localStorage.setItem("candidate_name", loginData.candidate.fullName || fullName);

      setAuthSuccess("Account created! Redirecting to dashboard...");

      setTimeout(() => {
        router.push("/candidate-dashboard");
      }, 800);
    } catch (err) {
      setAuthError("An error occurred during registration flow.");
      setIsLoading(false);
    }
  };

  // Forgot Password Handlers
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError("Please enter your registered email address.");
      return;
    }
    setEmailError("");
    setIsLoading(true);
    setLoadingMsg("Sending security OTP code...");
    setAuthError("");
    setAuthSuccess("");

    try {
      const res = await fetch("/api/candidate/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-otp", email })
      });
      const data = await res.json();
      if (!data.success) {
        setAuthError(data.error || "Failed to dispatch OTP code.");
        setIsLoading(false);
        return;
      }
      setAuthSuccess(data.message || "OTP code sent to email.");
      setForgotPasswordStep(2);
    } catch {
      setAuthError("Failed to initiate password reset flow.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOtp.trim()) {
      setOtpError("Please enter the 6-digit OTP code.");
      return;
    }
    setOtpError("");
    setIsLoading(true);
    setLoadingMsg("Verifying verification code...");
    setAuthError("");
    setAuthSuccess("");

    try {
      const res = await fetch("/api/candidate/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify-otp", email, otp: resetOtp })
      });
      const data = await res.json();
      if (!data.success) {
        setAuthError(data.error || "Invalid OTP code.");
        setIsLoading(false);
        return;
      }
      setAuthSuccess(data.message || "OTP verified! Please set new password.");
      setForgotPasswordStep(3);
    } catch {
      setAuthError("Failed to complete OTP validation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setNewPassError("Please enter a new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setNewPassError("Passwords do not match.");
      return;
    }
    setNewPassError("");
    setIsLoading(true);
    setLoadingMsg("Saving new password credentials...");
    setAuthError("");
    setAuthSuccess("");

    try {
      const res = await fetch("/api/candidate/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-password", email, password: newPassword })
      });
      const data = await res.json();
      if (!data.success) {
        setAuthError(data.error || "Failed to reset password.");
        setIsLoading(false);
        return;
      }
      setAuthSuccess("Password changed successfully! You can now sign in.");
      setTimeout(() => {
        setIsForgotPassword(false);
        setForgotPasswordStep(1);
        setAuthTab("login");
        setResetOtp("");
        setNewPassword("");
        setConfirmPassword("");
      }, 1000);
    } catch {
      setAuthError("Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

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
                className="h-12 md:h-14 w-auto object-contain object-left shrink-0 animate-fadeIn"
              />
            </div>

            <div className="space-y-2 mt-4">
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-900 font-inter font-['Inter',sans-serif]">
                Candidate Registration
              </h1>
              <p className="text-zinc-500 text-xs leading-relaxed font-normal font-sans">
                Enter your credentials to access the proctored exam and sprint lobby workspace.
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <iframe
                src="https://lottie.host/embed/e9948351-dd15-427f-bde1-b547486d6c83/atd20DWZjT.lottie"
                style={{ width: "220px", height: "220px", border: "none", overflow: "hidden" }}
                title="Candidate Proctored Exam Animation"
                className="mx-auto"
              />
            </div>
          </div>

          <p className="text-xs text-zinc-500 mt-6 select-none font-sans">
            Facing issues? Contact <span className="text-[#E61E32] font-semibold underline underline-offset-2 decoration-[#E61E32] cursor-pointer">Organizer</span>.
          </p>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center bg-white min-h-[440px]">
          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center text-center gap-6">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-t-[#E61E32] border-r-zinc-200 border-b-zinc-200 border-l-zinc-200 animate-spin" />
              </div>
              <p className="text-zinc-755 font-medium text-sm leading-relaxed">{loadingMsg}</p>
            </div>
          ) : (
            <div className="w-full max-w-sm mx-auto">
              
              {/* Tab Selector Headers */}
              {!isForgotPassword ? (
                <div className="flex border-b border-zinc-200 mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab("register");
                      setAuthError("");
                      setAuthSuccess("");
                    }}
                    className={`pb-2.5 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer pr-4 ${
                      authTab === "register"
                        ? "border-[#E61E32] text-[#E61E32]"
                        : "border-transparent text-zinc-400 hover:text-zinc-650"
                    }`}
                  >
                    Sign Up
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab("login");
                      setAuthError("");
                      setAuthSuccess("");
                    }}
                    className={`pb-2.5 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer px-4 ${
                      authTab === "login"
                        ? "border-[#E61E32] text-[#E61E32]"
                        : "border-transparent text-zinc-400 hover:text-zinc-650"
                    }`}
                  >
                    Sign In
                  </button>
                </div>
              ) : (
                <div className="border-b border-zinc-200 mb-6 pb-2.5 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E61E32]">
                    Reset Credentials
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setForgotPasswordStep(1);
                      setAuthError("");
                      setAuthSuccess("");
                    }}
                    className="text-[10px] uppercase font-bold text-zinc-500 hover:text-zinc-955 cursor-pointer bg-transparent border-none"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              )}

              {authError && (
                <div className="p-3 bg-red-50 border border-red-200/80 rounded-xl text-[#E61E32] text-xs font-semibold flex items-center gap-2 mb-4 animate-shake">
                  <span className="material-symbols-rounded text-sm shrink-0">error</span>
                  <span>{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 mb-4">
                  <span className="material-symbols-rounded text-sm shrink-0">check_circle</span>
                  <span>{authSuccess}</span>
                </div>
              )}

              {isForgotPassword ? (
                <form className="flex flex-col gap-4" onSubmit={
                  forgotPasswordStep === 1 ? handleSendOtp :
                  forgotPasswordStep === 2 ? handleVerifyOtp :
                  handleResetPassword
                } noValidate>
                  {forgotPasswordStep === 1 && (
                    <>
                      <p className="text-xs text-zinc-500 leading-normal mb-1">
                        Enter your registered email address. We will email you a 6-digit security code to verify ownership.
                      </p>
                      <div>
                        <label htmlFor="reset-email" className="block text-xs font-medium text-zinc-700 mb-1.5">
                          Registered Email Address
                        </label>
                        <SmoothInput
                          id="reset-email"
                          type="email"
                          placeholder="e.g. user@college.edu"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
                          error={!!emailError}
                        />
                        {emailError && <p className="text-[#E61E32] text-xs mt-1 font-medium">{emailError}</p>}
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-[#E61E32] hover:bg-[#d01729] text-white font-semibold py-2.5 px-4 rounded-lg transition-all mt-2 text-sm cursor-pointer shadow-sm"
                      >
                        Send Verification OTP
                      </button>
                    </>
                  )}

                  {forgotPasswordStep === 2 && (
                    <>
                      <p className="text-xs text-zinc-500 leading-normal">
                        A 6-digit verification code has been sent to <strong className="text-zinc-800">{email}</strong>.
                      </p>
                      <div>
                        <label htmlFor="reset-otp" className="block text-xs font-medium text-zinc-700 mb-1.5">
                          Enter 6-Digit OTP Code
                        </label>
                        <SmoothInput
                          id="reset-otp"
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 123456"
                          value={resetOtp}
                          onChange={(e) => { setResetOtp(e.target.value.replace(/[^0-9]/g, "")); if (otpError) setOtpError(""); }}
                          error={!!otpError}
                          className="font-mono tracking-widest text-center text-lg"
                        />
                        {otpError && <p className="text-[#E61E32] text-xs mt-1 font-medium">{otpError}</p>}
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-[#E61E32] hover:bg-[#d01729] text-white font-semibold py-2.5 px-4 rounded-lg transition-all mt-2 text-sm cursor-pointer shadow-sm"
                      >
                        Verify OTP Code
                      </button>
                    </>
                  )}

                  {forgotPasswordStep === 3 && (
                    <>
                      <p className="text-xs text-zinc-555 leading-normal mb-1">
                        Reset verification successful. Please declare your new account password:
                      </p>
                      <div>
                        <label htmlFor="new-pass" className="block text-xs font-medium text-zinc-700 mb-1.5">
                          New Password
                        </label>
                        <SmoothInput
                          id="new-pass"
                          type="password"
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => { setNewPassword(e.target.value); if (newPassError) setNewPassError(""); }}
                          error={!!newPassError}
                        />
                      </div>
                      <div>
                        <label htmlFor="confirm-pass" className="block text-xs font-medium text-zinc-700 mb-1.5">
                          Confirm New Password
                        </label>
                        <SmoothInput
                          id="confirm-pass"
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => { setConfirmPassword(e.target.value); if (newPassError) setNewPassError(""); }}
                          error={!!newPassError}
                        />
                        {newPassError && <p className="text-[#E61E32] text-xs mt-1 font-medium">{newPassError}</p>}
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-[#E61E32] hover:bg-[#d01729] text-white font-semibold py-2.5 px-4 rounded-lg transition-all mt-2 text-sm cursor-pointer shadow-sm"
                      >
                        Reset Password
                      </button>
                    </>
                  )}
                </form>
              ) : (
                <form className="flex flex-col gap-4" onSubmit={authTab === "register" ? handleRegister : handleLogin} noValidate>
                  {authTab === "register" && (
                    <div>
                      <label htmlFor="candidate-name" className="block text-xs font-medium text-zinc-700 mb-1.5">
                        Full Name
                      </label>
                      <SmoothInput
                        id="candidate-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => { setFullName(e.target.value); if (nameError) setNameError(""); }}
                        error={!!nameError}
                        autoComplete="name"
                      />
                      {nameError && (
                        <p className="text-[#E61E32] text-xs mt-1 font-medium">{nameError}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <label htmlFor="candidate-email" className="block text-xs font-medium text-zinc-700 mb-1.5">
                      Email Address
                    </label>
                    <SmoothInput
                      id="candidate-email"
                      type="email"
                      placeholder="e.g. name@college.edu"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
                      error={!!emailError}
                      autoComplete="email"
                    />
                    {emailError && (
                      <p className="text-[#E61E32] text-xs mt-1 font-medium">{emailError}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label htmlFor="candidate-password" className="block text-xs font-medium text-zinc-700">
                        Password
                      </label>
                      {authTab === "login" && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(true);
                            setForgotPasswordStep(1);
                            setAuthError("");
                            setAuthSuccess("");
                          }}
                          className="text-[10px] font-bold text-[#E61E32] hover:underline cursor-pointer bg-transparent border-none"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <SmoothInput
                      id="candidate-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); if (passError) setPassError(""); }}
                      error={!!passError}
                      autoComplete="current-password"
                    />
                    {passError && (
                      <p className="text-[#E61E32] text-xs mt-1 font-medium">{passError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="group w-full bg-[#E61E32] hover:bg-[#d01729] active:bg-[#b81223] text-white font-semibold py-2.5 px-4 rounded-lg transition-all cursor-pointer mt-2 shadow-sm text-sm flex items-center justify-center gap-2"
                  >
                    <span>{authTab === "register" ? "Register & Enter Portal" : "Sign In & Enter Portal"}</span>
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
              )}
            </div>
          )}
        </div>

      </div>
    </FloatingPathsBackground>
  );
}

export default function SprintAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-t-[#E61E32] border-r-zinc-200 border-b-zinc-200 border-l-zinc-200 animate-spin" />
      </div>
    }>
      <SprintAuthContent />
    </Suspense>
  );
}
