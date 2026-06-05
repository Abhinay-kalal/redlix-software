"use client";
 
import { SunIcon as Sunburst } from "lucide-react";
import { useState } from "react";

export const FullScreenSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitted, setSubmitted] = useState(false);
 
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
 
    setSubmitted(true);
 
    if (valid) {
      console.log("Form submitted!");
      console.log("Email:", email);
      alert("Form submitted!");
      setEmail("");
      setPassword("");
      setSubmitted(false);
    }
  };
 
  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4 text-zinc-900 font-sans">
      <div className="w-full relative max-w-5xl flex flex-col md:flex-row shadow-lg rounded-none border border-zinc-200 bg-white overflow-hidden">
        
        {}
        <div className="bg-zinc-50 p-8 md:p-12 md:w-1/2 flex flex-col justify-between rounded-none border-b md:border-b-0 md:border-r border-zinc-200">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-none bg-orange-500 flex items-center justify-center shadow-sm">
                <Sunburst className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm tracking-wide text-zinc-800">HextaStudio</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-medium leading-snug tracking-tight mt-6 text-zinc-900">
              Design and development partner for startups and founders.
            </h1>
            <p className="text-zinc-600 text-sm max-w-xs leading-relaxed">
              We build high-performance web products that help founders validate and scale ideas.
            </p>
          </div>
          
          <div className="mt-12 pt-6 border-t border-zinc-200 text-xs text-zinc-400 font-mono">
            Partner status: Available
          </div>
        </div>
 
        {}
        <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center bg-white rounded-none z-10 text-zinc-900">
          <div className="flex flex-col items-left mb-6">
            <h2 className="text-2xl font-medium tracking-tight">
              Get Started
            </h2>
            <p className="text-left text-xs text-zinc-500 mt-1">
              Welcome to HextaStudio — enter credentials to begin
            </p>
          </div>
 
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
            noValidate
          >
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-zinc-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                id="email"
                placeholder="hi@hextastudio.in"
                className={`text-sm w-full py-2 px-3 border rounded-none bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                  emailError ? "border-red-500 focus:ring-red-500" : "border-zinc-300 focus:border-orange-500"
                } transition-all`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              <input
                type="password"
                id="password"
                placeholder="Create password"
                className={`text-sm w-full py-2 px-3 border rounded-none bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-orange-500 ${
                  passwordError ? "border-red-500 focus:ring-red-500" : "border-zinc-300 focus:border-orange-500"
                } transition-all`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!passwordError}
                aria-describedby="password-error"
              />
              {passwordError && (
                <p id="password-error" className="text-red-500 text-xs mt-1">
                  {passwordError}
                </p>
              )}
            </div>
 
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-none transition-colors cursor-pointer mt-2"
            >
              Create a new account
            </button>
 
            <div className="text-center text-zinc-500 text-xs mt-2">
              Already have an account?{" "}
              <a href="/login" className="text-orange-600 font-medium underline hover:text-orange-700 transition-colors">
                Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
