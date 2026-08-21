import { useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { DottedSeparator } from '../components/DottedUnderline';
import toast from 'react-hot-toast';

export default function AddUsernameModal({ onClose, onSuccess }) {
  const { refreshUser } = useAuth();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/users/leetcode-username', { leetcode_username: username.trim() });
      toast.success(`Linked! ${res.data.stats?.total_solved || 0} problems found.`);
      await refreshUser();
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to link account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'oklch(0 0 0 / 40%)', backdropFilter: 'blur(3px)', zIndex: 200 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 201, width: 'calc(100% - 2rem)', maxWidth: 420,
        background: 'var(--background)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '1.5rem',
        boxShadow: '0 8px 40px oklch(0 0 0 / 20%)',
        animation: 'fadeInUp 0.2s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <h2 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--foreground)' }}>Link your LeetCode</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', fontSize: '1.1rem', lineHeight: 1, padding: '0 0.25rem' }}>×</button>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--foreground-70)', lineHeight: 1.65, marginBottom: '1rem' }}>
          Enter your public LeetCode username. This can only be set once and cannot be changed.
          Make sure your profile is public.
        </p>

        <DottedSeparator style={{ margin: '0 0 1rem' }} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <label className="subheading" style={{ display: 'block', marginBottom: '0.4rem' }}>LeetCode Username</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', flexShrink: 0 }}>leetcode.com/u/</span>
              <input
                className="input"
                type="text"
                placeholder="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !username.trim()} style={{ flex: 2 }}>
              {loading ? 'Verifying…' : 'Link Account →'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
