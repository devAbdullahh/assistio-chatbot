import { NextResponse } from 'next/server';
import { ensureReady } from '@/lib/init.js';
import { requireAuth, AuthError, unauthorizedResponse } from '@/lib/auth/requireAuth.js';
import { getStats } from '@/lib/services/rag.js';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await ensureReady();
    const { userId } = await requireAuth();
    return NextResponse.json(await getStats(userId));
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
