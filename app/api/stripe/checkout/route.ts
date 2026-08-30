import { NextRequest, NextResponse } from 'next/server';

/**
 * Stripe checkout is not yet implemented.
 * Returns 501 until real Stripe price IDs and webhook are configured.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Payments not yet available. Check back soon.' },
    { status: 501 }
  );
}