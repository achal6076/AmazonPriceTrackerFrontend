import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Mail, Lock, ArrowRight,
  TrendingDown, Bell, BarChart2, Tag,
  Eye, EyeOff, CheckCircle, Shield, Clock,
} from 'lucide-react';
import { register } from '../api/auth';
import { useAuthStore } from '../store/auth';
import { useBreakpoint } from '../hooks/useBreakpoint';
import toast from 'react-hot-toast';

const features = [
  { icon: TrendingDown, label: 'Real-time price tracking', desc: 'Monitor Amazon prices 24/7 automatically' },
  { icon: Bell,         label: 'Instant price alerts',    desc: 'Get notified the moment prices drop'      },
  { icon: BarChart2,    label: 'Price history charts',    desc: 'Visualize trends over days and months'    },
  { icon: Tag,          label: 'Never miss a deal',       desc: 'Track unlimited products for free'        },
];

const DOTS: [number, number][] = [
  [8,12],[20,35],[5,58],[15,78],[30,92],[45,8],[60,25],[75,60],[90,40],[50,72],
  [35,50],[80,85],[25,18],[65,95],[92,15],[40,68],[12,45],[70,30],[55,88],[82,55],
];

export default function Register() {
  const navigate  = useNavigate();
  const setAuth   = useAuthStore((s) => s.setAuth);
  const { isMobile } = useBreakpoint();
  const [form, setForm]         = useState({ email: '', password: '' });
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register(form.email, form.password);
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (name: string): React.CSSProperties => ({
    width: '100%', boxSizing: 'border-box',
    padding: '13px 40px 13px 44px',
    background: focused === name ? '#fff' : '#f8f9fc',
    border: `1.5px solid ${
      focused === name ? '#6c63ff'
      : (name === 'email' && emailValid) ? '#10b981'
      : '#eaecf0'
    }`,
    borderRadius: 12, fontSize: 15, color: '#111827', outline: 'none',
    transition: 'all .2s',
    boxShadow: focused === name ? '0 0 0 4px rgba(108,99,255,.1)' : 'none',
  });

  /* ─────────────────────────────────────────────────────────
     MOBILE LAYOUT
  ───────────────────────────────────────────────────────── */
  if (isMobile) {
    return (
      <div style={{
        minHeight: '100vh', background: '#fff',
        fontFamily: 'system-ui,-apple-system,sans-serif',
        display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
      }}>

        {/* Subtle aurora glow at top */}
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 420, height: 280, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(108,99,255,.12) 0%,transparent 70%)', pointerEvents: 'none' }} />
        {/* Second softer glow — right side */}
        <div style={{ position: 'absolute', top: 60, right: -80, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(ellipse,rgba(245,158,11,.08) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '52px 24px 32px', position: 'relative' }}>

          {/* Logo + brand */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 18, marginBottom: 12,
              background: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 28px rgba(245,158,11,.38)',
            }}>
              <ShoppingBag size={27} color="#fff" />
            </div>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', margin: 0, letterSpacing: '.5px' }}>
              AMAZON PRICE TRACKER
            </p>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f1117', margin: '0 0 6px', letterSpacing: '-.4px' }}>
              Create your account
            </h1>
            <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>Free forever · No credit card required</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16}
                  color={emailValid ? '#10b981' : focused === 'email' ? '#6c63ff' : '#c4c9d4'}
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="email" required value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                  placeholder="you@example.com"
                  style={inputStyle('email')}
                />
                {emailValid && (
                  <CheckCircle size={16} color="#10b981"
                    style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color={focused === 'password' ? '#6c63ff' : '#c4c9d4'}
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type={showPass ? 'text' : 'password'} required minLength={8} value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  placeholder="Min. 8 characters"
                  style={inputStyle('password')}
                />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{
                  position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  display: 'flex', alignItems: 'center', color: '#c4c9d4',
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p style={{ fontSize: 11.5, color: '#c4c9d4', margin: '5px 0 0' }}>At least 8 characters</p>
            </div>

            {/* Create account button */}
            <button type="submit" disabled={loading} style={{
              marginTop: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '15px 0', borderRadius: 14, border: 'none',
              background: loading ? '#e5e7eb' : 'linear-gradient(135deg,#6c63ff,#8b5cf6)',
              color: loading ? '#9ca3af' : '#fff',
              fontSize: 16, fontWeight: 700, letterSpacing: '.2px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(108,99,255,.4)',
              transition: 'all .2s', width: '100%',
            }}>
              {loading ? (
                <>
                  <div style={{ width: 18, height: 18, border: '2.5px solid #d1d5db', borderTopColor: '#9ca3af', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                  Creating account…
                </>
              ) : (
                <>Create Free Account <ArrowRight size={17} /></>
              )}
            </button>

            <p style={{ fontSize: 11.5, color: '#c4c9d4', textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
              By signing up you agree to our{' '}
              <a href="#" style={{ color: '#6c63ff', textDecoration: 'none' }}>Terms</a>
              {' '}&amp;{' '}
              <a href="#" style={{ color: '#6c63ff', textDecoration: 'none' }}>Privacy Policy</a>
            </p>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#f0f0f4' }} />
            <span style={{ fontSize: 12, color: '#d1d5db', fontWeight: 500, whiteSpace: 'nowrap' }}>Already have an account?</span>
            <div style={{ flex: 1, height: 1, background: '#f0f0f4' }} />
          </div>

          {/* Sign in link */}
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <div style={{
              width: '100%', padding: '14px 0', borderRadius: 14, boxSizing: 'border-box',
              border: '1.5px solid #eaecf0', background: '#fafbff',
              color: '#374151', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              Sign in instead
            </div>
          </Link>

          {/* Trust row */}
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 22, padding: '16px 0', borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6' }}>
            {[
              { icon: Shield, label: 'Free forever' },
              { icon: Lock,   label: 'Secure & private' },
              { icon: Clock,  label: 'Cancel anytime' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={14} color="#6c63ff" strokeWidth={2} />
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: '#6b7280', textAlign: 'center', lineHeight: 1.3, maxWidth: 68 }}>{label}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '12px 0 20px' }}>
          <p style={{ fontSize: 11.5, color: '#d1d5db', margin: 0 }}>© 2024 PriceTracker. All rights reserved.</p>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────
     DESKTOP LAYOUT
  ───────────────────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* ── Left panel ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '40px 48px',
        background: 'linear-gradient(160deg,#09091f 0%,#0f1035 45%,#161952 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {DOTS.map(([l, t], i) => (
          <div key={i} style={{ position: 'absolute', borderRadius: '50%', pointerEvents: 'none', width: i % 4 === 0 ? 3 : 2, height: i % 4 === 0 ? 3 : 2, background: 'rgba(255,255,255,.12)', left: `${l}%`, top: `${t}%` }} />
        ))}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: 'linear-gradient(135deg,#f59e0b,#fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 18px rgba(245,158,11,.45)' }}>
            <ShoppingBag size={20} color="#fff" />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 17, lineHeight: 1 }}>PriceTracker</div>
            <div style={{ color: '#5d6384', fontSize: 11, marginTop: 3 }}>Amazon Price Intelligence</div>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 0', position: 'relative' }}>
          <h1 style={{ fontSize: 44, fontWeight: 900, color: '#fff', margin: '0 0 14px', lineHeight: 1.1, letterSpacing: '-1.5px' }}>
            Start saving<br />
            <span style={{ background: 'linear-gradient(90deg,#818cf8,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>money today.</span>
          </h1>
          <p style={{ color: '#7b82a8', fontSize: 15, lineHeight: 1.7, margin: '0 0 36px', maxWidth: 320 }}>Create your free account and start tracking Amazon prices in under 60 seconds.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, flexShrink: 0, background: 'rgba(99,93,255,.18)', border: '1px solid rgba(130,120,255,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={18} color="#a78bfa" strokeWidth={1.8} />
                </div>
                <div>
                  <p style={{ color: '#e2e4f0', fontWeight: 700, fontSize: 14, margin: 0 }}>{label}</p>
                  <p style={{ color: '#5d6384', fontSize: 12.5, margin: '2px 0 0', lineHeight: 1.5 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
          <div style={{ display: 'flex' }}>
            {[{bg:'#e74c3c',l:'A'},{bg:'#e67e22',l:'M'},{bg:'#9b59b6',l:'R'},{bg:'#3498db',l:'S'}].map(({ bg, l }, i) => (
              <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: bg, border: '2.5px solid #0f1035', marginLeft: i > 0 ? -10 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>{l}</div>
            ))}
          </div>
          <div>
            <div style={{ display: 'flex', gap: 1, marginBottom: 3 }}>
              {[...Array(5)].map((_, i) => <span key={i} style={{ color: '#f59e0b', fontSize: 14 }}>★</span>)}
            </div>
            <p style={{ color: '#5d6384', fontSize: 12, margin: 0 }}>Join <span style={{ color: '#a78bfa', fontWeight: 700 }}>2,400+</span> smart shoppers saving every day</p>
          </div>
        </div>
      </div>

      {/* ── Right / Form panel ── */}
      <div style={{ width: 500, flexShrink: 0, display: 'flex', flexDirection: 'column', background: '#fff' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 60px' }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 32, fontWeight: 900, color: '#0f1117', margin: 0, letterSpacing: '-.5px' }}>Create account</h2>
            <p style={{ fontSize: 14, color: '#9ca3af', margin: '8px 0 0' }}>It's free — no credit card required</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color={emailValid ? '#10b981' : focused === 'email' ? '#6c63ff' : '#9ca3af'} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} placeholder="you@example.com" style={inputStyle('email')} />
                {emailValid && <CheckCircle size={16} color="#10b981" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color={focused === 'password' ? '#6c63ff' : '#9ca3af'} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input type={showPass ? 'text' : 'password'} required minLength={8} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} placeholder="Min. 8 characters" style={inputStyle('password')} />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#9ca3af' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 6 }}>Use at least 8 characters</p>
            </div>
            <button type="submit" disabled={loading} style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '15px 0', borderRadius: 12, border: 'none', background: loading ? '#e5e7eb' : 'linear-gradient(135deg,#6c63ff,#8b5cf6)', color: loading ? '#9ca3af' : '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 8px 28px rgba(108,99,255,.45)', transition: 'all .2s', width: '100%' }}>
              {loading ? <><div style={{ width: 16, height: 16, border: '2.5px solid #d1d5db', borderTopColor: '#9ca3af', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />Creating account…</> : <>Create Free Account <ArrowRight size={16} /></>}
            </button>
            <p style={{ fontSize: 11.5, color: '#9ca3af', textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
              By creating an account you agree to our{' '}
              <a href="#" style={{ color: '#6c63ff', textDecoration: 'none' }}>Terms of Service</a>{' '}and{' '}
              <a href="#" style={{ color: '#6c63ff', textDecoration: 'none' }}>Privacy Policy</a>
            </p>
          </form>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#f0f0f4' }} />
            <span style={{ fontSize: 12, color: '#c4c9d4', fontWeight: 500 }}>Already have an account?</span>
            <div style={{ flex: 1, height: 1, background: '#f0f0f4' }} />
          </div>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: '1.5px solid #eaecf0', background: '#fafbff', color: '#374151', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, transition: 'all .2s' }}
              onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#6c63ff'; b.style.color = '#6c63ff'; }}
              onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#eaecf0'; b.style.color = '#374151'; }}>
              Sign in instead
            </button>
          </Link>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 28 }}>
            {[{ icon: Shield, label: 'Free forever', sub: 'No hidden fees' }, { icon: Lock, label: 'Secure & private', sub: 'Your data is safe' }, { icon: Clock, label: 'Cancel anytime', sub: 'No commitment' }].map(({ icon: Icon, label, sub }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={14} color="#6c63ff" strokeWidth={2} />
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: 0 }}>{label}</p>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px 0 20px', borderTop: '1px solid #f3f4f6' }}>
          <p style={{ fontSize: 12, color: '#c4c9d4', margin: 0 }}>© 2024 PriceTracker. All rights reserved.</p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
