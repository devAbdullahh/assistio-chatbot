import { NextResponse } from 'next/server';
import { requireAuth, AuthError, unauthorizedResponse } from '@/lib/auth/requireAuth.js';
import { getUserTokenStats } from '@/lib/services/tokens.js';
import { INSUFFICIENT_TOKENS_MESSAGE } from '@/lib/config/tokens.js';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const { userId } = await requireAuth();
    const min = Number(request.nextUrl.searchParams.get('min') || 1);
    const stats = await getUserTokenStats(userId);

    if (!stats) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const canSpend = stats.balance >= min;

    return NextResponse.json({
      ...stats,
      canSpend,
      message: canSpend ? null : INSUFFICIENT_TOKENS_MESSAGE,
    });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
