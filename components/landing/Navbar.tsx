"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Session } from "next-auth";
import { signIn } from "next-auth/react";
import {
  Navbar as AceternityNavbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { Logo } from "./Logo";
import { LogIn } from "lucide-react";

interface NavbarProps {
  session?: Session | null;
}

export function Navbar({ session }: NavbarProps) {
  const navItems = [
    { name: "Features", link: "#features" },
    { name: "Pricing", link: "#pricing" },
    { name: "How It Works", link: "#how-it-works" },
    { name: "Integration", link: "#code" },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <AceternityNavbar>
      {/* Desktop Navigation */}
      <NavBody>
        <Link href="/" className="flex items-center mr-6">
          <Logo className="h-8 w-auto" />
        </Link>

        <NavItems items={navItems} />

        <div className="flex items-center gap-3">
          {session?.user ? (
            <NavbarButton as={Link} href="/dashboard" variant="primary" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              <span>Dashboard</span>
            </NavbarButton>
          ) : (
            <>
              <NavbarButton
                as="button"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                variant="secondary"
              >
                Login
              </NavbarButton>
              <NavbarButton
                as="button"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                variant="primary"
              >
                Get Started
              </NavbarButton>
            </>
          )}
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <Link href="/" className="flex items-center">
            <Logo className="h-9 w-auto" />
          </Link>
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item, idx) => (
            <a
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-medium text-neutral-300 hover:text-white"
            >
              <span>{item.name}</span>
            </a>
          ))}
          <div className="flex w-full flex-col gap-2.5 pt-3 border-t border-neutral-800">
            {session?.user ? (
              <NavbarButton
                as={Link}
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full text-center"
              >
                Go to Dashboard
              </NavbarButton>
            ) : (
              <>
                <NavbarButton
                  as="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signIn("google", { callbackUrl: "/dashboard" });
                  }}
                  variant="secondary"
                  className="w-full text-center"
                >
                  Login
                </NavbarButton>
                <NavbarButton
                  as="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    signIn("google", { callbackUrl: "/dashboard" });
                  }}
                  variant="primary"
                  className="w-full text-center"
                >
                  Get Started
                </NavbarButton>
              </>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </AceternityNavbar>
  );
}

export default Navbar;
