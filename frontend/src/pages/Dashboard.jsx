import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Banknote, Building2, TrendingUp, Clock, CalendarDays, CheckCircle2, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN');

  const [stats, setStats] = useState({ totalActive: 0, totalDepartments: 0, recentAdds: 0 });
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [myToday, setMyToday] = useState(null);
  const [myBalance, setMyBalance] = useState(null);
  const [myStats, setMyStats] = useState({ present: 0, absent: 0, halfDay: 0 });

  useEffect(() => {
    if (isAdmin) { fetchAdminStats(); fetchPendingLeaves(); }
    else { fetchMyToday(); fetchMyBalance(); fetchMyStats(); }
  }, [isAdmin]);

  const fetchAdminStats = async () => {
    try {
      const res = await axios.get('/api/employees?size=1000');
      const employees = res.data.content || [];
      const depts = new Set(employees.map(e => e.department));
      setStats({
        totalActive: res.data.totalElements || 0,
        totalDepartments: depts.size,
        recentAdds: employees.filter(e => (new Date() - new Date(e.createdAt)) / 86400000 < 7).length,
      });
    } catch (err) { console.error(err); }
  };

  const fetchPendingLeaves = async () => {
    try {
      const res = await axios.get('/api/leaves/admin/pending-count');
      setPendingLeaves(res.data.pending || 0);
    } catch {}
  };

  const fetchMyToday = async () => {
    try {
      const res = await axios.get('/api/attendance/today');
      setMyToday(res.data);
    } catch { setMyToday(null); }
  };

  const fetchMyBalance = async () => {
    try {
      const res = await axios.get('/api/leaves/balance');
      setMyBalance(res.data);
    } catch {}
  };

  const fetchMyStats = async () => {
    try {
      const res = await axios.get('/api/attendance/stats');
      setMyStats(res.data);
    } catch {}
  };

  const fmt = (dt) => dt ? new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

  /* ─── ADMIN DASHBOARD ─── */
  if (isAdmin) {
    const adminCards = [
      { name: 'Total Employees', value: stats.totalActive, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
      { name: 'Departments', value: stats.totalDepartments, icon: Building2, color: 'text-brand-500', bg: 'bg-brand-50' },
      { name: 'New Hires (7d)', value: stats.recentAdds, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
      { name: 'Pending Leaves', value: pendingLeaves, icon: CalendarDays, color: 'text-amber-500', bg: 'bg-amber-50' },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your entire workforce.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminCards.map(card => (
            <div key={card.name} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-brand-100 transition-all group cursor-default">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.name}</p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">{card.value}</p>
                </div>
                <div className={`p-4 rounded-2xl ${card.bg} group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className={`w-7 h-7 ${card.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link to="/employees" className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all group flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Manage Employees</p>
              <p className="text-sm text-slate-500">View, add, and edit employees</p>
            </div>
          </Link>
          <Link to="/leaves" className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all group flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-2xl group-hover:scale-110 transition-transform">
              <CalendarDays className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Leave Requests</p>
              <p className="text-sm text-slate-500">{pendingLeaves} pending approval</p>
            </div>
          </Link>
          <Link to="/reports" className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-2xl group-hover:scale-110 transition-transform">
              <Banknote className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Payroll Reports</p>
              <p className="text-sm text-slate-500">View & export payroll data</p>
            </div>
          </Link>
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-r from-brand-700 to-brand-900 rounded-3xl p-8 text-white shadow-xl shadow-brand-500/20 flex flex-col md:flex-row items-center justify-between overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Automated Payroll Calculation</h2>
            <p className="text-brand-200 leading-relaxed max-w-lg">Full-time, part-time (with overtime 1.5×), and contract. Generate professional PDF payslips in one click.</p>
          </div>
          <div className="relative z-10 mt-6 md:mt-0">
            <div className="p-4 bg-white/10 backdrop-blur border border-white/20 rounded-2xl flex gap-4 shadow-2xl">
              <Banknote className="w-10 h-10 text-green-300" />
              <div>
                <p className="text-xs text-brand-200 uppercase tracking-widest font-medium">Next Payout</p>
                <p className="text-xl font-bold">1st of Next Month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── EMPLOYEE DASHBOARD ─── */
  const totalLeave = myBalance ? (
    (myBalance.sickLeaves - myBalance.usedSick) +
    (myBalance.casualLeaves - myBalance.usedCasual) +
    (myBalance.earnedLeaves - myBalance.usedEarned)
  ) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">My Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, <span className="font-semibold text-brand-600">{currentUser?.username}</span>!</p>
      </div>

      {/* Today's Attendance */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-2xl">
              <Clock className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Today's Attendance</h2>
              <p className="text-xs text-slate-400">{new Date().toDateString()}</p>
            </div>
          </div>
          <Link to="/attendance" className="text-sm text-brand-600 hover:text-brand-700 font-semibold transition-colors">View History →</Link>
        </div>

        {myToday ? (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-emerald-50 rounded-2xl">
              <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider mb-1">Check In</p>
              <p className="text-2xl font-bold text-emerald-700">{fmt(myToday.checkInTime)}</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-2xl">
              <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider mb-1">Check Out</p>
              <p className="text-2xl font-bold text-amber-700">{fmt(myToday.checkOutTime)}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-2xl">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Hours</p>
              <p className="text-2xl font-bold text-blue-700">{myToday.hoursWorked?.toFixed(1) || '—'}h</p>
              {myToday.overtimeHours > 0 && <p className="text-xs text-violet-600 mt-1">+{myToday.overtimeHours?.toFixed(1)}h OT</p>}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-5 bg-slate-50 rounded-2xl">
            <LogIn className="w-5 h-5 text-slate-400" />
            <p className="text-slate-500">You haven't checked in yet today.</p>
            <Link to="/attendance" className="ml-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl transition-colors">
              Check In Now
            </Link>
          </div>
        )}
      </div>

      {/* Stats + Leave Balance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Stats */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Attendance Stats
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Present', value: myStats.present, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Absent', value: myStats.absent, color: 'text-red-500', bg: 'bg-red-50' },
              { label: 'Half Day', value: myStats.halfDay, color: 'text-amber-500', bg: 'bg-amber-50' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Leave Balance */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-brand-500" /> Leave Balance
            </h2>
            <Link to="/leaves" className="text-sm text-brand-600 hover:text-brand-700 font-semibold transition-colors">Apply →</Link>
          </div>
          {myBalance ? (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Sick', rem: myBalance.sickLeaves - myBalance.usedSick, color: 'text-red-500', bg: 'bg-red-50' },
                { label: 'Casual', rem: myBalance.casualLeaves - myBalance.usedCasual, color: 'text-blue-500', bg: 'bg-blue-50' },
                { label: 'Earned', rem: myBalance.earnedLeaves - myBalance.usedEarned, color: 'text-violet-500', bg: 'bg-violet-50' },
              ].map(b => (
                <div key={b.label} className={`${b.bg} rounded-2xl p-4 text-center`}>
                  <p className={`text-2xl font-bold ${b.color}`}>{b.rem}</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{b.label}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-400 text-sm flex items-center gap-2 p-4 bg-slate-50 rounded-2xl">
              <AlertCircle className="w-4 h-4" /> Balance not initialized — apply for leave to set up.
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link to="/attendance" className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-2xl group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="font-bold text-slate-800">Attendance</p>
            <p className="text-sm text-slate-500">Check in / out & history</p>
          </div>
        </Link>
        <Link to="/leaves" className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:border-amber-200 hover:shadow-md transition-all group flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-2xl group-hover:scale-110 transition-transform">
            <CalendarDays className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="font-bold text-slate-800">Leave</p>
            <p className="text-sm text-slate-500">{totalLeave} days remaining</p>
          </div>
        </Link>
        <Link to="/profile" className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all group flex items-center gap-4">
          <div className="p-3 bg-brand-50 rounded-2xl group-hover:scale-110 transition-transform">
            <Banknote className="w-6 h-6 text-brand-500" />
          </div>
          <div>
            <p className="font-bold text-slate-800">My Payslip</p>
            <p className="text-sm text-slate-500">View & download PDF</p>
          </div>
        </Link>
      </div>
    </div>
  );
}