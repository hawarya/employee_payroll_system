import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, UserPlus, LogOut, Receipt, Clock, CalendarDays, BarChart3, Menu, X } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Layout() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN');

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Attendance', href: '/attendance', icon: Clock },
    { name: 'Leave', href: '/leaves', icon: CalendarDays },
  ];

  if (isAdmin) {
    navigation.push({ name: 'Employees', href: '/employees', icon: Users });
    navigation.push({ name: 'Add Employee', href: '/employees/new', icon: UserPlus });
    navigation.push({ name: 'Reports', href: '/reports', icon: BarChart3 });
  } else {
    navigation.push({ name: 'My Payslip', href: '/profile', icon: Receipt });
  }

  const isActive = (href) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-brand-900 border-r border-brand-800 shadow-xl">
      <div className="p-6 flex items-center gap-3 border-b border-brand-800">
        <Receipt className="text-brand-300 w-8 h-8" />
        <h1 className="text-xl font-bold text-white tracking-wide">Pay<span className="text-brand-300">Roll</span></h1>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                active
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'text-brand-100 hover:bg-brand-800 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-brand-300'}`} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-brand-800">
        <div className="px-4 py-3 bg-brand-950/50 rounded-xl mb-3 border border-brand-800/50">
          <p className="text-xs text-brand-300 font-medium">Logged in as</p>
          <p className="font-semibold text-white capitalize truncate">{currentUser?.username}</p>
          <p className="text-xs text-brand-400 mt-0.5">{isAdmin ? 'Administrator' : 'Employee'}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-brand-200 hover:text-white hover:bg-red-500/20 rounded-xl transition-colors ring-1 ring-inset ring-brand-800 hover:ring-red-500/30"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-shrink-0 flex-col">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="w-64 flex flex-col">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center px-4 md:px-8 gap-4 shadow-sm flex-shrink-0 z-10">
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
          </button>

          <h2 className="text-lg font-semibold text-slate-800 flex-1">
            {navigation.find(n => isActive(n.href))?.name || 'Payroll System'}
          </h2>

          <NotificationBell />
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
