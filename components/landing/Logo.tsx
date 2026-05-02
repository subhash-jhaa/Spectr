import React from 'react';

// Reusable logo component — monochrome white variant as per latest design
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      width="140"
      height="48"
      viewBox="0 0 160 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="spectr logo"
    >
      {/* Icon mark - rounded dark rectangle */}
      <rect x="0" y="6" width="44" height="44" rx="12" fill="#1A1A1A" />
      {/* Primary line - pure white */}
      <line x1="14" y1="36" x2="26" y2="16" stroke="white" strokeWidth="4" strokeLinecap="round" />
      {/* Secondary line - monochrome gray/opacity */}
      <line x1="24" y1="36" x2="36" y2="16" stroke="white" strokeWidth="4" strokeLinecap="round" opacity="0.3" />

      {/* Wordmark - monochrome variant */}
      <text
        x="56"
        y="36"
        fontFamily="system-ui,-apple-system,sans-serif"
        fontSize="24"
        fontWeight="600"
        fill={className.includes("text-zinc-950") ? "#09090b" : "white"}
        letterSpacing="-0.05em"
      >
        spectr
      </text>
    </svg>
  );
}

// Icon-only version for compact contexts
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="spectr icon"
    >
      <rect width="48" height="48" rx="12" fill="#1A1A1A" />
      <line x1="13" y1="37" x2="25" y2="14" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="24" y1="37" x2="36" y2="14" stroke="white" strokeWidth="4.5" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}
