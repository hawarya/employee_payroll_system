import { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, LogIn, LogOut, Calendar, CheckCircle2, XCircle, AlertCircle, Timer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const statusColors = {
  PRESENT: 'bg-emerald-100 text-emerald-700',
  ABSENT: 'bg-red-100 text-red-700',
  HALF_DAY: 'bg-amber-100 text-amber-700',
  ON_LEAVE: 'bg-blue-100 text-blue-700',
};

export default function AttendancePage() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN');

  const [today, setToday] = useState(null);
  const [todayLoading, setTodayLoading] = useState(true);
  const [stats, setStats] = useState({ present: 0, absent: 0, halfDay: 0, onLeave: 0 });
  const [history, setHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [totalHistoryPages, setTotalHistoryPages] = useState(1);
  const [adminAll, setAdminAll] = useState([]);
  const [adminPage, setAdminPage] = useState(0);
  const [adminTotalPages, setAdminTotalPages] = useState(1);
  const [actionMsg, setActionMsg] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { fetchToday(); fetchStats(); }, []);
  useEffect(() => { if (!isAdmin) fetchHistory(); }, [historyPage]);
  useEffect(() => { if (isAdmin) fetchAllAdmin(); }, [adminPage]);

  const fetchToday = async () => {
    setTodayLoading(true);
    try {
      const res = await axios.get('/api/attendance/today');
      setToday(res.data);
    } catch {
      setToday(null);
    }
    setTodayLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/attendance/stats');
      setStats(res.data);
    } catch {}
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get('/api/attendance/history', { params: { page: historyPage, size: 8 } });
      setHistory(res.data.content || []);
      setTotalHistoryPages(res.data.totalPages || 1);
    } catch {}
  };

  const fetchAllAdmin = async () => {
    try {
      const res = await axios.get('/api/attendance/admin/all', { params: { page: adminPage, size: 15 } });
      setAdminAll(res.data.content || []);
      setAdminTotalPages(res.data.totalPages || 1);
    } catch {}
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    setActionMsg(null);
    try {
      await axios.post('/api/attendance/checkin');
      setActionMsg({ type: 'success', text: 'Checked in successfully! Have a great day 🎉' });
      fetchToday(); fetchStats();
    } catch (err) {
      setActionMsg({ type: 'error', text: err.response?.data?.message || 'Check-in failed.' });
    }
    setActionLoading(false);
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setActionMsg(null);
    try {
      await axios.post('/api/attendance/checkout');
      setActionMsg({ type: 'success', text: 'Checked out! Great work today 👍' });
      fetchToday(); fetchStats();
    } catch (err) {
      setActionMsg({ type: 'error', text: err.response?.data?.message || 'Check-out failed.' });
    }
    setActionLoading(false);
  };

  const fmt = (dt) => dt ? new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
  const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Attendance</h1>
        <p className="text-slate-500 mt-1">Track your daily check-in and check-out times.</p>
      </div>

      {!isAdmin && (
        <>
          {/* Today Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-brand-50 rounded-2xl">
                  <Calendar className="w-6 h-6 text-brand-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 text-lg">Today — {new Date().toDateString()}</h2>
                  <p className="text-slate-500 text-sm">Your attendance status for today</p>
                </div>
              </div>

              {todayLoading ? (
                <div className="h-24 flex items-center justify-center text-slate-400">Loading...</div>
              ) : today ? (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-emerald-50 rounded-2xl">
                    <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider mb-1">Check In</p>
                    <p className="text-2xl font-bold text-emerald-700">{fmt(today.checkInTime)}</p>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-2xl">
                    <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider mb-1">Check Out</p>
                    <p className="text-2xl font-bold text-amber-700">{fmt(today.checkOutTime)}</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-2xl">
                    <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">Hours</p>
                    <p className="text-2xl font-bold text-blue-700">{today.hoursWorked?.toFixed(1) || '—'}h</p>
                    {today.overtimeHours > 0 && (
                      <p className="text-xs text-violet-600 font-medium mt-1">+{today.overtimeHours?.toFixed(1)}h OT</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl text-center text-slate-500 mb-6">
                  No attendance record for today yet. Check in to start!
                </div>
              )}

              {actionMsg && (
                <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-sm font-medium ${actionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {actionMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {actionMsg.text}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleCheckIn}
                  disabled={actionLoading || (today && today.checkInTime)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogIn className="w-5 h-5" /> Check In
                </button>
                <button
                  onClick={handleCheckOut}
                  disabled={actionLoading || !today?.checkInTime || today?.checkOutTime}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-semibold shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LogOut className="w-5 h-5" /> Check Out
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3">
              {[
                { label: 'Present', value: stats.present, color: 'bg-emerald-500', icon: CheckCircle2, textColor: 'text-emerald-500' },
                { label: 'Absent', value: stats.absent, color: 'bg-red-500', icon: XCircle, textColor: 'text-red-500' },
                { label: 'Half Day', value: stats.halfDay, color: 'bg-amber-500', icon: AlertCircle, textColor: 'text-amber-500' },
                { label: 'On Leave', value: stats.onLeave, color: 'bg-blue-500', icon: Timer, textColor: 'text-blue-500' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-opacity-10 ${s.color.replace('bg-', 'bg-').replace('500', '100')}`}>
                      <s.icon className={`w-5 h-5 ${s.textColor}`} />
                    </div>
                    <span className="font-medium text-slate-700">{s.label}</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-800">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 text-lg">Attendance History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Check In</th>
                    <th className="p-4 font-semibold">Check Out</th>
                    <th className="p-4 font-semibold">Hours</th>
                    <th className="p-4 font-semibold">Overtime</th>
                    <th className="p-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.length === 0 ? (
                    <tr><td colSpan="6" className="p-8 text-center text-slate-400">No attendance records yet.</td></tr>
                  ) : history.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-medium text-slate-700">{fmtDate(r.date)}</td>
                      <td className="p-4 text-slate-600">{fmt(r.checkInTime)}</td>
                      <td className="p-4 text-slate-600">{fmt(r.checkOutTime)}</td>
                      <td className="p-4 font-semibold text-slate-700">{r.hoursWorked?.toFixed(1) || '—'}h</td>
                      <td className="p-4">
                        {r.overtimeHours > 0
                          ? <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs font-bold rounded-lg">+{r.overtimeHours?.toFixed(1)}h OT</span>
                          : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wide ${statusColors[r.status] || 'bg-slate-100 text-slate-600'}`}>
                          {r.status?.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
              <span>Page {historyPage + 1} of {Math.max(1, totalHistoryPages)}</span>
              <div className="flex gap-2">
                <button disabled={historyPage === 0} onClick={() => setHistoryPage(p => p - 1)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition">Previous</button>
                <button disabled={historyPage >= totalHistoryPages - 1} onClick={() => setHistoryPage(p => p + 1)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition">Next</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Admin View */}
      {isAdmin && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 text-lg">All Employees Attendance</h2>
            <p className="text-slate-500 text-sm mt-1">Company-wide attendance records</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Employee</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Check In</th>
                  <th className="p-4 font-semibold">Check Out</th>
                  <th className="p-4 font-semibold">Hours</th>
                  <th className="p-4 font-semibold">OT</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adminAll.length === 0 ? (
                  <tr><td colSpan="7" className="p-8 text-center text-slate-400">No records found.</td></tr>
                ) : adminAll.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-semibold text-slate-800">{r.employeeName || r.employeeId}</td>
                    <td className="p-4 text-slate-600">{fmtDate(r.date)}</td>
                    <td className="p-4 text-slate-600">{fmt(r.checkInTime)}</td>
                    <td className="p-4 text-slate-600">{fmt(r.checkOutTime)}</td>
                    <td className="p-4 font-semibold">{r.hoursWorked?.toFixed(1) || '—'}h</td>
                    <td className="p-4 text-violet-600 font-medium">{r.overtimeHours > 0 ? `+${r.overtimeHours?.toFixed(1)}h` : '—'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wide ${statusColors[r.status] || 'bg-slate-100 text-slate-600'}`}>
                        {r.status?.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
            <span>Page {adminPage + 1} of {Math.max(1, adminTotalPages)}</span>
            <div className="flex gap-2">
              <button disabled={adminPage === 0} onClick={() => setAdminPage(p => p - 1)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition">Previous</button>
              <button disabled={adminPage >= adminTotalPages - 1} onClick={() => setAdminPage(p => p + 1)}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
