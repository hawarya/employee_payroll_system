import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, CheckCircle2, XCircle, Clock, Plus, X, ChevronDown } from 'lucide-react';

const statusColors = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-600',
};

const leaveTypeColors = {
  SICK: 'bg-red-50 text-red-600',
  CASUAL: 'bg-blue-50 text-blue-600',
  EARNED: 'bg-violet-50 text-violet-600',
};

export default function LeavePage() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN');

  const [balance, setBalance] = useState(null);
  const [myLeaves, setMyLeaves] = useState([]);
  const [adminLeaves, setAdminLeaves] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ leaveType: 'CASUAL', startDate: '', endDate: '', reason: '' });
  const [formMsg, setFormMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (!isAdmin) { fetchBalance(); fetchMyLeaves(); }
    else fetchAdminLeaves();
  }, [page, filterStatus]);

  const fetchBalance = async () => {
    try { const res = await axios.get('/api/leaves/balance'); setBalance(res.data); } catch {}
  };

  const fetchMyLeaves = async () => {
    try {
      const res = await axios.get('/api/leaves/my', { params: { page, size: 8 } });
      setMyLeaves(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {}
  };

  const fetchAdminLeaves = async () => {
    try {
      const params = { page, size: 15, ...(filterStatus && { status: filterStatus }) };
      const res = await axios.get('/api/leaves/admin/all', { params });
      setAdminLeaves(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {}
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true); setFormMsg(null);
    try {
      await axios.post('/api/leaves/apply', form);
      setFormMsg({ type: 'success', text: 'Leave applied successfully! Awaiting approval.' });
      setForm({ leaveType: 'CASUAL', startDate: '', endDate: '', reason: '' });
      fetchMyLeaves(); fetchBalance();
      setTimeout(() => setShowForm(false), 1500);
    } catch (err) {
      setFormMsg({ type: 'error', text: err.response?.data?.message || 'Failed to apply for leave.' });
    }
    setSubmitting(false);
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/leaves/${id}/approve`);
      fetchAdminLeaves();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const handleReject = async () => {
    try {
      await axios.put(`/api/leaves/${rejectId}/reject`, { reason: rejectReason });
      setRejectId(null); setRejectReason('');
      fetchAdminLeaves();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const remaining = (total, used) => Math.max(0, total - used);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Leave Management</h1>
          <p className="text-slate-500 mt-1">{isAdmin ? 'Review and manage employee leave requests.' : 'Apply for leave and track your requests.'}</p>
        </div>
        {!isAdmin && (
          <button
            onClick={() => { setShowForm(!showForm); setFormMsg(null); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-semibold shadow-md shadow-brand-600/20 transition-all active:scale-95"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'Apply Leave'}
          </button>
        )}
      </div>

      {/* Leave Balance (Employee only) */}
      {!isAdmin && balance && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Sick Leave', total: balance.sickLeaves, used: balance.usedSick, color: 'from-red-400 to-rose-500' },
            { label: 'Casual Leave', total: balance.casualLeaves, used: balance.usedCasual, color: 'from-blue-400 to-cyan-500' },
            { label: 'Earned Leave', total: balance.earnedLeaves, used: balance.usedEarned, color: 'from-violet-400 to-purple-500' },
          ].map(b => (
            <div key={b.label} className={`bg-gradient-to-br ${b.color} rounded-3xl p-6 text-white shadow-lg`}>
              <p className="text-white/80 text-sm font-medium mb-1">{b.label}</p>
              <p className="text-4xl font-black">{remaining(b.total, b.used)}</p>
              <p className="text-white/70 text-xs mt-2">{b.used} used of {b.total}</p>
            </div>
          ))}
        </div>
      )}

      {/* Apply Leave Form */}
      {!isAdmin && showForm && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-bold text-slate-800 text-lg mb-5 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-brand-600" /> New Leave Application
          </h2>
          {formMsg && (
            <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-sm font-medium ${formMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {formMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {formMsg.text}
            </div>
          )}
          <form onSubmit={handleApply} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Leave Type</label>
              <div className="relative">
                <select value={form.leaveType} onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none appearance-none bg-white">
                  <option value="CASUAL">Casual Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="EARNED">Earned Leave</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date</label>
              <input type="date" required value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Date</label>
              <input type="date" required value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Reason</label>
              <textarea required value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                rows={3} placeholder="Briefly describe the reason for your leave..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none resize-none" />
            </div>
            <div className="md:col-span-2">
              <button type="submit" disabled={submitting}
                className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-semibold shadow-md transition-all active:scale-95 disabled:opacity-60">
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Reject Leave Request</h3>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)..." rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 outline-none resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={handleReject}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-semibold transition-all">
                Confirm Reject
              </button>
              <button onClick={() => { setRejectId(null); setRejectReason(''); }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-semibold transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leaves Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-lg">{isAdmin ? 'All Leave Requests' : 'My Leave History'}</h2>
          {isAdmin && (
            <div className="relative">
              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(0); }}
                className="pl-3 pr-8 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-brand-500 appearance-none bg-white">
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                {isAdmin && <th className="p-4 font-semibold">Employee</th>}
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">From</th>
                <th className="p-4 font-semibold">To</th>
                <th className="p-4 font-semibold">Days</th>
                <th className="p-4 font-semibold">Reason</th>
                <th className="p-4 font-semibold">Status</th>
                {isAdmin && <th className="p-4 font-semibold">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(isAdmin ? adminLeaves : myLeaves).length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-slate-400">No leave requests found.</td></tr>
              ) : (isAdmin ? adminLeaves : myLeaves).map(l => (
                <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                  {isAdmin && <td className="p-4 font-semibold text-slate-800">{l.employeeName || l.employeeId}</td>}
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${leaveTypeColors[l.leaveType] || 'bg-slate-100 text-slate-600'}`}>
                      {l.leaveType}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{fmtDate(l.startDate)}</td>
                  <td className="p-4 text-slate-600">{fmtDate(l.endDate)}</td>
                  <td className="p-4 font-semibold text-slate-700">{l.totalDays}d</td>
                  <td className="p-4 text-slate-500 max-w-xs truncate">{l.reason}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${statusColors[l.status]}`}>
                      {l.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="p-4">
                      {l.status === 'PENDING' ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(l.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition-colors">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button onClick={() => setRejectId(l.id)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-xl transition-colors">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">{l.reviewedBy && `by ${l.reviewedBy}`}</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <span>Page {page + 1} of {Math.max(1, totalPages)}</span>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition">Previous</button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
