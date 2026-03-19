import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User as UserIcon, LogOut, LayoutDashboard, Search, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

const getDashboardPath = (role) => {
  if (role === 'worker') return '/worker/dashboard';
  if (role === 'admin') return '/admin';
  return '/dashboard';
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const dashboardPath = getDashboardPath(user?.role);
  const photo = user?.profilePhoto?.url;
  const initials = user?.name?.[0]?.toUpperCase() || '?';

  const navLinks = user?.role === 'admin'
    ? []
    : [
        { to: '/', label: 'Home' },
        ...(user?.role !== 'worker' ? [{ to: '/workers', label: 'Find a Maid' }] : []),
      ];

  const userMenuLinks = user?.role === 'customer'
    ? [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/bookings', label: 'My Bookings' },
        { to: '/profile', label: 'Profile' },
      ]
    : user?.role === 'worker'
    ? [
        { to: '/worker/dashboard', label: 'Dashboard' },
        { to: '/worker/bookings', label: 'My Bookings' },
        { to: '/worker/wallet', label: 'My Wallet' },
        { to: '/worker/profile', label: 'Worker Profile' },
        { to: '/profile', label: 'Account Settings' },
      ]
    : user?.role === 'admin'
    ? [
        { to: '/admin', label: 'Admin Panel' },
      ]
    : [];

  return (
    <nav className="fixed w-full z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl font-bold text-primary-600 tracking-tight">
              Maid<span className="text-gray-900">Match</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === to
                    ? 'text-primary-600'
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                {label}
              </Link>
            ))}

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-full pl-1 pr-3 py-1 hover:border-primary-300 transition-colors shadow-sm"
                >
                  <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 overflow-hidden flex-shrink-0">
                    {photo ? (
                      <img src={photo} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold">{initials}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-800 max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden py-1 z-50">
                    <div className="px-4 py-2.5 border-b border-gray-50">
                      <p className="text-xs font-semibold text-gray-800 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium capitalize">
                        {user.role}
                      </span>
                    </div>
                    {userMenuLinks.map(({ to, label }) => (
                      <Link
                        key={to}
                        to={to}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                      >
                        <LayoutDashboard size={14} className="text-gray-400" />
                        {label}
                      </Link>
                    ))}
                    <div className="border-t border-gray-50 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={14} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 hover:text-primary-600 transition-colors p-1"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 pt-3 pb-4 space-y-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              >
                <Search size={15} className="text-gray-400" />
                {label}
              </Link>
            ))}

            {user ? (
              <>
                <div className="border-t border-gray-100 pt-3 mt-2">
                  <div className="flex items-center gap-3 px-3 py-2 mb-2">
                    <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                      {photo ? (
                        <img src={photo} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-primary-700 font-bold text-sm">{initials}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                    </div>
                  </div>
                  {userMenuLinks.map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                    >
                      <LayoutDashboard size={15} className="text-gray-400" />
                      {label}
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 mt-1"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t border-gray-100 pt-3 mt-2 space-y-2">
                <Link to="/login" className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Sign in
                </Link>
                <Link to="/register" className="block px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 text-center">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
