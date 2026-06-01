import { connectDB } from '@/lib/db/connect.js';
import { initChroma } from '@/lib/services/chroma/index.js';

export async function bootstrap() {
  await connectDB();
  await initChroma();
}
