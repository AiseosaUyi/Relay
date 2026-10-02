import type { DestinationId } from "@/lib/destinations/registry";
import { PlatformIcon } from "@/components/icons/platform-icon";

/**
 * Custom illustration, not a stock icon: one source node (the client's
 * single recommendation) branching into the a few real destination nodes,
 * reusing the same PlatformIcon marks used throughout the product so it
 * reads as this product's own visual language, not generic clip art.
 */
export function RelayFlowIllustration({ className }: { className?: string }) {
  const targets: { y: number; id: DestinationId }[] = [
    { y: 34, id: "linkedin" },
    { y: 100, id: "contra" },
    { y: 166, id: "site_quote" },
  ];

  return (
    <svg
      viewBox="0 0 300 200"
      fill="none"
      className={className}
      role="img"
      aria-label="One recommendation branching into LinkedIn, Contra and a website testimonial"
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
          <foreignObject x={222 - 8} y={t.y - 8} width="16" height="16">
            <PlatformIcon id={t.id} className="size-4" />
          </foreignObject>
        </g>
      ))}
    </svg>
  );
}
