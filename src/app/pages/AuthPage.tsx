import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, Eye, EyeOff, ShieldCheck, Sparkles, CheckCircle2,
  Lock, Mail, User, Phone, ArrowRight, Building2, UserCheck, Users, KeyRound, MailCheck
} from "lucide-react";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { BrandLogo } from "../components/Logo";
import { AnimatedOtpInput } from "../components/AnimatedOtpInput";
import type { AuthMode, UserProfile } from "../types";
import { registerUserInNeon, findUserInNeon, verifyUserPassword, OAUTH_PASSWORD_MARKER } from "../lib/db";
import { sendOtpViaResend } from "../lib/email";

const OTP_RESEND_COOLDOWN = 30;

interface AuthPageProps {
  initialMode?: AuthMode;
  onSuccess: (user: UserProfile) => void;
  onBackToHome: () => void;
}

export function AuthPage({ initialMode = "signin", onSuccess, onBackToHome }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sign In state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up state
  const [fullName, setFullName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"patient" | "family" | "enterprise">("family");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  // Interactive OTP Modal state for Sign In & Sign Up
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [activeOtpCode, setActiveOtpCode] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [pendingUser, setPendingUser] = useState<UserProfile | null>(null);
  const [otpStatus, setOtpStatus] = useState<"idle" | "error" | "success">("idle");
  const [otpDelivered, setOtpDelivered] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  // Anchors the email thread for this OTP attempt — a fresh id per sign-in/sign-up
  // submit keeps each attempt its own conversation in the inbox; "Resend" reuses
  // the same id so it chains onto that thread instead of starting a new one.
  const [otpThreadId, setOtpThreadId] = useState("");

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail || !signInPassword) {
      toast.error("Please fill in both email and password.");
      return;
    }
    setLoading(true);

    // Look up the account and actually validate the password before doing anything else
    const neonUser = await findUserInNeon(signInEmail);

    if (!neonUser) {
      setLoading(false);
      toast.error("No account found with this email. Please create one first.");
      return;
    }

    if (neonUser.password_hash === OAUTH_PASSWORD_MARKER) {
      setLoading(false);
      toast.error("This account uses Google Sign-In. Please continue with Google instead.");
      return;
    }

    const passwordValid = await verifyUserPassword(signInPassword, neonUser.password_hash);
    if (!passwordValid) {
      setLoading(false);
      toast.error("Incorrect password. Please try again.");
      return;
    }

    const userProfile: UserProfile = {
      name: neonUser.full_name,
      email: neonUser.email,
      role: neonUser.role || "family",
      plan: neonUser.role === "enterprise" ? "Enterprise TPA" : neonUser.role === "family" ? "Family Pro" : "Individual",
    };

    // Generate 6-digit verification OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const threadId = crypto.randomUUID();
    setOtpThreadId(threadId);
    setActiveOtpCode(generatedOtp);
    setOtpEmail(signInEmail);
    setPendingUser(userProfile);
    setOtpStatus("idle");
    setEnteredOtp("");
    setShowOtpModal(true);
    setResendCooldown(OTP_RESEND_COOLDOWN);

    // Send OTP via Resend API (server-side relay)
    setOtpSending(true);
    const emailRes = await sendOtpViaResend(signInEmail, generatedOtp, threadId, false);
    setOtpSending(false);
    setLoading(false);
    setOtpDelivered(emailRes.success);

    if (emailRes.success) {
      toast.success(`Verification code sent to ${signInEmail}`);
    } else {
      toast.info(`Couldn't email the code — showing it below instead.`);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !signUpEmail || !signUpPassword) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!agreeTerms) {
      toast.error("Please accept the Terms of Service to continue.");
      return;
    }
    setLoading(true);

    // 1. Save user to Neon DB first — bail out if the email is already registered
    const registerRes = await registerUserInNeon(fullName, signUpEmail, signUpPassword, role);
    if (!registerRes.success) {
      setLoading(false);
      if (registerRes.error?.includes("duplicate key") || registerRes.error?.includes("users_email_key")) {
        toast.error("An account with this email already exists. Try signing in instead.");
      } else {
        toast.error("Couldn't create your account. Please try again.");
      }
      return;
    }

    // 2. Generate 6-digit verification OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const threadId = crypto.randomUUID();
    setOtpThreadId(threadId);
    setActiveOtpCode(otpCode);
    setOtpEmail(signUpEmail);
    setOtpStatus("idle");
    setEnteredOtp("");

    const newUserProfile: UserProfile = {
      name: fullName,
      email: signUpEmail,
      role,
      plan: role === "enterprise" ? "Enterprise TPA" : role === "family" ? "Family Pro" : "Individual",
    };
    setPendingUser(newUserProfile);

    setShowOtpModal(true);
    setResendCooldown(OTP_RESEND_COOLDOWN);

    // 3. Dispatch email via Resend API (server-side relay)
    setOtpSending(true);
    const emailRes = await sendOtpViaResend(signUpEmail, otpCode, threadId, false);
    setOtpSending(false);
    setLoading(false);
    setOtpDelivered(emailRes.success);

    if (emailRes.success) {
      toast.success(`Verification code sent to ${signUpEmail}`);
    } else {
      toast.info(`Couldn't email the code — showing it below instead.`);
    }
  };

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredOtp || enteredOtp.trim() !== activeOtpCode.trim()) {
      setOtpStatus("error");
      toast.error("Invalid OTP code. Please check your email and try again.");
      return;
    }

    setOtpStatus("success");
    toast.success("OTP verified successfully! Welcome to ClaimSense.");
    setTimeout(() => {
      setShowOtpModal(false);
      if (pendingUser) {
        onSuccess(pendingUser);
      }
    }, 700);
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || otpSending) return;
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setActiveOtpCode(newCode);
    setEnteredOtp("");
    setOtpStatus("idle");
    setOtpSending(true);
    setResendCooldown(OTP_RESEND_COOLDOWN);
    const emailRes = await sendOtpViaResend(otpEmail, newCode, otpThreadId, true);
    setOtpSending(false);
    setOtpDelivered(emailRes.success);

    if (emailRes.success) {
      toast.success(`Fresh code sent to ${otpEmail}`);
    } else {
      toast.error(`Couldn't send email — showing the code below instead.`);
    }
  };

  const handleQuickDemoLogin = (preset: "patient" | "family" | "enterprise") => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (preset === "family") {
        toast.success("Signed in as Demo Family Manager (Dr. Ananya Sharma)");
        onSuccess({
          name: "Dr. Ananya Sharma",
          email: "ananya.sharma@claimsense.in",
          role: "family",
          plan: "Family Pro",
          avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        });
      } else if (preset === "patient") {
        toast.success("Signed in as Demo Patient (Rajesh Kumar)");
        onSuccess({
          name: "Rajesh Kumar",
          email: "rajesh.k@gmail.com",
          role: "patient",
          plan: "Individual",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        });
      } else {
        toast.success("Signed in as Enterprise TPA Manager (MedTech TPA)");
        onSuccess({
          name: "Sanjay Bhatia (MedTech)",
          email: "sanjay.b@medtechtpa.com",
          role: "enterprise",
          plan: "Enterprise",
          avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
        });
      }
    }, 600);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Please enter your registered email.");
      return;
    }
    setLoading(true);
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const emailRes = await sendOtpViaResend(forgotEmail, resetOtp, crypto.randomUUID(), false);
    setLoading(false);

    if (emailRes.success) {
      toast.success(`Password reset OTP (${resetOtp}) sent to ${forgotEmail} via Resend!`);
    } else {
      toast.success(`Password reset code (${resetOtp}) generated for ${forgotEmail}`);
    }

    setShowForgotModal(false);
    setForgotEmail("");
  };

  // Password strength checker
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { label: "", score: 0, color: "bg-gray-200" };
    if (pass.length < 6) return { label: "Weak", score: 1, color: "bg-red-500" };
    if (pass.length < 10 || !/[A-Z]/.test(pass) || !/[0-9]/.test(pass)) {
      return { label: "Medium", score: 2, color: "bg-amber-500" };
    }
    return { label: "Strong", score: 3, color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(signUpPassword);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between relative overflow-hidden text-slate-100 font-sans">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-lg backdrop-blur-md border border-white/10"
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>
        <BrandLogo size={28} textSize="base" />
        <div className="hidden sm:block text-xs text-slate-400">
          🔒 256-bit Encrypted • IRDAI Compliant
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 max-w-5xl w-full mx-auto px-4 py-6 my-auto">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Value Proposition & Social Proof */}
          <div className="lg:col-span-5 bg-gradient-to-br from-blue-900/90 via-slate-900 to-indigo-950 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-700/60 relative">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
                <Sparkles size={13} />
                <span>Next-Gen Healthcare Audit</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
                Protect your family from inflated hospital bills & claim rejections.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Join thousands of patients, doctors, and families saving lakhs using ClaimSense AI.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  "Scan hospital bills with 99.2% OCR accuracy",
                  "Detect room rent violations & hidden charges",
                  "Auto-generate IRDAI-compliant legal appeal letters",
                  "30-day SLA countdown & delay triggers",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Testimonial Banner */}
            <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
              <p className="text-xs italic text-slate-300">
                &ldquo;ClaimSense recovered ₹1.8L from a rejected claim. The bill auditor flagged every hidden charge!&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow">
                  KN
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Dr. Kavitha Nair</div>
                  <div className="text-[10px] text-slate-400">Oncologist, Chennai</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sign In / Sign Up Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-900/80 p-1.5 rounded-xl border border-slate-700/80 mb-6">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  mode === "signin"
                    ? "bg-primary text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <UserCheck size={16} />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  mode === "signup"
                    ? "bg-primary text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Users size={16} />
                Create Account
              </button>
            </div>

            {/* Tab Form Containers */}
            <AnimatePresence mode="wait">
              {mode === "signin" ? (
                <motion.form
                  key="signin"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSignInSubmit}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Email Address or Phone</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-medium text-slate-300">Password</label>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Keep me signed in</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Sign In <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  {/* Google OAuth 2.0 Sign In Button */}
                  <div className="flex flex-col items-center justify-center my-3">
                    <GoogleLogin
                      onSuccess={async (credentialResponse) => {
                        if (credentialResponse.credential) {
                          try {
                            const decoded: any = jwtDecode(credentialResponse.credential);
                            const name = decoded.name || "Google User";
                            const email = decoded.email || "";
                            const picture = decoded.picture || "";

                            // Verify or save user in Neon DB
                            if (email) {
                              const existing = await findUserInNeon(email);
                              if (!existing) {
                                await registerUserInNeon(name, email, OAUTH_PASSWORD_MARKER, "family");
                              }
                            }

                            toast.success(`Welcome ${name}! (Verified by Google)`);
                            onSuccess({
                              name,
                              email,
                              role: "family",
                              plan: "Family Pro",
                              avatar: picture,
                            });
                          } catch (err) {
                            console.error("Google token decode error:", err);
                            toast.error("Google login succeeded, but token parsing failed.");
                          }
                        }
                      }}
                      onError={() => {
                        toast.error("Google Sign-In failed. Please check client ID setup.");
                      }}
                      theme="filled_blue"
                      shape="pill"
                    />
                  </div>

                  {/* Divider */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-slate-800 px-2 text-slate-400">Or Quick Demo Login</span>
                    </div>
                  </div>

                  {/* 1-Click Quick Demo Account Presets */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin("family")}
                      className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-700/80 border border-slate-700/80 text-left transition-colors text-xs flex flex-col gap-1"
                    >
                      <div className="font-semibold text-blue-300 flex items-center gap-1">
                        <Users size={12} /> Family Pro
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">Dr. Ananya</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin("patient")}
                      className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-700/80 border border-slate-700/80 text-left transition-colors text-xs flex flex-col gap-1"
                    >
                      <div className="font-semibold text-emerald-300 flex items-center gap-1">
                        <User size={12} /> Patient
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">Rajesh K.</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin("enterprise")}
                      className="p-2 rounded-lg bg-slate-900/60 hover:bg-slate-700/80 border border-slate-700/80 text-left transition-colors text-xs flex flex-col gap-1"
                    >
                      <div className="font-semibold text-amber-300 flex items-center gap-1">
                        <Building2 size={12} /> TPA Admin
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">MedTech TPA</div>
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.form
                  key="signup"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSignUpSubmit}
                  className="space-y-3.5"
                >
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Priya Sharma"
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Email Address</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={signUpEmail}
                          onChange={(e) => setSignUpEmail(e.target.value)}
                          placeholder="priya@example.com"
                          className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">Mobile Number</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Account Type Selector */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Account Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "patient", label: "Patient", icon: User },
                        { id: "family", label: "Family", icon: Users },
                        { id: "enterprise", label: "Insurer / TPA", icon: Building2 },
                      ].map((typeItem) => {
                        const Icon = typeItem.icon;
                        const isSelected = role === typeItem.id;
                        return (
                          <button
                            key={typeItem.id}
                            type="button"
                            onClick={() => setRole(typeItem.id as any)}
                            className={`py-2 px-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                              isSelected
                                ? "bg-blue-600/30 border-blue-500 text-blue-300"
                                : "bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            <Icon size={14} />
                            <span>{typeItem.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-lg pl-9 pr-10 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {signUpPassword && (
                      <div className="flex items-center gap-2 pt-1">
                        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden flex gap-1">
                          <div className={`h-full ${strength.score >= 1 ? strength.color : ""} transition-all`} style={{ width: "33%" }} />
                          <div className={`h-full ${strength.score >= 2 ? strength.color : ""} transition-all`} style={{ width: "33%" }} />
                          <div className={`h-full ${strength.score >= 3 ? strength.color : ""} transition-all`} style={{ width: "33%" }} />
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">{strength.label}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-1">
                    <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-[11px] leading-snug text-slate-400">
                        I agree to the <a href="#" className="text-blue-400 underline">Terms of Service</a> & <a href="#" className="text-blue-400 underline">Privacy Policy</a> compliant with IRDAI standards.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Create Free Account <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 6-Digit OTP Verification Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 10 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-5 sm:p-8 max-w-md w-full shadow-2xl shadow-blue-950/50 space-y-5 text-slate-100 relative overflow-hidden"
            >
              {/* Ambient glow accents */}
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3 relative">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0"
                >
                  <ShieldCheck size={22} />
                </motion.div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight">Enter 6-Digit Verification Code</h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5 truncate">
                    {otpSending ? (
                      <>
                        <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        Sending to <span className="text-blue-400 font-medium">{otpEmail}</span>...
                      </>
                    ) : otpDelivered ? (
                      <>
                        <MailCheck size={13} className="text-emerald-400" />
                        Sent to <span className="text-blue-400 font-medium">{otpEmail}</span>
                      </>
                    ) : (
                      <>For <span className="text-blue-400 font-medium">{otpEmail}</span></>
                    )}
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                <div className="flex flex-col items-center gap-1 py-2">
                  <AnimatedOtpInput
                    value={enteredOtp}
                    onChange={(v) => {
                      setEnteredOtp(v);
                      if (otpStatus === "error") setOtpStatus("idle");
                    }}
                    status={otpStatus}
                  />
                </div>

                {!otpDelivered && !otpSending && activeOtpCode && (
                  <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between text-xs">
                    <span className="text-slate-300 text-[11px] leading-snug">⚠️ Email delivery unavailable — dev code: <strong className="font-mono text-amber-300">{activeOtpCode}</strong></span>
                    <button
                      type="button"
                      onClick={() => setEnteredOtp(activeOtpCode)}
                      className="text-[11px] font-semibold text-blue-300 hover:text-white bg-blue-600/40 hover:bg-blue-600/60 px-2 py-1 rounded border border-blue-400/30 transition-colors shrink-0 self-start sm:self-auto"
                    >
                      Auto-fill
                    </button>
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-slate-700/60">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || otpSending}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors disabled:text-slate-500 disabled:cursor-not-allowed text-center sm:text-left"
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowOtpModal(false)}
                      className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={enteredOtp.length !== 6}
                      className="flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Verify & Sign In
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-blue-400">
                <KeyRound size={24} />
                <h3 className="text-lg font-semibold text-white">Reset Password</h3>
              </div>
              <p className="text-xs text-slate-300">
                Enter your registered email address and we will send you a secure password reset link.
              </p>
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="relative z-10 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} ClaimSense Health Technologies Inc. All rights reserved.
      </div>
    </div>
  );
}
