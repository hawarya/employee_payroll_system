import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';

export default function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    employeeId: '', name: '', email: '', department: '', designation: '', type: 'FULL_TIME',
    baseSalary: '', bonus: '', taxDeduction: '', pfDeduction: '',
    hourlyRate: '', hoursWorked: '', contractAmount: ''
  });

  useEffect(() => {
    if (isEdit) {
      axios.get(`/api/employees/${id}`)
        .then(res => {
            const data = res.data;
            // Clean nulls to empty string
            for(let key in data) {
                if(data[key] === null) data[key] = '';
            }
            setFormData(data);
        })
        .catch(err => console.error(err));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axios.put(`/api/employees/${id}`, formData);
      } else {
        await axios.post(`/api/employees`, formData);
      }
      navigate('/employees');
    } catch (err) {
      alert('Error saving employee data');
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
           <h1 className="text-2xl font-bold text-slate-800">{isEdit ? 'Edit Employee' : 'Add New Employee'}</h1>
           <p className="text-slate-500 text-sm">Fill in the personal and financial details securely.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        
        <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Profile Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Employee ID</label>
            <input type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 focus:bg-white outline-none transition-all" placeholder="e.g. EMP001" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 focus:bg-white outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 focus:bg-white outline-none transition-all" />
          </div>
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
             <input type="text" name="department" value={formData.department} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 focus:bg-white outline-none transition-all" />
          </div>
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">Designation</label>
             <input type="text" name="designation" value={formData.designation} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 focus:bg-white outline-none transition-all" />
          </div>
        </div>

        <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Payroll Information</h2>
        
        <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Employment Type</label>
            <select name="type" value={formData.type} onChange={handleChange} className="w-full md:w-1/2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 focus:bg-white outline-none transition-all">
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
            </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {formData.type === 'FULL_TIME' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Base Salary (₹)</label>
                  <input type="number" name="baseSalary" value={formData.baseSalary} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Bonus (₹)</label>
                  <input type="number" name="bonus" value={formData.bonus} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tax Deduction (₹)</label>
                  <input type="number" name="taxDeduction" value={formData.taxDeduction} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">PF Deduction (₹)</label>
                  <input type="number" name="pfDeduction" value={formData.pfDeduction} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </>
            )}

            {formData.type === 'PART_TIME' && (
                <>
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Hourly Rate (₹)</label>
                  <input type="number" name="hourlyRate" value={formData.hourlyRate} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Hours Worked</label>
                  <input type="number" name="hoursWorked" value={formData.hoursWorked} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                </>
            )}

             {formData.type === 'CONTRACT' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Contract Amount (₹)</label>
                  <input type="number" name="contractAmount" value={formData.contractAmount} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
            )}
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
            <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white rounded-xl font-semibold shadow-lg shadow-brand-600/20 transition-all">
                <Save className="w-5 h-5" />
                {isEdit ? 'Update Employee' : 'Save Employee'}
            </button>
        </div>
      </form>
    </div>
  );
}
