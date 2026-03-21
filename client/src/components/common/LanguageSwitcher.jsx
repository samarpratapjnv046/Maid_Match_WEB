import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'EN', fullLabel: 'English' },
  { code: 'hi', label: 'Hindi',   nativeLabel: 'हि',  fullLabel: 'हिन्दी' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕ',   fullLabel: 'ಕನ್ನಡ' },
];

// variant: 'navbar' (for glass/light bg) | 'dark' (for dark bg like login left panel)
export default function LanguageSwitcher({ className = '', variant = 'navbar' }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Normalize language code (en-US → en)
  const langCode = i18n.language?.split('-')[0] || 'en';
  const current = LANGUAGES.find((l) => l.code === langCode) || LANGUAGES[0];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  const btnClass = variant === 'dark'
    ? 'flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all'
    : 'flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary-200 bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-bold transition-all shadow-sm';

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={btnClass}
        title="Change language"
      >
        <Globe size={13} />
        <span>{current.nativeLabel}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden py-1 z-[100]">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                lang.code === langCode
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{lang.fullLabel}</span>
              {lang.code === langCode && <Check size={13} className="text-primary-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
