import { NextResponse } from 'next/server';
import { INSUFFICIENT_TOKENS_MESSAGE } from '@/lib/config/tokens.js';

export class InsufficientTokensError extends Error {
  constructor(message = INSUFFICIENT_TOKENS_MESSAGE, tokens = null) {
    super(message);
    this.name = 'InsufficientTokensError';
    this.status = 402;
    this.code = 'INSUFFICIENT_TOKENS';
    this.tokens = tokens;
  }
}

export function insufficientTokensResponse(error) {
  return NextResponse.json(
    {
      error: error.message || INSUFFICIENT_TOKENS_MESSAGE,
      code: 'INSUFFICIENT_TOKENS',
      tokens: error.tokens ?? null,
    },
    { status: 402 }
  );
}
