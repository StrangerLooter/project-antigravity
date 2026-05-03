"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldCheck, ArrowRight, UserRound, Shield, CheckCircle2, Loader2, KeyRound, Smartphone } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type AuthMode = "login" | "register"
type UserRole = "citizen" | "admin"
type Step = "phone" | "otp" | "success"

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>("login")
  const [role, setRole] = useState<UserRole>("citizen")
  const [step, setStep] = useState<Step>("phone")
  
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState(["", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  // Reset states when switching mode or role
  useEffect(() => {
    setStep("phone")
    setOtp(["", "", "", ""])
    setIsLoading(false)
  }, [mode, role])

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || (mode === "register" && !name)) return
    
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setStep("otp")
      // Auto focus first OTP input
      setTimeout(() => otpRefs[0].current?.focus(), 100)
    }, 1200)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1)
    setOtp(newOtp)

    if (value && index < 3) {
      otpRefs[index + 1].current?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus()
    }
  }

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.join("").length !== 4) return
    
    setIsLoading(true)
    // Simulate verification
    setTimeout(() => {
      setIsLoading(false)
      setStep("success")
      
      // Redirect after success
      setTimeout(() => {
        if (role === "admin") {
          router.push("/admin/overview")
        } else {
          router.push("/citizen/dashboard")
        }
      }, 1500)
    }, 1500)
  }

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut", staggerChildren: 0.1 } },
    exit: { opacity: 0, scale: 0.96, transition: { duration: 0.3 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-white flex items-center justify-center">
      {/* Dynamic Backgrounds */}
      <div className="absolute inset-0 z-0">
        <div className="aurora-blob bg-[#f97316] top-[10%] left-[20%] w-[500px] h-[500px] opacity-20 mix-blend-screen"></div>
        <div className="aurora-blob bg-[#22d3ee] bottom-[10%] right-[20%] w-[400px] h-[400px] opacity-20 mix-blend-screen animation-delay-2000"></div>
        <div className="aurora-blob bg-[#ef4444] top-[40%] left-[60%] w-[350px] h-[350px] opacity-15 mix-blend-screen animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-tr from-[#f97316] to-[#ef4444] text-white shadow-[0_0_40px_rgba(249,115,22,0.4)] group-hover:shadow-[0_0_60px_rgba(249,115,22,0.5)] transition-shadow duration-500">
              <ShieldCheck size={26} />
            </div>
            <span className="font-display text-3xl font-black tracking-normal text-white">CIVICAI</span>
          </Link>
        </div>

        {/* Auth Card */}
        <div className="glass-panel rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
          {/* Accent glow line at top */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#22d3ee] to-transparent opacity-50"></div>

          {/* Role Selector */}
          <div className="mb-8 flex rounded-xl border border-white/10 bg-white/5 p-1 relative overflow-hidden">
            <div 
              className="absolute inset-y-1 rounded-lg bg-gradient-to-r from-[#22d3ee] to-[#06b6d4] transition-all duration-300 ease-out"
              style={{ 
                width: 'calc(50% - 4px)', 
                left: role === "citizen" ? '4px' : 'calc(50%)' 
              }}
            />
            <button 
              onClick={() => setRole("citizen")}
              className={`relative z-10 flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-bold transition-colors ${role === "citizen" ? "text-white" : "text-white/50 hover:text-white/80"}`}
            >
              <UserRound size={16} /> Citizen
            </button>
            <button 
              onClick={() => setRole("admin")}
              className={`relative z-10 flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-bold transition-colors ${role === "admin" ? "text-white" : "text-white/50 hover:text-white/80"}`}
            >
              <Shield size={16} /> Officer
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step + mode + role}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full"
            >
              {step === "phone" && (
                <form onSubmit={handlePhoneSubmit} className="space-y-5">
                  <motion.div variants={itemVariants} className="text-center mb-6">
                    <h2 className="text-2xl font-black">
                      {mode === "login" ? "Welcome back" : "Create an account"}
                    </h2>
                    <p className="mt-2 text-sm text-white/50">
                      {mode === "login" 
                        ? `Sign in to access your ${role} dashboard` 
                        : `Register as a new ${role} to get started`}
                    </p>
                  </motion.div>

                  {mode === "register" && (
                    <motion.div variants={itemVariants} className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-white/50">Full Name</label>
                      <div className="relative">
                        <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ram Vishwakarma" 
                          className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-white outline-none transition-all placeholder:text-white/20 focus:border-[#22d3ee] focus:bg-white/10 focus:ring-4 focus:ring-[#22d3ee]/20"
                          required
                        />
                      </div>
                    </motion.div>
                  )}

                  <motion.div variants={itemVariants} className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-white/50">Mobile Number</label>
                    <div className="relative">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                      <div className="absolute left-11 top-1/2 -translate-y-1/2 text-white/60 font-bold">+91</div>
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="98765 43210" 
                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3.5 pl-20 pr-4 text-white outline-none transition-all placeholder:text-white/20 focus:border-[#22d3ee] focus:bg-white/10 focus:ring-4 focus:ring-[#22d3ee]/20 font-mono tracking-wider"
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.button 
                    variants={itemVariants}
                    disabled={isLoading}
                    type="submit" 
                    className="group relative mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ef4444] py-4 font-black text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] disabled:opacity-70"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                      <>
                        Send OTP <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </motion.button>

                  <motion.div variants={itemVariants} className="mt-6 text-center text-sm text-white/50">
                    {mode === "login" ? "Don't have an account? " : "Already registered? "}
                    <button 
                      type="button" 
                      onClick={() => setMode(mode === "login" ? "register" : "login")}
                      className="font-bold text-[#22d3ee] hover:text-white transition-colors"
                    >
                      {mode === "login" ? "Sign up" : "Sign in"}
                    </button>
                  </motion.div>
                </form>
              )}

              {step === "otp" && (
                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <motion.div variants={itemVariants} className="text-center mb-8">
                    <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#22d3ee]/20 text-[#22d3ee]">
                      <KeyRound size={24} />
                    </div>
                    <h2 className="text-2xl font-black">Verify your number</h2>
                    <p className="mt-2 text-sm text-white/50">
                      We've sent a 4-digit code to <br/>
                      <span className="font-mono text-white">+91 {phone}</span>
                    </p>
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex justify-center gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={otpRefs[index]}
                        type="text"
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="h-14 w-12 rounded-xl border border-white/10 bg-white/5 text-center font-mono text-xl font-bold text-white outline-none transition-all focus:border-[#f97316] focus:bg-[#f97316]/10 focus:ring-4 focus:ring-[#f97316]/20"
                        maxLength={1}
                      />
                    ))}
                  </motion.div>

                  <motion.div variants={itemVariants} className="text-center">
                    <span className="inline-flex items-center gap-2 rounded-lg bg-[#f97316]/10 px-3 py-1 text-xs font-bold text-[#f97316]">
                      Demo mode: Enter any 4 digits (e.g., 1234)
                    </span>
                  </motion.div>

                  <motion.button 
                    variants={itemVariants}
                    disabled={isLoading || otp.join("").length !== 4}
                    type="submit" 
                    className="group relative mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#22d3ee] to-[#06b6d4] py-4 font-black text-black shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] disabled:opacity-50 disabled:hover:shadow-none"
                  >
                    {isLoading ? <Loader2 className="animate-spin text-black" size={20} /> : "Verify & Continue"}
                  </motion.button>

                  <motion.div variants={itemVariants} className="mt-6 text-center text-sm">
                    <button 
                      type="button" 
                      onClick={() => setStep("phone")}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      Change phone number
                    </button>
                  </motion.div>
                </form>
              )}

              {step === "success" && (
                <motion.div variants={containerVariants} className="flex flex-col items-center justify-center py-8 text-center">
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="mb-6 grid h-20 w-20 place-items-center rounded-full bg-[#22d3ee] text-black shadow-[0_0_40px_rgba(34,211,238,0.5)]"
                  >
                    <CheckCircle2 size={40} />
                  </motion.div>
                  <motion.h2 variants={itemVariants} className="text-3xl font-black text-white">Verified!</motion.h2>
                  <motion.p variants={itemVariants} className="mt-3 text-white/60">
                    Redirecting to your {role} portal...
                  </motion.p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}
