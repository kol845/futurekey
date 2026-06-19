/**
 * Kee — the FutureKey mascot. A friendly key whose round head is a clock.
 * Pure inline SVG so it stays crisp and ships with no image assets.
 *
 * @param {{ size?: number }} props
 */
export default function Kee({ size = 96 }) {
  return (
    <svg
      className="kee"
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label="Kee, the FutureKey mascot"
    >
      <defs>
        <linearGradient id="kee-head" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b82ff" />
          <stop offset="100%" stopColor="#3a5bf0" />
        </linearGradient>
        <radialGradient id="kee-glow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#6c8cff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#6c8cff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* soft glow */}
      <circle cx="60" cy="44" r="46" fill="url(#kee-glow)" />

      {/* key shaft + teeth */}
      <g stroke="#2b3a66" strokeWidth="2">
        <rect x="54" y="74" width="12" height="30" rx="5" fill="#9fb4ff" />
        <rect x="66" y="90" width="12" height="8" rx="2" fill="#9fb4ff" />
        <rect x="66" y="100" width="9" height="7" rx="2" fill="#9fb4ff" />
      </g>

      {/* head (clock) */}
      <circle cx="60" cy="44" r="34" fill="url(#kee-head)" stroke="#2b3a66" strokeWidth="2" />
      <circle cx="60" cy="44" r="27" fill="#0d1018" />

      {/* clock ticks */}
      <g stroke="#3a5bf0" strokeWidth="2.5" strokeLinecap="round">
        <line x1="60" y1="21" x2="60" y2="26" />
        <line x1="83" y1="44" x2="78" y2="44" />
        <line x1="60" y1="67" x2="60" y2="62" />
        <line x1="37" y1="44" x2="42" y2="44" />
      </g>

      {/* eyes */}
      <circle cx="51" cy="42" r="5" fill="#eaf0ff" />
      <circle cx="69" cy="42" r="5" fill="#eaf0ff" />
      <circle cx="52.5" cy="43" r="2.2" fill="#0d1018" />
      <circle cx="70.5" cy="43" r="2.2" fill="#0d1018" />

      {/* smile / clock hands hint */}
      <path d="M50 52 Q60 60 70 52" fill="none" stroke="#6c8cff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
