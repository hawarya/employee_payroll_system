import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const token = query.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing password reset token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post(`/api/auth/reset-password?token=${token}&newPassword=${newPassword}`);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl border border-slate-100">
          <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Password Reset Successful</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Your password has been successfully updated. You can now log in with your new password.
          </p>
          <Link to="/login" className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold shadow-lg shadow-brand-600/20 transition-all flex items-center justify-center gap-2">
            <span>Log In Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Set New Password</h1>
          <p className="text-slate-500">Pick a strong password that's easy to remember but hard to guess.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 pl-1">New Password</label>
              <div className="relative group">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                  placeholder="At least 6 characters"
                  minLength={6}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 pl-1">Confirm New Password</label>
              <div className="relative group">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 outline-none transition-all placeholder:text-slate-400 font-medium"
                  placeholder="Repeat your password"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium flex gap-3 animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="w-5 h-5 rotate-180" /> {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading || !token}
              className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white rounded-2xl font-bold shadow-lg shadow-brand-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Reset Password</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
