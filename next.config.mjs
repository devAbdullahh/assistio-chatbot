/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    'chromadb',
    '@chroma-core/chroma-cloud-qwen',
    '@chroma-core/chroma-cloud-splade',
    'unpdf',
  ],
};

export default nextConfig;
