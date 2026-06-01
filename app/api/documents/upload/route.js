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
import { extractTextFromUpload } from '@/lib/services/fileParser.js';
import { isAllowedUpload } from '@/lib/utils/fileValidation.js';
import {
  calculateDocumentTokenCost,
  assertCanSpend,
  deductTokens,
} from '@/lib/services/tokens.js';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request) {
  try {
    await ensureReady();
    const { userId } = await requireAuth();

    const formData = await request.formData();
    const file = formData.get('file');
    const chatId = formData.get('chatId');

    if (!chatId || typeof chatId !== 'string') {
      return NextResponse.json({ error: 'chatId is required.' }, { status: 400 });
    }

    const chat = await getChatForUser(userId, chatId);
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found.' }, { status: 404 });
    }

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    if (!isAllowedUpload(file)) {
      return NextResponse.json(
        { error: 'Only .txt, .md, .json, and .pdf files are supported.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds 10MB limit.' }, { status: 400 });
    }

    const text = await extractTextFromUpload(file);
    const tokenCost = calculateDocumentTokenCost(text);
    await assertCanSpend(userId, tokenCost);

    const result = await ingestDocument({
      userId,
      chatId,
      id: randomUUID(),
      source: file.name,
      text,
    });

    const tokens = await deductTokens(userId, tokenCost);

    return NextResponse.json({
      message: 'Document indexed successfully.',
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
