import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, Mail, KeyRound, ArrowRight, ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [loginMode, setLoginMode] = useState('otp');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState(1);
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

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
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
    for (let i = 0; i < 6; i++) newOtp[i] = pasted[i] || '';
    setOtpValues(newOtp);
    const nextEmpty = newOtp.findIndex(v => !v);
    otpRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await sendOtp(email);
      setOtpSentMessage(res.message || 'OTP sent to your email!');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please check your email.');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpCode = otpValues.join('');
    if (otpCode.length !== 6) { setError('Please enter the complete 6-digit OTP.'); return; }
    setError(''); setLoading(true);
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

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(employeeId, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    setError(''); setLoading(true);
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #0f0f2e 30%, #1a0a2e 60%, #0a0f1a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Ambient glow blobs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-5%', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-5%', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '40%', right: '20%', width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* Glassmorphism card */}
      <div style={{
        width: '100%', maxWidth: '440px',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 10,
      }}>

        {/* Header */}
        <div style={{
          padding: '2.5rem 2.5rem 2rem',
          textAlign: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'linear-gradient(180deg, rgba(99,102,241,0.1) 0%, transparent 100%)',
        }}>
          {/* Logo icon */}
          <div style={{
            width: '56px', height: '56px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
          }}>
            <ShieldCheck style={{ width: '28px', height: '28px', color: '#fff' }} />
          </div>
          <h1 style={{
            fontSize: '2rem', fontWeight: '900',
            background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.04em', margin: '0 0 0.5rem',
          }}>
            Pay<span style={{
              background: 'linear-gradient(135deg, #f0abfc, #c084fc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Matrix</span>
          </h1>
          <p style={{ color: 'rgba(203,213,225,0.7)', fontSize: '0.875rem', margin: 0, fontWeight: '400' }}>
            Secure employee payroll management
          </p>
        </div>

        {/* Mode Toggle */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(0,0,0,0.2)',
        }}>
          {[
            { mode: 'otp', icon: ShieldCheck, label: 'OTP Login' },
            { mode: 'password', icon: Lock, label: 'Password' },
          ].map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => { setLoginMode(mode); setStep(1); setError(''); }}
              style={{
                flex: 1, padding: '0.875rem', border: 'none', cursor: 'pointer',
                background: loginMode === mode
                  ? 'linear-gradient(180deg, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.05) 100%)'
                  : 'transparent',
                color: loginMode === mode ? '#a5b4fc' : 'rgba(148,163,184,0.6)',
                fontSize: '0.8125rem', fontWeight: '600',
                borderBottom: loginMode === mode ? '2px solid #6366f1' : '2px solid transparent',
                transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              <Icon style={{ width: '15px', height: '15px' }} />
              {label}
            </button>
          ))}
        </div>

        {/* Form Area */}
        <div style={{ padding: '2rem 2.5rem 2.5rem' }}>

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: '1.25rem', padding: '0.875rem 1rem',
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '12px', color: '#fca5a5', fontSize: '0.8125rem', fontWeight: '500',
            }}>
              {error}
            </div>
          )}

          {/* ── OTP Step 1 ── */}
          {loginMode === 'otp' && step === 1 && (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{
                    position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                    width: '18px', height: '18px', color: 'rgba(148,163,184,0.6)',
                  }} />
                  <input
                    type="email" required
                    value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your.email@company.com"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      paddingLeft: '3rem', paddingRight: '1rem', paddingTop: '0.875rem', paddingBottom: '0.875rem',
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '12px', color: '#f1f5f9', fontSize: '0.9375rem', outline: 'none',
                      transition: 'all 0.2s',
                    }}
                    onFocus={e => { e.target.style.border = '1px solid rgba(99,102,241,0.6)'; e.target.style.background = 'rgba(99,102,241,0.08)'; }}
                    onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.12)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                  />
                </div>
              </div>
              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '0.9375rem',
                  background: loading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none', borderRadius: '12px', color: '#fff',
                  fontSize: '0.9375rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.4)',
                  transition: 'all 0.2s',
                }}
              >
                {loading ? <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} /> : (
                  <><span>Send OTP</span><ArrowRight style={{ width: '18px', height: '18px' }} /></>
                )}
              </button>
              <div style={{ textAlign: 'right' }}>
                <Link to="/forgot-password" style={{ color: '#a5b4fc', fontSize: '0.8125rem', fontWeight: '600', textDecoration: 'none' }}>
                  Forgot Password?
                </Link>
              </div>
            </form>
          )}

          {/* ── OTP Step 2 ── */}
          {loginMode === 'otp' && step === 2 && (
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {otpSentMessage && (
                <div style={{
                  padding: '0.875rem 1rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: '12px', color: '#6ee7b7', fontSize: '0.8125rem', fontWeight: '500',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                  <ShieldCheck style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                  {otpSentMessage}
                </div>
              )}
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'rgba(148,163,184,0.8)', fontSize: '0.875rem', margin: 0 }}>
                  Enter the 6-digit code sent to{' '}
                  <span style={{ color: '#e2e8f0', fontWeight: '600' }}>{email}</span>
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.625rem' }} onPaste={handleOtpPaste}>
                {otpValues.map((val, i) => (
                  <input
                    key={i} ref={el => (otpRefs.current[i] = el)}
                    type="text" inputMode="numeric" maxLength={1} value={val}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    style={{
                      width: '48px', height: '56px', textAlign: 'center',
                      fontSize: '1.25rem', fontWeight: '700', color: '#f1f5f9',
                      background: val ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.06)',
                      border: val ? '2px solid rgba(99,102,241,0.6)' : '2px solid rgba(255,255,255,0.12)',
                      borderRadius: '12px', outline: 'none', transition: 'all 0.15s',
                    }}
                    onFocus={e => { e.target.style.border = '2px solid rgba(99,102,241,0.8)'; e.target.style.background = 'rgba(99,102,241,0.1)'; }}
                    onBlur={e => { e.target.style.border = val ? '2px solid rgba(99,102,241,0.6)' : '2px solid rgba(255,255,255,0.12)'; e.target.style.background = val ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.06)'; }}
                  />
                ))}
              </div>
              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '0.9375rem',
                  background: loading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none', borderRadius: '12px', color: '#fff',
                  fontSize: '0.9375rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.4)',
                }}
              >
                {loading ? <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} /> : (
                  <><KeyRound style={{ width: '18px', height: '18px' }} /><span>Verify & Sign In</span></>
                )}
              </button>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtpValues(['','','','','','']); setError(''); setOtpSentMessage(''); }}
                  style={{ background: 'none', border: 'none', color: 'rgba(148,163,184,0.7)', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: '500', padding: 0 }}
                >
                  ← Change email
                </button>
                <button
                  type="button" onClick={handleResendOtp} disabled={loading}
                  style={{ background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: '600', padding: 0 }}
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* ── Password Login ── */}
          {loginMode === 'password' && (
            <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Employee / Admin ID
                </label>
                <input
                  type="text" required
                  value={employeeId} onChange={e => setEmployeeId(e.target.value)}
                  placeholder="e.g. EMP001 or admin1"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '0.875rem 1rem',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '12px', color: '#f1f5f9', fontSize: '0.9375rem', outline: 'none',
                  }}
                  onFocus={e => { e.target.style.border = '1px solid rgba(99,102,241,0.6)'; e.target.style.background = 'rgba(99,102,241,0.08)'; }}
                  onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.12)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'} required
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      padding: '0.875rem 3rem 0.875rem 1rem',
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '12px', color: '#f1f5f9', fontSize: '0.9375rem', outline: 'none',
                    }}
                    onFocus={e => { e.target.style.border = '1px solid rgba(99,102,241,0.6)'; e.target.style.background = 'rgba(99,102,241,0.08)'; }}
                    onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.12)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                  />
                  <button
                    type="button" onClick={() => setShowPassword(s => !s)}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(148,163,184,0.6)' }}
                  >
                    {showPassword ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                  </button>
                </div>
                <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                  <Link to="/forgot-password" style={{ color: '#a5b4fc', fontSize: '0.8125rem', fontWeight: '600', textDecoration: 'none' }}>
                    Forgot Password?
                  </Link>
                </div>
              </div>
              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '0.9375rem',
                  background: loading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none', borderRadius: '12px', color: '#fff',
                  fontSize: '0.9375rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.4)',
                }}
              >
                {loading ? <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} /> : 'Sign In'}
              </button>
            </form>
          )}

          {/* Footer */}
          <div style={{
            marginTop: '1.75rem', paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            textAlign: 'center',
          }}>
            <p style={{ color: 'rgba(100,116,139,0.7)', fontSize: '0.75rem', margin: 0 }}>
              Secure automated payroll system © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(148,163,184,0.4) !important; }
      `}</style>
    </div>
  );
}
