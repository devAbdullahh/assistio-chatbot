export const env = {
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  chromaHost: process.env.CHROMA_HOST || 'api.trychroma.com',
  chromaApiKey: process.env.CHROMA_API_KEY,
  chromaTenant: process.env.CHROMA_TENANT,
  chromaDatabase: process.env.CHROMA_DATABASE,
  chromaCollection: process.env.CHROMA_COLLECTION || 'rag-documents',
};
