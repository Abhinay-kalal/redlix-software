"use client";

import { SunIcon as Sunburst } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Turnstile } from "@/components/ui/turnstile";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [securityError, setSecurityError] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingMessages = [
    "Checking admin credentials...",
    "Logging in...",
    "Redirecting to dashboard..."
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading && loadingStep < loadingMessages.length - 1) {
      timer = setTimeout(() => {
        setLoadingStep((prev) => prev + 1);
      }, 600);
    } else if (isLoading && loadingStep === loadingMessages.length - 1) {
      timer = setTimeout(() => {
        localStorage.setItem("is_authenticated", "true");
        localStorage.setItem("user_email", email);
        router.push("/dashboard");
      }, 600);
    }
    return () => clearTimeout(timer);
  }, [isLoading, loadingStep, email, router]);

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

    const expectedEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@redlixsecure.com";
    const expectedPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin1234";

    if (email !== expectedEmail) {
      setEmailError("Incorrect administrator email address.");
      valid = false;
    }

    if (password !== expectedPassword) {
      setPasswordError("Incorrect administrator password.");
      valid = false;
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
      const res = await fetch("/api/verify-turnstile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: turnstileToken }),
      });
      const data = await res.json();
      if (!data.success) {
        setSecurityError("Security verification failed. Please try again.");
        setIsLoading(false);
        return;
      }
    } catch {
      setSecurityError("Failed to verify security token. Please try again.");
      setIsLoading(false);
      return;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4 sm:p-6 md:p-8 relative font-sans text-zinc-900">
      
      <div className="w-full relative max-w-4xl flex flex-col md:flex-row shadow-lg rounded-none border border-zinc-200 bg-white">
        
        <div className="bg-zinc-50 p-8 md:p-12 md:w-1/2 flex flex-col justify-between rounded-none border-b md:border-b-0 md:border-r border-zinc-200">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <img
                src="https://ik.imagekit.io/dypkhqxip/logo.png?updatedAt=1777320313623"
                alt="Logo"
                className="w-8 h-8 object-contain shrink-0"
              />
              <span className="font-bold text-sm tracking-wide text-zinc-800">Redlix Secure</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-medium leading-snug tracking-tight mt-6 text-zinc-900">
              Admin Console
            </h1>
            <p className="text-zinc-600 text-sm max-w-xs leading-relaxed">
              Sign in to manage proctoring sessions and configurations.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center bg-white rounded-none min-h-[400px]">
          
          {isLoading ? (
            
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-t-orange-500 border-r-zinc-200 border-b-zinc-200 border-l-zinc-200 animate-spin" />
              </div>
              
              <div className="h-6 flex items-center justify-center">
                <p className="text-zinc-700 font-medium text-sm transition-all duration-300">
                  {loadingMessages[loadingStep]}
                </p>
              </div>
            </div>
          ) : (
            
            <div className="w-full max-w-sm mx-auto">
              <div className="flex flex-col items-left mb-6">
                <h2 className="text-2xl font-medium tracking-tight text-zinc-900">
                  Admin Login
                </h2>
                <p className="text-left text-xs text-zinc-500 mt-1">
                  Enter your administrator credentials to access the console
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
                    placeholder="admin@institution.edu"
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
                    <p id="email-error" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      {emailError}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    className={`text-sm w-full py-2 px-3 border rounded-none bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
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
                  {passwordError && (
                    <p id="password-error" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      {passwordError}
                    </p>
                  )}
                </div>

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

                <Turnstile
                  onSuccess={(token) => {
                    setTurnstileToken(token);
                    setSecurityError("");
                  }}
                  onError={() => setSecurityError("Security verification encountered an error.")}
                  onExpire={() => setTurnstileToken("")}
                />
                {securityError && (
                  <p className="text-red-500 text-xs mt-1">
                    {securityError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-none transition-colors cursor-pointer mt-2 shadow-sm"
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
