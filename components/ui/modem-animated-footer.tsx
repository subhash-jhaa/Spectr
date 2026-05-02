"use client";
import React from "react";
import Link from "next/link";
import {
  NotepadTextDashed,
  Mail,
} from "lucide-react";
import { cn } from "@/components/lib/utils";

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
    <section className={cn("relative w-full mt-0 overflow-hidden bg-zinc-950 text-zinc-100", className)}>
      <footer className="border-t border-white/5 bg-zinc-950/50 mt-10 relative">
        <div className="max-w-7xl flex flex-col justify-between mx-auto min-h-[20rem] sm:min-h-[30rem] md:min-h-[35rem] relative p-4 py-8">
          <div className="flex flex-col mb-12 sm:mb-20 md:mb-0 w-full">
            <div className="w-full flex flex-col items-center">
              <div className="space-y-2 flex flex-col items-center flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white text-3xl font-bold tracking-tighter">
                    {brandName}
                  </span>
                </div>
                <p className="text-zinc-400 font-medium text-center w-full max-w-sm sm:w-96 px-4 sm:px-0">
                  {brandDescription}
                </p>
              </div>

              {socialLinks.length > 0 && (
                <div className="flex mb-8 mt-6 gap-6">
                  {socialLinks.map((link, index) => (
                    <Link
                      key={index}
                      href={link.href}
                      className="text-zinc-500 hover:text-white transition-all duration-300"
                      target="_blank"
                      rel="noopener noreferrer"
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
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-zinc-500 max-w-full px-4">
                  {navLinks.map((link, index) => (
                    <Link
                      key={index}
                      className="hover:text-white duration-300 transition-colors"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 md:mt-12 flex flex-col gap-4 md:gap-1 items-center justify-center md:flex-row md:items-center md:justify-between px-4 md:px-0 border-t border-white/5 pt-8">
            <p className="text-sm text-white text-center md:text-left">
              ©{new Date().getFullYear()} {brandName}. All rights reserved.
            </p>
            {creatorName && creatorUrl && (
              <nav className="flex gap-4">
                <Link
                  href={creatorUrl}
                  target="_blank"
                  className="text-sm !text-white hover:text-zinc-300 transition-colors duration-300"
                >
                  Crafted by {creatorName}
                </Link>
              </nav>
            )}
          </div>
        </div>

        {/* Large background text - FIXED */}
        <div 
          className="bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-transparent bg-clip-text text-transparent leading-none absolute left-1/2 -translate-x-1/2 bottom-40 md:bottom-32 font-extrabold tracking-tighter pointer-events-none select-none text-center px-4"
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
          className="absolute bottom-24 md:bottom-20 backdrop-blur-xl rounded-3xl bg-zinc-900/60 left-1/2 border border-white/20 flex items-center justify-center p-2 -translate-x-1/2 z-10 transition-all overflow-hidden drop-shadow-[0_0px_50px_rgba(255,255,255,0.15)] cursor-pointer"
        >
          {brandIcon ? (
            <div className="w-12 sm:w-16 md:w-24 h-12 sm:h-16 md:h-24 flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl relative z-10">
              {brandIcon}
            </div>
          ) : (
            <div className="w-12 sm:w-16 md:w-20 h-12 sm:h-16 md:h-20 bg-gradient-to-br from-zinc-100 to-zinc-400 rounded-2xl flex items-center justify-center shadow-2xl relative z-10">
              <NotepadTextDashed className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 text-zinc-950" />
            </div>
          )}
        </button>

        {/* Bottom line */}
        <div className="absolute bottom-32 sm:bottom-34 backdrop-blur-sm h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-full left-1/2 -translate-x-1/2"></div>

        {/* Bottom shadow gradient */}
        <div className="bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent absolute bottom-0 w-full h-48 pointer-events-none"></div>
      </footer>
    </section>
  );
};
