import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';

function getGraduationYears() {
  const base = new Date().getFullYear();
  return Array.from({ length: 7 }, (_, i) => base + i);
}

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const graduationYears = getGraduationYears();

  useEffect(() => {
    Promise.all([
      api.get(`/admin/users/${id}`),
      api.get('/admin/colleges'),
    ]).then(([u, c]) => {
      setUser(u.data.user);
      setColleges(c.data.colleges || []);
      setForm({
        username: u.data.user.username || '',
        email: u.data.user.email || '',
        display_name: u.data.user.display_name || '',
        college_id: u.data.user.college_id || '',
        graduation_year: u.data.user.graduation_year || '',
        leetcode_username: u.data.user.leetcode_username || '',
      });
    }).catch(() => toast.error('Failed to load user')).finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.graduation_year) payload.graduation_year = parseInt(payload.graduation_year, 10);
      else payload.graduation_year = null;
      await api.patch(`/admin/users/${id}`, payload);
      toast.success('User updated!');
      navigate('/users');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await api.post(`/admin/sync/${id}`);
      toast.success(`Synced! ${res.data.stats?.total_solved} solved`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete @${user.username}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      navigate('/users');
    } catch {
      toast.error('Delete failed');
    }
  };

  if (loading) return (
    <div className="container" style={{ paddingTop: '3rem' }}>
      {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 40, marginBottom: '1rem', borderRadius: 8 }} />)}
    </div>
  );

  if (!user) return <div className="container" style={{ paddingTop: '3rem', color: 'var(--muted-foreground)' }}>User not found.</div>;

  const stats = Array.isArray(user.leetcode_stats)
    ? user.leetcode_stats.sort((a, b) => new Date(b.fetched_at) - new Date(a.fetched_at))[0]
    : user.leetcode_stats;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '36rem' }}>
      <button onClick={() => navigate('/users')} className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
        ← Back to Users
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600 }}>@{user.username}</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>
            Joined {new Date(user.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {user.leetcode_username && (
            <button className="btn btn-secondary btn-sm" onClick={handleSync} disabled={syncing}>
              {syncing ? 'Syncing…' : '⟳ Sync LC'}
            </button>
          )}
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete User</button>
        </div>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total', value: stats.total_solved, color: 'var(--foreground)' },
            { label: 'Easy', value: stats.easy_solved, color: 'var(--easy)' },
            { label: 'Medium', value: stats.medium_solved, color: 'var(--medium)' },
            { label: 'Hard', value: stats.hard_solved, color: 'var(--hard)' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '0.75rem', textAlign: 'center' }}>
              <p className="subheading" style={{ marginBottom: '0.25rem' }}>{s.label}</p>
              <p style={{ fontSize: '1.4rem', fontWeight: 700, color: s.color }}>{s.value ?? 0}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="subheading" style={{ display: 'block', marginBottom: '0.35rem' }}>Username</label>
            <input className="input" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
          </div>
          <div>
            <label className="subheading" style={{ display: 'block', marginBottom: '0.35rem' }}>Display Name</label>
            <input className="input" value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className="subheading" style={{ display: 'block', marginBottom: '0.35rem' }}>Email</label>
          <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="subheading" style={{ display: 'block', marginBottom: '0.35rem' }}>College</label>
            <select className="input" value={form.college_id} onChange={e => setForm(f => ({ ...f, college_id: e.target.value }))}>
              <option value="">No college</option>
              {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="subheading" style={{ display: 'block', marginBottom: '0.35rem' }}>Graduation Year</label>
            <select className="input" value={form.graduation_year} onChange={e => setForm(f => ({ ...f, graduation_year: e.target.value }))}>
              <option value="">Not set</option>
              {graduationYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="subheading" style={{ display: 'block', marginBottom: '0.35rem' }}>LeetCode Username</label>
          <input className="input" value={form.leetcode_username} placeholder="not linked" onChange={e => setForm(f => ({ ...f, leetcode_username: e.target.value }))} />
          <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
            Editing this overrides the linked account. Use "Sync LC" to refresh stats after changing.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/users')}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
