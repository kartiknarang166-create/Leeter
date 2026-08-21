import { DottedSeparator } from './DottedUnderline';

export default function Footer() {
  return (
    <footer style={{ maxWidth: '42rem', margin: '0 auto', padding: '0 1rem 2.5rem' }}>
      <DottedSeparator style={{ margin: '2rem 0 1.5rem' }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}>
        {/* Animated signature-style text — echoes the reference SVG signature */}
        <p style={{ fontSize: '0.8rem', color: 'var(--foreground-40)', maxWidth: 340, lineHeight: 1.6 }}>
          leetrank — daily LeetCode rankings for your college. Data synced at 12 PM IST every day.
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--foreground-40)' }}>
          © 2025 LeetRank · Built for students, by students.
        </p>
      </div>
    </footer>
  );
}
