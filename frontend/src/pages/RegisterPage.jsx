import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Mail, Lock, User, Eye, EyeOff, Plane, ArrowRight,
  CheckCircle, Phone, ShieldCheck, RefreshCw, ChevronLeft
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axiosInstance'
import toast from 'react-hot-toast'

// ── Password strength rules ───────────────────────────────────────────────────
const RULES = [
  { test: (p) => p.length >= 6,   label: 'At least 6 characters' },
  { test: (p) => /[A-Z]/.test(p), label: 'One uppercase letter'  },
  { test: (p) => /[0-9]/.test(p), label: 'One number'            },
]

// ── 6-box OTP input ───────────────────────────────────────────────────────────
function OtpInput({ value, onChange }) {
  const inputs = useRef([])
  const digits  = value.split('')

  const handleKey = (e, idx) => {
    if (e.key === 'Backspace') {
      if (!digits[idx] && idx > 0) inputs.current[idx - 1].focus()
      const next = [...digits]; next[idx] = ''
      onChange(next.join('')); return
    }
    if (!/^\d$/.test(e.key)) return
    const next = [...digits]; next[idx] = e.key
    onChange(next.join(''))
    if (idx < 5) inputs.current[idx + 1].focus()
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted.padEnd(6, '').slice(0, 6))
    inputs.current[Math.min(pasted.length, 5)]?.focus()
    e.preventDefault()
  }

  return (
    <div className="flex gap-3 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onKeyDown={(e) => handleKey(e, i)}
          onChange={() => {}}
          className={`w-11 h-14 text-center text-2xl font-black rounded-xl border-2 outline-none transition-all
            ${digits[i] ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50 text-slate-700'}
            focus:border-indigo-500 focus:bg-indigo-50 focus:ring-2 focus:ring-indigo-200`}
        />
      ))}
    </div>
  )
}

// ── Main Register Page ────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [step, setStep]       = useState(1)
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '', phone: '' })
  const [errors, setErrors]   = useState({})
  const [showPwd, setShowPwd] = useState(false)
  const [otp, setOtp]         = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [sendingOtp, setSendingOtp]   = useState(false)
  const [submitting, setSubmitting]   = useState(false)

  const { login } = useAuth()
  const navigate  = useNavigate()

  // Countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [resendTimer])

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!form.name || form.name.trim().length < 2)          e.name     = 'Name must be at least 2 characters'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))   e.email    = 'Enter a valid email'
    if (!form.password || form.password.length < 6)         e.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirm)                     e.confirm  = 'Passwords do not match'
    if (!form.phone || !/^\d{10}$/.test(form.phone.replace(/\s/g, '')))
                                                            e.phone    = 'Enter a valid 10-digit Indian mobile number'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }))
  }

  // ── Send OTP via backend → Fast2SMS ────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSendingOtp(true)
    try {
      await api.post('/auth/send-otp', { phone: form.phone.replace(/\s/g, '') })
      setStep(2)
      setResendTimer(30)
      toast.success('OTP sent to your mobile! 📱')
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP. Try again.'
      toast.error(msg)
    } finally {
      setSendingOtp(false)
    }
  }

  // ── Resend OTP ─────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendTimer > 0) return
    setOtp('')
    setSendingOtp(true)
    try {
      await api.post('/auth/send-otp', { phone: form.phone.replace(/\s/g, '') })
      setResendTimer(30)
      toast.success('OTP resent!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP.')
    } finally {
      setSendingOtp(false)
    }
  }

  // ── Verify OTP + Create Account ────────────────────────────────────────────
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) return toast.error('Enter the full 6-digit OTP')
    setSubmitting(true)
    try {
      const { data } = await api.post('/auth/verify-otp', {
        phone:    form.phone.replace(/\s/g, ''),
        otp,
        name:     form.name.trim(),
        email:    form.email,
        password: form.password,
      })
      login(data.user, data.token)
      toast.success(`Welcome aboard, ${data.user.name}! 🎉`)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed.'
      toast.error(msg)
      setErrors({ api: msg })
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

          {/* ── Header ── */}
          <div className="bg-gradient-to-br from-navy-900 to-indigo-900 px-8 py-8 text-center relative">
            {step === 2 && (
              <button onClick={() => { setStep(1); setOtp('') }}
                className="absolute left-5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
                title="Back">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
              {step === 1 ? <Plane className="w-7 h-7 text-white" /> : <ShieldCheck className="w-7 h-7 text-white" />}
            </div>
            <h1 className="text-2xl font-bold text-white">
              {step === 1 ? 'Create Account' : 'Verify Phone'}
            </h1>
            <p className="text-white/60 mt-1 text-sm">
              {step === 1 ? 'Join AirAssist — your smart travel companion' : `OTP sent to +91 ${form.phone}`}
            </p>
            {/* Step dots */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {[1, 2].map(s => (
                <div key={s} className={`h-1.5 rounded-full transition-all duration-300
                  ${s === step ? 'w-8 bg-white' : s < step ? 'w-4 bg-white/60' : 'w-4 bg-white/20'}`} />
              ))}
            </div>
          </div>

          <div className="px-8 py-8">

            {/* ── STEP 1: Details ── */}
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-4" noValidate>
                {errors.api && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">{errors.api}</div>
                )}

                {/* Name */}
                <div>
                  <label htmlFor="reg-name" className="form-label">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input id="reg-name" name="name" type="text"
                      className={`form-input pl-9 ${errors.name ? 'border-red-400' : ''}`}
                      placeholder="John Doe" value={form.name} onChange={handleChange} />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="reg-email" className="form-label">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input id="reg-email" name="email" type="email"
                      className={`form-input pl-9 ${errors.email ? 'border-red-400' : ''}`}
                      placeholder="you@example.com" value={form.email} onChange={handleChange} />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="reg-phone" className="form-label">Mobile Number</label>
                  <div className="flex">
                    <span className="flex items-center gap-1.5 px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-600 text-sm font-semibold whitespace-nowrap">
                      🇮🇳 +91
                    </span>
                    <input id="reg-phone" name="phone" type="tel" inputMode="numeric"
                      autoComplete="off"
                      className={`form-input rounded-l-none flex-1 ${errors.phone ? 'border-red-400' : ''}`}
                      placeholder="9876543210" maxLength={10}
                      value={form.phone} onChange={handleChange} />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="reg-password" className="form-label">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input id="reg-password" name="password" type={showPwd ? 'text' : 'password'}
                      className={`form-input pl-9 pr-10 ${errors.password ? 'border-red-400' : ''}`}
                      placeholder="Strong password" value={form.password} onChange={handleChange} />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  {form.password && (
                    <div className="mt-2 space-y-1">
                      {RULES.map(({ test, label }) => (
                        <div key={label} className={`flex items-center gap-1.5 text-xs ${test(form.password) ? 'text-emerald-600' : 'text-slate-400'}`}>
                          <CheckCircle className={`w-3 h-3 ${test(form.password) ? 'text-emerald-500' : 'text-slate-300'}`} />
                          {label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm */}
                <div>
                  <label htmlFor="reg-confirm" className="form-label">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input id="reg-confirm" name="confirm" type={showPwd ? 'text' : 'password'}
                      className={`form-input pl-9 ${errors.confirm ? 'border-red-400' : ''}`}
                      placeholder="Repeat password" value={form.confirm} onChange={handleChange} />
                  </div>
                  {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
                </div>

                <button id="send-otp-btn" type="submit" disabled={sendingOtp}
                  className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
                  {sendingOtp
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending OTP…</>
                    : <><Phone className="w-4 h-4" /> Send OTP</>}
                </button>
              </form>
            )}

            {/* ── STEP 2: OTP Verification ── */}
            {step === 2 && (
              <form onSubmit={handleVerifyAndRegister} className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-7 h-7 text-indigo-500" />
                  </div>
                  <p className="text-slate-600 text-sm">
                    Enter the 6-digit code sent to<br />
                    <span className="font-bold text-slate-800">+91 {form.phone}</span>
                  </p>
                </div>

                <OtpInput value={otp} onChange={setOtp} />

                {errors.api && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm text-center">{errors.api}</div>
                )}

                <button id="verify-otp-btn" type="submit" disabled={otp.length !== 6 || submitting}
                  className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2">
                  {submitting
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account…</>
                    : <><ShieldCheck className="w-4 h-4" /> Verify & Create Account</>}
                </button>

                <div className="text-center text-sm text-slate-500">
                  Didn't receive it?{' '}
                  {resendTimer > 0 ? (
                    <span className="text-slate-400 font-medium">Resend in {resendTimer}s</span>
                  ) : (
                    <button type="button" onClick={handleResend} disabled={sendingOtp}
                      className="text-indigo-600 font-semibold hover:text-indigo-700 inline-flex items-center gap-1">
                      <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
                    </button>
                  )}
                </div>
              </form>
            )}

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-700">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
