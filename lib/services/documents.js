import { Document } from '@/lib/db/models/Document.js';

export async function upsertUserDocument({
  userId,
  chatId,
  chromaDocumentId,
  source,
  chunkCount,
}) {
  return Document.findOneAndUpdate(
    { userId, chatId, chromaDocumentId },
    { userId, chatId, chromaDocumentId, source, chunkCount },
    { upsert: true, new: true }
  ).lean();
}

export async function listChatDocuments(userId, chatId) {
  const docs = await Document.find({ userId, chatId }).sort({ updatedAt: -1 }).lean();
  return docs.map((d) => ({
    id: d.chromaDocumentId,
    source: d.source,
    chunkCount: d.chunkCount,
    updatedAt: d.updatedAt,
  }));
}

export async function getUserDocumentStats(userId) {
  const docs = await Document.find({ userId }).sort({ updatedAt: -1 }).lean();
  return {
    documentCount: docs.length,
    sources: docs.map((d) => d.source),
  };
}

export async function getChatDocumentStats(userId, chatId) {
  const docs = await Document.find({ userId, chatId }).sort({ updatedAt: -1 }).lean();
  return {
    documentCount: docs.length,
    sources: docs.map((d) => d.source),
    documents: docs.map((d) => ({
      id: d.chromaDocumentId,
      source: d.source,
      chunkCount: d.chunkCount,
      updatedAt: d.updatedAt,
    })),
  };
}

export async function deleteDocumentsByChat(userId, chatId) {
  const result = await Document.deleteMany({ userId, chatId });
  return result.deletedCount;
}
