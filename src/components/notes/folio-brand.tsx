import { cn } from "@/lib/utils";

interface FolioBrandProps {
  collapsed?: boolean;
  className?: string;
}

/**
 * Premium Folio Monogram & Brand Lockup
 * Features the faceted crystal gemstone emblem and editorial serif wordmark.
 */
export function FolioBrand({ collapsed = false, className }: FolioBrandProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 select-none transition-all duration-200",
        collapsed && "justify-center",
        className,
      )}
    >
      {/* Faceted Crystal Gemstone Monogram */}
      <div className="relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-b from-card to-accent-subtle/80 p-1.5 shadow-[0_2px_8px_rgba(95,71,232,0.12)] border border-accent/20 transition-transform duration-200 hover:scale-105">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-6 text-accent"
        >
          <defs>
            <linearGradient id="brandGrad1" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8A75F8" />
              <stop offset="60%" stopColor="#5F47E8" />
              <stop offset="100%" stopColor="#37269E" />
            </linearGradient>
            <linearGradient id="brandGrad2" x1="16" y1="4" x2="16" y2="18" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#EDE9FE" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Faceted Monogram Emblem - Geometry of F/Crystal */}
          {/* Top Diamond Facet */}
          <path
            d="M16 3 L26 10 L16 16 L6 10 Z"
            fill="url(#brandGrad2)"
            stroke="#5F47E8"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Left Prism Pillar */}
          <path
            d="M6 10 L16 16 L16 28 L6 20 Z"
            fill="url(#brandGrad1)"
            stroke="#4C34D3"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Right Floating Facet */}
          <path
            d="M16 16 L26 10 L26 19 L16 24 Z"
            fill="#7C65F6"
            fillOpacity="0.85"
            stroke="#5F47E8"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Horizontal Crystal Bar (forming the F) */}
          <path
            d="M16 15 L24 11 L24 14.5 L16 18.5 Z"
            fill="#FFFFFF"
            fillOpacity="0.8"
          />
          {/* Center Vertex Sparkle */}
          <circle cx="16" cy="16" r="1.5" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Editorial Wordmark + Subtitle */}
      {!collapsed && (
        <div className="flex flex-col overflow-hidden text-left">
          <div className="flex items-center gap-1.5">
            <span className="font-serif text-xl font-medium tracking-tight text-foreground">
              Folio
            </span>
            <span className="inline-block size-1 rounded-full bg-accent/60" />
          </div>
          <span className="text-[0.625rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Crystal Edition
          </span>
        </div>
      )}
    </div>
  );
}
