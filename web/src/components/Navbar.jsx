import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DottedUnderline from './DottedUnderline';

const navLinks = [
  { title: 'Home', href: '/' },
  { title: 'Leaderboard', href: '/college' },
];

function isActive(pathname, href) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

/* Exactly mirrors the reference navbar.tsx structure:
   - Avatar icon + site title at top
   - Nav links row below with dotted underline on active */
export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav
      style={{
        maxWidth: '42rem',
        margin: '0 auto',
        padding: '1rem 1rem 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '1rem',
      }}
    >
      {/* Row 1: logo + title + theme + auth */}
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', gap: '0.75rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          {/* Box icon — mirrors the reference avatar */}
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: 'linear-gradient(to bottom, oklch(0.7 0.15 260), oklch(0.45 0.18 260))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            flexShrink: 0,
          }}>
            <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: 700, lineHeight: 1 }}>L</span>
          </div>
          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--foreground)',
            lineHeight: 1,
          }}>
            leetrank{' '}
            <span style={{ color: 'var(--foreground-40)', fontWeight: 400 }}>—</span>{' '}
            <span style={{ fontWeight: 400, fontStyle: 'italic', color: 'var(--foreground-70)' }}>compete</span>
          </h1>
        </Link>

        {/* Right: theme + auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={toggle}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: theme === 'dark' ? 'flex-end' : 'flex-start',
              width: 44,
              height: 24,
              borderRadius: 999,
              background: theme === 'dark' ? 'var(--surface-2)' : 'var(--border)',
              padding: 2,
              cursor: 'pointer',
              border: 'none',
              transition: 'background 0.3s ease',
            }}
            aria-label="Toggle theme"
          >
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 700, damping: 40 }}
              style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: theme === 'dark' ? '#000' : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }}
            >
              <motion.span
                key={theme}
                initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.2 }}
                style={{ fontSize: '0.7rem', lineHeight: 1 }}
              >
                {theme === 'dark' ? '🌙' : '☀️'}
              </motion.span>
            </motion.div>
          </button>
          {user ? (
            <>
              <Link to={`/profile/${user.id}`} style={{ fontSize: '0.8rem', color: 'var(--foreground-70)', textDecoration: 'none' }}>
                @{user.username}
              </Link>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ fontSize: '0.8rem', color: 'var(--foreground-70)', textDecoration: 'none' }}>login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">sign up</Link>
            </>
          )}
        </div>
      </div>

      {/* Row 2: nav links with dotted underline — exactly like reference */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {navLinks.map(link => {
          const active = isActive(location.pathname, link.href);
          return (
            <Link
              key={link.href}
              to={link.href}
              style={{
                position: 'relative',
                textDecoration: 'none',
                fontSize: '0.9rem',
                color: active ? 'var(--foreground)' : 'var(--foreground-70)',
                fontWeight: active ? 500 : 400,
                transition: 'color 0.15s',
                paddingBottom: '3px',
              }}
            >
              {link.title}
              <DottedUnderline visible={active} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
