import { NextResponse } from 'next/server';
import { ensureReady } from '@/lib/init.js';
import { requireAuth, AuthError, unauthorizedResponse } from '@/lib/auth/requireAuth.js';
import {
  InsufficientTokensError,
  insufficientTokensResponse,
} from '@/lib/auth/tokenErrors.js';
import { chat } from '@/lib/services/rag.js';
import {
  getChatForUser,
  createChat,
  appendChatMessages,
  getHistoryForRag,
} from '@/lib/services/chats.js';
import {
  calculateChatTokenCost,
  assertCanSpend,
  deductTokens,
} from '@/lib/services/tokens.js';
import {
  formatGeminiError,
  getGeminiErrorCode,
  getGeminiHttpStatus,
} from '@/lib/utils/geminiError.js';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    await ensureReady();
    const { userId } = await requireAuth();

    const { message, chatId } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const tokenCost = calculateChatTokenCost(message);
    await assertCanSpend(userId, tokenCost);

    let activeChatId = chatId;
    let existingMessages = [];

    if (activeChatId) {
      const existing = await getChatForUser(userId, activeChatId);
      if (!existing) {
        return NextResponse.json({ error: 'Chat not found.' }, { status: 404 });
      }
      existingMessages = existing.messages;
    } else {
      const newChat = await createChat(userId);
      activeChatId = newChat.id;
    }

    const history = getHistoryForRag(existingMessages);
    const result = await chat({ userId, chatId: activeChatId, message, history });

    const updated = await appendChatMessages(
      userId,
      activeChatId,
      [
        { role: 'user', content: message },
        { role: 'assistant', content: result.answer, sources: result.sources },
      ],
      message
    );

    const tokens = await deductTokens(userId, tokenCost);

    return NextResponse.json({
      chatId: activeChatId,
      answer: result.answer,
      sources: result.sources,
      chat: updated,
      tokens,
      tokensSpent: tokenCost,
    });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    if (error instanceof InsufficientTokensError) {
      return insufficientTokensResponse(error);
    }
    console.error('Chat error:', error);
    return NextResponse.json(
      {
        error: formatGeminiError(error),
        code: getGeminiErrorCode(error),
      },
      { status: getGeminiHttpStatus(error) }
    );
  }
}
