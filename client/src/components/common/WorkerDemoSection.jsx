import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Shield, Bell, Wallet, ClipboardCheck, UserCircle } from 'lucide-react';

/* ─── Step metadata ─────────────────────────────────────────────────────────── */
const STEPS = [
  {
    id: 'profile',
    icon: UserCircle,
    label: 'Create Profile',
    emoji: '👤',
    gradient: 'from-blue-500 to-indigo-600',
    lightBg: 'bg-blue-50',
    textColor: 'text-blue-600',
    ringColor: 'ring-blue-200',
    title: 'Build Your Profile',
    desc: 'Add your name, photo, services, and pricing. Set your city and availability so customers nearby can discover you.',
  },
  {
    id: 'verified',
    icon: Shield,
    label: 'Get Verified',
    emoji: '✅',
    gradient: 'from-emerald-500 to-teal-600',
    lightBg: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    ringColor: 'ring-emerald-200',
    title: 'Aadhaar Verified Badge',
    desc: 'Upload your Aadhaar document. Once admin approves, your profile earns a trusted Verified badge — boosting your visibility.',
  },
  {
    id: 'request',
    icon: Bell,
    label: 'Receive Request',
    emoji: '📩',
    gradient: 'from-violet-500 to-purple-600',
    lightBg: 'bg-violet-50',
    textColor: 'text-violet-600',
    ringColor: 'ring-violet-200',
    title: 'New Booking Arrives',
    desc: 'Customers near you send booking requests. You see the service, date, time, address, and price — before deciding.',
  },
  {
    id: 'accept',
    icon: ClipboardCheck,
    label: 'Accept the Job',
    emoji: '🤝',
    gradient: 'from-amber-400 to-orange-500',
    lightBg: 'bg-amber-50',
    textColor: 'text-amber-600',
    ringColor: 'ring-amber-200',
    title: 'You Stay in Control',
    desc: "Review the booking and tap Accept or Decline. You're never pressured — only take jobs that fit your schedule.",
  },
  {
    id: 'otp',
    icon: ClipboardCheck,
    label: 'Complete with OTP',
    emoji: '🛠️',
    gradient: 'from-pink-500 to-rose-600',
    lightBg: 'bg-pink-50',
    textColor: 'text-pink-600',
    ringColor: 'ring-pink-200',
    title: 'Verify Completion',
    desc: "Ask the customer for their 4-digit OTP when you finish. Enter it on the app to mark the booking complete.",
  },
  {
    id: 'paid',
    icon: Wallet,
    label: 'Instant Payment',
    emoji: '💸',
    gradient: 'from-emerald-500 to-green-600',
    lightBg: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    ringColor: 'ring-emerald-200',
    title: 'Money in Your Wallet',
    desc: 'Earnings land in your MaidSaathi wallet the instant the OTP is verified. Withdraw to your bank account anytime.',
  },
];

/* ─── Phone screen components ───────────────────────────────────────────────── */

const ProfileScreen = () => (
  <div className="flex flex-col gap-2.5 px-1 pb-1">
    {/* Avatar + name row */}
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex items-center gap-2.5"
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
        P
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-xs leading-tight">Priya Sharma</p>
        <p className="text-gray-400 text-[10px]">📍 Koramangala, Bangalore</p>
      </div>
      <div className="px-1.5 py-0.5 bg-blue-100 rounded-md">
        <span className="text-blue-600 text-[9px] font-bold">ACTIVE</span>
      </div>
    </motion.div>

    {/* Services label */}
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="text-[9px] font-bold text-gray-500 uppercase tracking-wider"
    >
      Services Offered
    </motion.p>

    {/* Service badges */}
    <motion.div className="flex flex-wrap gap-1">
      {[
        { emoji: '🧹', label: 'House Cleaning', color: 'bg-blue-100 text-blue-700' },
        { emoji: '🍳', label: 'Cooking', color: 'bg-orange-100 text-orange-700' },
        { emoji: '👕', label: 'Laundry', color: 'bg-teal-100 text-teal-700' },
      ].map(({ emoji, label, color }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 + i * 0.1, type: 'spring', stiffness: 260, damping: 18 }}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold ${color}`}
        >
          {emoji} {label}
        </motion.div>
      ))}
    </motion.div>

    {/* Pricing */}
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="grid grid-cols-2 gap-1.5"
    >
      {[
        { label: 'Hourly', value: '₹150/hr', color: 'bg-indigo-50 border-indigo-100 text-indigo-700' },
        { label: 'Daily', value: '₹700/day', color: 'bg-purple-50 border-purple-100 text-purple-700' },
      ].map(({ label, value, color }) => (
        <div key={label} className={`border rounded-lg px-2 py-1.5 text-center ${color}`}>
          <p className="text-[8px] opacity-70 font-medium">{label}</p>
          <p className="text-[11px] font-black">{value}</p>
        </div>
      ))}
    </motion.div>

    {/* Save button */}
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg py-2 text-center"
    >
      <span className="text-white text-[10px] font-bold">Save Profile</span>
    </motion.div>
  </div>
);

const VerifiedScreen = () => (
  <div className="flex flex-col items-center gap-2.5 px-1 pb-1">
    {/* Avatar with badge */}
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1, type: 'spring', stiffness: 220, damping: 16 }}
      className="relative mt-1"
    >
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-black text-2xl shadow-lg">
        P
      </div>
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 320, damping: 16 }}
        className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-md border-2 border-white"
      >
        <span className="text-white text-[10px] font-black">✓</span>
      </motion.div>
    </motion.div>

    {/* Name */}
    <motion.p
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="font-black text-gray-900 text-sm"
    >
      Priya Sharma
    </motion.p>

    {/* Verified badge */}
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5, type: 'spring' }}
      className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full"
    >
      <Shield size={11} className="text-emerald-600" />
      <span className="text-emerald-700 text-[10px] font-bold">Aadhaar Verified</span>
    </motion.div>

    {/* Stars */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.65 }}
      className="flex gap-0.5"
    >
      {[...Array(5)].map((_, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.65 + i * 0.07 }}
          className="text-amber-400 text-sm"
        >
          ★
        </motion.span>
      ))}
      <span className="text-gray-500 text-[10px] ml-1 self-center">4.8</span>
    </motion.div>

    {/* Trust message */}
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
      className="w-full bg-emerald-50 border border-emerald-100 rounded-xl p-2.5 text-center"
    >
      <p className="text-emerald-700 text-[9px] font-semibold leading-tight">
        🎉 Your profile is now trusted by customers! You appear higher in search results.
      </p>
    </motion.div>

    {/* Stats row */}
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
      className="grid grid-cols-3 gap-1 w-full"
    >
      {[
        { label: 'Bookings', value: '24' },
        { label: 'Rating', value: '4.8' },
        { label: 'Earned', value: '₹18k' },
      ].map(({ label, value }) => (
        <div key={label} className="bg-gray-50 rounded-lg p-1.5 text-center border border-gray-100">
          <p className="text-[11px] font-black text-gray-900">{value}</p>
          <p className="text-[8px] text-gray-400">{label}</p>
        </div>
      ))}
    </motion.div>
  </div>
);

const RequestScreen = () => (
  <div className="flex flex-col gap-2 px-1 pb-1">
    {/* Header */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="flex items-center justify-between"
    >
      <p className="text-xs font-black text-gray-900">Bookings</p>
      <div className="relative">
        <Bell size={14} className="text-gray-600" />
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
          className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"
        />
      </div>
    </motion.div>

    {/* New request notification */}
    <motion.div
      initial={{ opacity: 0, x: 30, y: -5 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 240, damping: 20 }}
      className="bg-violet-50 border border-violet-200 rounded-xl p-2.5"
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
        <span className="text-violet-600 text-[9px] font-bold uppercase tracking-wider">New Request</span>
      </div>
      <div className="flex items-start gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">
          R
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-gray-900">Rahul Mehta</p>
          <p className="text-[9px] text-gray-500">📍 Koramangala, Bangalore</p>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1">
        {[
          { label: 'Service', value: '🧹 House Cleaning' },
          { label: 'Date', value: 'Tomorrow 9 AM' },
          { label: 'Duration', value: '4 Hours' },
          { label: 'You Earn', value: '₹510' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-lg px-1.5 py-1 border border-gray-100">
            <p className="text-[8px] text-gray-400">{label}</p>
            <p className="text-[9px] font-bold text-gray-800">{value}</p>
          </div>
        ))}
      </div>
    </motion.div>

    {/* Older request grayed */}
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 0.45, y: 0 }}
      transition={{ delay: 0.6 }}
      className="bg-gray-50 border border-gray-100 rounded-xl p-2 flex items-center gap-2"
    >
      <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-[9px] font-semibold text-gray-600">Anita K. — Cooking</p>
        <p className="text-[8px] text-gray-400">Yesterday · ₹280</p>
      </div>
      <span className="text-[8px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">Done</span>
    </motion.div>
  </div>
);

const AcceptScreen = ({ substep }) => (
  <div className="flex flex-col gap-2.5 px-1 pb-1">
    {/* Booking card */}
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white border border-gray-100 rounded-xl p-2.5 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[11px] font-black">
          R
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-900">Rahul Mehta</p>
          <p className="text-[8px] text-gray-400">🧹 House Cleaning · 4 hrs</p>
        </div>
        <div className="ml-auto bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
          <span className="text-amber-600 text-[8px] font-bold">Pending</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1 mb-2">
        <div className="bg-gray-50 rounded-lg p-1.5 border border-gray-100">
          <p className="text-[8px] text-gray-400">Date & Time</p>
          <p className="text-[9px] font-bold text-gray-800">Tomorrow 9 AM</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-1.5 border border-gray-100">
          <p className="text-[8px] text-gray-400">Your Earning</p>
          <p className="text-[9px] font-bold text-emerald-600">₹510</p>
        </div>
      </div>

      {/* Buttons or confirmation */}
      <AnimatePresence mode="wait">
        {substep === 0 ? (
          <motion.div
            key="buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex gap-1.5"
          >
            <div className="flex-1 py-1.5 rounded-lg border border-gray-200 text-center cursor-pointer hover:bg-gray-50">
              <span className="text-[9px] font-bold text-gray-500">Decline</span>
            </div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex-1 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-center cursor-pointer"
            >
              <span className="text-[9px] font-bold text-white">Accept ✓</span>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="confirmed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
            className="flex items-center justify-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-lg py-2"
          >
            <CheckCircle size={12} className="text-emerald-600" />
            <span className="text-emerald-700 text-[10px] font-bold">Booking Confirmed!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>

    {/* Instruction */}
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-blue-50 border border-blue-100 rounded-xl p-2.5"
    >
      <p className="text-blue-700 text-[9px] font-semibold leading-snug">
        📅 Customer will be notified. Arrive at <strong>Koramangala, Bangalore</strong> by 9:00 AM tomorrow.
      </p>
    </motion.div>
  </div>
);

const OTPScreen = ({ otpProgress }) => {
  const digits = ['4', '2', '8', '1'];
  return (
    <div className="flex flex-col items-center gap-3 px-1 pb-1">
      {/* Icon */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring' }}
        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg mt-1"
      >
        <span className="text-xl">🛠️</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <p className="text-xs font-black text-gray-900">Job Complete!</p>
        <p className="text-[9px] text-gray-500 mt-0.5">Enter customer OTP to confirm</p>
      </motion.div>

      {/* OTP boxes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex gap-2"
      >
        {digits.map((d, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{
              scale: i < otpProgress ? 1 : 0.6,
              opacity: i < otpProgress ? 1 : 0.3,
            }}
            transition={{ delay: 0.35 + i * 0.12, type: 'spring', stiffness: 280, damping: 18 }}
            className={`w-9 h-10 rounded-xl border-2 flex items-center justify-center text-sm font-black ${
              i < otpProgress
                ? 'border-pink-400 bg-pink-50 text-pink-700'
                : 'border-gray-200 bg-gray-50 text-gray-300'
            }`}
          >
            {i < otpProgress ? d : '·'}
          </motion.div>
        ))}
      </motion.div>

      {/* Verify button */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: otpProgress === 4 ? 1 : 0.4, y: 0 }}
        transition={{ delay: 0.6 }}
        className={`w-full rounded-xl py-2 text-center ${
          otpProgress === 4
            ? 'bg-gradient-to-r from-pink-500 to-rose-600'
            : 'bg-gray-200'
        }`}
      >
        <span className={`text-[10px] font-bold ${otpProgress === 4 ? 'text-white' : 'text-gray-400'}`}>
          Verify & Complete ✓
        </span>
      </motion.div>

      {/* Status */}
      {otpProgress === 4 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full"
        >
          <CheckCircle size={10} className="text-emerald-600" />
          <span className="text-emerald-700 text-[9px] font-bold">OTP Verified!</span>
        </motion.div>
      )}
    </div>
  );
};

const PaidScreen = ({ balanceProgress }) => {
  const target = 4760;
  const animatedBalance = Math.round(4250 + balanceProgress * 510);

  return (
    <div className="flex flex-col gap-2.5 px-1 pb-1">
      {/* Wallet header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between"
      >
        <p className="text-xs font-black text-gray-900">My Wallet</p>
        <Wallet size={13} className="text-emerald-600" />
      </motion.div>

      {/* Balance card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-3 text-white"
      >
        <p className="text-[9px] opacity-80 mb-0.5">Available Balance</p>
        <motion.p
          className="text-2xl font-black leading-none"
          key={animatedBalance}
        >
          ₹{animatedBalance.toLocaleString('en-IN')}
        </motion.p>
        <div className="flex items-center gap-1 mt-1.5">
          <div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
          <span className="text-[8px] opacity-70">MaidSaathi Wallet</span>
        </div>
      </motion.div>

      {/* Recent transaction */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
        className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <span className="text-sm">💰</span>
          </div>
          <div className="flex-1">
            <p className="text-[9px] font-bold text-gray-900">House Cleaning Earning</p>
            <p className="text-[8px] text-gray-400">Just now · Commission deducted</p>
          </div>
          <motion.span
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55, type: 'spring' }}
            className="text-emerald-600 text-[11px] font-black"
          >
            +₹510
          </motion.span>
        </div>
      </motion.div>

      {/* Withdraw button */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl py-2 text-center"
      >
        <span className="text-white text-[10px] font-bold">Withdraw to Bank →</span>
      </motion.div>
    </div>
  );
};

/* ─── Phone wrapper ──────────────────────────────────────────────────────────── */
const PhoneMockup = ({ stepId, substep, otpProgress, balanceProgress }) => {
  const screenMap = {
    profile: <ProfileScreen />,
    verified: <VerifiedScreen />,
    request: <RequestScreen />,
    accept: <AcceptScreen substep={substep} />,
    otp: <OTPScreen otpProgress={otpProgress} />,
    paid: <PaidScreen balanceProgress={balanceProgress} />,
  };

  return (
    <div
      className="relative mx-auto"
      style={{ width: 200, height: 400 }}
    >
      {/* Phone shell */}
      <div
        className="absolute inset-0 rounded-[32px] shadow-2xl"
        style={{
          background: 'linear-gradient(145deg, #1e1e2e 0%, #12121a 100%)',
          border: '6px solid #2a2a3e',
          boxShadow: '0 30px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      />

      {/* Screen area */}
      <div
        className="absolute overflow-hidden bg-white"
        style={{
          top: 14, left: 7, right: 7, bottom: 12,
          borderRadius: 24,
        }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-white border-b border-gray-100">
          <span className="text-[8px] font-bold text-gray-700">9:41</span>
          <div className="w-12 h-2.5 bg-gray-900 rounded-full" />
          <div className="flex items-center gap-1">
            <span className="text-[7px] text-gray-500">▌▌▌</span>
            <span className="text-[8px] text-gray-500">🔋</span>
          </div>
        </div>

        {/* App header bar */}
        <div className="px-3 py-2 bg-gradient-to-r from-gray-900 to-gray-800 flex items-center gap-2">
          <span className="text-yellow-400 text-[9px] font-black tracking-tight">MaidSaathi</span>
          <div className="ml-auto w-1.5 h-1.5 bg-emerald-400 rounded-full" />
        </div>

        {/* Screen content */}
        <div className="px-3 pt-2.5 overflow-hidden" style={{ height: 'calc(100% - 60px)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={stepId}
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {screenMap[stepId]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Section ───────────────────────────────────────────────────────────── */
const WorkerDemoSection = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [substep, setSubstep] = useState(0);
  const [otpProgress, setOtpProgress] = useState(0);
  const [balanceProgress, setBalanceProgress] = useState(0);
  const timerRef = useRef(null);
  const subtimerRef = useRef(null);

  const step = STEPS[activeStep];

  /* OTP animation when on step 4 */
  useEffect(() => {
    if (STEPS[activeStep].id === 'otp') {
      setOtpProgress(0);
      let count = 0;
      const t = setInterval(() => {
        count += 1;
        setOtpProgress(count);
        if (count >= 4) clearInterval(t);
      }, 350);
      return () => clearInterval(t);
    }
  }, [activeStep]);

  /* Balance animation when on step 5 */
  useEffect(() => {
    if (STEPS[activeStep].id === 'paid') {
      setBalanceProgress(0);
      let p = 0;
      const t = setInterval(() => {
        p = Math.min(p + 0.08, 1);
        setBalanceProgress(p);
        if (p >= 1) clearInterval(t);
      }, 40);
      return () => clearInterval(t);
    }
  }, [activeStep]);

  /* Accept substep animation */
  useEffect(() => {
    if (STEPS[activeStep].id === 'accept') {
      setSubstep(0);
      const t = setTimeout(() => setSubstep(1), 1800);
      return () => clearTimeout(t);
    }
  }, [activeStep]);

  /* Auto-advance steps */
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveStep((s) => (s + 1) % STEPS.length);
    }, 4500);
    return () => clearInterval(timerRef.current);
  }, []);

  const goTo = (idx) => {
    clearInterval(timerRef.current);
    setActiveStep(idx);
    timerRef.current = setInterval(() => {
      setActiveStep((s) => (s + 1) % STEPS.length);
    }, 4500);
  };

  return (
    <section className="py-24 relative overflow-hidden bg-gray-950">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-600/8 rounded-full blur-3xl" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, #818cf8 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="text-center mb-16"
        >
          <span className="inline-block bg-white/8 text-gray-300 text-xs font-bold px-4 py-1.5 rounded-full mb-4 tracking-widest uppercase border border-white/10">
            Worker Journey
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            See how it works{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
              step by step
            </span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-xl mx-auto text-base">
            From signup to getting paid — watch the complete worker experience in action.
          </p>
        </motion.div>

        {/* Main layout: steps list + phone */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left — step list */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex-1 w-full max-w-lg"
          >
            <div className="flex flex-col gap-3">
              {STEPS.map((s, idx) => {
                const isActive = idx === activeStep;
                const Icon = s.icon;
                return (
                  <motion.button
                    key={s.id}
                    onClick={() => goTo(idx)}
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`w-full text-left flex items-center gap-4 rounded-2xl px-4 py-3.5 border transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-white/10 border-white/20 shadow-lg'
                        : 'bg-white/4 border-white/8 hover:bg-white/7 hover:border-white/14'
                    }`}
                  >
                    {/* Step number / icon */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        isActive
                          ? `bg-gradient-to-br ${s.gradient} shadow-lg`
                          : 'bg-white/8'
                      }`}
                    >
                      {isActive ? (
                        <span className="text-lg leading-none">{s.emoji}</span>
                      ) : (
                        <span className="text-gray-500 text-sm font-bold">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                        {s.label}
                      </p>
                      <AnimatePresence>
                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className="text-gray-400 text-xs mt-0.5 leading-relaxed overflow-hidden"
                          >
                            {s.desc}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className={`w-1.5 h-6 rounded-full bg-gradient-to-b ${s.gradient} flex-shrink-0`}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Right — Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-shrink-0 flex flex-col items-center gap-6"
          >
            {/* Step label above phone */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r ${step.gradient} shadow-lg`}
              >
                <span className="text-sm leading-none">{step.emoji}</span>
                <span className="text-white text-xs font-bold">{step.label}</span>
              </motion.div>
            </AnimatePresence>

            {/* Phone */}
            <PhoneMockup
              stepId={step.id}
              substep={substep}
              otpProgress={otpProgress}
              balanceProgress={balanceProgress}
            />

            {/* Progress dots */}
            <div className="flex gap-2">
              {STEPS.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => goTo(idx)}
                  className={`transition-all duration-300 rounded-full ${
                    idx === activeStep
                      ? `w-6 h-2 bg-gradient-to-r ${step.gradient}`
                      : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>

            {/* Auto-play indicator */}
            <p className="text-gray-600 text-[10px] text-center">
              Auto-playing · click any step to jump
            </p>
          </motion.div>

        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 mb-5 text-base">
            Ready to start earning on your own schedule?
          </p>
          <a
            href="/register"
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-yellow-400/20 hover:-translate-y-0.5"
          >
            Join as a Worker →
          </a>
        </motion.div>

      </div>
    </section>
  );
};

export default WorkerDemoSection;
