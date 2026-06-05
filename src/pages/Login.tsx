import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Mail, Lock, ArrowRight, TrendingDown, Bell, BarChart2, Shield } from 'lucide-react';
import { login } from '../api/auth';
import { useAuthStore } from '../store/auth';
import { useBreakpoint } from '../hooks/useBreakpoint';
import toast from 'react-hot-toast';

const features = [
  { icon: TrendingDown, label: 'Real-time price tracking', desc: 'Monitor Amazon prices 24/7 automatically' },
  { icon: Bell,         label: 'Instant price alerts',    desc: 'Get notified the moment prices drop'      },
  { icon: BarChart2,    label: 'Price history charts',    desc: 'Visualise trends over days and months'    },
  { icon: Shield,       label: 'Never miss a deal',       desc: 'Track unlimited products for free'        },
];

export default function Login() {
  const navigate = useNavigate();
  const setAuth  = useAuthStore((s) => s.setAuth);
  const { isMobile } = useBreakpoint();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (name: string): React.CSSProperties => ({
    width: '100%', boxSizing: 'border-box',
    padding: '14px 16px 14px 46px',
    background: focused === name ? '#fff' : '#f8f9fc',
    border: `1.5px solid ${focused === name ? '#6c63ff' : '#e5e7eb'}`,
    borderRadius: 14, fontSize: 14, color: '#111827', outline: 'none',
    transition: 'all .2s',
    boxShadow: focused === name ? '0 0 0 4px rgba(108,99,255,.1)' : 'none',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── Left panel (hidden on mobile) ── */}
      {!isMobile && <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 64px',
        background: 'linear-gradient(145deg, #0f1117 0%, #13152e 45%, #1a1d3a 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -80, left: -80, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,.22) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '45%', right: 40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 56, position: 'relative' }}>
          <div style={{
            width: 50, height: 50, borderRadius: 15, flexShrink: 0,
            background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(245,158,11,.4)',
          }}>
            <ShoppingBag size={22} color="#fff" />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 22, lineHeight: 1 }}>PriceTracker</div>
            <div style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>Amazon Price Intelligence</div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ position: 'relative', marginBottom: 48 }}>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.15, letterSpacing: '-1px' }}>
            Never overpay<br />
            <span style={{ background: 'linear-gradient(90deg,#a78bfa,#6c63ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              on Amazon again.
            </span>
          </h1>
          <p style={{ color: '#6b7280', fontSize: 15.5, marginTop: 16, lineHeight: 1.7, maxWidth: 380 }}>
            Track prices, set alerts, and buy at exactly the right moment.
          </p>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, position: 'relative' }}>
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 13, flexShrink: 0,
                background: 'rgba(108,99,255,.18)', border: '1px solid rgba(108,99,255,.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={18} color="#a78bfa" strokeWidth={1.8} />
              </div>
              <div>
                <p style={{ color: '#e5e7eb', fontWeight: 700, fontSize: 14, margin: 0 }}>{label}</p>
                <p style={{ color: '#6b7280', fontSize: 12.5, margin: '3px 0 0', lineHeight: 1.5 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom trust badge */}
        <div style={{ marginTop: 56, display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          <div style={{ display: 'flex' }}>
            {['#6c63ff','#a78bfa','#818cf8'].map((c, i) => (
              <div key={i} style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: '2px solid #13152e', marginLeft: i > 0 ? -8 : 0 }} />
            ))}
          </div>
          <p style={{ color: '#6b7280', fontSize: 12.5, margin: 0 }}>
            Join <span style={{ color: '#a78bfa', fontWeight: 700 }}>2,400+</span> smart shoppers saving every day
          </p>
        </div>
      </div>}

      {/* ── Right panel ── */}
      <div style={{
        width: isMobile ? '100%' : 480, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f8f9fc', padding: isMobile ? '48px 24px' : '48px 52px',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>

          {/* Heading */}
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f1117', margin: 0, letterSpacing: '-.5px' }}>Welcome back</h2>
            <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 8 }}>Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color={focused === 'email' ? '#6c63ff' : '#9ca3af'}
                  style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', transition: 'color .2s', pointerEvents: 'none' }} />
                <input
                  type="email" required value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="you@example.com"
                  style={inputStyle('email')}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: 12, color: '#6c63ff', textDecoration: 'none', fontWeight: 600 }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color={focused === 'password' ? '#6c63ff' : '#9ca3af'}
                  style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', transition: 'color .2s', pointerEvents: 'none' }} />
                <input
                  type="password" required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••"
                  style={inputStyle('password')}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              style={{
                marginTop: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '15px 0', borderRadius: 14, border: 'none',
                background: loading ? '#e5e7eb' : 'linear-gradient(135deg,#6c63ff,#a78bfa)',
                color: loading ? '#9ca3af' : '#fff',
                fontSize: 15, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 6px 20px rgba(108,99,255,.4)',
                transition: 'all .2s',
                width: '100%',
              }}>
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2.5px solid #d1d5db', borderTopColor: '#9ca3af', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                  Signing in…
                </>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>New to PriceTracker?</span>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          </div>

          {/* Register link */}
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%', padding: '14px 0', borderRadius: 14,
              border: '1.5px solid #e5e7eb', background: '#fff',
              color: '#374151', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              transition: 'all .2s', boxShadow: '0 1px 4px rgba(0,0,0,.05)',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#6c63ff'; (e.currentTarget as HTMLButtonElement).style.color = '#6c63ff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLButtonElement).style.color = '#374151'; }}>
              Create a free account
            </button>
          </Link>

        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
