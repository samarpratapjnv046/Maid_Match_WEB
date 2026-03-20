import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Shield, Clock, CheckCircle, Users, TrendingUp, MapPin, Wallet, CalendarCheck, UserCircle, LayoutDashboard, Search, ChevronLeft, ChevronRight, Play } from 'lucide-react';
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
  house_cleaning: { gradient: 'from-blue-500 to-cyan-500',    light: 'from-blue-50 to-cyan-50',    border: 'hover:border-blue-300',    glow: 'hover:shadow-blue-200',    text: 'text-blue-600',    desc: 'Spotless home, every day' },
  cooking:        { gradient: 'from-orange-500 to-amber-400',  light: 'from-orange-50 to-amber-50',  border: 'hover:border-orange-300',  glow: 'hover:shadow-orange-200',  text: 'text-orange-600',  desc: 'Delicious meals at home' },
  babysitting:    { gradient: 'from-pink-500 to-rose-400',     light: 'from-pink-50 to-rose-50',     border: 'hover:border-pink-300',    glow: 'hover:shadow-pink-200',    text: 'text-pink-600',    desc: 'Safe, caring childcare' },
  elder_care:     { gradient: 'from-violet-500 to-purple-500', light: 'from-violet-50 to-purple-50', border: 'hover:border-violet-300',  glow: 'hover:shadow-violet-200',  text: 'text-violet-600',  desc: 'Compassionate senior care' },
  laundry:        { gradient: 'from-teal-500 to-cyan-500',     light: 'from-teal-50 to-cyan-50',     border: 'hover:border-teal-300',    glow: 'hover:shadow-teal-200',    text: 'text-teal-600',    desc: 'Fresh & folded, always' },
  gardening:      { gradient: 'from-emerald-500 to-green-500', light: 'from-emerald-50 to-green-50', border: 'hover:border-emerald-300', glow: 'hover:shadow-emerald-200', text: 'text-emerald-600', desc: 'Beautiful gardens & lawns' },
  driver:         { gradient: 'from-slate-600 to-gray-600',    light: 'from-slate-50 to-gray-100',   border: 'hover:border-slate-300',   glow: 'hover:shadow-slate-200',   text: 'text-slate-600',   desc: 'Reliable rides, any time' },
  deep_cleaning:  { gradient: 'from-indigo-500 to-blue-600',   light: 'from-indigo-50 to-blue-50',   border: 'hover:border-indigo-300',  glow: 'hover:shadow-indigo-200',  text: 'text-indigo-600',  desc: 'Deep sanitized cleaning' },
  security_guard: { gradient: 'from-red-500 to-rose-500',      light: 'from-red-50 to-rose-50',      border: 'hover:border-red-300',     glow: 'hover:shadow-red-200',     text: 'text-red-600',     desc: 'Trusted home security' },
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

  const prev = () => {
    const idx = (current - 1 + HERO_SLIDES.length) % HERO_SLIDES.length;
    setDirection(-1);
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
    <section className="relative h-[88vh] max-h-[700px] min-h-[520px] flex items-center overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-transparent" />
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
          className="absolute top-20 right-4 lg:right-12 z-10"
        >
          <div className={`${slide.badge} text-white px-4 py-2 rounded-full text-sm font-bold shadow-2xl flex items-center gap-2`}>
            <span className="text-lg">{slide.emoji}</span>
            {slide.service}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Main content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
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

          <p className="text-base text-gray-300 max-w-lg mb-6 leading-relaxed">
            Verified, background-checked professionals for cleaning, cooking, babysitting, and more.
            <span className="text-yellow-300 font-semibold"> Book in minutes, pay securely.</span>
          </p>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-2 max-w-lg mb-5">
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

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
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

      {/* ── Slider controls ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4">
        <button
          onClick={prev}
          className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-2">
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

        <button
          onClick={next}
          className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all"
        >
          <ChevronRight size={18} />
        </button>
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

      {/* ── Services Marquee (customer only) ─────────────────────────────────── */}
      {!isWorker && <ServicesMarquee />}

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {STATS.map(({ label, value, icon: Icon, gradient, shadow, bg, iconColor }) => (
              <motion.div
                key={label}
                variants={cardFadeUp}
                className={`relative flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-md ${shadow} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} rounded-t-2xl`} />
                <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center mb-4 mt-1`}>
                  <Icon size={24} className={iconColor} />
                </div>
                <p className="text-3xl font-extrabold text-gray-900 leading-tight">{value}</p>
                <p className="text-sm text-gray-500 mt-1 font-medium">{label}</p>
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
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
          {/* Subtle bg decoration */}
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 15% 50%, #dbeafe 0%, transparent 40%), radial-gradient(circle at 85% 20%, #fef3c7 0%, transparent 35%)' }} />

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
                return (
                  <motion.div
                    key={svc}
                    variants={{
                      initial: { opacity: 0, y: 40, scale: 0.92 },
                      animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] } },
                    }}
                  >
                    <Link to={`/workers?service=${svc}`} className="group block">
                      <motion.div
                        whileHover={{ y: -8, scale: 1.03 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className={`relative flex flex-col items-center gap-3 p-6 bg-white rounded-3xl border border-gray-100 ${theme.border} ${theme.glow} shadow-sm hover:shadow-xl overflow-hidden cursor-pointer transition-colors duration-300`}
                      >
                        {/* Gradient fill on hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${theme.light} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                        {/* Shine sweep */}
                        <motion.div
                          initial={{ x: '-120%', opacity: 0 }}
                          whileHover={{ x: '180%', opacity: 1 }}
                          transition={{ duration: 0.55, ease: 'easeInOut' }}
                          className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none"
                        />

                        {/* Top gradient accent bar */}
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.gradient} rounded-t-3xl`} />

                        {/* Emoji icon with spring scale */}
                        <motion.div
                          whileHover={{ scale: 1.25, rotate: [0, -8, 8, 0] }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                          className="relative z-10 w-16 h-16 flex items-center justify-center text-4xl leading-none mt-1 drop-shadow-sm select-none"
                        >
                          {serviceIcons[svc]}
                        </motion.div>

                        {/* Label */}
                        <p className={`relative z-10 text-sm font-bold text-gray-800 group-hover:${theme.text} text-center leading-tight transition-colors duration-200`}>
                          {serviceLabels[svc]}
                        </p>

                        {/* Short desc — shown on hover */}
                        <p className="relative z-10 text-xs text-gray-400 group-hover:text-gray-600 text-center leading-snug transition-colors duration-200 line-clamp-1">
                          {theme.desc}
                        </p>

                        {/* CTA pill */}
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className={`relative z-10 inline-flex items-center gap-1 text-xs font-bold ${theme.text} bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-white`}
                        >
                          Browse <ArrowRight size={11} />
                        </motion.span>
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
      <section className={`py-20 ${isWorker ? 'bg-gray-50' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="text-center mb-14"
          >
            <span className="inline-block bg-primary-50 text-primary-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-3">How It Works</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
              {isWorker ? 'Start earning in 4 steps' : 'Book in 4 simple steps'}
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {(isWorker ? WORKER_HOW_IT_WORKS : HOW_IT_WORKS).map(({ step, title, desc, emoji }, idx) => (
              <motion.div key={step} variants={cardFadeUp} className="relative">
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-primary-300 via-primary-100 to-transparent z-0" />
                )}
                <div className="relative z-10 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 p-7 h-full flex flex-col">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl flex items-center justify-center text-lg font-extrabold shadow-lg shadow-primary-300/40">
                      {step}
                    </div>
                    <div className="text-3xl leading-none mt-1">{emoji}</div>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                  <div className="mt-4 w-8 h-0.5 bg-gradient-to-r from-primary-400 to-primary-200 rounded-full" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────────── */}
      <section className={`py-20 ${isWorker ? 'bg-white' : 'bg-gradient-to-b from-gray-50 to-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="text-center mb-12"
          >
            <span className="inline-block bg-primary-50 text-primary-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-3">Why MaidMatch</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">
              {isWorker ? 'Built for workers like you' : 'Built for trust & reliability'}
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {(isWorker ? WORKER_FEATURES : CUSTOMER_FEATURES).map(({ icon: Icon, title, desc, gradient, lightBg, iconColor, border }) => (
              <motion.div
                key={title}
                variants={cardFadeUp}
                className={`group bg-white rounded-2xl border border-gray-100 ${border} shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 p-7 relative overflow-hidden`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} rounded-t-2xl`} />
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 rounded-2xl`} />
                <div className={`w-12 h-12 rounded-xl ${lightBg} flex items-center justify-center mb-5 relative`}>
                  <Icon size={22} className={iconColor} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
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
