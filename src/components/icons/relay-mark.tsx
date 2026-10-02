/**
 * The Relay mark: a closing quote mark where the colour is handed from the
 * first comma (ink, the client's words) to the second (signal, the same
 * words passed on). One idea, two shapes, readable at favicon size.
 *
 * Decorative (aria-hidden): every usage sits beside the visible "relay"
 * wordmark, so the icon gets no label of its own.
 */
const COMMA_TAIL = "M12.1 13.6C12.5 18.6 10.3 22 6 24.2";

export function RelayMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <g className="fill-current stroke-current" strokeWidth="3.4" strokeLinecap="round">
        <circle cx="9" cy="11" r="4.6" stroke="none" />
        <path d={COMMA_TAIL} />
      </g>
      <g className="fill-signal stroke-signal" strokeWidth="3.4" strokeLinecap="round">
        <circle cx="22" cy="11" r="4.6" stroke="none" />
        <path d={COMMA_TAIL} transform="translate(13 0)" />
      </g>
    </svg>
  );
}
