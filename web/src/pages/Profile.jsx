import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { DottedSeparator } from '../components/DottedUnderline';

export default function Profile() {
  const { userId } = useParams();
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMe = me?.id === userId;

  useEffect(() => {
    api.get(`/users/${userId}`)
      .then(res => setProfile(res.data))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="container" style={{ paddingTop: '2rem' }}><div className="skeleton" style={{ height: 120 }} /></div>;

  if (!profile) return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <p style={{ color: 'var(--muted-foreground)' }}>User not found. <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--foreground)', textDecoration: 'underline', textUnderlineOffset: '3px', fontFamily: 'inherit', fontSize: 'inherit' }}>Go back</button></p>
    </div>
  );

  const { user, stats, collegeRank } = profile;
  const easy = stats?.easy_solved || 0;
  const medium = stats?.medium_solved || 0;
  const hard = stats?.hard_solved || 0;
  const total = stats?.total_solved || 0;
  const badges = getBadges(stats);

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>
      <button onClick={() => navigate(-1)} style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '1.5rem', display: 'block', fontFamily: 'inherit' }}>
        ← Back
      </button>

      {/* Profile header - mirrors header.tsx prose style */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 10, flexShrink: 0,
          background: `hsl(${(user.username?.charCodeAt(0) * 73) % 360},55%,52%)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem', fontWeight: 700, color: 'white',
        }}>
          {user.username?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
              {user.display_name || user.username}
            </h1>
            {collegeRank === 1 && <span className="badge badge-outline">👑 #1 in college</span>}
            {isMe && <span className="badge badge-outline">you</span>}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '0.2rem' }}>
            @{user.username}
            {user.leetcode_username && (
              <> · <a href={`https://leetcode.com/${user.leetcode_username}`} target="_blank" rel="noreferrer"
                style={{ color: 'var(--foreground)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                lc/{user.leetcode_username}
              </a></>
            )}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '0.1rem' }}>
            🏫 {user.college?.name || '-'}
            {collegeRank && <span> · #{collegeRank} college rank</span>}
          </p>
        </div>
      </div>

      <DottedSeparator style={{ margin: '1.5rem 0' }} />

      {stats ? (
        <>
          {/* Stats - mirrors Work items layout */}
          <h2 className="subheading" style={{ marginBottom: '1rem' }}>Statistics</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Solved', value: total, desc: `${easy} easy · ${medium} medium · ${hard} hard` },
              { label: 'Global Ranking', value: stats.ranking ? `#${stats.ranking.toLocaleString()}` : '-', desc: 'on leetcode.com' },
              { label: 'Current Streak', value: `${stats.streak}🔥`, desc: `${stats.total_active_days || 0} total active days` },
              { label: 'Acceptance Rate', value: `${stats.acceptance_rate?.toFixed(1) || 0}%`, desc: 'across all submissions' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 500, fontSize: '0.9375rem', color: 'var(--foreground)', minWidth: 140 }}>{row.label}</span>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)', flexShrink: 0 }} />
                <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>{row.value}</span>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)', flexShrink: 0 }} />
                <span style={{ color: 'var(--foreground-70)', fontSize: '0.85rem' }}>{row.desc}</span>
              </div>
            ))}
          </div>

          <DottedSeparator style={{ margin: '1.5rem 0' }} />

          {/* Breakdown bars */}
          <h2 className="subheading" style={{ marginBottom: '1rem' }}>Problem Breakdown</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Easy', count: easy, color: 'var(--easy)' },
              { label: 'Medium', count: medium, color: 'var(--medium)' },
              { label: 'Hard', count: hard, color: 'var(--hard)' },
            ].map(b => (
              <div key={b.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.8rem' }}>
                  <span style={{ color: b.color, fontWeight: 500 }}>{b.label}</span>
                  <span style={{ color: 'var(--muted-foreground)' }}>{b.count}</span>
                </div>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 999 }}>
                  <div style={{ height: '100%', borderRadius: 999, width: `${total > 0 ? (b.count / total) * 100 : 0}%`, background: b.color, transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}
          </div>

          {badges.length > 0 && (
            <>
              <DottedSeparator style={{ margin: '1.5rem 0' }} />
              <h2 className="subheading" style={{ marginBottom: '0.75rem' }}>Achievements</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {badges.map(b => (
                  <span key={b.id} className="badge badge-outline" title={b.desc} style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>
                    {b.emoji} {b.name}
                  </span>
                ))}
              </div>
            </>
          )}

          {stats.fetched_at && (
            <p style={{ marginTop: '1.5rem', fontSize: '0.72rem', color: 'var(--foreground-40)' }}>
              Last synced: {new Date(stats.fetched_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
            </p>
          )}
        </>
      ) : (
        <div>
          <p style={{ color: 'var(--foreground-70)', fontSize: '0.9rem', lineHeight: 1.7 }}>
            {isMe
              ? 'You haven\'t linked a LeetCode account yet. Go to your college leaderboard and click "Link your LeetCode" to get started.'
              : 'This user hasn\'t linked their LeetCode account yet.'
            }
          </p>
          {isMe && user.college && (
            <Link to={`/college/${user.college.slug}`} className="btn btn-primary" style={{ display: 'inline-flex', marginTop: '1rem' }}>
              Go to leaderboard →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function getBadges(stats) {
  if (!stats) return [];
  const b = [];
  if (stats.total_solved >= 500) b.push({ id: 'titan', emoji: '⚡', name: 'Titan', desc: '500+ problems solved' });
  if (stats.total_solved >= 100) b.push({ id: 'century', emoji: '💯', name: 'Century Club', desc: '100+ problems solved' });
  if (stats.hard_solved >= 25) b.push({ id: 'hard-hitter', emoji: '🧱', name: 'Hard Hitter', desc: '25+ hard problems' });
  if (stats.streak >= 30) b.push({ id: 'consistent', emoji: '🎯', name: 'Consistent', desc: '30-day streak' });
  if (stats.streak >= 7) b.push({ id: 'on-fire', emoji: '🔥', name: 'On Fire', desc: '7-day streak' });
  if (stats.total_active_days >= 100) b.push({ id: 'dedicated', emoji: '🏆', name: 'Dedicated', desc: '100 active days' });
  return b;
}
