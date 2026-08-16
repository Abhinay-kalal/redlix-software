"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FloatingPathsBackground } from "@/components/ui/floating-paths";
import { Turnstile } from "@/components/ui/turnstile";
import { User, Mail, Lock, Phone, BookOpen, Layers, ShieldCheck, ArrowRight } from "lucide-react";
import Script from "next/script";

function CandidateSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "";

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Error and Loading states
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Registering account...");
  const [success, setSuccess] = useState(false);

  const loadingSteps = [
    "Verifying security details...",
    "Hashing credentials securely...",
    "Creating candidate account...",
  ];

  useEffect(() => {
    let i = 0;
    if (!isLoading) return;
    const interval = setInterval(() => {
      i = (i + 1) % loadingSteps.length;
      setLoadingMsg(loadingSteps[i]);
    }, 800);
    return () => clearInterval(interval);
  }, [isLoading]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required.";
    
    if (!email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (phone && !/^\+?[0-9\s-]{10,15}$/.test(phone)) {
      newErrors.phone = "Please enter a valid phone number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setLoadingMsg("Sending OTP to your email...");
    setFormError("");

    try {
      const res = await fetch("/api/candidate/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        setFormError(data.error || "Failed to send OTP.");
      } else {
        setOtpSent(true);
      }
    } catch (err: any) {
      setFormError("A network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setFormError("Please enter the 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    setLoadingMsg("Verifying OTP and creating account...");
    setFormError("");

    try {
      const res = await fetch("/api/candidate/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          phone,
          college,
          department,
          otp,
          turnstileToken,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || "Signup failed. Please try again.");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      localStorage.setItem("candidate_authenticated", "true");
      localStorage.setItem("candidate_email", email);
      localStorage.setItem("candidate_name", fullName);
      
      setTimeout(() => {
        if (redirectUrl) {
          router.push(redirectUrl);
        } else {
          router.push("/candidate-dashboard");
        }
      }, 1500);
    } catch (err: any) {
      setFormError("A network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <FloatingPathsBackground position={-1} className="min-h-screen bg-zinc-100 flex items-center justify-center p-4 font-sans text-zinc-900 overflow-hidden">
      <div className="w-full max-w-5xl flex flex-col md:flex-row shadow-lg border border-zinc-200 bg-white relative z-10">
        
        {/* Left column - Branding */}
        <div className="bg-zinc-50 p-8 md:p-12 md:w-5/12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-200">
          <div className="space-y-6">
            <div className="flex items-center">
              <img
                src="https://ik.imagekit.io/dypkhqxip/redlix%20new?updatedAt=1781042212493"
                alt="Redlix Secure Logo"
                className="w-32 h-10 object-contain shrink-0"
              />
            </div>

            <h1 className="text-2xl md:text-3xl font-medium leading-snug tracking-tight mt-6 text-zinc-900">
              Candidate Register
            </h1>
            <p className="text-zinc-500 text-sm max-w-xs leading-relaxed font-normal">
              Register a permanent candidate profile to track exam registrations, access exam schedules, and view performance results.
            </p>
            <div className="flex justify-center pt-2">
              <iframe
                src="https://lottie.host/embed/e9948351-dd15-427f-bde1-b547486d6c83/atd20DWZjT.lottie"
                style={{ width: "260px", height: "260px", border: "none", overflow: "hidden" }}
                title="Candidate Portal Signup Animation"
              />
            </div>
          </div>

          <div className="space-y-1 mt-6">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Need Help?</p>
            <p className="text-[10px] text-zinc-400 font-normal leading-relaxed">
              If you have any questions or need support, please contact the exam controller.
            </p>
          </div>
        </div>

        {/* Right column - Form */}
        <div className="p-8 md:p-12 md:w-7/12 flex flex-col justify-center bg-white min-h-[500px]">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-6">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-t-orange-500 border-r-zinc-200 border-b-zinc-200 border-l-zinc-200 animate-spin" />
              </div>
              <p className="text-zinc-750 font-medium text-sm">{loadingMsg}</p>
            </div>
          ) : success ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900">Registration Successful</h2>
              <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                Your candidate profile has been initialized. Redirecting you to login portal...
              </p>
            </div>
          ) : (
            <div className="w-full max-w-md mx-auto">
              <div className="mb-6">
                <h2 className="text-xl font-medium tracking-tight text-zinc-900">Create Candidate Account</h2>
                <p className="text-xs text-zinc-500 mt-1">Please enter your credentials to complete registration</p>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold mb-4 rounded-none">
                  {formError}
                </div>
              )}

              <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); if (!otpSent) handleSendOtp(e); else handleVerifyAndSignup(e); }} noValidate>
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label htmlFor="fullName" className="block text-xs font-medium text-zinc-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      id="fullName"
                      type="text"
                      placeholder="Marcus Aurelius"
                      value={fullName}
                      onChange={(e) => { setFullName(e.target.value); if (errors.fullName) setErrors({ ...errors, fullName: "" }); }}
                      className={`text-xs w-full py-2 pl-9 pr-3 border rounded-none bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                        errors.fullName ? "border-red-500 focus:ring-red-500" : "border-zinc-300 focus:border-orange-500"
                      } transition-all`}
                    />
                  </div>
                  {errors.fullName && <p className="text-red-500 text-[10px] mt-1">{errors.fullName}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-zinc-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      id="email"
                      type="email"
                      placeholder="marcus@academy.edu"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: "" }); }}
                      className={`text-xs w-full py-2 pl-9 pr-3 border rounded-none bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                        errors.email ? "border-red-500 focus:ring-red-500" : "border-zinc-300 focus:border-orange-500"
                      } transition-all`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-[10px] mt-1">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-zinc-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      id="password"
                      type="password"
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: "" }); }}
                      className={`text-xs w-full py-2 pl-9 pr-3 border rounded-none bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                        errors.password ? "border-red-500 focus:ring-red-500" : "border-zinc-300 focus:border-orange-500"
                      } transition-all`}
                    />
                  </div>
                  {errors.password && <p className="text-red-500 text-[10px] mt-1">{errors.password}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-medium text-zinc-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      id="phone"
                      type="tel"
                      placeholder="+91 9876543210"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value); if (errors.phone) setErrors({ ...errors, phone: "" }); }}
                      className={`text-xs w-full py-2 pl-9 pr-3 border rounded-none bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                        errors.phone ? "border-red-500 focus:ring-red-500" : "border-zinc-300 focus:border-orange-500"
                      } transition-all`}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-[10px] mt-1">{errors.phone}</p>}
                </div>

                {/* College */}
                <div>
                  <label htmlFor="college" className="block text-xs font-medium text-zinc-700 mb-1">
                    College / University
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                      <BookOpen className="w-4 h-4" />
                    </span>
                    <input
                      id="college"
                      type="text"
                      placeholder="Cambridge University"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="text-xs w-full py-2 pl-9 pr-3 border border-zinc-300 rounded-none bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                    />
                  </div>
                </div>

                {/* Department */}
                <div className="sm:col-span-2">
                  <label htmlFor="department" className="block text-xs font-medium text-zinc-700 mb-1">
                    Branch / Department
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                      <Layers className="w-4 h-4" />
                    </span>
                    <input
                      id="department"
                      type="text"
                      placeholder="Computer Science & Engineering"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="text-xs w-full py-2 pl-9 pr-3 border border-zinc-300 rounded-none bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                    />
                  </div>
                </div>



                {/* OTP Section */}
                {otpSent && (
                  <div className="sm:col-span-2">
                    <label htmlFor="otp" className="block text-xs font-medium text-zinc-700 mb-1">
                      6-Digit OTP *
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        id="otp"
                        type="text"
                        placeholder="123456"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="text-xs w-full py-2 pl-9 pr-3 border border-zinc-300 rounded-none bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono tracking-widest text-center text-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <div className="sm:col-span-2 pt-2">
                  {!otpSent ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-2.5 px-4 rounded-none transition-colors cursor-pointer shadow-sm text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                    >
                      Send Verification OTP <Mail className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleVerifyAndSignup}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-4 rounded-none transition-colors cursor-pointer shadow-sm text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                    >
                      Verify & Register <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>

              <div className="mt-8 text-center text-xs text-zinc-500 pt-4 border-t border-zinc-150">
                Already registered?{" "}
                <Link href={redirectUrl ? `/candidate-login?redirect=${encodeURIComponent(redirectUrl)}` : "/candidate-login"} className="text-orange-600 font-bold hover:underline hover:text-orange-700">
                  Sign in here
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </FloatingPathsBackground>
  );
}

export default function CandidateSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-t-orange-500 border-r-zinc-200 border-b-zinc-200 border-l-zinc-200 animate-spin" />
      </div>
    }>
      <CandidateSignupContent />
    </Suspense>
  );
}
