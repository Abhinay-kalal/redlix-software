"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Users,
  Trophy,
  ShieldCheck,
  CreditCard,
  Lock,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info
} from "lucide-react";

interface Hackathon {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  teamSize: number;
  type: string;
  phases: string | null;
  image: string | null;
  prizeFirst: string | null;
  prizeSecond: string | null;
  prizeThird: string | null;
  perks: string | null;
  registrationFee: number;
  hasFee: boolean;
}

export default function RegisterHackathonPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Registration Form State
  const [teamName, setTeamName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [registeredTeamId, setRegisteredTeamId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Credit Card Form State (For Mock Payment Form)
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/hackathons/${id}`);
        const json = await res.json();
        if (json.success) {
          setHackathon(json.data);
        } else {
          setErrorMsg(json.error || "Failed to load hackathon details");
        }
      } catch (err) {
        console.error("Error fetching hackathon details:", err);
        setErrorMsg("Failed to connect to the backend server.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleCardNumberChange = (value: string) => {
    // Only allow digits and limit to 16 digits, formatting as 4-4-4-4
    const digits = value.replace(/\D/g, "").slice(0, 16);
    const parts = [];
    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.substring(i, i + 4));
    }
    setCardNumber(parts.join(" "));
  };

  const handleExpiryChange = (value: string) => {
    // format as MM/YY
    const clean = value.replace(/\D/g, "").slice(0, 4);
    if (clean.length >= 3) {
      setCardExpiry(`${clean.slice(0, 2)}/${clean.slice(2, 4)}`);
    } else {
      setCardExpiry(clean);
    }
  };

  const handleCvvChange = (value: string) => {
    const clean = value.replace(/\D/g, "").slice(0, 4);
    setCardCvv(clean);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hackathon) return;
    if (!teamName.trim()) {
      setErrorMsg("Please enter a team name.");
      return;
    }

    if (hackathon.hasFee) {
      if (!cardName.trim() || cardNumber.replace(/\s/g, "").length < 16 || cardExpiry.length < 5 || cardCvv.length < 3) {
        setErrorMsg("Please complete all credit card information fields.");
        return;
      }
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: teamName.trim(),
          hackathonId: hackathon.id,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setRegisteredTeamId(json.data.id);
      } else {
        setErrorMsg(json.error || "Failed to register team. Double check the details.");
      }
    } catch (err) {
      setErrorMsg("A network error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyId = () => {
    if (!registeredTeamId) return;
    navigator.clipboard.writeText(registeredTeamId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
        <p className="text-zinc-650 text-xs font-semibold">Initiating checkout pipeline...</p>
      </div>
    );
  }

  if (errorMsg && !hackathon) {
    return (
      <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center font-sans p-6 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-lg font-black text-zinc-950 uppercase tracking-tight">Checkout Error</h2>
        <p className="text-xs text-zinc-650 max-w-sm">{errorMsg}</p>
        <Link
          href="/hackathons"
          className="px-4 py-2 bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-colors"
        >
          Back to Hackathons
        </Link>
      </div>
    );
  }

  if (!hackathon) return null;

  return (
    <div className="min-h-screen bg-zinc-100 font-sans text-zinc-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-orange-500 border-b border-orange-600 py-3.5 px-6 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/hackathons" className="text-white hover:text-orange-100 transition-colors">
              <ArrowLeft className="h-4.5 w-4.5" />
            </Link>
            <nav className="text-xs text-orange-100 font-semibold flex items-center gap-1.5">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span className="text-orange-200">/</span>
              <Link href="/hackathons" className="hover:text-white transition-colors">Hackathons</Link>
              <span className="text-orange-200">/</span>
              <span className="text-white">Registration Checkout</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col justify-center">
        {registeredTeamId ? (
          /* SUCCESS VIEW */
          <div className="max-w-xl w-full mx-auto bg-white border border-zinc-200 shadow-xl p-8 space-y-6 text-center">
            <div className="mx-auto bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 w-20 h-20 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black uppercase tracking-tight text-zinc-950">Registration Complete!</h2>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Your team has been enrolled into <span className="font-bold text-zinc-800">{hackathon.title}</span>.
              </p>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 p-6 space-y-3 font-mono text-xs max-w-md mx-auto">
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-extrabold">Your Unique Team Identifier (Team ID)</p>

              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={registeredTeamId}
                  className="flex-1 p-2 bg-white border border-zinc-300 text-zinc-900 text-xs font-bold text-center select-all focus:outline-none"
                />
                <button
                  onClick={handleCopyId}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <p className="text-[10px] text-zinc-500 normal-case leading-relaxed font-sans mt-2">
                💡 <span className="font-semibold text-zinc-800">Critical:</span> Save this Team ID! You must provide it when submitting your final codebase and demo links on the dashboard.
              </p>
            </div>

            <div className="pt-4 border-t border-zinc-200 flex justify-center">
              <Link
                href="/hackathons"
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                Back to Evaluation Panel
              </Link>
            </div>
          </div>
        ) : (
          /* FORM VIEW */
          <div className="grid md:grid-cols-12 gap-8 items-start">
            {/* Left Column: Hackathon Details */}
            <div className="md:col-span-5 bg-white border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
              {/* Event Cover Image */}
              <div className="relative h-44 w-full bg-zinc-900">
                {hackathon.image ? (
                  <img
                    src={hackathon.image}
                    alt={hackathon.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 via-orange-500 to-zinc-900 flex items-center justify-center opacity-85">
                    <Trophy className="h-16 w-16 text-white/30" />
                  </div>
                )}
                <div className="absolute bottom-3 left-3 flex gap-1.5">
                  <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 bg-zinc-900/85 text-white backdrop-blur-xs">
                    {hackathon.type}
                  </span>
                  <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 ${hackathon.hasFee ? "bg-orange-500 text-white" : "bg-emerald-500 text-white"
                    }`}>
                    {hackathon.hasFee ? `₹${hackathon.registrationFee.toLocaleString("en-IN")} Fee` : "Free Entry"}
                  </span>
                </div>
              </div>

              {/* Event Stats */}
              <div className="p-6 space-y-6">
                <div className="space-y-1">
                  <h2 className="text-lg font-black uppercase tracking-tight text-zinc-950 leading-snug">{hackathon.title}</h2>
                  {hackathon.description && (
                    <p className="text-xs text-zinc-500 leading-relaxed font-normal">{hackathon.description}</p>
                  )}
                </div>

                <div className="space-y-3.5 border-t border-zinc-150 pt-4">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
                    <span className="flex items-center gap-1.5 text-zinc-400">
                      <Calendar className="h-4 w-4 text-orange-500" /> Timeline
                    </span>
                    <span className="text-zinc-900 font-bold">{formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
                    <span className="flex items-center gap-1.5 text-zinc-400">
                      <Users className="h-4 w-4 text-orange-500" /> Max Team Size
                    </span>
                    <span className="text-zinc-900 font-bold">{hackathon.teamSize} Candidates</span>
                  </div>
                </div>

                {/* Prize Info */}
                {(hackathon.prizeFirst || hackathon.prizeSecond || hackathon.prizeThird) && (
                  <div className="bg-zinc-50 border border-zinc-200 p-4 space-y-3">
                    <p className="text-[9px] text-zinc-400 uppercase font-extrabold tracking-wider flex items-center gap-1.5">
                      <Trophy className="h-3.5 w-3.5 text-orange-500" /> Prize Distribution
                    </p>
                    <div className="space-y-2 text-xs font-bold text-zinc-800">
                      {hackathon.prizeFirst && (
                        <div className="flex justify-between items-center bg-white p-2 border border-zinc-200">
                          <span className="text-[10px] text-zinc-400 uppercase">First Place</span>
                          <span className="text-orange-500 text-sm font-black">{hackathon.prizeFirst}</span>
                        </div>
                      )}
                      {hackathon.prizeSecond && (
                        <div className="flex justify-between items-center bg-white p-2 border border-zinc-200">
                          <span className="text-[10px] text-zinc-400 uppercase">Second Place</span>
                          <span className="text-zinc-700 text-sm font-extrabold">{hackathon.prizeSecond}</span>
                        </div>
                      )}
                      {hackathon.prizeThird && (
                        <div className="flex justify-between items-center bg-white p-2 border border-zinc-200">
                          <span className="text-[10px] text-zinc-400 uppercase">Third Place</span>
                          <span className="text-zinc-650 text-sm font-extrabold">{hackathon.prizeThird}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Perks Info */}
                {hackathon.perks && (
                  <div className="space-y-2 border-t border-zinc-150 pt-4">
                    <p className="text-[9px] text-zinc-400 uppercase font-extrabold tracking-wider">What You Gain</p>
                    <div className="flex flex-wrap gap-1.5">
                      {hackathon.perks.split(/[,\n]/).map((perk, idx) => {
                        const clean = perk.trim();
                        if (!clean) return null;
                        return (
                          <span key={idx} className="bg-orange-50 border border-orange-100 text-orange-800 text-[10px] px-2.5 py-0.5 font-semibold">
                            ✓ {clean}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Checkout Form */}
            <div className="md:col-span-7 bg-white border border-zinc-200 shadow-sm p-6 space-y-6">
              <div className="space-y-1 pb-4 border-b border-zinc-200">
                <h2 className="text-lg font-black uppercase tracking-tight text-zinc-950">Team Checkout</h2>
                <p className="text-xs text-zinc-500">
                  Submit details to establish your development team workspace.
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-6">
                {/* Team Name Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Team Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lambda Hackers"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="block w-full px-3 py-2.5 bg-white border border-zinc-300 text-xs text-zinc-900 rounded-none focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
                  />
                  <p className="text-[10px] text-zinc-400 leading-normal">
                    This identifier will define your team on the public scoreboard. Make it unique.
                  </p>
                </div>

                {/* PAYMENT SECTION (Only shown if hackathon has fee) */}
                {hackathon.hasFee && (
                  <div className="space-y-6 pt-4 border-t border-zinc-200">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-orange-500" />
                      <h3 className="text-xs font-black uppercase tracking-tight text-zinc-950">Secure Card Payment</h3>
                    </div>

                    {/* interactive mock card graphic */}
                    <div className="w-full max-w-sm mx-auto bg-gradient-to-br from-zinc-800 to-zinc-950 p-6 shadow-xl text-white font-mono rounded-none relative overflow-hidden flex flex-col justify-between aspect-[1.586/1] border border-zinc-700/50">
                      {/* background mesh design element */}
                      <div className="absolute right-[-40px] top-[-40px] w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

                      <div className="flex justify-between items-start">
                        <div className="bg-gradient-to-r from-amber-400 to-yellow-200 w-11 h-8 rounded-md border border-amber-300" />
                        <span className="text-[9px] uppercase tracking-wider font-sans font-bold bg-white/10 px-2 py-0.5">Mock Pay</span>
                      </div>

                      <div className="space-y-1 my-3">
                        <span className="text-[8px] uppercase tracking-widest text-zinc-500 block">Card Number</span>
                        <div className="text-base tracking-widest font-bold text-zinc-100 min-h-[24px]">
                          {cardNumber || "•••• •••• •••• ••••"}
                        </div>
                      </div>

                      <div className="flex justify-between text-xs">
                        <div className="space-y-0.5 flex-1 pr-4">
                          <span className="text-[8px] uppercase tracking-widest text-zinc-500 block">Cardholder</span>
                          <div className="uppercase font-bold truncate min-h-[16px] text-zinc-100 text-[10px]">
                            {cardName || "NAME ON CARD"}
                          </div>
                        </div>
                        <div className="space-y-0.5 flex gap-4 shrink-0">
                          <div>
                            <span className="text-[8px] uppercase tracking-widest text-zinc-500 block">Expiry</span>
                            <div className="font-bold min-h-[16px] text-zinc-100 text-[10px]">
                              {cardExpiry || "MM/YY"}
                            </div>
                          </div>
                          <div>
                            <span className="text-[8px] uppercase tracking-widest text-zinc-500 block">CVV</span>
                            <div className="font-bold min-h-[16px] text-zinc-100 text-[10px]">
                              {cardCvv || "•••"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card inputs */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Cardholder Name</label>
                        <input
                          type="text"
                          required={hackathon.hasFee}
                          placeholder="e.g. Alex Johnson"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="block w-full px-3 py-2 bg-white border border-zinc-300 text-xs text-zinc-900 rounded-none focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Card Number</label>
                        <input
                          type="text"
                          required={hackathon.hasFee}
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          className="block w-full px-3 py-2 bg-white border border-zinc-300 text-xs text-zinc-900 rounded-none focus:outline-none focus:border-orange-500 transition-colors shadow-xs font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Expiry Date</label>
                          <input
                            type="text"
                            required={hackathon.hasFee}
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => handleExpiryChange(e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-zinc-300 text-xs text-zinc-900 rounded-none focus:outline-none focus:border-orange-500 transition-colors shadow-xs font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider">CVC/CVV</label>
                          <input
                            type="password"
                            required={hackathon.hasFee}
                            placeholder="123"
                            value={cardCvv}
                            onChange={(e) => handleCvvChange(e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-zinc-300 text-xs text-zinc-900 rounded-none focus:outline-none focus:border-orange-500 transition-colors shadow-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Receipt breakdown */}
                    <div className="bg-zinc-50 border border-zinc-200 p-4 text-xs font-semibold text-zinc-700 space-y-2.5">
                      <div className="flex justify-between">
                        <span>Registration Fee</span>
                        <span className="text-zinc-900 font-bold">₹{hackathon.registrationFee.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing Fee</span>
                        <span className="text-zinc-900 font-bold">₹0.00</span>
                      </div>
                      <div className="flex justify-between border-t border-zinc-200 pt-2.5 text-sm font-bold text-zinc-950">
                        <span>Total Paid</span>
                        <span className="text-orange-500 font-black">₹{hackathon.registrationFee.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 text-[10px] text-zinc-500 leading-normal bg-zinc-50 border border-zinc-200 p-3">
                      <Lock className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p>
                        Your payment information is encrypted and transmitted securely. This is a simulated transaction for testing purposes. No actual money will be charged.
                      </p>
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <p className="text-xs text-red-650 font-semibold flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    {errorMsg}
                  </p>
                )}

                {/* Submit button */}
                <div className="pt-4 border-t border-zinc-150 flex gap-4 items-center justify-between">
                  <span className="text-[10px] text-zinc-400 font-mono">By registering, you agree to comply with evaluation rules.</span>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold text-xs uppercase tracking-wider rounded-none shadow-sm transition-colors cursor-pointer flex items-center gap-2 shrink-0"
                  >
                    {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {hackathon.hasFee ? "Authorize & Register" : "Register Team"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <footer className="py-8 border-t border-zinc-200 bg-white mt-12 text-center text-xs text-zinc-400">
        © 2026 Redlix Secure. Hackathon Platform Registry. Secure Checkout Node.
      </footer>
    </div>
  );
}
