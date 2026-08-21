import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

function StatCard({ label, value, sub, color }) {
  return (
    <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
      <p className="subheading" style={{ marginBottom: '0.5rem' }}>{label}</p>
      <p style={{ fontSize: '2rem', fontWeight: 700, color: color || 'var(--foreground)', lineHeight: 1 }}>{value ?? '—'}</p>
      {sub && <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.4rem' }}>{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users?limit=5&page=1'),
    ]).then(([s, u]) => {
      setStats(s.data);
      setRecentUsers(u.data.users || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const linkedPct = stats ? Math.round((stats.linkedUsers / stats.totalUsers) * 100) || 0 : 0;
  const lastSync = stats?.lastSync ? new Date(stats.lastSync).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never';

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 600, letterSpacing: '-0.02em' }}>Dashboard</h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Overview of Leeter platform stats
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          <StatCard label="Total Users" value={stats?.totalUsers} sub="all registered accounts" />
          <StatCard label="LeetCode Linked" value={stats?.linkedUsers} sub={`${linkedPct}% of total`} color="var(--easy)" />
          <StatCard label="Colleges" value={stats?.totalColleges} sub="institutions registered" />
          <StatCard label="Last Sync" value={lastSync} sub="LeetCode stats fetch" color="var(--medium)" />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Recent Signups</h3>
        <Link to="/users" className="btn btn-secondary btn-sm">View all →</Link>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>College</th>
              <th>LeetCode</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map(u => (
              <tr key={u.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/users/${u.id}`}>
                <td>
                  <span style={{ fontWeight: 500 }}>@{u.username}</span>
                  {u.email && <span style={{ color: 'var(--muted-foreground)', fontSize: '0.78rem', display: 'block' }}>{u.email}</span>}
                </td>
                <td style={{ color: 'var(--foreground-70)', fontSize: '0.82rem' }}>{u.colleges?.name || '—'}</td>
                <td>
                  {u.leetcode_username
                    ? <span className="badge badge-success">{u.leetcode_username}</span>
                    : <span className="badge badge-outline">not linked</span>}
                </td>
                <td style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem' }}>
                  {new Date(u.created_at).toLocaleDateString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
