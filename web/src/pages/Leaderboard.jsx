import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../lib/api';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { DottedSeparator } from '../components/DottedUnderline';
import AddUsernameModal from '../components/AddUsernameModal';
import toast from 'react-hot-toast';

const SORT_OPTIONS = [
  { key: 'total_solved', label: 'Total Solved' },
  { key: 'hard_solved', label: 'Hard' },
  { key: 'streak', label: 'Streak' },
  { key: 'ranking', label: 'Global Rank' },
];

export default function Leaderboard() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('total_solved');
  const [yearFilter, setYearFilter] = useState('');
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const channelRef = useRef(null);

  // Read ?compare=id1,id2 from URL
  const compareParam = new URLSearchParams(location.search).get('compare');
  const compareIds = compareParam ? compareParam.split(',').filter(Boolean) : [];

  const fetchLeaderboard = () => {
    setLoading(true);
    let url = `/leaderboard/${slug}?sort=${sort}`;
    if (yearFilter) url += `&year=${encodeURIComponent(yearFilter)}`;
    api.get(url)
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load leaderboard'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    supabase.from('daily_challenges').select('*').eq('date', today).maybeSingle()
      .then(({ data }) => { if (data) setDailyChallenge(data); });
  }, []);

  useEffect(() => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    const channel = supabase.channel(`lb-${slug}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leetcode_stats' }, () => {
        setIsLive(true);
        const url = `/leaderboard/${slug}?sort=${sort}${yearFilter ? `&year=${encodeURIComponent(yearFilter)}` : ''}`;
        api.get(url).then(res => { setData(res.data); toast('Rankings updated'); }).catch(() => {});
        setTimeout(() => setIsLive(false), 3000);
      })
      .subscribe();
    channelRef.current = channel;
    return () => supabase.removeChannel(channel);
  }, [slug, sort, yearFilter]);

  useEffect(() => { fetchLeaderboard(); }, [slug, sort, yearFilter]);

  const handleRowClick = (userId) => {
    if (compareMode) {
      setSelected(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : prev.length >= 2 ? [prev[1], userId] : [...prev, userId]);
    } else {
      navigate(`/profile/${userId}`);
    }
  };

  if (!loading && !data) return (
    <div className="container" style={{ paddingTop: '3rem' }}>
      <p style={{ color: 'var(--muted-foreground)' }}>College not found. <Link to="/" style={{ color: 'var(--foreground)' }}>Go home →</Link></p>
    </div>
  );

  const college = data?.college;
  const leaderboard = data?.leaderboard || [];
  const cs = data?.collegeStats;

  // Resolve compare entries from loaded leaderboard
  const compareEntries = compareIds.length === 2
    ? compareIds.map(id => leaderboard.find(e => e.user.id === id)).filter(Boolean)
    : [];

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>

      {/* Back link */}
      <Link to="/college" style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', textDecoration: 'none', display: 'inline-block', marginBottom: '1.5rem' }}>
        ← All Colleges
      </Link>

      {/* College heading */}
      {loading && !college ? (
        <div className="skeleton" style={{ height: 32, width: 240, marginBottom: '1rem' }} />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: `linear-gradient(to bottom, hsl(${(college?.name?.charCodeAt(0) * 47) % 360},60%,55%), hsl(${(college?.name?.charCodeAt(0) * 47) % 360},60%,42%))`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 700, color: 'white',
          }}>
            {college?.name?.charAt(0)}
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--foreground)' }}>
              {college?.name}
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', marginTop: 1 }}>
              {cs?.total_members || 0} members · avg {cs?.avg_solved || 0} solved ·{' '}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: isLive ? '#22c55e' : 'var(--border)', display: 'inline-block', transition: 'background 0.3s' }} />
                {isLive ? 'updating…' : 'live'}
              </span>
            </p>
          </div>
        </div>
      )}

      <DottedSeparator style={{ margin: '1.25rem 0' }} />

      {/* Head-to-head panel - shown when ?compare=id1,id2 is in URL */}
      {compareEntries.length === 2 && (
        <>
          <HeadToHead
            a={compareEntries[0]}
            b={compareEntries[1]}
            onClose={() => navigate(`/college/${slug}`)}
          />
          <DottedSeparator style={{ margin: '1.25rem 0' }} />
        </>
      )}

      {/* Daily challenge */}
      {dailyChallenge && (
        <div style={{ marginBottom: '1.5rem', padding: '0.75rem 1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <span className="subheading" style={{ display: 'block', marginBottom: '0.2rem' }}>Today's Challenge</span>
            <span style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--foreground)' }}>{dailyChallenge.title}</span>
            {' '}<span className={`badge badge-${dailyChallenge.difficulty?.toLowerCase()}`}>{dailyChallenge.difficulty}</span>
          </div>
          <a href={`https://leetcode.com${dailyChallenge.link || ''}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
            Solve →
          </a>
        </div>
      )}

      {/* Action bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <div>
          {user ? (
            !user.leetcode_username ? (
              <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">+ Link your LeetCode</button>
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                Linked: <span style={{ color: 'var(--foreground)' }}>@{user.leetcode_username}</span>
              </span>
            )
          ) : (
            <Link to="/register" className="btn btn-primary btn-sm">Join leaderboard →</Link>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowYearDropdown(s => !s)}
              className={`btn btn-sm ${yearFilter ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', height: 'auto', minHeight: '28px' }}
            >
              {yearFilter ? `Class of ${yearFilter}` : 'All Years'} <span style={{ opacity: 0.5, marginLeft: 4 }}>▾</span>
            </button>
            {showYearDropdown && (
              <>
                <div 
                  onClick={() => setShowYearDropdown(false)} 
                  style={{ position: 'fixed', inset: 0, zIndex: 40 }} 
                />
                <div 
                  style={{
                    position: 'absolute', top: '100%', left: 0, marginTop: '0.25rem',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', padding: '0.25rem', zIndex: 50,
                    display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '120px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                >
                  {['', ...Array.from({ length: 8 }, (_, i) => (new Date().getFullYear() - 1) + i)].map(opt => (
                    <button
                      key={opt}
                      onClick={() => { setYearFilter(opt ? String(opt) : ''); setShowYearDropdown(false); }}
                      style={{
                        background: yearFilter === String(opt) ? 'var(--surface-2)' : 'transparent',
                        color: 'var(--foreground)', border: 'none', padding: '0.4rem 0.5rem',
                        textAlign: 'left', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => { if(yearFilter !== String(opt)) e.currentTarget.style.background = 'var(--surface-2)' }}
                      onMouseLeave={e => { if(yearFilter !== String(opt)) e.currentTarget.style.background = 'transparent' }}
                    >
                      {opt ? `Class of ${opt}` : 'All Years'}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button onClick={() => { setCompareMode(m => !m); setSelected([]); }} className={`btn btn-sm ${compareMode ? 'btn-primary' : 'btn-secondary'}`}>
            {compareMode ? '✕ cancel' : '⇄ compare'}
          </button>
          {SORT_OPTIONS.map(opt => (
            <button key={opt.key} onClick={() => setSort(opt.key)} className={`btn btn-sm ${sort === opt.key ? 'btn-primary' : 'btn-secondary'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {compareMode && selected.length === 2 && (
        <button className="btn btn-primary btn-sm" style={{ marginBottom: '0.75rem' }}
          onClick={() => navigate(`/college/${slug}?compare=${selected[0]},${selected[1]}`)}>
          View Head-to-Head →
        </button>
      )}
      {compareMode && (
        <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', marginBottom: '0.75rem' }}>
          Select 2 users to compare · {selected.length}/2 selected
        </p>
      )}

      {/* Table – locked for unauthenticated users */}
      {!user && !loading ? (
        <div style={{
          position: 'relative',
          minHeight: '420px',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}>
          {/* Blurred preview of the table underneath */}
          <div style={{ filter: 'blur(10px)', pointerEvents: 'none', userSelect: 'none', transform: 'scale(1.02)' }}>
            <LeaderboardTable leaderboard={leaderboard} loading={false} onRowClick={() => {}} compareMode={false} selected={[]} currentUserId={null} />
          </div>

          {/* Frosted glass overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            background: 'var(--overlay-bg)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            zIndex: 10, padding: '2.5rem',
          }}>
            {/* Lock icon */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'var(--overlay-lock-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1.25rem',
              border: '1px solid var(--border)',
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--overlay-heading)' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--overlay-heading)', marginBottom: '0.5rem', textAlign: 'center' }}>
              Sign in to view Leaderboard
            </h3>
            <p style={{ color: 'var(--overlay-subtext)', fontSize: '0.875rem', marginBottom: '1.75rem', textAlign: 'center', maxWidth: '320px', lineHeight: 1.6 }}>
              Create a free account or login to see how your college mates rank on LeetCode.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/register" className="btn btn-primary">Sign up — it's free</Link>
              <Link to="/login" className="btn btn-secondary">Login</Link>
            </div>
          </div>
        </div>
      ) : (
        <LeaderboardTable leaderboard={leaderboard} loading={loading} onRowClick={handleRowClick} compareMode={compareMode} selected={selected} currentUserId={user?.id} />
      )}

      {showModal && <AddUsernameModal onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); fetchLeaderboard(); }} />}
    </div>
  );
}

// ── Head-to-Head comparison panel ──────────────────────────────────────────
function HeadToHead({ a, b, onClose }) {
  const stats = [
    { label: 'Total Solved', aVal: a.total_solved, bVal: b.total_solved, higher: 'better' },
    { label: 'Easy', aVal: a.easy_solved, bVal: b.easy_solved, higher: 'better', color: 'var(--easy)' },
    { label: 'Medium', aVal: a.medium_solved, bVal: b.medium_solved, higher: 'better', color: 'var(--medium)' },
    { label: 'Hard', aVal: a.hard_solved, bVal: b.hard_solved, higher: 'better', color: 'var(--hard)' },
    { label: 'Streak', aVal: a.streak, bVal: b.streak, higher: 'better' },
    { label: 'Global Rank', aVal: a.ranking, bVal: b.ranking, higher: 'lower' },
  ];

  const winner = (aVal, bVal, higher) => {
    if (aVal == null || bVal == null) return null;
    if (higher === 'better') return aVal > bVal ? 'a' : bVal > aVal ? 'b' : 'tie';
    return aVal < bVal ? 'a' : bVal < aVal ? 'b' : 'tie';
  };

  const aWins = stats.filter(s => winner(s.aVal, s.bVal, s.higher) === 'a').length;
  const bWins = stats.filter(s => winner(s.aVal, s.bVal, s.higher) === 'b').length;

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--foreground)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Head-to-Head
        </span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)', fontSize: '1rem', lineHeight: 1, padding: '0 0.25rem' }}>
          ✕
        </button>
      </div>

      {/* Scoreline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', padding: '1rem', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `hsl(${(a.user.username?.charCodeAt(0) * 73) % 360},55%,52%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'white', margin: '0 auto 0.4rem' }}>
            {a.user.username?.charAt(0)?.toUpperCase()}
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--foreground)' }}>{a.user.display_name || a.user.username}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>@{a.user.leetcode_username}</div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-0.03em' }}>
            {aWins} <span style={{ color: 'var(--muted-foreground)', fontWeight: 300 }}>·</span> {bWins}
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>score</div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `hsl(${(b.user.username?.charCodeAt(0) * 73) % 360},55%,52%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, color: 'white', margin: '0 auto 0.4rem' }}>
            {b.user.username?.charAt(0)?.toUpperCase()}
          </div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--foreground)' }}>{b.user.display_name || b.user.username}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>@{b.user.leetcode_username}</div>
        </div>
      </div>

      {/* Stat rows */}
      <div>
        {stats.map((s, i) => {
          const w = winner(s.aVal, s.bVal, s.higher);
          const aWin = w === 'a', bWin = w === 'b';
          const max = Math.max(s.aVal || 0, s.bVal || 0, 1);
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', padding: '0.6rem 1rem', borderBottom: i < stats.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
              {/* A side */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <span style={{ fontWeight: aWin ? 700 : 400, color: aWin ? 'var(--foreground)' : 'var(--foreground-70)', fontSize: '0.9rem' }}>
                  {s.aVal ?? '-'}
                </span>
                <div style={{ width: Math.round(60 * (s.aVal || 0) / max), height: 4, borderRadius: 2, background: aWin ? 'var(--foreground)' : 'var(--border)', minWidth: 2, transition: 'width 0.4s' }} />
              </div>

              {/* Label */}
              <span style={{ fontSize: '0.7rem', color: s.color || 'var(--muted-foreground)', textAlign: 'center', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                {s.label}
              </span>

              {/* B side */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: Math.round(60 * (s.bVal || 0) / max), height: 4, borderRadius: 2, background: bWin ? 'var(--foreground)' : 'var(--border)', minWidth: 2, transition: 'width 0.4s' }} />
                <span style={{ fontWeight: bWin ? 700 : 400, color: bWin ? 'var(--foreground)' : 'var(--foreground-70)', fontSize: '0.9rem' }}>
                  {s.bVal ?? '-'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LeaderboardTable({ leaderboard, loading, onRowClick, compareMode, selected, currentUserId }) {
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 52 }} />)}
    </div>
  );

  if (!leaderboard.length) return (
    <div style={{ paddingTop: '3rem', paddingBottom: '3rem', textAlign: 'center' }}>
      <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>No one here yet - be the first to join!</p>
    </div>
  );

  return (
    <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '1rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: '36rem' }}>
      {/* Header row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '3.5rem 1fr 5rem 4rem 4.5rem 4rem 4rem',
        gap: '0.5rem',
        padding: '0.4rem 0.75rem',
        fontSize: '0.7rem',
        fontFamily: 'var(--font-mono)',
        color: 'var(--foreground-40)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        borderBottom: '1px solid var(--border)',
        marginBottom: '0.25rem',
      }}>
        <span>#</span>
        <span>User</span>
        <span style={{ textAlign: 'right' }}>Total</span>
        <span style={{ textAlign: 'right', color: 'var(--easy)' }}>Easy</span>
        <span style={{ textAlign: 'right', color: 'var(--medium)' }}>Med</span>
        <span style={{ textAlign: 'right', color: 'var(--hard)' }}>Hard</span>
        <span style={{ textAlign: 'right' }}>Streak</span>
      </div>

      {leaderboard.map((entry, i) => {
        const isMe = entry.user.id === currentUserId;
        const isSel = selected.includes(entry.user.id);
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;

        return (
          <button
            key={entry.user.id}
            onClick={() => onRowClick(entry.user.id)}
            style={{
              display: 'grid',
              gridTemplateColumns: '3.5rem 1fr 5rem 4rem 4.5rem 4rem 4rem',
              gap: '0.5rem',
              padding: '0.625rem 0.75rem',
              background: isMe ? 'oklch(0.145 0 0 / 4%)' : isSel ? 'oklch(0.556 0 0 / 5%)' : 'transparent',
              border: 'none',
              borderBottom: '1px solid var(--border)',
              cursor: 'pointer',
              alignItems: 'center',
              textAlign: 'left',
              fontFamily: 'inherit',
              transition: 'background 0.1s',
              animation: `fadeInUp 0.25s ease ${i * 0.035}s both`,
              outline: isSel ? '2px solid var(--foreground)' : 'none',
              outlineOffset: '-2px',
              borderRadius: isSel ? 'var(--radius)' : 0,
            }}
          >
            <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>{i + 1}</span>
              {medal && <span style={{ fontSize: '1rem' }}>{medal}</span>}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <div style={{
                width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                background: `hsl(${(entry.user.username?.charCodeAt(0) * 73) % 360},55%,52%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, color: 'white',
              }}>
                {entry.user.username?.charAt(0)?.toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {entry.user.display_name || entry.user.username}
                  {isMe && <span style={{ marginLeft: '0.35rem', fontSize: '0.68rem', color: 'var(--muted-foreground)', fontWeight: 400 }}>(you)</span>}
                  {isSel && <span style={{ marginLeft: '0.35rem', fontSize: '0.68rem', color: 'var(--muted-foreground)', fontWeight: 400 }}>✓</span>}
                  {entry.user.graduation_year && entry.user.graduation_year !== 'Unknown' && (
                    <span style={{ marginLeft: '0.35rem', fontSize: '0.65rem', padding: '0.1rem 0.35rem', background: 'var(--border)', borderRadius: '4px', color: 'var(--foreground-70)', fontWeight: 500 }}>
                      {entry.user.graduation_year}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--foreground-40)' }}>@{entry.user.leetcode_username}</div>
              </div>
            </div>

            <span style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.9rem', color: 'var(--foreground)' }}>{entry.total_solved}</span>
            <span style={{ textAlign: 'right', color: 'var(--easy)', fontSize: '0.85rem' }}>{entry.easy_solved}</span>
            <span style={{ textAlign: 'right', color: 'var(--medium)', fontSize: '0.85rem' }}>{entry.medium_solved}</span>
            <span style={{ textAlign: 'right', color: 'var(--hard)', fontSize: '0.85rem' }}>{entry.hard_solved}</span>
            <span style={{ textAlign: 'right', fontSize: '0.85rem', color: entry.streak > 0 ? '#f97316' : 'var(--foreground-40)' }}>
              {entry.streak > 0 ? `${entry.streak}🔥` : '-'}
            </span>
          </button>
        );
      })}
      </div>
    </div>
  );
}

