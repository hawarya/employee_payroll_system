import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`/api/auth/forgot-password?email=${email}`);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please check the email.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-xl border border-slate-100 text-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Check Your Email</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            We've sent a password reset link to <span className="font-semibold text-slate-700">{email}</span>. 
            Please check your inbox and follow the instructions.
          </p>
          <Link to="/login" className="inline-flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
           <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Forgot Password?</h1>
           <p className="text-slate-500">No worries, it happens. Enter your email below to receive a reset link.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 pl-1">Email Address</label>
              <div className="relative group">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 outline-none transition-all placeholder:text-slate-400"
                  placeholder="name@company.com"
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
              disabled={loading}
              className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white rounded-2xl font-bold shadow-lg shadow-brand-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>
        </div>

        <Link to="/login" className="flex items-center justify-center gap-2 text-slate-500 hover:text-brand-600 font-semibold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
      </div>
    </div>
  );
}
