"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, CheckCircle, Camera, User, Mail, Phone, MapPin, Calendar, BookOpen, Layers, Heart } from "lucide-react";
import Link from "next/link";
import { Turnstile } from "@/components/ui/turnstile";

export default function StudentRegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  // Form states
  const [photo, setPhoto] = useState<string>("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [branch, setBranch] = useState("");
  const [interests, setInterests] = useState("Web Development with AI");

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("Candidate photo must be under 2MB in size.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
      setErrorMsg("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!photo) {
      setErrorMsg("Please upload your verification photograph.");
      return;
    }

    if (!turnstileToken) {
      setErrorMsg("Please complete the security check.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // 1. Verify Turnstile
      const verifyRes = await fetch("/api/verify-turnstile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: turnstileToken }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        setErrorMsg("Security verification failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // 2. Insert into database
      const { error } = await supabase.from("student_registrations").insert({
        full_name: fullName,
        email,
        phone,
        address,
        dob,
        college_name: collegeName,
        branch,
        interests,
        photo_url: photo,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during registration.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-zinc-100 font-sans text-zinc-900 flex flex-col">
        <header className="bg-orange-500 border-b border-orange-600 py-3.5 px-6 shadow-xs shrink-0">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <span className="text-white font-bold text-sm font-sans tracking-tight">Redlix Secure</span>
          </div>
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto p-6 flex flex-col justify-center">
          <div className="bg-white border border-zinc-200 p-10 sm:p-12 py-12 sm:py-16 shadow-md rounded-none text-left space-y-8 relative overflow-hidden min-h-[550px] flex flex-col justify-between">
            
            <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-zinc-200">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">Registration Completed</h1>
              <p className="text-xs text-zinc-500 max-w-md">
                Your student registration profile has been successfully recorded in our registry.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="md:col-span-2 space-y-4">
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Candidate Name</p>
                  <p className="text-lg font-bold text-zinc-900 mt-0.5">{fullName}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Email Address</p>
                    <p className="text-xs font-semibold text-zinc-700 mt-0.5 truncate">{email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Phone Number</p>
                    <p className="text-xs font-semibold text-zinc-700 mt-0.5">{phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Date of Birth</p>
                    <p className="text-xs font-semibold text-zinc-700 mt-0.5">{dob}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Selected Interest</p>
                    <p className="text-xs font-bold text-orange-600 mt-0.5">{interests}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">College & Branch</p>
                  <p className="text-xs font-semibold text-zinc-700 mt-0.5">{collegeName} — <span className="text-zinc-500 font-normal">{branch}</span></p>
                </div>

                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Address</p>
                  <p className="text-xs font-semibold text-zinc-700 mt-0.5 whitespace-pre-wrap leading-relaxed">{address}</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-2 border-t md:border-t-0 md:border-l border-zinc-200 pt-6 md:pt-0 md:pl-6 shrink-0">
                <div className="w-40 h-24 bg-zinc-50 border border-zinc-200 overflow-hidden shrink-0 shadow-xs">
                  <img src={photo} alt="Student" className="w-full h-full object-cover" />
                </div>
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">Uploaded Photo</span>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-900 text-white font-bold text-xs rounded-none shadow-sm transition-colors cursor-pointer border-none font-semibold text-center uppercase tracking-wider"
              >
                Print Receipt
              </button>
              <Link
                href="/scheduled-exams"
                className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-none shadow-sm transition-colors text-center cursor-pointer font-semibold uppercase tracking-wider"
              >
                Go to Exams Directory
              </Link>
            </div>
          </div>
        </main>

        <footer className="py-6 border-t border-zinc-200 bg-white mt-12 text-center text-xs text-zinc-400 shrink-0">
          © 2026 Redlix Secure. Student Applications Portal.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 font-sans text-zinc-900 flex flex-col">
      <header className="bg-orange-500 border-b border-orange-600 py-3.5 px-6 shrink-0 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <nav className="text-xs text-orange-100 font-semibold flex items-center gap-1.5">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-orange-200">/</span>
            <span className="text-white">Student Registration</span>
          </nav>
          <Link href="/scheduled-exams" className="text-xs text-orange-100 hover:text-white flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            Exams List
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-6 flex flex-col justify-center">
        <div className="bg-white border border-zinc-200 shadow-md p-8 sm:p-12 py-12 sm:py-16 space-y-10 relative min-h-[750px] flex flex-col justify-between">
          
          <div className="border-b border-zinc-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Student Registration</h1>
              <p className="text-xs text-zinc-500 mt-1">Submit your profile and choose your fields of interest to join evaluations.</p>
            </div>
            <img 
              src="https://ik.imagekit.io/dypkhqxip/picsihoriz?updatedAt=1778919009480" 
              alt="Logo" 
              className="h-24 w-auto object-contain shrink-0"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8 font-normal flex-1">
            {/* Left Column: Photo Upload, Interests & Turnstile */}
            <div className="md:col-span-5 space-y-6">
              {/* Section 1: Verification Photograph */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">Candidate Photo *</label>
                <div className="flex flex-col gap-4 p-4 bg-zinc-50 border border-zinc-200">
                  <div className="w-40 h-24 bg-zinc-200 flex items-center justify-center overflow-hidden border border-zinc-300 relative shrink-0">
                    {photo ? (
                      <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-zinc-400" />
                    )}
                  </div>
                  <div className="space-y-2 text-left flex-1">
                    <p className="text-[10px] text-zinc-500">Upload a clear landscape (horizontal rectangle) photograph for verification.</p>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-semibold text-red-500">
                        Maximum file size allowed: <span className="font-bold">2 MB</span>
                      </p>
                    </div>
                    <input
                      id="photo-upload-input"
                      type="file"
                      accept="image/*"
                      required
                      onChange={handlePhotoUpload}
                      className="text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-none file:border file:border-zinc-300 file:text-xs file:font-semibold file:bg-white file:text-zinc-700 hover:file:bg-zinc-50 cursor-pointer w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Dropdown Interests */}
              <div className="space-y-4 pt-4 border-t border-zinc-100">
                <div className="space-y-1">
                  <label htmlFor="reg-interests" className="text-xs font-semibold text-zinc-750 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    Your Interests *
                  </label>
                  <select
                    id="reg-interests"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    className="text-xs w-full py-2 px-3 border border-zinc-300 rounded-none bg-white focus:outline-none focus:border-orange-500 font-semibold cursor-pointer"
                  >
                    <option value="Web Development with AI">Web Development with AI</option>
                    <option value="Full Stack Development">Full Stack Development</option>
                    <option value="Marketing Intern">Marketing Intern</option>
                    <option value="Data Science & ML">Data Science & ML</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Product Management">Product Management</option>
                  </select>
                </div>
              </div>

              {/* Section 5: Security Captcha */}
              <div className="border-t border-zinc-200 pt-4 flex flex-col items-start">
                <Turnstile
                  onSuccess={(token) => {
                    setTurnstileToken(token);
                    setErrorMsg("");
                  }}
                  onError={() => setErrorMsg("Security verification encountered an error.")}
                  onExpire={() => setTurnstileToken("")}
                />
              </div>
            </div>

            {/* Right Column: Personal & Academic Details, Action Buttons */}
            <div className="md:col-span-7 space-y-6 border-t md:border-t-0 md:border-l border-zinc-200 pt-6 md:pt-0 md:pl-8">
              {/* Section 2: Personal Details */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Personal Details</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="reg-name" className="text-xs font-semibold text-zinc-750 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      Full Name *
                    </label>
                    <input
                      id="reg-name"
                      type="text"
                      required
                      placeholder="e.g. Marcus Aurelius"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="text-xs w-full py-2 px-3 border border-zinc-300 rounded-none bg-white focus:outline-none focus:border-orange-500 font-medium transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="reg-email" className="text-xs font-semibold text-zinc-750 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      Email Address *
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      placeholder="e.g. marcus@academy.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-xs w-full py-2 px-3 border border-zinc-300 rounded-none bg-white focus:outline-none focus:border-orange-500 font-medium transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="reg-phone" className="text-xs font-semibold text-zinc-750 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      Phone Number *
                    </label>
                    <input
                      id="reg-phone"
                      type="tel"
                      required
                      placeholder="e.g. +91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="text-xs w-full py-2 px-3 border border-zinc-300 rounded-none bg-white focus:outline-none focus:border-orange-500 font-medium transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="reg-dob" className="text-xs font-semibold text-zinc-750 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      Date of Birth *
                    </label>
                    <input
                      id="reg-dob"
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="text-xs w-full py-2 px-3 border border-zinc-300 rounded-none bg-white focus:outline-none focus:border-orange-500 font-medium transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="reg-address" className="text-xs font-semibold text-zinc-750 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    Residential Address *
                  </label>
                  <textarea
                    id="reg-address"
                    required
                    rows={2}
                    placeholder="Enter your complete residential address..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="text-xs w-full py-2 px-3 border border-zinc-300 rounded-none bg-white focus:outline-none focus:border-orange-500 font-medium transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Section 3: Academic Details */}
              <div className="space-y-4 pt-4 border-t border-zinc-100">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Academic Details</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="reg-college" className="text-xs font-semibold text-zinc-750 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      College Name *
                    </label>
                    <input
                      id="reg-college"
                      type="text"
                      required
                      placeholder="e.g. Cambridge University"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      className="text-xs w-full py-2 px-3 border border-zinc-300 rounded-none bg-white focus:outline-none focus:border-orange-500 font-medium transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="reg-branch" className="text-xs font-semibold text-zinc-750 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      Branch / Department *
                    </label>
                    <input
                      id="reg-branch"
                      type="text"
                      required
                      placeholder="e.g. Computer Science"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="text-xs w-full py-2 px-3 border border-zinc-300 rounded-none bg-white focus:outline-none focus:border-orange-500 font-medium transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-4">
                <Link
                  href="/scheduled-exams"
                  className="flex-1 py-2.5 border border-zinc-300 hover:bg-zinc-50 text-zinc-700 font-semibold text-xs rounded-none shadow-sm transition-colors text-center cursor-pointer uppercase tracking-wider"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white font-bold text-xs rounded-none shadow-sm transition-colors cursor-pointer border-none uppercase tracking-wider"
                >
                  {isSubmitting ? "Submitting..." : "Submit Registration"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      <footer className="py-6 border-t border-zinc-200 bg-white mt-12 text-center text-xs text-zinc-400 shrink-0">
        © 2026 Redlix Secure. Student Applications Portal.
      </footer>
    </div>
  );
}
