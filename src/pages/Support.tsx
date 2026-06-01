import { useState } from 'react';
import { HelpCircle, MessageSquare, BookOpen, ChevronDown, ChevronUp, ExternalLink, Mail, Send, Zap, Bell, Search, Package } from 'lucide-react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import toast from 'react-hot-toast';

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 18,
  border: '1px solid #eef0f6', boxShadow: '0 2px 8px rgba(0,0,0,.05)',
};

const inputBase: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: '1.5px solid #eef0f6', fontSize: 14, outline: 'none',
  background: '#fff', color: '#0f1117', boxSizing: 'border-box',
  transition: 'border-color .2s, box-shadow .2s',
};

const CATEGORIES = [
  {
    icon: Package, color: '#6c63ff', bg: '#eef2ff', label: 'Getting Started',
    faqs: [
      { q: 'How do I add a product to track?', a: 'Go to the Products page, paste an Amazon product URL in the input box, and click "Track". PriceZap will start monitoring the price immediately.' },
      { q: 'How do I set a target price?', a: 'After adding a product, click on it in your tracked products list and set a target price. You\'ll receive an email alert when the price reaches or goes below your target.' },
      { q: 'What retailers does PriceZap support?', a: 'Currently, PriceZap supports Amazon India (amazon.in). We\'re adding more retailers including Flipkart and Meesho very soon.' },
    ],
  },
  {
    icon: Bell, color: '#f59e0b', bg: '#fffbeb', label: 'Alerts',
    faqs: [
      { q: 'Why am I not receiving email alerts?', a: 'Check your spam/junk folder first. If alerts aren\'t arriving, verify your email in Settings. Also ensure you have a target price set for the product — alerts only trigger when the price hits your target.' },
      { q: 'How often are prices checked?', a: 'Free plan: every 6 hours. Pro plan: every 30 minutes. Prices are checked automatically by our background scheduler.' },
      { q: 'Can I receive alerts for multiple products?', a: 'Yes! You can track as many products as your plan allows and set individual target prices for each one.' },
    ],
  },
  {
    icon: Zap, color: '#10b981', bg: '#ecfdf5', label: 'Billing & Plans',
    faqs: [
      { q: 'What\'s included in the Free plan?', a: 'The Free plan includes tracking up to 10 products, email alerts, 30-day price history, 5 watched categories, and basic reports — completely free forever.' },
      { q: 'How do I upgrade to Pro?', a: 'Visit the Billing page and click "Upgrade to Pro". The Pro plan is coming soon and will offer unlimited tracking, faster checks, and advanced features.' },
      { q: 'Can I export my data?', a: 'Pro users can export price history as CSV/JSON. This feature is coming with the Pro plan launch.' },
    ],
  },
];

export default function Support() {
  const { isMobile, isTablet } = useBreakpoint();
  const isSmall = isMobile || isTablet;
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [searchQ, setSearchQ] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const allFaqs = CATEGORIES.flatMap((c) => c.faqs.map((f) => ({ ...f, cat: c.label })));
  const filteredFaqs = searchQ.trim()
    ? allFaqs.filter((f) => f.q.toLowerCase().includes(searchQ.toLowerCase()) || f.a.toLowerCase().includes(searchQ.toLowerCase()))
    : null;

  async function handleContact(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    setContactName(''); setContactEmail(''); setContactMsg('');
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
  }

  function inputStyle(focused: boolean): React.CSSProperties {
    return { ...inputBase, borderColor: focused ? '#6c63ff' : '#eef0f6', boxShadow: focused ? '0 0 0 4px rgba(108,99,255,.1)' : 'none' };
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ ...card, padding: isSmall ? '28px 22px' : '36px 40px', background: 'linear-gradient(135deg,#0f1117 0%,#1a1b2e 100%)', border: 'none', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(108,99,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <HelpCircle size={26} color="#a78bfa" />
        </div>
        <h1 style={{ fontSize: isSmall ? 22 : 28, fontWeight: 900, color: '#fff', margin: '0 0 8px', letterSpacing: '-.5px' }}>How can we help?</h1>
        <p style={{ fontSize: 14, color: '#9ca3af', margin: '0 0 22px' }}>Search our knowledge base or browse topics below</p>
        <div style={{ position: 'relative', maxWidth: 480, margin: '0 auto' }}>
          <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            placeholder="Search for answers…"
            style={{ ...inputStyle(searchFocus), paddingLeft: 40, background: searchFocus ? '#fff' : 'rgba(255,255,255,.08)', borderColor: searchFocus ? '#6c63ff' : 'rgba(255,255,255,.1)', color: searchFocus ? '#0f1117' : '#fff' }}
          />
        </div>
      </div>

      {/* Search results */}
      {filteredFaqs && (
        <div style={{ ...card, padding: '20px 24px' }}>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 14px' }}>{filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''} for "{searchQ}"</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredFaqs.length === 0 ? (
              <p style={{ fontSize: 14, color: '#d1d5db', textAlign: 'center', padding: '20px 0' }}>No results found. Try different keywords.</p>
            ) : filteredFaqs.map((faq, i) => {
              const k = `search-${i}`;
              return (
                <div key={k} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #f4f6fb' }}>
                  <button onClick={() => setOpenFaq(openFaq === k ? null : k)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: openFaq === k ? '#f9fafb' : '#fff', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0f1117' }}>{faq.q}</span>
                      <span style={{ marginLeft: 8, padding: '1px 7px', background: '#eef2ff', borderRadius: 10, fontSize: 10, color: '#6c63ff', fontWeight: 600 }}>{faq.cat}</span>
                    </div>
                    {openFaq === k ? <ChevronUp size={15} color="#9ca3af" /> : <ChevronDown size={15} color="#9ca3af" />}
                  </button>
                  {openFaq === k && (
                    <div style={{ padding: '0 16px 14px', background: '#f9fafb' }}>
                      <p style={{ fontSize: 13.5, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FAQ categories */}
      {!filteredFaqs && (
        <div style={{ display: 'grid', gridTemplateColumns: isSmall ? '1fr' : '260px 1fr', gap: 18 }}>

          {/* Category list */}
          <div style={{ display: 'flex', flexDirection: isSmall ? 'row' : 'column', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat, i) => (
              <button key={i} onClick={() => setActiveCategory(i)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, border: '1px solid', borderColor: activeCategory === i ? '#6c63ff' : '#eef0f6', background: activeCategory === i ? '#eef2ff' : '#fff', cursor: 'pointer', flexShrink: 0, flex: isSmall ? '1 1 auto' : undefined }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <cat.icon size={15} color={cat.color} />
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: activeCategory === i ? '#6c63ff' : '#374151' }}>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* FAQ list */}
          <div style={{ ...card, padding: '20px 24px' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f1117', margin: '0 0 16px' }}>{CATEGORIES[activeCategory].label}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {CATEGORIES[activeCategory].faqs.map((faq, i) => {
                const k = `${activeCategory}-${i}`;
                return (
                  <div key={k} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #f4f6fb' }}>
                    <button onClick={() => setOpenFaq(openFaq === k ? null : k)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: openFaq === k ? '#f9fafb' : '#fff', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#0f1117' }}>{faq.q}</span>
                      {openFaq === k ? <ChevronUp size={15} color="#9ca3af" /> : <ChevronDown size={15} color="#9ca3af" />}
                    </button>
                    {openFaq === k && (
                      <div style={{ padding: '0 16px 14px', background: '#f9fafb' }}>
                        <p style={{ fontSize: 13.5, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Quick links + Contact */}
      <div style={{ display: 'grid', gridTemplateColumns: isSmall ? '1fr' : '1fr 1fr', gap: 18 }}>

        {/* Quick links */}
        <div style={{ ...card, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <BookOpen size={18} color="#6c63ff" />
            <p style={{ fontSize: 15, fontWeight: 700, color: '#0f1117', margin: 0 }}>Quick Links</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Getting Started Guide', url: '#' },
              { label: 'How price tracking works', url: '#' },
              { label: 'Setting up email alerts', url: '#' },
              { label: 'API Documentation (Pro)', url: '#' },
              { label: 'Service Status Page', url: '#' },
            ].map(({ label, url }) => (
              <a key={label} href={url}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f9fafb', borderRadius: 10, textDecoration: 'none', color: '#374151', fontSize: 13.5, fontWeight: 500, border: '1px solid #f4f6fb' }}>
                {label}
                <ExternalLink size={13} color="#9ca3af" />
              </a>
            ))}
          </div>
        </div>

        {/* Contact form */}
        <div style={{ ...card, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <MessageSquare size={18} color="#6c63ff" />
            <p style={{ fontSize: 15, fontWeight: 700, color: '#0f1117', margin: 0 }}>Contact Us</p>
          </div>
          <form onSubmit={handleContact} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Name</label>
              <input value={contactName} onChange={(e) => setContactName(e.target.value)} required placeholder="Your name"
                onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                style={inputStyle(focusedField === 'name')} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} color="#9ca3af" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required type="email" placeholder="you@email.com"
                  onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                  style={{ ...inputStyle(focusedField === 'email'), paddingLeft: 36 }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Message</label>
              <textarea value={contactMsg} onChange={(e) => setContactMsg(e.target.value)} required rows={4} placeholder="Describe your issue or question…"
                onFocus={() => setFocusedField('msg')} onBlur={() => setFocusedField(null)}
                style={{ ...inputStyle(focusedField === 'msg'), resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <button type="submit" disabled={sending}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 0', background: sending ? '#e0ddff' : 'linear-gradient(135deg,#6c63ff,#a78bfa)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: sending ? 'not-allowed' : 'pointer' }}>
              <Send size={14} /> {sending ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>

      {/* Response time banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 0' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 3px #d1fae5' }} />
        <span style={{ fontSize: 13, color: '#6b7280' }}>Average response time: <strong style={{ color: '#0f1117' }}>under 24 hours</strong> · Support via email: support@pricezap.com</span>
      </div>
    </div>
  );
}
