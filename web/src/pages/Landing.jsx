import { Link } from 'react-router-dom';
import { DottedSeparator } from '../components/DottedUnderline';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();
  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Header - prose intro */}
      <Header />

      {/* CTA Button */}
      <div style={{ marginTop: '2.5rem' }}>
        <Link to={user?.college?.slug ? `/college/${user.college.slug}` : "/college"} className="btn btn-primary btn-lg">
          View Leaderboards →
        </Link>
      </div>

      <DottedSeparator style={{ margin: '3rem 0' }} />

      {/* How it works */}
      <HowItWorks />
    </div>
  );
}

function Header() {
  return (
    <div style={{ maxWidth: '38rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--foreground)', marginBottom: '1.25rem', lineHeight: 1.1 }}>
        Compete with your college on LeetCode
      </h1>
      <p style={{ color: 'var(--foreground-70)', fontSize: '1rem', lineHeight: 1.75 }}>
        Track your progress and compete with peers from your institution.
        Rankings update every day at{' '}
        <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>12 PM IST</span>
        {' '}- so every problem you solve counts.
      </p>
      <p style={{ color: 'var(--foreground-70)', fontSize: '1rem', lineHeight: 1.75, marginTop: '1rem' }}>
        Sign up, link your LeetCode account once, and you're on the board. No fluff - just
        rankings, streaks, and the satisfaction of climbing past your classmates.
      </p>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
          <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
        </svg>
      ),
      title: 'Pick your college',
      desc: 'Find your institution from our list.',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      title: 'Create an account',
      desc: 'Username + password - no OAuth.',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      ),
      title: 'Link LeetCode once',
      desc: 'One username per account, locked in.',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
      ),
      title: 'Compete daily',
      desc: 'Stats sync at 12 PM IST every day.',
    },
  ];

  return (
    <div>
      <h2 className="subheading" style={{ marginBottom: '1rem' }}>How it works</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 6, flexShrink: 0,
              background: 'var(--surface-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--foreground-70)',
              border: '1px solid var(--border)',
            }}>
              {s.icon}
            </div>
            <span style={{ fontWeight: 500, fontSize: '0.9375rem', color: 'var(--foreground)' }}>
              {s.title}
            </span>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)', flexShrink: 0 }} />
            <span style={{ color: 'var(--foreground-70)', fontSize: '0.9rem' }}>{s.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
