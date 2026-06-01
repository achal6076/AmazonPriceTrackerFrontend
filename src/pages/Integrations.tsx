import { ExternalLink, Zap, MessageSquare, Send, Mail, Webhook, Globe, Check, Lock } from 'lucide-react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import toast from 'react-hot-toast';

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 18,
  border: '1px solid #eef0f6', boxShadow: '0 2px 8px rgba(0,0,0,.05)',
};

interface Integration {
  name: string;
  desc: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  status: 'active' | 'coming_soon' | 'pro';
  category: string;
}

const INTEGRATIONS: Integration[] = [
  { name: 'Email', desc: 'Receive price drop alerts directly to your inbox. Fully customizable alert templates.', icon: Mail, iconColor: '#6c63ff', iconBg: '#eef2ff', status: 'active', category: 'Notifications' },
  { name: 'Slack', desc: 'Get real-time price alerts in your Slack workspace channels or DMs.', icon: MessageSquare, iconColor: '#4a154b', iconBg: '#f5f0f5', status: 'pro', category: 'Notifications' },
  { name: 'Telegram', desc: 'Receive instant price alerts via Telegram bot messages.', icon: Send, iconColor: '#2aabee', iconBg: '#eff9ff', status: 'pro', category: 'Notifications' },
  { name: 'IFTTT', desc: 'Connect PriceZap to 700+ apps and services using IFTTT applets.', icon: Zap, iconColor: '#e35b5b', iconBg: '#fff1f1', status: 'coming_soon', category: 'Automation' },
  { name: 'Zapier', desc: 'Automate workflows by connecting price alerts to thousands of apps.', icon: Zap, iconColor: '#ff4a00', iconBg: '#fff4f0', status: 'coming_soon', category: 'Automation' },
  { name: 'Webhooks', desc: 'Send price alert data to any URL. Build custom integrations with your own apps.', icon: Webhook, iconColor: '#374151', iconBg: '#f9fafb', status: 'pro', category: 'Developer' },
  { name: 'REST API', desc: 'Full access to PriceZap\'s API to build custom dashboards and integrations.', icon: Globe, iconColor: '#10b981', iconBg: '#ecfdf5', status: 'pro', category: 'Developer' },
  { name: 'WhatsApp', desc: 'Get price drop notifications directly on WhatsApp.', icon: MessageSquare, iconColor: '#25d366', iconBg: '#f0fdf4', status: 'coming_soon', category: 'Notifications' },
];

const categories = [...new Set(INTEGRATIONS.map((i) => i.category))];

function StatusBadge({ status }: { status: Integration['status'] }) {
  const map = {
    active: { label: 'Active', bg: '#ecfdf5', color: '#10b981', border: '#d1fae5' },
    coming_soon: { label: 'Coming Soon', bg: '#fff7ed', color: '#f59e0b', border: '#fed7aa' },
    pro: { label: 'Pro', bg: '#eef2ff', color: '#6c63ff', border: '#c7d2fe' },
  };
  const s = map[status];
  return (
    <span style={{ padding: '3px 9px', background: s.bg, borderRadius: 20, fontSize: 11, fontWeight: 700, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>
      {status === 'pro' && <Lock size={9} style={{ marginRight: 3, verticalAlign: 'middle' }} />}
      {s.label}
    </span>
  );
}

export default function Integrations() {
  const { isMobile, isTablet } = useBreakpoint();
  const isSmall = isMobile || isTablet;

  function handleConnect(integration: Integration) {
    if (integration.status === 'active') {
      toast('Email alerts are already enabled. Configure them in Settings.', { icon: '✉️' });
    } else if (integration.status === 'pro') {
      toast(`${integration.name} integration requires the Pro plan. Coming soon!`, { icon: '🔒' });
    } else {
      toast(`${integration.name} integration is coming soon. We'll notify you!`, { icon: '🚀' });
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f1117', margin: 0, letterSpacing: '-.5px' }}>Integrations</h1>
        <p style={{ fontSize: 13.5, color: '#9ca3af', marginTop: 4 }}>Connect PriceZap with your favourite tools and workflows</p>
      </div>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: 14 }}>
        {[
          { label: 'Active', count: INTEGRATIONS.filter(i => i.status === 'active').length, color: '#10b981', bg: '#ecfdf5' },
          { label: 'Available with Pro', count: INTEGRATIONS.filter(i => i.status === 'pro').length, color: '#6c63ff', bg: '#eef2ff' },
          { label: 'Coming Soon', count: INTEGRATIONS.filter(i => i.status === 'coming_soon').length, color: '#f59e0b', bg: '#fffbeb' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} style={{ ...card, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color }}>{count}</span>
            </div>
            <div>
              <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, margin: 0 }}>{label}</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0f1117', margin: '2px 0 0' }}>Integration{count !== 1 ? 's' : ''}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Integration cards by category */}
      {categories.map((cat) => (
        <div key={cat}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#374151', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 3, height: 18, background: 'linear-gradient(180deg,#6c63ff,#a78bfa)', borderRadius: 2 }} />
            {cat}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: 14 }}>
            {INTEGRATIONS.filter((i) => i.category === cat).map((integration) => (
              <div key={integration.name} style={{ ...card, padding: '22px', display: 'flex', flexDirection: 'column', gap: 16, opacity: integration.status === 'coming_soon' ? 0.85 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: integration.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${integration.iconColor}20`, flexShrink: 0 }}>
                      <integration.icon size={22} color={integration.iconColor} strokeWidth={1.8} />
                    </div>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#0f1117', margin: 0 }}>{integration.name}</p>
                      <p style={{ fontSize: 11.5, color: '#9ca3af', margin: '2px 0 0' }}>{integration.category}</p>
                    </div>
                  </div>
                  <StatusBadge status={integration.status} />
                </div>
                <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.55, flex: 1 }}>{integration.desc}</p>
                <button
                  onClick={() => handleConnect(integration)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '10px 0', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    background: integration.status === 'active' ? 'linear-gradient(135deg,#10b981,#059669)' : '#f4f6fb',
                    color: integration.status === 'active' ? '#fff' : '#9ca3af',
                  }}>
                  {integration.status === 'active' ? <><Check size={14} /> Connected</> :
                    integration.status === 'pro' ? <><Lock size={13} /> Upgrade to Connect</> :
                    <><ExternalLink size={13} /> Notify Me</>}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Build your own */}
      <div style={{ ...card, padding: isSmall ? '24px 20px' : '28px 32px', background: 'linear-gradient(135deg,#0f1117 0%,#1a1b2e 100%)', border: 'none', display: 'flex', alignItems: isSmall ? 'flex-start' : 'center', justifyContent: 'space-between', flexDirection: isSmall ? 'column' : 'row', gap: 16 }}>
        <div>
          <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Build Your Own Integration</p>
          <p style={{ fontSize: 13.5, color: '#9ca3af', margin: 0 }}>Use our REST API and Webhooks to build custom integrations for your workflow.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <button onClick={() => toast('API docs coming with the Pro plan launch!', { icon: '📚' })}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Globe size={14} /> View Docs
          </button>
          <button onClick={() => toast('Webhook support coming with the Pro plan!', { icon: '🔗' })}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Webhook size={14} /> Set Up Webhook
          </button>
        </div>
      </div>
    </div>
  );
}
