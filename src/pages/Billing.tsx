import { Check, Zap, Star, Lock, Bell, BarChart2, Infinity, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import toast from 'react-hot-toast';

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 18,
  border: '1px solid #eef0f6', boxShadow: '0 2px 8px rgba(0,0,0,.05)',
};

const FREE_FEATURES = [
  'Track up to 10 products',
  'Email price alerts',
  'Price history (30 days)',
  '5 watched categories',
  'Basic reports',
];

const PRO_FEATURES = [
  'Unlimited product tracking',
  'Instant + email alerts',
  'Full price history',
  'Unlimited categories',
  'Advanced reports & exports',
  'Priority price scraping',
  'API access',
  'Slack & Telegram alerts',
  'Priority support',
];

const FAQS = [
  { q: 'Can I cancel anytime?', a: 'Yes! You can cancel your Pro subscription at any time. You\'ll retain access until the end of your billing period.' },
  { q: 'How often are prices checked?', a: 'Free plan: prices are checked every 6 hours. Pro plan: every 30 minutes for near-real-time tracking.' },
  { q: 'Is there a free trial for Pro?', a: 'We offer a 14-day free trial on the Pro plan — no credit card required to start.' },
  { q: 'What payment methods are accepted?', a: 'We accept all major credit/debit cards, UPI, net banking, and wallets via Razorpay.' },
  { q: 'Can I export my price history data?', a: 'Pro users can export their full price history as CSV or JSON at any time.' },
];

export default function Billing() {
  const { isMobile, isTablet } = useBreakpoint();
  const isSmall = isMobile || isTablet;
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  const price = billing === 'annual' ? 249 : 299;
  const save = Math.round((1 - 249 / 299) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <div style={{ textAlign: 'center', padding: isSmall ? '0 0 8px' : '0 0 8px' }}>
        <h1 style={{ fontSize: isSmall ? 24 : 30, fontWeight: 900, color: '#0f1117', margin: '0 0 8px', letterSpacing: '-.5px' }}>Simple, Transparent Pricing</h1>
        <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>Start free. Upgrade when you need more power.</p>

        {/* Toggle */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 0, marginTop: 20, background: '#f4f6fb', borderRadius: 12, padding: 4 }}>
          {(['monthly', 'annual'] as const).map((b) => (
            <button key={b} onClick={() => setBilling(b)}
              style={{ padding: '8px 20px', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .2s', background: billing === b ? '#fff' : 'transparent', color: billing === b ? '#0f1117' : '#9ca3af', boxShadow: billing === b ? '0 1px 4px rgba(0,0,0,.08)' : 'none' }}>
              {b === 'monthly' ? 'Monthly' : 'Annual'}
              {b === 'annual' && <span style={{ marginLeft: 6, padding: '1px 6px', background: '#ecfdf5', borderRadius: 10, fontSize: 10, color: '#10b981', fontWeight: 700 }}>SAVE {save}%</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isSmall ? '1fr' : '1fr 1fr', gap: 18, maxWidth: 860, margin: '0 auto', width: '100%' }}>

        {/* Free */}
        <div style={{ ...card, padding: '28px 28px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: '#f4f6fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="#6c63ff" />
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#0f1117', margin: 0 }}>Free</p>
              <p style={{ fontSize: 11.5, color: '#9ca3af', margin: 0 }}>Current plan</p>
            </div>
            <span style={{ marginLeft: 'auto', padding: '4px 10px', background: '#eef2ff', borderRadius: 20, fontSize: 11, fontWeight: 700, color: '#6c63ff' }}>ACTIVE</span>
          </div>
          <div style={{ marginBottom: 20 }}>
            <span style={{ fontSize: 38, fontWeight: 900, color: '#0f1117', letterSpacing: '-1px' }}>₹0</span>
            <span style={{ fontSize: 14, color: '#9ca3af', marginLeft: 4 }}>/ month</span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {FREE_FEATURES.map((f) => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={11} color="#6c63ff" strokeWidth={3} />
                </div>
                <span style={{ fontSize: 13.5, color: '#374151' }}>{f}</span>
              </div>
            ))}
          </div>
          <button style={{ padding: '12px 0', background: '#f4f6fb', border: 'none', borderRadius: 12, color: '#9ca3af', fontSize: 14, fontWeight: 700, cursor: 'default' }}>
            Current Plan
          </button>
        </div>

        {/* Pro */}
        <div style={{ borderRadius: 18, padding: 3, background: 'linear-gradient(135deg,#6c63ff,#a78bfa,#ec4899)', boxShadow: '0 8px 32px rgba(108,99,255,.25)' }}>
          <div style={{ background: '#fff', borderRadius: 15, padding: '28px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(108,99,255,.3)' }}>
                <Star size={18} color="#fff" fill="#fff" />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: '#0f1117', margin: 0 }}>Pro</p>
                <p style={{ fontSize: 11.5, color: '#9ca3af', margin: 0 }}>Everything you need</p>
              </div>
              <span style={{ marginLeft: 'auto', padding: '4px 10px', background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', borderRadius: 20, fontSize: 11, fontWeight: 700, color: '#fff' }}>POPULAR</span>
            </div>
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 38, fontWeight: 900, color: '#0f1117', letterSpacing: '-1px' }}>₹{price}</span>
              <span style={{ fontSize: 14, color: '#9ca3af', marginLeft: 4 }}>/ month</span>
              {billing === 'annual' && <p style={{ fontSize: 12, color: '#10b981', margin: '4px 0 0', fontWeight: 500 }}>Billed ₹{price * 12} / year</p>}
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {PRO_FEATURES.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Check size={11} color="#fff" strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: 13.5, color: '#374151' }}>{f}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => toast('Pro plan coming soon! We\'ll notify you when it\'s available.', { icon: '🚀' })}
              style={{ padding: '13px 0', background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(108,99,255,.3)' }}>
              Upgrade to Pro — ₹{price}/mo
            </button>
            <p style={{ fontSize: 11.5, color: '#9ca3af', margin: '10px 0 0', textAlign: 'center' }}>14-day free trial · No credit card required</p>
          </div>
        </div>
      </div>

      {/* Features comparison row */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 14 }}>
        {[
          { icon: Bell, color: '#818cf8', bg: '#eef2ff', title: 'Smart Alerts', desc: 'Get notified the moment prices drop to your target via email, Slack, or Telegram.' },
          { icon: BarChart2, color: '#10b981', bg: '#ecfdf5', title: 'Deep Analytics', desc: 'Full price history, trend charts, and savings reports to make smarter buying decisions.' },
          { icon: Infinity, color: '#f59e0b', bg: '#fffbeb', title: 'No Limits', desc: 'Track unlimited products across Amazon with near-real-time price checking every 30 minutes.' },
        ].map(({ icon: Icon, color, bg, title, desc }) => (
          <div key={title} style={{ ...card, padding: '20px 22px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${color}30` }}>
              <Icon size={20} color={color} strokeWidth={1.8} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0f1117', margin: '0 0 4px' }}>{title}</p>
              <p style={{ fontSize: 12.5, color: '#9ca3af', margin: 0, lineHeight: 1.5 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ ...card, padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <HelpCircle size={20} color="#6c63ff" />
          <p style={{ fontSize: 16, fontWeight: 700, color: '#0f1117', margin: 0 }}>Frequently Asked Questions</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #f4f6fb' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: openFaq === i ? '#f9fafb' : '#fff', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0f1117' }}>{faq.q}</span>
                {openFaq === i ? <ChevronUp size={16} color="#9ca3af" /> : <ChevronDown size={16} color="#9ca3af" />}
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 16px 14px', background: '#f9fafb' }}>
                  <p style={{ fontSize: 13.5, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Security badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0' }}>
        <Lock size={14} color="#9ca3af" />
        <span style={{ fontSize: 12.5, color: '#9ca3af' }}>Payments secured by Razorpay · 256-bit SSL encryption · Cancel anytime</span>
      </div>
    </div>
  );
}
