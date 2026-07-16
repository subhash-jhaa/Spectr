import Landing from "@/components/landing";
import { getOptionalAppSession } from "@/lib/session";
import type { Metadata } from "next";
import type { Session } from "next-auth";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Real-time Website Analytics — spectr",
  description: "Monitor your website traffic in real-time without compromising visitor privacy. Zero-cookie, lightweight script, and fully GDPR/CCPA compliant.",
};

export default async function HomePage() {
  const user = await getOptionalAppSession();
  // Build Session-compatible shape for Landing/Navbar
  const session = user ? { user, expires: '' } as unknown as Session : null;
  
  return (
    <div className="">
      <Landing session={session} />
    </div>
  );
}