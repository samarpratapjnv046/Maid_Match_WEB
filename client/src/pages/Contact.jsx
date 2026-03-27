import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import SEO from '../components/common/SEO';
import { homeFaqSchema } from '../utils/schema';
import {
  Mail, Phone, MapPin, Clock, Send, MessageSquare,
  CheckCircle, ArrowLeft, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// ─── FAQ data ─────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'How do I book a maid through MaidSaathi?',
    a: 'Simply browse available workers in your area, view their profiles and reviews, then tap "Book Now". Choose your preferred date and time and confirm the booking.',
  },
  {
    q: 'Is my payment secure?',
    a: 'Yes. All payments are processed through Razorpay with 256-bit SSL encryption. We never store your card details on our servers.',
  },
  {
    q: 'What happens if a worker cancels at the last minute?',
    a: 'We immediately notify you and help you find an available replacement. If you paid in advance, a full refund is issued within 2–3 business days.',
  },
  {
    q: 'How are workers verified?',
    a: 'Every worker goes through identity verification (Aadhaar), background checks, and a skills assessment before appearing on the platform.',
  },
  {
    q: 'Can I reschedule or cancel a booking?',
    a: 'Yes. You can reschedule or cancel up to 2 hours before the booking start time without any charges. Cancellations within 2 hours may incur a nominal fee.',
  },
];

// ─── Contact channels ─────────────────────────────────────────────────────────
const CHANNELS = [
  {
    icon: Phone,
    label: 'Call Us',
    value: '+91 85430 02135',
    sub: 'Mon – Sat · 9 AM – 7 PM IST',
    href: 'tel:+918543002135',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Mail,
    label: 'Email Us',
    value: 'help@MaidSaathi.in',
    sub: 'We reply within 24 hours',
    href: 'mailto:help@MaidSaathi.in',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: MapPin,
    label: 'Our Office',
    value: 'India',
    sub: 'Serving pan-India',
    href: null,
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Clock,
    label: 'Support Hours',
    value: 'Mon – Sat',
    sub: '9:00 AM – 7:00 PM IST',
    href: null,
    color: 'bg-purple-50 text-purple-600',
  },
];

// ─── Reusable FAQ accordion item ─────────────────────────────────────────────
function FaqItem({ faq, index }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      className="border border-gray-200 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex justify-between items-center px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-800 text-sm">{faq.q}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-primary-600 shrink-0 ml-3" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-3" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-4 pt-1 text-sm text-gray-600 leading-relaxed bg-white">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.message.trim()) e.message = 'Message is required';
    else if (form.message.trim().length < 20) e.message = 'Message must be at least 20 characters';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      await api.post('/contact', form);
      setSent(true);
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Contact MaidSaathi – Maid Booking Support Bangalore"
        description="Get in touch with MaidSaathi for maid booking help, worker registration, or general queries. Call, email, or use the contact form. Available 7 days a week."
        canonical="https://www.maidsaathi.in/contact"
        schema={homeFaqSchema}
      />

      {/* ── Hero header ───────────────────────────────────────────────────── */}
      <div className="relative bg-[#0A1628] text-white overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary-800/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-16 w-56 h-56 rounded-full bg-[#C9A84C]/20 blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="p-2 rounded-xl bg-[#C9A84C]/20 text-[#C9A84C]">
                <MessageSquare className="w-6 h-6" />
              </span>
              <span className="text-[#C9A84C] font-semibold tracking-wide text-sm uppercase">
                Get in Touch
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              We'd love to <span className="text-[#C9A84C]">hear from you</span>
            </h1>
            <p className="mt-4 text-gray-300 max-w-xl text-base leading-relaxed">
              Have a question, suggestion, or need help? Our support team is here to assist you.
              Reach out and we'll get back to you as quickly as possible.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-14">

        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-[#C9A84C] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {/* ── Contact channels ──────────────────────────────────────────────── */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CHANNELS.map((ch, i) => (
              <motion.div
                key={ch.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                {ch.href ? (
                  <a
                    href={ch.href}
                    className="flex flex-col gap-3 p-5 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
                  >
                    <ChannelCardInner ch={ch} />
                  </a>
                ) : (
                  <div className="flex flex-col gap-3 p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <ChannelCardInner ch={ch} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Contact form + map placeholder ───────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-8"
          >
            <h2 className="text-2xl font-bold text-[#0A1628] mb-1">Send us a message</h2>
            <p className="text-sm text-gray-500 mb-7">
              Fill in the form below and we'll respond within 24 hours.
            </p>

            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-center py-12 gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Message Sent!</h3>
                  <p className="text-sm text-gray-500 max-w-xs">
                    Thanks for reaching out. Our team will get back to you at{' '}
                    <span className="font-medium text-gray-700">{form.email || 'your email'}</span>{' '}
                    within 24 hours.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="mt-2 text-sm text-[#C9A84C] hover:underline"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  noValidate
                >
                  {/* Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField
                      label="Full Name"
                      name="name"
                      type="text"
                      placeholder="Jane Doe"
                      value={form.name}
                      error={errors.name}
                      onChange={handleChange}
                    />
                    <FormField
                      label="Email Address"
                      name="email"
                      type="email"
                      placeholder="jane@example.com"
                      value={form.email}
                      error={errors.email}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Subject */}
                  <FormField
                    label="Subject"
                    name="subject"
                    type="text"
                    placeholder="How can we help you?"
                    value={form.subject}
                    error={errors.subject}
                    onChange={handleChange}
                  />

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      name="message"
                      rows={5}
                      placeholder="Describe your issue or question in detail..."
                      value={form.message}
                      onChange={handleChange}
                      className={`input-field resize-none ${errors.message ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-red-500">{errors.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400 text-right">
                      {form.message.length} / 1000
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-[#0A1628] hover:bg-[#1B2B4B] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Send Message
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Side info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            {/* Why contact us card */}
            <div className="bg-[#0A1628] text-white rounded-2xl p-7 flex flex-col gap-4">
              <h3 className="text-lg font-bold">Why contact us?</h3>
              {[
                { icon: '🔍', text: 'Find the right domestic worker for your home' },
                { icon: '🔒', text: 'Report safety or security concerns' },
                { icon: '💳', text: 'Get help with payments or refunds' },
                { icon: '⭐', text: 'Share feedback to help us improve' },
                { icon: '🤝', text: 'Become a verified service partner' },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="text-base shrink-0 mt-0.5">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Response time badge */}
            <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="font-semibold text-[#0A1628] text-sm">Typical Response Time</span>
              </div>
              <p className="text-3xl font-extrabold text-[#0A1628]">&lt; 24 hrs</p>
              <p className="text-xs text-gray-500 mt-1">
                For urgent issues, call us directly at{' '}
                <a href="tel:+918543002135" className="text-[#C9A84C] hover:underline font-medium">
                  +91 85430 02135
                </a>
              </p>
            </div>
          </motion.div>
        </section>

        {/* ── FAQ section ───────────────────────────────────────────────────── */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0A1628]">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-gray-500 text-sm max-w-lg mx-auto">
              Can't find the answer you're looking for? Reach out to our support team.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq, i) => (
              <FaqItem key={faq.q} faq={faq} index={i} />
            ))}
          </div>
        </section>

        {/* ── CTA strip ─────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden bg-[#0A1628] text-white px-8 py-12 text-center"
        >
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_#C9A84C,_transparent)]" />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Still have questions?
            </h2>
            <p className="text-gray-300 text-sm mb-6 max-w-md mx-auto">
              Browse our Help Center or start a live chat with a support agent — we're always happy to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 bg-[#C9A84C] hover:bg-[#b8923d] text-[#0A1628] font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
              >
                Back to Home
              </Link>
              <a
                href="mailto:help@MaidSaathi.in"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
              >
                <Mail className="w-4 h-4" /> Email Support
              </a>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}

// ─── Helper sub-components ────────────────────────────────────────────────────
function ChannelCardInner({ ch }) {
  return (
    <>
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${ch.color}`}>
        <ch.icon className="w-5 h-5" />
      </span>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{ch.label}</p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5">{ch.value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{ch.sub}</p>
      </div>
    </>
  );
}

function FormField({ label, name, type, placeholder, value, error, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`input-field ${error ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
