import Landing from "@/components/landing";
import { getOptionalSession } from "@/lib/auth-utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Real-time Website Analytics — spectr",
  description: "Monitor your website traffic in real-time without compromising visitor privacy. Zero-cookie, lightweight script, and fully GDPR/CCPA compliant.",
};

export default async function HomePage() {
  const session = await getOptionalSession();
  
  return (
    <div className="">
      <Landing session={session} />
    </div>
  );
}