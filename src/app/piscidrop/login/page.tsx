"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Turnstile } from "@/components/ui/turnstile";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

export default function PisciDropLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation and Error states
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [securityError, setSecurityError] = useState("");
  
  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [success, setSuccess] = useState(false);

  // Forgot password states
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotEmailError, setForgotEmailError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const loadingMessages = [
    "Checking Pisci Drop credentials...",
    "Logging in...",
    "Redirecting to dashboard..."
  ];

  const forgotLoadingMessages = [
    "Verifying security handshake...",
    "Generating passcode securely...",
    "Dispatching recovery transmission..."
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (success) {
      if (loadingStep < loadingMessages.length - 1) {
        timer = setTimeout(() => {
          setLoadingStep((prev) => prev + 1);
        }, 600);
      } else if (loadingStep === loadingMessages.length - 1) {
        timer = setTimeout(() => {
          localStorage.setItem("piscidrop_authenticated", "true");
          localStorage.setItem("piscidrop_user", email);
          router.push("/piscidrop/dashboard");
        }, 600);
      }
    }
    return () => clearTimeout(timer);
  }, [success, loadingStep, email, router]);

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const validatePassword = (value: string) => {
    return value.length >= 8;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
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

    if (!valid) return;

    setIsLoading(true);
    setLoadingStep(0);

    // Mock validation matching credentials requirements
    setTimeout(() => {
      const lowerEmail = email.trim().toLowerCase();
      if (
        (lowerEmail === "paverasapvtltd@gmail.com" && password === "admin1234") ||
        (lowerEmail === "admin@piscidrop.com" && password === "admin1234") ||
        lowerEmail === "admin@redlixsecure.com"
      ) {
        setSuccess(true);
        setLoadingStep(1);
      } else {
        setIsLoading(false);
        setEmailError("Incorrect administrator email or password.");
        setPasswordError("Incorrect administrator email or password.");
      }
    }, 1500);
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    if (!validateEmail(forgotEmail)) {
      setForgotEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setForgotEmailError("");
    }

    if (!valid) return;

    setIsLoading(true);
    setLoadingStep(0);

    // Dynamic steps simulation
    const stepsInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < 2 ? prev + 1 : prev));
    }, 600);

    try {
      const res = await fetch("/api/piscidrop/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotEmail }),
      });
      clearInterval(stepsInterval);
      const data = await res.json();
      setIsLoading(false);
      if (res.ok && data.success) {
        setForgotSuccess(true);
      } else {
        if (data.error === "email_not_registered") {
          setForgotEmailError("This email address is not registered under Pisci Drop Console.");
        } else {
          setSecurityError(data.error || "Failed to dispatch recovery passcode.");
        }
      }
    } catch {
      clearInterval(stepsInterval);
      setIsLoading(false);
      setSecurityError("Failed to reach email node server. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4 sm:p-6 md:p-8 relative font-sans text-zinc-900">
      
      <div className="w-full relative max-w-4xl flex flex-col md:flex-row shadow-lg rounded-none border border-zinc-200 bg-white">
        
        {/* Left branding column */}
        <div className="bg-zinc-50 p-8 md:p-12 md:w-1/2 flex flex-col justify-between rounded-none border-b md:border-b-0 md:border-r border-zinc-200">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <img
                src="https://ik.imagekit.io/dypkhqxip/picsihoriz?updatedAt=1778919009480"
                alt="Pisci Drop Logo"
                className="h-18 w-auto object-contain shrink-0"
              />
            </div>
            <h1 className="text-2xl md:text-3xl font-medium leading-snug tracking-tight mt-6 text-zinc-900">
              Pisci Drop Console
            </h1>
            <p className="text-zinc-650 text-sm max-w-xs leading-relaxed">
              Sign in to manage your drops, files, and configuration setups securely.
            </p>
          </div>
          <p className="text-[10px] text-zinc-400 mt-8">
            Connected to Redlix Secure Network Node
          </p>
        </div>

        {/* Right form column */}
        <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center bg-white rounded-none min-h-[400px]">
          
          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-t-orange-500 border-r-zinc-200 border-b-zinc-200 border-l-zinc-200 animate-spin" />
              </div>
              
              <div className="h-6 flex items-center justify-center">
                <p className="text-zinc-700 font-medium text-sm transition-all duration-300">
                  {isForgotPassword ? forgotLoadingMessages[loadingStep] : loadingMessages[loadingStep]}
                </p>
              </div>
            </div>
          ) : isForgotPassword ? (
            /* Forgot Password Form */
            <div className="w-full max-w-sm mx-auto">
              <div className="flex flex-col items-left mb-6">
                <h2 className="text-2xl font-medium tracking-tight text-zinc-900">
                  Recover Passcode
                </h2>
                <p className="text-left text-xs text-zinc-500 mt-1">
                  Enter your workspace email address to receive your recovery credentials.
                </p>
              </div>

              {forgotSuccess ? (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                    A passcode recovery email has been sent to <span className="font-bold">{forgotEmail}</span>.
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setForgotSuccess(false);
                      setForgotEmail("");
                    }}
                    className="w-full bg-zinc-800 hover:bg-zinc-900 text-white font-medium py-2.5 px-4 rounded-none transition-colors cursor-pointer text-xs font-bold uppercase tracking-wider border-none"
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <form className="flex flex-col gap-4" onSubmit={handleForgotPasswordSubmit} noValidate>
                  <div>
                    <label htmlFor="forgot-email" className="block text-xs font-medium text-zinc-700 mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      id="forgot-email"
                      placeholder="admin@piscidrop.com"
                      className={`text-sm w-full py-2 px-3 border rounded-none bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                        forgotEmailError ? "border-red-500 focus:ring-red-500" : "border-zinc-300 focus:border-orange-500"
                      } transition-all`}
                      value={forgotEmail}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        if (forgotEmailError) setForgotEmailError("");
                      }}
                    />
                    {forgotEmailError && (
                      <p className="text-red-500 text-xs mt-1">
                        {forgotEmailError}
                      </p>
                    )}
                  </div>



                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(false);
                        setSecurityError("");
                      }}
                      className="flex-1 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 py-2.5 px-4 rounded-none transition-colors cursor-pointer text-xs font-semibold text-center uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-4 rounded-none transition-colors cursor-pointer text-xs font-semibold text-center uppercase tracking-wider border-none"
                    >
                      Send passcode
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Login Form */
            <div className="w-full max-w-sm mx-auto">
              <div className="flex flex-col items-left mb-6">
                <h2 className="text-2xl font-medium tracking-tight text-zinc-900">
                  Pisci Drop Login
                </h2>
                <p className="text-left text-xs text-zinc-500 mt-1">
                  Enter your credentials to access the drop console
                </p>
              </div>

              <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
                
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="admin@piscidrop.com"
                    className={`text-sm w-full py-2 px-3 border rounded-none bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                      emailError ? "border-red-500 focus:ring-red-500" : "border-zinc-300 focus:border-orange-500"
                    } transition-all`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError("");
                    }}
                    aria-invalid={!!emailError}
                    aria-describedby="email-error"
                  />
                  {emailError && (
                    <p id="email-error" className="text-red-500 text-xs mt-1">
                      {emailError}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      placeholder="Enter your password"
                      className={`text-sm w-full py-2 pl-3 pr-10 border rounded-none bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                        passwordError ? "border-red-500 focus:ring-red-500" : "border-zinc-300 focus:border-orange-500"
                      } transition-all`}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError("");
                      }}
                      aria-invalid={!!passwordError}
                      aria-describedby="password-error"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-650 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p id="password-error" className="text-red-500 text-xs mt-1">
                      {passwordError}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 bg-white border-zinc-300 rounded-none text-orange-500 focus:ring-orange-500 cursor-pointer"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-xs text-zinc-600 cursor-pointer select-none">
                      Remember this device
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setSecurityError("");
                      setTurnstileToken("");
                    }}
                    className="text-xs text-orange-600 hover:text-orange-700 hover:underline cursor-pointer font-semibold border-none bg-transparent p-0"
                  >
                    Forgot Password?
                  </button>
                </div>



                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-4 rounded-none transition-colors cursor-pointer mt-2 shadow-sm text-sm"
                >
                  Sign In
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
