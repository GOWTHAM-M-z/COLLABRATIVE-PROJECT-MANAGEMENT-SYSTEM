"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CanvasRevealEffect, MiniNavbar } from "@/components/ui/sign-in-flow-1";
import { SpringDotsCanvas } from "@/components/ui/SpringDotsCanvas";
import { GoogleMockModal } from "@/components/ui/google-mock-modal";

const RegisterBackground = React.memo(function RegisterBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <SpringDotsCanvas />
    </div>
  );
});

export default function RegisterPage() {
  const router = useRouter();

  const [showGoogleMock, setShowGoogleMock] = useState(false);

  const handleGoogleAuth = () => {
    setShowGoogleMock(true);
  };

  const handleSelectAccount = (selectedEmail: string) => {
    setShowGoogleMock(false);
    
    // Save to users list if not already registered
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (!users.find((u: any) => u.email === selectedEmail)) {
      users.push({ email: selectedEmail, password: "google-auth" });
      localStorage.setItem("users", JSON.stringify(users));
    }

    localStorage.setItem("token", "demo-google-token-" + Date.now());
    localStorage.setItem("user", JSON.stringify({ email: selectedEmail, role: "USER" }));
    router.push("/dashboard");
  };

  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  // OTP countdown timer
  useEffect(() => {
    if (step !== "otp") return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // Focus first OTP input when OTP step appears
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 500);
    }
  }, [step]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "Minimum 6 characters";
    if (password !== confirmPassword) errs.confirmPassword = "Passwords don't match";
    if (!agreeTerms) errs.terms = "You must agree to the terms";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegisterSubmit = async () => {
    if (!validate()) return;

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    if (users.find((u: any) => u.email === email)) {
      setErrors({ email: "Email already registered. Redirecting to login..." });
      setTimeout(() => router.push("/login"), 2000);
      return;
    }

    setIsLoading(true);

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1000));
    
    // Save new user
    users.push({ email, password });
    localStorage.setItem("users", JSON.stringify(users));

    // Store user info
    localStorage.setItem("token", "demo-token-" + Date.now());
    localStorage.setItem("user", JSON.stringify({ email, role: "USER" }));
    
    setIsLoading(false);
    setStep("success");
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Focus next input
      if (value && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }

      // Auto-verify when all digits entered
      if (index === 5 && value) {
        const isComplete = newOtp.every((digit) => digit.length === 1);
        if (isComplete) {
          verifyOtp(newOtp.join(""));
        }
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async (code: string) => {
    if (code !== generatedOtp) {
      setOtp(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
      setOtpError("Invalid verification code. Please try again.");
      return;
    }

    setIsVerifying(true);
    setOtpError("");
    // Simulate OTP verification
    await new Promise((r) => setTimeout(r, 1500));
    
    // Save new user
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    users.push({ email, password });
    localStorage.setItem("users", JSON.stringify(users));

    // Store user info
    localStorage.setItem("token", "demo-token-" + Date.now());
    localStorage.setItem("user", JSON.stringify({ email, role: "USER" }));
    
    setIsVerifying(false);
    setStep("success");
  };

  const handleResendOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    setOtpTimer(60);
    setCanResend(false);
    setOtpError("");
    otpInputRefs.current[0]?.focus();

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otpCode);
    
    // Call actual email API
    try {
      fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });
    } catch (e) {
      console.error("Email failed to send", e);
    }
  };

  return (
    <div className="flex w-[100%] flex-col min-h-screen bg-black dark:bg-black light:bg-white relative transition-colors duration-300">
      {/* Canvas reveal background */}
      <RegisterBackground />

      <GoogleMockModal 
        isOpen={showGoogleMock} 
        onClose={() => setShowGoogleMock(false)} 
        onSelectAccount={handleSelectAccount} 
      />

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col flex-1">
        <MiniNavbar />

        <div className="flex flex-1 flex-col items-center justify-center py-12">
          <div className="w-full mt-[80px] max-w-sm px-4">
            <AnimatePresence mode="wait">
              {/* ─── Step 1: Email & Password Form ─── */}
              {step === "form" && (
                <motion.div
                  key="form-step"
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-3 text-center"
                >
                  <div className="space-y-1 mb-4">
                    <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">
                      Create your account
                    </h1>
                    <p className="text-[1rem] text-white/50 font-light">
                      Start your journey with TeamMerge Pro
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Email */}
                    <div>
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrors((prev) => ({ ...prev, email: "" }));
                        }}
                        className={`w-full bg-white/5 text-white placeholder:text-white/40 border border-white/20 rounded-full py-3 px-4 focus:outline-none focus:border-white/50 focus:bg-white/10 text-center text-sm transition-all ${
                          errors.email ? "border-red-500/80" : ""
                        }`}
                      />
                      {errors.email && (
                        <p className="text-red-400 text-xs mt-1 text-center">{errors.email}</p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setErrors((prev) => ({ ...prev, password: "" }));
                        }}
                        className={`w-full bg-white/5 text-white placeholder:text-white/40 border border-white/20 rounded-full py-3 px-4 focus:outline-none focus:border-white/50 focus:bg-white/10 text-center text-sm transition-all ${
                          errors.password ? "border-red-500/80" : ""
                        }`}
                      />
                      {errors.password && (
                        <p className="text-red-400 text-xs mt-1 text-center">{errors.password}</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                        }}
                        className={`w-full bg-white/5 text-white placeholder:text-white/40 border border-white/20 rounded-full py-3 px-4 focus:outline-none focus:border-white/50 focus:bg-white/10 text-center text-sm transition-all ${
                          errors.confirmPassword ? "border-red-500/80" : ""
                        }`}
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-400 text-xs mt-1 text-center">{errors.confirmPassword}</p>
                      )}
                    </div>

                    {/* Terms checkbox */}
                    <div className="pt-1">
                      <label className="flex items-center justify-center gap-2 cursor-pointer select-none text-left">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => {
                            setAgreeTerms(e.target.checked);
                            setErrors((prev) => ({ ...prev, terms: "" }));
                          }}
                          className="w-4 h-4 rounded border border-white/20 bg-transparent accent-white cursor-pointer"
                        />
                        <span className="text-xs text-white/50">
                          I agree to the{" "}
                          <Link href="#" className="underline text-white/70 hover:text-white transition-colors">
                            Terms of Service
                          </Link>{" "}
                          and{" "}
                          <Link href="#" className="underline text-white/70 hover:text-white transition-colors">
                            Privacy Policy
                          </Link>
                        </span>
                      </label>
                      {errors.terms && (
                        <p className="text-red-400 text-xs mt-1 text-center">{errors.terms}</p>
                      )}
                    </div>

                    {/* Register Button */}
                    <button
                      type="button"
                      onClick={handleRegisterSubmit}
                      disabled={isLoading}
                      className="w-full rounded-full bg-white text-black font-medium py-3 hover:bg-white/90 transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin w-4 h-4 text-black" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" className="opacity-25" />
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="24" strokeLinecap="round" />
                          </svg>
                          Sending OTP...
                        </>
                      ) : (
                        "Continue"
                      )}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 py-2">
                      <div className="h-px bg-white/10 flex-1" />
                      <span className="text-white/40 text-sm">or</span>
                      <div className="h-px bg-white/10 flex-1" />
                    </div>

                    {/* Google Signup */}
                    <button
                      type="button"
                      onClick={handleGoogleAuth}
                      className="w-full rounded-full border border-white/10 bg-transparent text-white font-medium py-3 hover:border-white/30 hover:bg-white/5 transition-colors flex items-center justify-center gap-3 text-sm"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Continue with Google
                    </button>

                    {/* Sign in link */}
                    <div className="text-center pt-2 text-sm text-white/40">
                      Already have an account?{" "}
                      <Link href="/login" className="text-white/70 hover:text-white transition-colors underline">
                        Sign in
                      </Link>
                    </div>
                  </div>

                  <p className="text-xs text-white/40 pt-4">
                    By signing up, you agree to the{" "}
                    <Link href="#" className="underline text-white/40 hover:text-white/60 transition-colors">MSA</Link>,{" "}
                    <Link href="#" className="underline text-white/40 hover:text-white/60 transition-colors">Product Terms</Link>,{" "}
                    <Link href="#" className="underline text-white/40 hover:text-white/60 transition-colors">Policies</Link>,{" "}
                    <Link href="#" className="underline text-white/40 hover:text-white/60 transition-colors">Privacy Notice</Link>, and{" "}
                    <Link href="#" className="underline text-white/40 hover:text-white/60 transition-colors">Cookie Notice</Link>.
                  </p>
                </motion.div>
              )}

              {/* ─── Step 2: OTP Verification ─── */}
              {step === "otp" && (
                <motion.div
                  key="otp-step"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="space-y-6 text-center"
                >
                  <div className="space-y-1">
                    <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">Verify your email</h1>
                    <p className="text-[1rem] text-white/50 font-light">
                      We sent a 6-digit code to
                    </p>
                    <p className="text-sm text-white/70 font-medium">{email}</p>
                  </div>

                  {/* OTP Input */}
                  <div className="w-full">
                    <div className={`relative rounded-full py-4 px-5 border bg-transparent ${otpError ? 'border-red-500' : 'border-white/10'}`}>
                      <div className="flex items-center justify-center">
                        {otp.map((digit, i) => (
                          <div key={i} className="flex items-center">
                            <div className="relative">
                              <input
                                ref={(el) => {
                                  otpInputRefs.current[i] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(i, e.target.value)}
                                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                className="w-8 text-center text-xl bg-transparent text-white border-none focus:outline-none focus:ring-0 appearance-none"
                                style={{ caretColor: "transparent" }}
                              />
                              {!digit && (
                                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
                                  <span className="text-xl text-white/20">0</span>
                                </div>
                              )}
                            </div>
                            {i < 5 && <span className="text-white/20 text-xl">|</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                    {otpError && <p className="text-red-400 text-xs mt-3 text-center">{otpError}</p>}
                  </div>

                  {/* Loading indicator */}
                  {isVerifying && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-2 text-white/50"
                    >
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" className="opacity-25" />
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="24" strokeLinecap="round" />
                      </svg>
                      <span className="text-sm">Verifying...</span>
                    </motion.div>
                  )}

                  {/* Resend / Timer */}
                  <div>
                    {canResend ? (
                      <motion.button
                        onClick={handleResendOtp}
                        className="text-white/50 hover:text-white/70 transition-colors cursor-pointer text-sm underline"
                        whileHover={{ scale: 1.02 }}
                      >
                        Resend code
                      </motion.button>
                    ) : (
                      <p className="text-white/30 text-sm">
                        Resend code in <span className="text-white/60 font-mono">{otpTimer}s</span>
                      </p>
                    )}
                  </div>

                  {/* Back button */}
                  <div className="flex w-full gap-3">
                    <motion.button
                      onClick={() => {
                        setStep("form");
                        setOtp(["", "", "", "", "", ""]);
                      }}
                      className="rounded-full bg-white text-black font-medium px-8 py-3 hover:bg-white/90 transition-colors w-[30%]"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Back
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        const code = otp.join("");
                        if (code.length === 6) verifyOtp(code);
                      }}
                      className={`flex-1 rounded-full font-medium py-3 border transition-all duration-300 ${
                        otp.every((d) => d !== "")
                          ? "bg-white text-black border-transparent hover:bg-white/90 cursor-pointer"
                          : "bg-[#111] text-white/50 border-white/10 cursor-not-allowed"
                      }`}
                      disabled={!otp.every((d) => d !== "") || isVerifying}
                    >
                      Verify & Create Account
                    </motion.button>
                  </div>

                  <div className="pt-8">
                    <p className="text-xs text-white/40">
                      By signing up, you agree to the{" "}
                      <Link href="#" className="underline text-white/40 hover:text-white/60 transition-colors">MSA</Link>,{" "}
                      <Link href="#" className="underline text-white/40 hover:text-white/60 transition-colors">Product Terms</Link>,{" "}
                      <Link href="#" className="underline text-white/40 hover:text-white/60 transition-colors">Policies</Link>,{" "}
                      <Link href="#" className="underline text-white/40 hover:text-white/60 transition-colors">Privacy Notice</Link>, and{" "}
                      <Link href="#" className="underline text-white/40 hover:text-white/60 transition-colors">Cookie Notice</Link>.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ─── Step 3: Success ─── */}
              {step === "success" && (
                <motion.div
                  key="success-step"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
                  className="space-y-6 text-center"
                >
                  <div className="space-y-1">
                    <h1 className="text-[2.5rem] font-bold leading-[1.1] tracking-tight text-white">You&apos;re in!</h1>
                    <p className="text-[1.25rem] text-white/50 font-light">Account created successfully</p>
                  </div>

                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="py-10"
                  >
                    <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-white to-white/70 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    onClick={() => router.push("/login")}
                    className="w-full rounded-full bg-white text-black font-medium py-3 hover:bg-white/90 transition-colors"
                  >
                    Continue to Login
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
