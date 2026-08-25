"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Session } from "next-auth";
import { signIn } from "next-auth/react";
import { LogIn, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "./Primitives";
import { Logo } from "./Logo";

interface NavbarProps {
  session?: Session | null;
}

const NAV_LINKS = [
  { name: "Features", href: "/#features" },
  { name: "How It Works", href: "/#how-it-works" },
  { name: "Integration", href: "/#code" },
  { name: "Pricing", href: "/#pricing" },
];

const SPRING = { type: "spring", stiffness: 400, damping: 20 } as const;
const EASE   = [0.16, 1, 0.3, 1] as const;

// Desktop nav link with sliding underline
function NavLink({ name, href, onClick }: { name: string; href: string; onClick?: () => void }) {
  const isExternal = href.startsWith("http");
  return (
    <a 
      href={href} 
      onClick={onClick} 
      {...(isExternal ? { target: "_blank", rel: "noopener" } : {})}
      className="group relative px-2 lg:px-4 py-2 text-[14px] lg:text-[16px] font-medium text-zinc-400 hover:text-white transition-colors duration-200"
    >
      {name}
      <span className="absolute bottom-0.5 left-2 lg:left-4 right-2 lg:right-4 h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full bg-white" />
    </a>
  );
}

// Reusable spring-scaled button wrapper
function SpringBtn({ children, className, onClick }: { children: React.ReactNode; className: string; onClick?: () => void }) {
  return (
    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={SPRING} onClick={onClick} className={className}>
      {children}
    </motion.button>
  );
}

export function Navbar({ session }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE }}
      className={cn(
        "fixed inset-x-0 z-50 mx-auto w-[calc(100%-2rem)] max-w-6xl rounded-full transition-all duration-500 border border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex items-center justify-between px-4 sm:px-6 md:px-8",
        scrolled
          ? "top-3 h-14 bg-black/60 backdrop-blur-xl"
          : "top-4 h-16 bg-black/40 backdrop-blur-lg"
      )}
    >
      {/* Brand */}
      <Link href="/" className="flex items-center">
        <motion.div whileHover={{ scale: 1.02 }} transition={SPRING}>
          <Logo className={cn("transition-all duration-300 w-auto", scrolled ? "h-8 md:h-9" : "h-9 md:h-10")} />
        </motion.div>
      </Link>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-0.5 lg:gap-1">
        {NAV_LINKS.map((l) => <NavLink key={l.href} {...l} />)}
      </nav>

      {/* CTAs */}
      <div className="flex items-center gap-2">
        {session?.user ? (
          <Link href="/dashboard">
            <SpringBtn className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white px-3.5 sm:px-5 h-9 text-[13px] sm:text-[14px] md:text-[16px] font-medium transition-all">
              <LogIn className="h-3.5 w-3.5" /> <span>Dashboard</span>
            </SpringBtn>
          </Link>
        ) : (
          <>
            <motion.button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={SPRING}
              className="relative inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white px-3 sm:px-4 md:px-5 h-9 text-[13px] sm:text-[14px] md:text-[16px] font-medium transition-all"
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white"></path>
                </svg>
                <span>Login</span>
              </div>
            </motion.button>
            
            <motion.button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={SPRING}
              className="hidden md:inline-flex relative items-center gap-1.5 rounded-full bg-white text-zinc-950 hover:bg-zinc-100 px-4 lg:px-5 h-9 text-[14px] lg:text-[16px] font-semibold transition-all shadow-[0_4px_12px_rgba(255,255,255,0.1)]"
            >
              <span>Get Started</span>
              <ChevronRight className="h-3.5 w-3.5 text-zinc-950" />
            </motion.button>
          </>
        )}
      </div>
    </motion.header>
  );
}
export default Navbar;
