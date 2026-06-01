import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { ensureReady } from '@/lib/init.js';
import { requireAuth, AuthError, unauthorizedResponse } from '@/lib/auth/requireAuth.js';
import {
  InsufficientTokensError,
  insufficientTokensResponse,
} from '@/lib/auth/tokenErrors.js';
import { ingestDocument } from '@/lib/services/rag.js';
import { getChatForUser } from '@/lib/services/chats.js';
import {
  calculateDocumentTokenCost,
  assertCanSpend,
  deductTokens,
} from '@/lib/services/tokens.js';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    await ensureReady();
    const { userId } = await requireAuth();

    const { text, source = 'Manual input', chatId } = await request.json();

    if (!chatId) {
      return NextResponse.json({ error: 'chatId is required.' }, { status: 400 });
    }

    const chat = await getChatForUser(userId, chatId);
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found.' }, { status: 404 });
    }

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Text is required.' }, { status: 400 });
    }

    const tokenCost = calculateDocumentTokenCost(text);
    await assertCanSpend(userId, tokenCost);

    const result = await ingestDocument({
      userId,
      chatId,
      id: randomUUID(),
      source,
      text,
    });

    const tokens = await deductTokens(userId, tokenCost);

    return NextResponse.json({
      message: 'Text indexed successfully.',
      ...result,
      tokens,
      tokensSpent: tokenCost,
    });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    if (error instanceof InsufficientTokensError) {
      return insufficientTokensResponse(error);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
