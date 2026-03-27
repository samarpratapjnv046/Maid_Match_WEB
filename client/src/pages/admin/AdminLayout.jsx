import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  CreditCard,
  Star,
  ClipboardList,
  Menu,
  X,
  LogOut,
  Shield,
  UserCircle,
  Banknote,
  RefreshCw,
  Megaphone,
} from 'lucide-react';

const NAV_LINKS = [
  { to: '/admin',              label: 'Dashboard',       icon: LayoutDashboard, end: true },
  { to: '/admin/users',        label: 'Users',           icon: Users },
  { to: '/admin/workers',      label: 'Workers',         icon: Briefcase },
  { to: '/admin/bookings',     label: 'Bookings',        icon: Calendar },
  { to: '/admin/payments',     label: 'Payments',        icon: CreditCard },
  { to: '/admin/withdrawals',     label: 'Withdrawals',  icon: Banknote },
  { to: '/admin/refund-requests', label: 'Refund Requests', icon: RefreshCw },
  { to: '/admin/offers',       label: 'Offers & Coupons', icon: Megaphone },
  { to: '/admin/reviews',      label: 'Reviews',         icon: Star },
  { to: '/admin/audit-logs',   label: 'Audit Logs',      icon: ClipboardList },
  { to: '/admin/profile',      label: 'Profile',         icon: UserCircle },
];

function NavItem({ to, label, icon: Icon, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
        ${isActive
          ? 'bg-[#C9A84C] text-[#1B2B4B] shadow-sm font-semibold'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      <Icon size={18} className="flex-shrink-0" />
      <span>{label}</span>
    </NavLink>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="h-screen overflow-hidden bg-[#FAF8F3] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar — mobile: fixed drawer, desktop: static full-height column */}
      <aside
        className={`
          fixed top-0 left-0 z-30 w-64 h-screen bg-[#1B2B4B] flex flex-col flex-shrink-0
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#C9A84C] rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-[#1B2B4B]" />
            </div>
            <div>
              <p className="text-white font-serif font-bold text-base leading-tight">MaidSaathi</p>
              <p className="text-[#C9A84C] text-xs font-medium">Admin Panel</p>
            </div>
          </div>
          <button
            className="lg:hidden text-slate-400 hover:text-white p-1"
            onClick={closeSidebar}
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_LINKS.map((link) => (
            <NavItem key={link.to} {...link} onClick={closeSidebar} />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-white/10 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-150"
          >
            <LogOut size={18} className="flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content — only this area scrolls */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden bg-[#1B2B4B] text-white px-4 py-3 flex items-center gap-3 flex-shrink-0 shadow-md">
          <button
            className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-7 h-7 bg-[#C9A84C] rounded-md flex items-center justify-center">
              <Shield size={14} className="text-[#1B2B4B]" />
            </div>
            <span className="font-serif font-bold text-base">MaidSaathi Admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </header>

        {/* Page content — scrollable */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
