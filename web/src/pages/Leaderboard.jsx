import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('total_solved');
  const [showModal, setShowModal] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const channelRef = useRef(null);

  const fetchLeaderboard = () => {
    setLoading(true);
    api.get(`/leaderboard/${slug}?sort=${sort}`)
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load leaderboard'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    supabase.from('daily_challenges').select('*').eq('date', today).single()
      .then(({ data }) => { if (data) setDailyChallenge(data); });
  }, []);

  useEffect(() => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    const channel = supabase.channel(`lb-${slug}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leetcode_stats' }, () => {
        setIsLive(true);
        api.get(`/leaderboard/${slug}?sort=${sort}`).then(res => { setData(res.data); toast('Rankings updated'); }).catch(() => {});
        setTimeout(() => setIsLive(false), 3000);
      })
      .subscribe();
    channelRef.current = channel;
    return () => supabase.removeChannel(channel);
  }, [slug]);

  useEffect(() => { fetchLeaderboard(); }, [slug, sort]);

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

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>

      {/* Back link */}
      <Link to="/" style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', textDecoration: 'none', display: 'inline-block', marginBottom: '1.5rem' }}>
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

      {/* Table */}
      <LeaderboardTable leaderboard={leaderboard} loading={loading} onRowClick={handleRowClick} compareMode={compareMode} selected={selected} currentUserId={user?.id} />

      {showModal && <AddUsernameModal onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); fetchLeaderboard(); }} />}
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
      <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>No one here yet — be the first to join!</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2.5rem 1fr 5rem 4rem 4.5rem 4rem 4rem',
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
              gridTemplateColumns: '2.5rem 1fr 5rem 4rem 4.5rem 4rem 4rem',
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
            }}
            className="dark:hover:bg-white/5"
          >
            <span style={{ fontSize: '0.85rem', fontWeight: medal ? 400 : 400, color: 'var(--muted-foreground)' }}>
              {medal || i + 1}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              {/* Initial box — from reference Box pattern */}
              <div style={{
                width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                background: `hsl(${(entry.user.username?.charCodeAt(0) * 73) % 360},55%,52%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, color: 'white',
              }}>
                {entry.user.username?.charAt(0)?.toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: isMe ? 'var(--foreground)' : 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {entry.user.display_name || entry.user.username}
                  {isMe && <span style={{ marginLeft: '0.35rem', fontSize: '0.68rem', color: 'var(--muted-foreground)', fontWeight: 400 }}>(you)</span>}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--foreground-40)' }}>@{entry.user.leetcode_username}</div>
              </div>
            </div>

            <span style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.9rem', color: 'var(--foreground)' }}>{entry.total_solved}</span>
            <span style={{ textAlign: 'right', color: 'var(--easy)', fontSize: '0.85rem' }}>{entry.easy_solved}</span>
            <span style={{ textAlign: 'right', color: 'var(--medium)', fontSize: '0.85rem' }}>{entry.medium_solved}</span>
            <span style={{ textAlign: 'right', color: 'var(--hard)', fontSize: '0.85rem' }}>{entry.hard_solved}</span>
            <span style={{ textAlign: 'right', fontSize: '0.85rem', color: entry.streak > 0 ? '#f97316' : 'var(--foreground-40)' }}>
              {entry.streak > 0 ? `${entry.streak}🔥` : '—'}
            </span>
          </button>
        );
      })}
    </div>
  );
}
