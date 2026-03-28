import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Shield, Clock, CheckCircle, Users, TrendingUp, MapPin, Wallet, CalendarCheck, UserCircle, LayoutDashboard, Search, Play, X as XIcon, ChevronLeft, ChevronRight, Zap, Tag, Copy, Check, BadgePercent } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { serviceIcons, serviceLabels } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';
import WorkerDemoSection from '../components/common/WorkerDemoSection';
import api from '../api/axios';
import SEO from '../components/common/SEO';
import { organizationSchema, localBusinessSchema, websiteSchema, homeFaqSchema } from '../utils/schema';

const SERVICES = [
  'house_cleaning', 'cooking', 'babysitting',
  'elder_care', 'laundry', 'gardening',
  'driver', 'deep_cleaning', 'security_guard',
];

const SERVICE_THEME = {
  house_cleaning: { gradient: 'from-sky-500 to-cyan-400',      light: 'from-sky-100 to-cyan-100',      border: 'hover:border-sky-300',     text: 'text-sky-600',     desc: 'Spotless home, every day',       character: '🧹', particles: ['✨','💧','🫧'], charAnim: [0,-12,8,-4,0], bgColor: '#bae6fd', shadowColor: 'rgba(14,165,233,0.32)' },
  cooking:        { gradient: 'from-orange-500 to-amber-400',   light: 'from-orange-100 to-amber-100',  border: 'hover:border-orange-300',  text: 'text-orange-600',  desc: 'Delicious meals at home',        character: '👨‍🍳', particles: ['🍳','🌶️','⭐'], charAnim: [0,-8,12,-6,0], bgColor: '#fed7aa', shadowColor: 'rgba(249,115,22,0.32)' },
  babysitting:    { gradient: 'from-pink-500 to-rose-400',      light: 'from-pink-100 to-rose-100',     border: 'hover:border-pink-300',    text: 'text-pink-600',    desc: 'Safe, caring childcare',         character: '👶', particles: ['🍼','💕','⭐'], charAnim: [0,-6,10,-6,0], bgColor: '#fbcfe8', shadowColor: 'rgba(236,72,153,0.32)' },
  elder_care:     { gradient: 'from-violet-500 to-purple-500',  light: 'from-violet-100 to-purple-100', border: 'hover:border-violet-300',  text: 'text-violet-600',  desc: 'Compassionate senior care',      character: '👵', particles: ['❤️','🌸','✨'], charAnim: [0,-10,6,-4,0], bgColor: '#ddd6fe', shadowColor: 'rgba(139,92,246,0.32)' },
  laundry:        { gradient: 'from-teal-500 to-emerald-400',   light: 'from-teal-100 to-emerald-100',  border: 'hover:border-teal-300',    text: 'text-teal-600',    desc: 'Fresh & folded, always',         character: '🫧', particles: ['👕','💧','✨'], charAnim: [0,-14,6,-4,0], bgColor: '#99f6e4', shadowColor: 'rgba(20,184,166,0.32)' },
  gardening:      { gradient: 'from-emerald-500 to-green-400',  light: 'from-emerald-100 to-green-100', border: 'hover:border-emerald-300', text: 'text-emerald-600', desc: 'Beautiful gardens & lawns',       character: '🧑‍🌾', particles: ['🌱','🌻','🍃'], charAnim: [0,-8,8,-4,0], bgColor: '#bbf7d0', shadowColor: 'rgba(16,185,129,0.32)' },
  driver:         { gradient: 'from-amber-500 to-yellow-400',   light: 'from-amber-100 to-yellow-100',  border: 'hover:border-amber-300',   text: 'text-amber-600',   desc: 'Reliable rides, any time',       character: '🚗', particles: ['🛣️','⚡','🗺️'], charAnim: [0,-6,16,-8,0], bgColor: '#fde68a', shadowColor: 'rgba(245,158,11,0.32)' },
  deep_cleaning:  { gradient: 'from-indigo-500 to-blue-500',    light: 'from-indigo-100 to-blue-100',   border: 'hover:border-indigo-300',  text: 'text-indigo-600',  desc: 'Deep sanitized cleaning',        character: '🧼', particles: ['🫧','✨','💦'], charAnim: [0,-12,8,-4,0], bgColor: '#c7d2fe', shadowColor: 'rgba(99,102,241,0.32)' },
  security_guard: { gradient: 'from-red-500 to-rose-500',       light: 'from-red-100 to-rose-100',      border: 'hover:border-red-300',     text: 'text-red-600',     desc: 'Trusted home security',          character: '💂', particles: ['🛡️','⚔️','✅'], charAnim: [0,-10,6,-4,0], bgColor: '#fecdd3', shadowColor: 'rgba(239,68,68,0.32)' },
};

const SERVICE_IMAGES = {
  house_cleaning: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
  cooking:        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80',
  babysitting:    'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80',
  elder_care:     'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=600&q=80',
  laundry:        'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=600&q=80',
  gardening:      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80',
  driver:         'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=600&q=80',
  deep_cleaning:  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80',
  security_guard: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80',
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
  { icon: Wallet, title: 'Instant Wallet Payouts', desc: 'Earnings land in your MaidSaathi wallet right after job completion. Withdraw to your bank at any time.', gradient: 'from-emerald-500 to-teal-600', lightBg: 'bg-emerald-50', iconColor: 'text-emerald-600', border: 'hover:border-emerald-200' },
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
const HeroSlider = ({ searchCity, setSearchCity, navigate, user, t }) => {
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
              {t ? t('common.search') : 'Search'}
            </button>
          </div>

          {/* CTA buttons — hidden on mobile (shown below hero instead) */}
          <div className="hidden sm:flex flex-wrap gap-3 mb-6">
            <Link
              to="/workers"
              className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-7 py-3.5 rounded-xl text-sm transition-all duration-200 shadow-lg hover:-translate-y-0.5 hover:shadow-xl"
            >
              {t('home.findWorkers')} <ArrowRight size={16} />
            </Link>
            {!user && (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/30 px-7 py-3.5 rounded-xl text-sm transition-all duration-200 backdrop-blur-sm"
              >
                {t('home.becomePro')}
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

// ── Offers Section ────────────────────────────────────────────────────────────

/** Extract YouTube video ID from any YouTube URL format */
const getYoutubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
};

/** Countdown timer hook */
function useCountdown(expiresAt) {
  const calc = () => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt) - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { h, m, s, diff };
  };
  const [cd, setCd] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setCd(calc()), 1000);
    return () => clearInterval(t);
  }, [expiresAt]);
  return cd;
}

/** Single offer card */
function OfferCard({ offer, onPlayVideo }) {
  const cd      = useCountdown(offer.expires_at);
  const ytId    = getYoutubeId(offer.video_url);
  const showCd  = cd && cd.diff < 24 * 3600000; // show only in last 24 h
  const [copied, setCopied] = useState(false);

  const copyCoupon = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(offer.coupon_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6, scale: 1.015 }}
      className={`relative rounded-3xl overflow-hidden shadow-xl border border-white/10 flex-shrink-0 w-full sm:w-[340px] lg:w-[380px] bg-gradient-to-br ${offer.gradient}`}
      style={{ minHeight: 240 }}
    >
      {/* Background image overlay */}
      {offer.image_url && (
        <img
          src={offer.image_url}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity"
        />
      )}

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Shimmer sweep */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 pointer-events-none"
        animate={{ x: ['-120%', '220%'] }}
        transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
      />

      {/* Glow orb */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: offer.accent_color || '#ffffff' }}
      />

      {/* Content */}
      <div className="relative z-10 p-6 flex flex-col justify-between h-full" style={{ minHeight: 240 }}>
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          {/* Badge */}
          {offer.badge_text && (
            <motion.span
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full bg-white/25 text-white backdrop-blur-sm border border-white/30 tracking-wide uppercase"
            >
              <Zap size={10} className="fill-current" />
              {offer.badge_text}
            </motion.span>
          )}

          {/* Discount pill */}
          {offer.discount_percent > 0 && (
            <motion.div
              initial={{ rotate: -12, scale: 0.8 }}
              whileInView={{ rotate: -8, scale: 1 }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex flex-col items-center justify-center"
            >
              <p className="text-white font-black text-xl leading-none">{offer.discount_percent}%</p>
              <p className="text-white/80 text-[10px] font-semibold leading-none mt-0.5">OFF</p>
            </motion.div>
          )}
        </div>

        {/* Text */}
        <div className="mb-4">
          <h3 className="text-white font-black text-xl sm:text-2xl leading-tight drop-shadow">
            {offer.title}
          </h3>
          {offer.subtitle && (
            <p className="text-white/80 text-sm mt-1 leading-snug">{offer.subtitle}</p>
          )}
          {offer.description && (
            <p className="text-white/65 text-xs mt-2 leading-relaxed line-clamp-2">{offer.description}</p>
          )}
        </div>

        {/* ── Coupon Code ── */}
        {offer.coupon_code && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-4"
          >
            <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <BadgePercent size={10} />
              Apply at checkout
            </p>
            <button
              onClick={copyCoupon}
              className="group w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border-2 border-dashed border-white/40 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/60 transition-all"
            >
              <span className="font-mono font-black text-white text-lg tracking-widest leading-none">
                {offer.coupon_code}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-white/70 group-hover:text-white transition-colors flex-shrink-0">
                {copied
                  ? <><Check size={13} className="text-emerald-300" /><span className="text-emerald-300">Copied!</span></>
                  : <><Copy size={13} /><span>Copy</span></>
                }
              </span>
            </button>
            <p className="text-white/50 text-[10px] mt-1 text-center">
              {offer.discount_type === 'percentage'
                ? `${offer.discount_value}% off${offer.max_discount ? ` · max ₹${offer.max_discount}` : ''}${offer.min_order_value ? ` · min order ₹${offer.min_order_value}` : ''}`
                : `₹${offer.discount_value} flat off${offer.min_order_value ? ` · min order ₹${offer.min_order_value}` : ''}`
              }
            </p>
          </motion.div>
        )}

        {/* Countdown */}
        {showCd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 mb-4"
          >
            <Clock size={12} className="text-white/70 flex-shrink-0" />
            <p className="text-white/70 text-xs font-medium">Ends in</p>
            {[
              { v: cd.h, l: 'h' },
              { v: cd.m, l: 'm' },
              { v: cd.s, l: 's' },
            ].map(({ v, l }) => (
              <div key={l} className="flex items-center gap-0.5">
                <motion.span
                  key={v}
                  initial={{ y: -6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white/20 text-white text-xs font-bold w-7 text-center py-0.5 rounded-md tabular-nums"
                >
                  {String(v).padStart(2, '0')}
                </motion.span>
                <span className="text-white/50 text-xs">{l}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* CTA row */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to={offer.cta_link || '/workers'}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-md"
            style={{ color: offer.accent_color || '#1B2B4B' }}
          >
            {offer.cta_text || 'Book Now'}
            <ArrowRight size={14} />
          </Link>

          {/* Watch video button */}
          {ytId && (
            <button
              onClick={() => onPlayVideo(ytId)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/30 border border-white/25 text-white text-sm font-semibold backdrop-blur-sm hover:bg-black/40 transition-all"
            >
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Play size={10} className="text-white fill-white ml-0.5" />
              </span>
              Watch
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/** YouTube lightbox modal */
function VideoModal({ ytId, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.88, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
            className="w-full h-full"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            title="Offer video"
          />
        </motion.div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-colors"
        >
          <XIcon size={18} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

/** Main offers section — carousel with prev/next on desktop */
function OffersSection() {
  const [offers,   setOffers]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [videoId,  setVideoId]  = useState(null);
  const [idx,      setIdx]      = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    api.get('/offers')
      .then(({ data }) => setOffers(Array.isArray(data.data) ? data.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const prev = useCallback(() => setIdx((i) => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIdx((i) => Math.min(offers.length - 1, i + 1)), [offers.length]);

  if (loading || offers.length === 0) return null;

  return (
    <section className="relative py-16 overflow-hidden bg-gradient-to-b from-gray-950 to-[#0d1b30]">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/3 w-80 h-60 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-60 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="flex items-center justify-between mb-8 gap-4"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/20 uppercase tracking-widest mb-3">
              <Tag size={10} /> Exclusive Offers
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Deals &amp; Promotions
            </h2>
            <p className="text-gray-400 text-sm mt-1.5">Limited-time offers just for you</p>
          </div>

          {/* Prev / Next — desktop */}
          {offers.length > 1 && (
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <button
                onClick={prev}
                disabled={idx === 0}
                className="w-10 h-10 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-gray-500 text-sm tabular-nums">{idx + 1} / {offers.length}</span>
              <button
                onClick={next}
                disabled={idx === offers.length - 1}
                className="w-10 h-10 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white disabled:opacity-30 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </motion.div>

        {/* Carousel — horizontal scroll on mobile, controlled on desktop */}
        <div className="relative">
          {/* Mobile: native horizontal scroll */}
          <div
            className="flex sm:hidden gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {offers.map((offer) => (
              <div key={offer._id} className="snap-start flex-shrink-0 w-[85vw]">
                <OfferCard offer={offer} onPlayVideo={setVideoId} />
              </div>
            ))}
          </div>

          {/* Desktop: single card view with slide animation */}
          <div className="hidden sm:block overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                ref={trackRef}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={`grid gap-6 ${offers.length === 1 ? 'grid-cols-1 max-w-lg mx-auto' : offers.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}
              >
                {/* Show up to 3 cards at a time */}
                {offers.slice(
                  offers.length <= 3 ? 0 : Math.min(idx, offers.length - 3),
                  offers.length <= 3 ? offers.length : Math.min(idx + 3, offers.length)
                ).map((offer) => (
                  <OfferCard key={offer._id} offer={offer} onPlayVideo={setVideoId} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Dot indicators */}
        {offers.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {offers.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`rounded-full transition-all ${
                  i === idx ? 'w-6 h-2 bg-[#C9A84C]' : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Video lightbox */}
      {videoId && <VideoModal ytId={videoId} onClose={() => setVideoId(null)} />}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isWorker = user?.role === 'worker';
  const [searchCity, setSearchCity] = useState('');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activeServiceIdx, setActiveServiceIdx] = useState(0);
  const touchTimerRef = useRef(null);
  const svcAutoRef = useRef(null);

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

  useEffect(() => {
    svcAutoRef.current = setInterval(() => {
      setActiveServiceIdx(i => (i + 1) % SERVICES.length);
    }, 3500);
    return () => clearInterval(svcAutoRef.current);
  }, []);

  return (
    <div className="min-h-screen">
      <SEO
        title="Book Trusted Maids in Bangalore | MaidSaathi"
        description="Hire verified maids, cooks, babysitters & house helpers in Bangalore. Book part-time or full-time domestic help online. Background-checked workers. Instant booking."
        canonical="https://www.maidsaathi.in/"
        schema={[organizationSchema, localBusinessSchema, websiteSchema, homeFaqSchema]}
      />
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
          t={t}
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
              className="flex-1 inline-flex items-center justify-center bg-white text-gray-900 font-bold py-3 rounded-xl text-sm shadow"
            >
              {t('home.findWorkers')}
            </Link>
            {!user && (
              <Link
                to="/register"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold border border-white/25 py-3 rounded-xl text-sm"
              >
                {t('home.becomePro')}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Services Marquee (customer only) ─────────────────────────────────── */}
      {!isWorker && <ServicesMarquee />}

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gray-950 py-10">
        {/* Ambient glows */}
        <div className="absolute top-0 left-1/4 w-72 h-28 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-28 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
          >
            {STATS.map(({ label, value, icon: Icon, gradient }, i) => (
              <motion.div
                key={label}
                variants={{ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.1 } } }}
                whileHover={{ y: -5, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="relative group cursor-default rounded-xl overflow-hidden border border-white/10"
                style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)' }}
              >
                {/* Shimmer sweep on hover */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.07) 50%, transparent 65%)',
                    backgroundSize: '200% 100%',
                  }}
                  animate={{ backgroundPositionX: ['-100%', '300%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
                />
                {/* Gradient glow on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`} />
                {/* Bottom accent bar with animated width */}
                <motion.div
                  className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${gradient}`}
                  initial={{ width: '0%' }}
                  whileInView={{ width: '100%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                />

                <div className="relative p-3 lg:p-4 flex flex-col items-center text-center gap-2">
                  {/* Icon with pulse ring */}
                  <div className="relative flex items-center justify-center">
                    <motion.div
                      className={`absolute w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} opacity-25 blur-md`}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.25, 0.1, 0.25] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}
                    />
                    <motion.div
                      animate={{ rotate: [0, 7, -7, 0] }}
                      transition={{ duration: 4, repeat: Infinity, delay: i * 0.8, ease: 'easeInOut' }}
                      className={`relative w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}
                      style={{ boxShadow: '0 3px 10px rgba(0,0,0,0.35)' }}
                    >
                      <Icon size={15} className="text-white" />
                    </motion.div>
                  </div>

                  <motion.p
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 220, delay: 0.25 + i * 0.1 }}
                    className={`text-xl lg:text-2xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent leading-tight`}
                  >
                    {value}
                  </motion.p>
                  <p className="text-gray-400 text-[10px] lg:text-xs font-medium leading-tight tracking-wide">{label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Offers & Promotions (customers only) ────────────────────────────────── */}
      {!isWorker && <OffersSection />}

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

      {/* ── Services Carousel (customer only) ─────────────────────────────────── */}
      {!isWorker && (
        <section ref={svcSectionRef} className="py-16 sm:py-20 relative overflow-hidden">
          {/* ── Golden gradient background ── */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 30%, #fde68a 55%, #fef3c7 75%, #fffbeb 100%)',
            }} />
            {/* Radial glow centre */}
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(ellipse 70% 55% at 50% 55%, rgba(251,191,36,0.18) 0%, transparent 70%)',
            }} />
            {/* Sparkles */}
            {[
              { top: '7%',  left: '4%',   size: 16, delay: 0   },
              { top: '14%', left: '17%',  size: 10, delay: 0.6 },
              { top: '4%',  left: '39%',  size: 14, delay: 1.2 },
              { top: '9%',  left: '61%',  size: 9,  delay: 0.3 },
              { top: '6%',  left: '81%',  size: 18, delay: 0.9 },
              { top: '18%', left: '95%',  size: 12, delay: 1.5 },
              { top: '84%', left: '6%',   size: 14, delay: 0.7 },
              { top: '91%', left: '24%',  size: 10, delay: 1.1 },
              { top: '79%', left: '54%',  size: 16, delay: 0.4 },
              { top: '87%', left: '73%',  size: 10, delay: 1.8 },
              { top: '74%', left: '93%',  size: 14, delay: 1.0 },
              { top: '45%', left: '1%',   size: 11, delay: 2.0 },
              { top: '50%', left: '98%',  size: 13, delay: 1.3 },
            ].map((sp, i) => (
              <motion.span
                key={i}
                className="absolute text-amber-400 select-none"
                style={{ top: sp.top, left: sp.left, fontSize: sp.size, lineHeight: 1 }}
                animate={{ opacity: [0.25, 1, 0.25], scale: [0.7, 1.3, 0.7], rotate: [0, 180, 360] }}
                transition={{ duration: 2.8 + i * 0.35, repeat: Infinity, delay: sp.delay, ease: 'easeInOut' }}
              >✦</motion.span>
            ))}
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* ── Header ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <span className="inline-flex items-center gap-2 bg-amber-100/80 text-amber-700 text-xs font-bold tracking-[0.25em] uppercase px-5 py-2.5 rounded-full border border-amber-300/70 mb-5 backdrop-blur-sm shadow-sm">
                <span>✦</span> HOME SERVICES <span>✦</span>
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-4">
                Services for Every Need
              </h2>
              <p className="text-gray-500 max-w-md mx-auto text-sm sm:text-base">
                From daily house cleaning to long-term elder care — verified professionals for everything.
              </p>
            </motion.div>

            {/* ── Carousel ── */}
            <div className="relative">
              {/* Prev */}
              <button
                onClick={() => {
                  clearInterval(svcAutoRef.current);
                  setActiveServiceIdx(i => (i - 1 + SERVICES.length) % SERVICES.length);
                }}
                className="absolute left-0 sm:-left-5 top-1/2 -translate-y-1/2 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-xl border border-amber-200 flex items-center justify-center text-gray-700 hover:bg-amber-50 hover:border-amber-400 transition-all duration-200 hover:scale-110"
                aria-label="Previous service"
              >
                <ChevronLeft size={22} />
              </button>

              {/* Cards stage — no overflow-hidden so popup stays visible */}
              <div className="relative mx-12 sm:mx-16">
                {/* Side fades replace hard clip */}
                <div className="absolute inset-y-0 left-0 w-16 sm:w-24 pointer-events-none z-40" style={{ background: 'linear-gradient(to right, #fef3c7 0%, transparent 100%)' }} />
                <div className="absolute inset-y-0 right-0 w-16 sm:w-24 pointer-events-none z-40" style={{ background: 'linear-gradient(to left, #fef3c7 0%, transparent 100%)' }} />
                <div className="relative flex items-center justify-center" style={{ height: 450 }}>
                  {SERVICES.map((svc, idx) => {
                    const theme = SERVICE_THEME[svc];
                    let offset = idx - activeServiceIdx;
                    if (offset > SERVICES.length / 2) offset -= SERVICES.length;
                    if (offset < -SERVICES.length / 2) offset += SERVICES.length;
                    if (Math.abs(offset) > 2) return null;

                    const isCenter = offset === 0;
                    const isHovered = hoveredCard === svc;

                    const xMap    = { '-2': -420, '-1': -228, '0': 0, '1': 228, '2': 420 };
                    const scaleMap = { '-2': 0.60, '-1': 0.79, '0': 1.0, '1': 0.79, '2': 0.60 };
                    const opacMap = { '-2': 0.50, '-1': 0.75, '0': 1,   '1': 0.75, '2': 0.50 };
                    const zMap    = { '-2': 10,   '-1': 20,   '0': 40,  '1': 20,   '2': 10  };

                    const xPos   = xMap[String(offset)];
                    const scaleV = scaleMap[String(offset)];
                    const opacV  = opacMap[String(offset)];
                    const zV     = zMap[String(offset)];

                    return (
                      <motion.div
                        key={svc}
                        animate={{ x: xPos, scale: scaleV, opacity: opacV, zIndex: zV }}
                        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                        style={{ position: 'absolute', width: 245, height: 375, cursor: isCenter ? 'default' : 'pointer' }}
                        onClick={() => { if (!isCenter) { clearInterval(svcAutoRef.current); setActiveServiceIdx(idx); } }}
                        onMouseEnter={() => { if (isCenter) setHoveredCard(svc); }}
                        onMouseLeave={() => setHoveredCard(null)}
                        onTouchStart={(e) => {
                          if (!isCenter) { clearInterval(svcAutoRef.current); setActiveServiceIdx(idx); return; }
                          if (hoveredCard !== svc) {
                            e.preventDefault();
                            clearTimeout(touchTimerRef.current);
                            setHoveredCard(svc);
                            touchTimerRef.current = setTimeout(() => setHoveredCard(null), 2000);
                          }
                        }}
                      >
                        {/* Card shell */}
                        <div
                          className="w-full h-full rounded-2xl relative overflow-visible"
                          style={{
                            background: 'white',
                            borderRadius: 20,
                            border: isCenter ? `2.5px solid ${theme.bgColor}` : '2px solid rgba(255,255,255,0.55)',
                            boxShadow: isCenter
                              ? `0 0 0 4px ${theme.bgColor}55, 0 0 48px ${theme.shadowColor}, 0 24px 64px rgba(0,0,0,0.22)`
                              : '0 6px 22px rgba(0,0,0,0.10)',
                          }}
                        >
                          {/* ── Photo ── */}
                          <div className="relative overflow-hidden" style={{ height: '61%', borderRadius: '18px 18px 0 0' }}>
                            <img
                              src={SERVICE_IMAGES[svc]}
                              alt={serviceLabels[svc]}
                              className="w-full h-full object-cover transition-transform duration-700"
                              style={{ transform: isCenter ? 'scale(1.04)' : 'scale(1)' }}
                              loading="lazy"
                            />
                            {/* Bottom colour wash */}
                            <div className="absolute inset-0" style={{
                              background: `linear-gradient(to bottom, transparent 45%, ${theme.bgColor}88 100%)`,
                            }} />
                            {/* Active badge */}
                            {isCenter && (
                              <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute top-3 left-3 right-3 flex items-center justify-between"
                              >
                                <span className={`text-[10px] font-bold bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full ${theme.text} shadow-sm tracking-wider uppercase`}>
                                  {serviceLabels[svc]}
                                </span>
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-sm" />
                              </motion.div>
                            )}
                          </div>

                          {/* ── Card body ── */}
                          <div className="flex flex-col items-center gap-1.5 pt-3 pb-4 px-3" style={{ height: '39%' }}>
                            {/* Icon */}
                            <div
                              className={`w-9 h-9 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-lg shadow-md select-none`}
                              style={{ boxShadow: `0 3px 10px ${theme.shadowColor}` }}
                            >
                              {serviceIcons[svc]}
                            </div>
                            <p className="text-xs font-black text-gray-800 text-center leading-tight">{serviceLabels[svc]}</p>
                            {isCenter && (
                              <p className="text-[10px] text-gray-400 text-center leading-snug">{theme.desc}</p>
                            )}
                            {isCenter && (
                              <Link
                                to={`/workers?service=${svc}`}
                                className={`mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold ${theme.text} bg-white px-3 py-1 rounded-full shadow-md border border-white/80 hover:shadow-lg transition-all`}
                                style={{ boxShadow: `0 2px 8px ${theme.shadowColor}` }}
                              >
                                Book Now <ArrowRight size={10} />
                              </Link>
                            )}
                          </div>

                          {/* ── Popup character — floats inside the image area, above the icon ── */}
                          <AnimatePresence>
                            {isHovered && isCenter && (
                              <motion.div
                                key="popup"
                                initial={{ scale: 0.1, opacity: 0, y: 18 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.1, opacity: 0, y: 10 }}
                                transition={{ type: 'spring', stiffness: 420, damping: 16 }}
                                className="absolute left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none"
                                style={{ bottom: 'calc(39% + 12px)' }}
                              >
                                {/* Soft glow */}
                                <motion.div
                                  animate={{ scale: [1, 1.3, 1], opacity: [0.45, 0.75, 0.45] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                  className="absolute rounded-full"
                                  style={{ width: 110, height: 110, background: `radial-gradient(circle, ${theme.bgColor}, transparent 68%)`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                                />
                                {/* Bubble */}
                                <div
                                  className="relative flex items-center justify-center rounded-full shadow-2xl border-[3px] border-white"
                                  style={{ width: 76, height: 76, background: theme.bgColor, fontSize: 40 }}
                                >
                                  <motion.span
                                    animate={{ rotate: theme.charAnim, scale: [1, 1.2, 0.9, 1.1, 1] }}
                                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                                    className="select-none leading-none"
                                  >{theme.character}</motion.span>
                                  <motion.span initial={{ opacity: 0, x: 0, y: 0, scale: 0 }} animate={{ opacity: [0,1,1,0], x: -38, y: -24, scale: [0,1.3,1.1,0.7] }} transition={{ duration: 1.0, delay: 0.05, repeat: Infinity, repeatDelay: 0.9 }} className="absolute text-base select-none">{theme.particles[0]}</motion.span>
                                  <motion.span initial={{ opacity: 0, x: 0, y: 0, scale: 0 }} animate={{ opacity: [0,1,1,0], x:  35, y: -28, scale: [0,1.2,1.0,0.6] }} transition={{ duration: 1.1, delay: 0.2,  repeat: Infinity, repeatDelay: 0.8 }} className="absolute text-base select-none">{theme.particles[1]}</motion.span>
                                  <motion.span initial={{ opacity: 0, x: 0, y: 0, scale: 0 }} animate={{ opacity: [0,1,1,0], x:  40, y:  16, scale: [0,1.1,0.9,0.5] }} transition={{ duration: 1.2, delay: 0.4,  repeat: Infinity, repeatDelay: 0.7 }} className="absolute text-sm select-none">{theme.particles[2]}</motion.span>
                                  <motion.span initial={{ opacity: 0, x: 0, y: 0, scale: 0 }} animate={{ opacity: [0,1,0],   x: -32, y:  20, scale: [0,0.9,0.4]     }} transition={{ duration: 0.9, delay: 0.6,  repeat: Infinity, repeatDelay: 1.1 }} className="absolute text-xs select-none">✨</motion.span>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Next */}
              <button
                onClick={() => {
                  clearInterval(svcAutoRef.current);
                  setActiveServiceIdx(i => (i + 1) % SERVICES.length);
                }}
                className="absolute right-0 sm:-right-5 top-1/2 -translate-y-1/2 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-xl border border-amber-200 flex items-center justify-center text-gray-700 hover:bg-amber-50 hover:border-amber-400 transition-all duration-200 hover:scale-110"
                aria-label="Next service"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            {/* ── Pagination dots ── */}
            <div className="flex justify-center items-center gap-2 mt-7">
              {SERVICES.map((s, idx) => {
                const t = SERVICE_THEME[s];
                const active = idx === activeServiceIdx;
                return (
                  <button
                    key={idx}
                    onClick={() => { clearInterval(svcAutoRef.current); setActiveServiceIdx(idx); }}
                    aria-label={`Go to ${serviceLabels[s]}`}
                    className="transition-all duration-300 rounded-full"
                    style={{
                      width: active ? 24 : 10,
                      height: 10,
                      background: active ? t.shadowColor.replace('0.32', '0.85') : 'rgba(180,160,80,0.35)',
                    }}
                  />
                );
              })}
            </div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-center mt-10"
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
            <span className="inline-block bg-primary-50 text-primary-600 text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest uppercase">{t('home.howItWorks')}</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900">
              {isWorker ? 'Start earning in ' : 'Book in '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-violet-600">{t('home.howItWorksSubtitle')}</span>
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

      {/* ── Worker Demo ───────────────────────────────────────────────────────── */}
      <WorkerDemoSection />

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
            <span className="inline-block bg-white/8 text-gray-300 text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest uppercase border border-white/10">Why MaidSaathi</span>
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
                MaidSaathi on your{' '}
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
                    <p className="text-white font-black text-base text-center leading-tight">Maid<span className="text-yellow-300">Saathi</span></p>
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
              {t('home.readyToStart')}
            </h2>
            <p className="text-primary-200 text-lg mb-10 max-w-xl mx-auto">
              {t('home.readySubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isWorker ? (
                <>
                  <Link
                    to="/worker/dashboard"
                    className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-4 rounded-xl text-base transition-all shadow-lg shadow-yellow-400/30 hover:-translate-y-0.5"
                  >
                    {t('nav.dashboard')} <ArrowRight size={18} />
                  </Link>
                  <Link
                    to="/worker/bookings"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/30 px-8 py-4 rounded-xl text-base transition-all backdrop-blur-sm"
                  >
                    {t('nav.myBookings')}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/workers"
                    className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-4 rounded-xl text-base transition-all shadow-lg shadow-yellow-400/30 hover:-translate-y-0.5"
                  >
                    {t('home.findWorkers')} <ArrowRight size={18} />
                  </Link>
                  {!user && (
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/30 px-8 py-4 rounded-xl text-base transition-all backdrop-blur-sm"
                    >
                      {t('home.becomePro')}
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
