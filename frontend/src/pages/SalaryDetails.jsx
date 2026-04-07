import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, CheckCircle2 } from 'lucide-react';

export default function SalaryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetchSalary();
  }, [id]);

  const fetchSalary = async () => {
      try {
          const target = id || 'me';
          const res = await axios.get(`/api/employees/${target}/salary`);
          setData(res.data);
      } catch (err) {
          console.error(err);
      }
  };

  const handleDownloadPdf = async () => {
    try {
      const target = id || 'me';
      const response = await axios.get(`/api/employees/${target}/salary/export-pdf`, {
        responseType: 'blob', // Important
      });
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `salary_slip_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF');
    }
  };

  if (!data) return <div className="p-8 text-slate-500">Loading...</div>;

  const emp = data.employee;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
           <h1 className="text-2xl font-bold text-slate-800">Salary Details</h1>
           <p className="text-slate-500 text-sm">Detailed financial breakdown for {emp.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
             <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{emp.name}</h2>
                        <p className="text-brand-600 font-medium">{emp.designation} • {emp.department}</p>
                    </div>
                    <span className="px-3 py-1 bg-brand-50 text-brand-700 text-sm font-bold uppercase tracking-widest rounded-lg border border-brand-100">
                        {emp.type.replace('_', ' ')}
                    </span>
                 </div>

                 <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Earning & Deductions Breakdown</h3>
                    
                    {emp.type === 'FULL_TIME' && (
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Base Salary</span>
                                <span className="font-semibold">₹{emp.baseSalary?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-emerald-600">
                                <span>Bonus</span>
                                <span className="font-semibold">+ ₹{emp.bonus?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-red-500">
                                <span>Tax Deduction</span>
                                <span className="font-semibold">- ₹{emp.taxDeduction?.toFixed(2)}</span>
                            </div>
                             <div className="flex justify-between text-amber-500">
                                <span>PF Deduction</span>
                                <span className="font-semibold">- ₹{emp.pfDeduction?.toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    {emp.type === 'PART_TIME' && (
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Hourly Rate</span>
                                <span className="font-semibold">₹{emp.hourlyRate?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Hours Worked</span>
                                <span className="font-semibold">{emp.hoursWorked} hrs</span>
                            </div>
                        </div>
                    )}

                    {emp.type === 'CONTRACT' && (
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Contract Amount</span>
                                <span className="font-semibold">₹{emp.contractAmount?.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                 </div>
             </div>
          </div>

          <div>
             <div className="bg-gradient-to-b from-brand-800 to-brand-950 rounded-3xl p-6 shadow-xl border border-brand-700 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <CheckCircle2 className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                    <p className="text-brand-300 font-medium mb-1">Net Payable Amount</p>
                    <h2 className="text-4xl font-black mb-6 tracking-tight">₹{data.netSalary?.toFixed(2)}</h2>
                    
                    <button onClick={handleDownloadPdf} className="w-full p-4 bg-white hover:bg-slate-50 text-brand-900 rounded-2xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-white/10">
                        <Download className="w-5 h-5" />
                        Download Payslip PDF
                    </button>
                    <p className="text-xs text-center text-brand-400 mt-4 leading-relaxed">Generated electronically via OpenPDF securely.</p>
                </div>
             </div>
          </div>
      </div>
    </div>
  );
}
