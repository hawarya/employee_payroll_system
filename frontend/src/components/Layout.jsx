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
    <div className="flex flex-col h-full bg-white border-r border-slate-200 shadow-sm">
      <div className="p-6 flex items-center justify-center border-b border-slate-100">
        <h1 className="text-2xl font-black text-brand-600 tracking-tighter">Pay<span className="text-slate-800">Matrix</span></h1>
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
                  ? 'bg-brand-100 text-brand-700 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-brand-600'
              }`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="px-4 py-3 bg-slate-50 rounded-xl mb-3 border border-slate-100">
          <p className="text-xs text-slate-400 font-medium">Logged in as</p>
          <p className="font-semibold text-slate-700 capitalize truncate">{currentUser?.username}</p>
          <p className="text-xs text-slate-400 mt-0.5">{isAdmin ? 'Administrator' : 'Employee'}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors ring-1 ring-inset ring-slate-200 hover:ring-red-100"
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
