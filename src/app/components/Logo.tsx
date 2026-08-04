// ─── Logo Components ────────────────────────────────────────────────────────

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4A9EF5" />
          <stop offset="100%" stopColor="#1A50D8" />
        </linearGradient>
        <linearGradient id="shieldGrad2" x1="56" y1="0" x2="0" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#1B48E8" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Shield body */}
      <path
        d="M28 2L4 12V30C4 43.8 14.6 56.2 28 59C41.4 56.2 52 43.8 52 30V12L28 2Z"
        fill="url(#shieldGrad)"
      />
      {/* Shield inner highlight */}
      <path
        d="M28 2L4 12V30C4 43.8 14.6 56.2 28 59C41.4 56.2 52 43.8 52 30V12L28 2Z"
        fill="url(#shieldGrad2)"
      />
      {/* Network dot pattern */}
      {[
        [10, 18], [20, 10], [36, 8], [46, 16], [48, 28],
        [44, 40], [36, 50], [20, 52], [10, 44], [8, 30],
        [24, 24], [38, 22], [40, 36], [26, 42],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.2" fill="white" opacity="0.25" />
      ))}
      {/* Network lines */}
      <line x1="10" y1="18" x2="24" y2="24" stroke="white" strokeWidth="0.6" opacity="0.2" />
      <line x1="20" y1="10" x2="24" y2="24" stroke="white" strokeWidth="0.6" opacity="0.2" />
      <line x1="36" y1="8" x2="38" y2="22" stroke="white" strokeWidth="0.6" opacity="0.2" />
      <line x1="46" y1="16" x2="38" y2="22" stroke="white" strokeWidth="0.6" opacity="0.2" />
      <line x1="48" y1="28" x2="40" y2="36" stroke="white" strokeWidth="0.6" opacity="0.2" />
      <line x1="24" y1="24" x2="38" y2="22" stroke="white" strokeWidth="0.6" opacity="0.2" />
      <line x1="24" y1="24" x2="26" y2="42" stroke="white" strokeWidth="0.6" opacity="0.2" />
      <line x1="38" y1="22" x2="40" y2="36" stroke="white" strokeWidth="0.6" opacity="0.2" />
      <line x1="40" y1="36" x2="26" y2="42" stroke="white" strokeWidth="0.6" opacity="0.2" />

      {/* Document icon */}
      <rect x="16" y="15" width="18" height="22" rx="2" fill="white" opacity="0.95" />
      {/* Folded corner */}
      <path d="M30 15 L34 15 L34 19 L30 19 Z" fill="#CBD5E1" opacity="0.6" />
      <path d="M30 15 L34 19 L30 19 Z" fill="#94A3B8" opacity="0.5" />
      {/* Document lines */}
      <rect x="19" y="21" width="11" height="1.8" rx="0.9" fill="#1B48E8" opacity="0.5" />
      <rect x="19" y="25" width="11" height="1.8" rx="0.9" fill="#1B48E8" opacity="0.5" />
      <rect x="19" y="29" width="8" height="1.8" rx="0.9" fill="#1B48E8" opacity="0.5" />
      <rect x="19" y="33" width="10" height="1.8" rx="0.9" fill="#1B48E8" opacity="0.4" />

      {/* Green checkmark */}
      <circle cx="39" cy="16" r="10" fill="#10B981" />
      <circle cx="39" cy="16" r="10" fill="white" opacity="0.15" />
      <path
        d="M33.5 16L37.5 20L44.5 12"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function LogoText({ size = "base", dark = false }: { size?: "sm" | "base" | "lg"; dark?: boolean }) {
  const sizes = { sm: "text-sm", base: "text-base", lg: "text-xl" };
  return (
    <span className={`font-extrabold tracking-tight ${sizes[size]}`}>
      <span className={dark ? "text-white" : "text-[#1B48E8]"}>ClaimSense</span>
      <span className="text-[#10B981]"> AI</span>
    </span>
  );
}

export function BrandLogo({ size = 32, textSize = "base", dark = false }: { size?: number; textSize?: "sm" | "base" | "lg"; dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={size} />
      <LogoText size={textSize} dark={dark} />
    </div>
  );
}
