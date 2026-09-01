"use client";
import React from "react";
import Link from "next/link";
import {
  NotepadTextDashed,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterLink {
  label: string;
  href: string;
}

interface SocialLink {
  icon: React.ReactNode;
  href: string;
  label: string;
}

interface FooterProps {
  brandName?: string;
  brandDescription?: string;
  socialLinks?: SocialLink[];
  navLinks?: FooterLink[];
  creatorName?: string;
  creatorUrl?: string;
  brandIcon?: React.ReactNode;
  className?: string;
}

export const Footer = ({
  brandName = "YourBrand",
  brandDescription = "Your description here",
  socialLinks = [],
  navLinks = [],
  creatorName,
  creatorUrl,
  brandIcon,
  className,
}: FooterProps) => {
  return (
    <section className={cn("relative w-full mt-0 overflow-hidden bg-[#fafaf9] dark:bg-black text-[#0c0a09] dark:text-zinc-100", className)}>
      <footer className="border-t border-[#e8e6e5] dark:border-white/5 bg-transparent dark:bg-black/50 mt-10 relative">
        <div className="max-w-7xl flex flex-col justify-between mx-auto min-h-[20rem] sm:min-h-[30rem] md:min-h-[35rem] relative p-4 py-8">
          <div className="flex flex-col mb-12 sm:mb-20 md:mb-0 w-full">
            <div className="w-full flex flex-col items-center">
              <div className="space-y-2 flex flex-col items-center flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[#0c0a09] dark:text-white text-3xl font-bold tracking-tighter">
                    {brandName}
                  </span>
                </div>
                <p className="text-[#78716c] dark:text-zinc-400 font-medium text-center w-full max-w-sm sm:w-96 px-4 sm:px-0">
                  {brandDescription}
                </p>
              </div>

              {socialLinks.length > 0 && (
                <div className="flex mb-8 mt-6 gap-6">
                  {socialLinks.map((link, index) => (
                    <Link
                      key={index}
                      href={link.href}
                      className="text-[#78716c] dark:text-zinc-500 hover:text-[#0c0a09] dark:hover:text-white transition-all duration-300"
                      target="_blank"
                      rel="noopener"
                    >
                      <div className="w-6 h-6 hover:scale-125 duration-300">
                        {link.icon}
                      </div>
                      <span className="sr-only">{link.label}</span>
                    </Link>
                  ))}
                </div>
              )}

              {navLinks.length > 0 && (
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-[#78716c] dark:text-zinc-500 max-w-full px-4">
                  {navLinks.map((link, index) => {
                    const isExternal = link.href.startsWith("http");
                    return (
                      <Link
                        key={index}
                        className="hover:text-[#0c0a09] dark:hover:text-white duration-300 transition-colors"
                        href={link.href}
                        {...(isExternal ? { target: "_blank", rel: "noopener" } : {})}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 md:mt-12 flex flex-col gap-4 md:gap-1 items-center justify-center md:flex-row md:items-center md:justify-between px-4 md:px-0 border-t border-[#e8e6e5] dark:border-white/5 pt-8">
            <p className="text-sm text-[#78716c] dark:text-white text-center md:text-left">
              ©{new Date().getFullYear()} {brandName}. All rights reserved.
            </p>
            {creatorName && creatorUrl && (
              <nav className="flex gap-4">
                <Link
                  href={creatorUrl}
                  target="_blank"
                  rel="noopener"
                  className="text-sm text-[#0c0a09] dark:!text-white hover:text-[#3ba6f1] dark:hover:text-zinc-300 transition-colors duration-300 underline-offset-4 hover:underline font-medium"
                >
                  Crafted by {creatorName}
                </Link>
              </nav>
            )}
          </div>
        </div>

        {/* Large background text */}
        <div 
          className="bg-gradient-to-b from-black/[0.08] dark:from-white/[0.22] via-black/[0.03] dark:via-white/[0.10] to-transparent bg-clip-text text-transparent leading-none absolute left-1/2 -translate-x-1/2 bottom-40 md:bottom-32 font-extrabold tracking-tighter pointer-events-none select-none text-center px-4"
          style={{
            fontSize: 'clamp(3rem, 12vw, 10rem)',
            maxWidth: '95vw'
          }}
        >
          {brandName.toUpperCase()}
        </div>

        {/* Bottom logo */}
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="absolute bottom-24 md:bottom-20 backdrop-blur-xl rounded-2xl sm:rounded-3xl bg-white/90 dark:bg-zinc-900/80 left-1/2 border border-[#e8e6e5] dark:border-white/15 flex items-center justify-center p-3 sm:p-4 -translate-x-1/2 z-10 transition-all hover:scale-105 overflow-hidden shadow-lg dark:drop-shadow-[0_0px_50px_rgba(255,255,255,0.1)] cursor-pointer group"
          aria-label="Scroll to top"
        >
          {brandIcon ? (
            <div className="w-7 sm:w-9 md:w-11 h-7 sm:h-9 md:h-11 flex items-center justify-center relative z-10">
              {brandIcon}
            </div>
          ) : (
            <div className="w-7 sm:w-9 md:w-11 h-7 sm:h-9 md:h-11 flex items-center justify-center relative z-10">
              <NotepadTextDashed className="w-6 h-6 text-foreground" />
            </div>
          )}
        </button>

        {/* Bottom line */}
        <div className="absolute bottom-32 sm:bottom-34 backdrop-blur-sm h-px bg-gradient-to-r from-transparent via-black/15 dark:via-white/40 to-transparent w-full left-1/2 -translate-x-1/2"></div>

        {/* Bottom shadow gradient */}
        <div className="bg-gradient-to-t from-[#fafaf9] via-[#fafaf9]/50 dark:from-zinc-950 dark:via-zinc-950/50 to-transparent absolute bottom-0 w-full h-32 pointer-events-none"></div>
      </footer>
    </section>
  );
};
