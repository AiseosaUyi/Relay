import { PLATFORM_LIST } from "@/lib/adaptation/platforms";

/**
 * Custom illustration, not a stock icon: one source node (the client's
 * single recommendation) branching into the three real platform nodes,
 * reusing the same monogram treatment used throughout the product so it
 * reads as this product's own visual language, not generic clip art.
 */
export function RelayFlowIllustration({ className }: { className?: string }) {
  const targets = [
    { y: 34, id: PLATFORM_LIST[0].id, label: PLATFORM_LIST[0].monogram },
    { y: 100, id: PLATFORM_LIST[1].id, label: PLATFORM_LIST[1].monogram },
    { y: 166, id: PLATFORM_LIST[2].id, label: PLATFORM_LIST[2].monogram },
  ];

  return (
    <svg
      viewBox="0 0 300 200"
      fill="none"
      className={className}
      role="img"
      aria-label="One recommendation branching into LinkedIn, Upwork, and Contra"
    >
      {targets.map((t) => (
        <path
          key={t.id}
          d={`M 54 100 C 130 100, 130 ${t.y}, 206 ${t.y}`}
          className="stroke-border"
          strokeWidth="2"
          strokeDasharray="1 8"
          strokeLinecap="round"
        />
      ))}
      {targets.map((t) => (
        <path
          key={`${t.id}-active`}
          d={`M 54 100 C 130 100, 130 ${t.y}, 206 ${t.y}`}
          className="stroke-primary/40"
          strokeWidth="2"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="18 100"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="0;-118"
            dur="2.4s"
            repeatCount="indefinite"
          />
        </path>
      ))}

      <circle cx="54" cy="100" r="22" className="fill-foreground" />
      <text
        x="54"
        y="100"
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-background text-[13px] font-semibold"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        You
      </text>

      {targets.map((t) => (
        <g key={`${t.id}-node`}>
          <circle cx="222" cy={t.y} r="16" className="fill-wash stroke-border" strokeWidth="1" />
          <text
            x="222"
            y={t.y}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-foreground text-[10px] font-semibold"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
