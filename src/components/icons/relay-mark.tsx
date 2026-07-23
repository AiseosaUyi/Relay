/**
 * Custom mark, not a stock icon: a single baton hand-off — a filled "you"
 * dot passing to an open "them" dot — the same fill-vs-outline language
 * used for source/target nodes throughout the product. Deliberately one
 * bold gesture so it still reads clearly at favicon/nav scale, unlike a
 * multi-curve illustration.
 */
export function RelayMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      role="img"
      aria-label="Relay"
    >
      <line
        x1="8"
        y1="16"
        x2="13.8"
        y2="10.2"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="7" cy="17" r="3" fill="currentColor" />
      <circle cx="17" cy="7" r="2.75" fill="none" stroke="currentColor" strokeWidth="2.5" />
    </svg>
  );
}
