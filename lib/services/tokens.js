import { connectDB } from '@/lib/db/connect.js';
import { User } from '@/lib/db/models/User.js';
import { getTokenConfig, getDefaultTokenGrant, INSUFFICIENT_TOKENS_MESSAGE } from '@/lib/config/tokens.js';
import { InsufficientTokensError } from '@/lib/auth/tokenErrors.js';
import { chunkText } from '@/lib/services/chunker.js';

function needsInitialTokenGrant(user) {
  // Never received the free signup grant (null/undefined, not spent-to-zero)
  return user.tokensGranted == null;
}

export function calculateChatTokenCost(message) {
  const { chatBase, chatPerChar } = getTokenConfig();
  const text = message?.trim() ?? '';
  return Math.ceil(chatBase + text.length * chatPerChar);
}

export function calculateDocumentTokenCost(text) {
  const { documentBase, documentPerChunk, documentPerKb } = getTokenConfig();
  const chunks = chunkText(text);
  const bytes = Buffer.byteLength(text, 'utf8');
  const kb = Math.ceil(bytes / 1024);
  return Math.ceil(
    documentBase + chunks.length * documentPerChunk + kb * documentPerKb
  );
}

export async function ensureUserTokens(userId) {
  await connectDB();
  let user = await User.findById(userId)
    .select('tokenBalance tokensUsed tokensGranted')
    .lean();

  if (!user) return null;

  if (needsInitialTokenGrant(user)) {
    const grant = getDefaultTokenGrant();
    user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          tokenBalance: grant,
          tokensUsed: user.tokensUsed ?? 0,
          tokensGranted: grant,
        },
      },
      { new: true }
    )
      .select('tokenBalance tokensUsed tokensGranted')
      .lean();
  }

  return user;
}

export function formatTokenStats(user) {
  const grant = getDefaultTokenGrant();
  const balance = user?.tokenBalance ?? 0;
  const used = user?.tokensUsed ?? 0;
  const granted = user?.tokensGranted ?? grant;

  return {
    balance,
    used,
    granted,
    exhausted: balance <= 0,
    canSpend: balance > 0,
  };
}

export async function getUserTokenStats(userId) {
  const user = await ensureUserTokens(userId);
  if (!user) return null;

  const { chatBase, documentBase } = getTokenConfig();

  return {
    ...formatTokenStats(user),
    costs: {
      chatMin: chatBase,
      documentMin: documentBase,
    },
  };
}

export async function assertCanSpend(userId, minCost = 1) {
  const stats = await getUserTokenStats(userId);
  if (!stats) {
    throw new InsufficientTokensError('User not found.');
  }
  if (stats.balance < minCost) {
    throw new InsufficientTokensError(INSUFFICIENT_TOKENS_MESSAGE, stats);
  }
  return stats;
}

export async function deductTokens(userId, cost) {
  if (cost <= 0) return getUserTokenStats(userId);

  await connectDB();

  const user = await User.findOneAndUpdate(
    { _id: userId, tokenBalance: { $gte: cost } },
    { $inc: { tokenBalance: -cost, tokensUsed: cost } },
    { new: true }
  )
    .select('tokenBalance tokensUsed tokensGranted')
    .lean();

  if (!user) {
    const stats = await getUserTokenStats(userId);
    throw new InsufficientTokensError(INSUFFICIENT_TOKENS_MESSAGE, stats);
  }

  return formatTokenStats(user);
}

export function getDefaultTokenFields() {
  const grant = getDefaultTokenGrant();
  return {
    tokenBalance: grant,
    tokensUsed: 0,
    tokensGranted: grant,
  };
}
