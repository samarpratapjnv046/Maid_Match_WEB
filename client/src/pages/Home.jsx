import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Shield, Clock, CheckCircle, Users, TrendingUp, MapPin, Wallet, CalendarCheck, UserCircle, LayoutDashboard, Search } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { serviceIcons, serviceLabels } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';

const SERVICES = [
  'house_cleaning', 'cooking', 'babysitting',
  'elder_care', 'laundry', 'gardening',
  'driver', 'deep_cleaning', 'security_guard',
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

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45 } };

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const cardFadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isWorker = user?.role === 'worker';
  const [searchCity, setSearchCity] = useState('');

  return (
    <div className="min-h-screen">
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 overflow-hidden pt-20 pb-28">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 40%, white 0%, transparent 55%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-white" style={{ clipPath: 'ellipse(55% 100% at 50% 100%)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <motion.div {...fadeUp} className="text-center lg:text-left">
              <span className="inline-block bg-white/15 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wider uppercase">
                India's Trusted Home Services Platform
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                Find the perfect{' '}
                <span className="text-yellow-300">home helper</span>{' '}
                near you
              </h1>
              <p className="mt-5 text-lg text-primary-100 max-w-xl mx-auto lg:mx-0">
                Verified, background-checked professionals for cleaning, cooking, babysitting, and more. Book in minutes, pay securely.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {isWorker ? (
                  <Link
                    to="/worker/dashboard"
                    className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3.5 rounded-xl text-base transition-all duration-200 shadow-lg shadow-yellow-400/30 hover:-translate-y-0.5"
                  >
                    Go to Dashboard <ArrowRight size={18} />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/workers"
                      className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3.5 rounded-xl text-base transition-all duration-200 shadow-lg shadow-yellow-400/30 hover:-translate-y-0.5"
                    >
                      Find a Worker <ArrowRight size={18} />
                    </Link>
                    {!user && (
                      <Link
                        to="/register"
                        className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/30 px-8 py-3.5 rounded-xl text-base transition-all duration-200"
                      >
                        Join as a Worker
                      </Link>
                    )}
                  </>
                )}
              </div>
              <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {['A', 'R', 'M', 'S'].map((l, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-yellow-300 border-2 border-primary-800 flex items-center justify-center text-xs font-bold text-primary-900">
                      {l}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-primary-200">
                  <span className="font-bold text-white">2,500+</span> workers ready to help
                </p>
              </div>
            </motion.div>

            {!isWorker && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="hidden lg:block"
              >
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 shadow-2xl">
                  <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-4">Available Services</p>
                  <div className="grid grid-cols-3 gap-3">
                    {SERVICES.map((svc) => (
                      <Link
                        key={svc}
                        to={`/workers?service=${svc}`}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-center group"
                      >
                        <span className="text-2xl leading-none">{serviceIcons[svc]}</span>
                        <span className="text-xs text-white/80 group-hover:text-white font-medium leading-tight">
                          {serviceLabels[svc]}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

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

      {/* ── Book a Worker ─────────────────────────────────────────────────────── */}
      {!isWorker && (
        <section className="py-16 bg-gradient-to-r from-primary-900 to-primary-700 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }} />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div {...fadeUp} viewport={{ once: true }}>
              <span className="inline-block bg-yellow-400/20 text-yellow-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 tracking-widest uppercase">
                Book Instantly
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
                Book a Verified Worker Today
              </h2>
              <p className="text-primary-200 text-base mb-8 max-w-xl mx-auto">
                Search by city or service. Browse verified profiles, compare prices, and book in minutes.
              </p>

              {/* Search bar */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto mb-8">
                <div className="relative flex-1">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && searchCity.trim()) navigate(`/workers?city=${encodeURIComponent(searchCity.trim())}`); }}
                    placeholder="Enter your city…"
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm text-gray-900 bg-white border-0 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg"
                  />
                </div>
                <button
                  onClick={() => navigate(searchCity.trim() ? `/workers?city=${encodeURIComponent(searchCity.trim())}` : '/workers')}
                  className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-7 py-3.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-yellow-400/30 hover:-translate-y-0.5 flex-shrink-0"
                >
                  <Search size={16} />
                  Search Workers
                </button>
              </div>

              {/* Popular service quick-links */}
              <div className="flex flex-wrap justify-center gap-2">
                <p className="w-full text-primary-300 text-xs font-semibold uppercase tracking-widest mb-1">Popular services</p>
                {['house_cleaning', 'cooking', 'babysitting', 'elder_care', 'driver'].map((svc) => (
                  <Link
                    key={svc}
                    to={`/workers?service=${svc}`}
                    className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3.5 py-1.5 rounded-full border border-white/20 transition-colors"
                  >
                    {serviceIcons[svc]} {serviceLabels[svc]}
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Services Grid ─────────────────────────────────────────────────────── */}
      {!isWorker && (
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              {...fadeUp}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-block bg-primary-50 text-primary-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-3 tracking-wide">What We Offer</span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">Services for every need</h2>
              <p className="mt-3 text-gray-500 max-w-xl mx-auto">
                From daily house cleaning to long-term elder care, we have verified professionals for everything.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-40px' }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              {SERVICES.map((svc) => (
                <motion.div key={svc} variants={cardFadeUp}>
                  <Link
                    to={`/workers?service=${svc}`}
                    className="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-primary-200 hover:shadow-lg hover:shadow-primary-100 hover:-translate-y-1.5 transition-all duration-200"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-50 to-primary-100 group-hover:from-primary-100 group-hover:to-primary-200 rounded-2xl flex items-center justify-center transition-all duration-200 text-3xl leading-none shadow-sm">
                      {serviceIcons[svc]}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-700 text-center leading-tight transition-colors">
                      {serviceLabels[svc]}
                    </span>
                    <span className="text-xs text-primary-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity -mt-1">
                      Browse →
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Worker Quick Actions ───────────────────────────────────────────────── */}
      {isWorker && (
        <section className="py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} viewport={{ once: true }} className="text-center mb-10">
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

      {/* ── How it Works ──────────────────────────────────────────────────────── */}
      <section className={`py-20 ${isWorker ? 'bg-gray-50' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} viewport={{ once: true }} className="text-center mb-14">
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
          <motion.div {...fadeUp} viewport={{ once: true }} className="text-center mb-12">
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
                {/* Top gradient bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} rounded-t-2xl`} />
                {/* Subtle background glow on hover */}
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
      <section className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 60%, white 0%, transparent 50%)' }} />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            {isWorker ? 'Ready to grow your income?' : 'Ready to find your perfect match?'}
          </h2>
          <p className="text-primary-200 text-lg mb-10">
            {isWorker
              ? 'Keep your profile updated, accept more bookings, and watch your wallet grow.'
              : 'Join thousands of happy customers who trust MaidMatch for their home service needs.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isWorker ? (
              <>
                <Link
                  to="/worker/dashboard"
                  className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3.5 rounded-xl text-base transition-all shadow-lg shadow-yellow-400/30 hover:-translate-y-0.5"
                >
                  Go to Dashboard <ArrowRight size={18} />
                </Link>
                <Link
                  to="/worker/bookings"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/30 px-8 py-3.5 rounded-xl text-base transition-all"
                >
                  View My Bookings
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/workers"
                  className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3.5 rounded-xl text-base transition-all shadow-lg shadow-yellow-400/30 hover:-translate-y-0.5"
                >
                  Browse Workers <ArrowRight size={18} />
                </Link>
                {!user && (
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/30 px-8 py-3.5 rounded-xl text-base transition-all"
                  >
                    Register as Worker
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
