import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft, Send, ShieldCheck, KeyRound, Loader2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const otpRefs = useRef([]);

  useEffect(() => {
    if (step === 2 && otpRefs.current[0]) otpRefs.current[0].focus();
  }, [step]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otpValues];
    for (let i = 0; i < 6; i++) newOtp[i] = pasted[i] || '';
    setOtpValues(newOtp);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otpValues.join('');
    if (otpCode.length !== 6) { setError('Enter the complete 6-digit OTP.'); return; }
    setLoading(true); setError('');
    try {
      await axios.post('/api/auth/verify-reset-otp', { email, otp: otpCode });
      navigate('/reset-password', { state: { email, otp: otpCode, verified: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP.');
      setOtpValues(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  const handleResendOtp = async () => {
    setError(''); setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setOtpValues(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Forgot Password?</h1>
          <p className="text-slate-500">
            {step === 1 ? "Enter your email to receive a reset OTP." : "Enter the 6-digit OTP sent to your email."}
          </p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 mb-6">
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 pl-1">Email Address</label>
                <div className="relative group">
                  <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 outline-none transition-all placeholder:text-slate-400"
                    placeholder="name@company.com" />
                </div>
              </div>
              {error && <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">{error}</div>}
              <button type="submit" disabled={loading}
                className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white rounded-2xl font-bold shadow-lg shadow-brand-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="w-5 h-5" /><span>Send Reset OTP</span></>}
              </button>
            </form>
          )}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl text-sm font-medium text-center">
                <ShieldCheck className="w-5 h-5 inline-block mr-2 -mt-0.5" />OTP sent to <span className="font-bold">{email}</span>
              </div>
              <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                {otpValues.map((val, i) => (
                  <input key={i} ref={(el) => (otpRefs.current[i] = el)} type="text" inputMode="numeric" maxLength={1} value={val}
                    onChange={(e) => handleOtpChange(i, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none bg-slate-50 focus:bg-white" />
                ))}
              </div>
              {error && <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">{error}</div>}
              <button type="submit" disabled={loading}
                className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white rounded-2xl font-bold shadow-lg shadow-brand-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><KeyRound className="w-5 h-5" /><span>Verify OTP</span></>}
              </button>
              <div className="flex justify-between items-center text-sm">
                <button type="button" onClick={() => { setStep(1); setOtpValues(['','','','','','']); setError(''); }}
                  className="text-slate-500 hover:text-brand-600 font-medium transition-colors">← Change email</button>
                <button type="button" onClick={handleResendOtp} disabled={loading}
                  className="text-brand-600 hover:text-brand-700 font-semibold transition-colors disabled:opacity-50">Resend OTP</button>
              </div>
            </form>
          )}
        </div>
        <Link to="/login" className="flex items-center justify-center gap-2 text-slate-500 hover:text-brand-600 font-semibold transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>
      </div>
    </div>
  );
}
