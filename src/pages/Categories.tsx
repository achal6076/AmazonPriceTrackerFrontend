import { useEffect, useState } from 'react';
import { Tag, Plus, Trash2, ExternalLink, Link2, X, Loader2, FolderOpen } from 'lucide-react';
import { getCategories, addCategory, deleteCategory, type Category } from '../api/categories';
import { useBreakpoint } from '../hooks/useBreakpoint';
import toast from 'react-hot-toast';

const POPULAR = [
  { name: 'Electronics',              url: 'https://www.amazon.in/s?i=electronics' },
  { name: 'Mobile Phones',            url: 'https://www.amazon.in/s?i=mobile' },
  { name: 'Laptops',                  url: 'https://www.amazon.in/s?i=computers' },
  { name: 'Headphones & Earphones',   url: 'https://www.amazon.in/s?rh=n%3A1388921031' },
  { name: 'Smart TVs',                url: 'https://www.amazon.in/s?i=electronics&rh=n%3A1389396031' },
  { name: 'Books',                    url: 'https://www.amazon.in/s?i=stripbooks' },
];

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 20,
  border: '1px solid #eef0f6', boxShadow: '0 2px 12px rgba(0,0,0,.05)',
};

export default function Categories() {
  const { isMobile, isTablet } = useBreakpoint();
  const isSmall = isMobile || isTablet;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [name, setName]             = useState('');
  const [url, setUrl]               = useState('');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm]     = useState(false);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const c = await addCategory({ name: name.trim(), url: url.trim() || undefined, description: description.trim() || undefined });
      setCategories(prev => [c, ...prev]);
      setName(''); setUrl(''); setDescription(''); setShowForm(false);
      toast.success(`"${c.name}" added to watched categories`);
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Failed to add category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    setDeletingId(id);
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success(`"${catName}" removed`);
    } catch {
      toast.error('Failed to remove category');
    } finally {
      setDeletingId(null);
    }
  };

  const handleQuickAdd = async (popular: { name: string; url: string }) => {
    if (categories.some(c => c.name === popular.name)) {
      toast.error('Already watching this category');
      return;
    }
    setSaving(true);
    try {
      const c = await addCategory(popular);
      setCategories(prev => [c, ...prev]);
      toast.success(`"${c.name}" added`);
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Failed to add');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f1117', margin: 0, letterSpacing: '-.5px' }}>Watched Categories</h1>
          <p style={{ fontSize: 13.5, color: '#9ca3af', marginTop: 4 }}>Save Amazon categories to monitor and browse deals</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '11px 20px', borderRadius: 13, border: 'none',
          background: showForm ? '#f3f4f6' : 'linear-gradient(135deg,#6c63ff,#a78bfa)',
          color: showForm ? '#6b7280' : '#fff', fontSize: 13.5, fontWeight: 700,
          cursor: 'pointer', boxShadow: showForm ? 'none' : '0 4px 14px rgba(108,99,255,.35)',
        }}>
          {showForm ? <><X size={14} /> Cancel</> : <><Plus size={15} /> Add Category</>}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ ...card, padding: '22px 24px' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f1117', margin: '0 0 18px' }}>Add a Category</h2>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: isSmall ? '1fr' : '1fr 1fr', gap: 12 }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 7 }}>Category Name *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#f8f9fc', border: '1.5px solid #eef0f6', borderRadius: 12, padding: '10px 14px' }}>
                  <Tag size={14} color="#9ca3af" style={{ flexShrink: 0 }} />
                  <input
                    value={name} required
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Electronics, Mobile Phones…"
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#374151' }}
                  />
                </div>
              </div>
              {/* URL */}
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 7 }}>Amazon Category URL (optional)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#f8f9fc', border: '1.5px solid #eef0f6', borderRadius: 12, padding: '10px 14px' }}>
                  <Link2 size={14} color="#9ca3af" style={{ flexShrink: 0 }} />
                  <input
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://www.amazon.in/s?i=…"
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#374151', minWidth: 0 }}
                  />
                  {url && <button type="button" onClick={() => setUrl('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexShrink: 0 }}><X size={12} color="#9ca3af" /></button>}
                </div>
              </div>
            </div>
            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 7 }}>Notes (optional)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                placeholder="Any notes about what you're watching in this category…"
                style={{ width: '100%', background: '#f8f9fc', border: '1.5px solid #eef0f6', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#374151', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={saving || !name.trim()} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 12, border: 'none',
                background: saving || !name.trim() ? '#e5e7eb' : 'linear-gradient(135deg,#6c63ff,#a78bfa)',
                color: saving || !name.trim() ? '#9ca3af' : '#fff', fontSize: 13.5, fontWeight: 700,
                cursor: saving || !name.trim() ? 'not-allowed' : 'pointer',
                boxShadow: !saving && name.trim() ? '0 4px 14px rgba(108,99,255,.35)' : 'none',
              }}>
                {saving ? <><Loader2 size={14} style={{ animation: 'spin .7s linear infinite' }} /> Saving…</> : <><Plus size={14} /> Add Category</>}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '11px 20px', borderRadius: 12, border: '1.5px solid #eef0f6', background: '#fff', color: '#6b7280', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Popular suggestions */}
      <div style={{ ...card, padding: '20px 22px' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f1117', margin: '0 0 14px' }}>Popular Categories</h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : isTablet ? 'repeat(3,1fr)' : 'repeat(6,1fr)', gap: 10 }}>
          {POPULAR.map(p => {
            const already = categories.some(c => c.name === p.name);
            return (
              <button key={p.name} onClick={() => handleQuickAdd(p)} disabled={already || saving}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  padding: '14px 10px', borderRadius: 14, border: `1.5px solid ${already ? '#bbf7d0' : '#eef0f6'}`,
                  background: already ? '#f0fdf4' : '#fafbfc',
                  cursor: already ? 'default' : 'pointer',
                  transition: 'all .15s',
                }}
                onMouseEnter={e => { if (!already) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#a78bfa'; (e.currentTarget as HTMLButtonElement).style.background = '#faf5ff'; } }}
                onMouseLeave={e => { if (!already) { (e.currentTarget as HTMLButtonElement).style.borderColor = '#eef0f6'; (e.currentTarget as HTMLButtonElement).style.background = '#fafbfc'; } }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: already ? '#dcfce7' : '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Tag size={18} color={already ? '#16a34a' : '#818cf8'} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: already ? '#16a34a' : '#374151', textAlign: 'center', lineHeight: 1.3 }}>{p.name}</span>
                {already && <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 700 }}>✓ Watching</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Watched list */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1.5px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f1117', margin: 0 }}>Your Watched Categories</h2>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '3px 0 0' }}>{categories.length} categor{categories.length !== 1 ? 'ies' : 'y'} saved</p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 52 }}>
            <div style={{ width: 26, height: 26, border: '3px solid #eef0f6', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
          </div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '52px 24px' }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg,#faf5ff,#ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(167,139,250,.2)' }}>
              <FolderOpen size={28} color="#a78bfa" strokeWidth={1.6} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#374151', margin: 0 }}>No categories watched yet</p>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: '6px 0 0', lineHeight: 1.6 }}>
              Add a category above or click a popular suggestion<br />to start tracking deals in that category.
            </p>
          </div>
        ) : (
          <div>
            {categories.map((cat, idx) => (
              <div key={cat.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: isSmall ? '14px 18px' : '16px 22px',
                borderBottom: idx < categories.length - 1 ? '1px solid #f9fafb' : 'none',
                transition: 'background .1s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fafbfc')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>

                <div style={{ width: 44, height: 44, borderRadius: 13, background: 'linear-gradient(135deg,#eef2ff,#ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Tag size={19} color="#818cf8" />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>{cat.name}</p>
                  {cat.description && (
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.description}</p>
                  )}
                  <p style={{ fontSize: 11.5, color: '#c4c9d4', margin: '3px 0 0' }}>
                    Added {new Date(cat.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {cat.url && (
                    <a href={cat.url} target="_blank" rel="noreferrer" style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 14px', borderRadius: 10, textDecoration: 'none',
                      background: '#eef2ff', color: '#6c63ff', fontSize: 12.5, fontWeight: 700,
                    }}>
                      <ExternalLink size={12} />
                      {!isMobile && 'Browse'}
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    disabled={deletingId === cat.id}
                    style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 36, height: 36, borderRadius: 10, border: 'none',
                      background: deletingId === cat.id ? '#f3f4f6' : '#fff',
                      border: '1.5px solid #eef0f6',
                      color: '#9ca3af', cursor: deletingId === cat.id ? 'not-allowed' : 'pointer',
                      transition: 'all .15s',
                    } as React.CSSProperties}
                    onMouseEnter={e => { if (deletingId !== cat.id) { (e.currentTarget as HTMLButtonElement).style.background = '#fef2f2'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#fecaca'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; } }}
                    onMouseLeave={e => { if (deletingId !== cat.id) { (e.currentTarget as HTMLButtonElement).style.background = '#fff'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#eef0f6'; (e.currentTarget as HTMLButtonElement).style.color = '#9ca3af'; } }}>
                    {deletingId === cat.id
                      ? <Loader2 size={14} style={{ animation: 'spin .7s linear infinite' }} />
                      : <Trash2 size={14} />
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
