import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import {
  Mail, Lock, Eye, EyeOff, Loader2, AlertCircle,
  Shield, Star, Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getDashboardPath = (role) => {
  if (role === 'worker') return '/worker/dashboard';
  if (role === 'admin') return '/admin';
  return '/dashboard';
};

const FEATURE_KEYS = [
  { icon: Shield, key: 'login.featureVerified' },
  { icon: Star,   key: 'login.featureRated' },
  { icon: Clock,  key: 'login.featureBook' },
];

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

const REMEMBER_KEY = 'mm_remembered_email';

export default function Login() {
  const savedEmail = localStorage.getItem(REMEMBER_KEY) || '';
  const [formData, setFormData]   = useState({ email: savedEmail, password: '' });
  const [showPwd, setShowPwd]     = useState(false);
  const [rememberMe, setRememberMe] = useState(!!savedEmail);
  const [error, setError]         = useState('');
  const [busy, setBusy]           = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { t } = useTranslation();
  const from      = location.state?.from?.pathname;

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const data = await login(formData);
      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, formData.email);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }
      navigate(from || getDashboardPath(data?.user?.role), { replace: true });
    } catch (err) {
      setError(typeof err === 'string' ? err : t('login.invalidCredentials'));
    } finally { setBusy(false); }
  };

  const inp = "w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white/80 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
  const inpPr = "w-full pl-10 pr-11 py-2.5 rounded-xl border border-gray-200 bg-white/80 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

  return (
    <div
      className="h-screen flex overflow-hidden relative"
      style={{ background: 'linear-gradient(105deg,#0f172a 0%,#1e3a5f 30%,#2563eb 58%,#bfdbfe 80%,#f0f9ff 100%)' }}
    >
      {/* Language switcher — fixed top-right */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher variant="dark" />
      </div>

      <ParticleCanvas />

      {/* ambient blobs */}
      <motion.div className="absolute rounded-full pointer-events-none" style={{ width:480,height:480,top:'-100px',left:'-70px',background:'radial-gradient(circle,rgba(96,165,250,0.18),transparent)',zIndex:1 }}
        animate={{ scale:[1,1.1,1],opacity:[0.7,1,0.7] }} transition={{ duration:7,repeat:Infinity,ease:'easeInOut' }} />
      <motion.div className="absolute rounded-full pointer-events-none" style={{ width:340,height:340,bottom:'-60px',left:'20%',background:'radial-gradient(circle,rgba(129,140,248,0.13),transparent)',zIndex:1 }}
        animate={{ scale:[1,1.08,1],opacity:[0.6,0.9,0.6] }} transition={{ duration:9,repeat:Infinity,ease:'easeInOut',delay:2 }} />

      {/* ── LEFT panel ── */}
      <div className="hidden lg:flex lg:w-[52%] h-full relative z-10 flex-col justify-between p-10">
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2">
          <span className="text-xl font-black text-white tracking-tight">Maid<span className="text-blue-300">Saathi</span></span>
        </Link>

        {/* Centre copy */}
        <motion.div initial={{ opacity:0,y:28 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.6 }}>
          <p className="text-blue-300 text-xs font-bold tracking-[0.2em] uppercase mb-4">{t('login.welcomeBack')}</p>
          <h1 className="text-4xl xl:text-[2.6rem] font-black text-white leading-tight mb-4 drop-shadow-md">
            {t('login.tagline')}
          </h1>
          <p className="text-white/55 text-sm leading-relaxed max-w-xs mb-7">
            {t('login.taglineDesc')}
          </p>
          <div className="space-y-3">
            {FEATURE_KEYS.map(({ icon: Icon, key }, i) => (
              <motion.div key={key} initial={{ opacity:0,x:-14 }} animate={{ opacity:1,x:0 }}
                transition={{ delay:0.3+i*0.1,duration:0.4 }} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                  <Icon size={13} className="text-blue-300" />
                </div>
                <span className="text-sm text-white/70">{t(key)}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-2 backdrop-blur-sm w-fit">
          <div className="flex -space-x-1.5">
            {['#f59e0b','#10b981','#3b82f6'].map((c) => (
              <div key={c} className="w-5 h-5 rounded-full border-2 border-white/20" style={{ background:c }} />
            ))}
          </div>
          <span className="text-xs text-white/65">{t('login.happyCustomers')}</span>
        </div>
      </div>

      {/* ── RIGHT panel ── */}
      <div className="flex-1 h-full relative z-10 flex items-center justify-center px-5 sm:px-10 lg:px-12">
        <motion.div
          initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.45 }}
          className="w-full max-w-sm rounded-2xl p-7"
          style={{ background:'rgba(255,255,255,0.86)',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',boxShadow:'0 20px 60px rgba(15,23,42,0.18),0 0 0 1px rgba(255,255,255,0.45)' }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-5 text-center">
            <Link to="/" className="inline-flex items-center justify-center gap-2">
              <span className="text-lg font-black text-gray-900">Maid<span className="text-blue-600">Saathi</span></span>
            </Link>
          </div>

          <h2 className="text-xl font-black text-gray-900 mb-0.5">{t('login.title')}</h2>
          <p className="text-xs text-gray-500 mb-5">
            {t('login.subtitle')}{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">{t('login.createAccount')}</Link>
          </p>

          {error && (
            <motion.div initial={{ opacity:0,y:-6 }} animate={{ opacity:1,y:0 }}
              className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2.5 rounded-xl text-xs">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" /><span>{error}</span>
            </motion.div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">{t('login.email')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail size={15} className="text-gray-400" /></div>
                <input name="email" type="email" required autoComplete="email" className={inp}
                  placeholder={t('login.emailPlaceholder')} value={formData.email} onChange={handleChange} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700">{t('login.password')}</label>
                <Link to="/forgot-password" state={{ email: formData.email }} className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">{t('login.forgotPassword')}</Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock size={15} className="text-gray-400" /></div>
                <input name="password" type={showPwd ? 'text' : 'password'} required autoComplete="current-password"
                  className={inpPr} placeholder={t('login.passwordPlaceholder')} value={formData.password} onChange={handleChange} />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
              />
              <label htmlFor="rememberMe" className="ml-2 text-xs text-gray-600 cursor-pointer select-none">
                Remember me
              </label>
            </div>

            <button type="submit" disabled={busy}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background:busy?'#93c5fd':'linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 60%,#2563eb 100%)',boxShadow:'0 5px 18px rgba(29,78,216,0.35)' }}
            >
              {busy ? <><Loader2 size={15} className="animate-spin" /> {t('login.submitting')}</> : t('login.submit')}
            </button>
          </form>

          <div className="flex items-center gap-2 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">{t('login.or')}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button type="button"
            onClick={() => { window.location.href = `${VITE_API_URL}/auth/google?role=customer`; }}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 bg-white/80 hover:bg-white hover:border-gray-300 transition-all"
            style={{ boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}
          >
            <svg width="16" height="16" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {t('login.continueWithGoogle')}
          </button>

          <p className="mt-4 text-center text-xs text-gray-400">
            {t('login.termsPrefix')}{' '}
            <Link to="/terms" className="text-blue-600 hover:underline">{t('login.terms')}</Link> &amp;{' '}
            <Link to="/privacy" className="text-blue-600 hover:underline">{t('login.privacyPolicy')}</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
