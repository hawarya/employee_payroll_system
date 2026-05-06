import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  User, Mail, Building2, Briefcase, Shield, CalendarDays,
  CheckCircle2, XCircle, Clock, TrendingUp, Award, Edit3,
  IndianRupee, Hash, Layers
} from 'lucide-react';

/* ── helpers ── */
const fmtDate = (d) => d ? new Date(d).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtShort = (d) => d ? new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '—';

const StatusBadge = ({ status }) => {
  const cfg = {
    APPROVED: { cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: <CheckCircle2 className="w-3 h-3" /> },
    PENDING: { cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: <Clock className="w-3 h-3" /> },
    REJECTED: { cls: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <XCircle className="w-3 h-3" /> },
  };
  const c = cfg[status] || { cls: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${c.cls}`}>
      {c.icon}{status}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, accent, sub }) => (
  <div className="bg-[#16162a] border border-slate-700/50 rounded-2xl p-5 flex flex-col gap-2">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent.bg}`}>
      <Icon className={`w-5 h-5 ${accent.text}`} />
    </div>
    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">{label}</p>
    <p className="text-2xl font-black text-white">{value}</p>
    {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
  </div>
);

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN');

  const [employee, setEmployee] = useState(null);
  const [balance, setBalance] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [salary, setSalary] = useState(null);
  const [loadingEmp, setLoadingEmp] = useState(true);

  // Derive initials for avatar
  const name = employee?.name || currentUser?.username || 'User';
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  // Accent color based on role
  const roleColor = isAdmin
    ? { from: '#f59e0b', to: '#f97316', text: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' }
    : { from: '#6366f1', to: '#8b5cf6', text: 'text-indigo-400', bg: 'bg-indigo-500/15', border: 'border-indigo-500/30' };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        if (!isAdmin) {
          // fetch employee profile by matching current user
          const empRes = await axios.get('/api/employees/me').catch(() => null);
          if (empRes?.data) {
            setEmployee(empRes.data);
            const salRes = await axios.get(`/api/employees/${empRes.data.id}/salary`).catch(() => null);
            if (salRes?.data) setSalary(salRes.data);
          }
          const balRes = await axios.get('/api/leaves/balance').catch(() => null);
          if (balRes?.data) setBalance(balRes.data);
          const lvRes = await axios.get('/api/leaves/my', { params: { page: 0, size: 5 } }).catch(() => null);
          if (lvRes?.data) setLeaves(lvRes.data.content || []);
        } else {
          // Admin profile — minimal data
          setEmployee({ name: currentUser?.username, employeeId: 'ADMIN', department: 'Administration', designation: 'System Administrator', email: '' });
        }
      } catch (e) {
        console.error(e);
      }
      setLoadingEmp(false);
    };
    fetchAll();
  }, []);

  if (loadingEmp) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
        <p className="text-slate-400 text-sm">Loading profile…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-slate-200 p-4 md:p-6 space-y-6 max-w-5xl mx-auto">

      {/* ─── Hero Card ─── */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-700/50"
        style={{ background: 'linear-gradient(135deg, #16162a 0%, #1a1a30 60%, #16162a 100%)' }}>
        {/* Top glow */}
        <div className="absolute top-0 left-0 right-0 h-1"
          style={{ background: `linear-gradient(90deg, ${roleColor.from}, ${roleColor.to})` }} />
        {/* Background orb */}
        <div className="absolute top-[-60px] right-[-60px] w-64 h-64 rounded-full opacity-10"
          style={{ background: `radial-gradient(circle, ${roleColor.from}, transparent)` }} />

        <div className="relative p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-2xl"
              style={{ background: `linear-gradient(135deg, ${roleColor.from}, ${roleColor.to})` }}>
              {initials}
            </div>
            {/* Online dot */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[#16162a]" />
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-white">{name}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${roleColor.border} ${roleColor.text} ${roleColor.bg}`}>
                {isAdmin ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                {isAdmin ? 'Administrator' : 'Employee'}
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-4">{employee?.designation || '—'}</p>

            {/* Detail pills */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              {employee?.employeeId && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f0f1a] rounded-xl border border-slate-700/50 text-xs text-slate-400">
                  <Hash className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-semibold text-slate-300">{employee.employeeId}</span>
                </div>
              )}
              {employee?.email && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f0f1a] rounded-xl border border-slate-700/50 text-xs text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-semibold text-slate-300">{employee.email}</span>
                </div>
              )}
              {employee?.department && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f0f1a] rounded-xl border border-slate-700/50 text-xs text-slate-400">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-semibold text-slate-300">{employee.department}</span>
                </div>
              )}
              {employee?.type && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f0f1a] rounded-xl border border-slate-700/50 text-xs text-slate-400">
                  <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-semibold text-slate-300">{employee.type?.replace('_', ' ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Edit button (decorative for now) */}
          <button
            title="Edit profile (coming soon)"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all text-sm font-semibold opacity-60 cursor-not-allowed"
          >
            <Edit3 className="w-4 h-4" /> Edit Profile
          </button>
        </div>
      </div>

      {/* ─── Stats Row ─── */}
      {!isAdmin && balance && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={CalendarDays} label="Sick Remaining" value={Math.max(0, balance.sickLeaves - balance.usedSick)}
            accent={{ text: 'text-red-400', bg: 'bg-red-500/15' }} sub={`${balance.usedSick} used of ${balance.sickLeaves}`} />
          <StatCard icon={CalendarDays} label="Casual Remaining" value={Math.max(0, balance.casualLeaves - balance.usedCasual)}
            accent={{ text: 'text-blue-400', bg: 'bg-blue-500/15' }} sub={`${balance.usedCasual} used of ${balance.casualLeaves}`} />
          <StatCard icon={CalendarDays} label="Earned Remaining" value={Math.max(0, balance.earnedLeaves - balance.usedEarned)}
            accent={{ text: 'text-violet-400', bg: 'bg-violet-500/15' }} sub={`${balance.usedEarned} used of ${balance.earnedLeaves}`} />
          <StatCard icon={Award} label="Total Leaves Left"
            value={Math.max(0, (balance.sickLeaves - balance.usedSick) + (balance.casualLeaves - balance.usedCasual) + (balance.earnedLeaves - balance.usedEarned))}
            accent={{ text: 'text-emerald-400', bg: 'bg-emerald-500/15' }} sub="across all types" />
        </div>
      )}

      {/* ─── Two-col: Salary + Leave history ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Salary Card */}
        {!isAdmin && salary && (
          <div className="bg-[#16162a] border border-slate-700/50 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-brand-400" /> Salary Summary
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Base Salary', value: salary.baseSalary, color: 'text-white' },
                { label: 'Bonus', value: salary.bonus, color: 'text-emerald-400' },
                { label: 'Tax Deduction', value: salary.taxDeduction, color: 'text-red-400' },
                { label: 'PF Deduction', value: salary.pfDeduction, color: 'text-amber-400' },
              ].filter(r => r.value != null && r.value !== '').map(row => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-700/30 last:border-0">
                  <span className="text-sm text-slate-400">{row.label}</span>
                  <span className={`text-sm font-bold ${row.color}`}>₹{Number(row.value).toLocaleString('en-IN')}</span>
                </div>
              ))}
              {salary.netSalary != null && (
                <div className="flex items-center justify-between py-3 rounded-xl bg-brand-500/10 border border-brand-500/20 px-3 mt-2">
                  <span className="text-sm font-bold text-white">Net Salary</span>
                  <span className="text-lg font-black text-brand-400">₹{Number(salary.netSalary).toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Admin placeholder card */}
        {isAdmin && (
          <div className="bg-[#16162a] border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center">
              <Shield className="w-7 h-7 text-amber-400" />
            </div>
            <p className="text-white font-bold">Admin Account</p>
            <p className="text-slate-400 text-sm">Admin accounts don't have salary records. Use the Employees section to manage payroll.</p>
          </div>
        )}

        {/* Leave History */}
        {!isAdmin && (
          <div className="bg-[#16162a] border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-brand-400" /> Recent Leave Requests
            </h2>
            <div className="space-y-3">
              {leaves.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6">No leave history yet.</p>
              )}
              {leaves.map(l => (
                <div key={l.id} className="flex items-start gap-3 py-2.5 border-b border-slate-700/30 last:border-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    l.status === 'APPROVED' ? 'bg-emerald-500/15' : l.status === 'REJECTED' ? 'bg-red-500/15' : 'bg-amber-500/15'
                  }`}>
                    {l.status === 'APPROVED' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      : l.status === 'REJECTED' ? <XCircle className="w-4 h-4 text-red-400" />
                      : <Clock className="w-4 h-4 text-amber-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-white truncate">{l.leaveType} Leave</p>
                      <StatusBadge status={l.status} />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {fmtShort(l.startDate)} – {fmtShort(l.endDate)}
                      {l.totalDays ? ` · ${l.totalDays}d` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admin leave history placeholder */}
        {isAdmin && (
          <div className="bg-[#16162a] border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-indigo-400" />
            </div>
            <p className="text-white font-bold">Manage Leave Requests</p>
            <p className="text-slate-400 text-sm">Visit the Leave section to review and approve employee leave requests.</p>
          </div>
        )}
      </div>
    </div>
  );
}
