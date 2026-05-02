import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Mail, KeyRound, ArrowRight, ShieldCheck, Lock } from 'lucide-react';

export default function Login() {
  const [loginMode, setLoginMode] = useState('otp'); // 'otp' or 'password'
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter OTP
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState('');

  const { login, sendOtp, verifyOtpLogin } = useAuth();
  const navigate = useNavigate();
  const otpRefs = useRef([]);

  useEffect(() => {
    if (step === 2 && otpRefs.current[0]) {
      otpRefs.current[0].focus();
    }
  }, [step]);

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otpValues];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || '';
    }
    setOtpValues(newOtp);
    const nextEmpty = newOtp.findIndex(v => !v);
    otpRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await sendOtp(email);
      setOtpSentMessage(res.message || 'OTP sent to your email!');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please check your email.');
    }
    setLoading(false);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otpValues.join('');
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await verifyOtpLogin(email, otpCode);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      setOtpValues(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    }
    setLoading(false);
  };

  // Password login
  const handlePasswordLogin = async (e) => {
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

  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      await sendOtp(email);
      setOtpSentMessage('New OTP sent to your email!');
      setOtpValues(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-8 bg-brand-50 border-b border-brand-100 text-center">
          <h2 className="text-3xl font-black text-brand-600 tracking-tighter mb-1">
            Pay<span className="text-slate-800">Matrix</span>
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">Sign in to manage your payroll</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => { setLoginMode('otp'); setStep(1); setError(''); }}
            className={`flex-1 py-3.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              loginMode === 'otp'
                ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            OTP Login
          </button>
          <button
            onClick={() => { setLoginMode('password'); setError(''); }}
            className={`flex-1 py-3.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              loginMode === 'password'
                ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Lock className="w-4 h-4" />
            Password Login
          </button>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {/* ==================== OTP LOGIN MODE ==================== */}
          {loginMode === 'otp' && step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <div className="relative group">
                  <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                  <input
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@company.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-semibold shadow-lg shadow-brand-600/30 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Send OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                  Forgot Password?
                </Link>
              </div>
            </form>
          )}

          {loginMode === 'otp' && step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* Success message */}
              {otpSentMessage && (
                <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl text-sm font-medium text-center">
                  <ShieldCheck className="w-5 h-5 inline-block mr-2 -mt-0.5" />
                  {otpSentMessage}
                </div>
              )}

              <div className="text-center">
                <p className="text-slate-500 text-sm">
                  Enter the 6-digit code sent to <span className="font-semibold text-slate-700">{email}</span>
                </p>
              </div>

              {/* 6-digit OTP boxes */}
              <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                {otpValues.map((val, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={val}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none bg-slate-50 focus:bg-white"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-semibold shadow-lg shadow-brand-600/30 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Verify & Sign In</span>
                  </>
                )}
              </button>

              <div className="flex justify-between items-center text-sm">
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtpValues(['', '', '', '', '', '']); setError(''); setOtpSentMessage(''); }}
                  className="text-slate-500 hover:text-brand-600 font-medium transition-colors"
                >
                  ← Change email
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-brand-600 hover:text-brand-700 font-semibold transition-colors disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* ==================== PASSWORD LOGIN MODE ==================== */}
          {loginMode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-6">
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
                  <Link to="/forgot-password" className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors pl-1">
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
            </form>
          )}

          {/* Footer */}
          <div className="pt-4 mt-6 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-xs">
              Secure automated payroll system © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
