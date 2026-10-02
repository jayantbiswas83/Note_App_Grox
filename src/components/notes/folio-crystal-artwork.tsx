import { cn } from "@/lib/utils";

interface FolioCrystalArtworkProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "hero";
}

/**
 * Crystalline Architectural Artwork
 * Folio's signature visual: faceted isometric crystal pavilion / prism
 * with refracted violet/indigo/lavender light planes, architectural gridlines,
 * and luminous gemstone vertices.
 */
export function FolioCrystalArtwork({
  className,
  size = "md",
}: FolioCrystalArtworkProps) {
  const sizeMap = {
    sm: "w-24 h-24",
    md: "w-48 h-48",
    lg: "w-64 h-64",
    hero: "w-72 h-72 sm:w-80 sm:h-80",
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center select-none",
        sizeMap[size],
        className,
      )}
      aria-hidden="true"
    >
      {/* Ambient ethereal crystal glow */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-accent/15 via-violet-300/10 to-indigo-400/5 blur-2xl" />

      {/* SVG Isometric Crystalline Prism */}
      <svg
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-[0_8px_24px_rgba(95,71,232,0.08)]"
      >
        <defs>
          {/* Subtle crystal facet gradients */}
          <linearGradient id="facetTop" x1="120" y1="28" x2="120" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#EDE8FF" stopOpacity="0.75" />
          </linearGradient>

          <linearGradient id="facetLeft" x1="42" y1="76" x2="120" y2="212" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F5F3FF" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#E0D7FE" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#5F47E8" stopOpacity="0.22" />
          </linearGradient>

          <linearGradient id="facetRight" x1="198" y1="76" x2="120" y2="212" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EDE9FE" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#C4B5FD" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#37269E" stopOpacity="0.28" />
          </linearGradient>

          <linearGradient id="facetCore" x1="120" y1="64" x2="120" y2="176" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8168F5" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#4C34D3" stopOpacity="0.1" />
          </linearGradient>

          <linearGradient id="crystalEdge" x1="40" y1="28" x2="200" y2="212" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7C65F6" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#4C35D0" stopOpacity="0.5" />
          </linearGradient>

          <radialGradient id="prismAura" cx="120" cy="120" r="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7C65F6" stopOpacity="0.12" />
            <stop offset="70%" stopColor="#A78BFA" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient background ring */}
        <circle cx="120" cy="120" r="92" fill="url(#prismAura)" />
        <circle
          cx="120"
          cy="120"
          r="92"
          stroke="#7C65F6"
          strokeOpacity="0.12"
          strokeWidth="1"
          strokeDasharray="3 4"
        />

        {/* Architectural orbital geometry */}
        <ellipse
          cx="120"
          cy="120"
          rx="104"
          ry="44"
          transform="rotate(-22 120 120)"
          stroke="#5F47E8"
          strokeOpacity="0.1"
          strokeWidth="1"
          strokeDasharray="4 6"
        />

        {/* Outer Facets of the Isometric Crystal */}
        {/* Top Apex Facet */}
        <polygon
          points="120,28 174,70 120,104 66,70"
          fill="url(#facetTop)"
          stroke="url(#crystalEdge)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Left Primary Facet */}
        <polygon
          points="66,70 120,104 120,188 44,142"
          fill="url(#facetLeft)"
          stroke="url(#crystalEdge)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Right Primary Facet */}
        <polygon
          points="120,104 174,70 196,142 120,188"
          fill="url(#facetRight)"
          stroke="url(#crystalEdge)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Bottom Refractive Keystone */}
        <polygon
          points="44,142 120,188 120,214 44,142"
          fill="#5F47E8"
          fillOpacity="0.15"
          stroke="url(#crystalEdge)"
          strokeWidth="0.8"
        />
        <polygon
          points="120,188 196,142 120,214"
          fill="#37269E"
          fillOpacity="0.22"
          stroke="url(#crystalEdge)"
          strokeWidth="0.8"
        />

        {/* Inner Floating Crystal Core (Faceted Diamond Heart) */}
        <polygon
          points="120,68 146,92 120,148 94,92"
          fill="url(#facetCore)"
          stroke="#7C65F6"
          strokeOpacity="0.45"
          strokeWidth="1"
        />
        <line x1="120" y1="68" x2="120" y2="148" stroke="#7C65F6" strokeOpacity="0.35" strokeWidth="1" />
        <line x1="94" y1="92" x2="146" y2="92" stroke="#7C65F6" strokeOpacity="0.35" strokeWidth="1" />

        {/* Architectural Wireframe Lattice Lines */}
        <line x1="120" y1="28" x2="120" y2="104" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="1" />
        <line x1="120" y1="104" x2="120" y2="188" stroke="#5F47E8" strokeOpacity="0.5" strokeWidth="1" />
        <line x1="66" y1="70" x2="196" y2="142" stroke="#7C65F6" strokeOpacity="0.18" strokeWidth="0.75" />
        <line x1="174" y1="70" x2="44" y2="142" stroke="#7C65F6" strokeOpacity="0.18" strokeWidth="0.75" />

        {/* Luminous Crystal Vertices (Jewel Nodes) */}
        <circle cx="120" cy="28" r="3.5" fill="#FFFFFF" stroke="#5F47E8" strokeWidth="1.5" />
        <circle cx="66" cy="70" r="2.5" fill="#FFFFFF" stroke="#5F47E8" strokeWidth="1.2" />
        <circle cx="174" cy="70" r="2.5" fill="#FFFFFF" stroke="#5F47E8" strokeWidth="1.2" />
        <circle cx="120" cy="104" r="3" fill="#8168F5" stroke="#FFFFFF" strokeWidth="1.2" />
        <circle cx="44" cy="142" r="2.5" fill="#EDE9FE" stroke="#5F47E8" strokeWidth="1.2" />
        <circle cx="196" cy="142" r="2.5" fill="#EDE9FE" stroke="#5F47E8" strokeWidth="1.2" />
        <circle cx="120" cy="188" r="3" fill="#5F47E8" stroke="#FFFFFF" strokeWidth="1.2" />
        <circle cx="120" cy="214" r="2.5" fill="#37269E" stroke="#FFFFFF" strokeWidth="1" />

        {/* Prismatic Sparkle Accents */}
        <path
          d="M178 48 L181 55 L188 58 L181 61 L178 68 L175 61 L168 58 L175 55 Z"
          fill="#7C65F6"
          fillOpacity="0.75"
        />
        <path
          d="M56 166 L57.5 171 L62 173 L57.5 175 L56 180 L54.5 175 L50 173 L54.5 171 Z"
          fill="#5F47E8"
          fillOpacity="0.5"
        />
      </svg>
    </div>
  );
}
