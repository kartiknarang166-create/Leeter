import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!secret.trim()) return;
    setLoading(true);
    try {
      await login(secret.trim());
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Invalid secret');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--background)', padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '22rem', animation: 'fadeInUp 0.3s ease both' }}>
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(to bottom, oklch(0.7 0.15 260), oklch(0.45 0.18 260))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}>
            <span style={{ color: 'white', fontSize: '1.1rem', fontWeight: 700 }}>L</span>
          </div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 600, letterSpacing: '-0.02em' }}>Leeter Admin</h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem', marginTop: '0.35rem' }}>
            Enter your admin secret to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="subheading" style={{ display: 'block', marginBottom: '0.4rem' }}>Admin Secret</label>
            <input
              className="input"
              id="secret"
              type="password"
              placeholder="••••••••••••"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading || !secret}>
            {loading ? 'Verifying…' : 'Enter Admin Portal →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--foreground-40)', marginTop: '1.5rem' }}>
          Set <code>ADMIN_SECRET</code> in backend <code>.env</code>
        </p>
      </div>
    </div>
  );
}
