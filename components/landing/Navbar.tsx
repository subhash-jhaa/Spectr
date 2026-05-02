"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Session } from "next-auth";
import { signIn } from "next-auth/react";
import { LogIn, ChevronRight, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, MONO } from "./Primitives";
import { Logo, LogoMark } from "./Logo";

interface NavbarProps {
  session?: Session | null;
}

const NAV_LINKS = [
  { name: "Features", href: "/#features" },
  { name: "How It Works", href: "/#how-it-works" },
  { name: "Integration", href: "/#code" },
];

const SPRING = { type: "spring", stiffness: 400, damping: 20 } as const;
const EASE   = [0.16, 1, 0.3, 1] as const;

// Animated 3-line hamburger ↔ X
function Hamburger({ open, scrolled }: { open: boolean; scrolled: boolean }) {
  const line = cn("block h-[1.5px] w-full rounded-full transition-colors", scrolled ? "bg-zinc-300" : "bg-zinc-950");
  return (
    <div className="relative w-5 h-4 flex flex-col justify-between">
      <motion.span animate={open ? { rotate: 45, y: 8 }  : { rotate: 0, y: 0 }}  transition={{ duration: 0.35, ease: EASE }} className={cn(line, "origin-center")} />
      <motion.span animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }} transition={{ duration: 0.2 }} className={line} />
      <motion.span animate={open ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }} transition={{ duration: 0.35, ease: EASE }} className={cn(line, "origin-center")} />
    </div>
  );
}

// Desktop nav link with sliding underline
function NavLink({ name, href, onClick, scrolled }: { name: string; href: string; onClick?: () => void; scrolled: boolean }) {
  return (
    <a 
      href={href} 
      onClick={onClick} 
      className={cn(
        "group relative px-4 py-2 text-sm font-medium transition-colors duration-200",
        scrolled ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-950"
      )}
    >
      {name}
      <span className={cn(
        "absolute bottom-0.5 left-4 right-4 h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full",
        scrolled ? "bg-white" : "bg-zinc-950"
      )} />
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
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-500",
          scrolled
            ? "h-14 bg-zinc-950/75 backdrop-blur-xl backdrop-saturate-150 border-b border-white/[0.06] shadow-[0_1px_40px_rgba(0,0,0,0.4)]"
            : "h-16 bg-transparent"
        )}
      >
        <div className="mx-auto h-full max-w-7xl px-4 sm:px-6 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center">
            <motion.div whileHover={{ scale: 1.02 }} transition={SPRING}>
              <Logo className={cn("h-10 w-auto transition-colors duration-300", scrolled ? "text-white" : "text-zinc-950")} />
            </motion.div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center -mx-1">
            {NAV_LINKS.map((l) => <NavLink key={l.href} {...l} scrolled={scrolled} />)}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-2">
            {session?.user ? (
              <Link href="/dashboard">
                <SpringBtn className={cn(
                  "inline-flex items-center gap-2 rounded-lg border px-4 h-9 text-sm font-medium transition-all",
                  scrolled 
                    ? "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white" 
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                )}>
                  <LogIn className="h-3.5 w-3.5" /> Dashboard
                </SpringBtn>
              </Link>
            ) : (
              <motion.button
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                whileHover={{ scale: 1.03, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                whileTap={{ scale: 0.97 }}
                transition={SPRING}
                className="relative inline-flex items-center gap-2 rounded-lg px-4 h-9 text-sm font-semibold bg-zinc-950 text-white overflow-hidden shadow-sm"
              >
                <span className="absolute inset-0 bg-zinc-800 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10 flex items-center gap-2">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="white"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="white"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="white"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="white"></path>
                  </svg>
                  <span className="hidden sm:inline">Sign in</span>
                </div>
              </motion.button>
            )}
            <motion.button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              whileHover={{ scale: 1.03, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
              whileTap={{ scale: 0.97 }}
              transition={SPRING}
              className="relative inline-flex items-center gap-1.5 rounded-lg px-4 h-9 text-sm font-semibold bg-zinc-950 text-white overflow-hidden shadow-sm"
            >
              <span className="absolute inset-0 bg-zinc-800 opacity-0 hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Get Started</span>
              <ChevronRight className="relative z-10 h-3.5 w-3.5" />
            </motion.button>
          </div>

          {/* Mobile trigger */}
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setOpen(!open)}
            className={cn(
              "md:hidden flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
              scrolled ? "text-zinc-400 hover:bg-white/5 hover:text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
            )}
            aria-label="Toggle menu"
          >
            <Hamburger open={open} scrolled={scrolled} />
          </motion.button>
        </div>

        {/* Glow line on scroll */}
        <AnimatePresence>
          {scrolled && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} exit={{ opacity: 0, scaleX: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
            />
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div key="dr" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: EASE }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[min(320px,85vw)] flex flex-col bg-zinc-950 border-l border-white/[0.06] shadow-2xl"
            >
              {/* Header */}
              <div className="flex h-16 shrink-0 items-center justify-between px-5 border-b border-white/[0.06]">
                <LogoMark size={28} />
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
                  aria-label="Close menu"
                >
                  <Hamburger open={true} />
                </motion.button>
              </div>

              {/* Links */}
              <nav className="flex flex-col gap-1 p-4">
                {NAV_LINKS.map((l, i) => (
                  <motion.a key={l.href} href={l.href} onClick={() => setOpen(false)}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.06, ease: EASE }}
                    className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors group"
                  >
                    {l.name}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                  </motion.a>
                ))}
              </nav>

              <div className="mx-5 h-px bg-white/[0.06]" />

              {/* CTA */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 0, y: 0 }}
                transition={{ delay: 0.25, ease: EASE }}
                className="flex flex-col gap-3 p-5 mt-auto"
              >
                {!session?.user && (
                  <button 
                    onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                    className="w-full inline-flex items-center justify-between rounded-xl px-5 py-3.5 text-sm font-medium border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition-all"
                  >
                    <span>Sign in with Google</span>
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                    </svg>
                  </button>
                )}
                <button 
                  onClick={() => {
                    setOpen(false);
                    signIn('google', { callbackUrl: '/dashboard' });
                  }}
                  className="w-full inline-flex items-center justify-between rounded-xl px-5 py-3.5 text-sm font-medium bg-white text-zinc-950 hover:bg-zinc-100 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
                >
                  Get Started Free <ChevronRight className="h-4 w-4 opacity-60" />
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
