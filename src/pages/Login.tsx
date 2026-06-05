import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Mail, Lock, ArrowRight,
  TrendingDown, Bell, BarChart2, Tag,
  Eye, EyeOff, UserPlus, CheckCircle,
  Shield, Clock,
} from 'lucide-react';
import { login } from '../api/auth';
import { useAuthStore } from '../store/auth';
import { useBreakpoint } from '../hooks/useBreakpoint';
import toast from 'react-hot-toast';

const features = [
  { icon: TrendingDown, label: 'Real-time price tracking', desc: 'Monitor Amazon prices 24/7 automatically' },
  { icon: Bell,         label: 'Instant price alerts',    desc: 'Get notified the moment prices drop'      },
  { icon: BarChart2,    label: 'Price history charts',    desc: 'Visualize trends over days and months'    },
  { icon: Tag,          label: 'Never miss a deal',       desc: 'Track unlimited products for free'        },
];

const trustBadges = [
  { icon: Shield, label: 'Free forever',     sub: 'No hidden fees'    },
  { icon: Lock,   label: 'Secure & private', sub: 'Your data is safe' },
  { icon: Clock,  label: 'Cancel anytime',   sub: 'No commitment'     },
];

export default function Login() {
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
    padding: '14px 42px 14px 44px',
    background: focused === name ? '#fff' : '#f8f9fc',
    border: `1.5px solid ${
      focused === name ? '#6c63ff'
      : (name === 'email' && emailValid) ? '#10b981'
      : '#e5e7eb'
    }`,
    borderRadius: 12, fontSize: 14, color: '#111827', outline: 'none',
    transition: 'all .2s',
    boxShadow: focused === name ? '0 0 0 4px rgba(108,99,255,.1)' : 'none',
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* ── Left panel (desktop only) ── */}
      {!isMobile && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '40px 48px',
          background: 'linear-gradient(160deg,#09091f 0%,#0f1035 45%,#161952 100%)',
          position: 'relative', overflow: 'hidden',
        }}>

          {/* Subtle background dots */}
          {[
            [8,12],[20,35],[5,58],[15,78],[30,92],[45,8],[60,25],[75,60],[90,40],[50,72],
            [35,50],[80,85],[25,18],[65,95],[92,15],[40,68],[12,45],[70,30],[55,88],[82,55],
          ].map(([l, t], i) => (
            <div key={i} style={{
              position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
              width: i % 4 === 0 ? 3 : 2, height: i % 4 === 0 ? 3 : 2,
              background: 'rgba(255,255,255,.12)',
              left: `${l}%`, top: `${t}%`,
            }} />
          ))}

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(245,158,11,.45)',
            }}>
              <ShoppingBag size={20} color="#fff" />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 17, lineHeight: 1 }}>PriceTracker</div>
              <div style={{ color: '#5d6384', fontSize: 11, marginTop: 3 }}>Amazon Price Intelligence</div>
            </div>
          </div>

          {/* Headline + features */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 0', position: 'relative' }}>
            <h1 style={{ fontSize: 44, fontWeight: 900, color: '#fff', margin: '0 0 14px', lineHeight: 1.1, letterSpacing: '-1.5px' }}>
              Smarter shopping<br />
              <span style={{ background: 'linear-gradient(90deg,#818cf8,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                starts here
              </span>
            </h1>
            <p style={{ color: '#7b82a8', fontSize: 15, lineHeight: 1.7, margin: '0 0 36px', maxWidth: 320 }}>
              Track prices, get alerts, and never overpay on Amazon again.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              {features.map(({ icon: Icon, label, desc }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                    background: 'rgba(99,93,255,.18)', border: '1px solid rgba(130,120,255,.22)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={18} color="#a78bfa" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p style={{ color: '#e2e4f0', fontWeight: 700, fontSize: 14, margin: 0 }}>{label}</p>
                    <p style={{ color: '#5d6384', fontSize: 12.5, margin: '2px 0 0', lineHeight: 1.5 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating chart card */}
            <div style={{ position: 'absolute', right: -16, top: '44%', transform: 'translateY(-50%)' }}>
              <div style={{
                width: 192, background: 'rgba(255,255,255,.06)',
                border: '1px solid rgba(255,255,255,.1)', borderRadius: 20,
                padding: '16px 16px 12px', backdropFilter: 'blur(12px)',
                boxShadow: '0 20px 60px rgba(0,0,0,.4)',
              }}>
                <p style={{ fontSize: 10.5, color: '#6b7280', margin: '0 0 2px', fontWeight: 500 }}>Price trend</p>
                <p style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 0 12px', letterSpacing: '-.5px' }}>₹23,800</p>
                <svg width="160" height="52" viewBox="0 0 160 52" style={{ display: 'block' }}>
                  <defs>
                    <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <polygon points="0,52 0,38 26,30 52,36 80,20 108,24 136,10 160,4 160,52" fill="url(#lg)" />
                  <polyline points="0,38 26,30 52,36 80,20 108,24 136,10 160,4"
                    fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="160" cy="4" r="4" fill="#818cf8" />
                  <circle cx="160" cy="4" r="7" fill="#818cf8" fillOpacity="0.25" />
                </svg>
                <p style={{ fontSize: 10.5, color: '#10b981', fontWeight: 700, margin: '8px 0 0' }}>↓ 17% this month</p>
              </div>

              {/* Bell badge */}
              <div style={{
                position: 'absolute', top: -16, right: 18,
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg,#6c63ff,#a78bfa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(108,99,255,.6)',
              }}>
                <Bell size={15} color="#fff" fill="#fff" />
                <span style={{
                  position: 'absolute', top: -3, right: -3,
                  width: 14, height: 14, borderRadius: '50%',
                  background: '#ef4444', border: '2px solid #0f1035',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, color: '#fff', fontWeight: 900,
                }}>3</span>
              </div>
            </div>
          </div>

          {/* Bottom avatars + stars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
            <div style={{ display: 'flex' }}>
              {[
                { bg: '#e74c3c', letter: 'A' },
                { bg: '#e67e22', letter: 'M' },
                { bg: '#9b59b6', letter: 'R' },
                { bg: '#3498db', letter: 'S' },
              ].map(({ bg, letter }, i) => (
                <div key={i} style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: bg, border: '2.5px solid #0f1035',
                  marginLeft: i > 0 ? -10 : 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: '#fff',
                }}>{letter}</div>
              ))}
            </div>
            <div>
              <div style={{ display: 'flex', gap: 1, marginBottom: 3 }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: '#f59e0b', fontSize: 14 }}>★</span>
                ))}
              </div>
              <p style={{ color: '#5d6384', fontSize: 12, margin: 0 }}>
                Join <span style={{ color: '#a78bfa', fontWeight: 700 }}>2,400+</span> smart shoppers saving every day
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Right panel / Full screen on mobile ── */}
      <div style={{
        width: isMobile ? '100%' : 500, flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        background: '#fff',
      }}>
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: isMobile ? '48px 28px 32px' : '0 60px',
        }}>

          {/* Mobile logo */}
          {isMobile && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
              <div style={{
                width: 54, height: 54, borderRadius: 16,
                background: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(245,158,11,.35)',
              }}>
                <ShoppingBag size={26} color="#fff" />
              </div>
            </div>
          )}

          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: isMobile ? 30 : 32, fontWeight: 900, color: '#0f1117', margin: 0, letterSpacing: '-.5px' }}>
              Welcome back
            </h2>
            <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 8, margin: '8px 0 0' }}>
              Sign in to your account to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                Email address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16}
                  color={emailValid ? '#10b981' : focused === 'email' ? '#6c63ff' : '#9ca3af'}
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="email" required value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="you@example.com"
                  style={inputStyle('email')}
                />
                {emailValid && (
                  <CheckCircle size={16} color="#10b981"
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: 13, color: '#6c63ff', textDecoration: 'none', fontWeight: 600 }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color={focused === 'password' ? '#6c63ff' : '#9ca3af'}
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type={showPass ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••"
                  style={inputStyle('password')}
                />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  display: 'flex', alignItems: 'center', color: '#9ca3af',
                }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              marginTop: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '15px 0', borderRadius: 12, border: 'none',
              background: loading ? '#e5e7eb' : 'linear-gradient(135deg,#6c63ff,#8b5cf6)',
              color: loading ? '#9ca3af' : '#fff',
              fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 8px 28px rgba(108,99,255,.45)',
              transition: 'all .2s', width: '100%',
            }}>
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2.5px solid #d1d5db', borderTopColor: '#9ca3af', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                  Signing in…
                </>
              ) : (
                <>Sign in <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#f0f0f4' }} />
            <span style={{ fontSize: 12, color: '#c4c9d4', fontWeight: 500 }}>New to PriceTracker?</span>
            <div style={{ flex: 1, height: 1, background: '#f0f0f4' }} />
          </div>

          {/* Register */}
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button style={{
              width: '100%', padding: '14px 0', borderRadius: 12,
              border: '1.5px solid #e5e7eb', background: '#fff',
              color: '#374151', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
              transition: 'all .2s', boxShadow: '0 1px 4px rgba(0,0,0,.04)',
            }}
              onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#6c63ff'; b.style.color = '#6c63ff'; }}
              onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = '#e5e7eb'; b.style.color = '#374151'; }}>
              <UserPlus size={16} /> Create a free account
            </button>
          </Link>

          {/* Trust badges */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            gap: isMobile ? 14 : 8,
            marginTop: 28,
          }}>
            {trustBadges.map(({ icon: Icon, label, sub }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 9, flexShrink: 0,
                  background: '#eef2ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
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

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '16px 0 20px', borderTop: '1px solid #f3f4f6' }}>
          <p style={{ fontSize: 12, color: '#c4c9d4', margin: 0 }}>© 2024 PriceTracker. All rights reserved.</p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
