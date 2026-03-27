import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1B2B4B] text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#C9A84C] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-white font-serif text-xl font-semibold">MaidSaathi</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              Connecting trusted domestic helpers with families across India. Safe, reliable, and professional home services at your fingertips.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              {[
                ['/', 'Home'],
                ['/workers', 'Find Workers'],
                ['/terms', 'Terms and Services'],
                ['/privacy', 'Privacy Policy'],
                ['/contact', 'Contact Us'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-gray-400 hover:text-[#C9A84C] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services in Bangalore — SEO internal links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Services</h4>
            <ul className="space-y-2">
              {[
                ['/part-time-maid-bangalore', 'Part-Time Maid'],
                ['/babysitter-bangalore',     'Babysitter & Nanny'],
                ['/cook-bangalore',           'Home Cook'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-gray-400 hover:text-[#C9A84C] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Areas — SEO internal links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Popular Areas</h4>
            <ul className="space-y-2">
              {[
                ['/maid-service-whitefield',  'Whitefield'],
                ['/maid-service-koramangala', 'Koramangala'],
                ['/maid-service-hsr-layout',  'HSR Layout'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-gray-400 hover:text-[#C9A84C] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Contact row */}
        <div className="mt-8 pt-6 border-t border-[#2a3f6f] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-400">
            <li className="flex items-center gap-2"><Phone size={13} /> +91 85430 02135</li>
            <li className="flex items-center gap-2"><Mail size={13} /> help@MaidSaathi.in</li>
            <li className="flex items-center gap-2"><MapPin size={13} /> Bangalore, India</li>
          </ul>
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} MaidSaathi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
