// ClassBrief logo: a small newspaper mark + the name in a serif font.
// `compact` hides the name on small phones (the mark stays).
export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" className="shrink-0">
        <rect width="28" height="28" rx="6" fill="var(--color-brand)" />
        <rect x="7" y="8" width="14" height="2.2" rx="1.1" fill="#fff" />
        <rect x="7" y="12.5" width="6" height="7.5" rx="1" fill="#fff" opacity="0.85" />
        <rect x="15" y="12.5" width="6" height="1.8" rx="0.9" fill="#fff" opacity="0.85" />
        <rect x="15" y="15.4" width="6" height="1.8" rx="0.9" fill="#fff" opacity="0.85" />
        <rect x="15" y="18.3" width="4" height="1.8" rx="0.9" fill="#fff" opacity="0.85" />
      </svg>
      <span
        className={`font-serif text-xl font-semibold tracking-tight text-ink ${compact ? "hidden sm:inline" : ""}`}
      >
        ClassBrief
      </span>
    </span>
  );
}
