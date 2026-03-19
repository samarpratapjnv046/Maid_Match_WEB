import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Footer() {
  const { user } = useAuth();
  const isWorker = user?.role === 'worker';

  return (
    <footer className="bg-[#1B2B4B] text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#C9A84C] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-white font-serif text-xl font-semibold">MaidMatch</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
              Connecting trusted domestic helpers with families across India. Safe, reliable, and professional home services at your fingertips.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              {[['/', 'Home'], ...(!isWorker ? [['/workers', 'Find Workers'], ['/register', 'Become a Worker']] : [])].map(([to, label]) => (
                <li key={to}><Link to={to} className="text-sm text-gray-400 hover:text-[#C9A84C] transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2"><Phone size={13} /> +91 98765 43210</li>
              <li className="flex items-center gap-2"><Mail size={13} /> help@maidmatch.in</li>
              <li className="flex items-center gap-2"><MapPin size={13} /> India</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-[#2a3f6f] text-center text-xs text-gray-500">
          © {new Date().getFullYear()} MaidMatch. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
