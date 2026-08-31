"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-8 h-8 rounded-full border border-[#e8e6e5] dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 ${className}`} />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative p-2 rounded-full border border-[#e8e6e5] dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[#0c0a09] dark:text-zinc-100 hover:bg-[#f5f5f4] dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-sm ${className}`}
      aria-label="Toggle theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-[#78716c] hover:text-[#0c0a09] transition-transform duration-200" />
      )}
    </button>
  );
}

export default ThemeToggle;
