import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

          {sent ? (
            /* Success state */
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 16px rgba(16,185,129,.2)' }}>
                <CheckCircle size={30} color="#10b981" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f1117', margin: '0 0 10px' }}>Check your email</h2>
              <p style={{ fontSize: 14.5, color: '#6b7280', lineHeight: 1.7, margin: '0 0 8px' }}>
                We've sent a password reset link to
              </p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#0f1117', margin: '0 0 24px' }}>{email}</p>
              <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 28px', lineHeight: 1.6 }}>
                The link expires in <strong>30 minutes</strong>.<br />
                Check your spam folder if you don't see it.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                style={{ width: '100%', padding: '13px', borderRadius: 12, border: '1.5px solid #eef0f6', background: '#f9fafb', color: '#6b7280', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 14 }}>
                Try a different email
              </button>
              <Link to="/login" style={{ display: 'block', textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#6c63ff', textDecoration: 'none' }}>
                Back to login
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0f1117', margin: '0 0 8px', letterSpacing: '-.5px' }}>Forgot password?</h2>
                <p style={{ fontSize: 14.5, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
                  No worries. Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>Email address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color={focused ? '#6c63ff' : '#9ca3af'} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', transition: 'color .2s' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      required
                      placeholder="you@example.com"
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: '13px 16px 13px 44px',
                        background: focused ? '#fff' : '#f8f9fc',
                        border: `1.5px solid ${focused ? '#6c63ff' : '#e5e7eb'}`,
                        borderRadius: 12, fontSize: 14, color: '#111827', outline: 'none',
                        boxShadow: focused ? '0 0 0 4px rgba(108,99,255,.1)' : 'none',
                        transition: 'all .2s',
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '13px', borderRadius: 12, border: 'none',
                    background: loading || !email.trim() ? '#e5e7eb' : 'linear-gradient(135deg,#6c63ff,#a78bfa)',
                    color: loading || !email.trim() ? '#9ca3af' : '#fff',
                    fontSize: 15, fontWeight: 700,
                    cursor: loading || !email.trim() ? 'not-allowed' : 'pointer',
                    boxShadow: !loading && email.trim() ? '0 4px 16px rgba(108,99,255,.35)' : 'none',
                    transition: 'all .2s',
                  }}>
                  <Send size={16} />
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>

              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Link to="/login"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: '#6c63ff', textDecoration: 'none' }}>
                  <ArrowLeft size={15} /> Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
