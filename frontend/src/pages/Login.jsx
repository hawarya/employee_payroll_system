import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Receipt, Loader2 } from 'lucide-react';

export default function Login() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(employeeId, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 bg-brand-50 border-b border-brand-100 text-center">
            <h2 className="text-3xl font-black text-brand-600 tracking-tighter mb-1">Pay<span className="text-slate-800">Matrix</span></h2>
            <p className="text-slate-500 text-sm mt-2 font-medium">Sign in to manage your payroll</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {error && <div className="p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-medium">{error}</div>}
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Employee / Admin ID</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g. EMP001 or admin1"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <div className="flex justify-end mt-2">
              <Link to="/forgot-password" size="sm" className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors pl-1">
                Forgot Password?
              </Link>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-semibold shadow-lg shadow-brand-600/30 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
          </button>

          <div className="pt-4 mt-6 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-xs">
              Secure automated payroll system © {new Date().getFullYear()}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
