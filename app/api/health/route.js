import { NextResponse } from 'next/server';
import { ensureReady } from '@/lib/init.js';
import { requireAuth, AuthError, unauthorizedResponse } from '@/lib/auth/requireAuth.js';
import { getStats } from '@/lib/services/rag.js';
import { getUserTokenStats } from '@/lib/services/tokens.js';
import { env } from '@/lib/config/env.js';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await ensureReady();
    const { user, userId } = await requireAuth();
    const [stats, tokens] = await Promise.all([
      getStats(userId),
      getUserTokenStats(userId),
    ]);

    return NextResponse.json({
      status: 'ok',
      user,
      model: env.geminiModel,
      embeddingModel: 'Chroma Cloud Qwen + Splade (hybrid RRF)',
      vectorDb: 'Chroma Cloud',
      tokens,
      ...stats,
    });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    return NextResponse.json({ status: 'error', error: error.message }, { status: 503 });
  }
}
