import { Link } from 'react-router-dom';
import { DottedSeparator } from '../components/DottedUnderline';

export default function Landing() {
  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Header — prose intro */}
      <Header />

      {/* CTA Button */}
      <div style={{ marginTop: '2.5rem' }}>
        <Link to="/college" className="btn btn-primary btn-lg">
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
        {' '}— so every problem you solve counts.
      </p>
      <p style={{ color: 'var(--foreground-70)', fontSize: '1rem', lineHeight: 1.75, marginTop: '1rem' }}>
        Sign up, link your LeetCode account once, and you're on the board. No fluff — just
        rankings, streaks, and the satisfaction of climbing past your classmates.
      </p>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { emoji: '🏫', title: 'Pick your college', desc: 'Find your institution from our list.' },
    { emoji: '📝', title: 'Create an account', desc: 'Username + password — no OAuth.' },
    { emoji: '🔗', title: 'Link LeetCode once', desc: 'One username per account, locked in.' },
    { emoji: '🏆', title: 'Compete daily', desc: 'Stats sync at 12 PM IST every day.' },
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
              fontSize: '0.9rem',
              border: '1px solid var(--border)',
            }}>
              {s.emoji}
            </div>
            <span style={{ fontWeight: 500, fontSize: '0.9375rem', color: 'var(--foreground)' }}>
              {s.title}
            </span>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }} />
            <span style={{ color: 'var(--foreground-70)', fontSize: '0.9rem' }}>{s.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
