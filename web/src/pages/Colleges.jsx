import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { DottedSeparator } from '../components/DottedUnderline';

const PAGE_SIZE = 15;

export default function Colleges() {
  const [colleges, setColleges] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/colleges')
      .then(res => setColleges(res.data.colleges || []))
      .catch(() => setColleges(FALLBACK_COLLEGES))
      .finally(() => setLoading(false));
  }, []);

  const searchWords = search.toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = colleges.filter(c => {
    const targetText = `${c.name} ${c.slug} ${c.state || ''}`.toLowerCase();
    return searchWords.every(word => targetText.includes(word));
  });

  return (
    <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '4rem' }}>
      <div>
        <h2 className="subheading" style={{ marginBottom: '0.5rem' }}>Choose your college</h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          {colleges.length} colleges available
        </p>

        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
          <span style={{
            position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--muted-foreground)', fontSize: '0.9rem', pointerEvents: 'none',
          }}>🔍</span>
          <input
            className="input"
            placeholder="Search colleges or states..."
            value={search}
            onChange={e => { setSearch(e.target.value); setDisplayCount(PAGE_SIZE); }}
            style={{ maxWidth: 400, paddingLeft: '2.25rem' }}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 52 }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.slice(0, search ? filtered.length : displayCount).map((college, i) => (
              <CollegeRow
                key={college.id}
                college={college}
                index={i}
                onClick={() => navigate(`/college/${college.slug}`)}
              />
            ))}

            {filtered.length === 0 && (
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
                No colleges found for &ldquo;{search}&rdquo;
              </p>
            )}

            {!search && filtered.length > displayCount && (
              <button
                onClick={() => setDisplayCount(c => c + PAGE_SIZE)}
                style={{
                  alignSelf: 'flex-start',
                  marginTop: '0.5rem',
                  padding: '0.5rem 1.25rem',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--card)',
                  color: 'var(--foreground)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--card)'}
              >
                Show {Math.min(PAGE_SIZE, filtered.length - displayCount)} more colleges
                <span style={{
                  marginLeft: '0.5rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: 99,
                  background: 'var(--muted)',
                  fontSize: '0.75rem',
                  color: 'var(--muted-foreground)',
                }}>
                  {filtered.length - displayCount} left
                </span>
              </button>
            )}

            {!search && displayCount > PAGE_SIZE && filtered.length <= displayCount && filtered.length > PAGE_SIZE && (
              <button
                onClick={() => setDisplayCount(PAGE_SIZE)}
                style={{
                  alignSelf: 'flex-start',
                  marginTop: '0.5rem',
                  padding: '0.5rem 1.25rem',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'none',
                  color: 'var(--muted-foreground)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Show less
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


function CollegeRow({ college, index, onClick }) {
  const hue = (college.name.charCodeAt(0) * 47) % 360;

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '0.25rem',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        padding: 0,
        animation: `fadeInUp 0.3s ease ${index * 0.04}s both`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 6, flexShrink: 0,
          background: `linear-gradient(to bottom, hsl(${hue},60%,55%), hsl(${hue},60%,42%))`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 2px 8px hsla(${hue},60%,45%,0.35)`,
          fontSize: '0.8rem', fontWeight: 700, color: 'white',
        }}>
          {college.logo_url
            ? <img src={college.logo_url} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
            : college.name.charAt(0)
          }
        </div>

        <span style={{ fontWeight: 500, fontSize: '0.9375rem', color: 'var(--foreground)' }}>
          {college.name}
        </span>

        <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)', flexShrink: 0 }} />

        <span style={{ color: 'var(--foreground-70)', fontSize: '0.9rem' }}>
          {college.member_count > 0
            ? `${college.member_count} member${college.member_count !== 1 ? 's' : ''}`
            : 'Be the first'
          }
          {college.state ? ` · ${college.state}` : ''}
        </span>
      </div>
    </button>
  );
}

const FALLBACK_COLLEGES = [
  { id: '1', name: 'IIT Delhi', slug: 'iit-delhi', state: 'Delhi', member_count: 0 },
  { id: '2', name: 'IIT Bombay', slug: 'iit-bombay', state: 'Maharashtra', member_count: 0 },
  { id: '3', name: 'NIT Trichy', slug: 'nit-trichy', state: 'Tamil Nadu', member_count: 0 },
  { id: '4', name: 'BITS Pilani', slug: 'bits-pilani', state: 'Rajasthan', member_count: 0 },
  { id: '5', name: 'VIT Vellore', slug: 'vit-vellore', state: 'Tamil Nadu', member_count: 0 },
];
