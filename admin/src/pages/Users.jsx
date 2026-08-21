import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const LIMIT = 25;

  const fetchUsers = useCallback(() => {
    setLoading(true);
    api.get(`/admin/users?search=${encodeURIComponent(search)}&page=${page}&limit=${LIMIT}`)
      .then(res => { setUsers(res.data.users || []); setTotal(res.data.total || 0); })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const handleDelete = async (id, username, e) => {
    e.stopPropagation();
    if (!confirm(`Delete @${username}? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success(`@${username} deleted`);
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, letterSpacing: '-0.02em' }}>Users</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {total.toLocaleString()} total users
          </p>
        </div>
        <input
          className="input"
          style={{ maxWidth: '18rem' }}
          placeholder="Search by username, email, LeetCode..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="card" style={{ overflow: 'auto' }}>
        <table style={{ minWidth: '50rem' }}>
          <thead>
            <tr>
              <th>#</th>
              <th>Username</th>
              <th>Email</th>
              <th>College</th>
              <th>Grad Year</th>
              <th>LeetCode</th>
              <th>Solved</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 16, borderRadius: 4 }} /></td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--muted-foreground)', padding: '2rem' }}>No users found</td></tr>
            ) : (
              users.map((u, i) => (
                <tr
                  key={u.id}
                  style={{ cursor: 'pointer', animation: `fadeInUp 0.2s ease ${i * 0.02}s both` }}
                  onClick={() => navigate(`/users/${u.id}`)}
                >
                  <td style={{ color: 'var(--foreground-40)', fontSize: '0.78rem' }}>{(page - 1) * LIMIT + i + 1}</td>
                  <td style={{ fontWeight: 500 }}>@{u.username}</td>
                  <td style={{ color: 'var(--foreground-70)', fontSize: '0.82rem' }}>{u.email}</td>
                  <td style={{ fontSize: '0.82rem' }}>{u.colleges?.name || '—'}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)' }}>{u.graduation_year || '—'}</td>
                  <td>
                    {u.leetcode_username
                      ? <span className="badge badge-success">{u.leetcode_username}</span>
                      : <span className="badge badge-outline">not linked</span>}
                  </td>
                  <td style={{ fontSize: '0.82rem', fontWeight: 500 }}>
                    {u.leetcode_stats?.total_solved ?? '—'}
                  </td>
                  <td style={{ color: 'var(--muted-foreground)', fontSize: '0.78rem' }}>
                    {new Date(u.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/users/${u.id}`)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={e => handleDelete(u.id, u.username, e)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Page {page} of {totalPages}</span>
          <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
