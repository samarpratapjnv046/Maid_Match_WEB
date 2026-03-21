import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Shield, Clock, CheckCircle, Users, TrendingUp, MapPin, Wallet, CalendarCheck, UserCircle, LayoutDashboard, Search } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { serviceIcons, serviceLabels } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';

const SERVICES = [
  'house_cleaning', 'cooking', 'babysitting',
  'elder_care', 'laundry', 'gardening',
  'driver', 'deep_cleaning', 'security_guard',
];

const SERVICE_THEME = {
  house_cleaning: { gradient: 'from-blue-500 to-cyan-500',    light: 'from-blue-50 to-cyan-50',    border: 'hover:border-blue-300',    glow: 'hover:shadow-blue-200',    text: 'text-blue-600',    desc: 'Spotless home, every day',       character: '🧹', particles: ['✨','💧','🫧'], charAnim: [0,-12,8,-4,0], bgColor: '#eff6ff' },
  cooking:        { gradient: 'from-orange-500 to-amber-400',  light: 'from-orange-50 to-amber-50',  border: 'hover:border-orange-300',  glow: 'hover:shadow-orange-200',  text: 'text-orange-600',  desc: 'Delicious meals at home',        character: '👨‍🍳', particles: ['🍳','🌶️','⭐'], charAnim: [0,-8,12,-6,0], bgColor: '#fff7ed' },
  babysitting:    { gradient: 'from-pink-500 to-rose-400',     light: 'from-pink-50 to-rose-50',     border: 'hover:border-pink-300',    glow: 'hover:shadow-pink-200',    text: 'text-pink-600',    desc: 'Safe, caring childcare',         character: '👶', particles: ['🍼','💕','⭐'], charAnim: [0,-6,10,-6,0], bgColor: '#fdf2f8' },
  elder_care:     { gradient: 'from-violet-500 to-purple-500', light: 'from-violet-50 to-purple-50', border: 'hover:border-violet-300',  glow: 'hover:shadow-violet-200',  text: 'text-violet-600',  desc: 'Compassionate senior care',      character: '👵', particles: ['❤️','🌸','✨'], charAnim: [0,-10,6,-4,0], bgColor: '#f5f3ff' },
  laundry:        { gradient: 'from-teal-500 to-cyan-500',     light: 'from-teal-50 to-cyan-50',     border: 'hover:border-teal-300',    glow: 'hover:shadow-teal-200',    text: 'text-teal-600',    desc: 'Fresh & folded, always',         character: '🫧', particles: ['👕','💧','✨'], charAnim: [0,-14,6,-4,0], bgColor: '#f0fdfa' },
  gardening:      { gradient: 'from-emerald-500 to-green-500', light: 'from-emerald-50 to-green-50', border: 'hover:border-emerald-300', glow: 'hover:shadow-emerald-200', text: 'text-emerald-600', desc: 'Beautiful gardens & lawns',       character: '🧑‍🌾', particles: ['🌱','🌻','🍃'], charAnim: [0,-8,8,-4,0], bgColor: '#f0fdf4' },
  driver:         { gradient: 'from-slate-600 to-gray-600',    light: 'from-slate-50 to-gray-100',   border: 'hover:border-slate-300',   glow: 'hover:shadow-slate-200',   text: 'text-slate-600',   desc: 'Reliable rides, any time',       character: '🚗', particles: ['🛣️','⚡','🗺️'], charAnim: [0,-6,16,-8,0], bgColor: '#f8fafc' },
  deep_cleaning:  { gradient: 'from-indigo-500 to-blue-600',   light: 'from-indigo-50 to-blue-50',   border: 'hover:border-indigo-300',  glow: 'hover:shadow-indigo-200',  text: 'text-indigo-600',  desc: 'Deep sanitized cleaning',        character: '🧼', particles: ['🫧','✨','💦'], charAnim: [0,-12,8,-4,0], bgColor: '#eef2ff' },
  security_guard: { gradient: 'from-red-500 to-rose-500',      light: 'from-red-50 to-rose-50',      border: 'hover:border-red-300',     glow: 'hover:shadow-red-200',     text: 'text-red-600',     desc: 'Trusted home security',          character: '💂', particles: ['🛡️','⚔️','✅'], charAnim: [0,-10,6,-4,0], bgColor: '#fff1f2' },
};

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1920&q=85',
    service: 'House Cleaning',
    emoji: '🧹',
    tagline: 'Spotless homes, every time',
    accent: 'from-blue-500 to-cyan-500',
    badge: 'bg-blue-500',
  },
  {
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1920&q=85',
    service: 'Cooking',
    emoji: '👨‍🍳',
    tagline: 'Delicious meals, home delivered',
    accent: 'from-orange-500 to-amber-500',
    badge: 'bg-orange-500',
  },
  {
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1920&q=85',
    service: 'Babysitting',
    emoji: '👶',
    tagline: 'Safe, caring hands for your child',
    accent: 'from-pink-500 to-rose-500',
    badge: 'bg-pink-500',
  },
  {
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1920&q=85',
    service: 'Elder Care',
    emoji: '❤️',
    tagline: 'Compassionate care for your loved ones',
    accent: 'from-violet-500 to-purple-500',
    badge: 'bg-violet-500',
  },
  {
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1920&q=85',
    service: 'Gardening',
    emoji: '🌿',
    tagline: 'Beautiful gardens, expert care',
    accent: 'from-emerald-500 to-green-500',
    badge: 'bg-emerald-500',
  },
];

const STATS = [
  { label: 'Verified Workers', value: '2,500+', icon: Users, gradient: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-200', bg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { label: 'Bookings Completed', value: '15,000+', icon: CheckCircle, gradient: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-200', bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { label: 'Cities Covered', value: '50+', icon: MapPin, gradient: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-200', bg: 'bg-violet-50', iconColor: 'text-violet-600' },
  { label: 'Avg. Rating', value: '4.8 ★', icon: Star, gradient: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-200', bg: 'bg-amber-50', iconColor: 'text-amber-500' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Search Workers', desc: 'Browse verified professionals filtered by service, city, and price.', emoji: '🔍' },
  { step: '02', title: 'Book Instantly', desc: 'Send a booking request and the worker accepts or declines in real time.', emoji: '📅' },
  { step: '03', title: 'Pay Securely', desc: 'Pay via Razorpay once accepted. Your money is protected until completion.', emoji: '🔒' },
  { step: '04', title: 'Share OTP & Review', desc: 'Hand over the OTP when the worker arrives, and leave a review when done.', emoji: '✅' },
];

const WORKER_HOW_IT_WORKS = [
  { step: '01', title: 'Complete Your Profile', desc: 'Add your services, pricing, location, and upload a profile photo to attract customers.', emoji: '👤' },
  { step: '02', title: 'Get Booking Requests', desc: 'Customers find you through search. You receive booking requests and choose to accept or decline.', emoji: '📩' },
  { step: '03', title: 'Complete the Job', desc: "Arrive on time, do the job, and collect the customer's OTP to mark the booking complete.", emoji: '🛠️' },
  { step: '04', title: 'Get Paid Instantly', desc: 'Earnings are credited to your wallet immediately after OTP verification. Withdraw anytime.', emoji: '💸' },
];

const WORKER_FEATURES = [
  { icon: Wallet, title: 'Instant Wallet Payouts', desc: 'Earnings land in your MaidMatch wallet right after job completion. Withdraw to your bank at any time.', gradient: 'from-emerald-500 to-teal-600', lightBg: 'bg-emerald-50', iconColor: 'text-emerald-600', border: 'hover:border-emerald-200' },
  { icon: Shield, title: 'Verified Badge', desc: 'Complete Aadhaar verification to get a Verified badge on your profile — boosting customer trust and bookings.', gradient: 'from-blue-500 to-indigo-600', lightBg: 'bg-blue-50', iconColor: 'text-blue-600', border: 'hover:border-blue-200' },
  { icon: Star, title: 'Build Your Reputation', desc: 'Genuine reviews from completed bookings help you rank higher in search results and earn more.', gradient: 'from-amber-400 to-orange-500', lightBg: 'bg-amber-50', iconColor: 'text-amber-600', border: 'hover:border-amber-200' },
  { icon: CalendarCheck, title: 'Flexible Scheduling', desc: 'Accept only the bookings you want. Set your own availability and service pricing — hourly, daily, or monthly.', gradient: 'from-violet-500 to-purple-600', lightBg: 'bg-violet-50', iconColor: 'text-violet-600', border: 'hover:border-violet-200' },
  { icon: TrendingUp, title: 'Grow Your Income', desc: 'The more bookings you complete and the better your rating, the higher you appear in customer searches.', gradient: 'from-rose-500 to-pink-600', lightBg: 'bg-rose-50', iconColor: 'text-rose-600', border: 'hover:border-rose-200' },
  { icon: MapPin, title: 'Work Locally', desc: 'Customers search by pincode and city — you only get requests from people near you.', gradient: 'from-sky-500 to-cyan-600', lightBg: 'bg-sky-50', iconColor: 'text-sky-600', border: 'hover:border-sky-200' },
];

const CUSTOMER_FEATURES = [
  { icon: Shield, title: 'Aadhaar Verified', desc: 'Every worker undergoes mandatory Aadhaar card verification and background checks before being listed.', gradient: 'from-blue-500 to-indigo-600', lightBg: 'bg-blue-50', iconColor: 'text-blue-600', border: 'hover:border-blue-200' },
  { icon: Star, title: 'Genuine Reviews', desc: 'Only customers who have completed a booking can leave a review — so you always see honest feedback.', gradient: 'from-amber-400 to-orange-500', lightBg: 'bg-amber-50', iconColor: 'text-amber-600', border: 'hover:border-amber-200' },
  { icon: Clock, title: 'OTP-Protected Completion', desc: 'Payments are secured with a one-time password. Workers get paid only after you confirm the job is done.', gradient: 'from-emerald-500 to-teal-600', lightBg: 'bg-emerald-50', iconColor: 'text-emerald-600', border: 'hover:border-emerald-200' },
  { icon: TrendingUp, title: 'Transparent Pricing', desc: 'See hourly, daily, and monthly rates upfront. No hidden fees — what you see is what you pay.', gradient: 'from-violet-500 to-purple-600', lightBg: 'bg-violet-50', iconColor: 'text-violet-600', border: 'hover:border-violet-200' },
  { icon: CheckCircle, title: 'Razorpay Secured', desc: "Payments are processed by India's leading payment gateway, Razorpay. Your data is always safe.", gradient: 'from-emerald-500 to-green-600', lightBg: 'bg-green-50', iconColor: 'text-green-600', border: 'hover:border-green-200' },
  { icon: MapPin, title: 'Location-Based Search', desc: 'Find workers near you using our geospatial search. Filter by city, service, rating, and price.', gradient: 'from-rose-500 to-pink-600', lightBg: 'bg-rose-50', iconColor: 'text-rose-600', border: 'hover:border-rose-200' },
];

const WORKER_QUICK_ACTIONS = [
  { to: '/worker/dashboard', icon: LayoutDashboard, label: 'Dashboard', desc: 'View your overview and stats', gradient: 'from-blue-500 to-indigo-600', lightBg: 'bg-blue-50', iconColor: 'text-blue-600', border: 'hover:border-blue-300 hover:bg-blue-50' },
  { to: '/worker/bookings', icon: CalendarCheck, label: 'My Bookings', desc: 'Manage pending & active jobs', gradient: 'from-emerald-500 to-teal-600', lightBg: 'bg-emerald-50', iconColor: 'text-emerald-600', border: 'hover:border-emerald-300 hover:bg-emerald-50' },
  { to: '/worker/wallet', icon: Wallet, label: 'My Wallet', desc: 'Check earnings & withdraw', gradient: 'from-amber-400 to-orange-500', lightBg: 'bg-amber-50', iconColor: 'text-amber-600', border: 'hover:border-amber-300 hover:bg-amber-50' },
  { to: '/worker/profile', icon: UserCircle, label: 'Worker Profile', desc: 'Update services & availability', gradient: 'from-violet-500 to-purple-600', lightBg: 'bg-violet-50', iconColor: 'text-violet-600', border: 'hover:border-violet-300 hover:bg-violet-50' },
];

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const cardFadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ── Hero Slider ───────────────────────────────────────────────────────────────
const HeroSlider = ({ searchCity, setSearchCity, navigate, user }) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef(null);

  const go = (idx) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };

  const next = () => {
    const idx = (current + 1) % HERO_SLIDES.length;
    setDirection(1);
    setCurrent(idx);
  };

  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [current]);

  const slide = HERO_SLIDES[current];

  const variants = {
    enter: (d) => ({ opacity: 0, scale: 1.04, x: d > 0 ? 60 : -60 }),
    center: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: (d) => ({ opacity: 0, scale: 0.97, x: d > 0 ? -60 : 60, transition: { duration: 0.5 } }),
  };

  return (
    <section className="relative h-[88vh] max-h-[700px] min-h-[520px] flex items-end sm:items-center overflow-hidden">
      {/* ── Background images ── */}
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.service}
            className="w-full h-full object-cover"
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-900/70 to-gray-900/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/30 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* ── Floating service badge (top right) ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`badge-${current}`}
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          transition={{ duration: 0.4 }}
          className="absolute top-20 right-4 lg:right-12 z-10 hidden sm:block"
        >
          <div className={`${slide.badge} text-white px-4 py-2 rounded-full text-sm font-bold shadow-2xl flex items-center gap-2`}>
            <span className="text-lg">{slide.emoji}</span>
            {slide.service}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Main content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 sm:py-10 lg:py-14">
        <div className="max-w-3xl">
          {/* Tag */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-white/20">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              India's Trusted Home Services Platform
            </span>
          </motion.div>

          {/* Headline */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${current}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <p className={`text-sm font-bold uppercase tracking-widest bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent mb-3`}>
                {slide.tagline}
              </p>
            </motion.div>
          </AnimatePresence>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.1] mb-4 tracking-tight">
            Find the perfect{' '}
            <span className="text-yellow-300">home helper</span>{' '}
            near you
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-lg mb-4 sm:mb-6 leading-relaxed">
            Verified, background-checked professionals for cleaning, cooking, babysitting, and more.
            <span className="text-yellow-300 font-semibold"> Book in minutes, pay securely.</span>
          </p>

          {/* Search bar — hidden on mobile, shown sm+ */}
          <div className="hidden sm:flex flex-col sm:flex-row gap-2 max-w-lg mb-5">
            <div className="relative flex-1">
              <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchCity.trim())
                    navigate(`/workers?city=${encodeURIComponent(searchCity.trim())}`);
                }}
                placeholder="Enter your city…"
                className="w-full pl-9 pr-4 py-3 rounded-xl text-sm text-gray-900 bg-white border-0 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg placeholder-gray-400"
              />
            </div>
            <button
              onClick={() =>
                navigate(
                  searchCity.trim()
                    ? `/workers?city=${encodeURIComponent(searchCity.trim())}`
                    : '/workers'
                )
              }
              className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-6 py-3 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-yellow-400/30 hover:-translate-y-0.5 flex-shrink-0"
            >
              <Search size={15} />
              Search
            </button>
          </div>

          {/* CTA buttons — hidden on mobile (shown below hero instead) */}
          <div className="hidden sm:flex flex-wrap gap-3 mb-6">
            <Link
              to="/workers"
              className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-7 py-3.5 rounded-xl text-sm transition-all duration-200 shadow-lg hover:-translate-y-0.5 hover:shadow-xl"
            >
              Browse All Workers <ArrowRight size={16} />
            </Link>
            {!user && (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/30 px-7 py-3.5 rounded-xl text-sm transition-all duration-200 backdrop-blur-sm"
              >
                Join as a Worker
              </Link>
            )}
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex -space-x-2">
              {['A', 'R', 'M', 'S', 'P'].map((l, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-400 border-2 border-gray-900 flex items-center justify-center text-xs font-black text-gray-900"
                >
                  {l}
                </div>
              ))}
            </div>
            <div>
              <p className="text-white font-bold text-sm">2,500+ verified workers</p>
              <div className="flex items-center gap-1 mt-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={12} className="fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-gray-300 text-xs ml-1">4.8 avg rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Slider dots only ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current
                ? 'w-8 h-2.5 bg-yellow-400'
                : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>

      {/* ── Floating service pills (bottom-right, desktop only) ── */}
      <div className="absolute bottom-16 right-4 lg:right-12 z-10 hidden lg:flex flex-col gap-1.5">
        {HERO_SLIDES.map((s, i) => (
          <motion.div
            key={s.service}
            animate={{ opacity: i === current ? 1 : 0.4, scale: i === current ? 1.05 : 1 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3.5 py-2 rounded-full cursor-pointer hover:bg-white/20 transition-colors"
            onClick={() => go(i)}
          >
            <span>{s.emoji}</span>
            {s.service}
          </motion.div>
        ))}
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute bottom-6 right-6 text-white/40 hidden lg:flex flex-col items-center gap-1 text-xs"
      >
        <div className="w-px h-8 bg-gradient-to-b from-transparent to-white/40" />
        <span>scroll</span>
      </motion.div>
    </section>
  );
};

// ── Services Marquee ─────────────────────────────────────────────────────────
const ServicesMarquee = () => (
  <div className="bg-gray-950 py-4 overflow-hidden border-y border-gray-800">
    <motion.div
      animate={{ x: ['0%', '-50%'] }}
      transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      className="flex gap-8 whitespace-nowrap"
    >
      {[...SERVICES, ...SERVICES].map((svc, i) => (
        <span key={i} className="inline-flex items-center gap-2 text-gray-400 text-sm font-medium">
          <span className="text-lg">{serviceIcons[svc]}</span>
          {serviceLabels[svc]}
          <span className="text-gray-700 mx-2">•</span>
        </span>
      ))}
    </motion.div>
  </div>
);

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isWorker = user?.role === 'worker';
  const [searchCity, setSearchCity] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);
  const touchTimerRef = useRef(null);

  const [svcCursor,   setSvcCursor]   = useState({ px: 50, py: 50 });
  const [stepsCursor, setStepsCursor] = useState({ px: 50, py: 50 });
  const svcSectionRef   = useRef(null);
  const stepsSectionRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      if (svcSectionRef.current) {
        const r = svcSectionRef.current.getBoundingClientRect();
        setSvcCursor({
          px: Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width)  * 100)),
          py: Math.max(0, Math.min(100, ((e.clientY - r.top)  / r.height) * 100)),
        });
      }
      if (stepsSectionRef.current) {
        const r = stepsSectionRef.current.getBoundingClientRect();
        setStepsCursor({
          px: Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width)  * 100)),
          py: Math.max(0, Math.min(100, ((e.clientY - r.top)  / r.height) * 100)),
        });
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      {isWorker ? (
        /* Worker hero — compact dashboard entry */
        <section className="relative bg-gradient-to-br from-gray-950 via-primary-900 to-primary-800 overflow-hidden pt-24 pb-20 min-h-[50vh] flex items-center">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 70% 40%, #6366f1 0%, transparent 60%)' }} />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, #f59e0b 0%, transparent 50%)' }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-white/20">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Worker Dashboard
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
                Welcome back,{' '}
                <span className="text-yellow-300">{user?.name?.split(' ')[0] || 'Worker'}</span> 👋
              </h1>
              <p className="text-lg text-primary-200 mb-8 max-w-lg mx-auto">
                Manage your bookings, track earnings, and grow your reputation — all in one place.
              </p>
              <Link
                to="/worker/dashboard"
                className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-4 rounded-xl text-base transition-all duration-200 shadow-lg shadow-yellow-400/30 hover:-translate-y-0.5"
              >
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </section>
      ) : (
        <HeroSlider
          searchCity={searchCity}
          setSearchCity={setSearchCity}
          navigate={navigate}
          user={user}
        />
      )}

      {/* ── Mobile strip below hero (search + CTA buttons) — mobile only ──────── */}
      {!isWorker && (
        <div className="sm:hidden bg-gray-950 px-4 pt-4 pb-5 flex flex-col gap-3">
          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchCity.trim())
                    navigate(`/workers?city=${encodeURIComponent(searchCity.trim())}`);
                }}
                placeholder="Search by city…"
                className="w-full pl-9 pr-4 py-3 rounded-xl text-sm text-gray-900 bg-white border-0 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow placeholder-gray-400"
              />
            </div>
            <button
              onClick={() =>
                navigate(searchCity.trim() ? `/workers?city=${encodeURIComponent(searchCity.trim())}` : '/workers')
              }
              className="inline-flex items-center justify-center gap-1.5 bg-yellow-400 text-gray-900 font-bold px-5 py-3 rounded-xl text-sm flex-shrink-0"
            >
              <Search size={15} />
              Search
            </button>
          </div>
          {/* Action buttons */}
          <div className="flex gap-2">
            <Link
              to="/workers"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-bold py-3 rounded-xl text-sm shadow"
            >
              Browse Workers <ArrowRight size={15} />
            </Link>
            {!user && (
              <Link
                to="/register"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold border border-white/25 py-3 rounded-xl text-sm"
              >
                Become a Worker
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Services Marquee (customer only) ─────────────────────────────────── */}
      {!isWorker && <ServicesMarquee />}

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gray-950 py-16">
        {/* Ambient glows */}
        <div className="absolute top-0 left-1/4 w-96 h-40 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-40 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
          >
            {STATS.map(({ label, value, icon: Icon, gradient, iconColor }, i) => (
              <motion.div
                key={label}
                variants={{ initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } } }}
                whileHover={{ y: -6, scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                className="relative group cursor-default rounded-2xl overflow-hidden border border-white/8"
                style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(10px)' }}
              >
                {/* Gradient glow border on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-400 rounded-2xl`} />
                {/* Bottom accent bar */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient}`} />
                <div className="relative p-5 lg:p-7 flex flex-col items-center text-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 8, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: i * 0.8, ease: 'easeInOut' }}
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-15 flex items-center justify-center`}
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  >
                    <Icon size={22} className="text-white" />
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 + i * 0.1 }}
                    className={`text-3xl lg:text-4xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent leading-tight`}
                  >
                    {value}
                  </motion.p>
                  <p className="text-gray-400 text-xs lg:text-sm font-medium leading-tight">{label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Worker Quick Actions ───────────────────────────────────────────────── */}
      {isWorker && (
        <section className="py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="text-center mb-10"
            >
              <span className="inline-block bg-primary-50 text-primary-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-3">Your Workspace</span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">Quick Actions</h2>
              <p className="mt-3 text-gray-500 max-w-xl mx-auto">Everything you need, one click away.</p>
            </motion.div>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-40px' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {WORKER_QUICK_ACTIONS.map(({ to, icon: Icon, label, desc, gradient, lightBg, iconColor, border }) => (
                <motion.div key={to} variants={cardFadeUp}>
                  <Link
                    to={to}
                    className={`group flex flex-col items-center gap-4 p-7 bg-white rounded-2xl border border-gray-100 ${border} shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 text-center relative overflow-hidden`}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} rounded-t-2xl`} />
                    <div className={`w-16 h-16 ${lightBg} rounded-2xl flex items-center justify-center transition-all duration-200 shadow-sm`}>
                      <Icon size={28} className={`${iconColor}`} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-base group-hover:text-gray-800 transition-colors">{label}</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
                    </div>
                    <span className={`text-xs font-semibold ${iconColor} opacity-0 group-hover:opacity-100 transition-opacity`}>Go →</span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Services Grid (customer only) ─────────────────────────────────────── */}
      {!isWorker && (
        <section ref={svcSectionRef} className="py-20 relative">
          {/* ── Background decorations contained in their own clipping layer ── */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Vivid base mesh */}
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(135deg,#e0e7ff 0%,#fce7f3 20%,#fef9c3 40%,#d1fae5 60%,#e0f2fe 80%,#f3e8ff 100%)',
            }} />
            {/* Dot-grid texture */}
            <div className="absolute inset-0 opacity-[0.45]" style={{
              backgroundImage: 'radial-gradient(circle, #818cf8 1.2px, transparent 1.2px)',
              backgroundSize: '24px 24px',
            }} />
            {/* Cross-hatch overlay */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: 'repeating-linear-gradient(0deg,#6366f1 0,#6366f1 1px,transparent 1px,transparent 28px),repeating-linear-gradient(90deg,#6366f1 0,#6366f1 1px,transparent 1px,transparent 28px)',
            }} />
            {/* Cursor spotlight */}
            <div className="absolute inset-0" style={{
              background: `radial-gradient(600px circle at ${svcCursor.px}% ${svcCursor.py}%, rgba(139,92,246,0.22) 0%, rgba(59,130,246,0.14) 30%, rgba(16,185,129,0.09) 60%, transparent 80%)`,
            }} />
            {/* 6 vivid floating blobs */}
            <motion.div animate={{ x:[0,60,-35,20,0], y:[0,-40,30,-15,0] }} transition={{ duration:13, repeat:Infinity, ease:'easeInOut' }}
              className="absolute top-[-100px] left-[-80px] w-[480px] h-[480px] rounded-full opacity-50"
              style={{ background: 'radial-gradient(circle,#a5b4fc,transparent 65%)' }} />
            <motion.div animate={{ x:[0,-50,40,-20,0], y:[0,50,-30,10,0] }} transition={{ duration:17, repeat:Infinity, ease:'easeInOut', delay:3 }}
              className="absolute bottom-[-80px] right-[-60px] w-[420px] h-[420px] rounded-full opacity-45"
              style={{ background: 'radial-gradient(circle,#fde68a,transparent 65%)' }} />
            <motion.div animate={{ x:[0,30,-50,20,0], y:[0,-30,40,-10,0] }} transition={{ duration:20, repeat:Infinity, ease:'easeInOut', delay:6 }}
              className="absolute top-1/2 left-1/2 w-[380px] h-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
              style={{ background: 'radial-gradient(circle,#6ee7b7,transparent 65%)' }} />
            <motion.div animate={{ x:[0,-40,30,0], y:[0,35,-25,0] }} transition={{ duration:15, repeat:Infinity, ease:'easeInOut', delay:2 }}
              className="absolute top-[10%] right-[15%] w-[300px] h-[300px] rounded-full opacity-35"
              style={{ background: 'radial-gradient(circle,#f9a8d4,transparent 65%)' }} />
            <motion.div animate={{ x:[0,25,-35,0], y:[0,-20,30,0] }} transition={{ duration:22, repeat:Infinity, ease:'easeInOut', delay:8 }}
              className="absolute bottom-[15%] left-[20%] w-[260px] h-[260px] rounded-full opacity-30"
              style={{ background: 'radial-gradient(circle,#7dd3fc,transparent 65%)' }} />
            <motion.div animate={{ x:[0,-20,40,0], y:[0,25,-35,0] }} transition={{ duration:19, repeat:Infinity, ease:'easeInOut', delay:5 }}
              className="absolute top-[60%] right-[5%] w-[220px] h-[220px] rounded-full opacity-35"
              style={{ background: 'radial-gradient(circle,#c4b5fd,transparent 65%)' }} />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section label */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-center mb-6"
            >
              <span className="inline-block bg-primary-50 text-primary-600 text-sm font-semibold px-4 py-1.5 rounded-full tracking-wide">What We Offer</span>
            </motion.div>

            {/* Running marquee heading */}
            <div className="relative overflow-hidden mb-4 -mx-4 sm:-mx-6 lg:-mx-8">
              <div className="bg-gradient-to-r from-primary-600 via-violet-600 to-pink-500 py-4 overflow-hidden">
                <motion.div
                  animate={{ x: ['0%', '-50%'] }}
                  transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                  className="flex whitespace-nowrap"
                >
                  {[...Array(6)].map((_, i) => (
                    <span key={i} className="inline-flex items-center gap-4 text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight px-8">
                      Services for Every Need
                      <span className="text-yellow-300 text-2xl select-none">✦</span>
                    </span>
                  ))}
                </motion.div>
              </div>
              {/* Fade edges */}
              <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none" />
              <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none" />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-center text-gray-500 max-w-xl mx-auto mb-14"
            >
              From daily house cleaning to long-term elder care — verified professionals for everything.
            </motion.p>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-40px' }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
            >
              {SERVICES.map((svc, idx) => {
                const theme = SERVICE_THEME[svc];
                const isHovered = hoveredCard === svc;
                return (
                  <motion.div
                    key={svc}
                    variants={{
                      initial: { opacity: 0, y: 40, scale: 0.92 },
                      animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] } },
                    }}
                  >
                    <Link
                      to={`/workers?service=${svc}`}
                      className="block"
                      onMouseEnter={() => setHoveredCard(svc)}
                      onMouseLeave={() => setHoveredCard(null)}
                      onTouchStart={(e) => {
                        // First tap shows popup; second tap (while popup visible) navigates
                        if (hoveredCard !== svc) {
                          e.preventDefault();
                          clearTimeout(touchTimerRef.current);
                          setHoveredCard(svc);
                          touchTimerRef.current = setTimeout(() => setHoveredCard(null), 2000);
                        }
                      }}
                    >
                      <motion.div
                        animate={isHovered ? { y: -10, scale: 1.04 } : { y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                        className="relative flex flex-col items-center gap-2 pt-12 pb-5 px-3 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl overflow-visible cursor-pointer"
                        style={{ minHeight: 185 }}
                      >
                        {/* Animated bg fill */}
                        <motion.div
                          animate={{ opacity: isHovered ? 1 : 0 }}
                          transition={{ duration: 0.3 }}
                          className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${theme.light}`}
                        />

                        {/* Top gradient bar */}
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.gradient} rounded-t-3xl`} />

                        {/* ── Popup character — floats above card ── */}
                        <AnimatePresence>
                          {isHovered && (
                            <motion.div
                              key="popup"
                              initial={{ y: 40, scale: 0.1, opacity: 0 }}
                              animate={{ y: -80, scale: 1, opacity: 1 }}
                              exit={{ y: 30, scale: 0.15, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 420, damping: 16 }}
                              className="absolute top-0 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none"
                            >
                              {/* Glow ring behind bubble */}
                              <motion.div
                                animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.7, 0.4] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="absolute rounded-full"
                                style={{ width: 'clamp(100px, 13vw, 130px)', height: 'clamp(100px, 13vw, 130px)', background: `radial-gradient(circle, ${theme.bgColor}, transparent 70%)`, top: -15 }}
                              />
                              {/* Character bubble */}
                              <div
                                className="relative flex items-center justify-center rounded-full shadow-2xl border-[4px] sm:border-[5px] border-white"
                                style={{ width: 'clamp(76px, 10vw, 100px)', height: 'clamp(76px, 10vw, 100px)', background: theme.bgColor, fontSize: 'clamp(36px, 5vw, 52px)' }}
                              >
                                <motion.span
                                  animate={{ rotate: theme.charAnim, scale: [1, 1.2, 0.9, 1.1, 1] }}
                                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                                  className="select-none leading-none"
                                >
                                  {theme.character}
                                </motion.span>
                                {/* Particle 1 */}
                                <motion.span
                                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                                  animate={{ opacity: [0, 1, 1, 0], x: -46, y: -30, scale: [0, 1.4, 1.2, 0.8] }}
                                  transition={{ duration: 1.0, delay: 0.05, repeat: Infinity, repeatDelay: 0.9 }}
                                  className="absolute text-xl select-none"
                                >{theme.particles[0]}</motion.span>
                                {/* Particle 2 */}
                                <motion.span
                                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                                  animate={{ opacity: [0, 1, 1, 0], x: 42, y: -36, scale: [0, 1.3, 1.1, 0.7] }}
                                  transition={{ duration: 1.1, delay: 0.2, repeat: Infinity, repeatDelay: 0.8 }}
                                  className="absolute text-xl select-none"
                                >{theme.particles[1]}</motion.span>
                                {/* Particle 3 */}
                                <motion.span
                                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                                  animate={{ opacity: [0, 1, 1, 0], x: 50, y: 18, scale: [0, 1.2, 1.0, 0.6] }}
                                  transition={{ duration: 1.2, delay: 0.4, repeat: Infinity, repeatDelay: 0.7 }}
                                  className="absolute text-lg select-none"
                                >{theme.particles[2]}</motion.span>
                                {/* Particle 4 — extra bounce left-bottom */}
                                <motion.span
                                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                                  animate={{ opacity: [0, 1, 0], x: -40, y: 22, scale: [0, 1.0, 0.5] }}
                                  transition={{ duration: 0.9, delay: 0.6, repeat: Infinity, repeatDelay: 1.1 }}
                                  className="absolute text-base select-none"
                                >✨</motion.span>
                              </div>
                              {/* Tail */}
                              <div
                                className="w-4 h-4 -mt-2 rotate-45 border-b-[3px] border-r-[3px] border-white"
                                style={{ background: theme.bgColor }}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Main icon (hidden when popped) */}
                        <motion.div
                          animate={{ scale: isHovered ? 0.7 : 1, opacity: isHovered ? 0.4 : 1 }}
                          transition={{ duration: 0.25 }}
                          className="relative z-10 w-14 h-14 flex items-center justify-center text-4xl leading-none select-none"
                        >
                          {serviceIcons[svc]}
                        </motion.div>

                        {/* Label */}
                        <motion.p
                          animate={{ color: isHovered ? theme.text.replace('text-', '') : '#1f2937' }}
                          className={`relative z-10 text-sm font-black text-gray-800 text-center leading-tight`}
                        >
                          {serviceLabels[svc]}
                        </motion.p>

                        {/* Desc — slides in on hover */}
                        <AnimatePresence>
                          {isHovered && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="relative z-10 text-xs text-gray-500 text-center leading-snug px-1"
                            >
                              {theme.desc}
                            </motion.p>
                          )}
                        </AnimatePresence>

                        {/* CTA */}
                        <AnimatePresence>
                          {isHovered && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.7, y: 6 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.7, y: 6 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.05 }}
                              className={`relative z-10 inline-flex items-center gap-1 text-xs font-bold ${theme.text} bg-white px-3 py-1 rounded-full shadow border border-white/80`}
                            >
                              Book Now <ArrowRight size={10} />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-center mt-12"
            >
              <Link
                to="/workers"
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold px-8 py-3.5 rounded-xl text-sm transition-all duration-200 shadow-lg hover:-translate-y-0.5 hover:shadow-xl"
              >
                View All Services <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── How it Works ──────────────────────────────────────────────────────── */}
      <section ref={stepsSectionRef} className="py-20 relative overflow-hidden">
          {/* ── Vivid base mesh ── */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(115deg,#fce7f3 0%,#ede9fe 22%,#dbeafe 44%,#d1fae5 66%,#fef9c3 88%,#fce7f3 100%)',
          }} />
          {/* ── Diagonal stripe texture ── */}
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: 'repeating-linear-gradient(45deg,#8b5cf6 0px,#8b5cf6 1px,transparent 1px,transparent 20px)',
          }} />
          {/* ── Opposing diagonal ── */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'repeating-linear-gradient(-45deg,#ec4899 0px,#ec4899 1px,transparent 1px,transparent 30px)',
          }} />
          {/* ── Cursor spotlight ── */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `radial-gradient(580px circle at ${stepsCursor.px}% ${stepsCursor.py}%, rgba(99,102,241,0.20) 0%, rgba(236,72,153,0.13) 35%, rgba(245,158,11,0.09) 60%, transparent 80%)`,
          }} />
          {/* ── 6 vivid floating blobs ── */}
          <motion.div animate={{ x:[0,-50,38,-15,0], y:[0,38,-28,12,0] }} transition={{ duration:12, repeat:Infinity, ease:'easeInOut' }}
            className="absolute top-[-90px] right-[-60px] w-[440px] h-[440px] rounded-full pointer-events-none opacity-50"
            style={{ background: 'radial-gradient(circle,#ddd6fe,transparent 65%)' }} />
          <motion.div animate={{ x:[0,45,-30,10,0], y:[0,-30,40,-12,0] }} transition={{ duration:16, repeat:Infinity, ease:'easeInOut', delay:4 }}
            className="absolute bottom-[-70px] left-[-40px] w-[400px] h-[400px] rounded-full pointer-events-none opacity-45"
            style={{ background: 'radial-gradient(circle,#fca5a5,transparent 65%)' }} />
          <motion.div animate={{ x:[0,-25,40,0], y:[0,20,-30,0] }} transition={{ duration:18, repeat:Infinity, ease:'easeInOut', delay:7 }}
            className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full pointer-events-none opacity-40"
            style={{ background: 'radial-gradient(circle,#6ee7b7,transparent 65%)' }} />
          <motion.div animate={{ x:[0,35,-20,0], y:[0,-25,18,0] }} transition={{ duration:21, repeat:Infinity, ease:'easeInOut', delay:2 }}
            className="absolute top-[5%] left-[10%] w-[280px] h-[280px] rounded-full pointer-events-none opacity-40"
            style={{ background: 'radial-gradient(circle,#fde68a,transparent 65%)' }} />
          <motion.div animate={{ x:[0,-30,25,0], y:[0,30,-20,0] }} transition={{ duration:14, repeat:Infinity, ease:'easeInOut', delay:9 }}
            className="absolute bottom-[10%] right-[12%] w-[240px] h-[240px] rounded-full pointer-events-none opacity-35"
            style={{ background: 'radial-gradient(circle,#7dd3fc,transparent 65%)' }} />
          <motion.div animate={{ x:[0,20,-35,0], y:[0,-18,28,0] }} transition={{ duration:25, repeat:Infinity, ease:'easeInOut', delay:6 }}
            className="absolute top-1/2 left-1/3 w-[200px] h-[200px] rounded-full pointer-events-none opacity-30"
            style={{ background: 'radial-gradient(circle,#f9a8d4,transparent 65%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mb-16"
          >
            <span className="inline-block bg-primary-50 text-primary-600 text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest uppercase">How It Works</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900">
              {isWorker ? 'Start earning in ' : 'Book in '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-violet-600">4 simple steps</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative">
            {/* Connecting line — desktop */}
            <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px z-0">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: 'easeInOut', delay: 0.3 }}
                style={{ transformOrigin: 'left' }}
                className="h-full bg-gradient-to-r from-primary-300 via-violet-300 to-pink-300"
              />
            </div>

            {(isWorker ? WORKER_HOW_IT_WORKS : HOW_IT_WORKS).map(({ step, title, desc, emoji }, idx) => {
              const colors = [
                { ring: 'ring-blue-200', numBg: 'from-blue-500 to-cyan-500', dot: 'bg-blue-500', card: 'hover:border-blue-200 hover:shadow-blue-100' },
                { ring: 'ring-violet-200', numBg: 'from-violet-500 to-purple-500', dot: 'bg-violet-500', card: 'hover:border-violet-200 hover:shadow-violet-100' },
                { ring: 'ring-pink-200', numBg: 'from-pink-500 to-rose-500', dot: 'bg-pink-500', card: 'hover:border-pink-200 hover:shadow-pink-100' },
                { ring: 'ring-amber-200', numBg: 'from-amber-400 to-orange-500', dot: 'bg-amber-400', card: 'hover:border-amber-200 hover:shadow-amber-100' },
              ][idx];

              return (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  className="relative z-10 flex flex-col items-center text-center group"
                >
                  {/* Step circle */}
                  <motion.div
                    whileHover={{ scale: 1.12, rotate: [0, -6, 6, 0] }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${colors.numBg} flex flex-col items-center justify-center shadow-xl mb-6 ring-4 ${colors.ring} ring-offset-2 select-none`}
                  >
                    <span className="text-3xl leading-none mb-0.5">{emoji}</span>
                    <span className="text-white/70 text-xs font-bold tracking-widest">{step}</span>
                  </motion.div>

                  {/* Card */}
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`w-full bg-white rounded-2xl border border-gray-100 shadow-md ${colors.card} hover:shadow-lg transition-all duration-300 p-5`}
                  >
                    <h3 className="text-base font-black text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-950 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-primary-800/20 via-violet-800/15 to-pink-800/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mb-14"
          >
            <span className="inline-block bg-white/8 text-gray-300 text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest uppercase border border-white/10">Why MaidMatch</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
              {isWorker ? 'Built for workers ' : 'Built for '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">like you</span>
            </h2>
          </motion.div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(isWorker ? WORKER_FEATURES : CUSTOMER_FEATURES).map(({ icon: Icon, title, desc, gradient }, idx) => {
              const isLarge = idx === 0 || idx === 5;
              return (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`group relative rounded-2xl overflow-hidden border border-white/8 cursor-default ${isLarge ? 'sm:col-span-2 lg:col-span-1' : ''}`}
                  style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}
                >
                  {/* Gradient sweep on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-15 transition-opacity duration-500`} />
                  {/* Corner accent */}
                  <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full group-hover:opacity-25 transition-opacity duration-500`} />

                  <div className="relative p-6 lg:p-7">
                    {/* Icon with floating animation */}
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 3 + idx * 0.4, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.3 }}
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg`}
                    >
                      <Icon size={24} className="text-white" />
                    </motion.div>

                    <h3 className="text-base font-black text-white mb-2">{title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">{desc}</p>

                    {/* Bottom read more */}
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      whileHover={{ opacity: 1, x: 0 }}
                      className="mt-4 flex items-center gap-1.5 text-xs font-bold text-transparent bg-clip-text"
                      style={{ backgroundImage: `var(--tw-gradient-stops)` }}
                    >
                      <span className={`text-xs font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                        Learn more →
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── App Download ─────────────────────────────────────────────────────── */}
      <section className="relative py-16 overflow-hidden bg-gradient-to-br from-gray-950 to-gray-900">
        {/* Decorative glows */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

            {/* Left — text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="flex-1 text-center lg:text-left"
            >
              <span className="inline-block bg-yellow-400/15 text-yellow-300 text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest uppercase border border-yellow-400/20">
                Coming Soon
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
                MaidMatch on your{' '}
                <span className="text-yellow-300">pocket</span>
              </h2>
              <p className="text-gray-400 text-base max-w-md mx-auto lg:mx-0 mb-8 leading-relaxed">
                Book verified home service workers on the go. Search, book, pay and track — all from your phone.
              </p>

              {/* Store badges */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {/* Google Play */}
                <motion.a
                  whileHover={{ scale: 1.04, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  href="#"
                  className="flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/30 rounded-2xl px-6 py-4 transition-colors group"
                >
                  {/* Play Store icon */}
                  <svg viewBox="0 0 24 24" className="w-10 h-10 flex-shrink-0" fill="none">
                    <path d="M3.18 23.76a2 2 0 0 1-.68-1.53V1.77A2 2 0 0 1 3.18.24L13.6 12 3.18 23.76z" fill="#4FC3F7"/>
                    <path d="M17.07 15.93l-3.47-3.93 3.47-3.93 4.14 2.4a2 2 0 0 1 0 3.06l-4.14 2.4z" fill="#FFCA28"/>
                    <path d="M3.18.24l10.42 11.76L7.29 6.65 3.18.24z" fill="#66BB6A"/>
                    <path d="M3.18 23.76l4.11-6.41 6.31-5.35L3.18 23.76z" fill="#EF5350"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-gray-400 text-xs leading-none mb-1">GET IT ON</p>
                    <p className="text-white font-bold text-lg leading-none">Google Play</p>
                  </div>
                </motion.a>

                {/* App Store */}
                <motion.a
                  whileHover={{ scale: 1.04, y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  href="#"
                  className="flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/30 rounded-2xl px-6 py-4 transition-colors group"
                >
                  {/* Apple icon */}
                  <svg viewBox="0 0 24 24" className="w-10 h-10 flex-shrink-0 fill-white">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-gray-400 text-xs leading-none mb-1">DOWNLOAD ON THE</p>
                    <p className="text-white font-bold text-lg leading-none">App Store</p>
                  </div>
                </motion.a>
              </div>
            </motion.div>

            {/* Right — phone mockup */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex-shrink-0 flex flex-col items-center gap-4"
            >
              {/* QR-style placeholder + phone frame */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="relative"
              >
                {/* Phone frame */}
                <div className="w-44 h-80 bg-gradient-to-b from-gray-800 to-gray-900 rounded-[2.5rem] border-4 border-gray-700 shadow-2xl shadow-black/60 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
                  {/* Screen glow */}
                  <div className="absolute inset-2 rounded-[2rem] bg-gradient-to-br from-primary-900 to-primary-800 flex flex-col items-center justify-center gap-3 p-4">
                    <div className="text-5xl">🧹</div>
                    <p className="text-white font-black text-base text-center leading-tight">Maid<span className="text-yellow-300">Match</span></p>
                    <div className="w-full space-y-1.5">
                      {['House Cleaning', 'Cooking', 'Elder Care'].map((s) => (
                        <div key={s} className="bg-white/10 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                          <span className="text-white/80 text-xs font-medium">{s}</span>
                        </div>
                      ))}
                    </div>
                    <div className="w-full bg-yellow-400 rounded-xl py-2 text-center">
                      <span className="text-gray-900 font-bold text-xs">Book Now</span>
                    </div>
                  </div>
                  {/* Notch */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-3 bg-gray-900 rounded-full z-10" />
                </div>

                {/* Floating badges around phone */}
                <motion.div
                  animate={{ scale: [1, 1.08, 1], rotate: [0, 3, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="absolute -top-3 -right-6 bg-yellow-400 text-gray-900 text-xs font-black px-3 py-1.5 rounded-xl shadow-lg"
                >
                  4.8 ★
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.08, 1], rotate: [0, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  className="absolute -bottom-2 -left-8 bg-green-400 text-gray-900 text-xs font-black px-3 py-1.5 rounded-xl shadow-lg"
                >
                  2500+ Workers
                </motion.div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/95 via-primary-800/90 to-primary-700/85" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block bg-yellow-400/20 text-yellow-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-widest uppercase border border-yellow-400/30">
              {isWorker ? 'Keep Growing' : 'Get Started Today'}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-5 leading-tight">
              {isWorker ? 'Ready to grow your income?' : 'Ready to find your perfect match?'}
            </h2>
            <p className="text-primary-200 text-lg mb-10 max-w-xl mx-auto">
              {isWorker
                ? 'Keep your profile updated, accept more bookings, and watch your wallet grow.'
                : 'Join thousands of happy customers who trust MaidMatch for their home service needs.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isWorker ? (
                <>
                  <Link
                    to="/worker/dashboard"
                    className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-4 rounded-xl text-base transition-all shadow-lg shadow-yellow-400/30 hover:-translate-y-0.5"
                  >
                    Go to Dashboard <ArrowRight size={18} />
                  </Link>
                  <Link
                    to="/worker/bookings"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/30 px-8 py-4 rounded-xl text-base transition-all backdrop-blur-sm"
                  >
                    View My Bookings
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/workers"
                    className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-4 rounded-xl text-base transition-all shadow-lg shadow-yellow-400/30 hover:-translate-y-0.5"
                  >
                    Browse Workers <ArrowRight size={18} />
                  </Link>
                  {!user && (
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/30 px-8 py-4 rounded-xl text-base transition-all backdrop-blur-sm"
                    >
                      Register as Worker
                    </Link>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
