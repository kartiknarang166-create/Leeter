import { useId } from 'react';

/* DottedUnderline — ported from reference dotted-underline.tsx */
export default function DottedUnderline({ visible = true, color }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      style={{
        pointerEvents: 'none',
        position: 'absolute',
        bottom: -2,
        left: 0,
        width: '100%',
        height: 4,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.25s ease',
      }}
      aria-hidden
      preserveAspectRatio="none"
    >
      <defs>
        <pattern id={id} width={6} height={4} patternUnits="userSpaceOnUse">
          <circle cx={3} cy={2} r={1} fill={color || 'currentColor'} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* DottedSeparator — ported from reference separator.tsx (full-width, 40% opacity) */
export function DottedSeparator({ className = '', style = {} }) {
  const id = useId().replace(/:/g, '');
  return (
    <div
      aria-hidden
      className={className}
      style={{ width: '100%', flexShrink: 0, ...style }}
    >
      <svg
        width="100%"
        height="4"
        preserveAspectRatio="none"
        aria-hidden
        style={{ display: 'block', opacity: 0.4 }}
      >
        <defs>
          <pattern id={id} width={8} height={4} patternUnits="userSpaceOnUse">
            <circle cx={4} cy={2} r={1} fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} style={{ color: 'var(--foreground)' }} />
      </svg>
    </div>
  );
}
