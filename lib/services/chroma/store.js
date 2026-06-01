import { Search, K, Knn, Rrf, GroupBy, MinK } from 'chromadb';
import { chunkText } from '@/lib/services/chunker.js';
import {
  upsertUserDocument,
  getUserDocumentStats,
  getChatDocumentStats,
  deleteDocumentsByChat,
} from '@/lib/services/documents.js';
import { createCloudClient, getOrCreateCollection } from './client.js';
import { SPARSE_EMBEDDING_KEY, ADD_BATCH_SIZE, SEARCH_TOP_K } from './constants.js';

let collection = null;

export async function initChroma() {
  if (collection) return collection;

  if (!process.env.CHROMA_API_KEY) {
    throw new Error(
      'CHROMA_API_KEY is not set. Add it to .env.local from your Chroma Cloud dashboard.'
    );
  }

  const client = createCloudClient();
  collection = await getOrCreateCollection(client);
  return collection;
}

async function getCollection() {
  return collection ?? initChroma();
}

/** Chroma where clauses must have exactly one top-level key; combine filters with $and. */
function whereAnd(...filters) {
  if (filters.length === 0) {
    throw new Error('whereAnd requires at least one filter.');
  }
  if (filters.length === 1) return filters[0];
  return { $and: filters };
}

function buildChunkRecords(userId, chatId, documentId, source, chunks) {
  return chunks.map((text, index) => ({
    id: `${userId}::${chatId}::${documentId}::chunk-${index}`,
    document: text,
    metadata: {
      user_id: userId,
      chat_id: chatId,
      document_id: documentId,
      chunk_index: index,
      source,
    },
  }));
}

export async function addDocumentToChroma({ userId, chatId, id, source, text }) {
  const col = await getCollection();
  const chunks = chunkText(text);

  if (chunks.length === 0) {
    throw new Error('Document is empty or could not be chunked.');
  }

  await col.delete({
    where: whereAnd(
      { user_id: userId },
      { chat_id: chatId },
      { document_id: id }
    ),
  });

  const records = buildChunkRecords(userId, chatId, id, source, chunks);

  for (let i = 0; i < records.length; i += ADD_BATCH_SIZE) {
    const batch = records.slice(i, i + ADD_BATCH_SIZE);
    await col.add({
      ids: batch.map((r) => r.id),
      documents: batch.map((r) => r.document),
      metadatas: batch.map((r) => r.metadata),
    });
  }

  await upsertUserDocument({
    userId,
    chatId,
    chromaDocumentId: id,
    source,
    chunkCount: chunks.length,
  });

  return { id, source, chunkCount: chunks.length };
}

export async function searchChroma(userId, chatId, query, topK = SEARCH_TOP_K) {
  const col = await getCollection();

  const hybridRank = Rrf({
    ranks: [
      Knn({ query, returnRank: true, limit: 200, default: 1000 }),
      Knn({
        query,
        key: SPARSE_EMBEDDING_KEY,
        returnRank: true,
        limit: 200,
        default: 1000,
      }),
    ],
    weights: [0.7, 0.3],
    k: 60,
  });

  const search = new Search()
    .where(K('user_id').eq(userId))
    .where(K('chat_id').eq(chatId))
    .rank(hybridRank)
    .groupBy(new GroupBy([K('document_id')], new MinK([K.SCORE], 1)))
    .limit(topK)
    .select(K.DOCUMENT, K.SCORE, 'source', 'document_id', 'chunk_index');

  const rows = (await col.search(search)).rows()[0] ?? [];

  return rows.map((row) => ({
    text: row.document ?? '',
    source: row.metadata?.source ?? 'unknown',
    score: row.score ?? 0,
    documentId: row.metadata?.document_id,
    chunkIndex: row.metadata?.chunk_index,
  }));
}

export async function deleteChromaDocumentsByChat(userId, chatId) {
  const col = await getCollection();
  await col.delete({
    where: whereAnd({ user_id: userId }, { chat_id: chatId }),
  });
  return deleteDocumentsByChat(userId, chatId);
}

export async function getChromaStats(userId) {
  await getCollection();
  const { documentCount, sources } = await getUserDocumentStats(userId);

  return {
    documentCount,
    chunkCount: null,
    sources,
    collection: collection?.name,
  };
}

export async function getChromaStatsForChat(userId, chatId) {
  await getCollection();
  const { documentCount, sources, documents } = await getChatDocumentStats(userId, chatId);

  return {
    documentCount,
    sources,
    documents,
    collection: collection?.name,
  };
}
