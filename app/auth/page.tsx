import { requireGuestSession } from '@/lib/session'
import React, { Suspense } from 'react'
import AuthClient from '@/components/auth/AuthClient';
import { Navbar } from '@/components/landing/Navbar';

export const dynamic = 'force-dynamic';

const Auth = async () => {
  // This will redirect authenticated users to /dashboard
  await requireGuestSession();
  
  return (
    <>
      <Navbar session={null} />
      <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <AuthClient />
      </Suspense>
    </>
  );
}

export default Auth;