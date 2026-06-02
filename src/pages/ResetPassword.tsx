import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [showCfm, setShowCfm]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const [focused, setFocused]     = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link. Please request a new one.');
    }
  }, [token]);

  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8)  s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password });
      setDone(true);
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (name: string): React.CSSProperties => ({
    width: '100%', boxSizing: 'border-box',
    padding: '13px 44px 13px 44px',
    background: focused === name ? '#fff' : '#f8f9fc',
    border: `1.5px solid ${focused === name ? '#6c63ff' : '#e5e7eb'}`,
    borderRadius: 12, fontSize: 14, color: '#111827', outline: 'none',
    boxShadow: focused === name ? '0 0 0 4px rgba(108,99,255,.1)' : 'none',
    transition: 'all .2s',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui,-apple-system,sans-serif', background: '#f0f2f8', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(245,158,11,.35)' }}>
            <ShoppingBag size={20} color="#fff" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#0f1117' }}>PriceZap</span>
        </div>

        <div style={{ background: '#fff', borderRadius: 24, padding: '36px 32px', boxShadow: '0 4px 24px rgba(0,0,0,.08)', border: '1px solid #eef0f6' }}>

          {!token ? (
            /* Invalid link */
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <AlertCircle size={30} color="#ef4444" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f1117', margin: '0 0 10px' }}>Invalid reset link</h2>
              <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px', lineHeight: 1.6 }}>
                This link is invalid or has already been used.<br />Please request a new password reset.
              </p>
              <Link to="/forgot-password"
                style={{ display: 'block', padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14, textAlign: 'center' }}>
                Request New Link
              </Link>
            </div>
          ) : done ? (
            /* Success */
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 16px rgba(16,185,129,.2)' }}>
                <CheckCircle size={30} color="#10b981" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f1117', margin: '0 0 10px' }}>Password reset!</h2>
              <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 28px', lineHeight: 1.6 }}>
                Your password has been updated successfully.<br />You can now log in with your new password.
              </p>
              <button onClick={() => navigate('/login')}
                style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(108,99,255,.35)' }}>
                Go to Login
              </button>
            </div>
          ) : (
            /* Form */
            <>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f1117', margin: '0 0 8px', letterSpacing: '-.5px' }}>Set new password</h2>
                <p style={{ fontSize: 14.5, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>Choose a strong password for your account.</p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* New password */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color={focused === 'pwd' ? '#6c63ff' : '#9ca3af'} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onFocus={() => setFocused('pwd')}
                      onBlur={() => setFocused(null)}
                      required
                      placeholder="At least 8 characters"
                      style={inputStyle('pwd')}
                    />
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}>
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {password && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {[1,2,3,4].map(i => (
                          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= strength ? strengthColor : '#f3f4f6', transition: 'background .2s' }} />
                        ))}
                      </div>
                      <p style={{ fontSize: 11.5, color: strengthColor, margin: '4px 0 0', fontWeight: 600 }}>{strengthLabel}</p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} color={focused === 'cfm' ? '#6c63ff' : '#9ca3af'} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type={showCfm ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      onFocus={() => setFocused('cfm')}
                      onBlur={() => setFocused(null)}
                      required
                      placeholder="Repeat new password"
                      style={{ ...inputStyle('cfm'), borderColor: confirm && confirm !== password ? '#ef4444' : focused === 'cfm' ? '#6c63ff' : '#e5e7eb' }}
                    />
                    <button type="button" onClick={() => setShowCfm(v => !v)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}>
                      {showCfm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirm && confirm !== password && (
                    <p style={{ fontSize: 12, color: '#ef4444', margin: '5px 0 0' }}>Passwords do not match</p>
                  )}
                </div>

                <button type="submit" disabled={loading || !password || !confirm}
                  style={{
                    padding: '13px', borderRadius: 12, border: 'none', marginTop: 4,
                    background: loading || !password || !confirm ? '#e5e7eb' : 'linear-gradient(135deg,#6c63ff,#a78bfa)',
                    color: loading || !password || !confirm ? '#9ca3af' : '#fff',
                    fontSize: 15, fontWeight: 700,
                    cursor: loading || !password || !confirm ? 'not-allowed' : 'pointer',
                    boxShadow: !loading && password && confirm ? '0 4px 16px rgba(108,99,255,.35)' : 'none',
                  }}>
                  {loading ? 'Resetting…' : 'Reset Password'}
                </button>
              </form>

              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <Link to="/login" style={{ fontSize: 13.5, color: '#9ca3af', textDecoration: 'none' }}>
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
