import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Download, Users, Banknote, TrendingUp, FileText } from 'lucide-react';

export default function ReportsPage() {
  const [payrollData, setPayrollData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchPayroll(); }, []);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/employees/reports/payroll');
      setPayrollData(res.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const filtered = payrollData.filter(e =>
    !search || e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.toLowerCase().includes(search.toLowerCase()) ||
    e.employeeId?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPayroll = filtered.reduce((sum, e) => sum + (e.netSalary || 0), 0);
  const totalBonus = filtered.reduce((sum, e) => sum + (e.bonus || 0), 0);
  const totalDeductions = filtered.reduce((sum, e) => sum + ((e.taxDeduction || 0) + (e.pfDeduction || 0)), 0);

  const exportCSV = () => {
    const headers = ['Employee ID', 'Name', 'Department', 'Designation', 'Type', 'Base Salary', 'Bonus', 'Tax', 'PF', 'Net Salary'];
    const rows = filtered.map(e => [
      e.employeeId || '', e.name || '', e.department || '', e.designation || '',
      e.type || '', e.baseSalary || 0, e.bonus || 0, e.taxDeduction || 0,
      e.pfDeduction || 0, (e.netSalary || 0).toFixed(2)
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const typeColors = {
    FULL_TIME: 'bg-emerald-100 text-emerald-700',
    PART_TIME: 'bg-amber-100 text-amber-700',
    CONTRACT: 'bg-violet-100 text-violet-700',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Payroll Reports</h1>
          <p className="text-slate-500 mt-1">Comprehensive payroll summary across all employees.</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold shadow-md shadow-emerald-500/20 transition-all active:scale-95"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[
          { label: 'Total Employees', value: filtered.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Total Net Payroll', value: `₹${totalPayroll.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: Banknote, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Total Bonuses', value: `₹${totalBonus.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-violet-500', bg: 'bg-violet-50' },
          { label: 'Total Deductions', value: `₹${totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: BarChart3, color: 'text-red-500', bg: 'bg-red-50' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{c.label}</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{c.value}</p>
            </div>
            <div className={`p-3 rounded-2xl ${c.bg}`}>
              <c.icon className={`w-6 h-6 ${c.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
          <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" /> Employee Payroll Breakdown
          </h2>
          <input
            type="text"
            placeholder="Search by name, dept, ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-4 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 w-64"
          />
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading payroll data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Employee</th>
                  <th className="p-4 font-semibold">Department</th>
                  <th className="p-4 font-semibold">Type</th>
                  <th className="p-4 font-semibold text-right">Base</th>
                  <th className="p-4 font-semibold text-right text-emerald-600">Bonus</th>
                  <th className="p-4 font-semibold text-right text-red-500">Tax</th>
                  <th className="p-4 font-semibold text-right text-amber-500">PF</th>
                  <th className="p-4 font-semibold text-right text-brand-600">Net Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan="8" className="p-8 text-center text-slate-400">No employees found.</td></tr>
                ) : filtered.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-slate-800">{emp.name}</p>
                      <p className="text-xs text-slate-400">{emp.employeeId} · {emp.designation}</p>
                    </td>
                    <td className="p-4 text-slate-600">{emp.department}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase ${typeColors[emp.type] || 'bg-slate-100 text-slate-600'}`}>
                        {emp.type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right text-slate-700 font-medium">
                      {emp.baseSalary != null ? `₹${emp.baseSalary.toFixed(2)}` : '—'}
                    </td>
                    <td className="p-4 text-right text-emerald-600 font-medium">
                      {emp.bonus > 0 ? `+₹${emp.bonus.toFixed(2)}` : '—'}
                    </td>
                    <td className="p-4 text-right text-red-500 font-medium">
                      {emp.taxDeduction > 0 ? `-₹${emp.taxDeduction.toFixed(2)}` : '—'}
                    </td>
                    <td className="p-4 text-right text-amber-600 font-medium">
                      {emp.pfDeduction > 0 ? `-₹${emp.pfDeduction.toFixed(2)}` : '—'}
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-lg font-bold text-brand-700">₹{(emp.netSalary || 0).toFixed(2)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              {filtered.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                    <td className="p-4 text-slate-700" colSpan="3">Total ({filtered.length} employees)</td>
                    <td className="p-4 text-right text-slate-700">—</td>
                    <td className="p-4 text-right text-emerald-600">+₹{totalBonus.toFixed(2)}</td>
                    <td className="p-4 text-right text-red-500">—</td>
                    <td className="p-4 text-right text-amber-600">—</td>
                    <td className="p-4 text-right text-brand-700 text-lg">₹{totalPayroll.toFixed(2)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
