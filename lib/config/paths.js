import { join } from 'path';

const root = process.cwd();

export const paths = {
  sampleDoc: join(root, 'data', 'sample-documents', 'company-info.txt'),
  documentRegistry: join(root, 'data', 'documents-registry.json'),
  legacyVectorStore: join(root, 'data', 'vector-store.json'),
};
