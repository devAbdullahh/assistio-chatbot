import {
  addDocumentToChroma,
  searchChroma,
  getChromaStats,
  getChromaStatsForChat,
} from '@/lib/services/chroma/index.js';
import { generateAnswer } from '@/lib/services/gemini.js';

const SYSTEM_PROMPT = `You are a helpful assistant that answers questions based on the provided context.
Use ONLY the context below to answer. If the context does not contain enough information, say you don't know based on the available documents.
Be concise and accurate. When relevant, mention which source the information came from.`;

function buildContextBlock(chunks) {
  if (chunks.length === 0) {
    return 'No relevant context found in your uploaded documents.';
  }
  return chunks
    .map((chunk, i) => `[${i + 1}] Source: ${chunk.source}\n${chunk.text}`)
    .join('\n\n');
}

function buildHistoryText(history) {
  return history
    .slice(-6)
    .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');
}

function buildPrompt(message, chunks, history) {
  const historyText = buildHistoryText(history);
  return `${SYSTEM_PROMPT}

Context:
${buildContextBlock(chunks)}

${historyText ? `Conversation so far:\n${historyText}\n\n` : ''}User: ${message}
Assistant:`;
}

function formatSources(chunks) {
  return chunks.map((chunk) => ({
    source: chunk.source,
    score: Number(Math.abs(chunk.score).toFixed(4)),
    excerpt: chunk.text.slice(0, 180) + (chunk.text.length > 180 ? '...' : ''),
  }));
}

export async function ingestDocument({ userId, chatId, id, source, text }) {
  return addDocumentToChroma({ userId, chatId, id, source, text });
}

export async function chat({ userId, chatId, message, history = [] }) {
  const chunks = await searchChroma(userId, chatId, message);
  const answer = await generateAnswer(buildPrompt(message, chunks, history));
  return { answer, sources: formatSources(chunks) };
}

export async function getStats(userId) {
  return getChromaStats(userId);
}

export async function getChatStats(userId, chatId) {
  return getChromaStatsForChat(userId, chatId);
}
