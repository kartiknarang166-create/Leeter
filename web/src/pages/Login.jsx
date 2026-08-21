import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DottedSeparator } from '../components/DottedUnderline';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.username.trim(), form.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '28rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 className="subheading" style={{ marginBottom: '0.5rem' }}>Welcome back</h2>
          <p style={{ color: 'var(--foreground-70)', fontSize: '0.9375rem' }}>
            Sign in to your LeetRank account to track your LeetCode progress and compete with your college.
          </p>
        </div>

      <DottedSeparator style={{ margin: '1.5rem 0' }} />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label className="subheading" style={{ display: 'block', marginBottom: '0.4rem' }}>Username</label>
          <input
            className="input"
            id="login-username"
            type="text"
            placeholder="your_username"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            required
            autoFocus
            autoComplete="username"
          />
        </div>

        <div>
          <label className="subheading" style={{ display: 'block', marginBottom: '0.4rem' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              autoComplete="current-password"
              style={{ paddingRight: '2.5rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.25rem' }}>
          {loading ? 'Signing in…' : 'Sign In →'}
        </button>
      </form>

      <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--foreground-70)' }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color: 'var(--foreground)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
          Sign up
        </Link>
      </p>
    </div>
  );
}
