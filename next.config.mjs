/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [{ source: '/favicon.ico', destination: '/favicon.svg', permanent: false }];
  },
  serverExternalPackages: [
    'chromadb',
    '@chroma-core/chroma-cloud-qwen',
    '@chroma-core/chroma-cloud-splade',
    'unpdf',
  ],
};

export default nextConfig;
