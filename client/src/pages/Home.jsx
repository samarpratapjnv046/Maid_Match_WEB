import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Clock, CheckCircle, Users, TrendingUp, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { serviceIcons, serviceLabels } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';

const SERVICES = [
  'house_cleaning', 'cooking', 'babysitting',
  'elder_care', 'laundry', 'gardening',
  'driver', 'deep_cleaning', 'security_guard',
];

const STATS = [
  { label: 'Verified Workers', value: '2,500+', icon: Users },
  { label: 'Bookings Completed', value: '15,000+', icon: CheckCircle },
  { label: 'Cities Covered', value: '50+', icon: MapPin },
  { label: 'Avg. Rating', value: '4.8 ★', icon: Star },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Search Workers', desc: 'Browse verified professionals filtered by service, city, and price.' },
  { step: '02', title: 'Book Instantly', desc: 'Send a booking request and the worker accepts or declines in real time.' },
  { step: '03', title: 'Pay Securely', desc: 'Pay via Razorpay once accepted. Your money is protected until completion.' },
  { step: '04', title: 'Share OTP & Review', desc: 'Hand over the OTP when the worker arrives, and leave a review when done.' },
];

const fadeUp = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45 } };

const Home = () => {
  const { user } = useAuth();
  const isWorker = user?.role === 'worker';

  return (
    <div className="min-h-screen">
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 overflow-hidden pt-20 pb-28">
        {/* Background decorations */}
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
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/30 px-8 py-3.5 rounded-xl text-base transition-all duration-200"
                    >
                      Join as a Worker
                    </Link>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon size={22} className="text-primary-600" />
                </div>
                <p className="text-3xl font-extrabold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services Grid ─────────────────────────────────────────────────────── */}
      {!isWorker && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-primary-600 text-sm font-semibold uppercase tracking-widest">What We Offer</span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">Services for every need</h2>
              <p className="mt-3 text-gray-500 max-w-xl mx-auto">
                From daily house cleaning to long-term elder care, we have verified professionals for everything.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {SERVICES.map((svc) => (
                <Link
                  key={svc}
                  to={`/workers?service=${svc}`}
                  className="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-primary-300 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="w-14 h-14 bg-primary-50 group-hover:bg-primary-100 rounded-2xl flex items-center justify-center transition-colors text-3xl leading-none">
                    {serviceIcons[svc]}
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-primary-700 text-center leading-tight transition-colors">
                    {serviceLabels[svc]}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── How it Works ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-primary-600 text-sm font-semibold uppercase tracking-widest">How It Works</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">Book in 4 simple steps</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map(({ step, title, desc }, idx) => (
              <div key={step} className="relative">
                {idx < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-primary-200 to-transparent z-0" />
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-primary-600 text-white rounded-2xl flex items-center justify-center text-xl font-extrabold shadow-lg shadow-primary-200 mb-5">
                    {step}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-primary-600 text-sm font-semibold uppercase tracking-widest">Why MaidMatch</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold text-gray-900">Built for trust & reliability</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Aadhaar Verified',
                desc: 'Every worker undergoes mandatory Aadhaar card verification and background checks before being listed.',
                color: 'text-blue-600 bg-blue-50',
              },
              {
                icon: Star,
                title: 'Genuine Reviews',
                desc: 'Only customers who have completed a booking can leave a review — so you always see honest feedback.',
                color: 'text-yellow-600 bg-yellow-50',
              },
              {
                icon: Clock,
                title: 'OTP-Protected Completion',
                desc: 'Payments are secured with a one-time password. Workers get paid only after you confirm the job is done.',
                color: 'text-green-600 bg-green-50',
              },
              {
                icon: TrendingUp,
                title: 'Transparent Pricing',
                desc: 'See hourly, daily, and monthly rates upfront. No hidden fees — what you see is what you pay.',
                color: 'text-purple-600 bg-purple-50',
              },
              {
                icon: CheckCircle,
                title: 'Razorpay Secured',
                desc: 'Payments are processed by India\'s leading payment gateway, Razorpay. Your data is always safe.',
                color: 'text-green-600 bg-green-50',
              },
              {
                icon: MapPin,
                title: 'Location-Based Search',
                desc: 'Find workers near you using our geospatial search. Filter by city, service, rating, and price.',
                color: 'text-red-600 bg-red-50',
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="bg-primary-700 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to find your perfect match?
          </h2>
          <p className="text-primary-200 text-lg mb-10">
            Join thousands of happy customers who trust MaidMatch for their home service needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isWorker && (
              <Link
                to="/workers"
                className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3.5 rounded-xl text-base transition-all shadow-lg"
              >
                Browse Workers <ArrowRight size={18} />
              </Link>
            )}
            {!isWorker && (
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/30 px-8 py-3.5 rounded-xl text-base transition-all"
              >
                Register as Worker
              </Link>
            )}
            {isWorker && (
              <Link
                to="/worker/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3.5 rounded-xl text-base transition-all shadow-lg"
              >
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
