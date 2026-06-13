import { useEffect, useState } from 'react';
import { Search, X, ShieldCheck, ShieldOff, Loader2, Users as UsersIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { getUsers, updateUserRole, type AdminUser } from '../../api/admin';
import { useAuthStore } from '../../store/auth';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import toast from 'react-hot-toast';

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 20,
  border: '1px solid #eef0f6', boxShadow: '0 2px 12px rgba(0,0,0,.05)',
};

const navBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 34, height: 34, borderRadius: 10, border: '1.5px solid #eef0f6', background: '#fff',
};

const PAGE_SIZE = 20;

export default function AdminUsers() {
  const { isMobile } = useBreakpoint();
  const currentUserId = useAuthStore((s) => s.user?.id);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      getUsers({ page, limit: PAGE_SIZE, search: search.trim() || undefined })
        .then((res) => { setUsers(res.data); setPagination(res.pagination); })
        .catch(() => toast.error('Failed to load users'))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleToggleRole = async (target: AdminUser) => {
    const nextRole = target.role === 'admin' ? 'user' : 'admin';
    setUpdatingId(target.id);
    try {
      await updateUserRole(target.id, nextRole);
      setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, role: nextRole } : u)));
      toast.success(nextRole === 'admin' ? `${target.email} is now an admin` : `${target.email} is no longer an admin`);
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f1117', margin: 0, letterSpacing: '-.5px' }}>User Management</h1>
        <p style={{ fontSize: 13.5, color: '#9ca3af', marginTop: 4 }}>View platform accounts and manage admin access</p>
      </div>

      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1.5px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f1117', margin: 0 }}>All Users</h2>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '3px 0 0' }}>{pagination.total} account{pagination.total !== 1 ? 's' : ''}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8f9fc', border: '1.5px solid #eef0f6', borderRadius: 11, padding: '8px 14px', minWidth: isMobile ? '100%' : 240 }}>
            <Search size={13} color="#9ca3af" />
            <input
              type="text" value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by email or name…"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 12.5, color: '#374151' }}
            />
            {search && (
              <button onClick={() => handleSearchChange('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}>
                <X size={12} color="#9ca3af" />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 28, height: 28, border: '3px solid #eef0f6', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <UsersIcon size={44} color="#e5e7eb" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: '#9ca3af', margin: 0 }}>
              {search ? `No users matching "${search}"` : 'No users yet'}
            </p>
          </div>
        ) : (
          <div>
            {users.map((u, idx) => {
              const isSelf = u.id === currentUserId;
              const isAdmin = u.role === 'admin';
              const lockSelf = isSelf && isAdmin;
              return (
                <div key={u.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: isMobile ? '14px 18px' : '14px 22px',
                  borderBottom: idx < users.length - 1 ? '1px solid #f9fafb' : 'none',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg,#6c63ff,#a78bfa)',
                    color: '#fff', fontWeight: 700, fontSize: 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {(u.name?.[0] ?? u.email[0]).toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.name || u.email}
                      {isSelf && <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}> (you)</span>}
                    </p>
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.email} · joined {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  {!isMobile && (
                    <div style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0, width: 90, textAlign: 'center' }}>
                      {u.active_trackings} tracked
                    </div>
                  )}

                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 20, flexShrink: 0,
                    background: isAdmin ? 'rgba(108,99,255,.12)' : '#f3f4f6',
                    color: isAdmin ? '#6c63ff' : '#9ca3af',
                  }}>
                    {isAdmin ? 'Admin' : 'User'}
                  </span>

                  <button
                    onClick={() => handleToggleRole(u)}
                    disabled={updatingId === u.id || lockSelf}
                    title={lockSelf ? "You can't remove your own admin access" : undefined}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                      padding: '8px 14px', borderRadius: 10, border: '1.5px solid #eef0f6',
                      background: '#fff', fontSize: 12, fontWeight: 700,
                      color: lockSelf ? '#d1d5db' : isAdmin ? '#ef4444' : '#16a34a',
                      cursor: updatingId === u.id || lockSelf ? 'not-allowed' : 'pointer',
                    }}>
                    {updatingId === u.id
                      ? <Loader2 size={13} style={{ animation: 'spin .7s linear infinite' }} />
                      : isAdmin ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
                    {!isMobile && (isAdmin ? 'Remove Admin' : 'Make Admin')}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {pagination.pages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', borderTop: '1px solid #f9fafb' }}>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>Page {pagination.page} of {pagination.pages}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pagination.page <= 1}
                style={{ ...navBtn, opacity: pagination.page <= 1 ? 0.4 : 1, cursor: pagination.page <= 1 ? 'not-allowed' : 'pointer' }}>
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={pagination.page >= pagination.pages}
                style={{ ...navBtn, opacity: pagination.page >= pagination.pages ? 0.4 : 1, cursor: pagination.page >= pagination.pages ? 'not-allowed' : 'pointer' }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
