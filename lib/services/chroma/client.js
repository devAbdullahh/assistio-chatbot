import {
  CloudClient,
  Schema,
  VectorIndexConfig,
  SparseVectorIndexConfig,
  K,
} from 'chromadb';
import {
  ChromaCloudQwenEmbeddingFunction,
  ChromaCloudQwenEmbeddingModel,
  ChromaCloudQwenEmbeddingTarget,
} from '@chroma-core/chroma-cloud-qwen';
import {
  ChromaCloudSpladeEmbeddingFunction,
  ChromaCloudSpladeEmbeddingModel,
} from '@chroma-core/chroma-cloud-splade';
import { env } from '@/lib/config/env.js';
import { SPARSE_EMBEDDING_KEY } from './constants.js';

const RETRIEVAL_TASK = 'retrieval';

const RETRIEVAL_INSTRUCTIONS = {
  [RETRIEVAL_TASK]: {
    [ChromaCloudQwenEmbeddingTarget.DOCUMENTS]: '',
    [ChromaCloudQwenEmbeddingTarget.QUERY]:
      'Given a question, retrieve passages that answer the question',
  },
};

function createDenseEmbeddingFunction(client) {
  return new ChromaCloudQwenEmbeddingFunction({
    apiKeyEnvVar: 'CHROMA_API_KEY',
    model: ChromaCloudQwenEmbeddingModel.QWEN3_EMBEDDING_0p6B,
    task: RETRIEVAL_TASK,
    instructions: RETRIEVAL_INSTRUCTIONS,
    client,
  });
}

function createHybridSchema(client) {
  const schema = new Schema();

  schema.createIndex(
    new VectorIndexConfig({
      sourceKey: K.DOCUMENT,
      embeddingFunction: createDenseEmbeddingFunction(client),
    })
  );

  schema.createIndex(
    new SparseVectorIndexConfig({
      sourceKey: K.DOCUMENT,
      embeddingFunction: new ChromaCloudSpladeEmbeddingFunction({
        apiKeyEnvVar: 'CHROMA_API_KEY',
        model: ChromaCloudSpladeEmbeddingModel.SPLADE_PP_EN_V1,
        client,
      }),
    }),
    SPARSE_EMBEDDING_KEY
  );

  return schema;
}

export function createCloudClient() {
  return new CloudClient({
    host: env.chromaHost,
    apiKey: env.chromaApiKey,
    tenant: env.chromaTenant,
    database: env.chromaDatabase,
  });
}

export async function getOrCreateCollection(client) {
  return client.getOrCreateCollection({
    name: env.chromaCollection,
    schema: createHybridSchema(client),
    metadata: {
      description: 'RAG knowledge base with hybrid dense + sparse search',
    },
  });
}
