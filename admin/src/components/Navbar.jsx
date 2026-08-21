import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

const navLinks = [
  { title: 'Dashboard', href: '/' },
  { title: 'Users', href: '/users' },
  { title: 'Colleges', href: '/colleges' },
];

function isActive(pathname, href) {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav style={{
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: '3rem', gap: '1.5rem' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6,
            background: 'linear-gradient(to bottom, oklch(0.7 0.15 260), oklch(0.45 0.18 260))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)', flexShrink: 0,
          }}>
            <span style={{ color: 'white', fontSize: '0.65rem', fontWeight: 700 }}>L</span>
          </div>
          <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--foreground)', letterSpacing: '-0.01em' }}>
            Leeter{' '}
            <span style={{ fontWeight: 400, color: 'var(--foreground-40)', fontSize: '0.8rem' }}>admin</span>
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
          {navLinks.map(link => {
            const active = isActive(location.pathname, link.href);
            return (
              <Link
                key={link.href}
                to={link.href}
                style={{
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  color: active ? 'var(--foreground)' : 'var(--foreground-70)',
                  fontWeight: active ? 600 : 400,
                  borderBottom: active ? '2px solid var(--foreground)' : '2px solid transparent',
                  paddingBottom: '2px',
                  transition: 'color 0.15s',
                }}
              >
                {link.title}
              </Link>
            );
          })}
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-secondary btn-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
