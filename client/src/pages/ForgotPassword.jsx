import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import {
  Mail, Lock, Eye, EyeOff, Loader2, AlertCircle,
  CheckCircle2, Sparkles, ArrowLeft, KeyRound,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
      alpha: Math.random() * 0.5 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const GRID = 28;
      for (let gx = 0; gx < canvas.width; gx += GRID)
        for (let gy = 0; gy < canvas.height; gy += GRID) {
          const a = 0.065 * (1 - gx / canvas.width);
          if (a < 0.005) continue;
          ctx.beginPath(); ctx.arc(gx, gy, 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(147,197,253,${a})`; ctx.fill();
        }
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147,197,253,${p.alpha * (0.2 + 0.8 * (1 - p.x / canvas.width))})`; ctx.fill();
      });
      for (let i = 0; i < particles.length; i++)
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 90) {
            const prog = 1 - ((particles[i].x + particles[j].x) / 2) / canvas.width;
            ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(147,197,253,${(1 - d / 90) * 0.1 * prog})`; ctx.lineWidth = 0.6; ctx.stroke();
          }
        }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }} />;
}

const STEP_SEND   = 'send';
const STEP_VERIFY = 'verify';
const STEP_DONE   = 'done';

export default function ForgotPassword() {
  const location                   = useLocation();
  const [step, setStep]            = useState(STEP_SEND);
  const [email, setEmail]          = useState(location.state?.email || '');
  const [emailLocked, setEmailLocked] = useState(false);
  const [otp, setOtp]              = useState('');
  const [newPwd, setNewPwd]        = useState('');
  const [confPwd, setConfPwd]      = useState('');
  const [showNew, setShowNew]      = useState(false);
  const [showConf, setShowConf]    = useState(false);
  const [loading, setLoading]      = useState(false);
  const [error, setError]          = useState('');
  const navigate                   = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setEmailLocked(true);
      setStep(STEP_VERIFY);
    }
    catch (err) { setError(err.response?.data?.message || 'Failed to send OTP. Try again.'); }
    finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault(); setError('');
    if (newPwd !== confPwd) { setError("Passwords don't match."); return; }
    if (newPwd.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try { await api.post('/auth/reset-password', { email, otp, newPassword: newPwd }); setStep(STEP_DONE); }
    catch (err) { setError(err.response?.data?.message || 'Invalid or expired OTP.'); }
    finally { setLoading(false); }
  };

  const inp   = "w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white/80 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const inpPr = "w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white/80 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const btn   = "w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed";
  const errBox = "mb-3 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs";

  return (
    <div
      className="h-screen flex overflow-hidden relative"
      style={{ background: 'linear-gradient(105deg,#0f172a 0%,#1e3a5f 30%,#2563eb 58%,#bfdbfe 80%,#f0f9ff 100%)' }}
    >
      <ParticleCanvas />

      {/* ambient blobs */}
      <motion.div className="absolute rounded-full pointer-events-none" style={{ width:480,height:480,top:'-100px',left:'-70px',background:'radial-gradient(circle,rgba(96,165,250,0.18),transparent)',zIndex:1 }}
        animate={{ scale:[1,1.1,1],opacity:[0.7,1,0.7] }} transition={{ duration:7,repeat:Infinity,ease:'easeInOut' }} />
      <motion.div className="absolute rounded-full pointer-events-none" style={{ width:320,height:320,bottom:'-50px',left:'22%',background:'radial-gradient(circle,rgba(129,140,248,0.13),transparent)',zIndex:1 }}
        animate={{ scale:[1,1.08,1],opacity:[0.6,0.9,0.6] }} transition={{ duration:9,repeat:Infinity,ease:'easeInOut',delay:2 }} />

      {/* ── LEFT panel ── */}
      <div className="hidden lg:flex lg:w-[52%] h-full relative z-10 flex-col justify-between p-10">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
            <Sparkles size={18} className="text-blue-300" />
          </div>
          <span className="text-xl font-black text-white tracking-tight">Maid<span className="text-blue-300">Match</span></span>
        </Link>

        <motion.div initial={{ opacity:0,y:28 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.6 }}>
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-6">
            <KeyRound size={30} className="text-blue-300" />
          </div>
          <h1 className="text-4xl font-black text-white leading-tight mb-3">
            Forgot your<br/>
            <span className="text-transparent bg-clip-text" style={{ backgroundImage:'linear-gradient(90deg,#93c5fd,#c4b5fd)' }}>password?</span>
          </h1>
          <p className="text-white/55 text-sm leading-relaxed max-w-xs">
            No worries! Enter your email and we'll send you a one-time code to reset it in seconds.
          </p>
        </motion.div>

        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-2 backdrop-blur-sm w-fit">
          <CheckCircle2 size={13} className="text-green-400" />
          <span className="text-xs text-white/65">Secure OTP expires in 10 minutes</span>
        </div>
      </div>

      {/* ── RIGHT panel ── */}
      <div className="flex-1 h-full relative z-10 flex items-center justify-center px-5 sm:px-10 lg:px-12">
        <div
          className="w-full max-w-sm rounded-2xl p-7"
          style={{ background:'rgba(255,255,255,0.86)',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',boxShadow:'0 20px 60px rgba(15,23,42,0.18),0 0 0 1px rgba(255,255,255,0.45)' }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-4 text-center">
            <Link to="/" className="inline-flex items-center gap-1.5">
              <Sparkles size={16} className="text-blue-600" />
              <span className="text-base font-black text-gray-900">Maid<span className="text-blue-600">Match</span></span>
            </Link>
          </div>

          <AnimatePresence mode="wait">

            {/* Step 1 — email */}
            {step === STEP_SEND && (
              <motion.div key="send" initial={{ opacity:0,x:16 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-16 }} transition={{ duration:0.25 }}>
                <Link to="/login" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-4 transition-colors">
                  <ArrowLeft size={13} /> Back to login
                </Link>
                <h2 className="text-xl font-black text-gray-900 mb-0.5">Reset password</h2>
                <p className="text-xs text-gray-500 mb-5">Enter the email linked to your account — we'll send a 6-digit OTP.</p>

                {error && <div className={errBox}><AlertCircle size={13} className="flex-shrink-0 mt-0.5" /><span>{error}</span></div>}

                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail size={14} className="text-gray-400" /></div>
                      <input
                        type="email" required autoComplete="email" placeholder="you@example.com"
                        className={inp + (emailLocked ? ' bg-gray-100 text-gray-500 cursor-not-allowed' : '')}
                        readOnly={emailLocked}
                        value={email}
                        onChange={(e) => { if (!emailLocked) { setEmail(e.target.value); setError(''); } }}
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className={btn}
                    style={{ background:loading?'#93c5fd':'linear-gradient(135deg,#1e3a5f,#2563eb)',boxShadow:'0 5px 18px rgba(29,78,216,0.3)' }}>
                    {loading ? <><Loader2 size={14} className="animate-spin" /> Sending…</> : 'Send OTP'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Step 2 — OTP + new password */}
            {step === STEP_VERIFY && (
              <motion.div key="verify" initial={{ opacity:0,x:16 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-16 }} transition={{ duration:0.25 }}>
                <button onClick={() => { setStep(STEP_SEND); setError(''); setEmailLocked(false); setOtp(''); }}
                  className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-4 transition-colors">
                  <ArrowLeft size={13} /> Back
                </button>
                <h2 className="text-xl font-black text-gray-900 mb-0.5">Check your inbox</h2>
                <p className="text-xs text-gray-500 mb-1">Code sent to <span className="font-semibold text-gray-700">{email}</span></p>
                <p className="text-xs text-gray-400 mb-4">
                  Didn't get it?{' '}
                  <button type="button" onClick={() => { setStep(STEP_SEND); setError(''); setEmailLocked(false); setOtp(''); }} className="text-blue-600 hover:underline">Try again</button>
                </p>

                {error && <div className={errBox}><AlertCircle size={13} className="flex-shrink-0 mt-0.5" /><span>{error}</span></div>}

                <form onSubmit={handleReset} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">6-digit OTP</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><KeyRound size={14} className="text-gray-400" /></div>
                      <input type="text" inputMode="numeric" pattern="\d{6}" maxLength={6} required
                        className={inp + " tracking-[0.45em] font-mono text-center text-base"}
                        placeholder="• • • • • •"
                        value={otp} onChange={(e) => { setOtp(e.target.value.replace(/\D/g,'')); setError(''); }} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock size={14} className="text-gray-400" /></div>
                      <input type={showNew?'text':'password'} required minLength={8} className={inpPr} placeholder="Min. 8 characters"
                        value={newPwd} onChange={(e) => { setNewPwd(e.target.value); setError(''); }} />
                      <button type="button" onClick={() => setShowNew(v=>!v)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                        {showNew ? <EyeOff size={14}/> : <Eye size={14}/>}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock size={14} className="text-gray-400" /></div>
                      <input type={showConf?'text':'password'} required className={inpPr} placeholder="Repeat password"
                        value={confPwd} onChange={(e) => { setConfPwd(e.target.value); setError(''); }} />
                      <button type="button" onClick={() => setShowConf(v=>!v)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                        {showConf ? <EyeOff size={14}/> : <Eye size={14}/>}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className={btn}
                    style={{ background:loading?'#93c5fd':'linear-gradient(135deg,#1e3a5f,#2563eb)',boxShadow:'0 5px 18px rgba(29,78,216,0.3)' }}>
                    {loading ? <><Loader2 size={14} className="animate-spin" /> Resetting…</> : 'Reset Password'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Step 3 — Done */}
            {step === STEP_DONE && (
              <motion.div key="done" initial={{ opacity:0,scale:0.95 }} animate={{ opacity:1,scale:1 }} transition={{ duration:0.3 }} className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={34} className="text-green-500" />
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-2">Password reset!</h2>
                <p className="text-gray-500 text-xs mb-6">Your password has been updated. You can now sign in with your new password.</p>
                <button onClick={() => navigate('/login')} className={btn}
                  style={{ background:'linear-gradient(135deg,#1e3a5f,#2563eb)',boxShadow:'0 5px 18px rgba(29,78,216,0.3)' }}>
                  Go to Login
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
