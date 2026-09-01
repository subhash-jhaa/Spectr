import type React from "react";
import { MATTER_PATH } from "@/components/landing/Logo";

export const LogoIcon = ({
  className = "w-5 h-5",
  ...props
}: React.ComponentProps<"svg">) => (
  <svg
    viewBox="0 0 256 251"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path d={MATTER_PATH} />
  </svg>
);

export const Logo = (props: React.ComponentProps<"svg">) => (
  <svg
    viewBox="0 0 110 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g transform="translate(0, 1) scale(0.0876)">
      <path d={MATTER_PATH} />
    </g>
    <text
      x="30"
      y="18"
      fontFamily="var(--font-mono), ui-monospace, SFMono-Regular, monospace, system-ui, sans-serif"
      fontSize="17.5"
      fontWeight="700"
      letterSpacing="-0.035em"
    >
      Spectr
    </text>
  </svg>
);
