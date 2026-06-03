import { useEffect, useState } from 'react';
import { getProfile, updateProfile, getWhatsAppStatus, testWhatsApp } from '../api/auth';
import api from '../api/client';
import { useAuthStore } from '../store/auth';
import { User, Lock, Bell, Shield, CheckCircle, Eye, EyeOff, LogOut, Send, MessageCircle, RefreshCw } from 'lucide-react';
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

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12.5, fontWeight: 600,
  color: '#374151', marginBottom: 6,
};

function Section({ icon: Icon, iconColor, iconBg, title, subtitle, children }: {
  icon: React.ElementType; iconColor: string; iconBg: string;
  title: string; subtitle: string; children: React.ReactNode;
}) {
  return (
    <div style={{ ...card, padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid #f4f6fb' }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${iconColor}30`, flexShrink: 0 }}>
          <Icon size={20} color={iconColor} strokeWidth={1.8} />
        </div>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#0f1117', margin: 0 }}>{title}</p>
          <p style={{ fontSize: 12.5, color: '#9ca3af', margin: 0 }}>{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const { isMobile } = useBreakpoint();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [profile, setProfile] = useState<{ id: string; email: string; name: string | null; whatsapp_number: string | null; created_at: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileFocus, setProfileFocus] = useState<string | null>(null);

  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState<string | null>(null);
  const [sendingTest, setSendingTest] = useState(false);

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifInstant, setNotifInstant] = useState(true);
  const [notifDigest, setNotifDigest] = useState(false);

  const [waNumber, setWaNumber] = useState('');
  const [savingWa, setSavingWa] = useState(false);
  const [waStatus, setWaStatus] = useState<{ status: string; qrBase64: string | null }>({ status: 'initializing', qrBase64: null });
  const [testingWa, setTestingWa] = useState(false);

  useEffect(() => {
    getProfile()
      .then((p) => {
        setProfile(p);
        setName(p.name ?? '');
        setWaNumber(p.whatsapp_number ?? '');
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));

    getWhatsAppStatus().then(setWaStatus).catch(() => {});

    const poll = setInterval(() => {
      getWhatsAppStatus().then(setWaStatus).catch(() => {});
    }, 5000);
    return () => clearInterval(poll);
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await updateProfile({ name: name.trim() || undefined });
      setProfile(updated);
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPwd !== confirmPwd) { toast.error('New passwords do not match'); return; }
    if (newPwd.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setSavingPwd(true);
    try {
      await updateProfile({ current_password: curPwd, new_password: newPwd });
      setCurPwd(''); setNewPwd(''); setConfirmPwd('');
      toast.success('Password changed successfully');
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to change password');
    } finally {
      setSavingPwd(false);
    }
  }

  async function handleSaveWhatsApp(e: React.FormEvent) {
    e.preventDefault();
    setSavingWa(true);
    try {
      const updated = await updateProfile({ whatsapp_number: waNumber.trim() || null });
      setProfile(updated);
      toast.success('WhatsApp number saved');
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Failed to save number');
    } finally {
      setSavingWa(false);
    }
  }

  function inputStyle(focused: boolean): React.CSSProperties {
    return {
      ...inputBase,
      borderColor: focused ? '#6c63ff' : '#eef0f6',
      boxShadow: focused ? '0 0 0 4px rgba(108,99,255,.1)' : 'none',
    };
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 40, height: 40, border: '3px solid #eef0f6', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f1117', margin: 0, letterSpacing: '-.5px' }}>Settings</h1>
        <p style={{ fontSize: 13.5, color: '#9ca3af', marginTop: 4 }}>Manage your account preferences and security</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 18 }}>

        {/* Profile */}
        <Section icon={User} iconColor="#6c63ff" iconBg="#eef2ff" title="Profile" subtitle="Update your display name">
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Display Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setProfileFocus('name')}
                onBlur={() => setProfileFocus(null)}
                placeholder="Enter your name"
                style={inputStyle(profileFocus === 'name')}
              />
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                value={profile?.email ?? ''}
                disabled
                style={{ ...inputBase, background: '#f9fafb', color: '#9ca3af', cursor: 'not-allowed' }}
              />
              <p style={{ fontSize: 11.5, color: '#c4c9d4', margin: '5px 0 0' }}>Email cannot be changed for security reasons.</p>
            </div>
            <div>
              <label style={labelStyle}>Member Since</label>
              <input
                value={profile ? new Date(profile.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                disabled
                style={{ ...inputBase, background: '#f9fafb', color: '#9ca3af', cursor: 'not-allowed' }}
              />
            </div>
            <button
              type="submit"
              disabled={savingProfile}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 0', background: savingProfile ? '#e0ddff' : 'linear-gradient(135deg,#6c63ff,#a78bfa)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: savingProfile ? 'not-allowed' : 'pointer' }}>
              {savingProfile ? 'Saving…' : <><CheckCircle size={15} /> Save Changes</>}
            </button>
          </form>
        </Section>

        {/* Change Password */}
        <Section icon={Lock} iconColor="#f59e0b" iconBg="#fffbeb" title="Change Password" subtitle="Keep your account secure">
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCur ? 'text' : 'password'}
                  value={curPwd}
                  onChange={(e) => setCurPwd(e.target.value)}
                  onFocus={() => setPwdFocus('cur')}
                  onBlur={() => setPwdFocus(null)}
                  placeholder="Enter current password"
                  style={{ ...inputStyle(pwdFocus === 'cur'), paddingRight: 42 }}
                />
                <button type="button" onClick={() => setShowCur(!showCur)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}>
                  {showCur ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label style={labelStyle}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  onFocus={() => setPwdFocus('new')}
                  onBlur={() => setPwdFocus(null)}
                  placeholder="At least 8 characters"
                  style={{ ...inputStyle(pwdFocus === 'new'), paddingRight: 42 }}
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}>
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Confirm New Password</label>
              <input
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                onFocus={() => setPwdFocus('confirm')}
                onBlur={() => setPwdFocus(null)}
                placeholder="Repeat new password"
                style={inputStyle(pwdFocus === 'confirm')}
              />
            </div>
            <button
              type="submit"
              disabled={savingPwd || !curPwd || !newPwd || !confirmPwd}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 0', background: (savingPwd || !curPwd || !newPwd || !confirmPwd) ? '#fde68a' : 'linear-gradient(135deg,#f59e0b,#fbbf24)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 700, cursor: (savingPwd || !curPwd || !newPwd || !confirmPwd) ? 'not-allowed' : 'pointer' }}>
              {savingPwd ? 'Updating…' : <><Lock size={15} /> Update Password</>}
            </button>
          </form>
        </Section>

        {/* Notification Preferences */}
        <Section icon={Bell} iconColor="#818cf8" iconBg="#eef2ff" title="Notifications" subtitle="Control when and how we alert you">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { id: 'email', label: 'Email Alerts', desc: 'Get email when a price drops to your target', value: notifEmail, set: setNotifEmail },
              { id: 'instant', label: 'Instant Notifications', desc: 'Notify immediately when price drops', value: notifInstant, set: setNotifInstant },
              { id: 'digest', label: 'Weekly Digest', desc: 'Weekly summary of your tracked products', value: notifDigest, set: setNotifDigest },
            ].map(({ id, label, desc, value, set }) => (
              <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#f9fafb', borderRadius: 12, border: '1px solid #f0f0f0' }}>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: '#0f1117', margin: 0 }}>{label}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>{desc}</p>
                </div>
                <button onClick={() => set(!value)}
                  style={{ width: 46, height: 26, borderRadius: 13, background: value ? '#6c63ff' : '#e5e7eb', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 3, left: value ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,.2)', transition: 'left .2s' }} />
                </button>
              </div>
            ))}
          </div>
        </Section>

        {/* WhatsApp */}
        <Section icon={MessageCircle} iconColor="#25d366" iconBg="#f0fdf4" title="WhatsApp Notifications" subtitle="Get price alerts on WhatsApp">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Status banner */}
            {waStatus.status === 'ready' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#f0fdf4', borderRadius: 12, border: '1px solid #bbf7d0' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#15803d', margin: 0 }}>WhatsApp Connected</p>
                  <p style={{ fontSize: 11.5, color: '#6b7280', margin: 0 }}>Ready to send notifications</p>
                </div>
              </div>
            ) : waStatus.status === 'qr' && waStatus.qrBase64 ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: '0 0 10px' }}>Scan with WhatsApp to connect</p>
                <img src={waStatus.qrBase64} alt="WhatsApp QR" style={{ width: 180, height: 180, borderRadius: 12, border: '1px solid #e5e7eb' }} />
                <p style={{ fontSize: 11.5, color: '#9ca3af', margin: '8px 0 0' }}>Open WhatsApp → Linked Devices → Link a Device</p>
                <button onClick={() => getWhatsAppStatus().then(setWaStatus).catch(() => {})}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10, padding: '6px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, color: '#6b7280', cursor: 'pointer' }}>
                  <RefreshCw size={12} /> Refresh status
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#fafafa', borderRadius: 12, border: '1px solid #e5e7eb' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: 0 }}>
                    {waStatus.status === 'initializing' ? 'WhatsApp initializing…' : waStatus.status === 'disconnected' ? 'WhatsApp disconnected' : 'WhatsApp unavailable'}
                  </p>
                  <p style={{ fontSize: 11.5, color: '#9ca3af', margin: 0 }}>Restart the server to see the QR code</p>
                </div>
              </div>
            )}

            {/* Phone number form */}
            <form onSubmit={handleSaveWhatsApp} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={labelStyle}>Your WhatsApp Number</label>
                <input
                  value={waNumber}
                  onChange={(e) => setWaNumber(e.target.value)}
                  onFocus={() => setProfileFocus('wa')}
                  onBlur={() => setProfileFocus(null)}
                  placeholder="+919876543210"
                  style={inputStyle(profileFocus === 'wa')}
                />
                <p style={{ fontSize: 11.5, color: '#c4c9d4', margin: '5px 0 0' }}>Include country code, e.g. +91 for India</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" disabled={savingWa}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 0', background: savingWa ? '#bbf7d0' : 'linear-gradient(135deg,#22c55e,#4ade80)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: savingWa ? 'not-allowed' : 'pointer' }}>
                  {savingWa ? 'Saving…' : <><CheckCircle size={14} /> Save Number</>}
                </button>
                {profile?.whatsapp_number && (
                  <button type="button"
                    disabled={testingWa || waStatus.status !== 'ready'}
                    onClick={async () => {
                      setTestingWa(true);
                      try {
                        await testWhatsApp();
                        toast.success('WhatsApp test message sent!');
                      } catch (err: any) {
                        toast.error(err?.response?.data?.error ?? 'Test failed');
                      } finally {
                        setTestingWa(false);
                      }
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: (testingWa || waStatus.status !== 'ready') ? '#f3f4f6' : '#fff', border: `1px solid ${waStatus.status === 'ready' ? '#22c55e' : '#e5e7eb'}`, borderRadius: 10, color: waStatus.status === 'ready' ? '#15803d' : '#9ca3af', fontSize: 13, fontWeight: 600, cursor: (testingWa || waStatus.status !== 'ready') ? 'not-allowed' : 'pointer' }}>
                    <Send size={13} /> {testingWa ? 'Sending…' : 'Test'}
                  </button>
                )}
              </div>
            </form>

          </div>
        </Section>

        {/* Security */}
        <Section icon={Shield} iconColor="#ec4899" iconBg="#fdf2f8" title="Security" subtitle="Manage your account security and test notifications">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Test email */}
            <div style={{ padding: '14px 16px', background: '#f0fdf4', borderRadius: 12, border: '1px solid #d1fae5' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: '#0f1117', margin: 0 }}>Test Email Notifications</p>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Send a test email to verify your SMTP setup</p>
                </div>
                <button
                  onClick={async () => {
                    setSendingTest(true);
                    try {
                      await api.post('/auth/test-email');
                      toast.success('Test email sent! Check your inbox.');
                    } catch {
                      toast.error('Failed to send test email. Check SMTP settings.');
                    } finally {
                      setSendingTest(false);
                    }
                  }}
                  disabled={sendingTest}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: sendingTest ? '#d1fae5' : '#10b981', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12.5, fontWeight: 600, cursor: sendingTest ? 'not-allowed' : 'pointer' }}>
                  <Send size={13} /> {sendingTest ? 'Sending…' : 'Send Test'}
                </button>
              </div>
            </div>

            <div style={{ padding: '14px 16px', background: '#f9fafb', borderRadius: 12, border: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: '#0f1117', margin: 0 }}>Two-Factor Authentication</p>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Add an extra layer of security</p>
                </div>
                <span style={{ padding: '3px 10px', background: '#fff7ed', borderRadius: 20, fontSize: 11, fontWeight: 600, color: '#f59e0b', border: '1px solid #fed7aa' }}>Coming Soon</span>
              </div>
            </div>
            <div style={{ padding: '14px 16px', background: '#f9fafb', borderRadius: 12, border: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: '#0f1117', margin: 0 }}>Active Sessions</p>
                  <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>1 active session</p>
                </div>
                <button
                  onClick={() => { clearAuth(); window.location.href = '/login'; }}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', background: '#fff', border: '1px solid #fee2e2', borderRadius: 8, color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  <LogOut size={13} /> Logout All
                </button>
              </div>
            </div>
            <div style={{ padding: '14px 16px', background: '#fff1f2', borderRadius: 12, border: '1px solid #fecdd3' }}>
              <p style={{ fontSize: 13.5, fontWeight: 600, color: '#be123c', margin: '0 0 4px' }}>Danger Zone</p>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 12px' }}>Permanently delete your account and all data. This action cannot be undone.</p>
              <button
                onClick={() => toast.error('Please contact support to delete your account.')}
                style={{ padding: '8px 16px', background: '#fff', border: '1.5px solid #fca5a5', borderRadius: 8, color: '#dc2626', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
                Delete Account
              </button>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
