import { NextResponse } from 'next/server';
import { requireAuth, AuthError, unauthorizedResponse } from '@/lib/auth/requireAuth.js';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const { user } = await requireAuth();
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
