export function getDefaultTokenGrant() {
  const n = Number(process.env.FREE_TOKENS_DEFAULT);
  return Number.isFinite(n) && n > 0 ? n : 10_000;
}

export function getTokenConfig() {
  return {
    defaultGrant: getDefaultTokenGrant(),
    chatBase: Number(process.env.TOKEN_COST_CHAT_BASE) || 100,
    chatPerChar: Number(process.env.TOKEN_COST_CHAT_PER_CHAR) || 0.25,
    documentBase: Number(process.env.TOKEN_COST_DOCUMENT_BASE) || 150,
    documentPerChunk: Number(process.env.TOKEN_COST_DOCUMENT_PER_CHUNK) || 200,
    documentPerKb: Number(process.env.TOKEN_COST_DOCUMENT_PER_KB) || 10,
  };
}

/** @deprecated Use getTokenConfig() for fresh env reads */
export const tokenConfig = getTokenConfig();

export const INSUFFICIENT_TOKENS_MESSAGE =
  'You have run out of tokens. Chat and document uploads are paused until you receive more tokens.';
