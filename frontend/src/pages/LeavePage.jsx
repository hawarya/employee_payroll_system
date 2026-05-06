import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  CalendarDays, CheckCircle2, XCircle, Clock, Plus, X,
  ChevronDown, Mail, Send, Inbox, AlertCircle
} from 'lucide-react';

/* ── helpers ── */
const fmtDate = (d) => d ? new Date(d).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtShort = (d) => d ? new Date(d).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '—';
const fmtTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};
const remaining = (total, used) => Math.max(0, total - used);

/* ── static email activity log (derived from notifications / leaves) ── */
const buildEmailLog = (leaves) =>
  leaves.flatMap((l) => {
    const log = [];
    if (l.appliedAt || l.startDate)
      log.push({ id: `s-${l.id}`, dir: 'sent', text: `Leave request to manager`, sub: `Re: ${l.leaveType} – ${fmtShort(l.startDate)}`, at: l.appliedAt || l.startDate });
    if (l.status === 'APPROVED')
      log.push({ id: `r-${l.id}`, dir: 'received', text: 'Approval confirmation', sub: `Approved: ${l.leaveType}`, at: l.reviewedAt || l.startDate });
    if (l.status === 'REJECTED')
      log.push({ id: `rj-${l.id}`, dir: 'received', text: 'Rejection notice', sub: `Rejected: ${l.leaveType}`, at: l.reviewedAt || l.startDate });
    return log;
  }).sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 8);

/* ── status badge ── */
const StatusBadge = ({ status }) => {
  const cfg = {
    APPROVED: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    PENDING:  'bg-amber-500/20  text-amber-400  border border-amber-500/30',
    REJECTED: 'bg-red-500/20    text-red-400    border border-red-500/30',
  };
  const icons = { APPROVED: <CheckCircle2 className="w-3 h-3" />, PENDING: <Clock className="w-3 h-3" />, REJECTED: <XCircle className="w-3 h-3" /> };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg[status] || 'bg-slate-500/20 text-slate-400'}`}>
      {icons[status]}{status}
    </span>
  );
};

/* ── progress bar card ── */
const BalanceCard = ({ label, total, used, accent, bg }) => {
  const rem = remaining(total, used);
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;
  return (
    <div className={`rounded-2xl p-5 border ${bg}`}>
      <p className={`text-sm font-semibold mb-1 ${accent}`}>{label}</p>
      <p className="text-4xl font-black text-white">{rem}</p>
      <p className="text-xs text-white/60 mt-1 mb-3">{used} used of {total}</p>
      <div className="w-full h-1.5 rounded-full bg-white/10">
        <div className={`h-full rounded-full transition-all duration-700 ${accent.replace('text-', 'bg-')}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════ */
export default function LeavePage() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN');

  const [balance, setBalance] = useState(null);
  const [myLeaves, setMyLeaves] = useState([]);
  const [adminLeaves, setAdminLeaves] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [form, setForm] = useState({ leaveType: 'CASUAL', numberOfDays: '', startDate: '', endDate: '', reason: '' });
  const [endDateManual, setEndDateManual] = useState(false);
  const [formMsg, setFormMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (!isAdmin) { fetchBalance(); fetchMyLeaves(); }
    else fetchAdminLeaves();
  }, [page, filterStatus]);

  const fetchBalance   = async () => { try { const r = await axios.get('/api/leaves/balance'); setBalance(r.data); } catch {} };
  const fetchMyLeaves  = async () => { try { const r = await axios.get('/api/leaves/my', { params: { page, size: 20 } }); setMyLeaves(r.data.content || []); setTotalPages(r.data.totalPages || 1); } catch {} };
  const fetchAdminLeaves = async () => { try { const p = { page, size: 20, ...(filterStatus && { status: filterStatus }) }; const r = await axios.get('/api/leaves/admin/all', { params: p }); setAdminLeaves(r.data.content || []); setTotalPages(r.data.totalPages || 1); } catch {} };

  /* ── add N calendar days (skip weekends) ── */
  const addBusinessDays = (startStr, n) => {
    if (!startStr || !n || n < 1) return '';
    let date = new Date(startStr);
    let added = 0;
    while (added < n - 1) {
      date.setDate(date.getDate() + 1);
      const dow = date.getDay();
      if (dow !== 0 && dow !== 6) added++; // skip Sun/Sat
    }
    return date.toISOString().split('T')[0];
  };

  /* ── when numberOfDays or startDate changes → auto-fill endDate ── */
  const handleDaysOrStartChange = (field, value) => {
    setForm(f => {
      const next = { ...f, [field]: value };
      if (!endDateManual) {
        const days = parseInt(field === 'numberOfDays' ? value : f.numberOfDays, 10);
        const start = field === 'startDate' ? value : f.startDate;
        if (days > 0 && start) {
          next.endDate = addBusinessDays(start, days);
        }
      }
      return next;
    });
  };

  const handleApply = async (e) => {
    e.preventDefault(); setSubmitting(true); setFormMsg(null);
    try {
      await axios.post('/api/leaves/apply', form);
      setFormMsg({ type: 'success', text: 'Leave applied! Email notification sent to admin.' });
      setForm({ leaveType: 'CASUAL', numberOfDays: '', startDate: '', endDate: '', reason: '' });
      setEndDateManual(false);
      fetchMyLeaves(); fetchBalance();
    } catch (err) { setFormMsg({ type: 'error', text: err.response?.data?.message || 'Failed to apply.' }); }
    setSubmitting(false);
  };

  const handleApprove = async (id) => { try { await axios.put(`/api/leaves/${id}/approve`); fetchAdminLeaves(); } catch (err) { alert(err.response?.data?.message || 'Error'); } };
  const handleReject  = async () => { try { await axios.put(`/api/leaves/${rejectId}/reject`, { reason: rejectReason }); setRejectId(null); setRejectReason(''); fetchAdminLeaves(); } catch (err) { alert(err.response?.data?.message || 'Error'); } };

  const leaveTypeLabel = { CASUAL: 'Casual Leave', SICK: 'Sick Leave', EARNED: 'Earned Leave' };
  const emailLog = buildEmailLog(myLeaves);

  /* ─ admin view ─ */
  if (isAdmin) return <AdminView leaves={adminLeaves} page={page} totalPages={totalPages} setPage={setPage} filterStatus={filterStatus} setFilterStatus={setFilterStatus} onApprove={handleApprove} onReject={(id) => setRejectId(id)} rejectId={rejectId} rejectReason={rejectReason} setRejectReason={setRejectReason} handleReject={handleReject} cancelReject={() => { setRejectId(null); setRejectReason(''); }} />;

  /* ─ employee view ─ */
  return (
    <div className="min-h-screen bg-[#0f0f1a] text-slate-200 p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <CalendarDays className="w-6 h-6 text-brand-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Leave</h1>
          <p className="text-xs text-slate-400">Apply for leave and track your requests.</p>
        </div>
      </div>

      {/* Balance Cards */}
      {balance && (
        <div className="grid grid-cols-3 gap-4">
          <BalanceCard label="Sick Leave"   total={balance.sickLeaves}   used={balance.usedSick}    accent="text-red-400"    bg="bg-[#1e1024] border-red-900/30" />
          <BalanceCard label="Casual Leave" total={balance.casualLeaves} used={balance.usedCasual}  accent="text-blue-400"   bg="bg-[#101828] border-blue-900/30" />
          <BalanceCard label="Earned Leave" total={balance.earnedLeaves} used={balance.usedEarned}  accent="text-violet-400" bg="bg-[#160f24] border-violet-900/30" />
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">

        {/* LEFT — Application Form */}
        <div className="bg-[#16162a] border border-slate-700/50 rounded-2xl p-6">
          <h2 className="font-bold text-white text-base flex items-center gap-2 mb-5">
            <CalendarDays className="w-4 h-4 text-brand-400" /> New application
          </h2>

          {formMsg && (
            <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-sm font-medium ${formMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {formMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {formMsg.text}
            </div>
          )}

          <form onSubmit={handleApply} className="space-y-4">
            {/* Leave Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Leave type</label>
              <div className="relative">
                <select value={form.leaveType} onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-[#0f0f1a] border border-slate-600 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 outline-none appearance-none">
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="EARNED">Earned Leave</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Number of Days — asked FIRST */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">How many days?</label>
              <div className="flex flex-wrap gap-2">
                {[1,2,3,4,5,7,10,14,21,30].map(n => (
                  <button
                    key={n} type="button"
                    onClick={() => handleDaysOrStartChange('numberOfDays', String(n))}
                    className={`px-3 py-1.5 rounded-xl text-sm font-bold border transition-all ${
                      Number(form.numberOfDays) === n
                        ? 'bg-brand-600 border-brand-500 text-white shadow-sm shadow-brand-600/40'
                        : 'bg-[#0f0f1a] border-slate-600 text-slate-400 hover:border-brand-500 hover:text-brand-400'
                    }`}
                  >
                    {n}d
                  </button>
                ))}
                {/* Custom input */}
                <input
                  type="number" min="1" max="60"
                  value={![1,2,3,4,5,7,10,14,21,30].includes(Number(form.numberOfDays)) && form.numberOfDays ? form.numberOfDays : ''}
                  onChange={e => handleDaysOrStartChange('numberOfDays', e.target.value)}
                  placeholder="Other"
                  className="w-20 px-3 py-1.5 rounded-xl bg-[#0f0f1a] border border-slate-600 text-white placeholder-slate-600 text-sm font-bold focus:border-brand-500 outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                {Number(form.numberOfDays) === 1 ? '1 day — just pick the date' : Number(form.numberOfDays) > 1 ? 'Pick a start date — end date auto-fills (weekends skipped)' : 'Select how many days you need'}
              </p>
            </div>

            {/* ── 1 day: single date picker ── */}
            {Number(form.numberOfDays) === 1 && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Select the date</label>
                <input type="date" required value={form.startDate}
                  onChange={e => { const d = e.target.value; setForm(f => ({ ...f, startDate: d, endDate: d })); }}
                  className="w-full px-4 py-3 rounded-xl bg-[#0f0f1a] border border-slate-600 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 outline-none [color-scheme:dark]"
                />
                {form.startDate && (
                  <p className="text-xs text-brand-400 font-semibold mt-1.5 flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" /> 1 day · {fmtDate(form.startDate)}
                  </p>
                )}
              </div>
            )}

            {/* ── >1 day: start date + auto end date ── */}
            {Number(form.numberOfDays) > 1 && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Start date</label>
                  <input type="date" required value={form.startDate}
                    onChange={e => handleDaysOrStartChange('startDate', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#0f0f1a] border border-slate-600 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 outline-none [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                    End date
                    {!endDateManual && form.endDate && (
                      <span className="text-brand-400 text-[9px] font-bold uppercase tracking-widest ml-1 bg-brand-500/10 px-1.5 py-0.5 rounded-md">Auto</span>
                    )}
                  </label>
                  <input type="date" required value={form.endDate}
                    onChange={e => { setEndDateManual(true); setForm(f => ({ ...f, endDate: e.target.value })); }}
                    min={form.startDate || undefined}
                    className={`w-full px-4 py-3 rounded-xl bg-[#0f0f1a] border text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 outline-none [color-scheme:dark] ${
                      !endDateManual && form.endDate ? 'border-brand-600/50' : 'border-slate-600'
                    }`}
                  />
                  {endDateManual && (
                    <button type="button"
                      onClick={() => { setEndDateManual(false); handleDaysOrStartChange('startDate', form.startDate); }}
                      className="text-[10px] text-slate-500 hover:text-brand-400 transition-colors mt-0.5">
                      ↺ Reset to auto
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Summary pill */}
            {form.numberOfDays && form.startDate && form.endDate && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-500/10 border border-brand-500/20">
                <CalendarDays className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                <p className="text-xs text-brand-300 font-medium">
                  {form.numberOfDays} day{form.numberOfDays > 1 ? 's' : ''} · {fmtShort(form.startDate)} → {fmtShort(form.endDate)}
                </p>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Reason</label>
              <textarea required value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                rows={3} placeholder="Briefly describe the reason..."
                className="w-full px-4 py-3 rounded-xl bg-[#0f0f1a] border border-slate-600 text-white placeholder-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 outline-none resize-none" />
            </div>

            {/* Email Preview */}
            <div className="rounded-xl bg-[#0f0f1a] border border-slate-600/50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Email Preview</p>
              <p className="text-xs text-slate-400"><span className="text-slate-300 font-semibold">To:</span> aishwaryazerofive@gmail.com</p>
              <p className="text-xs text-slate-400 mt-0.5">
                <span className="text-slate-300 font-semibold">Subject:</span> Leave request — {currentUser?.username?.toUpperCase()} · {leaveTypeLabel[form.leaveType]}{form.numberOfDays ? ` · ${form.numberOfDays}d` : ''}
              </p>
            </div>

            {/* Submit */}
            <button type="submit" disabled={submitting}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting...' : 'Submit & send email →'}
            </button>
          </form>
        </div>

        {/* RIGHT — History + Email Log */}
        <div className="flex flex-col gap-4">

          {/* Leave History */}
          <div className="bg-[#16162a] border border-slate-700/50 rounded-2xl p-5 flex-1">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-slate-400" /> Leave history
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
              {myLeaves.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No leave history yet.</p>}
              {myLeaves.slice(0, 10).map(l => (
                <div key={l.id} className="flex items-start gap-3 py-2 border-b border-slate-700/40 last:border-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    l.status === 'APPROVED' ? 'bg-emerald-500/20' : l.status === 'REJECTED' ? 'bg-red-500/20' : 'bg-amber-500/20'
                  }`}>
                    {l.status === 'APPROVED' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : l.status === 'REJECTED' ? <XCircle className="w-4 h-4 text-red-400" /> : <Clock className="w-4 h-4 text-amber-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white truncate">{leaveTypeLabel[l.leaveType] || l.leaveType}</p>
                      <StatusBadge status={l.status} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{fmtShort(l.startDate)} – {fmtShort(l.endDate)}</p>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex gap-2 mt-3">
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="flex-1 py-1.5 text-xs rounded-lg border border-slate-600 text-slate-400 hover:bg-slate-700/30 disabled:opacity-30 transition">← Prev</button>
                <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="flex-1 py-1.5 text-xs rounded-lg border border-slate-600 text-slate-400 hover:bg-slate-700/30 disabled:opacity-30 transition">Next →</button>
              </div>
            )}
          </div>

          {/* Email Activity Log */}
          <div className="bg-[#16162a] border border-slate-700/50 rounded-2xl p-5">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
              <Mail className="w-4 h-4 text-slate-400" /> Email activity
            </h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {emailLog.length === 0 && <p className="text-xs text-slate-500 text-center py-3">No email activity yet.</p>}
              {emailLog.map(e => (
                <div key={e.id} className="flex items-start gap-3 border-b border-slate-700/40 last:border-0 pb-2.5 last:pb-0">
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${e.dir === 'sent' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-300 leading-snug">
                      <span className="font-semibold text-slate-400">{e.dir === 'sent' ? 'Sent' : 'Received'}</span> — {e.text}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{fmtTime(e.at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════ ADMIN VIEW ═══════════ */
function AdminView({ leaves, page, totalPages, setPage, filterStatus, setFilterStatus, onApprove, onReject, rejectId, rejectReason, setRejectReason, handleReject, cancelReject }) {
  const statusColors = { PENDING: 'bg-amber-500/20 text-amber-400', APPROVED: 'bg-emerald-500/20 text-emerald-400', REJECTED: 'bg-red-500/20 text-red-400' };
  const typeColors   = { SICK: 'bg-red-500/20 text-red-400', CASUAL: 'bg-blue-500/20 text-blue-400', EARNED: 'bg-violet-500/20 text-violet-400' };

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-slate-200 p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Leave Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">Review and manage employee leave requests.</p>
        </div>
        <div className="relative">
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(0); }}
            className="pl-3 pr-8 py-2 text-sm bg-[#16162a] border border-slate-600 text-white rounded-xl outline-none appearance-none focus:border-brand-500">
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="bg-[#16162a] border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Employee</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">From</th>
                <th className="p-4 font-semibold">To</th>
                <th className="p-4 font-semibold">Days</th>
                <th className="p-4 font-semibold">Reason</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-slate-500">No leave requests found.</td></tr>
              ) : leaves.map(l => (
                <tr key={l.id} className="border-b border-slate-700/30 hover:bg-slate-700/10 transition-colors">
                  <td className="p-4 font-semibold text-white">{l.employeeName || l.employeeId}</td>
                  <td className="p-4"><span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${typeColors[l.leaveType] || 'bg-slate-700 text-slate-300'}`}>{l.leaveType}</span></td>
                  <td className="p-4 text-slate-400">{fmtDate(l.startDate)}</td>
                  <td className="p-4 text-slate-400">{fmtDate(l.endDate)}</td>
                  <td className="p-4 font-semibold text-white">{l.totalDays}d</td>
                  <td className="p-4 text-slate-400 max-w-xs truncate">{l.reason}</td>
                  <td className="p-4"><span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${statusColors[l.status] || ''}`}>{l.status}</span></td>
                  <td className="p-4">
                    {l.status === 'PENDING' ? (
                      <div className="flex gap-2">
                        <button onClick={() => onApprove(l.id)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-500/30 transition">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button onClick={() => onReject(l.id)} className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-semibold rounded-xl border border-red-500/30 transition">
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    ) : <span className="text-slate-500 text-xs">{l.reviewedBy && `by ${l.reviewedBy}`}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-700/50 flex items-center justify-between text-sm text-slate-500">
          <span>Page {page + 1} of {Math.max(1, totalPages)}</span>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border border-slate-600 rounded-lg hover:bg-slate-700/30 disabled:opacity-30 transition text-slate-400">Previous</button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border border-slate-600 rounded-lg hover:bg-slate-700/30 disabled:opacity-30 transition text-slate-400">Next</button>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#16162a] border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-white text-lg mb-4">Reject Leave Request</h3>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)..." rows={3}
              className="w-full px-4 py-3 rounded-xl bg-[#0f0f1a] border border-slate-600 text-white placeholder-slate-500 focus:border-red-500 outline-none resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={handleReject} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition">Confirm Reject</button>
              <button onClick={cancelReject} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-semibold transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
