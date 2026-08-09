"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Turnstile } from "@/components/ui/turnstile";
import { SmoothInput } from "@/components/ui/smooth-input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [securityError, setSecurityError] = useState("");
  
  const [loginVerified, setLoginVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingMessages = [
    "Checking admin credentials...",
    "Verifying security session...",
    "Redirecting to dashboard..."
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loginVerified) {
      if (loadingStep < loadingMessages.length - 1) {
        timer = setTimeout(() => {
          setLoadingStep((prev) => prev + 1);
        }, 600);
      } else if (loadingStep === loadingMessages.length - 1) {
        timer = setTimeout(() => {
          localStorage.setItem("is_authenticated", "true");
          localStorage.setItem("user_email", email);
          router.push("/dashboard");
        }, 600);
      }
    }
    return () => clearTimeout(timer);
  }, [loginVerified, loadingStep, email, router]);

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const validatePassword = (value: string) => {
    return value.length >= 8;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid administrator email.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 8 characters.");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!turnstileToken) {
      setSecurityError("Please complete the security check.");
      valid = false;
    } else {
      setSecurityError("");
    }

    if (!valid) return;

    setIsLoading(true);
    setLoadingStep(0);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, token: turnstileToken }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLoginVerified(true);
        setLoadingStep(1);
      } else {
        setIsLoading(false);
        const errorCode = data.error || "unknown";
        if (errorCode === "invalid_credentials") {
          setEmailError("Incorrect administrator email or password.");
          setPasswordError("Incorrect administrator email or password.");
        } else if (errorCode === "security_check_failed" || errorCode === "missing_security_token") {
          setSecurityError("Security verification failed. Please try again.");
        } else {
          setSecurityError("An error occurred during login. Please try again.");
        }
      }
    } catch {
      setIsLoading(false);
      setSecurityError("Failed to connect to the server. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4 md:p-6 font-sans text-zinc-900 relative overflow-hidden">
      
      {/* Right half window solid red background circle */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 h-full flex items-center justify-center pointer-events-none overflow-hidden z-0">
        <div className="w-[1400px] h-[1400px] md:w-[1600px] md:h-[1600px] rounded-full bg-[#E61E32] opacity-35 translate-x-1/3 shrink-0" />
      </div>

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
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-900 font-inter">
                Admin Console
              </h1>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Sign in to manage proctoring sessions, candidate registries, and security controls.
              </p>
            </div>
          </div>

          <p className="text-xs text-zinc-500 mt-6">
            Need assistance? Contact <span className="text-[#E61E32] font-semibold underline underline-offset-2 decoration-[#E61E32] cursor-pointer">System Administration</span>.
          </p>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center bg-white min-h-[420px]">
          
          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center text-center gap-6">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-t-[#E61E32] border-r-zinc-200 border-b-zinc-200 border-l-zinc-200 animate-spin" />
              </div>
              <p className="text-zinc-700 font-medium text-sm transition-all duration-300">
                {loadingMessages[loadingStep]}
              </p>
            </div>
          ) : (
            <div className="w-full max-w-sm mx-auto">
              <div className="mb-6">
                <h2 className="text-xl font-semibold tracking-tight text-zinc-900 font-inter">
                  Admin Sign In
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Enter your administrator credentials to access the console.
                </p>
              </div>

              <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
                
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Email Address
                  </label>
                  <SmoothInput
                    id="email"
                    type="email"
                    placeholder="admin@redlixsecure.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    error={!!emailError}
                    autoComplete="email"
                  />
                  {emailError && (
                    <p className="text-[#E61E32] text-xs mt-1 font-medium">{emailError}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Password
                  </label>
                  <SmoothInput
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    error={!!passwordError}
                    autoComplete="current-password"
                  />
                  {passwordError && (
                    <p className="text-[#E61E32] text-xs mt-1 font-medium">{passwordError}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-[#E61E32] focus:ring-[#E61E32] accent-[#E61E32] cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-xs text-zinc-600 cursor-pointer select-none">
                    Remember this device
                  </label>
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
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
