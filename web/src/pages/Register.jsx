import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { DottedSeparator } from '../components/DottedUnderline';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [form, setForm] = useState({ username: '', email: '', password: '', college_id: '', graduation_year: '' });
  const [collegeSearch, setCollegeSearch] = useState('');
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    api.get('/colleges').then(res => setColleges(res.data.colleges || [])).catch(() => {});
  }, []);

  const validate = () => {
    const e = {};
    if (!form.username || form.username.length < 3) e.username = 'Min 3 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Letters, numbers, underscores only';
    if (!form.email?.includes('@')) e.email = 'Valid email required';
    if (!form.password || form.password.length < 6) e.password = 'Min 6 characters';
    if (!form.college_id) e.college_id = 'Please search and select a valid college from the list';
    if (!form.graduation_year) e.graduation_year = 'Select your year';
    return e;
  };

  const searchWords = collegeSearch.toLowerCase().split(/\s+/).filter(Boolean);
  const filteredColleges = colleges
    .filter(c => {
      const targetText = `${c.name} ${c.slug} ${c.state || ''}`.toLowerCase();
      return searchWords.every(word => targetText.includes(word));
    })
    .sort((a, b) => {
      if (!collegeSearch) return 0;
      const score = (c) => {
        const name = c.name.toLowerCase();
        const s = collegeSearch.toLowerCase().trim();
        if (name.startsWith(s)) return 100;
        if (name.includes(` ${s}`)) return 80;
        if (name.includes(s)) return 50;
        return 0;
      };
      return score(b) - score(a);
    });

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '28rem' }}>
      <p style={{ color: 'var(--foreground)', fontSize: '1rem', lineHeight: 1.75 }}>
        Create your LeetRank account, pick your college, then link your LeetCode username
        to join the leaderboard. One LeetCode account per user - choose wisely.
      </p>

      <DottedSeparator style={{ margin: '1.5rem 0' }} />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label className="subheading" style={{ display: 'block', marginBottom: '0.4rem' }}>Username</label>
          <input
            className="input"
            id="username"
            type="text"
            placeholder="cool_coder_42"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            style={{ borderColor: errors.username ? 'var(--hard)' : undefined }}
          />
          {errors.username && <p style={{ fontSize: '0.75rem', color: 'var(--hard)', marginTop: '0.25rem' }}>{errors.username}</p>}
        </div>

        <div>
          <label className="subheading" style={{ display: 'block', marginBottom: '0.4rem' }}>Email</label>
          <input
            className="input"
            id="email"
            type="email"
            placeholder="you@college.edu"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            style={{ borderColor: errors.email ? 'var(--hard)' : undefined }}
          />
          {errors.email && <p style={{ fontSize: '0.75rem', color: 'var(--hard)', marginTop: '0.25rem' }}>{errors.email}</p>}
        </div>

        <div>
          <label className="subheading" style={{ display: 'block', marginBottom: '0.4rem' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              style={{ borderColor: errors.password ? 'var(--hard)' : undefined, paddingRight: '2.5rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password && <p style={{ fontSize: '0.75rem', color: 'var(--hard)', marginTop: '0.25rem' }}>{errors.password}</p>}
        </div>

        <div>
          <label className="subheading" style={{ display: 'block', marginBottom: '0.4rem' }}>College</label>
          <div style={{ position: 'relative' }}>
            <input
              className="input"
              id="college_id"
              placeholder="Type to search your college…"
              value={collegeSearch}
              onChange={e => {
                setCollegeSearch(e.target.value);
                setShowCollegeDropdown(true);
                if (form.college_id) setForm(f => ({ ...f, college_id: '' }));
              }}
              onFocus={() => setShowCollegeDropdown(true)}
              onBlur={() => setTimeout(() => setShowCollegeDropdown(false), 200)}
              style={{ borderColor: errors.college_id ? 'var(--hard)' : undefined }}
            />
            {showCollegeDropdown && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, 
                maxHeight: 220, overflowY: 'auto', background: 'var(--surface)', 
                border: '1px solid var(--border)', borderRadius: 'var(--radius)', 
                zIndex: 10, marginTop: '0.25rem', padding: '0.25rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                {filteredColleges.length > 0 ? filteredColleges.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setForm(f => ({ ...f, college_id: c.id }));
                      setCollegeSearch(c.name);
                      setShowCollegeDropdown(false);
                    }}
                    style={{
                      display: 'block', width: '100%', padding: '0.5rem', 
                      textAlign: 'left', background: form.college_id === c.id ? 'var(--surface-2)' : 'transparent', 
                      border: 'none', cursor: 'pointer', borderRadius: '4px',
                      color: 'var(--foreground)', fontSize: '0.875rem'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = form.college_id === c.id ? 'var(--surface-2)' : 'transparent'}
                  >
                    {c.name}
                  </button>
                )) : (
                  <div style={{ padding: '0.5rem', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>No colleges found</div>
                )}
              </div>
            )}
          </div>
          {errors.college_id && <p style={{ fontSize: '0.75rem', color: 'var(--hard)', marginTop: '0.25rem' }}>{errors.college_id}</p>}
        </div>

        <div>
          <label className="subheading" style={{ display: 'block', marginBottom: '0.4rem' }}>Year</label>
          <select
            className="input"
            value={form.graduation_year}
            onChange={e => setForm(f => ({ ...f, graduation_year: e.target.value }))}
            style={{ borderColor: errors.graduation_year ? 'var(--hard)' : undefined, cursor: 'pointer' }}
          >
            <option value="">Select your year…</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
            <option value="Graduated">Graduated</option>
          </select>
          {errors.graduation_year && <p style={{ fontSize: '0.75rem', color: 'var(--hard)', marginTop: '0.25rem' }}>{errors.graduation_year}</p>}
        </div>

        <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', lineHeight: 1.6, marginTop: '0.25rem' }}>
          After signing up, link your LeetCode username from the leaderboard page. You can only link one account - it cannot be changed.
        </p>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating account…' : 'Create Account →'}
        </button>
      </form>

      <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--foreground-70)' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--foreground)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>Sign in</Link>
      </p>
    </div>
  );
}
