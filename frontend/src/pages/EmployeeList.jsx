import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Edit2, Trash2, FileText, Plus, AlertCircle } from 'lucide-react';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { currentUser } = useAuth();
  
  const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN');

  useEffect(() => {
    fetchEmployees();
  }, [page, search]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`/api/employees`, {
          params: { page, size: 8, search }
      });
      setEmployees(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this employee?')) {
        try {
            await axios.delete(`/api/employees/${id}`);
            fetchEmployees();
        } catch(e) {
            alert('Failed to delete');
        }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Employees Directory</h1>
          <p className="text-sm text-slate-500">Manage your workforce and access payroll details.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all shadow-sm"
            />
          </div>
          {isAdmin && (
            <Link to="/employees/new" className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium shadow-md transition-colors whitespace-nowrap">
              <Plus className="w-5 h-5" />
              <span>Add New</span>
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Department</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.length === 0 ? (
                  <tr>
                      <td colSpan="4" className="p-8 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center gap-2">
                              <AlertCircle className="w-8 h-8 text-slate-300" />
                              <p>No employees found.</p>
                          </div>
                      </td>
                  </tr>
              ) : employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4">
                    <div className="font-semibold text-slate-800">{emp.name}</div>
                    <div className="text-sm text-slate-500">{emp.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                        {emp.department}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 pl-1">{emp.designation}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide
                      ${emp.type === 'FULL_TIME' ? 'bg-emerald-100 text-emerald-800' : 
                        emp.type === 'PART_TIME' ? 'bg-amber-100 text-amber-800' : 
                        'bg-purple-100 text-purple-800'}`}>
                      {emp.type?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`/employees/${emp.id}/salary`} className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Salary Details">
                        <FileText className="w-5 h-5" />
                      </Link>
                      {isAdmin && (
                        <>
                          <Link to={`/employees/edit/${emp.id}`} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Edit">
                            <Edit2 className="w-5 h-5" />
                          </Link>
                          <button onClick={() => handleDelete(emp.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Details */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
           <span>Page {page + 1} of {Math.max(1, totalPages)}</span>
           <div className="flex items-center gap-2">
               <button 
                  disabled={page === 0} 
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors">
                  Previous
               </button>
               <button 
                  disabled={page >= totalPages - 1} 
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors">
                  Next
               </button>
           </div>
        </div>
      </div>
    </div>
  );
}
